---
spec: planning-intake-v5
status: draft
autonomy_level: L2
risk: high
coder_effort: high
coder_model: gpt-6.1-sol
max_parallel_codex: 2
---

# Spec: Planning intake v5
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md. -->

**Identity:** Route APEX planning by size and risk, through system maps and the existing Big-plan gate, with bug hand-back and wave resume.

## Intent
- **Intent:** Add one Intake route before drafting, including bug fixes and resumed plan slices.
- **Invariants:** Labels only rise; Big and High labels need owner confirmation. A stopped active Big plan permits only previously authorized slice-spec revisions, blocks build dispatch, Engine runs and unattended drain starts for all its slices, and resumes only after owner re-approval through § Planning gate check. Each Big slice follows its own tier, map, review and wave rules.
- **Non-goals:** Change the planning-gate or Critic receivers, write a first map, rewrite a map, change Engine mechanics, or alter the spec template.

## Assumptions
- The live planning-gate reference has `## Planning gate check` and `## Plan artifact`, and the live Critic already accepts **plan-slice inputs** in spec and code modes. → impact: Stop
- The three named skill files have the quoted anchors and versions below. → impact: Stop
- The build repository's current Verify commands fence remains the fence copied below at close-out. → impact: Caution
- **Exact coordination assumption:**
  ~~~text
  The sibling spec `bugfix-mode-refs` is built and archived at `C:/Users/User/apex/docs/changes/done/bugfix-mode-refs.md`; the live `hooks/apex-session-context.md` and `skills/apex-plan/references/adr-and-status-procedures.md` no longer contain Bug Fix, and this spec does not touch those files.
  ~~~

Simplicity check: Keep Intake and its routing in the existing planning skill; add only the two existing entry-point edits and HOST bookkeeping.

## Prerequisites
none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-plan/SKILL.md | modify | Task 1 Intake, mode/routing, wave resume, packs, gates and version. |
| skills/apex-debug/SKILL.md | modify | Task 2 confirmed-root-cause hand-back and version. |
| skills/apex-orchestrate/SKILL.md | modify | Task 3 bug and next-work routing and version. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST Task 4 single top row for three skill versions. |
| C:/Users/User/apex/CHANGELOG.md | modify | HOST Task 5 single Unreleased Added bullet. |

