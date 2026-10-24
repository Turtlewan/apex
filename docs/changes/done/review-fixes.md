---
spec: review-fixes
status: draft
autonomy_level: L2
risk: medium
---

# Spec: Whole-system review fixes 4b
<!-- Governing contract: skills/apex-code/references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->

**Identity:** Align coder verification instructions, normalize critical-file confirmation, exempt author stems, and audit Engine-committed scope paths.

## Intent

Apply the four selected whole-system review fixes from 2026-10-23: remove contradictory coder verification instructions, prevent false confirmation records and reuse, remove author-name classifier false positives, and include Engine-committed changes in scope audits.
Preserve the Engine versus manual/AFK verification boundary, existing critical-path positives and exits, recorded-confirmation adoption, and ScopeUnlocked behavior.
Engine tasks whose declared file set classifies non-critical no longer inherit the run-wide confirmation for critical descendants they write; such tasks must declare critical files explicitly.
The ignored-switch rule applies only to build-phase workspace-write dispatches where the pre-flight classifier runs; other phases are unchanged and out of scope.
Exclude consumer-repository AGENTS edits, changes to apex-engine's run-wide confirmation mechanism, apex-code SKILL.md edits (500-line cap), exit-code changes, skill-set changes, and planning-host status-file access.
Split waiver: seven build files with small edits are grouped into three file-disjoint tasks and one wave; each script and its regression cases remain in the same task.

## Assumptions

- Mode is Deep Details; risk is medium. The selected adjudication A1-A4 supersedes D1-D4. -> impact: Stop
- The build root is the worktree supplied for each dispatch, a checkout of the manifest repository. Every build path below is relative to that root. A different checkout location is valid and is not a stop condition. -> impact: Low
- The wrapper retains the `build` plus `workspace-write` pre-flight, `$critExit` classifier result, ledger confirmation fields, and `Invoke-PostHocGates` live/adoption call sites described in Task 2. -> impact: Stop
- HOST records each repository's pre-build integration base SHA and tracked/untracked dirty inventory before dispatch, retains the native verification output, and owns all bookkeeping tasks. Coders run only their own task's tagged checks, with required setup, and perform no Git operations. -> impact: Stop
- Native Windows PowerShell 5.1, Git, Node, and Python are available for HOST verification. Existing test-internal Git operations remain confined to disposable fixture repositories; Engine integration commits are build mechanics. -> impact: Stop
- No task may read, write, edit, or create the planning-host status file. Existing unrelated modified/untracked files remain untouched. -> impact: Stop

Simplicity check: three independent coder tasks; seven-file split waiver declared in Intent. HOST bookkeeping and full native verification stay outside the execution manifest.

## Prerequisites

none

## Files to Change

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-critical-files.ps1 | modify | Task 1: author-stem exemption in the existing prefix classifier |
| skills/apex-code/scripts/critical-files-test.ps1 | modify | Task 1: two positive and five negative cases; retain every existing critical case unchanged |
| skills/apex-code/scripts/codex-dispatch.ps1 | modify | Task 2: clear an inapplicable confirmation switch and note before downstream use; print live critical-path details |
| skills/apex-code/scripts/dispatch-criticalfile-test.ps1 | modify | Task 2: ignored-switch, live-gate, and adoption regressions |
| skills/apex-code/scripts/dispatch-test.ps1 | modify | Task 2: update the existing post-hoc directory-grant confirmation case |
| skills/apex-orchestrate/templates/AGENTS-template.md | modify | Task 3: align Workflow, queue, and baseline verification wording |
| skills/apex-orchestrate/templates/spec-template.md | modify | Task 3: HOST base-relative Scope criterion and its guidance comment |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST H1: apex-code and apex-orchestrate history rows |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST H2: one Unreleased bullet |

## Execution manifest

