# ADR-041: Wrapper hardening — fail-closed scope lock, blocking cap-guard, multi-root pin

**Date:** 2026-07-17
**Status:** Accepted
**Refines:** ADR-037 (three context files — supersedes its "enforcement is a hook" clause: report-only → blocking deny)
**Related:** ADR-040 (pre-dispatch pre-flight & spec validator), ADR-028 (one worktree per task), ADR-015 (dispatch contracts), apex-v2-joint-audit-2026-07-15.md (findings #6, #8, #9)

## Context

Audit step 2 (ADR-040) closed the M2b/M3 gates. Step 2.5 closes three remaining enforcement holes
the joint audit filed as BLOCK — #6 (scope lock optional by default), #8 (cap-guard advisory while
docs call the caps enforced), #9 (tree-pin covers one root while APEX changes span two).

Two of these are not new mechanisms but **reversals of prior explicit decisions**, so they earn an
ADR rather than a silent code change:

- The wrapper deliberately made `-Authorized` optional-with-warning; #6 shows the warning path is the
  same "prose only" surface that already failed in the field.
- `context-cap-guard.js` was deliberately advisory ("exit 0 always — never wedge a session", ADR-037).
  Making it block reverses that, and the reversal is only safe with a stated no-growth escape.

The #6 "dead wiring" half — the snapshot call omitting `-Authorized` — is already fixed: the wrapper
now passes `-Authorized $Authorized` into the snapshot. Only the fail-closed half remains.

## Decision

**1. Fail-closed scope lock (exit 74), with an explicit `-ScopeUnlocked` escape.** Two refusal kinds,
both **exit 74 = "refused: scope lock"**:

- **Argument-validation refusals** (phase-independent caller errors) — `-ScopeUnlocked` together with a
  non-empty `-Authorized` (mutually exclusive), or `-ScopeUnlocked` without `-ScopeUnlockedReason` —
  fire at the top of the script before any filesystem I/O, in any phase.
- **The no-scope-list refusal** — a `-Phase build` `-Sandbox workspace-write` dispatch with an empty
  `-Authorized` and no `-ScopeUnlocked` — fires after the phase/sandbox force, before the M2b
  pre-flight (scope is checked before baseline). Read-only / review dispatches are **exempt** from this
  one (they legitimately pass no `-Authorized` and are forced read-only upstream), but a contradictory
  or incomplete flag combination is rejected in every phase.

The refusal leaves **no ledger row and no dispatch log for the refused run** (the shared state
directories are created by earlier startup regardless, exactly as with exit 72). The single escape is
`-ScopeUnlocked`, which requires a non-empty `-ScopeUnlockedReason`; an unlocked dispatch proceeds with
the scope lock off and records `scope_unlocked=true` plus the reason in its ledger row. This replaces
the optional-warn default from audit #6.

**2. Cap-guard becomes a blocking PreToolUse gate for the deterministic projection.**
`context-cap-guard.js` moves from PostToolUse-advisory to **PreToolUse-blocking** (matcher `Write|Edit`)
for the three context-file caps. It projects the resulting size deterministically — a Write from its
new content, an Edit from the on-disk size adjusted by `(size(new) − size(old)) × occurrences` — where
the line count is the **newline count** (`wc -l` semantics, matching the repos' own verify recipes) and
otherwise the byte length. It **denies** only when the projection exceeds the cap **and** is **strictly
greater** than the current on-disk size. The **no-growth escape** is load-bearing: any edit that does
not grow the file — equal-size or shrinking — is always allowed, even while still over cap, so an
equal-size fix or a multi-edit cleanup on an already-over-cap file is never wedged; a brand-new over-cap
Write is denied. Non-cap files and unparseable input are allowed (exit 0). This refines ADR-037:
"enforcement is a hook" was true only as a report; it now denies, and the caps are actually enforced.

**3. Multi-root tree-pin.** `tree-pin.ps1` gains an additional-roots parameter so one gate can pin and
verify more than one tree (an APEX change spans `~/apex` and `~/.claude`). `-Pin` fingerprints every
root, writing one pin file per root under the existing SHA-tagged-per-worktree filename scheme;
`-Verify` fails (**exit 69**) if any root moved or its pin file is missing, naming which. A single-root
call is unchanged. This is a capability extension, not a reversal; wiring it into the dispatcher's
cross-tree gate is a later step.

## Consequences

- A workspace-write build can no longer run scope-unenforced by omission; the only unenforced path is
  the loud, reasoned, ledger-recorded `-ScopeUnlocked`.
- The context-file caps hold at write time instead of being noticed after the oversized file lands;
  the one edit that must always pass — the one that does not grow an over-cap file — does.
- Cross-tree review/commit gates can pin both APEX trees at once once the dispatcher opts in.
- Exit 74 joins the wrapper's exit-code contract (authoritative table in `apex-code` SKILL.md).
- **Deferred:** the recurring `~/.claude` exit-65 false positive (a build's scope check flags the live
  session's own runtime-dir churn) is NOT fixed here. It is not one of the audit's BLOCKs, and a sound
  fix is a real scope-check redesign — the right discriminator is the git index / ignore state, not a
  name-plus-untracked heuristic (the `~/.claude` blanket `*` ignore makes session churn *ignored*, not
  merely *untracked*, so a porcelain-`??` test does not even match it). Deferred to round 8; interim,
  the host adjudicates — clearing a 65 whose flagged paths are all session-runtime directories.
- The step-2 (ADR-040) Task-1g adjacency rule retroactively forbids explanatory prose between an
  `AGENTS.md` `## Verify commands` heading and its recipe fence; existing recipes carrying such prose
  must migrate it below the fence (discovered when the live M2b gate refused the first `~/apex`
  dispatch with exit 72 / UNPARSEABLE — a correct gate firing, fixed in this spec's Task 4).
