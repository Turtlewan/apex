---
spec: gpt56-b1-planning-surface
status: ready
token_profile: balanced
autonomy_level: L2
coder_effort: medium
---

# Spec: Phase B1 — planning surface: AGENTS.md population + spec `## Intent` block

**Identity:** Wires the planning-side half of the Codex context-propagation fix — apex-plan populates the AGENTS.md stubs at first spec-ready, and the spec template gains the compact `## Intent` block.
→ why: see docs/technical/adr/ADR-031-codex-context-propagation.md

## Intent
- **Intent:** planning stops shipping specs into repos whose `AGENTS.md` (the file Codex actually reads) is still a stub, and specs carry a compact machine-forwardable intent block.
- **Invariants:** apex-plan SKILL.md stays ≤500 lines; existing doc-coverage semantics (data-model / app-flow / design-brief scope gates) are preserved through the compression; template stub markers (`<!-- apex:agents:stub -->`, `<!-- apex:agents:verify -->`) keep their exact spelling (the coverage check greps them).
- **Non-goals:** no dispatch-pack changes (B2), no `.agents/skills` projection (B3), no apex-init changes (seeding already ships — ADR-026), no CLAUDE.md / SessionStart-hook edits.

## Assumptions
- `~/.claude/skills/apex-plan/SKILL.md` is exactly 500 lines and contains the anchor texts quoted in Tasks 1a–1c verbatim → impact: Stop (re-locate anchors before editing if drifted)
- `~/.claude/skills/apex-orchestrate/templates/AGENTS-template.md` contains the hard-rule line and header line quoted in Task 3 → impact: Stop
- This spec writes to BOTH the `~/.claude` repo and the `~/apex` repo. If executed by a Codex subprocess, one `workspace-write` dispatch cannot write both roots — split into two dispatches (`-C ~/.claude` for tasks 1–4, `-C ~/apex` for task 5) or execute Claude-direct → impact: Caution
- Files-to-change count (5) exceeds the 3-file split guideline → accepted: one coherent feature (the planning-side ADR-031 surface); two of the files are a template insert and a history row.

Simplicity check: considered a bare readiness-gate one-liner without the reference file — rejected: the population procedure (what earns a line in AGENTS.md, the ≤200-line ceiling, nested-file overflow, CLAUDE.md boundary) is exactly the content that must NOT bloat the capped SKILL.md, and it's needed at population time, not every session.

## Prerequisites
- Specs that must be complete first: none
- Environment setup required: none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-plan\SKILL.md` | modify | coverage-check compression + AGENTS.md item, readiness-gate item, Intent-block litmus exception, version 1.31.0 |
| `C:\Users\User\.claude\skills\apex-plan\references\agents-md-population.md` | create | the population procedure |
| `C:\Users\User\.claude\skills\apex-orchestrate\templates\AGENTS-template.md` | modify | never-branch hard rule + ~200-line ceiling note |
| `C:\Users\User\.claude\skills\apex-orchestrate\templates\spec-template.md` | modify | insert `## Intent` block |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | prepend 2 rows |

## Tasks

