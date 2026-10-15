---
spec: engine-args-utf8
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Decode Engine dispatch arguments as UTF-8
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Make the Engine's dispatch-argument and wrapper-report JSON reads explicit UTF-8 reads in PowerShell 5.1.

## Intent
- **Intent:** Preserve non-ASCII prompt characters from `Write-EngineDispatchArgs` through the child JSON bridge into the wrapper.
- **Invariants:** The three dispatch-argument reads and two `.final` report reads use `-Encoding UTF8`; the regression uses ASCII-only source and fails with the original child-bridge read.
- **Non-goals:** Other JSON reads, wrapper behavior, skill prose, and a skill version change.

## Assumptions
- `Write-EngineDispatchArgs` writes UTF-8 without BOM and the three named reads still omit `-Encoding`. → impact: Stop
- The two named `.final` report reads still omit `-Encoding`. → impact: Stop
- The capture-wrapper fixture and `Assert-EngineCase` are available in `engine-dispatch-test.ps1`; `apex-code/SKILL.md` is at version `2.27.0`. → impact: Stop

Simplicity check: five direct read edits and one child-bridge regression, with no helper or skill change.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/engine-dispatch.ps1 | modify | Task 1: three dispatch-argument reads. |
| skills/apex-code/scripts/engine-dispatch-test.ps1 | modify | Task 2: ASCII-only child-bridge regression. |
| skills/apex-code/scripts/codex-dispatch.ps1 | modify | Task 3: two `.final` report reads. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 4: newest history row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 5: first Unreleased Added bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-dispatch.ps1", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-dispatch-test.ps1", "op": "modify" }], "depends_on": ["1"] },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/codex-dispatch.ps1", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
- [ ] **Task 1** - Decode dispatch arguments as UTF-8 - files: `skills/apex-code/scripts/engine-dispatch.ps1` - done when all three reads below use the stated replacements and nothing else changes.
  - Replace each OLD line with its NEW line verbatim. Keep the backtick escapes in the child here-string.
  ```text
  OLD:     $preview = Get-Content -LiteralPath $argsFile -Raw | ConvertFrom-Json
  NEW:     $preview = Get-Content -LiteralPath $argsFile -Raw -Encoding UTF8 | ConvertFrom-Json
  OLD: `$raw = Get-Content -LiteralPath `$argsPath -Raw | ConvertFrom-Json
  NEW: `$raw = Get-Content -LiteralPath `$argsPath -Raw -Encoding UTF8 | ConvertFrom-Json
  OLD:         $argDoc = Get-Content -LiteralPath ([string]$meta.args_path) -Raw | ConvertFrom-Json
  NEW:         $argDoc = Get-Content -LiteralPath ([string]$meta.args_path) -Raw -Encoding UTF8 | ConvertFrom-Json
  ```
- [ ] **Task 2** - Cover non-ASCII prompt passage through the child bridge - files: `skills/apex-code/scripts/engine-dispatch-test.ps1` - done when the new case passes on the fixed Engine and fails on a copy with Task 1's old child read.
  - In the existing capture-wrapper fixture near the optional-executable cases, emit `prompt_hex` by formatting each char in `$Prompt` as four-digit uppercase hexadecimal and joining the codes with spaces; emit only ASCII output.
  - Build the new case's entire prompt from `[char]0x00A7`, `[char]0x00B7`, `[char]0x2014`, and `[char]0x2192`, in that order. Copy the existing `Write-EngineDispatchArgs` → `Start-EngineDispatch` → wait for the child → read capture pattern. Use `Assert-EngineCase 'non-ASCII prompt survives the child JSON bridge as UTF-8'` to compare `prompt_hex` with `00A7 00B7 2014 2192` and require child completion. Keep the test file ASCII-only and use PowerShell 5.1 syntax. HOST demonstrates RED on a copy with the Task 1 child read reverted, then GREEN on the fixed file.
- [ ] **Task 3** - Decode wrapper `.final` reports as UTF-8 - files: `skills/apex-code/scripts/codex-dispatch.ps1` - done when both report reads use the stated replacements and nothing else changes.
  - Replace each OLD line with its NEW line verbatim.
  ```text
  OLD:             $adoptReport = Get-Content -LiteralPath $match.final_path -Raw | ConvertFrom-Json
  NEW:             $adoptReport = Get-Content -LiteralPath $match.final_path -Raw -Encoding UTF8 | ConvertFrom-Json
  OLD:             $report = Get-Content -LiteralPath $finalPath -Raw | ConvertFrom-Json
  NEW:             $report = Get-Content -LiteralPath $finalPath -Raw -Encoding UTF8 | ConvertFrom-Json
  ```
