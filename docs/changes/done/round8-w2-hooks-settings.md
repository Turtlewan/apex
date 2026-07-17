---
spec: round8-w2-hooks-settings
status: draft
autonomy_level: L2
coder_model: codex
coder_effort: high
cross_model_review: true
---

# Spec: Round-8 Wave 2 — fail-open/correctness fixes in the four guard hooks + settings.json

**Identity:** Close the fail-open and correctness defects the round-8 four-way review found in the four APEX PreToolUse guard hooks and `settings.json`, and add the reason-gated, audited kill-switch. → why: see docs/technical/adr/ADR-043-guard-disable-reason-audit.md

## Intent
- **Intent:** Every guard hook must FAIL CLOSED — malformed, truncated, delayed, held-open, or absent hook input, and every correctness gap the review found, must not silently allow the command the guard exists to block.
- **Invariants:**
  - A guard never allows on an input it could not validate: deny on parse error, timeout, exception, OR malformed shape.
  - **Malformed shape denies; valid-but-empty allows.** A parseable event with a field of the wrong type or a missing required field is a MALFORMED SHAPE and denies (a Write whose `file_path` is an object → deny; a Bash whose `command` is a non-string → deny). A parseable event that is genuinely empty — an absent or empty-string Bash command, an absent/empty-string `file_path` with no cap target — is VALID-but-empty and is correctly allowed. The distinction is type/structure, not emptiness.
  - **The block signal is the real decision, not printed text.** Every fail-closed path emits an actual `hookSpecificOutput.permissionDecision: 'deny'` object on stdout — the same signal Claude Code acts on and each guard already uses to block — never a bare printed string. Tests assert on the parsed `permissionDecision` field (or the documented exit code), never on a loose `"deny"` substring.
  - A kill-switch is honored only with a non-empty reason and always leaves an audit line. The disable decision + audit is one shared helper, not two copies.
  - Every code fix ships a test that fails on pre-fix code and passes after (RED before GREEN). Node hooks stay `node --check`-clean.
- **Non-goals:** No evasion hardening (no base64/Unicode/obfuscation defeat beyond what already exists) — the threat model is a careless operator, not a hostile one. No new guards, no behavior change to the wrapper.

## Assumptions
- The four hooks receive PreToolUse JSON on stdin and signal a block by writing a `hookSpecificOutput.permissionDecision` object (value `deny`/`ask`) to stdout; an empty stdout is "allow". Claude Code acts ONLY on that decision field (or `exit 2`) — printed text alone does not block. → impact: Stop
- `permissionDecision: 'deny'` is the correct fail-closed signal, and it is what the tests must assert on (parse stdout and check the `permissionDecision` field) — NOT a `"deny"` substring or a merely non-empty stdout, which a fix could satisfy while still failing to block in production. → impact: Stop
- `codex-dispatch.ps1` spawns Codex as a PowerShell child process, not as a Bash tool call, so removing `Bash(codex exec:*)` does not touch the wrapper path. → impact: Stop
- Node is on PATH as `node`; Python as `python` for the `.py` harness. → impact: Caution

Simplicity check: considered folding both destructive tasks into one — rejected: destructive-detect.js and destructive-command-guard.js are separate files with separate review surfaces; the one shared file (destructive-guard-test.py) is serialized across waves instead.

