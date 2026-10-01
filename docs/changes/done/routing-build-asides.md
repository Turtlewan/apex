---
spec: routing-build-asides
status: draft
autonomy_level: L2
risk: low
---

# Spec: Route the spec author in build-side doctrine
<!-- Governing contract: references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->

**Identity:** Point the orchestrator route and the two build fallback asides to gpt-6-sol spec authoring under ADR-048.
<!-- ADR: docs/technical/adr/ADR-048-role-redesign.md -->

**Repo root for every relative path below:** `C:\Users\User\.claude` (build repo). This spec file lives in the separate `C:\Users\User\apex` repo. The build repo ignores `*`; at integration the host force-adds only the three named tracked files with `git add -f` by name.

## Intent

- **Intent:** The planning route names apex-plan's wrapper-backed gpt-6-sol spec author, and build fallback prose assigns Opus only the build-orchestrator and high-risk-reviewer roles.
- **Invariants:** The Sonnet 5 coding fallback, its triggers, and the parallel dispatch procedure retain their existing behavior. Both skill descriptions stay unchanged. Each edited `SKILL.md` remains at or below 500 lines.
- **Non-goals:** Changes to apex-plan, the session hook, wrapper code, settings, the trial log, `SKILLS.md`, or apex-repo doctrine. Those are owned by sibling specs or the host.

## Assumptions

- Live build-repo text checked on 2026-10-01: `skills/apex-orchestrate/SKILL.md:3-4,55` has version 2.2.0 and the `model: opus` spec-author route; `skills/apex-code/SKILL.md:3-4,268` has version 2.18.0 and the old Opus role clause; `skills/apex-code/references/parallel-codex.md:64` repeats that clause. Impact if changed before build: Stop and re-anchor the exact replacements.
- `skills/apex-code/scripts/codex-dispatch.ps1:56` already declares `[switch]$AuthorSpec`; Spec A owns apex-plan's caller in the prerequisite build wave. Impact if unavailable at build: Stop.

Simplicity check: yes. One build task owns the three build-side doctrine files.

## Prerequisites

- Specs that must be complete first: `spec-author-routing` (Spec A) must be built and integrated before this spec; its doctrine makes the apex-plan gpt-6-sol author dispatch true. This spec is file-disjoint from `routing-session-hook` (Spec C), which may build in the same later wave.
- Environment setup required: the shipped `-AuthorSpec` wrapper in `C:\Users\User\.claude`; no package installation.

## Files to Change

| File | Operation | Notes |
|------|-----------|-------|
| `skills/apex-orchestrate/SKILL.md` | modify | Task 1: plan-route cell, version 2.3.0, build-date `last_updated`, ADR-048 source |
| `skills/apex-code/SKILL.md` | modify | Task 1: fallback parenthetical role clause, version 2.18.1, build-date `last_updated`, ADR-048 source |
| `skills/apex-code/references/parallel-codex.md` | modify | Task 1: matching fallback parenthetical role clause |

Grep evidence: in `C:\Users\User\.claude`, pattern "version: 2\.2\.0|last_updated: 2026-08-02|dispatch a `model: opus` spec author" run with `rg -n` against `skills/apex-orchestrate/SKILL.md` returned 3 lines (3, 4, 55); pattern `version: 2\.18\.0|last_updated: 2026-09-30|Opus keeps the spec-author` against `skills/apex-code/SKILL.md` returned 3 lines (3, 4, 268); pattern `Opus keeps the spec-author` against `skills/apex-code/references/parallel-codex.md` returned 1 line (64). Consumer/path search with `rg -o -F -uu --glob '*.md'` over `skills` and `hooks` returned 4 occurrences of `apex-orchestrate/SKILL.md`, 16 of `apex-code/SKILL.md`, and 16 of `parallel-codex.md`. No consumer file is edited here.

## Tasks