- [ ] **Task 4 (HOST)** - Prepend one apex-code history row - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when this is the newest data row and occurs once.
  - Prepend this exact row:
  ```text
  | 2026-10-15 | apex-code (scripts only; SKILL.md unchanged) | `skills/apex-code/scripts/engine-dispatch.ps1`, `skills/apex-code/scripts/engine-dispatch-test.ps1`, `skills/apex-code/scripts/codex-dispatch.ps1` | 2.27.0 (SKILL.md unchanged) | updated | engine-args-utf8: Engine child bridge, args preview/adopt reads and wrapper .final reads decode UTF-8 explicitly (PS 5.1 ANSI default double-encoded non-ASCII prompts) | docs/changes/engine-args-utf8.md |
  ```
- [ ] **Task 5 (HOST)** - Add one changelog bullet - files: `C:/Users/User/apex/CHANGELOG.md` - done when this exact bullet is first under `## [Unreleased]` / `### Added` and occurs once.
  - Add this exact bullet: `- Engine dispatch arguments UTF-8 (2026-10-15, engine-args-utf8, apex-code scripts): decode dispatch arguments and wrapper .final reports explicitly as UTF-8; cover non-ASCII prompt passage through the PowerShell 5.1 child bridge.`

## Wave plan
Wave 1: [1, 3] | Wave 2: [2] | HOST: [4, 5] after coder work.

