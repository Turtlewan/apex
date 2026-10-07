# Plan brief (draft): Stage 5 Engine cutover

## Problem
Queue item 3 (docs/status.md:32): make the Engine the DEFAULT attended build path, retire `apex-build-orchestrator` (agent, 887 lines), fix apex-orchestrate/SKILL.md:57 "Opus 5". Today the Engine is "internal tooling, not routed by default until cutover" (handoff 2026-10-04.md:42); attended builds still route through the orchestrator agent and host-executed mechanics (ADR-046 D1, v1 shipped 2026-08-02). ADR-048:183: "Until stage 5, apex-build-orchestrator and ADR-046 D1 stay in force."

## Current state (anchors)
Paths below under C:\Users\User\.claude\skills\apex-code\scripts\ unless noted.

**Engine entry** `apex-engine.ps1` (1589 lines) + modules engine-plan.ps1 (707), engine-git.ps1 (736), engine-dispatch.ps1 (1203); tests engine-test/-plan-test/-git-test/-dispatch-test; state schema references/engine-state-schema.json.
- Params (apex-engine.ps1:2-17): -SpecPath -Repo -MaxParallel(1-16) -Attended -CriticalFilesConfirmedNote -WorktreeRoot -Resume <runId> -ReviewVerdict/-ReviewDigest/-ReviewRecord (all three together, only with -Resume; :1522-1531) -Teardown <runId> [-Discard] -WrapperPath -StateRoot -CodexExecutable(+ArgumentPrefix) (test seams).
- Planning (engine-plan.ps1): requires validator pass (:412-416), exactly ONE `## Execution manifest` json apex-manifest fence (:420-422, input contract, ADR-048:133), exactly ONE repo key == -Repo (:437-443), task IDs `^[0-9]+[a-z]?$` <=32 chars (:482-483), effort enum (:489), weight<=MaxParallel (:492), refuses any shared/ancestor-overlapping paths across tasks (:506,539), dirty modify/delete paths and pre-existing create paths (:573-610), reparse points, dependency cycles (:638). Waves = layers of dependency graph, split under cap.
- Dispatch: one wrapper call per task (apex-engine.ps1:428-470 Start-RunnerAttempt; -Attended passed through :439); critical-file gate: exit 10 needs -Attended + -CriticalFilesConfirmedNote (:337-350).
- Exit-code routing = Route-RunnerResult (:579-670): diagnosis->park; exit 69 tree-moved verdict void; 79 capacity (retry <=10, permanent->park :606-607); 80 blocking adoption (one fresh dispatch :614-632); quota/rate limit -> status paused (:638-640, never falls back to another model); .final blocked -> park "spec defect" (:642); process failure retry exhausted -> park (:646).
- Retry ladder: Get-RunnerNextEffort low->medium->high->xhigh (:775-777).
- Verify/integration: Invoke-RunnerGate (:780-821): stage, tree-pin around integration verify, refuses HEAD/index movement, residue outside wave manifest (exit 69), wave commit (Commit-EngineWave allowlist, commit_intent crash-window adoption :1415).
- risk:high (wave 2b): pause AFTER wave commit, status awaiting-review, exit 2; prints "Next: Opus Critic on that diff, then -Resume <id> -ReviewVerdict clean|reject ..." (:1206); verdict bound to tree digest + single-use record SHA (:1040-1125); reject -> parked.
- Hand-off (:1129 Invoke-RunnerHandoff, Mandatory -ExpectedTip), -Teardown proof-gated (:1248; success cleanup is explicit, -Discard for partial/abandoned).
- Resume/adopt crash recovery (:738, :1447). Run lock (:80). Parallel cap default per -MaxParallel; ADR-048 item 24 cap stays 2.

**Explicitly NOT done / deferred** (ADR-048:134, role-redesign items 43-45):
- Spec archival and automatic cleanup deferred (explicit -Teardown only).
- Close-out is not Engine: Critic code review, docs agents (Scribe), family gate (apex-family-gate.ps1), docs/owner commit, handoff (Steward) - host-run per apex-code SKILL Post-build.
- No Claude fallback (Sonnet) path: quota -> paused, owner decides (item 20). No fork handling (spec wrong -> parked "spec defect"; host/owner adjusts spec and -Resume).
- No "odd result -> Steward" (item 22) or Steward diagnosis-to-owner (item 23) - parks print a diagnosis; Claude host interprets.
- Item 43 scheduled-task/queue-file runner, park-and-continue across specs, quota wait-resume = queue item 4 (Unattended drain), NOT cutover.
- Receipt preflight (item 37) not yet in Engine (queue 4 absorbs).
- Specs without a valid exec manifest, multi-repo specs, specs with tasks sharing files: REFUSED (handoff 2026-10-04.md:55, engine-hardening had to build on attended path). Many real specs share files => cutover needs a fallback route.
- Repos whose verify creates ignored dirs: Engine integration parks until spec `engine-build-output-residue` ships (apex-code/SKILL.md:151-152).
- Review adjudication: orchestrator agent adjudicates a build-side review BLOCK (references/codex-review.md:8); Engine only receives clean|reject verdict from host.

