---
spec: drain-close-out
status: built
autonomy_level: L2
risk: medium
coder_effort: high
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Attended drain close-out plan
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Print a verified, read-only, per-repository plan for attended close-out of a completed unattended drain.
<!-- → why: see docs/technical/adr/ADR-049-unattended-queue-drain.md. -->

## Intent
- **Intent:** Give the HOST one ordered close-out checklist from the drain's durable state, Engine states, ledger, and Git identities.
- **Invariants:** Only a `complete` drain is eligible; build commits remain immutable checkpoints; the helper writes no state, files, or refs and never integrates, tears down, or pushes. Every recorded drain repo has its own base, destination, tip, and range, including a repo with no build commits. The owner approves each proposed close-out commit's paths, full diff, and message before the HOST commits, and each build-only drain repo's current tip SHA before integration.
- **Non-goals:** Automated review, documentation edits, approval, integration, teardown, or partial approval.

## Assumptions
- `drain-runner` is committed with schema-1 `drain-state.json`, the per-repo `ref_snapshot`, and one committed-spec `commit_sha` and `engine_run_id` per successful build → impact: Stop.
- The drain does not record the branch checked out in the main worktree at drain start, so a switch to another branch at the same SHA after drain start is not detected. The owner's approval names the destination branch and close-out content per repo, and the HOST checks the branch and base HEAD before fast-forwarding → impact: Low.
- Engine run state contains `integration.tip`, `plan.host_checks[].text`, `handoff.journaled_paths`, and task attempts; successful build ledger dispatch rows contain `end_tree_digest` → impact: Stop.
- `-Plan` reports the Engine-recorded wrapper run by exact id, while `apex-family-gate.ps1` selects the newest build row for the spec/task/worktree tuple; a later dispatch on a preserved task worktree can make them differ, so the HOST confirms the gate's selected run equals the plan's run id before appending review rows, and stops for the owner if not → impact: Low.
- This spec amends ADR-049 decision 9: per-spec Scribe does not run for drained specs in v1; a queue-mode Scribe requires a follow-up spec. Close-out documentation comes from HOST tasks and the apex-docs-technical-agent handoff; the Scribe contract is unchanged → impact: Stop.

