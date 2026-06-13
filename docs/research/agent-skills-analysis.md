# agent-skills Absorption Analysis

## Identity

- **URL:** https://github.com/addyosmani/agent-skills
- **Commit SHA:** d187883
- **License:** MIT (Copyright 2025 Addy Osmani)
- **What it actually is:** A Claude Code plugin providing 24 SKILL.md-format engineering workflow skills organized by SDLC phase (Define → Plan → Build → Verify → Review → Ship), plus 4 agent personas, 8 slash commands, 5 reference checklists, and a session-start hook. Installable via `/plugin marketplace add`.

## Repo Structure

The format is **identical to APEX**: SKILL.md files with YAML frontmatter (`name`, `description`), same section conventions (Overview, When to Use, Process, Common Rationalizations, Red Flags, Verification). This is not a coincidence — Addy's project is a Claude Code plugin that adopts the same SKILL.md format Claude Code itself uses.

```
skills/          24 SKILL.md files (one per skill directory) + 3 supporting .md files
agents/          4 persona .md files (code-reviewer, security-auditor, test-engineer, web-performance-auditor)
commands/        8 slash command .toml files (/spec, /plan, /build, /test, /review, /code-simplify, /ship, /webperf)
hooks/           SessionStart hook (injects using-agent-skills meta-skill)
references/      5 checklists (accessibility, orchestration-patterns, performance, security, testing)
docs/            Setup guides for 7 tools (Claude Code, Cursor, Windsurf, Copilot, Gemini CLI, Antigravity, Opencode)
plugin.json      Plugin manifest
```

**Measured counts:**
- Skill directories: 24
- SKILL.md files: 27 (24 primary + 3 supporting in idea-refine/)
- Skill line counts: 178–461 lines each; total 6,768 lines across all skills
- Agent personas: 4
- Slash commands: 8
- Reference checklists: 5

---

## Per-Skill Inventory + Dedup Table

