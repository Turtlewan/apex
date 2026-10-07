risk: medium

## Problem
Role-redesign Stage 5 cutover (ADR-048): attended builds today route through the `apex-build-orchestrator` agent (Opus; ~/.claude/agents/apex-build-orchestrator.md + skills/apex-code/references/orchestrator-protocol-schema.json), while the Engine (skills/apex-code/scripts/apex-engine.ps1, engine-plan.ps1, engine-git.ps1, engine-dispatch.ps1; waves 1, 2a, 2b built) already covers wave planning, the effort ladder, exit-code routing, verify + integration gates, the risk:high review pause, adopt/resume and proof-gated teardown. Prerequisites engine-build-outputs (Engine honours AGENTS.md `## Build outputs`) and engine-recipe-parity (planner shares baseline-check's recipe grammar) ship before this spec. Research brief with anchors: C:/Users/User/apex/docs/research/role-redesign-remaining/research-engine-cutover.md (owner decisions in its README).

## Owner/host decisions (binding)
- Engine becomes the DEFAULT attended build path. `apex-build-orchestrator` and its protocol schema are DELETED (git history keeps them), not kept as fallback.
- Specs the Engine refuses (no manifest, tasks sharing files, multi-repo) use the documented attended HOST manual path (parallel-codex.md procedure, host executes mechanics) — the same path used all of 2026-10-06. apex-plan keeps preferring Engine-compatible specs but this spec does not force it.
- Close-out stays host-run: Critic cadence, Scribe (references/scribe.md), family gate, docs agent, commit approvals. Engine does not absorb them here.
- max_parallel_codex stays 2.
- A live Engine smoke run on a real small spec in a real repo is required before the cutover is declared done (HOST task, after build).

## Proposed structure (one spec; prose changes kept together deliberately — split rule's prose exception; tasks grouped by file to stay file-disjoint)
1. apex-code SKILL.md: add a concise "Engine path (default, attended)" section — invocation (apex-engine.ps1 -SpecPath -Repo -Attended [-MaxParallel 2]), exit/status meanings (0 complete, 1 parked/refused, 2 awaiting-review/paused), host actions on each (Critic review on awaiting-review then -Resume with review flags; park -> diagnose, adjust spec or owner decision), -Resume/-Teardown; replace the orchestrator ownership text (~:61 "Who does this") and every orchestrator-only protocol mention; keep <=500 lines; version bump.
2. apex-code references (dispatch-pack.md, parallel-codex.md, codex-review.md, workflow-dispatch.md): remove orchestrator-agent dependencies; parallel-codex.md states Engine primary + host manual fallback for Engine-refused specs.
3. Routing: apex-orchestrate/SKILL.md (~:57 ATTENDED builds row, ~:66; also fixes the stale "Opus 5"), templates/spec-template.md + AGENTS-template.md mentions, apex-plan/SKILL.md (~:228) + references/model-routing.md, apex-governance/levels/L3.md, agents/apex-coder.md.
4. Delete agents/apex-build-orchestrator.md and skills/apex-code/references/orchestrator-protocol-schema.json (and any test/fixture that requires them — grep first; dispatch-events-test validates events against that schema: keep validation by moving the needed schema subset or retargeting — planning must decide; flag for the architecture reviewer).
5. ~/.claude/hooks/apex-session-context.md role table (hook-injected; classifier-gated protected path -> integration may need an owner-run step; plan for it).
HOST (apex): ADR-048 dated amendment (stage 5 cutover shipped), ADR-045/046 notes where they name the orchestrator, SKILLS.md, SKILL-HISTORY rows, overview.md/harness-known-limits mentions, docs/status.md; live Engine smoke run.

## File map (repo C:/Users/User/.claude unless stated)
| Path | Op | Role |
|---|---|---|
| skills/apex-code/SKILL.md | modify | Engine default path section; orchestrator text out; version |
| skills/apex-code/references/dispatch-pack.md | modify | drop orchestrator dependency |
| skills/apex-code/references/parallel-codex.md | modify | Engine primary + host manual fallback |
| skills/apex-code/references/codex-review.md | modify | drop orchestrator dependency |
| skills/apex-code/references/workflow-dispatch.md | modify | drop orchestrator dependency |
| skills/apex-code/references/orchestrator-protocol-schema.json | delete | retired |
| agents/apex-build-orchestrator.md | delete | retired |
| skills/apex-orchestrate/SKILL.md | modify | routing row -> Engine |
| skills/apex-orchestrate/templates/spec-template.md, AGENTS-template.md | modify | mentions |
| skills/apex-plan/SKILL.md, references/model-routing.md | modify | mentions / roles |
| skills/apex-governance/levels/L3.md | modify | mention |
| agents/apex-coder.md | modify | mention |
| hooks/apex-session-context.md | modify | role table (owner-run integration likely) |
| skills/apex-code/scripts/dispatch-events-test.ps1 (if it loads the schema) | modify | keep event validation without the deleted schema |

## Open for the reviewer
- What depends on orchestrator-protocol-schema.json at runtime/test time, and the minimal way to keep event validation?
- Is anything in the Engine path missing for attended use that the orchestrator agent did (forks/spec-defect handling, Sonnet fallback) that the SKILL text must cover as host actions?
- Split or keep as one spec?

## Adjudication of arch-1 (2026-10-06; findings: engine-cutover-arch-1.findings.json)
1. BLOCK schema is an Engine runtime dependency (engine-dispatch.ps1 ~:545 validates every dispatch event against orchestrator-protocol-schema.json): NEW PREREQUISITE SPEC `engine-event-schema` — extract the self-contained dispatch_result + refusal definitions (incl. conditional rules) into skills/apex-code/references/engine-event-schema.json; retarget engine-dispatch.ps1 and dispatch-events-test.ps1 to it; keep engine-dispatch-test coverage. engine-state-schema.json untouched. The cutover then deletes orchestrator-protocol-schema.json.
2. Teardown vs later host edits (engine-git.ps1 ~:648 proof): the host runs the Engine success teardown immediately after exit 0, BEFORE Critic fixes/Scribe; those then use fresh worktrees from the integrated tip (manual path, as references/scribe.md already does). The live smoke must cross this boundary.
3. Resume vs amended spec (apex-engine.ps1 ~:1673): unchanged spec -> -Resume; amended spec -> new run, the parked run discarded (document the disposition of partial work); Critic rejection -> fix via manual path or amended-spec rerun.
4. risk:high: the host invokes the Engine with -MaxParallel 1 (preserves parallel-codex.md sequential rule).
5. Exit semantics: document from the implementation — always read engine-state status + diagnosis; exit 0 = Engine build/hand-off complete (host close-out still pending); 1 = parked/failed/partial/quota-paused (status distinguishes); 2 = awaiting-review.
6. Escalation: Engine stops at xhigh and parks; max/ultra escalation and coder_model: sonnet specs (engine-plan.ps1 ~:518 refuses) belong to the host manual path; Sonnet fallback stays an owner decision at quota-out. Keep Engine vs manual-recovery rows separate in routing tables.
7. hooks/apex-session-context.md: change the role table AND the following ownership paragraph (~:43); owner-run integration of this protected file is an activation condition before retirement is declared shipped.
8. Split: engine-event-schema (prereq, small) + engine-cutover (rest, one spec under an explicit split-rule exception — coherent routing/retirement; NOT the doc-only exception).
