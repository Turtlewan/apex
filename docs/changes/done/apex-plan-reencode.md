---
spec: apex-plan-reencode
status: draft
autonomy_level: L2
risk: low
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Re-encode apex-plan text
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Light spec for one apex-plan text repair and its HOST bookkeeping.

## Intent
- **Intent:** Restore the intended punctuation in `skills/apex-plan/SKILL.md`, including its frontmatter description, after a Windows-1252 mis-decode.
- **Invariants:** All 111 double-encoded runs on 86 lines reverse cleanly; line endings, line count, and all other content remain byte-identical except the prescribed version bump.
- **Non-goals:** Wording revisions, date changes, or edits to other skills.

## Assumptions
- `skill-text-tidy` is applied to the build base; `skills/apex-plan/SKILL.md` has `version: 2.9.2` and `last_updated: 2026-10-15`. → impact: Stop
- The build-base file has exactly 111 matches of the Task 1 run regex on 86 lines, and each match reverses cleanly. → impact: Stop

Simplicity check: one coder task owns the only skill file; HOST owns one history row and one changelog bullet.

## Prerequisites
- `skill-text-tidy`

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-plan/SKILL.md | modify | Task 1 reverses double-encoded runs and bumps the version. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 2 adds one newest history row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 3 adds one first Unreleased Added bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-plan/SKILL.md", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
- [ ] **Task 1** - Reverse the double-encoded runs and bump the version - files: `skills/apex-plan/SKILL.md` - done when all 111 runs on 86 lines are repaired, the version changes from 2.9.2 to 2.9.3, and no other bytes change.
  - Read the file as UTF-8 bytes. With a short Python or PowerShell script, find every maximal run matching `[\u00C2\u00C3\u00E2][\u0080-\u00BF\u0152-\u2122]+`. Replace each run `r` with `r.encode('cp1252').decode('utf-8')` (Python semantics); the PowerShell equivalent is `[Text.Encoding]::UTF8.GetString([Text.Encoding]::GetEncoding(1252).GetBytes(r))`.
  - Before writing, abort if the match count is not 111, the matches do not occupy exactly 86 lines, any conversion or reverse round-trip fails, or the version and date assumptions are false. Replace exactly one `version: 2.9.2` with `version: 2.9.3`; keep `last_updated: 2026-10-15`.
  - Write UTF-8 without BOM, preserving the existing line-ending sequence byte-for-byte and the line count. No other substitution is permitted.
- [ ] **Task 2 (HOST)** - Prepend one skill history row - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when this exact row is the newest data row and occurs once:
  ```text
  | 2026-10-15 | apex-plan | `skills/apex-plan/SKILL.md` | 2.9.3 | updated | apex-plan-reencode: repair 111 double-encoded runs (Windows-1252 mis-decode) on 86 lines, including the frontmatter description | docs/changes/apex-plan-reencode.md |
  ```
- [ ] **Task 3 (HOST)** - Add one changelog bullet - files: `C:/Users/User/apex/CHANGELOG.md` - done when this exact bullet is first under `## [Unreleased]` / `### Added` and occurs once:
  ```text
  - apex-plan re-encode (2026-10-15, apex-plan-reencode, apex-plan 2.9.3): repair double-encoded punctuation (middle dots, dashes, arrows, section signs) left by an earlier Windows-1252 mis-decode.
  ```

## Wave plan
Wave 1: [task 1] | HOST: Task 2, then Task 3.

## Permissions
Coder Task 1 owns only its manifest path. HOST owns the two bookkeeping paths outside the manifest. No network or Git write operation is authorized by this spec.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-plan/SKILL.md |
| Modify (HOST Task 2) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST Task 3) | C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| Short Python or PowerShell script | Decode each matched run and write the skill file as UTF-8 without BOM. |
| Build repository Verify commands fence | Run the complete build-repository recipe. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | No staging or commits by the coder. |

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
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Skill instruction | skills/apex-plan/SKILL.md | Task 1 text repair and version bump. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends Task 2 row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds Task 3 bullet. |

## Acceptance Criteria
Tagged checks run in the build-repository root. HOST compares the result with a pre-build snapshot of the `skill-text-tidy` integration copy.

- [ ] Task 1 - No double-encoded runs remain, corrected characters remain, and metadata matches → verify: read the skill file as UTF-8 and run this check.
```powershell apex-accept
$t = Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/SKILL.md'
if ([regex]::IsMatch($t, '[\u00C2\u00C3\u00E2][\u0080-\u00BF\u0152-\u2122]+')) { throw 'double-encoded run remains' }
foreach ($code in @(0x00B7, 0x2014, 0x2192)) {
  if (-not $t.Contains([string][char]$code)) { throw "corrected character missing: $code" }
}
if (-not $t.Contains('version: 2.9.3')) { throw 'plan version' }
if ($t.Contains('version: 2.9.2')) { throw 'old plan version' }
if (-not $t.Contains('last_updated: 2026-10-15')) { throw 'plan update date' }
```
- [ ] Task 2 - HOST history bookkeeping is present → verify: read `C:/Users/User/apex/SKILL-HISTORY.md` as UTF-8 and confirm the exact Task 2 row occurs once and is the newest data row.
- [ ] Task 3 - HOST changelog bookkeeping is present → verify: read `C:/Users/User/apex/CHANGELOG.md` as UTF-8 and confirm the exact Task 3 bullet occurs once and is the first bullet under `## [Unreleased]` / `### Added`.
- [ ] Exact edit boundaries - HOST compares Task 1 output with the pre-build skill snapshot → verify: the pre-build copy has 111 regex matches on 86 lines; every changed line except the version line had at least one run before; reversing only those runs and replacing the one version literal reproduces the complete final bytes. The line count and line-ending sequence are unchanged, and the final file has no UTF-8 BOM.
- [ ] Build repository verify fence - HOST runs every command below from the build repository root → verify: this is the current `## Verify commands` fence of the build repository's AGENTS file, copied verbatim, and all commands pass.
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
- [ ] Scope - the build-repository diff touches only the one skill file → verify: in `C:/Users/User/.claude`, `git diff --name-only` lists only `skills/apex-plan/SKILL.md`; compare with a pre-build snapshot and report other pre-existing dirty paths. In `C:/Users/User/apex`, HOST changes only `SKILL-HISTORY.md` and `CHANGELOG.md`. Neither coder nor HOST reads or writes the planning state file for this check.
- [ ] Reachability - the repaired text remains in the live skill and routing description → verify: HOST reads the final frontmatter description and body as UTF-8, confirms zero run-regex matches in both, and confirms the corrected characters named in Task 1 are present in the skill.

## Progress
_(The build writes here — do not edit manually)_
