# ADR-049: Unattended queue drain

**Date:** 2026-10-10
**Status:** Accepted (design). Built in waves: `drain-plan` → `drain-runner` → `drain-close-out`.
**Implements:** [ADR-048](./ADR-048-role-redesign.md) items 43–45 (stage 5, unattended drain).
**Defers:** [ADR-047](./ADR-047-dispatch-receipt-preflight.md). The receipt check becomes its own later spec, not part of the drain.

## Context

One attended Engine run builds one spec. The owner wants an on-demand drain that builds every queued
spec needing no owner input while the owner is away. The owner then closes the work out in one
attended session. The Engine can already target a linked worktree on any branch. It writes a
deterministic `engine-state.json`, uses per-run locks, and re-dispatches a quota-paused task on
`-Resume`. It records no quota reset time and has no plan-only CLI.

## Decision

1. **Trigger.** The owner starts the drain on demand with one `!` command. Nothing is scheduled. The command prints both lists, then detaches, so the build outlives the Claude Code session and its background-shell limits.
2. **Queue.** The queue is a snapshot of the project's top-level `docs/changes/*.md` at invocation. There is no queue file.
3. **Sorting.** A read-only sorter (`apex-drain-plan.ps1`) splits the queue into WILL BUILD (topological order, ordinal ties) and NEEDS YOU, using fixed reason codes: Engine-refused, risk high, hard block, critical file, classifier error, unparseable or missing prerequisites, blocked prerequisite, dependency cycle. WILL BUILD promises the coder tasks only. A spec with HOST/OWNER work cannot satisfy an in-queue dependent. `## Prerequisites` gets a strict machine grammar.
4. **Dependent specs.** These build on a local `codex/drain-<date-time>` branch, one commit per spec, so each spec builds on its prerequisites. The branch is never master and never pushed. At close-out the owner approves the per-spec commits, then master fast-forwards locally.
5. **Failures.** A parked spec skips its dependents and the drain continues. Risk-high and critical-file specs park for an attended build.
6. **Quota.** The drain waits on a fixed backoff schedule and resumes with `-Resume`, for at most 5 hours in total. After that it stops and lists the rest as NEEDS YOU. It never switches models.
7. **Serial specs.** Specs build one at a time, and the existing per-wave parallelism cap still applies.
8. **Reporting.** A report file only, `docs/drain/<drain-id>.md`. There is no notification and no time limit.
9. **Close-out.** Close-out stays attended and HOST-run: Critic, Scribe, family gate and docs per spec, then one whole-queue Opus end-gate, then batched commit approval.

## Consequences

- No Engine edits are needed for sorting: the sorter calls `Get-EnginePlan` directly and mirrors the Engine's capacity probe.
- The drain runs outside Claude Code, so the harness guard and classifier do not cover it. Safety rests on the Engine's scope lock, the critical-file park, tree-pin digests and the fact that the drain branch never touches master. This is why `drain-runner` is risk high.
- Existing specs whose Prerequisites sections are not in the new grammar sort as NEEDS YOU until they are rewritten. That is a safe failure.
