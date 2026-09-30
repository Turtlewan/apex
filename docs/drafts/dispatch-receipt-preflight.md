---
spec: dispatch-receipt-preflight
status: draft
autonomy_level: L2
cross_model_review: true
coder_effort: high
---

# Spec: Dispatch receipt pre-flight — a build without a current receipt is refused
<!-- Governing contract: references/spec-contract.md -->

**Identity:** Adds `spec-preflight.ps1` (`-Generate` / `-Verify`), its receipt schema, and the
`codex-dispatch.ps1` build-phase gate that refuses any build dispatch whose spec has no current
receipt.
→ why: see docs/technical/adr/ADR-047-dispatch-receipt-preflight.md

**Repo root for every path below:** `C:\Users\User\.claude`. Paths are relative to it, EXCEPT the two
skill-registry files, which live in the separate `C:\users\user\apex` repo and are therefore written
drive-absolute wherever they appear.

## Intent

- **Intent:** A build dispatch re-derives what the spec asserts, at the launch boundary, instead of
  trusting what was recorded when the spec was authored. The bindings live in one immutable receipt
  generated immediately before dispatch; any bound input moving invalidates it and the wrapper
  refuses.
- **Invariants:**
  - **Every refusal is typed and named.** No refusal path returns a generic failure: the operator is
    told which binding moved, from what, to what.
  - **Fail closed.** An unparseable spec, receipt, sidecar row, or probe block is a refusal, never a
    skip and never a pass.
  - **Worktree bytes, not committed bytes.** Cited-file hashing reads the file on disk. No path in
    this spec hashes a commit, a commit range, or `HEAD`.
  - **One repo root binds.** Only paths resolving under the declared build-repo root are bindings.
    A path into another tree (this spec's own ADR references live in the apex repo) is not a binding
    and is never a refusal.
  - **The receipt is immutable.** Nothing writes to it after `-Generate`. First-dispatch state lives
    in the wrapper's own ledger area, never inside the receipt and never inside `docs/changes/`.
  - **The receipt outlives the sidecar.** `-Generate` runs at PROMOTION, while the `.review.log`
    still exists, and projects the terminal adjudicated verdict row into the receipt. Dispatch time
    is `-Verify` only.
  - **Builds are gated; reads are not.** `-Phase build` requires a current receipt, and
    `-SkipReceiptCheck` is its ONLY bypass — `-SkipBaselineCheck` must not disarm it. `-Phase review`
    is untouched.
  - **Additive to the wrapper.** No existing `codex-dispatch.ps1` stdout line changes, moves stream,
    or disappears; no existing exit code changes meaning; the new gate only adds refusals.
  - **The receipt is a projection, never a second source of truth.** Nothing reads a receipt to make
    a decision other than "is this dispatch allowed to launch".
- **Non-goals:** the spec-template and `apex-plan` authoring changes (probe-block authoring format,
  REVIEWED vs ADJUDICATED row types, ceremony-rule enforcement) — follow-up spec
  `receipt-authoring-contract`. The Artemis `AGENTS.md` worktree/import-origin rule — follow-up on
  the Artemis side. Family-pairing enforcement at the commit gate — follow-up wiring into
  `apex-family-gate.ps1`. Migration of Artemis's nine ready specs to receipts — owner decision, open.

## Assumptions

- The wrapper's `-Phase` accepts exactly `build` and `review` (`codex-dispatch.ps1` refuses anything
  else with exit 74), so "plan-check" is not a distinct wrapper phase and the gate is expressed as
  build-phase-only → impact: Stop
- Exit code `84` is unused across the wrapper's contract space
  (`0/1/65/66/67/68/69/71/75/77/78/79/80/81/82/83/124` plus refusals `70/72/73/74/76`) → impact: Stop
- The `refusal` `$def` in `skills/apex-code/references/orchestrator-protocol-schema.json` constrains
  `exit_code` with a closed enum, so a new build-phase-reachable refusal code that is not added to
  that enum emits a schema-INVALID event → impact: Stop
- `apex-spec-validate.ps1` and `apex-baseline-check.ps1` execute their bodies on load (the validator
  reaches a top-level `exit 0`), so their helpers cannot be dot-sourced; equivalent logic is
  reimplemented in the new script rather than imported → impact: Stop
