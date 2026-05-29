# Research: Best Practices for Authoring AI Agent Skills

**Date:** 2026-05-29
**Confidence:** HIGH (primary sources — official agentskills.io spec, Claude Code official docs, real APEX skills)
**Re-research after:** 2026-06-12 (14-day threshold — AI tooling domain)

---

## Summary

Agent skills are Markdown instruction files that agents load on demand via progressive disclosure. The agentskills.io open standard (originated by Anthropic, now multi-platform) defines the canonical format. Claude Code extends it with additional frontmatter fields for invocation control, subagent execution, and dynamic context injection. The most impactful authoring choices are: (1) the `description` field — it is the sole mechanism for automatic discovery and must be written as an activation trigger, not a label; (2) body conciseness — loaded content stays in context for the entire session; and (3) content specificity — the model ignores instructions it already knows; only project-specific facts, gotchas, and domain-specific procedures change behavior.

---

## Key Findings

### Format and file structure

- A skill is a **directory** containing a `SKILL.md` file at minimum. [VERIFIED — agentskills.io spec]
- Standard layout: `skill-name/SKILL.md` (required), `scripts/` (optional), `references/` (optional), `assets/` (optional). [VERIFIED — agentskills.io spec]
- The **directory name** becomes the slash command (`/skill-name`), not the `name` frontmatter field. The `name` field is a display label only — except for plugin-root skills. [VERIFIED — Claude Code docs]
- `SKILL.md` must start with YAML frontmatter between `---` markers, followed by Markdown body. [VERIFIED — agentskills.io spec]

### Naming conventions

- `name` field: lowercase letters, numbers, and hyphens only. Max 64 characters. No leading/trailing/consecutive hyphens. Must match directory name. [VERIFIED — agentskills.io spec]
- Examples valid: `pdf-processing`, `code-review`. Invalid: `PDF-Processing` (uppercase), `-pdf` (leading hyphen), `pdf--processing` (consecutive hyphens). [VERIFIED — agentskills.io spec]
- APEX convention extends this with a `skill:` frontmatter field (non-standard) and adds `backend:`, `version:`, `last_updated:`, `sources:`, `staleness_threshold:` fields for project-level tracking. [VERIFIED — APEX SKILL.md files, e.g. apex-research, apex-code, apex-debug]

### Required frontmatter fields (agentskills.io standard)

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | Max 64 chars, lowercase + hyphens, must match directory name |
| `description` | Yes | Max 1024 chars (agentskills.io); Claude Code caps combined description + when_to_use at 1,536 chars in the skill listing |

All other fields are optional. [VERIFIED — agentskills.io spec]

### Claude Code additional frontmatter fields

| Field | Purpose |
|-------|---------|
| `when_to_use` | Extra trigger context; appended to `description` in the skill listing |
| `disable-model-invocation: true` | Only you can invoke (use for side-effect workflows like `/deploy`, `/commit`) |
| `user-invocable: false` | Only Claude can invoke (use for background knowledge) |
| `allowed-tools` | Pre-approve tools without permission prompts |
| `disallowed-tools` | Remove tools from Claude's pool while skill is active |
| `context: fork` | Run skill in isolated subagent |
| `agent` | Which subagent type to use with `context: fork` |
| `paths` | Glob patterns — skill only activates when working with matching files |
| `model` | Override model for this skill invocation |
| `effort` | Override effort level (low/medium/high/xhigh/max) |
| `argument-hint` | Autocomplete hint for expected arguments |
| `arguments` | Named positional arguments for `$name` substitution |

[VERIFIED — Claude Code docs, code.claude.com/docs/en/skills]

### The description field — how agent discovery actually works

This is the highest-leverage field. It is the **sole mechanism** by which the agent decides whether to activate a skill automatically. [VERIFIED — agentskills.io spec, Claude Code docs]

**How progressive disclosure works:**
1. At startup, Claude loads only `name` + `description` for every skill (≈100 tokens per skill)
2. When a user request matches the description, Claude loads the full `SKILL.md` body
3. Supporting files load only if referenced and needed [VERIFIED — agentskills.io spec]

