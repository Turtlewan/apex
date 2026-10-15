---
spec: critic-pack-dedupe
status: draft
autonomy_level: L2
risk: low
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Remove duplicate Critic-pack sentence from apex-plan
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Light spec to remove one redundant Critic prompt sentence from apex-plan and bump its skill version.

## Intent
- **Intent:** Keep the tiered Critic dispatch pack rule as the sole instruction for Normal, Trivial, and Big slices.
- **Invariants:** The four sentences of the retained tiered-pack paragraph and the following `Before dispatching, the host runs` paragraph remain byte-identical. Pre-existing double-encoded text elsewhere in the skill remains byte-identical.
- **Non-goals:** Changes to Critic behavior, other apex-plan sections, or planning-state files.

## Assumptions
- The live `skills/apex-plan/SKILL.md` has 435 lines, `version: 2.9.0`, and `last_updated: 2026-10-14`. → impact: Stop
- The live `## Dispatched spec review` section contains the exact sentence and retained paragraphs prescribed in Task 1. → impact: Stop

Simplicity check: one coder edit to one skill file, followed by one history row and one changelog bullet owned by HOST.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-plan/SKILL.md | modify | Task 1 sentence deletion and frontmatter bump. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 2 newest history row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 3 first Unreleased Added bullet. |

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
- [ ] **Task 1** - Deduplicate the Critic dispatch pack instruction - files: `skills/apex-plan/SKILL.md` - done when the named sentence and following blank line are deleted, the skill metadata is bumped, and all other bytes remain unchanged.
  - In `## Dispatched spec review`, delete this entire two-line sentence and the blank line after it:
    ```text
    Every Normal and Trivial Critic prompt contains the author prompt pack's adjudicated plan brief and the current full
    draft under review, so intent fidelity is reviewable.
    ```
  - The paragraph beginning `Normal and Trivial spec-mode Critic dispatches keep the full adjudicated plan brief and current full draft under review.` must directly follow the preceding paragraph. Keep that paragraph's four sentences byte-identical, including `The Big-slice Critic also receives the current full draft under review.` Keep the following `Before dispatching, the host runs` paragraph byte-identical. Change nothing else in this section or elsewhere in the file, including pre-existing double-encoded text.
  - Replace `version: 2.9.0` with `version: 2.9.1` and `last_updated: 2026-10-14` with `last_updated: 2026-10-15`. The file's line count changes from 435 to 432.
  - The absence check uses the literal `Every Normal and Trivial Critic prompt contains`.
- [ ] **Task 2 (HOST)** - Prepend one skill history row - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when the newest data row is exactly the following row and occurs once:
  ```text
  | 2026-10-15 | apex-plan | `skills/apex-plan/SKILL.md` | 2.9.1 | updated | critic-pack-dedupe: remove the Critic-pack sentence made redundant by planning-intake-v5's tiered pack rule | docs/changes/critic-pack-dedupe.md |
  ```
- [ ] **Task 3 (HOST)** - Add one changelog bullet - files: `C:/Users/User/apex/CHANGELOG.md` - done when the following exact bullet is the first under `## [Unreleased]` / `### Added` and occurs once:
  ```text
  - Critic pack dedupe (2026-10-15, critic-pack-dedupe, apex-plan 2.9.1): remove the Critic-pack sentence made redundant by planning-intake-v5's tiered pack rule.
  ```

## Wave plan
Wave 1: [1] | HOST: Task 2, then Task 3.

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
| `Get-Content -Raw -Encoding UTF8` | Check whitespace-normalized literals. |
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
| Skill instruction | skills/apex-plan/SKILL.md | Task 1 removes the sentence and bumps metadata. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends Task 2 row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds Task 3 bullet. |

## Acceptance Criteria
Tagged checks run in the build-repository root. Every checked literal is prescribed verbatim in its task body. Checks read UTF-8 and normalize whitespace before `Contains` presence or absence assertions. Untagged HOST checks own bookkeeping, byte-level edit boundaries, scope, and the full verify fence.

- [ ] Task 1 - The duplicate sentence is absent and the retained tiered rule is present → verify: whitespace-normalized UTF-8 `Contains` checks pass for the prescribed absence and presence literals.
```powershell apex-accept
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/SKILL.md') -replace '\s+', ' '); if ($t.Contains('Every Normal and Trivial Critic prompt contains')) { throw 'duplicate Critic sentence' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/SKILL.md') -replace '\s+', ' '); if (-not $t.Contains('Normal and Trivial spec-mode Critic dispatches keep the full adjudicated plan brief and current full draft under review.')) { throw 'retained tiered rule' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/SKILL.md') -replace '\s+', ' '); if (-not $t.Contains('The Big-slice Critic also receives the current full draft under review.')) { throw 'retained Big-slice sentence' }
```
- [ ] Task 1 - Skill metadata and line count match Task 1 → verify: the new literals are present, the old literals are absent, and the file has 432 lines.
```powershell apex-accept
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/SKILL.md') -replace '\s+', ' '); if (-not $t.Contains('version: 2.9.1')) { throw 'skill version' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/SKILL.md') -replace '\s+', ' '); if ($t.Contains('version: 2.9.0')) { throw 'old skill version' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/SKILL.md') -replace '\s+', ' '); if (-not $t.Contains('last_updated: 2026-10-15')) { throw 'skill update date' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/SKILL.md') -replace '\s+', ' '); if ($t.Contains('last_updated: 2026-10-14')) { throw 'old update date' }
if ((Get-Content -Encoding UTF8 -LiteralPath 'skills/apex-plan/SKILL.md').Count -ne 432) { throw 'skill line count' }
```
- [ ] Task 2 - HOST history bookkeeping is present → verify: read `C:/Users/User/apex/SKILL-HISTORY.md` as UTF-8, normalize whitespace, and use `Contains` to confirm the exact Task 2 row; confirm it occurs once and is the newest data row.
- [ ] Task 3 - HOST changelog bookkeeping is present → verify: read `C:/Users/User/apex/CHANGELOG.md` as UTF-8, normalize whitespace, and use `Contains` to confirm the exact Task 3 bullet; confirm it occurs once and is the first bullet under `## [Unreleased]` / `### Added`.
- [ ] Exact edit boundary - HOST compares the Task 1 diff with the live baseline → verify: `git diff -- skills/apex-plan/SKILL.md` in the build repository shows only the two frontmatter replacements and deletion of the two-line sentence plus its following blank line. The preceding paragraph, all four sentences of the retained paragraph, the `Before dispatching, the host runs` paragraph, and all pre-existing double-encoded text are byte-identical; the file's line count drops by exactly 3.
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
- [ ] Scope - only the three `## Files to Change` paths are written during the build → verify: before the build, HOST records `git status --porcelain -uall` and `git hash-object` for every listed on-disk path in both `C:/Users/User/.claude` and `C:/Users/User/apex`; after coder work and HOST bookkeeping, compare statuses and hashes. Every newly listed path, changed status, or changed hash must be one of the three listed paths; all other dirty paths predate the build and are named in the report. The coder diff touches only `skills/apex-plan/SKILL.md`; the two HOST diffs contain only the specified row and bullet. Do not read or write the planning state file for this comparison.
- [ ] Reachability - the tiered Critic pack instruction remains in `## Dispatched spec review` → verify: HOST reads the final skill section as UTF-8 and confirms the Task 1 absence and presence literals, the retained paragraph order, and the unchanged dispatch-hash paragraph.

## Progress
_(The build writes here — do not edit manually)_