Simplicity check: report-only HOST prose considered; Plan CLI selected.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/scripts/apex-drain-close.ps1 | create | Coder Task 1 read-only plan command. |
| skills/apex-code/scripts/apex-drain-close-test.ps1 | create | Coder Task 1 hermetic plan tests. |
| C:/Users/User/.claude/AGENTS.md | modify | HOST Task 2 verify fence. |
| C:/Users/User/.claude/skills/apex-code/references/drain-close-out.md | create | HOST Task 3 attended sequence. |
| C:/Users/User/.claude/skills/apex-code/SKILL.md | modify | HOST Task 3 pointer and version. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 4 event row. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 5 Added bullet. |
| C:/Users/User/apex/docs/technical/adr/ADR-049-unattended-queue-drain.md | modify | HOST Task 6 decision 9 amendment. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [
      { "path": "skills/apex-code/scripts/apex-drain-close.ps1", "op": "create" },
      { "path": "skills/apex-code/scripts/apex-drain-close-test.ps1", "op": "create" }
    ], "depends_on": [] }
  ]
}
```

## Tasks
- [x] **Task 1** - Create `apex-drain-close.ps1` and `apex-drain-close-test.ps1` with the Plan contract below. - files: `skills/apex-code/scripts/apex-drain-close.ps1`, `skills/apex-code/scripts/apex-drain-close-test.ps1` — done when the hermetic suite exercises text and JSON plans, multi-repo and empty-repo output, eligibility, source bindings, and refusal paths through the real CLI.

  **CLI and read boundary.** Accept only `-Plan <drain-id> [-Json]`; accept `-StateRoot <absolute>` only when `APEX_DRAIN_TEST_MODE=1` for hermetic tests. Production resolves StateRoot from `APEX_STATE_DIR`, else `$env:LOCALAPPDATA/apex`, as `apex-drain.ps1` does for `-Resume`; validate the same `yyyyMMdd-HHmmss-abcdef` drain-id shape, canonical absolute StateRoot outside Git worktrees, and stored `schema_version`, `drain_id`, `state_root`, repo roots, branch, worktree, and Git common-directory identities. The mode reads `StateRoot/drains/<id>/drain-state.json` while holding the existing `StateRoot/drains/drain.lock` exclusively, with the runner's 20 retries separated by 0.5 second (10 seconds total); open the existing lock without `OpenOrCreate`, release in `finally`, and report `drain lock busy` on exhaustion. No file creation, modification, state transition, report refresh, ref update, index or worktree write, teardown, merge, fetch, or push; only the lock handle may be acquired and released. Read all text as UTF-8; use `GIT_OPTIONAL_LOCKS=0` and read-only Git subcommands for every probe. The report is presentation only and is never an input.

  **Eligibility and repo identity.** Read any drain status for diagnosis; only exact `status: complete` is eligible. For other statuses, text mode prints the status and `diagnosis`, lists committed and noncommitted specs without an actionable approval or merge target, and tells the HOST to resume or inspect the preserved drain (never resume `stopped-integrity` blindly). For a complete drain, group `will_build[]` by `repos[].common_dir` and preserve `order`; list every recorded repo, including one with no committed specs. For each repo, require `repos[].state: ready`, `repos[].branch: codex/drain-<id>`, and its registered worktree/branch in `git worktree list --porcelain`. Obtain `drain_tip` from that branch and worktree HEAD and require equality. For a repo with committed specs, set `drain_base` to the first committed spec's recorded `prelaunch_head`; require that base to be an ancestor of `drain_tip`. For every committed spec in drain order, use `git rev-list --parents -n 1 <commit_sha>` and require exactly one parent equal to that spec's recorded `prelaunch_head`; require the first parent to equal `drain_base`, each later parent to equal the previous committed spec's `commit_sha`, matching the runner's per-spec assertion. Require matching `Drain-Spec` and `Engine-Run` trailers and the last committed SHA equal to `drain_tip`. For a repo with no committed specs, set `drain_base` to `drain_tip`, the drain branch's creation commit before close-out; do not infer a creation HEAD from `ref_snapshot` or a skipped spec's absent `prelaunch_head`. Report the recorded main worktree's current `git symbolic-ref` as `destination_branch`; require a branch and its HEAD equal to `drain_base`, or refuse that repo with the reason. Do not infer a destination from `ref_snapshot`. Each repo's `whole_queue_range` is `<drain_base>..<drain_tip>`; for a zero-commit repo it is initially empty and extends through its close-out commit if that repo receives close-out edits. A repo with committed specs remains eligible for integration even if it receives no close-out edits: the owner approves its current `drain_tip` SHA and the HOST fast-forwards the destination to that SHA under the same all-repo preflight. Only a repo with neither committed specs nor close-out edits is `nothing_to_integrate` and has no commit or integration.

  **Committed-spec fields and source binding.** For every `will_build[]` item with `state: committed`, emit `order`, `spec`, `repo`, `commit_sha`, `engine_run_id`, and `journaled_paths` from drain state `order/spec/repo/commit_sha/engine_run_id` and Engine state `handoff.journaled_paths`. Require the Engine file at `StateRoot/<engine_run_id>/engine-state.json` to have `schema_version: 1`, matching `run_id`, `spec.name`, `repo` equal to the drain worktree, `status: complete`, `handoff.status: complete`, and nonempty `integration.tip`; emit `integration_tip` from that file. Require Engine `spec.original_digest` to equal the drain-recorded spec `digest` and Engine `base_sha` to equal that spec's `prelaunch_head`. Verify the recorded spec file at `will_build[].path` still has that digest using the runner's UTF-8 normalized `Get-DrainDigest` semantics, then read its `## Tasks` list and emit ordered `host_tasks` and `owner_tasks` arrays of task IDs and titles; refuse a missing, changed, or unparseable spec. Emit `host_checks` as an array of exact, ordered `plan.host_checks[].text` strings, including multiline text without rewriting it; these are acceptance assertions, not HOST task instructions. Set `review_parent` with `git rev-parse <commit_sha>^`, `review_target` to the commit SHA, and `review_paths` to the Engine `handoff.journaled_paths`; emit `review_command` as `git diff <review_parent> <commit_sha> -- <journaled paths>` with each path safely PowerShell-quoted for display, and print it in text output. Require the commit's changed-path set to equal the journaled-path set. Verify that `integration.tip` resolves to a commit and, for each journaled path, compare the blob at `<commit_sha>:<path>` with the blob at `<integration.tip>:<path>`, including equal absence, as the runner's `Test-DrainBlobIdentity -Head` does; this is a read-only Git re-check. Any digest, base, tip, blob, Engine identity, or path-set mismatch makes the drain ineligible with the reason.

  **Family-gate identities.** For each committed spec's Engine `tasks[]`, require `status: integrated` and select the final `attempts[]` entry with `status: succeeded`, the attempt used by Engine integration. Bind it to its `wrapper_run_id` and `worktree`. Find the exact dispatch row in `StateRoot/progress/codex-run-ledger.jsonl` with `row_kind: dispatch`, `phase: build`, `run_id` equal to the attempt's `wrapper_run_id`, matching `spec` and `task`, and a terminal success `status` of `done`, `done_with_concerns`, `success`, or `adopted-done`. Where worktree comparison is needed, use the ledger `worktree_key` or Engine's existing `Test-EnginePathEqual` helper, never raw path string equality. Emit `wrapper_runs[]` per committed spec, with each selected run's `task` (Engine `tasks[].id`), `wrapper_run_id` (ledger `run_id`), `worktree_key` (ledger `worktree_key`), and `end_digest` (ledger `end_tree_digest`). Require a nonempty, verifiable 64-hex `end_tree_digest` matching the Engine attempt's `end_tree_digest`; refuse ambiguous, missing, failed, or mismatched rows. List each repo's noncommitted `will_build[]` entries with `order`, `spec`, `repo`, `state`, `diagnosis`, and `engine_run_id`; list their preserved Engine runs for attended disposition without assigning family-gate identities to them. Keep `needs_you[]` entries at the top level with `spec`, `reason_code`, and `reason`, as those sorter rows have no repo field.

  **Output and exit.** Text and `-Json` convey the same plan fields on success: top-level `schema_version: 1`, `drain_id`, `status`, `eligible`, `diagnosis`, `repos[]`, and `needs_you[]` from `drain-state.json`; each repo has `repo`, `common_dir`, `worktree`, and `drain_branch` from `repos[].repo/common_dir/worktree/branch`, plus Git-validated `drain_base`, `destination_branch`, `drain_tip`, `whole_queue_range`, `nothing_to_integrate`, ordered `committed_specs[]`, and `noncommitted_specs[]`. A repo with no committed specs has `drain_base` equal to `drain_tip`, an initially empty `whole_queue_range`, an actionable destination, and provisional `nothing_to_integrate: false` because close-out edits on its drain branch may require integration; the HOST marks it `nothing_to_integrate` only after confirming that it receives no close-out edits. A repo with committed specs is never `nothing_to_integrate`, even if no close-out edits are made. Each committed spec carries the drain-state, Engine-state, ledger, Git-derived, `host_tasks`, and `owner_tasks` fields named above. Without `-Json`, an ineligible state prints `eligible: false`, status, diagnosis, and recorded repo/spec facts without an actionable destination, range, review command, or approval target; leave unavailable derived fields null. JSON is one parseable document with every non-ASCII code point escaped as `\uXXXX` (surrogate pairs for supplementary characters); text remains UTF-8. Exit 0 only after a complete eligible plan has printed. On any refusal, including an ineligible state, busy lock, missing state, malformed or inconsistent source, moved branch, or unsafe/ambiguous Git identity, exit nonzero with a concise reason: without `-Json`, write the reason to stdout as today; with `-Json`, write the reason to stderr and nothing to stdout.

  **Hermetic verification.** Build temporary Git repos, drain state, Engine state, and ledger fixtures using the fixture approach in `apex-drain-test.ps1` (function-only AST import or synthetic state plus real temporary Git repos); never start a live drain or touch live repos. Cover one and multiple repos, interleaved spec order, a repo with no committed specs and no recorded creation HEAD whose drain base equals its tip, stopped statuses, lock contention/retry, detached or moved destination, moved drain tip, a broken commit chain or any committed spec whose recorded `prelaunch_head` differs from its single Git parent, missing/mismatched Engine digest and base identity, missing integration tip, changed journaled-path blobs, changed recorded spec digest, HOST/OWNER task listing, missing/mismatched ledger identity, unicode HOST check text, JSON ASCII escaping, refusal stdout/stderr behavior, and byte-equal before/after snapshots of state files, refs, HEAD, index, and tracked files. Clean only fixture-owned temporary paths.