**Budget enforcement:** All skill names are always listed, but descriptions are truncated at 1,536 chars (combined `description` + `when_to_use`) per skill. If many skills are active and the total budget overflows, descriptions for least-used skills are dropped first. Run `/doctor` to check. [VERIFIED — Claude Code docs]

**What makes a good description:**
- Write it as **an instruction to the agent** ("Use when..."), not as a label ("This skill does...") [VERIFIED — agentskills.io optimizing-descriptions doc]
- **Front-load the key use case** — the first sentence is what gets read if truncation occurs [COMMUNITY — Claude Code community docs]
- **Include trigger phrases and synonyms** — the words users naturally say, including indirect phrasings that don't name the domain explicitly [VERIFIED — agentskills.io optimizing-descriptions doc]
- **Be explicit about near-miss exclusions** — what the skill does NOT do, to prevent false triggering [VERIFIED — agentskills.io optimizing-descriptions doc]
- **Err on the side of pushy** — explicitly state when the skill applies "even if they don't explicitly mention X" [VERIFIED — agentskills.io optimizing-descriptions doc]
- Keep under 1,024 characters (hard limit); descriptions tend to grow during optimization [VERIFIED — agentskills.io spec]

**Good vs bad examples (from agentskills.io):**
```yaml
# Bad — too vague, no trigger guidance
description: Helps with PDFs.

# Good — action verbs, specific capabilities, trigger phrases
description: Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.
```

**Testing descriptions:** Use a train/validation split of prompts (~60%/40%), run each prompt 3x (model is nondeterministic), and target trigger rate > 0.5 for should-trigger queries, < 0.5 for should-not-trigger. The `skill-creator` skill at github.com/anthropics/skills automates this loop. [VERIFIED — agentskills.io optimizing-descriptions doc]

### Body length and the progressive disclosure principle

- **Hard recommendation: keep `SKILL.md` under 500 lines.** The agentskills.io spec gives `< 5,000 tokens` as the instruction budget. [VERIFIED — agentskills.io spec]
- Once a skill is invoked, its content **stays in context for the entire session** — every line is a recurring token cost across all turns, not a one-time cost. [VERIFIED — Claude Code docs]
- After auto-compaction, Claude Code re-attaches the most recent invocation of each skill, keeping the **first 5,000 tokens** of each, shared budget of **25,000 tokens** across all re-attached skills. Older skills can be dropped. [VERIFIED — Claude Code docs]
- If skill content stops influencing behavior: either the model is choosing other approaches (strengthen description and instructions), or the skill was dropped during compaction (re-invoke it). [VERIFIED — Claude Code docs]
- Move detailed reference material to separate files (`references/`, `assets/`). Reference them with explicit load conditions ("Read `references/api-errors.md` if the API returns a non-200 status code"). Generic "see references/ for details" does not tell the agent when to load the file. [VERIFIED — agentskills.io best-practices doc]

### Instruction-writing techniques that actually change agent behavior

These are the patterns confirmed to alter model behavior vs. content the model ignores:

**Add what the agent lacks; omit what it knows**
The model's general training knowledge is extensive. Instructions that repeat general principles ("handle errors appropriately", "follow best practices") are essentially no-ops. What changes behavior is content the model wouldn't know without the skill: [VERIFIED — agentskills.io best-practices doc]
- Project-specific conventions and APIs
- Non-obvious gotchas and environment-specific facts
- Precise tool/library choices ("use pdfplumber, not pypdf")
- Domain-specific failure modes and their fixes

**Gotchas sections are the highest-value content**
Concrete corrections to mistakes the agent will make without being told. Examples: "The `users` table uses soft deletes — always add `WHERE deleted_at IS NULL`." "The user ID is `user_id` in the DB, `uid` in auth, `accountId` in billing — all the same value." Place gotchas in `SKILL.md` directly, not in a reference file — the agent may not recognize the trigger to load a separate file. [VERIFIED — agentskills.io best-practices doc]

**Templates outperform prose descriptions for output format**
When a specific output format is required, provide a concrete template. Agents pattern-match against concrete structures more reliably than they follow format descriptions in prose. [VERIFIED — agentskills.io best-practices doc]

