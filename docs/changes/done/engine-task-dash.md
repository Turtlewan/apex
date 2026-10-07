---
spec: engine-task-dash
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
max_parallel_codex: 2
---

# Spec: Engine task declaration dash parsing
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Accept template-form task labels and empty specialist context in Engine planning without changing other task parsing.

## Intent
- **Intent:** Let the live Engine plan template-form specs whose bold task labels use an ASCII hyphen-minus, en dash, or em dash and whose Specialist Context subsections are all `(none)`.
- **Invariants:** Task IDs, `files:`, `done when:`, and acceptance-line parsing retain their current behavior; the PowerShell scripts remain ASCII-safe under PowerShell 5.1.
- **Non-goals:** The misleading `Next:` line on refused runs; the spec template; the spec validator.

## Assumptions
- The unchanged promoted `C:/Users/User/apex/docs/changes/codex-observability-ladder.md` still has a template-form em dash after `**Task 1**` and passes the spec validator. -> impact: Stop.
- The build repo's `AGENTS.md` Verify commands fence still contains the 14 commands reproduced below. -> impact: Stop.

Simplicity check: one separator change and one parameter attribute in the planner, with regression cases in its existing test script.

## Prerequisites
- Specs that must be complete first: none.
- Environment: `C:/Users/User/.claude` build repo, PowerShell 5.1, and readable unchanged promoted ladder spec at the path above.

## Files to Change
Grep evidence: a live `rg --no-ignore --hidden -n -F` sweep of `C:/Users/User/.claude/skills` and `agents` found 2 `Get-EngineTaskDeclarations` hits in 1 file: definition at `skills/apex-code/scripts/engine-plan.ps1:365` and call at `:620`; 2 `Get-EngineSpecialistContext` hits in 1 file: definition at `engine-plan.ps1:157` and call at `:552`; and 2 `New-EnginePrompt` hits in 1 file: definition at `engine-plan.ps1:396` and call at `:777`. The same sweep found 5 `engine-plan.ps1` hits in 3 files: live external consumers `skills/apex-code/scripts/apex-engine.ps1:57` and `skills/apex-code/scripts/engine-plan-test.ps1:5` (2), the test's scratch-copy name at `engine-plan-test.ps1:329` (1), and the planner's CLI usage strings at `engine-plan.ps1:843,857` (2).

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/engine-plan.ps1 | modify | Accept three task-label separators in `Get-EngineTaskDeclarations`; allow empty `SpecialistContext` in `New-EnginePrompt`. |
| skills/apex-code/scripts/engine-plan-test.ps1 | modify | Add fixture and plan assertions for the three separator forms and all-`(none)` Specialist Context. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }], "depends_on": [], "effort": "medium" }
  ]
}
```

## Tasks
- [ ] **Task 1** - In `Get-EngineTaskDeclarations`, replace only the literal ASCII hyphen-minus immediately after the closing bold task label with a character class accepting `-`, `\u2013`, and `\u2014`; leave task IDs, `files:`, `done when:`, and acceptance-line parsing unchanged. Add `[AllowEmptyCollection()]` to the mandatory `[object[]]$SpecialistContext` parameter of `New-EnginePrompt`; an empty specialist context must produce a valid prompt with an empty hazards section or the template's existing empty form. In the existing PowerShell fixture/assert pattern, add planned (not refused) cases for a template-form em-dash task row with em dashes also before `files:` and `done when:`, an en dash immediately after the bold label with the existing em-dash field separators, and the existing ASCII-hyphen label form. Construct non-ASCII fixture separators with `[char]0x2013` and `[char]0x2014`; assert each plan's task text includes the expected `files:` path, its task files match that path, and `done_when` has the expected value. Add a case whose Security, Performance, and Accessibility subsections are each `(none)`; assert the plan is allowed and every task has a prompt. - files: `skills/apex-code/scripts/engine-plan.ps1`, `skills/apex-code/scripts/engine-plan-test.ps1` - done when: all three label separators produce allowed plans with the expected file and done-when values, the all-(none) specialist context produces an allowed plan with a prompt for every task, and the planner has exactly the separator-class and parameter-attribute edits.

## Wave plan
Wave 1: [Task 1].

## Permissions
The coder may edit only the two listed scripts and run the checks below. No git operations or package installation by the coder.

### File Operations
| Action | Paths |
|--------|-------|
| Modify | skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1 |
| Create/Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` | Run separator and empty-specialist-context regression cases. |
| Build repo `AGENTS.md` Verify commands fence, reproduced below | Run all 14 checks. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | No git operations by the coder; HOST performs the read-only scope check. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No environment variable needed. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package or network operation. |

## Specialist Context
### Security
Planner input parsing only; no new code paths execute spec content.

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| (none) | (none) | No documentation edit. |

## Acceptance Criteria
- [ ] Task 1 - planner accepts exactly the three requested task-label separators and an empty specialist context -> verify: HOST inspects the diff in `skills/apex-code/scripts/engine-plan.ps1`; exactly two planner edits appear: the post-label literal hyphen-minus becomes `[-\u2013\u2014]`, and the mandatory `[object[]]$SpecialistContext` parameter of `New-EnginePrompt` gains `[AllowEmptyCollection()]`. Task IDs, `files:`, `done when:`, acceptance-line parsing, and other planner behavior remain unchanged.
- [ ] Task 1 - the em-dash, en-dash, ASCII-hyphen, and all-`(none)` Specialist Context fixtures produce allowed plans -> verify: run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1`; the separator assertions check `allowed`, the `files:` path in task text, the task files, and `done_when` for each form, including the template-form em-dash row; the all-`(none)` case checks `allowed` and a prompt for every task.
- [ ] Task 1 - the build repo's complete `AGENTS.md` Verify commands fence passes -> verify: run this PowerShell block from the build repo; it executes exactly 14 commands and throws on any nonzero exit.

```powershell
Set-Location C:/Users/User/.claude
$checks = @(
    'node --check hooks/destructive-command-guard.js'
    'node --check hooks/lib/destructive-detect.js'
    'python hooks/destructive-guard-test.py'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1'
)
if ($checks.Count -ne 14) { throw 'Verify fence command count changed' }
foreach ($check in $checks) {
    Invoke-Expression $check
    if ($LASTEXITCODE -ne 0) { throw "Verify failed ($LASTEXITCODE): $check" }
}
```

- [ ] Scope - only the two listed scripts change in this build -> verify: HOST compares the build repo's pre-build dirty-path baseline with a read-only diff after the build; no new diff appears outside `skills/apex-code/scripts/engine-plan.ps1` and `skills/apex-code/scripts/engine-plan-test.ps1`, and HOST reports unrelated pre-existing dirty paths.
- [ ] Reachability - the unchanged promoted `codex-observability-ladder.md` reaches the live Engine after integration -> verify: HOST re-runs the live Engine on that unchanged promoted spec, whose task label uses an em dash and whose Specialist Context subsections are all `(none)`; the run is not refused with either `task declaration is missing for manifest task 1` or `Cannot bind argument to parameter 'SpecialistContext' because it is an empty array`.

## Progress
_(The build writes here - do not edit manually)_
