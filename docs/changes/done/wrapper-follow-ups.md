---
spec: wrapper-follow-ups
status: draft
autonomy_level: L2
risk: high
coder_effort: high
max_parallel_codex: 1
---

# Spec: Wrapper follow-ups — six queued items plus producer-side event emission

**Identity:** Closes the six owner-queued `codex-dispatch.ps1` / `apex-family-gate.ps1` adjudication
items from the wrapper-hygiene build, and adds producer-side event emission: the wrapper writes a
schema-valid JSON event file at every BUILD-PHASE terminal point, with Task 7's enumerated
exclusions (review-phase terminals, `-ListObligations`, pre-reservation setup throws, v2 kinds).

**Repo root for every path below:** `C:\Users\User\.claude`. Paths are relative to it, EXCEPT the two
skill-registry files, which live in the separate `C:\users\user\apex` repo and are therefore written
drive-absolute wherever they appear.

## Intent

- **Intent:** The wrapper stops being a thing whose BUILD-PHASE results must be reconstructed from
  stdout. Every build-phase terminal point — that is, every terminal except the ones Task 7
  enumerates as excluded — writes one event file that is already a valid instance of the
  orchestrator protocol schema, and the six queued correctness/perf items are closed in the same
  pass. **No unqualified every-terminal claim is made anywhere in this spec:** the in-scope set and
  the exclusion set are both enumerated in Task 7, and together they account for every terminal in
  the file.
- **Invariants:**
  - **Emission is additive.** No existing stdout line changes, moves stream, or disappears — with
    exactly two named exceptions: the exit-81 refusal moves to `Write-Host` (Task 3d) and the
    `-Adopt` git diff/status tail is bounded (Task 3b). Every other line is byte-identical.
  - **Emission never changes an exit code.** Event writing is best-effort: wrapped so that any
    failure prints one diagnostic and the original exit code still fires unchanged.
  - **The ledger stays authoritative.** An event file is a projection of wrapper variables, never a
    second source of truth, and nothing reads an event back to make a wrapper decision.
  - **`references/orchestrator-protocol-schema.json` is read-only input.** The wrapper and its tests
    read it; neither ever writes, patches, or copies its content into a constant.
  - **Exit 80 stays un-overridable.** `-AllowSharedWorktree` never suppresses it (spec-verbatim
    behaviour stands); only the breadth of what it suppresses changes.
  - **Fields come from the wrapper's own variables.** No field is re-derived by re-reading stdout, a
    log path, or a filename.
- **Non-goals:** v2 event kinds (`reviewer_result`, `family_gate_result`, `agent_result`,
  `integration_verify`, `d1_exception_row`) — they have no `$defs` to validate against. Host-side
  consumption of the event files. Any change to the orchestrator agent file. Narrowing the archived
  retro spec's grep (archived specs are historical records and are not edited).

## Assumptions

- `skills/apex-code/references/orchestrator-protocol-schema.json` exists on disk with its five
  `$defs` (it is untracked in git but present) → impact: Stop
- **Read-only baseline for that schema file is git-object digest `d87a02803a20554d285535a5cda12fde8b62ffd3`**
  (measured 2026-08-01 via `git hash-object`, after the amendment below). This is the exact digest the
  read-only acceptance check compares against — not "whatever it was before the build", which is
  unmeasurable after the fact → impact: Stop
- **Schema amendment, 2026-08-01:** the `refusal` `allOf` was amended so `run_id` MAY be null on
  exits 78 and 82 when the inbound identifier was malformed. The garbage-id emission path below
  relies on that nullability, and the digest above is the post-amendment measurement → impact: Stop
- `$env:APEX_STATE_DIR` isolates all wrapper state, so an events directory beside `progress\` is
  automatically test-isolated → impact: Stop
- The wrapper's existing PowerShell test files are the only harness (no npm, no Pester) → impact:
  Caution
- Wrapper-hygiene is integrated into live `~/.claude`; these anchors reflect the post-integration
  tree → impact: Caution

Simplicity check: yes — considered splitting emission (Task 7) into its own spec. Rejected: six of
the seven behaviour changes touch `codex-dispatch.ps1`, so a split would serialize two builds against
one file for no isolation benefit; `max_parallel_codex: 1` already forces sequential execution here.

## Prerequisites

- Specs that must be complete first: none (wrapper-hygiene shipped 2026-08-01, `d5d872f` / `ecd4a25`)
- Environment setup required: none

## Files to Change

| File | Operation | Notes |
|------|-----------|-------|
| `skills/apex-code/scripts/codex-dispatch.ps1` | modify | Tasks 1, 2, 3b, 3d, 4, 5, 6, 7 |
| `skills/apex-code/scripts/apex-family-gate.ps1` | modify | Task 3a — row-kind skip narrowing |
| `skills/apex-code/scripts/dispatch-preflight-test.ps1` | modify | Tasks 1, 6 cases |
| `skills/apex-code/scripts/dispatch-test.ps1` | modify | Tasks 2, 3b, 4, 5 cases |
| `skills/apex-code/scripts/family-gate-test.ps1` | modify | Tasks 3a, 3c cases |
| `skills/apex-code/scripts/dispatch-events-test.ps1` | create | Task 7 — schema-conformance suite |
| `skills/apex-code/SKILL.md` | modify | exit-79 row wording + `## Events` section |
| `AGENTS.md` | modify | add the events suite to the `## Verify commands` fence |
| `C:\users\user\apex\SKILLS.md` | modify | Task 9 — apex-code registry row, only if the skill row's own fields change |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | Task 9 — one mandatory row for the apex-code skill edit |
| `skills/apex-code/references/orchestrator-protocol-schema.json` | unchanged (read-only input) | Loaded at runtime by the checker; digest-pinned in Assumptions, never written |
| `skills/apex-code/scripts/dispatch-scopelock-test.ps1` | unchanged (regression run only) | Host runs it; no edit |
| `skills/apex-code/scripts/verdict-test.ps1` | unchanged (regression run only) | Host runs it; no edit |
| `skills/apex-code/scripts/dispatch-criticalfile-test.ps1` | unchanged (regression run only) | Host runs it; no edit |
| `skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1` | unchanged (regression run only) | Host runs it; no edit |

