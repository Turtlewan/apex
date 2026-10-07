---
spec: engine-build-outputs
status: draft
autonomy_level: L2
risk: medium
coder_effort: high
max_parallel_codex: 1
---

# Spec: Engine build outputs
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Make Engine residue classification honor committed `## Build outputs` declarations and keep its parser byte-identical to scope-check and tree-pin.

## Intent
- **Intent:** A real Engine verify may create ignored output beneath a committed declaration without parking; undeclared output still parks the Engine with process exit 1.
- **Invariants:** Only `!!` paths at or below a declared entry are exempt; `??`, tracked, and undeclared paths remain checked. Only manifest files are copied and staged, including an explicitly authorized ignored file beneath a declared prefix. Declaration lookup failure disables only the declared class. Teardown removes a task worktree containing ignored outputs.
- **Non-goals:** Recipe-grammar parity belongs to sibling spec `engine-recipe-parity`; no changes to its four scripts, Engine plan or persisted plan state, or `engine-git.ps1`.

## Assumptions
- `C:/Users/User/.claude` is the build repo at HEAD `73d6dff`; Task anchors refer to that commit. A different HEAD stops the build. → impact: Stop.
- PowerShell 5.1 and Git are available; hermetic tests use their own repositories and isolated `GIT_CONFIG_GLOBAL`. → impact: Stop.
- The shared `# BEGIN build-outputs lockstep` / `# END build-outputs lockstep` block in scope-check and tree-pin is byte-identical before this build. → impact: Stop.

Simplicity check: one Engine implementation task, one Engine regression task, one lockstep task, one documentation task, and two HOST records; recipe parity has a separate owner.

## Prerequisites
- Specs that must be complete first: `dispatch-pipeline-fixes` at build-repo HEAD `73d6dff`. `engine-recipe-parity` is a separate, file-disjoint sibling, not a prerequisite.
- Environment setup required: run from `C:/Users/User/.claude`; preserve existing dirty files and use temporary fixture repositories.

