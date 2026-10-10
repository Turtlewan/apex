---
spec: coder-default-gpt61
status: draft
autonomy_level: L2
risk: low
coder_effort: medium
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Default coder and read-only reviewer to gpt-6.1-sol
<!-- Governing contract: C:/Users/User/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Set the Engine and wrapper defaults to gpt-6.1-sol and align current APEX routing prose.

## Intent
- **Intent:** Builds without an explicit model and wrapper-based cold reads/reviews use gpt-6.1-sol.
- **Invariants:** `codex` resolves to gpt-6.1-sol; an explicit gpt-5.6-sol pin remains accepted. The author model stays explicitly gpt-6-sol and the Scribe model stays explicitly gpt-6-luna.
- **Non-goals:** Effort defaults, allowlists/enums/ValidateSet, explicit-pin fixtures, the dispatch-guard command fixtures, the parked ensemble design, and ADRs other than ADR-034.

## Assumptions
- The live anchors and test cases named below remain at their recorded lines. -> impact: Stop.
- OWNER can read and edit the protected session-context hook; its supplied line 33 could not be read by this spec author. -> impact: Stop.

Simplicity check: Four task owners cover two independent runtime defaults, current routing prose, and the protected hook.

## Prerequisites
- Specs that must be complete first: none.
- Environment: PowerShell 5.1; build repo `C:/Users/User/.claude`; attended HOST and OWNER for Tasks 3 and 4.

## Files to Change
Grep evidence: `rg --hidden --no-ignore -n -F 'gpt-5.6-sol'` over the live `skills`, `agents`, and `hooks` trees, excluding `skills/apex-code/scripts/fixtures/spec-corpus/**`, returned **49 readable matching lines**. `hooks/apex-session-context.md` returned access denied, so its owner-supplied line 33 is recorded separately and OWNER must grep that file before editing. The 49 readable lines classify as follows: **T1** `engine-plan.ps1:77,595,603` and `engine-plan-test.ps1:536,539` (5); **T2** `codex-dispatch.ps1:19` and `dispatch-author-test.ps1:680,692,693,696` (5); **T3** `skills/apex-code/SKILL.md:21,403`, `references/afk-endgate.md:7`, `codex-observability.md:51`, `codex-review.md:4,60`, `skills/apex-init/SKILL.md:157`, `skills/apex-orchestrate/SKILL.md:84`, `skills/apex-plan/SKILL.md:109,377`, `references/design-workflow.md:159`, `model-routing.md:64,75`, `sol-plan-check.md:5`, `skills/apex-skill-author/references/agents-skills-projection.md:56`, and `agents/apex-coder.md:8` (16). **Deliberately kept:** `engine-plan.ps1:598` and `codex-dispatch.ps1:18` allowlists (2); `references/engine-state-schema.json:185,224,308` enums (3); explicit-pin fixtures `engine-dispatch-test.ps1:40,137,205,685` and `engine-test.ps1:195,289,577,1606,1655,2175,2424` (11); `hooks/codex-dispatch-guard.test.js:24,28,32,36,69` command strings (5); parked `skills/apex-code/REVIEW-ENSEMBLE-DESIGN.md:13,26` (2). **T4:** protected `hooks/apex-session-context.md:33` (owner-supplied anchor, unreadable here). The readable categories total 49.

Grep evidence for coder test scope: `rg -n -F 'gpt-5.6-sol'` returned 0 in each of `dispatch-test.ps1`, `dispatch-preflight-test.ps1`, `dispatch-events-test.ps1`, and `scope-check-test.ps1`; 4 in `engine-dispatch-test.ps1`; 7 in `engine-test.ps1`. `rg -n -i -e 'default.*model' -e 'model.*default' -e 'gpt-5.6-sol'` over those six suites returned the same 11 lines, all in explicit-model fixtures. Focused live searches returned `engine-plan.ps1` / `CoderModel` = 3, `engine-plan.ps1` / `pinned model defaults and allowlist` = 0, `engine-plan-test.ps1` / `pinned model defaults and allowlist` = 1, `codex-dispatch.ps1` / `gpt-5.6-sol` = 2, `dispatch-author-test.ps1` / `author-default-model-argv` = 4, and `dispatch-author-test.ps1` / `gpt-5.6-sol` = 4. `rg -n -F 'gpt-5.6-sol'` over the APEX index, changelog, and ADR-034 returned 5 lines: `SKILLS.md:13` and `CHANGELOG.md:12` to T3; `ADR-034:15,30,64` retained as historical text below the new amendment.