```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    {
      "id": "1",
      "repo": "claude",
      "files": [
        { "path": "skills/apex-code/scripts/apex-critical-files.ps1", "op": "modify" },
        { "path": "skills/apex-code/scripts/critical-files-test.ps1", "op": "modify" }
      ],
      "depends_on": []
    },
    {
      "id": "2",
      "repo": "claude",
      "files": [
        { "path": "skills/apex-code/scripts/codex-dispatch.ps1", "op": "modify" },
        { "path": "skills/apex-code/scripts/dispatch-criticalfile-test.ps1", "op": "modify" },
        { "path": "skills/apex-code/scripts/dispatch-test.ps1", "op": "modify" }
      ],
      "depends_on": []
    },
    {
      "id": "3",
      "repo": "claude",
      "files": [
        { "path": "skills/apex-orchestrate/templates/AGENTS-template.md", "op": "modify" },
        { "path": "skills/apex-orchestrate/templates/spec-template.md", "op": "modify" }
      ],
      "depends_on": []
    }
  ]
}
```

## Tasks

- [ ] **Task 1** - T1: update the author-stem exemption and classifier cases — files: `skills/apex-code/scripts/apex-critical-files.ps1`, `skills/apex-code/scripts/critical-files-test.ps1` — done when: the exact HOST-ruled exemption is applied, the added author cases and retained decoys return exit 0 with no critical output, the two added authorization cases return exit 10 with category `auth`, every existing critical case and assertion remains unchanged, and Task 1's tagged check passes.

  1. In the per-component `$stem` loop, retain `($stem -match '^(auth|oauth|crypto|middleware)')`, category `auth`, normalization, category precedence, and exit codes. Replace only the exact `author`/`authors` guard with `($stem -notmatch '^(author|authors|authoring|authority|authorities)([^a-z0-9]|$)')`, retaining the existing case-insensitive matching. A stem is exempt from this auth-prefix match only when it matches that exemption: `author`, `authors`, `author-pack`, `author_notes`, `authoring`, `authority`, and `authorities` are exempt; `authorization`, `authorize`, `authorizer`, `authenticator`, `authentication`, `authz`, `authn`, `auth`, `oauth2`, `cryptography`, `crypto`, and `middleware` remain critical. Do not introduce the superseded token-boundary classifier or a blanket `^author` exemption. The HOST ruling is final; no owner clarification is required.
  2. In `$testCases`, add and retain the fixture entries specified below.

  ```text
  Add author-pack.md, authoring/x.md, authority.md, authority/x.py, and authorities/x.py, each with ExitCode = 0 and Matches = @(). The last two are deliberate non-critical negative controls.
  Retain authors.md and AUTHOR/notes.md decoys unchanged.
  Add authorization.py and authorize/x.ts, each with ExitCode = 10 and Matches = @(@('CRITICAL', 'auth')).
  ```

  3. Retain every existing critical case and assertion unchanged, including the cases listed below. Do not change a positive to obtain green.

  ```text
  src/authenticator/svc.ts
  lib/cryptography/key.ts
  src/authorization/policy.py
  ```

  4. Run only Task 1's tagged classifier check. Stop and return to planning if the specified exemption cannot satisfy the retained critical cases.

