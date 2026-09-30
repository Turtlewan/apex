---
spec: synced-runtime-exclusion
status: draft
autonomy_level: L2
risk: high
coder_effort: high
---

# Spec: Runtime-exclude the skill-sync markers in tree-pin and scope-check
<!-- Governing contract: references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->

**Identity:** Adds a per-file runtime-marker pattern list (`skills/synced/.bucket-*`,
`skills/synced/*/.last-complete-round`, `skills/synced/*/manifest.json`) to `tree-pin.ps1` and
`codex-scope-check.ps1`, with tests in both suites, and makes `tree-pin-test.ps1` green by replacing
its one non-ASCII asserted string with ASCII.

**Repo root and working directory for every path and command below:** `C:\Users\User\.claude` (the
build repo). This spec file lives in the separate `C:\users\user\apex` repo. `~/.claude` ignores
`*`, so every tracked file is committed with `git add -f` by name.

## Intent

- **Intent:** Rewrites of the three sync-marker files under `skills/synced` in `~/.claude` stop
  moving the tree-pin fingerprint and stop being attributed by the scope check. Every other file
  under `skills/synced` (synced `SKILL.md` files and scripts, which Claude Code loads) stays
  fingerprinted and scope-checked.
- **Invariants:**
  - `$runtimeExclusions` is unchanged in both scripts. The new `$runtimeMarkerPatterns` list is
    element-for-element identical in both scripts, same order.
  - The marker filter applies only under the configured `-RuntimeExclusionRoot`, and never to a path
    in the index or HEAD.
  - `tree-pin.ps1` and `tree-pin-test.ps1` contain no non-ASCII character; both suites exit 0.
- **Non-goals:** No `AGENTS.md` change (spec `wrapper-model-author` owns the verify fence). No BOM
  added to any file. No change to the `-WrittenPathsFile` directory expansion or to the
  `-EncodingScan` mode.

## Assumptions
- Live `~/.claude` at HEAD `7cbd7ff`: `skills/synced` has 0 tracked files, 217 files on disk, and
  `git status --porcelain --ignored=traditional -- skills/synced` prints exactly the collapsed entry
  `!! skills/synced/` → impact: Stop
- Live marker layout: `skills/synced/.bucket-<uuid>_<uuid>` (a file),
  `skills/synced/<uuid>_<uuid>/.last-complete-round` and `skills/synced/<uuid>_<uuid>/manifest.json`.
  `find skills/synced -name manifest.json` → 1 hit, `-name .last-complete-round` → 1 hit → impact: Stop
- A collapsed ignored directory is fingerprinted as ONE line whose digest hashes
  `relpath|length|mtime` of every file beneath it: `tree-pin.ps1` `Get-PathDigest` directory branch
  (lines 108–125), mirrored by `codex-scope-check.ps1` `Get-ContentHash` (lines 239–267). A prefix
  match on the entry cannot see the files inside; the filter must act inside those enumerations →
  impact: Stop
- `Get-PathDigest` has exactly one caller (`tree-pin.ps1:251`). `Get-ContentHash` is reached only via
  `Get-PathState` (snapshot line 534 and check lines 788, 815, 876) → impact: Caution
- In `codex-scope-check.ps1`, `$applyRuntimeExclusions` is computed at lines 711–716, AFTER the
  `-Snapshot` block (line 529) has already exited. The snapshot and the check must hash with the same
  filter, so Task 1 moves that computation above the snapshot block → impact: Stop
- `codex-dispatch.ps1` runs `-Snapshot` and `-Check` with the same (default) `-RuntimeExclusionRoot`,
  `%USERPROFILE%\.claude` → impact: Caution
- In a fixture repo where `skills/` has NO tracked file, an ignored `skills/synced/` collapses to
  `!! skills/` (verified live). The filter matches on each file's full relative path, so it still
  works; fixtures below nevertheless commit `skills/apex/SKILL.md` to mirror the live layout → impact: Low
- **Test baseline at HEAD `7cbd7ff` (2026-09-30):** `tree-pin-test.ps1` exits 1 with exactly one
  failure, `v1-format pin requests a re-pin`. Both files are UTF-8 without a BOM, so PowerShell 5.1
  decodes the em-dash in `tree-pin.ps1:329` and in the regex at `tree-pin-test.ps1:209` as ANSI
  mojibake. Fixed by Task 4. `scope-check-test.ps1` exits 0: `PASS -- all 176 scope-check assertions
  passed.` → impact: Low

