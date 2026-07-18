---
spec: round8-b3-suite-isolation
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
---

# Spec: isolate four test suites from the live LOCALAPPDATA run-ledger

**Identity:** Four suites currently read/write the live LOCALAPPDATA `codex-run-ledger.jsonl`; point each at a fresh scratch `APEX_STATE_DIR` so a test run never mutates live session state.
→ why: see docs/technical/adr/ADR-044-round8-deferred-designs.md (D4 "further test debt for the host to catalogue"; the four-suite isolation).

## Intent
- **Intent:** Every one of the four suites runs against an isolated scratch state root, leaving the live LOCALAPPDATA ledger byte-identical before and after.
- **Invariants:** Each suite still exits 0. The live ledger's hash is unchanged across each suite run. Every direct `$ledger` path derives from the scratch root, not LOCALAPPDATA. The env var is restored in `finally`.
- **Non-goals:** No change to the dispatcher, the ledger format, or any assertion's intent; no cross-suite shared state.

## Assumptions
- The dispatcher resolves state dir as `APEX_STATE_DIR → LOCALAPPDATA\apex → TEMP\apex` (codex-dispatch.ps1 ≈162-164) and writes the ledger at `<root>\progress\codex-run-ledger.jsonl` (≈189-190) → impact: Stop
- `review-findings-test.ps1` self-seeds and cleans in `finally` and needs NO pre-seeded live rows, so a scratch dir is safe (≈104/117-118/135/142-143 are its own seeds) → impact: Stop
- `dispatch-test.ps1` ≈19-25 (fresh `$stateRoot` under TEMP, save old `APEX_STATE_DIR`, set it) and ≈99-102 (restore in `finally`) is the clean pattern to copy → impact: Caution

Simplicity check: considered mutexing the live-ledger writers instead — rejected; isolation to a scratch dir removes live-state coupling entirely rather than serializing access to it. This version isolates.

## Prerequisites
- Specs complete first: none — this is the FIRST spec in the b3 → b1 → b2 build order.
- Sequencing note: `round8-b1-specsource` later edits three of these same suites (`review-findings-test.ps1`, `verdict-test.ps1`, `careless-coder-test.ps1`) to arm build-dispatching fixtures; b1 carries THIS spec as its prerequisite, so it builds strictly after and against the post-isolation suite bodies. This spec is NOT file-disjoint from b1 — it owns these files first.
- Environment setup required: none. Isolated worktree copy of `~/.claude` (isolation contract X1–X4).

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/review-findings-test.ps1 | modify | Resolve state dir from a scratch `APEX_STATE_DIR`, not LOCALAPPDATA (≈14-15); derive `$ledger` from it (≈104/117-118/135/142-143). |
| skills/apex-code/scripts/sibling-guard-test.ps1 | modify | Scratch-dir the direct live-ledger writes (≈20/57/79-80). |
| skills/apex-code/scripts/verdict-test.ps1 | modify | Set `APEX_STATE_DIR` before the dispatcher invocation (≈42). |
| skills/apex-code/scripts/careless-coder-test.ps1 | modify | Set `APEX_STATE_DIR` before the dispatcher invocations (≈100/120). |

