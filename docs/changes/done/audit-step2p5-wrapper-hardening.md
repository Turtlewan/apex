---
spec: audit-step2p5-wrapper-hardening
status: ready
autonomy_level: L2
coder_model: codex         # Codex gpt-5.6-sol, dispatched per task through the wrapper. PER-TASK
                           # fallback: a task whose dispatch reports BLOCKED on a sandbox denial
                           # (denied writes to the harness state dir or .git) is re-run by the HOST
                           # as an in-session Opus worker for THAT task only — not a blanket pin.
cross_model_review: true   # Codex builds -> Claude reviews. Any Opus-fallback task gets a Codex
                           # review instead (cross-family always; ADR-032/034). Harness safety change.
coder_effort: high         # dispatch/cap/pin are fail-closed safety machinery; wrong = wedge.
---

# Spec: Audit step 2.5 — wrapper hardening (fail-closed scope lock, blocking cap-guard, multi-root pin)

**Identity:** Closes joint-audit BLOCKs #6 (scope lock optional-by-default), #8 (cap-guard advisory), and #9 (single-root tree-pin).
→ why: see `docs/technical/adr/ADR-041-wrapper-hardening-scope-cap-pin.md`, `docs/research/apex-v2-joint-audit-2026-07-15.md` (#6, #8, #9). Do not restate rationale in this spec.

## Intent
- **Intent:** Convert three prose/advisory enforcement holes (#6, #8, #9) into fail-closed mechanisms and give the tree-pin the two-root reach an APEX change needs.
- **Invariants:**
  - A `-Phase build -Sandbox workspace-write` dispatch with an empty `-Authorized` and no `-ScopeUnlocked` is REFUSED with **exit 74**, and a contradictory/incomplete flag combination is refused with exit 74 in any phase. A refusal leaves no ledger ROW and no dispatch LOG for the refused run (the shared state dirs are created by earlier startup regardless, as with exit 72). `-ScopeUnlocked` (requiring `-ScopeUnlockedReason`, mutually exclusive with a non-empty `-Authorized`) is the one escape; it proceeds and records `scope_unlocked=true` + the reason in the ledger row.
  - `context-cap-guard.js` DENIES a Write/Edit whose deterministic size projection exceeds the cap AND is strictly greater than the current on-disk size; any edit that does not grow the file (equal-size or shrinking) is always allowed even while over cap; non-cap and unparseable inputs are allowed. Line counts use `wc -l` (newline-count) semantics. Caps are INCLUSIVE upper bounds — status.md 100 lines, CLAUDE.md 200 lines, AGENTS.md 32768 bytes are each ALLOWED (deny only at 101 / 201 / 32769), because the deny test is strict `projected > cap.limit`.
  - `tree-pin.ps1 -Pin` fingerprints every named root and `-Verify` exits 69 if any moved (or its pin file is missing); a single-root call is byte-for-byte unchanged.
  - The wrapper's exit-code contract table names exit 74.
- **Non-goals:**
  - Does NOT touch the M2b/M3 pre-flight (ADR-040), critical-file confirmation (#3), the cross-family ledger (#7), or any FLAG-wave content cut (#11–16).
  - Does NOT fix the `~/.claude` runtime-scope exit-65 false positive — that scope-check redesign is deferred to round 8 (interim: the host adjudicates, clearing a 65 whose flagged paths are all session-runtime dirs). `codex-scope-check.ps1` is NOT touched by this spec.
  - Does NOT wire multi-root pinning into the dispatcher's cross-tree gate (capability only; a later step opts in).
  - Does NOT make the cap-guard block anything but the three context files, and does NOT change the PostToolUse `apex-context-monitor` / injection-scanner hooks.

## Assumptions
- Exit code **74 is free** in `codex-dispatch.ps1` — the script uses 65/66/67/68/69/71/72/73/75/124 and 74 is unused. Verified by enumerating every `exit <n>` site. → impact: Stop (if 74 is taken by build time, pick the next free code and update Task 5's SKILL.md row to match; report the change).
- The #6 "dead wiring" half is ALREADY fixed: `codex-dispatch.ps1:858` passes `-Authorized $Authorized` into the snapshot call. So Task 1 implements only the fail-closed half. → impact: Low (if the snapshot call has regressed to omit `-Authorized`, restore it and note it).
- In `codex-dispatch.ps1`: `$ErrorActionPreference = 'Stop'` is at `:51`; the first filesystem I/O (`Assert-NotInsideRepo`, which creates the state/gates dirs and may copy the legacy ledger) is at `~:110–126`; the phase/sandbox force block ends `~:628`; the pre-flight `try` opens `~:638`; the ledger row is written inside the mutex at the reservation (`~:811–823`). Task 1 places the two argument-validation refusals after `:51` and before `:110` (no I/O yet), and the no-scope-list refusal after `~:628` and before `~:638` (before reservation). → impact: Stop (if the reservation or the init I/O has moved relative to these anchors, re-place the refusals to keep "no row / no log for the refused run" true, and report).
- No durable ROW or LOG exists before the refusal sites; the shared state directories (and a one-time legacy-ledger copy) ARE created earlier by startup, so "no row / no log for the refused run" is the accurate claim — NOT "nothing durable exists" (this matches exit 72's accepted framing). → impact: Low.
- `~/apex/AGENTS.md`'s `## Verify commands` fence already opens ` ```bash ` and the recipe is bash-flavored (`wc`, `grep`, `~`), so Task 4 leaves the fence label and recipe unchanged. Task 4 makes two edits: the byte-cap comment (`# <32768` → `# ≤32768`) and relocating the heading→fence prose below the fence (the step-2 Task-1g adjacency rule refused the live `~/apex` dispatch with exit 72 / UNPARSEABLE because prose sits between the heading and the fence). → impact: Low (if the fence is unexpectedly unlabeled or cmd-flavored by build time, also label it ` ```bash ` and report the extra edit).

Simplicity check: considered folding the three fixes into fewer files — rejected: they live in three independent files (`codex-dispatch.ps1`, `context-cap-guard.js`, `tree-pin.ps1`) with no shared state, so one task per file with its own loud-fail suite is the smallest sound unit. Why this version: the audit files #6/#8/#9 as independent BLOCKs; grouping them lets one attended critical-file approval cover the batch.

## Prerequisites
- Specs that must be complete first: `audit-step2-m2b-m3` (done) — this spec assumes its exit-72 pre-flight and the shared harness suites exist. No file overlap with any in-flight spec.
- Environment setup required: `powershell.exe` (Windows PowerShell 5.1), Git-for-Windows on PATH, Node.js on PATH (for the cap-guard hook + its JS test); `codex` NOT required (dispatch tests drive `dispatch-test-fakecodex.ps1` via `-CodexExecutable`).

## Files to Change

**Dispatch note (scope lock):** each task's `-Authorized` list is the task's files as REPO-RELATIVE paths within that task's `-Worktree` (e.g. `skills/apex-code/scripts/codex-dispatch.ps1`, `hooks/context-cap-guard.js`), NOT the absolute paths shown in this table — the absolute form here is for human reading only. `codex-scope-check.ps1` compares `-Authorized` against repo-relative git porcelain paths, so the orchestrator must pass the repo-relative form per task (as steps 1–2 did); passing the absolute display paths verbatim would flag every edit out-of-scope (exit 65/66).

| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1` | modify | Task 1 — `-ScopeUnlocked`/`-ScopeUnlockedReason` params, the argument-validation refusals (top of script), the no-scope-list refusal (before pre-flight), ledger `scope_unlocked` + `scope_unlocked_reason` fields, the `-ScopeUnlocked` branch on the scope-arming warn path |
| `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-scopelock-test.ps1` | create | Task 1 — loud-fail suite for the scope-lock gate (isolated ledger via `APEX_STATE_DIR`, drives the fakecodex helper) |
| `C:\Users\User\.claude\hooks\context-cap-guard.js` | modify | Task 2 — PostToolUse-advisory → PreToolUse-blocking with the deterministic projection + no-growth escape; `wc -l` line semantics; header comment rewritten |
| `C:\Users\User\.claude\hooks\context-cap-guard.test.js` | create | Task 2 — loud-fail Node suite for the projection + escape |
| `C:\Users\User\.claude\settings.json` | modify | Task 2 — move `context-cap-guard.js` from PostToolUse to a new PreToolUse `Write|Edit` matcher; leave the other PostToolUse hooks intact |
| `C:\Users\User\.claude\skills\apex-code\scripts\tree-pin.ps1` | modify | Task 3 — additional-roots parameter; `-Pin`/`-Verify` over every root; single-root call unchanged |
| `C:\Users\User\.claude\skills\apex-code\scripts\tree-pin-test.ps1` | create | Task 3 — loud-fail suite for multi-root pin/verify, single-root byte-compat, and missing-pin detection |
| `C:\users\user\apex\AGENTS.md` | modify | Task 4 — correct the `wc -c` byte-cap comment (`:45`) `# <32768` → `# ≤32768`; relocate the heading→fence prose below the fence (adjacency fix); confirm the `## Verify commands` fence stays ` ```bash `-labeled |
| `C:\Users\User\.claude\skills\apex-code\SKILL.md` | modify | Task 5 — add the exit-74 row to the exit-code contract table; version bump |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | Task 6 (tree: `~/apex`) — one row for the apex-code exit-74 contract edit |
| `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test-fakecodex.ps1` | run only — not modified | Task 1 — the fake coder the scope-lock suite drives via `-CodexExecutable` |

## Tasks

- [x] **Task 1: Fail-closed scope lock (exit 74) + `-ScopeUnlocked` escape** — files: `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-scopelock-test.ps1`
  - 1a. Add two params near `$SkipScopeCheck` (~:24): `[switch]$ScopeUnlocked` and `[string]$ScopeUnlockedReason`, each with a one-line comment (deliberate escape; the scope lock is disabled and the reason is recorded in the ledger row).
  - 1b. ARGUMENT-VALIDATION refusals (phase-independent caller errors) — insert immediately after `$ErrorActionPreference = 'Stop'` (~:51) and BEFORE the first `Assert-NotInsideRepo` (~:110), so they short-circuit before ANY filesystem I/O and fire in any phase. Two refusals, each printing a named message and `exit 74`:
    1. `$ScopeUnlocked -and $Authorized.Count -gt 0` → `[dispatch] REFUSED (exit 74): -ScopeUnlocked and -Authorized are mutually exclusive — pass one, not both` .
    2. `$ScopeUnlocked -and [string]::IsNullOrWhiteSpace($ScopeUnlockedReason)` → `[dispatch] REFUSED (exit 74): -ScopeUnlocked requires -ScopeUnlockedReason` . Add a one-line comment: exit 74 = caller-contract error, refused before any I/O; no state dir touched. — done when: a contradictory or incomplete flag combination exits 74 in ANY phase (build OR review), before any state dir is created.
  - 1c. NO-SCOPE-LIST refusal (phase-gated) — insert AFTER the phase/sandbox force block (ends ~:628, where `$Sandbox` is final) and BEFORE the pre-flight `try` (~:638): `if ($Phase -eq 'build' -and $Sandbox -eq 'workspace-write' -and $Authorized.Count -eq 0 -and -not $ScopeUnlocked)` → print `[dispatch] REFUSED (exit 74): workspace-write build has no -Authorized scope list — pass the spec's '## Files to change' list, or -ScopeUnlocked -ScopeUnlockedReason "<why>" to bypass` and `exit 74`. Add a one-line comment: exit 74 = refused before reservation; NO ledger row and NO dispatch log for the refused run (the shared state dirs were created by earlier startup regardless, exactly as with exit 72). Review/read-only is EXEMPT from THIS refusal (forced read-only upstream, and they pass no `-Authorized`) — but the argument-validation refusals in 1b still apply to them. ORDERING (load-bearing): this sits before the pre-flight `try` (~:638), so the no-scope-list refusal runs BEFORE the M2b baseline pre-flight — a build failing both refuses on scope (74), never baseline (72). — done when: a workspace-write build with no scope list and no unlock exits 74 before the baseline runs; review phases do not hit this refusal.
  - 1d. In the `$ledgerRow` ordered hashtable (after `authorized = @($Authorized)`, ~:791) add `scope_unlocked = [bool]$ScopeUnlocked` and `scope_unlocked_reason = $(if ($ScopeUnlocked) { $ScopeUnlockedReason } else { '' })`. — done when: a `-ScopeUnlocked` build's row carries `"scope_unlocked":true` and the reason string.
  - 1e. On the scope-arming warn path (`:849`–`:865`), add a branch: after the `if ($Authorized.Count -gt 0)` arm and before `elseif (-not $SkipScopeCheck)`, insert `elseif ($ScopeUnlocked) { Write-Host "[dispatch] -ScopeUnlocked: scope lock DELIBERATELY DISABLED for this dispatch -- reason: $ScopeUnlockedReason" -ForegroundColor Yellow }`. The existing prose-only warning stays as the final `elseif` (now reached only by read-only/review dispatches with an empty `-Authorized`). — done when: a `-ScopeUnlocked` dispatch prints the loud disabled note, not the prose-only warning.
  - 1f. Create `dispatch-scopelock-test.ps1`: an accumulate-and-exit-nonzero suite (NOT print-only) that isolates the ledger with `$env:APEX_STATE_DIR` set to a fresh temp dir outside any repo, uses a UNIQUE spec name per case (so "no row" is checked by counting rows for that spec in the isolated `codex-run-ledger.jsonl`), and drives the launch path with `-CodexExecutable powershell.exe -CodexExecutableArgumentPrefix ... dispatch-test-fakecodex.ps1` (as `dispatch-test.ps1` does). Each fixture repo is a temp `git init`. Because the no-scope-list refusal runs BEFORE the M2b baseline pre-flight (1c ORDERING) and the argument-validation refusals run before any I/O, the REFUSAL cases (exit 74) do NOT need a green baseline; ONLY the `-ScopeUnlocked` PROCEEDS case runs through the pre-flight and therefore needs a GREEN `AGENTS.md` recipe to reach the fake coder. Cases (assert exit code AND ledger-row count):
    - build + workspace-write, empty `-Authorized`, no `-ScopeUnlocked` → **74**, ZERO rows.
    - both `-Authorized <path>` and `-ScopeUnlocked -ScopeUnlockedReason "x"` → **74**, ZERO rows (argument error).
    - `-ScopeUnlocked` with no `-ScopeUnlockedReason` → **74**, ZERO rows (argument error).
    - review-phase dispatch (`-Phase review`) with BOTH `-ScopeUnlocked` and `-Authorized <path>` → **74**, ZERO rows (the argument-validation refusal fires in any phase).
    - build + workspace-write + `-ScopeUnlocked -ScopeUnlockedReason "bootstrap alpha"` → proceeds (exit NOT 74; reaches the fake coder), row EXISTS with `"scope_unlocked":true` and `"scope_unlocked_reason":"bootstrap alpha"`.
    - review-phase dispatch (`-Phase review`) with empty `-Authorized` and neither flag → NOT 74 (exempt from the no-scope-list refusal).
  - done when (task): a workspace-write build with no scope list and no unlock refuses with exit 74 and no row; contradictory/incomplete flag combinations refuse in any phase; the unlock escape proceeds and flags the row; a review with neither flag is exempt; the suite exits non-zero on any failed assertion.

- [x] **Task 2: Cap-guard becomes a blocking PreToolUse gate** — files: `C:\Users\User\.claude\hooks\context-cap-guard.js`, `C:\Users\User\.claude\hooks\context-cap-guard.test.js`, `C:\Users\User\.claude\settings.json`
  - 2a. Rewrite `context-cap-guard.js` as a PreToolUse (Write|Edit) gate. Keep the `CAPS` table (status.md ≤100 lines, CLAUDE.md ≤200 lines, AGENTS.md ≤32768 bytes — 32768 allowed, 32769+ denied; Codex `project_doc_max_bytes`=32768 reads a file up to and including 32768 bytes) and the per-cap `fix` text. The `limit` values stay 100 / 200 / 32768 and the strict `> limit` deny rule makes every cap an INCLUSIVE upper bound. Parse stdin JSON; read `tool_input.file_path`; if the basename matches no cap → allow (exit 0). LINE-COUNT SEMANTICS: the `lines` unit is the NEWLINE COUNT — the number of `\n` characters in the content — matching the repos' own `wc -l` verify recipes, NOT `content.split('\n').length` (which over-counts by 1 for a newline-terminated file and would fire one line early at the exact cap). Compute the on-disk current size in the cap's unit (`lines` = newline count; `bytes` = `Buffer.byteLength(content,'utf8')`); an unreadable file → current = 0. PROJECTION:
    - Write (`tool_input.content` present): projected = the cap-unit size of `content`.
    - Edit (`tool_input.old_string`/`new_string` present): occurrences = `replace_all` ? count of `old_string` in the current content : 1; projected = current + occurrences × (cap-unit-size(new_string) − cap-unit-size(old_string)). For `lines`, the per-occurrence delta is `(newlineCount(new_string) − newlineCount(old_string))`.
    - Neither shape parseable → allow (exit 0).
  - 2b. DECISION: DENY only when `projected > cap.limit AND projected > current` (STRICT on both). Otherwise allow. (Any edit that does not grow the file — `projected <= current` — is always allowed even if still over cap, so an equal-size or shrinking fix on an already-over-cap file is never blocked; a brand-new over-cap Write has current 0, so `projected > 0` and it is denied.) On deny, emit to stdout and exit 0 with the PreToolUse deny contract (example flush-left):
```
    {"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"<label + the cap.fix text>"}}
```
    where the reason names the projected size, the cap, and carries the same fix guidance the advisory version printed. Allowed paths print nothing and exit 0. — done when: growth into/within violation denies; an equal-size or shrinking edit on an over-cap file allows; under-cap allows; a new over-cap file denies.
  - 2c. Rewrite the header comment (`:1`–`:21`): it is now a BLOCKING PreToolUse gate for the deterministic size projection, with the no-growth escape and the `wc -l` line semantics stated; correct the AGENTS.md cap wording from `< 32 KiB` / `<32768` to `≤32768 bytes (32768 allowed; 32769+ denied)`; drop the "Advisory, not blocking … Exit 0 always — never wedge a session" language. This is the only in-`~/.claude` doc that claimed the caps were merely reported; ADR-037's enforcement clause is refined by ADR-041 (do not edit ADR-037). — done when: the header describes blocking + the escape and no longer says "advisory".
  - 2d. In `settings.json`: remove the PostToolUse object whose matcher is `Write|Edit` and whose only hook is `context-cap-guard.js` (`:88`–`:98`), and add a new object to the PreToolUse array — `{ "matcher": "Write|Edit", "hooks": [ { "type": "command", "command": "\"C:/Program Files/nodejs/node.exe\" \"C:/Users/User/.claude/hooks/context-cap-guard.js\"", "timeout": 5 } ] }`. Leave the other PostToolUse hooks (`apex-context-monitor.js`, `apex-read-injection-scanner.js`) untouched, and the existing PreToolUse hooks intact. — done when: `settings.json` is valid JSON, `context-cap-guard.js` appears once under PreToolUse `Write|Edit` and nowhere under PostToolUse.
  - 2e. Create `context-cap-guard.test.js`: a Node loud-fail suite (exit non-zero on any failed case) that pipes a PreToolUse payload into the hook (child process, JSON on stdin, fixtures in `os.tmpdir()`) and asserts the decision. Cases: growth over cap (write/edit that grows an over-cap or into-cap file) → stdout parses with `permissionDecision === "deny"`; a reducing edit on an over-cap file → NOT denied (allow); an EQUAL-SIZE edit (no line/byte delta, e.g. a same-length typo fix) on an over-cap file → NOT denied (allow); a write under cap → allow; a brand-new over-cap file (Write, no current file) → deny; an Edit projection with a multi-occurrence `replace_all` → arithmetic matches the expected projected size (assert deny/allow accordingly); a NEWLINE-TERMINATED file at EXACTLY the cap (e.g. status.md with 100 `\n`) via an equal-size edit → NOT denied (proves `wc -l` semantics — `split('\n').length` would over-count to 101 and wrongly deny); a growth from exactly the cap to cap+1 newlines → deny (the boundary is exact); a BYTE-unit Write (AGENTS.md) projecting exactly 32768 bytes → ALLOW; a Write projecting 32769 bytes → DENY; a non-cap file and an unparseable stdin → allow (exit 0).
  - done when (task): the three context-file caps are actually enforced at write time under `wc -l` semantics, a shrinking/equal-size cleanup edit is never blocked, `settings.json` wires the hook as PreToolUse, and the JS suite exits non-zero on any failed assertion.

- [x] **Task 3: Multi-root tree-pin** — files: `C:\Users\User\.claude\skills\apex-code\scripts\tree-pin.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\tree-pin-test.ps1`
  - 3a. Add a param for additional roots: `[string[]]$PinAlso = @()` (near `$Worktree`, ~:26), documented as extra trees pinned/verified in the SAME gate (an APEX change spans `~/apex` and `~/.claude`). Keep `-Worktree` mandatory and its meaning (the primary root). — done when: the param exists and defaults empty (single-root behaviour unchanged when omitted).
  - 3b. Refactor the pin identity + fingerprint (`:40`–`:149`) to iterate over `@($Worktree) + $PinAlso`: for EACH root compute its own `$worktreeTag` and `$pinPath` under the existing scheme `apex-treepin-$safeLabel-$worktreeTag.txt` (so each root gets its own SHA-tagged file — the per-worktree identity at `:40`–`:52` is preserved per root), and its own fingerprint. `-Pin` writes every root's pin file. `-Verify` checks every root; if ANY root's digest differs OR its pin file is missing → print which root(s) moved and `exit 69`; only if ALL roots are unchanged → `exit 0`. Each root must exist (`Test-Path -PathType Container`) or the existing throw fires, naming the missing root. — done when: `-Pin` produces one pin file per root and `-Verify` fails on any moved-or-missing root, passing only when all are clean.
  - 3c. Create `tree-pin-test.ps1`: an accumulate-and-exit-nonzero suite building two temp `git init` roots. Cases: pin both, change neither → `-Verify` exit 0; pin both, mutate ONE root's tracked file → `-Verify` exit 69 naming that root; delete ONE additional root's pin file (leaving the other) → `-Verify` exit 69; a single-root call (`-Pin`/`-Verify` with no `-PinAlso`) behaves exactly as before (pin clean → 0; mutate → 69) AND the pin file it writes is BYTE-IDENTICAL to what the pre-refactor script wrote for the same tree+label (capture a known-good single-root pin file as a fixture and byte-compare) — proving the refactor did not alter the single-root format. — done when: all cases pass and the suite exits non-zero on any failed assertion.
  - done when (task): one gate can pin and verify two roots, exit 69 if either moved or its pin is missing, and the single-root path is byte-for-byte unchanged.

- [x] **Task 4: `~/apex/AGENTS.md` — byte-cap comment fix, fence-adjacency fix, verify-fence confirmation** — files: `C:\users\user\apex\AGENTS.md`
  Read `C:\users\user\apex\AGENTS.md`.
  - 4a. Correct the `wc -c AGENTS.md` byte-cap comment at `:45` from `# <32768` to `# ≤32768`, matching its sibling comments (`# ≤100`, `# ≤200` at `:43`–`:44`) and the hook's now-inclusive cap (32768 allowed). Change ONLY that comment token — the `wc -c AGENTS.md` command itself is unchanged. — done when: the byte-cap comment reads `# ≤32768`.
  - 4b. Confirm the `## Verify commands` fence already opens ` ```bash ` while the recipe is bash-flavored (`wc`, `grep`, `~` paths); it does — leave the fence label UNCHANGED and record the verified finding in the report. Label it ` ```bash ` ONLY in the unexpected event it is unlabeled/cmd-tagged by build time (so the M2b pre-flight does not run a bash recipe under cmd.exe). — done when: the fence still opens ` ```bash `.
  - 4c. FENCE-ADJACENCY FIX (the live M2b gate refused a `~/apex` dispatch with exit 72 / UNPARSEABLE — step-2 Task-1g requires ONLY blank lines between the `## Verify commands` heading and its opening fence, to close the decoy-fence attack). MOVE the two explanatory prose lines that currently sit BETWEEN the heading and the opening ` ```bash ` fence — the sentence "There is no test suite. Verification here is **structural**, and these are the checks that actually catch regressions:" (currently ~:32–33) — to IMMEDIATELY AFTER the closing fence (after `:46`). The recipe content inside the fence is UNCHANGED; only the prose relocates below the fence. Result: the `## Verify commands` heading is followed by blank line(s) then the ` ```bash ` fence with nothing non-blank in between (adjacency-legal), and the prose is preserved directly under the closed fence. — done when: no non-blank line sits between the `## Verify commands` heading and its opening fence, the relocated prose appears immediately below the closing fence unchanged, and `apex-baseline-check.ps1 -Preflight -Worktree C:\users\user\apex` no longer returns UNPARSEABLE.
  - done when (task): the byte-cap comment reads `# ≤32768`; the `## Verify commands` fence opens ` ```bash ` (unchanged) and is heading-adjacent (only blank lines between heading and fence); the explanatory prose is preserved immediately below the closing fence; `apex-baseline-check.ps1 -Preflight -Worktree C:\users\user\apex` returns non-UNPARSEABLE; the recipe commands themselves are unchanged.

- [x] **Task 5: Add exit 74 to the wrapper exit-code contract** — files: `C:\Users\User\.claude\skills\apex-code\SKILL.md`
  - 5a. In the exit-code table (the block beginning "The wrapper's exit codes are the contract", ~:122), add a row in code order (after the 73 row, before 75): `| 74 | refused: scope lock | A workspace-write build dispatch had an empty -Authorized scope list and no -ScopeUnlocked escape, OR a contradictory/incomplete flag combination. Refused BEFORE reservation, so NO ledger row and NO dispatch log exist for the refused run. Pass the spec's Files-to-change list as -Authorized, or -ScopeUnlocked -ScopeUnlockedReason to bypass (recorded in the row). |`. — done when: the table has a 74 row for the refused-scope-lock gate, placed after 73.
  - 5b. Frontmatter: bump `version: 2.6.0` → **`2.7.0`** and `last_updated` to `2026-07-17`. Keep the file ≤ 500 lines. — done when: frontmatter shows 2.7.0 / 2026-07-17 and the exit table names 74.

- [x] **Task 6: SKILL-HISTORY row (tree: `C:\users\user\apex`)** — files: `C:\users\user\apex\SKILL-HISTORY.md`
  Add ONE row at the top of the row list (newest first, columns `Date | Skill | Files | Version | Event | What Changed | Sources`), dated `2026-07-17`: `apex-code` · SKILL.md · `2.7.0` · `updated` · exit-74 fail-closed scope-lock gate added to the wrapper exit-code contract (audit #6) · Sources: docs/technical/adr/ADR-041-wrapper-hardening-scope-cap-pin.md. — done when: the row exists above the current newest row with all seven columns and version 2.7.0.

## Wave plan
Wave 1: [Task 1, Task 2, Task 3, Task 4] | Wave 2: [Task 5] | Wave 3: [Task 6]

<!-- Tasks 1-3 are file-disjoint but all write the ONE `~/.claude` worktree, so the dispatcher's
     one-worktree rule (exit 71, ADR-028) serialises them — apex-code runs them one at a time in the
     shared worktree, in listed order. Task 4 writes the SEPARATE `~/apex` tree and may run in
     parallel with the `~/.claude` stream. Task 5 (SKILL.md, `~/.claude`) rides Wave 2 because it
     documents the exit-74 code Task 1 defines. Task 6 (`~/apex` SKILL-HISTORY) rides Wave 3 because
     it records Task 5's version. A task that falls back to an in-session Opus worker still respects
     the `~/.claude` serialisation — same worktree, one coder at a time. -->

## Permissions
The following actions will run autonomously during build. Approving this spec approves all of them.

> **Critical harness/safety files, attended.** `codex-dispatch.ps1` and `tree-pin.ps1` under
> `C:\Users\User\.claude\skills\apex-code\scripts\`, plus the hook
> `C:\Users\User\.claude\hooks\context-cap-guard.js` and `C:\Users\User\.claude\settings.json`, are
> harness SAFETY / permission-settings files. This batch was approved by the user **attended on
> 2026-07-16**. If any task would run unattended (AFK/dontAsk), STOP and re-confirm — spec text alone
> does not settle a critical-file edit.
>
> **Two trees, no commits.** The build leaves BOTH trees dirty; staging and commits are host-side and
> approval-gated (see § Git). Each task's edits stay inside the tree that owns its files — Tasks 4 and
> 6 → `C:\users\user\apex`, all others → `C:\Users\User\.claude`.

### File Operations
| Action | Paths |
|--------|-------|
| Create | `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-scopelock-test.ps1`, `C:\Users\User\.claude\hooks\context-cap-guard.test.js`, `C:\Users\User\.claude\skills\apex-code\scripts\tree-pin-test.ps1` |
| Modify | `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1`, `C:\Users\User\.claude\hooks\context-cap-guard.js`, `C:\Users\User\.claude\settings.json`, `C:\Users\User\.claude\skills\apex-code\scripts\tree-pin.ps1`, `C:\Users\User\.claude\skills\apex-code\SKILL.md`, `C:\users\user\apex\SKILL-HISTORY.md`, `C:\users\user\apex\AGENTS.md` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\dispatch-scopelock-test.ps1` | Task 1 verify (drives fakecodex; isolates the ledger via `APEX_STATE_DIR`) |
| `"C:/Program Files/nodejs/node.exe" C:\Users\User\.claude\hooks\context-cap-guard.test.js` | Task 2 verify |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\tree-pin-test.ps1` | Task 3 verify |
| `git init` / `git add` / `git commit` **in throwaway temp repos** | Tests seed fixture repos (NOT the live trees; temp fixtures sit outside the worktree snapshot) |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none in the live trees) | The build performs NO git writes in `~/.claude` or `~/apex`. Staging (`git add -f` the new/changed harness files by name; `git add` SKILL-HISTORY) and commits are host-side, after review. Test suites `git init`/`commit` only inside throwaway `$env:TEMP` fixtures. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR` | Task 1 ledger isolation (honoured by the wrapper) |
| `FAKE_CODEX_REPO` | Task 1 fakecodex driver target (as in `dispatch-test.ps1`) |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installs; the tests execute only fixture repos' trivial recipe lines and the hook under Node |

## Specialist Context
### Security
- The cap-guard becomes a hard PreToolUse deny. The no-growth escape is a safety requirement, not an ergonomics nicety: without it, the very edit that fixes an over-cap file would be blocked, wedging the session — the failure mode ADR-037 warned against. Unparseable input allows (exit 0) so a malformed payload can never wedge a write.
- Exit 74 refuses before the ledger reservation (no-scope-list) or before any I/O (argument-validation), so like exit 72 it leaves no ledger row and no dispatch log for the refused run.
- The `~/.claude` runtime-scope exit-65 false positive is NOT addressed here (deferred to round 8, host-adjudicated interim); this spec does not touch `codex-scope-check.ps1`, so the existing detect-and-report behaviour is unchanged.

### Performance
- The cap-guard runs once per Write/Edit to one of three files; it reads at most one file and does arithmetic — sub-millisecond. Multi-root pinning adds one fingerprint per extra root, paid only when a caller passes `-PinAlso`.

### Accessibility
(none — no UI.)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | the modified/new scripts + the hook | header comments: mechanism, fail-closed/deny behaviour, exit contract |
| ADR | `docs/technical/adr/ADR-041-wrapper-hardening-scope-cap-pin.md` | **already written** (this planning session) — the build NEVER touches the ADR. If reality diverges from it, STOP and report to the host; do not edit the ADR mid-build. |
| Exit-code contract | `C:\Users\User\.claude\skills\apex-code\SKILL.md` | Task 5 — the exit table IS the wrapper's exit-code contract (the `.ps1` has no central contract comment block; exit codes live at their sites) |
| SKILL-HISTORY | `C:\users\user\apex\SKILL-HISTORY.md` | Task 6 — one row for the apex-code exit-74 edit |

## Acceptance Criteria

**Task 1**
- [x] Fail-closed no-scope-list refusal → verify: `dispatch-scopelock-test.ps1`'s empty-`-Authorized`/no-unlock build case exits **74** with ZERO ledger rows for its unique spec and no dispatch log.
- [x] Argument validation, any phase → verify: the both-flags case and the missing-reason case each exit **74** with zero rows; the review-phase-with-both-flags case ALSO exits **74** (the argument-validation refusal fires before any I/O, in any phase).
- [x] Unlock escape → verify: the `-ScopeUnlocked -ScopeUnlockedReason "bootstrap alpha"` case proceeds (exit not 74), prints the loud disabled note, and the ledger row carries `"scope_unlocked":true` and `"scope_unlocked_reason":"bootstrap alpha"`.
- [x] Read-only exempt from no-scope-list → verify: the `-Phase review` empty-`-Authorized` neither-flag case does NOT exit 74.
- [x] Placement → verify: the argument-validation refusals sit after `:51` and before the first `Assert-NotInsideRepo` (~:110); the no-scope-list refusal sits after the phase/sandbox force (~:628) and before the pre-flight `try` (~:638) so it precedes reservation and the baseline; the suite exits non-zero on any failed assertion.

**Task 2**
- [x] Growth denied → verify: `context-cap-guard.test.js`'s over-cap growth cases (Write and grow-into-violation Edit) produce stdout with `permissionDecision === "deny"`.
- [x] No-growth allowed → verify: a shrinking Edit AND an equal-size edit (no line/byte delta) on an over-cap file are each NOT denied (allowed) even while still over cap.
- [x] Under-cap + new-file → verify: an under-cap Write allows; a brand-new over-cap Write denies.
- [x] Edit arithmetic → verify: a multi-occurrence `replace_all` Edit projects `current + occurrences × (size(new) − size(old))` and the decision matches.
- [x] `wc -l` boundary → verify: a newline-terminated file at exactly the cap (100 `\n`) is NOT denied on an equal-size edit; a growth from the cap to cap+1 newlines IS denied.
- [x] Byte-cap boundary → verify: an AGENTS.md Write projecting exactly 32768 bytes is NOT denied; a Write projecting 32769 bytes IS denied. Line caps stay inclusive too (status.md 100 / CLAUDE.md 200 allowed; 101 / 201 denied).
- [x] Non-cap / unparseable allow → verify: a non-cap file and an unparseable stdin each exit 0 with no deny.
- [x] Wiring → verify: `settings.json` is valid JSON with `context-cap-guard.js` under PreToolUse `Write|Edit` and absent from PostToolUse; the other PostToolUse hooks remain; the hook header no longer says "advisory"; the suite exits non-zero on any failed assertion.

**Task 3**
- [x] Two roots clean → verify: `tree-pin-test.ps1` pins two roots, changes neither, `-Verify` exits **0**.
- [x] One root moved → verify: mutating one root's tracked file makes `-Verify` exit **69** naming that root.
- [x] Missing pin → verify: deleting one additional root's pin file (other intact) makes `-Verify` exit **69**.
- [x] Single-root back-compat → verify: a `-Pin`/`-Verify` call with no `-PinAlso` behaves exactly as before (clean → 0, mutated → 69), AND the single-root pin file it writes is byte-identical to the captured pre-refactor fixture; the suite exits non-zero on any failed assertion.

**Task 4**
- [x] Byte-cap comment fixed → verify: `C:\users\user\apex\AGENTS.md`'s `wc -c AGENTS.md` comment reads `# ≤32768` (was `# <32768`), matching the `# ≤100` / `# ≤200` siblings and the hook's inclusive cap.
- [x] Fence adjacency → verify: no non-blank line sits between the `## Verify commands` heading and its opening ` ```bash ` fence (the relocated prose now sits below the closing fence); `apex-baseline-check.ps1 -Preflight -Worktree C:\users\user\apex` no longer returns exit 72 / UNPARSEABLE.
- [x] Verify fence + recipe unchanged → verify: the `## Verify commands` fence still opens ` ```bash ` and the recipe commands inside it are byte-identical; `git diff` shows `C:\users\user\apex\AGENTS.md` changed by only the byte-cap comment token and the prose relocation.

**Task 5**
- [x] Exit table → verify: `apex-code` SKILL.md's exit-code table has a `74` row (refused: scope lock), placed after the 73 row.
- [x] Frontmatter → verify: `version: 2.7.0`, `last_updated: 2026-07-17`; file ≤ 500 lines.

**Task 6**
- [x] SKILL-HISTORY → verify: one new top row dated `2026-07-17` for `apex-code` `2.7.0` with all seven columns, above the current newest row.

**Cross-cutting**
- [x] Path-scoped diffs only → verify: `git diff --stat` in `~/.claude` shows changes confined to exactly these files — `skills\apex-code\scripts\codex-dispatch.ps1`, `skills\apex-code\scripts\dispatch-scopelock-test.ps1`, `skills\apex-code\scripts\tree-pin.ps1`, `skills\apex-code\scripts\tree-pin-test.ps1`, `skills\apex-code\SKILL.md`, `hooks\context-cap-guard.js`, `hooks\context-cap-guard.test.js`, `settings.json` — and in `~/apex` to `SKILL-HISTORY.md` and `AGENTS.md` (the latter changed by exactly Task 4's byte-cap comment + heading→fence prose relocation, recipe unchanged). Both trees carry unrelated dirty host work — do NOT assert a repo-wide "only these files changed".

## Progress
_(Coding mode writes here — do not edit manually)_
