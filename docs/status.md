# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-06-01 (session 18)
_Last updated by coding mode:_ 2026-05-31 (session 15)

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|
_Empty — SP5 skill sweep complete (all de-couple targets swept + committed; only the
deliberately-excluded cloud/base set — aws/azure/gcp/stack/refresh — remains, by design)._

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
_No specs in `docs/changes/` yet. The active initiative is the **finalisation plan** below; its
SP2/SP3/SP6 implementation steps will be authored as `docs/changes/` specs (or direct skill edits)
when each is picked up._

## Finalisation initiative — gearing APEX for the Artemis platform
Goal: ready APEX before building the user's largest app — **Artemis**, a personal assistant that
integrates with everything (a "Jarvis-like" assistant in spirit), with a RAG-heavy **second brain**
as its knowledge subsystem. A
multi-subsystem platform (assistant/orchestration + integrations + knowledge core + interface(s)).
Stack/surfaces are **provisional** pending the deferred requirements pass (see SP0). Roadmap + full
detail: **`docs/research/apex-finalisation-plan.md`**.

- **SP0 ⚠️ Stack — PROVISIONAL** — SwiftUI + Python pre-selected from high-level answers, not real
  requirements, and against an under-scoped target. **Real target = Artemis, a personal
  assistant that integrates with everything; the RAG second brain is one subsystem.** **Deferred:**
  proper requirements-gathering for the whole Artemis platform → decompose → re-confirm/revise the
  stack, **after** APEX hardening and **before** app `apex-init`. Candidate seed only, not locked.
- **SP1 ✅ Stack skills** — `apex-python` (RED/GREEN validated, recipe **run**) + `apex-swift`
  (v0.1.0, recipe **PENDING Mac validation**). Both triple-written + committed.
- **SP2 ✅ / SP3 ✅ / SP4 ✅ decided** (plan §6): SP2 = Method C (no capability binding — capability
  skills are stack-coupled, so de-couple them via SP5 + a `## Stack assumptions` header; stack recipe
  is the single verifier; research in `sp2-capability-composition.md`); SP3 = let it emerge; SP4 =
  app autonomy **L3** + lean profile at bootstrap. **SP6 ✅ convention landed** (`apex-skill-author`
  v1.3.0 + `apex-code` v1.6.0): impl.md two-tier core/references split by section identity, `apex-code`
  loads the core (hard-rules + recipe) not the whole file, and SP2's `## Stack assumptions` is now a
  named core section. _Ongoing-track audit remains (spec drift + apply split during SP5 sweeps)._
- **SP5 ✅ COMPLETE** — Opus-4.8 skill sweep = **de-couple + real-world refresh** (per
  [[sweep-includes-refresh]]). Every de-couple-target skill now has a `## Stack assumptions` swap-table
  (where multi-stack), generalised NEVER/ALWAYS, stack-specific code → `references/*.md` (SP6
  convention), a `description` backfill, and a research pass on fast-moving facts. Swept across
  sessions 16–18: **Batch 1 (13)**, **Batch 2 (12, UI cluster + ai-systems/observability/devops/
  system-design/docs-product/mobile/iac)**, **Tail (8, session 18):** k8s ⭐ + homelab ⭐ (heavy) ·
  figma · ui-testing · architecture · deep-dive · governance · docs-technical (verified, no edit).
  **Deliberately excluded** (base-knowledge, not de-couple targets): apex-aws/azure/gcp/stack,
  apex-refresh. Full per-skill detail in `SKILL-HISTORY.md`.

_Prior buildability layer (clusters 1–5, ADR-005/006) is complete — see git history + `SKILL-HISTORY.md`._

## Notes
_status.md holds current state only — session history lives in git + handoff docs._
- **Pipeline artifact model is implemented** (clusters A–E, 2026-05-30): thin handoff +
  triage-drain (`apex-handoff`, global CLAUDE.md, orchestrate template); apex-plan session-start
  drain + upfront elicitation; spec = execution-script (one-line identity, no-why, files-per-task);
  apex-code three-zone fork routing + capture-at-halt; bug records homed in git/test/comment +
  unfixed→GitHub Issues (gated). Design doc: `docs/research/pipeline-artifact-model.md`.
- **Opus 4.8 first-pass tracker** lives at the top of `SKILL-HISTORY.md` (Done/Pending list).
- Skill `.md` work is done **directly in planning mode** (Claude); per-edit backend gate. See memory `skill-authoring-workflow`.

## Open Questions
_SP2-composition, SP3, SP4 resolved earlier (see plan §6). Remaining:_

- **SP2 agent-wiring — PLANNING slice DECIDED (session 18), pending baseline + impl.** Decision rule:
  (1) **role-split** — *enforce* knowledge loads **inline** where writing happens; *review* knowledge
  is **dispatched** to a fresh agent (the review role currently never fires). (2) Wire the review role
  in **`apex-plan` (Claude) first** — review a draft spec in fresh context to keep the main planning
  window lean. (3) **Option B — one generic parametrised reviewer** pointed at `apex-<domain>/SKILL.md`;
  **no per-domain agent roster** → retire the 18 bespoke `apex-*-agent` defs (keep one only where real
  per-domain *tooling* justifies it — ~security/figma, both coding-side anyway). (4) **Trigger:**
  auto-fire for a heavy set (security, auth, data, testing, a11y) when touched; planner may fire on
  judgment; **skip** trivial single-domain specs (don't pay the spawn). (5) Reviewer flags route into
  risk-resolution **before** a spec moves to `docs/changes/`. **Next (own focused session):** Iron-Law
  baseline — runnable in Claude/planning: multi-domain draft spec, inline-load vs dispatched-reviewer,
  observe what inline misses/bloats → spec → **ADR** (alongside ADR-005/006) → edit `apex-orchestrate`
  Step 5 + `apex-plan` + registry agent column.
- **SP2 agent-wiring — DeepSeek CODING-side verify-dispatch: STILL OPEN (not yet designed).** The
  planning slice above does **not** touch coding. Coding already isolates context via `apex-coder`
  wave-workers (each loads its domain `impl.md` inline into its *own* fresh context = the enforce role,
  fine). Open question: should an independent domain **review/verify** pass be dispatched *after* a wave
  completes (generic reviewer checks the wave's output against the domain `impl.md`), and **how does
  Flash (DeepSeek V4) cope** with orchestrating that sub-dispatch + long tool chains (its known weak
  spot)? Needs its **own baseline on the DeepSeek backend**. Defer until the planning slice lands.
- **apex-swift recipe** — unproven until the first Mac/Xcode build runs it (v0.1.0 → 1.0.0).
- **doc-writer status.md template divergence** — frontmatter-less fallback template still diverges
  from the orchestrate `status-template.md`; reconcile.

## Future Discussions (parked)
- **Richer stack binding manifest** — pinned versions + a `docs/technical/stack.md` beyond the
  `stack_skills` list (the selection/binding facet itself is decided — ADR-005/006).
- **Opus 4.8 content sweep** → now **SP5** of the finalisation plan (~36 skills pending;
  `description` backfill folds into each sweep). Tracker at the top of `SKILL-HISTORY.md`.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
_(Large-scale app dev → now SP3; stack↔capability composition + agent wiring → now SP2; both moved
out of "parked" into the active finalisation plan.)_
<!-- PLANNING:END -->