- [ ] **Task 2** - T2: normalize an inapplicable confirmation before recording or using it — files: `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-criticalfile-test.ps1`, `skills/apex-code/scripts/dispatch-test.ps1` — done when: the zero-verdict arm clears both confirmation inputs before downstream consumers, the live and adoption call sites retain the specified confirmation sources, the live non-hard-block violation handler prints the captured classifier paths or the specified empty fallback before exit 77 while the hard-block line and adoption path stay unchanged, all listed regression cases and the existing dispatch-test directory-grant case update are implemented, and Task 2's tagged parse/wiring check passes.

  1. In the `if ($Phase -eq 'build' -and $Sandbox -eq 'workspace-write')` pre-flight, inside the non-`$ScopeUnlocked` classifier branch, insert `elseif ($critExit -eq 0 -and $CriticalFilesConfirmed)` after the critical-confirmed arm and before the invalid-verdict arm. Its body prints exactly one line `[dispatch] -CriticalFilesConfirmed ignored: no critical path in -Authorized`, sets `$CriticalFilesConfirmed = $false`, and sets `$CriticalFilesConfirmedNote = ''`. Do not refuse an otherwise valid dispatch or add an exit code.
  2. Keep classifier exits 11, 10, invalid/missing verdicts, and the `$ScopeUnlocked` branch unchanged. A critical authorized set with the switch still prints the existing attended-confirmation message and records its note; a ScopeUnlocked build still requires attended confirmation.
  3. Keep the ledger assignments `critical_files_confirmed = [bool]$CriticalFilesConfirmed` and `critical_files_confirmed_note = $(if ($CriticalFilesConfirmed) { $CriticalFilesConfirmedNote } else { '' })`. Keep the live `Invoke-PostHocGates` call's `-Confirmed $CriticalFilesConfirmed`. Both consume the cleared value after an ignored switch. Do not retain or rehydrate a raw switch through `$PSBoundParameters` or a saved copy.
  4. Keep recovery/adoption's `Invoke-PostHocGates` call bound only to `-Confirmed ([bool]$match.critical_files_confirmed)`. An adoption invocation's switch/note never replaces the row's recorded value. Rows written after the ignored-switch branch carry false and an empty note; existing genuinely confirmed rows remain usable. Do not migrate historical rows or alter the recorded-verdict adoption branch.
  5. In `codex-dispatch.ps1`, edit the live post-hoc violation handler's `if ($criticalViolation -eq $true)` block before `Exit-Dispatch 77`: for a non-hard-block violation, print exactly one line `[dispatch] critical path(s): <classifier lines joined by ', '>` using the already-captured `$criticalPaths`, or `[dispatch] critical path(s): (classifier named no paths)` when empty. Keep the hard-block line as is. The adoption path is unchanged.
  6. Extend `dispatch-criticalfile-test.ps1` using `New-FixtureRepo`, `New-FixtureSpec`, `Invoke-DispatchCase`, `Get-LedgerRowsForSpec`, `Add-FabricatedLedgerRow`, `Assert-Case`, and the existing fake. Keep all repositories/state disposable; extend the fixture allocation and valid fixture specs for each new build case. Preserve existing cases 1-19 and the deliberate case-3-to-case-8 LASTEXITCODE adjacency. Continue fixture numbering with cases 20-25 as specified below. Add the following assertions in this same task:

  ```text
     | Case | Inputs and fixture | Required assertions |
     |------|--------------------|---------------------|
     | 20: Ignored non-critical switch | `Authorized = @('src/a.py')`, switch true, nonempty note, `FAKE_CODEX_INSCOPE_ONLY = '1'` | Exit 0; ignored line occurs exactly once; one dispatch row has Boolean false and empty note; no critical-confirmed message |
     | Critical switch retained | Existing case 3, `Authorized = @('config/.env')`, switch true, note `attended tester` | Existing successful behavior; Boolean true and exact note; ignored line absent |
     | 21: Directory grant, no switch | `Authorized = @('src')`; fake writes its ordinary in-scope file plus `src/auth.py` via `FAKE_CODEX_EXTRA_WRITE`; in-scope-only true | Exit 77; dispatch row has false, empty note, `critical_violation = true`; assert `$output -match 'CRITICAL src[\\/]auth\.py: auth'` is true |
     | 22: Directory grant, ignored switch | Same write/grant in a separate fixture; switch true and a nonempty note | Exit 77; dispatch row has `critical_violation = true`; assert `$output -match 'CRITICAL src[\\/]auth\.py: auth'` is true; ignored line exactly once; row confirmation false and empty note |
     | 23: Adoption of ignored confirmation | Fabricated dead build row in the existing live-scope replay style: authorized `src`, confirmation false, empty note, armed scope snapshot, post-snapshot `src/auth.py` write, valid final report | Purpose: the adopt-time switch is not consulted. Run Adopt with a newly passed switch and note; exit 77 and `critical_violation = true`; false/empty recorded confirmation remains; adoption does not approve the write; no ignored line is expected in Adopt mode because pre-flight does not run |
     | Recorded true adoption retained | Existing confirmed live replay case 16 | Existing successful adoption and recorded true confirmation remain unchanged |
     | 24-25: ScopeUnlocked retained | Separate fixtures with no declared set: case 24 without switch, case 25 with switch | Unconfirmed still refuses at exit 76; confirmed retains existing behavior and note; neither prints the ignored line |
  ```

  7. Use the existing fake's `FAKE_CODEX_EXTRA_WRITE` hook; do not edit the fake or call a real model. Assert actual written-set gate output/ledger values rather than only the fake completion report's `changed_files`. Restore environment variables with the existing suite cleanup.
  8. In `dispatch-test.ps1`, update only the existing case labelled `post-hoc exit-10 confirmed proceeds` as specified below. No other dispatch-test case changes.

  ```text
  Relabel it 'post-hoc exit-10 directory grant ignores confirmation'. Retain Authorized = @('src'), switch true, and the fake extra write src/package-lock.json. Change the intended result to exit 77, critical_violation = true, and the ignored line '[dispatch] -CriticalFilesConfirmed ignored: no critical path in -Authorized' printed exactly once.
  ```

  9. Run only Task 2's tagged fast parse/wiring check as coder. HOST H3 runs the complete dispatch suites, including dispatch-test.ps1 and the new behavioral regressions, natively after integration.

