---
spec: gpt56-c1-sol-plan-check
status: ready
token_profile: balanced
autonomy_level: L2
coder_effort: medium
---

# Spec: Phase C1 — Sol plan-check gate + cross-model deliberation (apex-plan)

**Identity:** Adds the post-readiness-gate Sol cold-read of every Deep Details spec (advisory; blocking for `risk: high`) and the offer-only ≤2-round cross-model deliberation protocol.
→ why: see docs/technical/adr/ADR-032-gpt56-role-split.md

## Intent
- **Intent:** every substantial spec gets one independent cross-family read before it freezes; high-risk disputes surface to the user instead of being negotiated away.
- **Invariants:** apex-plan SKILL.md stays ≤500 lines; the cold first read is sacred (Sol never sees Opus's self-review or reviewer findings); Sol never edits the spec; deliberation never auto-runs; termination = accepted/withdrawn/DISPUTED (never consensus).
- **Non-goals:** no Sonnet-host changes (C2), no build-side review routing or Sol coder rung (C3), no Tier-2 tooling beyond the documented protocol (user-invoked, rare).

## Assumptions
- `~/.claude/skills/apex-plan/SKILL.md` is exactly 500 lines and contains the anchor texts in Task 1 verbatim (post-B1 state) → impact: Stop
- The review schema at `~/.claude/skills/apex-code/references/codex-review-schema.json` exists and stays the BLOCK/FLAG/CLEAN findings shape (reused cross-skill — one home per fact) → impact: Stop
- `codex exec resume` continues a prior exec session on codex-cli 0.144.1 (used only by the offer-only deliberation path; the gate itself needs no resume) → impact: Caution (first deliberation run probes it; documented fallback = fresh dispatch carrying the prior transcript)

Simplicity check: considered a standalone `## Sol plan-check` SKILL.md section — rejected: the flow line after the readiness gate is where the gate must fire from, and the full protocol is per-use reference material; 6 flow lines + one reference matches the B1/B2 pattern and the 500 cap.

## Prerequisites
- Specs that must be complete first: none (first C spec; B1–B3 already applied)
- Environment setup required: none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-plan\SKILL.md` | modify | flow-line gate insertion + 3 compressions (net 0); version 1.32.0 |
| `C:\Users\User\.claude\skills\apex-plan\references\sol-plan-check.md` | create | dispatch recipe + disposition + deliberation Tiers 1–2 |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | prepend 1 row |

## Tasks

- [ ] **Task 1: apex-plan SKILL.md — four exact edits + frontmatter** — files: `C:\Users\User\.claude\skills\apex-plan\SKILL.md` — done when: all four applied, frontmatter `version: 1.32.0`, `  - docs/technical/adr/ADR-032-gpt56-role-split.md` appended to `sources:`, `wc -l` ≤ 500.

  **1a — flow line gains the gate.** Replace:
  ```
  Then dispatch domain review (below), resolve its findings, and run the Readiness Gate (below).
  Only move to docs/changes/ when the gate passes.
  ```
  with:
  ```
  Then dispatch domain review (below), resolve its findings, and run the Readiness Gate (below).
  After the gate passes, run the **Sol plan-check gate** (ADR-032): dispatch a cold `gpt-5.6-sol`
  read of the spec (read-only, schema'd, effort max) per `references/sol-plan-check.md` — advisory
  by default, **blocking for `risk: high`**; Sol never edits the spec; skip only trivial
  single-domain specs. For high-risk specs you may *offer* (never auto-run) the ≤2-round
  cross-model deliberation in the same reference. Only move to docs/changes/ when gate + plan-check are resolved.
  ```

  **1b — compression (kills a stale claim).** Replace:
  ```
  **Cross-model review — set the flag for high-stakes builds.** For an auth / security /
  data-migration spec, set `cross_model_review: true` in the spec frontmatter so coding mode runs
  an independent second review on the *other* model family before shipping (apex-governance
  § Cross-model review). It spends Claude-side capped-pool tokens and needs a second backend
  (Mac), so set it deliberately for the builds that earn it — never as a default.
  ```
  with:
  ```
  **Cross-model review — set the flag for high-stakes builds.** For an auth / security / data-migration
  spec, set `cross_model_review: true` in the frontmatter — coding mode runs an independent second review
  by the *other* model family before shipping (apex-governance § Cross-model review). Deliberate, never a default.
  ```

  **1c — compression.** Replace the model-routing body:
  ```
  `coder_models` from status.md (default `[codex]`; ADR-027): **Codex builds every task; Opus is the
  manual fallback at quota-out** (a build-time event handled by apex-code, not a planning route). So emit
  the normal **untagged `## Wave plan`** (every task → Codex; don't tag `▸opus` proactively); a spec's
  optional `coder_model: opus` frontmatter pins the whole spec to Opus up front; the one real per-spec lever is **reasoning effort** — `coder_effort: {low|medium|high|xhigh|max|ultra}` (default `medium`; `high` for risk:high/auth/security/data/hard, `low` for trivial, `max`/`ultra` rare escalation rungs — see references/model-routing.md § Reasoning-effort dial; ADR-030).
  ```
  with:
  ```
  `coder_models` from status.md (default `[codex]`; ADR-027): **Codex builds every task; Opus is the
  manual fallback at quota-out** (a build-time event handled by apex-code, not a planning route). Emit the
  normal **untagged `## Wave plan`**; `coder_model: opus` pins a whole spec; the one real per-spec lever is **reasoning effort** — `coder_effort: {low|medium|high|xhigh|max|ultra}` (default `medium`; `high` for risk:high/auth/security/data/hard, `low` for trivial, `max`/`ultra` rare rungs — references/model-routing.md; ADR-030).
  ```

  **1d — compression.** Replace:
  ```
  At spec-confirm time, do **not** tell the user to "go read the file." They lived the
  discussion; sending them to re-read a stripped-down restatement is the redundant step.
  Instead surface a **digest** in chat — only the fields where the written spec could have
  drifted from what you discussed — and let them verify *that*. Depth is mode-gated.
  ```
  with:
  ```
  At spec-confirm time, do **not** tell the user to "go read the file." Surface a **digest** in chat —
  only the fields where the written spec could have drifted from the discussion — and let them verify *that*. Depth is mode-gated.
  ```

- [ ] **Task 2: create the plan-check reference** — files: `C:\Users\User\.claude\skills\apex-plan\references\sol-plan-check.md` — done when: file exists with exactly this content:

  ````markdown
  # Sol plan-check gate + cross-model deliberation (ADR-032)

  Runs after the readiness gate, before a Deep Details spec moves to `docs/changes/`. One
  independent cross-family read per spec; skip only trivial single-domain specs (same economy
  rule as dispatched domain review). Light / Bug Fix modes skip entirely.

  ## The cold read (the gate)

  ```
  printf '%s' "<prompt below + the full spec text>" | codex exec -c approval_policy="never" \
    --sandbox read-only -m gpt-5.6-sol -c model_reasoning_effort=max \
    --output-schema ~/.claude/skills/apex-code/references/codex-review-schema.json \
    -o /tmp/sol-plan-check-<spec>.json --color never -C <project-repo>
  ```

  Prompt shape: *"You are an independent plan reviewer. Review this APEX spec against the repo
  for: internal contradictions, acceptance criteria a builder cannot verify as written, missing
  producing mechanisms, files/anchors that don't exist, hazards the tasks don't cover, and
  simpler structures that meet the same criteria. Findings as BLOCK (spec will fail or build the
  wrong thing) / FLAG (planning should decide) / CLEAN, each with file/line + rationale. Judge
  the spec, do not rewrite it."*

  - **Input = spec + repo evidence only.** Never Opus's self-review notes, reviewer findings, or
    planning-discussion text — the cold first read is sacred (evaluator independence).
  - `--sandbox read-only` + no profile: Sol can inspect the repo, writes nothing. **Sol never
    edits the spec** — planning applies accepted amendments itself.
  - Effort `max` (plan-check is the highest-leverage read; if gate spend ever crowds Terra build
    quota, drop to `xhigh` before dropping the gate).

  ## Disposition

  | Spec | Sol verdict | Action |
  |---|---|---|
  | any | CLEAN | proceed to ready |
  | routine | FLAG / BLOCK | advisory — resolve or explicitly accept with reasoning (verify-before-implementing: findings can be wrong; rebut with evidence, no performative agreement) |
  | `risk: high` | BLOCK | **blocking** — the spec does not move to ready with an unresolved Sol BLOCK; resolve, or run deliberation, or the user overrides explicitly. This path is an **approval gate** (apex-governance § Approval gate format), not an advisory review — the "review" label stays with the advisory rows |

  Terminology: this gate reviews *plans* and is distinct from the build-side `cross_model_review`
  frontmatter flag (code review — apex-governance § Cross-model review).

  ## Tier 1 deliberation — high-risk specs only, never auto-runs

  Trigger: the **user asks, or the host suggests it and asks — every time** (Council offer-only
  rule, ADR-010). Protocol:
  1. Opus answers each finding into the *same* Sol conversation — **amend** (accept; change the
     spec) or **rebut with evidence** — via `codex exec resume <session-id>` (session id from the
     dispatch's event stream; fallback if resume is unavailable: fresh dispatch carrying the
     prior findings + responses verbatim).
  2. **≤2 rounds** (ADR-015 cap). Termination is NOT consensus — each finding ends as exactly one of:
     `accepted` (spec amended) · `withdrawn` (Sol retracts — the resolution table MUST cite the
     specific evidence that moved it; an uncited withdrawal is conversational capitulation, record
     it as DISPUTED instead) · `DISPUTED` (both positions stated → **the user arbitrates**).
  3. The resolution table lands in the spec's `## Intent` block as invariants.
  4. **Anti-collusion valve:** disputes surface, never negotiate away — "split the difference"
     is forbidden; no movement on evidence → DISPUTED → user (apex-governance § Evaluator independence).

  ## Tier 2 — blind dual-draft (user-invoked ONLY)

  For the rarest, biggest decisions. Both models draft from the same problem brief independently
  (neither sees the other's draft) → exchange → ≤2 critique rounds → a **merge doc** of
  agreements + disputes for the user's final call. The host never suggests Tier 2 proactively.
  ````

- [ ] **Task 3: SKILL-HISTORY — prepend 1 row** — files: `C:\users\user\apex\SKILL-HISTORY.md` — done when: top data row is:
  ```
  | 2026-07-10 | apex-plan | SKILL.md, references/sol-plan-check.md | 1.32.0 | updated (SKILL) | Sol plan-check gate after the readiness gate (cold gpt-5.6-sol read, schema'd, advisory / blocking for risk:high, Sol never edits) + offer-only ≤2-round cross-model deliberation (accepted/withdrawn/DISPUTED→user); 3 compressions incl. stale "needs a Mac backend" claim removed (ADR-032) | GPT-5.6×APEX report §2/§4, ADR-032 |
  ```

## Wave plan
Wave 1: [task 1, task 2] | Wave 2: [task 3]

## Permissions

### File Operations
| Action | Paths |
|--------|-------|
| Create | `C:\Users\User\.claude\skills\apex-plan\references\sol-plan-check.md` |
| Modify | `C:\Users\User\.claude\skills\apex-plan\SKILL.md`, `C:\users\user\apex\SKILL-HISTORY.md` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `wc -l ~/.claude/skills/apex-plan/SKILL.md` | 500-line cap check |

### Git Operations
(none — host/owner commits)

### Environment Access
(none)

### Network
(none — the gate's first live dispatch is a post-apply proving run, not a task here)

## Specialist Context
### Skill-author conformance (apex-skill-author)
- Iron Law: lightweight tier — this is a **user-established standing convention** (memory `iron-law-application-depth`: full RED/GREEN dogfood reserved for new-domain/gate-emphasis skills; convention/structural wiring ships on documented RED evidence), not a spec-local self-exemption. RED evidence, captured verbatim this session: specs drafted with no cross-family check shipped 2 line-cap arithmetic errors + 1 wrong-file pointer that only dispatched fresh-context review caught (the no-gate baseline failing on real work today). GREEN = the gate's first live dispatch, scheduled this session on the C2/C3 drafts before they apply. The deviation from apex-skill-author's literal "no exceptions" wording is surfaced to the user in the sign-off digest — not silently baked.
- 500-line cap. Verified budget: 1a replaces 2 lines with 6 (+4) · `sources:` (+1) · 1b 5→3 (−2) · 1c 4→3 (−1) · 1d 4→2 (−2) → **net 0, file stays at 500**.

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-032-gpt56-role-split.md | already written |
| History | ~/apex/SKILL-HISTORY.md | Task 3 |

## Acceptance Criteria
- [ ] SKILL.md edited → verify: `grep -n "sol-plan-check" ~/.claude/skills/apex-plan/SKILL.md` hits the flow line; `grep -n "ADR-032" ~/.claude/skills/apex-plan/SKILL.md` hits in `sources:` and the flow line; the string "second backend" no longer appears; `wc -l` ≤ 500; frontmatter `version: 1.32.0`.
- [ ] Reference created → verify: `grep -n "## The cold read\|## Tier 1 deliberation\|DISPUTED" ~/.claude/skills/apex-plan/references/sol-plan-check.md` all hit; the dispatch command includes `--sandbox read-only`, `-m gpt-5.6-sol`, and the codex-review-schema path.
- [ ] History row prepended → verify: `head -8 ~/apex/SKILL-HISTORY.md` shows the apex-plan 1.32.0 row on top.

## Progress
_(Coding mode writes here — do not edit manually)_
