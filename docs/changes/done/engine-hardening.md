---
spec: engine-hardening
status: draft
autonomy_level: L2
risk: medium
coder_effort: high
max_parallel_codex: 2
---

# Spec: Engine hardening
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Harden the Engine planner, dispatch adapter, runner, wrapper adoption, and integration commit boundary for wave 2a.
<!-- Decision record: docs/technical/adr/ADR-048-role-redesign.md. -->

## Intent
- **Intent:** Close the accepted Engine v1 hardening backlog at risk: medium before high-risk execution and cutover.
- **Invariants:** Manifest paths and wave commits remain bounded by explicit file sets; integration verification is single-pass and residue-sensitive on first run and resume; dispatch results correlate with real wrapper events; adoption timeout is durable; task retry state is resumable.
- **Non-goals:** `risk: high` pause-after-wave review, cutover/default routing, queue/watcher/unattended drain, skill prose changes, or `AGENTS.md` fence edits.

## Assumptions
- `C:/Users/User/.claude` is the sole build repo at Engine v1 HEAD `56e76a6`; all line anchors below refer to that revision → impact: Stop.
- PowerShell 5.1, Git, the existing wrapper, and the build repo's `AGENTS.md` Verify commands are available → impact: Stop.
- The two apex close-out files are HOST writes after coder verification → impact: Stop.

Spec archival to `docs/changes/done/`, handoff and `docs/status.md` are standard host post-build close-out outside this spec's HOST tasks.

Simplicity check: Six coder tasks; T3 and T6 edit the same runner files sequentially, and T3 consumes the T5 commit interface.

## Prerequisites
- Specs that must be complete first: `docs/changes/done/engine-core.md` (Engine v1 at `56e76a6`).
- Environment setup required: PowerShell 5.1 and Git; build from `C:/Users/User/.claude`; preserve existing out-of-scope working-tree changes.