- [x] **Task 2 (HOST)** - Insert exactly `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-close-test.ps1` immediately before the existing `engine-test.ps1` line in `C:/Users/User/.claude/AGENTS.md` `## Verify commands` fence. - files: `C:/Users/User/.claude/AGENTS.md` — done when the new line occurs once in that position.
- [x] **Task 3 (HOST)** - Create `C:/Users/User/.claude/skills/apex-code/references/drain-close-out.md` with the numbered HOST sequence below, then replace the existing close-out sentence in `C:/Users/User/.claude/skills/apex-code/SKILL.md` `## Unattended drain` with one line pointing to `references/drain-close-out.md`; change `version: 2.24.0` to `2.25.0` and `last_updated` to the build date. - files: `C:/Users/User/.claude/skills/apex-code/references/drain-close-out.md`, `C:/Users/User/.claude/skills/apex-code/SKILL.md` — done when the pointer loads the sequence and SKILL.md has no net line growth and remains at most 500 lines.

  1. Run `apex-drain-close.ps1 -Plan <drain-id>`; stop on ineligible output. Work per recorded repo and committed spec, using that spec's drain-commit diff and the `## Tasks` list read at its recorded digest. For every committed spec in drain order, perform its HOST tasks in the repo routed in step 3; before that spec's HOST checks and archival, require the owner to complete or explicitly waive every OWNER task and record each waiver in the close-out notes. Then run its exact Engine HOST checks against that result as acceptance assertions. Keep the build commits immutable. A recorded drain repo with no committed specs can still receive a close-out commit.
  2. After every committed spec's HOST tasks, OWNER-task disposition, and checks, run its per-spec Critic at sonnet/opus according to risk and the unchanged family gate. Before appending any review rows, confirm that the family gate's selected run for each spec/task/worktree tuple equals the plan's exact wrapper run ID; stop for the owner on a mismatch. Bind review rows to the plan's selected wrapper run IDs, worktree keys, and END digests. After all per-spec rows, run one whole-queue Opus end-gate over the cumulative committed-spec diff from each repo's `<drain_base>` and the reviewed HOST-task edits across affected repos. Record repairs and re-run affected checks and gates before proceeding. The end-gate does not consume the later docs handoffs or spec archival.
  3. Invoke apex-docs-technical-agent once per committed spec, in drain order, with that spec's `spec_path` and `scribe_summary: none (drained spec; queue-mode Scribe deferred)`. Include each invocation's documentation writes in the routed close-out commit and archive that spec only after its OWNER tasks are completed or explicitly waived in the close-out notes; archive committed specs last in the close-out edits. Route every close-out path, including HOST task files, spec archival, handoff, history, changelog, and ADR, by repository: if the drain recorded a drain branch for that repo, draft one close-out commit in its drain worktree on `codex/drain-<id>` atop its current tip, even when that repo has no committed specs; otherwise draft one path-scoped close-out commit on the currently checked-out branch in its main worktree. A zero-commit drain repo's base is its drain branch tip before this commit and its close-out commit is integrated like any other drain repo. A drain repo with committed specs and no close-out edits still requires integration of its current tip. Only a repo with neither committed specs nor close-out edits is `nothing_to_integrate` and skips commit and integration. For each repo needing a close-out commit, stage only its close-out paths, record `git write-tree` of that staged index, its parent HEAD, path list, full staged diff, and commit message. Run the affected repo's full verify fence in that worktree with working files equal to the staged content: before and after the fence, confirm `git diff --quiet` and `git diff --cached --quiet -- <paths outside the staged set>` show no other changes, and after the fence require `git write-tree` to equal the recorded tree. For a non-drain repo with pre-existing unrelated dirty work, confirm the staged paths have no unstaged changes, make its eventual close-out commit path-scoped, and report that the fence ran in a working tree also containing that unrelated dirt. Present the verified content and tree hash for owner approval; do not create a commit before approval.
  4. Request one batched, all-or-nothing owner approval of each proposed close-out commit's path list, full diff, message, branch, and recorded staged tree hash, plus each build-only drain repo's current tip SHA as its integration target. Before any commit, preflight all approved repos, including build-only drain repos: each drain repo's main worktree is still on the approved destination branch at `drain_base`, its drain worktree is still on `codex/drain-<id>` at the recorded parent HEAD or approved build-only tip SHA, and every path to be integrated is clean in the main worktree; each non-drain repo is still on its approved checked-out branch at the recorded parent HEAD. Require every repo with close-out edits to have staged paths, full diff, message, and `git write-tree` hash matching the approved draft. If any preflight fails, commit or integrate nothing. If all pass, make each approved close-out commit in its routed worktree, then compare `git rev-parse <new commit>^{tree}` with the approved pre-approval `git write-tree` hash. A mismatch stops for the owner before any fast-forward. Confirm each new drain commit is its drain branch tip; re-check every drain destination branch, base HEAD, and touched-path cleanliness, then run `git -C <main worktree> merge --ff-only <approved drain tip SHA>` for each drain repo in turn, using the new close-out commit SHA where one was made and the approved current tip SHA for a build-only repo, never a branch name. Leave each non-drain commit on its approved checked-out branch. Rejection leaves destinations unchanged and preserves drain branches, worktrees, Engine artifacts, and drafted edits for attended disposition. If a later commit or fast-forward fails after another repo was committed or integrated, stop, report exactly which repos were committed or integrated, and leave the rest for owner disposition; never roll back automatically and never push.
  5. Preserve the drain worktree and branch until every Engine run referencing it, including committed, parked, and paused runs, has an owner-approved disposition. Try normal Engine teardown for committed runs first. If its manifest-path blob proof fails, inspect whether later overlapping drained commits, the close-out commit changing a run's manifest paths, dirty files, or path-safety failures caused it before choosing the `-Discard -Reason` fallback by explicit HOST decision. Handle other preserved runs per owner disposition. Remove the drain worktree without force, then delete its merged branch with non-forced `git branch -d`, last.

