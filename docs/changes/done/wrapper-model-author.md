---
spec: wrapper-model-author
status: draft
autonomy_level: L2
risk: high
coder_effort: high
---

# Spec: Wrapper `-Model` parameter and `-AuthorSpec` authoring dispatch
<!-- Governing contract: references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->

**Identity:** Adds `-Model` (`gpt-5.6-sol` default, `gpt-6-sol`) and an `-AuthorSpec` create/revise
authoring dispatch to `codex-dispatch.ps1`, with a fake-codex end-to-end suite, the verify-fence lines
for it, and the corrected apex-code model sentence.
→ why: see docs/technical/adr/ADR-048-role-redesign.md

**Repo root for every path below:** `C:\Users\User\.claude` (build repo). This spec file lives in the
separate `C:\users\user\apex` repo, and the one apex-repo file this spec changes is written
drive-absolute. `~/.claude` ignores `*`, so every tracked file is committed with `git add -f` by name.

## Intent

- **Intent:** A caller can run `codex-dispatch.ps1 -Spec <name> -Task author -Worktree <repo>
  -BaseSha <sha> -Prompt <pack> -AuthorSpec -Authorized docs/drafts/<name>.md -Model gpt-6-sol
  -Effort high` to have Codex write or revise exactly one draft spec, with no existing spec, no green
  baseline and no frontmatter, through the same pin, critical-file and scope gates as a build.
- **Invariants:**
  - With no `-Model`, the argv is byte-identical to today (`-m gpt-5.6-sol`); without `-AuthorSpec`
    (and with a `-Task` other than `author`), every existing refusal, pre-flight step and exit code is
    unchanged. Default-path dispatch rows gain three additive keys (`model`, `dispatch_kind`,
    `author_mode`); no existing key changes.
  - Every author-specific refusal (the caller-contract and disk-state refusals in Task 2(a)–(c),
    including the reparse-point refusal) is exit 74 and launches nothing. The ones before the lease
    leave zero ledger rows; the post-pin re-checks (reparse point present, revise digest moved, create
    target appeared) close their lease as `refused-preflight` with `refusal_exit` 74 and write no
    dispatch row. The normal gates keep their own codes on an authoring run: capacity 79,
    critical-file 76, pin-arm 72, launch boundary 69.
  - No authoring dispatch runs through a reparse point: the target (revise mode: the existing file)
    and every existing ancestor directory between the repo root and it (`docs`, `docs/drafts`) must
    not be a symlink or junction, checked before the lease and again after the pin arms; the post-run
    check still rejects a reparse point written by the coder.
  - An `-AuthorSpec` run never exits 0 unless the scope check's written set is exactly the one
    authorized regular file. A wrong or empty write set is always non-zero; the specific code follows
    the wrapper's existing precedence (e.g. 1 for a failed child with no report, 66 for a malformed
    allowlist, 67 for blocked, 65 for the author scope violation).
  - An author row and a build row never share spec+task: `-Task author` is reserved for `-AuthorSpec`.
  - No new exit code, no new event kind, no event-field change.
- **Non-goals:** Doctrine/routing changes naming `gpt-6-sol` as spec author (wave-2 spec
  `spec-author-routing`). Luna/Astra model ids. Any edit to `tree-pin.ps1`, `codex-scope-check.ps1`,
  `tree-pin-test.ps1`, `scope-check-test.ps1` (spec `synced-runtime-exclusion` owns them, including
  the fix for the pre-existing `tree-pin-test.ps1` failure).

## Assumptions

- Anchors below are text anchors verified at `~/.claude` HEAD `7cbd7ff`; line numbers are approximate:
  param block 9–80; caller-contract refusals 87–148 (phase check `@('build', 'review') -cnotcontains
  $Phase` at 91–96); required-parameter loop and `Worktree does not exist` throw 2520–2530; pre-lease
  exit-74 refusal `workspace-write build has no -Authorized scope list` 2557–2560; critical-file block
  2901–2945 (`$CriticalFilesScript` test override); pre-flight branch `if ($SkipBaselineCheck)` 2947 /
  `else` 2951, pin arm 2969–2975, spec validation 2977–3036, baseline 3038–3049,
  `declared_runtime_paths` 3051–3115; `$coderModel = 'gpt-5.6-sol'` 3134; dispatch ledger row
  3135–3180; argv `'-m', $coderModel` 3484; post-run scope check 3844–3884 (`$writtenPathsFile`,
  `$scopeViolation`, `$scopeExit`); exits `if ($scopeExit -eq 66) { Exit-Dispatch 66 }` /
  `if ($scopeViolation) { Exit-Dispatch 65 }` ~4028–4034 → impact: Caution
- `Exit-Dispatch` already lists 74 in its refusal-event allowlist (`@(71, 72, 74, 75, 76, 79, 80, 81,
  82, 83, 124)`, ~922); an `Exit-Dispatch 74` before the lease writes no ledger row (precedent
  2557–2560, asserted by `dispatch-preflight-test.ps1` case `plain exit 74 leaves zero rows`); after
  the lease, the outer `finally` closes it with `refused-preflight` and `refusal_exit = <code>` for any
  code (~4085–4090) → impact: Stop
- The scope check DETECTS and never reverts (comment at ~3863); it writes the post-run written set,
  one repo-relative forward-slash path per line, to `-WrittenPathsFile`, expanding a written directory
  into the directory entry plus every file under it (`codex-scope-check.ps1` ~895–911); an authorized
  path authorizes its descendants (`Normalize` TrimEnd('/') ~155, `Test-IsAuthorized` ~643–649) →
  impact: Stop
- `blocked` outranks every other post-run route: an unparseable report, or a missing report when the
  child exited 0, is coerced to `blocked` (~3809–3829) and `if ($status -eq 'blocked') { ...
  Exit-Dispatch 67 }` (~4007) runs before the 69/66/65 exits. A missing report with a NON-zero child
  exit is not coerced: `$status` stays `failed`, and the run reaches `child failed (exit N); reporting
  1` (~4062–4065) unless 69/66/65/77/73/68 outranks it. `if ($scopeExit -eq 66)` precedes
  `if ($scopeViolation) { Exit-Dispatch 65 }`; the scope check returns 66 when it sees more than one
  violation and zero authorized hits (`codex-scope-check.ps1` ~952–968). A scope check that throws
  takes the existing exit-77 route unless outranked → impact: Stop
- The scope check cannot see writes through a symlink that points out of the repo
  (`codex-scope-check.ps1` stated limits, ~line 55); a symlink at the authorized path itself does show
  as that path → impact: Caution
- Creating a file symlink on Windows (via `cmd /c mklink`, which honours the Developer Mode
  unprivileged flag that Windows PowerShell 5.1 `New-Item -ItemType SymbolicLink` may not) works with
  Developer Mode on or an elevated shell; otherwise the symlink case prints SKIP with the reason, which
  counts as neither a pass nor a failure, and the suite still exits 0. A directory junction
  (`cmd /c mklink /J`) normally needs no privilege, but its case uses the same probe/SKIP pattern →
  impact: Low
- `(Get-Item -LiteralPath <p> -Force).Attributes` reports the link's own attributes (it does not
  follow the link), so `-band [System.IO.FileAttributes]::ReparsePoint` is non-zero for a file
  symlink, a directory symlink and a junction → impact: Caution
- `codex-scope-check.ps1` `Invoke-Git` (~108–144) is the house pattern for git calls: sentinel
  `$global:LASTEXITCODE = -987654`, inner try/catch capturing a launch exception, `2>$null` under
  `$ErrorActionPreference = 'Continue'` restored in `finally` → impact: Low
- A `ValidateSet` rejection happens at parameter binding, before the script body: under
  `powershell.exe -File` it exits **1** (comment at lines 89–90), and in-process it throws a
  parameter-binding error. It is not an exit-74 refusal → impact: Low
