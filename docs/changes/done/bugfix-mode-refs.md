---
spec: bugfix-mode-refs
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Retire Bug Fix mode references outside apex-plan SKILL.md
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Remove the retired Bug Fix mode from the session Checker row and apex-plan ADR/status procedures.

## Intent
- **Intent:** Leave Light as the applicable mode in the two named references while removing their Bug Fix wording.
- **Invariants:** The Checker row changes only its mode-list substring; the apex-plan reference retains its Light ADR rule and Deep Details / Light status procedure. Neither coder task changes `skills/apex-plan/SKILL.md`.
- **Non-goals:** Planning-intake-v4, other mode references, status bookkeeping, and any change to the underlying review or ADR rules.

## Assumptions
- The live Checker row contains `Low, doc-only, Light, and Bug Fix skip the spec-level Sol reads.` → impact: Stop
- The live apex-plan reference contains `**Light / Bug Fix modes:** note decisions inline in the spec doc. Skip formal ADRs.`, `### Bug Fix`, and `No status.md update. Bug fix docs are ephemeral — consumed and archived within the session.` → impact: Stop
- `skills/apex-plan/SKILL.md` is at version `2.8.1`; only its reference changes, so its version remains unchanged. → impact: Caution

Simplicity check: two independent one-file coder edits, followed by two HOST bookkeeping edits.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| hooks/apex-session-context.md | modify | Task 1 Checker row mode list. |
| skills/apex-plan/references/adr-and-status-procedures.md | modify | Task 2 Light ADR label and Bug Fix subsection. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 3 newest history row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 4 Unreleased Added bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "hooks/apex-session-context.md", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-plan/references/adr-and-status-procedures.md", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
- [ ] **Task 1** - Remove Bug Fix from the Checker row - files: `hooks/apex-session-context.md` - done when the row retains all other text and its skip sentence names Low, doc-only, and Light.
  - In the `| Checker |` row, replace the exact substring `Low, doc-only, Light, and Bug Fix skip the spec-level Sol reads.` with `Low, doc-only, and Light skip the spec-level Sol reads.` Change nothing else in that row or file.
- [ ] **Task 2** - Keep only Light in the ADR/status reference - files: `skills/apex-plan/references/adr-and-status-procedures.md` - done when the Light rule remains and the Bug Fix subsection is gone.
  - Replace `**Light / Bug Fix modes:** note decisions inline in the spec doc. Skip formal ADRs.` with `**Light mode:** note decisions inline in the spec doc. Skip formal ADRs.`
  - Delete the `### Bug Fix` heading and its single following line `No status.md update. Bug fix docs are ephemeral — consumed and archived within the session.` Retain the `### Deep Details / Light` status procedure verbatim; make no other edit.
- [ ] **Task 3 (HOST)** - Prepend one history row - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when the newest data row records the apex-plan reference and session-context hook with no skill version bump.
  - Prepend this exact row: `| 2026-10-14 | apex-plan (reference only; SKILL.md unchanged), apex-session-context (hook) | \`skills/apex-plan/references/adr-and-status-procedures.md\`, \`hooks/apex-session-context.md\` (Checker row) | 2.8.1 (SKILL.md unchanged) | updated | bugfix-mode-refs: remove retired Bug Fix mode from Checker routing and apex-plan ADR/status procedures; retain Light rules. | docs/changes/bugfix-mode-refs.md |`
- [ ] **Task 4 (HOST)** - Add one changelog bullet - files: `C:/Users/User/apex/CHANGELOG.md` - done when the Unreleased Added subsection has exactly one matching bullet.
  - Under `## [Unreleased]` / `### Added`, add this exact bullet: `- Bug Fix mode reference cleanup (2026-10-14, bugfix-mode-refs, apex-plan reference, session-context hook): remove the retired mode from the Checker routing row and ADR/status procedures while retaining Light rules.`

## Wave plan
Wave 1: [1, 2] | HOST: bookkeeping. This spec is file-disjoint from planning-intake-v4 and has no prerequisite edge to it.

## Permissions
Coder tasks own only their file-disjoint manifest paths. HOST owns the two bookkeeping paths outside the manifest. The session hook is a critical path and requires attended build-time confirmation. No network or Git write operation is authorized by this spec.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | hooks/apex-session-context.md |
| Modify (coder Task 2) | skills/apex-plan/references/adr-and-status-procedures.md |
| Modify (HOST Task 3) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST Task 4) | C:/Users/User/apex/CHANGELOG.md |

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
| Hook instruction | hooks/apex-session-context.md | Task 1 changes the Checker row. |
| Reference | skills/apex-plan/references/adr-and-status-procedures.md | Task 2 removes retired mode wording. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends one row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds one Unreleased Added bullet. |

