---
spec: codex-observability-ladder
status: draft
autonomy_level: L2
risk: low
coder_effort: medium
max_parallel_codex: 2
---

# Spec: Codex observability effort ladder
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Align the Codex observability reference's effort ladder with the live Engine retry and HOST escalation rules.

## Intent
- **Intent:** Correct the effort-ladder prose in the Codex observability reference for the first live Engine smoke run.
- **Invariants:** Only the `## Effort ladder — max / ultra` section changes; this is prose only, with no Engine, script, or behavior change.
- **Non-goals:** Other stale text, including the coder model name; ADRs; `SKILL-HISTORY.md` (HOST handles history after the build).

## Assumptions
- The live `skills/apex-code/SKILL.md` On failure rule and `skills/apex-code/references/parallel-codex.md` Failure / fallback rule still place the automatic retry limit at `xhigh` and escalation with HOST. -> impact: Stop.
- The build repo's `AGENTS.md` Verify commands fence still contains the 14 commands reproduced below. -> impact: Stop.

Simplicity check: one replacement in one reference section; no other file or phase is needed.

## Prerequisites
- Specs that must be complete first: `engine-cutover`.
- Environment: `C:/Users/User/.claude` on `master`, PowerShell, and readable `skills/apex-code/SKILL.md`, `skills/apex-code/references/parallel-codex.md`, and `AGENTS.md` in that repo.

## Files to Change
Grep evidence: a live `Select-String -SimpleMatch -Pattern 'codex-observability.md'` sweep of `C:/Users/User/.claude/skills` and `agents`, excluding `fixtures`, found 4 hits in 2 files: `skills/apex-code/SKILL.md:248` (1) and `skills/apex-code/references/parallel-codex.md:46,51,196` (3). The latter directly points to this reference. No other live skill/agent consumer appeared in that sweep.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/references/codex-observability.md | modify | Replace the effort-ladder semantics within its existing section. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/references/codex-observability.md", "op": "modify" }], "depends_on": [], "effort": "medium" }
  ]
}
```

## Tasks
- [ ] **Task 1** — In the existing `## Effort ladder — max / ultra` section, replace the `max` bullet's automatic-rung sentence and the `ultra` bullet's final-rung, automatic-fallback, and last-automatic-rung sentences with concise prose stating: "The Engine's automatic retry ladder stops at `xhigh`. Beyond `xhigh`, **HOST decides** whether to amend task effort and start a new Engine run or use the attended HOST manual path; log each escalation. Sonnet fallback, including quota-out, requires OWNER approval and is never an automatic Engine model swap." Replace the `only rung between max and Claude fallback` / `cut this rung first` sentence with a direct statement that `ultra` remains unproven against `max` pending a head-to-head eval. Retain the accepted-values sentence; `max` for the hardest single tasks; `ultra` token multiplication, double `max_parallel_codex` weight, and never-default `coder_effort`. Replace prose in place without appending a second policy or editing any other section. — files: skills/apex-code/references/codex-observability.md — done when: that section describes the live retry limit and decisions without an automatic `max`, `ultra`, or Sonnet rung.

## Wave plan
Wave 1: [Task 1].

## Permissions
The coder may edit only the listed reference, read the two live-rule files and build repo instructions, and run the checks below. No new packages.

### File Operations
| Action | Paths |
|--------|-------|
| Modify | skills/apex-code/references/codex-observability.md |
| Create/Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `Select-String` checks below | Verify required and forbidden ladder wording. |
| Build repo `AGENTS.md` Verify commands fence, reproduced below | Run all 14 structural checks. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | No git operations by the coder; HOST performs the read-only diff scope check. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No environment variable needed. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package or network operation. |

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
| Reference | skills/apex-code/references/codex-observability.md | Replace the existing effort-ladder wording. |

## Acceptance Criteria
- [ ] Task 1 - automatic rungs and fallback claims are absent from the reference, and the live limit and decision owners are present -> verify: from the build repo, run the following PowerShell checks; every check completes without throwing.

```powershell
Set-Location C:/Users/User/.claude
$path = 'skills/apex-code/references/codex-observability.md'
$body = Get-Content -Raw -LiteralPath $path
foreach ($phrase in @('medium→high→xhigh→max', 'last automatic rung', 'final** rung of the verify-fail ladder')) {
    if ($body | Select-String -SimpleMatch -Quiet -Pattern $phrase) { throw "Forbidden ladder text: $phrase" }
}
foreach ($phrase in @('automatic retry ladder stops at `xhigh`', 'HOST decides', 'Sonnet fallback, including quota-out, requires OWNER approval')) {
    if (-not ($body | Select-String -SimpleMatch -Quiet -Pattern $phrase)) { throw "Missing ladder rule: $phrase" }
}
```

- [ ] Task 1 - the target keeps the accepted effort values, `max` hardest-single-task use, and `ultra` token, concurrency, default, and pending-eval constraints -> verify: HOST inspects the same section and its diff; no hunk extends outside the section bounded by `## Effort ladder — max / ultra` and `## Progress pulses to chat`.
- [ ] Task 1 - the build repo's complete `AGENTS.md` Verify commands fence passes -> verify: run this PowerShell block from the build repo; it executes exactly 14 commands and throws on any nonzero exit.

```powershell
Set-Location C:/Users/User/.claude
$checks = @(
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
    'powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1'
)
if ($checks.Count -ne 14) { throw 'Verify fence command count changed' }
foreach ($check in $checks) {
    Invoke-Expression $check
    if ($LASTEXITCODE -ne 0) { throw "Verify failed ($LASTEXITCODE): $check" }
}
```

- [ ] Scope - only the listed reference changes in this build -> verify: HOST compares the build repo's pre-build dirty-path baseline with `git diff --name-only` after the build; this task adds no diff outside `skills/apex-code/references/codex-observability.md`, and HOST reports any unrelated pre-existing dirty paths.
- [ ] Reachability - the corrected reference remains linked from the live code skill and parallel guide -> verify: `Select-String -SimpleMatch -Pattern 'codex-observability.md'` still finds the existing pointers in `SKILL.md` and `parallel-codex.md`.

## Progress
_(The build writes here — do not edit manually)_