- [x] **Task 4 (HOST)** - Prepend a top data row to `C:/Users/User/apex/SKILL-HISTORY.md` for `drain-close-out`, naming the new scripts, reference, AGENTS verify line, apex-code `2.25.0`, and this spec. - files: `C:/Users/User/apex/SKILL-HISTORY.md` — done when the first data row names this event and version.
- [x] **Task 5 (HOST)** - Add exactly one `drain-close-out` bullet under `## [Unreleased]` → `### Added` in `C:/Users/User/apex/CHANGELOG.md`, naming the read-only plan and attended close-out reference. - files: `C:/Users/User/apex/CHANGELOG.md` — done when the bullet is in that subsection.
- [x] **Task 6 (HOST)** - Amend decision 9 in `C:/Users/User/apex/docs/technical/adr/ADR-049-unattended-queue-drain.md` to state that per-spec Scribe does not run for drained specs in v1 and queue-mode Scribe requires a follow-up spec; close-out documentation comes from HOST tasks and the apex-docs-technical-agent handoff. Leave the Scribe contract untouched. - files: `C:/Users/User/apex/docs/technical/adr/ADR-049-unattended-queue-drain.md` — done when decision 9 records the v1 Scribe exception and follow-up.

## Wave plan
Wave 1: [1] | HOST: [2, 3, 4, 5, 6].