- `tree-pin.ps1` fingerprints the content of untracked files (`git hash-object`, ~line 65/139), so an
  untracked draft is covered by the pre-flight pin from arm to launch → impact: Caution
- The critical-file classifier runs after the pre-lease disk check and before the pin arm; the
  existing `-CriticalFilesScript` test override (used by `dispatch-criticalfile-test.ps1` ~402–430)
  lets a fixture stub run code in that window → impact: Low
- `apex-baseline-check.ps1 -Preflight` selects `## Preflight commands` first and falls back to
  `## Verify commands` (~262–263); it returns 4 (NO_RECIPE) for a repo with no `AGENTS.md`, which the
  wrapper maps to exit 72. `~/.claude/AGENTS.md` HAS a `## Preflight commands` block (lines 21–26), so
  dispatch pre-flight into `~/.claude` never runs the verify fence; only `-Full` does → impact: Low
- `tree-pin-test.ps1` exits **0** at build start: it exits 1 at `7cbd7ff` (`v1-format pin requests a
  re-pin`), and prerequisite `synced-runtime-exclusion` Task 4 fixes that failure with the acceptance
  criterion `tree-pin-test.ps1` exits 0. If it is red, the fence edited in Task 6 makes
  `apex-baseline-check.ps1 -Full` (the verify-fence baseline, e.g. the baseline-green pre-commit hook)
  red for `~/.claude` → impact: Stop
- `scope-check-test.ps1` exits 0 at `7cbd7ff` (`all 176 scope-check assertions passed`) → impact: Caution
- `baseline_skipped` has one writer (`codex-dispatch.ps1:3159`) and one reader, the
  `dispatch-preflight-test.ps1:832` assertion that it is true on a `-SkipBaselineCheck` run; no gate or
  hook treats `true` as a failure or emergency signal, so an authoring run records it truthfully as
  `true`, and `dispatch_kind` tells the two apart → impact: Low
- `C:\users\user\apex\SKILLS.md` has no per-skill version field and no sentence about the wrapper's
  model, so it needs no change → impact: Low

Simplicity check: yes. A full `-Phase author` and reusing `-SkipBaselineCheck` were both considered and
rejected in the plan; `-AuthorSpec` is a build-phase switch that skips only the three spec-dependent
pre-flight steps.

## Prerequisites

- Specs that must be complete first: `synced-runtime-exclusion` (`C:\users\user\apex\docs\drafts\synced-runtime-exclusion.md`)
- Environment setup required: none

## Files to Change

| File | Operation | Notes |
|------|-----------|-------|
| `skills/apex-code/scripts/codex-dispatch.ps1` | modify | Tasks 1, 2 — `-Model`, `-AuthorSpec`, `-ExpectedDigest`, author post-run check, ledger fields |
| `skills/apex-code/scripts/dispatch-test-fakecodex.ps1` | modify | Task 3 — opt-in argv capture + author-write mode (file, directory, symlink, no write, extra paths, failing exit) |
| `skills/apex-code/scripts/dispatch-author-test.ps1` | create | Task 4 — end-to-end author/model suite |
| `skills/apex-code/SKILL.md` | modify | Task 5 — model sentence (~367–369) + frontmatter version |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | Task 5 — one new top row (host-applied at integration; outside the `~/.claude` worktree) |
| `AGENTS.md` | modify | Task 6 — three verify-fence lines (critical path: attended confirmation) |
| `skills/apex-code/scripts/dispatch-preflight-test.ps1` | unchanged (regression run only) | |
| `skills/apex-code/scripts/dispatch-events-test.ps1` | unchanged (regression run only) | |
| `skills/apex-code/scripts/dispatch-test.ps1` | unchanged (regression run only) | |
| `skills/apex-code/scripts/dispatch-scopelock-test.ps1` | unchanged (regression run only) | |
| `skills/apex-code/scripts/dispatch-criticalfile-test.ps1` | unchanged (regression run only) | |
| `skills/apex-code/scripts/verdict-test.ps1` | unchanged (regression run only) | |
| `skills/apex-code/scripts/careless-coder-test.ps1` | unchanged (regression run only) | |
| `skills/apex-code/scripts/review-findings-test.ps1` | unchanged (regression run only) | |
| `skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1` | unchanged (regression run only) | |
| `skills/apex-code/scripts/family-gate-test.ps1` | unchanged (regression run only) | |
| `skills/apex-code/scripts/scope-check-test.ps1` | unchanged (regression run only) | owned and edited by prerequisite `synced-runtime-exclusion`; this spec only runs it and names it in the fence |
| `skills/apex-code/scripts/tree-pin-test.ps1` | unchanged (regression run only) | owned and edited by prerequisite `synced-runtime-exclusion`; this spec only runs it and names it in the fence |
| `skills/apex-code/scripts/apex-baseline-check.ps1` | unchanged (invoked only) | Task 6 fence check |

Grep evidence (`git grep -c -E <pattern> -- skills hooks AGENTS.md` in `C:\Users\User\.claude` at
`7cbd7ff`, spec-corpus fixtures excluded where noted): `codex-dispatch\.ps1` → 87 hits (invokers
across tests, docs and the `hooks/apex-ledger-append.ps1` comment; none pass `-Model`,
`git grep -E "codex-dispatch\.ps1.*-Model|-Model gpt"` → 0) · `dispatch-test-fakecodex\.ps1` → 10
hits / 10 files (consumers: careless-coder, dispatch-criticalfile, dispatch-deadlock-fakecodex,
dispatch-events, dispatch-preflight, dispatch-scopelock, dispatch, review-findings, verdict tests + one
spec-corpus fixture; all run the default path, which Task 3 leaves unchanged) · `coderModel` → 4 hits
/ 1 file (`codex-dispatch.ps1` only) · `hardwires` → 1 hit (`skills/apex-code/SKILL.md:368`) ·
`baseline_skipped` → 2 hits / 2 files (writer `codex-dispatch.ps1:3159`, assertion
`dispatch-preflight-test.ps1:832`; `C:\users\user\apex\docs` mentions are specs/ADR-040/research,
none a consumer) · `writtenPathsFile` → 3 hits / 1 file (`codex-dispatch.ps1`) · `CriticalFilesScript`
→ 21 hits / 6 files (test override precedent in `dispatch-criticalfile-test.ps1`) · `Preflight
commands` → 7 hits / 4 files (incl. `AGENTS.md:21`) · `IgnoreCase` → 27 hits / 7 files (none on a
`ValidateSet`) · `AuthorSpec` → 0 · `ExpectedDigest` → 0 · `dispatch_kind` → 0 ·
`dispatch-author-test` → 0 · `FAKE_CODEX_ARGV_FILE` → 0 · `FAKE_CODEX_AUTHOR_PATH` → 0 ·
`FAKE_CODEX_AUTHOR_AS_DIR` → 0 · `FAKE_CODEX_AUTHOR_NO_WRITE` → 0 · `FAKE_CODEX_AUTHOR_AS_SYMLINK` → 0 ·
`Invoke-AuthorGit` → 0 · `FAKE_CODEX_NO_REPORT` → 26 hits / 8 files (existing fake flag, reused by the
author hook) · `987654` → 3 hits / 2 files (`codex-scope-check.ps1` `Invoke-Git` sentinel + its test) ·
`function Invoke-Git` → 5 hits / 4 files · `ReparsePoint` → 0 · `SymbolicLink` → 0 ·
`reparse point` → 0 · `mklink` → 0 · `cannot be combined with` → 0 · `FAKE_CODEX_AUTHOR_FAIL_EXIT` → 0 ·
`FAKE_CODEX_EXTRA_WRITE` → 13 hits / 3 files (single-path today; only the new author hook splits it on `;`) ·
`author_mode|'author'` in `codex-dispatch.ps1` → 0 ·
`\.kind\b|\[.kind.\]` over `skills hooks` `*.ps1` → 1 hit (the event `kind` in `Exit-Dispatch`) ·
`Verify commands` → 76 hits / 26 files (the `AGENTS.md` fence plus fixture recipes). In
`C:\users\user\apex`: `apex-code` → 7 hits in `SKILLS.md` (no version column), 80 in
`SKILL-HISTORY.md`; `git ls-files docs/drafts` → 6 tracked files (the collapsed-parent refusal does not
fire in the apex repo).

