---
spec: retro-wrapper-hygiene
status: draft
autonomy_level: L2
risk: high
coder_effort: high
max_parallel_codex: 1
---

# Spec: Dispatch-wrapper hygiene — capacity lease, orphan recovery, creator teardown, ledger telemetry

**Identity:** Rebuilds `codex-dispatch.ps1`'s reservation, orphan, teardown, and ledger-telemetry
mechanisms so the cap, the adoption path, worktree teardown, and per-row telemetry are enforced in
code rather than in prose.
→ why: see docs/research/artemis-retro-2026-07-29.md (P1a, P5, P6, P7a2) and
docs/research/ledger-stratification-2026-07-30.md.

## Intent
- **Intent:** `max_parallel_codex`, worktree teardown, orphan recovery, and ledger telemetry become
  wrapper mechanisms with distinct exit codes, instead of documented steps a host must remember.
- **Invariants:**
  - A build slot is held from before pre-flight to terminal state; two concurrent wrappers **sharing
    one state root** cannot both pass the cap check.
  - Every refusal AFTER lease acquisition leaves **no dispatch record** and **no dispatch log** on
    disk (ADR-040 as amended by Task 10): only the lease row and its appended `refused-preflight`
    close event, which are lease artifacts, not dispatch records. Refusals BEFORE lease acquisition
    (exit 74 caller-contract, exit 79 at-capacity) leave nothing at all.
  - The refusal-recording path is append-only; the ONLY rewrite this spec adds is Task 3's orphan
    batch pass, which is idempotent and touches only rows it transitions.
  - A dead `running`/`adopting`/`stalled` row, and a `leasing` row with no matching `lease_close`
    event, is never rewritten to a terminal status by the wrapper; it becomes `orphaned`. A `leasing`
    row that HAS been closed is already resolved and is never orphaned.
  - Worktree teardown never runs `git worktree remove --force`, never runs with a non-empty
    `git status --porcelain`, never runs while an unresolved sibling row holds the tree, and never
    deletes a branch (ADR-046 D8).
  - Every wrapper-written ledger row carries `log_path`, `effort`, and an `attended` property that is
    ALWAYS present, valued `true`, `false`, or `null` (`null` = not reported by the caller).
- **Scope limit (Task 9):** the declared-path check proves visibility **in this worktree at this
  commit only**; cross-worktree and integration-branch divergence is out of scope.
- **Scope limit (cap):** the cap is enforced **per state root** — the `APEX_STATE_DIR` →
  `LOCALAPPDATA` → `TEMP` chain resolved at codex-dispatch.ps1:171-199. Wrappers pointed at different
  state roots count different ledgers and are explicitly out of contract.
- **Non-goals:** parallelising the attended path (P1b), scope-check exclusion changes (P2), the
  reachability criterion (P3), review-round convergence (P4), effort-default changes (P7a), and any
  edit to `~/.claude/hooks/apex-ledger-append.ps1`.

## Assumptions
- The build target worktree is `C:\Users\User\.claude`, whose `.gitignore` is a blanket `*`; the
  wrapper and its tests are tracked via `git add -f` and therefore visible to `git ls-files` →
  impact: Stop (a wrong reading here makes T9's own check refuse this spec's build).
- This spec is built cross-tree: it lives in the `apex` repo and is dispatched into `~/.claude` via
  `-SpecSourcePath` (codex-dispatch.ps1:1098-1131) → impact: Stop.
- `~/.claude/hooks/apex-ledger-append.ps1` appends rows out of band under the same named mutex
  `ApexCodexRunLedger` and performs no schema validation (verified: its lines 40-46, 59-66) →
  impact: Caution (new ledger fields and new status tokens cannot break it, but wrapper-side dedup
  cannot cover its writes).
- `~/.claude/hooks/lib/destructive-detect.js` intercepts `git branch -d/-D` but a grep of that file
  returns no `worktree` match, so `git worktree remove` issued by a PowerShell child process is not
  hook-intercepted → impact: Caution (T10 exists precisely so this is authorised in doctrine, not
  merely unblocked in mechanism).
- Exit codes 79, 80, 81 are unused in the wrapper's contract (verified against the enumeration at
  codex-dispatch.ps1:2058) → impact: Caution.

Simplicity check: yes — a smaller spec was considered (capacity lease only, P1a). Rejected: P5(a),
P5(b), and the dedup guard all mutate the same reservation/scan block (codex-dispatch.ps1:1313-1365)
and the same status vocabulary, so splitting them produces two specs that cannot run in parallel and
must be merged by hand anyway.

