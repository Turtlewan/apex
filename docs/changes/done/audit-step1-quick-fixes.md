---
spec: audit-step1-quick-fixes
status: ready
autonomy_level: L2
---

# Spec: Audit step 1 — one-line / one-matcher quick fixes

**Identity:** Mechanises five low-risk enforcement/pointer fixes from the APEX v2 joint audit — wave-reviewer tool restriction, PowerShell coverage for the destructive-command guard, arming the scope snapshot's `-Authorized`, unwiring a dead hook, and four+ pointer-rot repairs.
→ why: see `docs/research/apex-v2-joint-audit-2026-07-15.md` (findings #2, #1, #6, #13, #11). Do not restate rationale in this spec.

## Intent
- **Intent:** Close the audit's "execution order step 1" batch — the fixes that are one line, one matcher, or a pointer repair, with no design decisions left open.
- **Invariants:**
  - The destructive-command hard-block fires identically for `tool_name: "PowerShell"` payloads as for `"Bash"` (same never-list, same git checks).
  - `apex-wave-reviewer` can no longer edit the tree it judges (read-only tools only).
  - The scope-snapshot call carries the authorized-file list.
  - No hook remains wired whose only body is a dead `deepseek`-gated no-op.
  - Named cross-file pointers resolve to real targets or are removed.
- **Non-goals:**
  - Do NOT make `-Authorized` mandatory anywhere (audit #6's fail-closed half is a separate future BLOCK).
  - Do NOT touch critical-file confirmation (#3), the readiness validator (#4), M2b (#5), the cross-family ledger (#7), cap-guard (#8), tree-pin multi-root (#9), or any FLAG-wave content cut (#12, #14–16).
  - Do NOT rewrite the existing git token-based destructive checks — verify they already fire on PowerShell payloads; only add PowerShell-cmdlet coverage.

## Assumptions
- `settings.json` PreToolUse `codex-dispatch-guard` entry already uses matcher `"Bash|PowerShell"` (line ~78) — mirror its form for the destructive-command-guard entry. → impact: Low
- `codex-scope-check.ps1` already accepts `-Authorized` in `-Snapshot` mode (its pre-authorized-dirty hazard detection, ~lines 345–375). → impact: Caution (if it does not, Task 3's verify fails — Stop and report).
- `coding-git-status.ps1` is git-tracked, so `git rm` is recoverable. → impact: Low
- Three Task-3 harness suites (`scope-check-test.ps1`, `snapshot-scale-test.ps1`, `dispatch-test.ps1`) are runnable standalone from `skills/apex-code/scripts/` via Windows PowerShell 5.1; `dispatch-test-fakecodex.ps1` is a driven helper (needs `FAKE_CODEX_REPO` + dispatcher stdin, exits 1 standalone) exercised via `dispatch-test.ps1`, not run directly. → impact: Caution (read each header before running).

Simplicity check: yes — a single serial-per-file batch. Why this version: all five are independent audit items with distinct owners; bundling them into one attended batch amortises the critical-file confirmation and keeps `settings.json` writes serialised (Tasks 2 and 4).

## Prerequisites
- Specs that must be complete first: none.
- Environment setup required: `node` on PATH (drives the destructive-guard test), PowerShell (drives the harness tests), `python` (drives `destructive-guard-test.py`).

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\agents\apex-wave-reviewer.md` | modify | Task 1 — add `tools:` line to frontmatter |
| `C:\Users\User\.claude\settings.json` | modify | Task 2 (matcher) + Task 4 (delete UserPromptSubmit block) — SHARED, serialised |
| `C:\Users\User\.claude\hooks\destructive-command-guard.js` | modify | Task 2 — accept `PowerShell` tool name |
| `C:\Users\User\.claude\hooks\lib\destructive-detect.js` | modify | Task 2 — PowerShell-syntax destruction detection |
| `C:\Users\User\.claude\hooks\destructive-guard-test.py` | modify | Task 2 — add PowerShell cases + regression run |
| `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1` | modify | Task 3 — append `-Authorized $Authorized` to snapshot call |
| `C:\Users\User\.claude\skills\apex-code\scripts\codex-scope-check.ps1` | run only — not modified | Task 3 — receiving script; verify it accepts `-Authorized` in `-Snapshot` |
| `C:\Users\User\.claude\skills\apex-code\scripts\scope-check-test.ps1` | run only — not modified | Task 3 verify |
| `C:\Users\User\.claude\skills\apex-code\scripts\snapshot-scale-test.ps1` | run only — not modified | Task 3 verify |
| `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test.ps1` | run only — not modified | Task 3 verify (real suite) |
| `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test-fakecodex.ps1` | run only — not modified | Task 3 — helper, exercised via `dispatch-test.ps1` (not run standalone) |
| `C:\Users\User\.claude\hooks\coding-git-status.ps1` | delete | Task 4 — `git rm` (git-tracked) |
| `C:\users\user\apex\SKILLS.md` | modify | Task 5A (tree: `~/apex`) — four pointer rots |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | Task 5A (tree: `~/apex`) — add row for the apex-stack update |
| `C:\Users\User\.claude\skills\apex-stack\SKILL.md` | modify | Task 5B (tree: `~/.claude`) — remove `apex-auth` pointer + version bump |

## Tasks

- [x] **Task 1: Restrict apex-wave-reviewer to read-only tools** — files: `C:\Users\User\.claude\agents\apex-wave-reviewer.md` — Add a `tools: Read, Glob, Grep` line to the YAML frontmatter (which currently has only `name` and `description`). Body is untouched. — done when: the frontmatter contains exactly `tools: Read, Glob, Grep`; no other line in the file changed.

- [x] **Task 2: Extend the destructive-command guard to cover the PowerShell tool** — files: `C:\Users\User\.claude\settings.json`, `C:\Users\User\.claude\hooks\destructive-command-guard.js`, `C:\Users\User\.claude\hooks\lib\destructive-detect.js`, `C:\Users\User\.claude\hooks\destructive-guard-test.py`
  - 2a. `settings.json` (line ~68): change the destructive-command-guard PreToolUse matcher from `"Bash"` to `"Bash|PowerShell"` (mirror the `codex-dispatch-guard` entry directly below it). — done when: that hook entry's matcher reads `"Bash|PowerShell"`; no other JSON key changes in this task.
  - 2b. `destructive-command-guard.js` (line ~71): the guard currently returns null unless `data.tool_name === 'Bash'`. Change so it processes both `'Bash'` and `'PowerShell'` (and returns null for any other tool name). — done when: a payload with `tool_name: "PowerShell"` reaches the detection functions instead of being short-circuited.
  - 2c. `destructive-detect.js`: extend detection so PowerShell-syntax destruction is caught. Implementation is the coder's choice; the acceptance criteria (see § Acceptance Criteria) enumerate the REQUIRED detection set (a–g). This is the required set to satisfy this spec, not a claim that PowerShell destruction is exhaustively enumerated by these seven — the audit fix line (`docs/research/apex-v2-joint-audit-2026-07-15.md:23-24`) calls for coverage of PowerShell cmdlets and command carriers generally; a–g are the concrete minimum. Reuse the existing shared shell-parsing primitives where possible rather than adding a divergent copy.
  - 2d. `destructive-guard-test.py`: read it first (it JSON-encodes a PreToolUse payload per case and pipes it to `node hooks/destructive-command-guard.js`, asserting blocked==expect). Add: for EVERY new detection (criteria a–b–c–e–f–g), one denied case with the tool name each criterion specifies; the allowed cases for criterion d (also `tool_name: "PowerShell"`). The new suite may be freely restructured (e.g. parametrise `tool_name` per case at the `payload = json.dumps(...)` line) — it must exit 0.
    - **Regression gate — baseline-from-history, FAIL-CLOSED:** the pre-change suite is authoritative and comes from git, not from the edited file. Run the sequence below from the `~/.claude` tree (the suite invokes `node hooks/destructive-command-guard.js` by relative path, so CWD must be `~/.claude`); it runs HEAD's suite against the NEW guard code. Every failure mode below must fail the gate, not fall through green (a failed `git show` yields an empty file, and `python` exits 0 on an empty script — that must NOT read as pass). PowerShell 5.1 has no `&&`; use explicit `$LASTEXITCODE`/`Stop`+try-catch, and byte-safe extraction (never `>`, which is UTF-16-BOM):
      ```powershell
      $ErrorActionPreference = 'Stop'
      $tmp = Join-Path $env:TEMP 'dgt-baseline.py'
      # (1) success-checked extraction — non-zero git exit fails the gate, no fallthrough
      $base = & git show HEAD:hooks/destructive-guard-test.py
      if ($LASTEXITCODE -ne 0) { throw "GATE FAIL: git show exit $LASTEXITCODE" }
      $base | Out-File -FilePath $tmp -Encoding utf8   # byte-safe (UTF-8, not UTF-16 `>`)
      # (2) non-empty check — empty extraction fails the gate
      if ((Get-Item $tmp).Length -le 0) { throw "GATE FAIL: baseline suite is empty" }
      # run HEAD's suite against the working-tree (new) guard
      $out  = & python $tmp
      $code = $LASTEXITCODE
      # (3) PROVE cases executed — parse the suite's own 'N/M passed' summary line
      $sum = $out | Select-String -Pattern '^\s*(\d+)/(\d+)\s+passed\s*$'
      if (-not $sum) { throw "GATE FAIL: no 'N/M passed' summary — zero baseline cases ran" }
      $passed = [int]$sum.Matches[0].Groups[1].Value
      $total  = [int]$sum.Matches[0].Groups[2].Value
      if ($total -le 0) { throw "GATE FAIL: baseline reported 0 cases" }
      # (4) exit 0, all cases green, and zero FAIL lines (round-2 item-6 convention)
      if ($code -ne 0)                        { throw "GATE FAIL: baseline exit $code" }
      if ($out | Select-String -Pattern 'FAIL') { throw "GATE FAIL: baseline printed a FAIL line" }
      if ($passed -ne $total)                 { throw "GATE FAIL: baseline $passed/$total" }
      Write-Host "BASELINE GATE PASS: $passed/$total historical cases green against new guard"
      ```
      — done when: the sequence reaches `BASELINE GATE PASS` printing `$total > 0` historical cases green, AND the new (edited) suite also exits 0 (`python hooks/destructive-guard-test.py`, from `~/.claude`) with every new case (a–g) present.
  - done when (task): all four sub-items satisfied and the test suite passes.

- [x] **Task 3: Pass `-Authorized` into the scope snapshot** — files: `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1` — At line ~778, the snapshot invocation is `& $scopeCheckScript -Snapshot -Worktree $Worktree -Task $gateKey -StateDirectory $harnessStateDir | Write-Host`. Append `-Authorized $Authorized` to that call (the block already only runs when `$Authorized.Count -gt 0`). Do NOT make `-Authorized` mandatory or add any new refusal — that is a separate future BLOCK. — done when: the snapshot call passes `-Authorized $Authorized`; the three real harness suites in § Acceptance Criteria still pass.

- [x] **Task 4: Unwire the dead coding-git-status hook** — files: `C:\Users\User\.claude\settings.json`, `C:\Users\User\.claude\hooks\coding-git-status.ps1`
  - 4a. `settings.json`: delete the entire `UserPromptSubmit` block (lines ~120–130) whose only hook is `coding-git-status.ps1`. — done when: `settings.json` has no `UserPromptSubmit` key and remains valid JSON.
  - 4b. Remove the hook file from the `~/.claude` repo with `git rm hooks/coding-git-status.ps1` (run from the `~/.claude` tree). — done when: the file is absent from both the working tree and the git index.

- [x] **Task 5A: Pointer-rot repairs (tree: `C:\users\user\apex`)** — files: `C:\users\user\apex\SKILLS.md`, `C:\users\user\apex\SKILL-HISTORY.md`
  - 5A.1 `SKILLS.md` — fix exactly these four rots:
    1. Remove the dangling `BACKEND-ROUTING.md` reference. Current text (line ~6): `> **Backend routing:** [BACKEND-ROUTING.md](./BACKEND-ROUTING.md)` — delete this line (the file does not exist).
    2. Remove the `~/.claude/registry/` claim. Current text (line ~83): `| Registry | \`~/.claude/registry/\` (skills, agents, token-config — **no domain registry**) |` — delete this table row (the directory does not exist; CLAUDE.md states there is no registry). NOTE: leave the prose mention of the "keyword registry" at line ~15 (it correctly records a deletion and contains no `registry/` path).
    3. Fix the "detect mode" wording. Current text (line ~31): `| **apex-orchestrate** | Session start — orient, detect mode, route | always, first |` — ADR-038 removed modes; reword to drop "detect mode" (e.g. "orient, route").
    4. Fix the status.md-as-Verification-Recipe contradiction. Current text (line ~86): `| Verification Recipe | **the project's** \`status.md\` + \`AGENTS.md\` — a per-project fact, not a skill |` — the recipe's single home is `AGENTS.md` (status.md holds live state only); reword so it names `AGENTS.md` and not status.md.
  - 5A.2 `SKILL-HISTORY.md` — add ONE new row at the top of the row list (immediately after the header prose, before the current newest row dated 2026-07-15), columns `Date | Skill | Files | Version | Event | What Changed | Sources`, newest first. Row content: Date `2026-07-16`; Skill `apex-stack`; Files `SKILL.md`; Version `1.2.1`; Event `updated`; What Changed — a one-line note that the dangling `apex-auth` pointer (deleted in ADR-036) was removed; Sources — `docs/research/apex-v2-joint-audit-2026-07-15.md (#11)`. NOTE: this row documents Task 5B's edit (in the other tree). Both tasks are approved together in this batch, so there is no ordering dependency — write the row regardless of 5B's dispatch order.
  - done when: greps in `SKILLS.md` for `BACKEND-ROUTING`, `registry/`, and `detect mode` return nothing; the Verification Recipe row names `AGENTS.md` and not status.md; `SKILL-HISTORY.md` has the new top row.

- [x] **Task 5B: apex-stack pointer + version bump (tree: `C:\Users\User\.claude`)** — files: `C:\Users\User\.claude\skills\apex-stack\SKILL.md`
  - 5B.1 Remove the `apex-auth` pointer (deleted in ADR-036). Current text (line ~112): `... evaluate Better Auth as an alternative (see apex-auth for detailed comparison). When ...` — remove the `(see apex-auth for detailed comparison)` parenthetical, leaving the surrounding sentence intact. This is the only `apex-auth` occurrence in the skill.
  - 5B.2 Frontmatter — this is a meaningful skill update: bump `version: 1.2.0` → `1.2.1` (patch) and set `last_updated: 2026-06-10` → `2026-07-16`.
  - done when: grep in `apex-stack/SKILL.md` for `apex-auth` returns nothing; frontmatter shows `version: 1.2.1` and `last_updated: 2026-07-16`.

## Wave plan
Wave 1: [Task 1, Task 5A] | Wave 2: [Task 2] | Wave 3: [Task 3] | Wave 4: [Task 5B] | Wave 5: [Task 4]

Rationale (scope-lock, not "why"): The dispatcher **refuses two concurrent workers in one worktree** (`codex-dispatch.ps1:728-757`, exit 71) — file-disjointness does NOT satisfy it, and `-AllowSharedWorktree` is deliberately not used. So one worktree per concurrent worker is dispatcher-enforced: the five `~/.claude` tasks (1, 2, 3, 4, 5B) each write the same `~/.claude` worktree and therefore serialise across waves. The one exception is **Task 5A**, whose files live in the `~/apex` worktree — a different tree — so it may run concurrently with a `~/.claude` task; it rides Wave 1 alongside Task 1. `settings.json` writers (Tasks 2 and 4) remain in separate waves regardless (Wave 2 and Wave 5).
Each task is dispatched with `-Worktree` set to the tree that owns its files; 5A → `C:\users\user\apex`, all others → `C:\Users\User\.claude`.

## Permissions

The following actions will run autonomously during build.
Approving this spec approves all of them.

> **Critical-file batch.** `settings.json` (permission/hook wiring) and everything under `hooks/`
> are critical files under apex-governance. This batch was approved by the user **attended** on
> **2026-07-16**. If any task would run unattended (AFK/dontAsk), STOP and re-confirm — spec text
> alone does not settle a critical-file edit.
>
> **Two repos.** This build spans two git trees — `C:\users\user\apex` (Task 5A) and
> `C:\Users\User\.claude` (all other tasks). Each dispatch's `-Worktree` is the tree that owns its
> files, and each dispatch's `-Authorized` list must contain ONLY paths inside that `-Worktree`,
> expressed relative to that root — never a path from the other tree (audit #9).

### File Operations
| Action | Paths |
|--------|-------|
| Modify | `C:\Users\User\.claude\agents\apex-wave-reviewer.md` |
| Modify | `C:\Users\User\.claude\settings.json` |
| Modify | `C:\Users\User\.claude\hooks\destructive-command-guard.js` |
| Modify | `C:\Users\User\.claude\hooks\lib\destructive-detect.js` |
| Modify | `C:\Users\User\.claude\hooks\destructive-guard-test.py` |
| Modify | `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1` |
| Modify | `C:\users\user\apex\SKILLS.md` |
| Modify | `C:\Users\User\.claude\skills\apex-stack\SKILL.md` |
| Modify | `C:\users\user\apex\SKILL-HISTORY.md` |
| Delete | `C:\Users\User\.claude\hooks\coding-git-status.ps1` (via `git rm`) |

### Commands
| Command | Purpose |
|---------|---------|
| `python hooks/destructive-guard-test.py` | Task 2 verify — new suite (run from `~/.claude`) |
| (the fail-closed PowerShell 5.1 sequence in **Task 2d**, run from `~/.claude`) | Task 2 verify — baseline-from-history regression gate: success-checked byte-safe extraction to `$env:TEMP`, non-empty check, `N/M passed` proof-of-execution, exit 0, zero `FAIL` lines |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\scope-check-test.ps1` | Task 3 verify (run from `~/.claude`; Windows PowerShell 5.1 — `pwsh` is not on PATH) |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\snapshot-scale-test.ps1` | Task 3 verify (run from `~/.claude`) |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\dispatch-test.ps1` | Task 3 verify (run from `~/.claude`; drives the fakecodex helper internally) |
| `git rm hooks/coding-git-status.ps1` | Task 4 — remove tracked dead hook |
| `node hooks/destructive-command-guard.js` | Invoked by the Task 2 test harness |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git rm` | `hooks/coding-git-status.ps1` (Task 4) |

The build performs no git writes in the two live trees except Task 4's named `git rm`. The Task-3 verify suites create throwaway fixture repos under `$env:TEMP` and commit only inside those fixtures.

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_DESTRUCT_GUARD` | Read by the guard under test (off-switch); not set by this build |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installs or network access |

## Specialist Context
### Security
- The two guard/hook trees (`settings.json`, `hooks/`) are safety-critical. Task 2 MUST NOT weaken any existing Bash case — the regression run is a hard gate. Task 4 removes a hook that already no-ops; confirm no other settings key references `coding-git-status.ps1` after deletion.

### Performance
(none)

### Accessibility
(none — no frontend change)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Skill history | `C:\users\user\apex\SKILL-HISTORY.md` | Add the apex-stack row (Task 5A.2) |
| ADR | (none) | No architectural decision — this executes prior decisions |

## Acceptance Criteria

**Task 1**
- [x] apex-wave-reviewer frontmatter → verify: `tools: Read, Glob, Grep` present; `git diff` shows only that one added line.

**Task 2 — matcher & tool-name**
- [x] settings.json matcher → verify: the destructive-command-guard PreToolUse entry matcher is `"Bash|PowerShell"`; file still parses as JSON.
- [x] guard tool-name gate → verify: a `tool_name: "PowerShell"` payload is no longer short-circuited (it reaches detection).

**Task 2 — detection coverage (REQUIRED set a–g; each criterion → a denied case under the tool name(s) it names)**
- [x] (a) `Remove-Item` and aliases (`ri`, `rm`, `rmdir`, `rd`, `del`, `erase`) WITH both `-Recurse` and `-Force` (any order; including unambiguous prefix abbreviations such as `-rec`, `-fo`) → verify: DENY for a PowerShell payload of each representative form.
- [x] (b) carrier unwrapping — `Invoke-Expression`/`iex`, `Invoke-Command`, `Start-Process`, and nested `powershell`/`pwsh -Command "<inner>"` must re-test the inner string → verify: a destructive inner command wrapped in each carrier is DENIED, not smuggled past.
- [x] (c) git token checks fire on PowerShell payloads identically → verify: `git push --force`, `git reset --hard` (and the rest of the existing git never-list) DENY under `tool_name: "PowerShell"` exactly as under Bash.
- [x] (d) read-only PowerShell stays legal → verify: `Get-Content`, `Select-String`, `Get-ChildItem`, single-file `Remove-Item` (no `-Recurse`/`-Force` pair), and plain `git status` are ALLOWED under `tool_name: "PowerShell"`.
- [x] (e) `cmd.exe /c` carrier with destructive payloads — `rmdir /s /q`, `del /s /q` (and the `/q /s` order) → verify: DENIED under BOTH `tool_name: "PowerShell"` AND `tool_name: "Bash"`.
- [x] (f) script-block carriers — `& { <inner> }`, `. { <inner> }`, and `Start-Job { <inner> }` / `Start-Job -ScriptBlock { <inner> }` must re-test the inner text → verify: a wrapped `Remove-Item -Recurse -Force` is DENIED (evidence: the current lib splits segments on `&`, leaving `{` as the head token, so the wrap smuggles today).
- [x] (g) `Clear-Content <path>` (file truncation) → verify: DENIED (escape hatch remains via `APEX_DESTRUCT_GUARD`).
- [x] new suite passes → verify: `python hooks/destructive-guard-test.py` (from `~/.claude`) exits 0; every new case (a–g) present.
- [x] baseline-from-history regression gate (FAIL-CLOSED, sequence in Task 2d, run from `~/.claude`) → two ordered pre-run gates BEFORE any python invocation: (1) `git show HEAD:hooks/destructive-guard-test.py` extraction is success-checked — non-zero git exit fails the gate with no fallthrough to python; then (2) the extracted temp file (outside both repos, under `$env:TEMP`, written byte-safely — not PS 5.1 `>`/UTF-16-BOM) is verified non-empty, empty = FAIL. Then verify ALL of the following result checks (order-independent, matching the sequence): baseline exit 0; `Select-String 'FAIL'` finds zero lines; and the run PROVES cases executed — the suite's `N/M passed` summary line is present with `N == M > 0` (bare "python exits 0" is insufficient — an empty script exits 0 having run zero cases). All gates and checks hold ⇒ every pre-existing Bash case still passes under the extended guard, unmodifiable by working-tree edits to the test file.

**Task 3**
_"Passes" for every suite below means: the run exits 0 AND its output contains ZERO lines matching `FAIL` (mechanically `Select-String 'FAIL'` finds nothing). These suites print `FAIL` but currently keep exit 0, so exit code alone is insufficient — the suite-can't-fail-loudly defect is logged for the round-8 harness review and is NOT fixed in this spec._
- [x] snapshot call → verify: `codex-dispatch.ps1` line ~778 passes `-Authorized $Authorized`; no new mandatory-`-Authorized` refusal was added.
- [x] harness green → verify: the three real suites — run from `~/.claude` as `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\<suite>.ps1` for `scope-check-test.ps1`, `snapshot-scale-test.ps1`, and `dispatch-test.ps1` — each pass per the definition above (exit 0 AND no `FAIL` line). NOTE: `dispatch-test-fakecodex.ps1` is a HELPER invoked by `dispatch-test.ps1` (it needs `FAKE_CODEX_REPO` and dispatcher stdin, and exits 1 if run standalone) — it is exercised via `dispatch-test.ps1`, never run directly.
- [x] receiving script → verify: `codex-scope-check.ps1` accepts `-Authorized` in `-Snapshot` mode (confirm the parameter is declared/handled; if not, STOP and report — do not add it here).

**Task 4**
- [x] settings.json → verify: no `UserPromptSubmit` key present; file parses as JSON; no remaining reference to `coding-git-status.ps1`.
- [x] file removed → verify: `git status` shows `hooks/coding-git-status.ps1` deleted/staged-removed; the file is gone from the working tree.

**Task 5A (tree: `C:\users\user\apex`)**
- [x] SKILLS.md → verify: greps for `BACKEND-ROUTING`, `registry/`, and `detect mode` return nothing; the Verification Recipe row names `AGENTS.md` and not `status.md`.
- [x] SKILL-HISTORY.md → verify: a new top row dated `2026-07-16` for `apex-stack` `1.2.1` `updated` exists, above the `2026-07-15` rows, with the seven columns.

**Task 5B (tree: `C:\Users\User\.claude`)**
- [x] apex-stack/SKILL.md → verify: grep for `apex-auth` returns nothing; frontmatter reads `version: 1.2.1` and `last_updated: 2026-07-16`.

## Progress
_(Coding mode writes here — do not edit manually)_
