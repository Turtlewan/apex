---
spec: engine-event-schema
status: draft
autonomy_level: L2
risk: medium
coder_effort: high
max_parallel_codex: 1
---

# Spec: Engine event schema
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Give Engine dispatch events an independent schema and retarget the live event validators before the Engine cutover.

## Intent
- **Intent:** Preserve the `dispatch_result` and `refusal` event contract when the orchestrator protocol file is removed by the later cutover.
- **Invariants:** The extracted schema definitions are unchanged, including every refusal conditional and required set. Engine and producer tests load the new file. The Engine validator newly enforces the schema's own conditionals after its existing hard-coded `run_id`/`rule` checks; the intended behaviour change is rejection of a null-exit refusal whose `rule` is outside the schema enum. The old protocol file and Engine state schema remain untouched.
- **Non-goals:** No orchestrator deletion, agent or skill routing change, event payload change, or Engine state migration.

## Assumptions
- `C:/Users/User/.claude` is the live build repo; re-read working-tree files at build time and preserve its staged and unstaged changes. No HEAD pin applies. → impact: Stop.
- `orchestrator-protocol-schema.json` currently has self-contained `dispatch_result` and `refusal` definitions with zero `$ref` entries; recheck before extraction and include any referenced `$defs` found at build time. → impact: Stop.
- PowerShell 5.1 and the existing test harness dependencies in the build-repo `AGENTS.md` verify fence are available. New test logic uses PowerShell only. → impact: Stop.

Simplicity check: extract the two definitions once, retarget the two live loaders, and extend the existing Engine wrapper test.

## Prerequisites
- Specs that must be complete first: `dispatch-pipeline-fixes` and `engine-core` functionality present in the live build tree. `engine-build-outputs`, `engine-recipe-parity`, `scribe-stage3`, and `wrapper-model-luna` may be staged concurrently; use their live files.
- Environment setup required: run from `C:/Users/User/.claude`; preserve its existing dirty state and use the test suites' temporary fixtures.

