---
spec: round8-d4-test-debt
status: draft
autonomy_level: L2
coder_effort: medium
cross_model_review: false
risk: medium
---

# Spec: realign pre-existing dispatch-test fixtures to the wrapper's real contract

**Identity:** Fix the two failing dispatch fixture suites so they satisfy the wrapper's real authorization + pre-flight contract — never the reverse; the dispatcher and scope-check scripts are read-only here.
→ why: see docs/technical/adr/ADR-044-round8-deferred-designs.md (D4).

**All paths below are relative to the build worktree root; the host supplies the worktree (an isolated copy). Verify commands run from that root.**

## Intent
- **Intent:** the two failing fixtures dispatch workspace-write builds without a non-empty scope and without a baseline escape, so they hit the empty-scope refusal and then the AGENTS.md-absent baseline pre-flight; arm both escapes so the suites go green against the current wrapper.
- **Invariants:** zero diff on `codex-dispatch.ps1` and `codex-scope-check.ps1`; both target suites green against the CURRENT wrapper; every suite run uses a fresh scratch `APEX_STATE_DIR`.
- **Non-goals:** no wrapper behavior change; no relaxing of the empty-scope refusal or the baseline pre-flight; `dispatch-test.ps1` is NOT touched (already green — it resolves via `$PSScriptRoot` and sets `APEX_STATE_DIR` in the live file). No canary suites are run (see the debt note below).

## Assumptions
- The failing dispatches clear a non-empty scope via a real `-Authorized` (NOT via `-SkipScopeCheck`, which `codex-dispatch.ps1:805-807` does not inspect for the empty-scope refusal), then hit the baseline pre-flight (line 895) which exits 72 because the throwaway repos lack AGENTS.md (`apex-baseline-check.ps1:255-258`) → impact: Stop (confirmed round-8 W3 + host run).
- A single non-critical placeholder token in `-Authorized` satisfies the non-empty-scope contract (the fake codex writes nothing into the repo) → impact: Stop.
- `-SkipBaselineCheck` bypasses the AGENTS.md-absent pre-flight refusal → impact: Stop.