## Files to Change
Grep evidence: `rg --no-ignore -l -F '<pattern>' C:/Users/User/.claude --glob '!**/.git/**' --glob '!**/.codex-scratch/**'` counted matching files in the live tree (2026-10-03): `engine-plan.ps1` 24; `engine-plan-test.ps1` 20; `engine-dispatch.ps1` 21; `engine-dispatch-test.ps1` 20; `apex-engine.ps1` 27; `engine-test.ps1` 31; `engine-state-schema.json` 24; `engine-git.ps1` 25; `engine-git-test.ps1` 23; `codex-dispatch.ps1` 274; `dispatch-test.ps1` 65; `SKILL-HISTORY.md` 119; `ADR-048-role-redesign.md` 87. Counts include declarations and references; the HOST paths are outside the build repo.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/engine-plan.ps1 | modify | T1 path refusal, overlap refusal, task-ID cap. |
| skills/apex-code/scripts/engine-plan-test.ps1 | modify | T1 planner cases. |
| skills/apex-code/scripts/engine-dispatch.ps1 | modify | T2 exit/status table, PID stamp, adopt timeout. |
| skills/apex-code/scripts/engine-dispatch-test.ps1 | modify | T2 adapter and real-wrapper cases. |
| skills/apex-code/scripts/apex-engine.ps1 | modify | T3 gate, diagnosis, residue, commit intent; T6 routing, capacity, quota, crash recovery. |
| skills/apex-code/scripts/engine-test.ps1 | modify | T3 gate cases; T6 routing and hermetic ledger cases. |
| skills/apex-code/references/engine-state-schema.json | modify | T3 optional capacity, residue inventory, commit intent. |
| skills/apex-code/scripts/codex-dispatch.ps1 | modify | T4 full-ID adoption refusal. |
| skills/apex-code/scripts/dispatch-test.ps1 | modify | T4 wrapper adoption cases. |
| skills/apex-code/scripts/engine-git.ps1 | modify | T5 integration commit allowlist. |
| skills/apex-code/scripts/engine-git-test.ps1 | modify | T5 Git boundary cases. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST prepends dated apex-code wave-2a row. |
| C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | modify | HOST adds stage-5 wave-2a note. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-dispatch.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-dispatch-test.ps1", "op": "modify" }], "depends_on": [], "effort": "high" },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" }, { "path": "skills/apex-code/references/engine-state-schema.json", "op": "modify" }], "depends_on": ["1", "2", "4", "5"], "effort": "high" },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/codex-dispatch.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/dispatch-test.ps1", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "5", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-git.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-git-test.ps1", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "6", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" }], "depends_on": ["3"], "effort": "high" }
  ]
}
```

## Tasks
- [ ] **Task 1** - Planner: in `engine-plan.ps1:113-134,461,476-541,617-625`, reject any manifest path containing `:` or a segment equal to `.git` after case-insensitive `TrimEnd('. ')`, or matching `^git~[0-9]+$`, with `manifest path contains a .git segment: <p>`; canonicalize every path segment by TrimEnd('. ') and case-fold before duplicate, cross/within-task overlap, and ancestor checks, then after collecting all files reject segment-aware ancestor/descendant pairs within or across tasks with `manifest paths overlap (ancestor/descendant): <a>, <b>`; reject a regular-file ancestor during the existing ancestor walk with `manifest path ancestor is a file: <p>`; invert the old ancestor-overlap topological-layer split test to a refusal and split waves only for slot cap; after task-ID regex reject length over 32 with `manifest task id exceeds 32 characters: <first 16>...`. In `engine-plan-test.ps1`, assert refusal for `.git/config`, `sub/.git/hooks/pre-commit`, `.GIT/x`, `.git./x`, `git~1/config`, `a/.git`; allow `.github/workflows/x.yml`, `.gitignore`, `.gitkeep`; assert pre-worktree refusal, within/across-task and case-variant overlap, duplicate `foo.` vs `foo` and overlap `foo./a` vs `foo/a` refusals, non-overlapping suffix, existing-file ancestor, and 32/33-character IDs. — files: skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1 — done when: planner refusals occur before worktree creation and `engine-plan-test.ps1` exits 0.
- [ ] **Task 2** - Dispatch adapter: in `engine-dispatch.ps1:426-442`, pass the event into Test-EngineTerminalStatus and correlate terminal event and ledger status by exit: 0=`done|success|adopted-done`; 68=`done_with_concerns|adopted-done_with_concerns`; 67=`blocked|adopted-blocked` with optional `+scopeN`, or `adopted-void`; 69=`done|done_with_concerns|adopted-void|failed` only with `event.tree_moved=true` (reject false or absent for all four statuses); 1=`failed|done|done_with_concerns`; 65=`done|done_with_concerns|failed` or `adopted-(done|done_with_concerns)+scopeN` where N is nonzero and not 66; 66=same unsuffixed statuses or suffix `+scope66`; 73/77=`done|done_with_concerns|failed|adopted-done|adopted-done_with_concerns` without suffix. In `Start-EngineDispatch:124`, capture the child's UTC ISO `o` StartTime immediately after Start, atomically rewrite `<out>.invocation.json` with `start_time`, and return it; in `Wait-EngineDispatch:667-677`, read that stamp and call `Test-EngineProcessIs $pid $stamp -Strict`, otherwise stop polling, recover exit from event, and fail closed to park. In `Invoke-EngineAdopt:715-762`, use `taskkill.exe /PID <pid> /T /F` with local EAP Continue plus `WaitForExit(5000)` on timeout, durably write `<StateRoot>/engine-adopt-timeouts/<runId>.json` with run_id, adopter_pid, adopter_start, timed_out_at, adopt_wait_seconds, and refuse repeat adoption immediately with exit -1, `adopt_timed_out=true`, and `previous adopter of run <id> timed out; not re-adopting (finish or -AbandonRunId it, then remove marker)`; in `Wait-EngineLiveRow:764-858`, retain terminal-event precedence and return status='parked' with the previous-adopter diagnosis when Invoke-EngineAdopt reports adopt_timed_out; apex-engine.ps1 is not modified for this. Keep positional parameter names/order. In `engine-dispatch-test.ps1`, invert three permissive table pairs, assert real-wrapper scope-65 and scope-66 events plus a pre-launch pin move by invoking codex-dispatch.ps1 directly with -TreePinScript <fixture script whose -Verify exits 69 and -Pin succeeds>, then feeding its event and exit code to Test-EngineTerminalStatus, negative 69/done with tree_moved=false, 69/failed without tree_moved, and 0/adopted-done+scope65, PID-start mismatch short wait, and timeout child/grandchild death, durable marker and no second child on repeated Invoke-EngineAdopt or Wait-EngineLiveRow. — files: skills/apex-code/scripts/engine-dispatch.ps1, skills/apex-code/scripts/engine-dispatch-test.ps1 — done when: real-wrapper events correlate and `engine-dispatch-test.ps1` exits 0.
- [ ] **Task 3** - Runner gate/integration: in `apex-engine.ps1:439-442`, diagnose exit 69 by event status/tree_moved/error as `tree moved between pre-flight and launch (exit 69)` for failed, `adopted tree moved; verdict void (exit 69)` for adopted-void, `task tree moved during build (exit 69)` for done/concerns, else `wrapper exit N (status S[; error E])`; test via import-only `Route-RunnerResult`. In `Invoke-RunnerGate:552-569`, stage once, record I0 `{HEAD,SHA-256(git ls-files -s -z)}`, run one tree-pin -Pin, baseline -Full and tree-pin -Verify, then record I1; park gate='verify' on changed HEAD, changed index digest or nonzero Verify with `integration verify moved HEAD`, `integration verify changed the index`, or `integration verify changed the working tree: <first 10 tree-pin GONE/NEW/CHANGED lines>`; use this same single-pass gate for `Find-RunnerWaveFailure:588` trials. When a wave first enters integration and `wave_runtime."<n>".residue_inventory` is absent, durably capture it once as an array of repo-relative strings from the untracked+ignored paths in `git status --porcelain -uall --ignored -z`, applying tree-pin tool-cache exclusions at `tree-pin.ps1:218-236`; never recapture on `-Resume`; every gate pass computes current untracked+ignored paths minus the saved inventory, exact wave manifest paths, and those tool-cache exclusions, and parks on a non-empty result with `integration tree has untracked/ignored residue outside wave manifest: <first 10>`; `Restore-RunnerWave` preserves this inventory; `plan.waves` remains immutable. Immediately before `Commit-EngineWave:679`, atomically persist `wave_runtime."<n>".commit_intent={base:string,expected_tree:string}` and call Commit-EngineWave with mandatory `-BaseSha $waveBase -AllowedPaths <exact wave manifest paths>`; `Invoke-RunnerAdoptCrashWindowCommit:930` adopts one-commit-ahead HEAD only when the intent base and expected tree match; gate parks write no intent. In `engine-state-schema.json`, admit optional `capacity={cli,spec_ceiling,machine_ceiling,effective}` and a new optional top-level `wave_runtime` object keyed by wave number string, whose `"<n>"` value admits `residue_inventory: [string]` and `commit_intent: {base:string,expected_tree:string}` as independently optional fields; keep `plan.waves` immutable and retain validity of a v1 state fixture without these fields. In `engine-test.ps1`, replace both re-pin cases with parks counting one pin, baseline and verify and zero integration commits; cover untracked, ignored, staged off-manifest, HEAD commit and working-copy mutation, residue persistence/removal on Resume (residue left: stays parked with no integration commit; residue removed: proceeds and commits), off-manifest git add refusal on Resume, no adoption of a verify-created commit, and matching crash-window adoption. — files: skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/scripts/engine-test.ps1, skills/apex-code/references/engine-state-schema.json — done when: named checks `exit-69 diagnosis`, `single-pass gate`, `residue inventory`, `commit intent and exact allowlist`, and `v1 schema compatibility` each pass in `engine-test.ps1` (exit 0), and integration.tip stays unchanged on each verify mutation park.
- [ ] **Task 4** - Wrapper: at `codex-dispatch.ps1:2043-2206`, when `-Adopt -RunId` is supplied and nonblank, require the full `^[0-9a-f]{32}$` ID; on failure emit exit-74 caller-contract refusal with null run_id and detail `[adopt] REFUSED (exit 74): -RunId must be the full 32-character lowercase-hex run_id (got '<x>'); candidates: <up to 3 full ids with that prefix>` from read-only ledger scan. After the abandoned check in the terminal-row branch, emit exit-75 refusal with the full run_id and `[adopt] REFUSED (exit 75): run_id '<id>' is already terminal (status '<s>'); nothing to adopt.` Preserve legacy Spec/Phase/Worktree selection without -RunId. In `dispatch-test.ps1`, reuse Invoke-AdoptCase at :391 for 8-character prefix 74/event/unchanged row, adopted-done 75/full ID/unchanged row, and existing lease-only/legacy selection. — files: skills/apex-code/scripts/codex-dispatch.ps1, skills/apex-code/scripts/dispatch-test.ps1 — done when: `dispatch-test.ps1`, `dispatch-events-test.ps1`, and `dispatch-preflight-test.ps1` each exit 0.
- [ ] **Task 5** - Git layer: in `engine-git.ps1:403-429`, add Mandatory `-BaseSha` and Mandatory `-AllowedPaths` to `Commit-EngineWave`; before writing a commit, require integration HEAD equal BaseSha and the exact case-sensitive set from `git diff --cached --name-only --no-renames -z BaseSha` equal AllowedPaths, otherwise refuse with `integration index contains paths outside wave manifest: ...` for index mismatch or an explicit HEAD-mismatch diagnosis; retain verified-index-tree equality after commit. In `engine-git-test.ps1`, update existing calls at :199 and :247 to pass both mandatory parameters, keeping :247's `does not match verified index tree` failure reachable; assert off-manifest staged path refusal, HEAD-mismatch refusal and exact-set commit. `apex-engine.ps1:679` is the only production caller. — files: skills/apex-code/scripts/engine-git.ps1, skills/apex-code/scripts/engine-git-test.ps1 — done when: `engine-git-test.ps1` exits 0 and only exact wave paths can be committed.
- [ ] **Task 6** - Runner routing/tests: in `Initialize-RunnerNewState:828-837` of `apex-engine.ps1`, probe plan at MaxParallel 4, take spec ceiling from frontmatter else 2, set effective=min(spec ceiling,4,CLI if supplied), re-plan at effective, persist max_parallel and optional `capacity={cli,spec_ceiling,machine_ceiling,effective}`, and never pass MachineCeiling. In `Start-RunnerAttempt:309`, prefer child.start_time when present, else the existing stamp probe. In `Test-RunnerQuotaResult:330-348`, scan each log line outside JSON object spans beginning `{"type":"` with string/escape/brace-depth tracking and an unclosed span consuming line end; match unanchored plain text `(?:^|[^\w"\\])(?:ERROR:\s*)?You've hit your usage limit`; inspect only parsed type=error message or type=turn.failed error.message for `(?i)\b429\b.*Too Many Requests|status:?\s*429\b`; route matches to paused run, parked task, `quota or rate limit`, while selected-model capacity remains process failure. At crash hook `apex-engine.ps1:714-717`, accept an effort name and fire only when currentAttempt.effort matches, retaining `1` as any effort. In `engine-test.ps1`, cover MaxParallel cases (CLI 2/spec 1/ultra refused before dispatch; CLI 3/no spec ceiling makes waves of 2; spec 6 caps at 4; CLI 1/spec 3 caps at 1; dispatch args omit MachineCeiling), start_time consumption, plain `...}}ERROR: You've hit your usage limit` and `ERROR: You've hit your usage limit...{"type":"turn.started"}` positives, turn.failed/error 429 positives, agent_message quote and agent_message/command_execution 429 negatives, selected-model capacity staying process failure, real-wrapper `rate_limit_429`, and `always_verify_fail` from low with low/medium/high failures, crash at high, then Resume done at xhigh. Replace the machine-ledger byte comparison by collecting run_id/wrapper_run_id from every engine-state and test ledger under testRoot plus testRoot itself, parsing machine-ledger lines, skipping unparseable rows, and rejecting any row with a collected run_id or any string property containing testRoot with either slash and case-insensitive comparison; tolerate foreign rows. — files: skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/scripts/engine-test.ps1 — done when: named checks `MaxParallel`, `start_time`, `quota and 429`, `machine-ledger isolation`, and `low-to-xhigh crash-window ladder` each pass in `engine-test.ps1` (exit 0).
- [ ] **Task 7 (HOST)** - Prepend one dated apex-code row in `SKILL-HISTORY.md` naming Engine wave 2a, the eleven coder files, and ADR-048; leave earlier rows intact. — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: one new row names engine-hardening and the build date.
- [ ] **Task 8 (HOST)** - Under stage 5 of `ADR-048-role-redesign.md`, add a wave-2a note linking engine-hardening and recording that the brief item 'resolve coder_model: codex to gpt-5.6-sol' was dropped as already shipped (engine-plan.ps1:346-349), plain 429→paused, capacity→process failure, ignored off-manifest verify residue→park, 32-character Engine task IDs, full adopt run_id, unchanged dispatch-test fence, and deferral of risk-high pause-after-wave, cutover and unattended drain. — files: C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md — done when: the stage-5 note contains those decisions and the spec link.

