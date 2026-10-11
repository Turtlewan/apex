---
spec: drain-plan
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Drain plan
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Sort a project's queued specs into unattended build order and owner-needed work without changing either repository.

## Intent
- **Intent:** Provide a read-only drain plan for the project's top-level `docs/changes/*.md` queue at invocation time.
- **Invariants:** Apply the ordered reason codes below; preserve the build repository's working tree and Git index; produce deterministic prerequisite order with ordinal filename ties.
- **Non-goals:** Building or launching the Engine, branches, quota waits, reports, receipt checks, Engine edits, and migration of existing Prerequisites sections.

## Assumptions
- `-Project` names a local project with `docs/changes`; each queued spec's execution manifest names its build repository. -> impact: Stop
- `git`, `powershell.exe`, and the live spec validator are available to `Get-EnginePlan`. -> impact: Stop

Simplicity check: one read-only command and one hermetic suite; no queue file.

## Prerequisites
none

## Files to Change
Grep evidence: `rg -uu -o -F -- '<literal>' <live-file>` was run separately for every pair here; counts are matching occurrences. `engine-plan.ps1` / `function Get-EnginePlan`: **1**; `engine-plan.ps1` / `execution manifest repo does not match -Repo`: **1**; `engine-plan.ps1` / `json apex-manifest`: **1**; `engine-plan.ps1` / `Join-Path $PSScriptRoot 'apex-spec-validate.ps1'`: **1**; `engine-plan.ps1` / `references/dispatch-pack.md`: **1**; `apex-engine.ps1` / `function Initialize-RunnerNewState`: **1**; `apex-engine.ps1` / `function Test-RunnerCriticalGate`: **1**; `apex-critical-files.ps1` / `exit 11`: **1**; `engine-plan-test.ps1` / `function New-Fixture`: **1**; build `AGENTS.md` / `skills/apex-code/scripts/engine-test.ps1`: **1**; `spec-template.md` / `## Prerequisites`: **1**; `spec-template.md` / `Specs that must be complete first`: **1** (line 79); `spec-template.md` / `Environment setup required`: **1** (line 80); `apex-orchestrate/SKILL.md` / `version:`: **1**; `SKILL-HISTORY.md` / `apex-orchestrate`: **57** and / `apex-code`: **210**. `apex-spec-validate.ps1` / `(?<Title>Task`: **1** (:783-785); `apex-spec-validate.ps1` / `$isHostOwner =`: **1** (:787-802) and / `\bOWNER\b`: **1** (:787-790); `spec-validate-test.ps1` / `Task 2 OWNER-run`: **2** (:443-447) and / `Task 2 (critical, OWNER-run)`: **1** (:449-451); `apex-engine.ps1` / `'rev-parse' 'HEAD'`: **7** (:1745); build `AGENTS.md` / `## Verify commands`: **1** (:9-25); `SKILL-HISTORY.md` / `Quick reference for skill creation and update events. Newest first.`: **1** (:3-5) and / `One row per event`: **1** (:4-6). `Test-Path -LiteralPath` found both new scripts absent. `rg -uu -o -F -- 'apex-drain-plan.ps1' SKILLS.md` returned **0**; the index lists no apex-code scripts, so this spec does not edit it.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-drain-plan.ps1 | create | Task 1 sorter and CLI. |
| skills/apex-code/scripts/apex-drain-plan-test.ps1 | create | Task 1 hermetic suite. |
| C:/Users/User/.claude/AGENTS.md | modify | HOST Task 2 verify fence. |
| skills/apex-orchestrate/templates/spec-template.md | modify | HOST Task 3 Prerequisites comment. |
| skills/apex-orchestrate/SKILL.md | modify | HOST Task 3 version and last_updated. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 3 history rows. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    {
      "id": "1",
      "repo": "claude",
      "files": [
        { "path": "skills/apex-code/scripts/apex-drain-plan.ps1", "op": "create" },
        { "path": "skills/apex-code/scripts/apex-drain-plan-test.ps1", "op": "create" }
      ],
      "depends_on": []
    }
  ]
}
```

## Tasks
- [ ] **Task 1** - Create `apex-drain-plan.ps1` with `[string]$Project` and `[switch]$Json`; require an absolute, existing project path and its `docs/changes` directory, enumerate only its top-level `*.md` files at invocation, and exit 1 with a message on those input failures. Dot-source sibling `engine-plan.ps1`. Extract each spec's manifest with the same `## Execution manifest` section and single fenced `json apex-manifest` block grammar as `Get-EnginePlan` (`engine-plan.ps1:654-672`); read its single `repos` key for `-Repo`, never frontmatter. Before calling `Get-EnginePlan`, classify a missing or duplicated manifest block, invalid manifest JSON, zero or several repo keys, unreadable frontmatter, or non-UTF-8 text as `engine-refused` with the specific failure in the human reason. For every spec, report `spec` as the frontmatter `spec:` value when readable, otherwise the filename basename without `.md`; retain `digest: null` internally wherever no plan digest exists. Treat missing/non-Git/non-toplevel paths as `engine-refused`; before calling `Get-EnginePlan`, check `git -C <build repo> rev-parse --verify HEAD` and classify a failure as `engine-refused` with reason `build repository has no commit` (`apex-engine.ps1:1745` resolves HEAD unconditionally). Treat any `Get-EnginePlan` `.allowed = $false` as `engine-refused`, carrying its refusal text. Mirror `Initialize-RunnerNewState` (`apex-engine.ps1:1719-1739`): call `Get-EnginePlan` (`engine-plan.ps1:525-530`) first with machine ceiling 4, read `probe.spec.max_parallel_codex` or default 2, then call it again at `min(spec ceiling, 4)` with no CLI ceiling; retain the final plan's `spec.digest`, `spec.risk`, and manifest task paths. Respect the repo identity and Git toplevel checks in `engine-plan.ps1:671-686` and its dirty-path refusal at `:815-848`. For an allowed plan, call sibling `apex-critical-files.ps1 -Test -Paths <all manifest paths> -Root <manifest repo>` (the path convention used by `Test-RunnerCriticalGate`, `apex-engine.ps1:528-539`); map exit 11 to `hard-block`, 10 to `critical-file`, and any other nonzero exit or missing classifier to `classifier-error`, including its output in the human reason. Parse `## Prerequisites` by stripping HTML comments first: missing section means no edges; otherwise its nonblank lines are exactly one `none`, `(none)`, or `None` line, or every line is `- ` plus a backticked spec name matching `^[a-z0-9][a-z0-9-]{0,62}$`, optionally followed by ` - <free text>` or ` — <free text>`; every other line is `prerequisites-unparseable`. A name is satisfied by `docs/changes/done/<name>.md` or a top-level queued spec; otherwise `prerequisite-missing`. Within the `## Tasks` section outside fenced blocks, use the live validator's task-declaration pattern `^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?\*\*\s*(?<Title>Task\s+(?<Id>[0-9]+[A-Za-z]?)(?=\b).*?)\*\*` and only its captured bold `Title` (`apex-spec-validate.ps1:783-802`, `spec-validate-test.ps1:443-451`). Set `host_work` when that title contains exact ordinal `(HOST)` or matches the case-sensitive, culture-invariant whole-word pattern `\bOWNER\b`. Include markers followed by more bold title text, such as `**Task 2 (HOST) followed by more title text**`, `**Task 2 OWNER-run**`, and `**Task 2 (critical, OWNER-run)**`; a `(HOST)` only in body prose does not count. Keep `host_work` on WILL BUILD entries. Classify in these ordered phases: (i) assign the first matching code independently to every spec among codes 1-7: `engine-refused`, `risk-high`, `hard-block`, `critical-file`, `classifier-error`, `prerequisites-unparseable`, `prerequisite-missing`; (ii) among specs that passed 1-7, build the in-queue prerequisite graph and compute strongly connected components; every spec in a component of size greater than one, or with a self-edge, is a cycle member; (iii) for each non-cycle spec that passed 1-7, inspect all root blockers reachable through in-queue prerequisite edges, where a root blocker is a NEEDS YOU spec from codes 1-7 or an in-queue spec with `host_work`; if any exists, assign `prerequisite-blocked` and set `blocked_by` to the ordinal-smallest root blocker's spec name across all reachable branches; (iv) assign `dependency-cycle` to every cycle member with `blocked_by: null`, including a cycle member that also has an external blocker; (v) for each remaining non-cycle spec that can reach a cycle member through in-queue prerequisite edges and has no reachable root blocker, assign `prerequisite-blocked` with `blocked_by` equal to the ordinal-smallest cycle member name across all reachable cycle components. Never replace the first code assigned to a spec. Topologically sort WILL BUILD specs by prerequisite edges and ordinal spec filename for ties. Output text sections `WILL BUILD` (order, spec, repo, risk, host_work) and `NEEDS YOU` (spec, reason_code, human reason); `-Json` emits one object `{schema_version:1, project, generated_at, will_build, needs_you}` with UTC ISO-8601 timestamp, WILL BUILD entries `{order,spec,path,repo,risk,digest,prerequisites[],host_work}`, and NEEDS YOU entries `{spec,path,reason_code,reason,blocked_by}` where `blocked_by` is the root spec name or null; only WILL BUILD entries carry a `digest` field. Exit 0 whenever the two lists are produced, including empty lists. Set process `GIT_OPTIONAL_LOCKS=0` before all Git/planner work and restore its prior value in `finally`. Create `apex-drain-plan-test.ps1` using temp project and `git init` temp build repos; reproduce `New-Fixture` and its spec-building helpers from `engine-plan-test.ps1:166-290` field-for-field, replacing only the generated Prerequisites section and other case-specific fields. Set `APEX_STATE_DIR` to a temp directory and restore it. Assert fixtures for each preplanner manifest/frontmatter/encoding refusal, an unborn build repository whose `git rev-parse --verify HEAD` fails, every reason code, first-match precedence, transitive root blocking, competing branches where d depends on b and c, b is blocked by z, and c independently NEEDS YOU (expect `blocked_by` to be the ordinal-smaller of z and c), all cycle members, a cycle member with an external blocker still classified `dependency-cycle`, a non-cycle dependent of multiple reachable cycle components blocked by the ordinal-smallest cycle member, done/ satisfaction, in-queue `host_work` blocking, `**Task 2 (HOST) followed by more title text**`, `**Task 2 OWNER-run**`, `**Task 2 (critical, OWNER-run)**`, a `(HOST)` mention only in task body prose that does not set `host_work`, ordinal ties, probe/replan parity with an ultra task plus an independent ordinary task and `max_parallel_codex: 1`, text/JSON shape and empty queue, input failures, restoration of `GIT_OPTIONAL_LOCKS`, unchanged fixture `.git/index` bytes, and no changed file under fixture project or build repos. For missing/bad classifier cases, copy the entire `skills/apex-code/scripts` and `skills/apex-code/references` directories into a temporary skill root with their sibling layout intact (`engine-plan.ps1:645` resolves its validator through `$PSScriptRoot`; `:853` resolves `dispatch-pack.md` through its parent); delete or replace only `apex-critical-files.ps1` in that copy and run the copied `apex-drain-plan.ps1`, with no CLI override parameter. - files: `skills/apex-code/scripts/apex-drain-plan.ps1`, `skills/apex-code/scripts/apex-drain-plan-test.ps1` - done when the sorter emits the specified read-only, ordered report and the hermetic suite passes.
- [ ] **Task 2 (HOST)** - In `C:/Users/User/.claude/AGENTS.md` `## Verify commands` fence, insert `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-plan-test.ps1` immediately before the existing `engine-test.ps1` command; preserve the other 14 command lines and leave `engine-test.ps1` last. - files: `C:/Users/User/.claude/AGENTS.md` - done when the fence has 15 commands in that order.
- [ ] **Task 3 (HOST)** - Via apex-skill-author, replace the `## Prerequisites` guidance at `skills/apex-orchestrate/templates/spec-template.md:71-78` and both placeholder bullets at `:79-80`. The replacement comment must contain this full literal sentence: After stripping HTML comments, Prerequisites non-blank lines are absent with no edges when the section is missing; otherwise they are exactly one line of `none`, `(none)`, or `None`, or every line is `- ` plus a backticked spec name matching `^[a-z0-9][a-z0-9-]{0,62}$`, optionally followed by ` - <free text>` or ` — <free text>`. Include a list example such as `- \`first-spec\``. The comment must direct environment setup to `## Assumptions`. The Prerequisites body becomes the single line `none`. Set `skills/apex-orchestrate/SKILL.md:3-4` to `version: 2.6.0` and `last_updated:` to the execution date in YYYY-MM-DD form, no earlier than 2026-10-10. Prepend separate `SKILL-HISTORY.md` rows mentioning `drain-plan` for apex-code's two new scripts and apex-orchestrate's template/metadata change. `SKILLS.md:32` lists the apex-code skill but no scripts; do not edit it unless a live recheck finds a script inventory, in which case return to planning to extend Files to Change first. - files: `skills/apex-orchestrate/templates/spec-template.md`, `skills/apex-orchestrate/SKILL.md`, `C:/Users/User/apex/SKILL-HISTORY.md` - done when template guidance, metadata, and both history rows agree.

