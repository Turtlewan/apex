---
spec: engine-acceptance-gate
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Engine acceptance gate
<!-- Governing contract: C:/Users/User/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Run opted-in spec acceptance checks in the Engine, retain HOST checks, and support repair close-out.

## Intent
- **Intent:** Gate Engine completion on tagged task and spec checks, with task failures routed through the existing retry ladder and untagged criteria handed to the HOST.
- **Invariants:** Only exact `powershell apex-accept` fences under Acceptance Criteria execute. Tagged checks are trusted spec content with the same trust as the `AGENTS.md` verify fence: author-written, Critic-reviewed, owner-promoted, and run unsandboxed in the integration root. The path/location grammar is an accident guard, not confinement. Tree/index movement or residue after checks is detected and parks the run without restoration. A check's `exit` ends its child process, not the Engine process. Schema version remains 1; absent additions preserve legacy Resume and Teardown behavior.
- **Non-goals:** Engine default coder model; engine-test/dispatch-preflight concurrency flakes; an Engine `-Repair` command; running untagged checks; changing the verify fence.

## Assumptions
- The build repo's `AGENTS.md` Verify commands fence remains the 14-command block reproduced below. -> impact: Stop.
- After this spec is committed, the HOST plans a separate tiny Low-risk `engine-accept-smoke` spec through `apex-plan` with one task-labelled `powershell apex-accept` block and one untagged criterion; that planning is outside this spec's file scope. -> impact: Stop.

Simplicity check: Task 1 is atomic; Task 2 is file-disjoint.

## Prerequisites
- Specs that must be complete first: none.
- Environment: `C:/Users/User/.claude` build repo and PowerShell 5.1; after committing this spec, HOST separately plans and promotes `engine-accept-smoke` through `apex-plan`, runs it on the live Engine, inspects engine-state and console, closes it out normally, and tears it down.

## Files to Change
Grep evidence: `rg -uu -o -F --` run separately for each literal and explicit live-file path below (counting output lines) found `engine-plan.ps1` / `Get-EngineAcceptanceLines`: 2, `engine-plan-test.ps1` / `Get-EnginePlan`: 4, `apex-engine.ps1` / `Invoke-RunnerGate`: 3, `engine-state-schema.json` / `"attempts"`: 2, `engine-test.ps1` / `Invoke-RunnerGate`: 8, `spec-template.md` / `Acceptance Criteria`: 1, `apex-spec-validate.ps1` / `Acceptance Criteria`: 5, `spec-validate-test.ps1` / `Assert-Case`: 75, `spec-contract.md` / `Changing the contract`: 1, `apex-code/SKILL.md` / `Engine`: 16, `SKILL-HISTORY.md` / `apex-code`: 190, and `SKILLS.md` / `apex-code`: 7. Each search used the corresponding path in the table below and `-uu` to include gitignored files. `Test-Path` confirms `accept-grammar-vectors.json` is absent; Task 2 creates it.