## Permissions
Coder tasks own only their manifest files. HOST owns the two bookkeeping files outside the manifest. No network or Git write operation is authorized by this spec.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-code/scripts/engine-dispatch.ps1 |
| Modify (coder Task 2) | skills/apex-code/scripts/engine-dispatch-test.ps1 |
| Modify (coder Task 3) | skills/apex-code/scripts/codex-dispatch.ps1 |
| Modify (HOST Task 4) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST Task 5) | C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1` | Run the focused regression suite. |
| Build repository Verify commands fence | Run the complete build-repository recipe. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | No staging or commits by the coder. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No environment variable required. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network operation. |

## Specialist Context
### Security
(none)

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends the Task 4 row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds the Task 5 bullet. |

## Acceptance Criteria
Tagged checks run from the build-repository root, read UTF-8, and normalize whitespace before `Contains` presence and absence checks. All checked literals occur verbatim in their task bodies. HOST owns the untagged RED proof, bookkeeping, full verify fence, and scope review.

- [ ] Task 1 - All three dispatch-argument reads specify UTF-8 → verify: the three NEW lines are present and the three OLD lines are absent; HOST confirms only these replacements occurred.
```powershell apex-accept
$t = (Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/scripts/engine-dispatch.ps1') -replace '\s+', ' '
$new = @('$preview = Get-Content -LiteralPath $argsFile -Raw -Encoding UTF8 | ConvertFrom-Json', '`$raw = Get-Content -LiteralPath `$argsPath -Raw -Encoding UTF8 | ConvertFrom-Json', '$argDoc = Get-Content -LiteralPath ([string]$meta.args_path) -Raw -Encoding UTF8 | ConvertFrom-Json')
$old = @('$preview = Get-Content -LiteralPath $argsFile -Raw | ConvertFrom-Json', '`$raw = Get-Content -LiteralPath `$argsPath -Raw | ConvertFrom-Json', '$argDoc = Get-Content -LiteralPath ([string]$meta.args_path) -Raw | ConvertFrom-Json')
foreach ($s in $new) { if (-not $t.Contains($s)) { throw "missing dispatch read: $s" } }
foreach ($s in $old) { if ($t.Contains($s)) { throw "old dispatch read: $s" } }
```
- [ ] Task 2 - The child bridge preserves the four prompt characters → verify: the exact case name and expected hexadecimal output are present, the test file contains only ASCII bytes, and the focused suite passes.
```powershell apex-accept
$t = (Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/scripts/engine-dispatch-test.ps1') -replace '\s+', ' '
if (-not $t.Contains("Assert-EngineCase 'non-ASCII prompt survives the child JSON bridge as UTF-8'")) { throw 'missing regression case' }
if (-not $t.Contains('00A7 00B7 2014 2192')) { throw 'missing expected prompt codes' }
foreach ($s in @('prompt_hex', '[char]0x00A7', '[char]0x00B7', '[char]0x2014', '[char]0x2192')) { if (-not $t.Contains($s)) { throw "missing regression literal: $s" } }
$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path 'skills/apex-code/scripts/engine-dispatch-test.ps1'))
if (@($bytes | Where-Object { $_ -gt 127 }).Count -gt 0) { throw 'test file is not ASCII-only' }
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-dispatch-test.ps1 failed' }
```
- [ ] Task 3 - Both wrapper `.final` reads specify UTF-8 → verify: the two NEW lines are present and the two OLD lines are absent; HOST confirms only these replacements occurred.
```powershell apex-accept
$t = (Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/scripts/codex-dispatch.ps1') -replace '\s+', ' '
$new = @('$adoptReport = Get-Content -LiteralPath $match.final_path -Raw -Encoding UTF8 | ConvertFrom-Json', '$report = Get-Content -LiteralPath $finalPath -Raw -Encoding UTF8 | ConvertFrom-Json')
$old = @('$adoptReport = Get-Content -LiteralPath $match.final_path -Raw | ConvertFrom-Json', '$report = Get-Content -LiteralPath $finalPath -Raw | ConvertFrom-Json')
foreach ($s in $new) { if (-not $t.Contains($s)) { throw "missing report read: $s" } }
foreach ($s in $old) { if ($t.Contains($s)) { throw "old report read: $s" } }
```
- [ ] Task 4 - HOST history bookkeeping is present → verify: the Task 4 row is the newest data row and occurs exactly once; run this untagged whitespace-normalized UTF-8 `Contains` check.
```powershell
$lines = Get-Content -Encoding UTF8 -LiteralPath 'C:/Users/User/apex/SKILL-HISTORY.md'
$row = '| 2026-10-15 | apex-code (scripts only; SKILL.md unchanged) | `skills/apex-code/scripts/engine-dispatch.ps1`, `skills/apex-code/scripts/engine-dispatch-test.ps1`, `skills/apex-code/scripts/codex-dispatch.ps1` | 2.27.0 (SKILL.md unchanged) | updated | engine-args-utf8: Engine child bridge, args preview/adopt reads and wrapper .final reads decode UTF-8 explicitly (PS 5.1 ANSI default double-encoded non-ASCII prompts) | docs/changes/engine-args-utf8.md |'
$t = (($lines -join ' ') -replace '\s+', ' ')
if (-not $t.Contains(($row -replace '\s+', ' '))) { throw 'history row missing' }
if (@($lines | Where-Object { $_ -eq $row }).Count -ne 1) { throw 'history row count' }
if (($lines | Where-Object { $_ -match '^\| \d{4}-\d{2}-\d{2} \|' } | Select-Object -First 1) -ne $row) { throw 'history row is not newest' }
```
- [ ] Task 5 - HOST changelog bookkeeping is present → verify: the Task 5 bullet is first under `## [Unreleased]` / `### Added` and occurs exactly once; run this untagged whitespace-normalized UTF-8 `Contains` check.
```powershell
$lines = Get-Content -Encoding UTF8 -LiteralPath 'C:/Users/User/apex/CHANGELOG.md'
$bullet = '- Engine dispatch arguments UTF-8 (2026-10-15, engine-args-utf8, apex-code scripts): decode dispatch arguments and wrapper .final reports explicitly as UTF-8; cover non-ASCII prompt passage through the PowerShell 5.1 child bridge.'
$t = (($lines -join ' ') -replace '\s+', ' ')
if (-not $t.Contains(($bullet -replace '\s+', ' '))) { throw 'changelog bullet missing' }
if (@($lines | Where-Object { $_ -eq $bullet }).Count -ne 1) { throw 'changelog bullet count' }
$added = [Array]::IndexOf($lines, '### Added')
if ($added -lt 0 -or ($lines[0..$added] -notcontains '## [Unreleased]')) { throw 'Unreleased Added section missing' }
if (($lines[($added + 1)..($lines.Length - 1)] | Where-Object { $_ -like '- *' } | Select-Object -First 1) -ne $bullet) { throw 'changelog bullet is not first' }
```
- [ ] Regression proof - the new case detects the original child read → verify: HOST runs the focused suite on an isolated copy with only the Task 1 child read reverted, observes that `non-ASCII prompt survives the child JSON bridge as UTF-8` fails, then reruns the suite with the fixed read and observes a pass.
- [ ] Build repository verify fence - HOST runs every command below from the build repository root → verify: this is the current `## Verify commands` fence of the build repository's AGENTS file, copied verbatim, and all commands pass.
```
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
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case core
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case recovery
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case resume
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case safety
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-close-test.ps1
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-map-check-test.ps1
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-size-guard-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```
- [ ] Scope - only the three script files and two HOST bookkeeping files in `## Files to Change` are written during the build → verify: HOST records pre-build `git status --porcelain -uall` and hashes for the five paths in both repositories, then compares post-build statuses and hashes. Every newly changed path is one of those five; other dirty paths predate the build and are named in the report. Each coder diff contains only its task's edit, the two HOST diffs contain only the row and bullet, and the parent skill file has no diff.
- [ ] Reachability - the real `Write-EngineDispatchArgs` → `Start-EngineDispatch` → child wrapper path preserves the prompt → verify: the Task 2 capture assertion equals `00A7 00B7 2014 2192` in the passing focused suite.

## Progress
_(The build writes here — do not edit manually)_
