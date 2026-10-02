---
spec: critic-consolidation
status: draft
autonomy_level: L2
risk: medium
max_parallel_codex: 2
---

# Spec: Critic consolidation
<!-- Governing contract: references/spec-contract.md. -->

**Identity:** Replace three reviewer agents with one risk-routed Critic for spec and code review.
<!-- Decision record: docs/technical/adr/ADR-048-role-redesign.md, items 15, 19, 25. -->

## Intent
- **Intent:** One `apex-critic` agent serves spec and code modes with a shared evidence and fix-check contract.
- **Invariants:** Three rounds maximum at every tier unless the OWNER records approval for exactly one further fix-and-review cycle; fresh full review first, fix checks thereafter; High code receives a review after every wave; the existing digest, sidecar, tree-pin, per-task family-gate and ledger binding, and reviewer-before-docs ordering continue.
- **Non-goals:** Stage 5 Engine, stage 6 planning gate, changing the Codex fallback review recipe, and historical or fixture rewrites.

## Assumptions
- All `agents/`, `skills/`, and `hooks/` paths below are relative to `C:/Users/User/.claude`; APEX paths are absolute → impact: Stop.
- The three changed skill versions start at 2.3.0, 2.5.0, and 2.18.1 respectively → impact: Stop.
- The owner runs the hook dispatch and integration and writes the five APEX close-out files; the coder does not write those paths → impact: Stop.

Simplicity check: One agent with two explicit modes and one shared finding shape; ADR-048 records the decision. Here, doc-only means every Files-to-Change path is documentation prose under `docs/`, an ADR, README, or CHANGELOG, and none is a skill (`SKILL.md`, `references/**`, `templates/**`), agent, hook, settings, script, or other config/instruction file. An explicit `risk: high` always overrides doc-only. This spec is `risk: medium` and is not doc-only.

## Prerequisites
- Specs that must be complete first: role-redesign stage 1 shipped (~/.claude 6a92f8b·757164d·b241d03; apex ddecc74). Stages 2–3 are measurement swaps and are NOT prerequisites.
- Environment setup required: read access to `C:/Users/User/.claude` and the owner-run hook path; no package installation.

## Files to Change

| File | Operation | Notes |
|------|-----------|-------|
| agents/apex-critic.md | create | Shared spec/code Critic agent. |
| agents/apex-spec-reviewer.md | delete | Retired spec reviewer. |
| agents/apex-reviewer.md | delete | Retired code reviewer. |
| agents/apex-wave-reviewer.md | delete | Retired wave reviewer. |
| skills/apex-plan/SKILL.md | modify | Spec routing, tier, rounds, sizing, Sol reads. |
| skills/apex-plan/references/sol-plan-check.md | modify | Medium/High Sol pass applicability. |
| skills/apex-code/SKILL.md | modify | Code Critic cadence and completion routing. |
| skills/apex-code/references/codex-review.md | modify | Claude-fallback-only Codex review. |
| skills/apex-code/references/afk-endgate.md | modify | Opus Critic code-mode end gate. |
| skills/apex-code/references/silent-regression-lenses.md | modify | Critic code-mode lens reference. |
| skills/apex-orchestrate/SKILL.md | modify | Built-code route. |
| skills/apex-orchestrate/templates/spec-template.md | modify | Risk and doc-only acceptance guidance. |
| agents/apex-docs-technical-agent.md | modify | Critic findings input. |
| hooks/apex-session-context.md | modify | Checker routing; **Layer-A critical, OWNER dispatch and integration only**. |
| C:/Users/User/apex/SKILL-HISTORY.md | modify | HOST writes changed-skill history rows. |
| C:/Users/User/apex/SKILLS.md | modify | HOST replaces three reviewer index rows with Critic. |
| C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | modify | HOST records stage 4 status. |
| C:/Users/User/apex/docs/technical/architecture/overview.md | modify | HOST updates Critic routing map. |

