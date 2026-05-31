# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-05-31 (session 16)
_Last updated by coding mode:_ 2026-05-31 (session 15)

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|
| stack_skills session-start live-test (gap #2) | coding | **🟢 CLOSED** | docs/validation/apex-code-stack-skills-session-start.md | ✅ PASS (O2+O3) | — |

<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
_No specs in `docs/changes/` yet. The active initiative is the **finalisation plan** below; its
SP2/SP3/SP6 implementation steps will be authored as `docs/changes/` specs (or direct skill edits)
when each is picked up._

## Finalisation initiative — gearing APEX for the "second brain" app
Goal: ready APEX before building the user's largest app — a RAG-heavy personal **second brain**,
**100% Apple** (Mac Mini/Studio host + iPhone/iPad clients), desktop-is-the-hub, built entirely on
Mac. Roadmap + full detail: **`docs/research/apex-finalisation-plan.md`**.

- **SP0 ✅ Stack** — SwiftUI + Python (FastAPI sidecar, SQLite/local-vectors, optional MLX). Seeds
  the app's ADR-001 at bootstrap. Runner-up MAUI ruled out (all-Apple → native SwiftUI wins).
- **SP1 ✅ Stack skills** — `apex-python` (RED/GREEN validated, recipe **run**) + `apex-swift`
  (v0.1.0, recipe **PENDING Mac validation**). Both triple-written + committed.
- **SP2 / SP3 / SP4 / SP6 ⚠️** — proposed resolutions recorded (review-needed); see plan §6. SP2+SP6
  both touch `apex-code` loading → bundle into one Iron-Law edit. SP4 settings land at app `apex-init`.
- **SP5** — Opus-4.8 skill sweep, ongoing track; ~36 skills pending (triage: app-critical first).

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
_Detail in `docs/research/apex-finalisation-plan.md` §5–6; these are the calls that need the user._
- **SP4 autonomy level** — app-project default of `L3` (AFK/"auto mode") is behaviour-altering;
  confirm before locking. Also `token_profile` (lean?) + `specialists_default` seed.
- **SP2 binding shape** — do capability-skill recipes join the existing `stack_skills` binding or a
  new `capability_skills` binding? + domain-agent dispatch-vs-load-impl (17 agents, never dispatched).
- **SP3 milestone construct** — introduce a milestone layer above specs now, or let it emerge from
  the app's first real milestone? (leaning *emerge* / YAGNI).
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
