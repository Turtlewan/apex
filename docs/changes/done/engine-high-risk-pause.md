---
spec: engine-high-risk-pause
status: draft
autonomy_level: L2
risk: high
coder_effort: high
max_parallel_codex: 2
---

# Spec: Engine high-risk pause after each wave
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Run `risk: high` Engine specs with a durable post-commit review gate for every integrated wave.
<!-- Decision record: docs/technical/adr/ADR-048-role-redesign.md. -->

## Intent
- **Intent:** After each high-risk wave commit, exit for host review and resume only on a verdict bound to that integration tree digest.
- **Invariants:** A clean verdict on every wave precedes hand-off; the reviewed integration tip is the hand-off source; low/medium runs retain their current flow. Refusals made before resume begins (flag preconditions, wrong run status, flags on a run with no review-pending wave or risk not high) never rewrite durable state. A verdict refused after resume begins (digest mismatch, reused record SHA) adds only `resumed` and `review-verdict-refused` transitions and restores the entry status and diagnosis.
- **Non-goals:** Cutover/default routing; queue, watcher, or unattended drain; skill prose; Engine model calls or headless `claude -p`; in-run adoption of host fix commits (reject parks, then teardown and an adjusted spec); Engine-written ledger or family-gate rows.

## Assumptions
- `C:/Users/User/.claude` is the sole build repo at HEAD `a948a65`; all coder line anchors below refer to that revision. → impact: Stop.
- PowerShell 5.1, Git, the existing wrapper, and the build repo's `AGENTS.md` Verify commands are available. → impact: Stop.
- HOST writes the two apex close-out files after coder verification. → impact: Stop.

Simplicity check: Three file-disjoint coder tasks; T3 consumes T1 planner output and T2 hand-off contract.

## Prerequisites
- Specs that must be complete first: `docs/changes/done/engine-hardening.md` (Engine wave 2a).
- Environment setup required: PowerShell 5.1 and Git; build from `C:/Users/User/.claude`; preserve existing out-of-scope working-tree changes; use the attended apex-code path with Opus Critic after wave 1 and wave 2.

