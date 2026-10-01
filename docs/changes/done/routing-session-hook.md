---
spec: routing-session-hook
status: draft
autonomy_level: L2
risk: medium
---

# Spec: Session hook model routing
<!-- Governing contract: references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->

**Identity:** Update the injected session routing table for the Opus 5.5 host and build orchestrator, gpt-6-sol spec author, and independent Sol plan-check.
<!-- -> why: see C:\Users\User\apex\docs\technical\adr\ADR-048-role-redesign.md. -->

**Relative-path root:** Every relative file path below is rooted in `C:\Users\User\.claude` (build repo). This spec file lives at `C:\Users\User\apex\docs\drafts\routing-session-hook.md` in the separate APEX repo; files in that repo use absolute paths. The build repo ignores `*`; at integration the host force-adds the named tracked hook with `git add -f` by name.

## Intent

- **Intent:** Every new session receives the stage-1 host, spec-author, and checker routing through the existing SessionStart hook.
- **Invariants:** Only the build-orchestrator model text changes in that row; the coder row, explicit model-pin rule, and all other hook instructions retain their current text. The Sol plan-check remains gpt-5.6-sol and is described as an independent read. No worker reviews its own output.
- **Non-goals:** Sibling specs own `apex-plan`, `apex-orchestrate`, and `apex-code` doctrine. The host owns `C:\Users\User\apex\SKILL-HISTORY.md`, the central trial log, and the broader doctrine sweep at integration. This spec does not change settings or hook scripts.

## Assumptions

- The five old hook lines in Task 1 were verified against live text and HEAD on 2026-10-01; if an exact old line differs at build time, stop rather than editing by line number -> impact: Stop.
- `settings.json:59` invokes `hooks/backend-session-start.ps1`, which reads `hooks/apex-session-context.md` at lines 12-13 and emits it as SessionStart `additionalContext` at lines 27-36 -> impact if changed: Stop.
- Spec A `spec-author-routing` owns the apex-plan author caller and the independent-read wording; its built and integrated author route must precede this spec. This spec is file-disjoint from Specs A and B -> impact if the ownership changes: Stop.

Simplicity check: The single hook file contains all routing statements; five line edits in that file complete this slice.

## Prerequisites

- Specs that must be complete first: `C:\Users\User\apex\docs\changes\done\wrapper-model-author.md` (the shipped wrapper author mode); `spec-author-routing` (currently `C:\Users\User\apex\docs\drafts\spec-author-routing.md`) must be built and integrated before this spec. `routing-build-asides` remains file-disjoint.
- Environment setup required: an attended build for the live confirmation before modifying the critical hook path. No package installation.

## Files to Change

| File | Operation | Notes |
|------|-----------|-------|
| `hooks/apex-session-context.md` | modify | Task 1: host, build-orchestrator, spec-author, and checker routing text |

Grep evidence: Against `C:\Users\User\.claude\hooks\apex-session-context.md`, `rg -o -F` found `this session (Fable 5)` 1 hit, ``Opus -- a `model: opus` worker drafts specs/ADRs from the host's plan`` 1, `Build orchestrator | Opus 5 --` 1, `cross-family, both directions (ADR-032/034)` 1, `The session model is Fable 5` 1, and `always pin the model explicitly` 1. The unchanged `Coder` row had 1 hit. A consumer search with `rg -n -F 'apex-session-context.md'` found 4 hits across `CLAUDE.md`, `hooks/backend-session-start.ps1`, and `skills/apex-orchestrate/templates/status-template.md`; the backend script has two occurrences. `rg -n -F` found the SessionStart command in `settings.json:59` and the critical `hooks` path classifier in `skills/apex-code/scripts/apex-critical-files.ps1:189,193`. None of those consumers is a build write.

## Tasks

- [ ] **Task 1: session routing** -- file: `hooks/apex-session-context.md` -- done when: the five exact old HEAD lines are replaced by the five exact new lines in the acceptance block, in order, and every other HEAD line is unchanged.
  - Locate each old line by exact full-line text; require exactly one occurrence before replacing it. Do not use fixed line numbers.
  - The Host row and session sentence name Opus 5.5 at medium effort. The Build orchestrator row changes only its model label to Opus 5.5. The Spec author and Checker rows use the exact new text in the acceptance block. Preserve the Coder row and explicit model-pin guidance.

## Wave plan

Wave 1: [Task 1]. Spec A must be built and integrated first; Spec B owns disjoint files and may build in parallel with this spec after the attended hook confirmation.

## Permissions

The sole build-repo write is a hook, classified as a Layer-A critical path by the build repo's critical-file classifier. It requires a live attended confirmation at build time under apex-governance (D3, ADR-046). This section does not pre-authorize that write; an AFK build parks it. The scope snapshot is a temporary file outside the build repo. No audit path is writable.

