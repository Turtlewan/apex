---
spec: cadence-regression-lenses
status: ready
token_profile: balanced
autonomy_level: L2
coder_effort: high
---

# Spec: Silent-regression review lenses (A2) + invariant freshness (A3)

**Identity:** Codify the bug classes tests can't catch as a standing per-diff review lens (A2), and add a behavioral-invariant freshness check to pre-build re-verify (A3) — so unattended cadence doesn't depend on host vigilance.
→ why: see docs/technical/adr/ADR-033 (A2/A3) + docs/findings/artemis-run-retro-cadence-gaps-2026-07-12.md § A2/A3

## Intent
- **Intent:** Turn the host-caught silent-regression classes into a standing lens applied at every codex-diff integration, and make pre-build re-verify catch a spec whose *behavioral contract* went stale after a program shift.
- **Invariants:** (1) A2 — a named lens (await-before-first-yield · unshielded `create_task`+await · adapter/provider return types that drop safety metadata · optimistic re-entry guard registered after the first await) is applied to every codex diff at integration/review, independent of host vigilance. (2) A3 — pre-build re-verify checks not just file/line anchors but whether the spec's behavioral invariants still match the current program; a spec drafted before a program shift lists superseded invariants and traces any UX lockout to the current ADR before build.
- **Non-goals:** the permission gate, dispatcher, or the whole-run Sol pass (A1). A2 is a *fixed checklist* (complements A1's fresh adversarial read); it does not add a model call.

## Assumptions
- apex-code has **no** `impl.md` (verified 2026-07-12 — apex-code IS the workflow skill). A2 therefore homes in a NEW references file `apex-code/references/silent-regression-lenses.md`, pointed from `references/codex-review.md` (the diff-review reference the reviewer already loads), NOT a new impl.md. → impact: Stop (corrected home).
- `apex-code/SKILL.md` is at **500/500 — the hard cap** (verified 2026-07-12). A3's pre-flight addition must be **net-line-neutral**: tighten an adjacent line in § Karpathy Pre-Flight to offset the new step so the file stays ≤500. → impact: Stop.
- apex-code § Karpathy Pre-Flight (SKILL.md ~L70-104) is where A3 attaches. → impact: Stop (insertion point).

Simplicity check: considered one merged section — rejected: A2 is diff-review content (a reference the reviewer loads at integration) and A3 is pre-flight (SKILL.md, before build); different files, different load points. Kept as one spec (same retro) but two tasks.

## Prerequisites
- `afk-sol-endgate` (shares `apex-code/SKILL.md`; append after it — last in the chain afk-permission-mode → afk-durable-dispatcher → afk-sol-endgate → cadence-regression-lenses).

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-code\references\silent-regression-lenses.md` | create | The four silent-regression classes (A2) as an integration-time checklist |
| `C:\Users\User\.claude\skills\apex-code\references\codex-review.md` | modify | Add a one-line pointer: apply the silent-regression lenses to every codex diff at integration |
| `C:\Users\User\.claude\skills\apex-code\SKILL.md` | modify | § Karpathy Pre-Flight: add step 6e invariant-freshness (A3) — **net-line-neutral**, ≤500 |
| `C:\Users\User\apex\SKILL-HISTORY.md` | modify | Prepend rows |

## Tasks
- [x] Task 1: A2 — silent-regression lens — files: `apex-code/references/silent-regression-lenses.md` (create), `apex-code/references/codex-review.md` (modify) — the reference lists the four classes, each one-line detect→why applied to every codex diff at integration: **await-before-first-yield** in an SSE/async generator = live-streaming regression; **unshielded `create_task` + `await`** forwards cancellation (shield detached tasks); **provider/adapter return types that drop metadata a safety counter depends on** (verify the source of a safety value, not just the consumer); **optimistic re-entry guards** must register synchronously before the first await. Then add a one-line pointer in `codex-review.md` so the diff-review applies them. done when: the reference exists with all four classes and `codex-review.md` points to it.
- [x] Task 2: A3 — invariant freshness in pre-flight — files: `apex-code/SKILL.md` (modify § Karpathy Pre-Flight) — add step 6e: "Invariant freshness — if the spec predates a program/ADR shift, verify its `## Intent` invariants still hold against the current program; trace any UX lockout/gating it asserts to the current ADR before building. Contradiction → treat like a wrong `Stop` assumption (halt, flag)." **SKILL.md is at 500/500 — make this net-neutral: tighten an adjacent pre-flight line to offset the addition.** done when: step 6e present; `grep -ci "invariant freshness" apex-code/SKILL.md` ≥ 1; `wc -l apex-code/SKILL.md` ≤ 500.
- [x] Task 3: History — files: `SKILL-HISTORY.md` (prepend rows: A2 silent-regression lenses reference; A3 invariant-freshness pre-flight) — done when: rows present.

## Wave plan
Wave 1: [Task 1, Task 2] | Wave 2: [Task 3]
<!-- Tasks 1 (references) and 2 (SKILL.md) touch different files → parallel; Task 3 after. -->

## Permissions
### File Operations
| Action | Paths |
|--------|-------|
| Modify | `...\apex-code\impl.md`, `...\apex-code\SKILL.md`, `SKILL-HISTORY.md` |

### Commands
| Command | Purpose |
|---------|---------|
| `grep`, `wc -l` | acceptance checks |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | the files by name (`~/.claude` via `git add -f`) |
| `git commit` | "feat: silent-regression review lenses (A2) + invariant freshness (A3) (ADR-033)" |

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| History | SKILL-HISTORY.md | rows |

## Acceptance Criteria
- [x] A2 reference present + wired → verify: `apex-code/references/silent-regression-lenses.md` exists with all four classes named, and `grep -l silent-regression apex-code/references/codex-review.md` matches (the pointer).
- [x] A3 step present + cap held → verify: `grep -in "invariant freshness" apex-code/SKILL.md` matches inside § Karpathy Pre-Flight, and `wc -l apex-code/SKILL.md` ≤ 500 (exactly 500, net-neutral edit).
- [x] History rows present.

## Progress
_(Coding mode writes here — do not edit manually)_
