# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-06-01 (session 22)
_Last updated by coding mode:_ 2026-06-01 (session 16)

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|
| SP2 agent-wiring — coding-side | wave domain review | Done | `apex-wave-reviewer.md`, `apex-code/SKILL.md` | — | ✅ 427da16 |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| `wave-reviewer-baseline-test.md` | Throwaway fixture — confirms Flash can orchestrate the dispatch → BLOCK → retry → CLEAN loop (prerequisite for the spec below) |
| `wave-reviewer-selective-dispatch.md` | New `apex-wave-reviewer` agent + apex-code wave domain review — **blocked until baseline test passes** |

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
- **SP2 agent-wiring ✅ PLANNING SLICE LANDED** (ADR-007 + `apex-plan` v1.8.0 + `apex-orchestrate`
  v1.1.5 + new `apex-spec-reviewer` agent + registry Agent column repointed). The *review* role is
  now **dispatched**: a single generic `apex-spec-reviewer` pointed at `apex-<domain>/SKILL.md`,
  auto-fired for the heavy set (security/auth/data/testing/a11y), judgment-fired otherwise, skipped
  for trivial single-domain specs; findings → readiness-gate BLOCK/FLAG before a spec moves to
  `docs/changes/`. Per-domain `apex-*-agent` roster retired (registry no longer routes to it). Backed
  by an Iron-Law baseline — dispatched review beat inline self-review on gate-ready severity output
  and caught a non-salient gap (reversible migration) inline missed. The 14 now-unreferenced
  `apex-*-agent` stubs were deleted + `registry/agents.md` updated (session 19). Coding-side
  verify-dispatch still open (see Open Questions).
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
- **Conceptual data-model artifact** (ADR-008): ground-up data-bearing projects seed
  `docs/technical/architecture/data-model.md` (entities/relationships/invariants — *conceptual only*);
  apex-init seeds it (scope-gated), apex-plan captures it early + coverage-checks the stub, apex-data
  reconciles each phase's physical schema against it. Physical schema stays per-phase (SP3 intact).
- **Opus 4.8 first-pass tracker** lives at the top of `SKILL-HISTORY.md` (Done/Pending list).
- Skill `.md` work is done **directly in planning mode** (Claude); per-edit backend gate. See memory `skill-authoring-workflow`.

## Open Questions
_SP2-composition + agent-wiring (planning slice), SP3, SP4 resolved (see plan §6 + ADR-007). Remaining:_

- **SP2 agent-wiring — DeepSeek CODING-side verify-dispatch: DESIGN DONE, baseline required.**
  Selective dispatch design is fully specced (`docs/changes/wave-reviewer-selective-dispatch.md`):
  file-path pattern trigger (auth/security/data), one `apex-wave-reviewer` agent per matched domain
  per wave (parallel), BLOCK → one retry → BIG fork, FLAG → log. Blocked on a **baseline test**
  confirming Flash can orchestrate dispatch → collect → BLOCK-retry without losing state. Design the
  baseline test protocol before executing the spec.
- **apex-swift recipe** — unproven until the first Mac/Xcode build runs it (v0.1.0 → 1.0.0).

## Future Discussions (parked)
- **Richer stack binding manifest** — pinned versions + a `docs/technical/stack.md` beyond the
  `stack_skills` list (the selection/binding facet itself is decided — ADR-005/006).
- **Opus 4.8 content sweep** → now **SP5** of the finalisation plan (~36 skills pending;
  `description` backfill folds into each sweep). Tracker at the top of `SKILL-HISTORY.md`.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
_(Large-scale app dev → now SP3; stack↔capability composition + agent wiring → now SP2; both moved
out of "parked" into the active finalisation plan.)_
<!-- PLANNING:END -->