### File Operations

| Action | Paths |
|--------|-------|
| Create | `$env:TEMP/apex-routing-session-hook-scope.tmp` (build-time scope snapshot) |
| Modify after attended confirmation | `hooks/apex-session-context.md` |
| Delete | (none) |

### Commands

| Command | Purpose |
|---------|---------|
| PowerShell checks in `## Acceptance Criteria` | Check exact lines, unchanged text, SessionStart reachability, recorded build date, and content-hash scope |
| Every command in the build repo `AGENTS.md` `## Verify commands` fence | Run the repository verification gate |
| `git status --porcelain --ignored -uall` / `git hash-object` / `git diff --check` | Record and compare full scope status and file content without staging |

### Git Operations

| Operation | Scope |
|-----------|-------|
| `git status` / `git diff` / `git hash-object` / `git show` | Read-only, build repo |
| `git add -f` | Host at integration only: `hooks/apex-session-context.md` by name |
| `git commit` | Host only after approval; builder does not stage or commit |

### Environment Access

| Variable | Purpose |
|----------|---------|
| `USERPROFILE` | Resolve the installed build repo for verification |
| `TEMP` | Store the build-time scope snapshot outside the build repo |

### Network

| Action | Purpose |
|--------|---------|
| (none) | No network access |

## Specialist Context

### Security

The hook is injected into every new session and is a critical path. Preserve all content outside the five specified line replacements and obtain attended confirmation before the write.

### Performance

(none)

### Accessibility

(none)

## Documentation

| Doc type | File | Action |
|----------|------|--------|
| Hook contract | `hooks/apex-session-context.md` | Replace the five specified lines only |

Host integration work, outside this build and outside `## Files to Change`: add the hook row to `C:\Users\User\apex\SKILL-HISTORY.md`, apply the three skill-version rows from Specs A and B, and create the central trial log at this wave's first promotion. The host also owns the doctrine sweep in `C:\Users\User\apex\docs\technical\pin-change-sweep.md`. `C:\Users\User\apex\SKILLS.md` is unchanged because no skill description changes. The host handles promotion and archival; this builder does not move the spec.

## Acceptance Criteria

- [ ] Task 1 -- replace exactly five lines and preserve every other HEAD line in order -> verify: run from `C:\Users\User\.claude`; the PowerShell block completes without throwing. Each old line must occur once in HEAD and each intended new line must match the current line exactly.
  ```powershell
  $p = 'hooks/apex-session-context.md'
  $pairs = @(
    @('| Host -- reason, plan, challenge only | this session (Fable 5). Dispatches everything below; makes no mechanical edits and writes no code. |',
      '| Host -- reason, plan, challenge only | this session (Opus 5.5, medium effort). Dispatches everything below; makes no mechanical edits and writes no code. |'),
    @('| Spec author | Opus -- a `model: opus` worker drafts specs/ADRs from the host''s plan |',
      '| Spec author | gpt-6-sol via the wrapper''s `-AuthorSpec` (apex-plan, Writing the spec; ADR-048) |'),
    @('| Build orchestrator | Opus 5 -- the dispatched `apex-build-orchestrator` agent owns the BUILD PHASE of an ATTENDED build: task selection, wave sequencing, dispatch parameters, exit-code routing, verify adjudication, integration order (owner amendment 2026-07-29; v1 shipped 2026-08-02). Close-out and unattended/AFK builds stay HOST-executed per `~/.claude/skills/apex-code/SKILL.md`. |',
      '| Build orchestrator | Opus 5.5 -- the dispatched `apex-build-orchestrator` agent owns the BUILD PHASE of an ATTENDED build: task selection, wave sequencing, dispatch parameters, exit-code routing, verify adjudication, integration order (owner amendment 2026-07-29; v1 shipped 2026-08-02). Close-out and unattended/AFK builds stay HOST-executed per `~/.claude/skills/apex-code/SKILL.md`. |'),
    @('| Checker | cross-family, both directions (ADR-032/034) -- Codex checks the host''s plans/specs; Claude reviews Codex''s code. An agent never reviews its own output. |',
      '| Checker | Cross-family, both directions: the gpt-5.6-sol pre-draft architecture pass checks the host''s (Claude) plans; Claude (apex-spec-reviewer) reviews gpt-6-sol-authored specs; Claude reviews Codex''s code. The gpt-5.6-sol cold read of a Sol-authored spec is an independent (same-family) read. An agent never reviews its own output. |'),
    @('The session model is Fable 5 (expensive, capped share of the weekly pool). A dispatch that omits',
      'The session model is Opus 5.5 at medium effort. A dispatch that omits')
  )
  $head = @(git show HEAD:hooks/apex-session-context.md)
  if ($LASTEXITCODE -ne 0) { throw 'hook HEAD command' }
  $current = @(Get-Content -LiteralPath $p)
  $expected = [string[]]$head.Clone()
  foreach ($pair in $pairs) {
    $hits = @(for ($i = 0; $i -lt $head.Count; $i++) { if ($head[$i] -ceq $pair[0]) { $i } })
    if ($hits.Count -ne 1) { throw "old line count: $($pair[0])" }
    $expected[$hits[0]] = $pair[1]
  }
  if ($current.Count -ne $expected.Count) { throw 'hook line count' }
  for ($i = 0; $i -lt $expected.Count; $i++) {
    if ($current[$i] -cne $expected[$i]) { throw "hook line differs from expected at $($i + 1)" }
  }
  ```