Simplicity check: yes. Expanding the collapsed `skills/synced/` entry into per-file lines was
considered; it changes the fingerprint shape for the whole directory. This version filters three
patterns inside the existing directory enumeration and, where the matcher meets a status entry,
applies it to regular files only (the leaf-only rule in Task 1).

## Prerequisites
- none (spec `wrapper-model-author` depends on THIS spec, not the reverse)
- Environment: none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/tree-pin.ps1 | modify | `$runtimeMarkerPatterns`, `Test-IsRuntimeMarker`, marker filter in `Get-PathDigest` + fingerprint loop; line 329 em-dash → ` -- ` |
| skills/apex-code/scripts/codex-scope-check.ps1 | modify | same list and function; filter in `Get-ContentHash`; root-gate computation moved above `-Snapshot`; marker clause (present and removed marker files) in both attribution loops |
| skills/apex-code/scripts/tree-pin-test.ps1 | modify | 14 marker cases + global-excludes isolation for the block; line 209 em-dash → ` -- ` |
| skills/apex-code/scripts/scope-check-test.ps1 | modify | 17 marker cases (incl. list parity and removed-marker attribution) |

Grep evidence (`git grep -n -E` over `skills hooks AGENTS.md` in `C:\Users\User\.claude` at `7cbd7ff`):
`tree-pin\.ps1` → 36 hits / 10 files (invokers, docs, tests, spec-corpus fixtures; none depend on
the lists or digest internals) · `codex-scope-check\.ps1` → 43 hits / 19 files (same) ·
`tree-pin-test\.ps1` → 6 hits, `scope-check-test\.ps1` → 2 hits (spec-corpus fixtures only; neither
suite is in the `AGENTS.md` verify fence) · `runtimeExclusions` → 6 hits, only the two scripts ·
`'shell-snapshots'|'\.last-update-result\.json'` → 4 hits, only the two lists ·
`runtimeMarkerPatterns|Test-IsRuntimeMarker` → 0 hits · `skills/synced` → 0 hits ·
`Get-PathDigest` → 4 hits (`tree-pin.ps1` definition + 1 call; 2 in a frozen spec-corpus fixture) ·
`Get-ContentHash` → 3 hits (`codex-scope-check.ps1` definition + `Get-PathState`; 1 comment in
`tree-pin.ps1`) · `Get-PathState` → 5 hits, all in `codex-scope-check.ps1` ·
`applyRuntimeExclusions` → 4 hits, all in `codex-scope-check.ps1` · `Get-PsArrayLiteral` → 4 hits, all
in `scope-check-test.ps1` · `nowDirty` → 12 hits, all in `codex-scope-check.ps1` (raw status
paths as keys; `Normalize` at line 151 trims the trailing `/`) · a byte scan for bytes above 0x7F
over `tree-pin.ps1` and `tree-pin-test.ps1` → one em-dash each (lines 329 and 209, the same string)
· `predates digest scheme` → 3 hits (those two plus
`fixtures/spec-corpus/docs/changes/round8-d1-treepin-digest.md:48`, a frozen validator-corpus
fixture that nothing executes; unchanged) · `snap\.dirty` → 1 hit (`codex-scope-check.ps1:595`, the
raw status paths read into `$preDirty`) · `\$EncodingScan\b` in `codex-scope-check.ps1` → 3 hits
(param 71, mode check 89, block start 337; the block closes at 526, and `# --- SNAPSHOT` is 528) ·
`GIT_CONFIG_GLOBAL` → 4 hits in `scope-check-test.ps1`, 0 in `tree-pin-test.ps1` ·
`Get-ChildItem skills/apex-code/scripts` confirms all 4 listed files exist.