## Prerequisites
- Specs that must be complete first: none (this is a self-contained spec).
- Within this spec: Task 4 has a build edge on Task 2 (imports the shared `C:/Users/User/.claude/hooks/lib/guard-disable.js` that Task 2 creates) AND on Task 1 (both edit `C:/Users/User/.claude/hooks/destructive-guard-test.py`; Task 1 owns its detection cases in Wave 1, Task 4 appends its own cases in Wave 2 — never concurrently).
- Environment setup required: none.

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| C:/Users/User/.claude/hooks/lib/destructive-detect.js | modify | Task 1 — force-refspec/main normalization, runner-unwrap (direct predicates AND carrier), command-position dd-if detection, checkout --force |
| C:/Users/User/.claude/hooks/destructive-guard-test.py | modify | Task 1 adds detection cases; Task 4 fixes the cwd-relative invocation + adds fail-closed/kill-switch checks |
| C:/Users/User/.claude/hooks/lib/guard-disable.js | create | Task 2 — shared reason-gated disable + audit helper, consumed by Task 4 |
| C:/Users/User/.claude/hooks/codex-dispatch-guard.js | modify | Task 2 — fail-closed input, eval/Start-Process carriers, reason-gated kill-switch |
| C:/Users/User/.claude/hooks/codex-dispatch-guard.test.js | modify | Task 2 — carrier, fail-closed, and kill-switch cases |
| C:/Users/User/.claude/hooks/context-cap-guard.js | modify | Task 3 — async stdin read with timeout (fail closed on held-open stdin), fail-closed input, read-failure not-empty, malformed-shape path deny, cumulative MultiEdit projection |
| C:/Users/User/.claude/hooks/context-cap-guard.test.js | modify | Task 3 — flip the unparseable-stdin case, add held-open-stdin, malformed-shape, read-failure, and cumulative-MultiEdit cases; assert on parsed permissionDecision |
| C:/Users/User/.claude/hooks/destructive-command-guard.js | modify | Task 4 — fail-closed input, reason-gated kill-switch via the shared helper |
| C:/Users/User/.claude/settings.json | modify | Task 5 — drop Bash(codex exec:*); add MultiEdit to the cap-guard matcher |

## Tasks
- [ ] **Task 1** — Correctness fixes in the destructive detector — files: C:/Users/User/.claude/hooks/lib/destructive-detect.js, C:/Users/User/.claude/hooks/destructive-guard-test.py — done when: the four detection gaps below are closed and each has a case in the `.py` harness that failed pre-fix.
  - 1a. In `isDestructiveGit`'s `push` branch (~line 362-391), `plusRefspecForce` is declared but never assigned, and fully-qualified refs are not normalized. Set `plusRefspecForce = true` inside the `+`-refspec branch (the `+HEAD:…` / `+branch:…` case, ~line 376). Normalize the destination in BOTH the `+`-refspec branch and the bare-target branch (~line 381) by stripping a leading `refs/heads/` before the `main`/`master` comparison, so `git push origin +HEAD:refs/heads/main` and `git push origin refs/heads/main` are recognized. Result: `git push origin +HEAD:refs/heads/main` returns true (force-refspec sets `plusRefspecForce`, and the normalized `main` sets `mainOrMaster`).
  - 1b. Destructive detectors read only the first segment token, so a transparent runner masks the real command. Add a helper that strips a leading run of transparent runners from a segment's tokens before the destructive checks in `isDestructiveBash` (~line 431). Use the SAME transparent-runner vocabulary as `codex-dispatch-guard.js`'s `TRANSPARENT_RUNNERS` (one shared idea, no divergent second list) — at minimum `env`, `command`, `nohup`, plus `nice`; handle `env`'s operands (`VAR=val` assignments, `-u NAME` unset, `-i`) and a following `nice -n N`; support a STACKED run of runners (`env FOO=1 command nohup rm -rf …`). Apply the unwrapped tokens to BOTH the direct predicates (`isDestructiveRm`/`isDestructivePowerShellRemove`/`isDestructiveCmdDelete`/`isClearContent`/`isDestructiveGit`/the new `isDestructiveDd`) AND to the carrier-head detection inside `isDestructiveCarrier` — currently the carrier reads `tokenize(segment)[0]` un-unwrapped, so `env powershell -Command 'rm -rf ./target'` never reaches a carrier head and is missed. Justify any runner from `TRANSPARENT_RUNNERS` you deliberately exclude. Result: `env rm -rf ./target`, `command rm -rf ./target`, `env FOO=1 rm -rf ./target`, and `env powershell -Command 'rm -rf ./target'` all return true; a bare `rm -rf ./target` is unchanged.
  - 1c. `DESTRUCTIVE_SQL_DD` (~line 3) matches `dd\s+if=` as an unanchored substring, which is wrong in both directions: it over-matches harmless `echo dd if=/dev/zero` and under-matches the normal ordering `dd bs=1M if=/dev/zero of=disk.img` (there `if=` is not adjacent to `dd`). Remove the `dd\s+if=` alternative from the regex entirely (keep the SQL `drop/delete/truncate` alternatives). Add an `isDestructiveDd(tokens)` predicate that anchors on the COMMAND POSITION — `commandBasename(tokens[0]) === 'dd'` — and returns true when ANY argument token starts with `if=` (matching how the other detectors anchor on the command, not a substring anywhere in the line). Wire it into the per-segment predicate loop (~line 432) so it sees the runner-unwrapped tokens from 1b. Result: `dd if=/dev/zero of=disk.img` AND `dd bs=1M if=/dev/zero of=disk.img` return true; `echo dd if=/dev/zero` returns FALSE (dd is an argument, not the command); existing SQL cases still match.
  - 1d. The `checkout` branch (~line 350) only detects the `--` pathspec form. Also return true when `rest` contains `--force`, or a short-flag token (`-…`, not `--…`) whose body contains `f` (covers `git checkout -f`). Result: `git checkout --force feature` and `git checkout -f feature` return true; `git checkout -b feature` stays allowed.
  - Add BLOCK cases to `destructive-guard-test.py`'s `CASES` for: `git push origin +HEAD:refs/heads/main`; `git push origin +HEAD:topic` (force-push to a NON-main branch via `+`-refspec — this blocks ONLY via `plusRefspecForce`, so it proves 1a actually assigns it, which `+HEAD:refs/heads/main` does not because the normalized `main` alone would block it); `env rm -rf ./target`; `command rm -rf ./target`; `env FOO=1 rm -rf ./target` (proves the `VAR=val` operand skip in 1b); `env powershell -Command 'rm -rf ./target'` (proves the carrier-unwrap in 1b); `dd if=/dev/zero of=disk.img`; `dd bs=1M if=/dev/zero of=disk.img`; `git checkout --force feature`; `git checkout -f feature`. Add an ALLOW case that must NOT block: `echo dd if=/dev/zero` (dd in argument position — proves 1c does not over-match). Keep every existing case passing.