## Wave plan
Wave 1: [1] | HOST: [2, 3].

## Permissions
Coder Task 1 may edit only its two listed scripts, run the complete Verify commands fence and its task suite, and read the cited sources. HOST performs Tasks 2 and 3. No coder Git operations or package installation.

### File Operations
| Action | Paths |
|--------|-------|
| Create (coder Task 1) | skills/apex-code/scripts/apex-drain-plan.ps1, skills/apex-code/scripts/apex-drain-plan-test.ps1 |
| Modify (HOST Task 2) | C:/Users/User/.claude/AGENTS.md |
| Modify (HOST Task 3) | skills/apex-orchestrate/templates/spec-template.md, skills/apex-orchestrate/SKILL.md, C:/Users/User/apex/SKILL-HISTORY.md |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-plan-test.ps1` | Run Task 1 suite. |
| Build repository `AGENTS.md` Verify commands fence below | Run all 15 commands, with `engine-test.ps1` last. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | Coder performs no Git operations. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `GIT_OPTIONAL_LOCKS` | Disable optional Git locks for the sorter run and restore its previous value. |
| `APEX_STATE_DIR` | Isolate test state in a temp directory and restore its previous value. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package or network action. |

## Specialist Context
### Security
Keep all sorter calls read-only, including Git index handling.

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Template | skills/apex-orchestrate/templates/spec-template.md | State strict Prerequisites grammar. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | Add one row per changed skill. |

## Acceptance Criteria
- [ ] Task 1 - the drain sorter classifies, orders, formats, and preserves both fixture repositories
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-plan-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'apex-drain-plan-test failed' }
```
- [ ] HOST Task 2 - the build repository Verify commands fence has the original 13 commands, the new drain suite, then the Engine suite
```powershell
$agentLines = @(Get-Content -LiteralPath 'C:/Users/User/.claude/AGENTS.md')
$headings = @(for ($i = 0; $i -lt $agentLines.Count; $i++) { if ($agentLines[$i] -ceq '## Verify commands') { $i } })
if ($headings.Count -ne 1) { throw 'Verify commands heading is missing or duplicated' }
$cursor = $headings[0] + 1
while ($cursor -lt $agentLines.Count -and [string]::IsNullOrWhiteSpace($agentLines[$cursor])) { $cursor++ }
$fence = [string]([char]96) * 3
if ($cursor -ge $agentLines.Count -or -not $agentLines[$cursor].StartsWith($fence, [StringComparison]::Ordinal)) { throw 'Verify commands fence is missing' }
$opening = $cursor
$cursor++
while ($cursor -lt $agentLines.Count -and $agentLines[$cursor] -cne $fence) { $cursor++ }
if ($cursor -ge $agentLines.Count) { throw 'Verify commands fence is unclosed' }
$commands = @($agentLines[($opening + 1)..($cursor - 1)] | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
$expected = @(
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
    'powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-plan-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1'
)
if ($commands.Count -ne 15) { throw "Expected 15 Verify commands, found $($commands.Count)" }
for ($i = 0; $i -lt 15; $i++) { if ($commands[$i] -cne $expected[$i]) { throw "Verify command $($i + 1) differs" } }
```
- [ ] HOST Task 3 - the template body, literal grammar comment, metadata, and newest history rows match the drain plan
```powershell
$template = Get-Content -Raw -LiteralPath 'C:/Users/User/.claude/skills/apex-orchestrate/templates/spec-template.md'
$section = [regex]::Match($template, '(?ms)^## Prerequisites\r?\n(?<Body>.*?)(?=^## |\z)')
if (-not $section.Success) { throw 'Prerequisites section is missing' }
$body = [regex]::Replace($section.Groups['Body'].Value, '(?s)<!--.*?-->', '')
$bodyLines = @($body -split '\r?\n' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
if ($bodyLines.Count -ne 1 -or $bodyLines[0] -cne 'none') { throw 'Prerequisites body is not exactly none' }
$grammarSentence = 'After stripping HTML comments, Prerequisites non-blank lines are absent with no edges when the section is missing; otherwise they are exactly one line of `none`, `(none)`, or `None`, or every line is `- ` plus a backticked spec name matching `^[a-z0-9][a-z0-9-]{0,62}$`, optionally followed by ` - <free text>` or ` — <free text>`.'
$comments = @([regex]::Matches($section.Groups['Body'].Value, '(?s)<!--.*?-->') | Where-Object { $_.Value.Contains($grammarSentence) })
if ($comments.Count -ne 1) { throw 'Full Prerequisites grammar sentence is missing from the comment' }
$skill = Get-Content -Raw -LiteralPath 'C:/Users/User/.claude/skills/apex-orchestrate/SKILL.md'
$frontmatter = [regex]::Match($skill, '(?s)\A---\r?\n(?<Body>.*?)\r?\n---')
if (-not $frontmatter.Success) { throw 'apex-orchestrate frontmatter is missing' }
$version = [regex]::Match($frontmatter.Groups['Body'].Value, '(?m)^version:\s*(.+)$')
if (-not $version.Success -or $version.Groups[1].Value.Trim() -cne '2.6.0') { throw 'apex-orchestrate version is not 2.6.0' }
$updated = [regex]::Match($frontmatter.Groups['Body'].Value, '(?m)^last_updated:\s*(.+)$')
$date = [datetime]::MinValue
if (-not $updated.Success -or -not [datetime]::TryParseExact($updated.Groups[1].Value.Trim(), 'yyyy-MM-dd', [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::None, [ref]$date) -or $date -lt [datetime]'2026-10-10') { throw 'apex-orchestrate last_updated is invalid or too early' }
$historyLines = @(Get-Content -LiteralPath 'C:/Users/User/apex/SKILL-HISTORY.md')
$historyHeaders = @(for ($i = 0; $i -lt $historyLines.Count; $i++) { if ($historyLines[$i] -match '^One row per event') { $i } })
if ($historyHeaders.Count -ne 1 -or $historyHeaders[0] + 2 -ge $historyLines.Count) { throw 'History header or rows are missing' }
$history = @($historyLines[($historyHeaders[0] + 1)..($historyHeaders[0] + 2)])
if (-not ($history[0] -match '^\|[^|]*\|\s*apex-code\s*\|' -and $history[0] -match 'drain-plan' -and $history[1] -match '^\|[^|]*\|\s*apex-orchestrate\s*\|' -and $history[1] -match 'drain-plan') -and -not ($history[1] -match '^\|[^|]*\|\s*apex-code\s*\|' -and $history[1] -match 'drain-plan' -and $history[0] -match '^\|[^|]*\|\s*apex-orchestrate\s*\|' -and $history[0] -match 'drain-plan')) { throw 'The newest history rows are not the two drain-plan skill rows' }
```
- [ ] The sorter is reachable from the APEX project and preserves its status and Git index
```powershell
$beforeStatus = @(& git -C C:/Users/User/apex status --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'Initial APEX status failed' }
$indexPath = 'C:/Users/User/apex/.git/index'
$beforeIndex = [IO.File]::ReadAllBytes($indexPath)
$output = @(& powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-plan.ps1 -Project C:/Users/User/apex -Json)
if ($LASTEXITCODE -ne 0) { throw 'APEX drain-plan invocation failed' }
$plan = ($output -join "`n") | ConvertFrom-Json -ErrorAction Stop
if ($plan.schema_version -ne 1 -or $plan.PSObject.Properties.Name -notcontains 'will_build' -or $plan.PSObject.Properties.Name -notcontains 'needs_you' -or $plan.will_build -isnot [array] -or $plan.needs_you -isnot [array]) { throw 'APEX drain-plan JSON shape is invalid' }
$afterStatus = @(& git -C C:/Users/User/apex status --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'Final APEX status failed' }
$afterIndex = [IO.File]::ReadAllBytes($indexPath)
if (($beforeStatus -join "`n") -cne ($afterStatus -join "`n") -or [Convert]::ToBase64String($beforeIndex) -cne [Convert]::ToBase64String($afterIndex)) { throw 'APEX status or Git index changed' }
```
- [ ] The complete build repository Verify commands fence passes with the new suite inserted and `engine-test.ps1` last
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
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```

## Progress
_(The build writes here - do not edit manually)_