- The `.review.log` sidecar's row shape is `Round | Dispatched (UTC) | Reviewer | Spec digest |
  Verdict | Disposition` (apex-plan SKILL.md § Convergence control), with `pending` and
  `VOID (digest moved)` as known Disposition values → impact: Stop
- **The sidecar is DELETED when a spec promotes to `docs/changes/`** (apex-plan SKILL.md § promotion,
  the host's-pen close-out). Receipt generation therefore happens at promotion, not at dispatch;
  a spec already in `docs/changes/` with no receipt is a legacy spec and needs `-SkipReceiptCheck`
  → impact: Stop
- The pre-flight region is guarded by `if ($Phase -eq 'build' -and $Sandbox -eq 'workspace-write')`,
  and the `-SkipBaselineCheck` branch inside it skips spec-path resolution entirely — so the receipt
  gate must sit outside that whole region and resolve the spec path itself → impact: Stop
- The wrapper resolves a spec as `docs/changes/$Spec.md` under `$Worktree` when that file exists, and
  falls back to `-SpecSourcePath` only when it does not; `-SpecSourcePath` is a fallback, never an
  override → impact: Stop
- Windows PowerShell 5.1 ships no JSON Schema validator, so receipt validation is hand-rolled against
  the schema file rather than executed from it → impact: Stop
- `$apexStateRoot` honours `$env:APEX_STATE_DIR` and `$ledgerDirectory` is its `progress` subfolder,
  so a marker file written there is automatically test-isolated → impact: Caution
- `Exit-Dispatch` emits a refusal event only for codes in an explicit list, and the `refusal` `$def`
  separately constrains which exits carry a null `run_id`; both must admit 84 or no valid exit-84
  event exists → impact: Stop
- No disposition vocabulary is closed today, so the checker defines one and fails closed on anything
  outside it; existing sidecars will not satisfy it until `receipt-authoring-contract` ships →
  impact: Caution
- New files are untracked and do not propagate into a build worktree; the HOST copies
  `skills/apex-code/scripts/spec-preflight.ps1` and
  `skills/apex-code/references/spec-receipt-schema.json` into any worktree that needs them, exactly
  as the wrapper-hygiene and wrapper-follow-ups builds did → impact: Caution

Simplicity check: yes — considered folding the bindings into `apex-spec-validate.ps1` instead of a
new script. Rejected: the validator is a pure single-file shape checker with one exit code, and the
receipt is entirely filesystem and sidecar re-execution; merging them makes the cheap always-run gate
expensive and collapses two refusal vocabularies into one. Also considered splitting the wrapper
wiring into its own spec; rejected because the gate and the checker are one mechanism and a split
would ship a checker nothing calls.

## Prerequisites

- Specs that must be complete first: none (`wrapper-follow-ups` and `orchestrator-activation` are
  integrated)
- Environment setup required: none

## Files to Change

| File | Operation | Notes |
|------|-----------|-------|
| `skills/apex-code/references/spec-receipt-schema.json` | create | Task 1 — receipt shape contract |
| `skills/apex-code/scripts/spec-preflight.ps1` | create | Task 2 — `-Generate` / `-Verify` |
| `skills/apex-code/scripts/spec-preflight-test.ps1` | create | Task 3 — suite, proven-red refusals |
| `skills/apex-code/scripts/codex-dispatch.ps1` | modify | Task 4 — gate, exit 84, `-SkipReceiptCheck` |
| `skills/apex-code/references/orchestrator-protocol-schema.json` | modify | Task 4 — `exit_code` enum gains 84 |
| `skills/apex-code/scripts/dispatch-events-test.ps1` | modify | Task 4 — exit-84 refusal-event case |
| `skills/apex-code/scripts/dispatch-preflight-test.ps1` | modify | Task 4 — real-wrapper exit-84 case; existing fixtures pass `-SkipReceiptCheck` |
| `AGENTS.md` | modify | Task 5 — new suite in `## Verify commands` |
| `skills/apex-code/SKILL.md` | modify | Task 5 — exit-84 row, receipt paragraph, version bump |
| `agents/apex-build-orchestrator.md` | modify | Task 7 — one exit-84 routing row |
| `skills/apex-plan/SKILL.md` | modify | Task 8 — generate the receipt before deleting the sidecar |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | Task 6 — double-write row |
| `C:\users\user\apex\SKILLS.md` | modify | Task 6 — double-write row (conditional) |

## Tasks

- [ ] **Task 1: the receipt schema** — files:
  `skills/apex-code/references/spec-receipt-schema.json` — a JSON Schema
  (`https://json-schema.org/draft/2020-12/schema`, `$id` `apex://spec-receipt-schema`) in the same
  style as the sibling `skills/apex-code/references/orchestrator-protocol-schema.json`:
  `additionalProperties: false`, every field `required`, descriptions that state what the field is
  for. Top-level properties, in this exact order (the order is the serialization contract Task 2
  writes):
  `version` (integer const 1) · `spec_path` (string, repo-relative, forward slashes) ·
  `spec_digest` (string, 40-hex) · `generated_utc` (string) ·
  `cited_files` (array of objects, each `additionalProperties: false` with all three required:
  `path` string repo-relative forward-slash, `digest` string 40-hex, `class` string enum
  `premise`/`files-to-change`; array ordinal-ascending by `path`) ·
  `verdict` (object, NEVER null — a TYPED PROJECTION of the terminal adjudicated sidecar row, which
  outlives the sidecar; `additionalProperties: false`, all five required, in this order: `source`
  string = the sidecar's repo-relative forward-slash path as it existed at promotion (not a row
  cell), `round` integer parsed from the row's `Round` cell, `spec_digest` string 40-hex from
  `Spec digest`, `verdict` string enum `CLEAN`/`FLAG`/`BLOCK` from `Verdict`, `disposition` string
  from `Disposition`; every cell whitespace-trimmed, none re-formatted, and a cell that will not
  parse to its declared type is a refusal, not a coercion) ·
  `probes` (array of objects, each `additionalProperties: false` with all nine required, in this
  order: `label` string, `assert` string enum `exact`/`required-subset`, `shell` string enum
  `bash`/`pwsh`/`cmd`, `command` string, `expected` string or null, `required` array of strings or
  null, `observed` string, `exit_code` integer, `ok` boolean; exactly one of `expected`/`required` is
  non-null, keyed by `assert`; array in spec document order) ·
  `builder_family` (string, may be empty — recorded, not enforced by this spec) ·
  `dispatch_pack_digest` (string, may be empty — recorded, not enforced by this spec).
  — done when: the file parses as JSON and every field above is present, ordered, and constrained.