- [ ] **Task 2** — Shared disable helper + dispatch-guard fail-closed and carriers — files: C:/Users/User/.claude/hooks/lib/guard-disable.js, C:/Users/User/.claude/hooks/codex-dispatch-guard.js, C:/Users/User/.claude/hooks/codex-dispatch-guard.test.js — done when: the helper exists, both new carriers block, malformed/timed-out input fails closed, and the reason-gated kill-switch behaves per ADR-043.
  - Create `guard-disable.js` exporting one function (e.g. `resolveDisable({ guard, disableValue, reason, subject })`): normalize `disableValue` (`String(v||'').trim().toLowerCase()`); the shared disable vocabulary is exactly `off`, `0`, `false`, `disabled`. If `disableValue` is not one of those, return not-disabled and write nothing. Otherwise `honored = String(reason||'').trim().length > 0`; append one JSON line `{ ts, guard, reason: honored ? reason : null, honored, subject }` (subject truncated to ~500 chars) to the audit log at `process.env.APEX_GUARD_AUDIT_LOG || path.join(__dirname, '..', 'guard-audit.log')`. The append MUST use `fs.appendFileSync` (synchronous) inside a try/catch, and on a thrown append error force `honored = false` (a disable with no trace is not honored). This is load-bearing: an async `fs.appendFile` failure would fire its callback AFTER the function returned, leaving `honored = true` — fail open. Return `{ disabled: honored }`. The file's header-doc must state the contract, the audit JSON format, and this `appendFileSync`-so-write-failure-fails-closed rule.
  - 2a. Wrap `handlePreToolUse` so malformed/absent/timed-out/held-open input or any thrown exception produces a fail-closed `deny` — the real `deny(...)` object (`hookSpecificOutput.permissionDecision: 'deny'`), never a silent `process.exit(0)`. Replace the stdin `setTimeout(..., 3000)` (~line 41) that calls `process.exit(0)`: read the timeout from `APEX_GUARD_STDIN_TIMEOUT_MS` (positive integer) else default 3000, and on timeout write `deny(...)` (reason: input not received/validated) then exit 0 — this closes the held-open-stdin hole where an external SIGTERM would otherwise produce empty stdout (allow). In the `end` handler, on `JSON.parse` failure (~line 50) OR any throw from `handlePreToolUse`, write `deny(...)` then exit 0. Malformed SHAPE also denies (AM10): keep `if (!command) return null` for a genuinely empty/absent command (valid-but-empty → allow), but if `data.tool_input` is present with a `command` field that is non-`undefined` and not a string, or `data`/`data.tool_input` is not an object, emit `deny(...)`.
  - 2b. Close the carrier gaps in the parser (~line 98-102, 149-165). Add `eval` to `STRING_EVALUATORS` so `eval 'codex exec …'` has its argument re-parsed as a command. For `PROCESS_LAUNCHERS` (`Start-Process`/`saps`), the subcommand can arrive as a single quoted `-ArgumentList` string (`Start-Process codex -ArgumentList 'exec -m …'`), which tokenizes to `launched = ['codex', 'exec -m gpt-5.6-sol']` — two SEPARATE tokens, so re-parsing the ArgumentList fragment alone never sees `codex` and `hasBareExec` never sees a bare `exec`. Fix: reconstruct the collected `launched` tokens into ONE string (`launched.join(' ')`) and re-parse THAT via `isRawCodexExec` (in addition to the existing bare-token `tokensAreCodexExec(launched, …)` path), so `codex` and `exec` share one command context. Verify the required case `Start-Process codex -ArgumentList 'exec -m gpt-5.6-sol'` blocks.
  - 2c. Route the kill-switch through `guard-disable.js`: after the tool_name/command extraction in `handlePreToolUse`, call `resolveDisable` with `guard: 'codex-dispatch-guard'`, `disableValue: process.env.APEX_CODEX_GUARD`, `reason: process.env.APEX_GUARD_DISABLE_REASON`, `subject: command`; return null only when `disabled` is true. Remove the old inline `APEX_CODEX_GUARD` off/0/false check.
  - Add test cases to `codex-dispatch-guard.test.js`. All block assertions must parse stdout and check `hookSpecificOutput.permissionDecision === 'deny'` (not a `"deny"` substring, not merely non-empty). BLOCK `eval 'codex exec'`, BLOCK `eval "codex exec --json"`, BLOCK `Start-Process codex -ArgumentList 'exec -m gpt-5.6-sol'`; a fail-closed section that spawns the guard with malformed/empty stdin (expect `permissionDecision: 'deny'`), with a malformed-SHAPE event whose `command` is an object (expect `deny`), and with `APEX_GUARD_STDIN_TIMEOUT_MS` low and stdin left OPEN/unclosed so the timeout fires (expect `deny`, proving fail-closed on held-open stdin); a kill-switch section pointing `APEX_GUARD_AUDIT_LOG` at a temp file — `APEX_CODEX_GUARD=off` with no reason still BLOCKS a raw `codex exec` and appends an `honored:false` row; `APEX_CODEX_GUARD=off` + `APEX_GUARD_DISABLE_REASON` set ALLOWS it and appends an `honored:true` row; and an audit-write-failure case pointing `APEX_GUARD_AUDIT_LOG` at a DIRECTORY (so `appendFileSync` throws) with `APEX_CODEX_GUARD=off` + a reason — the disable must NOT be honored (raw `codex exec` still BLOCKS). Keep every existing case passing.