- [ ] **Task 3** - T3: align the two template contracts — files: `skills/apex-orchestrate/templates/AGENTS-template.md`, `skills/apex-orchestrate/templates/spec-template.md` — done when: all three verification instructions select the dispatch checks for Engine and the repository recipe otherwise, baseline/dirty-tree/setup text is present, the scope slot uses both HOST base-relative commands including `--no-renames`, and Task 3's tagged structural check passes.

  1. In AGENTS-template Workflow step 3 under `## How to build a spec`, replace the unconditional recipe instruction with: `**Run the checks selected by your dispatch prompt.** When your dispatch prompt tells you to run only your task's own checks (Engine path), run only those; otherwise run this file's ` followed by the existing backticked `## Verify commands` reference and `(manual/AFK path) as today.` Retain the own-worktree instruction and the subsequent Engine/HOST integrated-verification authority wording; change its immediate pronoun to `those checks` as needed.
  2. In `## Building a queue of specs`, replace only `implement` through `green` in the `Either way:` clause with `implement -> run the checks selected by your dispatch prompt -> green`. Add the same Engine-only/otherwise-recipe selection sentence from Workflow step 3 before that clause. Retain scheduling, failure, integration, and commit-ownership text.
  3. Replace the Hard rules `**Baseline before building:**` lead instruction with: ``**Baseline before building:** the host's pre-dispatch pre-flight already proves the baseline. Before any edit, run any install/setup step the checks you were told to run need (e.g. `uv sync`, `npm ci`). Checks that test the change you are about to make are expected to fail before your edit; that is not a reason to stop. Stop and report only when a check fails for a reason unrelated to your task (a missing tool, a broken environment, an unrelated failing test).`` Keep command examples in backticks. Retain verbatim the sentence beginning `**Do NOT stop merely because the working tree has uncommitted changes**` and the following `Note what is already modified, then proceed.` sentence. Remove the unconditional full-recipe instruction and its old red-baseline wording.
  4. Leave template headings, placeholders, unrelated instructions, and verify-fence structure unchanged. Do not write a universal ban on the repository recipe. Do not edit any generated consumer AGENTS file.
  5. In spec-template `## Acceptance Criteria`, replace the Scope guidance comment and Scope criterion with a HOST-only instruction using `git diff --name-only --no-renames <base>` plus `git ls-files --others --exclude-standard`. Define `<base>` as the integration base SHA HOST records before the build. State that HOST audits the union of tracked changes from that base and untracked files against Files to Change, accounts for every declared changed path, and names pre-existing/concurrent-owner paths separately. Remove the old `git status --porcelain -uall` criterion and `-uall`/porcelain-status guidance from that Scope slot. Retain the explicit HOST-only/no-Git-in-tagged-fences instruction. Keep the Scope criterion outside every tagged fence; preserve the Reachability slot and other acceptance guidance.