**`AGENTS.md` is host-state (a critical path).** Its `## Verify commands` fence must stay pure — no
prose between the heading and the fence, or the baseline check reports it UNPARSEABLE.

## Tasks

- [ ] **Task 1: `-Model` parameter** — files: `skills/apex-code/scripts/codex-dispatch.ps1`
  - Param block: immediately after `[string]$Effort = 'medium',` add
    ```powershell
    [ValidateSet('gpt-5.6-sol', 'gpt-6-sol', IgnoreCase = $false)]
    [string]$Model = 'gpt-5.6-sol',
    ```
  - Replace `$coderModel = 'gpt-5.6-sol'` with `$coderModel = $Model`. The argv line
    (`'-m', $coderModel`) and the `builder_family` / `reviewer_family` expressions stay as they are and
    now read the parameter.
  - Dispatch ledger row (`[ordered]@{ ... row_kind = 'dispatch' }`): add `model = $coderModel`
    immediately before `builder_family`.
  - done when: a default dispatch passes `-m gpt-5.6-sol` and records `model = gpt-5.6-sol`;
    `-Model gpt-6-sol` passes `-m gpt-6-sol` and records it; any other value, including a case
    variant such as `GPT-6-SOL`, is rejected at binding.

- [ ] **Task 2: `-AuthorSpec` / `-ExpectedDigest` authoring dispatch** — files:
  `skills/apex-code/scripts/codex-dispatch.ps1`
  - **Params:** immediately after `[switch]$SkipBaselineCheck,` add `[switch]$AuthorSpec,` and
    `[string]$ExpectedDigest,`, each with a one-line comment. Initialise `$script:authorMode = ''`
    immediately after the `$script:attendedTelemetry = ...` line (~85).
  - **Git helper:** add `function Invoke-AuthorGit` directly after `function Get-SpecFrontmatterValue`,
    taking `[string[]]$GitArgs` and returning `[pscustomobject]@{ ExitCode; Output; LaunchError }`. It
    mirrors `codex-scope-check.ps1` `Invoke-Git` (~108–144) but returns instead of throwing: save
    `$ErrorActionPreference`, set it to `'Continue'`, set `$global:LASTEXITCODE = -987654`, run
    `$output = @(& git -C $Worktree @GitArgs 2>$null)` inside an inner `try { } catch { $launchError =
    $_.Exception.Message }`, read `$global:LASTEXITCODE`, restore the preference in `finally`. Every
    git call in parts (b) and (c) goes through it. A result with a non-null `LaunchError`, an
    `ExitCode` still equal to `-987654`, or any non-zero `ExitCode` refuses with
    `[dispatch] REFUSED (exit 74): -AuthorSpec could not verify '<path>' with git (<exit N | launch failed: message>) -- failing closed`
    (via `Write-DispatchRefusalLine` + `Exit-Dispatch 74`).
  - **(a) Caller-contract block — placement:** a new block immediately BEFORE `if (-not
    $ListObligations) {` (line ~87), so it runs before the `-Phase` check. Each refusal prints with
    `Write-Host ... -ForegroundColor Red` then `exit 74` (the sibling style of lines 91–142). In order:
    1. `$ExpectedDigest` non-empty and not `$AuthorSpec` →
       `[dispatch] REFUSED (exit 74): -ExpectedDigest is only valid with -AuthorSpec`
    2. not `$AuthorSpec`, not `$Adopt`, not `$ListObligations`, `AbandonRunId` not bound,
       `$Phase -ceq 'build'` and `$Task -ceq 'author'` →
       `[dispatch] REFUSED (exit 74): -Task author is reserved for -AuthorSpec dispatches`
    3. `$AuthorSpec` with any of `$Adopt`, `$PSBoundParameters.ContainsKey('AbandonRunId')`,
       `$ListObligations`, `$SkipBaselineCheck`, `$ScopeUnlocked`, `$AllowSharedWorktree` →
       `[dispatch] REFUSED (exit 74): -AuthorSpec cannot be combined with <flag>`, where `<flag>` is the
       FIRST offending flag in that order, rendered as `-Adopt`, `-AbandonRunId`, `-ListObligations`,
       `-SkipBaselineCheck`, `-ScopeUnlocked` or `-AllowSharedWorktree`
    4. `$AuthorSpec` and any of: `Phase` bound with `$Phase -cne 'build'`; `Schema` bound with
       `$Schema -cne 'completion'`; `Sandbox` bound with `$Sandbox -cne 'workspace-write'` (all via
       `$PSBoundParameters.ContainsKey`) →
       `[dispatch] REFUSED (exit 74): -AuthorSpec implies -Phase build -Schema completion -Sandbox workspace-write (got '<Phase>/<Schema>/<Sandbox>')`
    5. `$AuthorSpec` and `$Task -cne 'author'` →
       `[dispatch] REFUSED (exit 74): -AuthorSpec requires -Task author (got '<Task>')`
    6. `$AuthorSpec` and `$Authorized.Count -ne 1` →
       `[dispatch] REFUSED (exit 74): -AuthorSpec requires exactly one -Authorized path (got <count>)`
    7. `$AuthorSpec` and `$Authorized[0] -cnotmatch '^docs/drafts/[a-z0-9-]+\.md\z'` →
       `[dispatch] REFUSED (exit 74): -AuthorSpec path '<path>' must match ^docs/drafts/[a-z0-9-]+\.md\z`
    8. `$AuthorSpec` and `$Spec -cne [System.IO.Path]::GetFileNameWithoutExtension($Authorized[0])` →
       `[dispatch] REFUSED (exit 74): -AuthorSpec requires -Spec to equal the draft name '<name>' (got '<Spec>')`
    9. `$AuthorSpec`, `$ExpectedDigest` non-empty, and `$ExpectedDigest -cnotmatch '^([0-9a-f]{40}|[0-9a-f]{64})\z'` →
       `[dispatch] REFUSED (exit 74): -ExpectedDigest '<value>' is not a lowercase hex git object id`
    10. Then, when `$AuthorSpec`: `$Phase = 'build'`, `$Schema = 'completion'`, `$Sandbox = 'workspace-write'`.
  - **(b) Disk-state block — placement:** immediately AFTER the existing pre-lease refusal
    `if ($Phase -eq 'build' -and $Sandbox -eq 'workspace-write' -and $Authorized.Count -eq 0 ...) { ... Exit-Dispatch 74 }`
    (~2557–2560) and before any lease work. Guarded by `if ($AuthorSpec)`. Each refusal uses
    `Write-DispatchRefusalLine -Message '<line>'` then `Exit-Dispatch 74` (the style of 2558–2559).
    Set `$authorPath = $Authorized[0]` and `$authorFull = Join-Path $Worktree ($authorPath -replace '/', '\')`
    (script scope; parts (c) and (d) reuse them). Every git call is `Invoke-AuthorGit` with the
    fail-closed `could not verify` refusal above.
    0. **Reparse points (both modes, first):** for each repo-relative `$p` in `docs`, `docs/drafts`,
       `$authorPath` (in that order), with `$pFull = Join-Path $Worktree ($p -replace '/', '\')`: when
       `Test-Path -LiteralPath $pFull` is true and
       `(Get-Item -LiteralPath $pFull -Force).Attributes -band [System.IO.FileAttributes]::ReparsePoint`
       is non-zero →
       `[dispatch] REFUSED (exit 74): -AuthorSpec path '<p>' is a reparse point (symlink or junction) -- refusing to author through it`.
       Implement it as `function Assert-AuthorNoReparse` (placed directly after `function
       Invoke-AuthorGit`, reading `$Worktree` and `$authorPath`) so part (c) re-runs the identical check.
    1. **Collapsed parent (both modes):** `Invoke-AuthorGit ls-files -- docs/drafts/`; empty output →
       `[dispatch] REFUSED (exit 74): -AuthorSpec needs at least one tracked file under docs/drafts/ in '<Worktree>' -- an all-untracked docs/drafts/ collapses in git status; commit a placeholder first`
    2. Target absent on disk (`-not (Test-Path -LiteralPath $authorFull)`) → **create mode**:
       - `$ExpectedDigest` non-empty →
         `[dispatch] REFUSED (exit 74): -AuthorSpec revise target '<path>' does not exist -- omit -ExpectedDigest to create it`
       - `Invoke-AuthorGit ls-files -- $authorPath` non-empty output →
         `[dispatch] REFUSED (exit 74): -AuthorSpec create target '<path>' is tracked in git -- restore it and pass -ExpectedDigest to revise, or pick a new name`
       - otherwise `$script:authorMode = 'create'`.
    3. Target present → **revise mode**:
       - not a leaf (`-not (Test-Path -LiteralPath $authorFull -PathType Leaf)`) →
         `[dispatch] REFUSED (exit 74): -AuthorSpec target '<path>' exists but is not a file`
       - `$ExpectedDigest` empty →
         `[dispatch] REFUSED (exit 74): -AuthorSpec target '<path>' already exists -- a revise dispatch requires -ExpectedDigest <git hash-object output>`
       - trimmed `Invoke-AuthorGit hash-object -- $authorPath` output `-cne $ExpectedDigest` →
         `[dispatch] REFUSED (exit 74): -AuthorSpec revise target '<path>' digest <actual> does not match -ExpectedDigest <expected>`
       - otherwise `$script:authorMode = 'revise'`.
  - **(c) Pre-flight branch:** inside the existing `else` of `if ($SkipBaselineCheck)` (~2951), keep the
    helper-existence loop and the pin arm (`& $preflightTreePinScript -Pin ...` through its exit-72
    refusal) unchanged. Directly after the pin arm, wrap everything through the end of the
    `declared_runtime_paths` handling (the spec-file validation, `-SpecSourcePath` branch and
    `no in-worktree spec` refusal, `& $preflightBaselineScript -Preflight`, and the
    `declared_runtime_paths` block) in `if (-not $AuthorSpec) { ... }`. Its `else` branch, in order:
    0. Re-run `Assert-AuthorNoReparse` (the (b).0 check, same message, `Exit-Dispatch 74`;
       the lease is open, so the existing outer `finally` closes it as `refused-preflight`).
    1. When `$script:authorMode -ceq 'revise'`: re-run `Invoke-AuthorGit hash-object -- $authorPath`
       (same fail-closed handling as (b)) into `$actual` (trimmed); `$actual -cne $ExpectedDigest` →
       `Write-DispatchRefusalLine -Message "[dispatch] REFUSED (exit 74): -AuthorSpec revise target '$authorPath' changed before the pre-flight pin armed (digest $actual, expected $ExpectedDigest)"`
       (double-quoted, interpolated) then `Exit-Dispatch 74` (the lease is open; the existing outer
       `finally` closes it and removes the pin).
    2. When `$script:authorMode -ceq 'create'`: `Test-Path -LiteralPath $authorFull` true, OR
       `Invoke-AuthorGit ls-files -- $authorPath` (same fail-closed handling) returns non-empty output →
       `Write-DispatchRefusalLine -Message "[dispatch] REFUSED (exit 74): -AuthorSpec create target '$authorPath' appeared before the pre-flight pin armed"`
       (double-quoted, interpolated) then `Exit-Dispatch 74`, with the same lease-close handling.
    3. `$baselineSkipped = $true`.
    4. `Write-Host '[dispatch] -AuthorSpec: spec, baseline and frontmatter pre-flight steps skipped; tree pin, critical-file check and scope check stay armed' -ForegroundColor Yellow`.
    The critical-file block before it, the `$preflightPinArmed` launch-boundary verify and the post-run
    scope check are untouched.
  - **(d) Post-run author check — placement:** immediately after the post-run scope-check
    `if ($scopeCheckArmed) { try { ... } catch { ... } }` block (~3853–3884) and before the
    `# --- Encoding gate` comment. When `$AuthorSpec -and -not $scopeCheckThrew`: set
    `$authorWritten = @()` when `$writtenPathsFile` does not exist, otherwise
    `$authorWritten = @(Get-Content -LiteralPath $writtenPathsFile -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })`
    (the `@(...)` wrapper is required: a one-line file otherwise yields a bare string). If NOT
    (`@($authorWritten).Count -eq 1` and `@($authorWritten)[0] -ceq $authorPath` and
    `Test-Path -LiteralPath $authorFull -PathType Leaf` and
    `-not ((Get-Item -LiteralPath $authorFull -Force).Attributes -band [System.IO.FileAttributes]::ReparsePoint)`,
    evaluated left to right so `Get-Item` only runs on an existing leaf): print
    `[dispatch] AUTHOR SCOPE VIOLATION: an -AuthorSpec run must leave exactly one regular file at '<path>' (written set: <comma-joined set or (none)>)`
    via `Write-Host -ForegroundColor Red`, set `$scopeViolation = $true`, and when `$scopeExit -eq 0`
    set `$scopeExit = 65`. The exit code is then NOT chosen here: the existing precedence routes it
    unchanged — 67 when the report is `blocked` (including a missing report after a child exit 0),
    then 69 (tree moved), then 66 (the scope check returned 66), then 65 (`$scopeViolation`). With
    `$scopeViolation` set the run can no longer reach `Exit-Dispatch 0`, which is the invariant. A run
    whose written set IS exactly the authorized regular file keeps every existing route, e.g. a child
    that exited non-zero with no report exits 1.
  - **(e) Ledger:** in the dispatch ledger row, after the `model` key from Task 1, add
    `dispatch_kind = $(if ($AuthorSpec) { 'author' } else { '' })` and
    `author_mode = $script:authorMode`.
  - done when: an authoring run in a repo with no `AGENTS.md` and no `docs/changes/<spec>.md` reaches
    launch with the pre-flight pin armed and verified; every refusal above exits 74 and prints its own
    message; a reparse-point target or ancestor is refused with 74 before launch; no `-AuthorSpec` run
    exits 0 unless its written set is exactly the one authorized regular file (a directory, a symlink,
    no write, a second path or only unauthorized paths is non-zero, with the code the existing
    precedence gives); the ledger row carries `model`, `dispatch_kind`, `author_mode` and
    `baseline_skipped = true`.