## Prerequisites
- Specs that must be complete first: none.
- Environment setup: `git` on PATH; a scratch `APEX_STATE_DIR` for the test suites (each test script
  already sets and restores its own — verified in verdict-test.ps1's `finally` block).

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1 | modify | All wrapper mechanisms (T1-T9) |
| C:\Users\User\.claude\skills\apex-code\scripts\dispatch-preflight-test.ps1 | modify | Lease-before-pre-flight, no-row-on-refusal, exit 79/81 cases |
| C:\Users\User\.claude\skills\apex-code\scripts\dispatch-scopelock-test.ps1 | modify | Reservation/`leasing` liveness, exit 80 unresolved-row cases |
| C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test.ps1 | modify | Ledger-field assertions (`effort`, `attended`, `log_path`), dedup |
| C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test-fakecodex.ps1 | modify | Emit `done_with_concerns` with an empty `unresolved` array |
| C:\Users\User\.claude\skills\apex-code\scripts\verdict-test.ps1 | modify | Verdict-level refusal of empty-concern `done_with_concerns` |
| C:\Users\User\.claude\skills\apex-code\scripts\dispatch-criticalfile-test.ps1 | modify | Exit-76 refusal must still leave no ledger row after the lease |
| C:\Users\User\.claude\skills\apex-code\scripts\dispatch-encoding-utf8-test.ps1 | modify | Byte-safe write-helper coverage |
| C:\Users\User\.claude\skills\apex-code\scripts\dispatch-deadlock-test.ps1 | modify | Lease held across the deadlock path |
| C:\Users\User\.claude\skills\apex-code\scripts\careless-coder-test.ps1 | modify | Full-wrapper run under the new lease/refusal set |
| C:\Users\User\.claude\skills\apex-code\scripts\review-findings-test.ps1 | modify | Review rows must not consume a build slot |
| C:\Users\User\.claude\skills\apex-code\scripts\apex-family-gate.ps1 | modify | Exclude lease artifacts from build-row selection (Task 9A) |
| C:\Users\User\.claude\skills\apex-code\scripts\family-gate-test.ps1 | modify | Refused lease must not invalidate a reviewed build |
| C:\Users\User\.claude\skills\apex-code\SKILL.md | modify | Log resolution via `log_path`; new exit codes 79/80/81 |
| C:\Users\User\.claude\skills\apex-code\references\codex-observability.md | modify | Log resolution via `log_path`; new ledger fields |
| C:\Users\User\.claude\skills\apex-code\references\parallel-codex.md | modify | Log resolution via `log_path`; lease semantics |
| C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md | modify | D8 amendment for a wrapper-owned finally-path teardown |
| C:\users\user\apex\docs\technical\adr\ADR-040-preflight-gate-and-spec-validator.md | modify | Reword the no-row guarantee to "no dispatch record survives" |
| C:\users\user\apex\SKILL-HISTORY.md | modify | One row for the apex-code change |
| C:\users\user\apex\SKILLS.md | modify | apex-code entry refresh (double-write) |

## Tasks

- [ ] **Task 1: Hoist run identity above pre-flight and add the append-only lease primitives.** Move the
  computation of `$worktreeKey`, `$worktreeTag`, `$runId`, `$logPath`, `$gateKey`, `$finalPath`
  (currently codex-dispatch.ps1:1144-1201) to immediately after the exit-74 authorized-list gate at
  :979, so they exist before the pre-flight `try` at :992. **Move the log-file creation
  (`[System.IO.File]::WriteAllText($logPath, ...)`, currently :1183) DOWN, to immediately after the
  reservation upgrade at :1313-1342** — the single chosen mechanism for the no-dispatch-log
  invariant, so a pre-reservation refusal (71, 72, 76, 78, 80, 81) can never leave a zero-byte log
  behind and nothing has to delete one. It still precedes the child launch at :1592 and the
  watchdog's `Get-Item $logPath` at :1671. Leave the `$headSha` read (:1204-1214) and the
  `$ledgerRow` construction (:1216-1258) where they are. Add three primitives beside
  `Add-LedgerRow` (:233). (i) `Add-LeaseCloseRow -RunId -Status -RefusalExit` APPENDS exactly one row
  `{run_id, row_kind:'lease_close', status, refusal_exit, ended, log_path, effort, attended}` inside
  `Invoke-WithLedgerLock`, using the same `AppendAllText` + trailing-newline repair as :1327-1341; it
  MUST NOT rewrite, truncate, or delete any existing line, because
  `~/.claude/hooks/apex-ledger-append.ps1` appends to this same file concurrently under the same
  mutex. (ii) `Get-OpenLeaseRunIds` reads the ledger once and returns the set of `run_id`s having a
  `row_kind:'lease'` row with no `row_kind:'lease_close'` row. (iii) `Exit-Dispatch([int]$Code)` sets
  `$script:pendingExitCode = $Code` and then calls `exit $Code`; initialise
  `$script:pendingExitCode = 'unknown'` at script scope so an uninstrumented throw is distinguishable
  from an instrumented exit. Neither (i) nor (ii) performs file surgery of any kind. Finally, give
  `Update-LedgerRow` a COMPOSITE selector: add a mandatory `-RowKind` parameter and match on
  `run_id` **and** `row_kind` together, because this spec deliberately puts a `lease` and a
  `lease_close` row under one `run_id` and a `run_id`-only match would mutate both. Pass `-RowKind`
  explicitly at every existing call site — :639, :772, :865, :914, :1388, :1420, :1439, :1451,
  :1480, :1487, :1494, :1554, :1580, :1599, :1673, :1976, :2068 — all of which address the dispatch
  row, so all pass `'dispatch'`. Treat a row with no `row_kind` property as `'dispatch'` so
  pre-existing ledger rows and hook-appended rows keep matching.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1
  — done when: `dispatch-preflight-test.ps1`, `dispatch-scopelock-test.ps1`, and `dispatch-test.ps1`
  all pass unchanged; `Add-LeaseCloseRow`, `Get-OpenLeaseRunIds`, and `Exit-Dispatch` exist with no
  call site yet; `Select-String -Pattern 'Update-LedgerRow -RunId' codex-dispatch.ps1` shows every
  call also passing `-RowKind`; a ledger holding a `lease` and a `lease_close` row for one `run_id`
  has exactly one of them mutated by a `-RowKind`-targeted update; and a legacy row with no
  `row_kind` property is still matched by `-RowKind 'dispatch'`.

- [ ] **Task 2: Atomic capacity lease before pre-flight (P1a), exit 79.** **Move the opening of the
  outer `try` (currently :992) UP so it begins immediately after Task 1's hoisted identity block**,
  and put the lease step inside it — its `finally` at :2077-2088 must cover the capacity check and
  every later refusal, or an exit taken before the `try` is uncovered. Inside a single
  `Invoke-WithLedgerLock` hold over the ledger of THIS state root (the `APEX_STATE_DIR` →
  `LOCALAPPDATA` → `TEMP` chain at :171-199 — the cap is per state root, not truly machine-wide;
  wrappers on different state roots serialise on the mutex but count different files and are out of
  contract): read every ledger line; a row **occupies a slot** when
  `phase -ceq 'build'` **and** `sandbox -ceq 'workspace-write'` **and** its status is one of
  `leasing`/`running`/`stalled`/`adopting` **and** `Test-LedgerRowLive -Row $row` (:376) returns
  `$true` **and**, when that status is `leasing`, its `run_id` is still returned by
  `Get-OpenLeaseRunIds` (a lease closed by an appended `lease_close` row holds no slot); its weight
  is `2` when the row's `effort` is `ultra` (ADR-034), else `1`. Maintain **two independent counters
  over that same qualifying set**: `$machineWeight` sums every qualifying row in this state root, and
  `$specWeight` sums only qualifying rows whose `spec -ceq $Spec`. `$machineWeight + $thisRunWeight`
  is bounded by `$MachineCeiling` (the state-root-wide bound), a new
  `[ValidateRange(1,16)][int]$MachineCeiling` parameter
  defaulting to `4`; `$specWeight + $thisRunWeight` is bounded by the spec frontmatter's
  `max_parallel_codex` integer, defaulting to `2`. The per-spec value bounds SAME-SPEC rows only and
  never raises or lowers the state-root bound; breaching **either** bound refuses. Read the
  frontmatter with a new `Get-SpecFrontmatterValue -Key` helper over the YAML block of
  `<Worktree>\docs\changes\<Spec>.md`, falling back to `-SpecSourcePath`, with an explicit dual-mode,
  three-sentinel return contract: a single `[string]` for a scalar value; a `[string[]]` for a YAML
  block sequence (`- item` lines) or a flow sequence (`[a, b]`); `$null` when the key is ABSENT (the
  caller performs no check); and the distinct string sentinel `'__APEX_FRONTMATTER_UNPARSEABLE__'`
  when the key is present but its value cannot be parsed (the caller REFUSES — absent and malformed
  must never collapse to one value, since the spec validator does not check these keys). Callers
  coerce (`[int]` for `max_parallel_codex`, `@()` for list keys) only after the sentinel test. On a
  breach,
  print a `[dispatch] AT CAPACITY (exit 79)` line naming which bound was hit, both counter values,
  and each occupying row's `spec/task/pid/effort`, then `Exit-Dispatch 79` **without appending
  anything** (no lease was taken, so the outer finally has nothing to close).
  Otherwise append this run's row with `status = 'leasing'`, `row_kind = 'lease'`, and fields
  `run_id`, `launcher_pid`, `launcher_start`, `worktree`, `worktree_key`, `spec`, `task`, `phase`,
  `sandbox`, `started`, `log_path`, `effort`, using the same trailing-newline repair as :1327-1341.
  Register the lease as open, and make the outer `finally` at :2077 the **single** closer: when the
  lease is still registered open, it calls
  `Add-LeaseCloseRow -RunId $runId -Status 'refused-preflight' -RefusalExit $script:pendingExitCode`
  exactly once (the sentinel `'unknown'` is written verbatim when an uninstrumented throw unwound the
  guarded region). No other site in the script may call `Add-LeaseCloseRow`. Clear the registration
  once the reservation at :1313-1342 completes, so a launched run's lease is never closed as a
  refusal. Change that reservation from
  an append to an in-place `Update-LedgerRow -RowKind 'lease'` that sets the remaining `$ledgerRow`
  fields, flips `row_kind` to `'dispatch'`, and sets `status = 'running'`. Record in a comment at the
  lease which exits are LEASE-SCOPED (71, 72, 76, 78, 80, 81 — taken after the lease, each closing it
  through the finally) and which are PRE-LEASE (74 caller-contract at :77-123 and :979, and 79
  at-capacity — taken before a lease or a `run_id` exists, so they legitimately leave no row at all).
  Add `leasing` to the status set in
  `Get-LiveDispatches` (:465) so the one-coder-per-tree seatbelt covers the pre-flight window.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-preflight-test.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-criticalfile-test.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\review-findings-test.ps1
  — done when: a test dispatches N+1 concurrent build wrappers against one `APEX_STATE_DIR` with
  `-MachineCeiling 2` and the surplus wrapper exits 79; a multi-spec case shows two DIFFERENT specs
  each at their own `max_parallel_codex: 1` running concurrently under `-MachineCeiling 4` (the
  per-spec bound does not serialise across specs) while a third dispatch of one of those specs exits
  79 on the per-spec bound and a fifth dispatch exits 79 on the machine bound; a test with
  `-Effort ultra` shows one run consuming two slots; a `review`-phase run does not consume a slot;
  and the LEASE-SCOPED exits 72 and 76 each leave **no** `row_kind: dispatch` row for that `run_id`,
  exactly one `row_kind: lease` row, and exactly one appended `row_kind: lease_close` row whose
  `status` is `refused-preflight` and whose `refusal_exit` equals the returned exit code; while the
  PRE-LEASE exits 74 and 79 leave the ledger with no row of any kind for that dispatch. Aside from
  rows transitioned by Task 3's orphan pass, every pre-existing ledger line is byte-identical before
  and after a refusal.

- [ ] **Task 2A: Route every exit site in the guarded region through `Exit-Dispatch`.** The guarded
  region runs from the lease append (Task 2) to the reservation upgrade at :1313-1342. Replace the
  bare `exit <n>` at each of these pre-existing sites with `Exit-Dispatch <n>`, leaving the printed
  text and the code itself unchanged: **:1000, :1006, :1024, :1028, :1035 — the critical-file gate at
  :997-1037, which sits INSIDE the relocated try and therefore inside the lease, so its exit 76 must
  record `refusal_exit: 76` rather than the `'unknown'` sentinel**; :1050, :1064, :1066, :1072, :1074
  (pre-flight helper/pin/baseline refusals); :1089, :1091, :1102, :1104, :1107, :1109, :1114, :1116,
  :1124, :1126, :1133, :1135 (spec-validation and cross-tree spec refusals); :1287-1289 (exit 78,
  reviewed-build lookup); :1349 and :1364 (exit 71, malformed line and live sibling). Also route the
  new exits added by Tasks 4 and 9 through it. Exit sites OUTSIDE the guarded region — the
  caller-contract block at :77-123, the authorized-list gate at :979-982, the at-capacity exit 79
  (no lease exists yet), and every exit after the reservation upgrade (:1583, :1683, :2010, :2016,
  :2026, :2032, :2040, :2049, :2053, :2063, :2065) — keep their bare `exit` and MUST NOT be
  converted, because no lease is open across them.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-preflight-test.ps1
  — done when: every listed guarded-region site calls `Exit-Dispatch`; a forced refusal at each of
  exits 71, 72, 76, and 78 produces exactly ONE `lease_close` row whose `refusal_exit` equals the
  wrapper's actual exit code — 76 included, asserted explicitly; the wrapper still returns that
  contractual code (not an exception and not 1); a forced exit 74 and a forced exit 79 produce no row
  at all; and an uninstrumented throw inside the guarded region produces exactly one `lease_close`
  row with `refusal_exit: "unknown"`.

- [ ] **Task 3: Dead rows transition to `orphaned`, never to terminal (P5a).** In the same
  `Invoke-WithLedgerLock` hold that Task 2 uses for the capacity scan, collect every row that is
  BOTH dead (`Test-LedgerRowLive` returns `$false`) AND unresolved. Unresolved means: status
  `running`/`stalled`/`adopting`; **or** status `leasing` with its `run_id` still returned by
  `Get-OpenLeaseRunIds` — i.e. joined on (`run_id`, `row_kind`) there is NO matching `lease_close`
  event. A lease that was refused and closed is already resolved and MUST NOT be orphaned; skipping
  this join would turn every ordinary refusal into an orphan and then wedge that worktree at exit 80.
  Apply ALL collected rows in a SINGLE file-rewrite pass — build the full replacement line set in
  memory and write it with one temp-file + `[System.IO.File]::Replace` sequence (the one at
  :286-303), NOT one `Update-LedgerRow` call per row. Each transitioned row gets
  `status = 'orphaned'` and `orphaned_at = (Get-UtcTimestamp)`, with `ended` left absent. Cap the
  pass at the 200 oldest such rows per scan and print how many were deferred, so one scan cannot
  hold the mutex unboundedly. Design note to carry in a comment at the scan: every writer —
  including `~/.claude/hooks/apex-ledger-append.ps1` — blocks on `ApexCodexRunLedger` and gives up
  after 30 s, so this hold is a hard latency budget, not a soft one. Do not write `failed`,
  `abandoned`, or any `adopted-*` value on this path. Add a test-only observability seam: when the
  environment variable `APEX_LEDGER_REPLACE_LOG` is set to a path, every ledger `File]::Replace` this
  script performs appends one line `<utc>|<caller>|<rows-changed>` to it — the counter tests assert
  against, since `LastWriteTime` proves only that at least one write happened. After the scan, print
  for each newly-marked row one copy-pasteable recovery line, branching on `row_kind`: for a
  `dispatch` row,
  `[dispatch] ORPHANED RUN <run_id> — recover with: powershell -NoProfile -ExecutionPolicy Bypass -File "<this script path>" -Adopt -RunId <run_id> -Spec <spec> -Phase <phase> -Task <task> -Worktree "<worktree>"`;
  for a `lease` row,
  `[dispatch] ORPHANED LEASE <run_id> — nothing was dispatched; clear it with: powershell -NoProfile -ExecutionPolicy Bypass -File "<this script path>" -Attended -AbandonRunId <run_id> -AbandonReason "<why>"`.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-scopelock-test.ps1
  — done when: a seeded `running` row with a dead `launcher_pid`/`pid` is rewritten to `orphaned`
  (not to any terminal status) by the next dispatch's scan; a seeded `leasing` row that HAS a
  matching `lease_close` row is NOT orphaned and its bytes are unchanged; three orphan-eligible rows
  seeded together are transitioned by ONE rewrite pass, asserted via a single `APEX_LEDGER_REPLACE_LOG`
  line reporting three rows changed; re-running the scan with nothing newly dead appends no further
  line (idempotent); and both printed recovery lines run verbatim.

- [ ] **Task 3A: Exact-row adoption with a claim under the selection lock.** In `Invoke-Adopt`, add
  `orphaned` to the status filter of the selection loop at :614, and EXCLUDE rows whose `row_kind` is
  `lease` (a lease orphan never launched a coder, so there is no tree to adopt). Add an optional
  `[string]$RunId` parameter: when supplied with `-Adopt`, select the row whose `run_id` matches
  exactly and ignore the newest-wins sort at :622, because repeated orphan attempts on one
  spec/phase/task/worktree are exactly the wedge case, and "newest matching" can adopt a different
  row than the one the recovery line named. Close the double-claim window: the write that marks the
  row `adopting` currently happens at :772, AFTER the selection lock is released, while the in-lock
  claim at :634-639 only stamps adopter PIDs — so **move `status = 'adopting'` into the
  `$adopterIdentity` update at :634-639, inside the selection-lock hold**, and reduce :771-777 to
  recording `adopted`/`report_status` only. The live-row test at :628 needs **no** edit: it tests
  `running`/`stalled`/`adopting`, so once the claim writes `adopting` in-lock, a second adopter
  observes it and refuses.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-scopelock-test.ps1
  — done when: `-Adopt -RunId <id>` selects that exact row even when a newer row matches the same
  spec/phase/task/worktree; `-Adopt` selects an `orphaned` dispatch row and closes it through the
  existing gate path at :783-935; a seeded orphaned `row_kind: lease` row is not selectable; and two
  adopters raced against one orphaned row leave exactly one winner, the loser exiting 75.

- [ ] **Task 4: Refuse redispatch onto an unresolved worktree_key (P5b), exit 80, plus explicit
  abandonment.** In the reservation block at :1313-1342, after the `Get-LiveDispatches` check,
  add a second scan of the same in-memory line set: if any row with this `worktree_key` has a status
  in `leasing`/`running`/`stalled`/`adopting`/`orphaned` — live or dead — refuse (a `leasing` row
  counts only while `Get-OpenLeaseRunIds` still holds its `run_id`). Print the row's `run_id`,
  status, and the Task 3 adopt command, plus the abandonment command, then `Exit-Dispatch 80` — this
  path MUST NOT call `Add-LeaseCloseRow` itself; the outer finally is the sole closer (Task 2).
  `-AllowSharedWorktree` does **not** override exit 80 (it overrides only the live-worker refusal at
  :1322). Add parameters `[string]$AbandonRunId` and `[string]$AbandonReason`. When `-AbandonRunId`
  is supplied, refuse with exit 74 in the contract block at :77-123 if
  `[string]::IsNullOrWhiteSpace($AbandonReason)` — a whitespace-only reason is not a reason — and
  refuse with **exit 83** if `-Attended` is not bound: the attended-only rule is a MECHANISM, not a
  printed warning, so an AFK caller cannot waive five gates. Then run a standalone mode that takes
  ONE `Invoke-WithLedgerLock` hold and, inside it, re-reads that row (selected by `run_id` +
  `row_kind`) and applies two preconditions before mutating anything. **(a) Recoverable-status
  guard:** proceed only when the row's current status is `orphaned`, or is one of
  `leasing`/`running`/`stalled` **with `Test-LedgerRowLive -Row $row` returning `$false`**.
  `adopting` is EXCLUDED at every liveness value — an adopter has claimed that row under the
  selection lock (Task 3A), and abandoning it would clobber a running recovery. Any other status — a
  terminal row, or a live row — prints the observed status and `exit 82` having mutated nothing.
  **(b) Clean-tree guard:** run `git status --porcelain` on the row's recorded `worktree` for EVERY
  row kind, `row_kind: lease` included — pre-flight is not read-only, because
  `apex-baseline-check.ps1:210-239` executes repository-declared commands that can create or modify
  files before the reservation, so even a lease row's tree can be dirty. A non-empty result or a
  non-zero git exit prints the first 200 characters and `exit 82` having mutated nothing, so an
  operator cannot launder a dirty snapshot into a fresh dispatch — clean the tree first, exactly as
  ADR-046 D8(a) requires of teardown. Only with all three satisfied, rewrite that row to
  `status = 'abandoned-unadopted'`, `ended = (Get-UtcTimestamp)`,
  `abandon_reason = $AbandonReason`, and `waived_gates = @('scope','critical','digest','pin','encoding')`
  — the literal list of gates that adoption would have run and that this escape skips — print the
  row, and exit 0; it performs no dispatch and creates no new row. Print alongside it the doctrine
  line, verbatim:
  `[dispatch] -AbandonRunId is an ATTENDED-ONLY escape: it waives scope/critical/digest/pin/encoding without running them. An AFK run must park instead.`
  Extend the exit-space comment at :2058 to list 79, 80, 81, 82, and 83.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-scopelock-test.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\careless-coder-test.ps1
  — done when: a dispatch into a worktree carrying a dead `orphaned` row exits 80 cleanly (that exact
  code, no exception), writes no `row_kind: dispatch` row, and leaves EXACTLY ONE
  `refused-preflight` / `refusal_exit: 80` row; abandoning that row while its worktree still holds an
  uncommitted file exits 82 and mutates nothing; after the operator cleans the tree,
  `-AbandonRunId <id> -AbandonReason "<text>"` succeeds and the same dispatch then reserves and
  launches against a clean snapshot; abandoning a `row_kind: lease` row whose tree is dirty ALSO
  exits 82 (no lease exemption); abandoning a row whose status is terminal, is `adopting`, or whose
  `Test-LedgerRowLive` is `$true`, exits 82 and mutates nothing; omitting `-Attended` exits 83 and
  mutates nothing; a concurrent `-Adopt` and `-AbandonRunId` against one orphaned row leave exactly
  one winner and the loser exits with its refusal code; the abandoned row parses with
  `waived_gates` equal to the five-element list `scope,critical,digest,pin,encoding` and a non-empty
  `abandon_reason`; and `-AbandonRunId` with a missing, empty, or whitespace-only `-AbandonReason`
  exits 74 and mutates no row.

- [ ] **Task 5: Creator-owned worktree teardown in the close-out finally-path (P5c).** Add a
  `[switch]$OwnedWorktree` parameter declaring that this wrapper invocation owns the `-Worktree`'s
  lifecycle. Add `function Invoke-CreatorTeardown` taking `-Worktree` and `-RunId`. Before touching
  anything, capture three values while the worktree still exists: the MAIN repo path (the `worktree `
  line of the FIRST record of `git -C <worktree> worktree list --porcelain`), the commit
  (`git -C <worktree> rev-parse HEAD`), and the branch via
  `git -C <worktree> symbolic-ref --quiet --short HEAD`. If that symbolic-ref fails, HEAD is DETACHED
  — remove nothing, and record a `cleanup_obligation` naming the worktree path, the main repo path,
  and the sha, with the guidance that the operator must identify and remove the tree by hand. Then
  take a `Invoke-WithLedgerLock` hold **on its own freshly constructed
  `[System.Threading.Mutex]::new($false, 'ApexCodexRunLedger')` handle**, never on the script-level
  `$ledgerMutex`, which the inner finally at :2075 has already disposed by the time the outer finally
  runs. Evaluate **two** preconditions together: (a) ADR-046 D8(a) —
  `git -C <worktree> status --porcelain` must be empty and exit zero; (b) sibling safety — no OTHER
  row for `Get-WorktreeKey <worktree>` may be live (`Get-LiveDispatches`) **or unresolved**, where
  unresolved adds `orphaned` and `adopting` rows and open `leasing` rows: an orphan still needs that
  tree for its adoption, and removing it destroys the only copy. `-AllowSharedWorktree` does **not**
  override (b): it permits a concurrent coder, it does not permit deleting the tree out from under
  one. If either precondition fails, remove nothing — `Update-LedgerRow -RowKind 'dispatch'` (or
  `'lease'` when this run never reserved, so the obligation lands on exactly one row) with
  `cleanup_obligation = "worktree <path> retained: <dirty|live sibling <run_id>|unresolved sibling <run_id>|detached HEAD>: <first 200 chars of porcelain output or the git error>"`
  and print the exact removal command for the user. With both satisfied, run
  `git -C <mainRepo> worktree remove "<worktree path>"` with **no** `--force` — `-C`'d to the MAIN
  repo, never to the worktree being removed, which git refuses as self-referential — and on success
  set `cleanup_obligation = ''`, on non-zero exit set it to the git error text. Never invoke
  `git branch -d`, `git branch -D`, or `git worktree prune`; instead, when removal succeeded, record
  the obligation as a SELF-CONTAINED record — `branch_teardown_obligation` set to the branch name,
  plus `teardown_main_repo` (the main repo path) and `teardown_sha` (the captured commit) — because
  the worktree path no longer exists afterwards and a later parameterless `-ListObligations` must be
  able to print a runnable command from the record alone (D8(b) keeps the deletion with the user).
  Call `Invoke-CreatorTeardown` only from the outer `finally` at :2077-2088, only when
  `$OwnedWorktree` is set **and** this run has reached a terminal state — which includes a run closed
  by the Task 2 finally as `refused-preflight` (a lease that never dispatched leaves a clean,
  never-built tree, and that tree is exactly what should be removed). Wrap the call in
  `try { } catch { }` so a teardown failure cannot mask the wrapper's exit code (the reason
  `$process.Dispose()` is guarded at :2074), but the catch MUST NOT swallow silently: it prints the
  exception and records it as a `cleanup_obligation` on this run's row. Add a standalone
  `[switch]$ListObligations` mode that requires no other parameter: under the ledger lock it reads
  the ledger once and prints, per row carrying a non-empty `cleanup_obligation` or
  `branch_teardown_obligation`, the `run_id`, `spec/task`, the obligation text, and the exact
  runnable command built from the record's own fields — `git -C "<teardown_main_repo>" branch -d "<branch>"`
  for a branch obligation, `git -C "<teardown_main_repo>" worktree remove "<worktree>"` for a
  retained tree — then exits 0 without dispatching.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test.ps1
  — done when, verified against REAL `git worktree add` trees on this Windows machine (not a mocked
  git — the self-referential `-C` failure only reproduces against real git): a `-OwnedWorktree` run
  over a clean worktree removes it, the removal command was `-C`'d to the main repo, and the row
  records `cleanup_obligation: ""` plus a non-empty `branch_teardown_obligation`; a run over a
  worktree with one untracked file leaves the worktree on disk and records a `cleanup_obligation`
  naming it; a run with `-OwnedWorktree` **and** `-AllowSharedWorktree` and a seeded LIVE sibling row
  on the same `worktree_key` removes nothing and records a `cleanup_obligation` naming that sibling's
  `run_id`; the same holds for a seeded ORPHANED sibling row; a worktree checked out at a detached
  HEAD is never removed and records the detached-HEAD obligation with its sha; a `-OwnedWorktree` run
  refused at exit 81 over a clean never-built tree still removes that tree; a run whose ledger
  carries both a `lease` and a `lease_close` row for one `run_id` has the obligation on exactly ONE
  of them; the parameterless `-ListObligations` output is copy-pasteable AS-IS (each printed command
  runs successfully against the recorded main repo without further editing) and exits 0; and
  exits 0; and `Select-String -Pattern 'worktree remove.*--force|branch -[dD]' codex-dispatch.ps1`
  returns no matches.

