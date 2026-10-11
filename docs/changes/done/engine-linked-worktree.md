---
spec: engine-linked-worktree
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Engine linked worktree
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Let the Engine build a manifest named for a repository's main worktree with `-Repo` set to that repository's linked worktree.

## Intent
- **Intent:** Admit a linked worktree of the manifest repository as the Engine target and apply path safety to that target.
- **Invariants:** A separate clone or unrelated repository is refused; `-Repo` must remain a Git worktree root; string-equal manifest and `-Repo` paths retain their current behavior; a linked-worktree run never writes the main worktree.
- **Non-goals:** Drain runner, drain planner, state schema, default layout changes, and skill version changes.

## Assumptions
- The Engine records the selected `-Repo` in `state.repo` and uses it for downstream worktree operations. -> impact: Stop

Simplicity check: share the existing Git common directory for identity and pass the recorded target worktree to the three path-safety helpers; no new repository identity layer.

## Prerequisites
none

## Files to Change
Grep evidence: `rg -uu -o -F -- '<pattern>' <live-file>` was run against each UTF-8 file; counts are matching occurrences. `engine-plan.ps1` / `function Get-EnginePlan`: **1**; `engine-plan-test.ps1` / `function New-Fixture`: **1**; `engine-git.ps1` / `function Get-EngineMainWorktree`: **1**; `engine-git-test.ps1` / `Copy-EngineTaskFiles`: **4**; `apex-engine.ps1` / `Stage-EngineWave`: **3**; `engine-test.ps1` / `function New-TestFakeCodex`: **1**; `SKILL-HISTORY.md` / `apex-code`: **213**; `CHANGELOG.md` / `### Changed`: **1**.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/engine-plan.ps1 | modify | Task 1 repository identity. |
| skills/apex-code/scripts/engine-plan-test.ps1 | modify | Task 1 planner fixtures. |
| skills/apex-code/scripts/engine-git.ps1 | modify | Task 2 target path safety. |
| skills/apex-code/scripts/engine-git-test.ps1 | modify | Task 2 helper calls and shape cases. |
| skills/apex-code/scripts/apex-engine.ps1 | modify | Task 2 helper calls and stage shim. |
| skills/apex-code/scripts/engine-test.ps1 | modify | Task 2 Engine run and test shims. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 3 scripts-only row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 3 Unreleased bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [
      { "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" },
      { "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }
    ], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [
      { "path": "skills/apex-code/scripts/engine-git.ps1", "op": "modify" },
      { "path": "skills/apex-code/scripts/engine-git-test.ps1", "op": "modify" },
      { "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" },
      { "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" }
    ], "depends_on": ["1"] }
  ]
}
```

## Tasks
- [ ] **Task 1** - In `Get-EnginePlan` (`engine-plan.ps1:671-686`), retain the existing `ConvertTo-EngineCanonicalRoot` (`:55-64`) and OrdinalIgnoreCase string-equality fast accept at `:675-679`. Only when manifest root and `-Repo` differ, require the manifest path to exist as a directory, use `Invoke-EnginePlanNative` (`:8-27`) with `git -c core.excludesFile=/dev/null -C <manifestRepo> rev-parse --show-toplevel`, and require its canonical result to equal the manifest path. For both manifest root and `-Repo`, obtain `git -c core.excludesFile=/dev/null -C <root> rev-parse --path-format=absolute --git-common-dir`; canonicalize the returned directories with `ConvertTo-EngineCanonicalRoot` and require OrdinalIgnoreCase equality. A nonzero exit or empty output from either common-directory call returns the distinct `git common directory could not be resolved` refusal; mismatched common directories and the other failed identity conditions return the existing `execution manifest repo does not match -Repo` refusal. Keep the subsequent `-Repo` worktree-root check at `:680-686` and the path checks at `:805-848` against `$repoRoot`. In `engine-plan-test.ps1`, extend `New-Fixture` (`:273-290`), `New-TestRepo` (`:89`), and the existing `Get-EnginePlan`/`Assert-Case` pattern (`:293-300`) with temp Git worktrees: same-repository linked branch accepted with nonempty waves, create-path and dirty-path decisions from the linked tree; separate clone refused with the existing identity reason; manifest subdirectory refused; missing manifest directory refused; `-Repo` subdirectory of the linked worktree refused with `-Repo must be the Git worktree root`; string-equal path behavior retained. A planner test case for the common-directory resolution refusal is not required. - files: `skills/apex-code/scripts/engine-plan.ps1`, `skills/apex-code/scripts/engine-plan-test.ps1` — done when the planner accepts only the manifest repository's worktree root and evaluates manifest paths in the selected `-Repo` tree.
- [ ] **Task 2** - In `engine-git.ps1`, add mandatory `[string]$TargetWorktree` to `Copy-EngineTaskFiles` (`:287-330`), `Restore-EngineWave` (`:332-372`), and `Stage-EngineWave` (`:374-401`); replace `$main` in their `Get-EnginePathSafetyFailure` (`:220-233`) root arrays (`:303`, `:346`, `:388`) with `$TargetWorktree`, retaining integration/task roots and commit checks. Remove `Get-EngineMainWorktree` (`:79-89`) if no caller remains. Pass `-TargetWorktree $script:EngineState.repo` at every production call in `apex-engine.ps1`: `Stage-EngineWave` (`:1090`), `Restore-EngineWave` (`:1136`), and `Copy-EngineTaskFiles` (`:1147`, `:1247`); in the stage trace shim (`:73-77`), add `[string]$TargetWorktree` to its param block and forward `-TargetWorktree $TargetWorktree` to `$script:EngineTestStageImplementation`. Pass `-TargetWorktree $repo` at every existing `engine-git-test.ps1` helper call: Copy at `:158`, `:163`, `:187`, `:193`; Restore at `:175`; Stage at `:195`. Add these cases to `engine-git-test.ps1`: (a) main has file `src/settings`, target branch deleted it, and creating `src/settings/item.py` passes `Copy-EngineTaskFiles` and `Stage-EngineWave` with `-TargetWorktree` set to target; (b) target, not main, has a non-directory ancestor for a created path, and `Copy-EngineTaskFiles` and `Stage-EngineWave` both refuse. A `Restore-EngineWave` refusal case is not required; every existing Restore call passes `-TargetWorktree`. In `engine-test.ps1`, add `$TargetWorktree` to the explicit param blocks of the `Stage-EngineWave` shim (`:1700`) and both `Copy-EngineTaskFiles` shims (`:2504`, `:2514`); these shims may ignore its value. Add one end-to-end fake-Codex run using `New-TestRepo` (`:100-162`), `New-TestSpec` (`:169-254`), `New-TestFakeCodex` (`:346-424`), and `Invoke-TestEngineSplat` (`:434-445`, existing run `:718-723`). Commit main with file `src/settings`; create a linked worktree on a new branch, commit deletion of that file there, and use a manifest that names the main repository but creates `src/settings/item.py`. Extend the fake Codex scenario to write that declared file. Invoke the Engine with `-Repo` set to the linked worktree and omit `-WorktreeRoot`; assert status `complete`, state `repo` (`apex-engine.ps1:1792`) equals the linked root, `base_sha` equals linked HEAD before the run, integration branch tip descends from that SHA, hand-off file exists in the linked worktree, and the default worktree root (`apex-engine.ps1:1979`) is its sibling `<linked-leaf>-wt`. Compare main HEAD, raw `.git/index` bytes, tracked `src/settings` bytes, and worktree status before/after; keep existing gate tests intact. - files: `skills/apex-code/scripts/engine-git.ps1`, `skills/apex-code/scripts/engine-git-test.ps1`, `skills/apex-code/scripts/apex-engine.ps1`, `skills/apex-code/scripts/engine-test.ps1` — done when path safety follows the selected target, all callers accept the mandatory parameter, and the complete run uses the linked commit while leaving the main worktree, index, and HEAD byte-unchanged.
- [ ] **Task 3 (HOST)** - Prepend one `engine-linked-worktree` apex-code scripts-only row at the current `2.23.1` version to `C:/Users/User/apex/SKILL-HISTORY.md`, naming the six changed script/test files. Add one `engine-linked-worktree` bullet under `## [Unreleased]` / `### Changed` in `C:/Users/User/apex/CHANGELOG.md`. Do not bump `SKILL.md` or edit `SKILLS.md`. - files: `C:/Users/User/apex/SKILL-HISTORY.md`, `C:/Users/User/apex/CHANGELOG.md` — done when the top history data row and Unreleased changelog name this change.