- [ ] **Task 1: apex-plan SKILL.md — three exact edits + frontmatter** — files: `C:\Users\User\.claude\skills\apex-plan\SKILL.md` — done when: all three replacements applied, frontmatter bumped to `version: 1.31.0` / `last_updated:` today, `  - docs/technical/adr/ADR-031-codex-context-propagation.md` appended to `sources:`, and `wc -l` ≤ 500.

  **1a — Doc-coverage check: replace items 4–6 with items 4–5.** Replace this block (currently items 4, 5, 6 — starts `4. **Conceptual data model still a stub**` and ends `projects (no such file by design — ADR-017).`):

  ```
  4. **Conceptual data model still a stub** (data-bearing projects only) — does
     `docs/technical/architecture/data-model.md` exist and still carry the `<!-- apex:data-model:stub -->`
     marker while a spec touches data/schema? → flag "data model is still a stub." Skip for stateless
     projects (no such file by design — ADR-008).
  5. **App-flow still a stub** (UI-bearing projects only) — does
     `docs/technical/architecture/app-flow.md` exist and still carry the `<!-- apex:app-flow:stub -->`
     marker while a UI/screen spec is in play? → flag "app-flow is still a stub." Skip for headless
     projects (no such file by design — ADR-013).
  6. **Design-brief still a stub** (UI-bearing projects only) — does
     `docs/technical/architecture/design-brief.md` exist and still carry the
     `<!-- apex:design-brief:stub -->` marker while a UI spec is in play? → flag "design-brief is still
     a stub" (the image-less coder has no tokens/forbidden-patterns to honour). Skip for headless
     projects (no such file by design — ADR-017).
  ```

  with:

  ```
  4. **Architecture artifact still a stub** (scope-gated) — `data-model.md` (data-bearing, ADR-008) ·
     `app-flow.md` (UI-bearing, ADR-013) · `design-brief.md` (UI-bearing, ADR-017), all under
     `docs/technical/architecture/`: the file exists, still carries its `<!-- apex:…:stub -->` marker,
     and a spec in its scope is in play (data/schema spec · UI/screen spec) → flag "{artifact} is
     still a stub." Headless/stateless projects skip by design (no such file).
  5. **AGENTS.md still stubbed** — the repo-root `AGENTS.md` carries an `<!-- apex:agents:stub -->` /
     `<!-- apex:agents:verify -->` marker while ≥1 spec sits in docs/changes/ → flag it (Codex builds read AGENTS.md, not the skills — ADR-031).
  ```

  (Note: dropping "the image-less coder has no tokens…" is deliberate — vision residue, coder is sighted since ADR-020 retirement.)

  **1b — Readiness gate, Documentation block: add one item.** Immediately after the `App-flow currency:` checklist item (ends `(UI-bearing projects — ADR-013)`), insert:

  ```
    [ ] AGENTS.md currency: at first spec-ready — and whenever this spec changes repo layout,
        conventions, or the stack binding — the root AGENTS.md stub sections are populated per
        references/agents-md-population.md (ADR-031)
  ```

  **1c — Spec-authoring rules: Intent-block exception.** Replace:

  ```
  - **No *why* inline.** Litmus when tempted: does it change what gets built? **No** → cut it
    (home = ADR / planning discussion). **Yes** → don't add the why, make the *what* explicit.
  ```

  with:

  ```
  - **No *why* inline.** Litmus when tempted: does it change what gets built? **No** → cut it
    (home = ADR / planning discussion). **Yes** → don't add the why, make the *what* explicit.
    One sanctioned exception: the template's `## Intent` block (intent / invariants / non-goals, ≤10
    lines) — load-bearing intent that travels to the coder in the dispatch pack (ADR-031); ADR-essay rationale still cut.
  ```

- [ ] **Task 2: create the population procedure reference** — files: `C:\Users\User\.claude\skills\apex-plan\references\agents-md-population.md` — done when: file exists with exactly this content:

  ````markdown
  # AGENTS.md population — planning fills what Codex reads (ADR-031)

  Fired by the readiness-gate Documentation item: at **first spec-ready** for a project — and again
  whenever a spec changes repo layout, conventions, or the stack binding — populate the root
  `AGENTS.md` stub sections. apex-init seeds the file (ADR-026); planning owns its content from
  here. Codex builds read AGENTS.md, not the APEX skills — an empty `§ Conventions` is a
  propagation gap.

  ## Per-section instructions

  - **`§ Verify commands`** (replace the `<!-- apex:agents:verify -->` stub): the union of every
    bound `stack_skills` entry's `## Verification Recipe`, verbatim runnable commands **including
    the install/setup step** (`uv sync`, `npm ci`, …). If the stack is still TBD, leave the marker.
  - **`§ Project layout`** (replace its `<!-- apex:agents:stub -->`): the module map — each
    top-level package/dir + one line on what it owns — and the architecture shape in one line
    (e.g. "ports & adapters; domain logic never imports adapters"). Only fill once code exists.
  - **`§ Conventions`** (replace its `<!-- apex:agents:stub -->`): ONLY what tooling does not
    mechanically enforce —
    - repo-specific conventions (naming schemes, module boundaries, error-contract shape)
    - resolved policy values (chosen lib + pinned major version, config values — state the
      decision, never "adapt to the bound stack")
    - version-bound hazards for the bound stack (API removals, v1→v2 breaking defaults)
    - security invariants (auth-source, tenant scoping, secret handling)
    Never generic hygiene (validation, HTTP codes, naming-in-general, DRY, no-silent-errors —
    native to the coder; injecting it degrades output via instruction competition).

  ## Form rules (apply to every line you write)

  - **Repo-relative paths only** — absolute paths break in per-task worktrees (ADR-028).
  - **Positively phrased + internally consistent** — GPT-5 burns reasoning reconciling
    contradictions and deviates from negative constraints; before adding a line, check it against
    the existing AGENTS.md text and rewrite conflicts instead of stacking them.
  - **Root file ≤ ~200 lines** — beyond that there are real cost/perf penalties (AGENTS.md size
    is a quota lever). Overflow goes to **nested per-directory AGENTS.md files** (nearest wins),
    never a fatter root.
  - **Keep it stable** — the file is prompt-prefix cacheable; edit when facts change, never
    cosmetically.
  - **One home per fact vs CLAUDE.md:** conventions both agents need live HERE; the project
    CLAUDE.md may carry a thin cross-reference ("build conventions: see AGENTS.md") — never a
    copy, never a symlink (different audiences).
  ````

