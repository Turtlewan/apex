---
spec: launcher-stdin
status: built
autonomy_level: L2
risk: low
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Launcher stdin
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Close redirected Git child stdin in the Engine and drain launchers, with bounded job-host regressions.

## Intent
- **Intent:** Make both Git launchers finish when called from a PowerShell `Start-Job` host.
- **Invariants:** Each launcher redirects stdin and closes it immediately after a successful process start, before reading stdout or stderr. Both existing suites cover the real launcher function inside a job with a 60-second bound. Launcher changes are limited to those two stdin operations; the `# BEGIN/END build-outputs lockstep` block in the Engine stays untouched. Script source stays ASCII-only.
- **Non-goals:** Other process launches, Codex child processes, `Start-Process` calls, and behavior beyond Git child stdin handling.

## Assumptions
- Build and tests run under Windows PowerShell 5.1 with Git for Windows available as `git.exe`. -> impact: Stop
- The existing test suites can create small Git repositories beneath their temporary fixture roots. -> impact: Stop

Simplicity check: Add the two stdin operations to each existing Git launcher and one bounded regression to each existing suite.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-engine.ps1 | modify | Task 1 redirects and closes Git child stdin. |
| skills/apex-code/scripts/engine-git-test.ps1 | modify | Task 1 job-host Git byte regression. |
| skills/apex-code/scripts/apex-drain.ps1 | modify | Task 2 redirects and closes Git child stdin. |
| skills/apex-code/scripts/apex-drain-test.ps1 | modify | Task 2 core job-host Git status regression. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 3 top scripts-only row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 4 Unreleased Fixed bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [
      { "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" },
      { "path": "skills/apex-code/scripts/engine-git-test.ps1", "op": "modify" }
    ], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [
      { "path": "skills/apex-code/scripts/apex-drain.ps1", "op": "modify" },
      { "path": "skills/apex-code/scripts/apex-drain-test.ps1", "op": "modify" }
    ], "depends_on": [] }
  ]
}
```

## Tasks
- [x] **Task 1** - In `apex-engine.ps1` `Invoke-RunnerGitBytes`, set `$startInfo.RedirectStandardInput = $true` and call `$process.StandardInput.Close()` immediately after successful `Start()`, before stdout or stderr reads; change nothing else in the launcher and leave the `# BEGIN/END build-outputs lockstep` block untouched. In `engine-git-test.ps1`, create a small fixture Git repo with one tracked file. Start a PowerShell job that parses the Engine script AST, extracts and dot-sources only `Invoke-RunnerGitBytes` using the function-extraction pattern in the drain suite, then calls it with `ls-files -s -z` against that repo. Wait with `Wait-Job -Timeout 60`; assert the job completed and its returned byte array is nonempty and contains the tracked path. On timeout, stop and remove the job and fail; remove completed jobs as well. Use ASCII-only source. - files: `skills/apex-code/scripts/apex-engine.ps1`, `skills/apex-code/scripts/engine-git-test.ps1` - done when the real helper returns the tracked Git index record from inside a bounded job and the full Engine Git suite passes.
- [x] **Task 2** - In `apex-drain.ps1` `Invoke-DrainGit`, set `$info.RedirectStandardInput = $true` and call `$process.StandardInput.Close()` immediately after successful `Start()`, before stdout or stderr reads; change nothing else in the launcher. In the `-Case core` section of `apex-drain-test.ps1`, create a small fixture Git repo with one untracked file. Start a PowerShell job that parses the drain script AST and extracts and dot-sources `ConvertTo-DrainArgument` and `Invoke-DrainGit` using the suite's existing function-extraction pattern, then calls `Invoke-DrainGit <repo> @('status','--porcelain=v1','-z','--untracked-files=all')`. Wait with `Wait-Job -Timeout 60`; assert the job completed, `exit_code` is 0, and the returned Git output contains the untracked path. On timeout, stop and remove the job and fail; remove completed jobs as well. Use ASCII-only source. - files: `skills/apex-code/scripts/apex-drain.ps1`, `skills/apex-code/scripts/apex-drain-test.ps1` - done when the real helper returns the untracked status record from inside a bounded job and the full drain core suite passes.
- [x] **Task 3 (HOST)** - Prepend one `launcher-stdin` apex-code row to `C:/Users/User/apex/SKILL-HISTORY.md`, naming the four Task 1 and Task 2 script files and version `2.24.0 (scripts only)`. - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when that row is the newest history data row.
- [x] **Task 4 (HOST)** - Add one `launcher-stdin` bullet under the existing `### Fixed` subsection of `## [Unreleased]` in `C:/Users/User/apex/CHANGELOG.md`. - files: `C:/Users/User/apex/CHANGELOG.md` - done when that subsection contains exactly one bullet for this fix.

## Wave plan
Wave 1: [1, 2] | HOST: [3, 4].

## Permissions
Coder tasks edit only their disjoint manifest paths. HOST alone edits the history and changelog. Git writes are confined to temporary fixture repositories. No network or live-repository Git write operation.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/scripts/engine-git-test.ps1 |
| Modify (coder Task 2) | skills/apex-code/scripts/apex-drain.ps1, skills/apex-code/scripts/apex-drain-test.ps1 |
| Modify (HOST Task 3) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST Task 4) | C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1` | Task 1 acceptance suite. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case core` | Task 2 acceptance suite. |
| Build repository `AGENTS.md` Verify commands fence | HOST runs the full build verify fence. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Fixture setup and assertions | Temporary test repositories only. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `PATH`, `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_NOSYSTEM` | Resolve Git and preserve the existing hermetic test configuration. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network operation. |

## Specialist Context
### Security
(none)

### Performance
Each new job regression has a 60-second timeout and removes its job on completion or failure.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends the scripts-only row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds one Unreleased Fixed bullet. |

## Acceptance Criteria
- [x] Task 1 - Engine Git child stdin is closed and its job-host regression passes -> verify: the job completes within 60 seconds, returns nonempty `ls-files -s -z` bytes containing the tracked path, and timeout fails after stopping and removing the job.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-git-test failed' }
```
- [x] Task 2 - drain Git child stdin is closed and its core job-host regression passes -> verify: the job completes within 60 seconds, returns `exit_code` 0 and the untracked path in `status --porcelain=v1 -z --untracked-files=all`, and timeout fails after stopping and removing the job.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case core
if ($LASTEXITCODE -ne 0) { throw 'apex-drain-test core failed' }
```
- [x] Task 3 - HOST records the scripts-only fix -> verify: the newest data row of `C:/Users/User/apex/SKILL-HISTORY.md` names `launcher-stdin`, apex-code, all four coder-task script files, and `2.24.0 (scripts only)`.
- [x] Task 4 - HOST records the fix -> verify: `C:/Users/User/apex/CHANGELOG.md` has exactly one `launcher-stdin` bullet under the existing `## [Unreleased]` / `### Fixed` subsection.
- [x] Build repository verify fence - HOST runs the full fence from the build repository root -> verify: the command lines below are copied verbatim from its `AGENTS.md` `## Verify commands` fence and all pass.
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
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case core
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case recovery
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case resume
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case safety
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```
- [x] Scope - only the six `## Files to Change` paths are written -> verify: HOST compares the pre-build dirty-path baseline with `git status --porcelain -uall` in both repositories and names pre-existing unrelated paths.
- [x] Reachability - both real Git helpers are called from PowerShell job hosts -> verify: the Task 1 fixture receives an index record and the Task 2 fixture receives an untracked status record.

## Progress
_(The build writes here - do not edit manually)_
