---
spec: engine-accept-timeout
status: draft
autonomy_level: L2
risk: low
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Engine acceptance timeout
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Give each tagged Engine acceptance check a state-backed `-AcceptTimeoutMin` limit.

## Intent
- **Intent:** Set the acceptance-check limit from the Engine CLI, persist it for new runs, and allow a bound value to replace it on resume.
- **Invariants:** `-NoOutputTimeoutMin` behavior is unchanged; legacy states without `accept_timeout_min` remain schema-valid and use 60 minutes on resume; the `APEX_ENGINE_TEST_ACCEPT_TIMEOUT_MS` test-mode override keeps working.
- **Non-goals:** Wrapper timeout plumbing, skill prose, and changes to untagged verification checks.

## Assumptions
- The Engine runs tagged `powershell apex-accept` blocks through `Invoke-RunnerAcceptanceCheck` (`apex-engine.ps1:1013`). -> impact: Stop
- The shared `engine-test.ps1` path continues after the full-suite guard closes at `:2504`. -> impact: Stop

Simplicity check: mirror the existing state-backed timeout binding and resume pattern.

## Prerequisites
none

## Files to Change
Grep evidence: exact, case-sensitive occurrence counts from UTF-8 reads of the live files; all four timeout patterns were checked in each Task 1 file.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-engine.ps1 | modify | Task 1 CLI, state, resume, and acceptance runner. |
| skills/apex-code/scripts/engine-test.ps1 | modify | Task 1 CLI, schema, state, resume, and expiry coverage. |
| skills/apex-code/references/engine-state-schema.json | modify | Task 1 optional bounded state field. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 2 top scripts-only row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 2 Unreleased Changed bullet. |

Grep evidence: `apex-engine.ps1`: `no_output_timeout_min` **3**, `NoOutputTimeoutMin` **5**, `timed out after` **1**, `APEX_ENGINE_TEST_ACCEPT_TIMEOUT_MS` **2**.
Grep evidence: `engine-test.ps1`: `no_output_timeout_min` **6**, `NoOutputTimeoutMin` **4**, `timed out after` **1**, `APEX_ENGINE_TEST_ACCEPT_TIMEOUT_MS` **3**.
Grep evidence: `engine-state-schema.json`: `no_output_timeout_min` **1**, `NoOutputTimeoutMin` **0**, `timed out after` **0**, `APEX_ENGINE_TEST_ACCEPT_TIMEOUT_MS` **0**.
Grep evidence: `SKILL-HISTORY.md`: `(?m)^\| \d{4}-\d{2}-\d{2} \| apex-code \|` **71**.
Grep evidence: `CHANGELOG.md`: `(?m)^## \[Unreleased\]$` **1**; `(?m)^### Changed$` **1**.

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [
      { "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" },
      { "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" },
      { "path": "skills/apex-code/references/engine-state-schema.json", "op": "modify" }
    ], "depends_on": [] }
  ]
}
```

## Tasks
- [ ] **Task 1** - In `apex-engine.ps1`, add `[ValidateRange(1, 240)][int]$AcceptTimeoutMin = 60` in the CLI param block (`:2-21`) and a `$PSBoundParameters.ContainsKey('AcceptTimeoutMin')` script flag beside `EngineNoOutputTimeoutBound` (`:39`). Add `accept_timeout_min = $AcceptTimeoutMin` to `New-RunnerStateObject` beside `no_output_timeout_min` (`:1777-1800`). In `Initialize-RunnerResume`, when the new parameter is bound, use `Add-Member -Force` and `Save-RunnerState` beside the no-output override (`:1907-1910`); an unbound resume retains the recorded value or absence. In `Invoke-RunnerAcceptanceCheck` (`:1013`, `:1044-1055`), read `accept_timeout_min` from `$script:EngineState.PSObject.Properties`, use 60 when absent, multiply the effective configured minutes by 60000 for `WaitForExit`, and keep the `APEX_ENGINE_TEST_MODE` plus positive-integer `APEX_ENGINE_TEST_ACCEPT_TIMEOUT_MS` override (`:1045-1046`) capped at that computed limit. Append `timed out after <N> min` with N equal to the configured or legacy-fallback minutes (`:1053`), including when test mode shortened the wait. Leave the independent no-output sites at `:6`, `:39`, `:622`, `:636`, `:1790`, `:1907-1910` unchanged. In `engine-state-schema.json`, add optional `"accept_timeout_min": { "type": "integer", "minimum": 1, "maximum": 240 }` beside `no_output_timeout_min` (`:59`), outside `required` (`:7-12`). In `engine-test.ps1`, mirror the existing no-output cases at `:823-915`: CLI rejects 0 and 241 (`:825`), new state stores default 60 and an explicit value (`:831`, `:845`), new and field-removed legacy states validate (`:850-854`), and schema rejects 0 and 241 (`:856-864`); resume with a bound value overwrites and saves, unbound retains a stored value, and legacy unbound retains the missing field while acceptance uses 60 (`:889-913`). Put all new CLI/state/schema/resume and effective-limit cases in the shared path after the full-suite guard (`:792`, `:2504`), not inside it. In the shared acceptance-child cases (`:2505-2538`), change the existing `EndsWith('timed out after 10 min')` assertion at `:2538` to 60, assert a configured nondefault minute value in the expiry tail, and assert the `APEX_ENGINE_TEST_ACCEPT_TIMEOUT_MS = '1000'` override at `:2534-2536` still expires and kills the child; retain its cleanup at `:2951`. Use the existing `Test-Structure` and `Initialize-RunnerResume` fixture patterns; no new file. - files: `skills/apex-code/scripts/apex-engine.ps1`, `skills/apex-code/scripts/engine-test.ps1`, `skills/apex-code/references/engine-state-schema.json` — done when the acceptance limit is bounded, durable, overridable on resume, legacy-safe, and covered by `-AcceptanceOnly`.
- [ ] **Task 2 (HOST)** - Prepend one `engine-accept-timeout` apex-code `2.23.1 (scripts only)` row to `C:/Users/User/apex/SKILL-HISTORY.md`, naming `skills/apex-code/scripts/apex-engine.ps1`, `skills/apex-code/scripts/engine-test.ps1`, and `skills/apex-code/references/engine-state-schema.json`. Add one bullet naming `engine-accept-timeout` under `## [Unreleased]` / `### Changed` in `C:/Users/User/apex/CHANGELOG.md`. Do not bump `SKILL.md` or edit `SKILLS.md`. - files: `C:/Users/User/apex/SKILL-HISTORY.md`, `C:/Users/User/apex/CHANGELOG.md` — done when the top history data row and isolated Unreleased Changed subsection name the change.