**Provide defaults, not menus**
When multiple tools could work, name a default and mention the alternative briefly. "Use pdfplumber. For scanned PDFs requiring OCR, use pdf2image with pytesseract instead." Never list equal options. [VERIFIED — agentskills.io best-practices doc]

**Match prescriptiveness to fragility**
Flexible tasks: explain *why*, give the agent latitude. "Check all queries for SQL injection using parameterized queries" — not "run `SELECT * FROM pg_stat_activity` first, then..." Fragile/destructive tasks: exact sequence, exact command, no variations. "Run exactly this sequence: `python scripts/migrate.py --verify --backup`. Do not modify the command or add flags." [VERIFIED — agentskills.io best-practices doc]

**Procedures over declarations**
Teach the approach to a class of problems, not the answer to one instance. The former generalizes; the latter is a dead end after the first use. [VERIFIED — agentskills.io best-practices doc]

**NEVER / ALWAYS sections at the top**
Hard constraints placed at the top of the body are read before any other instruction. They are the most reliable way to prevent a class of bad behavior. (This pattern is observed in production APEX skills: `apex-debug/SKILL.md` opens with "One rule above all others: reproduce before fixing. Assumption-based debugging is forbidden.") [VERIFIED — APEX SKILL.md corpus]

**Checklists for multi-step workflows**
Explicit `- [ ]` checklists help the agent track progress and avoid skipping steps, especially with dependencies or validation gates. [VERIFIED — agentskills.io best-practices doc]

**Validation loops**
"Do the work → run validator → fix issues → repeat until clean" is more reliable than "do the work well." Instruct the agent to validate before proceeding. [VERIFIED — agentskills.io best-practices doc]

**Dynamic context injection (Claude Code-specific)**
The `` !`command` `` syntax runs a shell command before the skill content is sent to Claude. The output replaces the placeholder inline. This is preprocessing — Claude only sees the final rendered result. Use it to inject live data (diffs, PR contents, environment info) so instructions arrive grounded in current state. [VERIFIED — Claude Code docs]

**`ultrathink` keyword (Claude Code-specific)**
Including the word `ultrathink` anywhere in the skill body triggers deeper reasoning when the skill runs. [VERIFIED — Claude Code docs]

### Content the model tends to ignore

- General principle statements the model already knows ("follow best practices", "handle errors appropriately", "write clean code")
- Long explanatory prose about what a well-known technology is (the model knows what HTTP is)
- Options menus without a clear default (the model may pick inconsistently)
- "When to use this skill" sections inside the body (they only load after the skill is already activated — too late for discovery) [VERIFIED — Claude Code docs, community best-practices]
- Formatting/structure that exists for human readability but adds no information the model lacks

### Skill scope design

- A skill that is too narrow forces multiple skills to load for one task, risking overhead and conflicting instructions.
- A skill that is too broad becomes hard to activate precisely and may trigger when it shouldn't.
- Test: "Does this skill encapsulate one coherent unit of work that composes well with other skills?" If it covers a task AND the administration of the system that task runs on, it's too broad. [VERIFIED — agentskills.io best-practices doc]

### Source skills from real expertise, not LLM generation

Skills generated by LLMs from generic prompts produce vague, generic instructions that don't change behavior. Effective skills come from: [VERIFIED — agentskills.io best-practices doc]
- Completing a real task in conversation, then extracting the reusable pattern
- Feeding project-specific artifacts (runbooks, API specs, code review comments, incident post-mortems) to an LLM for synthesis
- Capturing corrections you made during agent execution (add them to the Gotchas section)

---

## Options Comparison: Invocation Control Patterns

| Pattern | Frontmatter | When to use |
|---------|-------------|-------------|
| Default (user + Claude) | (none) | Most skills — let Claude activate when relevant |
| User-only | `disable-model-invocation: true` | Side-effect workflows: deploy, commit, send message |
| Claude-only | `user-invocable: false` | Background knowledge: style guides, legacy context |
| Subagent isolation | `context: fork` | Long autonomous tasks that shouldn't share conversation history |

---

## Recommended Approach

**For `apex-skill-author` content, translate these findings into concrete rules:**

