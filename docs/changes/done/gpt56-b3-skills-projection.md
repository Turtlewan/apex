---
spec: gpt56-b3-skills-projection
status: ready
token_profile: balanced
autonomy_level: L2
coder_effort: medium
---

# Spec: Phase B3 — `.agents/skills/` projection convention (apex-skill-author)

**Identity:** Adds the Codex-facing card-projection convention to apex-skill-author: which APEX skill content projects into a repo-local `.agents/skills/`, the card anatomy, and the three ship-gates (Terra RED baseline · trigger-eval CSV · validation checklist).
→ why: see docs/technical/adr/ADR-031-codex-context-propagation.md

## Intent
- **Intent:** skill knowledge reaches Codex through generated, selectively-projected cards with an over-eager-firing guard — never a hand-maintained second copy of the skill set.
- **Invariants:** apex-skill-author SKILL.md stays ≤500 lines; cards are project artifacts (NOT tracked in registry/SKILLS.md); the Iron Law's consumer for a card is *bare Terra*, not a bare Claude agent; probe repos contain no APEX planning docs (baseline-test isolation).
- **Non-goals:** no cards are authored by this spec (first real card = the convention's proving run, likely Artemis's bound-stack card); no `apex-plan-review` card content (Sol's rubric lands with Phase C); no AGENTS.md or dispatch-pack changes (B1/B2).

## Assumptions
- `~/.claude/skills/apex-skill-author/SKILL.md` is ~333 lines (headroom for ~+20) and contains the anchor headings quoted in Task 1 → impact: Stop
- `~/.claude/skills/apex-skill-author/` has no `references/` directory yet (this spec creates it) → impact: Low
- Headless repo-local `.agents/skills` pickup works in our dispatch shape → impact: Low (already PROVEN, scratch-repo probe 2026-07-10 — report §3b)

Simplicity check: considered putting the whole convention inline in SKILL.md (the file is well under the 500-line cap, and the two-tier split doctrine is literally scoped to impl.md, so no existing rule *requires* a split). Planning deliberately generalizes the tiering by analogy: apex-skill-author SKILL.md loads whole on every authoring task, while the card anatomy + CSV format + checklist (~90 lines) is needed only when projecting a card — the split trades a rare lookup for a recurring context saving. Deviation owned as a planning judgment call, not asserted as already-sanctioned doctrine.

## Prerequisites
- Specs that must be complete first: `gpt56-b2-dispatch-pack` (serialization edge — shared `~/apex/SKILL-HISTORY.md`, owned by B1; no content dependency)
- Environment setup required: none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-skill-author\SKILL.md` | modify | new projection section + 1 hard block + 1 checklist item; version 1.8.0 |
| `C:\Users\User\.claude\skills\apex-skill-author\references\agents-skills-projection.md` | create | card anatomy, gates, CSV format, generation workflow |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | prepend 1 row |

## Tasks

- [ ] **Task 1: apex-skill-author SKILL.md — three exact edits** — files: `C:\Users\User\.claude\skills\apex-skill-author\SKILL.md` — done when: all three applied, frontmatter bumped to `version: 1.8.0` / `last_updated:` today, `docs/technical/adr/ADR-031-codex-context-propagation.md` added to `sources:`, and `wc -l` ≤ 500.

  **1a — new section.** Immediately after the `## Author to the executor's capability floor` section (i.e. just before the line `Evidence and the full model matrix:` … no — *after* that line and its blank line, before `## impl.md loading tiers — author for what coding mode loads per run`), insert:

  ````markdown
  ## `.agents/skills/` projection — Codex-facing cards (ADR-031)

  APEX skills are read by Claude hosts; the Codex coder reads a **repo-local `.agents/skills/`**
  directory instead (headless pickup proven). Cards are **projected from APEX skills — generated,
  never hand-maintained twice** — and **selective**: bound-stack cards, debug/testing cards, domain
  hazard cards. Never mirror the full skill set: most APEX content is planning judgment or hygiene
  native to GPT-5.6 — unselective projection is noise that degrades output.

  Every card passes three gates before it ships:
  1. **Terra RED baseline (the Iron Law, extended to the Codex consumer):** run the card's target
     task with *bare Terra* (`codex exec`, no card) in an isolated probe repo. The card earns its
     place only where bare Terra fails.
  2. **Trigger-eval CSV:** should-trigger / should-NOT-trigger prompts (negative controls included)
     run via `codex exec --json` — the dominant failure mode is cards firing too eagerly.
  3. **Validation checklist:** frontmatter parses, the shared ~8k-char description-index budget
     fits, no conflicts with AGENTS.md text, `allow_implicit_invocation` set deliberately per card.

  > Card anatomy, projection sources, CSV format, generation/refresh workflow: read
  > `references/agents-skills-projection.md` when projecting or editing a card.
  ````

  **1b — hard block.** In `## Hard blocks`, after the line `- Never create \`impl.md\` that just duplicates SKILL.md.`, insert:
  ```
  - Never hand-edit a projected `.agents/skills/` card — edit the source APEX skill and regenerate (one home per fact).
  ```

  **1c — review checklist.** In `## Review checklist`, after the line ending `apex-research triggered`, insert:
  ```
  - [ ] Projection (if the edited skill sources a `.agents/skills/` card): card regenerated + the three gates re-run (references/agents-skills-projection.md)
  ```

- [ ] **Task 2: create the projection reference** — files: `C:\Users\User\.claude\skills\apex-skill-author\references\agents-skills-projection.md` — done when: file exists with exactly this content:

  ````markdown
  # `.agents/skills/` projection — card anatomy, gates, workflow (ADR-031)

  Read when projecting or editing a Codex-facing card. Cards live in the **target project's repo**
  (`.agents/skills/<card-name>/`), are committed with it, and are NOT tracked in
  `registry/domains.md` / `SKILLS.md` (project artifacts, not APEX skills). The APEX skill is the
  source; the card is generated output.

  ## What projects (selective — never a mirror)

  | Card class | Projects from | Example cards |
  |---|---|---|
  | Bound-stack | stack impl.md NEVER/ALWAYS + Verification Recipe + version-bound hazards | `typed-python`, `tauri2`, `swift-concurrency` |
  | Debug / testing | apex-debug one-hypothesis + regression-test discipline; apex-testing recipe rules | `debug-discipline`, `test-discipline` |
  | Domain hazard | security invariants only (auth-source, tenant scoping, secret handling) from apex-security / apex-auth / apex-data impl cores | `auth-hazards`, `migration-hazards` |
  | Plan-review | Sol's plan-check rubric — **lands with Phase C**, listed here for shape only | `apex-plan-review` |

  What does NOT project: planning judgment, orchestration process, generic hygiene (validation,
  HTTP codes, naming, DRY, no-silent-errors — native to GPT-5.6; injecting degrades output).
  Content calibration is the same as AGENTS.md § Conventions (ADR-031): repo-specific, version-
  bound, resolved values, security invariants, runnable verification; positively phrased;
  internally consistent with the repo's AGENTS.md.

  ## Card anatomy

  ```
  .agents/skills/<card-name>/
    SKILL.md
    trigger-eval.csv
    references/          # optional — bulky tables / walkthroughs, on demand
  ```

  `SKILL.md` frontmatter + body:

  ```markdown
  ---
  name: <card-name>
  description: <activation trigger — when Codex should pull this card; this string counts
    against the shared ~8k-char skills-index budget across ALL cards in the repo>
  # allow_implicit_invocation: false   # set false for dispatch-prompt-only cards (must never auto-fire)
  ---
  1. Inspect the repo first: <the check that grounds the card in THIS repo's reality —
     read the config / the pattern file / the pinned version before applying anything>
  2. <5–10 conditional invariants — "when X, do Y"; repo/version-specific; positively phrased>
  3. Verification: <how to discover + run the relevant checks for work this card covers>
  ```

  ## The three gates — every card, before it ships

  1. **Terra RED baseline (Iron Law, extended).** Run the card's target task with bare Terra
     (`codex exec -m gpt-5.6-terra`, no card) in a scratch/probe repo. Capture what it gets wrong
     verbatim; the card teaches only those gaps. Bare Terra already does it → the content does not
     project. **Probe-repo isolation:** the repo must contain no APEX planning docs / ADRs /
     roadmaps (contamination — the baseline-test-isolation rule).
  2. **Trigger-eval CSV.** `trigger-eval.csv` rows: `prompt,should_trigger` — ≥3 `true` rows and
     ≥3 negative controls (near-miss prompts that must NOT fire). Run each prompt via
     `codex exec --json` in the card's repo and check the event stream for card retrieval. Any
     false-fire → tighten the `description`, re-run until clean.
  3. **Validation checklist.**
     - [ ] frontmatter parses (name + description present)
     - [ ] sum of all card `description` strings in the repo ≤ ~8k chars (the skills-index budget)
     - [ ] zero conflicts with the repo's AGENTS.md text (rewrite, don't stack)
     - [ ] `allow_implicit_invocation` decided deliberately (false for dispatch-only cards)
     - [ ] body ≤ ~100 lines; bulk in `references/`

  ## Generation + refresh (never hand-maintained twice)

  - Regenerate a card whenever its source APEX skill's *projected sections* change; note
    "projection refreshed: <repos>" in the source skill's SKILL-HISTORY row.
  - Start-set for a new project: bound-stack card(s) + debug/testing. Add hazard cards when the
    domain enters the roadmap. Never pre-build a full grid.
  - Deleting a source skill → delete its cards in consuming repos (flag them in the session close).
  ````