**`AGENTS.md` is host-state (a critical path).** It is NOT pre-authorised by `## Permissions` below;
it needs a live attended confirmation at build time. Its `## Verify commands` fence must stay pure —
no prose between the heading and the fence, or the pre-flight refuses every dispatch into this repo
with exit 72 UNPARSEABLE.

## Tasks

- [ ] **Task 1: narrow `-AllowSharedWorktree` suppression to live running/stalled siblings** — files:
  `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-preflight-test.ps1`
  — anchor: the block `if ($AllowSharedWorktree -and $liveHere.Count -gt 0)` in the reservation
  `Invoke-WithLedgerLock`, which today removes EVERY live sibling's run id from `$unresolvedHere`.
  Narrow the removed set to siblings whose status is `running` or `stalled`. A sibling in `adopting`,
  `leasing` (open lease) or `orphaned` stays in `$unresolvedHere` and therefore still produces the
  exit-80 refusal, because an in-flight adoption is a recovery that a shared-worktree launch would
  race. Exit 80 remains un-overridable by any flag. — done when: a dispatch with
  `-AllowSharedWorktree` past an `adopting` sibling exits 80, and past a `running` sibling still
  launches. Test case named `allowshared-adopting-still-80`.

- [ ] **Task 2: remove the `([char]45)` assembly evasion from ListObligations** — files:
  `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-test.ps1` —
  anchor: `$branchDeleteFlag = ([string][char]45) + 'd'` inside `Invoke-ListObligations`. Emit the
  branch-teardown command as a plain literal format string; delete `$branchDeleteFlag` entirely. Add
  a comment above the emitted line recording the corrected acceptance-check guidance for future
  specs: **a check on this line must anchor on the wrapper's own format string, never on a bare
  branch-delete pattern that also matches unrelated text.** The archived retro spec is not edited. —
  done when: no occurrence of `[char]45` remains in the file, and the obligation line is asserted
  byte-exact from captured output in a test case named `obligations-branch-delete-literal`.

- [ ] **Task 3: four delta-review advisories** — files:
  `skills/apex-code/scripts/apex-family-gate.ps1`, `skills/apex-code/scripts/codex-dispatch.ps1`,
  `skills/apex-code/scripts/family-gate-test.ps1`, `skills/apex-code/scripts/dispatch-test.ps1`
  - **(a)** family-gate read loop — anchor: `if ($rowKind -cne 'dispatch') { continue }` (the first
    read loop, around the `# Obligation and lease event schemas...` comment). Replace the
    everything-that-is-not-dispatch skip with an explicit skip of `lease`, `lease_close`,
    `obligation` and `teardown_lease` (the reservation kind Task 4 introduces — it is bookkeeping,
    not a build row, and must not be validated as a dispatch row). Any other row kind falls through
    to the existing dispatch-schema validation,
    so a future kind cannot silently un-vouch a build. Apply the same narrowing to the `$buildRows`
    selection block below it. Test case `gate-exception-row-not-skipped`: a row with
    `row_kind = 'exception'` is not silently skipped.
  - **(b)** `-Adopt` stdout — anchor: the two lines `& git -C $match.worktree --no-pager diff
    $match.base_sha` and `& git -C $match.worktree --no-pager status --porcelain`. The contract says
    the worktree path line is the machine-readable output, so bound the tail: keep at most the first
    50 lines of the combined diff+status, print them via `Write-Host`, and print one trailing
    `[adopt] output truncated` line when it was cut. The `Write-Output $match.worktree` path line
    stays first and stays the only `Write-Output`. Test case `adopt-stdout-bounded`.
  - **(c)** family-gate-test lease fixtures — anchor: `New-FixtureRow ... row_kind = 'lease'` and the
    sibling `row_kind = 'lease_close'` fixture. Rebuild both field-for-field from the production
    writers in `codex-dispatch.ps1` (the `row_kind = 'lease'` row writer and the `row_kind =
    'lease_close'` writer). Every field the writer emits appears on the fixture, spelled identically;
    no field the writer does not emit appears. Test case `lease-fixture-production-shape`.
  - **(d)** exit-81 stream — anchor: the `Write-Output ("[dispatch] REFUSED (exit 81):
    declared_runtime_paths ...` loop. Convert to `Write-Host` so every refusal in the wrapper uses
    one stream. The existing comment about preserving the diagnostic byte-for-byte is superseded by
    Task 7: the durable record is now the refusal event file, and the test asserts from that file,
    never from captured console rendering. **What the event preserves is bounded, not unbounded:**
    the refusal event's `detail` carries the printed line up to the schema's 512-character
    `maxLength` cap, byte-exact WITHIN that cap, with `truncated` set true when the line was cut.
    A refusal line longer than the cap is a fragment by design, and the test asserts the byte-exact
    prefix plus the truncation flag — never byte-exact equality against the whole printed line.
    Test case `exit81-writehost-stream`.
  - done when: all four cases pass and both suites are green.