- [ ] **Task 6: `effort`, `attended`, and `log_path` on every wrapper-written row (P6, P7a2).** Add
  `[switch]$Attended` to the param block at :9-70. In `$ledgerRow` (:1216-1258) add
  `effort = $Effort` and `attended = $(if ($PSBoundParameters.ContainsKey('Attended')) { [bool]$Attended } else { $null })`.
  The contract is ONE shape: the `attended` property is ALWAYS present on a wrapper-written row and
  carries `true`, `false`, or JSON `null` — `null` meaning the caller reported nothing, which is what
  keeps absence-of-telemetry distinguishable from a reported `false`. Never omit the property. Add the same three fields to
  the lease row written in Task 2, to the `lease_close` row written by `Add-LeaseCloseRow` (Task 1) —
  a refusal record with no `log_path`/`effort`/`attended` is not analysable — and to
  `Invoke-Adopt`'s adopting/terminal `Update-LedgerRow` calls
  (:771-777, :902-914) by carrying the values already present on the selected row and back-filling
  `log_path` from `$match.log_path` when present. In `Invoke-Adopt`, print the log location as
  `$match.log_path` instead of leaving it unmentioned (:659-663). The matching documentation edits
  belong to Task 11, which owns all three doc files.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test.ps1
  — done when: every row a wrapper run writes (lease, lease_close, running, terminal, adopted) parses
  to an object carrying non-empty `log_path`, a non-empty `effort`, and an `attended` PROPERTY that is
  always present — `true`/`false` when `-Attended` was bound, JSON `null` when it was not — asserted
  explicitly against a `lease_close` row produced by a refused dispatch; and `-Adopt` prints the
  selected row's `log_path`.