- [ ] **Task 3: SKILL-HISTORY — prepend 1 row** — files: `C:\users\user\apex\SKILL-HISTORY.md` — done when: top data row is:
  ```
  | 2026-07-10 | apex-skill-author | SKILL.md, references/agents-skills-projection.md | 1.8.0 | updated (SKILL) | .agents/skills projection convention: selective Codex-facing cards, generated-not-duplicated, three ship-gates (Terra RED baseline · trigger-eval CSV · validation checklist); hard block on hand-editing cards (ADR-031) | GPT-5.6×APEX report §3b/§4, ADR-031, OpenAI skill-creator system skill |
  ```

## Wave plan
Wave 1: [task 1, task 2] | Wave 2: [task 3]

## Permissions

### File Operations
| Action | Paths |
|--------|-------|
| Create | `C:\Users\User\.claude\skills\apex-skill-author\references\agents-skills-projection.md` |
| Modify | `C:\Users\User\.claude\skills\apex-skill-author\SKILL.md`, `C:\users\user\apex\SKILL-HISTORY.md` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `wc -l ~/.claude/skills/apex-skill-author/SKILL.md` | 500-line cap check |

### Git Operations
(none — host/owner commits)

### Environment Access
(none)

### Network
(none)

## Specialist Context
### Skill-author conformance (apex-skill-author — self-referential)
- Iron Law: applied at the **lightweight tier per the standing user convention** (memory `iron-law-application-depth`): convention/structural wiring edits ship on documented RED evidence; full bare-agent RED/GREEN dogfood is reserved for new-domain/gate-emphasis skills. RED evidence here = report §3b + all 6 Sol clusters (unselective projection is noise; over-eager firing is the dominant community failure mode) + the PROVEN headless pickup probe. GREEN + prompt-independence = the first real card projection (likely Artemis's bound-stack card) is the convention's proving run — and the convention itself gates **every future card** on a full Terra RED baseline + trigger-eval, so the full-rigor Iron Law lands where it pays, per card. Deviation from the literal "no exceptions" Iron Law wording **explicitly accepted by planning** (spec-review BLOCK resolution, session 65).
- The two-tier core/references split is dogfooded: ~16-line always-load section, bulk in a load-conditioned reference.

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-031-codex-context-propagation.md | already written |
| History | ~/apex/SKILL-HISTORY.md | Task 3 |

## Acceptance Criteria
- [ ] SKILL.md edited → verify: `grep -n "agents/skills" ~/.claude/skills/apex-skill-author/SKILL.md` hits a new `##` section between "capability floor" and "loading tiers"; the hard-block and checklist lines grep; `wc -l` ≤ 500; frontmatter `version: 1.8.0`.
- [ ] Reference created → verify: `grep -n "## The three gates" ~/.claude/skills/apex-skill-author/references/agents-skills-projection.md` hits; the CSV format (`prompt,should_trigger`) and the ~8k-char budget line are present.
- [ ] History row prepended → verify: `head -20 ~/apex/SKILL-HISTORY.md` shows the 2026-07-10 apex-skill-author 1.8.0 row.

## Progress
_(Coding mode writes here — do not edit manually)_