- [ ] **Task 3: fake-codex opt-in hooks** — files: `skills/apex-code/scripts/dispatch-test-fakecodex.ps1`
  - Immediately after `Set-Location $repo` and before `Add-Content -Path 'src/a.py' ...`, add two
    env-gated blocks; with the env vars unset the fake's behaviour is byte-for-byte unchanged:
    1. `if ($env:FAKE_CODEX_ARGV_FILE)`: write `$PassThruArgs` one element per line to that path with
       `[System.IO.File]::WriteAllLines(..., [System.Text.UTF8Encoding]::new($false))`.
    2. `if ($env:FAKE_CODEX_AUTHOR_PATH)` (fires ONLY when that variable is set and non-empty): resolve
       `Join-Path $repo $env:FAKE_CODEX_AUTHOR_PATH`. The write is exactly one of, first match wins:
       - `$env:FAKE_CODEX_AUTHOR_NO_WRITE -eq '1'`: write nothing at the path;
       - `$env:FAKE_CODEX_AUTHOR_AS_DIR -eq '1'`: create a DIRECTORY at that path and write `inner.md`
         inside it;
       - `$env:FAKE_CODEX_AUTHOR_AS_SYMLINK` non-empty (an absolute path outside the repo): write
         `fake symlink target` to that path, create the parent directory of the author path, then
         `cmd /c mklink "<author path>" "$env:FAKE_CODEX_AUTHOR_AS_SYMLINK"`. This branch fails loudly:
         the target write and directory creation use `-ErrorAction Stop`, and if `$LASTEXITCODE` from
         `mklink` is non-zero it prints `FAKE-CODEX: FAIL - mklink exit <code>`, writes no report and
         `exit 1` (never falls through to a silent no-write `done`);
       - otherwise: create its parent directory and overwrite the path (UTF-8 no BOM) with
         `"---`nspec: fake-author`n---`n# Spec: fake author draft`n"`.
       Then, if `$env:FAKE_CODEX_EXTRA_WRITE` is set, split it on `;` and, for each non-empty
       repo-relative entry, perform the same extra write as the existing extra-write block (the
       existing block, reached only on the default path, keeps its single-path behaviour). Then, if
       `$env:FAKE_CODEX_AUTHOR_FAIL_EXIT` is set (an integer), print `FAKE-CODEX: author fail exit`,
       write NO report and `exit ([int]$env:FAKE_CODEX_AUTHOR_FAIL_EXIT)`. Otherwise, unless
       `$env:FAKE_CODEX_NO_REPORT -eq '1'`, locate `-o <path>` in
       `$PassThruArgs` and write a `done` completion report whose `changed_files` is
       `@($env:FAKE_CODEX_AUTHOR_PATH)` (other fields as the existing in-scope-only report). Print
       `FAKE-CODEX: author write` and `exit 0`. It never touches `src/a.py`, `src/b.py`, `src/rogue.py`
       or `docs/status.md`.
  - Header comment: one line per new env var (`FAKE_CODEX_ARGV_FILE`, `FAKE_CODEX_AUTHOR_PATH`,
    `FAKE_CODEX_AUTHOR_NO_WRITE`, `FAKE_CODEX_AUTHOR_AS_DIR`, `FAKE_CODEX_AUTHOR_AS_SYMLINK`,
    `FAKE_CODEX_AUTHOR_FAIL_EXIT`).
  - done when: every existing suite that uses the fake passes unchanged, and the author suite drives
    every hook.

