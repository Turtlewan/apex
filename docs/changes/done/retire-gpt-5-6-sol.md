---
spec: retire-gpt-5-6-sol
status: draft
autonomy_level: L2
risk: low
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Retire gpt-5.6-sol from Codex dispatch and the Engine
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Remove `gpt-5.6-sol` as a Codex wrapper and Engine coding model, and keep the Engine suites aligned with `gpt-6.1-sol`.

## Intent
- **Intent:** All coding runs on `gpt-6.1-sol`; the wrapper and Engine reject a `gpt-5.6-sol` pin.
- **Invariants:** The wrapper default stays `gpt-6.1-sol`; the planner uses its existing refusal message; the three state-schema enums retain `gpt-6-sol`, `gpt-6.1-sol` in that order. The negative planner fixture constructs the retired model name at runtime so the seven-file literal scan has no match.
- **Non-goals:** `hooks/codex-dispatch-guard.test.js` command strings, `skills/apex-code/scripts/fixtures/spec-corpus/**`, `skills/apex-code/scripts/dispatch-author-test.ps1` (`gpt-5.6-luna` negative case), `skills/apex-code/REVIEW-ENSEMBLE-DESIGN.md`, historical docs/ADRs/handoffs, and migration of existing engine-state files. A pre-existing parked run pinned to `gpt-5.6-sol` becomes non-resumable. Normal size, Light mode; owner waived the greater-than-three-file split rule.

## Assumptions
- The quoted OLD lines below still match the seven target files exactly. → impact: Stop
- `skills/apex-code/SKILL.md` is at version `2.27.0`, dated `2026-10-14`, and has 500 lines before this edit. → impact: Stop
- `C:/Users/User/apex/SKILL-HISTORY.md` accepts a newest data row and `C:/Users/User/apex/CHANGELOG.md` has `## [Unreleased]` and `### Changed`. → impact: Stop

Simplicity check: Seven direct file edits, one history row, and one changelog bullet; no new helper or migration.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/codex-dispatch.ps1 | modify | Task 1: wrapper `-Model` ValidateSet. |
| skills/apex-code/scripts/engine-test.ps1 | modify | Task 1: Engine fixture and assertion models. |
| skills/apex-code/scripts/engine-dispatch-test.ps1 | modify | Task 1: dispatch fixture models. |
| skills/apex-code/scripts/engine-plan.ps1 | modify | Task 2: planner coder-model allowlist. |
| skills/apex-code/scripts/engine-plan-test.ps1 | modify | Task 2: rejected legacy pin fixture. |
| skills/apex-code/references/engine-state-schema.json | modify | Task 3: three model enums. |
| skills/apex-code/SKILL.md | modify | Task 4: wrapper model prose and frontmatter. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST H1: newest apex-code history row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST H2: first Unreleased Changed bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/codex-dispatch.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-dispatch-test.ps1", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }], "depends_on": [] },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/references/engine-state-schema.json", "op": "modify" }], "depends_on": [] },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-code/SKILL.md", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
- [ ] **Task 1** - Retire the wrapper model pin and align its Engine and dispatch fixtures - files: `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/engine-test.ps1`, `skills/apex-code/scripts/engine-dispatch-test.ps1` - done when the OLD wrapper line is replaced by the NEW line verbatim, both literal replace rules change their stated occurrences, and no other text changes.
  ```text
  OLD:     [ValidateSet('gpt-5.6-sol', 'gpt-6-sol', 'gpt-6.1-sol', 'gpt-6-luna', IgnoreCase = $false)]
  NEW:     [ValidateSet('gpt-6-sol', 'gpt-6.1-sol', 'gpt-6-luna', IgnoreCase = $false)]
  ```
  - In `engine-test.ps1`, replace every literal `gpt-5.6-sol` with `gpt-6.1-sol`: both fixture spec frontmatters, the attempt models, the dispatch `Model` value, the plan model, and the ladder assertion (seven occurrences).
  - In `engine-dispatch-test.ps1`, replace every literal `gpt-5.6-sol` with `gpt-6.1-sol`: the fixture spec frontmatter and three dispatch `Model` values (four occurrences).
  - Verify scope: run only a `Select-String -SimpleMatch 'gpt-5.6-sol'` scan of this task's own three files (must return no matches), AC2, and `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1`.
