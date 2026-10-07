---
spec: engine-run-timeout
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
max_parallel_codex: 2
---

# Spec: Engine run timeout and coder model allowlist
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Persist an Engine-specific no-output watchdog and accept `gpt-6.1-sol` in Engine planning and run state.

## Intent
- **Intent:** Keep Engine task attempts alive through the build repo's long verify fence and allow the owner's pinned Codex model to plan and pass run-state validation.
- **Invariants:** Every attempt uses the watchdog value saved in run state; an explicitly bound `-NoOutputTimeoutMin` on `-Resume` replaces and persists that value before dispatch, while an unbound resume retains it; a legacy state without the field uses 30 minutes; the wrapper's own default and the Engine's default coder model remain unchanged.
- **Non-goals:** The wrapper's own default timeout; the Engine default coder model; the misleading `Next:` line on refused or parked runs; the dispatch-preflight concurrency flake.

## Assumptions
- The `engine-task-dash` spec is integrated before this build. -> impact: Stop.
- The promoted `codex-observability-ladder` spec remains available for the HOST's live Engine reachability run. -> impact: Stop.
- The build repo's `AGENTS.md` Verify commands fence still contains the 14 commands reproduced below. -> impact: Stop.

Simplicity check: two file-disjoint coder tasks use the existing Engine state, dispatch-args, planner, and test patterns.

## Prerequisites
- Specs that must be complete first: `engine-task-dash` (its changes to `engine-plan.ps1` and `engine-plan-test.ps1` are integrated).
- Environment: `C:/Users/User/.claude` build repo, PowerShell 5.1, and the promoted `codex-observability-ladder` spec for HOST reachability.

