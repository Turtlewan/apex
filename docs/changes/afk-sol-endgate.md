---
spec: afk-sol-endgate
status: ready
token_profile: balanced
autonomy_level: L2
coder_effort: high
---

# Spec: Standing end-of-run Sol adversarial pass (A1)

**Identity:** Make a `gpt-5.6-sol` read-only adversarial cross-check over the full AFK-run diff a mandatory last step before the handoff (owner-ratified standing spend), landing its findings in the handoff.
→ why: see docs/technical/adr/ADR-033 (A1) + docs/findings/artemis-run-retro-cadence-gaps-2026-07-12.md § A1

## Intent
- **Intent:** With no human watching an AFK run, replace the owner's ad-hoc end-of-run Sol pass with a standing one: read the whole run diff, surface the P1-class bugs green gates miss, and route them to the handoff for morning triage.
- **Invariants:** (1) Every AFK build (not Edit Mode) runs the Sol adversarial pass as the last post-build step, before the handoff is written. (2) It runs read-only, schema-constrained, effort max, over `git diff <run-base-sha>..HEAD` (the whole run, not one task). (3) It NEVER auto-edits or auto-fixes — findings are advisory; the host triages P1/P2 (fix or park) and parks the rest. (4) The findings table lands in the handoff.
- **Non-goals:** the permission gate, the dispatcher, the per-diff regression checklist (A2, separate spec — this is a *fresh adversarial read*, complementary to the checklist). Not wired into Edit Mode (owner present there).

## Assumptions
- apex-code § Post-build steps (SKILL.md ~L398) is the AFK post-build sequence; the Sol pass inserts before the docs-technical-agent handoff step. → impact: Stop (exact insertion point).
- The codex-review invocation pattern (SKILL.md ~L415: `printf '%s' "..." | codex exec -c approval_policy=never --sandbox read-only --output-schema <schema> -o <out> -m ...`) is the reusable template; swap model → `gpt-5.6-sol`, effort max. → impact: Caution.
- `apex-code/SKILL.md` is at **500/500 — the hard cap** (verified 2026-07-12). The § AFK Build Mode + § Post-build touches must be **net-line-neutral**: keep the step to tight pointers into `references/afk-sol-endgate.md` and offset with trims elsewhere so the file stays ≤500. → impact: Stop.
- apex-handoff owns the handoff contract; adding a findings element is its edit. → impact: Caution.
- The run base SHA is recoverable (the build records its starting SHA — the A4 ledger carries `base_sha`, or apex-code notes it at build start). → impact: Caution (if A4 not yet built, capture the base SHA at build start in apex-code).

Simplicity check: considered folding A1 into the existing `cross_model_review` post-build step — rejected: that is per-task, same-vs-different-family, and opt-in; A1 is a whole-run adversarial read that must be standing for AFK. Distinct trigger, distinct scope.

