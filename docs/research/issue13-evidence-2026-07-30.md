# Issue-13 evidence dossier — background codex-exec kills at ~8–10 min + "second ceiling"

Stage-0 forensic evidence only. Collected 2026-07-30. All log/doc content treated as untrusted data.

---

## 1. Ledger analysis

Source: `C:\Users\User\AppData\Local\apex\progress\codex-run-ledger.jsonl` — 1,985,543 bytes, 1,521 lines,
all parseable, spanning 2026-07-12 → 2026-07-30. Live file covers the whole 07-15→07-29 window, so the
`.bak-*` siblings were not needed (present: `.bak-20260715` 249 KB, `.bak-session9` 310 KB,
`.bak-20260730` 1,894 KB — the last is the pre-hand-edit backup named in the 07-30 handoff).

### Status counts (all 1,521 rows)
```
done 664 · blocked 425 · done_with_concerns 317 · failed 39 · running 28 · scope-violation 13
adopted-blocked+scope1 7 · abandoned-dead 7 · stalled 7 · adopted-blocked 6 · aborted 4 · killed 3 · adopting 1
```

### Schema fields observed (union over all rows)
`run_id, spec, task, phase, status, started, ended, base_sha, head_sha, worktree, worktree_key, pid,
pid_start, launcher_pid, launcher_start, log_path, final_path, schema, sandbox, scope_armed, scope_task,
authorized, scope_unlocked(+reason), shared_worktree(+reason), tree_pin_label/disabled(+reason)/override,
critical_files_confirmed(+note), builder_family, reviewer_family, builder_model, reviewer_model,
reviewed_run_id, reviewed_commit, reviewed_tree_digest, baseline_skipped, error, stalled, adopted,
adopt_note, report_status, blocker, unresolved, deviations, scopeViolation, scope_exit,
encoding_violation, critical_violation, end_tree_digest, digest_mismatch, tree_moved, verdict,
adjudication, re_close, supersedes, note, attended, in_session`.
NOTE: there is **no launch-mode field** (foreground vs run_in_background vs subagent) and **no effort
field** — the 07-29 retro (P6/P7, a2) confirms `attended`/`effort` are absent-telemetry, not data.
`attended` populated on only 323 rows (194 False / 129 True), `in_session` on 323 (309 True / 14 False).

### (a) Duration histogram — closed rows (1,148 rows with `started`+`ended`), 2-min buckets
```
0-2:376  2-4:125  4-6:126  6-8:102  8-10:75  10-12:58  12-14:44  14-16:33  16-18:20  18-20:30
20-22:20 22-24:19 24-26:15 26-28:14 28-30:12 30-32:9 32-34:12 34-36:9 36-38:11 38-40:1
40-42:4 42-44:2 44-46:6 46-48:2 48-50:1 50-52:2 52-54:4 54-56:4 56-58:6 60-62:6  (max ≈ 63 min)
```
Failed-only closed rows (39): 31 at 0 min (launch refusals / tree-moved pre-flight), 2 at 1 min, 1 at
3, 1 at 5, then a distinct band: **3 rows at 11.x min and 1 at 12.3 min** — nothing between 5 and 11.
The 11–12.3-min failed rows:
- `al-7c-quiet-gate/task1` 11.4 min, 2026-07-14, artemis (error: pytest scratch-dir warning)
- `telegram-inbound-ask-and-gates/plan-check-r2` 11.0 min, 2026-07-17, artemis
- `round8-b1-specsource/plan-check` 12.3 min, 2026-07-17, ~/.claude (report_status null — child died
  with no verdict; rerun 18 min later completed in 18 min → the first was terminated, not slow)
- `live-test-fixes-2026-07-30/wave4-tasks-6-7-8` 11.9 min, 2026-07-30, artemis