## Tasks
- [ ] **Task 1**: Marker filter in both production scripts. Change nothing else in either file
  (Task 4's line-329 edit is its own).
  **Placement.** PowerShell does not hoist script functions, and `codex-scope-check.ps1:82` sets
  `$ErrorActionPreference = 'Stop'`, so everything a hash function calls must be defined above the
  first call site. In `codex-scope-check.ps1` the `$runtimeExclusions` array (663–673) sits AFTER the
  `-Snapshot` block (529–580, which ends `exit 0`), so it is NOT the anchor. Live order at `7cbd7ff`:
  `function Get-ContentHash` (236) and `Get-PathState` (290) are only DEFINED early; the
  `if ($EncodingScan) {` block runs 337–526 and every path out of it exits (lines 507, 512, 525);
  line 527 is blank; line 528 is `# ---...--- SNAPSHOT`; the first `Get-ContentHash` CALL is
  `Get-PathState` at 534, inside `if ($Snapshot) {` (529). The anchor is therefore the blank line
  527: after the closing `}` of the `if ($EncodingScan)` block and directly before the
  `# ---------------------------------------------------------------------------------- SNAPSHOT`
  comment line. Insert there, in this order: the moved gate block (step 4), then
  `$runtimeMarkerPatterns`, then `Test-IsRuntimeMarker`. `-EncodingScan` has exited before that
  point, so it never evaluates any of it and its behaviour is unchanged; `-Snapshot` and `-Check`
  both pass through it before their first hash. In `tree-pin.ps1` the anchor is directly
  before `function Get-PathDigest` (currently line 105). Every call there happens at line 281 or
  later, so there is no ordering hazard. Each list gets the one-line comment
  `# Lockstep: identical in tree-pin.ps1 and codex-scope-check.ps1.`:
  ```
  $runtimeMarkerPatterns = @(
      '^skills/synced/\.bucket-[^/]+$',
      '^skills/synced/[^/]+/\.last-complete-round$',
      '^skills/synced/[^/]+/manifest\.json$'
  )
  ```
  **Matcher**, in each script: `Test-IsRuntimeMarker([string]$NormalizedPath)` returns `$true` when
  `[regex]::IsMatch($NormalizedPath, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)`
  holds for any pattern. Place it directly after the list in each file (anchors above).
  **Leaf-only rule.** A status entry (a path taken from `git status`, not a file found inside a
  directory enumeration) counts as a runtime marker ONLY when all three hold: its RAW status path
  (before normalization strips the trailing slash) does not end in `/`;
  `Test-Path -LiteralPath <abs> -PathType Leaf` is `$true` for it; and `Test-IsRuntimeMarker`
  matches its normalized path. A marker-shaped DIRECTORY (for example `skills/synced/.bucket-u1/`
  or `skills/synced/u1/manifest.json/`) is therefore hashed and attributed like any other content.
  Inside the directory enumerations (steps 1 and 5) every item is a file (`Get-ChildItem -File`),
  so there `Test-IsRuntimeMarker` on `$rel` alone stays the per-file check.
  **tree-pin.ps1:**
  1. `Get-PathDigest` gains a third parameter `[bool]$SkipRuntimeMarkers = $false`. In the directory
     branch, when it is `$true`, a file whose `$rel` satisfies `Test-IsRuntimeMarker` is counted as
     skipped and not added to `$parts`. If `$parts.Count -eq 0` and at least one file was skipped,
     return `$null` (in place of `'dir:empty'`).
  2. In `Get-TreeFingerprint`, inside the existing `if ($ApplyRuntimeExclusions -and $xy -eq '!!')`
     block, after the prefix loop: if `-not $path.EndsWith('/')` AND
     `Test-Path -LiteralPath (Join-Path $Root $path) -PathType Leaf` AND
     `Test-IsRuntimeMarker $normalizedPath` → `continue` (the leaf-only rule; `$path` is the raw
     status path, `$normalizedPath` the trimmed one).
  3. At the line that appends to `$lines` (currently 251): compute
     `$work = Get-PathDigest $Root $path ($ApplyRuntimeExclusions -and $xy -eq '!!')`; if `$work` is
     `$null` → `continue`; otherwise append `"$xy $path work:$work index:$(Get-IndexDigest $Root $path)"`.
  **codex-scope-check.ps1:**
  4. Move the `$resolvedRuntimeExclusionRoot` / `$applyRuntimeExclusions` block (currently lines
     711–716) unchanged to the placement anchor (blank line 527, after the `-EncodingScan` block and
     before the `# --- SNAPSHOT` comment), so both `-Snapshot` and `-Check` see it and
     `-EncodingScan` does not. The
     inventory-failure reset (`$applyRuntimeExclusions = $false`, currently lines 741–745) stays
     where it is. When it fires during `-Check`, it turns the marker filter off after the snapshot
     was hashed with it. The resulting state mismatch reports `skills/synced` as a violation, and
     that is the intended fail-closed outcome.
  5. `Get-ContentHash`, directory branch: when `$applyRuntimeExclusions` is `$true`, a file whose
     `$rel` satisfies `Test-IsRuntimeMarker` is counted as skipped and not added to `$parts`. If
     `$parts.Count -eq 0` and at least one file was skipped, return `'dir:runtime-markers-only'`.
  6. In BOTH attribution loops (collecting and non-collecting; they must stay line-for-line
     identical), extend the runtime clause to
     `if ($applyRuntimeExclusions -and -not (Test-IsHostCurated $n) -and ((Test-IsRuntimePath $n) -or (Test-IsRuntimeMarkerFile $n) -or (Test-IsMarkerOnlyTransition $n)))`,
     keeping `$runtimeExcludedCount++; continue`. `Test-IsRuntimeMarkerFile([string]$n)` applies the
     leaf-only rule to a status entry. It returns `$false` unless `Test-IsRuntimeMarker $n` holds;
     then it returns `$true` in exactly two cases:
     (a) **present marker file**: `Test-Path -LiteralPath (Join-Path $repo $n) -PathType Leaf` is
     `$true`, and no key `$k` of `$nowDirty` with `(Normalize $k) -eq $n` ends in `/` (after
     replacing `\` with `/`);
     (b) **removed marker file** (matches tree-pin, where a skipped leaf line that disappears leaves
     the fingerprint unchanged): `Test-Path -LiteralPath (Join-Path $repo $n)` is `$false` (neither
     leaf nor directory now), AND the snapshot recorded `$n` as a FILE: some entry `$d` of
     `@($snap.dirty)` (the raw status paths, trailing `/` kept) with `(Normalize $d) -eq $n` does
     not end in `/` (after replacing `\` with `/`), and `$preState[$n]` exists and matches
     `'^work:[0-9a-f]+ index:'` (a blob hash, not `work:dir:` and not `work:-`).
     Otherwise it returns `$false`. So a marker FILE present at snapshot and absent now is excluded;
     a marker-shaped path that was a directory at snapshot is not. Nothing else calls
     `Test-IsRuntimeMarker` on a status entry. Define `Test-IsRuntimeMarkerFile` and
     `Test-IsMarkerOnlyTransition` directly after `Test-IsRuntimePath` (by the attribution loops;
     they run only in `-Check`, after `$snap`, `$preState` and `$nowDirty` are set).
     `Test-IsMarkerOnlyTransition([string]$n)` returns `$false` unless `$n` equals `skills` or `skills/synced` (case-insensitive) or starts
     with `skills/synced/`. For those paths it is `$true` only when the current state is absent or markers-only (`Get-ContentHash $n` returns `'-'` or
     `'dir:runtime-markers-only'`) AND the snapshot state is absent or markers-only (`$preState`
     has no entry for `$n`, or its value starts with `'work:dir:runtime-markers-only '` or
     `'work:- '`).
  — files: skills/apex-code/scripts/tree-pin.ps1, skills/apex-code/scripts/codex-scope-check.ps1 —
  done when: both scripts hold the identical 3-element `$runtimeMarkerPatterns`, `$runtimeExclusions`
  is byte-identical to HEAD in both, and the Task 2/3 cases pass.
- [ ] **Task 2**: tree-pin tests. Add a block after the `off-runtime-root` case in
  `tree-pin-test.ps1`, in the existing `New-TestFixture` / `Get-FixtureArgs` / `Invoke-TreePin
  (@('-Pin') ...)` → mutate → `Invoke-TreePin (@('-Verify') ...)` / `Assert-Equal` style, each case
  on its own fixture named `synced-<case>`. Definitions: **ignored fixture** =
  `New-TestFixture <name> '.gitignore' "/skills/synced/`n/skills/synced-foo/`n"`, then write and
  commit `skills/apex/SKILL.md` (the `nested-projects` commit pattern). **Markers** =
  `skills/synced/.bucket-u1`, `skills/synced/u1/.last-complete-round`,
  `skills/synced/u1/manifest.json`. **Seeded** = markers plus `skills/synced/u1/docs/SKILL.md`,
  written before the pin. Runtime root = fixture root unless stated. **Global-excludes isolation**
  (as `scope-check-test.ps1:172-183` does): at the start of the block, save `$env:GIT_CONFIG_GLOBAL`,
  write an empty ignore file and a gitconfig holding `[core]` / `excludesFile = <that file, with
  forward slashes>` under `$testRoot` (UTF-8 no BOM), and set `$env:GIT_CONFIG_GLOBAL` to that
  gitconfig; the suite's existing outer `finally` restores the saved value (or removes the variable
  when it was `$null`). Cases:
  1. Ignored, seeded; rewrite all three markers with longer content → exit **0**.
  2. Ignored, NO `skills/synced` at pin; create only the markers → exit **0**.
  3. Ignored, seeded; create `skills/synced/SKILL.md` → exit **69**.
  4. Ignored, seeded; create `skills/synced/u1/x/SKILL.md` → exit **69**.
  5. Ignored, seeded; create `skills/synced/u1/x/scripts/a.py` → exit **69**.
  6. Ignored, seeded; create `skills/synced/u1/docs/manifest.json` (too deep for the pattern) → **69**.
  7. Ignored, seeded; delete `skills/synced/u1/docs` → exit **69**.
  8. Ignored; create `skills/synced-foo/.bucket-u1` and `skills/synced-foo/u1/manifest.json` → **69**.
  9. Ignored, seeded, runtime root = a separate new directory; rewrite the markers → exit **69**.
  10. Ignored, seeded, plus `skills/synced/u1/manifest.json` added with `git add -f` and committed;
      rewrite it → exit **69**.
  11. Ignored, seeded, plus `skills/synced/u1/docs/SKILL.md` added with `git add -f` and committed
      (so markers list as individual `!!` leaves); rewrite the three markers → exit **0**.
  12. Fixture-only (`??` status class; the live tree has no `??` here): fixture with NO ignore rule
      plus committed `skills/apex/SKILL.md`; create the markers; FIRST `Assert-True` that
      `git -C <root> status --porcelain --ignored=traditional -- skills/synced` prints at least one
      line and every line starts with `?? ` (the status-class precondition); then `-Verify` → exit
      **69**.
  13. Ignored, plus `skills/synced/u1/docs/SKILL.md` added with `git add -f` and committed (so a new
      directory lists as its own `!!` entry), no markers; pin; create the DIRECTORY
      `skills/synced/.bucket-u1/` holding `SKILL.md` → exit **69**.
  14. Same base as case 13; pin; create the DIRECTORY `skills/synced/u1/manifest.json/` holding
      `run.ps1` → exit **69**.
  — files: skills/apex-code/scripts/tree-pin-test.ps1 — done when: the 14 cases exist with the exit
  codes above as `Assert-Equal` expectations.
- [ ] **Task 3**: scope-check tests. Add a block directly after "Runtime exclusion (13)" in
  `scope-check-test.ps1`, headed `# Runtime marker (N): ...`, in the existing `New-TestRepo` /
  `Invoke-ScopeCheck -Snapshot` → mutate → `Invoke-ScopeCheck -Check ... -WrittenPathsFile` /
  `Assert-True` + `Assert-WrittenPaths` style. Definitions: **ignored repo** =
  `New-TestRepo -Name <name> -Files @('src/a.py', 'skills/apex/SKILL.md')`, then write `.gitignore`
  = `"/skills/synced/`n/skills/synced-foo/`n"` (UTF-8 no BOM) and commit it with
  `Invoke-TestGit add`/`commit`. **Markers** / **seeded** as in Task 2. **At runtime root** = pass the
  same `-RuntimeExclusionRoot <repo>` to BOTH `-Snapshot` and `-Check`. Leaf writes use
  `[System.IO.File]::WriteAllText(..., [System.Text.Encoding]::ASCII)`. Cases (at runtime root
  unless stated):
  1. Ignored, seeded; first assert `git status --porcelain --ignored=traditional` lists
     `!! skills/synced/` and that `-Snapshot` at runtime root exits **0** (the snapshot-ordering
     guard); rewrite the markers with longer content → exit **0**, written paths `@()`.
  2. Ignored, no `skills/synced` at snapshot; create only the markers → exit **0**, written paths
     `@()`, output matches `runtime path\(s\) excluded`.
  3. Ignored, markers only at snapshot; delete `skills/synced` → exit **0**, written paths `@()`,
     output does NOT match `(?m)^\s*GONE\s+skills/synced(?:/|$)`.
  4. Ignored, seeded; create `skills/synced/SKILL.md` → exit **non-zero**, written-paths file
     contains `skills/synced/SKILL.md`.
  5. Ignored, seeded; create `skills/synced/u1/x/SKILL.md` → **non-zero**, file contains it.
  6. Ignored, seeded; create `skills/synced/u1/x/scripts/a.py` → **non-zero**, file contains it.
  7. Ignored, seeded; delete `skills/synced/u1/docs` → exit **non-zero**, written-paths file
     contains `skills/synced`.
  8. Ignored; create `skills/synced-foo/u1/manifest.json` → **non-zero**, file contains it.
  9. Ignored, seeded; NO `-RuntimeExclusionRoot` on either call; rewrite the markers → **non-zero**.
  10. `-Files @('src/a.py', 'skills/apex/SKILL.md', 'skills/synced/u1/manifest.json')`; `Add-Content`
      to that manifest → exit **non-zero**, written paths `@('skills/synced/u1/manifest.json')`.
  11. `-Files @('src/a.py', 'skills/synced/u1/docs/SKILL.md')`, no ignore rule; create the markers
      (untracked `??` leaves) → exit **0**, written paths `@()`.
  12. Same as case 1 but WITHOUT `-WrittenPathsFile` → exit **0**, output matches
      `(?m)^\[scope\].* clean -`.
  13. Parity: using the existing `Get-PsArrayLiteral` on `$checkerPath` and on
      `(Join-Path $PSScriptRoot 'tree-pin.ps1')`, for each of `runtimeExclusions` and
      `runtimeMarkerPatterns`: assert both parsed lists are non-empty, have equal counts, and are
      equal in order; assert `runtimeMarkerPatterns` has exactly 3 entries.
  14. Ignored repo but `-Files @('src/a.py', 'skills/apex/SKILL.md', 'skills/synced/u1/docs/SKILL.md')`
      (so a new directory lists as its own `!!` entry), no markers; snapshot; create the DIRECTORY
      `skills/synced/.bucket-u1/` holding `SKILL.md` → exit **non-zero**, the written-paths file
      contains a line starting with `skills/synced/.bucket-u1`.
  15. Same base as case 14; snapshot; create the DIRECTORY `skills/synced/u1/manifest.json/` holding
      `run.ps1` → exit **non-zero**, the written-paths file contains a line starting with
      `skills/synced/u1/manifest.json`.
  16. Removed marker, individual entries: ignored repo but
      `-Files @('src/a.py', 'skills/apex/SKILL.md', 'skills/synced/u1/docs/SKILL.md')` (the tracked
      sibling forces individual `!!` leaves), plus the markers and an untracked
      `skills/synced/u1/notes.md` written before the snapshot; first assert
      `git status --porcelain --ignored=traditional` lists `!! skills/synced/u1/manifest.json` as its
      own line; snapshot; delete the file `skills/synced/u1/manifest.json` → exit **0**, written
      paths `@()`, output does NOT match `(?m)^\s*GONE\s+skills/synced/u1/manifest\.json`.
  17. Same base as case 16; snapshot; delete the non-marker file `skills/synced/u1/notes.md` →
      exit **non-zero**, output matches `(?m)^\s*GONE\s+skills/synced/u1/notes\.md`, and the
      written-paths file contains `skills/synced/u1/notes.md`.
  — files: skills/apex-code/scripts/scope-check-test.ps1 — done when: the 17 cases exist with the
  expectations above.
- [ ] **Task 4**: ASCII re-pin message. In `tree-pin.ps1:329` change
  `Write-Host 'pin predates digest scheme v2 — re-pin'` to
  `Write-Host 'pin predates digest scheme v2 -- re-pin'`. In `tree-pin-test.ps1:209` change the regex
  `'^pin predates digest scheme v2 — re-pin$'` to `'^pin predates digest scheme v2 -- re-pin$'`.
  Change nothing else on either line; no other non-ASCII character exists in either file. — files:
  skills/apex-code/scripts/tree-pin.ps1, skills/apex-code/scripts/tree-pin-test.ps1 — done when:
  `tree-pin-test.ps1` passes `v1-format pin requests a re-pin` and neither file contains a byte
  above 0x7F.

## Wave plan
Wave 1: [task 4] | Wave 2: [task 1] | Wave 3: [task 2, task 3]

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (`status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, `status.md`, and spec archival — under D6.)
docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | regression-guard copies under `$env:TEMP`; one temp git repo under `$env:TEMP` holding a copy of the live synced directory plus the `apex-probe.md` probe (host, digest-stability check) |
| Modify | skills/apex-code/scripts/tree-pin.ps1, skills/apex-code/scripts/codex-scope-check.ps1, skills/apex-code/scripts/tree-pin-test.ps1, skills/apex-code/scripts/scope-check-test.ps1; the copied marker files inside the temp repo only. No file in the live `C:\Users\User\.claude\skills\synced` directory is modified. |
| Delete | the temp repo and `$env:TEMP` copies, after their checks |

### Commands
All run with working directory `C:\Users\User\.claude`.

| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1` | tree-pin suite (own temp fixtures) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1` | scope-check suite (same) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin.ps1 -Digest -Worktree <temp repo> -RuntimeExclusionRoot <temp repo>` | digest-stability check on the temp copy |
| `git init`, `git add`, `git commit`, `git status --porcelain --ignored=traditional` in the temp repo | build and inspect the temp copy's fixture |
| `([IO.File]::ReadAllBytes((Resolve-Path <file>)) \| Where-Object { $_ -gt 127 }).Count`, `Select-String`, `git diff -- <file>` | Task 4 / Task 1 checks |
| `[IO.File]::ReadAllBytes((Resolve-Path <file>))[0..2]` | no-BOM check on the 4 changed files |
| `Copy-Item` (production script → `$env:TEMP` backup and back), `Get-FileHash`, `Set-Content`/`[IO.File]::WriteAllText` on the working script, `Remove-Item` (backup) | Task 2/3 regression guards |
| `Copy-Item -Recurse` (live synced directory → temp repo), `Add-Content` (copied markers only), `Remove-Item -Recurse` (temp repo) | digest-stability check on the temp copy |
| the `AGENTS.md` § Verify commands fence, unchanged | repo verify contract |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add -f` | the 4 files in ## Files to Change, by name (host, at integration, in `C:\Users\User\.claude`) |
| `git commit` | "fix(apex-code): runtime-exclude skill-sync markers in tree-pin and scope-check; ASCII re-pin message" (host, after approval) |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `USERPROFILE` | default `-RuntimeExclusionRoot` (read only) |

### Network
| Action | Purpose |
|--------|---------|
| (none) | |

## Specialist Context
### Security
The marker filter is gated three ways in fixtures: configured root only (tree-pin case 9,
scope-check case 9), status class `!!` only in tree-pin (case 12, fixture-only), and no index/HEAD
presence (tree-pin case 10; scope-check case 10, which is the ref-presence gate). On the live
`~/.claude` tree only two gates are effective: `*` is ignored there, so a new file is always `!!`,
never `??`. Loadable content under `skills/synced` stays covered: tree-pin cases 3–7, scope-check
cases 4–7. Pattern anchoring (depth and the `synced-foo` near miss): tree-pin cases 6 and 8,
scope-check case 8. Marker-shaped DIRECTORIES stay covered (leaf-only rule): tree-pin cases
13–14, scope-check cases 14–15. A removed marker FILE is excluded but a removed non-marker file
under `skills/synced` is still reported GONE: scope-check cases 16–17.

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | the two scripts | the one-line lockstep comment above `$runtimeMarkerPatterns` (Task 1) |

## Acceptance Criteria
All commands run with working directory `C:\Users\User\.claude`.
All verify commands are PowerShell-native (Windows PowerShell 5.1); no `grep`, `head` or `od`.
- [ ] Task 4 → verify: for `$p` in `skills/apex-code/scripts/tree-pin.ps1` and
      `skills/apex-code/scripts/tree-pin-test.ps1`,
      `@([IO.File]::ReadAllBytes((Resolve-Path $p)) | Where-Object { $_ -gt 127 }).Count` prints `0`, and
      `@(Select-String -Path skills/apex-code/scripts/tree-pin.ps1 -SimpleMatch -Pattern "pin predates digest scheme v2 -- re-pin").Count`
      prints `1`.
- [ ] No BOM added → verify: for each `$p` of `skills/apex-code/scripts/tree-pin.ps1`,
      `skills/apex-code/scripts/codex-scope-check.ps1`, `skills/apex-code/scripts/tree-pin-test.ps1`
      and `skills/apex-code/scripts/scope-check-test.ps1`,
      `$b = [IO.File]::ReadAllBytes((Resolve-Path $p))[0..2]; -not ($b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF)`
      prints `True`.
- [ ] Task 1 → verify: `git diff -- skills/apex-code/scripts/tree-pin.ps1 skills/apex-code/scripts/codex-scope-check.ps1`
      shows no `-` or `+` line inside either `$runtimeExclusions = @(` block, and each file contains
      the 3 `$runtimeMarkerPatterns` strings exactly as written in Task 1.
- [ ] Task 2 + Task 4 → verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1`
      exits 0, printing `PASS: v1-format pin requests a re-pin` and a `PASS` line for each of the 14
      `synced-` cases, with no `FAIL` line.
- [ ] Task 2 regression guard → verify (host, after Tasks 1–4; each suite tests the script BESIDE
      itself, `$scriptPath = Join-Path $PSScriptRoot 'tree-pin.ps1'`, so the WORKING script is the one
      mutated, never a TEMP copy): (a) with `$t` set to the working `tree-pin.ps1` path, record
      `$h = (Get-FileHash -LiteralPath $t).Hash` and back the post-task production script up with
      `Copy-Item -LiteralPath $t "$env:TEMP\tree-pin.ps1.guard-bak"`. (b) In the
      WORKING `skills/apex-code/scripts/tree-pin.ps1`, delete the three `$runtimeMarkerPatterns`
      entries (leave `@()`), writing UTF-8 without BOM. (c) Run the tree-pin suite: it exits 1 and
      cases 1, 2 and 11 print `FAIL`. (d) Restore with
      `Copy-Item "$env:TEMP\tree-pin.ps1.guard-bak" $t -Force` and confirm
      `(Get-FileHash -LiteralPath $t).Hash -eq $h` prints `True`.
      (e) Re-run the suite: exit 0. Delete the backup. A hash mismatch at (d) fails the criterion.
- [ ] Task 3 → verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1`
      exits 0, with a `PASS` line for every assertion of the 17 new `Runtime marker` cases and no
      `FAIL` line.
- [ ] Task 3 regression guard → verify (host, after Tasks 1–4; the suite tests the script beside
      itself, `$checkerPath` at `scope-check-test.ps1:10`, so the WORKING script is the one mutated):
      (a) with `$t` set to the working `codex-scope-check.ps1` path, record
      `$h = (Get-FileHash -LiteralPath $t).Hash` and back it up with
      `Copy-Item -LiteralPath $t "$env:TEMP\codex-scope-check.ps1.guard-bak"`.
      (b) In the WORKING `skills/apex-code/scripts/codex-scope-check.ps1`, delete the three
      `$runtimeMarkerPatterns` entries (leave `@()`), writing UTF-8 without BOM. (c) Run the
      scope-check suite: it exits non-zero and cases 1, 2, 3, 11, 12, 13 and 16 print `FAIL`; case 17
      still passes. (d) Restore with
      `Copy-Item "$env:TEMP\codex-scope-check.ps1.guard-bak" $t -Force` and confirm
      `(Get-FileHash -LiteralPath $t).Hash -eq $h` prints `True`. (e) Re-run the suite: exit 0. Delete the backup. A hash mismatch at (d) fails the
      criterion.
- [ ] Repo verify contract → verify: every command in `AGENTS.md` § Verify commands exits 0.
- [ ] Scope — nothing written outside `## Files to Change` → verify: `~/.claude` ignores `*`, so a
      plain status cannot see a new file. Before the build the host saves
      `git -C C:\Users\User\.claude status --porcelain --ignored -uall` to a TEMP file; after the build
      it re-runs the command and diffs the two (`Compare-Object`), ignoring paths under the runtime
      exclusions. The only new or changed entries are the 4 paths in `## Files to Change`.
- [ ] Digest stability on a copy of the live synced tree (a direct `tree-pin.ps1 -Digest` check;
      it does NOT exercise `codex-dispatch.ps1` end to end, and it NEVER writes to the live
      `~/.claude` tree) → verify (host, after integration): (a) create a temp git repo R under
      `$env:TEMP`, shaped like the runtime root: a `.gitignore` that ignores `*` (the live layout)
      and un-ignores only itself and one tracked sibling, a `SKILL.md` in an `apex` folder beside
      `synced` under `skills`, written and committed with `git add -f`, so `git status --porcelain --ignored=traditional` in R lists
      `!! skills/synced/` collapsed as it does live. (b) Copy the live `skills/synced` directory into
      R with `Copy-Item -Recurse` (read-only on the live side). (c) Run
      `powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin.ps1 -Digest -Worktree <R> -RuntimeExclusionRoot <R>`
      and record digest D1. (d) Change the CONTENT of every copied file that one of the three
      `$runtimeMarkerPatterns` matches (the `.bucket-` file, the `.last-complete-round` file and the
      `manifest.json` file from ## Assumptions) by appending one line, and no other file. (e) Run the
      same command: its digest must EQUAL D1. (f) Create a file named `apex-probe.md` directly in
      R's `skills/synced` directory. (g) Run it again: its digest must DIFFER from D1. Delete R.
      Any other outcome fails the criterion.

## Progress
_(The build writes here — do not edit manually)_