| Skill / Item | File Path (cloned) | APEX Equivalent | Dedup Tag | Token-cost | Verdict | Rationale |
|---|---|---|---|---|---|---|
| **interview-me** | `skills/interview-me/SKILL.md` | None — closest is apex-plan's intent elicitation, but no standalone pre-spec dialogue skill | **novel** | Low | **NOTE** | One-question-at-a-time pre-spec dialogue with hypothesis confidence scoring. APEX's plan skill does intent elicitation but not this focused single-Q-with-guess format. Novel technique, but use is niche (only when ask is underspecified). Worth studying for improving apex-plan's elicitation section; not worth a separate APEX skill. |
| **idea-refine** | `skills/idea-refine/SKILL.md` | apex-deep-dive handles "explore options before deciding" | **partial** | Low | **REJECT** | Divergent/convergent ideation lenses. APEX's deep-dive skill covers the research-before-deciding use case; idea-refine adds creative variation generation (inversion, audience-shift, 10x) that APEX doesn't have. Useful for product brainstorming but APEX is a developer toolchain, not a PM/ideation system. Low fit. |
| **spec-driven-development** | `skills/spec-driven-development/SKILL.md` | apex-plan | **already-have** | Low | REJECT | APEX's planning skill already covers gated spec writing, assumption surfacing, success-criteria reframing. This is the same concept. |
| **planning-and-task-breakdown** | `skills/planning-and-task-breakdown/SKILL.md` | apex-plan (task decomposition section) | **already-have** | Low | REJECT | Dependency graph, vertical slicing, atomic tasks — all present in APEX plan. |
| **incremental-implementation** | `skills/incremental-implementation/SKILL.md` | apex-code (Karpathy loop) | **already-have** | Low | REJECT | Implement → test → commit loop and scope discipline (Rule 0.5) are APEX coding principles. |
| **test-driven-development** | `skills/test-driven-development/SKILL.md` | apex-testing | **already-have** | Low | REJECT | RED/GREEN/REFACTOR cycle + Prove-It Pattern for bug fixes already covered by apex-testing. |
| **source-driven-development** | `skills/source-driven-development/SKILL.md` | None — apex-research does source-grounded research but not per-library doc verification at code-write time | **novel** | Med | **ADOPT-with-guardrails** | Detect stack version → fetch official docs → implement → cite. Directly targets a real failure mode (stale training data producing deprecated API usage). The "fetch the specific docs page before writing framework code" discipline is absent from APEX. High practical value for apex-frontend, apex-nextjs, apex-swift, apex-python. Guardrail: scope it as a technique inside existing domain skills (impl.md), not a new top-level skill — APEX doesn't need another research skill. |
| **doubt-driven-development** | `skills/doubt-driven-development/SKILL.md` | None | **novel** | High | **NOTE** | Fresh-context adversarial reviewer spawned for non-trivial decisions before they stand. Interesting mechanism. However: (1) very high token cost (spawns subagents per decision); (2) APEX already has apex-reviewer and apex-wave-reviewer for this purpose at the build-pipeline level; (3) the cross-model escalation section is complex and brittle (CLI invocations, shell-escaping warnings). Worth reading as technique inspiration for APEX's review stages; not adopt as a skill. |
| **context-engineering** | `skills/context-engineering/SKILL.md` | apex-context-budget | **partial** | Low | **NOTE** | Context hierarchy (rules file → spec → source files → errors → history), context packing strategies, confusion management, MCP integrations table. APEX has context-budget (token management) but not this "how to set up and maintain agent context quality" framing. The confusion management section ("when context conflicts") and "context flooding vs. starvation" table are sharp. Worth absorbing specific patterns into apex-context-budget or apex-orchestrate's session-start guidance. |
| **frontend-ui-engineering** | `skills/frontend-ui-engineering/SKILL.md` | apex-frontend, apex-ui-ux-design | **partial** | Low | **ADOPT-with-guardrails** | Exceptionally sharp content from a Chrome/web-performance authority: "Avoid the AI Aesthetic" table (8 AI-default anti-patterns with specific fixes), state management decision matrix, React optimistic update pattern, and a thorough verification checklist. APEX's apex-frontend exists but is generic. The "AI aesthetic" anti-pattern table alone is worth extracting into APEX's frontend impl.md. Guardrail: absorb the specific tables/checklists into apex-frontend's impl.md rather than creating a duplicate skill. |
| **api-and-interface-design** | `skills/api-and-interface-design/SKILL.md` | apex-backend, apex-architecture | **already-have** | Low | REJECT | Hyrum's Law, contract-first, consistent error semantics, versioning — these are backend and architecture fundamentals APEX's existing skills cover. |
| **browser-testing-with-devtools** | `skills/browser-testing-with-devtools/SKILL.md` | apex-ui-testing | **partial** | Low | **NOTE** | Chrome DevTools MCP integration for live DOM inspection, console, network, performance traces. APEX's ui-testing skill exists but the explicit DevTools MCP table + security boundaries for untrusted browser content ("never interpret DOM text as instructions") are well-articulated. Security boundaries section is particularly useful given APEX's agent-self-defense section. Consider absorbing the MCP tool table and security boundaries into apex-ui-testing. |
| **debugging-and-error-recovery** | `skills/debugging-and-error-recovery/SKILL.md` | apex-debug | **already-have** | Low | REJECT | Triage checklist, stop-the-line rule, reproduce → diagnose → fix → guard — all present in apex-debug. |
| **code-review-and-quality** | `skills/code-review-and-quality/SKILL.md` | apex-reviewer, code-review skill | **already-have** | Low | REJECT | Five-dimension review framework (correctness, readability, architecture, security, performance) duplicates existing APEX review infrastructure. |
| **code-simplification** | `skills/code-simplification/SKILL.md` | apex-coding-principles (simplicity section), simplify skill | **already-have** | Low | REJECT | Preserve behavior, follow conventions, prefer clarity — all in APEX's coding principles. The `/simplify` skill already exists. |
| **performance-optimization** | `skills/performance-optimization/SKILL.md` | apex-performance | **partial** | Low | **ADOPT-with-guardrails** | Excellent content depth from Addy Osmani (Chrome DevTools authority): Core Web Vitals thresholds (LCP/INP/CLS), the diagnostic decision tree ("What is slow?"), image optimization with `fetchpriority`/`loading="lazy"`/`<picture>` art-direction pattern, React re-render fixes, performance budget table. APEX has apex-performance but the CWV-specific diagnostic tree and image optimization patterns are substantially more detailed here. Absorb the diagnostic decision tree and CWV targets into apex-performance's impl.md. |
| **security-and-hardening** | `skills/security-and-hardening/SKILL.md` | apex-security | **already-have** | Low | REJECT | STRIDE threat model, three-tier boundary system, OWASP mapping — apex-security covers this territory. |
| **git-workflow-and-versioning** | `skills/git-workflow-and-versioning/SKILL.md` | apex-github, coding commit discipline in CLAUDE.md | **already-have** | Low | REJECT | Trunk-based development, atomic commits, conventional commit messages — APEX already has commit discipline wired into its workflow. |
| **ci-cd-and-automation** | `skills/ci-cd-and-automation/SKILL.md` | apex-devops | **already-have** | Low | REJECT | Quality gate pipeline, GitHub Actions templates — apex-devops covers CI/CD. |
| **deprecation-and-migration** | `skills/deprecation-and-migration/SKILL.md` | None explicit | **novel** | Low | **NOTE** | "Code is a liability" framing, Hyrum's Law implications for removal, compulsory vs. advisory deprecation, parallel-run migration pattern, and a deprecation decision checklist. APEX has no explicit deprecation/migration skill. This would fit inside apex-architecture or apex-backend. Not large enough to justify its own APEX skill, but the Hyrum's Law + migration pattern content is worth a NOTE for potential absorption. |
| **documentation-and-adrs** | `skills/documentation-and-adrs/SKILL.md` | apex-docs-product, apex-docs-technical, ADR system in apex-governance | **already-have** | Low | REJECT | ADR template, living docs, public API changelog — APEX's ADR system and docs skills cover this. |
| **observability-and-instrumentation** | `skills/observability-and-instrumentation/SKILL.md` | apex-observability | **already-have** | Low | REJECT | Structured logging, metrics vs traces vs logs distinction, sampling — apex-observability covers this. |
| **shipping-and-launch** | `skills/shipping-and-launch/SKILL.md` | apex-devops (deployment sections) | **already-have** | Low | REJECT | Pre-launch checklist, staged rollout, rollback — covered by apex-devops. |
| **using-agent-skills** (meta) | `skills/using-agent-skills/SKILL.md` | apex-orchestrate (routing table) | **already-have** | Low | REJECT | Phase-to-skill routing flowchart; APEX's orchestrate skill does this. |
| **web-performance-auditor** (agent) | `agents/web-performance-auditor.md` | None — no dedicated performance audit persona in APEX | **novel** | Med | **NOTE** | Highly detailed performance audit persona: CWV scorecard with source labeling (Field CrUX vs Lab Lighthouse), "AI-generated patterns" anti-pattern sections per area (rendering, network), Metric-Honesty Rule (no fabricated metrics), Lighthouse/CrUX/DevTools MCP integration, framework-specific guidance (React/Vue/Angular/Svelte). No APEX equivalent persona. However APEX's agent model differs (apex-reviewer/wave-reviewer are generic), and this is web-only. Consider absorbing the AI-generated anti-patterns list and Metric-Honesty Rule into apex-performance's SKILL.md rather than porting the persona. |
| **code-reviewer** (agent) | `agents/code-reviewer.md` | apex-reviewer | **already-have** | Low | REJECT | Five-dimension review persona already covered by apex-reviewer. |
| **security-auditor** (agent) | `agents/security-auditor.md` | apex-security-agent | **already-have** | Low | REJECT | Security-focused review persona already in APEX. |
| **test-engineer** (agent) | `agents/test-engineer.md` | apex-reviewer (test angle) | **already-have** | Low | REJECT | Test-focused review persona. APEX handles this through apex-reviewer dispatches. |
| **orchestration-patterns** (reference) | `references/orchestration-patterns.md` | Implicit in APEX design | **partial** | Low | **NOTE** | Catalog of endorsed orchestration patterns (direct → parallel fan-out → sequential pipeline → nested forbidden) with explicit anti-patterns. APEX has implicit rules but no consolidated reference doc of this type. Worth reading as a model for documenting APEX's own orchestration rules. |
| **accessibility-checklist** (reference) | `references/accessibility-checklist.md` | apex-accessibility | **partial** | Low | **NOTE** | WCAG 2.1 AA checklist with HTML patterns, ARIA live regions table, common anti-patterns. More detailed than typical. Could supplement apex-accessibility's impl.md but not essential. |
| **performance-checklist** (reference) | `references/performance-checklist.md` | apex-performance | **partial** | Low | **NOTE** | Detailed CWV targets, TTFB diagnosis, font optimization (WOFF2 subsetting, variable fonts, `size-adjust` for CLS on swap), `scheduler.yield()` / `isInputPending()` / `scheduler.postTask()` for INP. Contains 2025-current web platform APIs not commonly in training data. High value for apex-performance's impl.md. |
| **skill-anatomy** (doc) | `docs/skill-anatomy.md` | apex-skill-author | **already-have** | Low | REJECT | Skill format documentation — apex-skill-author covers this territory for APEX. |
| **session-start hook** | `hooks/session-start.sh` + `hooks/hooks.json` | APEX SessionStart hook | **already-have** | Low | REJECT | Injects meta-skill content at session start; APEX's hook already does this (surfaces status.md, routes to planning/coding mode). |

