# ADR-045: The four-role split — host reasons/plans, workers build

**Date:** 2026-07-19 _(records a decision made 2026-07-16; back-filled — the split had lived only in `~/.claude/CLAUDE.md` and memory)_
**Status:** Accepted
**Amended:** 2026-07-29 — see [ADR-046](./ADR-046-doctrine-audit-resolutions.md) (D1); 2026-08-02 -- v1 activation, close-out narrowed (ADR-046 D1 V1-PARTIAL); 2026-10-01 -- [ADR-048](./ADR-048-role-redesign.md): host is Opus 5.5, spec author is gpt-6-sol via the wrapper's `-AuthorSpec`, build orchestrator is Opus 5.5 (the Host / Spec author / Build orchestrator cells below are historical)
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
| **Build orchestrator** | a `model: opus` worker (Opus 5) | Runs build waves, dispatches coders, routes exit codes. Owner amendment 2026-07-29; as drafted this row said Sonnet. |
| **Coder** | Codex `gpt-5.6-sol`, per-task `codex exec` subprocess | Writes the code. Falls back to a fresh `model: sonnet` worker (Sonnet 5 — see [ADR-046](./ADR-046-doctrine-audit-resolutions.md)) on Codex quota-out — amended same-day by session-66 A1 (user-ratified 2026-07-19); as drafted this row said Opus. |

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

## Amendment — 2026-07-29: build-dispatch ownership (D1)

The **Build orchestrator** row owns task selection, sequencing, routing, verification adjudication,
retries, and close-out, exclusively.

**[CLOSE-OUT NARROWED (v1 activation), 2026-08-02: in v1 CLOSE-OUT -- reviewer chain, docs agents,
family gate, spec archival -- is HOST-executed per `~/.claude/skills/apex-code/SKILL.md` § Post-build
and is not in the agent's protocol; the word "close-out" in this clause is superseded to that
extent, and v2 may restore it. See ADR-046 § D1 V1-PARTIAL.]**

The **host's** role in a build is *mechanics only*: launching
and monitoring background subprocesses **strictly from the orchestrator's wave plan**; **executing
the verify recipe, the per-task worktree commits, the path-scoped integration, and the
user-approved per-spec commit exactly as directed**; and returning status and exit codes. The host
never chooses which task runs, never re-routes a failure, and never adjudicates a verify result.

The orchestrator's agent contract shipped as `~/.claude/agents/apex-build-orchestrator.md`: on an
ATTENDED build it performs those ownership duties for the BUILD PHASE, and the host remains
executor for CLOSE-OUT on every build and for UNATTENDED (AFK) builds (ADR-046 § D1 V1-PARTIAL).
`references/parallel-codex.md`'s "the host runs them as concurrent subprocesses" describes exactly
that mechanic and is not a competing dispatcher.

*Ratified 2026-07-29; Sol deliberation run `0e7d2938` (option A accepted, with this tightening).
Recorded in [ADR-046](./ADR-046-doctrine-audit-resolutions.md).*

## Amendment — 2026-07-29: build orchestrator model (owner decision)

The **Build orchestrator** row changes from a `model: sonnet` worker to **Opus 5** — a
`model: opus` worker — decided by the owner in a live attended exchange on 2026-07-29. This applies
**across the board**, not risk-gated: every build wave is orchestrated by Opus 5, not only high-risk
ones.

**Acknowledged trade-off, accepted by the owner:** orchestration now spends the capped Anthropic
weekly pool at Opus rates rather than Sonnet rates; the pool-economics argument that originally put
a Sonnet worker in this role is knowingly set aside in favour of stronger wave-level judgment.
**The fallback CODER is unaffected** — it remains Sonnet 5 (A1, session-79b); this amendment
touches the orchestrator role only.