## Tasks
_(Same mechanism each, mirroring `dispatch-test.ps1`'s REAL structure — the top-level `try` opens at ≈23 and the scratch-dir creation + env-var set happen INSIDE it at ≈24-25; restore + scratch cleanup in the `finally` at ≈99-106:_
- _SAVE the prior `APEX_STATE_DIR` value into a local (e.g. `$oldApexStateDir`) BEFORE the top-level `try`._
- _As the FIRST statements INSIDE the top-level `try`: create the scratch root under TEMP; **create `<scratch root>\progress` and seed a ZERO-LENGTH `codex-run-ledger.jsonl` inside it**; then set `$env:APEX_STATE_DIR` to the scratch root. Seeding the empty ledger before any suite code runs is required for TWO reasons: **(a)** `review-findings-test` ≈104 and `sibling-guard-test` ≈57 call `Add-Content` on the ledger BEFORE any dispatcher invocation, so the `progress` directory must already exist; **(b)** `codex-dispatch.ps1` ≈192-197 (landmark: "Carry the existing ledger over once") copies the dispatcher root's legacy `docs\progress\codex-run-ledger.jsonl` into the scratch dir whenever the scratch ledger is ABSENT — seeding an empty file blocks that migration so each suite starts from genuinely empty state._
- _Derive every direct `$ledger`/state path from the scratch root at `<root>\progress\codex-run-ledger.jsonl`._
- _In the top-level `finally`: RESTORE the env var — to the saved value, or `Remove-Item Env:\APEX_STATE_DIR` if it was unset — AND best-effort delete the scratch root (`Remove-Item -Recurse -Force -ErrorAction SilentlyContinue`, mirroring dispatch-test ≈104-106). Because setup lives inside the `try`, a setup failure still runs the `finally`._
- _Each suite's ENTIRE body is wrapped in exactly ONE top-level `try`/`finally`. Keep any existing per-case `try`/`finally` blocks unchanged — the top-level pair wraps around them.)_

- [ ] **Task 1:** In `skills/apex-code/scripts/review-findings-test.ps1`, replace the LOCALAPPDATA-only state resolution at ≈14-15 with a fresh scratch `APEX_STATE_DIR` (landmark: the `$env:LOCALAPPDATA` state-dir resolution ≈14-15). Derive `$ledger` from the scratch root; the direct writes at ≈104, ≈117-118, ≈135, ≈142-143 (Add-Content seeds + ReadAllLines/WriteAllLines rewrites) all target the scratch ledger. The dispatcher-invoking cases at ≈156/171/174/207 then hit the scratch ledger via the env var. This suite currently has only per-case `try`/`finally`; ADD one top-level `try`/`finally` wrapping the whole body, saving/restoring `APEX_STATE_DIR` there. files: skills/apex-code/scripts/review-findings-test.ps1 — done when: suite exits 0; no path resolves to LOCALAPPDATA; after the suite exits, the invoking shell's `APEX_STATE_DIR` equals its pre-run value; the top-level `finally` best-effort deletes the scratch root.
- [ ] **Task 2:** In `skills/apex-code/scripts/sibling-guard-test.ps1`, same mechanism — scratch `APEX_STATE_DIR`, derive the direct live-ledger writes at ≈20, ≈57, ≈79-80 from the scratch root. This suite has only per-case `try`/`finally` AND post-`finally` code at ≈85-89 that currently runs OUTSIDE any protection; the new top-level `try`/`finally` must ENCLOSE that trailing code too, so restoration always runs. files: skills/apex-code/scripts/sibling-guard-test.ps1 — done when: suite exits 0; its ledger writes land under the scratch root; the ≈85-89 trailing code is inside the top-level `try`; after the suite exits, the invoking shell's `APEX_STATE_DIR` equals its pre-run value; the top-level `finally` best-effort deletes the scratch root.
- [ ] **Task 3:** In `skills/apex-code/scripts/verdict-test.ps1`, TWO changes. (isolation) Set a fresh scratch `APEX_STATE_DIR` before the dispatcher invocation at ≈42 so mutex-guarded test rows land in the scratch ledger, not the live one. This suite currently has ZERO `try`/`finally`; ADD one top-level `try`/`finally` wrapping the whole body, saving/restoring `APEX_STATE_DIR`. (verdict-74 repair, D4 pattern) The four build dispatches in the ≈42 loop currently refuse at the empty-scope gate (`codex-dispatch.ps1:805-807`) BEFORE reaching verdict routing — **pre-edit baseline: all four at exit 74**. Give each the D4 arming: a non-empty `-Authorized @('src/a.py')` (the shared fake codex writes `src/a.py` under `FAKE_CODEX_REPO`, so the authorized set matches its write) AND `-SkipBaselineCheck` (the throwaway fixture repos have no AGENTS.md; skipping the baseline pre-flight is coverage-appropriate — this suite tests verdict routing, not pre-flight). Any existing `-SkipScopeCheck` is inert once `-Authorized` is non-empty; leave it. files: skills/apex-code/scripts/verdict-test.ps1 — done when: suite exits 0; the four cases are restored to their expected exits 0/67/68/67 (was 4×74); the dispatcher writes under the scratch root; after the suite exits, the invoking shell's `APEX_STATE_DIR` equals its pre-run value; the top-level `finally` best-effort deletes the scratch root.
- [ ] **Task 4:** In `skills/apex-code/scripts/careless-coder-test.ps1`, set a fresh scratch `APEX_STATE_DIR` before the dispatcher invocations at ≈100 and ≈120. This suite currently has ZERO `try`/`finally`; ADD one top-level `try`/`finally` wrapping the whole body, saving/restoring `APEX_STATE_DIR`. files: skills/apex-code/scripts/careless-coder-test.ps1 — done when: suite exits 0; the dispatcher writes under the scratch root; after the suite exits, the invoking shell's `APEX_STATE_DIR` equals its pre-run value; the top-level `finally` best-effort deletes the scratch root.

## Wave plan
Wave 1: [Task 1, Task 2, Task 3, Task 4]
<!-- All four tasks edit disjoint files and share no state; one wave. -->

## Permissions

The following actions will run autonomously during build.
Approving this spec approves all of them.

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | skills/apex-code/scripts/review-findings-test.ps1, skills/apex-code/scripts/sibling-guard-test.ps1, skills/apex-code/scripts/verdict-test.ps1, skills/apex-code/scripts/careless-coder-test.ps1 |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell -NoProfile -File .\skills\apex-code\scripts\review-findings-test.ps1` | Target suite (X2). |
| `powershell -NoProfile -File .\skills\apex-code\scripts\sibling-guard-test.ps1` | Target suite (X2). |
| `powershell -NoProfile -File .\skills\apex-code\scripts\verdict-test.ps1` | Target suite (X2). |
| `powershell -NoProfile -File .\skills\apex-code\scripts\careless-coder-test.ps1` | Target suite (X2). |

### Verify commands
Run from the build worktree root — the repo verify contract (worktree AGENTS.md `## Verify commands`), plus the four target suites above:

```
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File .\skills\apex-code\scripts\baseline-check-test.ps1
powershell.exe -NoProfile -File .\skills\apex-code\scripts\spec-validate-test.ps1
powershell.exe -NoProfile -File .\skills\apex-code\scripts\dispatch-preflight-test.ps1
```

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | The builder performs no git operations; the host integrates the worktree diff and commits (X3). |

_Host integration-commit message: `test(dispatch): isolate four suites to scratch APEX_STATE_DIR, off the live run-ledger (ADR-044 D4 debt)`._

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR` | Test isolation — each suite sets its own fresh scratch root. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation. |

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
| Inline | (each suite) | Comment the scratch-root isolation (why: off the live ledger). |
| ADR | docs/technical/adr/ADR-044-round8-deferred-designs.md | D4 records this debt — no new ADR. |

## Acceptance Criteria
- [ ] **Task 1**, **Task 2**, **Task 3**, **Task 4** → verify: each of the four suites, run from the worktree root, exits 0.
- [ ] **Live-ledger byte-identity** → verify: for each suite, capture the live ledger hash before and after the run and confirm it is unchanged. Exact PowerShell (shown for one suite; run identically for each of the four; `$live` points at the live ledger):
      ```powershell
      $live = Join-Path $env:LOCALAPPDATA 'apex\progress\codex-run-ledger.jsonl'
      $before = if (Test-Path $live) { (Get-FileHash $live -Algorithm SHA256).Hash } else { '<absent>' }
      powershell -NoProfile -File .\skills\apex-code\scripts\review-findings-test.ps1   # repeat for sibling-guard-test.ps1, verdict-test.ps1, careless-coder-test.ps1
      $after = if (Test-Path $live) { (Get-FileHash $live -Algorithm SHA256).Hash } else { '<absent>' }
      if ($before -ne $after) { throw "LIVE LEDGER MUTATED: $before -> $after" }
      ```
      done when: `$before -eq $after` for all four suites (an absent-before/absent-after pair also passes).
- [ ] **Task 1**, **Task 2**, **Task 3**, **Task 4** restoration (structural) → verify: for each of the four suites, `Select-String` proves exactly ONE top-level `try` with a matching `finally` that contains the `APEX_STATE_DIR` restore-or-remove AND the scratch-root best-effort delete. Stated limit: parent-shell preservation under the normal child-process (`powershell -File`) invocation is trivially true; the `finally` exists to protect the suite's own post-setup code and any future in-process consumer. No dot-source probe harness is built — a dot-sourced suite ending in `exit` would kill the probing shell, so the behavioral probe is not reliably constructible; the structural check is the contract.
- [ ] **No LOCALAPPDATA resolution remains (all four suites)** → verify: `Select-String 'LOCALAPPDATA' <suite>` returns nothing for EACH of `review-findings-test.ps1`, `sibling-guard-test.ps1`, `verdict-test.ps1`, `careless-coder-test.ps1` — a transient live-ledger write is then structurally impossible in any suite (the byte-identity hash check above stays as belt-and-braces).

## Host verification
Host integrates the worktree diff into live `~/.claude` with NO gates open (X3), then on the live tree runs all four suites AND the byte-identity check above against the real live ledger — all exit 0, live ledger hash unchanged across every run. Host verification is the authoritative acceptance gate.

## Progress
_(Coding mode writes here — do not edit manually)_