- [ ] **Task 4: release the ledger mutex around teardown's git subprocess calls** — files:
  `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-test.ps1` —
  anchor: `Invoke-WithLedgerLock -Mutex $teardownMutex -Action {` inside `Invoke-CreatorTeardown`,
  which today holds the named mutex across `git status --porcelain` and `git worktree remove`.
  Restructure so the git calls run outside the hold: take the porcelain status BEFORE acquiring;
  acquire once to read the ledger lines and evaluate dirtiness + every sibling class and decide
  refuse-or-proceed, then release; run `git worktree remove` unlocked; re-acquire only to
  `Save-CreatorTeardownRecord`. **The sibling-liveness evaluation must still happen inside a single
  lock hold** — that atomicity is the point of the lock and is not what is being relaxed.
  - **The reservation closes the check/action gap.** Releasing the mutex before `git worktree remove`
    would otherwise leave a window in which the decision has been made but the worktree still exists
    and reads as free. So: inside the SAME lock hold that decides proceed, and BEFORE releasing, the
    wrapper writes a teardown reservation — a ledger row with `row_kind = 'teardown_lease'` carrying
    the run id, the worktree path, the worktree key, the owning process id and a UTC timestamp.
    The reservation is removed (or closed to a terminal status) inside the re-acquired hold that
    writes `Save-CreatorTeardownRecord`, and on the refusal paths it is never written at all.
  - **A reserved worktree counts as occupied.** Sibling-liveness evaluation and the capacity/weight
    computation both treat a live `teardown_lease` row exactly as they treat a live sibling: a second
    dispatcher targeting that worktree key refuses rather than racing the removal, and
    `-AllowSharedWorktree` does NOT suppress it (Task 1's narrowed suppression covers `running` and
    `stalled` dispatch siblings only; a teardown reservation is neither).
  - **The reservation is not a new lock.** It is a ledger fact read under the existing mutex like
    every other row; nothing waits on it, spins on it, or times it out. A stale reservation whose
    owning process is gone is surfaced by the existing orphan machinery, not by a new reaper.
  — done when: teardown behaviour (refusal kinds, obligation records, printed lines) is unchanged;
  a test case named `teardown-mutex-released-around-git` asserts no git invocation occurs while the
  mutex is held; and a test case named `teardown-reservation-blocks-sibling` asserts that a second
  dispatcher against the reserved worktree key is refused while the `teardown_lease` row is live, and
  proceeds once the reservation is removed.

- [ ] **Task 5: `-Adopt` matches by RunId alone** — files:
  `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-test.ps1` —
  anchors: the guard `if ([string]::IsNullOrWhiteSpace($Spec) -or [string]::IsNullOrWhiteSpace($Phase))
  { throw '-Adopt requires -Spec and -Phase.' }` and the selection filter `if ($row.spec -ne $Spec -or
  $row.phase -ne $Phase) { continue }` in `Invoke-Adopt`. When `-RunId` is supplied, the run id is the
  sole selector, **but not the sole filter.** A run id is unique per RUN, not per ROW: the same id
  appears on the `dispatch` row and on the `lease`, `lease_close`, `obligation` and (per Task 4)
  `teardown_lease` rows written for that run, so a bare `$row.run_id -ceq $RunId` scan matches
  several rows and could select bookkeeping. **The selector is therefore exact: among the rows
  carrying that run id, take the NEWEST row whose `row_kind` is `dispatch`.** Three clauses fix its
  edges:
  - **`dispatch` only.** `lease`, `lease_close`, `obligation` and `teardown_lease` rows are never
    selectable, whatever their status. An orphaned open lease sitting beside a real dispatch row for
    the same id therefore does NOT shadow it — the dispatch row wins because it is the only kind in
    the candidate set.
  - **Legacy rows count as dispatch.** A row written before `row_kind` existed has no `row_kind`
    field at all; a missing (or empty) `row_kind` is read as `dispatch`, because that is the only
    kind the pre-`row_kind` writer ever emitted. Treating it as "not dispatch" would make every
    historical run unadoptable.
  - **Newest wins, and a lease-only id is a distinct refusal.** "Newest" is the last such row in
    ledger order (the ledger is append-only), so a re-dispatched id adopts its current run, not a
    superseded one. If the run id exists in the ledger but yields ZERO dispatch rows — a lease was
    taken and the run never launched — refuse with exit 75 and a DISTINCT printed line naming the id
    and stating there is nothing to adopt (a lease was reserved but no dispatch row was ever
    written), not the generic not-found wording. If the id is absent entirely, the existing
    not-found refusal stands.

  `spec`, `phase`, `task` and `worktree` are DERIVED from
  the selected row for everything downstream. Caller-supplied `-Spec` / `-Phase` / `-Task` /
  `-Worktree` become cross-checks only: when supplied and mismatching the row, refuse with exit 75
  and a printed line naming the mismatching field — never adopt a different row. When `-RunId` is
  NOT supplied the existing requirement stands unchanged: `-Spec`, `-Phase` and `-Worktree` are all
  mandatory and the old spec+phase+task+worktree_key filter applies. — done when: a row whose phase
  is `verify-fast` is adoptable by `-Adopt -RunId <id>` with no `-Phase`, in a test case named
  `adopt-by-runid-any-phase`; a supplied-but-wrong `-Spec` refuses 75 rather than adopting; and the
  three selector cases below pass:
  - `adopt-selects-dispatch-over-orphaned-lease` — one run id carrying an orphaned OPEN `lease` row
    and a `dispatch` row; `-Adopt -RunId <id>` selects the dispatch row.
  - `adopt-refused-lease-only-id` — one run id carrying a `lease` (and `lease_close`) row and NO
    dispatch row; `-Adopt -RunId <id>` refuses exit 75 with the distinct nothing-to-adopt line, and
    the test asserts that wording, not merely the exit code.
  - `adopt-legacy-row-no-rowkind` — one run id on a single row with no `row_kind` field at all;
    `-Adopt -RunId <id>` adopts it as a dispatch row.