Simplicity check: yes — the simplest change (relax the wrapper's refusals) is rejected outright: the refusals are correct, the fixtures are stale (ADR-044 D4). Fixing fixtures is the correct-direction fix.

## Prerequisites
- Specs complete first: none (file-disjoint from A1/A2/A3).
- Environment: none.

## HARD RULES
- `codex-dispatch.ps1` and `codex-scope-check.ps1` are **READ-ONLY**. Any diff on either wrapper file fails acceptance.
- Every suite invocation creates and uses a FRESH scratch `APEX_STATE_DIR` subdirectory (never the live LOCALAPPDATA ledger).
- The canaries `review-findings-test.ps1` and `careless-coder-test.ps1` are NOT run by this spec. `review-findings-test.ps1` (≈14-15) resolves the LIVE LOCALAPPDATA ledger ignoring `APEX_STATE_DIR` and rewrites it without the dispatch mutex, so running it risks live-ledger corruption for zero coverage of the target files. Its state-dir hardcode is recorded here as further test debt for the host to catalogue.

## Build isolation
This spec edits only test fixtures, but they exercise `codex-dispatch.ps1`, which the live harness runs. The build runs in an ISOLATED WORKTREE copy with all suite runs pointed at a fresh scratch `APEX_STATE_DIR`; the host integrates the diff and re-runs the suites on the live tree post-integration, with no gates open during integration.

## Files to Change
_All paths relative to the build worktree root._
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/dispatch-deadlock-test.ps1 | modify | arm each workspace-write build dispatch with a non-empty `-Authorized` + `-SkipBaselineCheck` |
| skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1 | modify | arm the workspace-write build dispatch with a non-empty `-Authorized` + `-SkipBaselineCheck` |

## Tasks
- [ ] **Task 1:** Pre-edit capture. BEFORE any edit, run both TARGET suites (`dispatch-deadlock-test.ps1`, `dispatch-encoding-utf8-test.ps1`), each with a fresh scratch `APEX_STATE_DIR`; record each suite's exit code and any failing test names in the DISPATCH TASK REPORT (the builder's final report — the builder cannot write this spec's Progress section). This is the was-3-fail / was-1-fail baseline. — files: skills/apex-code/scripts/dispatch-deadlock-test.ps1, skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1 — done when: both target suites' pre-edit exit codes and failure names are in the task report.
- [ ] **Task 2:** Arm each workspace-write build dispatch in both suites with BOTH (a) a non-empty `-Authorized @('src/a.py')`-style array — a single non-critical placeholder token suffices, the fake codex writes nothing — using PowerShell array syntax (`@('a','b')`), NOT space-separated tokens; AND (b) `-SkipBaselineCheck`, so the AGENTS.md-absent baseline pre-flight does not refuse. Any existing `-SkipScopeCheck` flags are inert once `-Authorized` is non-empty — leave them in place (harmless). — files: skills/apex-code/scripts/dispatch-deadlock-test.ps1, skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1 — done when: no dispatch hits the empty-scope refusal or the baseline pre-flight refusal.
- [ ] **Task 3:** Verify. Re-run both target suites, each with a fresh scratch `APEX_STATE_DIR`. Run the deadlock suite 3× — each run in its own fresh scratch `APEX_STATE_DIR`, wrapped in `Measure-Command`, echoing elapsed seconds and exit code. Confirm the zero-wrapper-diff check prints nothing. — files: skills/apex-code/scripts/dispatch-deadlock-test.ps1, skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1 — done when: both targets exit 0; all three deadlock runs are <45s elapsed and exit 0 (echoed); the wrapper diff is empty.

## Wave plan
Wave 1: [Task 1] | Wave 2: [Task 2] | Wave 3: [Task 3]
<!-- Strictly sequential: capture BEFORE edit (Task 1), edit (Task 2), verify AFTER edit (Task 3). -->

## Permissions

The following actions run autonomously during build, in the isolated worktree (see ## Build isolation).
The host assembles any `-Authorized` grants as repo-relative tokens matching the Files-to-Change list.
Approving this spec approves all of them.

### File Operations
_Worktree-root-relative._
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | skills/apex-code/scripts/dispatch-deadlock-test.ps1 |
| Modify | skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1 |
| Delete | (none) |

### Git Operations
The builder stages/commits NOTHING; the host commits after verification. The zero-wrapper-diff check is a read-only `git diff`. The suites themselves `git init`/`config`/`add`/`commit` throwaway TEMP repos as part of their operation — suite-internal, distinct from repo git operations.

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR` | fresh scratch ledger dir per suite run (including each of the 3 deadlock runs) |
| `TEMP` | throwaway fixture repos and scratch state dirs the suites create and delete |
| `LOCALAPPDATA` | the live ledger location the suites must NOT write — isolated away via `APEX_STATE_DIR` |
| `UTF8_MARKER` | encoding-utf8 suite fixture marker |
| `FAKE_CODEX_*` | fake-codex behavior controls the suites set for their throwaway dispatches |

### Temp files
The suites create and delete throwaway git repos, fixture files, and fresh scratch ledgers under `TEMP` / `APEX_STATE_DIR`.

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation |

### Verify commands
Run from the build worktree root; a FRESH scratch `APEX_STATE_DIR` before EACH suite run:

```
function New-ScratchState { $env:APEX_STATE_DIR = (New-Item -ItemType Directory -Path (Join-Path $env:TEMP ("apex-d4-state-" + [guid]::NewGuid()))).FullName }
New-ScratchState; powershell.exe -NoProfile -File .\skills\apex-code\scripts\dispatch-encoding-utf8-test.ps1
1..3 | ForEach-Object { New-ScratchState; $m = Measure-Command { powershell.exe -NoProfile -File .\skills\apex-code\scripts\dispatch-deadlock-test.ps1 }; "deadlock run $_ : $([int]$m.TotalSeconds)s exit=$LASTEXITCODE" }
# Zero-wrapper-diff check (must print nothing — covers staged + unstaged; builder does no git ops):
git -C . diff HEAD --stat -- skills/apex-code/scripts/codex-dispatch.ps1 skills/apex-code/scripts/codex-scope-check.ps1
# Mandatory repo verify recipe — worktree AGENTS.md ## Verify commands:
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File .\skills\apex-code\scripts\baseline-check-test.ps1
powershell.exe -NoProfile -File .\skills\apex-code\scripts\spec-validate-test.ps1
powershell.exe -NoProfile -File .\skills\apex-code\scripts\dispatch-preflight-test.ps1
```

## Specialist Context
### Security
(none new — fixtures only; the wrapper's authorization + pre-flight contract is unchanged and read-only. Fresh-per-run `APEX_STATE_DIR` plus not running the mutex-less canary keeps the live ledger untouched.)

### Performance
Arming scope (non-empty `-Authorized`) adds subprocess overhead inside the deadlock suite's 60s Wait-Job window. Margin defined and measured: 3 consecutive runs each <45s elapsed (echoed via `Measure-Command`) and exit 0 (Task 3).

### Accessibility
(none — no frontend surface)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-044-round8-deferred-designs.md | Reference (D4, already written) |

## Host verification
Authoritative acceptance gate (builder green is necessary, not sufficient). The host integrates the worktree diff into the live tree with NO gates open and re-runs the full suites on the live tree. The host also catalogues the recorded `review-findings-test.ps1` state-dir hardcode as further test debt.

## Acceptance Criteria
- [ ] Pre-edit capture reported (Task 1) → verify: the dispatch task report holds both target suites' pre-edit exit codes and failure names, each run against a fresh scratch `APEX_STATE_DIR`.
- [ ] Fixtures armed and green (Task 2) → verify: the deadlock suite has 0 failing (was 3) and the encoding-utf8 suite has 0 failing (was 1); no dispatch hits the empty-scope refusal or the baseline pre-flight refusal.
- [ ] Zero wrapper diff (Task 3) → verify: the read-only `git diff HEAD --stat` over the two wrapper scripts prints nothing.
- [ ] Timed margin (Task 3) → verify: the three `Measure-Command`-wrapped deadlock runs each echo <45s elapsed and exit 0.

## Progress
_(Coding mode writes here — do not edit manually)_
