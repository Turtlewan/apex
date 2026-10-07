---
spec: engine-cutover
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
max_parallel_codex: 2
---

# Spec: Engine attended cutover
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Make the Engine the default attended build route, retire the build-orchestrator agent and its protocol, and retain host close-out and manual recovery.

## Intent
- **Intent:** Stage 5 cutover routes eligible attended builds through the Engine; Engine-refused specs use an attended HOST manual path. Retire `apex-build-orchestrator` and its protocol after the new event schema and protected hook integration land.
- **Invariants:** Engine owns deterministic build mechanics; the host reads durable status and diagnosis, makes owner/escalation decisions, and runs Critic, Scribe, family gate, and docs close-out against the integrated tip after Engine exit 0, followed by owner-approved commit (main HEAD and working files match the integration tip) and proof-gated success `-Teardown <runId>`. `max_parallel_codex` remains 2; risk:high uses 1.
- **Invariants:** This is one coherent routing/retirement change across skills, agents, templates, and hook context under a split-rule exception. It is **not** the doc-only exception. File-disjoint coder tasks can run two at a time.
- **Non-goals:** Changing Engine code, adding an unattended queue, moving close-out into the Engine, changing the event/state schemas, or updating the planning host's live status file.

## Assumptions
- The live `C:/Users/User/.claude` working tree contains staged `scribe-stage3`, `engine-build-outputs`, and `engine-recipe-parity` changes; anchors below refer to the **live working tree on 2026-10-06**, not HEAD. Re-grep before build if any anchored file moves. -> impact: Stop.
- `engine-event-schema` ships first: Engine and producer event validation load `engine-event-schema.json`; `orchestrator-protocol-schema.json` then has no runtime/test consumer. -> impact: Stop.
- The Engine still accepts only one repo with an execution manifest and file-disjoint tasks; `coder_model: sonnet` is refused. -> impact: Stop.
- The owner integrates the classifier-gated hook edit before Stage 5 is declared shipped. -> impact: Stop.

Simplicity check: one file-disjoint cutover spec follows the small `engine-event-schema` prerequisite; no Engine implementation task is included.

## Prerequisites
- Complete `scribe-stage3`, `engine-build-outputs`, `engine-recipe-parity`, and `engine-event-schema` first. Confirm the last spec's producer and Engine event suites pass against `engine-event-schema.json` before deleting the old schema.
- Build environment: PowerShell 5.1, Git, the live build repo's `AGENTS.md` verify fence, an attended owner for protected hook integration, and a separate, already-promoted small low-risk Engine-compatible spec in its own repository for the HOST smoke.

## Files to Change
Grep evidence: run on the **live** `C:/Users/User/.claude` and `C:/Users/User/apex` trees, 2026-10-06. `rg -uu -n -F apex-build-orchestrator skills agents hooks -g '!**/fixtures/**'` found the agent at `agents/apex-build-orchestrator.md:2,8`, plus `skills/apex-code/SKILL.md:61`, `skills/apex-orchestrate/SKILL.md:57`, `skills/apex-code/references/workflow-dispatch.md:24`, `skills/apex-plan/references/model-routing.md:63`, `skills/apex-governance/levels/L3.md:5`, `agents/apex-coder.md:8,28`, and `hooks/apex-session-context.md:32,43`. `rg -uu -n -F orchestrator-protocol-schema skills agents hooks -g '!**/fixtures/**'` found `skills/apex-code/scripts/engine-dispatch.ps1:5`, `skills/apex-code/scripts/dispatch-events-test.ps1:9`, `skills/apex-code/SKILL.md:61,65,281`, the agent `:47,846`, and the schema itself `:3`; the two script consumers belong to prerequisite `engine-event-schema`, not this spec. Neither sweep found another live consumer outside the listed cutover surfaces. Generic session uses of “orchestrator” are not a retired-agent reference.

