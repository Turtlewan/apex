# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-06-02 (session 26)
_Last updated by coding mode:_ 2026-06-01 (session 16)

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|
| SP2 agent-wiring — coding-side | wave domain review | Done | `apex-wave-reviewer.md`, `apex-code/SKILL.md` | — | ✅ 427da16 |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
_None — `docs/changes/` is empty; all specs completed (see `docs/changes/done/`)._

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
  verify-dispatch **now landed** (coding session 16, `427da16`) — **SP2 agent-wiring fully complete**.
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

## ECC absorption initiative — selectively porting "Everything Claude Code"
Source analysis: **`docs/research/ecc-analysis.md`** (exhaustive sweep of affaan-m/ECC — 249 skills,
63 agents, hook surface). Goal: import the ~8 meta-mechanisms + design details that fix APEX's two
real gaps (**prose-only enforcement**, **manual learning**) — reject the bloat. Full ranked plan +
phases in the report's §7/§10/§11. Execution started session 24 (2026-06-02).

- **Phase 1 — design slice ✅ DONE** (session 24): `apex-ui-ux-design` v1.2.0 (AI-slop detection +
  scored visual-audit rubric in SKILL; concentric-radius/optical-alignment/tabular-nums/text-wrap/
  font-smoothing/image-outline micro-polish in impl) + `apex-animation` v1.2.0 (SSR-safe initial,
  `layoutId`, stagger 0.05–0.10s, `mode="wait"` in impl). ✅ committed (`~/.claude` 5efa3c2 · repo 5ee8446).
- **Phase 1 — remaining ✅ DONE** (session 24): `apex-skill-author` v1.4.0 (prompt-independence /
  competing-prompt strictness in the Iron Law); prompt-defense baseline added to global
  `~/.claude/CLAUDE.md` §6 (agent self-defense); strategic-compact guidance → `apex-orchestrate`
  v1.2.0 (§ Strategic compaction). ✅ committed (`~/.claude` 5efa3c2 · repo 5ee8446).
- **Phase 2 ✅ DONE** (session 25): new `apex-context-budget` v1.0.0 — planning-mode token/context-rot
  audit (single SKILL.md, no impl). RED→GREEN dogfooded (baseline over-counted impl.md flat + tried to
  delete co-installed gsd; skill closes both via the SP6 core-load model + scope discipline).
  Triple-written; registry domain `context-budget`; Opus-native. ✅ committed (`~/.claude` 855f9aa · repo b3f4144).
  Remaining order: Phase 4 → 5 → 0b deep-dive → (gated) Phase 3 → 6. Per-phase detail in `docs/research/ecc-analysis.md` §11.
- **Phase 3 ⏳ (needs per-hook approval)** : deterministic-enforcement hooks — gateguard fact-forcing
  (apex-code pre-flight), safety-guard freeze/careful (apex-governance), design-quality-check (frontend anti-slop).
- **Phase 4 ✅ DONE** (session 26): **ADR-010** — santa-method dual-pass wave review + council
  anti-anchoring. `apex-code` v1.8.0 dispatches **two** isolated `apex-wave-reviewer` passes per
  critical-subset domain (auth/security/data — already the only wave-reviewed set), worst-of-two
  union, one-retry re-dispatches both passes, `risk: low` spec flag downgrades to single-pass
  (wave-review surface only; `apex-wave-reviewer.md` unchanged — stateless/isolated already).
  Council four-voice → `apex-deep-dive` v1.3.0 (in-context Architect + 3 fresh `general-purpose`
  voices given only the question; no new agent files) + `apex-plan` v1.12.0 offers council at
  **judgment** forks (offer-only, never auto-runs; facts-uncertainty stays with research).
  ✅ committed (~/.claude 89a28ea · repo 3308c48).
- **▶ RESUME HERE — Phase 5 ⏳** : rules-distill + skill-stocktake maintenance modes (→ apex-skill-author / apex-refresh).
- **Phase 6 ⏳ (gated by deep-dive)** : instinct / continuous-learning loop onto APEX memory — run `apex-deep-dive` first.

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
_SP2-composition + agent-wiring (planning **and** coding slices), SP3, SP4 resolved (see plan §6 + ADR-007). Remaining:_

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
