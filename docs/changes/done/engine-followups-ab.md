---
spec: engine-followups-ab
status: draft
autonomy_level: L2
risk: low
coder_effort: medium
max_parallel_codex: 2
---

# Spec: Engine follow-ups and builder A/B
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Admit `gpt-6.1-sol` in the wrapper and close four queued Engine and wrapper follow-ups with host-run builder comparison.

## Intent
- **Intent:** Complete the four bounded follow-ups from `engine-hardening` and `engine-high-risk-pause`, then record builder A/B measurements for Tasks 2–4.
- **Invariants:** The wrapper model spelling remains case-sensitive; tree-pin override rows reflect supplied scripts; failed runner capture parks before an integration commit; refusal tests check the specific invariant they guard.
- **Non-goals:** Default builder switch; review or verify semantic changes beyond these tasks; skill prose; `AGENTS.md` fence edits.

## Assumptions
- `C:/Users/User/.claude` is the build repo at HEAD `4c9fc5a`; all coder anchors below refer to that revision. → impact: Stop.
- HOST builds Task 1 once with the default model before Task 2, and builds each of Tasks 2–4 twice, using `-Model gpt-5.6-sol` and `-Model gpt-6.1-sol`, the same pack and effort, and separate worktrees from the same task base. HOST reviews both and integrates one result per task; criteria apply to the integrated result. → impact: Stop.
- PowerShell 5.1, Git, and the build repo's existing `AGENTS.md` Verify commands are available. → impact: Stop.

Simplicity check: Four coder tasks match the four independent concerns; Task 2 follows Task 1 at the shared wrapper file.

## Prerequisites
- Specs complete first: `docs/changes/done/engine-hardening.md` and `docs/changes/done/engine-high-risk-pause.md`.
- Environment: build from `C:/Users/User/.claude`; preserve pre-existing dirty paths in both repos; HOST owns comparison worktrees, result selection, and the two APEX close-out files.