- `skills/apex-code/SKILL.md`: live `version: 2.21.0` at `:3`, 483 lines; ownership/protocol block `:61-65`, fallback role `:272`, schema pointer `:281`, verify ownership `:287`, forks `:319`, post-build `:330`.
- `skills/apex-code/references/dispatch-pack.md`: verify ownership `:69`, completion routing `:101-112`; `parallel-codex.md`: old opening `:4`, Engine integration `:52-63`, attended manual procedure `:69-130`, fallback `:139`; `codex-review.md`: BLOCK adjudication `:8`; `workflow-dispatch.md`: Claude fallback `:24`.
- `skills/apex-orchestrate/SKILL.md`: attended routing row `:57`, ownership paragraph `:66`, live version `2.4.1`; templates `spec-template.md:114` and `AGENTS-template.md:14,22`. `skills/apex-plan/SKILL.md:228` (live version `2.7.1`) and `references/model-routing.md:15,63` carry the old routing.
- `skills/apex-governance/levels/L3.md:5`, `agents/apex-coder.md:8,28`, and `hooks/apex-session-context.md:32,41-43` carry role text; the hook needs both the table row and following ownership paragraph.
- In APEX, `SKILLS.md:60`, `SKILL-HISTORY.md:5-9`, `CHANGELOG.md:10-11`, `docs/technical/architecture/overview.md:41-49,84`, `docs/technical/harness-known-limits.md:88-89`, `docs/technical/adr/ADR-048-role-redesign.md:133-135,184`, `ADR-045-four-role-split.md:5,33,67-81`, and `ADR-046-doctrine-audit-resolutions.md:71-88` are live amendment sites. Historical text stays historical; append dated amendments to the ADRs.
- Engine behavior anchors: `scripts/apex-engine.ps1:1386,1397-1414` review/exit summary, `:1428-1461` teardown, `:1483-1502` new-run inputs, `:1627-1663` resume, `:1698-1711` review flags; `scripts/engine-git.ps1:633-648` teardown proof; `scripts/engine-plan.ps1:535,644-647` accepted effort and weight, `:568-806` validator and planner refusals. Re-grep these live files before editing route text.

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-code/SKILL.md | modify | T1 Engine default, status/recovery, version. |
| skills/apex-code/references/dispatch-pack.md | modify | T2 ownership and completion routing. |
| skills/apex-code/references/parallel-codex.md | modify | T3 Engine primary and host manual path. |
| skills/apex-code/references/codex-review.md | modify | T4 BLOCK handoff. |
| skills/apex-code/references/workflow-dispatch.md | modify | T5 Claude fallback routing. |
| skills/apex-orchestrate/SKILL.md | modify | T6 build route and version. |
| skills/apex-orchestrate/templates/spec-template.md | modify | T7 wave-plan comment. |
| skills/apex-orchestrate/templates/AGENTS-template.md | modify | T8 verify and scheduling language. |
| skills/apex-plan/SKILL.md | modify | T9 task planning and version. |
| skills/apex-plan/references/model-routing.md | modify | T10 build/manual model roles. |
| skills/apex-governance/levels/L3.md | modify | T11 AFK/attended role text. |
| agents/apex-coder.md | modify | T12 Claude fallback owner. |
| agents/apex-build-orchestrator.md | delete | T13 retired agent. |
| skills/apex-code/references/orchestrator-protocol-schema.json | delete | T14 retired protocol. |
| C:/Users/User/.claude/hooks/apex-session-context.md | modify | HOST T15 protected hook integration. |
| C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | modify | HOST T17 stage-5 amendment. |
| C:/Users/User/apex/docs/technical/adr/ADR-045-four-role-split.md | modify | HOST T18 dated note. |
| C:/Users/User/apex/docs/technical/adr/ADR-046-doctrine-audit-resolutions.md | modify | HOST T19 dated D1 note. |
| C:/Users/User/apex/SKILLS.md | modify | HOST T20 role index. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST T21 skill/history rows. |
| C:/Users/User/apex/docs/technical/architecture/overview.md | modify | HOST T22 live architecture route. |
| C:/Users/User/apex/docs/technical/harness-known-limits.md | modify | HOST T23 recovery ownership. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST T24 release note. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-code/SKILL.md", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-code/references/dispatch-pack.md", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-code/references/parallel-codex.md", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-code/references/codex-review.md", "op": "modify" }], "depends_on": [], "effort": "low" },
    { "id": "5", "repo": "claude", "files": [{ "path": "skills/apex-code/references/workflow-dispatch.md", "op": "modify" }], "depends_on": [], "effort": "low" },
    { "id": "6", "repo": "claude", "files": [{ "path": "skills/apex-orchestrate/SKILL.md", "op": "modify" }], "depends_on": [], "effort": "medium" },
    { "id": "7", "repo": "claude", "files": [{ "path": "skills/apex-orchestrate/templates/spec-template.md", "op": "modify" }], "depends_on": [], "effort": "low" },
    { "id": "8", "repo": "claude", "files": [{ "path": "skills/apex-orchestrate/templates/AGENTS-template.md", "op": "modify" }], "depends_on": [], "effort": "low" },
    { "id": "9", "repo": "claude", "files": [{ "path": "skills/apex-plan/SKILL.md", "op": "modify" }], "depends_on": [], "effort": "low" },
    { "id": "10", "repo": "claude", "files": [{ "path": "skills/apex-plan/references/model-routing.md", "op": "modify" }], "depends_on": [], "effort": "low" },
    { "id": "11", "repo": "claude", "files": [{ "path": "skills/apex-governance/levels/L3.md", "op": "modify" }], "depends_on": [], "effort": "low" },
    { "id": "12", "repo": "claude", "files": [{ "path": "agents/apex-coder.md", "op": "modify" }], "depends_on": [], "effort": "low" },
    { "id": "13", "repo": "claude", "files": [{ "path": "agents/apex-build-orchestrator.md", "op": "delete" }], "depends_on": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], "effort": "low" },
    { "id": "14", "repo": "claude", "files": [{ "path": "skills/apex-code/references/orchestrator-protocol-schema.json", "op": "delete" }], "depends_on": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], "effort": "low" }
  ]
}
```

## Tasks
- [ ] **Task 1** - Replace the agent-specific ownership and schema-validation block at `skills/apex-code/SKILL.md:59-65,281,287`; add a concise **Engine path (default, attended)** section. Show `apex-engine.ps1 -SpecPath <absolute> -Repo <absolute> -Attended -MaxParallel 2` (`1` for risk:high); if an `engine-state` file exists, read its status **and** diagnosis; if no state exists, use the console `Engine refused: <message>` as the diagnosis and fix the inputs/spec or take the attended HOST manual path. State exit 0 = Engine build/hand-off complete with HOST close-out pending; 1 = refused/parked/failed/partial/quota-paused, distinguished by state when present; 2 = `awaiting-review`. On 2 run Opus Critic for the integrated wave and use `-Resume <runId> -ReviewVerdict clean|reject -ReviewDigest <64 lowercase hex> -ReviewRecord <existing absolute path outside every Git worktree>`; rejection parks, then HOST fixes manually or starts an amended-spec run. Unchanged spec resumes with `-Resume`; amended spec starts a new run only after the parked run's partial work is inspected and discarded via `-Teardown <runId> -Discard` when permitted. On 1 diagnose, adjust the spec or seek owner disposition. Apply the existing Forks rules at skills/apex-code/SKILL.md:319-328 to Engine parks/exit 1 as HOST actions for assumption-wrong, unmeetable-criterion, and GRAY cases; the Engine accepts max/ultra task effort but its automatic retry ladder stops at xhigh; escalation beyond that ladder is a HOST decision to amend task effort and start a new Engine run or use the attended HOST manual path. `coder_model: sonnet` and owner-approved Sonnet quota fallback use the attended HOST manual path. For AFK/unattended and Engine-refused manual builds, retain the wave-analysis structural checks (a)-(f) at SKILL.md:65 as HOST-performed checks: cap arithmetic (including ultra double slots and 64-task total), per-repo authorized-path disjointness (equal/ancestor/descendant), authorized subset of Files to Change, executability minimums, repo and verify-contract integrity, and terminal adjudication arithmetic. At SKILL.md:287 name HOST as verify pass/fail adjudicator on the manual/AFK path and Engine as adjudicator on the Engine path. On 0 run HOST Critic/Scribe/family gate/docs close-out against the integrated tip, using fresh worktrees where Post-build requires them; obtain the owner-approved commit so main HEAD equals the integration tip and working files match it; then run proof-gated `-Teardown <runId>`. Preserve host post-build steps and remove all retired-agent/protocol pointers, including Opus fallback aside `:272`; bump `2.21.0` to `2.22.0`, date 2026-10-06, and stay ≤500 lines by replacing obsolete text. — files: skills/apex-code/SKILL.md — done when: invocation, 0/1/2 state-or-console diagnosis routing, review flags, resume/discard/teardown boundary, HOST effort escalation, retained HOST structural checks (a)-(f), path-specific verify adjudicators, Forks handling, and host close-out are present with no live protocol pointer and the cap holds.
- [ ] **Task 2** - Replace the `dispatch-pack.md:69,101-112` agent-owned verify/completion routing with Engine status/diagnosis routing for eligible attended builds and HOST adjudication for manual recovery; keep the coder's isolated verify and integrated authoritative verify distinct. — files: skills/apex-code/references/dispatch-pack.md — done when: no agent-specific owner remains and both verify cadences are named.
- [ ] **Task 3** - Rewrite `parallel-codex.md:4,69-70,126-139` to make the Engine primary for eligible attended specs and the documented attended HOST manual procedure the path for the five static eligibility exclusions: no manifest, shared-file tasks, multi-repo, `coder_model: sonnet`, and owner-directed escalation/fixes. Route every other Engine refusal, including validator failure, malformed manifest, repo mismatch, dirty paths, and missing verify contract, by durable state diagnosis or the console `Engine refused:` message when no state exists. Preserve `:52-130` integration/rollback checks, risk:high sequential limit, and Scribe's fresh-worktree use against the integrated tip; correct any unconditional Sonnet quota fallback wording to owner decision. — files: skills/apex-code/references/parallel-codex.md — done when: a host can execute the manual path without the retired agent and the five static exclusions are enumerated and all other refusals route by state diagnosis or console message.
- [ ] **Task 4** - Change `codex-review.md:8` so the HOST receives and adjudicates a build-side BLOCK during the manual path and owns the later Critic cadence; the Engine high-risk pause consumes only the HOST's bound clean/reject review record. — files: skills/apex-code/references/codex-review.md — done when: BLOCK has a named live receiver and no retired-agent dependency.
- [ ] **Task 5** - Replace `workflow-dispatch.md:24` agent-era fallback prose with HOST-directed Sonnet manual recovery: whole-spec pin goes directly to HOST manual path; quota-out parks for owner decision; terminal verify failure or Critic reject is repaired through manual path or amended-spec rerun. Preserve the Claude-only workflow contract. — files: skills/apex-code/references/workflow-dispatch.md — done when: fallback triggers and owner decisions are explicit without the deleted agent.
- [ ] **Task 6** - Replace `apex-orchestrate/SKILL.md:57,66` attended build dispatch and old Opus 5 claim with the Engine command/status route and a separate attended HOST manual-recovery row for refused specs; point close-out to apex-code Post-build, keep unattended handling distinct, and bump `2.4.1` to `2.5.0` dated 2026-10-06. — files: skills/apex-orchestrate/SKILL.md — done when: build routing has separate Engine and manual rows and no retired-agent dispatch instruction.
- [ ] **Task 7** - Change `spec-template.md:114` wave-plan comment to say manifest `depends_on` is authoritative to the Engine for eligible specs; HOST schedules the attended manual path for refused specs, preserving file-disjoint and high-risk sequential rules. — files: skills/apex-orchestrate/templates/spec-template.md — done when: no agent-owned scheduling comment remains.
- [ ] **Task 8** - Change `AGENTS-template.md:14,22` to name Engine integrated verification and HOST manual-path verification/scheduling, preserving coder verify, risk:high sequential rule, and host-only commits. — files: skills/apex-orchestrate/templates/AGENTS-template.md — done when: both routes and verify owners are accurate.
- [ ] **Task 9** - Change `apex-plan/SKILL.md:228` to prefer Engine-compatible, manifest-backed file-disjoint single-repo specs without requiring that shape; Engine determines eligible task selection/sequencing and HOST handles refused-spec manual scheduling. Bump `2.7.1` to `2.8.0` dated 2026-10-06. — files: skills/apex-plan/SKILL.md — done when: no mandatory Engine-only spec shape or retired-agent owner is stated.
- [ ] **Task 10** - Change `model-routing.md:15,63` to state that the Engine accepts max/ultra task effort while its automatic retry ladder stops at xhigh; escalation beyond that ladder is a HOST decision to amend task effort and start a new Engine run or use the attended HOST manual path. Route whole-spec Sonnet pins and owner-decided Sonnet quota fallback through HOST manual; keep Opus for high-risk Critic, not build-orchestrator. — files: skills/apex-plan/references/model-routing.md — done when: Engine effort eligibility and automatic retry limit are distinct, both HOST escalation options and Sonnet decisions are explicit, and no retired-agent instruction remains.
- [ ] **Task 11** - Replace `L3.md:5` agent-era AFK pipeline with the HOST's documented AFK/manual mechanics, and name Engine only as the default **attended** eligible route; preserve L3 permission and integration rules at `:24-27`. — files: skills/apex-governance/levels/L3.md — done when: no AFK dispatch to the deleted agent is suggested.
- [ ] **Task 12** - Change `apex-coder.md:8,28` to make Claude fallback HOST-directed on the attended manual route (whole-spec Sonnet pin or owner-approved recovery), with no orchestrator owner and no automatic Engine model swap. Preserve worker write limits. — files: agents/apex-coder.md — done when: fallback ownership and triggers align with Engine parking.
- [ ] **Task 13** - Delete `agents/apex-build-orchestrator.md:1-887` after T1-T12 routing edits. — files: agents/apex-build-orchestrator.md — done when: the agent file is absent and no live route dispatches it.
- [ ] **Task 14** - Confirm prerequisite `engine-event-schema` has retargeted both script consumers, then delete `orchestrator-protocol-schema.json:1-386` without changing the Engine state schema or event validation. — files: skills/apex-code/references/orchestrator-protocol-schema.json — done when: old schema absent and Engine event consumers still point to the independent event schema.
- [ ] **Task 15 (HOST)** - Have the owner integrate the classifier-gated `hooks/apex-session-context.md:32,41-43` edit: replace the build-orchestrator role row **and** following ownership paragraph with Engine default attended routing, HOST manual refused-spec path, HOST close-out, and unchanged AFK ownership; verify the hook's injected text in a fresh session. — files: C:/Users/User/.claude/hooks/apex-session-context.md — done when: protected edit lands and a fresh session displays the new route; retirement is not shipped before this condition.
- [ ] **Task 16 (HOST)** - Run the LIVE Engine on a SEPARATE, already-promoted small low-risk Engine-compatible spec in its own repository after coder build and protected-hook integration, under that spec’s own Permissions and Scope. In the HOST report, record its spec, repository, run ID, exit/status/diagnosis, integrated tip, HOST Critic/Scribe/family gate/docs close-out against that tip from fresh worktrees where required, owner-approved commit with main HEAD equal to the integration tip and working files matching it, and successful proof-gated `-Teardown <runId>` afterward. Do not declare cutover done if the run stops before or skips any of these boundaries. — files: (none in this spec; only smoke evidence in the HOST report; the separate smoke spec owns its repository and build artifacts) — done when: the owner has a complete end-to-end smoke record and every required boundary is crossed.
- [ ] **Task 17 (HOST)** - Append a dated 2026-10-06 Stage 5 cutover-shipped amendment at `ADR-048-role-redesign.md:133-135,184` only after T15-T16 pass; state Engine default attended eligibility, deleted agent/schema, host manual refused-spec path, xhigh automatic retry limit with HOST max/ultra escalation and owner Sonnet choice, HOST close-out against the integrated tip, owner-approved commit with main HEAD equal to that tip and matching working files before proof-gated success teardown, and deferred Engine archival. Retain historical roadmap text. — files: C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md — done when: the dated amendment records smoke and hook activation as shipped conditions.
- [ ] **Task 18 (HOST)** - Append a 2026-10-06 note to `ADR-045-four-role-split.md:5,33,67-81` pointing the historical build-orchestrator row to the Stage 5 Engine/manual routing and HOST close-out in ADR-048; preserve original decision history. — files: C:/Users/User/apex/docs/technical/adr/ADR-045-four-role-split.md — done when: the historical row cannot be read as the live route without the dated note.
- [ ] **Task 19 (HOST)** - Append a 2026-10-06 D1 supersession note at `ADR-046-doctrine-audit-resolutions.md:71-88` for the retired attended agent, Engine default, HOST manual exception/recovery, and HOST close-out; retain D3/D6/D8 and historical v1 text. — files: C:/Users/User/apex/docs/technical/adr/ADR-046-doctrine-audit-resolutions.md — done when: D1's live owner is explicit without erasing history.
- [ ] **Task 20 (HOST)** - Replace `SKILLS.md:60` active process-agent row with Engine routing and HOST manual recovery; keep surviving coder, Critic, Scribe, and docs-agent entries accurate. — files: C:/Users/User/apex/SKILLS.md — done when: no active row advertises the deleted agent.
- [ ] **Task 21 (HOST)** - Prepend dated 2026-10-06 `SKILL-HISTORY.md:5` row(s) for `apex-code` 2.22.0, `apex-orchestrate` 2.5.0, and `apex-plan` 2.8.0, plus governance level, agent, template, hook, and protocol retirement changes; cite this cutover spec and note protected owner integration. — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: every changed skill has a new version/history row and the deleted agent/schema and owner hook appear in history.
- [ ] **Task 22 (HOST)** - Replace live route text at `overview.md:41-49,84` with Engine default attended, HOST manual refused-spec path, and HOST post-build Critic/Scribe/family gate/docs close-out against the integrated tip followed by owner-approved commit and proof-gated success teardown; retain generic session-orchestrator meaning at `:17`. — files: C:/Users/User/apex/docs/technical/architecture/overview.md — done when: the active architecture has no dispatched build-agent role and states the success order.
- [ ] **Task 23 (HOST)** - Update `harness-known-limits.md:88-89` recovery ownership: Engine parks/diagnoses where applicable; HOST adjudicates attended manual recovery and critical-path confirmation with owner; remove deleted-agent references. — files: C:/Users/User/apex/docs/technical/harness-known-limits.md — done when: both live limit rows name their current recovery owner.
- [ ] **Task 24 (HOST)** - Add one current cutover entry to `CHANGELOG.md:10-11` naming Engine attended default, HOST manual refused-spec recovery, and HOST close-out; retain historical release notes. — files: C:/Users/User/apex/CHANGELOG.md — done when: the current release entry matches activated routing.

## Wave plan
Proposed coder waves, cap 2: Wave 1 [T1,T2] | Wave 2 [T3,T4] | Wave 3 [T5,T6] | Wave 4 [T7,T8] | Wave 5 [T9,T10] | Wave 6 [T11,T12] | Wave 7 [T13,T14]. Manifest `depends_on` is authoritative; T13-T14 wait for all routing edits. HOST T15 follows coder routing, T16 follows T15; HOST T17-T24 follow the smoke before declaring Stage 5 shipped. HOST tasks are outside the Engine manifest.

## Permissions

The attended owner handles protected hook confirmation, live smoke selection, and commit approvals. This spec grants no autonomous hook write, no commit, and no status-file edit.

### File Operations
| Action | Paths |
|--------|-------|
| Modify | All `modify` rows in Files to Change, through the named coder/HOST owner. |
| Delete | The two `delete` rows in Files to Change, after prerequisite checks. |
| Create | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| PowerShell verification commands below | Structural checks and live Engine smoke. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| HOST integration/commit after gates | Owner-attended build and close-out only. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No new environment variable. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No package or network operation. |

## Specialist Context
### Security
Protected hook integration is owner-run and classifier-gated; do not represent retirement as shipped until the fresh-session injection check passes.

### Performance
`max_parallel_codex: 2`; risk:high invocation sets `-MaxParallel 1`.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | Dated Stage 5 amendment after hook and smoke. |
| ADR | C:/Users/User/apex/docs/technical/adr/ADR-045-four-role-split.md | Dated historical-route note. |
| ADR | C:/Users/User/apex/docs/technical/adr/ADR-046-doctrine-audit-resolutions.md | Dated D1 supersession note. |
| Index/history | C:/Users/User/apex/SKILLS.md, C:/Users/User/apex/SKILL-HISTORY.md | Route index and version rows. |
| Architecture | C:/Users/User/apex/docs/technical/architecture/overview.md, C:/Users/User/apex/docs/technical/harness-known-limits.md | Current route and recovery. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | Current cutover entry. |

## Acceptance Criteria
- [ ] Task 1 → verify: the code skill is 2.22.0 dated 2026-10-06 and <=500 lines; Get-ChildItem -Path skills/apex-code -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\fixtures\\' } | Select-String -SimpleMatch -Pattern 'Engine path','ReviewDigest','HOST' finds invocation, 0/1/2 plus state status/diagnosis when present, console `Engine refused:` diagnosis when no state exists with input/spec fix or HOST manual routing, 64-lowercase-hex digest and existing external review record constraints, unchanged-spec resume versus amended-spec new run/discard, HOST Critic/Scribe/family/docs close-out against the integrated tip before owner-approved commit (main HEAD and working files match tip) and proof-gated success teardown; SKILL.md:65 retains HOST-performed (a)-(f) for AFK/manual, SKILL.md:287 names HOST manual/AFK versus Engine verify pass/fail adjudication, and :319-328 Forks remain HOST actions for Engine parks/exit 1. Engine max/ultra task effort is accepted; only automatic retries stop at xhigh, with HOST choice of amended-spec new Engine run or attended manual path beyond that ladder.
- [ ] Task 2 → verify: dispatch pack names Engine and HOST manual owners and preserves both coder and authoritative integrated verify cadences.
- [ ] Task 3 → verify: parallel reference enumerates the five static eligibility exclusions (no manifest, shared-file tasks, multi-repo, `coder_model: sonnet`, owner-directed escalation/fixes), routes all other Engine refusals by durable diagnosis or console `Engine refused:` message, and names Engine primary integration, risk:high sequential execution, owner Sonnet decision, and fresh-worktree close-out against the integrated tip.
- [ ] Task 4 → verify: review reference routes manual build BLOCK to HOST and Engine review to a bound clean/reject record.
- [ ] Task 5 → verify: workflow reference keeps Claude-only dispatch and names HOST/owner recovery without an agent fallback directive.
- [ ] Task 6 → verify: orchestration skill is 2.5.0 dated 2026-10-06 with separate attended Engine and HOST manual rows; no retired-agent dispatch instruction remains.
- [ ] Task 7 → verify: spec template says manifest dependencies drive Engine planning and HOST schedules refused specs.
- [ ] Task 8 → verify: AGENTS template names Engine versus HOST authoritative verify, risk:high sequential execution, and host-only commits.
- [ ] Task 9 → verify: plan skill is 2.8.0 dated 2026-10-06 and prefers, without mandating, Engine-compatible specs.
- [ ] Task 10 → verify: model-routing reference states Engine accepts max/ultra task effort, automatic retries stop at xhigh, and HOST decides whether to amend effort for a new Engine run or use the attended manual path; whole-spec Sonnet and quota fallback remain HOST/owner decisions.
- [ ] Task 11 → verify: L3 names HOST AFK mechanics and Engine as attended only, retaining integration limits.
- [ ] Task 12 → verify: fallback coder agent names HOST-directed Sonnet recovery, no automatic Engine model swap, and preserved worker write limits.
- [ ] Task 13 → verify: `Test-Path` is false for the retired agent and no live build route dispatches it.
- [ ] Task 14 → verify: `Test-Path` is false for the retired protocol; after `engine-event-schema` ships, neither Engine dispatcher nor event test loads it and both event suites pass.
- [ ] Task 15 (HOST) → verify: protected hook has the Engine role table **and** following ownership paragraph, no retired-agent dispatch, and a fresh session shows the changed injected text.
- [ ] Task 16 (HOST) → verify: HOST smoke record names a separate already-promoted small low-risk Engine-compatible spec, its own repository and Permissions/Scope, run ID, exit 0 and completed state, integrated tip, HOST Critic/Scribe/family/docs close-out against that tip from fresh worktrees where required, owner-approved commit with main HEAD equal to the integration tip and matching working files, then successful proof-gated teardown; a parked, refused, or teardown-skipped run fails this criterion. Only evidence enters this spec’s HOST report.
- [ ] Task 17 (HOST) → verify: dated ADR-048 amendment says Stage 5 shipped only after T15-T16 and records the Engine/manual routing, HOST close-out against the integrated tip, owner-approved commit before proof-gated teardown, retired files, and deferred archival.
- [ ] Task 18 (HOST) → verify: dated ADR-045 note points historical build-agent text to current ADR-048 Stage 5 route.
- [ ] Task 19 (HOST) → verify: dated ADR-046 D1 note supersedes attended agent ownership while preserving historical text and D3/D6/D8.
- [ ] Task 20 (HOST) → verify: active SKILLS index names Engine and HOST manual path and has no active retired-agent row.
- [ ] Task 21 (HOST) → verify: dated SKILL-HISTORY rows include each changed skill/version, template, level, retired agent/schema, and protected hook integration.
- [ ] Task 22 (HOST) → verify: overview's active build flow names Engine, HOST manual recovery, and HOST close-out against the integrated tip before owner-approved commit and proof-gated teardown, without a dispatched build agent.
- [ ] Task 23 (HOST) → verify: both harness-limit rows name current Engine/HOST recovery and contain no retired-agent reference.
- [ ] Task 24 (HOST) → verify: current changelog has one Engine cutover entry without rewriting earlier entries.
- [ ] Coder/build-verify consumer sweep -> verify: after prerequisites and deletion, Get-ChildItem -Path skills,agents -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\fixtures\\' } | Select-String -SimpleMatch -Pattern 'apex-build-orchestrator','orchestrator-protocol-schema' returns no live references; all surviving live file pointers resolve. Run the coder PowerShell structural commands below; no JavaScript/Python test is added.
- [ ] Post-Task-15 HOST hook sweep -> verify: after the protected hook edit, Get-ChildItem -Path hooks -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\fixtures\\' } | Select-String -SimpleMatch -Pattern 'apex-build-orchestrator','orchestrator-protocol-schema' returns no live references; the hook contains Engine/manual routing. Historical APEX ADR/history/changelog mentions are allowed.
- [ ] Scope → verify: before/after hashes for the listed rows show only Files-to-Change edits in the build and APEX repos; exclude the planning host’s live status file from reads and writes, and report other pre-existing dirty paths without touching them. The separate T16 smoke repository and its build artifacts are excluded from this spec’s Scope acceptance criterion and are governed by the smoke spec’s own Permissions/Scope. The two deletions are absent on disk and listed by `git ls-files --deleted`; no other file was written under this spec.
- [ ] Reachability — SPEC-LEVEL: an attended build request reaches the Engine route or, on documented Engine refusal, the HOST manual route, then reaches HOST close-out → verify: the real T16 smoke traverses Engine exit 0 → HOST Critic/Scribe/family/docs close-out against the integrated tip from fresh worktrees where required → owner-approved commit (main HEAD equals integration tip and working files match) → proof-gated `-Teardown <runId>`; a route inspection from orchestration entry through apex-code and the hook confirms the refused-spec manual branch, with no deleted-agent or old-schema dependency.

PowerShell coder/build-verify commands (run before HOST Task 15; start from the build repo):
```powershell
Set-Location C:/Users/User/.claude
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-spec-validate.ps1 -SpecPath C:/Users/User/apex/docs/changes/engine-cutover.md
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1
if (Test-Path -LiteralPath agents/apex-build-orchestrator.md) { throw 'Retired agent remains' }
if (Test-Path -LiteralPath skills/apex-code/references/orchestrator-protocol-schema.json) { throw 'Retired protocol remains' }
$liveFiles = Get-ChildItem -Path skills,agents -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\fixtures\\' }
if (@($liveFiles | Select-String -SimpleMatch -Pattern 'apex-build-orchestrator').Count -ne 0) { throw 'Live retired-agent pointer remains' }
if (@($liveFiles | Select-String -SimpleMatch -Pattern 'orchestrator-protocol-schema').Count -ne 0) { throw 'Live retired-protocol pointer remains' }
foreach ($skill in @('skills/apex-code/SKILL.md','skills/apex-plan/SKILL.md','skills/apex-orchestrate/SKILL.md')) {
    if ((Get-Content -LiteralPath $skill).Count -gt 500) { throw "Skill exceeds cap: $skill" }
}
$code = Get-Content -Raw skills/apex-code/SKILL.md
if ($code -notmatch '(?m)^version: 2\.22\.0$' -or $code -notmatch 'Engine path \(default, attended\)') { throw 'Code skill route/version missing' }
$orchestrate = Get-Content -Raw skills/apex-orchestrate/SKILL.md
if ($orchestrate -notmatch '(?m)^version: 2\.5\.0$') { throw 'Orchestrate version missing' }
$plan = Get-Content -Raw skills/apex-plan/SKILL.md
if ($plan -notmatch '(?m)^version: 2\.8\.0$') { throw 'Plan version missing' }
Set-Location C:/Users/User/apex
foreach ($path in @('SKILLS.md','SKILL-HISTORY.md','CHANGELOG.md','docs/technical/adr/ADR-048-role-redesign.md','docs/technical/adr/ADR-045-four-role-split.md','docs/technical/adr/ADR-046-doctrine-audit-resolutions.md','docs/technical/architecture/overview.md','docs/technical/harness-known-limits.md')) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Document pointer missing: $path" }
}
git status --porcelain -uall -- SKILLS.md SKILL-HISTORY.md CHANGELOG.md docs/technical/adr/ADR-048-role-redesign.md docs/technical/adr/ADR-045-four-role-split.md docs/technical/adr/ADR-046-doctrine-audit-resolutions.md docs/technical/architecture/overview.md docs/technical/harness-known-limits.md
```

PowerShell post-Task-15 HOST checks (run after protected-hook integration):
```powershell
Set-Location C:/Users/User/.claude
$hookFiles = Get-ChildItem -Path hooks -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\fixtures\\' }
if (@($hookFiles | Select-String -SimpleMatch -Pattern 'apex-build-orchestrator').Count -ne 0) { throw 'Hook retired-agent pointer remains' }
if (@($hookFiles | Select-String -SimpleMatch -Pattern 'orchestrator-protocol-schema').Count -ne 0) { throw 'Hook retired-protocol pointer remains' }
$hook = Get-Content -Raw hooks/apex-session-context.md
if ($hook -notmatch 'Engine' -or $hook -notmatch 'manual') { throw 'Hook route missing' }
```
Run the coder/build-verify block before T15 and the HOST block after T15. Also run the live build repo AGENTS.md Verify commands fence and the APEX AGENTS.md structural checks, excluding its status-file cap under the standing scope lock. The HOST performs the real T16 Engine/close-out smoke with the separate already-promoted spec in its own repository under that spec’s Permissions/Scope; record only the exact invocation and state/commit/teardown evidence in the HOST report.

## Progress
_(The build writes here — do not edit manually)_