| File | Operation | Notes |
|------|-----------|-------|
| C:/Users/User/.claude/skills/apex-code/scripts/engine-plan.ps1 | modify | T1: default and `codex` alias. |
| C:/Users/User/.claude/skills/apex-code/scripts/engine-plan-test.ps1 | modify | T1: default, alias, explicit-pin case. |
| C:/Users/User/.claude/skills/apex-code/scripts/codex-dispatch.ps1 | modify | T2: wrapper default. |
| C:/Users/User/.claude/skills/apex-code/scripts/dispatch-author-test.ps1 | modify | T2: default argv and ledger. |
| C:/Users/User/.claude/skills/apex-code/SKILL.md | modify | T3: coder prose and skill metadata. |
| C:/Users/User/.claude/skills/apex-code/references/afk-endgate.md | modify | T3: default coder prose. |
| C:/Users/User/.claude/skills/apex-code/references/codex-observability.md | modify | T3: coder prose. |
| C:/Users/User/.claude/skills/apex-code/references/codex-review.md | modify | T3: reviewer prose and wrapper-default recipe. |
| C:/Users/User/.claude/skills/apex-init/SKILL.md | modify | T3: coder prose and skill metadata. |
| C:/Users/User/.claude/skills/apex-orchestrate/SKILL.md | modify | T3: coder prose and skill metadata. |
| C:/Users/User/.claude/skills/apex-plan/SKILL.md | modify | T3: cold-read prose and skill metadata. |
| C:/Users/User/.claude/skills/apex-plan/references/design-workflow.md | modify | T3: coder prose. |
| C:/Users/User/.claude/skills/apex-plan/references/model-routing.md | modify | T3: coder prose. |
| C:/Users/User/.claude/skills/apex-plan/references/sol-plan-check.md | modify | T3: cold-read prose. |
| C:/Users/User/.claude/skills/apex-skill-author/SKILL.md | modify | T3: skill metadata. |
| C:/Users/User/.claude/skills/apex-skill-author/references/agents-skills-projection.md | modify | T3: probe model command. |
| C:/Users/User/.claude/agents/apex-coder.md | modify | T3: default coder prose. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | T3: five skill rows. |
| C:/Users/User/apex/SKILLS.md | modify | T3: current coder statement. |
| C:/Users/User/apex/docs/technical/adr/ADR-034-sol-default-coder.md | modify | T3: dated amendment at top. |
| C:/Users/User/apex/CHANGELOG.md | modify | T3: current change bullet and cold-read statement. |
| C:/Users/User/.claude/hooks/apex-session-context.md | modify | T4: OWNER-only Coder row. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-plan.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/engine-plan-test.ps1", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/codex-dispatch.ps1", "op": "modify" }, { "path": "skills/apex-code/scripts/dispatch-author-test.ps1", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
- [ ] **Task 1** - In `engine-plan.ps1:77`, change `New-EnginePlanSpec`'s `[string]$CoderModel` default to `'gpt-6.1-sol'`; at `:595`, change the absent-frontmatter `$model` initialization to `'gpt-6.1-sol'`; at `:602-603`, map the `codex` alias to `'gpt-6.1-sol'`. Preserve the `:598` allowlist and explicit-model branch. In `engine-plan-test.ps1:530-540` case `pinned model defaults and allowlist`, expect `'gpt-6.1-sol'` for `$default` and `$alias`; add `CoderModel = 'gpt-5.6-sol'` as an explicit-pin fixture and assert `allowed` plus recorded `spec.coder_model -ceq 'gpt-5.6-sol'`. - files: `skills/apex-code/scripts/engine-plan.ps1`, `skills/apex-code/scripts/engine-plan-test.ps1` - done when: default and alias resolve to 6.1 and the explicit 5.6 pin remains accepted.
- [ ] **Task 2** - In `codex-dispatch.ps1:19`, set `[string]$Model = 'gpt-6.1-sol'`; leave `:18` ValidateSet untouched. In `dispatch-author-test.ps1:680-700` case `author-default-model-argv`, update the comment, `Test-ArgvModel -ExpectedModel`, detail, and ledger `row.model` expectation to `'gpt-6.1-sol'`. Recheck the six suites named in Grep evidence for wrapper/Engine **default** assertions and add any newly found dependent suite to this task and Files to Change before build. - files: `skills/apex-code/scripts/codex-dispatch.ps1`, `skills/apex-code/scripts/dispatch-author-test.ps1` - done when: omitted -Model reaches 6.1 in argv and ledger, while ValidateSet still accepts 5.6.
- [ ] **Task 3 (HOST)** - Sweep the current prose at `skills/apex-code/SKILL.md:21,403`, `references/afk-endgate.md:7`, `codex-observability.md:51`, `codex-review.md:4,60`, `skills/apex-init/SKILL.md:157`, `skills/apex-orchestrate/SKILL.md:84`, `skills/apex-plan/SKILL.md:109,377`, `references/design-workflow.md:159`, `model-routing.md:64,75`, `sol-plan-check.md:5`, `skills/apex-skill-author/references/agents-skills-projection.md:56`, `agents/apex-coder.md:8`, `SKILLS.md:13`, and `CHANGELOG.md:12`: name gpt-6.1-sol as the default coder and wrapper-based cold-read/review model. Every retained mention of `gpt-5.6-sol` in the swept skill, agent, and index files must say on that line that it is an explicit (allowed) pin; it must not call 5.6 the default, the coder default, or the cold-read/review model. In `skills/apex-code/SKILL.md:403-404`, set the wrapper `-Model` list to `gpt-6.1-sol` (the default), `gpt-5.6-sol` (explicit pin), `gpt-6-sol`, and `gpt-6-luna`, with the default claim attached to gpt-6.1-sol. In `codex-review.md:60`, replace the stale model pin claim with wording that the wrapper default is gpt-6.1-sol and an explicit `-Model` may pin another allowed model; leave its invocation without `-Model`. At `CHANGELOG.md:12`, correct only the cold-read sentence in place so it says the cold read uses gpt-6.1-sol via the wrapper default; leave the rest of that bullet untouched. Apply the apex-skill-author lightweight structural-edit process: bump each touched skill's `version` and `last_updated` (`apex-code:2.23.0`, `apex-init:1.7.3`, `apex-orchestrate:2.5.0`, `apex-plan:2.8.0`, `apex-skill-author:2.0.3` currently), keep `apex-code/SKILL.md` and `apex-plan/SKILL.md` net-neutral or shorter and every SKILL.md at most 500 lines, and prepend one dated `SKILL-HISTORY.md` row per skill. In `ADR-034-sol-default-coder.md`, insert a 2026-10-09 amendment above `## Context` stating the default coder and wrapper-based reviewer are now gpt-6.1-sol and 5.6 remains an explicit pin; preserve the historical body. Add a separate current `CHANGELOG.md` bullet. - files: `C:/Users/User/.claude/skills/apex-code/SKILL.md`, `C:/Users/User/.claude/skills/apex-code/references/afk-endgate.md`, `C:/Users/User/.claude/skills/apex-code/references/codex-observability.md`, `C:/Users/User/.claude/skills/apex-code/references/codex-review.md`, `C:/Users/User/.claude/skills/apex-init/SKILL.md`, `C:/Users/User/.claude/skills/apex-orchestrate/SKILL.md`, `C:/Users/User/.claude/skills/apex-plan/SKILL.md`, `C:/Users/User/.claude/skills/apex-plan/references/design-workflow.md`, `C:/Users/User/.claude/skills/apex-plan/references/model-routing.md`, `C:/Users/User/.claude/skills/apex-plan/references/sol-plan-check.md`, `C:/Users/User/.claude/skills/apex-skill-author/SKILL.md`, `C:/Users/User/.claude/skills/apex-skill-author/references/agents-skills-projection.md`, `C:/Users/User/.claude/agents/apex-coder.md`, `C:/Users/User/apex/SKILL-HISTORY.md`, `C:/Users/User/apex/SKILLS.md`, `C:/Users/User/apex/docs/technical/adr/ADR-034-sol-default-coder.md`, `C:/Users/User/apex/CHANGELOG.md` - done when: all current routing prose, metadata, history, index, ADR amendment, and changelog agree.
- [ ] **Task 4 (OWNER)** - Grep the protected hook for every `gpt-5.6-sol` occurrence, then at `hooks/apex-session-context.md:33` change the Coder row to gpt-6.1-sol; change any other live default-coder or cold-read/review statement found in that same file, while retaining unrelated explicit-pin and historical references. - files: `C:/Users/User/.claude/hooks/apex-session-context.md` - done when: the current hook routing table names gpt-6.1-sol.

## Wave plan
Wave 1: [1, 2] | Wave 2 (HOST): [3] | OWNER: [4].

## Permissions
Coders edit only their own task's files, run the verify fence, perform no git operations, and install no packages. HOST performs Task 3. OWNER performs Task 4. The protected hook requires the OWNER path.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder 1) | skills/apex-code/scripts/engine-plan.ps1, skills/apex-code/scripts/engine-plan-test.ps1 |
| Modify (coder 2) | skills/apex-code/scripts/codex-dispatch.ps1, skills/apex-code/scripts/dispatch-author-test.ps1 |
| Modify (HOST 3) | Task 3's `files:` list only |
| Modify (OWNER 4) | Task 4's `files:` list only |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1` | Task 1 cases. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1` | Task 2 cases. |
| Build repo `AGENTS.md` Verify commands fence below | Run all 14 commands; `engine-test.ps1` last. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | Coders perform no git operations. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No added variable. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package or network operation. |

## Specialist Context
### Security
(none)

### Performance
Run `engine-test.ps1` last and alone in the verify fence.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Current routing | Task 3's skill, reference, agent, and index files | Update prose and skill metadata. |
| History | SKILL-HISTORY.md | Prepend five rows. |
| ADR | docs/technical/adr/ADR-034-sol-default-coder.md | Add dated amendment. |
| Changelog | CHANGELOG.md | Add current bullet and update current cold-read line. |
| Owner hook | Task 4's file | Update Coder row. |

## Acceptance Criteria
- [ ] Task 1 - Engine default and `codex` alias resolve to gpt-6.1-sol, and an explicit gpt-5.6-sol pin remains accepted
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-plan-test failed' }
```
- [ ] Task 2 - Wrapper default argv and ledger use gpt-6.1-sol
```powershell apex-accept
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'dispatch-author-test failed' }
```
- [ ] The planner has no old default assignments and the wrapper has exactly one gpt-6.1-sol default declaration
```powershell apex-accept
$old = @(Select-String -Path 'skills/apex-code/scripts/engine-plan.ps1' -SimpleMatch -Pattern "= 'gpt-5.6-sol'")
$new = @(Select-String -Path 'skills/apex-code/scripts/codex-dispatch.ps1' -SimpleMatch -Pattern "[string]`$Model = 'gpt-6.1-sol'")
if ($old.Count -ne 0) { throw 'engine-plan retains a 5.6 default assignment' }
if ($new.Count -ne 1) { throw 'wrapper 6.1 default declaration count is not 1' }
```
- [ ] HOST Task 3 current prose has no remaining gpt-5.6-sol default-coder or cold-read/review model claims; historical ADR and skill-history entries remain
```powershell
$paths = @(
  'skills/apex-code/SKILL.md',
  'skills/apex-code/references/afk-endgate.md',
  'skills/apex-code/references/codex-observability.md',
  'skills/apex-code/references/codex-review.md',
  'skills/apex-init/SKILL.md',
  'skills/apex-orchestrate/SKILL.md',
  'skills/apex-plan/SKILL.md',
  'skills/apex-plan/references/design-workflow.md',
  'skills/apex-plan/references/model-routing.md',
  'skills/apex-plan/references/sol-plan-check.md',
  'skills/apex-skill-author/references/agents-skills-projection.md',
  'agents/apex-coder.md',
  'C:/Users/User/apex/SKILLS.md'
)
$bad = @($paths | ForEach-Object { Select-String -Path $_ -Pattern '(?i)(gpt-5\.6-sol.{0,100}(default|coder|cold.read|review)|(?:default|coder|cold.read|review).{0,100}gpt-5\.6-sol|-m gpt-5\.6-sol)' } | Where-Object { $_.Line -notmatch '(?i)\bexplicit\b' })
if ($bad.Count -ne 0) { throw 'current skill or agent prose retains a 5.6 default or review claim' }
```
- [ ] The complete build-repo Verify commands fence passes with `engine-test.ps1` last
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
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```
- [ ] Task 4 - OWNER confirms the protected hook Coder row names gpt-6.1-sol and records the hook grep result in the close-out report.

## Progress
_(The build writes here - do not edit manually)_
