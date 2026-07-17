---
spec: round8-w1-gate-scripts
status: draft
autonomy_level: L2
coder_model: codex
coder_effort: high
cross_model_review: true
---

# Spec: Round-8 Wave 1 — fail-open fixes in the six APEX gate scripts

**Identity:** Fixes confirmed fail-open / bypass / correctness defects in the six APEX gate scripts (critical-files, family-gate, spec-validate, baseline-check, scope-check, tree-pin) and their test suites, found by a 4-way cross-family review.

## Deferred (need design — not this wave)
These three sub-fixes were cut from this wave after cross-family review: each needs a design decision, not a mechanical fix.
- **Directory-grant category (was Task 1a)** — the "extensionless equals CRITICAL" heuristic misses dotted-prefix grants and over-fires on ordinary files (LICENSE, Makefile, CHANGELOG); correct detection needs prefix semantics or post-write classification.
- **Host-file prohibition ordering (was Task 5c)** — no host-file prohibition exists in the script to reorder; an unconditional pre-authorization reject is new policy that would falsely reject the already-dirty byte-identical status.md case, and the path-set is undefined.
- **Ignored-entry fingerprint (was Task 6b)** — routing ignored dep-trees through the per-file git hash loop is the exact design that wedged every dispatch; tree-pin must adopt an in-process path+length+mtime digest first.

## Intent
- **Intent:** A gate that cannot enforce its own promise must FAIL CLOSED (refuse, non-zero exit, diagnostic), never silently pass. This wave repairs six such fail-open defects.
- **Invariants:** Every fix ships with a test that FAILS on the pre-fix code (RED) and passes after (GREEN). A test harness that prints FAIL but exits 0 is itself a defect — fix its exit code too where the task touches it. Each modified script parses clean.
- **Non-goals:** Evasion hardening (base64, Unicode / quotePath games, deliberate override abuse) is out of scope by the standing threat model — a careless coder, not a hostile one. Do not add evasion defences.