## Files to Change
Grep evidence: `rg --no-ignore -l -F '<pattern>' C:/Users/User/.claude --glob '!**/.git/**' --glob '!**/projects/**' --glob '!**/file-history/**' --glob '!**/plugins/**'` counted matching files in the live tree (2026-10-04): `engine-plan.ps1` 3; `engine-plan-test.ps1` 1; `engine-git.ps1` 2; `engine-git-test.ps1` 1; `apex-engine.ps1` 1; `engine-test.ps1` 2; `engine-state-schema.json` 1. Consumer greps with the same exclusions: `frontmatter risk must be low or medium` 1; `Intent declares risk: high` 1; `wave_runtime` 3; `Initialize-RunnerResume` 1; `Write-RunnerSummary` 1; `Run status cannot be resumed` 1; `awaiting-review` 0; `ReviewVerdict` 0. `"risk": { "enum"` is at `engine-state-schema.json:128`. In `C:/Users/User/apex`, `rg --no-ignore -l -F` found `SKILL-HISTORY.md` in 85 files and `ADR-048-role-redesign.md` in 13 files. Counts include declarations and references; HOST paths are outside the build repo.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/engine-plan.ps1 | modify | T1 risk grammar. |
| skills/apex-code/scripts/engine-plan-test.ps1 | modify | T1 risk cases. |
| skills/apex-code/scripts/engine-git.ps1 | modify | T2 reviewed-tip hand-off precondition. |
| skills/apex-code/scripts/engine-git-test.ps1 | modify | T2 hand-off cases. |
| skills/apex-code/scripts/apex-engine.ps1 | modify | T3 pause, verdict, resume, summary, teardown, hand-off call. |
| skills/apex-code/scripts/engine-test.ps1 | modify | T3 high-risk and regression cases. |
| skills/apex-code/references/engine-state-schema.json | modify | T3 additive review state. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST T4 wave-2b row. |
| C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | modify | HOST T5 stage-5 wave-2b note. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-git.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-git-test.ps1", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" }, { "path": "skills/apex-code/references/engine-state-schema.json", "op": "modify" }], "depends_on": ["1", "2"], "effort": "xhigh" }
  ]
}
```

## Tasks
- [ ] **Task 1** - Planner: in `engine-plan.ps1:352-358`, admit only case-sensitive frontmatter `risk` values `low|medium|high`; refuse empty/other values with `frontmatter risk must be low, medium or high`; carry `high` through `New-EnginePlanSpec:71-97`. In the Intent token loop at `:402-407`, retain its exact token regex and Non-goals skip, and refuse the token only when resolved risk is not `high`, with `Intent declares risk: high but frontmatter risk is not high`; keep all other risk checks unchanged. In `engine-plan-test.ps1`, add `-OmitRisk` only to `New-SpecText:114,132` so it skips the `risk:` frontmatter line at `:132`; use `New-Fixture -SpecOptions @{ OmitRisk = True }` for the absent-frontmatter case (`New-Fixture:211-212` already forwards `SpecOptions`). At `:313-329`, replace the old high-refusal case with named `risk high grammar`: frontmatter high and frontmatter high plus Intent token both allow with `spec.risk=high`; Intent token with medium or absent frontmatter refuses with the exact `Intent declares risk: high but frontmatter risk is not high` message in each case; empty, `critical`, and frontmatter `highly`, `High`, and `HIGH` refuse; Intent text `risk: highly` (frontmatter medium) allows; keep the Non-goals and outside-Intent cases. — files: skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1 — done when: `engine-plan-test.ps1` exits 0 and a medium spec with Intent `risk: high` is refused.
- [ ] **Task 2** - Git layer: in `engine-git.ps1:507-523`, make `Invoke-EngineHandoff` require Mandatory `-ExpectedTip <sha>`; compare live integration-worktree HEAD case-sensitively with ExpectedTip before any main-repo write and throw on mismatch with `integration HEAD <live> differs from reviewed tip <expected>; hand-off refused`. In `engine-git-test.ps1`, pass `-ExpectedTip` at all seven `Invoke-EngineHandoff` calls (`rg -n Invoke-EngineHandoff engine-git-test.ps1`; anchors `:274,283,322,335,346,359,363`), then add named `hand-off expected tip` and `hand-off moved tip refuses` checks for matching live HEAD proceeding and an extra integration commit after ExpectedTip refusing with the diagnosis while the main repo remains untouched. — files: skills/apex-code/scripts/engine-git.ps1, skills/apex-code/scripts/engine-git-test.ps1 — done when: `engine-git-test.ps1` exits 0 and no hand-off file is written from a moved tip.
- [ ] **Task 3** - Runner: in `apex-engine.ps1:1-16,1256-1260`, add `-ReviewVerdict`, `-ReviewDigest`, `-ReviewRecord` for `-Resume` only; before state load require all three or none, exact case-sensitive verdict `clean|reject` (explicit check, no ValidateSet; `CLEAN` emits `-ReviewVerdict must be exactly 'clean' or 'reject'`), lowercase 64-hex digest, and an absolute existing leaf record outside every Git worktree via `Test-RunnerOutsideWorktree:129`; read strict UTF-8 and compute `record_sha256` via `Get-RunnerDigest:357`; invalid input emits `Engine refused` without state write; a complete valid flag set without `-Resume` on a new run emits `Engine refused` and creates no state, a complete flag set with `-Teardown` emits `Engine refused` with unchanged state hash, and a `-ReviewRecord` file containing invalid UTF-8 bytes emits `Engine refused` with unchanged state hash; do not require `-Attended` solely for high risk, and accept an owner decision record for open findings as a `clean` record without parsing its contents. At `Initialize-RunnerResume:1214-1250`, replace the status throw at `:1222` with a non-mutating diagnosis/`return $false` and admit `awaiting-review`. Immediately after the `:1222` status check and before the `:1223` `engine_owner` assignment and `Save-RunnerState`, refuse flags when risk is not high or no review-pending wave exists, including when the first non-clean integrated wave lacks a review with status `awaiting` or `rejected`: print the diagnosis and return `$false`. A review-pending wave is an integrated wave whose `review.status` is `awaiting` or `rejected`; flags on an adopted or recorded wave without a review object refuse here before the `:1230-1245` spec-digest parks and crash-window adoption. Nothing writes before these pre-resume refusals, including wrong run status and flag preconditions. Capture both entry status and entry diagnosis before `:1247` for later verdict refusal. On `-Resume` of an awaiting-review or rejected run, `Initialize-RunnerResume:1240-1244` checks live integration HEAD against `integration.tip` before the main loop or review gate; an extra integration commit makes crash-window adoption return `$false` for the already-integrated reviewed wave, so resume parks with `integration branch tip mismatch` before applying a supplied clean verdict. Add `Invoke-RunnerReviewGate -Wave` called from the main loop at `:1283-1289` for every integrated high-risk wave, including skipped waves adopted through `commit_intent` at `:1182-1212`; return `clean|paused|parked|refused` and apply supplied flags to at most the first non-clean wave in that process. After `wave-integrated` save at `:925-927`, an absent review requires live HEAD equal `integration.tip`, then records `status=awaiting`, `base=commit_intent.base` or `tip^`, `head=integration.tip`, a successful real `tree-pin.ps1 -Digest -Worktree <integration>` call (`tree-pin.ps1:314-316`; `:201-202` adds HEAD to the fingerprint) yielding a 64-hex `tree_digest`, wave-manifest `files`, `requested_at`, and empty `verdicts`; atomically save top-level `awaiting-review`, an `awaiting-review` transition `<n>/<digest>`, and exit 2. For absent or existing review in the first process, any tree-pin nonzero exit, malformed output other than lowercase 64-hex, or live HEAD differing from `integration.tip` calls `Set-RunnerParked` with fixed `review digest unavailable for wave <n>: <reason>`, exits 1, and creates or modifies no `review` object. For every existing non-clean review, require tree-pin exit 0 and HEAD equal `integration.tip`; a current digest different from the recorded review digest parks with `integration tree moved while wave <n> awaited review (verdict void)`, retaining the original digest; after restoration plain `-Resume` returns to `awaiting-review`. A supplied digest different from that recorded digest, or a reused `record_sha256` on the same wave, is a verdict refusal after resume begins: restore both the entry status (`awaiting-review` or `parked`) and entry diagnosis, add only `resumed` and `review-verdict-refused` transitions, then exit 1 without dispatch. A plain `-Resume` of untouched awaiting-review state returns to `awaiting-review`, exits 2, and adds no transition beyond a resume marker. On `reject`, append `{verdict,digest,record_path,record_sha256,at}`, set review status `rejected`, park with `wave <n> review rejected (record <path>)`, and exit 1; subsequent plain resume stays parked with `resume requires -ReviewVerdict clean bound to <digest>, or -Teardown -Discard`; a later clean needs the same digest and a new record SHA; on any accepted clean, append the same verdict fields, set review status `clean`, atomically save, and continue. At the top of `Invoke-RunnerHandoff:964-996`, before `:965` sets `handoff.status=running` or saves `handoff-started`, scan EVERY high-risk wave and require its `review.status` to be `clean`, and park on final `review.head` differing from `integration.tip`; pass Mandatory `-ExpectedTip $script:EngineState.integration.tip` into `Invoke-EngineHandoff:982-985` for every risk tier, leaving low/medium flow unchanged. In `Write-RunnerSummary:998-1013`, print the awaiting-review wave, base..head, digest, and `Next: Opus Critic on that diff, then -Resume <runId> -ReviewVerdict clean|reject -ReviewDigest <hex> -ReviewRecord <abs path>` within 15 lines; on awaiting-review this replaces the existing `:1011` Next line. At `:1048`, edit only the refusal message to name awaiting-review; the existing non-complete `-Discard` guard already applies and the catch may set `teardown.status=failed`. In `engine-state-schema.json:16,70-91,128`, add top-level `awaiting-review` status, allowed-plan risk `high`, and `"properties": {}` to the `wave_runtime` object; validate each numbered wave through `Test-Structure:542-552` `patternProperties`; add optional `wave_runtime."<n>".review` with required `{status,base,head,tree_digest,files,requested_at,verdicts}`, status `awaiting|clean|rejected`, lowercase 64-hex tree digest, files array of strings, and verdicts with required `{verdict,digest,record_path,record_sha256,at}`, `verdict=clean|reject`, lowercase 64-hex digest and record SHA, and `additionalProperties:false` on both review and verdict; retain schema version 1 and v1/v2a states without review. In `engine-test.ps1:118-198`, add risk and an opt-in `-TwoWave` dependent fixture (`depends_on:["1"]` for task 2), retaining the default two-task parallel fixture; invert `:716-729` to use `risk: critical` for the loose refused-plan check; add the named cases in Acceptance Criteria using the real tree-pin with no `APEX_ENGINE_TEST_TREE_PIN_PATH` override except for the tree-pin nonzero and malformed-digest cases: use stub tree-pins via that override only for those two cases; call `Invoke-RunnerReviewGate` directly for the first-process live HEAD != `integration.tip` defence in import-only mode (`APEX_ENGINE_TEST_MODE=1`, `APEX_ENGINE_TEST_IMPORT_ONLY=1`) with state whose `integration.tip` differs from live HEAD; add named `review resume refuses moved tip` as a real-runner `-Resume` case for a risk-high run paused in awaiting-review, with an extra integration commit and a clean verdict carrying the original review digest; every `no state change` assertion compares the `engine-state.json` file hash before and after. — files: skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/scripts/engine-test.ps1, skills/apex-code/references/engine-state-schema.json — done when: `engine-test.ps1` exits 0 with all named high-risk, schema, refusal, crash-window, low/medium, and hand-off checks.
- [ ] **Task 4 (HOST)** - Prepend one dated apex-code Engine wave-2b row naming `engine-high-risk-pause`, all seven coder files from Tasks 1–3, and ADR-048; leave existing rows intact (`SKILL-HISTORY.md:4`). — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: one new dated row names the seven files and this spec.
- [ ] **Task 5 (HOST)** - Under stage 5 of ADR-048 (`ADR-048-role-redesign.md:131-133`), add a wave-2b note linking `engine-high-risk-pause` and recording post-commit pause with crash-window adoption, tree-digest verdict binding, reject parking, exit 2, no Engine ledger/family-gate rows, non-mutating resume refusal, hand-off ExpectedTip, owner decisions, and these deferrals: in-run fix adoption, cutover/default routing, queue/watcher/unattended drain, and Engine-written ledger/family-gate rows. — files: C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md — done when: the stage-5 note contains each item and the spec link.

## Wave plan
Wave 1: [1, 2] | Wave 2: [3]. Opus Critic reviews the integrated diff after each wave. Post-verification HOST close-out: [Task 4, Task 5]. Manifest dependencies are authoritative.

## Permissions
Coder tasks may modify only their seven manifest paths. HOST writes the two apex close-out files after coder verification. Critical-file writes require live attended confirmation at build time; this section grants no critical-path approval.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder) | skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1, skills/apex-code/scripts/engine-git.ps1, skills/apex-code/scripts/engine-git-test.ps1, skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/scripts/engine-test.ps1, skills/apex-code/references/engine-state-schema.json |
| Modify (HOST) | C:/Users/User/apex/SKILL-HISTORY.md, C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md |
| Create/Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` | T1 planner cases. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1` | T2 hand-off cases. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` | T3 runner and schema cases. |
| Build repo `AGENTS.md` `## Verify commands` block | Run every listed command unchanged. |
| `git ls-files -co --exclude-standard`, `git ls-files`, `git hash-object` | Scoped before/after hashes in both repos. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Test-created worktrees, branches and commits | Hermetic temporary repos only. |
| Engine integration commits | Recorded integration branch only, one commit before each high-risk review. |
| Main working tree | Hand-off only after every wave review is clean and ExpectedTip matches live integration HEAD. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Hermetic test roots and review records outside worktrees. |
| `APEX_STATE_DIR` | Wrapper event and ledger test isolation. |
| `APEX_ENGINE_TEST_CRASH_AFTER_WAVE_COMMIT` | Test the post-commit/pre-state-save adoption window. |
| `APEX_ENGINE_TEST_MODE` | Enable test overrides for the direct review-gate call. |
| `APEX_ENGINE_TEST_IMPORT_ONLY` | Import runner functions without the main loop for the direct live HEAD != `integration.tip` gate case. |
| `APEX_ENGINE_TEST_TREE_PIN_PATH` | May select a stub tree-pin only for tree-pin nonzero and malformed-digest cases; unset for all other review tests. |