### (b) The 8–10 min cluster — non-terminal (orphan) rows, runtime measured as
`log LastWriteTime − started` (the log stops when output stops):
```
status   spec/task                                   date    run-min-by-log
running  launcher-make-current/task1-brain           07-16   10.0
running  always-on-daily-driver/design-consult       07-16    8.8
running  always-on-daily-driver/task4-supervisor     07-16    9.6
stalled  weight-log-fact-and-echo/all-waves          07-27    8.3   (stalled stamp +16.4 min)
running  nav-surfaces-and-relevance/all-waves        07-27   12.3
stalled  project-failed-state-and-detector/wave1     07-27    6.8   (stalled stamp +14.9 min)
```
Plus the 4 failed rows at 11–12.3 min above. **Cluster confirmed: an 8–12-minute band of runs that
stop producing output and never close**, concentrated on 2026-07-16 (artemis + wt-sol-consult,
pre-fix) and 2026-07-27 (Temp\wt-mn-review / wt-fixwave2 worktrees, i.e. POST-fix), with failed-row
echoes on 07-14, 07-17, and 07-30. The `always-on-daily-driver/task4` log (1.3 MB) ends mid-stream on
a perfectly normal completed `git status` event — an abrupt stop, not a codex shutdown sequence.

### (c) Second cluster — ~52–63 min
Orphan rows by log-runtime:
```
aborted        reads-1a-calendar-ask/task1 ×3         07-15   62.8 / 60.4 / 59.1
running        audit-step2-m2b-m3/task0,task10 ×4     07-16   59.0 / 58.8 / 51.7 / 51.6
abandoned-dead watch-3d-feed-watcher/task1-capability 07-14   56.9
stalled        telegram-…/plan-check-r13              07-18   55.6 (log) — stalled stamp at 63.9 min
```
Closed-row tail agrees: 14 rows in 52–62 min, hard max ≈ 63 min across all 1,148 closed rows.
The 07-29 retro independently: "ten of twelve longest runs are plan-check rounds at 54–63 min
(effort max)", "60–71-min build outliers correlate with `adopted-blocked` (kill-ceiling overruns +
adoption overhead)", ledger p99 56.1 / max 63. **A second ceiling at ~55–63 min shows up in the data**
(existence confirmed; mechanism NOT identified by any artifact found).

### (d) Verbatim representative rows