- [ ] **Task 1: planning route and build fallback asides** - files: `skills/apex-orchestrate/SKILL.md`, `skills/apex-code/SKILL.md`, `skills/apex-code/references/parallel-codex.md`
  - At line 55, replace the entire `Route to` cell of the plan/design/architect/spec row. The current cell begins `**apex-plan**`, contains the exact text "dispatch a `model: opus` spec author", and ends `ADR-045); the host does not author it itself`. Keep the `Signal` cell and all other route rows intact. New cell text:
    ```text
    **apex-plan**, which dispatches a gpt-6-sol spec author through the wrapper's `-AuthorSpec` (apex-plan, "Writing the spec"; ADR-048)
    ```
  - Change frontmatter `version: 2.2.0` at line 3 to `version: 2.3.0`; set line 4 `last_updated` to the build date in `YYYY-MM-DD`; add `docs/technical/adr/ADR-048-role-redesign.md` to `sources` after the existing ADR-046 entry at line 11. Keep `description` unchanged.
  - Done when the plan route names the gpt-6-sol wrapper author and no longer directs a `model: opus` spec-author dispatch.
  - In `SKILL.md:268` and `references/parallel-codex.md:64`, replace the exact clause `Opus keeps the spec-author, build-orchestrator, and high-risk-reviewer roles` with `Opus keeps the build-orchestrator and high-risk-reviewer roles; specs are authored by gpt-6-sol (ADR-048)`. Preserve each parenthetical's preceding A1/sequential context, its closing punctuation, and the surrounding fallback instructions.
  - In `SKILL.md`, change frontmatter `version: 2.18.0` at line 3 to `version: 2.18.1`; set line 4 `last_updated` to the build date in `YYYY-MM-DD`; add `docs/technical/adr/ADR-048-role-redesign.md` to `sources` after the existing ADR-046 entry at line 16. Keep `description` unchanged. Do not add frontmatter to `references/parallel-codex.md`.
  - Done when both asides contain the new clause and neither retains the old spec-author role clause.

## Wave plan

Prerequisite wave: build and integrate `spec-author-routing`. Then Wave 1: [Task 1]. `routing-session-hook` may build in this later wave.

## Permissions

The following non-critical actions may run during this build. The three skill/reference files are the only build writes. Critical paths, including hooks and host-state files, require a separate attended confirmation and are outside this spec. `docs/audit/` is not writable under this spec.

### File Operations

| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | `skills/apex-orchestrate/SKILL.md`, `skills/apex-code/SKILL.md`, `skills/apex-code/references/parallel-codex.md` |
| Delete | (none) |

### Commands

| Command | Purpose |
|---------|---------|
| PowerShell checks in `## Acceptance Criteria` | Capture pre-build content hashes and status, then verify exact edited lines, preserved line sequence, scope, dates, pointers, and line caps |
| Full-fence command in `## Acceptance Criteria` | Run the build repo's `AGENTS.md` verify fence |
| `git hash-object` / `git status --porcelain --ignored -uall` / `git diff --check` | Record and compare content scope; inspect whitespace without staging |

### Git Operations

| Operation | Scope |
|-----------|-------|
| `git status` / `git diff` | Read-only in the build repo |
| `git add -f` | Host at integration only: each of the three `~/.claude` files above by name |
| `git commit` | Host at integration only; the builder stages and commits nothing |

### Environment Access

| Variable | Purpose |
|----------|---------|
| `USERPROFILE` | Resolve the installed build repo when running its verify script |
| `TEMP` | Hold the host-owned pre-build scope snapshot outside the build repo |

### Network

| Action | Purpose |
|--------|---------|
| (none) | No network access |

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
| Skill | `skills/apex-orchestrate/SKILL.md` | Replace the planning route; bump frontmatter version/date/source |
| Skill | `skills/apex-code/SKILL.md` | Replace the fallback role clause; bump frontmatter version/date/source |
| Reference | `skills/apex-code/references/parallel-codex.md` | Replace the matching fallback role clause |