## Wave plan
Wave 1: [1] | HOST: [2].

## Permissions
Coder Task 1 edits only its three `files:` paths. It runs `engine-test.ps1 -AcceptanceOnly` and all 15 build-repository Verify commands. HOST alone performs Task 2. No live-repository Git operations, package installation, or network operation; Git activity inside temporary test fixtures is permitted.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/scripts/engine-test.ps1, skills/apex-code/references/engine-state-schema.json |
| Modify (HOST Task 2) | C:/Users/User/apex/SKILL-HISTORY.md, C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1 -AcceptanceOnly` | Task 1 tagged acceptance suite. |
| Build repository `AGENTS.md` Verify commands fence | Run all 15 commands from the build repository root. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Fixture setup and assertions | Temporary test repositories only. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_ENGINE_TEST_MODE`, `APEX_ENGINE_TEST_ACCEPT_TIMEOUT_MS` | Existing test-only acceptance wait override. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package or network access. |

## Specialist Context
### Security
(none)

### Performance
The tagged suite is `engine-test.ps1 -AcceptanceOnly`; run the full `engine-test.ps1` only in the untagged Verify fence.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends scripts-only row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds Unreleased Changed bullet. |

## Acceptance Criteria
- [ ] Task 1 - acceptance timeout CLI, state, schema, resume, and expiry behavior pass in the shared test path -> verify: `-AcceptanceOnly` exercises all new and changed assertions, including the test-mode override and legacy 60-minute fallback.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1 -AcceptanceOnly
if ($LASTEXITCODE -ne 0) { throw 'engine-test -AcceptanceOnly failed' }
```
- [ ] Task 2 - HOST records the scripts-only change -> verify: both untagged checks below pass after HOST writes the history row and changelog bullet.
- [ ] HOST history - the top data row names `engine-accept-timeout` -> verify:
```powershell
$history = Get-Content -LiteralPath 'C:/Users/User/apex/SKILL-HISTORY.md' -Encoding UTF8
$topRow = $history | Select-String -Pattern '^\| \d{4}-\d{2}-\d{2} \|' | Select-Object -First 1
if ($null -eq $topRow -or $topRow.Line -notmatch 'engine-accept-timeout') { throw 'SKILL-HISTORY top data row missing engine-accept-timeout' }
```
- [ ] HOST changelog - the Unreleased Changed subsection has an `engine-accept-timeout` bullet -> verify:
```powershell
$changelog = Get-Content -LiteralPath 'C:/Users/User/apex/CHANGELOG.md' -Encoding UTF8 -Raw
$unreleased = [regex]::Match($changelog, '(?ms)^## \[Unreleased\]\s*\r?\n(?<body>.*?)(?=^## |\z)')
$changed = [regex]::Match($unreleased.Groups['body'].Value, '(?ms)^### Changed\s*\r?\n(?<body>.*?)(?=^### |^## |\z)')
if (-not $unreleased.Success -or -not $changed.Success -or -not [regex]::IsMatch($changed.Groups['body'].Value, '(?m)^- .*engine-accept-timeout')) { throw 'CHANGELOG Unreleased Changed bullet missing engine-accept-timeout' }
```
- [ ] Build repository verify fence - run all 15 commands from the build repository root -> verify: the command lines below are copied verbatim from its `AGENTS.md` `## Verify commands` fence.
```powershell
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-plan-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```
- [ ] Scope - only the five `## Files to Change` paths are written -> verify: HOST compares the pre-build dirty-path baseline with `git status --porcelain -uall` in both repositories and names pre-existing unrelated paths.
- [ ] Reachability - the live Engine applies the CLI value to a tagged acceptance child -> verify: Task 1's shared-path acceptance-child cases invoke `Invoke-RunnerAcceptanceCheck` with default, explicit, and legacy states, and assert the expiry tail and terminated process.

## Progress
_(The build writes here - do not edit manually)_
