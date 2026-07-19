# ADR-045: The four-role split — host reasons/plans, workers build

**Date:** 2026-07-19 _(records a decision made 2026-07-16; back-filled — the split had lived only in `~/.claude/CLAUDE.md` and memory)_
**Status:** Accepted
**Supersedes:** [ADR-035](./ADR-035-host-direct-build.md) (host-direct build)
**Related:** [ADR-038](./ADR-038-single-session.md) (one session, no modes), [ADR-032](./ADR-032-gpt56-role-split.md) / [ADR-034](./ADR-034-sol-default-coder.md) (GPT-5.6 role split + cross-family review), [ADR-027](./ADR-027-codex-primary-opus-fallback-deepseek-archived.md) (Codex-primary)

## Context

[ADR-038](./ADR-038-single-session.md) collapsed the planning/coding *mode* split into one session:
there are no modes, no `APEX_MODE`, no backend swap, and no write-guard. But "one session" left an
open question ADR-038 did not settle — **within that session, who does what?** ADR-035 had answered
it one way: the planning host may build the queue *itself*, writing every file with its own tools.
That worked only because of two APEX-repo-specific conditions (a write-guard exemption for
`~/.claude`, and no build step to iterate against), and ADR-035 itself flagged the standing bias —
the host systematically misprices host-direct because it feels dispatch's costs and is blind to its
own context decay and scarce-pool depletion.

On 2026-07-16 the user resolved this structurally: *"Fable reasons, plans, and challenges — it makes
no mechanical edits and writes no code."* That decision has governed every session since, but it was
recorded only in `~/.claude/CLAUDE.md` and memory — the strongest current role rule in the system had
**no ADR of its own**. This ADR back-fills it.

## Decision

**Work is divided into four roles. The host reasons; workers build.**

| Role | Who | Does |
|------|-----|------|
| **Host** | this session (Fable) | Reasons, plans, challenges. Dispatches every worker below. Makes **no mechanical edits and writes no code**. Owns the project's state-keeping. |
| **Spec author** | a `model: opus` worker | Drafts specs and ADRs from the host's plan. |
| **Build orchestrator** | a `model: sonnet` worker | Runs build waves, dispatches coders, routes exit codes. |
| **Coder** | Codex `gpt-5.6-sol`, per-task `codex exec` subprocess | Writes the code. Falls back to a fresh `model: opus` worker on Codex quota-out. |

**Review is cross-family, both directions** ([ADR-032](./ADR-032-gpt56-role-split.md) /
[ADR-034](./ADR-034-sol-default-coder.md) lineage): Codex checks the host's plans and specs before
execution; Claude reviews Codex's code. An agent never reviews its own output.

**Host bookkeeping writes are NOT "mechanical edits."** The prohibition is on the host doing *build
work* — writing product code, applying formulaic multi-file edits, executing a spec. Writing
`docs/status.md`, the handoff doc, `docs/technical/harness-known-limits.md`, ADR back-fills, and
memory is the host's **state-keeping duty**, not coding, and remains the host's job. (The host still
must not write to a tree while a pinned read-only gate is open on it — a separate ordering rule.)

## Consequences

**Good**
- Removes the ADR-035 bias by construction: the host can no longer choose the "smoother" host-direct
  path because it is no longer a path. Author and reviewer never collapse into one context.
- Scarce-pool discipline holds: mechanical build work goes to Codex (its own quota) or to worker
  models, never to the host's Max-pool context by default.
- The strongest role rule now has a durable home (an ADR), not just CLAUDE.md and memory.

**Bad / accepted**
- More dispatch overhead for small jobs the host *could* have done in-context. Accepted: ADR-035's
  own RED-baseline evidence showed the host misprices exactly this trade, so removing the host's
  discretion is the point.
- Trivially small edits still route through a worker or the coder. The friction is deliberate.

**Neutral**
- ADR-035 is superseded, not deleted — its analysis of context decay and the self-serving bias is
  the *why* behind this ADR and remains worth reading.