- [ ] Reachability -- the changed text reaches SessionStart callers -> verify: run from the build repo; the PowerShell block completes without throwing.
  ```powershell
  $settings = Get-Content -LiteralPath settings.json -Raw | ConvertFrom-Json
  $commands = @($settings.hooks.SessionStart | ForEach-Object { $_.hooks | ForEach-Object { $_.command } })
  if ($commands -cnotcontains "powershell.exe -NoProfile -ExecutionPolicy Bypass -File 'C:/Users/User/.claude/hooks/backend-session-start.ps1'") { throw 'SessionStart registration' }
  $payload = (& powershell.exe -NoProfile -ExecutionPolicy Bypass -File hooks/backend-session-start.ps1 | ConvertFrom-Json).hookSpecificOutput
  if ($payload.hookEventName -ne 'SessionStart') { throw 'hook event' }
  $static = Get-Content -LiteralPath hooks/apex-session-context.md -Raw
  if (-not $payload.additionalContext.StartsWith($static, [StringComparison]::Ordinal)) { throw 'injected hook differs from the exact verified file' }
  ```
- [ ] Structural checks -- keep the APEX line caps and skill pointers valid -> verify: run from the build repo; the PowerShell block completes without throwing. Do not read or edit the planning host's status file.
  ```powershell
  Get-ChildItem skills -Directory -Filter 'apex-*' | ForEach-Object {
    $skill = Join-Path $_.FullName 'SKILL.md'
    if ((@(Get-Content -LiteralPath $skill)).Count -gt 500) { throw "skill cap: $skill" }
  }
  if ((@(Get-Content -LiteralPath CLAUDE.md)).Count -gt 200) { throw 'CLAUDE.md cap' }
  $targets = [regex]::Matches((Get-ChildItem skills -Recurse -File -Filter '*.md' | Get-Content -Raw | Out-String), '~/.claude/skills/apex-[a-z-]+') | ForEach-Object { $_.Value } | Sort-Object -Unique
  foreach ($target in $targets) {
    $path = $target.Replace('~/.claude', (Get-Location).Path).Replace('/', '\')
    if (-not (Test-Path -LiteralPath $path)) { throw "dangling skill pointer: $target" }
  }
  ```
- [ ] Build-repo verification fence -- run every command under `## Verify commands` in the build repo's AGENTS.md from the build repo; each exits 0. The fence includes two Node syntax checks, one Python guard suite, and seven PowerShell suites.
- [ ] Pre-build record -- before any build write, the host writes `Build date: YYYY-MM-DD` in this spec's Progress section and runs the following PowerShell from `C:\Users\User\.claude`. The snapshot covers every worktree file under that root, including `settings.json`, except the listed runtime paths and Git metadata. Keep the snapshot for the post-build scope check.
  ```powershell
  $root = (Get-Location).Path.TrimEnd('\')
  $baselinePath = Join-Path $env:TEMP 'apex-routing-session-hook-scope.tmp'
  $excluded = '^(?:\.git|sessions|projects|backups|jobs|shell-snapshots|todos|file-history|cache|plugins|skills/synced)(?:/|$)|^(?:history\.jsonl|\.last-update-result\.json|\.credentials\.json)$'
  function Get-ScopeSnapshot {
    $hashes = @{}
    $pending = New-Object 'System.Collections.Generic.Stack[string]'
    $pending.Push($root)
    while ($pending.Count -gt 0) {
      foreach ($item in Get-ChildItem -LiteralPath $pending.Pop() -Force) {
        $relative = $item.FullName.Substring($root.Length).TrimStart('\').Replace('\', '/')
        if ($relative -match $excluded) { continue }
        if ($item.PSIsContainer) { $pending.Push($item.FullName); continue }
        $hash = git hash-object -- $item.FullName
        if ($LASTEXITCODE -ne 0) { throw "hash failed: $relative" }
        $hashes[$relative] = $hash
      }
    }
    $status = @(git status --porcelain --ignored -uall)
    if ($LASTEXITCODE -ne 0) { throw 'status failed' }
    $status = @($status | Where-Object {
      $_.Substring(3).Trim('"').Replace('\', '/') -notmatch $excluded
    })
    return @{ Hashes = $hashes; Status = $status }
  }
  $spec = Get-Content -LiteralPath 'C:\Users\User\apex\docs\drafts\routing-session-hook.md' -Raw
  $dateMatch = [regex]::Match($spec, '(?m)^Build date: (\d{4}-\d{2}-\d{2})$')
  if (-not $dateMatch.Success) { throw 'record build date in Progress first' }
  $before = Get-ScopeSnapshot
  $before.BuildDate = $dateMatch.Groups[1].Value
  $before | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $baselinePath
  ```
