---
spec: system-map-core
status: built
autonomy_level: L2
risk: medium
coder_effort: high
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: System map core
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Add a freshness-checked system-map format, staged Trivial size guard, and new-project map stub.

## Intent
- **Intent:** Give the host a machine-checked component index and a pre-commit Trivial size measurement.
- **Invariants:** Map reads are read-only and compare each section with Git history; the guard measures the staged commit against the prediction. Both scripts fail closed on parse and Git transport errors. The System Overview stub and the AGENTS.md verify-fence shape remain intact.
- **Non-goals:** `apex-plan/SKILL.md`, `sol-plan-check.md`, `model-routing.md`, the session-context hook, Scribe, the Critic, the Engine, and writing a real map. Planning-gate routing and first maps are later specs.

## Assumptions
- Windows PowerShell 5.1 and Git for Windows are available in the build repository and hermetic test processes. -> impact: Stop
- `skills/apex-init/SKILL.md` is at version `1.7.4` before this build. -> impact: Caution
- The `## Verify commands` fence of the build repository's `AGENTS.md` ends with `engine-test.ps1`. -> impact: Caution

Simplicity check: two independent read-only scripts and one map-format reference; no shared helper or Engine change.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-plan/scripts/apex-map-check.ps1 | create | Task 1 map parser, freshness and path lookup CLI. |
| skills/apex-plan/scripts/apex-map-check-test.ps1 | create | Task 1 hermetic fixture suite. |
| skills/apex-plan/scripts/apex-size-guard.ps1 | create | Task 2 staged-change size CLI. |
| skills/apex-plan/scripts/apex-size-guard-test.ps1 | create | Task 2 hermetic fixture suite. |
| skills/apex-plan/references/system-map.md | create | Task 3 schema and host protocol. |
| skills/apex-init/SKILL.md | modify | Task 3 map stub, AGENTS pointer, version. |
| C:/Users/User/.claude/AGENTS.md | modify | HOST Task 4 verify-fence commands. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 5 top history row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 6 Unreleased Added bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [
      { "path": "skills/apex-plan/scripts/apex-map-check.ps1", "op": "create" },
      { "path": "skills/apex-plan/scripts/apex-map-check-test.ps1", "op": "create" }
    ], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [
      { "path": "skills/apex-plan/scripts/apex-size-guard.ps1", "op": "create" },
      { "path": "skills/apex-plan/scripts/apex-size-guard-test.ps1", "op": "create" }
    ], "depends_on": [] },
    { "id": "3", "repo": "claude", "files": [
      { "path": "skills/apex-plan/references/system-map.md", "op": "create" },
      { "path": "skills/apex-init/SKILL.md", "op": "modify" }
    ], "depends_on": [] }
  ]
}
```

## Tasks
- [x] **Task 1** - Create `skills/apex-plan/scripts/apex-map-check.ps1` with `-Repo <abs>` and mutually exclusive `-Stale`, `-Touches <path>...`, and `-Owner <path>` modes, plus optional `-Json`; create `skills/apex-plan/scripts/apex-map-check-test.ps1` to exercise the CLI against temporary Git repositories. Read `docs/system-map.md` when present; otherwise read `docs/system-map/index.md`, whose component entries are one `- <file>.md` per line under `docs/system-map/`. Parse each `## <component>` followed immediately by exactly `<!-- apex:map-section covers: <p> [<p>...] contracts: [<p>...] seams: [<p>...] verified: <40-hex> -->`. Require nonempty covers; contracts and seams may be empty. Treat paths as repo-relative forward-slash tokens without spaces, with `*` and `**` globs; reject absolute paths, traversal, malformed fields, missing referenced split files, and malformed sections with exit 2. A marker-only `<!-- apex:system-map -->` stub or any map with zero sections exits 3 and prints `no map sections`. For each section before the diff, an absent verified value marks it stale; run `git rev-parse --verify --quiet <sha>^{commit}`: exit 1 with empty stdout marks it stale as an unknown SHA. Then run `git merge-base --is-ancestor <sha> HEAD`: exit 1 marks it stale as a SHA that is not an ancestor of HEAD. Any other nonzero exit from either check (including 128 and others), any nonzero exit from the later diff, Git launch failure, timeout, or invalid UTF-8 exits 2 as a Git failure. For a verified ancestor, `-Stale` uses `git diff --name-status -z --find-renames --ignore-submodules=none <sha>..HEAD -- :(glob)<cover>...` for each section, without expanding covers against current files; any changed, deleted, or renamed covered path marks that section stale and prints it. A missing verified value is the sole tolerated header-grammar defect in `-Stale`; other malformed headers exit 2. `-Touches` matches only contracts and seams; `-Owner` matches only covers. Both lookup modes apply Git `:(glob)` pathspec semantics to canonical repo-relative paths: a cover, contract, or seam without wildcards matches that exact path or any path under `<p>/` as a directory prefix; `*` matches within one segment; a leading `**/` matches zero or more leading directories; a trailing `/**` matches everything inside; and `/**/` matches zero or more directories. Print matching section names. Exit 0 for a fresh `-Stale` result or valid lookup, 1 for one or more stale sections, 2 for usage/parse/Git transport failure, and 3 for no sections. `-Json` serializes the same results as ASCII-escaped JSON; human machine-readable output is ASCII-escaped too. Launch Git through `System.Diagnostics.ProcessStartInfo` following `codex-scope-check.ps1` `Invoke-Git`: resolve PATH executable/shim, quote Windows arguments, redirect and close stdin, drain stdout and stderr concurrently, read `-z` stdout bytes as strict UTF-8, set `GIT_OPTIONAL_LOCKS=0` and `GIT_NO_LAZY_FETCH=1` in `ProcessStartInfo.EnvironmentVariables`; remove `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_COMMON_DIR`, `GIT_NAMESPACE`, `GIT_LITERAL_PATHSPECS`, `GIT_GLOB_PATHSPECS`, `GIT_NOGLOB_PATHSPECS`, and `GIT_ICASE_PATHSPECS` select the repository through `-C <Repo>` alone; pass `-c protocol.allow=never` on every Git command line; and give every Git child a 120-second timeout, killing it and exiting 2 on timeout. Read map files as strict UTF-8. Keep script and test source ASCII-only. In the test, cover single and split maps, the root-map precedence, fresh/changed/deleted/renamed covers, unknown SHA stale, valid non-ancestor SHA stale, missing SHA, a broken Git configuration with exit 2, a forced Git failure with exit 2, a parent `GIT_INDEX_FILE` and `GIT_DIR` pointing to another repo while results still reflect `-Repo`, glob lookup, `-Owner` and `-Stale` agreement for a literal directory cover, a `dir/**` cover, and an `a/**/b` cover, contracts/seams exclusion from `-Owner`, covers exclusion from `-Touches`, malformed headers, a path with spaces, stub exit 3, Unicode Git path output, JSON escaping, and a bounded Git failure. - files: `skills/apex-plan/scripts/apex-map-check.ps1`, `skills/apex-plan/scripts/apex-map-check-test.ps1` - done when the CLI returns the specified names and exit codes in hermetic fixtures.
- [x] **Task 2** - Create `skills/apex-plan/scripts/apex-size-guard.ps1` with `-Repo <abs> -Paths <p...> [-MaxFiles 1] [-MaxLines 10] [-Json]`; create `skills/apex-plan/scripts/apex-size-guard-test.ps1` with temporary Git repositories. Require a HEAD commit; a repo without HEAD exits 2. Read the proposed commit with `git diff --cached --numstat -z --find-renames --ignore-submodules=none HEAD` over the whole index, parsing rename records and strict UTF-8 NUL paths; zero staged changes exits 2 with `no staged changes`. Count each staged changed file once and sum added plus deleted lines. Treat a binary numstat row (`-<TAB>-`) as OVER (exit 1), count that file, and report its line count as `binary` for that path. A row with bad counts, bad record framing, or an invalid UTF-8 path is a parse error (exit 2). Every staged path, including both sides of a rename, must occur in the predicted repo-relative `-Paths` list or the result is OVER; list paths outside the prediction. Return `WITHIN` and exit 0 only when file count, line count, and path prediction all fit; otherwise return `OVER` and exit 1 with real counts and excess paths. Use `git status --porcelain -z --untracked-files=all` to report counts of unstaged and untracked residue as warnings only; residue does not change the measured staged result. Validate arguments and fail closed on Git/UTF-8/parse errors with exit 2. `-Json` emits the same verdict, counts, paths, and warning counts as ASCII-escaped JSON; human machine-readable output is ASCII-escaped too. Use the same `ProcessStartInfo` Git transport as Task 1, including closed redirected stdin, concurrent stream drains, strict UTF-8, `GIT_OPTIONAL_LOCKS=0` and `GIT_NO_LAZY_FETCH=1` in `ProcessStartInfo.EnvironmentVariables`, removal of `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_COMMON_DIR`, `GIT_NAMESPACE`, `GIT_LITERAL_PATHSPECS`, `GIT_GLOB_PATHSPECS`, `GIT_NOGLOB_PATHSPECS`, and `GIT_ICASE_PATHSPECS` select the repository through `-C <Repo>` alone, `-c protocol.allow=never` on every Git command line, and a 120-second timeout for every Git child, killing it and exiting 2 on timeout. Keep both source files ASCII-only. Test staged text and new files, under/over limits, rename with both prediction paths, staged path outside the prediction, binary numstat as OVER with a counted file and `binary` line count, bad numstat counts, bad record framing, and invalid UTF-8 paths as exit 2, a staged gitlink change under `diff.ignoreSubmodules=all`, a parent `GIT_INDEX_FILE` and `GIT_DIR` pointing to another repo while results still reflect `-Repo`, unstaged and untracked residue excluded from the measurement but counted in warnings, Unicode paths, JSON escaping, zero staged changes, a repo without HEAD, and a bounded Git failure. - files: `skills/apex-plan/scripts/apex-size-guard.ps1`, `skills/apex-plan/scripts/apex-size-guard-test.ps1` - done when the staged commit alone determines the guard verdict and the suite passes.
- [x] **Task 3** - Create `skills/apex-plan/references/system-map.md` with the exact header grammar from Task 1, marker, component role, contracts, seams, dependents, `file:line` pointers, cover globs, verified SHA, and split-map index format. The reference must contain the exact strings `<!-- apex:map-section covers: <p> [<p>...] contracts: [<p>...] seams: [<p>...] verified: <40-hex> -->`, `git still wins`, `host-written first map`, `split index`, and `docs/system-map/index.md`. Document the host freshness command and re-survey of only stale sections; a missing/unknown SHA is stale, a marker-only stub is no map, and Git/live code wins over map claims. Number the four-part Trivial test: 1. one predicted file and at most 10 changed lines; 2. `-Touches` finds no contract or seam; 3. no behavior change, with skills/config/code counted as behavior; 4. no High-tier path. Trivial still uses a one-task Light spec on the normal wrapper path, is exempt only from the map read, and runs Task 2's staged size guard at HOST close-out; an OVER result triggers a map read and normal review before commit. For a repo without a map, skip the map read and criterion 2 (the `-Touches` contract/seam check). Document the split at about 400 lines into `docs/system-map/<component>.md` plus `docs/system-map/index.md`, and the Opus host's first-map sweep/verification recipe for the target code repo, including `git add -f` for the ignored `~/.claude` map. Modify `skills/apex-init/SKILL.md` to version `1.8.0`; it must contain `<!-- apex:system-map -->`, still contain `<!-- apex:overview:stub -->`, and declare `version: 1.8.0`. Seed `docs/system-map.md` with `<!-- apex:system-map -->` and no component sections, and add one `AGENTS.md` pointer line to the map after the `## Verify commands` fence. If that section still holds the `<!-- apex:agents:verify -->` marker stub, put the pointer after the stub block, never inside it; when a fence exists, put it after the closing fence. Keep the existing System Overview stub and its marker unchanged. - files: `skills/apex-plan/references/system-map.md`, `skills/apex-init/SKILL.md` - done when new-project scaffolding instructions include the map stub and pointer while the overview stub remains intact.
- [x] **Task 4 (HOST)** - In `C:/Users/User/.claude/AGENTS.md`, insert `powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-map-check-test.ps1` and `powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-size-guard-test.ps1` inside the existing `## Verify commands` fence immediately before the `engine-test.ps1` line. - files: `C:/Users/User/.claude/AGENTS.md` - done when the fence retains its existing commands and has both new commands in that position.
- [x] **Task 5 (HOST)** - Prepend one `system-map-core` data row to `C:/Users/User/apex/SKILL-HISTORY.md` naming the four apex-plan scripts, the new apex-plan reference, and `skills/apex-init/SKILL.md`; record the apex-plan cell as `2.8.1 (SKILL.md unchanged; scripts + reference added)` and apex-init as `1.8.0`. The apex-plan skill body is already at version `2.8.1` and is not modified by this spec. - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when the newest data row records both skill areas and versions.
- [x] **Task 6 (HOST)** - Add one `system-map-core` bullet under `### Added` in `## [Unreleased]` of `C:/Users/User/apex/CHANGELOG.md`, naming the map checker, staged size guard, format reference, and init stub. - files: `C:/Users/User/apex/CHANGELOG.md` - done when exactly one such bullet appears in that subsection.