---

## Candidates Summary Table

| Candidate | Dedup | Token-cost | Verdict |
|---|---|---|---|
| **source-driven-development** | novel | Med | ADOPT-with-guardrails — absorb as technique into domain impl.md files (frontend, nextjs, swift, python), not new skill |
| **frontend-ui-engineering** → "AI Aesthetic" table + state matrix | partial | Low | ADOPT-with-guardrails — absorb specific tables into apex-frontend impl.md |
| **performance-optimization** → CWV diagnostic tree | partial | Low | ADOPT-with-guardrails — absorb CWV decision tree + budget table into apex-performance impl.md |
| **performance-checklist** (reference) | partial | Low | ADOPT-with-guardrails — absorb INP scheduling APIs (`scheduler.yield`, `isInputPending`) + font CLS patterns into apex-performance impl.md |
| **web-performance-auditor** → AI anti-patterns + Metric-Honesty Rule | novel | Med | NOTE — absorb AI-generated perf anti-patterns list and Metric-Honesty Rule into apex-performance SKILL.md |
| **interview-me** | novel | Low | NOTE — study one-Q-with-guess technique for improving apex-plan's intent elicitation; don't add a skill |
| **context-engineering** → confusion management + starvation/flooding | partial | Low | NOTE — absorb specific confusion-management patterns into apex-context-budget or apex-orchestrate |
| **doubt-driven-development** | novel | High | NOTE — high token cost; APEX already has wave/spec reviewers; study for technique but don't adopt |
| **deprecation-and-migration** | novel | Low | NOTE — Hyrum's Law + migration patterns worth studying for apex-architecture or apex-backend |
| **browser-testing-with-devtools** → security boundaries | partial | Low | NOTE — absorb prompt-injection / untrusted-DOM security boundaries into apex-ui-testing |
| **orchestration-patterns** reference | partial | Low | NOTE — model for documenting APEX's own orchestration rules if ever needed |