- [ ] **Task 2** - Retire the planner model pin and make the retired pin a negative fixture - files: `skills/apex-code/scripts/engine-plan.ps1`, `skills/apex-code/scripts/engine-plan-test.ps1` - done when all OLD lines are replaced by their NEW lines verbatim and all other assertions remain unchanged.
  - Keep the existing refusal text verbatim: `frontmatter coder_model is not an allowed Codex model`.
  ```text
  OLD:         if (@('codex', 'gpt-5.6-sol', 'gpt-6-sol', 'gpt-6.1-sol') -cnotcontains $declaredModel) {
  NEW:         if (@('codex', 'gpt-6-sol', 'gpt-6.1-sol') -cnotcontains $declaredModel) {
  ```
  ```text
  OLD:         $legacyPinned = Invoke-Plan (New-Fixture -SpecOptions @{ CoderModel = 'gpt-5.6-sol' })
  NEW:         $legacyPinned = Invoke-Plan (New-Fixture -SpecOptions @{ CoderModel = ('gpt-5.6' + '-sol') })
  OLD:             $legacyPinned.allowed -and $legacyPinned.spec.coder_model -ceq 'gpt-5.6-sol' -and
  NEW:             -not $legacyPinned.allowed -and
  ```
  - Verify scope: run only a `Select-String -SimpleMatch 'gpt-5.6-sol'` scan of this task's own two files (must return no matches) and `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1`.
- [ ] **Task 3** - Retire the three state-schema enums - files: `skills/apex-code/references/engine-state-schema.json` - done when each OLD line is replaced by its NEW line verbatim and nothing else changes.
  ```text
  OLD:                 "coder_model": { "enum": ["gpt-5.6-sol", "gpt-6-sol", "gpt-6.1-sol"] },
  NEW:                 "coder_model": { "enum": ["gpt-6-sol", "gpt-6.1-sol"] },
  OLD:                         "coder_model": { "enum": ["gpt-5.6-sol", "gpt-6-sol", "gpt-6.1-sol"] },
  NEW:                         "coder_model": { "enum": ["gpt-6-sol", "gpt-6.1-sol"] },
  OLD:                 "model": { "enum": ["gpt-5.6-sol", "gpt-6-sol", "gpt-6.1-sol"] },
  NEW:                 "model": { "enum": ["gpt-6-sol", "gpt-6.1-sol"] },
  ```
  - Verify scope: run only AC5.
- [ ] **Task 4** - Align apex-code skill prose and frontmatter - files: `skills/apex-code/SKILL.md` - done when the three OLD lines are replaced by the three NEW lines verbatim, all other lines remain unchanged, and the file stays at or below 500 lines.
  ```text
  OLD: version: 2.27.0
  NEW: version: 2.27.1
  OLD: last_updated: 2026-10-14
  NEW: last_updated: 2026-10-19
  OLD:    only OpenAI models (`gpt-6.1-sol`, the default; `gpt-5.6-sol` as an explicit pin; `gpt-6-sol`;
  NEW:    only OpenAI models (`gpt-6.1-sol`, the default; `gpt-6-sol`;
  ```
  - Leave the following continuation line verbatim: ``   `gpt-6-luna`), so ledger family fields describe what it launched, not a caller's claim.``
  - Verify scope: run only AC6.
- [ ] **Task 5 (HOST)** - H1: prepend one newest history data row - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when the row below occurs exactly once as the first dated data row.
  ```text
  | 2026-10-19 | apex-code | SKILL.md, scripts/codex-dispatch.ps1, scripts/engine-plan.ps1, references/engine-state-schema.json, 3 Engine test suites | 2.27.1 | update | gpt-5.6-sol retired from wrapper -Model set, Engine coder_model allowlist and state schema; all coding on gpt-6.1-sol | owner decision 2026-10-19 (retire-gpt-5-6-sol) |
  ```
- [ ] **Task 6 (HOST)** - H2: add one changelog bullet - files: `C:/Users/User/apex/CHANGELOG.md` - done when the bullet below occurs exactly once as the first bullet under `## [Unreleased]` / `### Changed` (create `### Changed` if absent).
  ```text
  - apex-code: retired `gpt-5.6-sol` from the Codex wrapper and Engine; all coding runs on `gpt-6.1-sol` (retire-gpt-5-6-sol).
  ```
- [ ] **Task 7 (HOST)** - H3: run the native Engine suite - files: (none; verification only) - done when `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` exits 0 in `C:/Users/User/.claude`.