## Files to Change
Grep evidence: run at build HEAD `4c9fc5a` with `rg -n -F` against each named file (2026-10-05): `codex-dispatch.ps1` `[ValidateSet(` at 18 and `tree_pin_override` at 3499; `dispatch-author-test.ps1` `author-create-happy` at 482 and `Invoke-InvalidModelCase` at 654; `dispatch-criticalfile-test.ps1` `tree_pin_override` at 481 and 501; `apex-engine.ps1` `Ensure-RunnerResidueInventory` at 913 and `write-tree` at 930; `engine-test.ps1` `review flag validation` at 994 and `APEX_ENGINE_TEST_FAIL_INDEX_IDENTITY` at 1554; `engine-plan-test.ps1` `risk high grammar` at 314; `engine-git-test.ps1` `hand-off expected tip` at 367. In APEX, `rg -n -F 'engine-high-risk-pause' SKILL-HISTORY.md` found the current top row at 5; `Test-Path docs/research/builder-ab-2026-10.md` returned false. These are eight coder file entries across tasks, resolving to seven distinct paths.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/codex-dispatch.ps1 | modify | T1 model allowlist; T2 override row. |
| skills/apex-code/scripts/dispatch-author-test.ps1 | modify | T1 model acceptance and case refusal. |
| skills/apex-code/scripts/dispatch-criticalfile-test.ps1 | modify | T2 build override rows. |
| skills/apex-code/scripts/apex-engine.ps1 | modify | T3 capture failure parking. |
| skills/apex-code/scripts/engine-test.ps1 | modify | T3 capture and absolute-path cases. |
| skills/apex-code/scripts/engine-plan-test.ps1 | modify | T4 risk refusal messages. |
| skills/apex-code/scripts/engine-git-test.ps1 | modify | T4 hand-off state guards. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST T5 row. |
| C:/Users/User/apex/docs/research/builder-ab-2026-10.md | create | HOST T6 measurements and selections. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/codex-dispatch.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/dispatch-author-test.ps1", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/codex-dispatch.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/dispatch-criticalfile-test.ps1", "op": "modify" }], "depends_on": ["1"], "effort": "medium" },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-git-test.ps1", "op": "modify" }], "depends_on": [], "effort": "medium" }
  ]
}
```

## Tasks
- [ ] **Task 1** - Wrapper model allowlist: at `codex-dispatch.ps1:18`, add `'gpt-6.1-sol'` to the existing case-sensitive `ValidateSet` without changing the default at `:19`. In `dispatch-author-test.ps1:482-508`, add a case mirroring `author-create-happy` with `Model = 'gpt-6.1-sol'`, asserting argv contains adjacent `-m gpt-6.1-sol` and the dispatch ledger row has `[string]$row.model -ceq 'gpt-6.1-sol'`; keep the `GPT-6-SOL` refusal at `:650-663` and add the same no-argv/no-ledger refusal for `GPT-6.1-SOL`. — files: skills/apex-code/scripts/codex-dispatch.ps1, skills/apex-code/scripts/dispatch-author-test.ps1 — done when: `dispatch-author-test.ps1` exits 0.
- [ ] **Task 2** - Record build tree-pin overrides: at `codex-dispatch.ps1:3499`, replace `([bool]$TreePinScript -and [bool]$ReviewedRunId)` with `[bool]$TreePinScript`. In `dispatch-criticalfile-test.ps1:458-503`, add a build-phase dispatch with `-TreePinScript` and assert its build row has `tree_pin_override -eq $true`; add a build-phase dispatch without it and assert `$false`; retain the review assertions at `:481` and `:501`. — files: skills/apex-code/scripts/codex-dispatch.ps1, skills/apex-code/scripts/dispatch-criticalfile-test.ps1 — done when: `dispatch-criticalfile-test.ps1` and `dispatch-test.ps1` exit 0.
- [ ] **Task 3** - Park capture failures: in `apex-engine.ps1:913`, wrap `Ensure-RunnerResidueInventory` in `try/catch`; on failure call `Set-RunnerParked "residue inventory capture failed for wave <n>: <reason>" $null` and return `$false`. Wrap the `write-tree`, intent assignment, and `Save-RunnerState` block at `:930-935` in `try/catch`; on failure remove any newly assigned, unsaved `commit_intent`, call `Set-RunnerParked "integration commit-intent capture failed for wave <n>: <reason>" $null`, and return `$false` before `Commit-EngineWave:937`. Add test-only `APEX_ENGINE_TEST_FAIL_WRITE_TREE` and `APEX_ENGINE_TEST_FAIL_RESIDUE_CAPTURE` seams, honored only with `APEX_ENGINE_TEST_MODE=1`, mirroring `Get-RunnerIndexIdentity:196-201`; make their thrown reasons exactly `git write-tree failed (test seam)` and `residue inventory capture failed (test seam)`. In `engine-test.ps1:1554-1570`, add named `commit-intent capture failure parks` and `residue capture failure parks` cases asserting status `parked`, exact diagnosis, unchanged `integration.tip`, and no `commit_intent`. In `review flag validation:965-994`, make the `C:review.txt` and `\review.txt` refusals each assert `-ReviewRecord must be an absolute normalized path.` in their own output, in addition to `Engine refused` and unchanged state hash. — files: skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/scripts/engine-test.ps1 — done when: `engine-test.ps1` exits 0.
- [ ] **Task 4** - Strengthen planner and git layer tests: in `engine-plan-test.ps1:314-331`, make each frontmatter refusal fixture (empty, `critical`, `highly`, `High`, `HIGH`) assert both `-not .allowed` and `.refusal -ceq 'frontmatter risk must be low, medium or high'`. In `engine-git-test.ps1:359-367`, assert the integration worktree's live `HEAD` equals the `-ExpectedTip $tip` before `ok - hand-off expected tip`; at `:376-388`, snapshot main-repo `HEAD` and a sorted StateDirectory listing of relative names plus byte sizes immediately before and after the moved-tip refused call, and assert both snapshots unchanged. — files: skills/apex-code/scripts/engine-plan-test.ps1, skills/apex-code/scripts/engine-git-test.ps1 — done when: `engine-plan-test.ps1` and `engine-git-test.ps1` exit 0.
- [ ] **Task 5 (HOST)** - Prepend one dated apex-code row at `SKILL-HISTORY.md:4-5` naming `engine-followups-ab`, the seven distinct coder files, the model allowlist, tree-pin row, runner capture parking, and strengthened tests; preserve existing rows. — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: one new row contains the spec name and all seven coder paths.
- [ ] **Task 6 (HOST)** - Create `builder-ab-2026-10.md` after choosing integrated results; use a table with columns `Task | Model | Base | Pack/effort | Wall-clock | Quota/tokens | First-pass verify | Scope violations | Blind-Critic findings | Chosen result`. Record Task 1's default-model baseline and, for every Task 2–4/model pair, the same task base and pack/effort, measured values, and one chosen result per task; start each data row with `| Task N | <model> |`. — files: C:/Users/User/apex/docs/research/builder-ab-2026-10.md — done when: the file has one Task 1 row and six paired A/B rows with a selected result for each of Tasks 2–4.

## Wave plan
Wave 1: [task 1, task 3, task 4] | Wave 2: [task 2]. HOST completes Task 1 before launching the paired Task 3 and Task 4 builds, then runs Task 2 from the integrated Task 1 base. HOST integrates one reviewed result per paired task. Tasks 5–6 follow coder verification.

## Permissions
The following non-critical file operations and local commands are authorized for the build. The standing scope lock applies to every dispatch.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder) | The seven build-repo files in `## Files to Change`. |
| Modify (HOST) | C:/Users/User/apex/SKILL-HISTORY.md |
| Create (HOST) | C:/Users/User/apex/docs/research/builder-ab-2026-10.md |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1` | T1 model checks. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-criticalfile-test.ps1` | T2 override checks. |
| `powershell.exe -NoProfile -File dispatch-test.ps1` from the scripts directory | T2 wrapper regression. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` | T3 runner checks. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` | T4 planner checks. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1` | T4 git checks. |
| Build repo `AGENTS.md` `## Verify commands` fence | Full structural and regression fence. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Read-only `git` commands | Build and APEX repos; no index or history writes. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_ENGINE_TEST_MODE`, `APEX_ENGINE_TEST_FAIL_WRITE_TREE`, `APEX_ENGINE_TEST_FAIL_RESIDUE_CAPTURE` | T3 test-only failure seams. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | Local build and verification. |

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
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST Task 5 prepends the row. |
| Research | C:/Users/User/apex/docs/research/builder-ab-2026-10.md | HOST Task 6 records A/B results. |