## Acceptance Criteria
Tagged checks run in the build-repository root. Every checked literal is prescribed verbatim in its task body. Checks read UTF-8 and normalize whitespace before `Contains` presence or absence assertions. Run non-ASCII literals from a UTF-8 PowerShell script file. Untagged HOST checks own bookkeeping, exact edit boundaries, scope, and the full verify fence.

- [ ] Task 1 - Checker skip sentence names only the retained modes → verify: the new substring is present and the retired substring is absent; HOST confirms the rest of the row and file are unchanged.
```powershell apex-accept
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'hooks/apex-session-context.md') -replace '\s+', ' '); if (-not $t.Contains('Low, doc-only, and Light skip the spec-level Sol reads.')) { throw 'Checker mode list' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'hooks/apex-session-context.md') -replace '\s+', ' '); if ($t.Contains('Low, doc-only, Light, and Bug Fix skip the spec-level Sol reads.')) { throw 'retired Checker mode' }
```
- [ ] Task 2 - Light ADR rule remains and the Bug Fix subsection is removed → verify: the replacement label is present and all three retired literals are absent; HOST confirms the Deep Details / Light procedure and other text are unchanged.
```powershell apex-accept
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/adr-and-status-procedures.md') -replace '\s+', ' '); if (-not $t.Contains('**Light mode:** note decisions inline in the spec doc. Skip formal ADRs.')) { throw 'Light ADR rule' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/adr-and-status-procedures.md') -replace '\s+', ' '); if ($t.Contains('**Light / Bug Fix modes:** note decisions inline in the spec doc. Skip formal ADRs.')) { throw 'retired ADR label' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/adr-and-status-procedures.md') -replace '\s+', ' '); if ($t.Contains('### Bug Fix')) { throw 'retired subsection' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/adr-and-status-procedures.md') -replace '\s+', ' '); if ($t.Contains('No status.md update. Bug fix docs are ephemeral — consumed and archived within the session.')) { throw 'retired subsection body' }
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'skills/apex-plan/references/adr-and-status-procedures.md') -replace '\s+', ' '); if (-not $t.Contains('### Deep Details / Light')) { throw 'retained status procedure' }
```
- [ ] Task 3 - HOST history bookkeeping is present → verify: the newest data row is the Task 3 row and occurs once; run this untagged literal check.
```powershell
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'C:/Users/User/apex/SKILL-HISTORY.md') -replace '\s+', ' '); if (-not $t.Contains('| 2026-10-14 | apex-plan (reference only; SKILL.md unchanged), apex-session-context (hook) | `skills/apex-plan/references/adr-and-status-procedures.md`, `hooks/apex-session-context.md` (Checker row) | 2.8.1 (SKILL.md unchanged) | updated | bugfix-mode-refs: remove retired Bug Fix mode from Checker routing and apex-plan ADR/status procedures; retain Light rules. | docs/changes/bugfix-mode-refs.md |')) { throw 'history row' }
```
- [ ] Task 4 - HOST changelog bookkeeping is present → verify: the Task 4 bullet occurs exactly once under `## [Unreleased]` / `### Added`; run this untagged literal check.
```powershell
$t = ((Get-Content -Raw -Encoding UTF8 -LiteralPath 'C:/Users/User/apex/CHANGELOG.md') -replace '\s+', ' '); if (-not $t.Contains('- Bug Fix mode reference cleanup (2026-10-14, bugfix-mode-refs, apex-plan reference, session-context hook): remove the retired mode from the Checker routing row and ADR/status procedures while retaining Light rules.')) { throw 'changelog bullet' }
```
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
- [ ] Scope - only the four `## Files to Change` paths are written during the build → verify: before the build, HOST records `git status --porcelain -uall` and `git hash-object` for every listed on-disk path in both `C:/Users/User/.claude` and `C:/Users/User/apex`; after coder work and HOST bookkeeping, compare statuses and hashes. Every newly listed path, changed status, or changed hash must be one of the four listed paths; all other dirty paths predate the build and are named in the report. The two coder diffs contain only the Task 1 replacement and Task 2 replacement/deletion; the two HOST diffs contain only the specified row and bullet. Do not read or write the planning state file for this comparison.
- [ ] Reachability - the Checker and ADR/status instructions expose only Light → verify: HOST reads the final Checker row and ADR/status reference as UTF-8, confirms the retired mode literals are absent, the Light rule and `### Deep Details / Light` procedure remain, and the parent skill file has no diff.

## Progress
_(The build writes here — do not edit manually)_