## Permissions
Coder Task 1 creates only its two manifest files and runs hermetic tests. HOST owns Tasks 2–6. All Git writes in tests target disposable fixture repos; the production command is read-only. No network or package operation.

### File Operations
| Action | Paths |
|--------|-------|
| Create (coder Task 1) | skills/apex-code/scripts/apex-drain-close.ps1, skills/apex-code/scripts/apex-drain-close-test.ps1 |
| Create (HOST Task 3) | C:/Users/User/.claude/skills/apex-code/references/drain-close-out.md |
| Modify (HOST Tasks 2–3) | C:/Users/User/.claude/AGENTS.md, C:/Users/User/.claude/skills/apex-code/SKILL.md |
| Modify (HOST Tasks 4–5) | C:/Users/User/apex/SKILL-HISTORY.md, C:/Users/User/apex/CHANGELOG.md |
| Modify (HOST Task 6) | C:/Users/User/apex/docs/technical/adr/ADR-049-unattended-queue-drain.md |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-close-test.ps1` | Run hermetic Plan cases. |
| Build repository `AGENTS.md` Verify commands fence | HOST runs every command from its root. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Read-only inspection | Production Plan and live repositories. |
| Create commits and branches | Temporary test fixtures only. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_STATE_DIR` | Production StateRoot selection and fixture isolation. |
| `APEX_DRAIN_TEST_MODE` | Enables test-only `-StateRoot`. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No packages or network. |

## Specialist Context
### Security
Reject untrusted stored roots, path escapes, mismatched Git common directories, and ambiguous run or ledger identities before marking a plan eligible.