## Files to Change
Grep evidence (live working tree, 2026-10-06): PowerShell `Get-ChildItem C:/Users/User/.claude/skills -Recurse -File -Include *.ps1,*.md,*.json | Select-String 'orchestrator-protocol-schema\.json'` finds the only script loaders at `skills/apex-code/scripts/engine-dispatch.ps1:5` and `skills/apex-code/scripts/dispatch-events-test.ps1:9`; `skills/apex-code/SKILL.md:61,65,281` and `agents/apex-build-orchestrator.md:47,846` contain orchestrator prose pointers deferred to the cutover, not event-file loads. No `hooks/` file references the schema. `Select-String` finds Engine validation at `engine-dispatch.ps1:444-571,702-741`, producer schema checks at `dispatch-events-test.ps1:181-219,533-568`, and real-wrapper event production and mutation at `engine-dispatch-test.ps1:109-163,654-698`. The source definitions occupy `orchestrator-protocol-schema.json:7-59,61-104`; the `refusal` definition contains six `allOf` conditionals at `:78-103`; parsing those two `$defs` finds zero `$ref` entries. Neither validator resolves `$ref`; top-level `$defs` in the split file resolve through direct definition selection. The dated apex-code history rows begin at `C:/Users/User/apex/SKILL-HISTORY.md:5`.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/references/engine-event-schema.json | create | Standalone schema with exact live event definitions and referenced definitions, if any. |
| skills/apex-code/scripts/engine-dispatch.ps1 | modify | Load new schema; apply its refusal conditionals. |
| skills/apex-code/scripts/dispatch-events-test.ps1 | modify | Load new schema for producer fixture validation. |
| skills/apex-code/scripts/engine-dispatch-test.ps1 | modify | Assert real-wrapper event validation through the new schema and conditional rejection. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST: dated apex-code row. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/references/engine-event-schema.json", "op": "create" }], "depends_on": [], "effort": "high" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-dispatch.ps1", "op": "modify" }], "depends_on": ["1"], "effort": "high" },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/dispatch-events-test.ps1", "op": "modify" }], "depends_on": ["1"], "effort": "low" },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-code/scripts/engine-dispatch-test.ps1", "op": "modify" }], "depends_on": ["2"], "effort": "medium" }
  ]
}
```

## Tasks
- [ ] **Task 1** - Extract the event contract: create a Draft 2020-12 JSON Schema with its own `$id` (`apex://engine-event-schema`), event-specific title, and `$defs.dispatch_result` and `$defs.refusal` copied without narrowing or widening any keyword, required set, nested object, or `allOf` condition from the live `orchestrator-protocol-schema.json:7-104`. Copy any transitively referenced `$defs`; none are present in the current live definitions. Do not include `wave_plan`, `adjudication`, or `build_state`; do not edit the source file. — files: skills/apex-code/references/engine-event-schema.json — done when: both extracted definitions are structurally equal to their live source definitions and the new file parses independently.
- [ ] **Task 2** - FIRST repair the `Test-EngineSchemaNode` required-field loop at `engine-dispatch.ps1:495-496`: when a schema node has no `required` property, use an empty list instead of wrapping a null value; never iterate a null or call `Test-EngineHasProperty` with an empty `Name`. Every refusal `then` branch omits `required`, so the conditional pass must accept valid exit-74 refusals under `$ErrorActionPreference = 'Stop'`. Then retarget the Engine event loader at `engine-dispatch.ps1:4-5,539-571` to `engine-event-schema.json`; after the base-node check and the existing per-exit hard-coded `run_id`/`rule` checks at `:553-569`, run a generic pass over every `refusal.allOf` branch. Keep those checks untouched with their exact diagnostics, including `null run_id` asserted by `engine-dispatch-test.ps1:697`, and keep the existing event/context correlation. Reuse `Test-EngineSchemaNode` for each `if` (the condition matches when it returns true) and for its matching `then` or `else`; enforce the null-exit `rule` enum. — files: skills/apex-code/scripts/engine-dispatch.ps1 — done when: Engine accepts valid event kinds, a valid exit-74 refusal whose matching `then` has no `required`, and a null-exit refusal with a valid `rule` through the new schema, and rejects conditional violations, including an invalid null-exit `rule`.
- [ ] **Task 3** - Retarget the producer fixture loader at `dispatch-events-test.ps1:9,181-219` to `engine-event-schema.json`; retain its matrix of wrapper-backed events and the malformed `run_id` conditional rejection at `:533-568`. — files: skills/apex-code/scripts/dispatch-events-test.ps1 — done when: the suite exits 0 against the new file and no test loader reads the old protocol path.
- [ ] **Task 4** - Extend `engine-dispatch-test.ps1:654-698` with a case that reads a fresh `.event.json` emitted by the real `codex-dispatch.ps1` wrapper, compares `$script:EngineDispatchSchemaPath` to the resolved `references\engine-event-schema.json` path, and calls `Test-EngineSchemaDefinition` on that loaded `dispatch_result` or `refusal`. Add `Assert-EngineCase 'valid exit-74 refusal without then required accepted'`: under `$ErrorActionPreference = 'Stop'`, validate a wrapper-produced exit-74 refusal whose matching `then` has no `required` and assert acceptance. Add `Assert-EngineCase 'valid null-exit refusal rule accepted'`: validate a wrapper-produced refusal mutated to `exit_code = null` with a valid `rule` and assert acceptance. Add a mutation of a wrapper-produced refusal with `exit_code = null` and an invalid `rule`; assert rejection by the schema-driven conditional. Keep the existing wrapper dispatch/refusal coverage. — files: skills/apex-code/scripts/engine-dispatch-test.ps1 — done when: `Assert-EngineCase 'real wrapper event uses engine event schema'`, `Assert-EngineCase 'valid exit-74 refusal without then required accepted'`, `Assert-EngineCase 'valid null-exit refusal rule accepted'`, and `Assert-EngineCase 'invalid null-exit refusal rule rejected'` all pass with the suite.
- [ ] **Task 5 (HOST)** - Add one dated apex-code row for `engine-event-schema`, naming the four build-repo paths, after coder verification. — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: one 2026-10-06 row records the schema extraction, consumer retargets, and tests.

## Wave plan
Wave 1: [task 1] | Wave 2: [task 2] | Wave 3: [task 3] | Wave 4: [task 4]. `max_parallel_codex: 1`; manifest dependencies are authoritative. HOST task 5 follows coder verification outside the manifest.

## Permissions

The listed build actions are authorized. HOST writes the APEX history row after coder verification. Preserve pre-existing dirty files. Do not mutate the live Git index or commit, push, checkout, reset, or stash.