## Files to Change
Grep evidence (re-run at `73d6dff`): `rg -n 'BEGIN build-outputs lockstep|END build-outputs lockstep|Get-RunnerUntrackedIgnoredPaths|Get-RunnerUnexpectedResidue|Test-RunnerToolCachePath|Copy-EngineTaskFiles|Stage-EngineWave|worktree.*remove' C:/Users/User/.claude/skills/apex-code/scripts` finds the existing parser at `codex-scope-check.ps1:327-464` and `tree-pin.ps1:99-236`, Engine residue at `apex-engine.ps1:210-289,813-818`, copy/stage at `engine-git.ps1:287-330,374-400`, and forced teardown at `engine-git.ps1:709-719`. `rg -n 'lockstep|scratch|residue|Teardown|function New-TestRepo|function Invoke-TestEngine' C:/Users/User/.claude/skills/apex-code/scripts/tree-pin-test.ps1 C:/Users/User/.claude/skills/apex-code/scripts/engine-test.ps1` finds the two-way comparison and mutation probe at `tree-pin-test.ps1:118-131,536-546`, Engine fixture entry at `engine-test.ps1:80-113,365-370,425-455`, residue tests at `:1807-1827`, and teardown at `:1971-2004`. `rg -n 'engine-build-output-residue|Build outputs' C:/Users/User/.claude/skills/apex-code/references/parallel-codex.md` finds the limitation at `:63-65`. `rg -n 'D1|Build outputs' C:/Users/User/apex/docs/technical/adr/ADR-044-round8-deferred-designs.md` finds the dated D1 amendment at `:39-49`; `rg -n 'dispatch-pipeline-fixes|apex-code' C:/Users/User/apex/SKILL-HISTORY.md` finds the current apex-code row near `:5`.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-engine.ps1 | modify | Lockstep parser copy, committed declaration adapter, `!!` residue exemption. |
| skills/apex-code/scripts/engine-test.ps1 | modify | Real Engine residue, fail-closed, integration, and teardown regressions. |
| skills/apex-code/scripts/tree-pin-test.ps1 | modify | Three-way byte equality with scratch mutation probe. |
| skills/apex-code/references/parallel-codex.md | modify | Replace temporary Engine limitation with shipped behavior. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST: dated apex-code history row. |
| C:/Users/User/apex/docs/technical/adr/ADR-044-round8-deferred-designs.md | modify | HOST: dated D1 Engine note. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" }], "depends_on": [], "effort": "high" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" }], "depends_on": ["1"], "effort": "high" },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/tree-pin-test.ps1", "op": "modify" }], "depends_on": ["1"], "effort": "medium" },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-code/references/parallel-codex.md", "op": "modify" }], "depends_on": ["1"], "effort": "low" }
  ]
}
```

## Tasks
- [ ] **Task 1** - Engine residue classification: in `apex-engine.ps1:210-238` copy the complete `# BEGIN build-outputs lockstep` / `# END build-outputs lockstep` pure-function block byte-for-byte from `codex-scope-check.ps1:327-464` (equal to `tree-pin.ps1:99-236`). Outside that block, add an Engine-local adapter that reads the integration worktree's committed HEAD `AGENTS.md` using `ls-tree --full-tree --name-only HEAD -- AGENTS.md` before `show HEAD:AGENTS.md`; an absent file or heading yields zero entries, while a Git failure emits one `[engine] WARNING: ... build-output declarations unavailable (...); declared class disabled` and returns zero entries without disabling other residue checks. Cache the parsed declaration or fetch failure per integration-HEAD SHA, re-fetch only when the integration worktree HEAD changes (for example, after a wave commit), and print the fetch-failure warning once per HEAD SHA. Add test-mode-only `APEX_ENGINE_TEST_FAIL_AGENTS_FETCH = 'ls-tree' | 'show'` handling inside this adapter, honored only when `APEX_ENGINE_TEST_MODE=1`: fail only the selected declaration Git operation, leaving every other Git call intact. Add a test-mode-only `APEX_ENGINE_TEST_AGENTS_FETCH_TRACE_PATH` seam that appends the integration-HEAD SHA once when a declaration fetch begins, including a failed fetch, so Task 2 can count fetches; keep both seams outside the shared parser block. Use the shared parser's entries and warning, with no field added to the plan or persisted state. In `Get-RunnerUntrackedIgnoredPaths:222-238`, retain tool-cache filtering and filter declared paths only while `$xy -ceq '!!'` and `Test-IsDeclaredBuildOutputPath -Path $path -Entries $entries`; consult the cache keyed to current integration HEAD for each inventory/scan so `Ensure-RunnerResidueInventory:256-270` and `Get-RunnerUnexpectedResidue:273-289` see the same class. At `:813-818`, keep internal code 69 but make the persisted diagnosis include `unexpected residue` and the offending path; a parked Engine run returns process exit 1 through `Invoke-RunnerMainLoop:1228` and `:1572`. Do not change the gate order or `engine-git.ps1:287-330,374-400`. — files: skills/apex-code/scripts/apex-engine.ps1 — done when: declared `!!` entries are absent from both inventories, `??`/tracked/undeclared entries retain existing treatment, a declaration fetch failure warns once per HEAD SHA and leaves undeclared residue checking live, the trace proves one fetch per HEAD SHA across inventory and scan and a fresh fetch after a wave commit, the shared block is byte-identical to both existing copies, and the named Task 2 `engine-test.ps1` cases pass as behavioural proof.
- [ ] **Task 2** - Engine regression matrix: extend `engine-test.ps1:80-113,293-370,425-455,1807-1827` with hermetic repositories whose committed `AGENTS.md` declares `src/*/bin` and whose `.gitignore` actually ignores that output; drive the real `apex-engine.ps1` entry point through task copy, integration pin, baseline verify, and residue scan. In the real-script reachability pair, leave `APEX_ENGINE_TEST_TREE_PIN_PATH` and `APEX_ENGINE_TEST_BASELINE_PATH` unset so the real `tree-pin.ps1` and `apex-baseline-check.ps1` run. Make the fixture repo's committed `AGENTS.md` `## Verify commands` fence create a declared ignored output in one case and an undeclared ignored output in its twin; assert complete/process exit 0 for the declared case and parked/process exit 1 for the undeclared case, with its cause and path in the persisted `engine-state.json` diagnosis and no integration commit on park. The undeclared output may park at any gate: with the real tree-pin script, its working-tree movement is caught by tree-pin verify at `apex-engine.ps1:809-812` before the residue gate at `:813-818`. In separate residue-classification cases, use the existing `APEX_ENGINE_TEST_TREE_PIN_PATH` test-mode stub to let verify reach the residue gate: a declared ignored output is exempt and completes; an undeclared ignored output parks with `unexpected residue` and its path in the persisted diagnosis. Use that stub also for a working-tree-only declaration that still parks and an unignored `??` file beneath a declared prefix that still parks; each negative case asserts process exit 1, `unexpected residue` and the offending path in `engine-state.json`, and no integration commit. Add `ls-tree` and `show HEAD:AGENTS.md` failure cases using `APEX_ENGINE_TEST_FAIL_AGENTS_FETCH` under `APEX_ENGINE_TEST_MODE=1`, never a PATH Git shim; each selected failure warns exactly once for its HEAD SHA, leaves other Git operations intact, and parks on ignored output with process exit 1, `unexpected residue` and the undeclared ignored path in the persisted diagnosis. Use `APEX_ENGINE_TEST_AGENTS_FETCH_TRACE_PATH` to assert exactly one declaration fetch for the same integration-HEAD SHA across inventory and scan of one wave, and a second fetch for a different SHA after a first-wave integration commit; assert one warning per HEAD SHA in failed-fetch runs. Save and restore both new test environment variables with the existing test seams. At `engine-git.ps1:287-330,393` exercise a manifest-authorized ignored file under a declared prefix and assert byte equality plus its presence in `git ls-tree -r <integration tip>`, while a second ignored file under the same declared prefix but outside the manifest is absent from that tree and remains exempt residue so the run completes. At `engine-test.ps1:1971-2004`, place a declared ignored output in a task worktree before the existing proof-gated `-Teardown` path and assert teardown exit 0, complete journal, and removed worktree, relying on `engine-git.ps1:713` without editing it. — files: skills/apex-code/scripts/engine-test.ps1 — done when: the real-script pair completes/0 for declared output and parks/1 for undeclared output without an integration commit, the stubbed residue cases prove declared exemption and undeclared/working-tree-only/unignored residue parks with path-bearing persisted diagnoses and process exit 1, each fetch failure warns once per HEAD SHA and parks/1 with the undeclared path in the diagnosis, the trace proves one fetch per integration-HEAD SHA across inventory and scan plus a fresh fetch after HEAD changes, exact authorized ignored bytes are in the integration tree, no off-manifest ignored file is in that tree despite its declared prefix, and dirty-worktree teardown succeeds.
- [ ] **Task 3** - Three-copy lockstep guard: extend `tree-pin-test.ps1:118-131,536-546` to read `apex-engine.ps1` via `Join-Path $PSScriptRoot`, extract its marked build-outputs block, and compare raw UTF-8 block bytes across Engine, scope-check, and tree-pin; keep the scratch-copy mutation probe and require it to fail against the three-way comparison. — files: skills/apex-code/scripts/tree-pin-test.ps1 — done when: all three live blocks compare byte-for-byte and a mutated scratch copy is rejected.
- [ ] **Task 4** - Engine guidance: at `parallel-codex.md:63-65` remove the temporary `engine-build-output-residue` limitation and state that Engine honors committed `## Build outputs` with the same declaration grammar as scope-check/tree-pin for ignored, untracked verify residue. Retain the manifest-only copy/stage procedure at `:52-61`. — files: skills/apex-code/references/parallel-codex.md — done when: the limitation is absent and the guide states the shared Engine rule without changing the integration procedure.
- [ ] **Task 5 (HOST)** - History: add one dated apex-code row adjacent to the current `SKILL-HISTORY.md:5` entry, naming this spec, the four build-repo files, and the Engine declared-output behavior and tests; do not change the skill set or `SKILLS.md`. — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: one dated `engine-build-outputs` row identifies the shipped build files and behavior.
- [ ] **Task 6 (HOST)** - D1 record: append a dated `2026-10-06` note under the existing D1 amendment at `ADR-044-round8-deferred-designs.md:39-49` stating that Engine joins the declared build-output class with the same committed-HEAD parser, `!!` filter, and fail-closed lookup behavior. — files: C:/Users/User/apex/docs/technical/adr/ADR-044-round8-deferred-designs.md — done when: D1 explicitly includes Engine and the date.