- [ ] **Task 3: AGENTS-template.md — two exact edits** — files: `C:\Users\User\.claude\skills\apex-orchestrate\templates\AGENTS-template.md` — done when: both replacements applied.

  **3a** — Replace:
  ```
  repo. Codex reads this before acting; the nearest-directory AGENTS.md wins. Keep it well under 32 KiB.
  ```
  with:
  ```
  repo. Codex reads this before acting; the nearest-directory AGENTS.md wins. Keep the root file
  ≤ ~200 lines — overflow goes to nested per-directory AGENTS.md files, never a fatter root.
  ```

  **3b** — Replace:
  ```
  - **Never `git commit`, never `git push`.** Commits are owner-controlled; pushing to the default branch is a permanent hard block. Build + verify only; leave the working tree dirty for owner review.
  ```
  with:
  ```
  - **Never `git commit`, never `git push`, never create or switch branches.** The host owns integration — worktrees, checkouts, and commits are owner-controlled; pushing to the default branch is a permanent hard block. Build + verify only, in the tree you are given; leave it dirty for owner review.
  ```

- [ ] **Task 4: spec-template.md — insert `## Intent` block** — files: `C:\Users\User\.claude\skills\apex-orchestrate\templates\spec-template.md` — done when: the block below sits between the split-rule comment (`<!-- Split rule: … -->`) and `## Assumptions`:

  ```markdown
  ## Intent
  <!-- Optional for single-task specs, recommended otherwise. ≤10 lines, what-bearing — the ONE
       sanctioned home for load-bearing intent; it travels to the coder in the dispatch pack
       (ADR-031) so mismatches resolve against stated invariants instead of guesses.
       Never an ADR essay — rationale lives in the ADR. -->
  - **Intent:** {1-2 lines — the outcome this spec exists to produce}
  - **Invariants:** {properties that must hold when done — behavioural/structural, testable where possible}
  - **Non-goals:** {adjacent work this spec deliberately does NOT do}
  ```

- [ ] **Task 5: SKILL-HISTORY — prepend 2 rows** (newest first, column order `Date | Skill | Files | Version | Event | What Changed | Sources`) — files: `C:\users\user\apex\SKILL-HISTORY.md` — done when: top two data rows are:

  ```
  | 2026-07-10 | apex-plan | SKILL.md, references/agents-md-population.md | 1.31.0 | updated (SKILL) | AGENTS.md population step: doc-coverage items 4-6 merged + AGENTS.md-stub coverage item, readiness-gate AGENTS.md-currency item, Intent-block litmus exception; new population-procedure reference (ADR-031) | GPT-5.6×APEX report §3/§4, ADR-031 |
  | 2026-07-10 | apex-orchestrate | templates/AGENTS-template.md, templates/spec-template.md | — | updated | AGENTS-template: never-branch hard rule + ~200-line root ceiling; spec-template: ## Intent block (intent/invariants/non-goals, ≤10 lines) (ADR-031) | GPT-5.6×APEX report §3/§4, ADR-031 |
  ```

