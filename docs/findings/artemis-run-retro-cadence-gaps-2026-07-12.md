# APEX cadence gaps surfaced by the Artemis 2026-07-11→12 run retro

_Source: an Opus×Sol retrospective on Artemis's long overnight PW build run
(`artemis/docs/findings/run-retro-2026-07-12.md`). The run shipped 20+ commits, all gates green,
yet a later ad-hoc Sol pass found ~14 issues incl. 3 P1 safety bugs that had already reached commit.
The **product** fixes are Artemis's problem; the four items below are **APEX-cadence** gaps — the
build machinery let those bugs through. Backlog only — handle in a separate APEX planning/coding pass._

## The core lesson

The per-spec coding cadence (freshness re-verify → codex build → full mypy/pytest/vitest → commit)
has **no adversarial step**. Reviews and gates check signatures, final content, and green completion
— they are blind to temporal behavior, source-to-sink data provenance, and program-level intent. On
this run the *only* thing that caught 3 P1s was the owner happening to order a Sol pass at the end.
Worse: an unshielded-await cancellation bug fixed on 2026-07-10 **came back** in new code this run,
because that fix was a one-time audit, not a standing review lens.

## Backlog items

### A1 — Make the end-of-run Sol adversarial pass a STANDING gate (P1, owner-gated)
Add a mandatory `gpt-5.6-sol` read-only cross-check over the run's full diff as the last step of an
AFK build run (before the handoff), not an owner-ordered extra. Output = a findings table; host
triages, fixes P1/P2, parks the rest. Cost: codex quota per run — **owner must ratify** (it's a
standing spend). Home: a new step in `apex-code`'s end-of-run cadence + the handoff contract.

### A2 — Codex diff-review checklist for silent-regression classes (P1)
Codify the classes tests can't catch, so they don't depend on host vigilance. Each host-caught
gotcha becomes a checklist line, applied at integration on every codex diff:
- **await-before-first-yield** in any SSE/async generator = a live-streaming regression.
- **unshielded `create_task` + `await`** forwards cancellation (the recurring 07-10 → 07-12 class).
- **provider/adapter return types that drop metadata** a safety counter depends on (verify the
  *source* of a safety value, not just the consumer).
- **optimistic re-entry guards** must register synchronously *before* the first await.
Home: `apex-code`'s build brief / `impl.md`. Turn each into a standing lens, not a one-time audit.

### A3 — "Invariant freshness" in the pre-build re-verify step (P2)
Today freshness re-checks file/line anchors; it does not re-check whether a spec's *behavioral
contract* still matches the current program. A stale UX lockout survived review this run and defeated
the program's own goal. Add: any spec drafted before a program shift must list *superseded
invariants* and trace every UX lockout to the current ADR before build. Home: `apex-code` /
`apex-plan` pre-flight.

### A4 — One durable codex dispatcher (P2)
Replace ad-hoc `codex exec` launches with a single wrapper that: always closes stdin (`< /dev/null`
— the 40-min stdin-wedge bit again despite being a known memory), records PID/worktree/spec/base-SHA/
phase to a durable run ledger, watchdogs a bounded no-output interval, and supports idempotent
resume/adopt (the session crash mid-run this time was recovered only by hand-adopting the orphan's
diff). Home: build-orchestration tooling under `~/.claude` + `apex-code` dispatch.

## Not APEX (tracked separately, being hardened in Artemis)
Durable at-most-once build/resume claim, async-hygiene batch (shield/cancel-and-await), server-side
work-list pagination — these are Artemis product code; drafting + building under the Artemis project.