- [ ] **Task 7: Byte-safe write helpers at the wrapper's own call sites (P6).** Add three functions
  beside `Get-UtcTimestamp` (:125): `Write-Utf8NoBomText -Path -Text`, `Add-Utf8NoBomText -Path -Text`,
  and `Write-Utf8NoBomLines -Path -Lines`, each constructing `[System.Text.UTF8Encoding]::new($false)`
  in exactly one place and delegating to `[System.IO.File]::WriteAllText` / `AppendAllText` /
  `WriteAllLines`. Route every existing write through them: `Add-LedgerRow` (:239-243),
  `Update-LedgerRow`'s replacement write (:290-294), the log truncation at :1183, the reservation
  append at :1337-1341, the `$appendLogText` scriptblock at :1572, and the concerns-file write at
  :1988 — plus the lease append from Task 2 and any write added by Tasks 3-5. Leave the raw
  `WriteAsync` of `$promptBytes` at :1631-1632 untouched. Advisory, not actionable in this spec: if
  the ledger file does not yet exist, the first writer may be `apex-ledger-append.ps1`, whose
  `Add-Content -Encoding utf8` (its line 66) creates it WITH a BOM under Windows PowerShell 5.1; the
  wrapper's readers already tolerate that leading BOM and this spec must not edit that hook, so
  record the residual risk in a comment at the helpers and change nothing else.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-encoding-utf8-test.ps1
  — done when: `Select-String -Pattern 'UTF8Encoding' codex-dispatch.ps1` returns exactly three
  matches (one per helper), and a test writing an em-dash-bearing spec/task name asserts the ledger
  and concerns files start with no `EF BB BF` byte sequence and round-trip byte-identically.

