---
spec: engine-accept-smoke
status: draft
autonomy_level: L2
risk: low
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Engine acceptance smoke
<!-- Governing contract: C:/Users/User/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Diagnose missing-only wave-manifest paths and exercise the Engine's task, spec, and HOST acceptance paths.

## Intent
- **Intent:** Give missing-only integration index paths their own error and exercise the live Engine's three acceptance paths.
- **Invariants:** Extra-path errors retain their exact text and path ordering, including any `missing: <path>` entries; path comparison remains ordinal and case-sensitive. A task check gates its wave, a spec check gates completion, and an untagged criterion remains with HOST.
- **Non-goals:** Other `Commit-EngineWave` behavior; edits to `apex-engine.ps1`, `engine-test.ps1`, the AGENTS verify fence, or SKILL.md; version changes.

## Assumptions
- The build repo is `C:/Users/User/.claude`, and `engine-git-test.ps1` has the `Commit-EngineWave` fixture and `Assert-Throws` at the anchors below. -> impact: Stop.
- The live Engine records task and spec acceptance results in `engine-state.json` and prints untagged criteria under `HOST checks:`. -> impact: Stop.

Simplicity check: One coder task owns the error and its focused test; HOST records live Engine observations.

## Prerequisites
- Specs that must be complete first: `engine-acceptance-gate`.
- Environment: PowerShell 5.1, the build repo, and an attended HOST Engine run after promotion of this draft.

## Files to Change
Grep evidence: `rg -o -F --` was run for each literal against its explicit live file (matching output lines counted): `engine-git.ps1` / `function Commit-EngineWave` = 1; `engine-git.ps1` / `$pathDifferences` = 5; `engine-git.ps1` / `integration index contains paths outside wave manifest:` = 1; `engine-git.ps1` / `integration index is missing wave-manifest paths:` = 0; `engine-git-test.ps1` / `function Assert-Throws` = 1; `engine-git-test.ps1` / `off-manifest staged path is rejected` = 1; `engine-git-test.ps1` / `allowed-path set comparison is case-sensitive` = 1.

| File | Operation | Notes |
|------|-----------|-------|
| C:/Users/User/.claude/skills/apex-code/scripts/engine-git.ps1 | modify | Split extra and missing path handling in `Commit-EngineWave`. |
| C:/Users/User/.claude/skills/apex-code/scripts/engine-git-test.ps1 | modify | Add a missing-only index case beside the existing extra-path cases. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-git.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-git-test.ps1", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
- [ ] **Task 1** - In `Commit-EngineWave` (`engine-git.ps1:448-462`), retain the ordinal `HashSet[string]` comparisons and replace `$pathDifferences` with `$extraPaths` for indexed paths absent from `$AllowedPaths` and `$missingPaths` for allowed paths absent from the index. If `$extraPaths.Count -gt 0`, throw the existing `integration index contains paths outside wave manifest: ` message with extra paths followed by `missing: <path>` entries, comma-joined in the current order; preserve byte-identical output for every input with an extra path. Else if `$missingPaths.Count -gt 0`, throw `integration index is missing wave-manifest paths: ` followed by the missing paths comma-joined without `missing: ` prefixes. In `engine-git-test.ps1`, beside the extra-path assertions at `:200,206`, use the same staged fixture and `Assert-Throws` (`:16-25`) with one additional allowed path that is not staged and no extra staged path; assert its error matches `integration index is missing wave-manifest paths:.*<that path>` and does not match `outside wave manifest`. Keep the existing extra-path assertions and `engine-test.ps1:2141,2148` passing without editing them. - files: `skills/apex-code/scripts/engine-git.ps1`, `skills/apex-code/scripts/engine-git-test.ps1` - done when: missing-only inputs receive the new error and extra-path inputs retain their exact prior output.
- [ ] **Task 2 (HOST)** - After the live Engine exits 0, read that run's `engine-state.json` and confirm Task 1's acceptance check record is `passed` and the spec-level acceptance record is `passed`; inspect the completion console for criterion 3 under `HOST checks:`; then run criterion 3's untagged verify fence from the build repo root. Record the run ID, both passed records, the console listing, and the verify result in the HOST report. - files: (none) - done when: the HOST report contains all five observations.

## Wave plan
Wave 1: [1] | Wave 2 (HOST): [2].

## Permissions
Coder edits only Task 1's two listed files and runs the full build repo verify fence, including `engine-git-test.ps1`. Coder performs no git operations or package installation. HOST performs Task 2.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-code/scripts/engine-git.ps1, skills/apex-code/scripts/engine-git-test.ps1 |
| HOST Task 2 | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1` | Run the focused git helper cases. |
| Build repo `AGENTS.md` Verify commands fence below | Run all 14 checks, with `engine-test.ps1` last. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | Coder performs no git operations. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No added variable. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package or network operation. |

## Specialist Context
### Security
(none)

### Performance
Run `engine-test.ps1` last in the verify fence.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| (none) | (none) | No documentation edit. |

## Acceptance Criteria
- [ ] Task 1 - missing-only manifest paths receive the dedicated error while extra-path errors retain their exact prior output
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-git-test failed' }
```
- [ ] The missing-only wave-manifest error text appears exactly once in the git helper
```powershell apex-accept
$hits = @(Select-String -Path 'skills/apex-code/scripts/engine-git.ps1' -SimpleMatch -Pattern 'integration index is missing wave-manifest paths:')
if ($hits.Count -ne 1) { throw 'missing wave-manifest error text count is not 1' }
```
- [ ] HOST completes Task 2 by recording the task and spec passed records, the `HOST checks:` console listing, and the full build repo Verify commands result
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
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```

## Progress
_(The build writes here - do not edit manually)_
