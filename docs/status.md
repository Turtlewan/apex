# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-06-03 (session 27)
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
| `coding-destructive-command-guard.md` | PreToolUse hook: deterministic hard-block of never-list destructive commands in coding mode (reuses gateguard's parser). **Gated on a live Mac coding env** — unvalidatable on Windows planning; needs settings.json approval (ADR-012). |

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
  - **Doc-coverage question for this pass:** APEX natively covers PRD (PROJECT/REQUIREMENTS),
    TRD (ADRs + stack binding), Backend Schema (data-model.md + apex-data), and Implementation
    plan (docs/changes specs); UI/UX is judgment (no persisted doc by default). The one gap vs the
    common "6 docs before building" checklist is **Appflow** (screen-map / user journeys). **Decide
    during this pass:** whether Artemis (UI-heavy assistant) warrants a first-class app-flow artifact
    + a persisted UI/UX design doc (or borrow GSD's `UI-SPEC.md`), or folds them into REQUIREMENTS.
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
  **ECC absorption initiative COMPLETE** (session 26) — all phases resolved; see closeout below.
- **0b — instinct-loop deep-dive ✅ DONE** (session 26): Council mode (ADR-010) — three fresh voices
  converged **no-go** on porting ECC's automatic instinct engine. Decision **ADR-011**: no engine
  (no hook/confidence/`/evolve`); make learning an explicit convention on the existing rail —
  `apex-plan` v1.13.0 handoff-drain folds lessons into `feedback` memories, cross-handoff recurrence
  → human-gated promotion via `--stocktake`/`apex-skill-author` (Iron Law preserved). Analysis:
  `docs/findings/instinct-loop-deep-dive.md`. 🟡 uncommitted (~/.claude apex-plan; repo ADR-011 + findings + history + status).
- **Phase 3 ✅ RESOLVED — mostly rejected** (session 26, ADR-012): read ECC's actual
  `gateguard-fact-force.js` and reconsidered. **gateguard fact-forcing dropped** (it's a voluntary
  speed-bump not a gate, no-ops in subagents where APEX edits happen, and the investigation it forces is
  already done upstream by the planning/coding split + downstream Verification Recipe / dual review).
  **design-quality-check dropped** (judgment home is planning — shipped Phase 1). **Freeze deferred**
  (spec-parsing fragility; needs live Mac). **Kept one piece:** a deterministic destructive-command
  **hard-block** for coding mode (true `deny`, reuses gateguard's parser) — the only real gap-filler;
  spec `coding-destructive-command-guard.md` queued, **gated on a live Mac**.
- **Phase 4 ✅ DONE** (session 26): **ADR-010** — santa-method dual-pass wave review + council
  anti-anchoring. `apex-code` v1.8.0 dispatches **two** isolated `apex-wave-reviewer` passes per
  critical-subset domain (auth/security/data — already the only wave-reviewed set), worst-of-two
  union, one-retry re-dispatches both passes, `risk: low` spec flag downgrades to single-pass
  (wave-review surface only; `apex-wave-reviewer.md` unchanged — stateless/isolated already).
  Council four-voice → `apex-deep-dive` v1.3.0 (in-context Architect + 3 fresh `general-purpose`
  voices given only the question; no new agent files) + `apex-plan` v1.12.0 offers council at
  **judgment** forks (offer-only, never auto-runs; facts-uncertainty stays with research).
  ✅ committed (~/.claude 89a28ea · repo 3308c48).
- **Phase 5 ✅ DONE** (session 26): skill-stocktake + rules-distill **folded into one mode** —
  `apex-refresh` v1.2.0 `--stocktake` (quality audit of the skill set against the authoring
  contract + rules-distill cross-read for 2+-skill principle promotions; Quick Scan via git diff +
  `.stocktake-state` SHA marker, no results.json; dispatched chunked `general-purpose` subagents;
  report-only routing to existing fix paths). Decided as one mode (not the report's two) after a
  **live duplication probe** across 37 impl.md cores: only 2 genuine promotions surfaced
  (no-PII-in-logs ×3, retry/backoff+idempotent ×5) — confirms rules-distill earns *inclusion* but
  not its own command. Those 2 landed into `apex-coding-principles` v1.1.0 (NEVER/ALWAYS + Security).
  No new skill/agent/script; no ADR (additive). ✅ committed (~/.claude f55727f · repo f01efbd).
- **Phase 6 ✅ CLOSED — no engine** (session 26, ADR-011): the 0b Council converged against porting
  ECC's automatic instinct engine. Redefined to a one-line convention on `apex-plan`'s handoff-drain
  (landed in v1.13.0) — no hook, no confidence scoring, no `/evolve`, no DeepSeek build. The "manual
  learning gap" is a *feature* here: the human gate keeps the weak coding model from poisoning skills.

**Closeout (session 26).** Of ECC's ~8 candidate mechanisms, APEX **adopted** those that filled real
gaps as markdown/skill upgrades — context-budget (Phase 2), council + santa-method (Phase 4),
stocktake + rules-distill (Phase 5), skill-comply→Iron Law + prompt-defense + strategic-compact +
design details (Phase 1) — and **rejected both hook-heavy mechanisms after deep reads**: the instinct
engine (ADR-011) and gateguard (ADR-012), because APEX's planning/coding split + Verification Recipe +
dual review already serve what they were for. One small deferred item remains: the coding-side
destructive-command hard-block (spec queued, gated on a live Mac). **Imported the judgment, rejected the
bloat — initiative complete.**

## Odysseus comparison (one-shot, session 27) — COMPLETE
Ran the ECC-style "compare + selectively absorb" play against PewDiePie's **Odysseus** (MIT
self-hosted AI workspace). Finding: the viral council/64-model-swarm are **not in the repo** (a
YouTube experiment); the shipped app is a thinner APEX-mechanism donor than ECC, and APEX already
has safer equivalents (ADR-010 council; parallel dispatch). Full analysis: **`docs/research/odysseus-analysis.md`**.
- **Landed (Lens A, A1):** `apex-governance` v1.3.0 + `apex-deep-dive` v1.4.0 — **evaluator-independence
  (anti-collusion) invariant** distilled from the council collusion. Everything else Lens-A was a
  note/reject (see analysis §2). 🟡 uncommitted.
- **Lens B (Artemis prior-art):** user is capturing this separately — not tracked here.

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
- **Vercel `agent-browser` for agentic UI verification** (gated on a live Mac coding env) — trial
  `vercel-labs/agent-browser` (Rust CLI, accessibility refs `@e1` over stdout, ships as a CC skill via
  `npx skills add`) as the *in-the-loop* verification driver in place of the Playwright MCP. Fit for this
  stack: text-over-Bash suits image-less DeepSeek + leaner context. Keep `@playwright/test` for the
  authored regression suite (unchanged). If adopted: swap the `browser_snapshot` command in
  `apex-ui-testing/impl.md` (v1.2.0) → `agent-browser snapshot` — the snapshot-first/no-pixels-to-a-
  text-model *principle* is unchanged, only the command. Caveats: launched 2026-01-13 (young vs mature
  Playwright); the "93% less context vs Playwright MCP" figure is third-party, not in the repo. Can't be
  validated on the Windows planning box.
- **Richer stack binding manifest** — pinned versions + a `docs/technical/stack.md` beyond the
  `stack_skills` list (the selection/binding facet itself is decided — ADR-005/006).
- **Opus 4.8 content sweep** → now **SP5** of the finalisation plan (~36 skills pending;
  `description` backfill folds into each sweep). Tracker at the top of `SKILL-HISTORY.md`.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
- **Cheap-model tiered dispatch** (Odysseus-analysis A6, Mac-gated) — a cheap local-model tier for
  wide/low-stakes fan-out (breadth scans, first-pass triage), reserving strong agents for synthesis.
  No-op today (APEX runs Claude/DeepSeek, no local small-model tier); revisit when the Mac-mini host
  can serve a small local model. Detail in `docs/research/odysseus-analysis.md` §2.
- **safety-guard Freeze (enforced scope-lock)** — deferred from ECC Phase 3 (ADR-012). A PreToolUse hook
  that locks coding-mode writes to the active spec's `Files to Change`. Real value but fragile (must
  parse spec/status at runtime); revisit once the Mac coding env is live and the destructive-command
  guard has proven the hook pattern there.
_(Large-scale app dev → now SP3; stack↔capability composition + agent wiring → now SP2; both moved
out of "parked" into the active finalisation plan.)_
<!-- PLANNING:END -->