- [ ] **Task 3** — context-cap-guard async fail-closed input, honest read failures, cumulative MultiEdit projection — files: C:/Users/User/.claude/hooks/context-cap-guard.js, C:/Users/User/.claude/hooks/context-cap-guard.test.js — done when: malformed/held-open stdin denies, a non-ENOENT target-read failure denies, a non-string `file_path` denies (no crash), and a MultiEdit payload is projected cumulatively.
  - 3a. Convert the SYNCHRONOUS stdin read to the ASYNC data/end + timeout pattern the other two guards use, then fail closed. The current `fs.readFileSync(0)` (~line 59) is synchronous, so no JS timer can fire while stdin is held open — the external 5s hook timeout SIGTERMs the process → empty stdout → ALLOW (fail open). Replace it with `process.stdin` `data`/`end` handlers plus a `setTimeout` whose duration is `APEX_GUARD_STDIN_TIMEOUT_MS` (positive integer) else a default UNDER 5s (e.g. 3000); on timeout, emit the real `deny` decision (`hookSpecificOutput.permissionDecision: 'deny'`, reason: input not received/validated) then exit 0. In the `end` handler, on `JSON.parse` failure emit `deny` (reason: input not validated) then exit. Malformed SHAPE also denies (AM10 + AM11): a `file_path` that is present but NOT a string (e.g. an object) → emit `deny` (do NOT `process.exit(0)` and do NOT let it throw into `path.basename`). Keep exit-0-allow only for a genuinely absent/empty-string `file_path` (no cap target — valid-but-empty) and for a valid string path with no matching cap. The target-file read (currently ~line 79-82) must not treat every failure as empty: allow `ENOENT` to mean empty (a new file — preserves new-file Write behavior), but on any OTHER read error emit a `deny` (do not under-project a near-cap file). Every fail-closed exit here writes the real `permissionDecision: 'deny'` object, never bare text.
  - 3b. Project a `MultiEdit` payload against a RUNNING (cumulative) content string, not the original. When `tool_input` has an `edits` array (and no single-Edit `content`/`old_string`): start `running = currentContent`; for each edit IN ARRAY ORDER, compute `occ_i = edit.replace_all ? countOccurrences(running, old_string_i) : 1` (an empty `old_string_i` contributes `sizeOf(new_string_i)`), then APPLY that edit to `running` (replace-first or replace-all) before moving to the next edit; finally `projected = sizeOf(running)`. Counting each edit's occurrences against the ORIGINAL content under-projects when an earlier edit changes a later edit's match count — e.g. a 100-line `status.md` that MultiEdit grows to 101 would be projected as 100 and silently allowed; the cumulative walk matches how Claude Code 2.1.212 actually applies MultiEdit (verified: edits applied sequentially, each to the result of the previous). Reuse the existing `sizeOf`/`countOccurrences`; keep the allow-if-not-growing rule (`projected <= cap.limit || projected <= current`). The matcher change that routes MultiEdit here is Task 5.
  - Update `context-cap-guard.test.js`. All block assertions must parse stdout and check `hookSpecificOutput.permissionDecision === 'deny'`, not a substring. Flip the existing `unparseable stdin allows` case to expect a `deny`; add an unclosed-stdin case (spawn with `APEX_GUARD_STDIN_TIMEOUT_MS` low and stdin left OPEN so the timeout fires → `deny`, proving the async conversion fails closed on held-open stdin); add a malformed-shape case (a capped `file_path` whose value is an object → `deny`); add a read-failure case (a `file_path` pointing at a directory or an unreadable target on a capped basename → `deny`, proving it is not treated as empty); add a `multiEditPayload` helper and cases where the cumulative `edits` push a capped file over its limit (`deny`) and where they stay within it (allow), INCLUDING a case that proves the running-content projection — an earlier edit changes a later edit's match count so the file crosses the cap (e.g. 100→101 lines), which must `deny` where a stale against-original sum would have said 100 and allowed. Keep every existing case passing.
