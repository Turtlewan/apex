# ADR-040: The pre-dispatch baseline pre-flight (M2b) and the deterministic spec validator (M3)

**Date:** 2026-07-16
**Status:** Accepted
**Refines:** ADR-039 (baseline-green gate — supersedes its `-Preflight = fast subset` mechanism detail)
**Related:** ADR-015 (dispatch contracts), ADR-028/029 (wave/cross-spec dispatch), reconciliation-pass.md § M2b/M3, apex-v2-joint-audit-2026-07-15.md (findings #4, #5)

## Context

ADR-039 named M2 in two halves. **M2a** (the pre-commit hook) shipped. **M2b** — the pre-dispatch
baseline pre-flight — was deferred, and the joint audit (#5) confirms the hole: the wrapper still
never calls `apex-baseline-check.ps1`, so a coder can be launched against a red baseline it is
scope-locked from fixing (recurred 2× per side). The audit also found the built half not portable —
every recipe line ran through `cmd.exe`, false-reddening the bash recipes APEX's own repos carry —
and that a missing `AGENTS.md`/heading returned **green**, silently disarming the gate.

Audit #4 is the adjacent finding: the readiness gate is ten model-self-checked checkboxes,
structurally identical to "always dispatch through the wrapper" (which failed 3× until a hook made
it impossible). Files-to-Change completeness alone has bitten 3×+ and surfaces later as an
expensive exit-65. M3 is the deterministic validator that closes it.

Sol's read-only audit added four BLOCKs on any naive pre-flight wiring: a refusal must leave no
phantom ledger row; the tree the gate checked must be the tree the coder gets; `&&` in a recipe line
must be honoured by the executing shell, not split by the checker; and no `-DetectOnly` mode may
exist for a circular self-call to reach.

## Decision

**1. Shell-aware recipe execution (was cmd.exe-only).** `apex-baseline-check.ps1` reads the opening
code-fence's info string and dispatches per declared shell: ` ```bash `/` ```sh ` → Git-for-Windows
`bash -lc`; ` ```powershell `/` ```pwsh ` → `powershell.exe -NoProfile -Command`; ` ```cmd `/` ```bat `
or **no tag** → `cmd.exe /c` (back-compat, unchanged). `&&` is left to the executing shell — the
checker never splits a line — which satisfies Sol's `&&`-aware BLOCK *by construction*. An
unresolvable `bash.exe` (absent from PATH and from the `git --exec-path` sibling) is a fail-closed
UNPARSEABLE (exit 3), never a silent skip.

**2. `NO_RECIPE` is a distinct fail-closed result (exit 4), not silent green.** Both prior
green-on-absence paths (no `AGENTS.md`; no `## Verify commands` heading) now return exit 4.
`apex-baseline-check.ps1` no longer decides policy on absence — *consumers* do: the commit hook and
the installer may treat it as they see fit, and M2b's pre-flight treats it as a refusal. This closes
the "delete `AGENTS.md` after hook install and the gate reads green" disarm.

**3. `-Preflight` selects a dedicated block or the full recipe — never a heuristic subset.** It runs
an optional `## Preflight commands` block when present; when that heading is absent it runs the FULL
`## Verify commands` recipe (slower but sound). A present-but-empty `## Preflight commands` block is
UNPARSEABLE (exit 3), not a silent fall-through. This **refines ADR-039**, whose "`-Preflight` = the
fast subset (sync + lint + typecheck, skipping the test runner)" is withdrawn: a checker-chosen
subset is a heuristic the harness cannot verify is sound, so the fast path is opt-in *recipe* content
(a repo declares its own cheap block) rather than machine guesswork. Both modes share the one parser.

**4. Pre-flight placement splits the two refusal moments (Sol BLOCKs 1–4).** In `codex-dispatch.ps1`
the gate runs ONLY for `-Phase build` with `-Sandbox workspace-write` (review/read-only dispatches
skip, logged). The baseline + spec checks run **before** the ledger row is reserved: a red /
UNPARSEABLE / NO_RECIPE baseline, or a validator FAIL, is a new **exit 72 = "refused: red baseline"**,
and because no row exists yet there is nothing to update — the wrapper prints a one-line refusal
record with the failing evidence and no ledger row or dispatch log is created. The tree is **pinned**
early (before reservation, with a per-invocation label) but the **pin is verified at the launch
boundary** — the last moment before the child process starts, after the reservation and the scope
snapshot — so "the tree the gate verified is the tree the coder receives" holds at the instant of
launch, not merely at pre-flight time. A tree that moved by then is the standard moved-tree refusal
(**exit 69**); the row exists at that point, so it is updated to `failed`/`tree-moved`. The pin's
arm→launch span is wrapped in try/finally, so the pin file is deleted on every exit path (72, 69, the
pre-existing shared-worktree refusal 71, or a clean pass). **No `-DetectOnly` mode exists** — there is
nothing for a circular call to reach (Sol BLOCK 4).

**5. Explicit escapes only.** `-SkipBaselineCheck` on the wrapper is the deliberate bootstrap /
emergency bypass. It is one escape for the **whole pre-flight**: it bypasses BOTH the baseline gate
AND the dispatch-side spec-validator backstop (there is no way to skip one without the other). It is
printed loudly and carried into the ledger row's `baseline_skipped` metadata once the row exists.
`install-baseline-hook.ps1` refuses to install into a repo whose baseline check returns NO_RECIPE
(bootstrap = write the recipe first).

**6. The spec validator is plan-side authoritative, dispatch-side best-effort (M3, audit #4).**
`apex-spec-validate.ps1` runs four deterministic checks (files-completeness, no-unresolved-markers,
task↔criterion coverage, structure) and is the mechanical core of the readiness gate at
draft→changes promotion — a FAIL blocks promotion. The dispatch pre-flight *also* runs it, but only
when it can resolve `docs/changes/<Spec>.md` under `-Worktree`; cross-tree specs (this build's own
spec lives in `~/apex` while it dispatches into `~/.claude`) are normal, so an unresolved spec is a
logged skip, not a refusal. The plan side is the authority; the dispatch side is a backstop that
never blocks a legitimate cross-tree build.

## Consequences

- The pre-dispatch half of the baseline rule is now a mechanism, closing audit #5 and finishing the
  M2 pair ADR-039 opened. The corresponding memories can retire once this ships.
- Every APEX repo's own bash verify recipe now runs under bash, not `cmd.exe` — the false-red on the
  system's own trees is gone.
- The readiness gate keeps its prose *judgment* items but its mechanical core is now a script run at
  two points (promotion, dispatch), matching the audit's "run at draft→changes and again before
  dispatch."
- ADR-039's `-Preflight` wording is withdrawn; readers should treat this ADR as the current
  definition of pre-flight recipe selection.
- Pre-flight adds a tree-pin + a recipe run (seconds, on a repo whose recipe is cheap or which
  declares a `## Preflight commands` block) to each build launch; the full test suite is still paid
  once at the commit boundary (M2a), not × N worktrees per wave.