### Performance
The plan reads bounded drain and Engine artifacts and does not launch Engine or the full drain suite. The hermetic suite uses synthetic state where possible.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Skill procedure | C:/Users/User/.claude/skills/apex-code/references/drain-close-out.md | HOST writes numbered sequence. |
| Skill router | C:/Users/User/.claude/skills/apex-code/SKILL.md | HOST points to procedure and bumps version. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | HOST prepends row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST adds one bullet. |
| ADR | C:/Users/User/apex/docs/technical/adr/ADR-049-unattended-queue-drain.md | HOST amends decision 9. |

## Acceptance Criteria
- [x] Task 1 - the read-only Plan CLI, zero-commit repo base and destination handling, every committed spec's `prelaunch_head`/single-parent chain binding, digest/base/tip/blob re-checks, HOST/OWNER task listing, source joins, exact review and family-gate identities, text/ASCII-escaped JSON, and refusal paths pass the hermetic suite.
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-close-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'drain close-out plan failed' }
```
- [x] Task 2 - HOST verify fence adds the new suite immediately before Engine suite → verify: the `## Verify commands` fence contains the exact new line once, directly preceding the existing `engine-test.ps1` line.
- [x] Task 3 - HOST reference and skill pointer → verify: `references/drain-close-out.md` has five numbered steps with each committed spec's OWNER tasks completed or explicitly waived in the close-out notes before its HOST checks and archival, per-spec HOST tasks and checks before Critic and family-gate rows, exact family-gate run selection checked against the plan before review rows, the whole-queue Opus end-gate before one apex-docs-technical-agent invocation per committed spec in drain order with `scribe_summary: none (drained spec; queue-mode Scribe deferred)` and final spec archival, drain-worktree routing for every recorded drain repo including zero-commit repos, current-branch routing for other repos, staged `git write-tree` recorded before the full verify fence with working files equal to staged content, one batched approval of each repo's path list, full diff, and message after verification and before any close-out commit, approved staged tree comparison with each new commit's tree before integration, path-scoped non-drain commits with unrelated pre-existing dirt reported in the fence result, build-only drain tips approved and fast-forwarded under the all-repo preflight, failure reporting without rollback, and the specified teardown ordering; `SKILL.md` has `version: 2.25.0`, build-date `last_updated`, the reference pointer in `## Unattended drain`, no net line growth, and at most 500 lines.
- [x] Task 4 - HOST history → verify: the top data row in `C:/Users/User/apex/SKILL-HISTORY.md` names `drain-close-out`, the two scripts, the reference, AGENTS line, and `2.25.0`.
- [x] Task 5 - HOST changelog → verify: exactly one `drain-close-out` bullet is under `## [Unreleased]` `### Added` in `C:/Users/User/apex/CHANGELOG.md`.
- [x] Task 6 - HOST ADR amendment → verify: decision 9 in `C:/Users/User/apex/docs/technical/adr/ADR-049-unattended-queue-drain.md` states that per-spec Scribe does not run for drained specs in v1, queue-mode Scribe requires a follow-up spec, and HOST tasks plus the apex-docs-technical-agent handoff produce close-out documentation; the Scribe contract remains untouched.
- [x] Build repository full verify fence - HOST runs the current `C:/Users/User/.claude/AGENTS.md` commands in their existing order with the Task 2 line immediately before `engine-test.ps1`:
```powershell
node --check hooks/destructive-command-guard.js
node --check hooks/lib/destructive-detect.js
python hooks/destructive-guard-test.py
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-plan-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case core
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case recovery
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case resume
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case safety
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-close-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```
- [x] Scope - only the eight `## Files to Change` paths are written by this build → verify: the HOST names each expected new file: `skills/apex-code/scripts/apex-drain-close.ps1`, `skills/apex-code/scripts/apex-drain-close-test.ps1`, and `C:/Users/User/.claude/skills/apex-code/references/drain-close-out.md`; confirms each exists and is ignored with `git check-ignore -v <path>`; and records each SHA-256. For tracked modified files, compare `git status --porcelain -uall` with the pre-build dirty baseline in both repositories and name all pre-existing unrelated paths without editing them.
- [x] Reachability - a real `-Plan <drain-id> -Json` invocation reads fixture drain, Engine, ledger, and Git data and emits wrapper run IDs, worktree keys, and END digests matching the joined ledger rows → verify: the hermetic suite parses the CLI JSON and asserts those fields, exit status, and byte-equal read-only boundary.

## Progress
_(The build writes here - do not edit manually)_