## Execution manifest
```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-plan/SKILL.md", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-debug/SKILL.md", "op": "modify" }], "depends_on": [] },
    { "id": "3", "repo": "claude", "files": [{ "path": "skills/apex-orchestrate/SKILL.md", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks
- [x] **Task 1** — Surgically update planning Intake and its existing dispatch/gate text; change frontmatter `version: 2.8.1` to `version: 2.9.0` and `last_updated: 2026-10-10` to `last_updated: 2026-10-14`. Keep the skill at ≤500 lines. Inserted paragraphs may each be a single unwrapped line to keep `apex-plan` SKILL.md at or under 500 lines. If needed, condense the historical explanation beginning `This is not theoretical. Artemis's 35-spec one-shot` instead of adding a reference. - files: `skills/apex-plan/SKILL.md` - done when the following edits form one planning route.
  1. Insert `## Intake` immediately before the current `## Mode` anchor. The HOST proposes `Size: Trivial | Normal | Big; Risk: Low | Medium | High; target code repos: ...` in one line with evidence; the owner confirms labels only for Big or High, separately from plan approval. For Trivial, apply `references/system-map.md` § Four-part Trivial test before assigning the label; failure of any criterion means at least Normal. Bug is an entry route: `apex-debug` confirms root cause and passes its statement to Intake, which sizes the fix; a contract-changing fix is Big. Prescribe these exact sentences: "Labels only rise."
  2. In that Intake section, define selected repos as the target code repos, not the current directory or spec-owning repo. Normal selects per change; Big selects per plan, and each `### Slice <slice-id>` section has required `**Target code repos:**` and `**Cross-slice contracts produced or consumed:**` fields listing that slice's own selected repos and every cross-slice contract it produces or consumes. Before planning or author dispatch, for Normal, Big and non-Trivial bug fixes, run `apex-map-check.ps1 -Stale` for each selected repo with a map and read touched sections. Follow `references/system-map.md` § Freshness and targeted re-survey for exits, targeted re-survey and live-edit inspection; a no-map repo skips the read. After the slice-spec manifest exists, compare its build repos with that slice's selection (Normal: the change's selection). Prescribe these exact sentences: "For Normal work, update the change's selection and read an added repo's map. A Big slice whose manifest names a repo outside its `**Target code repos:**` field stops its plan under the stop rule." Bring the mismatch to the OWNER before promotion. Update the slice's target-repo field through plan re-approval, then repeat the map step for each added repo before that slice builds. Repeat the map step before each just-in-time wave.
  3. In Intake, route Trivial to one-task Light on the normal wrapper path and `apex-size-guard.ps1` at HOST close-out; `OVER` triggers a map read and normal review before commit per `references/system-map.md` § Four-part Trivial test. Route Normal to one Light or Deep Details slice. Prescribe these exact sentences: "If the existing split rule would require more than one spec for a change, the change is Big. The existing doc-only exception to the split rule remains in force." Prescribe this exact sentence: "Route Big through C1 `## Planning gate check` and then one wave of slice specs at a time under C1 `## Plan artifact` in `references/sol-plan-check.md`." Apply the existing tier classification first: doc-only is Low unless it declares `risk: high`; explicit High wins. Prescribe these exact sentences: "Every Medium or High Big-plan slice uses Deep Details, its readiness gate and its own post-readiness cold read by tier." A Low slice may use Light without a cold read. Keep Normal mode choice and Sol-skip rules.
  4. In the new `## Intake` section, insert one stop-rule paragraph for active Big plans; there is no existing paragraph to replace. Prescribe these exact sentences: "A completed plan archived under `docs/plans/done/` is never reopened; a change to it is new work that enters Intake as a new plan. A label rising to Big, or a contract change to an approved Big plan, stops that plan: the HOST starts no build dispatch, Engine run or unattended drain for any of its slices, brings every running or completed-but-uncommitted Engine run or drain touching the plan to the OWNER for disposition, and resumes the plan only after the owner re-approves it through § Planning gate check. While a plan is stopped, the only author dispatches permitted for its slices are revisions of slice specs authorized before the stop, including capture-at-halt drain revisions; authoring a new or changed slice waits for re-approval under § Planning gate check. A change that affects a slice already archived to `docs/changes/done/` in an active plan is new work: at re-approval the plan gains a new slice for it in the current C4 pointer wave N or a later wave; archived slice specs are never moved back. When a plan stops, the HOST adds an In-Flight row to `docs/status.md`: `plan stopped · docs/plans/<plan>.md · <trigger>`, and deletes it only after re-approval. Owner disposition also covers an unattended drain whose branch holds committed specs awaiting attended close-out: close-out of the stopped plan's slices waits for that disposition." Outside that paragraph, prescribe these exact sentences: "The archived-slice rule applies only to changes made while a plan is stopped; any other change to a shipped slice is ordinary new work that enters Intake. An unbuilt spec has no committed build output on any branch; a spec with committed drain or Engine output awaits its owner disposition and is never listed for deletion until that disposition completes. A parked, paused or awaiting-review Engine run, a stopped drain, or an in-flight HOST manual-path dispatch touching a stopped plan or a spec held under the Normal-to-Big rule goes to the OWNER for disposition and is not resumed while the plan is stopped or the spec is held. At re-approval of a stopped plan, before deleting the stop row, the HOST lists every unbuilt slice spec the re-approved plan affects in `docs/drafts/` or `docs/changes/`. When a Normal change's label rises to Big, the HOST lists every unbuilt spec of that change in `docs/drafts/` or `docs/changes/`. When a Normal change's label rises to Big, the HOST adds an In-Flight row to `docs/status.md`: `change held · <spec names> · normal-to-big`, and deletes it only when the owner's disposition of every held spec completes. From the moment a Normal change's label rises to Big, the HOST starts no build dispatch, Engine run or unattended drain for any spec of that change, and brings every running Engine run or drain on such a spec to the OWNER; the specs stay held until the owner decides their deletion. If the owner declines the deletion, the specs stay held until the owner decides otherwise. For either disposition, the HOST expands the affected-spec list to include every unbuilt spec whose `## Prerequisites` names a listed spec and that is either in the same plan as that listed spec or outside any plan, repeating until no such spec remains. A prerequisite consumer that belongs to another plan is not deleted; that other plan stops under the stop rule instead, with trigger `prereq:<deleted-spec>`. With owner approval, the HOST deletes each listed spec together with its review sidecar and findings. When the re-approval and Normal-to-Big deletion rule deletes a spec, the HOST deletes that spec's `docs/progress/<name>.md` capture-at-halt record in the same owner-approved disposition. Every unbuilt spec whose `## Prerequisites` names a deleted spec and that is either in the same plan as that deleted spec or outside any plan is also affected: it is deleted and re-authored under the same owner-approved rule. Each affected slice is then re-authored as a fresh spec under a spec name no spec or draft has used, with its own new review record. The HOST renames the slices-table entries before the re-approval gate dispatch. The new Big plan created by a Normal-to-Big rise authors its slices fresh under unused names; an existing plan re-authors only its affected unbuilt slices. Built specs in `docs/changes/done/` are never deleted. No unbuilt spec moves from `docs/changes/` back to `docs/drafts/` through re-approval or Normal-to-Big disposition. The re-approval and Normal-to-Big deletion rule's no-move-back rule applies only to the re-approval and Normal-to-Big deletions; the capture-at-halt route and the revisions permitted while a plan is stopped are unchanged. The new slice goes in the current C4 pointer wave N or a later wave. `<trigger>` is `big-raise`, `contract:<name>`, `contract:target-code-repos/<slice-id>` or `prereq:<deleted-spec>`; each further trigger while the plan is stopped adds its own stop row, and the plan resumes only when re-approval deletes all of them. A Normal change whose label rises to Big has no plan to stop; it enters § Planning gate check as a new Big plan. Re-approval grants a fresh two-read budget under § Planning gate check; its reads continue the plan's existing `gate-N` numbering." Use the existing C1 `gate-N` review rows and approval path for re-approval. At `### Convergence control`, the live anchor is `The counter lives outside the` followed by `  draft, so a re-draft does not reset it.` (CRLF between these byte-exact lines). Immediately after it, add this exact sentence: "Exception: an owner-approved deletion under the re-approval and Normal-to-Big deletion rule ends that spec's lifetime. For a spec still in `docs/drafts/`, the HOST first appends an `owner` row recording the deletion to its sidecar and the spec's row to `C:/Users/User/apex/docs/research/spec-author-trial.md`, dated the deletion day, then deletes the spec, sidecar and findings. A promoted spec in `docs/changes/` already has its trial row and no sidecar, so the HOST deletes it with no new rows. The re-authored spec under its new name starts a new lifetime." Keep the stop-rule paragraph free of teardown, discard, restore, `-Resume`, `awaiting-review` and Engine-exit wording. Do not prescribe Engine teardown or Engine resume mechanics.
  5. Follow the current Session start step beginning `3. Check `docs/progress/*.md` â€” capture-at-halt records from blocked builds. Each must be **drained**:` and its unchanged continuation ending `dispatch (see Writing the spec). Delete the record once drained.` with one authoritative wave-resume rule. Prescribe these exact sentences: "The wave-resume procedure runs only after every `docs/progress/*.md` capture-at-halt record is drained. An In-Flight slice row is surfaced for disposition only. Then surface an ordinary In-Flight row for a plan slice (partial, blocked or parked) for disposition before that plan's C4 pointer. A C4 pointer never authorizes a fresh build while its plan is stopped. While a plan is stopped, the resume procedure skips both its spec and build branches for that plan; only the revisions permitted while stopped run. The resume procedure never specs or builds a spec named in a `change held` row. For wave N, finish unfinished drafts in `docs/drafts/` first. Then spec against shipped code every wave-N slice with no draft in `docs/drafts/` and no spec in `docs/changes/` or `docs/changes/done/`. Then build wave-N specs in `docs/changes/`. Only after every wave-N slice spec archives to `docs/changes/done/`, advance the pointer and spec wave N+1 against shipped code." Read the plan-stopped and change-held In-Flight rows before the pointer and enforce their guards across all affected slices and specs. Read each C4 pointer `plan · docs/plans/<plan>.md · next wave <N>` by that order. Use the slices table's wave column and C5 `plan: docs/plans/<plan>.md · slice: <slice-id>` in each slice spec's `## Intent`; after plan archival that path resolves under `docs/plans/done/`. The HOST maintains one pointer per active plan. Replace no other resume procedure with a competing one.
  6. Append this exact map item after the current doc-coverage anchor `5. Repo-root **`AGENTS.md`** still stubbed`: "6. A target repo map is missing or has stale sections." Include it in the same one-line informational result.
  7. At `## Mode`, delete the exact current row `| **Bug Fix** | a bug | bug Â· root cause Â· fix approach Â· files. No gate, no ADR, no status.md update |`; retain Deep Details and Light. Replace the Confirmation digest line `Deep Details â†’ digest + offer the file. Light â†’ digest only. Bug Fix â†’ one-line verbal confirm.` with `Deep Details â†’ digest + offer the file. Light â†’ digest only.` Delete the exact Closing the session line `- **Bug Fix:** no status.md update â€” ephemeral.`; fixes follow their Intake-selected Light or Deep Details close-out. Align any remaining Bug Fix/no-gate/no-status/Sol-skip mode wording in this file to that route; Light's existing ceremony remains the Light rule.
  8. Replace the current FIRST block beginning `**FIRST, before you dispatch the author (Deep Details, Medium/High only): the pre-draft Sol` with these exact sentences: "Big uses C1 § Planning gate check instead of the pre-draft pass. Non-Big Medium/High Deep Details retains the pre-draft pass and its independent post-readiness cold read. Low and doc-only skip under the existing tier rule. The Big gate output never enters the cold read."
  9. At the author-pack clause beginning `containing the adjudicated plan brief, the exact template path`, preserve the full-brief branch and add these exact sentences: "Normal and Trivial author dispatches keep the full adjudicated plan brief, the exact template path, the target draft and the three rules. For a Big slice, the author pack carries the C6 clean slice brief (slice intent, cross-slice contracts, cited map sections) in place of the full adjudicated plan brief, along with the existing template, target draft and three rules." At the Critic-pack clause beginning `Every Critic prompt contains the author prompt pack's adjudicated plan brief`, preserve the current-full-draft requirement and add these exact sentences: "Normal and Trivial spec-mode Critic dispatches keep the full adjudicated plan brief and current full draft under review. Every spec-mode Critic dispatch of a Big slice receives the same C6 clean slice brief plus C2 plan-slice inputs: the plan path as reference only, the slice's section text, the plan's cross-slice contracts section text, and the map sections the slice cites, pasted in the prompt. The Big-slice Critic also receives the current full draft under review. Gate findings, `gate-N` rows, adjudication history and the rest of the plan narrative are excluded." Preserve the digest-first and fix-check requirements. Keep C3 gate findings (`severity` BLOCK/FLAG/CLEAN and `criterion` prefixes `design:` `contract:` `grounding:` `decision:`) in the existing planning-gate reference; do not duplicate its recipe here.
  10. In the checklist headed `## Readiness gate`, add this exact line: "[ ] Map citations — the spec cites every map section it touches when a map exists." Delete the entire current item beginning `[ ] Files evidence` through `checks; exact-line manifests and whole-tree hashes are High-only.`, including its `Grep evidence:` line; retain the doc-only acceptance-check guidance in its earlier `For doc-only work` paragraph. Keep the post-readiness line beginning `**Then the Sol plan-check, for Medium/High only**` consistent with item 3 and the live C1 reference.
- [x] **Task 2** — In `### Stage 3 — Root Cause`, follow the anchor `GOOD: "The JWT expiry check uses server time but tokens are issued with client time, causing a 60-second window where expired tokens are accepted"` with this exact sentence: "After root-cause confirmation and before any fix, pass the specific root-cause statement to `apex-plan` § Intake for size/risk labels and route selection." In `### Stage 4 — Fix`, follow the anchor `- The fix must be directly traceable to the root cause` with this exact sentence: "Stage 4 builds through the Light or Deep Details route Intake selects; a contract-changing fix is Big and goes through the Big gate." Replace description trigger `Bug Fix mode, --forensic` with `bug intake, --forensic`. Change frontmatter `version: 1.4.1` to `version: 1.5.0` and `last_updated: 2026-07-29` to `last_updated: 2026-10-14`. - files: `skills/apex-debug/SKILL.md` - done when the confirmed root cause reaches Intake before Stage 4.
- [x] **Task 3** — In the route table, replace the current row `| broken · failing · bug · regression · "why does X" | **apex-debug** |` with this exact row: `| broken · failing · bug · regression · "why does X" | **apex-debug**; return its confirmed root-cause statement to **apex-plan** § Intake before any fix |`. At the live `## 2. Surface in-flight work — before taking the new request` anchor, after the blockquote prompt beginning `> "You were mid-way through {X} ({state}).` that follows `Any In-Flight row, or a dirty tree that contradicts the table:`, prescribe these exact sentences as their own paragraphs: "A `plan stopped` row is not a mid-way row: it routes to apex-plan's re-approval through § Planning gate check and is never offered continue, set aside or discard." "A `change held` row is not a mid-way row: it routes to the owner's disposition of the held specs and is never offered continue, set aside or discard." "A C4 plan pointer row (`plan · docs/plans/<plan>.md · next wave <N>`) is not a mid-way row: it routes to `apex-plan` § Session start's resume procedure instead of the continue / set aside / discard prompt." Replace the current paragraph beginning `**Auto-detect "what's next":**` with a pointer-aware route: surface ordinary In-Flight rows first, including a plan slice's partial, blocked or parked row for disposition before that plan's C4 pointer; read `change held · <spec names> · normal-to-big` and route held specs to owner disposition; read `plan stopped · docs/plans/<plan>.md · <trigger>` and hold the plan until owner re-approval; for a plan without such a row, read C4 `plan · docs/plans/<plan>.md · next wave <N>` and answer `next: finish/spec/build wave <N> of <plan>` according to the single wave-resume procedure in `apex-plan` § Session start. Prescribe these exact sentences: "A pointer never implicitly authorizes a fresh build and cannot bypass a stopped plan. Auto-detect and the queued-spec fallback skip every spec named in a `change held` row." Retain the existing queued-spec, draft and empty-queue fallback after the plan pointer check. Change frontmatter `version: 2.6.0` to `version: 2.7.0` and `last_updated: 2026-10-10` to `last_updated: 2026-10-14`. - files: `skills/apex-orchestrate/SKILL.md` - done when bug and next-work routes enter the planning Intake/resume rules.
- [x] **Task 4 (HOST)** — At close-out, prepend one `planning-intake-v5` row as the newest data row of `C:/Users/User/apex/SKILL-HISTORY.md`, naming `skills/apex-plan/SKILL.md` at 2.9.0, `skills/apex-debug/SKILL.md` at 1.5.0 and `skills/apex-orchestrate/SKILL.md` at 2.7.0, and summarizing Intake, bug hand-back, pointer resume and the plan stop/re-approval rule. - files: `C:/Users/User/apex/SKILL-HISTORY.md` - done when one newest row records all three versions.
- [x] **Task 5 (HOST)** — At close-out, add one `planning-intake-v5` bullet as the first bullet under `## [Unreleased]` / `### Added` in `C:/Users/User/apex/CHANGELOG.md` for size/risk Intake, maps, Big slice gate/review routing, bug hand-back, plan-pointer resume and the plan stop/re-approval rule. - files: `C:/Users/User/apex/CHANGELOG.md` - done when exactly one such bullet appears there.

## Wave plan
Wave 1: [1, 2, 3] | HOST: bookkeeping [4, 5]. High-risk build dispatches run sequentially.

## Permissions
Coder tasks modify only their file-disjoint manifest paths. HOST serializes the history row and changelog bullet at close-out. No staging, commit, push, network operation or other write is pre-authorized by this spec.

### File Operations
| Action | Paths |
|--------|-------|
| Modify (coder Task 1) | skills/apex-plan/SKILL.md |
| Modify (coder Task 2) | skills/apex-debug/SKILL.md |
| Modify (coder Task 3) | skills/apex-orchestrate/SKILL.md |
| Modify (HOST Task 4) | C:/Users/User/apex/SKILL-HISTORY.md |
| Modify (HOST Task 5) | C:/Users/User/apex/CHANGELOG.md |

### Commands
| Command | Purpose |
|---------|---------|
| `Select-String -LiteralPath <named skill> -SimpleMatch -Pattern <contract string>` | HOST presence and absence checks below. |
| `git status --porcelain -uall` and `git hash-object` | HOST before/after scope evidence in both repositories. |
| Build repository `AGENTS.md` Verify commands fence | HOST runs the exact fence below. |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none) | Read-only scope and hash checks only. |

### Environment Access
| Variable | Purpose |
|----------|---------|
| (none) | No new variable. |

### Network
| Action | Purpose |
|--------|---------|
| (none) | No network operation. |

## Specialist Context
### Security
(none)

### Performance
Keep each skill at or below 500 lines; reuse the two planning references by section pointer.

### Accessibility
(none)

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| Skill history | C:/Users/User/apex/SKILL-HISTORY.md | HOST Task 4 prepends one row. |
| Changelog | C:/Users/User/apex/CHANGELOG.md | HOST Task 5 adds one bullet. |

## Acceptance Criteria
- [ ] Draft coordination assumption → verify: whitespace-normalized UTF-8 Contains check on this draft finds the exact sentence below under `## Assumptions`.
  ~~~text
  The sibling spec `bugfix-mode-refs` is built and archived at `C:/Users/User/apex/docs/changes/done/bugfix-mode-refs.md`; the live `hooks/apex-session-context.md` and `skills/apex-plan/references/adr-and-status-procedures.md` no longer contain Bug Fix, and this spec does not touch those files.
  ~~~
- [ ] Task 1 — Intake and routing → verify: whitespace-normalized UTF-8 Contains checks on `skills/apex-plan/SKILL.md` find these task-prescribed literals: `## Intake`, `Size: Trivial | Normal | Big; Risk: Low | Medium | High; target code repos: ...`, `Labels only rise.`, `apex-map-check.ps1 -Stale`, `apex-size-guard.ps1`, `**Target code repos:**`, `**Cross-slice contracts produced or consumed:**`, `## Planning gate check`, `## Plan artifact`, `Every Medium or High Big-plan slice uses Deep Details, its readiness gate and its own post-readiness cold read by tier.`, `If the existing split rule would require more than one spec for a change, the change is Big.`, `The existing doc-only exception to the split rule remains in force.`, `An In-Flight slice row is surfaced for disposition only.`, `A C4 pointer never authorizes a fresh build while its plan is stopped.` and `version: 2.9.0`. Confirm `## Intake` precedes `## Mode` and the skill is ≤500 lines. Literal absence checks find none of `| **Bug Fix** | a bug | bug Â· root cause Â· fix approach Â· files. No gate, no ADR, no status.md update |`, `Deep Details â†’ digest + offer the file. Light â†’ digest only. Bug Fix â†’ one-line verbal confirm.` or `- **Bug Fix:** no status.md update â€” ephemeral.`. In the inserted stop-rule paragraph alone, literal absence checks find none of `teardown`, `discard`, `restore`, `-Resume`, `awaiting-review` or `Engine-exit`.
  Check the full C1 route sentence as one whitespace-normalized UTF-8 Contains literal:
  ~~~text
  Route Big through C1 `## Planning gate check` and then one wave of slice specs at a time under C1 `## Plan artifact` in `references/sol-plan-check.md`.
  ~~~
- [ ] Task 1 — dispatch and gate integration → verify: whitespace-normalized UTF-8 Contains checks on `skills/apex-plan/SKILL.md` find these task-prescribed literals: `Big uses C1 § Planning gate check instead of the pre-draft pass.`, `Non-Big Medium/High Deep Details retains the pre-draft pass and its independent post-readiness cold read.`, `The Big gate output never enters the cold read.`, `Normal and Trivial author dispatches keep the full adjudicated plan brief, the exact template path, the target draft and the three rules.`, `For a Big slice, the author pack carries the C6 clean slice brief (slice intent, cross-slice contracts, cited map sections) in place of the full adjudicated plan brief, along with the existing template, target draft and three rules.`, `Normal and Trivial spec-mode Critic dispatches keep the full adjudicated plan brief and current full draft under review.`, `Every spec-mode Critic dispatch of a Big slice receives the same C6 clean slice brief plus C2 plan-slice inputs: the plan path as reference only, the slice's section text, the plan's cross-slice contracts section text, and the map sections the slice cites, pasted in the prompt.`, `The Big-slice Critic also receives the current full draft under review.`, `Gate findings, `gate-N` rows, adjudication history and the rest of the plan narrative are excluded.`, `6. A target repo map is missing or has stale sections.` and `[ ] Map citations — the spec cites every map section it touches when a map exists.`. Literal absence checks find neither `[ ] Files evidence` nor `Grep evidence:`. Keep C3 in the referenced gate recipe.
- [ ] Task 1 — active-plan stop and re-approval → verify: whitespace-normalized UTF-8 Contains checks on `skills/apex-plan/SKILL.md` find every task-prescribed sentence below. Confirm the In-Flight stop row persists until owner re-approval and previously authorized capture-at-halt revisions may proceed.
  ~~~text
  A completed plan archived under `docs/plans/done/` is never reopened; a change to it is new work that enters Intake as a new plan.
  A label rising to Big, or a contract change to an approved Big plan, stops that plan: the HOST starts no build dispatch, Engine run or unattended drain for any of its slices, brings every running or completed-but-uncommitted Engine run or drain touching the plan to the OWNER for disposition, and resumes the plan only after the owner re-approves it through § Planning gate check.
  While a plan is stopped, the only author dispatches permitted for its slices are revisions of slice specs authorized before the stop, including capture-at-halt drain revisions; authoring a new or changed slice waits for re-approval under § Planning gate check.
  A change that affects a slice already archived to `docs/changes/done/` in an active plan is new work: at re-approval the plan gains a new slice for it in the current C4 pointer wave N or a later wave; archived slice specs are never moved back.
  When a plan stops, the HOST adds an In-Flight row to `docs/status.md`: `plan stopped · docs/plans/<plan>.md · <trigger>`, and deletes it only after re-approval.
  Owner disposition also covers an unattended drain whose branch holds committed specs awaiting attended close-out: close-out of the stopped plan's slices waits for that disposition.
  ~~~
  Outside that stop-rule paragraph, whitespace-normalized UTF-8 Contains checks find every task-prescribed sentence below:
  ~~~text
  The archived-slice rule applies only to changes made while a plan is stopped; any other change to a shipped slice is ordinary new work that enters Intake.
  An unbuilt spec has no committed build output on any branch; a spec with committed drain or Engine output awaits its owner disposition and is never listed for deletion until that disposition completes.
  A parked, paused or awaiting-review Engine run, a stopped drain, or an in-flight HOST manual-path dispatch touching a stopped plan or a spec held under the Normal-to-Big rule goes to the OWNER for disposition and is not resumed while the plan is stopped or the spec is held.
  At re-approval of a stopped plan, before deleting the stop row, the HOST lists every unbuilt slice spec the re-approved plan affects in `docs/drafts/` or `docs/changes/`.
  When a Normal change's label rises to Big, the HOST lists every unbuilt spec of that change in `docs/drafts/` or `docs/changes/`.
  When a Normal change's label rises to Big, the HOST adds an In-Flight row to `docs/status.md`: `change held · <spec names> · normal-to-big`, and deletes it only when the owner's disposition of every held spec completes.
  From the moment a Normal change's label rises to Big, the HOST starts no build dispatch, Engine run or unattended drain for any spec of that change, and brings every running Engine run or drain on such a spec to the OWNER; the specs stay held until the owner decides their deletion.
  If the owner declines the deletion, the specs stay held until the owner decides otherwise.
  For either disposition, the HOST expands the affected-spec list to include every unbuilt spec whose `## Prerequisites` names a listed spec and that is either in the same plan as that listed spec or outside any plan, repeating until no such spec remains.
  A prerequisite consumer that belongs to another plan is not deleted; that other plan stops under the stop rule instead, with trigger `prereq:<deleted-spec>`.
  With owner approval, the HOST deletes each listed spec together with its review sidecar and findings.
  When the re-approval and Normal-to-Big deletion rule deletes a spec, the HOST deletes that spec's `docs/progress/<name>.md` capture-at-halt record in the same owner-approved disposition.
  Every unbuilt spec whose `## Prerequisites` names a deleted spec and that is either in the same plan as that deleted spec or outside any plan is also affected: it is deleted and re-authored under the same owner-approved rule.
  Each affected slice is then re-authored as a fresh spec under a spec name no spec or draft has used, with its own new review record.
  The HOST renames the slices-table entries before the re-approval gate dispatch.
  The new Big plan created by a Normal-to-Big rise authors its slices fresh under unused names; an existing plan re-authors only its affected unbuilt slices.
  Built specs in `docs/changes/done/` are never deleted.
  No unbuilt spec moves from `docs/changes/` back to `docs/drafts/` through re-approval or Normal-to-Big disposition.
  The re-approval and Normal-to-Big deletion rule's no-move-back rule applies only to the re-approval and Normal-to-Big deletions; the capture-at-halt route and the revisions permitted while a plan is stopped are unchanged.
  The new slice goes in the current C4 pointer wave N or a later wave.
  `<trigger>` is `big-raise`, `contract:<name>`, `contract:target-code-repos/<slice-id>` or `prereq:<deleted-spec>`; each further trigger while the plan is stopped adds its own stop row, and the plan resumes only when re-approval deletes all of them.
  A Normal change whose label rises to Big has no plan to stop; it enters § Planning gate check as a new Big plan.
  Re-approval grants a fresh two-read budget under § Planning gate check; its reads continue the plan's existing `gate-N` numbering.
  ~~~
- [ ] Task 1 — convergence-control exception → verify: at `### Convergence control`, a whitespace-normalized UTF-8 Contains check on `skills/apex-plan/SKILL.md` finds this exact sentence after the live two-line anchor quoted in Task 1; for a spec still in `docs/drafts/`, the owner row and trial row dated the deletion day precede deletion; a promoted spec in `docs/changes/` gets no new rows.
  ~~~text
  Exception: an owner-approved deletion under the re-approval and Normal-to-Big deletion rule ends that spec's lifetime. For a spec still in `docs/drafts/`, the HOST first appends an `owner` row recording the deletion to its sidecar and the spec's row to `C:/Users/User/apex/docs/research/spec-author-trial.md`, dated the deletion day, then deletes the spec, sidecar and findings. A promoted spec in `docs/changes/` already has its trial row and no sidecar, so the HOST deletes it with no new rows. The re-authored spec under its new name starts a new lifetime.
  ~~~
- [ ] Task 1 — wave-N resume branches → verify: whitespace-normalized UTF-8 Contains checks on `skills/apex-plan/SKILL.md` find the full drain-order sentence below and these task-prescribed literals: `An In-Flight slice row is surfaced for disposition only.`, `Then surface an ordinary In-Flight row for a plan slice (partial, blocked or parked) for disposition before that plan's C4 pointer.`, `A C4 pointer never authorizes a fresh build while its plan is stopped.`, `While a plan is stopped, the resume procedure skips both its spec and build branches for that plan; only the revisions permitted while stopped run.`, `The resume procedure never specs or builds a spec named in a `change held` row.`, `For wave N, finish unfinished drafts in `docs/drafts/` first.`, `Then spec against shipped code every wave-N slice with no draft in `docs/drafts/` and no spec in `docs/changes/` or `docs/changes/done/`.`, `Then build wave-N specs in `docs/changes/`.` and `Only after every wave-N slice spec archives to `docs/changes/done/`, advance the pointer and spec wave N+1 against shipped code.`. Check that the resume procedure follows the unchanged Session start step 3 capture-at-halt drain, and these branches occur in order after the In-Flight-row-first and stopped-plan guards.
  ~~~text
  The wave-resume procedure runs only after every `docs/progress/*.md` capture-at-halt record is drained.
  ~~~
- [ ] Task 1 — manifest repo selection → verify: whitespace-normalized UTF-8 Contains checks on `skills/apex-plan/SKILL.md` find both task-prescribed sentences below. A Big mismatch stops its entire plan before promotion; target-repo updates and added-repo map reads precede a resumed build.
  ~~~text
  For Normal work, update the change's selection and read an added repo's map.
  A Big slice whose manifest names a repo outside its `**Target code repos:**` field stops its plan under the stop rule.
  ~~~
- [ ] Task 2 — root-cause hand-back → verify: whitespace-normalized UTF-8 Contains checks on `skills/apex-debug/SKILL.md` find `After root-cause confirmation and before any fix, pass the specific root-cause statement to `apex-plan` § Intake for size/risk labels and route selection.`, `Stage 4 builds through the Light or Deep Details route Intake selects; a contract-changing fix is Big and goes through the Big gate.`, `bug intake, --forensic` and `version: 1.5.0`; a literal absence check finds no `Bug Fix mode, --forensic`. The skill is ≤500 lines.
- [ ] Task 3 — orchestration routing → verify: whitespace-normalized UTF-8 Contains checks on `skills/apex-orchestrate/SKILL.md` find the task-prescribed bug route, full plan-stopped and change-held row sentences, full C4 sentence, pointer guard and held-spec fallback guard below, plus `next: finish/spec/build wave <N> of <plan>` and `version: 2.7.0`. Confirm the auto-detect route reads the plan-stopped In-Flight row before its C4 pointer and prevents a stopped plan from building. The skill is ≤500 lines.
  ~~~text
  | broken · failing · bug · regression · "why does X" | **apex-debug**; return its confirmed root-cause statement to **apex-plan** § Intake before any fix |
  A `plan stopped` row is not a mid-way row: it routes to apex-plan's re-approval through § Planning gate check and is never offered continue, set aside or discard.
  A `change held` row is not a mid-way row: it routes to the owner's disposition of the held specs and is never offered continue, set aside or discard.
  A C4 plan pointer row (`plan · docs/plans/<plan>.md · next wave <N>`) is not a mid-way row: it routes to `apex-plan` § Session start's resume procedure instead of the continue / set aside / discard prompt.
  A pointer never implicitly authorizes a fresh build and cannot bypass a stopped plan.
  Auto-detect and the queued-spec fallback skip every spec named in a `change held` row.
  ~~~
- [ ] Task 4 — HOST history → verify: the newest data row of `C:/Users/User/apex/SKILL-HISTORY.md` names `planning-intake-v5`, all three skill paths and their new versions, with one row for this spec; its description states the stop rule.
- [ ] Task 5 — HOST changelog → verify: exactly one `planning-intake-v5` bullet is the first bullet under `## [Unreleased]` / `### Added` in `C:/Users/User/apex/CHANGELOG.md` and describes the stop rule.
- [ ] Reachability — a bug enters debug, passes a confirmed root cause to Intake, then uses its selected spec route; a plan pointer enters the planning wave-resume procedure → verify: the three edited skill entry points name those hand-offs and the gate/readiness/cold-read path is reachable for a Medium or High Big slice.
- [ ] Scope — before and after the build, the HOST records the full `git status --porcelain -uall` list in both repositories and records `git hash-object` only for the five Files-to-Change paths (three coder files plus the two HOST bookkeeping files), using a per-command safe-directory override if needed. Pass when every new or changed status entry is one of those five paths, every other pre-existing entry has an identical status line before and after, and the two HOST files differ only by this spec's row and bullet. The HOST does not read or hash any other path's contents. Name unrelated pre-existing dirty paths in the report; leave them untouched. Pre-existing dirty paths are covered by the wrapper's per-task scope check and the file-disjoint manifest, not by this criterion. This no-read rule applies only to collecting scope evidence; the other acceptance checks and the verify fence read what they need.
- [ ] Build repository verify fence — HOST runs every command below from the build repository root and all pass. This is the current `## Verify commands` fence of the build repository's `AGENTS.md`:
```
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
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-map-check-test.ps1
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-size-guard-test.ps1
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
```

## Progress
_(The build writes here — do not edit manually)_