- [ ] Scope -- only `hooks/apex-session-context.md` may change under the build repo root -> verify: run the following PowerShell after the build in the same root. It compares content hashes for every pre-existing non-target file, rejects new paths, compares the full non-target status list, and uses the recorded build date.
  ```powershell
  $root = (Get-Location).Path.TrimEnd('\')
  $baselinePath = Join-Path $env:TEMP 'apex-routing-session-hook-scope.tmp'
  $excluded = '^(?:\.git|sessions|projects|backups|jobs|shell-snapshots|todos|file-history|cache|plugins|skills/synced)(?:/|$)|^(?:history\.jsonl|\.last-update-result\.json|\.credentials\.json)$'
  function Get-ScopeSnapshot {
    $hashes = @{}
    $pending = New-Object 'System.Collections.Generic.Stack[string]'
    $pending.Push($root)
    while ($pending.Count -gt 0) {
      foreach ($item in Get-ChildItem -LiteralPath $pending.Pop() -Force) {
        $relative = $item.FullName.Substring($root.Length).TrimStart('\').Replace('\', '/')
        if ($relative -match $excluded) { continue }
        if ($item.PSIsContainer) { $pending.Push($item.FullName); continue }
        $hash = git hash-object -- $item.FullName
        if ($LASTEXITCODE -ne 0) { throw "hash failed: $relative" }
        $hashes[$relative] = $hash
      }
    }
    $status = @(git status --porcelain --ignored -uall)
    if ($LASTEXITCODE -ne 0) { throw 'status failed' }
    $status = @($status | Where-Object {
      $_.Substring(3).Trim('"').Replace('\', '/') -notmatch $excluded
    })
    return @{ Hashes = $hashes; Status = $status }
  }
  $before = Get-Content -LiteralPath $baselinePath -Raw | ConvertFrom-Json
  $after = Get-ScopeSnapshot
  $spec = Get-Content -LiteralPath 'C:\Users\User\apex\docs\drafts\routing-session-hook.md' -Raw
  $dateMatch = [regex]::Match($spec, '(?m)^Build date: (\d{4}-\d{2}-\d{2})$')
  if (-not $dateMatch.Success -or $dateMatch.Groups[1].Value -cne $before.BuildDate) { throw 'build date changed' }
  $target = 'hooks/apex-session-context.md'
  $beforePaths = @($before.Hashes.PSObject.Properties.Name)
  $afterPaths = @($after.Hashes.Keys)
  foreach ($path in $beforePaths) {
    if ($path -ceq $target) { continue }
    if ($afterPaths -cnotcontains $path) { throw "removed path: $path" }
    if ($before.Hashes.$path -cne $after.Hashes[$path]) { throw "changed content: $path" }
  }
  foreach ($path in $afterPaths) {
    if ($path -cne $target -and $beforePaths -cnotcontains $path) { throw "new path: $path" }
  }
  $beforeStatus = @($before.Status | Where-Object { $_.Substring(3) -cne $target })
  $afterStatus = @($after.Status | Where-Object { $_.Substring(3) -cne $target })
  if ($beforeStatus.Count -ne $afterStatus.Count) { throw 'non-target status count changed' }
  for ($i = 0; $i -lt $beforeStatus.Count; $i++) {
    if ($beforeStatus[$i] -cne $afterStatus[$i]) { throw "non-target status changed at $i" }
  }
  git diff --check -- hooks/apex-session-context.md
  if ($LASTEXITCODE -ne 0) { throw 'hook whitespace' }
  ```

## Progress
_(The build writes here -- do not edit manually)_

At build start, the host records `Build date: YYYY-MM-DD` here before the pre-build snapshot. Date-dependent verification uses that recorded value.

Build date: 2026-10-01
