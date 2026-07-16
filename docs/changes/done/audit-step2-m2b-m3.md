---
spec: audit-step2-m2b-m3
status: ready
autonomy_level: L2
coder_model: codex         # Codex gpt-5.6-sol, dispatched per task through the wrapper (routing table).
                           # Step 1 empirically ran the temp-fixture suites — incl. dispatch-test.ps1,
                           # which launches the wrapper + fakecodex — GREEN under a Codex dispatch: the
                           # temp `git init`/`commit`/`worktree` fixtures live OUTSIDE the worktree
                           # snapshot, so the scope-lock does not touch them. PER-TASK fallback: if a
                           # task's dispatch reports BLOCKED on a sandbox denial (denied writes to the
                           # harness state dir or .git, as step 1's Task 4 hit), the HOST adjudicates an
                           # in-session Opus worker for THAT task only — not a blanket pin.
cross_model_review: true   # Codex builds -> Claude reviews (wave reviewer). Any Opus-fallback task gets
                           # a Codex review instead (cross-family always; ADR-032/034). Harness safety change.
coder_effort: high         # gate mechanism + before-reservation placement is load-bearing; fail-closed.
---

# Spec: Audit step 2 — M2b pre-dispatch baseline pre-flight + M3 deterministic spec validator

**Identity:** Wires the pre-dispatch baseline gate (exit 72) and a deterministic spec validator into the harness — the two In-Flight items the joint audit upgraded (#5 M2b, #4 M3), plus the shell-aware / fail-closed fixes to the M2a checker.
→ why: see `docs/technical/adr/ADR-040-preflight-gate-and-spec-validator.md`, `docs/research/apex-v2-joint-audit-2026-07-15.md` (#4, #5), `docs/research/reconciliation-pass.md` (§ M2b/M3). Do not restate rationale in this spec.

## Intent
- **Intent:** Close the "named in status.md but not mechanised" gap for the baseline-green pre-dispatch gate and the readiness gate's Files-to-Change core — make both machine-enforced, fail-closed, and portable across bash/PowerShell/cmd recipes.
- **Invariants:**
  - `apex-baseline-check.ps1` returns a DISTINCT `NO_RECIPE = 4` for a missing `AGENTS.md` or a missing `## Verify commands` heading — neither is silent green any more; consumers decide policy.
  - Every recipe line executes under the shell its opening code-fence declares (`bash`/`sh` → Git-bash; `powershell`/`pwsh` → `powershell.exe`; `cmd`/`bat`/no-tag → `cmd.exe`); `&&` is the executing shell's own — the checker never splits a line.
  - A build dispatch (`-Phase build`, `-Sandbox workspace-write`) into a red / unparseable / recipe-less baseline, or a spec that fails validation, is REFUSED with **exit 72**, leaving **no ledger row and no dispatch log for the refused run** (the shared state dirs and the legacy-ledger copy predate the gate; the per-invocation pin file is cleaned on every exit path).
  - The tree the gate verified is the tree the coder receives, **verified at the launch boundary** (the pin is taken early, before reservation, and re-verified at the last moment before the child starts). A tree that moved by then → **exit 69** with the (by-then-existing) ledger row updated to `failed`/`tree-moved`.
  - `apex-spec-validate.ps1` deterministically fails a spec whose criteria/tasks/permissions name a file absent from `## Files to Change`, that carries an unresolved marker, that has an uncovered task↔criterion, or that is missing a required heading; a green run is reproducible.
  - This spec PASSES its own validator's files-completeness rule (dogfood).
- **Non-goals:**
  - No `-DetectOnly` mode is added anywhere (Sol BLOCK 4 — nothing for a circular self-call to reach).
  - No heuristic subset selection inside `-Preflight` (a repo opts into a fast path by declaring `## Preflight commands`; absent that, the full recipe runs — ADR-040).
  - Does NOT touch: critical-file confirmation (#3), the cross-family ledger (#7), cap-guard (#8), tree-pin multi-root (#9), or any FLAG-wave content cut (#11–16). The M2a pre-commit hook is already shipped — not re-touched here.
  - Does NOT make `-Authorized` mandatory (audit #6's fail-closed half is a separate future BLOCK).

## Assumptions
- `apex-baseline-check.ps1`, `codex-dispatch.ps1`, `install-baseline-hook.ps1`, `tree-pin.ps1`, `baseline-check-test.ps1`, and `dispatch-test.ps1` are all git-tracked in the `~/.claude` repo (M2a shipped them; `~/.claude` blanket-ignores `*`, so they were `git add -f`'d). → impact if wrong: Caution (the Task-5 baseline-from-history gate needs `git show HEAD:` to resolve; if a file is untracked, STOP and report rather than skip the regression).
- In `codex-dispatch.ps1`, `$harnessStateDir` (line 114), `$ledgerDirectory`/`$ledgerPath` (117-118), `ConvertTo-SafeFileName`, `Get-WorktreeKey`, and `Invoke-WithLedgerLock` are all defined ABOVE the insertion point named in Task 3 (after line 626). Verified: they are defined at lines 114-223. → impact: Stop (if any is defined below the insertion point, hoist the pre-flight block to just before the reservation at line 716 — still before the row write at 738 — and report the move).
- The ledger row is only WRITTEN inside the mutex at lines 738-742; nothing durable (no row, no log file at 665) is created before the Task-3 insertion point (line 626). Verified against the current file. → impact: Stop.
- Git-for-Windows `bash.exe` is resolvable on the host via PATH or the `git --exec-path` sibling; `powershell.exe` is on PATH. → impact: Caution (a build into a bash-recipe repo refuses with exit 72/UNPARSEABLE if bash is unresolvable — by design).
- The tests' `git init`/`commit`/`worktree` run inside throwaway `$env:TEMP` fixtures, which sit OUTSIDE the dispatched worktree's scope snapshot — so a Codex dispatch may run them (step 1 proved this: its Task-3 verify ran all three harness suites, including `dispatch-test.ps1`, green under a Codex dispatch). Per-task fallback rule: a task whose dispatch reports BLOCKED on a sandbox denial (denied writes to the harness state dir or `.git`, as step 1's Task 4 hit) is re-run by the host as an in-session Opus worker for that task only. → impact: Caution (a sandbox-denial block is the fallback trigger, not a spec defect — do not treat exit 67 here as unrecoverable; route the single task to Opus).
- `apex-code` SKILL.md is 317 lines and `apex-plan` SKILL.md is 240 lines (both well under the 500 cap), so the doc edits in Tasks 8-9 have ample headroom. → impact: Low.

Simplicity check: considered folding M3's validator into `apex-baseline-check.ps1` — rejected: they answer different questions (is the tree green vs. is the spec well-formed) and have different authoritative homes (dispatch vs. the plan-side readiness gate). Two small deterministic scripts sharing no state is simpler than one overloaded one. Why this version: the audit's execution-order step 2 pairs M2b and M3 explicitly, and both land in the same dispatch pre-flight block (Task 3), so building them together amortises that one wiring.

## Prerequisites
- Specs that must be complete first: none (M2a `apex-baseline-check.ps1` already exists and is the file Task 1 modifies).
- Environment setup required: `powershell.exe` (Windows PowerShell 5.1), Git-for-Windows on PATH, `codex` NOT required (the dispatch tests drive `dispatch-test-fakecodex.ps1` via the `-CodexExecutable` override).

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\AGENTS.md` | create | Task 0 — the `~/.claude` repo's own verify recipe (`## Verify commands` + fast `## Preflight commands`), so builds dispatched INTO `~/.claude` do not self-wedge on NO_RECIPE once Task 3's gate is live; plus brief two-tree / no-commit repo notes for Codex |
| `C:\Users\User\.claude\skills\apex-code\scripts\apex-baseline-check.ps1` | modify | Task 1 — exit 4 NO_RECIPE (A1), shell-aware execution (A2), `-Preflight` block/full-fallback (A3), update header contract comment |
| `C:\Users\User\.claude\skills\apex-code\scripts\apex-spec-validate.ps1` | create | Task 2 — the deterministic spec validator (B1), four named checks |
| `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1` | modify | Task 3 — `-SkipBaselineCheck` param, the M2b/M3 pre-flight block before the ledger reservation, exit 72, dispatch-side validator (B3), ledger `baseline_skipped` field |
| `C:\Users\User\.claude\skills\apex-code\scripts\install-baseline-hook.ps1` | modify | Task 4 — refuse to install into a NO_RECIPE (exit 4) repo (A5) |
| `C:\Users\User\.claude\skills\apex-code\scripts\baseline-check-test.ps1` | modify | Task 5 — extend with NO_RECIPE=4, shell-fence, and `-Preflight` cases (A6); re-expect the two named NO_RECIPE cases |
| `C:\Users\User\.claude\skills\apex-code\scripts\spec-validate-test.ps1` | create | Task 6 — loud-fail suite for the validator (B4) |
| `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-preflight-test.ps1` | create | Task 7 — loud-fail suite for the dispatch pre-flight (A6 dispatch cases); reuses the fakecodex driver |
| `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test.ps1` | modify | Task 7 — NARROW fixture-seeding change only: its `dt3` fixture gains a trivially-green `AGENTS.md` recipe so its build dispatch passes the new gate. Print-only exit-0 semantics untouched. |
| `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test-fakecodex.ps1` | run only — not modified | Task 7 — the fake coder the new suite drives via `-CodexExecutable` (green-baseline path) |
| `C:\Users\User\.claude\skills\apex-code\scripts\tree-pin.ps1` | run only — not modified | Task 3 — the pin/verify helper the pre-flight calls (`-Pin` / `-Verify`) |
| `C:\Users\User\.claude\skills\apex-code\SKILL.md` | modify | Task 8 — add exit 72 to the exit-code table, mark the pre-flight built; version bump |
| `C:\Users\User\.claude\skills\apex-plan\SKILL.md` | modify | Task 9 — readiness-gate line to run the validator at draft→changes; version bump |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | Task 10 (tree: `~/apex`) — one row each for the apex-code and apex-plan edits |

## Tasks

- [x] **Task 0: Give `~/.claude` its own verify recipe (anti-self-wedge)** — files: `C:\Users\User\.claude\AGENTS.md`
  `~/.claude` has NO `AGENTS.md` today. Once Task 3's gate is live, EVERY build dispatched into `~/.claude` (Tasks 1-9) runs `-Preflight` against it; a missing recipe is NO_RECIPE → exit 72 → the build self-wedges. Task 0 lands FIRST (Wave 1) to prevent that. Create `C:\Users\User\.claude\AGENTS.md` containing:
  - A `## Verify commands` heading with an UNLABELED fenced block (→ cmd.exe, per Task 1's rule) whose lines are real, green, and cheap-ish, run from the repo root: `node --check hooks/destructive-command-guard.js`, `node --check hooks/lib/destructive-detect.js`, then `python hooks/destructive-guard-test.py`. These files exist today (audit step 1) and the syntax/guard-suite is green. DESIGN CONSTRAINT: the recipe must be green BEFORE the new harness suites (`spec-validate-test.ps1`, `dispatch-preflight-test.ps1`) exist — so it does NOT reference them yet. A follow-up sub-step (Task 8d) MAY extend `## Verify commands` with the new suites once they are built and green.
  - A `## Preflight commands` heading with an UNLABELED fenced block holding only the two fast `node --check` lines (no test run) — this is the block the pre-dispatch gate runs, so it stays sub-second and cannot flake on a heavy test.
  - Brief repo notes Codex reads natively: the two-tree layout (skills live in `~/.claude`, docs/index/history/ADRs in `~/apex`; a change to APEX usually touches both) and the hard rule **never `git commit`/`git push`** (leave the tree dirty for the host).
  - done when: `C:\Users\User\.claude\AGENTS.md` EXISTS with BOTH headings (`## Verify commands`, `## Preflight commands`), each followed by a non-empty fenced block, AND each recipe command exits 0 when run DIRECTLY from `~/.claude` — NOT through the checker, because the `-Preflight` switch does not exist until Task 1 lands: the two Preflight lines `node --check hooks/destructive-command-guard.js` and `node --check hooks/lib/destructive-detect.js`, plus the Verify suite line `python hooks/destructive-guard-test.py`. Checker-based verification of this recipe (via `apex-baseline-check.ps1 -Preflight`/`-Full`) is post-Task-1 and lives in Task 1/Task 5's cases and the anti-wedge criterion, not here.

- [x] **Task 1: Shell-aware, fail-closed `apex-baseline-check.ps1`** — files: `C:\Users\User\.claude\skills\apex-code\scripts\apex-baseline-check.ps1`
  - 1a. Add exit-code constant `$EXIT_NO_RECIPE = 4` beside the existing `$EXIT_GREEN/RED/UNPARSEABLE` (lines 30-33). Change BOTH silent-green paths — no `AGENTS.md` (currently `:41-44`) and no `## Verify commands` heading (currently `:55-58`) — to print a `[baseline] NO_RECIPE ...` line and `exit $EXIT_NO_RECIPE`. Keep 0/1/3 semantics otherwise. — done when: a repo with no `AGENTS.md` and a repo with an `AGENTS.md` lacking the heading each exit **4**, not 0.
  - 1b. Refactor the heading-search + fenced-block capture (currently `:50-85`) into ONE parser function that takes an ordered list of candidate headings and returns the captured command lines PLUS the opening fence's info-string (language tag). No second copy of the heading regex — the header comment already promises one shared parser. — done when: both `-Full` and `-Preflight` call the same function; the heading-match REGEX LITERAL (the `^\s{0,3}##\s*...` pattern string, NOT the plain phrase `Verify commands`, which may appear freely in contract comments) appears in exactly one code line, counted via the PS 5.1 command `(Select-String -Path skills\apex-code\scripts\apex-baseline-check.ps1 -Pattern '\^\\s\{0,3\}##\\s\*' | Where-Object { $_.Line -notmatch '^\s*#' }).Count -eq 1` — `grep` is NOT used (it is off-PATH, and the plain phrase legitimately recurs in comments).
  - 1c. Shell-aware execution (A2): from the captured info-string, `bash`/`sh` → run each line as `bash -lc "cd '<worktree>' && <line>"` using a `bash.exe` resolved from PATH or the `git --exec-path` sibling — if unresolvable, print the reason and `exit $EXIT_UNPARSEABLE` (3); `powershell`/`pwsh` → `powershell.exe -NoProfile -Command "Set-Location -LiteralPath '<worktree>'; <line>"`; `cmd`/`bat`/**no tag** → the current `cmd.exe /c "cd /d ""<wt>"" && <line>"` (back-compat, byte-for-byte unchanged). The checker passes each recipe line WHOLE — it never splits on `&&`. — done when: a `bash`-fenced recipe runs under bash, a `powershell`-fenced one under PowerShell, an unlabeled one under cmd.exe (proven by Task 5's marker-command cases).
  - 1d. `-Preflight` mode (A3): parameterise the candidate-heading list — `-Full` → [`## Verify commands`]; `-Preflight` → [`## Preflight commands`, `## Verify commands`] (first present wins). A present-but-empty `## Preflight commands` block is `exit 3` (fail closed, no silent fall-through); absent `## Preflight commands` falls back to the full `## Verify commands` recipe; neither heading present → `exit 4`. Both modes share the one parser and the one executor. — done when: `-Preflight` runs a declared `## Preflight commands` block when present and the full `## Verify commands` recipe when it is absent.
  - 1e. Update the header contract comment (lines 1-18) and the `-Full`/`-Preflight` param comments (lines 23-25): document exit 4, the shell-aware execution, and the ADR-040 `-Preflight` semantics (dedicated block or full recipe — NOT "a fast subset"; the old ADR-039 wording is withdrawn). — done when: the header lists exit `4  NO_RECIPE`, describes shell-by-fence, and no longer says "M2b will add a fast -Preflight subset".
  - 1f. FENCE-AWARE heading search + unclosed-fence guard (Wave-1 review fail-open fixes): (a) the candidate-heading SEARCH runs through the SAME start-anchored CommonMark fence-state pass as the capture loop — a `## ...` line that falls INSIDE a fenced code block NEVER matches as a heading (ONE shared fence-state scan, not a second copy of the fence rule). (b) If the recipe's opening fence is never closed (opening fence found, EOF reached before a closing fence) → print the reason and `exit $EXIT_UNPARSEABLE` (3); NEVER silently capture to EOF. — done when: an `AGENTS.md` whose EARLIER fenced example contains a literal `## Verify commands` line, with the REAL `## Verify commands` recipe further down, runs the REAL recipe (a marker command proves which ran); AND an `AGENTS.md` with an unclosed recipe fence exits 3.
  - 1g. STRICT CAPTURE CONTRACT (Wave-2 review — closes the decoy-fence-BETWEEN-heading-and-recipe fail-open; BOTH violations → `exit $EXIT_UNPARSEABLE` (3)): (a) ADJACENCY — between the selected heading and the opening recipe fence ONLY blank lines are permitted; ANY non-blank line (prose, an `Example:` caption, another heading — anything) → 3. (b) SINGLE-FENCE — after the captured recipe fence closes, if ANOTHER fence opens before the next heading (of ANY level) → 3 (ambiguous recipe). Together the recipe is ALWAYS the unique fence immediately following its heading: a decoy fence with a caption trips (a); a bare second fence trips (b). INTENTIONAL TIGHTENING vs M2a, which tolerated prose between heading and fence — now fail-closed (Task 5's historical-fixture audit confirms no previously-passing fixture relied on the old tolerance). — done when: a heading + a caption line + a fence → 3; a heading with two bare fences before the next heading → 3; a heading + blank line(s)-only + one fence → runs.
  - done when (task): exits 0/1/3/4 correctly; single parser; shell-by-fence; fence-aware heading search (a heading inside a fence never matches); unclosed recipe fence → 3; strict capture (adjacency + single-fence, else 3); header updated.

- [x] **Task 2: Deterministic spec validator `apex-spec-validate.ps1`** — files: `C:\Users\User\.claude\skills\apex-code\scripts\apex-spec-validate.ps1`
  Windows PowerShell 5.1. Input `-SpecPath <file>`. Exit 0 = valid; exit 1 = one or more findings, EACH printed as `FAIL <check>: <evidence>`. Fenced code-block content is IGNORED by all four checks alike (checks 1–3 scan only prose/tables/backtick-inline spans outside fences; check 4 STRUCTURE likewise does not count a required heading that appears only inside a fence). FENCE DETECTION (must be robust — this spec's own prose contains inline triple-backticks while describing fences): a fence delimiter is a line matching the SAME CommonMark-bounded rule the checker uses — up to 3 leading spaces (`^\s{0,3}`) then three-or-more backticks — NOT a line that merely contains a triple-backtick mid-sentence, and NOT a line whose backticks are indented 4+ spaces (that is CONTENT — an indented code block — and so CANNOT hide a marker/label/path from checks 1–4). Toggle in/out of "fenced" only on such bounded, start-anchored delimiter lines. (Authoring consequence, host-accepted: a spec's own example fences must be written with ≤3-space-indented delimiters — effectively flush-left — not nested one list-level deep under a bullet; this spec's three example fences were de-indented to comply.) The four checks, each deterministic (no judgment, a green run reproducible):
  - **(1) FILES-COMPLETENESS** (scope fixed by host decision — the 3×-bitten failure class lives in criteria and file-lists, not in rationale prose). Scan ONLY three regions: the full `## Acceptance Criteria` section, the full `## Permissions` section, and — within `## Tasks` — ONLY the text following a `files:` marker on any task or sub-task line (up to the next ` — ` em-dash delimiter or end of line). All other `## Tasks` prose is NOT scanned (this kills the false positive on rationale/cross-reference pointers). NORMALIZE each token BEFORE any file-path classification below (this fixes a vacuous-guard bug in which a backticked, comma-followed path slipped past the tests untested): (i) extract inline-code (backtick) spans from the scanned text and add their content to the token stream, then split all scanned text on whitespace into word tokens; (ii) TRIM from each token any leading/trailing backtick characters and any TRAILING punctuation drawn from the set `, ; : . ) ( ' "`; (iii) strip a leading git-ref prefix — a literal `HEAD:` or a `^[0-9a-f]{7,40}:` commit-SHA prefix — from each token (a single-letter drive prefix like `C:` is NOT a git ref and is NOT stripped). Only AFTER (i)–(iii) apply the directory-component / extension classification. A normalized word is a FILE PATH when: it contains a directory component (a `/` or `\`), AND its basename ends in a `.`-extension of 1–5 alphanumerics, EXCEPT when that extension is in the exclusion set `{.exe .dll .bat .cmd .com .log .jsonl .lock .tmp}`. A file-path word MATCHES a `## Files to Change` entry when, after separator (`\`↔`/`) and case normalisation, one path is a **component-boundary-anchored suffix** of the other — the shorter path equals the trailing whole-segment tail of the longer (example kept in a fence so this check does not scan it):
```
    scripts/x.ps1  ⊂  C:\...\scripts\x.ps1   (matches)
    x.ps1          ⊄  C:\...\scripts\x.ps1   (bare basename only matches another bare x.ps1)
```
    Every file-path word with no match → `FAIL FILES-COMPLETENESS: <token> not in Files to Change`. ACCEPTED residual false-negative (documented, not fixed): a repo-relative path can spuriously suffix-match a differently-rooted absolute path that shares a trailing segment run — accepted as far rarer than the false positives the old whole-prose scan produced.
  - **(2) NO-UNRESOLVED-MARKERS.** Any token from the unresolved-marker set appearing OUTSIDE a fenced ``` code block is a finding. The set, defined here to avoid tripping this very check:
```
    TBD    TODO    ???    <placeholder>    FIXME
```
    → `FAIL NO-UNRESOLVED-MARKERS: <marker> at line <n>`.
  - **(3) TASK-CRITERIA-COVERAGE.** Extract every task label — pattern `Task <N>` or `Task <N><letter>` — from the bolded task HEADINGS in `## Tasks`, and every label referenced in `## Acceptance Criteria` (fenced content ignored, per the note above — so a label used only as a written EXAMPLE inside a ``` block is not extracted). Example label forms, kept in a fence so this check does not extract them:
```
    Task 1   Task 5a   Task N   Task NX
```
    Every task label must have ≥1 criterion entry, and every criterion label must map to a declared task. Either direction empty → `FAIL TASK-CRITERIA-COVERAGE: <label> uncovered`.
  - **(4) STRUCTURE** (fence-aware, like checks 1–3 — a `## ...` line INSIDE a fenced block does NOT count as a present heading). Three sub-rules, in order:
    - (i) UNTERMINATED FENCE — run FIRST: if any opening code fence is never closed before EOF → `FAIL STRUCTURE: unterminated code fence at line <n>`. This fails closed rather than silently blinding checks 1–3 (which would otherwise mis-track fenced/unfenced state for the rest of the document).
    - (ii) REQUIRED HEADINGS present (each as a real heading, NOT merely inside a fence): `## Intent`, `## Assumptions`, `## Prerequisites`, `## Files to Change`, `## Tasks`, `## Wave plan`, `## Permissions`, `## Specialist Context`, `## Documentation`, `## Acceptance Criteria`, `## Progress`. Any missing → `FAIL STRUCTURE: missing heading <name>`.
    - (iii) NON-EMPTY required sections. For `## Files to Change` — POSITIVE rule (host decision; replaces the negative separator-exclusion, which a `|`-only or `| N/A |` row could still evade): apply check 1's OWN file-path token extraction — the SAME shared function (backtick-span extraction, token trimming, git-ref strip, and the directory-component + extension + exclusion-set classification), NOT a second copy — to the RAW TEXT of the section's pipe rows OTHER than the first pipe row (the header) and any separator row (`^\s*\|[\s\-:|]+\|?\s*$`). The section qualifies as non-empty ONLY if that extraction yields ≥1 file-path token; zero tokens → `FAIL STRUCTURE: empty section Files to Change`. Because a row counts only when it NAMES a plausible file, the whole vacuous-pass family dies at once — header+separator-only tables, bare `|`-only rows, and `| N/A |` rows all contribute nothing. For the other three sections: `## Tasks` ≥1 task label; `## Acceptance Criteria` ≥1 criterion line; `## Permissions` ≥1 non-blank content line — each empty → `FAIL STRUCTURE: empty section <name>`.
  - Header comment states the four checks, the exit contract, and that check (1)'s file-path rule and exemption are mechanical.
  - done when: `apex-spec-validate.ps1 -SpecPath <good-fixture>` exits 0; each deliberately-broken fixture (Task 6) exits 1 with the matching `FAIL <check>:` line.

- [x] **Task 3: Wire the M2b/M3 pre-flight into `codex-dispatch.ps1`** — files: `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1` — BLOCK (unconditional pin arm) fixed and re-verified CLOSED. Carrying two known low-severity FLAGs forward (host-tracked, not blocking): (1) pre-existing log-truncation-ordering issue (714-739 vs. 805-833, unrelated to this fix); (2) a rare I/O-failure mid-`tree-pin.ps1 -Pin` could theoretically leave a partial pin file uncleaned, since cleanup is gated on `$preflightPinArmed` which the new refusal branch sets false first.
  - 3a. Add `[switch]$SkipBaselineCheck` to the param block (near `$NoTreePin`, ~line 30), with a comment: bootstrap/emergency escape; the dispatch pre-flight is bypassed and the bypass is recorded loudly and in the ledger row.
  - 3b. Insert the pre-flight block IMMEDIATELY AFTER the `-Phase/-Schema forces read-only` block (ends line 626) and BEFORE `$worktreeKey = Get-WorktreeKey $Worktree` (line 628) — i.e. before ANY durable artifact (the log file at 665, the row at 738) exists. Guard: run ONLY when `$Phase -eq 'build' -and $Sandbox -eq 'workspace-write'`; otherwise print one `[dispatch] pre-flight skipped (phase/sandbox)` line and fall through. Sequence inside the guard:
    1. If `$SkipBaselineCheck`: print a LOUD `[dispatch] -SkipBaselineCheck: baseline/spec pre-flight BYPASSED (bootstrap/emergency)` line, set a local `$baselineSkipped = $true`, and fall through (no gate).
    2. Resolve ALL THREE helpers beside `$PSScriptRoot` via `Join-Path`: `apex-baseline-check.ps1`, `tree-pin.ps1`, AND `apex-spec-validate.ps1`. ANY missing → refuse: print `[dispatch] REFUSED (exit 72): <helper> missing — cannot run the baseline/spec pre-flight` and `exit 72` (nothing pinned yet, nothing to clean).
    3. PIN with a PER-INVOCATION label (kills cross-dispatch pin-file overwrites) whose variable `$Spec`/`$Task` components are FIRST SANITISED to the glob-safe charset `[A-Za-z0-9._-]` (every other character stripped/replaced), so the label — and the cleanup glob built from it in 3f — is wildcard-metacharacter-free BY CONSTRUCTION (it can never contain `*`, `?`, `[`, or `]`): `$specSafe = ($Spec -replace '[^A-Za-z0-9._-]','_'); $taskSafe = ($Task -replace '[^A-Za-z0-9._-]','_'); $preflightPinLabel = "preflight-$specSafe-$taskSafe-$PID-" + [guid]::NewGuid().ToString('N').Substring(0,8)`, then `& tree-pin.ps1 -Pin -Worktree $Worktree -Label $preflightPinLabel -PinDirectory $harnessStateDir`. Record `$preflightPinLabel`/`$preflightPinArmed = $true` for the launch-boundary verify (3e) and for cleanup. From here on, the try/finally of 3f guarantees EVERY exit path below deletes this run's pin file first.
    4. BASELINE: `& apex-baseline-check.ps1 -Preflight -Worktree $Worktree`; capture `$LASTEXITCODE`. `1`(RED)/`3`(UNPARSEABLE)/`4`(NO_RECIPE) → clean the pin (3f), then refuse: print `[dispatch] REFUSED (exit 72): red baseline — apex-baseline-check exit <code>` (the checker's own output is already streamed) and `exit 72`. `0` → continue.
    5. SPEC VALIDATE (B3, best-effort): resolve `$specFile = Join-Path (Join-Path $Worktree 'docs\changes') "$Spec.md"` (nested — three-argument `Join-Path` is PowerShell 6+ only and errors under Windows PowerShell 5.1). If it EXISTS → `& apex-spec-validate.ps1 -SpecPath $specFile`; exit 1 → clean the pin (3f), then refuse `[dispatch] REFUSED (exit 72): spec validation failed — <findings>` and `exit 72`. If it does NOT resolve → print one `[dispatch] pre-flight: spec docs/changes/$Spec.md not under this worktree — validator skipped (cross-tree build)` line and continue.
    6. All pre-flight checks passed → fall through to `$worktreeKey = ...` and the existing reservation. The pin stays ARMED for the launch-boundary verify. No ledger row or dispatch log has been created yet, so a 72 refusal above left none.
  - 3c. In the `$ledgerRow` ordered hashtable (687-714) add `baseline_skipped = [bool]$baselineSkipped` (declare `$baselineSkipped = $false` before the pre-flight block so the field is always present). — done when: a `-SkipBaselineCheck` build's row carries `"baseline_skipped":true`.
  - 3d. Add a comment at each new `exit 72`/`exit 69` site documenting the code (see § Documentation — there is no central exit-code contract comment in this script; the authoritative table is `apex-code` SKILL.md, updated in Task 8). — done when: the exit-72 and exit-69 sites carry a one-line contract comment.
  - 3e. LAUNCH-BOUNDARY VERIFY (design change — the tree the gate checked must be the tree the coder GETS, checked at launch, not at pre-flight time). Insert, only when `$preflightPinArmed`, IMMEDIATELY BEFORE the child starts — right before the `try { if (-not $process.Start())` block (~line 890, after the scope snapshot at 767-781 and the arg resolution at 832-870): `& tree-pin.ps1 -Verify -Worktree $Worktree -Label $preflightPinLabel -PinDirectory $harnessStateDir`. Tree moved (non-zero) → clean the pin (3f), `Update-LedgerRow -RunId $runId -Changes @{ status = 'failed'; ended = (Get-UtcTimestamp); error = 'tree moved under the pre-flight pin' }`, print `[dispatch] REFUSED (exit 69): tree moved between pre-flight and launch — the verified tree is not the tree the coder would get`, and `exit 69`. Unchanged → clean the pin (3f) and proceed to `$process.Start()`. — done when: a tree that moves between the early pin and the launch boundary yields exit 69 with the row updated to `failed`.
  - 3f. PIN CLEANUP (per Sol item 3 — no leaked pin files): the pin's lifetime from arm (step 3 of 3b) to child launch (3e) is wrapped in a `try { ... } finally { <delete-pin> }` (or an equivalent guaranteed-cleanup construct) so that EVERY exit between pin-arm and the child starting deletes this run's pin — not only the pre-flight refusals (`exit 72` after step 3) and the moved-tree refusal (`exit 69` in 3e), but ALSO the PRE-EXISTING exit-71 shared-worktree refusal (ADR-028), which sits AFTER the pre-flight/pin in the reservation flow, plus any other pre-launch throw. Deleting this run's pin means removing `Join-Path $harnessStateDir "apex-treepin-$safe-*.txt"` where `$safe = ($preflightPinLabel -replace '[<>:"/\\|?*]', '_')` (the same sanitisation `tree-pin.ps1:51` applies; the trailing `*` covers the worktree-hash tail). Because the label's `$Spec`/`$Task` components were pre-sanitised to `[A-Za-z0-9._-]` at pin time (step 3 of 3b), the label — hence this glob — carries NO wildcard metacharacter of its own; the only `*` is the trailing one this line adds, so the glob matches ONLY this run's pin, never a sibling's. The `finally` guarantees the call on every exit path once the pin is armed. — done when: after ANY pre-launch exit (72 / 69 / 71 / helper-missing) no `apex-treepin-preflight-<thisrun>-*.txt` remains in `$harnessStateDir` (helper-missing exits BEFORE the pin is armed, so there is nothing to clean; the other three are cleaned by the `finally`).
  - done when (task): a build into a red/unparseable/recipe-less tree, or one whose in-tree spec fails validation, exits 72 with NO ledger row and NO dispatch log; a green tree proceeds to reservation; review/read-only dispatches skip the gate; `-SkipBaselineCheck` proceeds with a loud note and a `baseline_skipped:true` row; a tree that moves before launch exits 69 with the row marked failed; no pin file leaks.

- [x] **Task 4: `install-baseline-hook.ps1` refuses a recipe-less repo** — files: `C:\Users\User\.claude\skills\apex-code\scripts\install-baseline-hook.ps1` — NOTE: coder skipped running `baseline-check-test.ps1` (over-cautious re the no-commit scope rule) and recreated its installer cases in isolated ad hoc fixtures instead; host accepts pending Task 5's formal suite confirming those installer cases still pass.
  Before installing, run `apex-baseline-check.ps1 -Full -Worktree <repo>` (or an equivalent recipe-presence probe using the same checker) and, if it returns `4` (NO_RECIPE), refuse: print `install-baseline-hook: refusing — <repo> has no verify recipe; write AGENTS.md ## Verify commands first` and exit non-zero WITHOUT writing the hook. A green/red/unparseable result (0/1/3) does NOT block installation (the hook's job is to run the recipe at commit time; a red baseline is exactly what it should catch later). — done when: installing into a repo with no `## Verify commands` heading refuses and writes no `pre-commit` file; installing into a repo WITH a recipe still installs.

- [x] **Task 5: Extend `baseline-check-test.ps1`** — files: `C:\Users\User\.claude\skills\apex-code\scripts\baseline-check-test.ps1`
  Same loud-fail harness (accumulate + non-zero exit) already in the file. Add cases:
  - 5a. NO_RECIPE=4 — CORRECTED ENUMERATION (the two current exit-0 cases are BOTH missing-`AGENTS.md` fixtures; the heading-less case does NOT exist today). Exact old-label → new-label mapping, both re-expected 0 → 4:
    - `'no AGENTS.md heading -> skip 0'` (fixture `New-Repo 'norecipe' $null` — note `$null` recipe means New-Repo writes NO `AGENTS.md` at all, so the old label misdescribes it) → new label `'no AGENTS.md file (norecipe) -> NO_RECIPE 4'`, expect **4**.
    - `'no AGENTS.md file -> skip 0'` (fixture `$noAg`, an empty dir) → new label `'no AGENTS.md file -> NO_RECIPE 4'`, expect **4**.
    - ADD a genuinely NEW case: an `AGENTS.md` that EXISTS but has no `## Verify commands` heading (build it with `New-RawRepo` giving a body such as `"# AGENTS`n## Notes`nnothing here"`) → expect **4**. This path is untested today.
  - 5b. Every OTHER pre-existing `Check` case keeps its original expected exit unchanged: green→0, `-Full` red→1, unparseable(heading-present-but-no-fenced-block)→3, heading-before-fence→3, indented-heading-found→0, cwd-is-`-Worktree`→0, and ALL M2a hook/installer cases. (Verify by `git show HEAD:` — see Acceptance Criteria; a dropped or silently re-expected historical case is a failure.) VERIFIED at authoring time: Task 4's installer refusal changes NO existing case — every M2a installer case (`hook-install`, `hook-backup`, `wt-main`, `hookspath`, and the `New-DataRepo`-built cases) installs into a repo that HAS a `## Verify commands` recipe; none installs into a recipe-less repo, so ONLY the two missing-`AGENTS.md` cases above change (the new heading-less case is an addition, not a re-expectation). Do NOT re-derive this. (Optionally ADD a NEW positive case: installing into a recipe-less repo now refuses — but that is Task 4's own criterion.)
  - 5c. Shell-fence cases: a `bash`-fenced recipe whose line is a bash-only test (e.g. `[ -n "$BASH_VERSION" ]`, or `echo $BASH_VERSION` asserted non-empty) exits 0 under the new checker and would fail under cmd.exe; a `powershell`-fenced recipe whose line is `if (-not $PSVersionTable) { exit 1 }` (or similar PS-only construct) exits 0; an unlabeled fence still runs under cmd.exe (a `cmd`-only line like `if "%CD%"=="" exit 1` succeeds). — mechanical marker: choose commands that PROVE the shell (a construct the wrong shell errors on).
  - 5d. `-Preflight` cases: a repo with a `## Preflight commands` block → `-Preflight` runs THAT block (marker command distinct from the `## Verify commands` block proves which ran); a repo with only `## Verify commands` → `-Preflight` falls back to it and passes; a repo with an empty `## Preflight commands` block → exit 3.
  - 5e. Fence-aware search + unclosed-fence cases (Wave-1 review additions, exercising Task 1f): a DECOY-fenced-example repo — an `AGENTS.md` with an EARLIER fenced code block containing a literal `## Verify commands` line AND the REAL `## Verify commands` recipe further down — runs the REAL recipe (a marker command distinct from anything in the decoy fence proves which ran), NOT the decoy; an `AGENTS.md` with an UNCLOSED recipe fence (opening fence, EOF before close) → exit 3.
  - 5f. Strict-capture-contract cases (Wave-2, exercising Task 1g) + historical re-expectation audit: (i) a heading with a CAPTION line (e.g. `Example:`) then a decoy fence then a real fence → exit 3 (adjacency); (ii) a heading with TWO bare fences before the next heading → exit 3 (single-fence); (iii) a heading followed by blank-line(s)-only then ONE fence → runs (0). HISTORICAL AUDIT (verified at authoring time by reading `baseline-check-test.ps1` at HEAD): the ONLY historical fixture with a non-blank line between heading and fence is `'heading before fence -> exit 3 (no fall-through)'` (it interposes a `### Notes` line), and it ALREADY expects 3 — the M2a tightening flips NO historical expected value, and NO previously-passing fixture used prose between heading and fence. No re-expectation is required; every other historical fixture places its fence immediately (blank-adjacent) after its heading.
  - done when: all new + retained cases pass; the suite still exits non-zero if any assertion fails.

- [x] **Task 6: `spec-validate-test.ps1` (loud-fail)** — files: `C:\Users\User\.claude\skills\apex-code\scripts\spec-validate-test.ps1` — coder reported done_with_concerns: (1) gitignored-new file suppresses path-scoped diff display (benign, same as Task 2's file), (2) the orchestrator's own dispatch pack carried a stale "twelve cases" count vs. the spec's authoritative sixteen — coder correctly followed the spec and flagged the conflict rather than silently reconciling. Both accepted, no code defect.
  A new suite in the accumulate-and-exit-nonzero style (never print-only). Build stripped fixture specs in `$env:TEMP` (NOT any live spec) and assert `apex-spec-validate.ps1` results:
  - a known-GOOD minimal fixture (all required headings, all criteria-named files listed, task↔criteria covered, no markers) → exit 0.
  - a fixture whose `## Acceptance Criteria` names a file BY PATH (a backticked token carrying a directory component and an artifact extension) that is absent from `## Files to Change` → exit 1 with `FAIL FILES-COMPLETENESS`.
  - a fixture whose `## Acceptance Criteria` names the missing path as a BACKTICKED, comma-followed inline token (the path wrapped in backticks and immediately followed by a comma, mid-sentence, absent from `## Files to Change`) → exit 1 with `FAIL FILES-COMPLETENESS` — proves the check-1 normalization strips the wrapping backticks and the trailing comma so the guard is NON-VACUOUS (the token would falsely pass if it were tested with its backticks and comma still attached).
  - a fixture containing an unresolved marker outside a fence → exit 1 with `FAIL NO-UNRESOLVED-MARKERS`.
  - a fixture with a task that has no matching criterion → exit 1 with `FAIL TASK-CRITERIA-COVERAGE`.
  - a fixture missing a required heading → exit 1 with `FAIL STRUCTURE`.
  - a fixture with an UNTERMINATED code fence (an opening triple-backtick fence with no matching close before EOF) → exit 1 with `FAIL STRUCTURE` (unterminated code fence).
  - four fixtures, each with exactly one EMPTY required section — `## Files to Change` with no table row, `## Tasks` with no task label, `## Acceptance Criteria` with no criterion line, `## Permissions` with no non-blank content — each → exit 1 with `FAIL STRUCTURE` (empty section).
  - a fixture where a required heading (e.g. `## Permissions`) appears ONLY inside a fenced block and nowhere as a real heading → exit 1 with `FAIL STRUCTURE` (missing heading — the fenced occurrence does not count).
  - the empty-`## Files to Change` DISGUISE FAMILY — three sibling fixtures, all headings present and no file named anywhere, `## Files to Change` containing respectively (1) ONLY header+separator rows, (2) a bare `|`-only row after the header/separator, (3) a `| N/A |` row after the header/separator → EACH exits 1 with `FAIL STRUCTURE: empty section Files to Change` (check 4 (iii)'s positive extraction yields zero file tokens for all three, so none is a vacuous pass).
  - a fixture with an unresolved-marker token placed between two 4-space-INDENTED triple-backtick lines (an indented pseudo-fence — NOT a real fence under the `^\s{0,3}` bound) → exit 1 with `FAIL NO-UNRESOLVED-MARKERS` (proves an indented pseudo-fence does not hide content from checks 1–4).
  - done when: all sixteen cases hold (one good fixture → exit 0, plus fifteen broken fixtures → exit 1); the suite exits non-zero if any fails.

- [x] **Task 7: `dispatch-preflight-test.ps1` (loud-fail) + `dispatch-test.ps1` fixture fix** — files: `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-preflight-test.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test.ps1` — retroactively confirms Task 3's provisional (ad-hoc-fixture) criteria via this formal suite.
  New loud-fail suite (do NOT copy `dispatch-test.ps1`'s print-only exit-0 pattern). Isolate the ledger with `$env:APEX_STATE_DIR` set to a fresh temp dir OUTSIDE any repo; use a UNIQUE spec name per case so "no row" is checkable by counting rows for that spec in the isolated `codex-run-ledger.jsonl` under `APEX_STATE_DIR`. Drive the launch path with `-CodexExecutable powershell.exe -CodexExecutableArgumentPrefix ... dispatch-test-fakecodex.ps1` (as `dispatch-test.ps1` does). Each fixture repo is a temp `git init` with an `AGENTS.md` whose recipe is shaped per case. Cases (each asserts exit code AND ledger-row presence):
  - RED baseline → recipe fails (unlabeled fence line `exit 1`) → **72**, ZERO rows for the unique spec — the fake coder is never reached.
  - UNPARSEABLE → `## Verify commands` heading present with NO fenced block → **72**, ZERO rows.
  - NO_RECIPE → repo has no `AGENTS.md` (or no heading) → **72**, ZERO rows.
  - SPEC-VALIDATOR FAIL (dispatch-side B3) → fixture worktree carries a `docs/changes/<spec>.md` that FAILS validation (e.g. a criterion names a path absent from Files to Change), with a GREEN baseline recipe so only the validator trips → **72**, ZERO rows.
  - MOVED-TREE at launch (deterministic, no timing race) → GREEN recipe whose OWN command mutates the tree (e.g. appends a line to a tracked file / writes a new file) during the baseline run, so the launch-boundary pin-verify reliably sees a moved tree → **69**, and the ledger row for that spec EXISTS and is `status:"failed"` with a tree-moved error.
  - GREEN baseline, clean tree → dispatch PROCEEDS past the gate (reaches the fake coder; a row IS written; exit code is not 72/69).
  - REVIEW-phase dispatch (`-Phase review` or `-Schema review`, forced read-only) → gate SKIPPED (a red recipe does NOT cause 72; proceeds/pins as a review).
  - `-SkipBaselineCheck` on a RED-baseline build → PROCEEDS (not 72), the row carries `"baseline_skipped":true`, loud bypass note printed.
  - PIN CLEANUP → after each case, assert no `apex-treepin-preflight-*` file for that run remains in the isolated `APEX_STATE_DIR` gates dir.
  - PIN CLEANUP on exit-71 (OPTIONAL — add only if cheaply reachable via the existing shared-worktree / sibling-guard fixture pattern): a build whose reservation hits the exit-71 shared-worktree refusal AFTER the pin is armed leaves NO `apex-treepin-preflight-*` file for that run — proving the try/finally cleans the pin on the 71 path too. If standing up a live second reservation holder is not cheap, SKIP this case; the 71 cleanup is then reviewer-traced, with the arm→launch try/finally (3f) named as the mechanism that cleans by construction.
  - regression: `dispatch-test.ps1` still passes (exit 0, no `FAIL` line) against the modified wrapper — its `dt3` fixture now carries a trivially-green `AGENTS.md` recipe (the Task-7 narrow fixture edit) so its build dispatch clears the new gate. This is an INTENTIONAL fixture re-expectation, not a behaviour change to that suite.
  - done when: every case above holds and the suite exits non-zero on any failure.

- [x] **Task 8: `apex-code` SKILL.md — exit 72 + pre-flight built** — files: `C:\Users\User\.claude\skills\apex-code\SKILL.md`, `C:\Users\User\.claude\AGENTS.md` — 8d ATTEMPTED and SUCCEEDED: AGENTS.md's `## Verify commands` extended with the three loud-fail suites; `apex-baseline-check.ps1 -Full -Worktree C:\Users\User\.claude` still exits 0.
  - 8a. Add a row to the exit-code table (the block beginning "The wrapper's exit codes are the contract", ~line 124): `| 72 | refused: red baseline | The pre-dispatch pre-flight found a red/unparseable/recipe-less baseline (or a failing in-tree spec validation). NOTHING was launched and NO ledger row exists. Fix the baseline (or the spec), or -SkipBaselineCheck for a bootstrap. |`. Place it in code order (after 71, before 73/75 as fits the existing ordering). ALSO update the EXISTING `69` row in the same table to state its new launch-boundary context: 69 now ALSO fires when the tree MOVES between the pre-flight pin and the launch boundary; by then the reservation HAS occurred, so — in CONTRAST to 72 (refused before reservation, NO row) — the ledger row EXISTS and is updated `failed`/`tree-moved`.
  - 8b. Update the "Baseline-green commit hook (M2a)" section (~line 214-231): the pre-dispatch pre-flight (exit 72) is now BUILT (M2b), no longer "not built"; it calls `apex-baseline-check.ps1 -Preflight` (dedicated `## Preflight commands` block or the full recipe — not a heuristic subset); note exit 4 = NO_RECIPE, `-SkipBaselineCheck` (one escape for the whole pre-flight), and that the tree pin is verified at the launch boundary (moved → exit 69).
  - 8c. Frontmatter: the version is STALE — frontmatter reads `version: 2.3.0` but SKILL-HISTORY records `2.5.0` (the 2026-07-15 wrapper pass bumped the row, not the frontmatter). Bump to **`2.6.0`** (catch up past the unrecorded 2.4/2.5, minor for the new documented pre-flight contract) and set `last_updated: 2026-07-14` → `2026-07-16`. Keep the file ≤ 500 lines. — done when: the exit table has a 72 row, the M2a/M2b section reflects the built pre-flight, and frontmatter shows 2.6.0 / 2026-07-16.
  - 8d. (Runs after Tasks 6-7 land green, same wave grouping.) OPTIONAL follow-up: extend `C:\Users\User\.claude\AGENTS.md`'s `## Verify commands` block (created recipe-only in Task 0) to also run the three loud-fail harness suites (`baseline-check-test.ps1`, `spec-validate-test.ps1`, `dispatch-preflight-test.ps1`) via `powershell.exe -NoProfile -File`. Do this ONLY once those suites are green — never add a red line to the recipe. Leave `## Preflight commands` as the fast `node --check` pair (the gate must stay sub-second). — done when: `apex-baseline-check.ps1 -Full -Worktree C:\Users\User\.claude` still exits 0 with the suites included, OR this sub-step is deliberately skipped and noted.

- [x] **Task 9: `apex-plan` SKILL.md — readiness gate runs the validator** — files: `C:\Users\User\.claude\skills\apex-plan\SKILL.md`
  - 9a. In the Readiness gate section (~line 181-215), add one line making the mechanical core a script run: on draft→changes promotion, run `powershell.exe -NoProfile -File "$env:USERPROFILE\.claude\skills\apex-code\scripts\apex-spec-validate.ps1" -SpecPath <draft>` — the ABSOLUTE path via `$env:USERPROFILE`, never a bare basename (the script's directory is NOT on PATH, so a basename would not resolve); a `FAIL` (exit 1) BLOCKS promotion (authoring constraint: fenced examples in specs must sit at ≤3-space indent — flush-left is safest; a 4+-space-indented fence is treated as content and will expose its tokens to validation). Phrase it as the deterministic backstop to the prose Files-to-Change / Coverage / structure checkboxes (which stay as judgment depth). — done when: the readiness gate names the validator with the exact `$env:USERPROFILE`-anchored `powershell.exe -NoProfile -File ...` command and states a FAIL blocks the draft→changes move.
  - 9b. Frontmatter: frontmatter `version: 2.0.0` MATCHES the latest SKILL-HISTORY record (2.0.0) — NOT stale (verified against SKILL-HISTORY). Bump minor for the new gate mechanism: `2.0.0` → **`2.1.0`**, `last_updated: 2026-07-14` → `2026-07-16`. Keep the file ≤ 500 lines. — done when: frontmatter shows 2.1.0 / 2026-07-16.

- [x] **Task 10: SKILL-HISTORY rows (tree: `C:\users\user\apex`)** — files: `C:\users\user\apex\SKILL-HISTORY.md`
  Add TWO rows at the top of the row list (newest first, columns `Date | Skill | Files | Version | Event | What Changed | Sources`), both dated `2026-07-16`:
  - `apex-code` · SKILL.md · `2.6.0` · `updated` · exit-72 pre-dispatch baseline pre-flight built (M2b), launch-boundary pin verify; frontmatter version caught up from stale 2.3.0 past recorded 2.5.0 · Sources: docs/technical/adr/ADR-040-preflight-gate-and-spec-validator.md.
  - `apex-plan` · SKILL.md · `2.1.0` · `updated` · readiness gate now runs apex-spec-validate on draft→changes (M3) · Sources: docs/technical/adr/ADR-040-preflight-gate-and-spec-validator.md.
  - done when: both rows exist above the current newest row, with all seven columns; the versions match Tasks 8-9 (2.6.0, 2.1.0).

## Wave plan
Wave 1: [Task 0, Task 1, Task 2] | Wave 2: [Task 3, Task 4, Task 5, Task 6, Task 9] | Wave 3: [Task 7, Task 8] | Wave 4: [Task 10]

<!-- Waves list tasks whose dependencies are satisfied (concurrency-eligible). DAG: Task 0 (the
     `~/.claude` recipe) MUST land before Task 3's gate goes live, so it rides Wave 1 — otherwise the
     first post-Task-3 dispatch into `~/.claude` self-wedges on NO_RECIPE. Task 0 and Task 1 both ride
     Wave 1 and are ORDER-INDEPENDENT: Task 0's done-when now verifies its recipe commands DIRECTLY (not
     through the Task-1 checker), so Task 1 does NOT feed Task 0. Task 1 feeds Tasks 3/4/5;
     Task 2 feeds Tasks 3/6/9; Task 3 feeds Tasks 7/8; Tasks 6-7 feed Task 8d; Tasks 8+9 feed Task 10.
     TREE SERIALISATION: Tasks 0-9 all write the ONE `~/.claude` worktree, so the dispatcher's
     one-worktree rule (exit 71, ADR-028) serialises them — apex-code runs them one at a time in that
     shared worktree, in the listed within-wave order (they are file-disjoint, so the order is free),
     rather than spinning up a linked worktree per task. Task 10 writes the SEPARATE `~/apex` tree, so
     it never contends for the `~/.claude` worktree and may ride in parallel with the `~/.claude`
     stream; it is placed in Wave 4 only because it records the final versions Tasks 8-9 set. A task
     that falls back to an in-session Opus worker (per the frontmatter rule) still respects this
     serialisation — same worktree, one coder at a time. -->

## Permissions
The following actions will run autonomously during build. Approving this spec approves all of them.

> **Critical harness files, attended.** Everything under `C:\Users\User\.claude\skills\apex-code\scripts\`
> is a harness SAFETY file (the dispatch/verify machinery). This batch was approved by the user
> **attended on 2026-07-16**. If any task would run unattended (AFK/dontAsk), STOP and re-confirm —
> spec text alone does not settle a critical-file edit.
>
> **Two trees, no commits.** The build leaves BOTH trees dirty; staging and commits are host-side and
> approval-gated (see § Git). Each task's `-Worktree`/edits stay inside the tree that owns its files —
> Task 10 → `C:\users\user\apex`, all others → `C:\Users\User\.claude`.

### File Operations
| Action | Paths |
|--------|-------|
| Create | `C:\Users\User\.claude\AGENTS.md`, `C:\Users\User\.claude\skills\apex-code\scripts\apex-spec-validate.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\spec-validate-test.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-preflight-test.ps1` |
| Modify | `C:\Users\User\.claude\skills\apex-code\scripts\apex-baseline-check.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\install-baseline-hook.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\baseline-check-test.ps1`, `C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test.ps1`, `C:\Users\User\.claude\skills\apex-code\SKILL.md`, `C:\Users\User\.claude\skills\apex-plan\SKILL.md`, `C:\users\user\apex\SKILL-HISTORY.md` (and `C:\Users\User\.claude\AGENTS.md` again in Task 8d) |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\baseline-check-test.ps1` | Task 5 verify (run from `~/.claude`; Windows PowerShell 5.1 — `pwsh` is not on PATH) |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\spec-validate-test.ps1` | Task 6 verify |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\dispatch-preflight-test.ps1` | Task 7 verify (drives the fakecodex helper; isolates the ledger via `APEX_STATE_DIR`) |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\dispatch-test.ps1` | Task 7 regression (existing suite still green) |
| `git init` / `git add` / `git commit` / `git worktree add` **in throwaway temp repos** | Tests seed fixture repos (NOT the live trees; temp fixtures are outside the worktree snapshot — proven runnable under Codex dispatch in step 1) |
| `git show HEAD:skills/apex-code/scripts/baseline-check-test.ps1` | Task 5 baseline-from-history regression (fail-closed if it errors/empty) |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File skills\apex-code\scripts\apex-baseline-check.ps1 -Preflight -Worktree C:\Users\User\.claude` | Task 0 verify (the new `~/.claude` recipe is green) — transitively runs `node --check` (and `python` for `-Full`) on existing `hooks/` files |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none in the live trees) | The build performs NO git writes in `~/.claude` or `~/apex`. Staging (`git add -f` the new/changed harness files; `git add` SKILL-HISTORY) and commits are host-side, after review. Test suites `git init`/`commit` only inside throwaway `$env:TEMP` fixtures. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR` | Task 7 ledger isolation (already honoured by the wrapper, line 90) |
| `FAKE_CODEX_REPO` | Task 7 fakecodex driver target (as in `dispatch-test.ps1`) |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installs; the checker executes only the fixture repos' own trivial recipe lines |

## Specialist Context
### Security
- `apex-baseline-check.ps1` executes AGENTS.md-declared verify commands on the host, unsandboxed, now under three shells (bash/PowerShell/cmd). This is the SAME trust already placed in the verify recipe (M2a); the shell-awareness widens WHICH interpreter runs a trusted line, not WHOSE lines run. AGENTS.md remains trusted, planning-authored repo content.
- The dispatch pre-flight is a REFUSE-only gate: it never edits the tree. A baseline/validator refusal (exit 72) runs before the ledger row and dispatch log exist, so it leaves neither — the ONLY partial state it can create is its per-invocation pin file, which is cleaned on every exit path (Sol item 3). The launch-boundary moved-tree refusal (exit 69) happens after the row exists and updates that row to `failed`. `-SkipBaselineCheck` is the single, loudly-logged escape for the whole pre-flight (baseline + validator).

### Performance
- The pre-flight adds a tree-pin + one `-Preflight` recipe run per build launch. On APEX's own trees the recipe is a few `wc`/`grep` lines (sub-second). A heavy consumer repo should declare a `## Preflight commands` block to keep the launch fast (ADR-040); absent that, the full recipe runs.

### Accessibility
(none — no UI.)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | the modified/new scripts | header comments: mechanism, fail-closed behaviour, exit contract |
| ADR | `docs/technical/adr/ADR-040-preflight-gate-and-spec-validator.md` | **already written** (this planning session) — the build NEVER touches the ADR (least authority). If reality diverges from it, STOP and report to the host; do not edit the ADR mid-build. |
| SKILL-HISTORY | `C:\users\user\apex\SKILL-HISTORY.md` | Task 10 — two rows (apex-code, apex-plan) |
| Exit-code contract | `C:\Users\User\.claude\skills\apex-code\SKILL.md` | Task 8 — the exit table IS the wrapper's exit-code contract (the `.ps1` has no central contract comment block — see the build note below) |

<!-- BUILD NOTE (not why): the brief said "add exit 72 to the wrapper's exit-code contract comment."
     `codex-dispatch.ps1` has NO central exit-code contract comment — its exit codes (69/71/73) live at
     their exit SITES. Task 3d therefore adds a comment at the exit-72 site; the authoritative contract
     TABLE is apex-code SKILL.md (Task 8). If a coder expects a central contract block in the script and
     cannot find one, that is expected — do not manufacture one; STOP and report only if the exit sites
     themselves have moved from the line numbers this spec cites. -->

## Acceptance Criteria

**Task 0**
- [x] `~/.claude` recipe green → verify: `apex-baseline-check.ps1 -Preflight -Worktree C:\Users\User\.claude` exits 0 AND `-Full` exits 0 against the new `AGENTS.md`. (Verified directly, per-task done-when: all three recipe commands exit 0, 78/78 guard-suite tests pass; checker-based -Preflight/-Full re-check deferred to post-Task-1.)
- [x] Anti-wedge → verify: a build-phase dispatch into `C:\Users\User\.claude` no longer hits NO_RECIPE (the `## Verify commands` + `## Preflight commands` headings are present with non-empty unlabeled fenced blocks).

**Task 1**
- [x] NO_RECIPE → verify: seeded temp repos — no `AGENTS.md` exits 4; `AGENTS.md` present but without the heading exits 4 (not 0).
- [x] Green/red/unparseable preserved → verify: green recipe exits 0; a failing `-Full` line exits 1; a heading with no fenced block exits 3.
- [x] Shell-by-fence → verify: a `bash`-fenced recipe runs under bash (a bash-only line passes) and a `powershell`-fenced one under PowerShell; an unlabeled fence still runs under cmd.exe (Task 5 marker cases).
- [x] Single parser → verify: the heading-match regex LITERAL (`^\s{0,3}##\s*...`) appears in exactly one code line — `(Select-String -Path skills\apex-code\scripts\apex-baseline-check.ps1 -Pattern '\^\\s\{0,3\}##\\s\*' | Where-Object { $_.Line -notmatch '^\s*#' }).Count -eq 1` (not `grep`, which is off-PATH; the plain phrase `Verify commands` may recur freely in contract comments).
- [x] `-Preflight` selection → verify: runs a `## Preflight commands` block when present, falls back to the full recipe when absent, exit 3 on an empty preflight block.
- [x] Header updated → verify: the contract comment lists exit `4 NO_RECIPE` and shell-by-fence, and drops the "fast -Preflight subset" wording.
- [x] Fence-aware heading search → verify: an `AGENTS.md` whose earlier fenced example contains a literal `## Verify commands` line, with the REAL `## Verify commands` recipe further down, runs the REAL recipe (a marker command proves which ran), not the fenced decoy.
- [x] Unclosed recipe fence → verify: an `AGENTS.md` with an opening recipe fence and no closing fence before EOF exits 3 (UNPARSEABLE), never a silent capture-to-EOF.

**Task 2**
- [x] Good spec passes → verify: `apex-spec-validate.ps1 -SpecPath <good-fixture>` exits 0.
- [x] Each check fires → verify: Task 6's broken fixtures each exit 1 with the matching `FAIL <check>:` line.
- [x] Determinism → verify: two runs on the same good fixture both exit 0 (reproducible green).
- [x] Dogfood → verify: running the validator on THIS spec (once promoted to docs/changes/) exits 0 — it names every file it changes in Files to Change.

**Task 3**
- [x] Baseline refusals → verify: Task 7's RED, UNPARSEABLE, and NO_RECIPE cases each exit 72 with ZERO ledger rows for their unique spec, and NO dispatch log for the refused run. (Proven via the coder's own ad hoc fixtures pending Task 7's formal suite.)
- [x] Validator refusal (dispatch-side B3) → verify: Task 7's in-tree-broken-spec case exits 72 with zero rows; a cross-tree (spec not under the worktree) build is NOT refused for that reason. (Proven via ad hoc fixtures.)
- [x] Green proceeds → verify: Task 7's GREEN case passes the gate and writes a ledger row. (Proven via ad hoc fixtures.)
- [x] Review skips the gate → verify: Task 7's review-phase case does not exit 72 on a red recipe. (Proven via ad hoc fixtures.)
- [x] `-SkipBaselineCheck` → verify: Task 7's case proceeds, prints the loud bypass note, and the row carries `"baseline_skipped":true` (one escape covers baseline AND validator). (Proven via ad hoc fixtures.)
- [x] Moved-tree at launch boundary → verify: Task 7's recipe-mutates-tree case yields exit 69, and the (existing) ledger row for that run is `status:"failed"` with a tree-moved error. (Proven via ad hoc fixtures; pin-arm gap now fixed and re-verified.)
- [x] Placement + helpers + pin hygiene → verify: baseline/validate run before `$worktreeKey` (628) so a 72 leaves no row; the launch-boundary verify sits just before `$process.Start()` (~890); all three helpers are resolved (a missing one → 72); the pin's arm→launch span is wrapped in try/finally, so NO `apex-treepin-preflight-<run>-*` file remains after ANY pre-launch exit (72 / 69 / 71 / helper-missing). NOTE: cleanup is gated on `$preflightPinArmed`, so a partial pin file left by a rare mid-write I/O failure in `tree-pin.ps1 -Pin` would not be swept — flagged, not blocking (host-tracked).

**Task 4**
- [x] Refuses NO_RECIPE → verify: installing into a temp repo with no `## Verify commands` heading refuses (non-zero) and writes no `pre-commit` file.
- [x] Installs with recipe → verify: installing into a temp repo that HAS a recipe still writes the hook (M2a install behaviour intact).

**Task 5**
- [x] NO_RECIPE cases re-expected → verify: the TWO current exit-0 cases (both missing-`AGENTS.md` fixtures: `New-Repo 'norecipe' $null` and `$noAg`) now assert exit 4 with corrected labels; PLUS a NEW `AGENTS.md`-present-but-heading-less case asserts exit 4.
- [x] Historical cases intact (baseline-from-history, FAIL-CLOSED) → verify: `git show HEAD:skills/apex-code/scripts/baseline-check-test.ps1` resolves non-empty (a `git` error or empty output FAILS the check, no fallthrough); every `Check` label present at HEAD is still present in the working file, EXCEPT the exactly two dispositioned old→new label renames listed in 5a (`'no AGENTS.md heading -> skip 0'` → `'no AGENTS.md file (norecipe) -> NO_RECIPE 4'`, and `'no AGENTS.md file -> skip 0'` → `'no AGENTS.md file -> NO_RECIPE 4'`), whose OLD labels are intentionally replaced — this exemption mirrors the expected-exit carve-out in 5b; only those two named NO_RECIPE cases changed their expected exit — every other historical case keeps its original expected value (the M2a installer cases are confirmed unaffected by Task 4's refusal: none targets a recipe-less repo). Retroactively confirms Task 4's own criterion: all M2a installer cases green after Task 4's change.
- [x] Shell + `-Preflight` cases → verify: the new bash/powershell/cmd fence cases and the `-Preflight` block/fallback/empty cases all pass.
- [x] Fence-aware + unclosed-fence cases → verify: the decoy-fenced-example repo runs the REAL recipe (marker proves which ran), and the unclosed-recipe-fence repo exits 3.
- [x] Strict-capture cases (adjacency + single-fence) → verify: a heading with a caption line then a decoy fence then a real fence exits 3; a heading with two bare fences before the next heading exits 3; a heading with blank-line(s)-only before one fence runs. Historical audit recorded: no previously-passing fixture used prose between heading and fence, so no re-expectation.
- [x] Suite integrity → verify: injecting a deliberately failing assertion makes the suite exit non-zero.

**Task 6**
- [x] Good fixture → verify: exit 0. The fifteen broken fixtures → verify: exit 1 with the matching `FAIL <check>:` line — `FAIL FILES-COMPLETENESS` (the by-path AND the backticked/comma-followed non-vacuity cases), `FAIL NO-UNRESOLVED-MARKERS` (the outside-a-fence case AND the indented-pseudo-fence case), `FAIL TASK-CRITERIA-COVERAGE`, and `FAIL STRUCTURE` (the missing-heading, unterminated-fence, four empty-section, heading-only-inside-a-fence, and the three Files-to-Change disguise-family cases: header+separator-only, `|`-only row, and `| N/A |` row).
- [x] Loud-fail → verify: the suite exits non-zero when any assertion fails (not print-only).

**Task 7**
- [x] All pre-flight cases → verify: run `dispatch-preflight-test.ps1` — RED/UNPARSEABLE/NO_RECIPE/validator-fail → 72 + no row; moved-tree → 69 + failed row; GREEN → proceeds + row; review → gate skipped; `-SkipBaselineCheck` → proceeds + `baseline_skipped:true`; pin cleaned after each; suite exits non-zero on any failure.
- [x] Regression (intentional fixture re-expectation) → verify: `dispatch-test.ps1`, with its `dt3` fixture now seeding a trivially-green `AGENTS.md`, still exits 0 with no `FAIL` line against the modified wrapper.

**Task 8**
- [x] Exit table → verify: `apex-code` SKILL.md exit-code table has a `72` row for the refused-red-baseline gate.
- [x] Exit-69 row updated → verify: the existing `69` row now states the launch-boundary / tree-moved context and that the ledger row EXISTS and is updated `failed` (contrasting 72's no-row contract).
- [x] M2a/M2b section → verify: the section states the pre-dispatch pre-flight is built and calls `-Preflight`; mentions exit 4 and `-SkipBaselineCheck`.
- [x] Frontmatter → verify: `version: 2.6.0` (caught up from stale 2.3.0 past recorded 2.5.0), `last_updated: 2026-07-16`; file ≤ 500 lines.

**Task 9**
- [x] Readiness gate → verify: `apex-plan` SKILL.md readiness section names `apex-spec-validate.ps1` and states a FAIL blocks draft→changes promotion.
- [x] Frontmatter → verify: `version: 2.1.0` (was 2.0.0, matched history — not stale), `last_updated: 2026-07-16`; file ≤ 500 lines.

**Task 10**
- [x] SKILL-HISTORY → verify: two new top rows dated `2026-07-16` for `apex-code` `2.6.0` and `apex-plan` `2.1.0`, each with all seven columns, above the current newest row.

**Cross-cutting**
- [x] Path-scoped diffs only → verify: `git diff --stat` in `~/.claude` shows changes confined to the listed `skills/apex-code/scripts/*`, the two SKILL.md files, and `AGENTS.md`; in `~/apex` confined to `SKILL-HISTORY.md` (both trees carry unrelated dirty host work — do NOT assert a repo-wide "only these files changed"). Confirmed: 7 tracked files + 4 gitignored-new files in ~/.claude (exactly the spec's list), 1 file in ~/apex.

## Progress
_(Coding mode writes here — do not edit manually)_