## Wave plan
Wave 1: [1, 2, 3] | HOST: [4, 5, 6].

## Permissions
Coder tasks own only their file-disjoint manifest paths. HOST owns the three files outside the manifest. Tests may write temporary fixture repositories; production scripts are read-only. No network operation or live-repository Git write operation.

### File Operations
| Action | Paths |
|--------|-------|
| Create (coder Task 1) | skills/apex-plan/scripts/apex-map-check.ps1, skills/apex-plan/scripts/apex-map-check-test.ps1 |
| Create (coder Task 2) | skills/apex-plan/scripts/apex-size-guard.ps1, skills/apex-plan/scripts/apex-size-guard-test.ps1 |
| Create (coder Task 3) | skills/apex-plan/references/system-map.md |
| Modify (coder Task 3) | skills/apex-init/SKILL.md |
| Modify (HOST Task 4) | C:/Users/User/.claude/AGENTS.md |
| Modify (HOST Task 5) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST Task 6) | C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-map-check-test.ps1` | Task 1 acceptance suite. |
| `powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-size-guard-test.ps1` | Task 2 acceptance suite. |
| Build repository `AGENTS.md` Verify commands fence | HOST runs all 21 commands. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Fixture setup and assertions | Temporary test repositories only. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `PATH` | Resolve Git executable or test shim. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network operation. |

## Specialist Context
### Security
Both tools are read-only in their target repositories and fail closed on malformed Git output, invalid UTF-8, and Git launch/exit errors. Redirected Git stdin is closed immediately.

### Performance
Git subprocesses and fixture tests have finite timeouts. The map checker compares each stored SHA to HEAD without expanding covers into a file inventory.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Reference | skills/apex-plan/references/system-map.md | Task 3 creates the schema and host protocol. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends one row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds one Unreleased Added bullet. |

## Acceptance Criteria
- [x] Task 1 - map parsing, staleness, ownership and seam lookup pass -> verify: the hermetic test covers the specified modes, Git change classes, unknown and non-ancestor SHAs as stale, broken Git configuration exit 2, matching lookup and staleness path semantics, parent `GIT_INDEX_FILE` and `GIT_DIR` isolation, no-sections exit, strict decoding, ASCII output, and forced Git failure exit 2.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-map-check-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'apex-map-check-test failed' }
```
- [x] Task 2 - staged size measurement and prediction check pass -> verify: the hermetic test covers staged additions, renames, a binary row as OVER with the file counted and its line count reported as `binary`, bad counts, bad record framing, and invalid UTF-8 paths as exit 2, a staged gitlink under `diff.ignoreSubmodules=all`, parent `GIT_INDEX_FILE` and `GIT_DIR` isolation, residue warnings, limits, path overrun, zero staged changes, a repo without HEAD, and ASCII output.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-size-guard-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'apex-size-guard-test failed' }
```
- [x] Task 3 - map format and init seeding are present -> verify: the exact strings below occur in the reference and init skill, the reference numbers all four Trivial criteria and skips criterion 2 for a repo without a map, the init map pointer follows the verify stub block or closing fence, its version line is `version: 1.8.0`, and it stays at or below 500 lines.
```powershell apex-accept
$reference = 'skills/apex-plan/references/system-map.md'
$init = 'skills/apex-init/SKILL.md'
$referenceStrings = @('<!-- apex:map-section covers: <p> [<p>...] contracts: [<p>...] seams: [<p>...] verified: <40-hex> -->', 'git still wins', 'host-written first map', 'split index', 'docs/system-map/index.md')
$initStrings = @('<!-- apex:system-map -->', '<!-- apex:overview:stub -->')
foreach ($literal in $referenceStrings) {
  if (-not (Select-String -LiteralPath $reference -SimpleMatch -Pattern $literal -Quiet)) { throw "Missing reference string: $literal" }
}
foreach ($literal in $initStrings) {
  if (-not (Select-String -LiteralPath $init -SimpleMatch -Pattern $literal -Quiet)) { throw "Missing init string: $literal" }
}
if (-not (Select-String -LiteralPath $init -SimpleMatch -Pattern 'version: 1.8.0' -Quiet)) { throw 'Missing init version' }
if (-not (Select-String -LiteralPath $init -Pattern '^version: 1\.8\.0$' -Quiet)) { throw 'Incorrect init version line' }
if ((Get-Content -LiteralPath $init).Count -gt 500) { throw 'apex-init/SKILL.md exceeds 500 lines' }
```
- [x] Task 4 - HOST updates the build recipe -> verify: `C:/Users/User/.claude/AGENTS.md` has the two new test commands immediately before `engine-test.ps1` in its `## Verify commands` fence, with all former commands retained.
- [x] Task 5 - HOST records both skill changes -> verify: the newest data row of `C:/Users/User/apex/SKILL-HISTORY.md` names `system-map-core`, all six Task 1-3 files, apex-plan `2.8.1 (SKILL.md unchanged; scripts + reference added)`, and apex-init `1.8.0`; the apex-plan skill body remains unchanged.
- [x] Task 6 - HOST records the feature -> verify: `C:/Users/User/apex/CHANGELOG.md` has exactly one `system-map-core` bullet under `## [Unreleased]` / `### Added`.
- [x] Build repository verify fence - HOST runs all 21 commands from the build repository root -> verify: the command lines below are the current `C:/Users/User/.claude/AGENTS.md` `## Verify commands` fence, with only the two Task 4 additions, and all pass.
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
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-map-check-test.ps1
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-size-guard-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```
- [x] Scope - only the nine `## Files to Change` paths are written -> verify: HOST compares `git status --porcelain=v1 -z -uall --ignored` before and after in both repositories, confirms each of the five created paths exists and the four modified paths differ from base, and names any other new or changed path.
- [x] Reachability - the two CLI entry points consume real Git records -> verify: Task 1 invokes `-Stale`, `-Touches`, and `-Owner` against fixture maps and Task 2 invokes the guard against fixture staged indexes, checking stdout and exit codes.

## Progress
_(The build writes here — do not edit manually)_