| File | Operation | Notes |
|------|-----------|-------|
| C:/Users/User/.claude/skills/apex-code/scripts/engine-plan.ps1 | modify | Parse tagged criteria and emit task, spec, and HOST check plan fields and prompt content. |
| C:/Users/User/.claude/skills/apex-code/scripts/engine-plan-test.ps1 | modify | Exercise binding, refusal, and plan/prompt output. |
| C:/Users/User/.claude/skills/apex-code/scripts/apex-engine.ps1 | modify | Execute checks, route failures, print status and HOST checks, and extend teardown. |
| C:/Users/User/.claude/skills/apex-code/references/engine-state-schema.json | modify | Add optional schema-v1 check and teardown fields. |
| C:/Users/User/.claude/skills/apex-code/scripts/engine-test.ps1 | modify | Cover task/spec gates, retries, status, teardown, and legacy runs. |
| C:/Users/User/.claude/skills/apex-orchestrate/templates/spec-template.md | modify | Document opted-in acceptance fences and authoring rules. |
| C:/Users/User/.claude/skills/apex-code/scripts/apex-spec-validate.ps1 | modify | Refuse tagged blocks with absolute paths or location changes. |
| C:/Users/User/.claude/skills/apex-code/scripts/spec-validate-test.ps1 | modify | Exercise accepted and refused tagged blocks. |
| C:/Users/User/.claude/skills/apex-code/references/spec-contract.md | modify | Bump contract version and document tagged-block rules. |
| C:/Users/User/.claude/skills/apex-code/references/accept-grammar-vectors.json | create | Shared tagged-check grammar corpus for planner and validator tests. |
| C:/Users/User/.claude/skills/apex-code/SKILL.md | modify | HOST close-out text and version bump. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | Add apex-code history row. |
| C:/Users/User/apex/SKILLS.md | modify | Update apex-code version only if this index lists it. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/apex-engine.ps1", "op": "modify" }, { "path": "skills/apex-code/references/engine-state-schema.json", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-test.ps1", "op": "modify" }], "depends_on": ["2"], "effort": "high" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-orchestrate/templates/spec-template.md", "op": "modify" }, { "path": "skills/apex-code/scripts/apex-spec-validate.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/spec-validate-test.ps1", "op": "modify" }, { "path": "skills/apex-code/references/spec-contract.md", "op": "modify" }, { "path": "skills/apex-code/references/accept-grammar-vectors.json", "op": "create" }], "depends_on": [], "effort": "medium" }
  ]
}
```

## Tasks
Shared tagged-check safety grammar for Task 1 and Task 2: inspect PowerShell command tokens, including whole single- or double-quoted argument values after removing their outer quotes; refuse a drive-letter path beginning `X:\` or `X:/` (any letter), a UNC path beginning `\\`, or any token beginning `/`. A quote-delimited regex operand of `-match` or `-notmatch` is a pattern, not a path token. Refuse `cd`, `Set-Location`, and `Push-Location` case-insensitively only as whole command names in command position (start of a statement or after a pipeline/statement operator), including invocation with `&`; incidental words in arguments or strings are accepted. Task 2 creates `accept-grammar-vectors.json` as an array of `{ "text": string, "expected": "accept"|"refuse" }` entries, including relative paths, drive and UNC paths, slash-root paths, single- and double-quoted argument values, quoted regex operands, location commands, and incidental command words in strings/arguments. Both tests load this one file and assert each expected result.

Schema-v1 additions are optional, with `additionalProperties: false` on every added object and every shown key required when its object is present. Each `plan.waves[].tasks[].acceptance_checks[]` and `plan.spec_acceptance_checks[]` item is `{id: string, task: string|null, label: string|null, body: string}`; task-check IDs are `<taskId>-<n>` and spec-level IDs are `spec-<n>`, numbered from 1 in criterion order. `task` is its manifest task ID for a task check and `null` for a spec check; `label` is the verbatim leading criterion label or `null`. `plan.host_checks[]` items are `{label: string|null, text: string}` with verbatim untagged text and label. Each `task.acceptance[]` runtime record is `{id: string, status: pending|running|passed|failed, output_tail: string, child_pid: integer|null, child_start_time: string|null}`. `state.spec_acceptance` is `{status: pending|running|passed|failed, checks: [the same runtime record shape]}`. Runtime records reference plan checks by `id`; `output_tail` is the last 40 combined-output lines joined with `\n` (empty string before output). `attempt.acceptance_output_tail` is a string and `state.teardown.reason` is a string.

- [ ] **Task 1** - In `Get-EnginePlan` and `Get-EngineAcceptanceLines` (`engine-plan.ps1:382-394,626-681,773-825`), scan only `## Acceptance Criteria` for exact-info-string `powershell apex-accept` fences and apply the shared safety grammar above. Bind a tagged block to the immediately preceding criterion only when its leading label matches `^- \[[ xX]\] Task (\d+[a-z]?) -`; bind a tagged block under an unlabelled criterion to spec level; refuse a tagged block under a compound label such as `Task 1 and Task 2`, or a task label whose ID is absent from the execution manifest, including HOST tasks. Emit `plan.waves[].tasks[].acceptance_checks[]`, `plan.spec_acceptance_checks[]`, and `plan.host_checks[]` (verbatim untagged criterion text and verbatim label when present); append each task's tagged checks to `New-EnginePrompt`'s done-when content (`:396-442`). In `apex-engine.ps1`, add a check executor that writes each block verbatim under the run state directory with `$ErrorActionPreference = 'Stop'` prepended, runs each child via `Start-Process` and `WaitForExit` with a 10-minute timeout and integration-root cwd, saves the child PID and start stamp on its running runtime check record before waiting, kills the process tree on expiry, treats only exit 0 as pass, captures combined output, and retains its last 40 lines; a timed-out check fails with a tail ending `timed out after 10 min` (allow a short test-mode timeout override). Extend `Invoke-RunnerGate` (`:964-1005`) to run task checks only when the baseline verify fence passed and only for tasks whose manifest files are in `-Files`, within the same pin/verify/index-identity/residue window; journal each task check's pending/running/passed/failed runtime record on `task.acceptance[]`, referencing its plan check by ID. On Resume, before re-running a recorded running/failed/pending check, kill its recorded child process tree if `Test-RunnerPidLive` (`apex-engine.ps1:570`) finds the PID and start stamp still live; clear its previous tail and child fields before launch. A tagged-check failure returns `gate='accept'`, `code=1`, `failing_task_id`, and `output_tail`. In `Invoke-RunnerWave` (`:1161-1190`), route `failing_task_id` before the single-task and `Find-RunnerWaveFailure` fallbacks; per-task calls from `Find-RunnerWaveFailure` (`:1013-1029`) therefore execute only that task's checks. Set the failed attempt's optional `acceptance_output_tail` and `status='failed'` with `diagnosis='verification failure'` in the same `Save-RunnerState`, preserving `Get-RunnerNextEffort` (`:959-962`, low->medium->high->xhigh) and crash-resume routing (`:1059-1067`). In `Start-RunnerAttempt` (`:610-653`), read `acceptance_output_tail` from the most recent prior `status='failed'` attempt for that task and append it to the dispatch `Prompt`, leaving the frozen plan prompt unchanged. After the final wave commit and before `complete` in `Invoke-RunnerMainLoop` (`:1409-1429`), run spec-level checks once through a post-commit no-stage gate; do not call `Stage-EngineWave`. Pin `engine-<runId>-spec` and record the pre-check HEAD/index identity; run spec-level checks in the integration root without repeating the baseline verify fence, which the final wave gate already passed on that exact tree; verify the tree pin; compare HEAD/index identity before and after; then scan residue using `Get-RunnerAllFiles` plus the final wave's `residue_inventory`. Journal `state.spec_acceptance.status` and its check records before and after execution. Pin, tree/index movement, residue, or check failure sets the check and spec status to `failed` before parking, without restoration. Resume skips `passed` checks and clears the previous tail before re-running every other status; kill any recorded live child process tree first using PID and start stamp. Make `Write-RunnerSummary` (`:1363-1407`) print `plan.host_checks` under `HOST checks:` for complete runs, including complete status output, and use these exact next lines: complete `Next: run HOST checks, review, commit, then -Teardown <runId>.`; parked `Next: inspect the diagnosis, then -Resume <runId> or -Teardown <runId> -Discard.`; partial `Next: inspect failed tasks, then -Resume <runId> or -Teardown <runId> -Discard.`; refused `Next: fix the inputs and start a new run`; torn down `Next: teardown complete; no further action.`; complete-run teardown refusal (`:1773`) `Next: resolve teardown refusal, then retry -Teardown <runId>; after repair use -Discard -Reason <text>.` Replace `<runId>` with the current run ID when printed. In the `apex-engine.ps1` param block add `[string]$Reason`; reject `-Reason` unless both `-Teardown` and `-Discard` are present. In `Invoke-RunnerTeardown` (`:1432-1484`), require a non-empty `-Reason` for complete `-Discard` before any adoption side effect, bypass the hand-off journal check and `Test-EngineTeardownProof` for that case, save `state.teardown.reason`, and retain non-complete discard rules. For every matching ledger row, call `Test-EngineLedgerRowLive` (`engine-dispatch.ps1:385`) and refuse a live row; for each dead non-terminal row call `Invoke-EngineAdopt` (`engine-dispatch.ps1:912-945`) with its `RunId`, the attempt's spec, task, and worktree, `StateRoot`, and a `ChildOutputPath` under the run state directory; re-read the row and refuse if `adopt_timed_out`, adopt exit is non-zero, or the row remains non-terminal. Add only the optional plan/task/attempt (`acceptance_output_tail`)/teardown (`reason`)/run fields shaped above to `engine-state-schema.json`, with `additionalProperties: false` on added objects, retaining `schema_version: 1` and existing required sets. Make `engine-plan-test.ps1` consume `accept-grammar-vectors.json` and cover label-binding/refusal cases; extend `engine-test.ps1` with baseline-fail skip, child `exit`/throw/native-exit, timeout, two-task wave with one failing check and only that task retried, crash-after-verification-failure Resume with tail in next prompt, spec failure/resume/movement/residue, a manifest delete path with a passing post-commit spec check, crash-during-running-check Resume that kills the recorded live child before re-run, summary states, complete discard with main HEAD different from integration tip and missing-reason refusal, dead-row adoption success/timeout and live-row PID refusal, and a legacy state file that Resume and Teardown accept without new fields. - files: `skills/apex-code/scripts/engine-plan.ps1`, `skills/apex-code/scripts/engine-plan-test.ps1`, `skills/apex-code/scripts/apex-engine.ps1`, `skills/apex-code/references/engine-state-schema.json`, `skills/apex-code/scripts/engine-test.ps1` - done when: task checks gate their wave, spec checks gate completion, HOST checks remain visible, teardown handles repaired complete runs and dead-PID adoption, and schema-v1 legacy runs still work.
- [ ] **Task 2** - In the `## Acceptance Criteria` guidance of `spec-template.md`, fix its governing contract pointer (`:32`) to `~/.claude/skills/apex-code/references/spec-contract.md`; describe exact `powershell apex-accept` fence spelling, integration-root cwd, immediately preceding leading task-label binding versus spec-level binding, refusal of compound/unknown task labels, and throw-on-failure including explicit `$LASTEXITCODE` tests for native commands. State that tagged checks are trusted author-written, Critic-reviewed, owner-promoted spec content, run unsandboxed with the same trust as the `AGENTS.md` verify fence; the grammar guards accidents rather than confines execution, and tree/index movement or residue parks the run without restoration. In `apex-spec-validate.ps1`, bump `$SpecContractVersion` from `1.1.0` to `1.2.0`; in its fence scanner and section records (`:360-390`, `:690-765`), identify only tagged blocks under Acceptance Criteria, apply the shared safety grammar above, validate the leading label against execution-manifest task IDs, and add failing findings for a prohibited token or location command, compound task label, or unknown task ID including HOST tasks; keep untagged content and other sections out of these checks. Create `accept-grammar-vectors.json` with the array shape and vectors defined above. In `spec-validate-test.ps1`, extend the existing fixture/`Assert-Case` pattern (`:184-227,368-420`) to load that corpus and assert every expected result, plus exact tag and section-scope cases, compound/unknown task labels (including HOST tasks), an unlabelled spec-level block, and identical prohibited text in an untagged block. In `spec-contract.md`, bump the `Contract version` line to `1.2.0` and document the exact tagged-block grammar, binding, section scope, and refusal findings. Run its `## Changing the contract` corpus procedure (`:123-167`): hermetic and ordinary corpus test, report-only corpus sweep, inspect every result, then report-only sweep for each live repository root; the new validator rule affects only `powershell apex-accept` fences under Acceptance Criteria, which no corpus spec contains, so every corpus outcome must remain unchanged and match the unchanged `expected.tsv` in `fixtures/spec-corpus/`; fix unintended regressions without changing corpus expectations. - files: `skills/apex-orchestrate/templates/spec-template.md`, `skills/apex-code/scripts/apex-spec-validate.ps1`, `skills/apex-code/scripts/spec-validate-test.ps1`, `skills/apex-code/references/spec-contract.md`, `skills/apex-code/references/accept-grammar-vectors.json` - done when: authors have executable-block rules, the validator fails prohibited tagged content only, and corpus sweeps report no unexplained failures.
- [ ] **Task 3 (HOST)** - In `apex-code/SKILL.md:69-73,300,392`, update Engine close-out text so HOST runs printed `HOST checks:` after a complete run and, after committing repaired content, uses complete-run `-Teardown <runId> -Discard -Reason <text>`; bump `version: 2.22.0` to `2.23.0`. Prepend one corresponding apex-code row to `SKILL-HISTORY.md` and update the apex-code entry in `SKILLS.md` only if it carries a version; the live row at `SKILLS.md:32` currently has none. - files: `skills/apex-code/SKILL.md`, `C:/Users/User/apex/SKILL-HISTORY.md`, `C:/Users/User/apex/SKILLS.md` - done when: close-out and version/history/index reflect the new Engine gate.

