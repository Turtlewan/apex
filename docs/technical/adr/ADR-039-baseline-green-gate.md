# ADR-039: The baseline-green rule becomes a mechanism (M2)

**Date:** 2026-07-15
**Status:** Accepted
**Related:** ADR-031/037 (AGENTS.md is the verify recipe's home), reconciliation-pass.md (the finding), M1 (encoding gate — the same "prose → mechanism" move)

## Context

Every APEX consumer repo's `AGENTS.md` carried, in prose, the rule *"the host dispatches on a green
baseline… never build on red"* (e.g. `~/artemis/AGENTS.md` lines 55-56). It was self-checked by the
model, and it failed from both ends — twice each, per the reconciliation pass:

- **Before dispatch:** a build launched into an already-red tree. Codex is scope-locked and cannot fix
  pre-existing drift, so it either refuses or produces a file-scoped "green" over a red baseline.
- **Before commit:** Codex's file-scoped verify recipe reports green while the *whole-project* mypy is
  red (memory `host-verify-full-mypy`). That red baseline is then committed — and makes the *next*
  dispatch refuse to build.

The reconciliation pass's one finding is that **a memory is not a mechanism**: the lessons that stopped
recurring are exactly the ones that got a hook or a script; every lesson still recurring only ever got
a paragraph. This rule only ever got a paragraph.

## Decision

Enforce it with a script and a git hook that both read the **same** source of truth — the repo's
`AGENTS.md → ## Verify commands`:

- **`apex-baseline-check.ps1`** parses the recipe (one heading regex, no second copy) and runs it.
  `-Preflight` = the fast subset (sync + lint + whole-project typecheck, skipping the test runner);
  `-Full` = the whole quad.
- **Pre-dispatch:** `codex-dispatch.ps1` runs `-Preflight` before a *build* launch (never
  review/read-only/adopt, gated on the existing `$Sandbox` signal) and refuses on red **or** an
  unparseable recipe with a new **exit 72**. `-SkipBaselineCheck` is the deliberate escape for a
  dispatch whose prompt pre-authorises fixing a red baseline.
- **Pre-commit:** a git `pre-commit` hook runs `-Full` against the **staged** snapshot and blocks the
  commit on red. A forgetful host cannot skip it (bypass is the explicit `git commit --no-verify`).

Fail closed throughout (M1's lesson): a missing helper or a present-but-unparseable recipe is an error,
never a silent pass; a genuinely absent recipe is a *logged* skip.

## Consequences

- The two ends the memory names are now closed by machine, and the corresponding memories can be
  retired once this ships (they join the six already mechanised by the session-71 rebuild).
- Pre-dispatch adds seconds (lint + mypy) to each build launch; the ~600-test suite is paid once at
  pre-commit, not × N worktrees per wave.
- The pre-commit hook is per-repo: built and proven against Artemis's real recipe here; installing it
  into a consumer repo is a separate, explicit host step.
- Split precedent stands: the recipe's home remains AGENTS.md (ADR-037); this ADR only records that the
  *enforcement* of the baseline rule moved from prose to a wired mechanism.