- [ ] **Task 5** — settings.json permission + matcher fixes — files: C:/Users/User/.claude/settings.json — done when: the raw-exec allow-entry is gone and MultiEdit reaches the cap guard.
  - 5a. Remove `"Bash(codex exec:*)"` from `permissions.allow` (line 14). Verification note the coder must state: this affects only DIRECT `codex exec` Bash tool calls (the raw path the guard blocks); `codex-dispatch.ps1` spawns Codex as a PowerShell child process, not a Bash tool call, so the wrapper is unaffected.
  - 5b. Change the context-cap-guard PreToolUse matcher from `"Write|Edit"` to `"Write|Edit|MultiEdit"` (~line 88), so a MultiEdit payload is projected by Task 3's logic instead of bypassing the guard.
- [ ] **Task 4** — destructive-command-guard fail-closed input + reason-gated kill-switch; fix the test harness path — files: C:/Users/User/.claude/hooks/destructive-command-guard.js, C:/Users/User/.claude/hooks/destructive-guard-test.py — done when: malformed/timed-out input denies, the kill-switch is reason-gated and audited via the shared helper, and the `.py` harness runs from any cwd.
  - 4a. The stdin `setTimeout(..., 3000)` (~line 35) and the `try/catch` around parse+detection (~line 41-51) both fall through to `process.exit(0)` (allow). Change so malformed/absent/timed-out/held-open input or any caught exception emits a fail-closed `deny` — the real `deny(...)` object (`hookSpecificOutput.permissionDecision: 'deny'`, already defined ~line 54), never silent — then exits 0. Mirror Task 2a: honor `APEX_GUARD_STDIN_TIMEOUT_MS` (positive integer, default 3000); on timeout, parse error, or throw, write `deny(...)`. Malformed SHAPE denies too (AM10): keep `if (!command) return null` for a genuinely empty/absent command (valid-but-empty → allow), but if `command` is present and not a string, or `data`/`data.tool_input` is not an object, emit `deny(...)`.
  - 4b. Route the kill-switch through the shared `C:/Users/User/.claude/hooks/lib/guard-disable.js`: after command extraction in `handlePreToolUse` (~line 75), call `resolveDisable` with `guard: 'destructive-command-guard'`, `disableValue: process.env.APEX_DESTRUCT_GUARD`, `reason: process.env.APEX_GUARD_DISABLE_REASON`, `subject: command`; return null only when `disabled`. Remove the inline `APEX_DESTRUCT_GUARD` off/disabled/0/false check (~line 66). Update the `deny()` message so it notes `APEX_GUARD_DISABLE_REASON` must also be set for the disable to take effect.
  - 4c. `destructive-guard-test.py` invokes the guard by the cwd-relative path `hooks/destructive-command-guard.js` (~line 106), so from another cwd every allow-case passes vacuously. Resolve the script path relative to the test file's own location (`os.path.dirname(os.path.abspath(__file__))`). Add fail-closed checks that assert the real block signal — parse stdout and check `hookSpecificOutput.permissionDecision == 'deny'`, not merely non-empty stdout: malformed/empty stdin → `deny`; a malformed-SHAPE event whose `command` is non-string → `deny`; and an unclosed-stdin case (spawn with `APEX_GUARD_STDIN_TIMEOUT_MS` low and stdin left OPEN so the timeout fires → `deny`). Add kill-switch checks (with `APEX_GUARD_AUDIT_LOG` at a temp file: `APEX_DESTRUCT_GUARD=off` + no reason still blocks `rm -rf` and writes an `honored:false` row; `APEX_DESTRUCT_GUARD=off` + `APEX_GUARD_DISABLE_REASON` set allows `rm -rf` and writes an `honored:true` row) and an audit-write-failure check (`APEX_GUARD_AUDIT_LOG` pointed at a DIRECTORY so `appendFileSync` throws, `APEX_DESTRUCT_GUARD=off` + a reason → the disable is NOT honored, `rm -rf` still blocks). Count every failure into the existing non-zero exit.