- [ ] **Task 4 (HOST)** - H1: prepend one history row each for apex-code and apex-orchestrate, dated with the build date, using existing table columns and current skill versions without version bumps — files: `C:/Users/User/apex/SKILL-HISTORY.md` — done when: both rows name their actual changed script/test or template paths and `review-fixes`; the skill set/index is unchanged.
- [ ] **Task 5 (HOST)** - H2: add one bullet under Unreleased covering the verification boundary, ignored confirmation, author-name classifier fix, and base-relative scope audit — files: `C:/Users/User/apex/CHANGELOG.md` — done when: the bullet describes Tasks 1-3's integrated behavior and names `review-fixes`. Include this exact sentence in the bullet: "Engine tasks whose declared file set classifies non-critical no longer inherit the run-wide confirmation for critical descendants they write; such tasks must declare critical files explicitly." Keep apex-code SKILL.md unchanged (500-line cap); this CHANGELOG bullet carries the ignored-switch behaviour.
- [ ] **Task 6 (HOST)** - H3: run both critical-file suites, dispatch-test.ps1, and the complete integrated build-root AGENTS Verify commands fence in native Windows PowerShell, including engine-test — files: (none) — done when: all native commands pass, outputs/exits are retained, template structural checks pass, and the final A2 exemption is reflected consistently in classifier behavior and unchanged existing critical expectations.
- [ ] **Task 7 (HOST)** - H4: audit both repositories from their recorded pre-build base SHAs plus untracked inventories — files: (none) — done when: all seven build paths and two HOST bookkeeping paths are accounted for, and each additional path is attributed to the pre-build inventory or a separately owned concurrent change.
- [ ] **Task 8 (HOST)** - H5: inspect the HOST's consumer-repository inventory and list AGENTS files carrying the old full-recipe rule or unconditional Workflow/queue recipe instructions — files: (none) — done when: the HOST report lists consumer repository, AGENTS path, line number, and matching text for owner follow-up, or explicitly records no matches; no consumer file is edited.

## Wave plan

Wave 1: [task 1, task 2, task 3]. All three coder tasks are file-disjoint; manifest dependencies are empty. HOST Tasks 4-8 remain outside the manifest and follow integrated coder outputs; H3 and H4 precede close-out. HOST records base SHAs and dirty inventories before any build work.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths - .env, migrations, auth/authz/crypto, CI config, dependency manifests and lockfiles, infra-as-code, secrets/keys/certs, host-state, permission settings, and hooks - are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). The docs agents' three host's-pen artifacts remain governed by D6.

The audit tier remains refused outright on a path match; no confirmation or switch authorizes an audit write. No status-file access, consumer AGENTS edits, spec archival, or changes outside the listed files are authorized.

### File Operations

| Action | Paths |
|--------|-------|
| Create | None in build sources; existing suites may create disposable test fixtures |
| Modify | The seven relative build files in Files to Change, each exclusively owned by its manifest task |
| Modify, HOST only | `C:/Users/User/apex/SKILL-HISTORY.md`, `C:/Users/User/apex/CHANGELOG.md` |
| Delete | None in build sources; existing test cleanup is confined to disposable fixtures |

### Commands

| Command | Purpose |
|---------|---------|
| Task 1 tagged check | Fast classifier regression suite |
| Task 2 tagged check | Parse the owned scripts and inspect confirmation wiring |
| Task 3 tagged check | Inspect the two template contracts |
| Native HOST fence below | Full integrated verification and dispatch regressions |
| HOST scope commands below | Read-only base-relative audit of both repositories |
| HOST consumer search below | Read-only consumer instruction inventory |

### Git Operations

| Operation | Scope |
|-----------|-------|
| Coder Git operations | None; no staging, commit, push, checkout, reset, stash, branch, or scope-audit commands |
| Existing test-internal Git | Disposable fixture repositories only, during HOST integration suites |
| Engine integration commits | Build mechanics; never coder instructions |
| HOST Git audit | Read-only base capture, diff, and untracked enumeration in each repository |

### Environment Access

| Variable | Purpose |
|----------|---------|
| `TEMP` | Existing suites' isolated fixture roots |
| `APEX_STATE_DIR` | Existing suite's disposable ledger/state override; restore caller value |
| `FAKE_CODEX_REPO`, `FAKE_CODEX_INSCOPE_ONLY`, `FAKE_CODEX_EXTRA_WRITE` | Existing fake dispatch fixtures; restore caller values |
| `GIT_CONFIG_GLOBAL` | Existing suite's fixture-only Git configuration; restore caller value |