## Wave plan
Wave 1: [task 1, task 2, task 3, task 4] | Wave 2: [task 5]

## Permissions

### File Operations
| Action | Paths |
|--------|-------|
| Create | `C:\Users\User\.claude\skills\apex-plan\references\agents-md-population.md` |
| Modify | `C:\Users\User\.claude\skills\apex-plan\SKILL.md`, `C:\Users\User\.claude\skills\apex-orchestrate\templates\AGENTS-template.md`, `C:\Users\User\.claude\skills\apex-orchestrate\templates\spec-template.md`, `C:\users\user\apex\SKILL-HISTORY.md` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `wc -l ~/.claude/skills/apex-plan/SKILL.md` | 500-line cap check |
| `grep -c "apex:agents" ~/.claude/skills/apex-plan/SKILL.md` | verify coverage item landed |

### Git Operations
(none — host/owner commits)

### Environment Access
(none)

### Network
(none)

## Specialist Context
### Skill-author conformance (apex-skill-author)
- Iron Law: applied at the **lightweight tier per the standing user convention** (memory `iron-law-application-depth`): convention/structural wiring edits ship on documented RED evidence; full bare-agent RED/GREEN dogfood is reserved for new-domain/gate-emphasis skills. RED evidence here = the propagation gap itself (AGENTS.md § Conventions ships as a stub in every project today; no mechanism populates it — GPT-5.6×APEX report §3). GREEN = the next project's first spec-ready gate is the proving run. The deviation from apex-skill-author § The Iron Law's literal "no exceptions" wording is **explicitly accepted by planning** (spec-review FLAG resolution, session 65).
- 500-line cap on apex-plan SKILL.md is load-bearing. Verified line budget: Task 1a replaces 13 lines with 7 (−6) · `sources:` entry (+1) · Task 1b (+3) · Task 1c replaces 2 lines with 4 (+2) → **net 0, file stays at 500**.

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-031-codex-context-propagation.md | already written (planning, session 65) |
| History | ~/apex/SKILL-HISTORY.md | Task 5 |

## Acceptance Criteria
- [ ] Edit apex-plan SKILL.md → verify: `grep -n "apex:agents:stub" ~/.claude/skills/apex-plan/SKILL.md` hits in the coverage list; `grep -n "agents-md-population" ~/.claude/skills/apex-plan/SKILL.md` hits in the readiness gate; `grep -n "## Intent" ~/.claude/skills/apex-plan/SKILL.md` hits in the spec-authoring rules; `grep -n "ADR-031" ~/.claude/skills/apex-plan/SKILL.md` hits in `sources:`; `wc -l` reports ≤ 500; frontmatter shows `version: 1.31.0`.
- [ ] Create the reference → verify: `~/.claude/skills/apex-plan/references/agents-md-population.md` exists and contains the headers `## Per-section instructions` and `## Form rules`.
- [ ] Edit AGENTS-template → verify: `grep -n "never create or switch branches" ~/.claude/skills/apex-orchestrate/templates/AGENTS-template.md` hits; `grep -n "200 lines"` hits; stub markers `<!-- apex:agents:stub -->` and `<!-- apex:agents:verify -->` still present unchanged.
- [ ] Edit spec-template → verify: `grep -n "## Intent" ~/.claude/skills/apex-orchestrate/templates/spec-template.md` hits between the split-rule comment and `## Assumptions`.
- [ ] Prepend history rows → verify: `head -30 ~/apex/SKILL-HISTORY.md` shows the two 2026-07-10 rows above the previous newest row.

## Progress
_(Coding mode writes here — do not edit manually)_