## Acceptance Criteria
- [ ] Task 1 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1` → verify: exit 0; new lowercase model has adjacent `-m gpt-6.1-sol` and a case-exact ledger model; both uppercase model variants exit 1 with zero dispatch rows and no argv file.
- [ ] Task 2 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-criticalfile-test.ps1`; from the scripts directory, run `powershell.exe -NoProfile -File dispatch-test.ps1` → verify: both exit 0; build rows report `tree_pin_override=true` with `-TreePinScript` and `false` without it, and existing review assertions remain green.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: exit 0; named `commit-intent capture failure parks` and `residue capture failure parks` have parked status, exact `integration commit-intent capture failed for wave 1: git write-tree failed (test seam)` and `residue inventory capture failed for wave 1: residue inventory capture failed (test seam)` diagnostics respectively, unchanged integration tip, no integration commit, and no `commit_intent`; named `review flag validation` asserts both drive-relative and root-relative cases contain `-ReviewRecord must be an absolute normalized path.` and leave the state-file hash unchanged.
- [ ] Task 4 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` and `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1` → verify: both exit 0; five frontmatter refusal cases compare the exact `.refusal`; `hand-off expected tip` checks live HEAD; `hand-off moved tip refuses` preserves both main HEAD and the sorted StateDirectory names/byte sizes.
- [ ] Task 5 (HOST) — run `rg -n -F 'engine-followups-ab' C:/Users/User/apex/SKILL-HISTORY.md` → verify: exactly one new dated apex-code row names all seven distinct coder files and the four follow-ups.
- [ ] Task 6 (HOST) — run `rg -n '^\| Task [1-4] \| (gpt-5\.6-sol|gpt-6\.1-sol) \|' C:/Users/User/apex/docs/research/builder-ab-2026-10.md` → verify: seven data rows, one for Task 1 and two for each of Tasks 2–4; each row fills all ten table columns, and exactly one result is chosen per paired task.
- [ ] Tasks 1–6 build fence — from `C:/Users/User/.claude`, run the PowerShell block below → verify: every command in its existing `AGENTS.md` `## Verify commands` fence exits 0; the two Task 2 tests above also exit 0.
```powershell
$source = Get-Content -LiteralPath AGENTS.md -Raw -Encoding UTF8
$fence = [regex]::Match($source, '(?ms)^## Verify commands\r?\n.*?^```\r?\n(?<cmds>.*?)^```[ \t]*\r?$')
if (-not $fence.Success) { throw 'Verify commands fence missing' }
foreach ($command in ($fence.Groups['cmds'].Value -split '\r?\n')) {
    if ([string]::IsNullOrWhiteSpace($command)) { continue }
    & powershell.exe -NoProfile -Command $command
    if ($LASTEXITCODE -ne 0) { throw "Verify command failed ($LASTEXITCODE): $command" }
}
& powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'dispatch-test.ps1 failed' }
& powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-criticalfile-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'dispatch-criticalfile-test.ps1 failed' }
```
- [ ] Tasks 1–6 scope — run the first block at build start and the second after HOST close-out in one persistent PowerShell session → verify: `scope hashes OK`; only the seven coder paths and two HOST paths may change. `dispatch-test.ps1` is protected by the hash snapshot as a verified, unmodified eighth script. The host-owned status file is excluded from enumeration and hashing.
```powershell
$claudeRoot = 'C:/Users/User/.claude'
$apexRoot = 'C:/Users/User/apex'
$claudeExplicit = @(
    'skills/apex-code/scripts/codex-dispatch.ps1',
    'skills/apex-code/scripts/dispatch-author-test.ps1',
    'skills/apex-code/scripts/dispatch-criticalfile-test.ps1',
    'skills/apex-code/scripts/apex-engine.ps1',
    'skills/apex-code/scripts/engine-test.ps1',
    'skills/apex-code/scripts/engine-plan-test.ps1',
    'skills/apex-code/scripts/engine-git-test.ps1'
)
$apexExplicit = @('SKILL-HISTORY.md', 'docs/research/builder-ab-2026-10.md')
function Add-ScopeHashes($root, $paths, $map) {
    Push-Location $root
    try {
        foreach ($path in @($paths | Sort-Object -Unique)) {
            $key = $root + '/' + $path.Replace('\', '/')
            if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
            $hash = & git hash-object -- $path
            if ($LASTEXITCODE -ne 0) {
                if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
                throw "git hash-object failed: $key"
            }
            $map[$key] = [string]$hash
        }
    } finally { Pop-Location }
}
function Get-FollowupScopeHashes {
    $map = [Collections.Generic.Dictionary[string,string]]::new([StringComparer]::Ordinal)
    Push-Location $claudeRoot
    try {
        $listed = @(git ls-files -co --exclude-standard)
        if ($LASTEXITCODE -ne 0) { throw 'git ls-files failed in .claude' }
    } finally { Pop-Location }
    Add-ScopeHashes $claudeRoot @($listed + $claudeExplicit + 'skills/apex-code/scripts/dispatch-test.ps1') $map
    Push-Location $apexRoot
    try {
        $tracked = @(git ls-files -co --exclude-standard)
        if ($LASTEXITCODE -ne 0) { throw 'git ls-files failed in apex' }
    } finally { Pop-Location }
    $tracked = @($tracked | Where-Object {
        $_ -ne 'docs/status.md' -and $_ -notlike 'docs/drafts/*' -and
        $_ -notlike 'docs/changes/*' -and $_ -notlike 'docs/handoff/*'
    })
    Add-ScopeHashes $apexRoot @($tracked + $apexExplicit) $map
    return ,$map
}
$scopeBefore = Get-FollowupScopeHashes
```
After HOST close-out, run this second block in the same PowerShell session:
```powershell
$scopeAfter = Get-FollowupScopeHashes
$allowed = @($claudeExplicit | ForEach-Object { $claudeRoot + '/' + $_ }) +
           @($apexExplicit | ForEach-Object { $apexRoot + '/' + $_ })
foreach ($path in $allowed) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing scoped file: $path" }
}
$paths = @(@($scopeBefore.Keys) + @($scopeAfter.Keys) | Sort-Object -Unique)
foreach ($path in $paths) {
    if ($allowed -ccontains $path) { continue }
    if (-not $scopeBefore.ContainsKey($path) -or -not $scopeAfter.ContainsKey($path) -or
        $scopeBefore[$path] -cne $scopeAfter[$path]) { throw "Out-of-scope file changed: $path" }
}
'scope hashes OK'
```
- [ ] Tasks 1–4 reachability — from `C:/Users/User/.claude`, run the six task test scripts listed under `### Commands` → verify: all exit 0 through real wrapper, runner, planner, and git entry points with their test fixtures.

## Progress
_(The build writes here — do not edit manually)_

Build date: 2026-10-05