## Wave plan
Wave 1: [Task 1, Task 2, Task 3, Task 5] | Wave 2: [Task 4]

Wave 1 is pairwise file-disjoint: Task 1 {destructive-detect.js, destructive-guard-test.py}; Task 2 {guard-disable.js (create), codex-dispatch-guard.js, codex-dispatch-guard.test.js}; Task 3 {context-cap-guard.js, context-cap-guard.test.js}; Task 5 {settings.json}. Task 4 is in Wave 2 because it shares `destructive-guard-test.py` with Task 1 (so they must not run concurrently) and imports the `guard-disable.js` that Task 2 creates. Ownership: Task 2 owns `guard-disable.js`; Task 1 owns the detection cases in `destructive-guard-test.py`, Task 4 appends its fail-closed/kill-switch checks and the path fix after Task 1 completes.

## Permissions

The following actions will run autonomously during build.
Approving this spec approves all of them.

### File Operations
| Action | Paths |
|--------|-------|
| Create | C:/Users/User/.claude/hooks/lib/guard-disable.js |
| Modify | C:/Users/User/.claude/hooks/lib/destructive-detect.js, C:/Users/User/.claude/hooks/destructive-guard-test.py, C:/Users/User/.claude/hooks/codex-dispatch-guard.js, C:/Users/User/.claude/hooks/codex-dispatch-guard.test.js, C:/Users/User/.claude/hooks/context-cap-guard.js, C:/Users/User/.claude/hooks/context-cap-guard.test.js, C:/Users/User/.claude/hooks/destructive-command-guard.js, C:/Users/User/.claude/settings.json |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `node --check <each modified/created .js hook>` | Parse-clean verification |
| `node C:/Users/User/.claude/hooks/codex-dispatch-guard.test.js` | Dispatch-guard suite (exit 0) |
| `node C:/Users/User/.claude/hooks/context-cap-guard.test.js` | Cap-guard suite (exit 0) |
| `python C:/Users/User/.claude/hooks/destructive-guard-test.py` | Destructive suite, run from a non-hooks cwd (exit 0) |

The three repository-mandated PowerShell verification suites (the hooks-tree AGENTS.md verify contract, run from the `~/.claude` root, each exit 0):