## What the orchestrator agent does that the Engine lacks
(agents/apex-build-orchestrator.md sections: scope :13, schema :45, inputs :72, directives :421, exit-code->verdict :575, loop :730, refusals :785, channel/supervision :866; protocol in references/orchestrator-protocol-schema.json)
- Multi-repo plans (schema `repos` map keyed per repo); Engine = exactly one repo.
- Shared-file tasks sequenced in sequential sub-waves (Engine refuses).
- Works from prose spec tasks (no manifest needed); Engine requires manifest.
- Fork / spec-defect calls and per-exit-code adjudication judgment (Engine: fixed rules, parks).
- Handles verify-failure routing to Sonnet fallback (v1: emits `park`, host does fallback) - Engine same (park/pause), parity OK.
- Orchestrator is only 0.1% of spend (ADR-048:125) so retirement is a simplification/consistency win, not a cost win.

## Live references a cutover must touch (excl fixtures, history, drafts, research, file-history)
In C:\Users\User\.claude:
1. agents/apex-build-orchestrator.md - DELETE (or archive).
2. skills/apex-code/references/orchestrator-protocol-schema.json - DELETE (check engine-state-schema.json independent).
3. skills/apex-orchestrate/SKILL.md:57 (build row: dispatch orchestrator, three-input block, "Opus 5" fix) and :66 ("Both dispatches ... role split" paragraph) - rewrite to Engine invocation.
4. hooks/apex-session-context.md:32 (Build orchestrator role row) and :41-43 (ADR-046 D1 tightened paragraph / V1 shipped) - rewrite. Hook-injected text; also model-routing table.
5. skills/apex-code/SKILL.md: section "Wave analysis" (:59, ownership para :61-65 incl. schema validation), "Codex dispatch" (:92, :272 role sentence, :281 schema pointer), "Verify" (:283-293 ownership split :287), "Forks" (:319), "Post-build" (:330), :150-152 residue note. NOTE: another build is editing SKILL.md (Scribe step, v2.21.0) - sequence after it lands, or keep edits to Wave analysis / Dispatch / Verify only. Over 500-line cap already (pre-existing).
6. skills/apex-code/references/dispatch-pack.md:69,101-112 (completion routing "orchestrator-owned", V1 note).
7. skills/apex-code/references/parallel-codex.md:4,67,126,137 (manual fallback "under the orchestrator's"; keep as documented non-Engine fallback).
8. skills/apex-code/references/codex-review.md:8 (BUILD ORCHESTRATOR adjudicates BLOCK) - reassign to host/Steward.
9. skills/apex-code/references/workflow-dispatch.md:24 (mention only; check).
10. skills/apex-plan/SKILL.md:228 (task selection "orchestrator-owned") ; skills/apex-plan/references/model-routing.md:15,63.
11. skills/apex-orchestrate/templates/spec-template.md:114 and templates/AGENTS-template.md:14,22 ("orchestrator's call", ADR-029 scheduling).
12. agents/apex-coder.md:8,28 (fallback path ownership text).
13. skills/apex-governance/levels/L3.md:5.
14. skills/apex-context-budget/SKILL.md:78 - generic "orchestrator" = session orchestrator, probably untouched. hooks/apex-statusline.js generic - untouched.
In C:\Users\User\apex:
15. SKILLS.md, SKILL-HISTORY.md (double-write per apex-skill-author), CHANGELOG.md.
16. docs/technical/adr/ADR-048-role-redesign.md (:132 stage-5 note; :183 "stays in force" -> amend with cutover note), ADR-046 D1 amendment (ADR-046 says "when the Engine lands"), ADR-045 (role table amendment), possibly ADR-029/028 pointers.
17. docs/technical/architecture/overview.md, docs/technical/harness-known-limits.md (mentions).
18. docs/status.md (queue item 3/10; owner/host).
Excluded historical: ADR-027/030/031/032/034/036/038/042 mentions, handoffs, research.
Also: apex-build-wave skill/workflow (listed in available skills; workflow-dispatch.md) - check whether it depends on orchestrator.

## Gaps blocking cutover (status.md:39 item 10 follow-ups + above)
Hard blockers (suggest in-scope or prerequisite specs):
- `engine-build-output-residue` (Engine parks repos whose verify creates declared ignored dirs; SKILL.md:151-152) - queue says fold into item 4; but without it autoclicker/Ari/orion-v2/claude-cockpit cannot use the Engine. Decide if prerequisite.
- engine-plan.ps1 AGENTS parser diverges from apex-baseline-check grammar (follow-up).
- engine-hardening notes: record tree_pin_override for build -TreePinScript; commit-intent write-tree/residue capture try->park; "missing:" allowlist message; O(n^2) overlap canonicalisation; residue inventory size; adopt marker check-then-write; machine-ledger test positive control; v1 state resumed mid-wave absorbs residue.
- engine-core round-3: engine-test "machine-ledger isolation" fails whenever any concurrent Codex dispatch writes real ledger (needs hermetic check); plain-stderr quota regex still line-start anchored; crash-window ladder test; wrapper -Adopt needs full run_id.
- Shared-file tasks and missing manifest: decide fallback (see decisions). Both are common.
- Engine takes ~10-12 min per engine-test run (handoff 2026-10-04.md:54).
Soft: AGENTS-template grammar pointers use APEX-repo paths; guard over-blocks staged-only restore with `\`/`@` path; tree-pin lockstep decoded-vs-raw; owner AGENTS.md action list (status item 9: heading exactly `## Verify commands`, fence directly under, Build outputs) is a prerequisite for Engine on those repos.
Note: engine-high-risk-pause wave 1 ran 2 tasks in parallel despite risk:high sequential rule (handoff 2026-10-05.md:35) - check Engine honors it.