1. **Description rule:** Write descriptions as activation triggers ("Use when..."), front-load the key use case, include natural-language synonyms and indirect phrasings, explicitly exclude near-misses. Target 150–500 characters. Never exceed 1,024.

2. **Body length rule:** Hard cap at 500 lines / 5,000 tokens for `SKILL.md`. Move anything beyond that to reference files with explicit load conditions.

3. **Frontmatter rule:** Required: `description` (agentskills.io), plus APEX project fields (`skill:`, `version:`, `last_updated:`, `sources:`, `staleness_threshold:`). Add `disable-model-invocation: true` for any skill with side effects.

4. **Content rule (what to include):** Project-specific gotchas, concrete tool choices, templates for output format, exact sequences for fragile operations, NEVER/ALWAYS constraints at the top. Everything else is filler.

5. **Content rule (what to omit):** Anything the model's general training covers (HTTP, SQL basics, git commands), "when to use" sections inside the body, menus of equal options, vague quality directives.

6. **Structure rule:** For skills with hard constraints — NEVER/ALWAYS block first, then workflow. For skills with complex procedures — checklists and validation loops. For reference knowledge — templates and gotchas sections.

7. **Testing rule:** After writing a description, draft 8–10 realistic should-trigger prompts and 8–10 near-miss should-not-trigger prompts. Run a quick manual check; for production skills use the `skill-creator` eval loop.

---

## Code Examples / Patterns

### Minimal valid SKILL.md (agentskills.io standard)
```yaml
---
name: pdf-processing
description: Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.
---

Use pdfplumber for text extraction:

```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

For scanned PDFs requiring OCR, use pdf2image with pytesseract instead.
```

### Full APEX-style SKILL.md frontmatter
```yaml
---
skill: apex-example
backend: claude
version: 1.0.0
last_updated: 2026-05-29
sources:
  - Official Docs — https://example.com/docs
staleness_threshold: 30d
description: Short activation trigger here. Use when the user asks to X, Y, or Z.
---
```

### NEVER/ALWAYS block pattern (highest reliability for hard constraints)
```markdown
## Hard blocks — never do regardless of context

- Never do X
- Never do Y
- Always verify Z before proceeding
```

### Gotchas section pattern
```markdown
## Gotchas

- The `users` table uses soft deletes. Always add `WHERE deleted_at IS NULL`.
- The user ID is `user_id` in the DB, `uid` in auth, `accountId` in billing — all the same value.
- `/health` returns 200 even if the DB is down. Use `/ready` for full health checks.
```

### Dynamic context injection (Claude Code only)
```yaml
---
description: Summarizes uncommitted changes and flags anything risky. Use when the user asks what changed, wants a commit message, or asks to review their diff.
---

## Current changes

!`git diff HEAD`

## Instructions

Summarize the changes above in two or three bullet points, then list any risks you notice.
```

---

## Assumptions / Gaps

- [ASSUMED] The behavior of the model when processing specific instruction patterns (NEVER/ALWAYS, templates, etc.) is inferred from the agentskills.io best-practices documentation and APEX production skills. Direct ablation studies comparing instruction patterns were not available.
- [ASSUMED] The `ultrathink` keyword's exact mechanism is not documented beyond the Claude Code docs claim. No secondary sources verified.
- The agentskills.io description testing methodology (train/validation split, trigger rate thresholds) is from official docs [VERIFIED] but its exact effectiveness numbers (0.5 threshold, 5 iterations) are heuristic recommendations, not empirically validated benchmarks.

---

## Sources

- agentskills.io — Overview: https://agentskills.io
- agentskills.io — Specification: https://agentskills.io/specification
- agentskills.io — Best Practices: https://agentskills.io/skill-creation/best-practices
- agentskills.io — Optimizing Descriptions: https://agentskills.io/skill-creation/optimizing-descriptions
- agentskills.io — Quickstart: https://agentskills.io/skill-creation/quickstart
- Claude Code — Extend Claude with skills: https://code.claude.com/docs/en/skills
- APEX production skills corpus — `~/.claude/skills/apex-*/SKILL.md` (apex-research, apex-code, apex-plan, apex-debug, write-feature-spec examined)