## Wave plan
Wave 1: [1, 2, 4, 5] (independent; dispatched two at a time under max_parallel_codex 2) | Wave 2: [3] | Wave 3: [6]. Post-verification HOST close-out: [Task 7, Task 8]. Manifest dependencies are authoritative.

## Permissions
Coder tasks may modify only their eleven manifest paths. HOST writes the two apex close-out files after coder verification. Critical-file writes require live attended confirmation at build time; this section grants no critical-path approval.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder) | skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1, skills/apex-code/scripts/engine-dispatch.ps1, skills/apex-code/scripts/engine-dispatch-test.ps1, skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/scripts/engine-test.ps1, skills/apex-code/references/engine-state-schema.json, skills/apex-code/scripts/codex-dispatch.ps1, skills/apex-code/scripts/dispatch-test.ps1, skills/apex-code/scripts/engine-git.ps1, skills/apex-code/scripts/engine-git-test.ps1 |
| Modify (HOST) | C:/Users/User/apex/SKILL-HISTORY.md, C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md |
| Create/Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` | T1 planner cases. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1` | T2 adapter cases. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` | T3 gate/integration cases; T6 routing cases. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-test.ps1` | T4 wrapper adopt cases outside the build fence. |
| `dispatch-events-test.ps1` (full command below) | T4 event regression. |
| `dispatch-preflight-test.ps1` (full command below) | T4 preflight regression. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1` | T5 commit boundary cases. |
| Build repo `AGENTS.md` `## Verify commands` block | Run every listed command unchanged. |
| `git ls-files -co --exclude-standard`, `git ls-files`, `git hash-object` | Scoped before/after hashes in both repos. |