### Network

| Action | Purpose |
|--------|---------|
| None | No model calls, downloads, or new package installation specified |

## Specialist Context

### Security

Treat an ignored confirmation as absent for the ledger, live written-set gate, and recovery/adoption. Keep hard-block refusal, critical confirmation, missing/invalid-classifier refusal, and ScopeUnlocked behavior. Keep the classifier's existing prefix coverage, including authenticator and cryptography. Apply Task 1's exact author exemption while retaining authorization and authorize as critical. No permission is inferred from a run-wide note for an ignored task-level switch.
The exempt `author*`/`authority*`/`authorities*` stems covered by Task 1's exact guard are deliberately not auth-critical.

### Performance

Coders run only their own tagged checks. Tagged checks are ASCII-only, use build-relative paths, create no Git/index state, and contain no full recipe or engine-test invocation. Task 2's full fake-dispatch suite and engine-test run only in HOST's native Windows verification.

### Accessibility

No UI changes. Preserve the exact ASCII ignored-switch output line.

## Documentation

| Doc type | File | Action |
|----------|------|--------|
| Coder instructions | skills/apex-orchestrate/templates/AGENTS-template.md | Task 3: Workflow, queue, and baseline clauses |
| Spec instructions | skills/apex-orchestrate/templates/spec-template.md | Task 3: Scope guidance and criterion |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST H1: two update rows |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST H2: Unreleased bullet |

## Acceptance Criteria

- [ ] Task 1 - The case-insensitive auth-prefix match `^(auth|oauth|crypto|middleware)` is unchanged and exempts a stem only when it matches `^(author|authors|authoring|authority|authorities)([^a-z0-9]|$)`. The fixture expectations below apply. Every existing critical case and assertion in `critical-files-test.ps1` remains unchanged, including the retained critical case listed below; the complete fast classifier suite passes.

```text
author-pack.md, authoring/x.md, authority.md, deliberate negative controls authority/x.py and authorities/x.py, and retained authors.md and AUTHOR/notes.md return exit 0 with no critical output; added authorization.py and authorize/x.ts return exit 10 with category auth.
Retained critical case: src/authorization/policy.py
```

```powershell apex-accept
$ErrorActionPreference = 'Stop'
powershell.exe -NoProfile -File skills/apex-code/scripts/critical-files-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'Classifier regression suite failed' }
```

- [ ] Task 2 - All three owned scripts parse; the zero-verdict arm clears switch/note; ledger and live gates consume the cleared value, and adoption uses only the recorded row. The live non-hard-block violation handler prints the captured classifier paths or the specified empty fallback; the hard-block line and adoption path are unchanged. Behavioral cases in Task 2, including the existing dispatch-test directory-grant case update, are implemented and run by HOST H3.
```powershell apex-accept
$ErrorActionPreference = 'Stop'
foreach ($path in @('skills/apex-code/scripts/codex-dispatch.ps1', 'skills/apex-code/scripts/dispatch-criticalfile-test.ps1', 'skills/apex-code/scripts/dispatch-test.ps1')) {
    $tokens = $null
    $errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile((Join-Path (Get-Location).Path $path), [ref]$tokens, [ref]$errors)
    if ($errors.Count -ne 0) { throw ('Parse failure: ' + $path) }
}
$dispatch = Get-Content -LiteralPath 'skills/apex-code/scripts/codex-dispatch.ps1' -Raw
$arm = [regex]::Match($dispatch, '(?s)elseif\s*\(\$critExit -eq 0 -and \$CriticalFilesConfirmed\)\s*\{(?<body>.*?)\r?\n\s*\}')
if (-not $arm.Success) { throw 'Missing zero-verdict confirmation arm' }
$body = $arm.Groups['body'].Value
$ignored = '[dispatch] -CriticalFilesConfirmed ignored: no critical path in -Authorized'
if ([regex]::Matches($body, [regex]::Escape($ignored)).Count -ne 1) { throw 'Ignored-switch message differs' }
if ($body -notmatch '\$CriticalFilesConfirmed\s*=\s*\$false') { throw 'Confirmation switch not cleared' }
if ($body -notmatch "\`$CriticalFilesConfirmedNote\s*=\s*''") { throw 'Confirmation note not cleared' }
foreach ($needle in @(
    'critical_files_confirmed = [bool]$CriticalFilesConfirmed',
    'critical_files_confirmed_note = $(if ($CriticalFilesConfirmed) { $CriticalFilesConfirmedNote } else { '''' })',
    '-Confirmed $CriticalFilesConfirmed -BaselineHeadSha $headSha',
    '-Confirmed ([bool]$match.critical_files_confirmed)'
)) {
    if (-not $dispatch.Contains($needle)) { throw ('Confirmation consumer differs: ' + $needle) }
}
```