Hand-marked killed row 1 (note `"status": "killed"` **with a space** — every wrapper-written field is
`ConvertTo-Json -Compress` style `"status":"killed"`; the space + missing `ended`/`error` proves these
three rows were edited outside the wrapper, matching the 07-30 handoff "Ledger hygiene: rounds 8/8b
rows corrected to `killed` (dead PIDs verified)"):
```json
{"run_id":"d4337618e578469c9d571b355c406c2c","launcher_pid":28608,"launcher_start":"2026-07-30T01:34:19.8846562Z","worktree":"C:\\users\\user\\apex","worktree_key":"c:/users/user/apex","spec":"doctrine-sweep","task":"plan-check-8","base_sha":"995b4239a5da42183def19625069a6d3a504e3f3","head_sha":"995b4239a5da42183def19625069a6d3a504e3f3","phase":"review","started":"2026-07-30T01:34:20.6282901Z","log_path":"C:\\Users\\User\\AppData\\Local\\apex\\progress\\codex-logs\\codex-doctrine-sweep-plan-check-8-fd59a8c5-d4337618.log","final_path":"C:\\Users\\User\\AppData\\Local\\Temp\\codex-doctrine-sweep-plan-check-8-d4337618.final","schema":"codex-review-schema.json","sandbox":"read-only","baseline_skipped":false,"scope_armed":false,"scope_task":"doctrine-sweep-plan-check-8-d4337618","authorized":[],"scope_unlocked":false,"scope_unlocked_reason":"","shared_worktree":false,"shared_worktree_reason":"","tree_pin_disabled":false,"tree_pin_disabled_reason":"","tree_pin_override":false,"critical_files_confirmed":false,"critical_files_confirmed_note":"","builder_family":"","reviewer_family":"openai","reviewed_run_id":"","reviewed_tree_digest":"","status": "killed","tree_pin_label":"doctrine-sweep-plan-check-8-d4337618","pid_start":"2026-07-30T01:34:22.0262485Z","pid":30924}
```
(Siblings: run_id `5d1399f4…` plan-check-8b, and `87d4f746…` doctrine-sweep/task3 in `~/.claude`,
identical shape, same hand-edited `"status": "killed"`.)

Wrapper-written watchdog-stalled row (8-min no-output → `stalled`, wrapper exits 124, child NOT killed):
```json
{"run_id":"c062d7edf426461aac2560b22c8bf137","launcher_pid":14364,"launcher_start":"2026-07-27T13:11:03.0298968Z","worktree":"C:\\Users\\User\\AppData\\Local\\Temp\\wt-mn-review","worktree_key":"c:/users/user/appdata/local/temp/wt-mn-review","spec":"weight-log-fact-and-echo","task":"all-waves","base_sha":"46f3092","head_sha":"46f3092ca36e8d06d95be96cdafbf726636cf957","phase":"build","started":"2026-07-27T13:11:03.5012217Z","log_path":"...codex-logs\\codex-weight-log-fact-and-echo-all-waves-1adbae1e-c062d7ed.log","final_path":"...Temp\\codex-weight-log-fact-and-echo-all-waves-c062d7ed.final","schema":"codex-completion-schema.json","sandbox":"workspace-write","baseline_skipped":true,"scope_armed":true,...,"pid_start":"2026-07-27T13:11:10.0276155Z","pid":34936,"status":"stalled","stalled":"2026-07-27T13:27:27.4881696Z"}
```

Orphaned `running` row from the 07-16 8–10-min cluster (never updated again; log stops at 9.6 min):
```json
{"run_id":"9c169eedfdbb4f6985ff7027fdb9ba26","launcher_pid":6688,"launcher_start":"2026-07-16T15:41:12.2884643Z","worktree":"C:\\Users\\User\\artemis","worktree_key":"c:/users/user/artemis","spec":"always-on-daily-driver","task":"task4-supervisor-launcher","base_sha":"8c462bd","phase":"build","started":"2026-07-16T15:41:13.9577248Z","log_path":"...codex-logs\\codex-always-on-daily-driver-task4-supervisor-launcher-f04c575f.log","final_path":"...Temp\\codex-always-on-daily-driver-task4-supervisor-launcher-9c169eed.final","schema":"codex-completion-schema.json","sandbox":"workspace-write","scope_armed":true,"scope_task":"always-on-daily-driver-task4-supervisor-launcher-9c169eed","authorized":["scripts/launch-artemis.ps1","README.md"],"tree_pin_label":null,"status":"running","pid_start":"2026-07-16T15:41:27.1509083Z","pid":41120}
```

### Kill references inside ledger free-text (`shared_worktree_reason`) — Atlas, 07-22→07-24
- R12 row (07-22 15:58): "Rerun of killed R11" — R11 orphan row shows only 0.9 min of log.
- R61b (07-23 10:26): "re-dispatch of killed R61 run"; R61c (10:31): "re-dispatch of **accidentally
  killed** R61 runs".
- R68b (07-23 14:16): "re-dispatch of killed R68 run".
- R80b (07-23 18:07): "re-dispatch of killed R80 run".
- R101-r2 (07-24 01:54): "re-dispatch of **externally killed** R101 run (adopt found no verdict)".
So on Atlas the operators themselves recorded, contemporaneously, that runs kept getting killed
externally/accidentally — post-dating the 07-17 fix.

### Killed-row log tails
- `plan-check-8` log (646 KB): last line `2026-07-30T02:00:06 ERROR codex_models_manager::manager:
  failed to renew cache TTL: missing field 'supports_reasoning_summaries'` at +25.8 min → then nothing.
- `doctrine-sweep/task3` log (15 KB, +0.7 min): ends with a **completed** `item.completed
  agent_message {"status":"done","changed_files":[]...}` — child finished, wrapper never closed the
  row. This is the "8c" shape: "The wrapper's outer process dying while its codex child survives (8c)
  is a new observed failure shape" (apex handoff 2026-07-30, ~line 102).

---

## 2. Wrapper code facts — `C:\Users\User\.claude\skills\apex-code\scripts\codex-dispatch.ps1` (2,089 lines)

- **:19** `[int]$NoOutputTimeoutMin = 8` — the only duration constant in the file.
- **:1637 / :1670-1678** watchdog: first check armed at +15 s; every ≥15 s compares the log's
  LastWriteTime; **≥ 8 min of no output** → `Update-LedgerRow … status='stalled'` (:1673) and breaks.
- **:1681-1684** `if ($stalled) { # Do not kill the child: the caller owns that decision.  exit 124 }`.
- **:4-6** header: "A no-output watchdog flags a stalled run but **deliberately does not terminate
  it**; process ownership remains with the caller."
- **:461** "'stalled' is STILL LIVE: the watchdog flags a quiet run and deliberately does NOT kill it."
- **There is NO `Stop-Process`/kill anywhere in the wrapper** (only in test scripts:
  `dispatch-deadlock-test.ps1:73,77`, `review-findings-test.ps1:169`, `sibling-guard-test.ps1:85`).
- **:651-655** (adopt path comment): "A dead dispatch call does NOT mean a dead coder. `codex exec`
  outlives the tool call that launched it: **a harness Bash timeout SIGTERMs the shell (exit 143),
  the child keeps working** … On cap-deps-1b (2026-07-14) the coder kept writing for 3.5 minutes
  after it was declared dead."
- **:1592-1712** the wrapper is FOREGROUND-BLOCKING: `Process.Start()` + a 50 ms drain loop +
  `WaitForExit`. It is the sole drainer of codex's stdout/stderr pipes (64 KB buffers, :1614) and the
  sole log writer — **if the wrapper dies, the log stops and the child's stdout pipe eventually
  fills (~64 KB) and blocks codex**, even though the child "survives".
- Hook `C:\Users\User\.claude\hooks\codex-dispatch-guard.js:22`: "watchdog bounds the run so no
  arbitrary Bash timeout has to; `-Adopt` reports a LIVE run instead …" (hard-blocks raw `codex exec`).
- `references/codex-observability.md:10-12`: "**It does not background the child** — the wrapper
  blocks on `WaitForExit` until Codex finishes; if you want the dispatch off the foreground,
  background the **wrapper invocation** itself." · :121-124 documents watchdog default 8 / exit 124 /
  "does **not** kill the child".

### Git history (`git -C C:\Users\User\.claude log -- skills/apex-code/scripts/codex-dispatch.ps1`)
- `5ebe95b` 2026-07-12 "durable codex dispatcher — ledger + **watchdog** + adopt (A4, ADR-033)" —
  the only commit ever touching `NoOutputTimeoutMin` (`git log -S`): the watchdog was BORN
  non-killing at 8 min and has never changed.
- `51b795a` 2026-07-15 "stop codex-dispatch wedging on a stdin/stdout pipe deadlock" — pipe-servicing
  fix (the 0-byte-log wedge), not a kill fix.
- No commit message in the repo mentions a kill-ceiling fix; **the "watchdog fix" was procedural, not
  code** (see §3: session-76 gotcha, 07-17).

---

## 3. Documented incident timeline

| Date | Source | What it says |
|---|---|---|
| 2026-06-24 | `C:\Users\User\artemis\docs\handoff\2026-06-24.md:29` | "CAL-a is 2515 lines and **hit the 10-min Codex timeout** (but had finished writing; recover by re-verifying the tree, not re-dispatching)" — earliest named 10-min hit. |
| 2026-07-14 | `C:\users\user\apex\docs\handoff\2026-07-14.md:117` | "Full pytest suite timed out at 68% once, passed on a longer timeout. Watch the watchdog default." |
| 2026-07-14/15 | ledger | cap-deps-1b coder outlived its dead dispatch call (wrapper :654 comment); orphan cluster 51.6–62.8 min (audit-step2, reads-1a). |
| 2026-07-16 | ledger | 8.8 / 9.6 / 10.0-min orphaned `running` rows (always-on-daily-driver, launcher-make-current). |
| 2026-07-17 | `C:\users\user\apex\docs\handoff\2026-07-17-session76.md:29-34` | **THE PRIOR FIX**: "Long dispatches must be HOST-owned via `run_in_background`. W3's xhigh edit … **exceeded the 10-min foreground tool ceiling**; the Sonnet orchestrator's foreground dispatch then left an *alive but orphaned* Codex process the ended subagent couldn't collect. The foreground-in-subagent orchestration pattern only works when per-task work fits under ~10 min … For big-file/xhigh waves: host launches `run_in_background`, arms a watcher." |
| 2026-07-17 | ledger | `round8-b1-specsource/plan-check` failed at 12.3 min with no verdict (same day as the fix). |
| 2026-07-22→24 | ledger free-text | Atlas constitution-review R11, R61 (×2, "accidentally"), R68, R80, R101 ("externally killed … adopt found no verdict") all killed and re-dispatched — **post-fix kills**. |
| 2026-07-27 | ledger | wt-mn-review / wt-fixwave2 stalled+running rows at 6.8–18.1 min log-runtime — post-fix. |
| 2026-07-29 | `C:\users\user\apex\docs\research\artemis-retro-2026-07-29.md:202` | Issue table row 13: "Background kills at 8–10 min, second ceiling unconfirmed — **repeated post-fix** · lost runs · watchdog + unknown ceiling". Also :135 (54–63-min plan-checks; 60–71-min outliers ↔ adopted-blocked "kill-ceiling overruns"), :43+:155 (issue-13 root-cause is a named prerequisite), Appendix B (p99 56.1, max 63). |
| 2026-07-30 | ledger + `docs\handoff\2026-07-30.md:101-103, ~113` | doctrine-sweep plan-check-8 (25.8 min), 8b (2.1), 8c/task3 (child finished, wrapper dead) — rows hand-corrected to `killed` after dead-PID verification; backup `.bak-20260730`. Build then used the **"detached-runner pattern (harness kills defeated by Start-Process + marker files + Monitor)"** — the second-generation workaround. `live-test-fixes/wave4` still failed at 11.9 min the same morning. |
| memory | `sonnet-orchestrator-early-return.md` | "processes backgrounded by a SUBAGENT die when the subagent's turn ends … only host-native run_in_background or a subagent's own foreground-blocking call survives the turn" — consistent with session-76; treated as claim + corroborated, not assumed. |

Also: `docs\handoff\2026-07-29-overhaul.md` and `docs\status.md:38` — "Prerequisite task: issue-13
kill-ceiling root-cause." `docs\technical\harness-known-limits.md` has **no** kill-ceiling row.

---

## 4. Harness angle

- `C:\Users\User\.claude\settings.json`: **no** `BASH_DEFAULT_TIMEOUT_MS` / `BASH_MAX_TIMEOUT_MS` /
  any `env` block at all; hooks are 5–10 s stdin-guard timeouts only (irrelevant to long runs). No
  such env vars set in the live environment either; project `settings.local.json` sets none. So the
  harness runs on stock Bash-tool limits: **default 120 s, max 600 s (10 min) per foreground tool
  call** — exactly the "10-min foreground tool ceiling" session-76 names.
- Launch-mode correlation (no ledger field, so inferred from timeline + docs):
  - 07-16 cluster (8.8–10.0 min) = the pre-fix era when a **Sonnet subagent orchestrator ran the
    wrapper foreground** → tool-cap/turn-end kill at ~10 min.
  - Post-fix kills (07-22→24 Atlas, 07-27, 07-30) coincide with backgrounded-by-subagent or
    early-returning-orchestrator sessions (memory: Sonnet build-orchestrators background a dispatch,
    end their turn, are never re-woken; the backgrounded child is reaped at turn end).
  - The 07-30 build that finally went clean used **`Start-Process` detach + marker files + Monitor**
    (see `settings.local.json` allow-entry `PowerShell(& "...scratchpad\dispatch-task4-final.ps1"...)`),
    i.e. escaping the harness process tree entirely — corroborating that the killer is the harness's
    ownership of the process tree, not the wrapper.
- Mechanism note: because the wrapper is the only pipe-drainer (§2), ANY kill of the wrapper mid-run
  has two child outcomes seen in the data: child killed with the tree (log stops abruptly — 07-16
  task4), or child survives but its stdout pipe fills and it wedges/limps (8c; cap-deps-1b). Both
  read as "background dispatch killed at ~N min".

## 5. Candidate root causes (ranked) — see summary. Second-ceiling mechanism remains UNCONFIRMED:
no artifact names a ~60-min limit; candidates worth testing: subagent/session turn caps, Codex CLI or
backend session limits, user/session interrupts (reads-1a rows are marked `aborted`, implying manual
abort). The ~63-min hard max across 1,148 closed rows is the strongest quantitative signature.