- [ ] **Task 4: `dispatch-author-test.ps1`** — files: `skills/apex-code/scripts/dispatch-author-test.ps1`
  - Style and harness copied from `dispatch-preflight-test.ps1` (not dot-sourced): one fresh temp
    root, `APEX_STATE_DIR` a sibling of all fixture repos, pre-created empty ledger, the ledger-mutex
    read helper, `Assert-Case` PASS/FAIL lines, a `finally` that restores `APEX_STATE_DIR`,
    `FAKE_CODEX_REPO`, `FAKE_CODEX_ARGV_FILE`, `FAKE_CODEX_AUTHOR_PATH`, `FAKE_CODEX_AUTHOR_NO_WRITE`,
    `FAKE_CODEX_AUTHOR_AS_DIR`, `FAKE_CODEX_AUTHOR_AS_SYMLINK`, `FAKE_CODEX_AUTHOR_FAIL_EXIT`,
    `FAKE_CODEX_EXTRA_WRITE`, `FAKE_CODEX_NO_REPORT`, `FAKE_CODEX_INSCOPE_ONLY` and removes the temp
    root; ends by printing an
    assertion/failure/skip count and `dispatch-author-test.ps1 PASSED` (exit 0) or
    `dispatch-author-test.ps1 FAILED` (exit 1). A skipped case prints
    `SKIP  <label> -- <reason>`, is counted as a skip (never as a pass), and does not fail the suite.
  - **Fixture:** each case gets its OWN new git repo with committed `src/a.py`, `docs/status.md` and
    `docs/drafts/keep.md`, and NO `AGENTS.md` and NO `docs/changes/` (the one exception is named in its
    case). Before every case the harness clears all `FAKE_CODEX_*` variables except `FAKE_CODEX_REPO`,
    then sets only those the case names. Author dispatches run in-process
    (`& $dispatch @parameters *>&1`) with `-Task author`, `-Spec` = the draft basename (a unique
    draft name per case), `-CodexExecutable powershell.exe` with the fake as prefix,
    `FAKE_CODEX_ARGV_FILE` pointing to a file under the temp root (outside every repo), and
    `FAKE_CODEX_AUTHOR_PATH` equal to the case's authorized path. Non-author cases leave
    `FAKE_CODEX_AUTHOR_PATH` unset and pass an explicit `-Authorized src/a.py` and a task other than
    `author`.
  - **Exit assertions:** every case expecting a failure asserts `$exit -ne 0` first, then the named
    code; the named code is only given where the wrapper's current control flow determines it. Output
    substrings are checked case-sensitively with `[string]::Contains` on the joined output.
  - **Cases** (each label appears verbatim in the file):
    - `author-create-happy` — `-AuthorSpec -Model gpt-6-sol -Authorized docs/drafts/new-spec.md`:
      exit 0; the draft exists with the fake content; the argv file has `-m` immediately followed by
      `gpt-6-sol`; the spec's dispatch ledger row has `dispatch_kind = author`, `author_mode = create`,
      `model = gpt-6-sol`, `phase = build`, `task = author`, `builder_family = openai`,
      `baseline_skipped = true`; output contains `[tree-pin] pinned`, `preflight-<spec>` and the
      Task 2(c) skip line.
    - `author-revise-happy` — an untracked `docs/drafts/rev-spec.md` pre-written; `-ExpectedDigest`
      = its `git hash-object`: exit 0; file content now the fake content; row `author_mode = revise`.
    - `author-revise-toctou` — as the revise case, plus `-CriticalFilesScript` pointing to a stub
      under the temp root (`param([switch]$Test, [string[]]$Paths, [string]$Root)`) that appends a line
      to `Join-Path $Root 'docs\drafts\<draft>.md'` and `exit 0`: exit 74; output contains
      `changed before the pre-flight pin armed` and the literal `revise target 'docs/drafts/<draft>.md'`
      (the real path, rendered); argv file absent; the run is located by taking the `run_id` of the
      spec's single `row_kind = lease` row, then selecting the ledger row with that `run_id` and
      `row_kind = lease_close`, which has status `refused-preflight` and `refusal_exit` 74; no
      `row_kind = dispatch` row exists for the spec.
    - `author-create-toctou` — create case (`docs/drafts/race-spec.md`), plus a `-CriticalFilesScript`
      stub of the same shape that CREATES `Join-Path $Root 'docs\drafts\race-spec.md'` and `exit 0`:
      exit 74; output contains `appeared before the pre-flight pin armed` and the literal
      `create target 'docs/drafts/race-spec.md'`; argv file absent; the `lease_close` row, located as in
      `author-revise-toctou`, has status `refused-preflight` and `refusal_exit` 74; no
      `row_kind = dispatch` row exists for the spec.
    - `author-control-nonauthor-72` — same fixture shape, plain build (`-Task task-1`,
      `-Authorized src/a.py`, no `-AuthorSpec`, no `-SkipBaselineCheck`): exit 72.
    - `author-default-model-argv` — plain build `-Task task-1 -Authorized src/a.py -SkipBaselineCheck`,
      `FAKE_CODEX_INSCOPE_ONLY=1`, no `-Model`: exit 0; argv has `-m` then `gpt-5.6-sol`; row
      `model = gpt-5.6-sol`, `dispatch_kind = ''`, `author_mode = ''`, `baseline_skipped = true`.
    - `author-model-outside-set` — child process `powershell.exe -NoProfile -ExecutionPolicy Bypass
      -File <dispatch> ... -Model gpt-5.6-luna`: exit code 1; output contains `Model`; zero ledger rows
      for the spec; argv file absent.
    - `author-model-mixed-case` — as above with `-Model GPT-6-SOL`: exit code 1; zero ledger rows;
      argv file absent.
    - `author-second-file-scope-violation` — create case with `FAKE_CODEX_EXTRA_WRITE=docs/drafts/other.md`:
      non-zero, 65; `docs/drafts/other.md` still present afterwards (nothing is reverted).
    - `author-two-unauthorized-66` — create case with `FAKE_CODEX_AUTHOR_NO_WRITE=1` and
      `FAKE_CODEX_EXTRA_WRITE=docs/drafts/stray-a.md;docs/drafts/stray-b.md` (report `done`, target
      never written): non-zero, 66 (two violations and zero authorized hits); output contains
      `AUTHOR SCOPE VIOLATION`; both stray files still present; the draft path does not exist.
    - `author-child-fail-no-report-1` — create case with `FAKE_CODEX_AUTHOR_FAIL_EXIT=3` (the target
      is written, then the child exits 3 with no report): non-zero, 1; output contains
      `child failed (exit 3)` and does NOT contain `AUTHOR SCOPE VIOLATION`.
    - `author-dir-escape` — create case with `FAKE_CODEX_AUTHOR_AS_DIR=1`: non-zero, 65; output
      contains `AUTHOR SCOPE VIOLATION`.
    - `author-symlink-target` — first probe: `cmd /c mklink "<probe link>" "<probe target>"` for a
      throwaway file link under the temp root; if `$LASTEXITCODE` is non-zero, print
      `SKIP  author-symlink-target -- cannot create symlinks on this host: <mklink output>` and count a
      skip (neither pass nor failure). Otherwise run a create case with `FAKE_CODEX_AUTHOR_AS_SYMLINK` =
      a file path under the temp root (outside every repo): non-zero, 65; output contains
      `AUTHOR SCOPE VIOLATION`; output does NOT contain `(none)` or `FAKE-CODEX: FAIL`; and afterwards
      the author path exists and `(Get-Item -LiteralPath <author path> -Force).Attributes` includes
      `ReparsePoint` (proving the 65 came from the symlink, not the no-write branch).
    - `author-no-write-blocked-67` — create case with `FAKE_CODEX_AUTHOR_NO_WRITE=1` and
      `FAKE_CODEX_NO_REPORT=1` (the fake exits 0 with no report, coerced to `blocked`): non-zero, 67;
      the draft path does not exist.
    - `author-no-write-done-65` — create case with `FAKE_CODEX_AUTHOR_NO_WRITE=1` only (report `done`):
      non-zero, 65; output contains `AUTHOR SCOPE VIOLATION` and `(none)`.
    - `author-reparse-revise-symlink-74` — uses the file-symlink probe result of
      `author-symlink-target` (on failure: `SKIP  author-reparse-revise-symlink-74 -- cannot create
      symlinks on this host: <mklink output>`). Write `original` to a file under the temp root, then
      `cmd /c mklink "<repo>\docs\drafts\link-spec.md" "<that file>"`; dispatch `-AuthorSpec
      -Authorized docs/drafts/link-spec.md -ExpectedDigest <40 a>`: exit 74; output contains
      `-AuthorSpec path 'docs/drafts/link-spec.md' is a reparse point (symlink or junction)`; zero
      ledger rows for the spec; argv file absent; the link target still reads `original`.
    - `author-reparse-drafts-junction-74` — probe `cmd /c mklink /J "<probe junction>" "<probe dir>"`
      under the temp root; on a non-zero `$LASTEXITCODE` print `SKIP  author-reparse-drafts-junction-74
      -- cannot create junctions on this host: <mklink output>` and count a skip. Otherwise, after the
      fixture commit, `Move-Item` the repo's `docs\drafts` to a directory under the temp root and
      `cmd /c mklink /J "<repo>\docs\drafts" "<that directory>"`; create dispatch `-AuthorSpec
      -Authorized docs/drafts/jn-spec.md`: exit 74; output contains
      `-AuthorSpec path 'docs/drafts' is a reparse point (symlink or junction)`; zero ledger rows for
      the spec; argv file absent; no `jn-spec.md` in the junction target.
    - Refusals — each asserts exit 74, its message substring below (so it cannot pass through a
      generic phase/schema/sandbox, scope-unlocked or other non-author refusal), zero ledger rows for
      the spec, argv file absent, and (where a draft pre-exists) its `git hash-object` unchanged:
      label (setup) → required substring:
      1. `author-refuse-phase-review` (`-Phase review`) → `-AuthorSpec implies -Phase build -Schema completion -Sandbox workspace-write (got 'review/completion/workspace-write')`
      2. `author-refuse-schema-review` (`-Schema review`) → `-AuthorSpec implies -Phase build -Schema completion -Sandbox workspace-write (got '/review/workspace-write')`
      3. `author-refuse-sandbox-readonly` (`-Sandbox read-only`) → `-AuthorSpec implies -Phase build -Schema completion -Sandbox workspace-write (got '/completion/read-only')`
      4. `author-refuse-zero-paths` (`-Authorized @()`) → `-AuthorSpec requires exactly one -Authorized path (got 0)`
      5. `author-refuse-two-paths` (`docs/drafts/a-spec.md`, `docs/drafts/b-spec.md`) → `-AuthorSpec requires exactly one -Authorized path (got 2)`
      6. `author-refuse-outside-changes` (`docs/changes/x.md`) → `-AuthorSpec path 'docs/changes/x.md' must match`
      7. `author-refuse-outside-uppercase` (`docs/drafts/Upper.md`) → `-AuthorSpec path 'docs/drafts/Upper.md' must match`
      8. `author-refuse-outside-subdir` (`docs/drafts/sub/x.md`) → `-AuthorSpec path 'docs/drafts/sub/x.md' must match`
      9. `author-refuse-trailing-newline` (`"docs/drafts/nl-spec.md`n"`) → the PowerShell string `"docs/drafts/nl-spec.md`n' must match"` (the rendered path keeps its newline)
      10. `author-refuse-skip-baseline` (`-SkipBaselineCheck`) → `-AuthorSpec cannot be combined with -SkipBaselineCheck`
      11. `author-refuse-scope-unlocked` (`-ScopeUnlocked -ScopeUnlockedReason x`) → `-AuthorSpec cannot be combined with -ScopeUnlocked`
      12. `author-refuse-shared-worktree` (`-AllowSharedWorktree -AllowSharedWorktreeReason x`) → `-AuthorSpec cannot be combined with -AllowSharedWorktree`
      13. `author-refuse-adopt` (`-Adopt`) → `-AuthorSpec cannot be combined with -Adopt`
      14. `author-refuse-list-obligations` (`-ListObligations`) → `-AuthorSpec cannot be combined with -ListObligations`
      15. `author-refuse-abandon` (`-AbandonRunId <32 hex> -AbandonReason x`) → `-AuthorSpec cannot be combined with -AbandonRunId`
      16. `author-refuse-task-not-author` (`-AuthorSpec -Task task-1`) → `-AuthorSpec requires -Task author (got 'task-1')`
      17. `author-refuse-spec-mismatch` (`-Spec other-name` with `docs/drafts/new-spec.md`) → `-AuthorSpec requires -Spec to equal the draft name 'new-spec' (got 'other-name')`
      18. `author-refuse-reserved-task-nonauthor` (plain build `-Task author -Authorized src/a.py -SkipBaselineCheck`) → `-Task author is reserved for -AuthorSpec dispatches`
      19. `author-refuse-digest-without-author` (plain build with `-ExpectedDigest`) → `-ExpectedDigest is only valid with -AuthorSpec`
      20. `author-refuse-digest-malformed` (`-ExpectedDigest XYZ`) → `-ExpectedDigest 'XYZ' is not a lowercase hex git object id`
      21. `author-refuse-create-tracked` (`docs/drafts/keep.md` deleted from disk, no digest) → `-AuthorSpec create target 'docs/drafts/keep.md' is tracked in git`
      22. `author-refuse-drafts-untracked-parent` (fixture exception: NO tracked file under `docs/drafts/`) → `-AuthorSpec needs at least one tracked file under docs/drafts/`
      23. `author-refuse-revise-target-missing` (absent path with a 40-hex digest) → `does not exist -- omit -ExpectedDigest to create it`
      24. `author-refuse-revise-digest-missing` (existing untracked draft, no digest) → `already exists -- a revise dispatch requires -ExpectedDigest`
      25. `author-refuse-revise-digest-mismatch` (existing draft, digest of 40 `a`) → `does not match -ExpectedDigest aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
      26. `author-refuse-target-is-directory` (a directory pre-created at `docs/drafts/dir-spec.md`) → `-AuthorSpec target 'docs/drafts/dir-spec.md' exists but is not a file`
      27. `author-refuse-git-failure` (fixture exception: after the commit, replace the repo's `.git`
          directory with a `.git` FILE containing `gitdir: <temp root>\missing-gitdir`, so every git
          call in the repo fails) → `-AuthorSpec could not verify`
    That is 27 `author-refuse-*` cases, one per author-specific pre-lease refusal line in Task 2(a)
    and (b) (the combination refusal once per flag, the pattern refusal once per shape); the two
    reparse cases are labelled `author-reparse-*` and are not in that count.
  - done when: the suite exits 0 with every case above passing (only `author-symlink-target`,
    `author-reparse-revise-symlink-74` and `author-reparse-drafts-junction-74` may SKIP, and only on
    their printed no-privilege reason).

- [ ] **Task 5: apex-code model sentence + registry row** — files: `skills/apex-code/SKILL.md`,
  `C:\users\user\apex\SKILL-HISTORY.md`
  - `SKILL.md` (~367–369): replace the sentence beginning `The wrapper` and ending `is family
    \`openai\`;` (it currently says the wrapper hardwires `gpt-5.6-sol` and has no `-CoderModel`
    parameter) with: ``The wrapper's `-Model` parameter admits only OpenAI models (`gpt-5.6-sol`, the
    default, and `gpt-6-sol`), so every wrapper-dispatched build, review or `-AuthorSpec` run is family
    `openai`;`` — the trailing clause `ledger family fields describe what it launched, not a caller's
    claim.` stays. Frontmatter: `version: 2.17.0` → `2.18.0`; `last_updated` → the build date.
  - `SKILL-HISTORY.md`: insert one row directly above the current first data row (the `| 2026-08-02 |
    apex-code, apex-orchestrate, ...` row):
    `| <build date> | apex-code | \`SKILL.md\`, \`scripts/codex-dispatch.ps1\`, \`scripts/dispatch-test-fakecodex.ps1\`, \`scripts/dispatch-author-test.ps1\` (new) | 2.18.0 | updated | wrapper-model-author: \`-Model\` (gpt-5.6-sol default, gpt-6-sol) and \`-AuthorSpec\`/\`-ExpectedDigest\` create/revise authoring dispatch (exit-74 refusals; reserved \`-Task author\`; spec/baseline/frontmatter pre-flight skipped; tree pin, critical-file check and scope check kept; one-regular-file post-run check; ledger \`model\`/\`dispatch_kind\`/\`author_mode\`); family sentence corrected. | docs/changes/done/wrapper-model-author.md |`
    This file is outside the `~/.claude` worktree: the host applies it at integration.
  - `C:\users\user\apex\SKILLS.md`: no change (no version column; no wrapper-model sentence).
  - done when: `hardwires` no longer appears in `SKILL.md`, the version reads `2.18.0`, and the history
    row is the first data row.