- [ ] **Task 6: distinct marker for the permanent exit-79 sub-case** — files:
  `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-preflight-test.ps1`,
  `skills/apex-code/SKILL.md` — anchor: `if ($script:capacityConfigurationRefusal) { Write-Host
  "[dispatch] REFUSED (exit 79): ..." }`. Keep exit 79 for compatibility, and print one additional
  line immediately after the existing refusal line, verbatim:
  `[dispatch] PERMANENT: invalid capacity contract (do not re-queue).`
  The at-capacity path (the `AT CAPACITY (exit 79)` banner) is unchanged and prints no such line, so
  a caller tells transient from permanent by the marker's presence. Update the SKILL.md exit-79 row
  to say the two sub-cases route differently: at-capacity queues; the invalid-contract sub-case
  prints the PERMANENT marker and the caller parks and fixes the spec frontmatter instead of
  re-queueing. — done when: test case `exit79-invalid-contract-marker` asserts the marker on an
  unparseable `max_parallel_codex` and its absence on an at-capacity refusal.

- [ ] **Task 7: producer-side event emission (v1 kinds)** — files:
  `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-events-test.ps1`,
  `skills/apex-code/SKILL.md`, `AGENTS.md`
  - **Events directory:** `Join-Path $apexStateRoot 'events'`, declared beside `$ledgerDirectory`
    (anchor: `$ledgerDirectory = Join-Path $apexStateRoot 'progress'`), created on demand. It follows
    `$env:APEX_STATE_DIR`, so tests are isolated for free.
  - **One writer:** a single function — name it `Write-DispatchEvent` — is the only thing in the
    wrapper that writes an event file. It takes the already-populated field set, serializes with
    `ConvertTo-Json -Depth 8`, writes UTF-8 no-BOM through the existing helper, and prints exactly
    one line: `[event] <full path>`. It is wrapped so that ANY failure prints
    `[event] FAILED: <reason>` and returns — the caller's exit code fires unchanged either way.
  - **DESIGN DIRECTIVE — emission routes through the ONE exit path.** `codex-dispatch.ps1` already
    has a single exit helper, `Exit-Dispatch([int]$Code)` (it sets `$script:pendingExitCode` and
    exits). `Write-DispatchEvent` is called from INSIDE that helper and from nowhere else, so
    "every terminal emits" is a property of one function rather than of N remembered call sites.
    **Per-site emission is forbidden** — a task that adds an `emit` call next to a `Write-Host …
    REFUSED` line is doing it wrong. Consequence, and it is deliberate: any in-scope terminal that
    today reaches a bare `exit <n>` instead of `Exit-Dispatch <n>` must be converted to
    `Exit-Dispatch <n>` to be covered. Converting a bare `exit` is a permitted, expected edit;
    adding a second emitter is not.
  - **Terminal points covered — BUILD PHASE ONLY in this spec.** In scope: the build-phase dispatch
    completion path (after the exit-precedence chain resolves) and the adopt terminal, which emit
    `dispatch_result`; the abandon success, which emits `dispatch_result` carrying the closed row's
    `abandoned-unadopted` status with `exit_code` 0; and the build-phase refusal exits — 71, 72, 74,
    75, 76, 79, 80, 81, 82, 83, 124 — which emit `refusal`.
  - **Explicitly EXCLUDED — these emit NOTHING, and the exclusion is enumerated, not implied.** Each
    one is out because v1 has no `$def` that fits it, and each becomes in-scope only when the v2
    `$defs` land:
    1. **Every review-phase terminal.** `-Phase review` dispatches, the `-Schema review` / `endgate`
       read-only gates, and every exit 78 (all four sites: the not-found reviewed build, the missing
       `end_tree_digest`, the unreadable live digest, and the digest mismatch). Exit 78 is a
       review-phase code and is therefore absent from the in-scope refusal list above.
    2. **`-ListObligations` exits.** The obligation listing is a report, not a dispatch terminal.
    3. **Pre-reservation setup throws.** Anything that throws or exits before the events directory
       and the run identity exist — the parameter-validation exit-74 block at the top of the file
       above `Exit-Dispatch`'s definition, ledger-unreadable throws, and any `throw` that PowerShell
       turns into exit 1. Exit 1 is not in the schema's `exit_code` enum and is not emitted.
    4. **v2 kinds** — `reviewer_result`, `family_gate_result`, `agent_result`, `integration_verify`,
       `d1_exception_row` (already a stated non-goal).
  - **Naming — one file per emission, never overwritten.** `<run_id>-<n>.event.json`, where `n` is a
    1-based counter that increments per emission for that run id: a run that times out (124), is then
    adopted (75), and is then adopted to done produces THREE files —`<id>-1.event.json`,
    `<id>-2.event.json`, `<id>-3.event.json`. The counter is derived by enumerating existing
    `<run_id>-*.event.json` files in the events directory and taking the highest `n` plus one, under
    the same ledger mutex the wrapper already holds for ledger writes, so two processes cannot claim
    the same `n`. **Consumers take the highest-`n` file for a run id as the current one**; the lower
    ones are that run's history and are never deleted by the wrapper. When a refusal has no run
    identity (the codes whose `run_id` is null: 71, 72, 74, 76, 79, 81, 83) there is nothing to
    count against — plus the malformed-inbound-id events below, which carry exit 82 (or 78 once
    review-phase emission lands in v2) with a null `run_id` and therefore have no id to count
    against either — so the name is `<yyyyMMddTHHmmssfffZ>-<exit>-<random4>.event.json`, where
    `random4` is four lowercase hex characters — the timestamp alone collides when two identity-less
    refusals land inside the same millisecond. **Random is not unique, so the write is ATOMIC
    create-if-absent, never a plain overwrite:** open the path with a fail-if-exists disposition
    (`[System.IO.File]::Open(<path>, [IO.FileMode]::CreateNew, …)`), and on the collision failure
    draw a FRESH `random4` and retry — bounded to a small fixed number of attempts (5), after which
    the emitter takes its normal best-effort failure path (`[event] FAILED: <reason>`, exit code
    unchanged). The atomic create is therefore a guarantee against SILENT overwrite — a colliding
    write fails and redraws rather than clobbering, and exhausting the 5 retries takes that
    documented emission-failure path instead of writing over the file already there.
  - **Refusals whose identifying input cannot be represented.** The schema pins `run_id` shape by
    exit code: `^[0-9a-f]{32}$` on 75/80/82/124, `minLength: 22` on 78. A refusal can nonetheless be
    triggered by ARBITRARY caller input — `-AbandonRunId zzz` reaches the 82 not-found refusal, and
    `-ReviewedRunId zzz` reaches 78 — and that raw string is not a ledger id and must never be
    written into a `run_id` field it does not fit. **The 2026-08-01 schema amendment resolves this
    directly:** `run_id` MAY be null on exits 78 and 82 when the inbound identifier was malformed, so
    the event needs no identity-less disguise. On such a path the event carries the REAL process exit
    code — `82` (or `78` when review-phase emission lands in v2) — with `run_id` null, `synthesized`
    false (the wrapper DID print a standardized refusal line), `rule` null like every other wrapper
    refusal, and the raw caller input inside `detail`, bounded to `detail`'s 512-character cap with
    `truncated` true when cut. **Provenance stays intact:** the event's `exit_code` is the process's
    exit code on every path without exception, and a null `run_id` beside an 82 now means exactly
    one thing — the caller supplied an identifier the ledger shape rejects. Test case
    `event-refusal-garbage-id-null-runid` asserts exit code 82, null `run_id`, `synthesized` false,
    and the bounded raw input in `detail`.
  - **Field sourcing:** every field comes from the wrapper's OWN variables at that point — the run
    id, log path, ledger status, `report_status`, the four violation flags, `tree_moved`, the parsed
    `.final` object, the concerns text, the scope-check text, the porcelain. Nothing is re-parsed
    from stdout, a log file, or a path.
  - **Schema conformance:** each event is a valid instance of the correspondingly named `$def` in
    `skills/apex-code/references/orchestrator-protocol-schema.json` — every `required` key present,
    no key outside `properties` (`additionalProperties: false`), enums and consts respected, strings
    within `maxLength`, arrays within `maxItems`.
  - **Synthesized / truncated:** on `dispatch_result`, `truncated` is the array naming every field
    the wrapper cut to a cap or filled itself rather than reading from a producer. On `refusal`,
    `synthesized` is `true` exactly on the paths that print no standardized refusal line — 124, the
    live-coder 75, and the live-sibling 71 — where `detail` is the wrapper's own one-line factual
    description; `false` elsewhere, where `detail` is the printed line verbatim. `truncated` (bool)
    is `true` only when `detail` or `tail` was cut. `rule` is null on **every** wrapper refusal
    without exception — `rule` names a HOST structural check, and the wrapper runs none; the
    malformed-inbound-id path above is no longer an exception, because the amended schema lets it
    carry its real exit code and a null `run_id` instead of an identity-less disguise.
  - **Scope:** v1 kinds only. No other `$def` is emitted; v2 kinds emit when their `$defs` land.
  - **SKILL.md:** add a short `## Events` section — where the directory is, the two v1 kinds, the
    `[event] <path>` line, and that the file is a read, not a reconstruction. Point at the schema
    file; do not restate its fields.
  - **AGENTS.md:** add `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1`
    inside the existing `## Verify commands` fence. Nothing but command lines goes in that fence.
  - **Coverage proof — mechanical, not asserted. The task MANDATES that every build-phase code path
    leaves the process through `Exit-Dispatch`.** The builder records, at build time, into the
    `## Progress` section, TWO enumerations with exact line numbers:
    1. every `Exit-Dispatch` call site
       (`Select-String -SimpleMatch 'Exit-Dispatch' skills/apex-code/scripts/codex-dispatch.ps1`;
       the pre-build count is 27 including the function definition), and
    2. every remaining bare process-leaving statement — `Select-String -Pattern '^\s*exit\s'` and
       `Select-String -Pattern '\bthrow\b'` over the same file.
    **Both enumerations count only what lies OUTSIDE the `Exit-Dispatch` helper itself** — its own
    `function` definition line (part of that raw count of 27, but not a call site) and the `exit`
    statement(s) inside its body are excluded, because the helper is the routing target and the
    emitter, not a call site or an unrouted terminal.
    **Every bare `exit`/`throw` in enumeration 2 must sit in a pre-reservation or setup region that
    is NAMED on the exclusion list above** (exclusion 3, plus the review-phase and `-ListObligations`
    regions of exclusions 1 and 2). Any bare `exit`/`throw` on a build-phase path is REFACTORED to
    route through `Exit-Dispatch` — that refactor is in scope and expected, not a deviation.
    Every in-scope build-phase terminal must appear in enumeration 1. The two enumerations plus the
    exclusion list together account for every terminal in the file — that accounting, not a per-site
    reading, is what proves coverage. A terminal in neither is a build BLOCK.
  - done when: every terminal point above writes a file that the Task 8 conformance checker accepts,
    the only caller of `Write-DispatchEvent` is `Exit-Dispatch`, and the call-site enumeration is
    recorded with every entry either in-scope or explicitly excluded.