## Wave plan
Wave 1: [1, 2, 3, 4] | HOST: [H1, H2, H3] after coder work. Manifest `depends_on` is authoritative.

## Permissions
Coder tasks may read and modify only their listed manifest files. HOST owns the two bookkeeping files and native Engine suite. No new packages, environment variables, network operations, or Git operations by the coder.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-code/scripts/codex-dispatch.ps1, skills/apex-code/scripts/engine-test.ps1, skills/apex-code/scripts/engine-dispatch-test.ps1 |
| Modify (coder Task 2) | skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1 |
| Modify (coder Task 3) | skills/apex-code/references/engine-state-schema.json |
| Modify (coder Task 4) | skills/apex-code/SKILL.md |
| Modify (HOST H1) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST H2) | C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` | Run planner suite. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1` | Run dispatch suite. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` | HOST runs native Engine suite. |
| Build repository `AGENTS.md` `## Verify commands` fence | HOST runs the complete build-repository recipe. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | No Git operation by the coder. |

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
Each coder task runs only its own named suites and tagged checks: Task 1 runs an own-files retired-literal scan, AC2, and `engine-dispatch-test.ps1`; Task 2 runs an own-files retired-literal scan and `engine-plan-test.ps1`; Task 3 runs AC5; Task 4 runs AC6. AC1 is a whole-build check that the Engine runs once after integration. Do not run `engine-test.ps1` or any `apex-drain-test.ps1` case in the sandbox; these are HOST-native checks, and drain cases fail there with WMI Access denied.
The long `engine-test.ps1` suite runs only as HOST H3, outside tagged acceptance checks.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends the H1 row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds the H2 bullet. |

## Acceptance Criteria
Tagged checks run from the `C:/Users/User/.claude` build-repository root. H3 and the complete verify fence are HOST checks.