- [ ] **Task 8: Refuse empty-concern `done_with_concerns`, and guard against duplicate rows.**
  At the point where the report's `unresolved` is taken (:1813), collapse it through
  `Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }` BEFORE any `.Count` test, so a
  whitespace-only or empty-string entry cannot pass as a named concern. Then replace the substitution
  at :1839-1843 (which today invents a placeholder `unresolved` string) with a refusal: when
  `$reportStatus -eq 'done_with_concerns'` and the filtered count is `0`, set
  `$reportStatus = 'blocked'` and `$blocker = "Coder reported done_with_concerns and named no unresolved item. Either report done, or name a concern."`,
  so the run routes through the existing exit-67 branch at :2005-2011. Scope BOTH the filter and the
  refusal to COMPLETION-schema reports only (`$Schema -ceq 'completion'` on the main path,
  `$adoptCompletionSchema` in adoption): a review-schema report has no `unresolved` array at all, so
  applying the rule to it would turn every legitimate FLAG adoption into blocked/67. For the
  review-schema adoption path, close the gap the other way — where adoption maps a FLAG verdict or
  non-CLEAN findings to `done_with_concerns` at :735-736, SYNTHESIZE the concern exactly as the main
  path does at :1794-1799, appending
  `"Review verdict '<verdict>' -- <n> finding(s) to adjudicate."` to the adopted row's `unresolved`,
  so an adopted review carries the same evidence a directly-run one does. Apply the completion-schema
  filter and refusal in the `Invoke-Adopt` mirror at :751-753 so the two copies cannot diverge. Add a
  dedup guard
  in `Add-LeaseCloseRow` and in the Task 2 lease append — the real append paths — but NOT in
  `Add-LedgerRow` (:233), which has no live call site and must not grow one: scan the ledger under
  the same lock and throw
  `"Refusing to append a second <row_kind> ledger row for run_id <id>."` when a row with that
  `run_id` **and the same `row_kind`** already exists. Keying on the pair is load-bearing: a lease
  legitimately produces one `lease` row and one `lease_close` row under a single `run_id`, and a
  guard keyed on `run_id` alone would refuse the close and strand the slot.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\verdict-test.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-test-fakecodex.ps1
  — done when: the fake codex emitting each of `{"status":"done_with_concerns","unresolved":[]}`,
  `{"status":"done_with_concerns","unresolved":[" "]}`, and
  `{"status":"done_with_concerns","unresolved":["", " "]}` makes the wrapper exit 67 with that
  blocker text on both the main path and the `-Adopt` path; a REVIEW-schema row whose report carries
  `verdict: FLAG` with findings and no `unresolved` array still adopts as `done_with_concerns` and
  exits 68 — NOT 67 — with a synthesized `unresolved` entry naming the verdict and finding count
  (the regression this scoping exists to prevent); a forced second `Add-LeaseCloseRow` for an
  existing (`run_id`, `row_kind`) pair throws instead of appending; and a normal lease-then-close
  sequence for one `run_id` does **not** throw.