### Network
| Action | Purpose |
|--------|---------|
| None | Tests use local fake Codex. |

## Specialist Context
### Security
PowerShell 5.1 StrictMode 2: probe optional properties with `PSObject.Properties['x']`, wrap values in `@()` before `.Count`, and use `return ,$x` for single-element arrays. Use local `$ErrorActionPreference='Continue'` in try/finally around native calls and read `$LASTEXITCODE` immediately; do not use `Start-Process -UseNewEnvironment`. Write UTF-8 without BOM; persist every transition through atomic `Save-RunnerState:290-303`; use `-ceq`/`-ccontains` for identities and digests. Do not use `Test-Json`, `??`, `?.`, ternary, `&&`, or `||`. Validate verdict flags before state load; the catch at `apex-engine.ps1:1298-1302` parks throws after load.

### Performance
Each review gate computes one live tree-pin digest per pass; review records are not parsed by the Engine.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| State contract | skills/apex-code/references/engine-state-schema.json | T3 adds optional review state and high-risk plan value without schema-version change. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST Task 4 prepends one dated wave-2b row. |
| ADR | C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | HOST Task 5 adds stage-5 wave-2b note. |

## Acceptance Criteria
- [ ] Task 1 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` → verify: exit 0; named `risk high grammar` uses `New-Fixture -SpecOptions @{ OmitRisk = True }` for absent frontmatter; covers high with and without Intent token, medium and absent frontmatter with high Intent token each refusing with the exact `Intent declares risk: high but frontmatter risk is not high` message, empty/`critical`/frontmatter `highly`/frontmatter `High`/frontmatter `HIGH` refusal, Intent text `risk: highly` (frontmatter medium) acceptance, and the existing Non-goals/outside-Intent cases.
- [ ] Task 2 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1` → verify: exit 0; named `hand-off expected tip` and `hand-off moved tip refuses` checks accept live HEAD equal ExpectedTip and refuse an extra integration commit after ExpectedTip with the stated diagnosis and no main-repo write; all seven existing `Invoke-EngineHandoff` calls pass Mandatory ExpectedTip.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: exit 0; named `risk high pause after wave` uses the real wrapper and fake Codex, exits 2 with awaiting-review, real tree-pin digest, one integration commit, zero task-2 attempts, unchanged main repo, and schema-valid state; untouched plain resume exits 2 with awaiting-review, no new attempt, and only a resume marker; the summary prints wave, base..head, digest, and only the new Opus Critic Next line within 15 lines.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: named `review digest binding` checks wrong supplied digest exits 1 with awaiting-review, entry diagnosis restored, only `resumed` and `review-verdict-refused` transitions, and unchanged dispatch count, untracked integration file with correct digest parks as tree moved, removal plus plain resume returns awaiting-review without replacing the recorded digest; tree-pin nonzero exit (stub via `APEX_ENGINE_TEST_TREE_PIN_PATH`), malformed digest output (stub printing non-hex via the same override), and live HEAD differing from `integration.tip` (direct `Invoke-RunnerReviewGate` call in import-only mode with `APEX_ENGINE_TEST_MODE=1`, `APEX_ENGINE_TEST_IMPORT_ONLY=1`, and state whose `integration.tip` differs from live HEAD, including absent review) each park with `review digest unavailable for wave <n>: <reason>` and create or modify no review object; the runner cases exit 1, and the direct HEAD != tip call returns `parked`. All other review cases use the real tree-pin with the override unset.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: named `review resume refuses moved tip` uses the real runner with a risk-high run paused in awaiting-review, adds one extra integration-branch commit, then runs `-Resume` with a clean verdict carrying the original review digest; exit 1, status parked, diagnosis contains `integration branch tip mismatch`, `wave_runtime` review object byte-identical when its JSON is compared before and after, no hand-off, main-repo files unchanged, and `handoff.status` neither `running` nor `complete`.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: named `review clean continues to next wave` pauses wave 2 with exit 2, refuses wave-1 digest on wave 2, then a clean wave-2 verdict completes hand-off and the second fixture file appears in main only after it.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: named `review reject parks` checks reject records verdict and parks, plain resume stays parked without dispatch, reused record SHA refusal leaves parked with the entry diagnosis preserved and only `resumed` and `review-verdict-refused` transitions, and clean with a different record SHA and matching digest proceeds.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: named `review survives crash-window adoption` sets `APEX_ENGINE_TEST_CRASH_AFTER_WAVE_COMMIT=1` for a high-risk run, then resume with verdict flags refuses with an unchanged `engine-state.json` file hash; plain resume records `wave-commit-adopted`, pauses with exit 2, and performs no hand-off.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: named `low-medium no pause` leaves no review key in existing low/medium runs and refuses flags on a medium run with an unchanged `engine-state.json` file hash; named `non-mutating resume refusal` leaves a complete run complete with an unchanged state-file hash.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: named `review flag validation` covers partial flags, malformed digest, relative/missing/inside-worktree record, uppercase `CLEAN`, and a record containing invalid UTF-8 bytes, each emitting `Engine refused` with the `engine-state.json` file hash unchanged before/after; a complete valid flag set without `-Resume` on a new run emits `Engine refused` and creates no state; a complete flag set with `-Teardown` emits `Engine refused` with the state-file hash unchanged; named `review schema` preserves v1 compatibility, accepts full review state, and rejects bad verdict enum, missing review tree_digest, missing verdict record_sha256, and an unexpected key under `wave_runtime."1"`.
- [ ] Task 3 — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: named `awaiting-review teardown` refuses without `-Discard` while top-level status stays `awaiting-review`, and succeeds with it; named `hand-off refuses an unreviewed tip` asserts `Invoke-RunnerHandoff` passes `integration.tip` as ExpectedTip and parks a high-risk run when final `review.head` differs from `integration.tip` before hand-off, leaving `handoff.status=pending`; in a two-wave risk-high state where wave 1 `review.status` is `rejected` while the final wave `review.head` equals `integration.tip`, it refuses before `:965`, leaves `handoff.status=pending`, and does not change the main repo; existing two-path reachability, hand-off, and crash-window checks pass.
- [ ] Task 4 (HOST) — run `rg -n -F 'engine-high-risk-pause' C:/Users/User/apex/SKILL-HISTORY.md` → verify: exactly one new dated apex-code wave-2b row names all seven coder files and ADR-048.
- [ ] Task 5 (HOST) — run `rg -n -F 'engine-high-risk-pause' C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md` → verify: stage-5 wave-2b note links this spec and contains the pause point, crash-window, digest, reject, exit-code, ledger, resume-refusal, ExpectedTip, owner-decision, and explicit deferrals of in-run fix adoption, cutover/default routing, queue/watcher/unattended drain, and Engine-written ledger/family-gate rows.
- [ ] Tasks 1–5 build fence — from `C:/Users/User/.claude`, run the PowerShell block below → verify: every command in the existing `AGENTS.md` `## Verify commands` fence exits 0.
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
- [ ] Tasks 1–5 scope — run the first PowerShell block from one persistent PowerShell session at build start and the second after HOST close-out → verify: `scope hashes OK`; in `C:/Users/User/.claude`, hash only `git ls-files -co --exclude-standard` paths plus the seven named coder files; in `C:/Users/User/apex`, only the two HOST files may change among tracked files outside the drafts, changes, handoff, and tracked status paths. A path that vanishes between enumeration and hashing within the same snapshot alone is skipped; a path hashed before and missing after is an out-of-scope deletion unless allowed, and a skipped-before path is not exempt after. All nine Files-to-Change paths exist.
```powershell
$claudeRoot = 'C:/Users/User/.claude'
$apexRoot = 'C:/Users/User/apex'
$claudeExplicit = @(
    'skills/apex-code/scripts/engine-plan.ps1',
    'skills/apex-code/scripts/engine-plan-test.ps1',
    'skills/apex-code/scripts/engine-git.ps1',
    'skills/apex-code/scripts/engine-git-test.ps1',
    'skills/apex-code/scripts/apex-engine.ps1',
    'skills/apex-code/scripts/engine-test.ps1',
    'skills/apex-code/references/engine-state-schema.json'
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
function Get-HighRiskScopeHashes {
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
$scopeBefore = Get-HighRiskScopeHashes
```
After HOST close-out, run this second block in the same PowerShell session:
```powershell
$scopeAfter = Get-HighRiskScopeHashes
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
- [ ] Tasks 1–3 reachability — from `C:/Users/User/.claude`, run `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` → verify: the real wrapper with fake Codex reaches wave commit, durable review pause, digest-bound resume, and ExpectedTip-bound hand-off in the two-wave fixture.

## Progress
_(The build writes here — do not edit manually)_

Build date: 2026-10-04