### File Operations
| Action | Paths |
|--------|-------|
| Create | `C:/Users/User/.claude/skills/apex-code/references/engine-event-schema.json` |
| Modify | `C:/Users/User/.claude/skills/apex-code/scripts/engine-dispatch.ps1`, `C:/Users/User/.claude/skills/apex-code/scripts/dispatch-events-test.ps1`, `C:/Users/User/.claude/skills/apex-code/scripts/engine-dispatch-test.ps1` |
| HOST modify | `C:/Users/User/apex/SKILL-HISTORY.md` |
| Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1` | Producer event matrix. |
| `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1` | Engine real-wrapper and conditional coverage. |
| PowerShell `Get-Content -Raw`, `ConvertFrom-Json`, `ConvertTo-Json -Depth 100`, and `Select-String` | Compare event definitions and inspect live consumers. |
| PowerShell `Test-Path` and `git status --porcelain --ignored -- skills/apex-code/references/engine-event-schema.json` | Confirm the new schema exists and shows as ignored (`!!`) in the build repo. |
| `git status --porcelain -uall -- skills/apex-code/scripts/engine-dispatch.ps1 skills/apex-code/scripts/dispatch-events-test.ps1 skills/apex-code/scripts/engine-dispatch-test.ps1` | Review only the modified tracked scripts in the build repo. |
| `git status --porcelain -uall -- SKILL-HISTORY.md` | Review only the modified tracked history file in APEX. |
| Existing build-repo `AGENTS.md` Verify commands fence | Run all prescribed checks. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| Read-only status and diff inspection | Both repositories. |
| Fixture commits and worktree teardown | Hermetic test repositories only. |
| Live add, commit, push, checkout, reset, stash | (none) |

### Environment Access
| Variable | Purpose |
|----------|---------|
| `TEMP` | Existing suite fixture directories. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | Local schema extraction and verification. |

## Specialist Context
### Security
Preserve `additionalProperties: false`, exact required fields, numeric enums, and all refusal conditionals. Do not weaken the schema or event correlation checks.

### Performance
(none)

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Schema | skills/apex-code/references/engine-event-schema.json | Create standalone event contract. |
| History (HOST) | C:/Users/User/apex/SKILL-HISTORY.md | Add dated apex-code row. |

## Acceptance Criteria
- [ ] Task 1 → verify: PowerShell loads both schema files with `Get-Content -Raw | ConvertFrom-Json`; `ConvertTo-Json -Depth 100 -Compress` of each extracted `$defs.dispatch_result` and `$defs.refusal` equals the corresponding live source definition, including all six refusal `allOf` branches and required arrays. The new schema has its own `$id`, no dangling `$ref`, and only event-related `$defs`.
- [ ] Task 2 → verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1` exits 0; the validator treats an absent `required` property as an empty list without calling `Test-EngineHasProperty` with an empty `Name`; Engine loads the new path, accepts valid real-wrapper events, a valid exit-74 refusal under `$ErrorActionPreference = 'Stop'` whose matching `then` has no `required`, and a null-exit refusal with a valid `rule`, rejects an invalid null-exit `rule`, and retains its existing mismatch/required-field and exact per-exit diagnostics, including `null run_id`.
- [ ] Task 3 → verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1` exits 0; its wrapper-backed valid matrix and malformed 75 `run_id` rejection execute against the new file.
- [ ] Task 4 → verify: `powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1` exits 0 and prints `Assert-EngineCase` passes labelled `real wrapper event uses engine event schema`, `valid exit-74 refusal without then required accepted`, `valid null-exit refusal rule accepted`, and `invalid null-exit refusal rule rejected`; the exit-74 case runs under `$ErrorActionPreference = 'Stop'` and its matching `then` has no `required`; the first case compares `$script:EngineDispatchSchemaPath` to the resolved `references\engine-event-schema.json` path.
- [ ] Task 5 (HOST) → verify: PowerShell `Select-String -Path C:/Users/User/apex/SKILL-HISTORY.md -Pattern 'engine-event-schema'` finds exactly one dated apex-code row naming the four build-repo files.
- [ ] Consumer sweep → verify: PowerShell `Get-ChildItem -LiteralPath skills/apex-code/scripts -Filter '*.ps1' -File | Select-String 'orchestrator-protocol-schema.json'` finds no loader; the only remaining references to that name are the unedited source file and orchestrator prose at `skills/apex-code/SKILL.md:61,65,281` and `agents/apex-build-orchestrator.md:47,846`, deferred to the cutover. No `hooks/` file references the schema, and neither validator resolves `$ref`; the split file's top-level `$defs` are selected directly. No test adds `rg` or another external CLI dependency.
- [ ] Build fence → verify: from `C:/Users/User/.claude`, run every command in its live `AGENTS.md` `## Verify commands` fence; each exits 0, including `dispatch-events-test.ps1` and `engine-dispatch-test.ps1`.
- [ ] Scope → verify: from `C:/Users/User/.claude`, PowerShell `Test-Path skills/apex-code/references/engine-event-schema.json` returns true and `git status --porcelain --ignored -- skills/apex-code/references/engine-event-schema.json` shows `!!`: the new file shows as ignored because `.gitignore` contains `*`. Run the two scoped `git status --porcelain -uall --` commands above only for the three modified tracked scripts in the build repo and `SKILL-HISTORY.md` in APEX; every other dirty path predated this build and is named in the report. `orchestrator-protocol-schema.json` and `engine-state-schema.json` are untouched.
- [ ] Reachability — a real wrapper event reaches the independent Engine schema through the production dispatch adapter → verify: the `engine-dispatch-test.ps1` case invokes `codex-dispatch.ps1`, reads its newly emitted event file, passes that parsed object to `Test-EngineSchemaDefinition` through `engine-dispatch.ps1` with `EngineDispatchSchemaPath` pointing at `engine-event-schema.json`, then asserts acceptance and rejection of the conditional mutation.

## Progress
_(The build writes here — do not edit manually)_