## Proposed structure
Cutover spec (docs-only + deletion; Standard) with tasks:
1. Add to apex-code SKILL a short "Engine path (default, attended)" section: invocation (`apex-engine.ps1 -SpecPath -Repo -Attended [-MaxParallel 2]`), exit/status meanings (0 complete, 1 parked/refused, 2 awaiting-review/paused), Critic review on pause, -Resume/-Teardown, host actions on park (adjust spec / Sonnet fallback owner decision). Replace "Who does this - v1" ownership paragraph (:61) + remove orchestrator-only protocol text.
2. Define the non-Engine route: specs lacking manifest / sharing files / multi-repo -> Engine refuses -> attended HOST path per parallel-codex.md without the orchestrator agent (host executes, since the agent is retired), documented as the manual fallback; or make plan refuse to produce such specs.
3. Rewire apex-orchestrate:57/66, session-context role table, apex-plan:228, model-routing, templates, apex-coder, L3, dispatch-pack, codex-review.
4. Delete agent + protocol schema (+ its tests/fixtures if any reference).
5. ADR-048/046/045 amendments, SKILLS.md/SKILL-HISTORY.md/CHANGELOG, status.
6. Live smoke: run Engine end-to-end on a real small low-risk spec in a real repo before declaring cutover (memory: live-smoke-real-integrations).

## File map (path / op / role)
- ~/.claude/agents/apex-build-orchestrator.md / delete / retire
- ~/.claude/skills/apex-code/references/orchestrator-protocol-schema.json / delete
- ~/.claude/skills/apex-code/SKILL.md / edit (Wave analysis, Codex dispatch :272/:281, Verify :287, Forks, Post-build pointer) / Engine path + remove orchestrator
- ~/.claude/skills/apex-code/references/{dispatch-pack,parallel-codex,codex-review,workflow-dispatch}.md / edit
- ~/.claude/skills/apex-orchestrate/SKILL.md / edit (:57 :66)
- ~/.claude/skills/apex-orchestrate/templates/{spec-template,AGENTS-template}.md / edit
- ~/.claude/skills/apex-plan/SKILL.md (:228), references/model-routing.md / edit
- ~/.claude/skills/apex-governance/levels/L3.md / edit
- ~/.claude/agents/apex-coder.md / edit
- ~/.claude/hooks/apex-session-context.md / edit (hook-injected; classifier gates protected paths - owner-run integration)
- apex/ADR-048, ADR-046, ADR-045 / amend; apex/SKILLS.md, SKILL-HISTORY.md, CHANGELOG.md, docs/technical/architecture/overview.md, harness-known-limits.md, docs/status.md / edit
~ 22-25 files, almost all doc edits; two deletions; no Engine code change unless blockers (residue spec, parser divergence) are pulled in.

## Open decisions for owner
1. Pull `engine-build-output-residue` (+ parser-grammar divergence) in as prerequisite, or cut over only for repos that work and keep the rest on a host-executed manual path?
2. Fallback for specs the Engine refuses (no manifest / shared files / multi-repo): host-executed attended path (orchestrator gone) vs require apex-plan to always emit Engine-compatible specs (split shared-file tasks) vs keep orchestrator as legacy.
3. Hard delete vs archive the orchestrator agent + schema (SKILL-HISTORY row either way).
4. Who handles odd results/failures after retirement: host Claude (Steward role, items 22-23) - confirm; Sonnet fallback stays an owner decision.
5. Close-out (Critic, Scribe, family gate, handoff, archival) stays host-run this cutover; Engine-side archival deferred to queue item 4?
6. Sequence vs Scribe build (SKILL.md 2.21.0 in flight): start after it lands.
7. Parallel cap stays 2 (item 24)?
8. Attended review for risk:high: Critic on pause with Opus (existing) - OK.

## Risk suggestion
Medium (not High): mostly docs/prompts/deletion, but touches hook-injected session context, core apex-code SKILL and routes every future build; wrong cutover strands builds on shared-file/no-manifest specs. Treat as High if blockers (residue spec, code changes to Engine) are folded in; the hook/settings edits need owner-run integration (classifier blocks host self-modification). Gate with a live Engine smoke on a real spec.