- [ ] **Task 2: the receipt checker** — files:
  `skills/apex-code/scripts/spec-preflight.ps1` — a Windows PowerShell 5.1 script,
  `[CmdletBinding()]`, parameters `-SpecPath` (mandatory), `-RepoRoot` (mandatory — the BUILD repo
  root, against which cited files resolve), `-SpecRepoRoot` (optional; defaults to `-RepoRoot` — the
  root the SPEC lives under, against which `spec_path`, the sidecar, and the receipt path resolve),
  `-Generate` (switch), `-Verify` (switch), `-ReceiptPath` (optional override; default is the spec
  file's path with `.receipt.json` appended), `-MarkerDirectory` (optional; default
  `$env:APEX_STATE_DIR\progress` falling back to `%LOCALAPPDATA%\apex\progress`), `-BuilderFamily`
  (string, default empty), `-DispatchPackDigest` (string, default empty). Exactly one of `-Generate`
  / `-Verify` — neither or both is a usage refusal. Behaviour:
  - **Header comment block, first thing in the file:** the typed exit-code table, one line each,
    stating that the wrapper maps every non-zero from `-Verify` onto its own exit 84.
  - **Exit codes:** `0` pass · `1` unexpected internal error · `2` stale receipt (`-Verify` found a
    binding that moved) · `3` verdict row VOID (last row's digest ≠ current spec digest) · `4`
    verdict row is a digest-current BLOCK · `5` probe failure (`exact` drift, or a `required-subset`
    member missing) · `6` a cited file is missing or unreadable · `7` unparseable or unrecognised
    input (spec, receipt, sidecar row, probe block, or a disposition outside the closed vocabulary) ·
    `8` usage refusal.
  - **(a) Spec digest:** `git hash-object -- <spec path>` executed with `-SpecRepoRoot` as the
    working directory, NOW. `spec_path` is recorded repo-relative to `-SpecRepoRoot`, forward slashes.
  - **(b) Cited-file fingerprint — two classes, one root.** Scan the spec for repo-relative path
    tokens using the same rule
    `Test-FilePathWord` in `skills/apex-code/scripts/apex-spec-validate.ps1` applies (a token counts
    as a path only when it has a directory component and its basename ends in a 1–5 character
    alphanumeric extension; the `.exe .dll .bat .cmd .com .log .jsonl .lock .tmp` exemptions apply;
    `\` and `/` normalize; matching is case-insensitive). Do NOT dot-source the validator — it
    executes on load. Fenced-block content is excluded, matching the validator.
    **Root rule:** a token binds ONLY when it resolves to an existing file under `-RepoRoot`. A token
    that does not resolve there is SKIPPED, not a refusal — it names another tree (this spec's own
    ADR and the two registry files live in the apex repo; note that `references/spec-contract.md`
    DOES resolve, under `skills/apex-code/references/`, and is therefore an in-root premise file).
    There is no "missing under this root" refusal at generation time; absence and other-tree are the
    same observation and the checker must not pretend to tell them apart.
    **Two classes.** A bound token that also appears in the spec's `## Files to Change` is a
    `files-to-change` entry — the build is expected to mutate it, so `-Verify` checks it only while
    the first-dispatch MARKER for this receipt is unset. A bound token NOT in `## Files to Change` is
    a `premise` entry — bound for the whole build, checked on every `-Verify`, and any movement is
    exit 2. Record the class on each `cited_files` entry. A `premise` file that has DISAPPEARED at
    `-Verify` time is exit 6. Sort ordinal-ascending by normalized path.
  - **First-dispatch marker (outside the receipt).** The receipt is never rewritten. `-Verify`
    reads and writes `receipt-dispatched-<receipt digest>.marker` in `-MarkerDirectory`, following
    the ledger area's existing naming — `<purpose>-<identity>` under the `progress` folder beside
    `codex-run-ledger.jsonl` — where `<receipt digest>` is `git hash-object` of the receipt file.
    Marker absent = first dispatch. `-Verify` creates it on its first successful run. Because the
    key is the receipt's own digest, a regenerated receipt starts with a fresh marker automatically.
  - **(c) Verdict currency — copied at promotion, not re-read at dispatch.** `-Generate` reads the
    sidecar `<spec basename>.review.log` beside the spec under `-SpecRepoRoot`; it runs at PROMOTION, while that sidecar
    still exists. Absent sidecar at `-Generate` → exit 7 (a spec being promoted has a review record).
    Present → parse its pipe-table rows, take the LAST data row, and read `Spec digest`, `Verdict`,
    `Disposition`. If `Spec digest` ≠ (a) → exit 3, printing the recorded digest and the current one.
    If it matches: `Disposition` is matched case-insensitively against the closed vocabulary `ready`
    (terminal-positive, proceed), `blocked` (exit 4), `pending` (exit 7), and any value beginning
    `VOID` (exit 3); anything else is exit 7 naming the unrecognised value. A `Verdict` cell of
    `BLOCK` with a digest-current row is exit 4 regardless of the disposition cell. On success the
    row is projected into the receipt's `verdict` object per Task 1. **`-Verify` never reads the
    sidecar** — an absent sidecar at dispatch is the NORMAL state. `-Verify` instead re-checks the
    receipt's `verdict.spec_digest` against the current (a), AND asserts
    `verdict.disposition` is `ready` from the closed vocabulary: a schema-valid receipt whose
    disposition is `blocked`, `pending`, or unrecognised is exit 7. A receipt cannot launder a
    non-ready verdict past the gate by being well-formed.
  - **(d) Probes:** a probe is a fenced block whose info string is exactly `apex-probe` and whose
    body is a JSON object with keys `label` (string), `assert` (`exact` or `required-subset`),
    `shell` (`bash`, `pwsh`, or `cmd`), `command` (string), and then `expected` (string) for `exact`
    or `required` (array of strings) for `required-subset`. Any other shape is exit 7. Execute
    `command` with `-RepoRoot` as the working directory, dispatching on `shell` the same way
    `Invoke-RecipeBlock` in `skills/apex-code/scripts/apex-baseline-check.ps1` dispatches on a recipe
    fence's info string (bash via the Git-for-Windows `bash -lc`, pwsh via
    `powershell.exe -NoProfile -Command`, cmd via `cmd.exe /c`), and never split the command line —
    the executing shell owns `&&`. Capture stdout, trim trailing whitespace, record as `observed`,
    and capture the process exit code as `exit_code`. **A probe passes only when BOTH hold: the
    shell exit code is 0 AND the output assertion holds** — mirroring the exit-code discipline in
    `Invoke-RecipeBlock`. A non-zero shell exit is exit 5 naming the code, even when `observed`
    matches. `exact`: `observed` must equal `expected` verbatim, else exit 5. `required-subset`:
    every member of `required` must appear in `observed`; a missing member is exit 5 naming that
    member. Extra content in `observed` is NOT a failure for `required-subset`.
  - **(e) Pass-through:** `builder_family` and `dispatch_pack_digest` are written from the
    corresponding parameters and are never compared by `-Verify`.
  - **`-Generate` (runs at PROMOTION, when the sidecar still exists):** derive (a)–(d), and on
    success write the receipt to the receipt path with the field order Task 1 fixes, UTF-8 without
    BOM, exit 0. **Fail closed:** before exiting non-zero for ANY reason, delete any pre-existing
    receipt at the receipt path — a failed regeneration must never leave a stale ready receipt
    behind. The receipt then travels with the spec into `docs/changes/`.
  - **`-Verify` (runs at DISPATCH):** read the existing receipt — absent → exit 7 with a message
    naming `-Generate` at promotion, unparseable → exit 7. **Structural validation is a
    purpose-built check written inside this script for this one schema** — Windows PowerShell 5.1
    has no JSON Schema validator, and none is to be vendored or emulated generically. Walk the
    parsed object and enforce, at every level: the closed key set (any key not named in Task 1 is
    exit 7), every required field present, every declared type, and every declared enum value. The
    schema file is the documented contract this hand-rolled check is written against; the check
    never loads it as an executable artifact. Never field-pick. Then compare `spec_path` (a receipt
    claiming a different spec is exit 2), `spec_digest`, the `premise` entries of `cited_files`, the
    `files-to-change` entries only while the first-dispatch marker is unset, `verdict.spec_digest`
    against the current (a), and `verdict.disposition` per (c). Re-run the probes: an `exact` probe
    compares `observed` verbatim plus `exit_code`; a `required-subset` probe re-checks ONLY that each
    member of `required` is still present in the fresh output plus `exit_code` — a `required-subset`
    probe whose output gained or lost unrequired text is NOT a difference and must not refuse. Any
    real difference is exit 2 with a printed diff naming each binding that moved and its
    before/after value. `generated_utc`, `builder_family`, and `dispatch_pack_digest` are not
    compared. A re-derivation that itself refuses (3/4/5/6/7) returns that code, not 2 — the more
    specific cause wins. On success, create the first-dispatch marker if absent and exit 0. `-Verify`
    NEVER writes to the receipt or anywhere under `docs/changes/`.
  — done when: `-Generate` against a spec plus its sidecar writes a receipt whose fields match the
  schema and whose `verdict` projects the sidecar's terminal row, a failed `-Generate` leaves no
  receipt on disk, and `-Verify` exits 0 with the sidecar deleted, exits 2 with a named binding after
  any single premise input is edited, and exits 7 on a receipt carrying an unknown field.

- [ ] **Task 3: the receipt-checker suite** — files:
  `skills/apex-code/scripts/spec-preflight-test.ps1` — mirror the harness style of
  `skills/apex-code/scripts/spec-validate-test.ps1`: `$ErrorActionPreference = 'Stop'`, a
  `$env:TEMP`-rooted GUID fixture directory, a `Write-Fixture` helper writing UTF-8 without BOM, an
  `Invoke-*` helper shelling out via `powershell.exe -NoProfile -ExecutionPolicy Bypass -File` and
  returning `ExitCode` + `Output`, an `Assert-Case` helper counting `$script:assertions` and
  `$script:failures`, and a final summary line with a non-zero exit when any assertion failed.
  Fixtures are derived FIELD-FOR-FIELD from what the real producers write: the sidecar fixture uses
  the `Round | Dispatched (UTC) | Reviewer | Spec digest | Verdict | Disposition` columns exactly as
  apex-plan writes them, and the spec fixture is a real spec-shaped document, not an invented shape.
  **Proof-of-red, defined for a brand-new checker:** there is no pre-fix checker to revert to, so a
  guard's red proof is the PAIR — a violating fixture that triggers the exact typed refusal exit and
  names the moved binding, alongside the otherwise-identical clean fixture that exits 0. A guard case
  is accepted only when both halves are asserted. Cases:
  - **Guard cases (violating + clean pair, each asserting the exact exit code and the named binding
    or member in the output):** stale spec digest (`-Verify` after the spec file is edited, exit 2) ·
    a receipt whose `spec_path` names another spec (exit 2) · digest-current `BLOCK` row (exit 4) ·
    digest-mismatched row, VOID (exit 3) · a `premise` file whose worktree bytes changed after
    generation (exit 2) · a `premise` file deleted after generation (exit 6) · a
    `## Files to Change` file mutated while the first-dispatch marker is UNSET (exit 2) · the same
    file mutated once the marker is SET (exits 0 — the clean half of the two-class rule) · a
    schema-valid receipt whose `verdict.disposition` is `blocked` (exit 7) and one whose disposition
    is `pending` (exit 7) · a failed `-Generate` that leaves no receipt on disk where a stale one
    existed · a failing `exact` probe (exit 5) · a `required-subset` probe whose required
    member disappeared (exit 5) · a probe printing the expected output but exiting non-zero (exit 5) ·
    an unrecognised disposition (exit 7) · a receipt carrying an unknown field (exit 7) · a
    structurally malformed receipt (exit 7) · a missing receipt (exit 7) · a malformed sidecar row at
    `-Generate` (exit 7) · a malformed probe block (exit 7) · an absent sidecar at `-Generate`
    (exit 7).
  - **Pass paths (no ceremony — not guards).** `-Generate` then `-Verify` with the sidecar DELETED
    exits 0 · a `required-subset` probe whose re-run output gained unrequired text still passes at
    `-Verify` · a path token resolving outside `-RepoRoot` is skipped and never refuses · a
    cross-tree case where `-SpecRepoRoot` differs from `-RepoRoot` round-trips `spec_path` correctly ·
    `builder_family` and `dispatch_pack_digest` round-trip into the receipt and do not affect
    `-Verify` · `-Generate` and `-Verify` together, or neither, exits 8 · field order in the written
    receipt matches the schema's declared order · the receipt file's bytes are IDENTICAL before and
    after a successful `-Verify`, and the marker lands in `-MarkerDirectory`, not beside the spec.
  — done when: the suite exits 0 when run by the HOST and every guard case above is asserted as a
  violating/clean pair.

- [ ] **Task 4: wrapper gate, exit 84, and its event** — files:
  `skills/apex-code/scripts/codex-dispatch.ps1`,
  `skills/apex-code/references/orchestrator-protocol-schema.json`,
  `skills/apex-code/scripts/dispatch-events-test.ps1`,
  `skills/apex-code/scripts/dispatch-preflight-test.ps1`
  - `codex-dispatch.ps1` — parameter: add `[switch]$SkipReceiptCheck` directly beneath the existing
    `[switch]$SkipBaselineCheck` declaration, with a comment matching that parameter's
    bootstrap/emergency wording.
  - `codex-dispatch.ps1` — **gate placement (this anchor is load-bearing).** The gate is its own
    block keyed on `$Phase -ceq 'build'` ALONE, any sandbox. It goes AFTER the entire pre-flight
    region — the `if ($Phase -eq 'build' -and $Sandbox -eq 'workspace-write') { ... }` construct
    together with its sibling `else` that prints `'[dispatch] pre-flight skipped (phase/sandbox)'` —
    has closed, and immediately BEFORE `$started = Get-UtcTimestamp`. It must NOT go inside that
    region or inside the `if ($SkipBaselineCheck) { ... } else { ... }` construct nested in it: a
    `-SkipBaselineCheck` run or a non-`workspace-write` build would never enter it, making either a
    second receipt bypass. `-SkipReceiptCheck` is the ONLY bypass. The gate resolves its own spec
    path with the SAME precedence the pre-flight uses for baseline validation, so both gates judge
    one file: `docs/changes/$Spec.md` under `$Worktree` when that file EXISTS (authoritative), else
    `-SpecSourcePath` (fallback). For the `-SpecSourcePath` case it passes
    `-SpecRepoRoot <the spec source's own repo root>` so the receipt's `spec_path` is compared
    against the spec's tree, not the build worktree. An unresolvable spec path here is itself
    exit 84.
  - `codex-dispatch.ps1` — behaviour: when `$SkipReceiptCheck` is passed, print a
    `-SkipReceiptCheck: receipt gate BYPASSED (bootstrap/emergency)` line in the same `Yellow` style
    as the `-SkipBaselineCheck` line and record the bypass in the ledger row beside the existing
    `baseline_skipped` field. Otherwise resolve `spec-preflight.ps1` beside `$PSScriptRoot`, refuse
    via `Write-DispatchRefusalLine` + `Exit-Dispatch 84` if that helper is missing, and otherwise
    invoke it with `-Verify -SpecPath <resolved spec> -RepoRoot $Worktree`. Exit 0 proceeds; ANY
    non-zero is `Write-DispatchRefusalLine` with a self-explaining message carrying the helper's own
    exit code and printed output, then `Exit-Dispatch 84`.
  - `codex-dispatch.ps1` — **event producer:** add `84` to the explicit code list in the
    `elseif (@(71, 72, 74, 75, 76, 79, 80, 81, 82, 83, 124) -contains $Code)` branch inside
    `Exit-Dispatch`. Without this no exit-84 event is ever emitted. 84 sets no `$requiredRunId`, so
    it carries `run_id` null — it refuses before launch.
  - `orchestrator-protocol-schema.json`: add `84` to the `exit_code` enum of the `refusal` `$def`,
    keeping the existing ascending order with `null` last; ALSO add 84 to the conditional that
    constrains which exits carry a null `run_id`, and extend the surrounding documentation the same
    way the other codes are described.
  - `dispatch-events-test.ps1`: add one case to the enumerated refusal matrix asserting that an
    exit-84 refusal event validates against the `refusal` `$def` with `exit_code` 84, `run_id` null,
    `rule` null, `synthesized` false, and `detail` carrying the wrapper's printed line verbatim.
    ALSO regenerate that file's `Exit-Dispatch` call-site accounting comment block — the enumerated
    line/count census that classifies every terminal as in-scope or EXCLUDED — so the new exit-84
    call sites are listed and its stated totals are correct again. A census that no longer matches
    the file is a silent-regression surface, so this is not optional bookkeeping.
  - `dispatch-preflight-test.ps1`: this suite invokes the REAL wrapper, so (i) every existing fixture
    that expects a successful launch or a non-84 refusal passes `-SkipReceiptCheck`, and (ii) add the
    new real-wrapper case — a `-Phase build` dispatch against a spec with no receipt exits 84 with
    nothing launched, and the same call with `-SkipReceiptCheck` passes the gate. This suite, not
    `dispatch-events-test.ps1`, is where the exit-84 refusal traverses the real wrapper.
  — done when: a build dispatch whose spec has no current receipt refuses with exit 84 and no launch,
  `-SkipBaselineCheck` alone does NOT bypass the gate, `-SkipReceiptCheck` does, a review-phase
  dispatch is unaffected, and the emitted exit-84 refusal event validates against the schema.

- [ ] **Task 5: routing documentation** — files: `AGENTS.md`, `skills/apex-code/SKILL.md` —
  `AGENTS.md`: add `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-preflight-test.ps1`
  as a new line inside the existing `## Verify commands` fence, after the
  `dispatch-events-test.ps1` line, with no prose added between the heading and the fence.
  `skills/apex-code/SKILL.md`: add one `| 84 | refused: dispatch receipt | ... |` row to the wrapper
  exit-code table, immediately after the `83` row and before the `124` row, matching the surrounding
  rows' voice. **The remedy must be the honest one:** the receipt is absent or its bindings moved,
  and because a receipt is generated only at promotion, the route back is a fresh review round —
  the spec returns to plan-check and adjudication and regenerates its receipt when it is re-promoted.
  Do NOT advise re-running `-Generate` in place; the sidecar it needs no longer exists. For a legacy
  spec promoted before this gate existed, the host authorizes `-SkipReceiptCheck`. Refused before
  launch, so nothing was dispatched and no ledger dispatch row exists. Add a short
  paragraph in the same section stating that build-phase dispatch requires a current receipt and
  naming `spec-preflight.ps1` and `-SkipReceiptCheck`; add
  `docs/technical/adr/ADR-047-dispatch-receipt-preflight.md` to the frontmatter `sources` list; bump
  the frontmatter `version` minor and set `last_updated` to the build date.
  — done when: the verify fence carries the new suite line with no prose between heading and fence,
  and the exit table carries an 84 row between 83 and 124.

- [ ] **Task 6: registry double-write** — files: `C:\users\user\apex\SKILL-HISTORY.md`,
  `C:\users\user\apex\SKILLS.md` — Task 5 edits `skills/apex-code/SKILL.md`, so the APEX repo's
  double-write rule applies. `SKILL-HISTORY.md` is REQUIRED: one row, newest first, in the existing
  column order `Date | Skill | Files | Version | Event | What Changed | Sources`, skill
  `apex-code, apex-plan`, Event cell `updated` (the file's existing vocabulary — never `update`),
  files the SKILL.md files plus the scripts, schemas, and agent file this spec touches,
  version the bumped value from Task 5, sources this spec and ADR-047. `SKILLS.md` is CONDITIONAL
  and carries **no version column**: change it only if the apex-code row's actual content changes,
  which this spec does not expect. Read the row, and if nothing on it changes, leave the file
  byte-untouched and record that in the task report. Never add a column, never reflow either table.
  Both files are in a DIFFERENT repo and are edited in place at the drive-absolute paths above.
  — done when: `SKILL-HISTORY.md` carries exactly one new apex-code row for this change, and
  `SKILLS.md` is either edited for a genuine row-content change or reported byte-untouched.

- [ ] **Task 7: orchestrator exit routing** — files: `agents/apex-build-orchestrator.md` — add ONE
  row for exit `84` to the agent's exit-routing table, placed in the table's existing numeric order
  and matching the surrounding rows' voice: the dispatch was refused before launch for want of a
  current receipt; the route is send the spec back through plan-check and adjudication so it
  regenerates a receipt at re-promotion, or the HOST adjudicates a `-SkipReceiptCheck` bypass for a
  legacy spec. No protocol change, no new action verb, no other edit to this file.
  — done when: the exit-routing table has an 84 row in numeric order and the file is otherwise
  unchanged.

- [ ] **Task 8: the promotion-time producer** — files: `skills/apex-plan/SKILL.md` — in the
  `## Closing the session` section, the bullet that moves a spec `docs/drafts/` → `docs/changes/` and
  deletes the `<short-name>.review.log` sidecar (the "host's pen — the round record dies with the
  promotion" step): insert the receipt generation BEFORE the sidecar deletion, as an ordered step —
  run `spec-preflight.ps1 -Generate` against the draft while the sidecar still exists, then move BOTH
  the spec and its generated `receipt.json` sidecar into `docs/changes/`, then delete the
  `.review.log`. State that a non-zero `-Generate` STOPS the promotion (the spec is not promoted and
  the sidecar is not deleted), since without this the receipt can never be produced and every later
  build refuses with exit 84. Keep it inside the existing bullet's voice; add no new section.
  — done when: the promotion bullet orders generate → move both files → delete sidecar, and names
  the non-zero-generate stop.

## Wave plan

Wave 1: [Task 1] | Wave 2: [Task 2] | Wave 3: [Task 3, Task 4] | Wave 4: [Task 5, Task 7, Task 8] |
Wave 5: [Task 6]

Task 2 needs the schema's field order. Tasks 3 and 4 both need the checker to exist and are
file-disjoint from each other (Task 3 writes only `spec-preflight-test.ps1`; Task 4 writes only the
wrapper, the protocol schema, and the two dispatch suites). Tasks 5, 7, and 8 all depend on the exit
code and the `-Generate` contract Tasks 2 and 4 fix, and are file-disjoint from each other. Task 6
records the version Task 5 bumps and the skills Task 8 touches.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (`status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, `status.md`, and spec archival — under D6.)
docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | `skills/apex-code/references/spec-receipt-schema.json`, `skills/apex-code/scripts/spec-preflight.ps1`, `skills/apex-code/scripts/spec-preflight-test.ps1` |
| Modify | `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/references/orchestrator-protocol-schema.json`, `skills/apex-code/scripts/dispatch-events-test.ps1`, `skills/apex-code/scripts/dispatch-preflight-test.ps1`, `skills/apex-code/SKILL.md`, `agents/apex-build-orchestrator.md`, `skills/apex-plan/SKILL.md`, `C:\users\user\apex\SKILL-HISTORY.md`, `C:\users\user\apex\SKILLS.md` |
| Delete | (none) |
| **Attended confirmation required** | `AGENTS.md` (root, host-state — not pre-authorised here) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-preflight-test.ps1` | Receipt-checker suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1` | Event schema-conformance suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1` | Real-wrapper pre-flight/refusal suite |
| `git hash-object` | Digest a spec or cited file (read-only) |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | (none — the coder never touches the index) |
| `git commit` | (none — the host integrates; this repo's AGENTS.md forbids commits from a build) |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Test-suite fixture directory root |
| `APEX_STATE_DIR` | Wrapper state isolation for the events-suite case |

### Network
| Action | Purpose |
|--------|---------|
| (none) | This build installs nothing and reaches no network |

## Specialist Context

### Security

The checker executes probe `command` strings out of a spec file. Probes are executed only from the
spec the dispatch names, under `-RepoRoot`, with the same shell dispatch the baseline recipe already
uses — this is the existing trust boundary (a spec's `AGENTS.md` recipe is already executed
pre-dispatch), not a new one. Do not add a shell beyond `bash`, `pwsh`, `cmd`, and do not interpolate
any receipt or sidecar value into a command string.

**Known limit, accepted for v1 and deliberately unmitigated:** a race window exists between
`-Verify` returning and the child launching. On a cross-tree dispatch the spec source, its receipt,
and its cited files sit outside the pre-flight pin entirely. And under `-SkipBaselineCheck` NO
pre-flight pin is armed at all, so the window covers in-tree bindings too, not only cross-tree ones.
No machinery is added for this; it is recorded here so the residual is visible rather than assumed
closed.

### Performance

(none)

### Accessibility

(none)

## Documentation

| Doc type | File | Action |
|----------|------|--------|
| Inline | The new script and suite | Header comment block: purpose plus the typed exit-code table |
| ADR | docs/technical/adr/ADR-047-dispatch-receipt-preflight.md | Already written — do not edit |
| Skill | skills/apex-code/SKILL.md | Task 5 |

## Acceptance Criteria

- [ ] Task 1 → verify: `skills/apex-code/references/spec-receipt-schema.json` parses as JSON, its
      top level declares `additionalProperties: false`, and its `properties` keys appear in the order
      `version, spec_path, spec_digest, generated_utc, cited_files, verdict, probes, builder_family,
      dispatch_pack_digest`, with no `first_dispatch` field, and with `verdict`, `cited_files[]`, and
      `probes[]` each closed, fully required, and carrying the declared types and enums.
- [ ] Task 2 → verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-preflight.ps1
      -Generate -SpecPath <fixture spec> -RepoRoot <fixture repo>` exits 0 and writes a receipt whose
      key order matches the schema and whose `verdict` carries the sidecar's terminal row; the same
      invocation with `-Verify` exits 0 with the sidecar deleted and leaves the receipt's bytes
      unchanged, exits 2 after one byte of the fixture spec changes (printing the moved binding by
      name), exits 7 on a receipt carrying an unknown field, and exits 7 on a schema-valid receipt
      whose `verdict.disposition` is not `ready`; a `-Generate` forced to fail leaves no receipt on
      disk.
- [ ] Task 3 → verify: `powershell.exe -NoProfile -File
      skills/apex-code/scripts/spec-preflight-test.ps1` exits 0 when run by the HOST, and its report
      shows each guard case asserted as a violating/clean pair with its exact typed exit code.
- [ ] Task 4 → verify: `84` appears in the `refusal` `exit_code` enum AND in the null-`run_id`
      conditional of `skills/apex-code/references/orchestrator-protocol-schema.json`, and in the
      `Exit-Dispatch` refusal-event code list in
      `skills/apex-code/scripts/codex-dispatch.ps1`; a `-SkipBaselineCheck` build dispatch with no
      receipt still exits 84, and so does a `-Phase build` dispatch with a non-`workspace-write`
      sandbox; the `Exit-Dispatch` call-site census comment in
      `skills/apex-code/scripts/dispatch-events-test.ps1` lists the new sites and its totals match
      the file; `powershell.exe -NoProfile -File
      skills/apex-code/scripts/dispatch-events-test.ps1` and `powershell.exe -NoProfile -File
      skills/apex-code/scripts/dispatch-preflight-test.ps1` both exit 0.
- [ ] Task 5 → verify: the repo's `## Verify commands` fence in `AGENTS.md` lists the new suite with
      no prose between the heading and the fence opener, and the exit table in
      `skills/apex-code/SKILL.md` has an `84` row positioned between the `83` and `124` rows.
- [ ] Task 6 → verify: `C:\users\user\apex\SKILL-HISTORY.md` has exactly one new apex-code row whose
      Version equals the frontmatter version in `skills/apex-code/SKILL.md`, and
      `C:\users\user\apex\SKILLS.md` is reported either edited for a named row-content change or
      byte-untouched.
- [ ] Task 7 → verify: `agents/apex-build-orchestrator.md` has one new exit-routing row for `84` in
      numeric order whose remedy names the re-review route, and its diff contains no other change.
- [ ] Task 8 → verify: the `## Closing the session` promotion bullet in `skills/apex-plan/SKILL.md`
      orders `-Generate` before the `.review.log` deletion, moves the receipt alongside the spec, and
      states that a non-zero generate stops the promotion.
- [ ] Regression — the whole `## Verify commands` recipe of the `C:\Users\User\.claude` repo exits 0
      → verify: run it end to end and report each line's exit code; no line may regress from green to
      red.
- [ ] Scope — nothing written outside `## Files to Change` → verify: `git status --porcelain -uall`
      in `C:\Users\User\.claude` lists exactly the eleven `C:\Users\User\.claude`-relative paths in
      `## Files to Change` (`??` = created, ` M` = modified), and `git status --porcelain -uall` in
      `C:\users\user\apex` lists `SKILL-HISTORY.md` plus `SKILLS.md` ONLY if Task 6 found a genuine
      row-content change; every other path either status shows was already dirty before this build
      (name them in the report).
- [ ] Reachability — the receipt gate is reached from a real `codex-dispatch.ps1` build dispatch →
      verify: the exit-84 case in `skills/apex-code/scripts/dispatch-preflight-test.ps1` invokes
      `codex-dispatch.ps1` with `-Phase build` through the fake-codex harness that suite already
      uses, and observes the refusal on the wrapper's stdout. The event-shape case in
      `dispatch-events-test.ps1` constructs its fixture directly and does NOT satisfy this criterion.

## Progress
_(The build writes here — do not edit manually)_