- [ ] **Task 6: verify fence** — files: `AGENTS.md`
  - In the `## Verify commands` fence, after the `dispatch-events-test.ps1` line, add exactly:
    ```
    powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1
    powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1
    powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1
    ```
    No prose between the heading and the fence; `## Preflight commands` unchanged.
  - done when: `apex-baseline-check.ps1 -Full -Worktree C:\Users\User\.claude` exits 0 with the new
    fence.

## Wave plan

Tasks 1 and 2 share `codex-dispatch.ps1`; Task 4 exercises Tasks 1–3; Task 6 names Task 4's suite in
the fence. The suite-case criteria for Tasks 1, 2 and 3 are verified in wave 3, once
`dispatch-author-test.ps1` exists; their `Select-String` criteria are verifiable in their own wave.

Wave 1: [Task 1, Task 3, Task 5] | Wave 2: [Task 2] | Wave 3: [Task 4] | Wave 4: [Task 6]

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (`status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, `status.md`, and spec archival — under D6.)
docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | `skills/apex-code/scripts/dispatch-author-test.ps1` |
| Modify | `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-test-fakecodex.ps1`, `skills/apex-code/SKILL.md`, `C:\users\user\apex\SKILL-HISTORY.md` (host) |
| Delete | (none) |
| **Attended confirmation required** | `AGENTS.md` (host-state — not pre-authorised here) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1` | New author/model suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1` | Pre-flight suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1` | Event suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-test.ps1` | Dispatch/adopt suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-scopelock-test.ps1` | Scope-lock suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-criticalfile-test.ps1` | Critical-file suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/verdict-test.ps1` | Verdict suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/careless-coder-test.ps1` | Fake-codex consumer (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/review-findings-test.ps1` | Fake-codex consumer (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1` | Encoding suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/family-gate-test.ps1` | Family-gate suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1` | Scope-check suite (regression; new fence line) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1` | Tree-pin suite (regression; new fence line) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-baseline-check.ps1 -Full -Worktree C:\Users\User\.claude` | Task 6 fence check |
| `git init` / `git add` / `git commit` / `git hash-object` / `git ls-files` inside temp fixture repos | Test fixtures only |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git status` / `git hash-object` / `git ls-files` | Read-only, build repo and temp fixtures |
| `git add -f` | host, at integration: the five `~/.claude` files in ## Files to Change, by name |
| `git add` | host, at integration: `SKILL-HISTORY.md` in `C:\users\user\apex` |
| `git commit` | host, after approval: "feat(apex-code): wrapper -Model and -AuthorSpec authoring dispatch" |

**The builder stages and commits nothing**, including inside `~/.claude`; fixture repos under the temp
root are the only place the build runs `git add`/`git commit`.

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR` | Test isolation of the ledger, logs, pins and events |
| `FAKE_CODEX_REPO`, `FAKE_CODEX_ARGV_FILE`, `FAKE_CODEX_AUTHOR_PATH`, `FAKE_CODEX_AUTHOR_NO_WRITE`, `FAKE_CODEX_AUTHOR_AS_DIR`, `FAKE_CODEX_AUTHOR_AS_SYMLINK`, `FAKE_CODEX_AUTHOR_FAIL_EXIT`, `FAKE_CODEX_EXTRA_WRITE`, `FAKE_CODEX_NO_REPORT`, `FAKE_CODEX_INSCOPE_ONLY` | Fake-codex fixture control |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network access |

## Specialist Context
### Security
`-AuthorSpec` widens nothing: the authorized set is one regex-pinned path under `docs/drafts/`, so no
critical path can be authorized; the critical-file classifier and the post-run scope check still run,
and the author post-run check refuses a directory, a symlink or any extra path at the authorized
location. Because the scope check cannot see writes through a symlink that points out of the repo,
the pre-flight refuses (74) a target or `docs`/`docs/drafts` ancestor that is already a reparse
point, before the lease and again after the pin arms.

### Performance
Task 6 adds three suites to the `## Verify commands` fence, which `apex-baseline-check.ps1 -Full`
runs; dispatch pre-flight into `~/.claude` runs `## Preflight commands` and is unaffected.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | `skills/apex-code/scripts/codex-dispatch.ps1` | One-line comment per new param and per new block |
| Inline | `skills/apex-code/scripts/dispatch-test-fakecodex.ps1` | Header lines for the six env vars |
| Skill | `skills/apex-code/SKILL.md` | Model sentence + version |
| Registry | `C:\users\user\apex\SKILL-HISTORY.md` | One row (double-write) |

## Acceptance Criteria

- [ ] Task 1 (wave 1) → verify: `Select-String -SimpleMatch "[ValidateSet('gpt-5.6-sol', 'gpt-6-sol', IgnoreCase = `$false)]" skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch '$coderModel = $Model' skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch 'model = $coderModel' skills/apex-code/scripts/codex-dispatch.ps1` matches
- [ ] Task 1 (verified in wave 3) → verify: cases `author-default-model-argv`, `author-model-outside-set` and `author-model-mixed-case` pass in `dispatch-author-test.ps1`
- [ ] Task 2 (wave 2) → verify: `Select-String -SimpleMatch '^docs/drafts/[a-z0-9-]+\.md\z' skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch "dispatch_kind = " skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch 'author_mode = $script:authorMode' skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch 'AUTHOR SCOPE VIOLATION' skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch '-Task author is reserved for -AuthorSpec dispatches' skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch '-AuthorSpec: spec, baseline and frontmatter pre-flight steps skipped' skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch 'is a reparse point (symlink or junction)' skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch 'function Assert-AuthorNoReparse' skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch '-AuthorSpec cannot be combined with' skills/apex-code/scripts/codex-dispatch.ps1` matches
- [ ] Task 2 (verified in wave 3) → verify: cases `author-create-happy`, `author-revise-happy`, `author-revise-toctou`, `author-create-toctou`, `author-control-nonauthor-72`, `author-second-file-scope-violation`, `author-two-unauthorized-66`, `author-child-fail-no-report-1`, `author-dir-escape`, `author-symlink-target`, `author-reparse-revise-symlink-74` and `author-reparse-drafts-junction-74` (each: pass, or SKIP with its printed no-privilege reason), `author-no-write-blocked-67`, `author-no-write-done-65` and all 27 `author-refuse-*` cases pass, each refusal case asserting its own message substring from Task 4; the unique `author-refuse-[a-z-]+` matches in `skills/apex-code/scripts/dispatch-author-test.ps1` (`Select-String -AllMatches`, values de-duplicated) number exactly 27
- [ ] Invariant (verified in wave 3) → verify: every author case expecting failure asserts `-ne 0` before its specific code (`Select-String -SimpleMatch '-ne 0' skills/apex-code/scripts/dispatch-author-test.ps1` matches), and no `-AuthorSpec` case other than `author-create-happy` and `author-revise-happy` expects exit 0
- [ ] Task 2 (wave 2) → verify (no new exit code): the set of integers captured by `Select-String -Pattern '(Exit-Dispatch|exit) (\d+)' -AllMatches -CaseSensitive` over `skills/apex-code/scripts/codex-dispatch.ps1` equals the same set over `git show HEAD:skills/apex-code/scripts/codex-dispatch.ps1 | Select-String -Pattern '(Exit-Dispatch|exit) (\d+)' -AllMatches -CaseSensitive`
- [ ] Task 3 (wave 1) → verify: `Select-String -SimpleMatch 'FAKE_CODEX_ARGV_FILE'`, `Select-String -SimpleMatch 'FAKE_CODEX_AUTHOR_PATH'` and `Select-String -SimpleMatch 'FAKE_CODEX_AUTHOR_AS_DIR'` and `Select-String -SimpleMatch 'FAKE_CODEX_AUTHOR_FAIL_EXIT'` all match in `skills/apex-code/scripts/dispatch-test-fakecodex.ps1`, and the fake-codex consumer suites in `## Commands` exit 0
- [ ] Task 3 (verified in wave 3) → verify: `author-create-happy` (argv + file hooks), `author-dir-escape` (directory hook), `author-symlink-target` (symlink hook, or its printed SKIP), `author-no-write-blocked-67` and `author-no-write-done-65` (no-write hook), `author-two-unauthorized-66` (`;`-split extra writes) and `author-child-fail-no-report-1` (fail-exit hook) pass
- [ ] Task 4 → verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1` exits 0 and prints `dispatch-author-test.ps1 PASSED`
- [ ] Task 5 → verify: `Select-String -SimpleMatch 'hardwires' skills/apex-code/SKILL.md` returns NO match; `Select-String -SimpleMatch "admits only OpenAI models" skills/apex-code/SKILL.md` matches; `Select-String -SimpleMatch 'version: 2.18.0' skills/apex-code/SKILL.md` matches; the first data row of `C:\users\user\apex\SKILL-HISTORY.md` contains `wrapper-model-author` and `2.18.0`
- [ ] Task 6 → verify: `Select-String -SimpleMatch 'tree-pin-test.ps1' AGENTS.md`, `Select-String -SimpleMatch 'scope-check-test.ps1' AGENTS.md` and `Select-String -SimpleMatch 'dispatch-author-test.ps1' AGENTS.md` all match inside the `## Verify commands` fence; `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-baseline-check.ps1 -Full -Worktree C:\Users\User\.claude` exits 0
- [ ] Task 6 → verify: at build time, `powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1`, `... scope-check-test.ps1` and `... dispatch-author-test.ps1` each exit 0
- [ ] Full suite green → verify: the HOST runs EVERY command in `## Commands`, not a repair subset, and each exits 0
- [ ] Scope — nothing written outside `## Files to Change` → verify: `~/.claude` ignores `*`, so a plain status cannot see a new file. Before the build the host saves `$before = @(git -C C:\Users\User\.claude status --porcelain --ignored -uall)` (the WHOLE tree, no pathspec); after the build it takes `$after` the same way, drops from both every line whose path (text after the two status characters and the space, forward-slash) equals or starts with `<prefix>/` for a prefix in `codex-scope-check.ps1`'s `$runtimeExclusions` (`sessions`, `projects`, `backups`, `jobs`, `shell-snapshots`, `todos`, `file-history`, `history.jsonl`, `.last-update-result.json`) or is a skill-sync marker file the prerequisite `synced-runtime-exclusion` runtime-excludes, and runs `Compare-Object $before $after`. The lines only in `$after` are exactly `!! skills/apex-code/scripts/dispatch-author-test.ps1` (new, ignored) plus ` M` lines for `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-test-fakecodex.ps1`, `skills/apex-code/SKILL.md` and `AGENTS.md` (after the host's `git add -f`: `A ` and `M ` instead), and nothing is only in `$before`. In `C:\users\user\apex`, the same before/after `Compare-Object` of `git -C C:\users\user\apex status --porcelain -uall` shows exactly one new line, ` M SKILL-HISTORY.md` (or `M  SKILL-HISTORY.md` once staged). Any other difference is out of scope (name it in the report)
- [ ] Reachability (end-to-end fixture check) — `-AuthorSpec` is reached through the real wrapper → verify: `author-create-happy` invokes the real `codex-dispatch.ps1` with `-AuthorSpec -Model gpt-6-sol -Task author`, the fake codex receives `-m gpt-6-sol` in its argv and writes the authorized draft, and the test reads the draft file and the dispatch ledger row back off disk (`dispatch_kind = author`, `author_mode = create`, `model = gpt-6-sol`). Production reachability (a real caller in doctrine) is proven by wave-2 spec `spec-author-routing`'s apex-plan caller, not here.

## Progress
_(The build writes here — do not edit manually)_
