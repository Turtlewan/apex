---
spec: planning-review-rules
status: draft
autonomy_level: L2
risk: medium
coder_effort: medium
---

# Spec: Planning review rules
<!-- Governing contract: ~/.claude/skills/apex-code/references/spec-contract.md (the validator's contract doc owns the version; never restate a number here). -->

**Identity:** Revise planning review ceilings, Big-plan contract and replacement rules, and spec-author routing in APEX skill, agent, reference, and hook prose.

## Intent

- **Intent:** Apply the owner's adjudicated Q1/Q2/Q3/Q7 decisions and A1–A6 amendments from the Artemis trial to the planning instructions.
- **Invariants:** Spec-mode reviewer-family ceilings are Low 3 / Medium 5 / High 10 per lifetime; code-mode cadence and independent Sol budgets stay unchanged. Contract-preserving consumers retain their lifetime. Author create/revise uses gpt-6.1-sol.
- **Non-goals:** Script or test edits; apex-code post-build Critic cadence; planning-gate two-read, pass-or-park, or ≤2-round deliberation budgets; Scribe routing; governance changes; skill-set changes.

## Assumptions

Map sections touched (C:/Users/User/.claude/docs/system-map.md): apex-plan skill and planning references; Agents and build-wave workflow; apex-orchestrate and governance; Session bootstrap and harness settings. -> impact: Caution; the HOST Scribe map update covers them at close-out.
- Mode is Deep Details; risk is medium; these are skill/agent/hook instruction edits, not doc-only. The owner waived the >3-file split rule for this spec. → impact: Stop if that waiver is withdrawn.
- Build root = the worktree this task was dispatched into: a checkout of the `C:/Users/User/.claude` repository (the Engine/HOST may use a worktree such as `C:/Users/User/.claude-wt/...`). All build-repo paths in this spec are relative to that root. HOST bookkeeping repo is `C:/Users/User/apex`. → impact: Stop only if the dispatched worktree is not a checkout of the `C:/Users/User/.claude` repository.
- Source anchors match apex-plan 2.9.3 (432 lines), apex-orchestrate 2.7.1, and the quoted text below. Before mutation, verify each anchor is unique; if an anchor moved, match its exact text. If its content differs, stop for planning. → impact: Stop.
- The wrapper already defaults `-Model` to gpt-6.1-sol. The explicit gpt-6-sol pin in dispatch-author-test.ps1 remains unchanged. → impact: Stop if the default differs.
- T4 needs live attended confirmation for the hook path; unattended execution parks before that task. → impact: Stop for unattended T4.
- Never read or write docs/status.md in either tree during this dispatch. Leave pre-existing dirty paths untouched. CODERS make no Git operations: no staging, commits, pushes, restoration, or stashing. The Engine's own integration staging/commits are allowed build mechanics.

Simplicity check: No split; use the owner's >3-file waiver and four file-disjoint prose tasks in one wave.

## Prerequisites

none

## Files to Change

| File | Operation | Notes |
|------|-----------|-------|
| skills/apex-plan/SKILL.md | modify | T1: planning rules; version 2.10.0; date 2026-10-21 |
| skills/apex-plan/references/sol-plan-check.md | modify | T2: Sol repair path and separate risk-tier ceiling |
| agents/apex-critic.md | modify | T3: spec/code mode ceiling boundary |
| skills/apex-orchestrate/SKILL.md | modify | T4: author routing; version 2.7.2; date 2026-10-21 |
| skills/apex-plan/references/model-routing.md | modify | T4: author routing |
| hooks/apex-session-context.md | modify | T4: Spec author row; critical path, attended confirmation |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | H1 (HOST): two history rows |
| C:/Users/User/apex/CHANGELOG.md | modify | H2 (HOST): one Unreleased Changed bullet |

## Execution manifest

```json apex-manifest
{
  "version": 1,
  "repos": { "claude": "C:/Users/User/.claude" },
  "tasks": [
    { "id": "1", "repo": "claude", "files": [{ "path": "skills/apex-plan/SKILL.md", "op": "modify" }], "depends_on": [] },
    { "id": "2", "repo": "claude", "files": [{ "path": "skills/apex-plan/references/sol-plan-check.md", "op": "modify" }], "depends_on": [] },
    { "id": "3", "repo": "claude", "files": [{ "path": "agents/apex-critic.md", "op": "modify" }], "depends_on": [] },
    { "id": "4", "repo": "claude", "files": [{ "path": "skills/apex-orchestrate/SKILL.md", "op": "modify" }, { "path": "skills/apex-plan/references/model-routing.md", "op": "modify" }, { "path": "hooks/apex-session-context.md", "op": "modify" }], "depends_on": [] }
  ]
}
```

## Tasks

Coders transcribe only their task's quoted edits, preserve all other text and encoding, and each coder task runs only its own tagged check, never the full verify recipe. Line numbers below refer to the pre-build sources; exact quoted anchors govern. The Engine/HOST run the verify fence natively; H3 is the HOST's full native run after integration. No scripts or tests are changed.

- [ ] **Task 1** — T1: planning rules — files: skills/apex-plan/SKILL.md — done when: edits 1.1–1.9 are present and Task 1 checks pass.

### T1 exact edits

1.1 In frontmatter replace `version: 2.9.3` with `version: 2.10.0` and `last_updated: 2026-10-15` with `last_updated: 2026-10-21`.

1.2 In `## Intake`, in the stop-rule paragraph beginning `A completed plan archived` (~83), insert the following text immediately after the sentence ending `is new work that enters Intake as a new plan.`; keep the rest of that paragraph intact:

```text
 A contract change is a change to anything in the plan's cross-slice contracts section or a slice's cross-slice contracts field, or to a public API, data format, schema, entry point, persisted state, invariant other code relies on, or user-visible behaviour. Test-only edits, fixture relabels/renames, wording/clarification, and internal restructuring that keeps those contracts are not contract changes; record them in the handoff and do not stop the plan.
```

1.3 In the following paragraph beginning `The archived-slice rule` (~85), replace the contiguous text beginning `For either disposition, the HOST expands the affected-spec list` and ending `The HOST renames the slices-table entries before the re-approval gate dispatch.` inclusive with this single paragraph:

```text
For either disposition, the HOST assigns every replaced spec a replacement name no spec or draft has used and inspects every unbuilt spec whose `## Prerequisites` names it, whether in the same plan, another plan, or no plan. Only a consumer relying on a contract the replacement changed is added to the affected-spec list; repeat this inspection through affected consumers until none remain. A contract-affected consumer in another plan stops that other plan under the stop rule with trigger `prereq:<replaced-spec>` and is deleted and re-authored through that plan's re-approval. A contract-affected consumer in the same plan or outside any plan is deleted and re-authored under the same owner-approved disposition, with no new stop trigger. Every consumer not relying on a changed contract is retained: only a consumer with no running, parked, paused or awaiting-review Engine run, drain, or in-flight HOST dispatch has its prerequisite entry renamed to the replacement automatically, via an author revise dispatch for a draft or a one-line HOST edit for a promoted spec in `docs/changes/`. A retained consumer with any such run, drain, or dispatch goes to the OWNER for run disposition first; its prerequisite rename happens only after that disposition. The owner-approved replacement disposition lists every consumer prerequisite rename and every plan slices-table rename; that approval is the live attended confirmation for the one-line HOST edits to promoted specs. Log each prerequisite and slices-table rename in the handoff's decisions table. With owner approval, the HOST deletes each listed spec together with its review sidecar, findings, and any `docs/progress/<name>.md` capture-at-halt record. Each affected slice is re-authored as a fresh spec under its unused replacement name with its own new review record. The HOST applies the listed slices-table renames before the re-approval gate dispatch.
```

In the remaining tail of that same paragraph, replace the occurrence of `prereq:<deleted-spec>` with `prereq:<replaced-spec>`. Preserve the remaining archived-slice, hold, no-move-back, current-wave and two-read-budget rules.

1.4 In `## Writing the spec`, make exactly these four replacements:

| Anchor | Replace | With |
|--------|---------|------|
| `spec author:` (~129) | `spec author: gpt-6-sol through the wrapper's author mode.` | `spec author: gpt-6.1-sol through the wrapper's author mode.` |
| create command (~139) | `-AuthorSpec -Model gpt-6-sol -Task author` | `-AuthorSpec -Model gpt-6.1-sol -Task author` |
| revise description (~148) | `fresh, stateless gpt-6-sol` | `fresh, stateless gpt-6.1-sol` |
| `## Closing the session`, Trial log row example (~422) | `gpt-6-sol create x2; revise gpt-6-sol x1` | `gpt-6.1-sol create x2; revise gpt-6.1-sol x1` |

1.5 In `## Dispatched spec review`, replace the two paragraphs beginning `Before dispatching, the host runs` and `The host saves each round's returned JSON verbatim as` (~263–273), up to the following `### Convergence control` heading, with:

```text
Before dispatching, the HOST runs `git hash-object <draft>`, records it in the round's sidecar row,
and passes `SPEC-DIGEST: <sha>` as the FIRST prompt line. The first non-VOID reviewer-family round of a spec is always a full fresh review (round 1), even when a Sol pre-draft pass against a live draft or cold read already caused an author revise. A fix check applies only after a prior non-VOID reviewer-family findings file exists; supply that immediately prior file plus the current full draft. Also supply the Sol BLOCK findings when confirming an author repair of a post-readiness cold read or a pre-draft pass against an existing draft.

The HOST saves each round's JSON verbatim as `docs/drafts/<short-name>.round-<N>.findings.json`.
At adjudication it re-hashes the draft; a mismatch makes the verdict VOID and discards findings unread. After a round containing at least one BLOCK, the HOST adjudicates, sends accepted fixes through an author revise dispatch, and automatically dispatches the next fix check while under the risk-tier ceiling, without asking the OWNER. After a no-BLOCK round with accepted FLAG fixes,
send those fixes through author revise and run exactly one confirmation fix check, subject to the
ceiling. A clean or flag/note-only confirmation ends the loop; flags/notes alone never open another
round. A BLOCK in that confirmation continues the BLOCK loop while under the ceiling. A clean
round, or a no-BLOCK round with no accepted FLAG fixes, proceeds to the readiness gate. The HOST
records remaining flags/notes as accepted in the sidecar Disposition. Any required round beyond
the ceiling follows the OWNER choices in Convergence control, including a confirmation after
FLAG fixes accepted in the last allowed round.

```

1.6 Replace the heading `### Convergence control — 3 rounds per SPEC LIFETIME, plus one owner-approved cycle` with `### Convergence control — risk-tier ceiling per SPEC LIFETIME`.

Under that heading, replace the contiguous block beginning `**Cap semantics, in the same breath:**` and ending immediately before `- **Same-path constraint.**` (~299–318) with:

```text
**Ceiling semantics:** a `pending` row counts; only a completed row with Disposition `VOID` (including `VOID (digest moved)`) does not. Count non-VOID reviewer-family rows per spec lifetime.

- **Reviewer family and ceiling.** Only integer-numbered `apex-critic:spec:<sonnet|opus>` rows count: Low 3, Medium 5, High 10. Doc-only is Low unless it declares `risk: high`; explicit High wins. Sol, author, and owner rows do not count. A re-draft never resets the counter.
  An owner-approved deletion under the re-approval / Normal-to-Big rule ends the deleted spec's lifetime: for a draft, first append its deletion `owner` row to the spec's review sidecar (`docs/drafts/<short-name>.review.log`) and its dated trial-log row to
  `C:/Users/User/apex/docs/research/spec-author-trial.md`, then delete draft, sidecar and findings;
  a promoted spec already has its trial row and no sidecar, so delete it with no new rows. Its replacement under an unused name starts a new lifetime. A retained consumer whose prerequisite alone is renamed keeps its name, review sidecar, findings, and lifetime count.
- **Host precondition — read before you dispatch.** Read the sidecar and count non-VOID reviewer-family rows before every Critic spec-mode dispatch (`pending` counts). Below the tier's ceiling, append the next phase-1 row and dispatch; zero means a full fresh round 1, even after an early Sol repair. At the ceiling, dispatch only with an `owner` row authorizing exactly one further fix-and-review cycle.
- **Ceiling escalation and precedence.** If a BLOCK is still open at the ceiling, or a required confirmation of accepted FLAG fixes would exceed it, the ceiling wins. Bring the findings to the OWNER: (a) accept the open findings and promote, (b) exactly one further fix-and-review cycle, or (c) park or kill. Append an `owner` row recording the choice before proceeding.
  Choice (b) authorizes one author revise followed by one non-VOID Critic fix check under the
  same model, digest, lifecycle, VOID and write-barrier rules; pass the prior reviewer-family findings and current full draft, plus any Sol BLOCK findings being repaired. A clean or flag/note-only extra check ends the loop; record remaining flags/notes as accepted in its
  Disposition. An open BLOCK after that extra check returns to the OWNER for only (a) or (c),
  recorded in another `owner` row. Once the owner-approved further cycle has been used for a spec, any later escalation for that spec, including a post-readiness Sol cold-read BLOCK, offers only (a) accept and promote or (c) park or kill. Flags/notes alone never authorize another extra check.
- **Sol repair uses the same ceiling.** A BLOCK from the post-readiness Sol cold read (Medium
  or High), or from a pre-draft pass once a draft exists, is adjudicated and fixed by author
  revise, then reviewed by Critic against this same lifetime ceiling: a full fresh round 1 when no prior non-VOID reviewer-family findings file exists, otherwise a fix check.
  Continue automatically while under the ceiling; ask the OWNER only under the escalation
  rule above. Keep the no-draft-yet High pre-draft approval gate before first author dispatch.
```

1.7 In `## Readiness gate — Deep Details only`, replace the five-line checkbox beginning `[ ] Review rounds` and ending `non-clean extra review follow the OWNER choices in Convergence control.` (~363–367) with:

```text
[ ] Review rounds — before any further Critic spec-mode dispatch, the sidecar has fewer non-VOID
                    reviewer-family rows than Low 3 / Medium 5 / High 10 (doc-only Low unless
                    explicit High; pending counts, completed VOID does not), or an `owner` row
                    authorizes exactly one extra cycle. A required round beyond the ceiling,
                    including FLAG-fix confirmation, follows Convergence control's OWNER choices.
```

1.8 Replace the single checkbox line ``[ ] Review        — Critic status is clean, or an `owner` row accepts the open findings.`` (~374) with:

```text
[ ] Review        — a clean round; a flag/note-only confirmation ending the loop with remaining
                    flags/notes recorded by the HOST as accepted in the sidecar Disposition;
                    or an `owner` row accepting the open findings. A no-BLOCK round with no
                    accepted FLAG fixes also ends the loop with residual flags/notes accepted.
```

1.9 In the paragraph immediately after the readiness checkbox fence, replace the two lines beginning `It is advisory for Medium` and ending `promotion. Sol never edits the spec. For High work you may *offer* (never auto-run) the ≤2-round` with:

```text
A Medium or High Sol BLOCK follows Convergence control's author-revise and Critic-confirmation
path under the same ceiling; an unresolved High BLOCK gates promotion unless the OWNER accepts
it there. Sol never edits the spec. For High work you may *offer* (never auto-run) the ≤2-round
```

Keep the following `cross-model deliberation in that reference.` line. The final file must be ≤500 lines; transcribe the replacement blocks with their shown line breaks and preserve all untouched lines except for these two one-phrase replacements:

- Replace `Author rows never count toward the reviewer-family round cap` with `Author rows never count toward the reviewer-family round ceiling`.
- In the VOID-row sentence, replace this exact live text (preserving its line break and indentation):

```text
does not count against the cap; the write
  barrier, not the cap, is what stops cycling
```

with:

```text
does not count against the ceiling; the write
  barrier, not the ceiling, is what stops cycling
```

- [ ] **Task 2** — T2: Sol repair boundary — files: skills/apex-plan/references/sol-plan-check.md — done when: edits 2.1–2.4 are present and Task 2 checks pass.

### T2 exact edits

2.1 In the opening paragraph replace `For a gpt-6-sol-authored spec (ADR-048),` with `For a gpt-6.1-sol-authored spec (ADR-048),`.

2.2 Under `## The cold read (the gate)`, replace the bullet beginning `- Every plan-check dispatch appends its own digest-bound row` through `repair cycling is bounded by the announced pass-or-park rule, not by that cap.` (~40–44) with:

```text
- Every plan-check dispatch appends its own digest-bound `sol-N` row to
  `docs/drafts/<short-name>.review.log` (apex-plan § Convergence control). Sol rows are separate
  from the reviewer-family risk-tier ceiling: Low 3 / Medium 5 / High 10 non-VOID Critic spec-mode
  rows per spec lifetime (doc-only Low unless explicit High). The `SPEC-DIGEST` header remains
  mandatory; a digest mismatch at adjudication makes the verdict VOID. Sol dispatches remain
  bounded by the announced pass-or-park rule. A Medium or High post-readiness cold-read BLOCK
  is adjudicated and fixed by author revise, then reviewed by Critic against
  that same reviewer-family ceiling: a full fresh round 1 without prior non-VOID reviewer-family findings, otherwise a fix check. Continue automatically under it; ask the OWNER only when
  an open BLOCK or required FLAG-fix confirmation would require a round beyond the ceiling:
  (a) accept and promote, (b) exactly one further fix-and-review cycle, (c) park or kill, recorded
  as an `owner` row. Once that extra cycle has been used for a spec, any later escalation, including a post-readiness Sol cold-read BLOCK, offers only (a) accept and promote or (c) park or kill.
```

2.3 In `## Disposition`, replace the rows beginning `| routine | FLAG / BLOCK |` and ``| `risk: high` | BLOCK |`` with these three rows:

```text
| routine | FLAG | advisory — resolve or explicitly accept with reasoning (verify-before-implementing: findings can be wrong; rebut with evidence, no performative agreement) |
| Medium or High | BLOCK | HOST adjudicates and sends accepted fixes through author revise, then a Critic review against the same reviewer-family risk-tier ceiling (full fresh round 1 without prior non-VOID reviewer-family findings, otherwise a fix check); OWNER escalation only at that ceiling under apex-plan § Convergence control |
| `risk: high` | unresolved BLOCK | promotion remains blocked unless the OWNER accepts the open finding under the ceiling disposition; optional deliberation retains its existing user-invoked ≤2-round budget |
```

2.4 Under `## Pre-draft architecture pass (ADR-032 §1b)`, replace only the `- **Disposition:**` bullet ending `author. Sol never writes the plan and never edits the spec.` (~213–217) with:

```text
- **Disposition:** when no draft exists, advisory for routine specs; **blocking for `risk: high`**.
  The no-draft-yet blocking path is an **approval gate**: on an unresolved arch-pass BLOCK for
  a `risk: high` plan, print the **apex-governance § Approval gate** banner and get the explicit
  `Approve? [y / n / edit]` answer **BEFORE any spec-author dispatch**. Adjudicate findings into
  the PLAN before dispatching the author. Once a draft exists, an arch-pass BLOCK is adjudicated
  and fixed by author revise, then reviewed by Critic (full fresh round 1 without prior non-VOID reviewer-family findings, otherwise a fix check) against the same
  reviewer-family risk-tier ceiling, with OWNER escalation only per apex-plan § Convergence
  control at the ceiling. Sol never writes the plan and never edits the spec.
```

In the `- **Round record — ALWAYS WHEN DISPATCHED.**` bullet (~227), replace `separate from the Critic spec-mode 3-round cap and` with `separate from the reviewer-family risk-tier ceiling (Low 3 / Medium 5 / High 10) and`. Keep `bounded by pass-or-park.` and all digest-sentinel, VOID, independence, planning-gate two-read and ≤2-round deliberation rules unchanged.

Replace `Gate rows never count toward a spec round cap.` with `Gate rows never count toward a spec reviewer-family ceiling.`

- [ ] **Task 3** — T3: Critic mode ceilings — files: agents/apex-critic.md — done when: edits 3.1–3.3 are present and Task 3 checks pass.

### T3 exact edits

3.1 In `## Required dispatch inputs`, replace the four-line paragraph beginning `Every dispatch supplies` and ending `records approval for exactly one further fix-and-review cycle.` (~19–22) with:

```text
Every dispatch supplies `mode: spec` or `mode: code` and may state its round number. A dispatch
with prior findings is a fix check; one without is round 1 (full review). In spec mode only,
the first non-VOID reviewer-family round is always a full fresh review (round 1), even after a Sol pre-draft pass against a live draft or cold read caused an author revise; Sol findings alone never make it a fix check. The lifetime ceiling is Low 3 / Medium 5 / High 10 non-VOID reviewer-family rows; doc-only is Low
unless explicit High. Pending rows count; completed VOID rows do not. The HOST may dispatch
exactly one extra fix-and-review cycle only with a recorded OWNER approval. Code mode retains
the apex-code three-round cap plus exactly one owner-approved fix-and-review cycle.
```

3.2 Under `## Review rounds`, replace the five lines beginning `Rounds 2 and 3 are fix checks.` and ending `from it.` (~85–89) with:

```text
In spec mode, the first non-VOID reviewer-family round is a full fresh review (round 1), even after an early Sol repair; every round after round 1 is a fix check only when a prior non-VOID reviewer-family findings file exists, under the Low 3 / Medium 5 / High 10
reviewer-family lifetime ceiling and its one owner-approved extra cycle. In code mode, rounds
2 and 3 (and the one owner-approved extra cycle) are fix checks under apex-code's unchanged cap.
Each receives the prior round's findings file and the current full draft (`mode: spec`) or
current full code diff (`mode: code`). A spec review confirming an author repair of a Sol BLOCK
also receives those Sol findings; Sol rows do not consume the reviewer-family ceiling.
For every supplied finding, determine whether it is fixed or not fixed. Report every not-fixed defect.
Also report new defects noticed in text touched by those fixes. Do not re-audit unchanged text
or introduce findings from it. Spec-mode dispatch and termination follow apex-plan Convergence
control: automatic BLOCK repairs under the ceiling; exactly one confirmation after accepted
FLAG fixes, subject to the ceiling; a clean or flag/note-only confirmation ends the loop.
Flags/notes alone never open further rounds; a confirmation BLOCK continues under the ceiling.
Only a required round beyond the ceiling goes to the OWNER for (a) accept and promote,
(b) exactly one further fix-and-review cycle, or (c) park or kill, recorded as an `owner` row.
An open BLOCK after that extra cycle returns for (a) or (c) only. Once the owner-approved further cycle has been used for a spec, any later escalation for that spec, including a post-readiness Sol cold-read BLOCK, offers only (a) accept and promote or (c) park or kill. Code-mode cadence remains
governed by apex-code.
```

3.3 Under ``### `mode: spec` ``, replace the line beginning `sidecar, log or findings file except` and ending `explicitly supplied for a fix check.` with:

```text
sidecar, log or findings file except the prior-round findings file explicitly supplied for a fix check
and any explicitly supplied Sol BLOCK findings whose author repair that spec review confirms (including a full fresh round 1).
```

- [ ] **Task 4** — T4: author routing — files: skills/apex-orchestrate/SKILL.md, skills/apex-plan/references/model-routing.md, hooks/apex-session-context.md — done when: edits 4.1–4.3 are present after attended hook confirmation and Task 4 checks pass.

### T4 exact edits

Before T4 starts, obtain live attended confirmation naming the hook path and its Spec author row replacement below. An unattended build parks T4; this spec does not pre-authorize that critical edit.

4.1 In apex-orchestrate frontmatter replace `version: 2.7.1` with `version: 2.7.2` and `last_updated: 2026-10-15` with `last_updated: 2026-10-21`. In `## 3. Route`, in the `plan · design · architect · spec` row (~62), replace only `a gpt-6-sol spec author` with `a gpt-6.1-sol spec author`.

4.2 In model-routing, in the opening routing paragraph (~13), replace only `Specs are authored by gpt-6-sol through the wrapper's` with `Specs are authored by gpt-6.1-sol through the wrapper's`.

4.3 In session-context, under `## Model routing (ADR-045)` (~31), replace this exact row:

```text
| Spec author | gpt-6-sol via the wrapper's `-AuthorSpec` (apex-plan, Writing the spec; ADR-048) |
```

with:

```text
| Spec author | gpt-6.1-sol via the wrapper's `-AuthorSpec` (apex-plan, Writing the spec; ADR-048) |
```

- [ ] **Task 5 (HOST)** — H1: history — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: the following two exact rows are inserted, in this order, immediately before the existing first event row beginning `| 2026-10-19 | apex-code |`.

```text
| 2026-10-21 | apex-plan | `skills/apex-plan/SKILL.md`, `skills/apex-plan/references/sol-plan-check.md`, `skills/apex-plan/references/model-routing.md`, `agents/apex-critic.md` | 2.10.0 | updated | planning-review-rules: spec-mode lifetime ceilings Low 3 / Medium 5 / High 10, automatic BLOCK repair and bounded FLAG confirmation, readiness terminal dispositions, contract-change boundary, contract-preserving prerequisite remaps, and gpt-6.1-sol author create/revise; code-mode and Sol budgets unchanged | docs/changes/planning-review-rules.md |
| 2026-10-21 | apex-orchestrate | `skills/apex-orchestrate/SKILL.md`, `hooks/apex-session-context.md` | 2.7.2 | updated | planning-review-rules: route spec authoring to gpt-6.1-sol; session-context Spec author row updated with live attended confirmation | docs/changes/planning-review-rules.md |
```

- [ ] **Task 6 (HOST)** — H2: changelog — files: C:/Users/User/apex/CHANGELOG.md — done when: insert the following exact bullet immediately below `### Changed` under `## [Unreleased]`, before the existing apex-code retirement bullet.

```text
- Planning review rules (2026-10-21, planning-review-rules, apex-plan 2.10.0, apex-orchestrate 2.7.2): spec-mode lifetime ceilings Low 3 / Medium 5 / High 10; automatic BLOCK repair and one FLAG-fix confirmation subject to the ceiling; readiness accepts terminal confirmations or owner acceptance; explicit Big-plan contract-change boundary; contract-preserving replacement prerequisite and slices-table renames logged in the handoff; spec author create/revise uses gpt-6.1-sol. Code-mode Critic cadence and independent Sol budgets are unchanged.
```

- [ ] **Task 7 (HOST)** — H3: integrated verification — files: (none) — done when: run the full build-root AGENTS.md Verify commands fence natively after T1–T4 and H1–H2, with explicit native exit checks as reproduced in Acceptance Criteria; run scope and pointer checks; report pre-existing dirty paths. Do not read docs/status.md or run the separate apex-repo status-file cap recipe in this dispatch.

## Wave plan

Wave 1: [task 1, task 2, task 3, task 4]

All four coder tasks are independent and file-disjoint; each manifest `depends_on` is empty. HOST handles the attended manual path for critical-hook or HOST-bookkeeping refusals. H1 and H2 follow successful T1–T4 integration; H3 follows H1 and H2. Each coder task runs only its own tagged check, never the full verify recipe; the Engine/HOST run the fence natively, and H3 is the HOST's full native run.

## Permissions

The following NON-CRITICAL actions will run autonomously during build. Approving this spec approves all of them.
Critical paths — .env · migrations · auth/authz/crypto · CI config · dependency manifests and lockfiles · infra-as-code · secrets/keys/certs · host-state (`status.md`, root AGENTS.md, root CLAUDE.md, docs/changes/, docs/handoff/, the run ledger) · the permission settings and the hooks — are NEVER pre-authorised by this section. They need a live attended confirmation at build time, and an AFK run parks them (D3, ADR-046; apex-governance is canonical). (Sole exception: the docs agents' three host's-pen artifacts — the handoff, `status.md`, and spec archival — under D6.)

docs/audit/ is different and stricter: TIER-1, refused outright on a path match. No confirmation authorises a write there — not attended, not by any switch, not by this section. (D5's append-only exception is doctrine pending a content-aware classifier change; it is not a live permission.)

### File Operations

| Action | Paths |
|--------|-------|
| Create | (none) |
| Modify | skills/apex-plan/SKILL.md; skills/apex-plan/references/sol-plan-check.md; agents/apex-critic.md; skills/apex-orchestrate/SKILL.md; skills/apex-plan/references/model-routing.md; C:/Users/User/apex/SKILL-HISTORY.md; C:/Users/User/apex/CHANGELOG.md |
| Modify — critical, live attended confirmation only | hooks/apex-session-context.md |
| Delete | (none) |

### Commands

| Command | Purpose |
|---------|---------|
| Task-bound acceptance fences below | Read-only presence/absence, versions/dates, caps, and pointers in each coder's files |
| HOST acceptance fences below | Bookkeeping presence, structural integration and full native verify fence |
| `git status --porcelain -uall` | Engine/HOST capture baseline and final scope in both repos |
| `git diff -- <owned paths>` | Engine/HOST inspect only the assigned changes |
| Read-only source and anchor inspection; exact prose replacement | Execute the task text within its file scope |

### Git Operations

| Operation | Scope |
|-----------|-------|
| Read-only status and diff | Engine/HOST in both repos |
| Coder Git operations | None; no staging, commits, pushes, restoration, or stashing |
| Engine integration staging/commits | Allowed build mechanics |

### Environment Access

| Variable | Purpose |
|----------|---------|
| (none) | No environment changes |

### Network

| Action | Purpose |
|--------|---------|
| (none) | No network access required |

## Specialist Context

### Security

Critical hook: obtain live attended confirmation before T4; unattended parks. No governance, permission-setting, or executable hook changes.

### Performance

(none)

### Accessibility

(none)

## Documentation

| Doc type | File | Action |
|----------|------|--------|
| Skill history | C:/Users/User/apex/SKILL-HISTORY.md | H1: insert the two quoted rows |
| Changelog | C:/Users/User/apex/CHANGELOG.md | H2: insert the quoted Unreleased Changed bullet |
| Index | SKILLS.md | No edit; skill set unchanged |
| ADR | (none) | No ADR edit in this spec |

## Acceptance Criteria

Run every fence from the build root (the dispatched worktree; natively `C:/Users/User/.claude`). Each coder task runs only its own tagged check (the fence immediately labelled with that coder's Task number), never the full verify recipe. The Engine/HOST run the fence natively; H3 is the HOST's full native run. All unlabelled criteria are HOST-only after integration. Checks are presence/absence, versions/dates, caps and pointers; prose matching does not replace HOST transcription review.

- [ ] Task 1 - Planning rules are present; old all-tier three-round and author pin text are absent; version/date and ≤500-line cap pass; referenced local instruction pointers resolve.

```powershell apex-accept
$ErrorActionPreference = 'Stop'
$p = 'skills/apex-plan/SKILL.md'
$s = Get-Content -Raw -Encoding UTF8 $p
foreach ($required in @('version: 2.10.0', 'last_updated: 2026-10-21', 'A contract change is a change to anything', 'invariant other code relies on, or user-visible behaviour', 'Test-only edits, fixture relabels/renames', 'record them in the handoff and do not stop the plan', 'Only a consumer relying on a contract the replacement changed', 'only a consumer with no running, parked, paused or awaiting-review Engine run, drain, or in-flight HOST dispatch', 'goes to the OWNER for run disposition first; its prerequisite rename happens only after that disposition', 'prereq:<replaced-spec>', 'one-line HOST edit for a promoted spec', 'that approval is the live attended confirmation', "handoff's decisions table", 'alone is renamed keeps its name, review sidecar, findings, and lifetime count', 'Low 3, Medium 5, High 10', 'The first non-VOID reviewer-family round of a spec is always a full fresh review (round 1)', 'even when a Sol pre-draft pass against a live draft or cold read already caused an author revise', 'A fix check applies only after a prior non-VOID reviewer-family findings file exists', 'deletion `owner` row to the spec''s review sidecar (`docs/drafts/<short-name>.review.log`)', 'its dated trial-log row to', 'apex/docs/research/spec-author-trial.md', 'Doc-only is Low unless', 'automatically dispatches the next fix check', 'exactly one confirmation fix check', 'flags/notes alone never open another', 'FLAG fixes accepted in the last allowed round', 'Choice (b) authorizes one author revise', 'An open BLOCK after that extra check returns to the OWNER', 'Once the owner-approved further cycle has been used for a spec, any later escalation for that spec, including a post-readiness Sol cold-read BLOCK, offers only (a) accept and promote or (c) park or kill', 'post-readiness Sol cold read (Medium', 'or High), or from a pre-draft pass once a draft exists', 'Keep the no-draft-yet High pre-draft approval gate', 'flag/note-only confirmation ending the loop', 'or an `owner` row accepting the open findings', '-AuthorSpec -Model gpt-6.1-sol -Task author', 'fresh, stateless gpt-6.1-sol', 'gpt-6.1-sol create x2; revise gpt-6.1-sol x1')) { if (-not $s.Contains($required)) { throw ('Task 1 missing: ' + $required) } }
foreach ($forbidden in @('gpt-6-sol', ('rounds 2' + [char]0x2013 + '3 are fix checks'), ('Convergence control ' + [char]0x2014 + ' 3 rounds'), 'At every tier, the cap is three', 'Round-3 escalation', 'FEWER THAN 3', 'prereq:<deleted-spec>', 'It is advisory for Medium', 'Author rows never count toward the reviewer-family round cap', 'does not count against the cap; the write barrier, not the cap, is what stops cycling')) { if (($s -replace '\s+', ' ').Contains($forbidden)) { throw ('Task 1 stale: ' + $forbidden) } }
if (@(Get-Content -Encoding UTF8 $p).Count -gt 500) { throw 'Task 1 exceeds 500-line cap' }
foreach ($m in [regex]::Matches($s, '`(references/[a-z0-9-]+\.md)`')) { if (-not (Test-Path -LiteralPath (Join-Path 'skills/apex-plan' $m.Groups[1].Value) -PathType Leaf)) { throw ('Task 1 dangling pointer: ' + $m.Value) } }
if (-not (Test-Path -LiteralPath 'skills/apex-critic' -PathType Container) -and -not (Test-Path -LiteralPath 'agents/apex-critic.md' -PathType Leaf)) { throw 'Critic pointer missing' }
```

- [ ] Task 2 - Sol repair uses the shared risk-tier ceiling; stale cap/model text is absent; the no-draft High gate, pass-or-park, two-read and deliberation budgets remain present; pointers resolve.

```powershell apex-accept
$ErrorActionPreference = 'Stop'
$s = Get-Content -Raw -Encoding UTF8 'skills/apex-plan/references/sol-plan-check.md'
foreach ($required in @('For a gpt-6.1-sol-authored spec', 'reviewer-family risk-tier ceiling', 'Low 3 / Medium 5 / High 10', 'Sol dispatches remain', 'bounded by the announced pass-or-park rule', 'A Medium or High post-readiness cold-read BLOCK', 'then reviewed by Critic against', 'a full fresh round 1 without prior non-VOID reviewer-family findings, otherwise a fix check', 'Continue automatically under it; ask the OWNER only when', 'required FLAG-fix confirmation', '(b) exactly one further fix-and-review cycle', 'as an `owner` row', 'Once that extra cycle has been used for a spec, any later escalation, including a post-readiness Sol cold-read BLOCK, offers only (a) accept and promote or (c) park or kill', 'no draft exists, advisory for routine specs', '**BEFORE any spec-author dispatch**', 'Once a draft exists, an arch-pass BLOCK', 'maximum two reads per gate', 'Then pass or park both sides for the owner', ('**' + [char]0x2264 + '2 rounds**'), ([char]0x2264 + '2-round Tier 1 cap'), 'bounded by pass-or-park.', 'the digest-mismatch/VOID check is a DEFINED NO-OP', 'Gate rows never count toward a spec reviewer-family ceiling.')) { if (-not $s.Contains($required)) { throw ('Task 2 missing: ' + $required) } }
foreach ($forbidden in @('3-round cap', 'gpt-6-sol-authored', '| routine | FLAG / BLOCK |', 'Gate rows never count toward a spec round cap.')) { if ($s.Contains($forbidden)) { throw ('Task 2 stale: ' + $forbidden) } }
foreach ($p in @('skills/apex-plan/SKILL.md', 'skills/apex-code/scripts/codex-dispatch.ps1', 'skills/apex-code/references/codex-review-schema.json', 'skills/apex-governance/SKILL.md')) { if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { throw ('Task 2 dangling pointer: ' + $p) } }
```

- [ ] Task 3 - Critic explicitly separates spec and code ceilings and supports later fix checks and Sol finding confirmation; old shared range/cap wording is absent; instruction pointers resolve.

```powershell apex-accept
$ErrorActionPreference = 'Stop'
$s = Get-Content -Raw -Encoding UTF8 'agents/apex-critic.md'
foreach ($required in @('In spec mode only', 'Low 3 / Medium 5 / High 10', 'Pending rows count; completed VOID rows do not', 'Code mode retains', 'apex-code three-round cap plus exactly one owner-approved', 'the first non-VOID reviewer-family round is always a full fresh review (round 1)', 'even after a Sol pre-draft pass against a live draft or cold read caused an author revise', 'Sol findings alone never make it a fix check', 'every round after round 1 is a fix check only when a prior non-VOID reviewer-family findings file exists', 'current full draft (`mode: spec`)', 'current full code diff (`mode: code`)', 'Sol rows do not consume the reviewer-family ceiling', 'Do not re-audit unchanged text', 'exactly one confirmation after accepted', 'Flags/notes alone never open further rounds', 'An open BLOCK after that extra cycle returns for (a) or (c) only', 'Once the owner-approved further cycle has been used for a spec, any later escalation for that spec, including a post-readiness Sol cold-read BLOCK, offers only (a) accept and promote or (c) park or kill')) { if (-not $s.Contains($required)) { throw ('Task 3 missing: ' + $required) } }
foreach ($forbidden in @('round number from 1', '(rounds 2-3)', 'Three rounds is the maximum unless', 'Rounds 2 and 3 are fix checks.')) { if ($s.Contains($forbidden)) { throw ('Task 3 stale: ' + $forbidden) } }
foreach ($p in @('skills/apex-plan/SKILL.md', 'skills/apex-code/SKILL.md', 'skills/apex-code/references/afk-endgate.md')) { if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { throw ('Task 3 dangling pointer: ' + $p) } }
```

- [ ] Task 4 - All three routing sources name gpt-6.1-sol; orchestrate version/date and hard cap pass; stale author names are absent; wrapper/skill pointers resolve. HOST records attended confirmation before execution.

```powershell apex-accept
$ErrorActionPreference = 'Stop'
$o = Get-Content -Raw -Encoding UTF8 'skills/apex-orchestrate/SKILL.md'
$m = Get-Content -Raw -Encoding UTF8 'skills/apex-plan/references/model-routing.md'
$h = Get-Content -Raw -Encoding UTF8 'hooks/apex-session-context.md'
foreach ($required in @('version: 2.7.2', 'last_updated: 2026-10-21', 'a gpt-6.1-sol spec author')) { if (-not $o.Contains($required)) { throw ('Task 4 missing orchestrate: ' + $required) } }
if (-not $m.Contains('Specs are authored by gpt-6.1-sol')) { throw 'Task 4 routing reference stale' }
if (-not $h.Contains('| Spec author | gpt-6.1-sol via')) { throw 'Task 4 hook author row stale' }
foreach ($s in @($o, $m, $h)) { if ($s.Contains('gpt-6-sol')) { throw 'Task 4 old author model remains' } }
if (@(Get-Content -Encoding UTF8 'skills/apex-orchestrate/SKILL.md').Count -gt 500) { throw 'Orchestrate exceeds 500 lines' }
foreach ($p in @('skills/apex-plan/SKILL.md', 'skills/apex-code/scripts/codex-dispatch.ps1')) { if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { throw ('Task 4 dangling pointer: ' + $p) } }
```

- [ ] HOST check: bookkeeping (H1/H2; Task 5 and Task 6) - Both dated version rows and the Unreleased Changed bullet are present; no skill-index edit is needed.

```powershell
$ErrorActionPreference = 'Stop'
$h = Get-Content -Raw -Encoding UTF8 '../apex/SKILL-HISTORY.md'
$c = Get-Content -Raw -Encoding UTF8 '../apex/CHANGELOG.md'
if ($h -notmatch '(?m)^\| 2026-10-21 \| apex-plan \|[^\r\n]+\| 2\.10\.0 \| updated \| planning-review-rules:') { throw 'H1 apex-plan history row missing' }
if ($h -notmatch '(?m)^\| 2026-10-21 \| apex-orchestrate \|[^\r\n]+\| 2\.7\.2 \| updated \| planning-review-rules:') { throw 'H1 orchestrate history row missing' }
if ($c -notmatch '(?ms)^## \[Unreleased\](?:(?!^## ).)*^### Changed\r?\n- Planning review rules \(2026-10-21, planning-review-rules, apex-plan 2\.10\.0, apex-orchestrate 2\.7\.2\):') { throw 'H2 Unreleased Changed bullet missing' }
```

- [ ] HOST check: structural integration (H3; Task 7) - All apex skill entry points stay ≤500 lines; literal home-skill pointers in the six edited build files resolve. No status file is read.

```powershell
$ErrorActionPreference = 'Stop'
foreach ($p in Get-ChildItem -Path 'skills/apex-*/SKILL.md' -File) { if (@(Get-Content -Encoding UTF8 $p.FullName).Count -gt 500) { throw ('Skill over cap: ' + $p.FullName) } }
$paths = @('skills/apex-plan/SKILL.md', 'skills/apex-plan/references/sol-plan-check.md', 'agents/apex-critic.md', 'skills/apex-orchestrate/SKILL.md', 'skills/apex-plan/references/model-routing.md', 'hooks/apex-session-context.md')
foreach ($p in $paths) {
  $s = Get-Content -Raw -Encoding UTF8 $p
  foreach ($m in [regex]::Matches($s, '~/\.claude/skills/apex-[a-z-]+')) {
    $target = $m.Value.Substring('~/.claude/'.Length)
    if (-not (Test-Path -LiteralPath (Join-Path $target 'SKILL.md') -PathType Leaf)) { throw ('Dangling skill pointer in ' + $p + ': ' + $m.Value) }
  }
}
```

- [ ] HOST check: native verification (H3) - Every command in the build repo's AGENTS.md `## Verify commands` fence passes natively; coders do not run this fence.

```powershell
$ErrorActionPreference = 'Stop'
node --check hooks/destructive-command-guard.js
if ($LASTEXITCODE -ne 0) { throw 'destructive-command-guard syntax failed' }
node --check hooks/lib/destructive-detect.js
if ($LASTEXITCODE -ne 0) { throw 'destructive-detect syntax failed' }
python hooks/destructive-guard-test.py
if ($LASTEXITCODE -ne 0) { throw 'destructive-guard-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/baseline-check-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'baseline-check-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/spec-validate-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'spec-validate-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-preflight-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'dispatch-preflight-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-events-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'dispatch-events-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/tree-pin-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'tree-pin-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/scope-check-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'scope-check-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/dispatch-author-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'dispatch-author-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-plan-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-plan-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-git-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-git-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-dispatch-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-dispatch-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-plan-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'apex-drain-plan-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case core
if ($LASTEXITCODE -ne 0) { throw 'apex-drain-test core failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case recovery
if ($LASTEXITCODE -ne 0) { throw 'apex-drain-test recovery failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case resume
if ($LASTEXITCODE -ne 0) { throw 'apex-drain-test resume failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-test.ps1 -Case safety
if ($LASTEXITCODE -ne 0) { throw 'apex-drain-test safety failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/apex-drain-close-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'apex-drain-close-test failed' }
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-map-check-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'apex-map-check-test failed' }
powershell.exe -NoProfile -File skills/apex-plan/scripts/apex-size-guard-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'apex-size-guard-test failed' }
powershell.exe -NoProfile -File skills/apex-code/scripts/engine-test.ps1
if ($LASTEXITCODE -ne 0) { throw 'engine-test failed' }
```

- [ ] Scope — nothing written outside `## Files to Change` → verify: capture `git status --porcelain -uall` in both repos before and after the build; every changed listed path is present, and every other reported path was already dirty or belongs to a concurrent host edit. Name those paths in the report. Do not read their contents, restore them, or assert a total file count.
- [ ] Reachability — planning dispatch reaches the spec author through the orchestrate route and session hook; spec review and the Sol cold-read repair reach the Critic through the planning instructions → verify: HOST follows those named sections and confirms their model, ceiling, terminal disposition and code/spec boundary text agree after Task 1–4 checks pass. These are prose routes; no new executable boundary or script is introduced.

## Progress

_(The build writes here — do not edit manually)_