```
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
```

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | (none — leave the tree dirty for review) |
| `git commit` | (none) |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_CODEX_GUARD` / `APEX_DESTRUCT_GUARD` | Kill-switch inputs (read via the shared helper) |
| `APEX_GUARD_DISABLE_REASON` | Required non-empty reason that honors a disable |
| `APEX_GUARD_AUDIT_LOG` | Test-only override of the audit log path |
| `APEX_GUARD_STDIN_TIMEOUT_MS` | Test-only override of the stdin read timeout |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package installation or network access |

## Specialist Context
### Security
Fail-closed is the load-bearing property: a guard must never allow on an input it could not parse, validate, or read. The kill-switch reason+audit (ADR-043) makes a disable intentional and traceable. No evasion hardening — careless-operator threat model, not hostile.

### Performance
(none — hooks stay synchronous and fast; the audit append happens only when a disable is requested.)

### Accessibility
(none — no frontend surface.)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-043-guard-disable-reason-audit.md | Written — records both policy changes (reason+audit kill-switch; drop the raw-exec allow-entry) |
| Inline | C:/Users/User/.claude/hooks/lib/guard-disable.js | Header comment: contract, audit format, fail-closed-on-write-failure rule |

## Acceptance Criteria
- [ ] Task 1 → verify: `python destructive-guard-test.py` run from a non-hooks cwd exits 0 with the new BLOCK cases (`+HEAD:refs/heads/main` push, `+HEAD:topic` push via plusRefspecForce, `env`/`command`-wrapped `rm -rf`, `env FOO=1 rm -rf`, `env powershell -Command 'rm -rf …'`, `dd if=/dev/zero` AND `dd bs=1M if=/dev/zero`, `git checkout --force`/`-f`) passing, the ALLOW case `echo dd if=/dev/zero` NOT blocked, and no prior case regressed; each new BLOCK case fails on pre-fix `destructive-detect.js`.
- [ ] Task 2 → verify: `node codex-dispatch-guard.test.js` exits 0; the `eval` and `Start-Process -ArgumentList 'exec …'` carriers BLOCK (asserted via parsed `permissionDecision === 'deny'`); malformed/empty stdin, a non-string-`command` malformed shape, and an unclosed stdin under a low `APEX_GUARD_STDIN_TIMEOUT_MS` all emit a `deny`; with `APEX_GUARD_AUDIT_LOG` at a temp file, `APEX_CODEX_GUARD=off` alone still blocks and logs `honored:false`, and `off`+reason allows and logs `honored:true`; with `APEX_GUARD_AUDIT_LOG` at a directory, `off`+reason still BLOCKS (audit-write failure ⇒ not honored); `node --check` passes on `guard-disable.js` and `codex-dispatch-guard.js`.
- [ ] Task 3 → verify: `node context-cap-guard.test.js` exits 0 (all block assertions check parsed `permissionDecision === 'deny'`); the former `unparseable stdin allows` case now gets a `deny`; an unclosed stdin under a low `APEX_GUARD_STDIN_TIMEOUT_MS` gets a `deny` (async conversion fails closed on held-open stdin); a non-ENOENT target-read failure denies (not treated as empty); a non-string `file_path` (object) denies without crashing; an absent `file_path` still allows; a MultiEdit whose cumulative `edits` exceed the cap denies (including the earlier-edit-changes-later-count case) while an under-cap MultiEdit allows.
- [ ] Task 5 → verify: `settings.json` no longer contains `Bash(codex exec:*)`; the cap-guard PreToolUse matcher reads `Write|Edit|MultiEdit`; the file parses as JSON; the coder's report states the wrapper is unaffected because it spawns Codex as a PowerShell child, not a Bash tool call.
- [ ] Task 4 → verify: `node --check destructive-command-guard.js` passes; malformed/timed-out/held-open input and a non-string-`command` malformed shape each emit a `deny` (asserted via parsed `permissionDecision == 'deny'`); the `.py` harness resolves the guard relative to `__file__` (passes from any cwd); `APEX_DESTRUCT_GUARD=off` alone still blocks `rm -rf` and logs `honored:false`, `off`+reason allows it and logs `honored:true`, and `off`+reason with `APEX_GUARD_AUDIT_LOG` at a directory still BLOCKS (audit-write failure ⇒ not honored); the shared helper is the only disable path (no inline env check remains).

## Progress
_(Coding mode writes here — do not edit manually)_