From `C:/Users/User/.claude`, run the Task 4 commands:
```powershell
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
```

### Git Operations
| Operation | Scope |
|-----------|-------|
| Test-created worktrees, branches and commits | Hermetic temporary repos only. |
| Engine integration commit | Recorded Engine integration branch only after single-pass verification and exact manifest index allowlist. |
| Main working tree | No staging or commit. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Hermetic test roots outside build worktrees. |
| `APEX_STATE_DIR` | Wrapper event and ledger test isolation. |
| `ENGINE_TEST_VERIFY_MUTATION` | Select runner verify mutation fixtures. |

### Network
| Action | Purpose |
|--------|---------|
| None | Tests use local fake Codex. |

## Specialist Context
### Security
Apply PowerShell 5.1 StrictMode 2 property probes via `PSObject.Properties['x']`, `@()` before `.Count`, and `return ,$x` for single-element arrays. Use ProcessStartInfo and encoded commands/data files outside worktrees; no `Start-Process -UseNewEnvironment`. Wrap native calls with local `$ErrorActionPreference='Continue'` in try/finally and read `$LASTEXITCODE` immediately. Use `taskkill /T /F`, UTF-8 without BOM via `[IO.File]::WriteAllText(..., [Text.UTF8Encoding]::new($false))`, atomic state replacement by temp file plus `IO.File.Replace`, `-ceq`/`-ccontains` for identities, and `ConvertTo-Json -Depth`; do not assign `$matches` or use `Test-Json`, `??`, `?.`, ternary, `&&` or `||`.