## Assumptions
- The six scripts are Windows PowerShell 5.1, pure scripts with no build step — impact if wrong: Stop (do not add tooling).
- Each `*-test.ps1` is runnable standalone via `powershell.exe -NoProfile -File` and creates its own throwaway git repos under a scratch dir — impact if wrong: Caution (mirror the existing harness's setup).
- The six script files and their six test files are pairwise disjoint across tasks, and the one extra file (apex-governance/SKILL.md, Task 1 only) is touched by no other task — impact if wrong: Stop (breaks the single-wave parallelism).

Simplicity check: no simpler spec — each defect is independent and file-local; one task per file is the minimum decomposition, and the disjoint file sets make a single parallel wave the simplest execution.

## Prerequisites
- Specs that must be complete first: none.
- Environment setup required: none (Git-for-Windows bash, already required by baseline-check, must be on PATH for that suite).

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| C:\Users\User\.claude\skills\apex-code\scripts\apex-critical-files.ps1 | modify | Task 1 — comma-split (trim/skip-blank) + keys-certs category |
| C:\Users\User\.claude\skills\apex-code\scripts\critical-files-test.ps1 | modify | Task 1 — RED cases |
| C:\Users\User\.claude\skills\apex-governance\SKILL.md | modify | Task 1 — add keys-certs to the declared critical-category list (source of truth) |
| C:\Users\User\.claude\skills\apex-code\scripts\apex-family-gate.ps1 | modify | Task 2 — newest-build selection fails closed |
| C:\Users\User\.claude\skills\apex-code\scripts\family-gate-test.ps1 | modify | Task 2 — RED cases |
| C:\Users\User\.claude\skills\apex-code\scripts\apex-spec-validate.ps1 | modify | Task 3 — tilde fences + case-insensitive markers |
| C:\Users\User\.claude\skills\apex-code\scripts\spec-validate-test.ps1 | modify | Task 3 — RED cases |
| C:\Users\User\.claude\skills\apex-code\scripts\apex-baseline-check.ps1 | modify | Task 4 — heading anchor + bash pipefail |
| C:\Users\User\.claude\skills\apex-code\scripts\baseline-check-test.ps1 | modify | Task 4 — RED cases |
| C:\Users\User\.claude\skills\apex-code\scripts\codex-scope-check.ps1 | modify | Task 5 — mode exclusion + git launch/error fail-closed |
| C:\Users\User\.claude\skills\apex-code\scripts\scope-check-test.ps1 | modify | Task 5 — rebuild into a portable exit-non-zero suite, add RED cases |
| C:\Users\User\.claude\skills\apex-code\scripts\tree-pin.ps1 | modify | Task 6 — git launch/error fail-closed |
| C:\Users\User\.claude\skills\apex-code\scripts\tree-pin-test.ps1 | modify | Task 6 — RED cases |

## Tasks

- [ ] **Task 1** — apex-critical-files.ps1: split comma-joined inputs, add a keys-certs category — files: C:\Users\User\.claude\skills\apex-code\scripts\apex-critical-files.ps1, C:\Users\User\.claude\skills\apex-code\scripts\critical-files-test.ps1, C:\Users\User\.claude\skills\apex-governance\SKILL.md — done when: the new test cases flag as specified and the suite exits 0.
  - 1b. Comma-joined inputs are not split, though the scope checker splits them, so one `-Paths` element that packs two comma-separated paths classifies neither. MECHANISM: before classifying, split each `-Paths` and `-AdditionalPaths` element on commas, mirroring codex-scope-check.ps1:535-539; then TRIM each resulting piece and SKIP any blank piece (a trailing comma such as `src,` yields an empty piece that must not classify or over-fire); classify each remaining path independently.
  - 1c. No private-key / certificate category exists. MECHANISM: add a `keys-certs` critical category matching id_rsa, id_ed25519, and any basename ending `.key`, `.pem`, `.pfx`, `.p12`, `.jks`, `.keystore`. apex-critical-files.ps1:1-4 declares apex-governance/SKILL.md the source of truth for the category set, so ALSO add `keys-certs` to that governance skill's declared critical-category list (near its lines 98-105) — otherwise the executable diverges from its declared source. This governance file is touched by no other task, so the wave stays file-disjoint.
  - Test additions (critical-files-test.ps1, table-driven runner — already exits non-zero on failure): a comma-joined-pair case (one element packing two paths where at least one is critical → exit 10, that path's category present) and a key/cert case (exit 10, category keys-certs) — both RED on current code; plus a trailing-comma regression-guard case (an input like `src,` must NOT over-fire — the empty piece is trimmed and skipped, so no spurious critical) that pins the new split behaviour.

- [ ] **Task 2** — apex-family-gate.ps1: select the newest build regardless of status and map each failure condition to the correct exit code rather than falling back to an older reviewed build — files: C:\Users\User\.claude\skills\apex-code\scripts\apex-family-gate.ps1, C:\Users\User\.claude\skills\apex-code\scripts\family-gate-test.ps1 — done when: the new cases map to the exit codes named below and the suite exits non-zero on any failed assertion. EXIT-CODE CONTRACT (existing, at apex-family-gate.ps1:6-10 and 163-164): 0 = a valid selected build that HAS a review; 12 = a valid selected build with NO review; 13 = NO valid selected build. Every mechanism below must honour this mapping — do NOT use a blanket 13.
  - 2a. The gate discards all non-terminal-success rows before selecting a build, so an older reviewed build A masks a newer running / failed / blocked build B and the gate exits 0 for A while the tree may hold B's unverified work. MECHANISM: select the NEWEST build-phase row for the spec/task/worktree regardless of status. If the newest is NON-TERMINAL (running / blocked / failed) there is no valid selected build → exit 13. If the newest is a VALID terminal build but UNREVIEWED → exit 12 (per the contract), NOT 13. Never fall back to an older reviewed row.
  - 2b. Malformed non-blank ledger rows are silently skipped (`catch { continue }`), so a truncated newest row disappears and an older reviewed build is chosen. Also, a JSON-valid row that matches spec/task/worktree but is MISSING a required field (e.g. no `phase`) parses fine, is dropped by the build-phase filter, and lets an older build pass. MECHANISM: (i) validate the REQUIRED FIELDS — `phase`, `status`, `started`, `spec`, `task`, `worktree_key` — on every row that matches the query; if a query-matching row lacks any of them, FAIL CLOSED (exit 13 — a query-matching row that cannot be validated may be the newest build). (ii) On a JSON parse failure, scope the fail-closed to rows that plausibly belong to THIS query: if the malformed line does not substring-contain the query's spec name, SKIP it (a corrupt line for another spec must not poison this gate fleet-wide); only a malformed line that substring-contains the spec name fails closed (exit 13). A blank line remains a legitimate skip. RESIDUAL: a corrupt line that happens to contain this spec's name blocks this spec's gate until the line is cleaned — document that.
  - 2c. An invalid or missing `started` is assigned DateTimeOffset.MinValue, so an unreviewed build with `started` = "invalid" sorts before an older valid reviewed build. MECHANISM: reject any candidate row whose `started` does not parse — exit 13 immediately (an explicit fail-closed, not a silent skip). For deterministic ordering when two rows share an equal `started`, use the row's LEDGER APPEND ORDER (its line index in the ledger file) as the secondary sort key — NOT `run_id`, which is a random GUID and would let an older build's GUID sort last and win, recreating the masking bug.
  - 2d. `worktree_key` is compared with `-ceq` (case-sensitive), causing a spurious exit 13 on Windows casing drift of the worktree path. MECHANISM: compare `worktree_key` case-insensitively. This is a careless-drift case and in scope. NOTE: fixing the casing makes the row MATCH, so the fixed case then reaches the normal path and its expected exit is 0 (reviewed) or 12 (unreviewed) per the fixture — it is NOT a fail-closed case.
  - Test additions (family-gate-test.ps1): a newest-non-terminal-masking case (exit 13), a missing-required-field case (a query-matching row lacking `phase` → exit 13), a malformed-newest-row case scoped to the spec name (exit 13), an invalid-`started` case (exit 13), and a casing-drift case (expects a successful match — exit 0 or 12 per its fixture, NOT 13). First confirm the harness exits non-zero on a failed assertion; add an exit-on-failure accumulator if it lacks one. The four fail-closed cases must be RED on current code.
  - EXISTING TEST — in-scope edit: family-gate-test.ps1:86-90 `failed-attempt-build-ignored` currently expects a newer FAILED build to be IGNORED (exit 12); that prior expectation IS the fail-open 2a fixes. UPDATE that existing assertion to the new expected code — exit 13 (the newest is non-terminal / failed → no valid selected build) — with a one-line note that its prior expectation encoded the fail-open. This is an edit to an existing case, not just an addition.

- [ ] **Task 3** — apex-spec-validate.ps1: recognize tilde fences and match unresolved markers case-insensitively — files: C:\Users\User\.claude\skills\apex-code\scripts\apex-spec-validate.ps1, C:\Users\User\.claude\skills\apex-code\scripts\spec-validate-test.ps1 — done when: a tilde-fenced-only spec and a lowercase-marker spec both FAIL validation and the suite exits non-zero on a failed assertion.
  - 3a. Only backtick fences are recognized (the fence regex near line 36 matches only three or more backticks), so a spec whose every heading, table and task lives inside a tilde fence has that example counted as real structure and can exit 0. MECHANISM: recognize tilde (`~{3,}`) fences as well. Char-tracking alone is not CommonMark-correct — track BOTH the opening fence CHARACTER and its RUN LENGTH: a closer must be the same character, its run length must be ≥ the opener's, and it may contain only trailing spaces after the run (so a 4-tilde opener is NOT closed by a 3-tilde line, and a tilde fence is not closed by backticks or vice versa).
  - 3b. The unresolved-marker regex near line 276 is CultureInvariant but not IgnoreCase, so a lowercase spelling of an unresolved marker (the same tokens the check already catches in uppercase, plus the angle-bracket placeholder token) slips the NO-UNRESOLVED-MARKERS check. MECHANISM: add the IgnoreCase option to that regex while keeping its existing word boundaries — do not broaden what counts as a marker, only make the existing set case-insensitive.
  - Test additions (spec-validate-test.ps1): a spec whose required structure appears only inside a tilde fence (must FAIL validation, exit 1); a spec with a 4-tilde opener enclosing a 3-tilde line plus headings inside the enclosed block (the enclosed headings must NOT count as structure, so validation still FAILs for lack of real structure — proving run-length matters); and a spec containing a lowercase spelling of one of the existing markers (must FAIL validation). Verify the suite exits non-zero on a failed assertion; add an exit-on-failure accumulator if it lacks one. All cases RED on current code.

- [ ] **Task 4** — apex-baseline-check.ps1: anchor recipe headings to end-of-line and run the bash recipe path with pipefail — files: C:\Users\User\.claude\skills\apex-code\scripts\apex-baseline-check.ps1, C:\Users\User\.claude\skills\apex-code\scripts\baseline-check-test.ps1 — done when: a deprecated-block-shadowing case and a failing-piped-command case both report RED after the fix.
  - 4a. Recipe headings are matched with a `\b` word boundary (near line 68), so a candidate heading also matches a longer heading such as one suffixed "(deprecated)"; with the document-order scan an earlier deprecated block containing `exit 0` is selected over the real, later, failing block. MECHANISM: anchor the heading pattern to end-of-line so only an exact `## <candidate>` heading matches (allow trailing whitespace, but no trailing text after the heading). IN-SCOPE FIXTURE MIGRATION: baseline-check-test.ps1:31-40 `New-Repo` generates recipes headed `## Verify commands (test recipe)` — a non-exact heading that this anchor would now reject as NO_RECIPE, breaking the existing green / red / fallback / hook cases. Migrate the `New-Repo` helper so its fixtures keep matching (use an exact `## Verify commands` heading, or otherwise keep the existing cases green) as part of this task.
  - 4b. The bash recipe path (near line 214, `bash -lc "cd '…' && $cmd"`) runs without pipefail, so a pipeline such as one piping a failing command into `tee` reports GREEN when the left-hand side fails. MECHANISM: run the bash path with pipefail — prefix `set -o pipefail; ` inside the `-lc` string, or invoke bash with `-o pipefail`. RESIDUAL, document in a comment and in this spec's residual-limits note: the cmd.exe and PowerShell recipe paths cannot cheaply propagate pipe failure; do not attempt them in this wave.
  - Test additions (baseline-check-test.ps1): a case where an earlier deprecated recipe block contains `exit 0` and shadows a later real block that fails; and a failing-piped-command case where a failing command is piped into a passing command (e.g. into `tee` or `true`). The pipefail case must be written with an EXPLICIT bash-tagged fence — `New-Repo`'s default recipe is an unlabeled cmd recipe where pipefail is deliberately residual, so the test must create a bash-fenced recipe to exercise the fix. Both must report RED after the fix. Verify the suite exits non-zero on a failed assertion; add an accumulator if it lacks one.

- [ ] **Task 5** — codex-scope-check.ps1: make mode switches mutually exclusive and fail closed on git launch/error; rebuild the test runner into a portable exit-non-zero suite — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-scope-check.ps1, C:\Users\User\.claude\skills\apex-code\scripts\scope-check-test.ps1 — done when: the rebuilt runner exits non-zero on any FAIL and the two new cases (mode exclusion, git launch/hash error) are RED before the fix and GREEN after.
  - 5d (do this FIRST, it is load-bearing for verifying 5a–5b). scope-check-test.ps1 is NOT a mature suite — it is a single ad hoc scenario with a hardcoded stale absolute session path at line 3, and it has no `exit` statement, so it always exits 0 and certifies whatever it runs against. MECHANISM: REBUILD it into a portable, `$PSScriptRoot` / `$env:TEMP`-based, accumulator-driven suite (mirror the shape of family-gate-test.ps1) that increments a failure counter on each failed assertion and ends with a non-zero exit when any assertion failed. Only after this rebuild can 5a–5b be shown RED-before-GREEN.
  - 5a. The mode switches (`-Snapshot`, `-Check`, `-EncodingScan`) are not mutually exclusive, so `-Snapshot -Check` in one call, after unauthorized writes, takes a NEW snapshot, exits 0, overwrites the evidence, and never runs the check. MECHANISM: enforce mutual exclusion — refuse with a non-zero exit and a diagnostic if more than one mode switch is supplied.
  - 5b. `git hash-object` and `git ls-files` failures are converted to the `-` sentinel without checking exit codes, so a dirty write-only file hashes to `work:-` both before and after and reads as untouched host work. MECHANISM: guard both the LAUNCH and the exit code — checking `$LASTEXITCODE` alone is still fail-open, because Invoke-Git sets `ErrorActionPreference = Continue` and in PowerShell 5.1 a failed `& git` LAUNCH (git not found / access denied) may not assign `$LASTEXITCODE`, leaving a stale prior 0. Reset `$LASTEXITCODE` to a known sentinel before the call AND wrap the call in try/catch for a launch exception; treat "still sentinel" or a caught exception or a non-zero exit as FAIL CLOSED (throw) rather than returning the `-` sentinel — distinguish "file absent" (legitimate `-`) from "git errored / failed to launch" (fatal).
  - Test additions (scope-check-test.ps1): after the 5d rebuild, add a mode-exclusion case (two mode switches → non-zero refusal) and a git launch/hash-error case (a state that makes a git hash fail or fail to launch → the check throws / fails closed rather than reporting clean). Each RED before its fix.

- [ ] **Task 6** — tree-pin.ps1: fail closed on any git launch/error in the fingerprint path — files: C:\Users\User\.claude\skills\apex-code\scripts\tree-pin.ps1, C:\Users\User\.claude\skills\apex-code\scripts\tree-pin-test.ps1 — done when: a non-git-directory case is detected (fail closed, not exit 0) and was RED on current code.
  - 6a. No git invocation checks its exit status (Get-TreeFingerprint and Get-PathDigest, near lines 61, 121), so a non-git directory or a consistently-failing git hashes the same empty fingerprint both times and Verify exits 0 having inspected nothing. MECHANISM: guard both the LAUNCH and the exit code after every git call in the fingerprint path — as in 5b, checking `$LASTEXITCODE` alone is fail-open in PowerShell 5.1 because a failed `& git` launch may not assign it, leaving a stale prior 0. Reset `$LASTEXITCODE` to a known sentinel before each call AND wrap in try/catch for a launch exception; treat "still sentinel" or a caught exception or a non-zero exit as FAIL CLOSED (throw). Do not treat an empty status as "unchanged" when git itself failed or failed to launch. Forbidden: special-casing unborn-HEAD as a tolerated non-error — that re-opens a fail-open.
  - RESIDUAL, note in a comment and in this spec's residual-limits note: do NOT fix the C-quoted-path unescaping near line 124 — that is quotePath evasion, out of scope this wave.
  - IN-SCOPE FIXTURE FIX: Initialize-TestTree (tree-pin-test.ps1:27-36) runs `git init` + `git add` but NEVER commits, leaving an unborn HEAD, so `git rev-parse HEAD` (tree-pin.ps1:118) returns exit 128 on EVERY existing fixture — the 6a fail-closed fix would then throw on all of them. Add a `git commit` to Initialize-TestTree so the fixtures have a real HEAD, AND regenerate or remove the frozen byte fixture at tree-pin-test.ps1:101-105 (it records the old failed "HEAD HEAD" result and would no longer match).
  - Test additions (tree-pin-test.ps1): a non-git-directory case (Pin or Verify must fail closed, not exit 0), RED on current code. Verify the suite exits non-zero on a failed assertion; add an accumulator if it lacks one.

## Wave plan
Wave 1: [Task 1, Task 2, Task 3, Task 4, Task 5, Task 6]
All six surviving tasks stay in one parallel wave. Each script and its test file are pairwise disjoint across tasks; Task 1 also touches apex-governance/SKILL.md, which no other task touches, so the wave remains fully file-disjoint and runs in parallel. (Three sub-fixes were cut to Deferred; the six tasks each retain at least one fail-open fix.)

## Permissions

The following actions will run autonomously during build.
Approving this spec approves all of them.

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | The files listed in Files to Change (six scripts + six test suites + apex-governance/SKILL.md for Task 1) |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File <one of the *-test.ps1 suites>` | Run each modified test suite to confirm RED-before-fix and GREEN-after |
| `[scriptblock]::Create((Get-Content -Raw <file>))` on each modified .ps1 | Parse-check each modified script is syntactically clean |
| `git init` / `git add` / `git commit` / `git status` inside each suite's throwaway scratch repo | Build the fixtures the suites need; no operations on the real repo |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | (build-time: staging is done by the session per project Git rules, not by this spec) |
| `git commit` | (none inside this spec; per-spec commit handled at session level) |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` / `LOCALAPPDATA` | Scratch fixture repos and gate state directories, as the suites already use |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network, no package installation |

## Specialist Context
### Security
Residual limits, carried forward deliberately and documented in-code where the task touches them:
- baseline-check: the cmd.exe and PowerShell recipe paths cannot cheaply propagate pipe failure — only the bash path gains pipefail this wave.
- baseline-check (fleet-wide, intended): enabling bash pipefail is a compatibility change — it can turn a previously-green baseline RED in any other repo whose bash verify recipe silently tolerated a failing pipe left-hand side. This is the intended effect, not a regression.
- family-gate: a corrupt ledger line that substring-contains this spec's name blocks this spec's gate (exit 13) until the line is cleaned; a corrupt line for another spec is skipped and does not poison the fleet.
- tree-pin: C-quoted-path (core.quotePath) unescaping is not fixed — it is quotePath evasion, outside this wave's careless-coder threat model.
- Evasion hardening in general (base64, Unicode games, deliberate override abuse) is out of scope by the standing threat model.

Deferred to a later, design-first wave (see the Deferred section at the top) — NOT to be implemented here:
- Directory / prefix-grant critical category (was Task 1a) — needs prefix semantics or post-write classification.
- Host-file prohibition ordering in codex-scope-check.ps1 (was Task 5c) — no such prohibition exists to reorder; a pre-authorization reject is new policy needing a defined path-set.
- Ignored-entry fingerprint in tree-pin.ps1 (was Task 6b) — needs the in-process path+length+mtime digest adopted first, to avoid the per-file git-hash storm that previously wedged dispatch.

### Performance
(none)

### Accessibility
(none — no frontend change)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | each modified .ps1 | Comment each fix at its site, stating the fail-open it closes and any residual limit |
| ADR | (none) | No ADR — these realize existing gate intent (bug fixes), not new architecture |

## Acceptance Criteria
- [ ] Task 1 → verify: apex-critical-files.ps1 splits and trims comma-joined inputs (blank pieces skipped) and gains a keys-certs category that is ALSO added to apex-governance/SKILL.md's declared category list; critical-files-test.ps1 gains a comma-joined-pair case and a key/cert case (both RED on pre-fix code) plus a trailing-comma regression guard; the suite exits 0 after the fix.
- [ ] Task 2 → verify: apex-family-gate.ps1 selects the newest build-phase row and maps each condition to the correct exit code (0 reviewed / 12 valid-unreviewed / 13 no valid selected build); family-gate-test.ps1 gains newest-non-terminal-masking (13), missing-required-field (13), spec-scoped malformed-newest-row (13), and invalid-started (13) cases — each RED before and fail-closed after — plus a casing-drift case that MATCHES (exit 0 or 12, NOT 13); and the existing `failed-attempt-build-ignored` assertion is updated from exit 12 to exit 13; the suite exits non-zero on any failed assertion.
- [ ] Task 3 → verify: spec-validate-test.ps1 gains a tilde-fenced-only spec, a 4-tilde-opener-over-3-tilde-line spec (enclosed headings not counted as structure), and a lowercase-marker spec; all FAIL validation after the fix and were RED before; the suite exits non-zero on a failed assertion.
- [ ] Task 4 → verify: apex-baseline-check.ps1 anchors the heading to end-of-line (with the `New-Repo` fixtures migrated so existing green/red/fallback/hook cases still pass) and runs the bash path with pipefail; baseline-check-test.ps1 gains a deprecated-block-shadowing case and a bash-fenced failing-piped-command case; both RED after the fix; the suite exits non-zero on a failed assertion.
- [ ] Task 5 → verify: scope-check-test.ps1 is rebuilt into a portable `$PSScriptRoot`/`$env:TEMP` accumulator suite that exits non-zero on any FAIL (5d), and its new mode-exclusion and git launch/hash-error cases are RED before their fixes and GREEN after; the git guard resets/try-catches the launch, not bare `$LASTEXITCODE`.
- [ ] Task 6 → verify: tree-pin.ps1 fails closed on any git launch/error in the fingerprint path (reset/try-catch guard, unborn-HEAD not special-cased); Initialize-TestTree now commits and the frozen byte fixture is regenerated/removed; tree-pin-test.ps1 gains a non-git-directory case, RED before and fail-closed after; the suite exits non-zero on a failed assertion.
- [ ] Spec-wide → verify: every modified .ps1 parse-checks clean via `[scriptblock]::Create((Get-Content -Raw <file>))`; every touched test harness exits non-zero on a failed assertion; no evasion-hardening was added; the three Deferred sub-fixes were NOT implemented.

## Progress
_(Coding mode writes here — do not edit manually)_