## Files to Change
Grep evidence: `rg --no-ignore --hidden -n -F` over the five build files and `codex-dispatch.ps1` found 5 `Start-RunnerAttempt` hits in 2 files: definition plus 3 call sites in `apex-engine.ps1` (`:608,860,1070,1085`) and a direct test call in `engine-test.ps1` (`:1533`). `NoOutputTimeoutMin` has 3 hits in `codex-dispatch.ps1` (`:23,1072,4002`) and 0 in the five build files. The `coder_model` frontmatter allowlist occurs once in `engine-plan.ps1` (`:518`); its existing default, pin, alias, and refused-model assertions are in `engine-plan-test.ps1` (`:530-534`). `engine-state-schema.json` has allowed-plan `spec.coder_model` and plan-task `coder_model` enums at `:158,197`, plus an attempt `model` enum at `:249`; all three currently list only `gpt-5.6-sol` and `gpt-6-sol`. Its root object has `additionalProperties: false` (`:6`); `engine-test.ps1` loads this schema at `:8` and validates run state at `:721`.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-engine.ps1 | modify | Add the bounded Engine timeout parameter, persist it on new runs, and pass the persisted value to every wrapper attempt with a legacy-state fallback. |
| skills/apex-code/scripts/engine-test.ps1 | modify | Assert default, explicit, resumed, and legacy dispatch timeout values and schema validation, including `gpt-6.1-sol` in plan and attempt fields. |
| skills/apex-code/references/engine-state-schema.json | modify | Add an optional root run-state timeout integer property with bounds 1 through 240 and `gpt-6.1-sol` to all three model enums. |
| skills/apex-code/scripts/engine-plan.ps1 | modify | Add `gpt-6.1-sol` to the frontmatter `coder_model` allowlist only. |
| skills/apex-code/scripts/engine-plan-test.ps1 | modify | Assert the new pinned model plans and an unknown model is refused. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" }, { "path": "skills/apex-code/references/engine-state-schema.json", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }], "depends_on": [], "effort": "medium" }
  ]
}
```

## Tasks
- [ ] **Task 1** - Add `[ValidateRange(1, 240)][int]$NoOutputTimeoutMin = 30` to the Engine parameters in `apex-engine.ps1`, and track whether it was explicitly bound with `$PSBoundParameters.ContainsKey('NoOutputTimeoutMin')`. Store the value as `no_output_timeout_min` in `New-RunnerStateObject` at run creation. In `Initialize-RunnerResume`, follow the existing bound-option pattern for the wrapper path, Codex executable, and worktree root: when `-NoOutputTimeoutMin` is explicitly bound on `-Resume`, replace the state's `no_output_timeout_min` value (add the property if absent) and save it; otherwise retain the persisted value, or use 30 for a legacy state without the field. In `Start-RunnerAttempt`, add `NoOutputTimeoutMin` to the wrapper `$parameters` hashtable from `$script:EngineState.PSObject.Properties['no_output_timeout_min']`, using 30 if that property is absent; under `Set-StrictMode -Version 2`, never access the possibly absent state property directly. In the root `properties` object of `engine-state-schema.json`, add `no_output_timeout_min` as an optional `{ "type": "integer", "minimum": 1, "maximum": 240 }` property without adding it to `required`. Add `gpt-6.1-sol` to all three existing model enums in that schema: allowed-plan `spec.coder_model`, plan-task `coder_model`, and attempt `model`. In `engine-test.ps1`, add a `maximum` check to `Test-Structure` (~597-646) mirroring its existing `minimum` check, using `[long]$Value -gt [long]$Schema.maximum`. For timeout cases, do not add full `Invoke-TestEngine` runs: use hand-built state and call `Start-RunnerAttempt` directly with a stubbed dispatch, following the existing `start_time` case (~1533), then read its written `dispatch-args.json`. Assert new-state default 30, an explicit new-state value, and a legacy state lacking the field dispatching 30; assert the new states record their respective values. For resume, exercise `Initialize-RunnerResume` with a persisted fixture and bound/unbound flag state, then use the direct-call dispatch pattern: the bound case saves and dispatches the new value, and the unbound case dispatches the persisted value. Validate new and legacy states against the schema, and assert that `Test-Structure` rejects `no_output_timeout_min` values 241, 0, and a non-integer. Using an existing schema-valid run-state fixture, set the allowed plan's `spec.coder_model`, each plan task's `coder_model`, and an attempt's `model` to `gpt-6.1-sol` and assert that state passes `Test-Structure` against the schema. - files: `skills/apex-code/scripts/apex-engine.ps1`, `skills/apex-code/scripts/engine-test.ps1`, `skills/apex-code/references/engine-state-schema.json` - done when: every wrapper attempt receives the state timeout or legacy fallback, explicit resume overrides persist, and the schema enforces timeout bounds and accepts the pinned model in all three model fields.
- [ ] **Task 2** - Add `gpt-6.1-sol` only to the frontmatter `coder_model` allowlist in `engine-plan.ps1`, retaining the existing default and `codex` alias. Extend the existing model fixture in `engine-plan-test.ps1` so `coder_model: gpt-6.1-sol` produces an allowed plan with `spec.coder_model` equal to `gpt-6.1-sol`, while an unknown model remains refused. - files: `skills/apex-code/scripts/engine-plan.ps1`, `skills/apex-code/scripts/engine-plan-test.ps1` - done when: the new pinned model is planned and unknown models remain refused.

## Wave plan
Wave 1: [Task 1, Task 2].

## Permissions
The coder may edit only the five listed build files and run the commands below. No git operations or package installation by the coder.

### File Operations
| Action | Paths |
|--------|-------|
| Modify | skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/scripts/engine-test.ps1, skills/apex-code/references/engine-state-schema.json, skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1 |
| Create/Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` | Run timeout and state-schema regression cases; this script can take 12-17 minutes. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` | Run coder-model allowlist regression cases. |
| Build repo `AGENTS.md` Verify commands fence, reproduced below | Run all 14 checks. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | No git operations by the coder; HOST performs the scope check. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No environment variable needed. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package or network operation. |

## Specialist Context
### Performance
The build repo's `engine-test.ps1` verify command can run 12-17 minutes without coder output; the Engine's no-output default is 30 minutes.

### Security
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| (none) | (none) | No documentation edit. |

## Acceptance Criteria
- [ ] Task 1 - the Engine persists and dispatches the bounded timeout -> verify: `engine-test.ps1` checks new-state default 30 and an explicit `-NoOutputTimeoutMin` value in state and recorded `dispatch-args.json` by calling `Start-RunnerAttempt` with stubbed dispatch and hand-built state, without adding full `Invoke-TestEngine` runs; `ValidateRange(1, 240)` rejects out-of-range CLI values.
- [ ] Task 1 - resume overrides and legacy attempts dispatch the correct timeout -> verify: `engine-test.ps1` checks that `-Resume -NoOutputTimeoutMin` saves and dispatches the new value, `-Resume` without that flag dispatches the persisted value, and a legacy state lacking `no_output_timeout_min` dispatches 30; use direct `Start-RunnerAttempt` calls and read `dispatch-args.json` where possible. New and legacy states pass `Test-Structure` against `engine-state-schema.json`, while values 241, 0, and a non-integer fail that schema check through the `maximum`, `minimum`, and integer-type checks respectively.
- [ ] Task 1 - run state accepts the pinned model in all three schema enums -> verify: `engine-test.ps1` checks a fixture run state with `plan.spec.coder_model`, each `plan.waves[].tasks[].coder_model`, and an attempt `model` set to `gpt-6.1-sol` passes `Test-Structure` against `engine-state-schema.json`.
- [ ] Task 2 - the model allowlist accepts `gpt-6.1-sol` and still refuses unknown values -> verify: `engine-plan-test.ps1` asserts the pinned plan is allowed with `spec.coder_model = gpt-6.1-sol`, its default and `codex` alias keep their current model, and an unknown model is refused.
- [ ] Task 1 and Task 2 - the build repo's complete `AGENTS.md` Verify commands fence exits 0 -> verify: run this PowerShell block from the build repo; it executes exactly the 14 commands from that fence, including the long-running `engine-test.ps1` command, and throws on any nonzero exit.

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

- [ ] Scope - only the five listed build files change -> verify: HOST compares the pre-build dirty-path baseline with a read-only diff after the build; no new diff appears outside `skills/apex-code/scripts/apex-engine.ps1`, `skills/apex-code/scripts/engine-test.ps1`, `skills/apex-code/references/engine-state-schema.json`, `skills/apex-code/scripts/engine-plan.ps1`, and `skills/apex-code/scripts/engine-plan-test.ps1`; HOST reports unrelated pre-existing dirty paths.
- [ ] Reachability - the promoted `codex-observability-ladder` spec reaches a live Engine task attempt after integration -> verify: HOST runs the live Engine on that promoted spec and observes that the task attempt is not parked by wrapper exit 124 while the coder is still running the build repo Verify commands fence.

## Progress
_(The build writes here - do not edit manually)_