Grep evidence: `rg --no-ignore -o 'apex-(spec-reviewer|wave-reviewer|reviewer)'` on each `C:/Users/User/.claude` path, before this file list: `agents/apex-critic.md` 0 (absent); `agents/apex-spec-reviewer.md` 2; `agents/apex-reviewer.md` 2; `agents/apex-wave-reviewer.md` 1; `skills/apex-plan/SKILL.md` 5; `skills/apex-plan/references/sol-plan-check.md` 1; `skills/apex-code/SKILL.md` 2; `skills/apex-code/references/codex-review.md` 2; `skills/apex-code/references/afk-endgate.md` 1; `skills/apex-code/references/silent-regression-lenses.md` 1; `skills/apex-orchestrate/SKILL.md` 1; `skills/apex-orchestrate/templates/spec-template.md` 1; `agents/apex-docs-technical-agent.md` 2; `hooks/apex-session-context.md` 1. These are all 22 live old-name hits under `skills/`, `agents/`, and `hooks/` after the exclusions below.

Grep evidence: `rg -n 'critic|reviewer|ADR-048|stage 4|Sol rounds'` on each APEX path: `SKILL-HISTORY.md` 37 lines; `SKILLS.md` 4; `docs/technical/adr/ADR-048-role-redesign.md` 6; `docs/technical/architecture/overview.md` 6; `docs/research/spec-author-trial.md` 2. The three live reviewer-index rows are in `SKILLS.md`.

Grep evidence: the old-name consumer sweep was `rg --no-ignore -n 'apex-(spec-reviewer|wave-reviewer|reviewer)' skills agents hooks` with exclusions for `**/fixtures/**`, the dated `skills/apex-code/REVIEW-ENSEMBLE-DESIGN.md`, and `skills/apex-code/scripts/critical-files-test.ps1`. The last script has one old-name hit in the `Non-match - reviewer agent` test-data case (`Paths = @('agents/apex-reviewer.md')`), with no dispatch or agent-file dependency; leave it unchanged. Historical records and runtime logs outside `skills/`, `agents/`, and `hooks/` are not live consumers.

Grep evidence: `rg --no-ignore -n 'afk-endgate-schema\.json' skills agents hooks` found one reference in `skills/apex-code/references/afk-endgate.md` and two in `skills/apex-code/scripts/codex-dispatch.ps1`. The script selects that schema for its separate Codex endgate mode; the Claude Critic prompt no longer claims it as its return shape.

## Tasks