- [ ] **Task 8: fixture-driven tests for every changed behaviour** — files:
  `skills/apex-code/scripts/dispatch-events-test.ps1`, `skills/apex-code/scripts/dispatch-test.ps1`,
  `skills/apex-code/scripts/dispatch-preflight-test.ps1`, `skills/apex-code/scripts/family-gate-test.ps1`
  — follow the existing harness pattern in `dispatch-test.ps1` (`New-FixtureRepo`,
  `New-TestSiblingRow`, `Invoke-DispatchCase`, `Invoke-AdoptCase`, `Assert-Case`); every fixture row
  is derived field-for-field from the production writer that emits that row kind, never invented.
  `dispatch-events-test.ps1` additionally implements the conformance checker as a function named
  `Test-EventAgainstSchemaDef` that **loads the `$def` from the schema file at runtime**. The
  mandated keyword list is exactly: `required`, `additionalProperties`, `type`, `enum`, `const`,
  `pattern`, `minLength`, `maxLength`, `maxItems`, and the `refusal` `allOf` conditionals binding
  `run_id` presence and shape to `exit_code` — including the 2026-08-01 amendment that permits a null
  `run_id` on exits 78 and 82. **`pattern` is not optional** — the 32-hex shape pin on
  75/80/82/124 is the only thing that distinguishes a read id from a reconstructed one, and a checker
  that skips it passes the exact bug the schema exists to catch. The schema is never copied into a
  constant, so the check cannot drift from the file.

  **The fixture set is ENUMERATED per class, not sampled.** `event-refusal-valid` and
  `event-dispatch-result-valid` are the two case-name prefixes, and each covers every member of its
  class — one fixture apiece, each validated against its `$def`:
  - **Refusals — one per build-phase-reachable refusal exit:** 71, 72, 74, 75, 76, 79, 80, 81, 82,
    83, 124. Plus **78's malformed-id variant**: exit 78 is review-phase and therefore emits nothing
    from the wrapper until v2, so this one fixture is checked as a SCHEMA-shape case (constructed by
    the test, not produced by a wrapper terminal) — it is what proves the amended null-`run_id`
    allowance holds for 78 as well as for 82.
  - **Completions — one per completion status:** `done`, `done_with_concerns`, `blocked`.
  - **Adopt outcomes — one per outcome:** `adopted-done`, `adopted-done_with_concerns`,
    `adopted-blocked`, `adopted-void`, the 75-still-live refusal, and the 75-already-abandoned
    refusal.
  - **Abandon:** the abandon-success emission (`abandoned-unadopted`, `exit_code` 0).

  `event-filename-collision-distinct` asserts that three emissions for one run id produce three
  distinct files with increasing `n` and that the highest-`n` file is the last one written; and
  `event-filename-identityless-collision-retry` forces two identity-less refusals into the same
  millisecond WITH the same drawn `random4`, and asserts the fail-if-exists create rejected the
  second, that a fresh suffix was drawn, and that two distinct files exist with neither overwritten.
  — done
  when: every suite named in `## Acceptance Criteria` exits 0 when run by the HOST, not by the coder.

