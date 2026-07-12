---
spec: afk-durable-dispatcher
status: ready
token_profile: balanced
autonomy_level: L2
coder_effort: high
---

# Spec: One durable codex dispatcher (A4)

**Identity:** A single `codex-dispatch` wrapper (stdin-closed, run ledger, no-output watchdog, idempotent resume/adopt) replacing ad-hoc `codex exec` launches, so an unattended run survives crashes and stdin-wedges.
→ why: see docs/technical/adr/ADR-033 (A4) + docs/findings/artemis-run-retro-cadence-gaps-2026-07-12.md § A4

## Intent
- **Intent:** Make every AFK codex dispatch go through one wrapper that closes stdin, records the run to a durable ledger, watchdogs a no-output stall, and can resume/adopt an orphaned run after a session crash.
- **Invariants:** (1) The wrapper ALWAYS closes stdin (the 40-min stdin-wedge must be impossible). (2) Every dispatch appends a ledger row {pid, worktree, spec, task, base_sha, phase, started, log_path, status} to `docs/progress/codex-run-ledger.jsonl` and updates its status on exit. (3) A bounded no-output interval (default 8 min, configurable) with no new log bytes → the wrapper flags the run stalled (and, for background dispatches, is killable via the ledger). (4) `adopt` given a spec+phase finds the newest ledger row for it and returns its worktree diff for hand-integration.
- **Non-goals:** the permission gate (spec `afk-permission-mode`), the end-of-run Sol pass (`afk-sol-endgate`), the cadence lenses (`cadence-regression-lenses`). Does not change parallelism policy (ADR-028/029).

## Assumptions
- apex-code dispatches codex via `codex exec ... --json` to a tailable log (references/codex-observability.md). → impact: Caution (wrapper wraps that exact call; verify the current invocation before wiring).
- `docs/progress/` exists and is the progress-log home. → impact: Low.
- PowerShell can launch codex with stdin closed (`Start-Process -RedirectStandardInput $null` or piping `$null`). → impact: Stop (the wrapper's core; verify on the host).

Simplicity check: considered per-dispatch inline stdin/ledger handling in apex-code prose — rejected: prose compliance already failed live (the stdin-wedge "bit again despite being a known memory"); a wrapper script is the technical control.

## Prerequisites
- `afk-permission-mode` (owns the shared triple-write file `SKILL-HISTORY.md`; append after it). Shares `apex-code/SKILL.md` with `afk-sol-endgate` + `cadence-regression-lenses` → those two list THIS spec first; build order: afk-permission-mode → afk-durable-dispatcher → afk-sol-endgate → cadence-regression-lenses.

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1` | create | The wrapper: stdin-closed launch + ledger + watchdog + `-Adopt` mode |
| `C:\Users\User\.claude\skills\apex-code\SKILL.md` | modify | Point AFK codex dispatch at the wrapper (in the dispatch/observability pointer) |
| `C:\Users\User\.claude\skills\apex-code\references\codex-observability.md` | modify | Document the wrapper: ledger schema, watchdog, adopt/resume |
| `C:\Users\User\apex\SKILL-HISTORY.md` | modify | Prepend `updated (SKILL)` row |

## Tasks
- [x] Task 1: Write the wrapper — files: `codex-dispatch.ps1` (create) — params: `-Spec -Task -Worktree -BaseSha -Phase -Effort -NoOutputTimeoutMin(8) -Adopt`. Normal mode: append a ledger row (status `running`) to `docs/progress/codex-run-ledger.jsonl`; launch `codex exec ... --json` with **stdin closed**, `--json` → `docs/progress/codex-<spec>-<task>.log`; poll the log's last-write time — if no growth for `NoOutputTimeoutMin` → mark ledger row `stalled` and return non-zero (killing/flagging per caller); on exit → update the row's `status` + `ended`. `-Adopt` mode: read the ledger, find the newest row matching `-Spec -Phase`, print its `worktree` + `git -C <worktree> diff <base_sha>..HEAD`. done when: a dispatch with a fast codex command writes a `running`→`done` ledger row + a log; an artificially stalled command flips the row to `stalled` within the timeout; `-Adopt` on a completed row prints the worktree diff.
- [x] Task 2: Wire apex-code to the wrapper — files: `apex-code/SKILL.md` (modify the codex-dispatch pointer to call `scripts/codex-dispatch.ps1` for AFK builds), `apex-code/references/codex-observability.md` (modify: add the ledger schema + watchdog + adopt/resume subsection) — done when: SKILL.md's AFK dispatch line references the wrapper and the reference documents the four invariants; apex-code/SKILL.md stays ≤500 lines.
- [x] Task 3: History — files: `SKILL-HISTORY.md` (prepend: today | apex-code | scripts/codex-dispatch.ps1 + SKILL.md + references/codex-observability.md | {bump} | updated (SKILL) | durable codex dispatcher — stdin-closed + ledger + watchdog + adopt (A4) | ADR-033) — done when: row present.

## Wave plan
Wave 1: [Task 1] | Wave 2: [Task 2] | Wave 3: [Task 3]

## Permissions
### File Operations
| Action | Paths |
|--------|-------|
| Create | `...\apex-code\scripts\codex-dispatch.ps1`, `docs\progress\codex-run-ledger.jsonl` (runtime) |
| Modify | `...\apex-code\SKILL.md`, `...\apex-code\references\codex-observability.md`, `SKILL-HISTORY.md` |

### Commands
| Command | Purpose |
|---------|---------|
| `codex exec ... --json` (via the wrapper, fast test command) | verify launch + ledger + log |
| `git -C <worktree> diff` | adopt-mode test |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | the files by name (`~/.claude` via `git add -f`) |
| `git commit` | "feat: durable codex dispatcher — ledger + watchdog + adopt (A4, ADR-033)" |

### Network
| Action | Purpose |
|--------|---------|
| (none) | codex uses existing auth; no installs |

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Reference | apex-code/references/codex-observability.md | wrapper subsection |
| History | SKILL-HISTORY.md | row |

## Acceptance Criteria
- [x] Wrapper runs + ledgers → verify: dispatching a trivial codex command via `codex-dispatch.ps1` writes a `running` row that becomes `done`, plus a `--json` log under docs/progress/. (Host-verified directly with a real codex round-trip, superseding Codex's own inconclusive self-test — see Progress notes: nested Codex-launching-Codex hit a 401 auth artifact specific to its own sandboxed subprocess, not a wrapper bug.)
- [x] Stdin closed → verify: the wrapper launches codex with no inherited stdin (a command that would read stdin does not hang past the no-output timeout).
- [x] Watchdog fires → verify: a command that emits nothing flips its ledger row to `stalled` within `NoOutputTimeoutMin`.
- [x] Adopt works → verify: `codex-dispatch.ps1 -Adopt -Spec X -Phase Y` on a completed run prints the worktree path + its base..HEAD diff.
- [x] apex-code wired + within cap → verify: `grep codex-dispatch apex-code/SKILL.md` matches and `wc -l apex-code/SKILL.md` ≤ 500 (exactly 500 — net-neutral in-line edit, no new lines added).

## Progress
_(Coding mode writes here — do not edit manually)_