### Performance
One integration pin/baseline/verify pass per gate; no automatic re-pin. MaxParallel effective ceiling is at most four; manifest weight/slot refusal remains in the planner.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| State contract | skills/apex-code/references/engine-state-schema.json | T3 adds optional capacity, optional top-level wave_runtime keyed by wave number string with residue_inventory and commit_intent; plan.waves remains immutable and the v1 fixture remains valid. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST Task 7 prepends wave-2a row. |
| ADR | C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | HOST Task 8 adds stage-5 note. |

## Acceptance Criteria
- [ ] Task 1 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` → verify: exit 0; named cases cover six `.git` variants, three allowed dot names, no worktree before refusal, cross/within-task segment overlap, existing-file ancestor, case-variant SRC vs src/x, `foo.` vs `foo`, and `foo./a` vs `foo/a` refused, the fenced suffix pair accepted, old overlap-split test inverted to refusal, 32 accepted and 33 refused.
```text
src/a.txt with src/a.txt.bak accepted
```
- [ ] Task 2 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1` → verify: exit 0; table negatives including 69/done with tree_moved=false, real-wrapper scope-65/scope-66/pin-move events via direct codex-dispatch.ps1 -TreePinScript fixture (-Pin succeeds, -Verify exits 69) fed to Test-EngineTerminalStatus, mismatched live-PID stamp and timed-out adopter tree/marker/repeat refusal pass; Wait-EngineLiveRow returns status='parked' with the previous-adopter diagnosis on adopt_timed_out without an apex-engine.ps1 change.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: exit 0; named exit-69 diagnosis, single-pass gate, residue inventory, commit intent and exact allowlist, and v1 schema compatibility checks pass, including a v1 state fixture with no new fields and optional top-level wave_runtime keyed by wave number string while plan.waves stays immutable; residue left on -Resume stays parked with no integration commit, while residue removed on -Resume proceeds and commits; verify mutation parks leave integration.tip unchanged.
- [ ] Task 4 — from `C:/Users/User/.claude`, run the three Task 4 commands in the fenced Permissions block → verify: all three exit 0; prefix 74, terminal full-ID 75, lease-only and legacy no-RunId selection pass.
- [ ] Task 5 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1` → verify: exit 0; off-manifest index and HEAD mismatch refuse without commit, exact allowed-path set commits; existing :199 and :247 calls pass Mandatory -BaseSha/-AllowedPaths, and :247 still reaches `does not match verified index tree`.
- [ ] Task 6 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: exit 0; named MaxParallel, start_time, quota and 429, machine-ledger isolation, and low-to-xhigh crash-window ladder checks pass.
- [ ] Task 7 (HOST) — run `rg -n -F 'engine-hardening' C:/Users/User/apex/SKILL-HISTORY.md` → verify: one new dated apex-code wave-2a row names the eleven coder files and ADR-048.
- [ ] Task 8 (HOST) — run `rg -n -F 'engine-hardening' C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md` → verify: stage-5 wave-2a note links this spec and lists that the brief item 'resolve coder_model: codex to gpt-5.6-sol' was dropped as already shipped (engine-plan.ps1:346-349), the listed owner decisions and deferred scope.
- [ ] Tasks 1–6 build fence — from `C:/Users/User/.claude`, run the PowerShell block below → verify: every command in the existing `AGENTS.md` `## Verify commands` fence exits 0; `dispatch-test.ps1` is also run separately by Task 4.
```powershell
$source = Get-Content -LiteralPath AGENTS.md -Raw -Encoding UTF8
$fence = [regex]::Match($source, '(?ms)^## Verify commands\r?\n.*?^```\r?\n(?<cmds>.*?)^```[ \t]*\r?$')
if (-not $fence.Success) { throw 'Verify commands fence missing' }
foreach ($command in ($fence.Groups['cmds'].Value -split '\r?\n')) {
    if ([string]::IsNullOrWhiteSpace($command)) { continue }
    & powershell.exe -NoProfile -Command $command
    if ($LASTEXITCODE -ne 0) { throw "Verify command failed ($LASTEXITCODE): $command" }
}
```
- [ ] Tasks 1–8 scope — run the first PowerShell block from one persistent PowerShell session at build start and the second after HOST close-out → verify: `scope hashes OK`; in `C:/Users/User/.claude`, only `git ls-files -co --exclude-standard` paths plus the eleven named coder files are hashed; in `C:/Users/User/apex`, only the two HOST files may change among tracked files outside `docs/drafts/`, `docs/changes/`, `docs/handoff/`, and the tracked status file. Only a path that vanishes between enumeration and hashing within the same snapshot is skipped; a path hashed before and missing after is an out-of-scope deletion unless listed among the changed files, and a skipped-before path is not exempt after. All thirteen Files-to-Change paths exist.
```powershell
$claudeRoot = 'C:/Users/User/.claude'
$apexRoot = 'C:/Users/User/apex'
$claudeExplicit = @(
    'skills/apex-code/scripts/engine-plan.ps1',
    'skills/apex-code/scripts/engine-plan-test.ps1',
    'skills/apex-code/scripts/engine-dispatch.ps1',
    'skills/apex-code/scripts/engine-dispatch-test.ps1',
    'skills/apex-code/scripts/apex-engine.ps1',
    'skills/apex-code/scripts/engine-test.ps1',
    'skills/apex-code/references/engine-state-schema.json',
    'skills/apex-code/scripts/codex-dispatch.ps1',
    'skills/apex-code/scripts/dispatch-test.ps1',
    'skills/apex-code/scripts/engine-git.ps1',
    'skills/apex-code/scripts/engine-git-test.ps1'
)
$apexExplicit = @('SKILL-HISTORY.md', 'docs/technical/adr/ADR-048-role-redesign.md')
function Add-ScopeHashes($root, $paths, $map) {
    Push-Location $root
    try {
        foreach ($path in @($paths | Sort-Object -Unique)) {
            $key = $root + '/' + $path.Replace('\', '/')
            if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
            $hash = & git hash-object -- $path
            if ($LASTEXITCODE -ne 0) {
                if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
                throw "git hash-object failed: $key"
            }
            $map[$key] = [string]$hash
        }
    } finally { Pop-Location }
}
function Get-HardeningScopeHashes {
    $map = [Collections.Generic.Dictionary[string,string]]::new([StringComparer]::Ordinal)
    Push-Location $claudeRoot
    try {
        $listed = @(git ls-files -co --exclude-standard)
        if ($LASTEXITCODE -ne 0) { throw 'git ls-files failed in .claude' }
    } finally { Pop-Location }
    Add-ScopeHashes $claudeRoot @($listed + $claudeExplicit) $map
    Push-Location $apexRoot
    try {
        $tracked = @(git ls-files)
        if ($LASTEXITCODE -ne 0) { throw 'git ls-files failed in apex' }
    } finally { Pop-Location }
    $tracked = @($tracked | Where-Object {
        $_ -ne 'docs/status.md' -and $_ -notlike 'docs/drafts/*' -and
        $_ -notlike 'docs/changes/*' -and $_ -notlike 'docs/handoff/*'
    })
    Add-ScopeHashes $apexRoot @($tracked + $apexExplicit) $map
    return ,$map
}
$scopeBefore = Get-HardeningScopeHashes
```
After HOST close-out, run this second block in the same PowerShell session:
```powershell
$scopeAfter = Get-HardeningScopeHashes
$allowed = @($claudeExplicit | ForEach-Object { $claudeRoot + '/' + $_ }) +
           @($apexExplicit | ForEach-Object { $apexRoot + '/' + $_ })
foreach ($path in $allowed) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing scoped file: $path" }
}
$paths = @(@($scopeBefore.Keys) + @($scopeAfter.Keys) | Sort-Object -Unique)
foreach ($path in $paths) {
    if ($allowed -ccontains $path) { continue }
    if (-not $scopeBefore.ContainsKey($path) -or -not $scopeAfter.ContainsKey($path) -or
        $scopeBefore[$path] -cne $scopeAfter[$path]) { throw "Out-of-scope file changed: $path" }
}
'scope hashes OK'
```
- [ ] Tasks 2–6 reachability — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: real wrapper with fake Codex reaches validated dispatch event, runner state and exact-set integration commit; the full-ID adoption refusal is exercised by `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-test.ps1` with exit 0.

## Progress
_(The build writes here — do not edit manually)_

Build date: 2026-10-04