## Wave plan
Wave 1: [task 1] | Wave 2: [task 2] | Wave 3: [task 3] | Wave 4: [task 4]. `max_parallel_codex: 1`; manifest dependencies are authoritative. HOST tasks 5-6 run after coder verification, outside the manifest.

## Permissions

The following non-critical build actions are authorized. HOST owns the two APEX documentation writes after coder verification; they are outside the Engine manifest. Preserve pre-existing dirty files. No commit, push, index mutation, checkout, reset, or stash of the live repositories is authorized.

### File Operations
| Action | Paths |
|--------|-------|
| Modify | `C:/Users/User/.claude/skills/apex-code/scripts/apex-engine.ps1`, `C:/Users/User/.claude/skills/apex-code/scripts/engine-test.ps1`, `C:/Users/User/.claude/skills/apex-code/scripts/tree-pin-test.ps1`, `C:/Users/User/.claude/skills/apex-code/references/parallel-codex.md` |
| HOST modify | `C:/Users/User/apex/SKILL-HISTORY.md`, `C:/Users/User/apex/docs/technical/adr/ADR-044-round8-deferred-designs.md` |
| Create or delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File engine-test.ps1` | Run the real Engine regression suite from the scripts directory. |
| `powershell.exe -NoProfile -File tree-pin-test.ps1` | Run the three-copy lockstep and tree-pin suite from the scripts directory. |
| `git status --porcelain -uall` | Review build scope in both repositories. |
| Existing build-repo `AGENTS.md` Verify commands fence | Run the prescribed structural/build checks. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Read-only status and HEAD inspection | Both repositories. |
| Fixture commits/worktree teardown | Hermetic temporary repositories only, within test scripts. |
| Live add, commit, push, checkout, reset, stash | (none) |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `GIT_CONFIG_GLOBAL` | Isolate test Git configuration. |
| `TEMP` | Store hermetic fixture repositories. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | Local build and verification. |

## Specialist Context
### Security
Only committed declarations and `!!` status may exempt residue. Fetch failures leave the declared class disabled; the test-mode failure and trace seams operate only under `APEX_ENGINE_TEST_MODE=1` and do not replace Git on PATH. Manifest copy and stage checks retain their existing bounds.

### Performance
Cache the parsed declaration or fetch failure per integration-HEAD SHA; inventory and scan of one wave make exactly one declaration fetch for that SHA, and a second wave after an integration worktree HEAD change makes one fresh fetch. The test-mode trace counts fetch starts without changing production behavior; a failed fetch warns once per SHA.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Build guide | skills/apex-code/references/parallel-codex.md | Remove the Engine limitation and state the shared grammar. |
| History (HOST) | C:/Users/User/apex/SKILL-HISTORY.md | Add the dated apex-code row. |
| ADR (HOST) | C:/Users/User/apex/docs/technical/adr/ADR-044-round8-deferred-designs.md | Add the dated D1 Engine note. |

## Acceptance Criteria
- [ ] Task 1 → verify: extract each marked block as UTF-8 and compare byte-for-byte; from the scripts directory run `powershell.exe -NoProfile -File engine-test.ps1` and require its named Task 2 cases to pass as behavioural proof that Engine reads only integration HEAD declarations, caches each parsed declaration or fetch failure per HEAD SHA, skips declared `!!` entries at inventory time, retains `??` and undeclared entries, records one fetch per SHA across inventory and scan plus a fresh fetch after HEAD changes, and the residue gate keeps its internal code 69 while a parked Engine process exits 1 with an `unexpected residue` diagnosis.
- [ ] Task 2 → verify: from the scripts directory run `powershell.exe -NoProfile -File engine-test.ps1`; exit 0 with explicit assertions for real `tree-pin.ps1` and `apex-baseline-check.ps1` reachability in the committed-verify-fence declared output complete/0 and undeclared output park/1 cases (any gate, no integration commit, persisted path-bearing cause); separate tree-pin-stub cases prove declared `!!` exemption and undeclared, working-tree-only, and unignored output park/1 at the residue gate with `unexpected residue` and the path in `engine-state.json`. Each `ls-tree` and `show` adapter failure warns once per HEAD SHA and parks/1 with `unexpected residue` and the undeclared ignored path in the persisted diagnosis; the fetch trace shows exactly one declaration fetch per SHA across inventory and scan and a fresh fetch for the changed SHA after a wave commit. Assert authorized ignored-file bytes present in `git ls-tree -r <integration tip>`, an off-manifest ignored file under the same declared prefix absent from that tree while the run completes, and dirty task-worktree teardown complete/0.
- [ ] Task 3 → verify: from the scripts directory run `powershell.exe -NoProfile -File tree-pin-test.ps1`; exit 0, three live block byte comparisons pass, mutated scratch-copy comparison fails as expected.
- [ ] Task 4 → verify: `rg -n 'engine-build-output-residue|Current limitation' skills/apex-code/references/parallel-codex.md` returns no hits; `rg -n 'Engine|Build outputs|committed' skills/apex-code/references/parallel-codex.md` finds the shipped rule and the primary integration procedure.
- [ ] Task 5 (HOST) → verify: `rg -n 'engine-build-outputs' SKILL-HISTORY.md` in APEX finds exactly one dated row listing the four build-repo files.
- [ ] Task 6 (HOST) → verify: `rg -n '2026-10-06|Engine|declared build-output' docs/technical/adr/ADR-044-round8-deferred-designs.md` finds the dated D1 note.
- [ ] Build fence → verify: from `C:/Users/User/.claude`, run every command in its existing `AGENTS.md` `## Verify commands` fence; each exits 0. Include the Engine and tree-pin suites above.
- [ ] Scope → verify: `git status --porcelain -uall` in each repository lists all six `## Files to Change` paths (` M`); every other path shown was dirty before this build and is named in the build report. No recipe-parity file or APEX status file is modified.
- [ ] Reachability — real Engine run accepts declared ignored output and parks on undeclared ignored output → verify: the `engine-test.ps1` fixture invokes `apex-engine.ps1` through its normal entry point with a committed declaration and a committed `AGENTS.md` `## Verify commands` fence that writes ignored output; both cases use the real `tree-pin.ps1` and `apex-baseline-check.ps1` without `APEX_ENGINE_TEST_TREE_PIN_PATH` or `APEX_ENGINE_TEST_BASELINE_PATH` stubs. The declared case completes with process exit 0. The undeclared case parks with process exit 1 at any gate (normally tree-pin verify), persists a cause and the ignored path in `engine-state.json`, and makes no integration commit. The separate test-mode tree-pin-stub cases reach the residue gate and prove the declared exemption versus an undeclared `unexpected residue` diagnosis naming the path.

## Progress
_(The build writes here — do not edit manually)_