**HOST task H (outside the coder's write set):** After Task 1 passes, prepend exactly two rows under the introduction in `C:\Users\User\apex\SKILL-HISTORY.md`. Use the seven fields `Date | Skill | Files | Version | Event | What Changed | Sources` in that order. For the first row: Date = the recorded build date; Skill = `apex-orchestrate`; Files = `skills/apex-orchestrate/SKILL.md`; Version = `2.3.0`; Event = `updated`; What Changed = `Planning route dispatches the gpt-6-sol spec author through -AuthorSpec (ADR-048).`; Sources = `docs/technical/adr/ADR-048-role-redesign.md`. For the second: Date = the same recorded build date; Skill = `apex-code`; Files = `skills/apex-code/SKILL.md`, `skills/apex-code/references/parallel-codex.md`; Version = `2.18.1`; Event = `updated`; What Changed = `Build fallback asides reserve Opus for the build-orchestrator and high-risk-reviewer roles and assign spec authoring to gpt-6-sol (ADR-048).`; Sources = `docs/technical/adr/ADR-048-role-redesign.md`. The host handles the hook row from Spec C and creates the central trial log at the wave's first promotion. `SKILLS.md` has no description change. The host handles promotion and archival; this builder does not move the spec.

## Acceptance Criteria

- [ ] Task 1 - the three edited files have exactly the specified new full lines; all other lines equal HEAD in the same order. The recorded build date, content-hash scope, reachability, and structural checks pass. Before dispatch, the HOST writes `Build date: YYYY-MM-DD` in `## Progress`, then runs this snapshot block from the build repo with `$phase = 'before'`. After the build, run it with `$phase = 'after'`. Both runs must complete without throwing. The snapshot is host-owned and outside the coder's write set.
  ```powershell
  $phase = 'before' # use 'after' for verification
  $root = 'C:\Users\User\.claude'
  $snapshotPath = Join-Path $env:TEMP 'routing-build-asides-prebuild.json'
  $allowed = @('skills/apex-orchestrate/SKILL.md','skills/apex-code/SKILL.md','skills/apex-code/references/parallel-codex.md')
  $exclude = '(^|/)(sessions|projects|backups|jobs|shell-snapshots|todos|file-history|cache|plugins)(/|$)|(^|/)(history\.jsonl|\.last-update-result\.json|\.credentials\.json)$|^skills/synced(?:/|$)'
  function Snapshot {
    $hashes = @{}
    foreach ($dir in @('skills/apex-orchestrate','skills/apex-code')) {
      foreach ($file in @(Get-ChildItem -LiteralPath (Join-Path $root $dir) -Recurse -Force -File)) {
        $rel = $file.FullName.Substring($root.Length + 1).Replace('\','/')
        if ($rel -match $exclude) { continue }
        $hashes[$rel] = git -c safe.directory=C:/Users/User/.claude -C $root hash-object -- $file.FullName
        if ($LASTEXITCODE -ne 0) { throw "hash-object: $rel" }
      }
    }
    $status = @(git -c safe.directory=C:/Users/User/.claude -C $root status --porcelain --ignored -uall)
    if ($LASTEXITCODE -ne 0) { throw 'status' }
    $status = @($status | Where-Object { $_.Substring(3).Trim('"').Replace('\','/') -notmatch $exclude })
    return @{ Hashes = $hashes; Status = $status }
  }
  $now = Snapshot
  if ($phase -eq 'before') {
    if (Test-Path -LiteralPath $snapshotPath) { throw 'pre-build snapshot already exists' }
    $now | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $snapshotPath -Encoding UTF8
  } elseif ($phase -eq 'after') {
    $before = Get-Content -LiteralPath $snapshotPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $oldHashes = @{}; foreach ($item in $before.Hashes.PSObject.Properties) { $oldHashes[$item.Name] = $item.Value }
    foreach ($path in $oldHashes.Keys) {
      if (-not $now.Hashes.ContainsKey($path)) { throw "removed path: $path" }
      if ($now.Hashes[$path] -cne $oldHashes[$path] -and $path -cnotin $allowed) { throw "out-of-scope content: $path" }
    }
    foreach ($path in $now.Hashes.Keys) { if (-not $oldHashes.ContainsKey($path)) { throw "new path: $path" } }
    $oldStatus = @($before.Status | Where-Object { $_.Substring(3).Trim('"').Replace('\','/') -cnotin $allowed })
    $newStatus = @($now.Status | Where-Object { $_.Substring(3).Trim('"').Replace('\','/') -cnotin $allowed })
    if (($oldStatus -join "`n") -cne ($newStatus -join "`n")) { throw 'out-of-scope status or new path' }
  } else { throw 'phase' }
  ```
  Run the following after the snapshot's `after` phase. The three Base64 strings are the exact full old UTF-8 lines found in HEAD on 2026-10-01; decoding them avoids non-ASCII literals in this spec. Each replacement is located by exact old full-line equality, each new full line is compared for exact equality, and the ordered comparison covers every untouched line.
  ```powershell
  $root = 'C:\Users\User\.claude'
  $spec = 'C:\Users\User\apex\docs\changes\routing-build-asides.md'
  $dateMatch = @(Select-String -LiteralPath $spec -Pattern '^Build date: ([0-9]{4}-[0-9]{2}-[0-9]{2})$')
  if ($dateMatch.Count -ne 1) { throw 'recorded build date' }
  $buildDate = $dateMatch[0].Matches[0].Groups[1].Value
  [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
  function Decode([string]$s) { [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($s)) }
  $routeOld = Decode 'fCBwbGFuIMK3IGRlc2lnbiDCtyBhcmNoaXRlY3Qgwrcgc3BlYyDCtyAibGV0J3MgYnVpbGQiIMK3IHdoYXQgaWYgfCAqKmFwZXgtcGxhbioqIOKAlCB0aGVuICoqZGlzcGF0Y2ggYSBgbW9kZWw6IG9wdXNgIHNwZWMgYXV0aG9yKiogdG8gZHJhZnQgdGhlIHNwZWMvQURSIGZyb20geW91ciBwbGFuIChhdXRob3IgY29udHJhY3Q6IGBhcGV4LW9yY2hlc3RyYXRlL3RlbXBsYXRlcy9zcGVjLXRlbXBsYXRlLm1kYCArIGFwZXgtcGxhbiDCpyBXcml0aW5nIHRoZSBzcGVjOyBBRFItMDQ1KTsgdGhlIGhvc3QgZG9lcyBub3QgYXV0aG9yIGl0IGl0c2VsZiB8'
  $codeOld = Decode 'KipTb25uZXQgNSoqLCBhIGZyZXNoIGBtb2RlbDogc29ubmV0YCB3b3JrZXIgaW4gdGhpcyBzZXNzaW9uIChBMSwgc2Vzc2lvbi03OWI6IHRoZSBjb2RpbmcgZmFsbGJhY2sgbm8gbG9uZ2VyIGRyYXdzIHRoZSBzY2FyY2UgT3B1cyBwb29sOyBPcHVzIGtlZXBzIHRoZSBzcGVjLWF1dGhvciwgYnVpbGQtb3JjaGVzdHJhdG9yLCBhbmQgaGlnaC1yaXNrLXJldmlld2VyIHJvbGVzKS4gTG9nZ2VkLCBuZXZlciBzaWxlbnQuIE5vIGJhY2tlbmQgc3dhcCwgbm8='
  $parallelOld = Decode 'YmFjayB0aGUgcmVtYWluaW5nIHN1Yi13YXZlIHRhc2tzIHRvIFNvbm5ldCA1IChzZXF1ZW50aWFsIOKAlCBBMS9BRFItMDQ1OyBPcHVzIGtlZXBzIHRoZSBzcGVjLWF1dGhvciwgYnVpbGQtb3JjaGVzdHJhdG9yLCBhbmQgaGlnaC1yaXNrLXJldmlld2VyIHJvbGVzKS4gQSB0YXNrIHRoYXQgd29uJ3QgY29udmVyZ2UgYWZ0ZXIgaG9uZXN0IHJlY292ZXJ5IOKGkiBmb3JrIChjYXB0dXJlLWF0LWhhbHQpLg=='
  $oldClause = 'Opus keeps the spec-author, build-orchestrator, and high-risk-reviewer roles'
  $newClause = 'Opus keeps the build-orchestrator and high-risk-reviewer roles; specs are authored by gpt-6-sol (ADR-048)'
  foreach ($old in @($codeOld,$parallelOld)) { if (-not $old.Contains($oldClause)) { throw 'old fallback anchor' } }
  $routeNew = $routeOld.Substring(0,$routeOld.IndexOf('|',1) + 1) + ' **apex-plan**, which dispatches a gpt-6-sol spec author through the wrapper''s `-AuthorSpec` (apex-plan, "Writing the spec"; ADR-048) |'
  $sourceOld = '  - docs/technical/adr/ADR-046-doctrine-audit-resolutions.md'
  $sourceNew = '  - docs/technical/adr/ADR-048-role-redesign.md'
  $edits = @{
    'skills/apex-orchestrate/SKILL.md' = @(@{Old='version: 2.2.0';New='version: 2.3.0'},@{Old='last_updated: 2026-08-02';New="last_updated: $buildDate"},@{Old=$routeOld;New=$routeNew})
    'skills/apex-code/SKILL.md' = @(@{Old='version: 2.18.0';New='version: 2.18.1'},@{Old='last_updated: 2026-09-30';New="last_updated: $buildDate"},@{Old=$codeOld;New=$codeOld.Replace($oldClause,$newClause)})
    'skills/apex-code/references/parallel-codex.md' = @(@{Old=$parallelOld;New=$parallelOld.Replace($oldClause,$newClause)})
  }
  foreach ($path in $edits.Keys) {
    $head = @(git -c safe.directory=C:/Users/User/.claude -C $root show "HEAD:$path")
    if ($LASTEXITCODE -ne 0) { throw "HEAD read: $path" }
    $expected = New-Object 'System.Collections.Generic.List[string]'
    $seen = @{}; foreach ($edit in $edits[$path]) { $seen[$edit.Old] = 0 }
    $sourceCount = 0
    foreach ($line in $head) {
      $hits = @($edits[$path] | Where-Object { [string]::Equals($_.Old,$line,[StringComparison]::Ordinal) })
      if ($hits.Count -gt 1) { throw "ambiguous old line: $path" }
      if ($hits.Count -eq 1) { $expected.Add($hits[0].New); $seen[$hits[0].Old]++ } else { $expected.Add($line) }
      if ($path -ne 'skills/apex-code/references/parallel-codex.md' -and [string]::Equals($line,$sourceOld,[StringComparison]::Ordinal)) { $expected.Add($sourceNew); $sourceCount++ }
    }
    foreach ($edit in $edits[$path]) { if ($seen[$edit.Old] -ne 1) { throw "old line missing or repeated: $path" } }
    if ($path -ne 'skills/apex-code/references/parallel-codex.md' -and $sourceCount -ne 1) { throw "source anchor: $path" }
    $actual = @(Get-Content -LiteralPath (Join-Path $root $path) -Encoding UTF8)
    if ($actual.Count -ne $expected.Count) { throw "line count: $path" }
    for ($i=0; $i -lt $actual.Count; $i++) { if (-not [string]::Equals($actual[$i],$expected[$i],[StringComparison]::Ordinal)) { throw "line sequence: $path at $i" } }
  }
  $plan = Get-Content -LiteralPath (Join-Path $root 'skills/apex-plan/SKILL.md') -Encoding UTF8
  $start = [Array]::IndexOf($plan,'## Writing the spec')
  if ($start -lt 0) { throw 'apex-plan section' }
  $end = $start + 1; while ($end -lt $plan.Count -and $plan[$end] -notmatch '^## ') { $end++ }
  $writing = ($plan[$start..($end-1)] -join "`n")
  if ($writing -notmatch [regex]::Escape('-AuthorSpec -Model gpt-6-sol -Task author') -or $writing -notmatch [regex]::Escape('-ExpectedDigest') -or $writing -match [regex]::Escape('model: opus')) { throw 'prerequisite author dispatch' }
  if ((@(Select-String -LiteralPath (Join-Path $root 'skills/apex-code/SKILL.md') -SimpleMatch 'references/parallel-codex.md')).Count -lt 1) { throw 'parallel reference' }
  if ((@(Select-String -LiteralPath (Join-Path $root 'skills/apex-code/scripts/codex-dispatch.ps1') -SimpleMatch '[switch]$AuthorSpec')).Count -ne 1) { throw 'wrapper author switch' }
  Get-ChildItem (Join-Path $root 'skills') -Directory -Filter 'apex-*' | ForEach-Object { if ((@(Get-Content -LiteralPath (Join-Path $_.FullName 'SKILL.md'))).Count -gt 500) { throw $_.FullName } }
  powershell.exe -NoProfile -File (Join-Path $root 'skills/apex-code/scripts/apex-baseline-check.ps1') -Full -Worktree $root
  if ($LASTEXITCODE -ne 0) { throw 'verify fence' }
  git -c safe.directory=C:/Users/User/.claude -C $root diff --check
  if ($LASTEXITCODE -ne 0) { throw 'whitespace' }
  $refs = Get-ChildItem (Join-Path $root 'skills') -Recurse -File -Filter '*.md' | Select-String -AllMatches -Pattern '~/\.claude/skills/apex-[a-z-]+' | ForEach-Object { $_.Matches.Value } | Sort-Object -Unique
  foreach ($r in $refs) { if (-not (Test-Path -LiteralPath ($r -replace '^~', $env:USERPROFILE))) { throw $r } }
  if ((@(Get-Content -LiteralPath (Join-Path $root 'CLAUDE.md'))).Count -gt 200) { throw 'CLAUDE.md cap' }
  if ((Get-Item -LiteralPath 'C:\Users\User\apex\AGENTS.md').Length -gt 32768) { throw 'AGENTS.md cap' }
  ```
- [ ] Host task H - the two history rows contain all seven exact fields and precede the existing 2026-09-30 row. After host integration, run this `Select-String` check. Use the same recorded build date; the Task 1 exact-line and scope checks remain required for the build files.
  ```powershell
  $spec = 'C:\Users\User\apex\docs\changes\routing-build-asides.md'
  $dateMatch = @(Select-String -LiteralPath $spec -Pattern '^Build date: ([0-9]{4}-[0-9]{2}-[0-9]{2})$')
  if ($dateMatch.Count -ne 1) { throw 'recorded build date' }
  $date = $dateMatch[0].Matches[0].Groups[1].Value
  $history = 'C:\Users\User\apex\SKILL-HISTORY.md'
  $row1 = '| {0} | apex-orchestrate | `skills/apex-orchestrate/SKILL.md` | 2.3.0 | updated | Planning route dispatches the gpt-6-sol spec author through -AuthorSpec (ADR-048). | docs/technical/adr/ADR-048-role-redesign.md |' -f $date
  $row2 = '| {0} | apex-code | `skills/apex-code/SKILL.md`, `skills/apex-code/references/parallel-codex.md` | 2.18.1 | updated | Build fallback asides reserve Opus for the build-orchestrator and high-risk-reviewer roles and assign spec authoring to gpt-6-sol (ADR-048). | docs/technical/adr/ADR-048-role-redesign.md |' -f $date
  $first = @(Select-String -LiteralPath $history -SimpleMatch $row1)
  $second = @(Select-String -LiteralPath $history -SimpleMatch $row2)
  $prior = @(Select-String -LiteralPath $history -SimpleMatch '| 2026-09-30 | apex-code |')
  if ($first.Count -ne 1 -or -not [string]::Equals($first[0].Line,$row1,[StringComparison]::Ordinal)) { throw 'apex-orchestrate history' }
  if ($second.Count -ne 1 -or -not [string]::Equals($second[0].Line,$row2,[StringComparison]::Ordinal)) { throw 'apex-code history' }
  if ($prior.Count -ne 1 -or $first[0].LineNumber -ge $prior[0].LineNumber -or $second[0].LineNumber -ge $prior[0].LineNumber) { throw 'history order' }
  ```

## Progress

_(At build start the host records `Build date: YYYY-MM-DD` here; the builder writes the remaining progress.)_

Build date: 2026-10-01