- [ ] **Task 9: `declared_runtime_paths` pre-flight check, exit 81.** Inside the build/workspace-write
  pre-flight, immediately after the spec validation that ends at :1096 (in-worktree spec) and at
  :1130 (cross-tree `-SpecSourcePath`), read the frontmatter key `declared_runtime_paths` (a YAML
  list of repo-relative paths) using Task 2's `Get-SpecFrontmatterValue`. The key name is FROZEN and
  MUST be matched verbatim as `declared_runtime_paths`. For each declared path run
  `git -C $Worktree ls-files --error-unmatch -- "<path>"` and `git -C $Worktree check-ignore -q -- "<path>"`,
  each with `& cmd /c exit 99` preceding it exactly as :492 and :1014 do. The predicate FAILS CLOSED:
  a declared path PASSES only when `ls-files --error-unmatch` returns 0 (the path is tracked at this
  commit, therefore visible to a fresh `git worktree add`). Every other outcome refuses, with a
  distinct message: untracked **and** ignored (`check-ignore -q` returns 0) →
  "gitignored-invisible to worktrees"; untracked and **not** ignored → "declared path is not tracked
  at this commit" (a declaration error — a missing or merely-untracked path must not slip through an
  AND that both branches fail). Before either check, test the helper's sentinels: `$null` (key
  absent) performs no check at all; `'__APEX_FRONTMATTER_UNPARSEABLE__'` refuses with
  "declared_runtime_paths present but unparseable", because nothing else validates this key.
  On any refusing path, print each offending path with both exit codes, then `Exit-Dispatch 81`;
  this path MUST NOT call `Add-LeaseCloseRow` itself — the outer finally is the sole closer (Task 2),
  and nothing is deleted. An absent key, an empty list, or a `-SkipBaselineCheck` bootstrap performs
  no check. State the guarantee's scope in a comment at the check, verbatim in substance: this proves
  visibility **in this worktree at this commit only**; it says nothing about other worktrees or about
  the integration branch, and a path that later diverges there is out of scope.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\dispatch-preflight-test.ps1
  — done when: a spec declaring a path that is gitignored and untracked exits 81 cleanly (that exact
  code, no exception), leaves no `row_kind: dispatch` row, and leaves EXACTLY ONE
  `refused-preflight` / `refusal_exit: 81` close row; a spec declaring THREE paths of which only the
  middle one is invisible exits 81 naming just that path (proving the `[string[]]` return mode of
  `Get-SpecFrontmatterValue` over a multi-entry block sequence); a spec declaring a path that exists
  on disk but is untracked and NOT ignored also exits 81, with the "not tracked at this commit"
  message; a spec declaring a path that does not exist at all exits 81; a spec whose
  `declared_runtime_paths` value is malformed exits 81 with the "unparseable" message; the same spec
  exits past the check once that path is `git add -f`-tracked; and a spec with no
  `declared_runtime_paths` key behaves exactly as before.

- [ ] **Task 9A: Exclude lease artifacts from the family gate's build selection.** In
  `apex-family-gate.ps1`, the `$buildRows` filter at :133-137 admits every `phase -ceq 'build'` row
  and :160-166 then selects the newest attempt and refuses if it is not terminal-success. A lease row
  carries `phase`/`spec`/`task`/`worktree_key`/`started`, so a refused lease — or the `orphaned` row
  it later becomes — becomes "the newest build" and invalidates an older, genuinely reviewed build.
  Narrow that filter to admit only rows with `row_kind -ceq 'dispatch'` (treating a missing
  `row_kind` as `'dispatch'`, so pre-existing and hook-appended rows are unaffected) AND whose status
  is not one of `leasing`, `orphaned`, or `abandoned-unadopted`. Change nothing else in the gate's
  trust-marker or terminal-status logic.
  — files: C:\Users\User\.claude\skills\apex-code\scripts\apex-family-gate.ps1,
  C:\Users\User\.claude\skills\apex-code\scripts\family-gate-test.ps1
  — done when: a ledger holding a terminal-success reviewed build plus a NEWER refused lease
  (`row_kind: lease`, `status: leasing`, with its `lease_close`) still vouches for that build; the
  same holds when the newer row is `orphaned` or `abandoned-unadopted`; a genuinely newer
  `row_kind: dispatch` build still masks the older one exactly as today; and the existing
  `family-gate-test.ps1` cases pass unchanged.

