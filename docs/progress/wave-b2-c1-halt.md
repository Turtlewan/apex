# Capture-at-halt: Wave B2, spec c1 (round8-c1-digest-emitters) — 2026-07-18

Session cleared mid-spec by user request. Everything below is the exact resume state.

## Position
- Worktree: `%TEMP%\apex-wt-waveb2` (branch `wave-b2` @ `ac1a7cc6a481239536523dd0efba42ab82051e63`). Do NOT recreate it — it exists and carries Task 1's + Task 3's writes.
- **Task 1 (tree-pin `-Digest`): DONE + host-verified** (run `241e4d84`, ledger status done). 64-hex stdout line, deterministic, no pin artifact.
- **Task 3 (scope-check `-WrittenPathsFile`): CODER RUNNING at halt** (run `537d87ee`, ledger status running). Its `.final` will land at
  `C:\Users\User\AppData\Local\Temp\codex-round8-c1-digest-emitters-task-3-537d87ee.final`.
  On resume: if `.final` exists, recover the verdict FOREGROUND with
  ```powershell
  & "$env:TEMP\apex-wt-waveb2\skills\apex-code\scripts\codex-dispatch.ps1" -Adopt `
    -Spec round8-c1-digest-emitters -Task task-3 -Phase build `
    -Worktree "$env:TEMP\apex-wt-waveb2" -BaseSha ac1a7cc6a481239536523dd0efba42ab82051e63 -Schema completion
  ```
  Route the adopt exit per the SKILL.md table (0/68 → verify Task 3 per the spec's acceptance; 75 = still running, wait on the `.final`).
- **Tasks 2 and 4: NOT DISPATCHED.** Dispatch sequentially after Task 3 verifies, per the spec, from the worktree wrapper, `-Effort high`, and MANDATORY
  `-SpecSourcePath C:\users\user\apex\docs\changes\round8-c1-digest-emitters.md` (the live wrapper refuses cross-tree builds without it since Wave B1).

## After all 4 tasks (the b3/b1 gate pattern, unchanged)
1. Non-regression from worktree root: `dispatch-preflight-test.ps1` + `dispatch-test.ps1` both exit 0.
2. `tree-pin.ps1 -Pin` the worktree (label `c1-review`) → dispatch `apex-reviewer` (model opus, risk high) on the 4 changed files with all coder concerns verbatim → pin `-Verify` before acting.
3. Append 4 in-session review rows (mutex `ApexCodexRunLedger`, `builder_family:'openai'`, `reviewer_family:'anthropic'`, `reviewed_run_id` = each build run_id) → `apex-family-gate.ps1` per task, all exit 0.
4. Host commit in the worktree, message: `feat(harness): tree-pin -Digest + scope-check -WrittenPathsFile attribution emission (ADR-044 D6, c1)`.
5. Then spec c2 (`round8-c2-dispatch-binding`), then c3 (`round8-c3-gate-compare`) — same orchestration; briefs must carry the foreground-only dispatch rule, the nested-sandbox hazard (host re-verifies any coder claim about dispatcher-launching suites), and the Layer-A `-Root` classifier call.
6. Wave close: cherry-pick wave-b2 commits onto live master (`git merge` is guard-blocked), full live battery, host bookkeeping (SKILL-HISTORY row apex-code 2.11.0; known-limits: narrow the broader-dir-grant row — D6's post-hoc classification closes it — and add the deleted-leaf-in-collapsed-dir limit), handoff, archive specs, status close.

## Gotchas already learned this wave (don't relearn)
- Sonnet orchestrators background dispatches despite instructions — expect one nudge per build; artifact-poll + `-Adopt` recovery works; host watcher is the backstop.
- The destructive guard blocks `git merge`, `git checkout --`, `git worktree remove`, `git commit --amend` — cherry-pick and fresh commits are the working paths.
- Old worktree `%TEMP%\apex-wt-waveb1` + branch `wave-b1` still await manual deletion (fully integrated, safe to remove by hand).

Delete this file once drained into the resumed build.