- [ ] Task 3 - Workflow, queue, and baseline clauses use the selected verification boundary; the Scope slot contains both base-relative HOST commands and excludes the old status criterion.
```powershell apex-accept
$ErrorActionPreference = 'Stop'
$agents = Get-Content -LiteralPath 'skills/apex-orchestrate/templates/AGENTS-template.md' -Raw
$workflow = [regex]::Match($agents, '(?ms)^## How to build a spec[^\r\n]*\r?\n(?<body>.*?)(?=^## |\z)').Groups['body'].Value
$queue = [regex]::Match($agents, '(?ms)^## Building a queue of specs\r?\n(?<body>.*?)(?=^## |\z)').Groups['body'].Value
$hard = [regex]::Match($agents, '(?ms)^## Hard rules[^\r\n]*\r?\n(?<body>.*?)(?=^## |\z)').Groups['body'].Value
foreach ($section in @($workflow, $queue)) {
    if (-not $section.Contains('When your dispatch prompt tells you to run only your task''s own checks (Engine path), run only those; otherwise run this file''s')) { throw 'Missing dispatch verification selection' }
    if (-not $section.Contains('`## Verify commands` (manual/AFK path) as today.')) { throw 'Missing manual recipe selection' }
}
if (-not $queue.Contains('implement -> run the checks selected by your dispatch prompt -> green')) { throw 'Queue verification clause differs' }
foreach ($needle in @(
    'the host''s pre-dispatch pre-flight already proves the baseline.',
    'Before any edit, run any install/setup step the checks you were told to run need (e.g. `uv sync`, `npm ci`).',
    'Checks that test the change you are about to make are expected to fail before your edit; that is not a reason to stop.',
    'Stop and report only when a check fails for a reason unrelated to your task (a missing tool, a broken environment, an unrelated failing test).',
    '**Do NOT stop merely because the working tree has uncommitted changes**',
    'Note what is already modified, then proceed.'
)) {
    if (-not $hard.Contains($needle)) { throw ('Baseline instruction missing: ' + $needle) }
}
if ($hard -match 'run the \*\*full\*\* verify recipe once first') { throw 'Old unconditional baseline remains' }
$template = Get-Content -LiteralPath 'skills/apex-orchestrate/templates/spec-template.md' -Raw
$scope = [regex]::Match($template, '(?ms)^<!-- Scope check.*?(?=^<!-- Reachability)').Value
if ([string]::IsNullOrWhiteSpace($scope)) { throw 'Scope guidance slot missing' }
foreach ($needle in @('diff --name-only --no-renames <base>', 'ls-files --others --exclude-standard', 'HOST', 'integration base SHA')) {
    if (-not $scope.Contains($needle)) { throw ('Scope instruction missing: ' + $needle) }
}
if ($scope.Contains('status --porcelain') -or $scope.Contains('-uall')) { throw 'Old Scope status guidance remains' }
if ($scope -match '(?m)^```powershell apex-accept\s*$') { throw 'Scope must remain HOST-only' }
```

- [ ] Task 4 - HOST H1: both history rows match the integrated paths, current versions, build date, and spec identity. No skill-set/index edit is required.
- [ ] Task 5 - HOST H2: the Unreleased bullet covers all four final fixes and matches the final A2 exemption.
- [ ] Task 6 - HOST H3: run the following untagged fence from the integrated build root in the HOST's native Windows session; retain each command and exit/output. Both critical-file suites and dispatch-test.ps1 pass, including the real live/post-build and adoption regressions. Every command in the integrated AGENTS Verify commands fence passes, including engine-test. Run the three tagged checks once against integration, review the unchanged template structure, and verify existing file/skill caps and pointers without status-file access. No full recipe is assigned to a coder.

```powershell
# HOST only: native Windows PowerShell, integrated build-root cwd.
$ErrorActionPreference = 'Stop'
foreach ($suite in @('critical-files-test.ps1', 'dispatch-criticalfile-test.ps1', 'dispatch-test.ps1')) {
    powershell.exe -NoProfile -File (Join-Path 'skills/apex-code/scripts' $suite)
    if ($LASTEXITCODE -ne 0) { throw ('Native suite failed: ' + $suite) }
}
$agents = Get-Content -LiteralPath 'AGENTS.md' -Raw
$section = [regex]::Match($agents, '(?ms)^## Verify commands\r?\n(?<body>.*?)(?=^## |\z)')
if (-not $section.Success) { throw 'Missing integrated Verify commands section' }
$fences = [regex]::Matches($section.Groups['body'].Value, '(?ms)^```[^\r\n]*\r?\n(?<body>.*?)^```\s*$')
if ($fences.Count -ne 1) { throw 'Expected one integrated verify fence' }
$recipe = $fences[0].Groups['body'].Value
if (-not $recipe.Contains('skills/apex-code/scripts/engine-test.ps1')) { throw 'Native engine test missing from recipe' }
foreach ($line in ($recipe -split '\r?\n')) {
    $command = $line.Trim()
    if (-not $command -or $command.StartsWith('#')) { continue }
    Write-Output ('HOST verify: ' + $command)
    $LASTEXITCODE = $null
    & ([scriptblock]::Create($command))
    if ($null -eq $LASTEXITCODE -or $LASTEXITCODE -ne 0) { throw ('Native verify failed: ' + $command) }
}
```

- [ ] Task 7 - HOST H4 Scope - nothing written outside Files to Change. Before the build, record an integration base SHA and dirty/untracked inventory for each repository. After integration, audit the union of `git diff --name-only --no-renames <base>` and `git ls-files --others --exclude-standard`; account for every listed changed path and report every additional path against the pre-build/concurrent-owner inventory. Engine-committed paths remain included. This is a HOST check, outside all tagged fences.

```powershell
# HOST only: run separately in each repository with its recorded pre-build SHA.
# $base is that repository's integration base SHA recorded before the build.
if ([string]::IsNullOrWhiteSpace($base)) { throw 'HOST must supply the recorded base SHA' }
git diff --name-only --no-renames $base --
if ($LASTEXITCODE -ne 0) { throw 'Base-relative scope diff failed' }
git ls-files --others --exclude-standard
if ($LASTEXITCODE -ne 0) { throw 'Untracked scope inventory failed' }
# Compare the union against Files to Change and the recorded dirty/concurrent inventory.
```

- [ ] Task 8 - HOST H5: enumerate root and nested consumer AGENTS files from the HOST repository inventory, record matching paths/lines/text in the HOST report, and make no consumer edits. Inspect baseline, Workflow step 3, and queue clauses in each match; explicitly report no matches if the list is empty.

```powershell
# HOST only: repeat from each consumer repository root in the HOST inventory.
rg -n --hidden -g AGENTS.md -g '!.git/**' -g '!node_modules/**' -g '!.venv/**' 'run the \*\*full\*\* verify recipe once first|\*\*Run this file.s.*Verify commands|run the verify recipe' .
if ($LASTEXITCODE -gt 1) { throw 'Consumer AGENTS search failed' }
# Exit 1 means no matches. Record repository, path, line, and matched text; do not edit.
```

- [ ] Reachability - HOST H3's real wrapper/fake-coder dispatches exercise pre-flight classification, ledger recording, the live written-set gate, and adoption replay. Confirm that directory authorization plus an ignored switch cannot approve a subsequently written critical descendant, while explicitly critical authorized sets and recorded true adoption retain their existing outcomes. The classifier suite reaches the actual classifier entry point; Task 3's structural check covers the instruction/template boundaries.

## Progress

_(The build writes here - do not edit manually)_