## Wave plan
Wave 1: [1] | Wave 2: [2] | HOST: [3].

## Permissions
Coder tasks edit only their own `files:` paths. Each coder runs its named suite and the build repository's full Verify commands fence. Git operations are read-only except those inside temporary Git fixture repositories created by the test suites. No package installation or network operation. HOST performs Task 3.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1 |
| Modify (coder Task 2) | skills/apex-code/scripts/engine-git.ps1, skills/apex-code/scripts/engine-git-test.ps1, skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/scripts/engine-test.ps1 |
| Modify (HOST Task 3) | C:/Users/User/apex/SKILL-HISTORY.md, C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` | Task 1 planner suite. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1` | Task 2 Git helper suite; run before the Engine suite. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` | Task 2 Engine suite; run last and alone. |
| Build repository `AGENTS.md` Verify commands fence | Run all 15 commands from the build repository root. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Read-only inspection | Live repositories. |
| Fixture setup and assertions | Temporary test repositories only. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No new environment variable. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package or network access. |

## Specialist Context
### Security
Keep path safety checks for the selected target, integration, and task worktrees and commit trees.

### Performance
Run `engine-test.ps1` last and alone.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends scripts-only row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds Unreleased bullet. |

## Acceptance Criteria
- [ ] Task 1 - linked-worktree identity and planner refusal cases pass -> verify: the planner suite covers same-repository linked worktrees, the string-equal path, separate clone, manifest subdirectory, missing manifest path, linked `-Repo` subdirectory, and linked-tree dirty/create-path behavior.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-plan-test failed' }
```
- [ ] Task 2 - target-based path safety, all helper callers, and the linked-worktree Engine run pass -> verify: the Git suite accepts the linked target's changed tree shape, refuses a non-directory target ancestor, and the Engine suite asserts linked base, integration ancestry, linked hand-off, default worktree root, and unchanged main HEAD/index/worktree bytes.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-git-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-test failed' }
```
- [ ] Task 3 - HOST records the scripts-only change -> verify: both untagged checks below pass after HOST updates history and changelog.
- [ ] HOST history - the top data row names `engine-linked-worktree` -> verify:
```powershell
$history = Get-Content -LiteralPath 'C:/Users/User/apex/SKILL-HISTORY.md' -Encoding UTF8
$topRow = $history | Select-String -Pattern '^\| \d{4}-\d{2}-\d{2} \|' | Select-Object -First 1
if ($null -eq $topRow -or $topRow.Line -notmatch 'engine-linked-worktree') { throw 'SKILL-HISTORY top data row missing engine-linked-worktree' }
```
- [ ] HOST changelog - the Unreleased Changed section has an `engine-linked-worktree` bullet -> verify:
```powershell
$changelog = Get-Content -LiteralPath 'C:/Users/User/apex/CHANGELOG.md' -Encoding UTF8 -Raw
$unreleased = [regex]::Match($changelog, '(?ms)^## \[Unreleased\]\s*\r?\n(?<body>.*?)(?=^## \[|\z)')
if (-not $unreleased.Success -or -not ($unreleased.Groups['body'].Value | Select-String -Pattern '(?m)^- .*engine-linked-worktree')) { throw 'CHANGELOG Unreleased bullet missing engine-linked-worktree' }
```
- [ ] Build repository verify fence - run all 15 commands from the build repository root, with the Engine suite last and alone -> verify: the following command lines are copied verbatim from its `AGENTS.md` `## Verify commands` fence.
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
- [ ] Scope - only the eight `## Files to Change` paths are written -> verify: HOST compares the pre-build dirty-path baseline with `git status --porcelain -uall` in both repositories and names pre-existing unrelated paths.
- [ ] Reachability - the live Engine accepts manifest-main identity with linked `-Repo` -> verify: Task 2's complete fake-Codex run reaches planner, path-safety helpers, integration commit, and linked hand-off in one invocation.

## Progress
_(The build writes here - do not edit manually)_