## Prerequisites
- `afk-durable-dispatcher` (shares `apex-code/SKILL.md`; append after it — build order afk-permission-mode → afk-durable-dispatcher → afk-sol-endgate → cadence-regression-lenses). Uses the A4 ledger's `base_sha` if present.

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-code\SKILL.md` | modify | § AFK Build Mode: record run-base-SHA at start; § Post-build steps: insert the Sol adversarial pass before the handoff step |
| `C:\Users\User\.claude\skills\apex-code\references\afk-sol-endgate.md` | create | Invocation + schema + triage rules for the pass |
| `C:\Users\User\.claude\skills\apex-code\references\afk-sol-endgate-schema.json` | create | Output schema `{findings:[{severity,issue,file,why}], verdict}` |
| `C:\Users\User\.claude\skills\apex-handoff\SKILL.md` | modify | Add the AFK Sol-pass findings table as a handoff element (under Blocked/What's-Next per the 4-section contract) |
| `C:\Users\User\.claude\skills\apex-governance\SKILL.md` | modify | § Build Mode (AFK): one line — AFK builds end with the mandatory standing Sol adversarial pass (owner-ratified spend) |
| `C:\Users\User\apex\SKILL-HISTORY.md` | modify | Prepend rows (apex-code + apex-handoff + apex-governance) |

## Tasks
- [ ] Task 1: The pass reference + schema — files: `references/afk-sol-endgate.md` (create), `references/afk-sol-endgate-schema.json` (create) — content: the exact invocation (`git diff <base>..HEAD | ` fed as the diff; `codex exec -c approval_policy=never --sandbox read-only --output-schema afk-sol-endgate-schema.json -o <out> -m gpt-5.6-sol -c model_reasoning_effort=max`), the adversarial prompt (focus: temporal/async behavior, source-to-sink provenance, program-intent regressions — the classes green gates miss), and the triage rule (P1 fix-before-handoff, P2 park with a flag, rest park). Schema = `{findings:[{severity:"P1"|"P2"|"note", issue, file, why}], verdict}`. done when: both files exist; the schema is valid JSON (`node -e "JSON.parse(...)"`).
- [ ] Task 2: Wire into apex-code — files: `apex-code/SKILL.md` (modify) — § AFK Build Mode: at build start capture `run_base_sha` (from the A4 ledger if present, else `git rev-parse HEAD`); § Post-build steps: add a numbered step BEFORE the docs-technical-agent handoff step — "AFK only: run the standing Sol adversarial pass (references/afk-sol-endgate.md) over `run_base_sha..HEAD`; triage P1/P2; pass the findings table to the handoff." done when: both edits present; `grep -c afk-sol-endgate apex-code/SKILL.md` ≥ 1; SKILL.md ≤ 500 lines.
- [ ] Task 3: Handoff + governance — files: `apex-handoff/SKILL.md` (add the Sol-pass findings table to the handoff contract — a labeled block the docs-technical-agent fills for AFK runs), `apex-governance/SKILL.md` (§ Build Mode AFK: one line on the mandatory standing pass) — done when: both mention the standing Sol adversarial pass; neither exceeds its cap.
- [ ] Task 4: History — files: `SKILL-HISTORY.md` (prepend rows for the three skills) — done when: rows present.

## Wave plan
Wave 1: [Task 1] | Wave 2: [Task 2, Task 3] | Wave 3: [Task 4]

## Permissions
### File Operations
| Action | Paths |
|--------|-------|
| Create | `...\apex-code\references\afk-sol-endgate.md`, `...\afk-sol-endgate-schema.json` |
| Modify | `...\apex-code\SKILL.md`, `...\apex-handoff\SKILL.md`, `...\apex-governance\SKILL.md`, `SKILL-HISTORY.md` |

### Commands
| Command | Purpose |
|---------|---------|
| `node -e "JSON.parse(...)"` | validate the schema |
| `git diff <base>..HEAD \| codex exec ... -m gpt-5.6-sol` | the pass itself (verified at first real AFK build) |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | the files by name (`~/.claude` via `git add -f`) |
| `git commit` | "feat: standing end-of-run Sol adversarial pass for AFK builds (A1, ADR-033)" |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | codex uses existing ChatGPT auth |

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Reference | afk-sol-endgate.md + schema | create |
| History | SKILL-HISTORY.md | rows |

## Acceptance Criteria
- [ ] Pass reference + valid schema → verify: both files exist; `node -e "JSON.parse(require('fs').readFileSync('.../afk-sol-endgate-schema.json'))"` exits 0.
- [ ] apex-code wired, base-SHA captured, insertion before handoff → verify: `grep -n afk-sol-endgate apex-code/SKILL.md` shows the step is numbered before the docs-technical-agent step; `grep -c run_base_sha apex-code/SKILL.md` ≥ 1.
- [ ] Handoff + governance updated → verify: `grep -il "sol adversarial\|end-of-run sol" apex-handoff/SKILL.md apex-governance/SKILL.md` returns both.
- [ ] Caps held → verify: `wc -l` on apex-code/apex-handoff/apex-governance SKILL.md each ≤ 500.
- [ ] History rows present.

## Progress
_(Coding mode writes here — do not edit manually)_