- [ ] **Task 1** — Create `agents/apex-critic.md` with frontmatter `name: apex-critic`, `tools: Read, Glob, Grep`, and `model: sonnet` as its default. The Agent tool's `model:` parameter takes precedence over the agent file's frontmatter `model:`; dispatchers pass `model: sonnet` for Low/Medium and doc-only and `model: opus` for High on every dispatch; do not add a second agent file. Define `mode: spec` as draft versus the supplied author prompt pack's plan brief and live named files, with other planning narrative and review sidecars out of scope; define `mode: code` as changed files versus the supplied spec's tasks, acceptance criteria, and specialist constraints, scoped to one wave or the whole build. In code mode read only changed files and supplied criteria/spec, plus the coding-principles reference if dispatched; never read planning narrative or review sidecars. Carry over the three retired agents' still-valid sufficiency, correctness, reversibility, scope, verifiability, assumptions, silent-regression, risky-pattern, evidence, and advisory-only rules. Require spec prompt line 1 `SPEC-DIGEST: <sha>`; require coder concerns pasted verbatim in code mode. Round 1 is a full adversarial read. Fix-check rounds 2–3 receive the prior round's findings file and the current full draft or code diff under review, check each prior finding fixed/not fixed, and report any new defect noticed in text touched by those fixes without re-auditing unchanged text. Return only `{status: clean|flag|block, findings:[{severity: block|flag|note, class, file, line, evidence, summary}]}`; `file` and `line` may be null for spec-level findings. `status` is the worst finding severity, with note-only or empty findings yielding `clean`. The Critic never edits. — files: agents/apex-critic.md — done when: both modes, fix-check inputs, and the fixed JSON shape are explicit.
- [ ] **Task 2** — In `skills/apex-plan/SKILL.md`, add spec `risk: low|medium|high` with absent = medium and doc-only = Low under the definition in Intent; explicit `risk: high` wins. Dispatch `apex-critic` `mode: spec` through the Agent tool, passing `model: sonnet` for Low/Medium and doc-only and `model: opus` for High on every dispatch; the Agent tool's `model:` parameter takes precedence over the agent file's default frontmatter `model: sonnet`. Pass the author prompt pack's plan brief as well as the draft so the Critic can judge intent fidelity; retain full first-line digest, sidecar row lifecycle, VOID, and write barrier. Reviewer-family rows mean Critic spec-mode rows, maximum three per spec lifetime at every tier unless the OWNER records approval for exactly one further fix-and-review cycle. Round 1 is full; after an author revise dispatch, rounds 2–3 receive the prior Critic findings file plus the current full draft under review. The host saves each round's returned JSON as `docs/drafts/<short-name>.round-<N>.findings.json` beside the sidecar and deletes these files with the sidecar at promotion. If round 3 status is not `clean`, send the Critic analysis to the OWNER and stop reviewer dispatch. The OWNER chooses (a) accept open findings and promote the spec, (b) exactly one further fix-and-review cycle, or (c) park or kill the spec; record the choice as an `owner` sidecar row before proceeding. If the extra review is not `clean`, return to the OWNER for only (a) or (c). Remove the post-cap closed-fix-list fresh-author path. In Writing the spec and Readiness gate, Low/doc-only skip both Sol passes; Medium/High retain both, with High BLOCK still gating. Make the split rule exempt doc-only from `>3 files or >2 phases`; use presence/absence, version/date, cap, pointer, and verify-fence criteria for doc-only, reserving exact-line manifests and whole-tree hashes for High. Bump frontmatter 2.5.0 → 2.6.0, set `last_updated` to the HOST's `Build date: YYYY-MM-DD` recorded in `## Progress` at build start, ensure ADR-048 source, and keep description unchanged. — files: skills/apex-plan/SKILL.md — done when: these planning rules replace the old reviewer and post-cap text.
- [ ] **Task 3** — In `skills/apex-plan/references/sol-plan-check.md`, state at the cold-read gate and pre-draft pass that Low and doc-only skip both reads, Medium/High keep both, and High BLOCK remains blocking; replace the old cross-family reviewer name with `apex-critic` spec mode and remove language making Sol mandatory after a Critic cap or for all Deep Details specs. Keep the existing read-only, digest-bound, sidecar, and deliberation mechanics where a Sol pass still applies. — files: skills/apex-plan/references/sol-plan-check.md — done when: both pass triggers match the tier table.
- [ ] **Task 4** — In `skills/apex-code/SKILL.md`, replace the old reviewer dispatch with `apex-critic` `mode: code` through the Agent tool, passing `model: sonnet` for Low/Medium and doc-only and `model: opus` for High on every dispatch; the Agent tool's `model:` parameter takes precedence over the agent file's default frontmatter `model: sonnet`. Dispatch after each integrated High-risk wave with only that wave's changed files and criteria, and once after the whole build otherwise; pass `<final>.concerns.md` verbatim. Use a three-round cap per review scope: full round 1, then fix-check rounds 2–3 after fixes and reverify, each receiving the prior findings file plus the current full diff under review. The host saves each round's returned JSON to `<APEX state dir>/critic/<spec>-<scope>-round-<N>.json`. If round 3 status is not `clean`, send the Critic analysis to the OWNER. The OWNER chooses (a) accept open findings and complete the task, (b) exactly one further fix-and-review cycle, or (c) park or kill the task; record the choice as an `owner` row in the decisions table before proceeding. If the extra review is not `clean`, return to the OWNER for only (a) or (c). For Codex-built work, the Claude Critic itself satisfies cross-family review; remove the extra Sol review. For Claude-fallback Sonnet builds retain the independent Codex review and the family gate. Preserve pin/VOID, serialized Critic-before-docs-agent order, and the existing per-task family-gate/ledger binding: the host appends one in-session review row per task build with `reviewed_run_id` = that task's wrapper run and `reviewed_tree_digest` = that task worktree's digest, even if Critic reviewed the integrated tree; run `apex-family-gate.ps1` per task as today, with no gate or ledger script changes. The AFK Opus end-of-run pass is round 1 of the whole-build code review, with no second whole-build review; later fix checks follow the same cap. Bump 2.18.1 → 2.19.0, set `last_updated` to the HOST's `Build date: YYYY-MM-DD` recorded in `## Progress` at build start, ensure ADR-048 source, description unchanged. — files: skills/apex-code/SKILL.md — done when: one cadence, per-task family binding, and AFK round rule govern wave and post-build paths.
- [ ] **Task 5** — In `skills/apex-code/references/codex-review.md`, keep the existing wrapper, schema, pin, verdict, and prompt recipe for Claude-fallback Sonnet builds; replace both old reviewer mentions with `apex-critic` code mode and state that Codex-built work receives no additional Sol cross-family pass. — files: skills/apex-code/references/codex-review.md — done when: fallback routing is explicit.
- [ ] **Task 6** — In `skills/apex-code/references/afk-endgate.md`, replace the generic Opus reviewer invocation with `apex-critic` `mode: code` through the Agent tool with `model: opus` on every dispatch (overriding the agent file's default frontmatter `model: sonnet`), carrying the whole-run diff/spec and independent-read constraint. This pass is round 1 of the whole-build code review; do not dispatch a second whole-build review, and use normal fix-check rounds 2–3 if fixes are made. Align the end-gate prompt and output mapping with Critic's fixed JSON shape. Map `block` findings to P1, `flag` to P2, and `note` to note in the existing handoff table; `clean` may still carry `note` findings and yields no P1/P2 findings. Remove the assertion that the legacy Codex endgate schema declares this Claude-agent return contract; that schema remains owned by the wrapper's separate endgate mode. Do not feed earlier Critic findings or coder summaries into this round-1 pass. — files: skills/apex-code/references/afk-endgate.md — done when: the AFK Opus pass has one unambiguous dispatch and return contract.
- [ ] **Task 7** — In `skills/apex-code/references/silent-regression-lenses.md`, change the integration-time reviewer reference to `apex-critic` code mode and keep all four existing lenses and the Codex fallback-review application. — files: skills/apex-code/references/silent-regression-lenses.md — done when: the lenses name the live review routes.
- [ ] **Task 8** — In `skills/apex-orchestrate/SKILL.md`, make the “review the built code” route dispatch `apex-critic` code mode with the Agent tool's `model: sonnet` for Low/Medium and doc-only or `model: opus` for High on every dispatch; its `model:` parameter takes precedence over the agent file's default frontmatter `model: sonnet`. Delegate the code review scope/cadence to apex-code. Bump 2.3.0 → 2.4.0, set `last_updated` to the HOST's `Build date: YYYY-MM-DD` recorded in `## Progress` at build start, ensure ADR-048 source, description unchanged. — files: skills/apex-orchestrate/SKILL.md — done when: the route no longer names a retired agent.
- [ ] **Task 9** — In `skills/apex-orchestrate/templates/spec-template.md`, add optional `risk: low|medium|high` with absent = medium, replace its retired reviewer name with `apex-critic` code mode, qualify the split comment with the doc-only exemption and the full definition in Intent, including explicit `risk: high` precedence, and change acceptance guidance to presence/absence greps, version/date, caps, pointers, and AGENTS verify fence for doc-only; reserve exact-line manifests and whole-tree content hashes for High risk. Keep the validator-required headings and task/criterion examples. — files: skills/apex-orchestrate/templates/spec-template.md — done when: newly drafted specs have the tier and doc-only instructions.
- [ ] **Task 10** — In `agents/apex-docs-technical-agent.md`, replace both references to output from the retired reviewer with `apex-critic` code-mode findings, preserving the separate `reviewer_findings` input and existing de-duplication from coder-summary fields. — files: agents/apex-docs-technical-agent.md — done when: the handoff input names Critic only.
- [ ] **Task 11 (critical, OWNER-run)** — In the Checker row of `hooks/apex-session-context.md`, name `apex-critic` spec/code modes and state that every Agent tool dispatch passes `model: sonnet` for Low/Medium and doc-only or `model: opus` for High; the Agent tool's `model:` parameter takes precedence over the agent file's default frontmatter `model: sonnet`; state that Low/doc-only skip the two Sol reads while Medium/High retain them, and Codex-built code gets no extra Sol cross-family pass. The OWNER runs this task's dispatch and integration because the auto-mode classifier blocks host self-modification of hooks. — files: hooks/apex-session-context.md — done when: the Checker row matches the new routing.
- [ ] **Task 12** — Delete the three retired definitions after Tasks 1–11 have landed and a live `rg --no-ignore` consumer sweep shows zero old-name hits outside the stated exclusions. — files: agents/apex-spec-reviewer.md, agents/apex-reviewer.md, agents/apex-wave-reviewer.md — done when: those three files are absent and the new agent exists.
- [ ] **Task 13 (HOST)** — Append `SKILL-HISTORY.md` rows dated with the HOST's `Build date: YYYY-MM-DD` from `## Progress` for the three minor SKILL.md bumps and the hook/agent retirement, citing ADR-048 and the relevant paths; do not rewrite historical rows. — files: C:/Users/User/apex/SKILL-HISTORY.md — done when: each changed skill has a new row.
- [ ] **Task 14 (HOST)** — In `SKILLS.md`, replace the three current reviewer roster rows with one `apex-critic` row naming both spec and code modes, their dispatch owners, and risk model tier; keep historical prose intact unless it presents a live route. — files: C:/Users/User/apex/SKILLS.md — done when: the current roster lists Critic once and no retired reviewer.
- [ ] **Task 15 (HOST)** — Add a concise implementation status note anchored to ADR-048's `### Rollout` numbered list item `4. Critic consolidation`, linking this spec and recording the shipped Critic routing. Record the owner's 2026-10-01 “plan stage 4” approval to build stage 4 before stages 2–3 as an amendment to rollout order; stages 2–3 remain measurement swaps to run later. Do not rewrite the decision. — files: C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md — done when: the `4. Critic consolidation` rollout item has a dated status note and the rollout-order amendment.
- [ ] **Task 16 (HOST)** — In the architecture overview's checker paragraph, replace the live `apex-spec-reviewer` route with `apex-critic` spec/code modes and the Low/Medium versus High tier, and state the Low/doc-only Sol skip. — files: C:/Users/User/apex/docs/technical/architecture/overview.md — done when: the live architecture map names Critic.

## Wave plan

Dependencies bind; each parallel wave has at most two file-disjoint coder tasks (`max_parallel_codex: 2`). Wave 1: [Task 1]. Wave 2: [Tasks 2, 4]. Wave 3: [Tasks 3, 5]. Wave 4: [Tasks 6, 7]. Wave 5: [Tasks 8, 9]. Wave 6: [Task 10]. Owner critical wave: [Task 11] after Tasks 1–10. Retirement wave: [Task 12] after Task 11 and the consumer sweep. Host close-out: [Tasks 13, 14], then [Tasks 15, 16]. No two tasks in a wave edit the same file.

## Permissions

The following non-critical actions are within this spec's build scope. Task 11 is a Layer-A hook and remains an attended OWNER dispatch/integration action; Tasks 13–16 are HOST writes, not coder writes. No approval here authorizes a hook write by the coder.

### File Operations

| Action | Paths |
|--------|-------|
| Create | agents/apex-critic.md |
| Modify (coder) | skills/apex-plan/SKILL.md, skills/apex-plan/references/sol-plan-check.md, skills/apex-code/SKILL.md, skills/apex-code/references/codex-review.md, skills/apex-code/references/afk-endgate.md, skills/apex-code/references/silent-regression-lenses.md, skills/apex-orchestrate/SKILL.md, skills/apex-orchestrate/templates/spec-template.md, agents/apex-docs-technical-agent.md |
| Modify (OWNER critical) | hooks/apex-session-context.md |
| Delete | agents/apex-spec-reviewer.md, agents/apex-reviewer.md, agents/apex-wave-reviewer.md |
| Modify (HOST close-out) | C:/Users/User/apex/SKILL-HISTORY.md, C:/Users/User/apex/SKILLS.md, C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md, C:/Users/User/apex/docs/technical/architecture/overview.md |

### Commands

| Command | Purpose |
|---------|---------|
| `rg --no-ignore` / `Select-String` | Presence/absence and live-consumer counts, including ignored skill files. |
| `Get-Content` / `Test-Path` | Frontmatter, file existence, and pointer inspection. |
| `git status --porcelain -uall` | Scope check, including untracked files. |
| `apex-spec-validate.ps1 -SpecPath $specPath` | Validate the spec contract. |
| The ten commands in the build repo's `AGENTS.md` verify fence | Run them in order from the build repo root. |

### Git Operations

| Operation | Scope |
|-----------|-------|
| Status only | Both repositories; no staging, commit, push, reset, stash, or archival in the coder task. |

### Environment Access

| Variable | Purpose |
|----------|---------|
| `USERPROFILE` | Resolve the read-only build repo and its verify tools. |

### Network

| Action | Purpose |
|--------|---------|
| None | Markdown-only change. |

## Specialist Context

### Security

The hook is Layer-A critical and Task 11 is OWNER-run. The Critic has read-only tools and never edits reviewed material.

### Performance

At most two parallel Codex tasks; at most three Critic rounds per spec or code-review scope unless the OWNER records approval for exactly one further fix-and-review cycle.

### Accessibility

(none)

## Documentation

| Doc type | File | Action |
|----------|------|--------|
| Skill history | C:/Users/User/apex/SKILL-HISTORY.md | HOST appends the dated rows from Task 13. |
| Agent index | C:/Users/User/apex/SKILLS.md | HOST performs Task 14. |
| ADR status | C:/Users/User/apex/docs/technical/adr/ADR-048-role-redesign.md | HOST performs Task 15. |
| Architecture map | C:/Users/User/apex/docs/technical/architecture/overview.md | HOST performs Task 16. |
| Trial log | Existing trial log | At promotion, HOST appends observed sidecar counts under apex-plan doctrine; this is outside the build tasks. |

## Acceptance Criteria

- [ ] Task 1 and Task 12 — unified agent is present and all three retired definitions are absent → verify: `Test-Path` on the four agent entries; `Select-String` confirms both modes, read-only tools, default sonnet, Agent tool `model:` precedence, digest-first spec input, author prompt pack brief, verbatim coder concerns, full/fix-check rounds with prior findings plus current full text/diff, and JSON `status: clean|flag|block` with finding severity `block|flag|note`, `class`, nullable `file`/`line`, `evidence`, and `summary`; note-only or empty findings yield `clean`.
- [ ] Task 2 and Task 3 — planning tiers, review cap, escalation, Sol skip, and doc-only sizing are explicit → verify: `Select-String` finds `risk:`, absent = medium, the full doc-only definition and explicit High precedence, both Sol skip sites, plan-brief dispatch, three rounds, full round 1 and fix checks with prior findings file and current full draft, saved per-round JSON beside the sidecar and deletion at promotion, round-3 non-`clean` owner escalation, the sidecar `owner` choices and one extra cycle with final accept/park-or-kill choice, and the High-only manifest/hash rule; it finds no live post-cap closed-fix-list author route.
- [ ] Tasks 4–7 — code review cadence, family routing, AFK pass, and lenses are aligned → verify: `Select-String` finds High after each wave, once at build end otherwise, per-round code findings files, fix checks with prior findings and current full diff, round-3 non-`clean` owner escalation with the one extra cycle and final accept/park-or-kill choice, the decisions-table `owner` row, one in-session ledger review row per task wrapper run and task-worktree digest even for an integrated-tree Critic review, unchanged per-task `apex-family-gate.ps1` invocation, Codex-built Claude Critic without an extra Sol pass, Claude-fallback Codex review, the opus AFK pass as whole-build round 1 without duplicate review, and four retained silent-regression lenses.
- [ ] Tasks 8–11 — orchestrator, template, docs agent, and Checker row name the live modes → verify: `rg --no-ignore -n 'apex-(spec-reviewer|wave-reviewer|reviewer)'` over live `skills/`, `agents/`, and `hooks/` returns zero outside the parked design document, fixture trees, and the one test-data script case; `Select-String` finds the corresponding `apex-critic` routes. Owner records Task 11's attended critical dispatch/integration.
- [ ] Task 2, Task 4, and Task 8 — changed skill frontmatter is current → verify: HOST records `Build date: YYYY-MM-DD` in `## Progress` at build start; `Select-String` checks versions 2.6.0, 2.19.0, 2.4.0 respectively, `last_updated` equal to that recorded date, ADR-048 in `sources`, unchanged descriptions, and each `SKILL.md` at most 500 lines.
- [ ] Tasks 9 and 13–16 — template and HOST build records are complete → verify: presence/absence greps find the full doc-only definition and High precedence, three skill-history rows dated with the recorded build date, one current Critic index row, ADR `4. Critic consolidation` status and the 2026-10-01 “plan stage 4” rollout-order amendment retaining stages 2–3 as later measurement swaps, and the overview Critic route; no retired reviewer remains in the current index or live architecture paragraph. The trial-log row remains a HOST promotion step under apex-plan doctrine, outside the build task list.
- [ ] Tasks 1–16 — pointers and caps hold → verify: every named live skill/agent/reference target exists; every `SKILL.md` is at most 500 lines; run all ten commands in the build repo's `AGENTS.md` `## Verify commands` fence exactly and record their output. The HOST handles the APEX repo's separate three-file cap fence; the coder does not read the planning host's state file. Do not open a draft review log in this build.
- [ ] Tasks 1–16 — scope is limited to the listed build paths → verify: `git status --porcelain -uall` in each repository lists the changed entries above; every other dirty path was already dirty before the build and is named in the report. No coder write touches the four HOST files or the critical hook.
- [ ] Task 5 — fallback Codex recipe remains available → verify: presence grep finds the Claude-fallback trigger and wrapper dispatch, while old reviewer-name count is zero.
- [ ] Task 6 — AFK end gate calls opus Critic code mode → verify: presence grep finds the single whole-build round-1 invocation, lowercase `block`/`flag`/`note` mapping, and later fix checks under the normal cap, while the old reviewer-name count is zero.
- [ ] Task 7 — silent-regression lenses route through Critic → verify: presence grep finds four lenses and `apex-critic` code mode.
- [ ] Task 9 — the template gives doc-only criteria guidance → verify: presence grep finds the prose-path definition, excluded skill/agent/hook/config paths, explicit High precedence, split exemption, and High-only exact-line/hash guidance.
- [ ] Task 10 — docs agent receives Critic findings separately → verify: presence grep finds `reviewer_findings` from `apex-critic`, and absence grep finds no retired reviewer name.
- [ ] Task 13 — skill history is written by HOST → verify: presence grep finds rows dated with the recorded build date for the three minor versions and the hook/agent change.
- [ ] Task 14 — current index has one Critic row → verify: presence grep finds both modes, and absence grep finds no retired agent in the live roster.
- [ ] Task 15 — ADR rollout status is recorded → verify: presence grep finds a dated implementation note linked to this spec under ADR-048's `### Rollout` item `4. Critic consolidation` and the 2026-10-01 owner-approved order amendment before stages 2–3.
- [ ] Task 16 — overview maps both Critic modes → verify: presence grep finds the new spec/code route and the Low/doc-only Sol skip.
- [ ] Reachability — the orchestrator and planning/build dispatch instructions route real spec, wave, full-build, fallback, and AFK calls to the new agent → verify: presence/absence greps across those caller sections and the agent frontmatter find `apex-critic` with the correct `mode` and Agent tool `model:` parameter (including explicit sonnet/opus dispatch instructions in apex-plan and apex-code), and zero active dispatches to a retired definition.

## Progress

_(At build start, HOST records `Build date: YYYY-MM-DD` here; the build writes subsequent progress.)_

Build date: 2026-10-02