## Wave plan
Wave 1: [2] | Wave 2: [1] | Wave 3 (HOST): [3].

## Permissions
Coder tasks may edit only their own listed files, run the full verify fence, and run their task-specific tests and contract sweep. Task 1 reads Task 2's shared grammar corpus after Wave 1. No coder git operations or package installation. HOST performs Task 3, integration, the separate `engine-accept-smoke` planning/live run, and close-out.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1, skills/apex-code/scripts/apex-engine.ps1, skills/apex-code/references/engine-state-schema.json, skills/apex-code/scripts/engine-test.ps1 |
| Modify (coder Task 2) | skills/apex-orchestrate/templates/spec-template.md, skills/apex-code/scripts/apex-spec-validate.ps1, skills/apex-code/scripts/spec-validate-test.ps1, skills/apex-code/references/spec-contract.md |
| Create (coder Task 2) | skills/apex-code/references/accept-grammar-vectors.json |
| Modify (HOST Task 3) | skills/apex-code/SKILL.md, C:/Users/User/apex/SKILL-HISTORY.md, C:/Users/User/apex/SKILLS.md |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` | Planner cases. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1` | Validator cases. |
| `$sweepScript = Join-Path 'skills/apex-code/scripts' 'spec-contract-sweep.ps1'` | Resolve the unchanged sweep helper from the build repo root. |
| `powershell.exe -NoProfile -File $sweepScript -Root skills/apex-code/scripts/fixtures/spec-corpus` | Report-only contract corpus sweep; inspect each result. |
| `powershell.exe -NoProfile -File $sweepScript -Root C:/Users/User/.claude` | Report-only live build-repo spec sweep; repeat for every other live repository root. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` | Engine cases; run last and alone. |
| Build repo `AGENTS.md` Verify commands fence below | Run all 14 commands; `engine-test.ps1` last and alone. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | Coder performs no git operations; HOST integrates and commits. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No added variable. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package or network operation. |

## Specialist Context
### Performance
Run `engine-test.ps1` last and alone; it is long-running.

### Security
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Template | skills/apex-orchestrate/templates/spec-template.md | Add acceptance authoring rules. |
| Contract | skills/apex-code/references/spec-contract.md | Bump version and add tagged-block rule. |
| Corpus | skills/apex-code/references/accept-grammar-vectors.json | Create shared grammar vectors. |
| Skill | skills/apex-code/SKILL.md | Update HOST close-out. |
| History | C:/Users/User/apex/SKILL-HISTORY.md | Add row. |
| Index | C:/Users/User/apex/SKILLS.md | Update version if present. |

## Acceptance Criteria
- [ ] Task 1 - planner binds only exact tagged blocks and retains every untagged criterion -> verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` asserts task and spec check arrays, verbatim `host_checks` text and leading labels, done-when prompt content, refusal of compound labels and unknown manifest IDs including HOST tasks, and spec-level binding under an unlabelled criterion.
- [ ] Task 1 - planner consumes the shared tagged-check grammar corpus -> verify: `engine-plan-test.ps1` loads `accept-grammar-vectors.json` and asserts every expected result, including quoted-string handling.
- [ ] Task 1 - task checks run only after a passing baseline and only for tasks selected by `-Files` -> verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` asserts baseline failure skips checks and each `Find-RunnerWaveFailure` per-task gate runs only that task's checks.
- [ ] Task 1 - tagged-check failure returns `gate='accept'`, `code=1`, `failing_task_id`, and `output_tail` -> verify: `engine-test.ps1` asserts `Invoke-RunnerWave` uses the ID before single-task or `Find-RunnerWaveFailure` fallback, and in a two-task wave only the task with a failing check retries.
- [ ] Task 1 - the check child is bounded and cannot terminate the Engine -> verify: `engine-test.ps1` asserts exit 0/throw/exit N/native-exit handling, combined last-40-line tail, tree/index movement detection, and a short test-mode timeout override that kills the process tree and leaves a failed tail ending `timed out after 10 min`.
- [ ] Task 1 - a crashed running check leaves no orphaned child on Resume -> verify: `engine-test.ps1` crashes during a running check, confirms saved `child_pid` and `child_start_time` before the wait, then Resume kills that live process tree using PID plus start stamp before re-running the check.
- [ ] Task 1 - failed-attempt tail survives a crash and reaches only the next dispatch prompt -> verify: `engine-test.ps1` asserts `acceptance_output_tail` is saved with failed status and exact diagnosis `verification failure`, `Get-RunnerNextEffort` follows low->medium->high->xhigh, and crash-after-verification-failure Resume appends the most recent prior failed attempt's tail without changing the frozen plan prompt.
- [ ] Task 1 - spec checks gate completion and survive Resume -> verify: `engine-test.ps1` asserts post-commit no-stage order: `engine-<runId>-spec` pin with pre-check HEAD/index identity, spec-level checks without a second baseline verify fence, tree-pin verify, compare pre/post HEAD/index identity, and residue using `Get-RunnerAllFiles` plus final-wave inventory; durable pending/running/passed/failed records, failed status before parking for pin/movement/residue/check failure, passed skip, and re-run of every other status with previous tail cleared.
- [ ] Task 1 - post-commit spec checks accept manifest deletes -> verify: `engine-test.ps1` completes a spec whose manifest includes a delete path absent after the final commit and records a passing spec-level check without calling `Stage-EngineWave` in that window.
- [ ] Task 1 - summaries cover complete, parked, partial, refused, torn-down, and complete-run teardown-refusal paths -> verify: `engine-test.ps1` asserts the exact `Next:` lines defined in Task 1, `HOST checks:` in complete console and status output, and explicit refused and torn-down summary cases.
- [ ] Task 1 - complete-run discard and ledger adoption follow their ordered guards -> verify: `engine-test.ps1` asserts `-Reason` rejects use without `-Teardown -Discard`, missing/blank complete-run reason refuses before adoption, complete discard journals the reason and bypasses hand-off journal/proof with main HEAD different from integration tip, dead row adoption then teardown, adopt timeout/non-zero/still-non-terminal refusal, and live row PID refusal.
- [ ] Task 1 - schema version 1 accepts new and legacy runs -> verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1` validates the exact optional plan/runtime/attempt/teardown shapes above with `additionalProperties: false` on added objects and a legacy state lacking all of them, then Resume and Teardown that legacy state.
- [ ] Task 2 - validator consumes the shared tagged-check grammar corpus -> verify: `spec-validate-test.ps1` loads `accept-grammar-vectors.json` and asserts every expected result, including quoted-string handling.
- [ ] Task 2 - authoring template and validator enforce tagged-block safety and labels -> verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1` covers exact tag, section scope, compound and unknown/HOST task labels, unlabelled spec-level blocks, untagged equivalent content, and template wording for trust/cwd/binding/throw/`$LASTEXITCODE` and the absolute contract pointer.
- [ ] Task 2 - contract version and corpus sweep pass -> verify: validator `$SpecContractVersion` and `spec-contract.md` both read `1.2.0`; follow `spec-contract.md:123-167`, inspect every report-only corpus and each live-repository sweep result, assert `expected.tsv` in `fixtures/spec-corpus/` is unchanged and every corpus outcome matches it, and record no unexplained live-repository failure.
- [ ] Task 3 - HOST close-out and history are current -> verify: `rg -n -F -e 'HOST checks:' -e '-Discard -Reason' -e 'version: 2.23.0' C:/Users/User/.claude/skills/apex-code/SKILL.md` and `rg -n -F 'engine-acceptance-gate' C:/Users/User/apex/SKILL-HISTORY.md` show the close-out text, version, and row; HOST inspects `C:/Users/User/apex/SKILLS.md:32` and updates it only if a version is listed.
- [ ] Task 1 and Task 2 - the complete build-repo Verify commands fence exits 0 -> verify: run this PowerShell block from the build repo, with `engine-test.ps1` last and alone; all 14 lines are copied verbatim from its `AGENTS.md` fence.

```powershell
Set-Location C:/Users/User/.claude
$checks = @(
    'node --check hooks/destructive-command-guard.js'
    'node --check hooks/lib/destructive-detect.js'
    'python hooks/destructive-guard-test.py'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1'
    'powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1'
)
if ($checks.Count -ne 14) { throw 'Verify fence command count changed' }
foreach ($check in $checks) {
    Invoke-Expression $check
    if ($LASTEXITCODE -ne 0) { throw "Verify failed ($LASTEXITCODE): $check" }
}
```

- [ ] Scope - only the thirteen listed files change -> verify: HOST compares the pre-build dirty-path baseline with `git status --porcelain -uall` after build and reports pre-existing unrelated paths.
- [ ] Reachability - after this spec is committed, the live Engine executes the separately planned Low-risk `engine-accept-smoke` spec -> verify: HOST plans and promotes it through `apex-plan` outside this spec's file scope with one task-labelled `powershell apex-accept` block and one untagged criterion, runs it on the live Engine, inspects engine-state for the passed task check and console for the criterion under `HOST checks:`, then closes it out normally and tears it down.

## Progress
_(The build writes here - do not edit manually)_