- [ ] **Task 10: ADR doctrine amendments required by this spec's mechanisms (ADR-046 D8, ADR-040).**
  In `ADR-040-preflight-gate-and-spec-validator.md`, reword the guarantee at its line 56 ("no ledger
  row or dispatch log is created") to read: **no dispatch record survives — a lease row closed
  `refused-*` is a lease artifact, not a dispatch record, and is excluded from dispatch analytics.**
  State in the same paragraph, narrowly: the **pre-flight refusal-recording path** is append-only —
  a refusal is recorded by APPENDING a `lease_close` event, never by removing or rewriting a line,
  because `~/.claude/hooks/apex-ledger-append.ps1` writes to the same file concurrently. Say
  explicitly that this does NOT re-characterise the rest of the ledger's lifecycle, describing the
  THREE mechanisms as they are actually built here: (i) pre-flight refusal recording is append-only
  (`lease_close` events); (ii) orphan marking is a single batched temp-file + `[System.IO.File]::Replace`
  pass over all dead unresolved rows at once, not a per-row update; (iii) every other status
  transition keeps `Update-LedgerRow`, now selecting on `run_id` **and** `row_kind`. The text must
  not claim orphan marking still uses `Update-LedgerRow` — Task 3 explicitly replaces it.
  Then, for ADR-046, add a subsection
  `### D8 amendment (2026-07-30) — wrapper-owned teardown channel` under D8 (ADR-046 lines 205-230)
  recording: the creator-teardown allowance extends to `codex-dispatch.ps1`'s close-out finally-path
  as an execution channel alongside the user's `!` one-liner handback; D8(a)'s empty-porcelain
  requirement and the `--force` prohibition apply unchanged; D8(b) branch deletion is explicitly
  **not** delegated to the wrapper, which records a `branch_teardown_obligation` instead. State the
  sequencing split without ambiguity: **wrapper worktree removal is gated on empty porcelain plus no
  live-or-unresolved sibling row, and on nothing else — it does NOT wait for verified integration**; it is
  **branch deletion alone** that necessarily waits for the approved integration commit, exactly as
  existing clause (b) already sequences it. Amend the sentence at line 230 that names P5(c) as out of
  scope so it names this spec as the shipped wrapper-side half and leaves the `destructive-detect.js`
  hook change still queued.
  — files: C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md,
  C:\users\user\apex\docs\technical\adr\ADR-040-preflight-gate-and-spec-validator.md
  — done when: ADR-040 carries the phrase `no dispatch record survives`, the narrowed append-only
  statement, and all three mechanism descriptions — append-only refusal recording, batched orphan
  replacement, and composite-keyed `Update-LedgerRow` for other transitions — with no sentence
  claiming orphan marking uses `Update-LedgerRow`;
  the D8 section names the wrapper finally-path as an authorised channel and separates worktree
  removal (porcelain + no-live-sibling) from branch deletion (post-integration); the ADR still
  forbids `--force` and wrapper-side branch deletion; and line 230's "out of this spec's scope"
  wording no longer contradicts Task 5.

- [ ] **Task 11: Skill documentation, index, and history.** Make the doc edits this spec actually
  requires, each named. In `SKILL.md`: bump frontmatter `version` from the current `2.13.0` to
  `2.14.0`; document the new exit codes 79/80/81/82/83 and the new parameters `-Attended`,
  `-OwnedWorktree`, `-MachineCeiling`, `-AbandonRunId`/`-AbandonReason`, `-ListObligations`, and
  `-Adopt -RunId`; describe the lease/`orphaned` lifecycle and the adopt-or-abandon recovery path;
  replace the reconstructed log path at :205-206 with "read the ledger row's `log_path`"; and add the
  close-out line telling the host to run `-ListObligations` and discharge every obligation before
  archiving. In `references/codex-observability.md`: same `log_path` resolution at :26-27, :73-74,
  :95-97, :132, plus the new ledger fields (`row_kind`, `effort`, `attended`, `refusal_exit`,
  `cleanup_obligation`, `branch_teardown_obligation`, `teardown_main_repo`, `teardown_sha`). In
  `references/parallel-codex.md`: add the lease/capacity semantics and the exit-79 queueing contract
  only — its log-path text at :30-34 is ALREADY correct ("the log path it prints") and must not be
  touched. Then add one newest-first row to `C:\users\user\apex\SKILL-HISTORY.md` with columns
  `Date | Skill | Files | Version | Event | What Changed | Sources`, naming `apex-code`, version
  `2.14.0`, event `update`, the wrapper plus every test file changed by Tasks 1-9A, and as sources
  exactly the two research documents this spec cites — `docs/research/artemis-retro-2026-07-29.md`
  and `docs/research/ledger-stratification-2026-07-30.md` — plus ADR-046 and ADR-040. Finally, in
  `C:\users\user\apex\SKILLS.md`, whose table columns are `Skill | Invoke when | Loading` and which
  carries NO version field, update only the apex-code row's "Invoke when" description if this change
  makes it inaccurate; do not add a version column.
  — files: C:\users\user\apex\SKILL-HISTORY.md, C:\users\user\apex\SKILLS.md,
  C:\Users\User\.claude\skills\apex-code\SKILL.md,
  C:\Users\User\.claude\skills\apex-code\references\codex-observability.md,
  C:\Users\User\.claude\skills\apex-code\references\parallel-codex.md
  — done when: SKILL.md's frontmatter reads `version: 2.14.0` and its text names every new exit code
  and parameter listed above; `Select-String -Pattern 'codex-logs\\\\codex-' SKILL.md
  references\codex-observability.md` returns no path-reconstruction instruction; parallel-codex.md's
  lines about the printed log path are byte-unchanged while lease/exit-79 semantics are added;
  SKILL-HISTORY.md's top row is the apex-code `2.14.0` row naming exactly two research sources plus
  the two ADRs; and SKILLS.md still has three columns.

## Wave plan
Wave 1: [Task 1, Task 9A, Task 10] | Wave 2: [Task 2] | Wave 3: [Task 2A] | Wave 4: [Task 3] |
Wave 5: [Task 3A] | Wave 6: [Task 4] | Wave 7: [Task 5] | Wave 8: [Task 6] | Wave 9: [Task 7] |
Wave 10: [Task 8] | Wave 11: [Task 9] | Wave 12: [Task 11]

Tasks 1-9 all rewrite `codex-dispatch.ps1` and cannot be parallelised (file-disjointness fails).
Task 9A touches only `apex-family-gate.ps1`/`family-gate-test.ps1` and Task 10 only the two ADRs, so
both are disjoint from Task 1 and run beside it. Task 2 depends on Task 1's hoisted identity, its
composite-keyed `Update-LedgerRow`, and its
`Add-LeaseCloseRow`/`Get-OpenLeaseRunIds`/`Exit-Dispatch` primitives; Task 2A depends on Task 2's
lease being open across the region it instruments; Task 3 depends on Task 2's scan hold; Task 3A
depends on Task 3's `orphaned` status; Task 4
depends on Task 3A's in-lock `adopting` claim and on Task 2A's `Exit-Dispatch` routing; Task 5 depends on
Task 10's ADR amendments and on Tasks 3-4's terminal-status vocabulary; Task 9 depends on Task 2's
`Get-SpecFrontmatterValue` and on Task 2A's routing; Task 11 depends on all.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (status.md, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, status.md, and spec archival — under D6.)
docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1 · dispatch-preflight-test.ps1 · dispatch-scopelock-test.ps1 · dispatch-test.ps1 · dispatch-test-fakecodex.ps1 · verdict-test.ps1 · dispatch-criticalfile-test.ps1 · dispatch-encoding-utf8-test.ps1 · dispatch-deadlock-test.ps1 · careless-coder-test.ps1 · review-findings-test.ps1 · apex-family-gate.ps1 · family-gate-test.ps1 (all in that scripts folder) · C:\Users\User\.claude\skills\apex-code\SKILL.md · references\codex-observability.md · references\parallel-codex.md · C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md · C:\users\user\apex\docs\technical\adr\ADR-040-preflight-gate-and-spec-validator.md · C:\users\user\apex\SKILL-HISTORY.md · C:\users\user\apex\SKILLS.md |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1` | Pre-flight, lease, exit 79/81 suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-scopelock-test.ps1` | Reservation, orphan, exit 80 suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-test.ps1` | End-to-end wrapper + ledger fields |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/verdict-test.ps1` | Verdict routing suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-criticalfile-test.ps1` | Critical-file refusal suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1` | Byte-exactness suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-deadlock-test.ps1` | Pipe-deadlock suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/careless-coder-test.ps1` | Scope/careless-coder suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/review-findings-test.ps1` | Review-row suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/family-gate-test.ps1` | Family-gate row-selection suite (Task 9A) |
| `git -C <worktree> symbolic-ref --quiet --short HEAD` | Branch capture; detached-HEAD detection |
| `git -C <worktree> rev-parse HEAD` | Capture the sha for the obligation record |
| `git -C <worktree> status --porcelain` | D8(a) teardown precondition; `-AbandonRunId` clean-tree guard |
| `git -C <worktree> worktree list --porcelain` | Resolve the MAIN repo path for teardown |
| `git -C <worktree> rev-parse --abbrev-ref HEAD` | Capture the branch name before removal |
| `git -C <mainRepo> worktree remove "<path>"` | D8(a) teardown, no `--force`, never `-C`'d to the tree being removed |
| `git worktree add <path> <sha>` | Create the real worktrees Task 5's empirical verification needs |
| `git -C <worktree> ls-files --error-unmatch -- "<path>"` | Task 9 declared-path visibility |
| `git -C <worktree> check-ignore -q -- "<path>"` | Task 9 declared-path visibility |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | (host-owned; the coder commits nothing — standing scope lock, codex-dispatch.ps1:1511-1512) |
| `git commit` | "feat(apex-code): wrapper capacity lease, orphan recovery, creator teardown, ledger telemetry" (host, after approval) |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR` | Test isolation of the ledger and gate state |
| `LOCALAPPDATA` | Default ledger root when `APEX_STATE_DIR` is unset |
| `TEMP` | Default `-ScratchDirectory` for `.final` reports |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation; this repo has no build step |

## Specialist Context
### Security
- `~/.claude/hooks/apex-ledger-append.ps1` is OUT OF SCOPE and must not be edited. Read-only
  contract the wrapper must keep honouring: it appends rows under the same named mutex
  `ApexCodexRunLedger`, performs no schema validation beyond JSON-parse and newline rejection, and
  writes via `Add-Content -Encoding utf8`. Consequences the wrapper must tolerate: hook-appended
  rows may lack `effort`, `attended`, and `log_path` (treat missing as absent, never as a default);
  hook-appended rows are outside the Task 8 dedup guard; and the wrapper must keep the mutex name
  unchanged.
- Task 5 executes `git worktree remove` from inside a PowerShell child process, which
  `hooks/lib/destructive-detect.js` does not intercept. Task 10 is what authorises it; the wrapper
  must not be made to delete branches under any flag.

### Performance
(none)

### Accessibility
(none — no frontend change)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | codex-dispatch.ps1 | Comment each new exit code (79/80/81/82/83) at its refusal site and in the contract enumeration at :2058; the lease-scoped vs pre-lease exit list; the mutex-hold budget note at the orphan scan; the Task 9 guarantee-scope note |
| Skill | C:\Users\User\.claude\skills\apex-code\SKILL.md | Version 2.13.0 → 2.14.0; `log_path` resolution; exits 79/80/81/82/83; `-Attended`/`-OwnedWorktree`/`-MachineCeiling`/`-AbandonRunId`/`-ListObligations`/`-Adopt -RunId`; lease + `orphaned` lifecycle; `-ListObligations` close-out line (Task 11) |
| Skill | references\codex-observability.md | `log_path` resolution and the new ledger fields (Task 11) |
| Skill | references\parallel-codex.md | Lease/capacity semantics and exit-79 queueing only — its log-path text is already correct (Task 11) |
| ADR | C:\users\user\apex\docs\technical\adr\ADR-046-doctrine-audit-resolutions.md | Amend D8 (Task 10) |
| ADR | C:\users\user\apex\docs\technical\adr\ADR-040-preflight-gate-and-spec-validator.md | Reword the pre-flight no-row guarantee (Task 10) |
| Skill history | C:\users\user\apex\SKILL-HISTORY.md | One `apex-code` `2.14.0` row; sources = two research docs + ADR-046 + ADR-040 (Task 11) |
| Skill index | C:\users\user\apex\SKILLS.md | Description accuracy only — the table has no version column (Task 11) |

## Acceptance Criteria
- [ ] Run `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1` →
  verify: exit 0, and its output names passing cases for exit 79 at capacity, `ultra` counting
  double, a `review` row not consuming a slot, the two-counter multi-spec case (per-spec bound does
  not serialise across specs; each bound refuses independently), exit 81 on a gitignored declared
  path, the three-declared-path case where only the middle path is named, the untracked-and-not-
  ignored path case, the nonexistent-path case, and the unparseable-`declared_runtime_paths` case;
  and — after each LEASE-SCOPED exit 71/72/76/78/81 — no `row_kind: dispatch` row for that `run_id`,
  no dispatch log file created, plus EXACTLY ONE appended `lease_close` row carrying
  `status: refused-preflight`, a `refusal_exit` equal to the wrapper's actual exit code, and present
  `log_path`/`effort`/`attended` fields; while the PRE-LEASE exits 74 and 79 leave no row at all.
  Apart from rows transitioned by the orphan pass, every pre-existing ledger line is byte-identical
  before and after, and the wrapper returns that contractual code rather than an exception; plus one
  uninstrumented-throw case yielding `refusal_exit: "unknown"`. (Task 2, Task 2A, Task 9)
- [ ] Run `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-scopelock-test.ps1` →
  verify: exit 0, with passing cases for a dead `running` row becoming `orphaned` (never terminal),
  three seeded dead rows transitioned in ONE rewrite pass, an orphaned `row_kind: lease` row being
  unselectable by `-Adopt` and printing the `ORPHANED LEASE` line, `-Adopt` selecting an `orphaned`
  dispatch row, a seeded closed lease NEVER being orphaned, `-Adopt -RunId` selecting an exact row
  past a newer match, two racing adopters leaving one winner, exit 80 on redispatch into an
  unresolved worktree_key, and `-AbandonRunId`+`-AbandonReason` clearing it; the abandoned row must
  parse with `waived_gates` equal to `scope,critical,digest,pin,encoding` and a non-empty
  `abandon_reason`; abandoning a dirty-worktree row (lease rows included), a terminal row, an
  `adopting` row, or a live row must exit 82 having mutated nothing; omitting `-Attended` must exit
  83; a concurrent adopt+abandon on one orphaned row must leave exactly one winner; and a
  whitespace-only `-AbandonReason` must exit 74 having mutated no row. (Task 3, Task 3A, Task 4)
- [ ] Run `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-test.ps1` → verify:
  exit 0, and every ledger row it produces — `lease`, `lease_close`, `running`, terminal, adopted —
  parses with non-empty `log_path` and `effort` and an ALWAYS-PRESENT `attended` property valued
  true/false/null; and the `-OwnedWorktree` teardown cases pass against REAL `git worktree add`
  trees, including removal issued from the main repo, the live-sibling AND orphaned-sibling refusals
  under `-AllowSharedWorktree`, the detached-HEAD refusal, teardown after an exit-81 refusal, and a
  parameterless `-ListObligations` whose printed commands run as-is. (Task 5, Task 6)
- [ ] Run `powershell.exe -NoProfile -File skills/apex-code/scripts/verdict-test.ps1` → verify:
  exit 0, including cases where `done_with_concerns` with `unresolved` of `[]`, `[" "]`, and
  `["", " "]` each exits 67 on both the main path and the `-Adopt` path; a review-schema FLAG
  adoption still exits 68 with a synthesized concern; plus the row_kind dedup cases. (Task 8)
- [ ] Run `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1`
  → verify: exit 0, including a byte-level assertion that no wrapper-written file begins with
  `EF BB BF`. (Task 7)
- [ ] Run each of `dispatch-criticalfile-test.ps1`, `dispatch-deadlock-test.ps1`,
  `careless-coder-test.ps1`, `review-findings-test.ps1` → verify: all exit 0, unchanged in behaviour by the identity hoist. (Task 1)
- [ ] Run `Select-String -Pattern 'worktree remove.*--force|git branch -[dD]' skills/apex-code/scripts/codex-dispatch.ps1`
  → verify: no matches. (Task 5)
- [ ] Run `Select-String -SimpleMatch 'declared_runtime_paths' skills/apex-code/scripts/codex-dispatch.ps1`
  → verify: at least one match, spelled exactly `declared_runtime_paths`. (Task 9)
- [ ] Run `Select-String -Pattern 'UTF8Encoding' skills/apex-code/scripts/codex-dispatch.ps1` →
  verify: exactly three matches (the three write helpers). (Task 7)
- [ ] Run `git -C C:\Users\User\.claude status --porcelain -- hooks` → verify: empty output — no
  hook was touched, `apex-ledger-append.ps1` included (spec-wide constraint).
- [ ] Run `Select-String -SimpleMatch 'D8 amendment' docs/technical/adr/ADR-046-doctrine-audit-resolutions.md`
  in the apex repo → verify: one match, and the surrounding text still forbids `--force` and
  wrapper-side branch deletion. (Task 10)
- [ ] Run `Select-String -SimpleMatch 'no dispatch record survives' docs/technical/adr/ADR-040-preflight-gate-and-spec-validator.md`
  in the apex repo → verify: one match, in a paragraph that states the PRE-FLIGHT REFUSAL path is
  append-only and explicitly preserves `Update-LedgerRow` for other row-lifecycle transitions. (Task 10)
- [ ] Run `Select-String -Pattern 'Exit-Dispatch' skills/apex-code/scripts/codex-dispatch.ps1` →
  verify: one definition plus a call at every guarded-region exit site, and no `Exit-Dispatch` call
  after the reservation upgrade. (Task 2A)
- [ ] Run `Select-String -Pattern 'Remove-LedgerRow|File]::Delete|Set-Content.*ledger' skills/apex-code/scripts/codex-dispatch.ps1`
  → verify: no matches — the wrapper never removes a ledger line. (Task 1)
- [ ] Run `powershell.exe -NoProfile -File skills/apex-code/scripts/family-gate-test.ps1` → verify:
  exit 0, including cases where a refused lease, an `orphaned` row, and an `abandoned-unadopted` row
  each newer than a terminal-success reviewed build still leave that build vouched, while a newer
  `row_kind: dispatch` build still masks it. (Task 9A)
- [ ] Run `Get-Content SKILL-HISTORY.md -TotalCount 12` in the apex repo → verify: the newest row
  names `apex-code`, version `2.14.0`, the wrapper plus every test file changed, and exactly two
  research sources plus ADR-046 and ADR-040; and `SKILLS.md` still has three columns. (Task 11)
- [ ] Run `Select-String -SimpleMatch 'ATTENDED-ONLY escape' skills/apex-code/scripts/codex-dispatch.ps1`
  → verify: one match, on the `-AbandonRunId` path. (Task 4)

## Progress
_(The build writes here — do not edit manually)_