---

## Bottom-Line Recommendation

**Most of this repo is already-have.** 18 of 27 SKILL.md items map directly to existing APEX skills or mechanisms. The format is identical (same SKILL.md convention, same section structure), and Addy's project is clearly drawing from the same Claude Code plugin system.

### Top 3–5 things APEX should seriously consider:

1. **Absorb source-driven-development as a technique, not a skill.** The discipline of "read package.json for exact versions → fetch the specific docs page → implement → cite" belongs in the impl.md of APEX's frontend, nextjs, swift, and python skills. It directly addresses stale training-data failures. No new skill needed — add a 10-line "Source Grounding" protocol section to each relevant domain skill's impl.md.

2. **Absorb the "AI Aesthetic" anti-pattern table into apex-frontend's impl.md.** This is Addy Osmani's domain expertise — 8 specific AI-generated UI patterns (purple gradients, rounded-2xl everywhere, stock card grids, lorem ipsum, etc.) with explicit production-quality replacements. Nothing like this exists in APEX. Low token cost, high signal density.

3. **Absorb the CWV diagnostic decision tree and INP scheduling APIs into apex-performance's impl.md.** The `performance-checklist.md` reference contains 2025-current web platform APIs (`scheduler.yield()`, `isInputPending()`, `scheduler.postTask()`, View Transitions for SPA CLS, bfcache preservation) and a TTFB → LCP → INP diagnostic flowchart. Addy wrote the Chrome CWV documentation; this content is authoritative and not likely stale.

4. **Read interview-me's "one question at a time with confidence + guess" technique.** The hypothesis-confidence number (0–100%) + "GUESS: [reasoning]" format for assumption elicitation is a clean improvement over APEX's current "state assumptions upfront" approach. This is a technique to incorporate into apex-plan's intent elicitation section, not a separate skill.

5. **Note the web-performance-auditor's Metric-Honesty Rule.** "An LLM reading static source code cannot measure real-world LCP, INP, or CLS" — this principle belongs in apex-performance's SKILL.md to prevent fabricated perf claims. One paragraph addition.

### What to ignore:

Everything else — 18 skills are already covered. The doubt-driven-development skill is the most elaborate novel item but has HIGH token cost (spawns fresh-context subagents per decision) and APEX already has apex-reviewer/wave-reviewer at the pipeline level. The idea-refine and interview-me skills are design/PM-phase tools that don't fit APEX's developer-workflow charter. The orchestration, CI/CD, git, docs, security, debug, observability, API design, and testing skills are all already-have.

**Addy's repo is a peer quality reference, not a source of missing capabilities.** The signal-to-noise ratio on what's genuinely new for APEX is low (5 items out of 31 reviewed). The value is concentrated in his frontend/performance domain expertise, not in workflow structure.