- [ ] **Task 9: registry double-write for the apex-code skill edit** — files:
  `C:\users\user\apex\SKILL-HISTORY.md`, `C:\users\user\apex\SKILLS.md` — this spec edits
  `skills/apex-code/SKILL.md` (Task 6's exit-79 row, Task 7's `## Events` section), and the APEX
  repo's double-write rule makes the registry update part of the change, not an afterthought.
  - `C:\users\user\apex\SKILL-HISTORY.md`: **one row, mandatory**, newest first, in the existing
    column order `Date | Skill | Files | Version | Event | What Changed | Sources`. Date `2026-08-01`,
    skill `apex-code`, files the SKILL.md plus the scripts touched, version the bumped apex-code
    version, event `update`, what-changed a one-line summary naming the six queued items and the
    producer-side event emission, sources this spec's path.
  - `C:\users\user\apex\SKILLS.md`: **conditional** — update the apex-code row only if a field on
    that row actually changes (the version string does, if the skill's frontmatter version is
    bumped). If no field on the row changes, the file is left untouched and the task records why.
    Do not invent a new column or reflow the table.
  - Both files are in a DIFFERENT repo from the wrapper; they are edited in place at the
    drive-absolute paths above and are not part of any worktree this build creates. — done when:
    `SKILL-HISTORY.md` carries exactly one new apex-code row for this change and `SKILLS.md` either
    carries the matching version or is provably unchanged.