- [ ] AC1 - No retired-model literal remains in the seven coder files → verify: `Select-String -SimpleMatch` returns no matches.
```powershell apex-accept
$paths = @('skills/apex-code/scripts/codex-dispatch.ps1', 'skills/apex-code/scripts/engine-plan.ps1', 'skills/apex-code/references/engine-state-schema.json', 'skills/apex-code/SKILL.md', 'skills/apex-code/scripts/engine-plan-test.ps1', 'skills/apex-code/scripts/engine-test.ps1', 'skills/apex-code/scripts/engine-dispatch-test.ps1')
if (Select-String -SimpleMatch 'gpt-5.6-sol' -Path $paths) { throw 'retired model literal remains in a coder file' }
```
- [ ] Task 1 - AC2: the wrapper refuses a retired explicit pin at parameter validation before dispatch → verify: a separate `powershell.exe -NoProfile -Command` invocation catches `ParameterBindingException` and recognizes the ValidateSet error.
```powershell apex-accept
$check = @'
try {
    & 'skills/apex-code/scripts/codex-dispatch.ps1' -Model 'gpt-5.6-sol' -ErrorAction Stop
    throw 'retired model passed parameter validation'
} catch [System.Management.Automation.ParameterBindingException] {
    if ($_.Exception.Message -notmatch 'ValidateSet|does not belong to the set') { throw }
}
exit 0
'@
powershell.exe -NoProfile -Command $check
if ($LASTEXITCODE -ne 0) { throw 'wrapper parameter validation check failed' }
```
- [ ] Task 2 - The planner retains the existing refusal message for a retired `coder_model` pin → verify: Task 2's negative fixture passes in the planner suite and the refusal text `frontmatter coder_model is not an allowed Codex model` remains in the planner.
- [ ] Task 2 - AC3: the planner default, permitted pins, and retired pin case pass → verify: `engine-plan-test.ps1` exits 0.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-plan-test.ps1 failed' }
```
- [ ] Task 1 - AC4: dispatch fixtures pass with the permitted model → verify: `engine-dispatch-test.ps1` exits 0.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-dispatch-test.ps1 failed' }
```
- [ ] Task 3 - AC5: the state schema parses and all three model enums are exactly `gpt-6-sol, gpt-6.1-sol` → verify: parse with `ConvertFrom-Json` and compare each enum in order.
```powershell apex-accept
$s = Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-code/references/engine-state-schema.json' | ConvertFrom-Json
$enums = @(
    $s.properties.plan.oneOf[0].properties.spec.properties.coder_model.enum,
    $s.properties.plan.oneOf[0].properties.waves.items.properties.tasks.items.properties.coder_model.enum,
    $s.properties.tasks.items.properties.attempts.items.properties.model.enum
)
foreach ($values in $enums) { if ((@($values) -join ',') -cne 'gpt-6-sol,gpt-6.1-sol') { throw 'state-schema model enum mismatch' } }
```
- [ ] Task 4 - AC6: skill frontmatter and cap are correct, and the default-model clause remains → verify: exact frontmatter lines, no more than 500 lines, and the stated clause.
```powershell apex-accept
$lines = @(Get-Content -Encoding UTF8 -LiteralPath 'skills/apex-code/SKILL.md')
if ($lines.Count -gt 500) { throw 'apex-code skill exceeds 500 lines' }
if (@($lines | Where-Object { $_ -ceq 'version: 2.27.1' }).Count -ne 1) { throw 'skill version mismatch' }
if (@($lines | Where-Object { $_ -ceq 'last_updated: 2026-10-19' }).Count -ne 1) { throw 'skill date mismatch' }
if (-not (($lines -join ' ').Contains('`gpt-6.1-sol`, the default;'))) { throw 'default-model clause missing' }
```
- [ ] Task 1 - All Engine fixture models and the ladder assertion use `gpt-6.1-sol` → verify: Task 1's own-files scan returns no matches and HOST H3 passes.
- [ ] AC7 - HOST H3 runs `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` natively in the build repository → verify: exit code 0; keep this long suite outside `apex-accept`.
- [ ] AC8 - HOST runs the current build-repository `AGENTS.md` `## Verify commands` fence → verify: each command below passes; H3 supplies the final Engine-suite line.
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
- [ ] AC9 - HOST H1 and H2 bookkeeping is present → verify: the exact H1 row and H2 bullet each occur once, the row is the first dated history row, and the bullet is the first bullet in Unreleased Changed.
```powershell
$history = @(Get-Content -Encoding UTF8 -LiteralPath 'C:/Users/User/apex/SKILL-HISTORY.md')
$row = '| 2026-10-19 | apex-code | SKILL.md, scripts/codex-dispatch.ps1, scripts/engine-plan.ps1, references/engine-state-schema.json, 3 Engine test suites | 2.27.1 | update | gpt-5.6-sol retired from wrapper -Model set, Engine coder_model allowlist and state schema; all coding on gpt-6.1-sol | owner decision 2026-10-19 (retire-gpt-5-6-sol) |'
if (@($history | Where-Object { $_ -ceq $row }).Count -ne 1) { throw 'history row count mismatch' }
if (($history | Where-Object { $_ -match '^\| \d{4}-\d{2}-\d{2} \|' } | Select-Object -First 1) -cne $row) { throw 'history row is not newest' }
$changelog = @(Get-Content -Encoding UTF8 -LiteralPath 'C:/Users/User/apex/CHANGELOG.md')
$bullet = '- apex-code: retired `gpt-5.6-sol` from the Codex wrapper and Engine; all coding runs on `gpt-6.1-sol` (retire-gpt-5-6-sol).'
if (@($changelog | Where-Object { $_ -ceq $bullet }).Count -ne 1) { throw 'changelog bullet count mismatch' }
$unreleased = [Array]::IndexOf($changelog, '## [Unreleased]')
$changed = [Array]::IndexOf($changelog, '### Changed')
if ($unreleased -lt 0 -or $changed -le $unreleased) { throw 'Unreleased Changed section missing' }
if (($changelog[($changed + 1)..($changelog.Count - 1)] | Where-Object { $_ -like '- *' } | Select-Object -First 1) -cne $bullet) { throw 'changelog bullet is not first' }
```
- [ ] Task 5 - HOST H1 has one newest history row → verify: the AC9 history assertions pass.
- [ ] Task 6 - HOST H2 has one first Unreleased Changed bullet → verify: the AC9 changelog assertions pass.
- [ ] Task 7 - HOST H3 completes native Engine verification → verify: AC7 exits 0.
- [ ] Scope - only the seven coder files and two HOST bookkeeping files in `## Files to Change` are written → verify: HOST compares pre-build and post-build path states and diffs in both repositories; out-of-scope dirty paths predate the build and are named in the report. Do not move or archive this spec.
- [ ] Reachability - the real wrapper invocation rejects the retired explicit pin and Engine planning refuses the corresponding `coder_model` → verify: AC2's parameter-binding check and AC3's negative planner fixture both pass.

## Progress
_(The build writes here — do not edit manually)_
