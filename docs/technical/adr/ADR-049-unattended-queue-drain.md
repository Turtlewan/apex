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
9. **Close-out.** Close-out stays attended and HOST-run: Critic, family gate and docs per spec, then one whole-queue Opus end-gate, then batched commit approval. *(Amended 2026-10-13, drain-close-out:)* per-spec Scribe does not run for drained specs in v1; a queue-mode Scribe requires a follow-up spec. Close-out documentation comes from the HOST tasks and the apex-docs-technical-agent handoff. The Scribe contract itself is unchanged. The attended sequence is `~/.claude/skills/apex-code/references/drain-close-out.md`, driven by the read-only `apex-drain-close.ps1 -Plan <drain-id>`.

## Consequences

- No Engine edits are needed for sorting: the sorter calls `Get-EnginePlan` directly and mirrors the Engine's capacity probe.
- The drain runs outside Claude Code, so the harness guard and classifier do not cover it. Safety rests on the Engine's scope lock, the critical-file park, tree-pin digests and the fact that the drain branch never touches master. This is why `drain-runner` is risk high.
- Existing specs whose Prerequisites sections are not in the new grammar sort as NEEDS YOU until they are rewritten. That is a safe failure.

## Amendment 2026-10-11: drain-runner architecture pass

The Sol pre-draft architecture pass on `drain-runner` returned 6 BLOCK and 3 FLAG findings. The owner approved the adjudicated plan at the High-risk gate. The Context claim that the Engine "can already target a linked worktree" was wrong: `engine-plan.ps1` refused any `-Repo` that is not string-equal to the manifest repo path, and `engine-git.ps1` validated hand-off paths against the main worktree.

1. **Build order.** A new prerequisite spec, `engine-linked-worktree`, comes first. The Engine accepts `-Repo` as a linked worktree of the manifest repo when both share one git common directory and `-Repo` is a worktree root. Path safety follows the target worktree, not the main one. `drain-runner` is specced only after it ships.
2. **No teardown in the drain.** Engine runs stay up until attended close-out tears them down, so that close-out reviews still bind to the task-worktree digests. The drain never force-deletes anything.
3. **Durable run tracking.** The drain finds its Engine run by scanning the state root for the spec and the drain worktree, not by reading stdout. `-Resume` recovers a run that is live, one that completed but was not committed, and one that was committed but not yet recorded.
4. **Child quiescence.** The next spec starts only after every recorded Codex child of the previous run has exited.
5. **Verify-to-commit identity.** The full verify fence runs on the drain worktree. The tree digest must not change between before the fence and after it. The commit is path-scoped, and its blobs must equal the verified files.
6. **Park recovery.** On any park, every manifest path in the drain worktree is restored to HEAD, and files the spec created are deleted.
7. **Single drain.** Only one drain runs at a time. The worker takes the global lock and confirms it owns the reservation, and a failed launch is reported.

## Amendment 2026-10-12: drain-runner review decisions

The `drain-runner` spec went through three Critic rounds and four Sol cold reads. The owner chose to simplify the design and remove causes instead of adding guards. These are the decisions that review added on top of the architecture pass:

1. **One production state root.** Production uses a single state root: `APEX_STATE_DIR`, or `%LOCALAPPDATA%\apex` when it is unset. `-StateRoot` exists only on the internal worker `-Run`. A state root inside a worktree is refused before any side effect.
2. **Lock and ownership.** A global `drain.lock` with an owner record guards each state root. Each build repo, identified by its git common directory, also gets `apex-drain.lock` and a durable `apex-drain-owner.json` (`state_root`, `drain_id`). The owner record is removed only when the drain completes. A start or `-Resume` scans every reservation for live identities, including ledger rows, before it proceeds. An owner record whose state is missing or unreadable refuses with `build repo owned by unknown drain`.
3. **Quota budget.** The 300-minute quota budget resets on each `-Resume` of a `stopped-quota` drain. The report records each reset.
4. **Spec identity.** The drain uses the Engine's digest algorithm (LF-normalized strict UTF-8). The Engine run's `spec.original_digest` must equal the sorter digest. A spec that changes after sorting parks as `spec-changed` and is never resumed.
5. **Commit integrity.** Each commit is guarded by:
   - assertions on HEAD and the symbolic ref;
   - a pre-commit blob identity check;
   - a residue check on the porcelain status after the fence;
   - a trailer-recognition check on resume, covering the parent, a single parent and the set of diff-tree paths.

   Drain git commands run with hooks disabled and literal pathspecs. A tracked baseline must be clean before each Engine launch. Branches may be adopted only when they are absent from the ref snapshot taken at start. On restart, a live Engine owner is waited on with no cap; the 4 h 15 min quiescence cap applies only to children still alive after the Engine exits.
6. **Accepted limitations.**
   - Fence child processes are not tracked across a worker crash, so `-Resume` re-runs the fence from scratch.
   - Engine runs inherit the build repo's hooks.
   - The wrapper's scope check and tree-pin do not handle non-ASCII or C-quoted paths. Specs touching such paths park rather than build. This is deferred to a separate follow-up spec.