## Wave plan

Sequential; every task but 3a touches `codex-dispatch.ps1`, and `max_parallel_codex: 1` forces one
worker regardless.

Wave 1: [Task 1] | Wave 2: [Task 2] | Wave 3: [Task 3] | Wave 4: [Task 4] | Wave 5: [Task 5] |
Wave 6: [Task 6] | Wave 7: [Task 7] | Wave 8: [Task 8] | Wave 9: [Task 9]

Task 9 is last because the registry row records the finished version, which is only known once the
skill edits in Tasks 6 and 7 have landed.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (`status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, `status.md`, and spec archival — under D6.)
docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations
| Action | Paths |
|--------|-------|
| Create | `skills/apex-code/scripts/dispatch-events-test.ps1` |
| Modify | `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/apex-family-gate.ps1`, `skills/apex-code/scripts/dispatch-test.ps1`, `skills/apex-code/scripts/dispatch-preflight-test.ps1`, `skills/apex-code/scripts/family-gate-test.ps1`, `skills/apex-code/SKILL.md`, `C:\users\user\apex\SKILL-HISTORY.md`, `C:\users\user\apex\SKILLS.md` |
| Delete | (none) |
| **Attended confirmation required** | `AGENTS.md` (host-state — not pre-authorised here) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1` | Event schema-conformance suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-test.ps1` | Dispatch/adopt/teardown suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1` | Pre-flight/refusal suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/family-gate-test.ps1` | Family-gate suite |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-scopelock-test.ps1` | Scope-lock suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/verdict-test.ps1` | Verdict suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-criticalfile-test.ps1` | Critical-file suite (regression) |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-encoding-utf8-test.ps1` | Encoding suite (regression) |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git status` / `git worktree list` | Read-only worktree and working-tree state, for the teardown and reservation test fixtures |

**The builder stages and commits nothing.** `git add` and `git commit` are deliberately absent:
integration and commits are HOST-side, per-spec, after the host has run the full suite. A builder
that stages or commits has taken the host's pen.

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR` | Test isolation of the ledger and the new events directory |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network access |

## Specialist Context
### Security
(none)

### Performance
Task 4 only: the ledger mutex is a machine-global named mutex, so a hold spanning two git
subprocesses blocks every other wrapper on the machine for the duration. The teardown reservation is
what makes that release safe — it converts a held lock into a recorded fact, so the perf win does not
buy a check/action race.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Inline | `skills/apex-code/scripts/codex-dispatch.ps1` | Comment the emitter and each narrowed guard |
| Skill | `skills/apex-code/SKILL.md` | exit-79 row rewording + new `## Events` section |
| Registry | `C:\users\user\apex\SKILL-HISTORY.md` | Task 9 — one mandatory row (double-write) |
| Registry | `C:\users\user\apex\SKILLS.md` | Task 9 — apex-code version row, only if the row changes |

## Acceptance Criteria

- [ ] Task 1 → verify: `Select-String -SimpleMatch 'allowshared-adopting-still-80' skills/apex-code/scripts/dispatch-preflight-test.ps1` matches, and the suite exits 0
- [ ] Task 2 → verify: `Select-String -SimpleMatch '[char]45' skills/apex-code/scripts/codex-dispatch.ps1` returns NO match, and `Select-String -SimpleMatch 'obligations-branch-delete-literal' skills/apex-code/scripts/dispatch-test.ps1` matches
- [ ] Task 3 (sub-items a and c) → verify: `Select-String -SimpleMatch 'gate-exception-row-not-skipped'` and `Select-String -SimpleMatch 'lease-fixture-production-shape'` both match in `skills/apex-code/scripts/family-gate-test.ps1`, and the suite exits 0
- [ ] Task 3 (sub-items b and d) → verify: `Select-String -SimpleMatch 'adopt-stdout-bounded' skills/apex-code/scripts/dispatch-test.ps1` matches; `Select-String -SimpleMatch 'exit81-writehost-stream' skills/apex-code/scripts/dispatch-preflight-test.ps1` matches; `Select-String -SimpleMatch 'Write-Output ("[dispatch] REFUSED (exit 81)' skills/apex-code/scripts/codex-dispatch.ps1` returns NO match
- [ ] Task 4 → verify: `Select-String -SimpleMatch 'teardown-mutex-released-around-git' skills/apex-code/scripts/dispatch-test.ps1` matches, `Select-String -SimpleMatch 'teardown-reservation-blocks-sibling' skills/apex-code/scripts/dispatch-test.ps1` matches, `Select-String -SimpleMatch "teardown_lease" skills/apex-code/scripts/codex-dispatch.ps1` matches, and the suite exits 0
- [ ] Task 5 → verify: `Select-String -SimpleMatch 'adopt-by-runid-any-phase' skills/apex-code/scripts/dispatch-test.ps1` matches; all three selector cases match in that same file — `Select-String -SimpleMatch 'adopt-selects-dispatch-over-orphaned-lease'`, `Select-String -SimpleMatch 'adopt-refused-lease-only-id'`, `Select-String -SimpleMatch 'adopt-legacy-row-no-rowkind'`; and `Select-String -SimpleMatch "throw '-Adopt requires -Spec and -Phase.'" skills/apex-code/scripts/codex-dispatch.ps1` returns NO match
- [ ] Task 6 → verify: `Select-String -SimpleMatch 'PERMANENT: invalid capacity contract (do not re-queue).'` matches in BOTH `skills/apex-code/scripts/codex-dispatch.ps1` and `skills/apex-code/SKILL.md`
- [ ] Task 7 → verify: `Select-String -SimpleMatch 'Write-DispatchEvent' skills/apex-code/scripts/codex-dispatch.ps1` matches; `Select-String -SimpleMatch '## Events' skills/apex-code/SKILL.md` matches; `Select-String -SimpleMatch 'dispatch-events-test.ps1' AGENTS.md` matches
- [ ] Task 7 → verify: `git hash-object skills/apex-code/references/orchestrator-protocol-schema.json` returns exactly `d87a02803a20554d285535a5cda12fde8b62ffd3`, the read-only baseline recorded in `## Assumptions` (the wrapper never edits its schema input)
- [ ] Task 7 → verify: `Write-DispatchEvent` is called from exactly one place — `Select-String -SimpleMatch 'Write-DispatchEvent' skills/apex-code/scripts/codex-dispatch.ps1` returns exactly two hits, the function definition and the single call inside `Exit-Dispatch`
- [ ] Task 7 → verify: BOTH enumerations are recorded in `## Progress` with build-time line numbers — the `Exit-Dispatch` call sites with their count, and every remaining bare `exit `/`throw` statement; every `Exit-Dispatch` entry is an in-scope build-phase terminal or named in the Task 7 exclusion list, and every bare `exit`/`throw` entry sits in a region named on that exclusion list
- [ ] Task 7 → verify: `Select-String -SimpleMatch 'event-refusal-garbage-id-null-runid' skills/apex-code/scripts/dispatch-events-test.ps1` matches
- [ ] Task 8 → verify: `Select-String -SimpleMatch 'Test-EventAgainstSchemaDef' skills/apex-code/scripts/dispatch-events-test.ps1` matches; `Select-String -SimpleMatch "'pattern'" skills/apex-code/scripts/dispatch-events-test.ps1` matches (the checker enforces `pattern`, not only the length caps); `Select-String -SimpleMatch 'event-filename-collision-distinct' skills/apex-code/scripts/dispatch-events-test.ps1` matches; `Select-String -SimpleMatch 'event-filename-identityless-collision-retry' skills/apex-code/scripts/dispatch-events-test.ps1` matches; and that file contains NO literal copy of a `$def` (it loads `orchestrator-protocol-schema.json` at runtime)
- [ ] Task 8 → verify: the enumerated fixture set is complete — `dispatch-events-test.ps1` carries one `event-refusal-valid` case per exit in 71, 72, 74, 75, 76, 79, 80, 81, 82, 83, 124 plus the 78 malformed-id schema-shape case; one `event-dispatch-result-valid` case per completion status (`done`, `done_with_concerns`, `blocked`); one per adopt outcome (`adopted-done`, `adopted-done_with_concerns`, `adopted-blocked`, `adopted-void`, 75-still-live, 75-already-abandoned); and one abandon-success case
- [ ] Task 7 → verify: the identity-less event write is atomic — `Select-String -SimpleMatch 'CreateNew' skills/apex-code/scripts/codex-dispatch.ps1` matches, and no identity-less emission path uses a plain overwrite
- [ ] Task 9 → verify: `Select-String -SimpleMatch 'apex-code' C:\users\user\apex\SKILL-HISTORY.md` shows exactly one new row dated 2026-08-01 for this change, and the apex-code row in `C:\users\user\apex\SKILLS.md` either carries the matching version or the task records that no field on it changed
- [ ] Full suite green → verify: the HOST runs EVERY command in `## Commands` above, not the repair subset, and each exits 0
- [ ] Reachability — an event file written by a real wrapper terminal point is read back and validated end-to-end → verify: `dispatch-events-test.ps1` dispatches a fixture run to completion and a fixture run to a refusal, reads the two files off disk in the events directory, and asserts each against its `$def` loaded from the schema file (round-trip: the wrapper's own write is the checker's input)

Every criterion above is satisfiable by the BUILDER against fixtures under `$env:APEX_STATE_DIR`.
No criterion requires touching the live ledger — that is deliberate, and the one step that does is
below, out of the builder's reach.

## Post-integration host steps

Attended, host-executed, AFTER the build is integrated and the full suite is green. These mutate
LIVE state, so they are not builder acceptance criteria and a builder that attempts one has
overstepped.

1. **Recover the 7 stuck live ledger rows.** The rows in the live `~/.claude` ledger whose phase is
   `verify-fast` or `verify-stall` and whose status is non-terminal are adopted one at a time with
   Task 5's new selector: `codex-dispatch.ps1 -Adopt -RunId <id>` with no `-Phase`.
   - Verify: after the pass, re-read the live ledger and confirm no row with phase `verify-fast` or
     `verify-stall` remains in a non-terminal status. Count the rows before and after; the before
     count is 7 at the time of writing and is re-measured at execution rather than assumed.
   - If a row refuses (exit 75 or 82), it is recorded and left alone — a refusal here is data about
     the row, not a build regression, and it is never forced with `-AbandonRunId`.

## Progress
_(The build writes here — do not edit manually)_
