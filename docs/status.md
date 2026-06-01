# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-05-31 (session 17)
_Last updated by coding mode:_ 2026-05-31 (session 15)

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|
| SP5 de-couple capability skills | planning | 🔄 in-progress | ~/.claude/skills/apex-*/{SKILL,impl,references}.md + registry/SKILLS/SKILL-HISTORY | **13 done+committed**: search ✅ jobs ✅ storage ✅ (+local-fs) · auth ✅ data ✅ backend ✅ realtime ✅ security ✅ performance ✅ google ✅ github ✅ devcontainer ✅ testing ✅. **Refreshes folded in:** auth (Better Auth default/Lucia dead, +Python/native), realtime (SSE-default for LLM streaming), security (OWASP Top 10:**2025**). Each skill committed separately (see git log). | ✅ all committed (per-skill SHAs in git log) |

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
- **SP5** — Opus-4.8 skill sweep, ongoing. **Top-priority de-couple from JS/pgvector:** `apex-search`
  ✅ (1.2.0) + `apex-jobs` ✅ (1.1.0) done — each got a `## Stack assumptions` swap-table, generalised
  NEVER/ALWAYS, stack-specific worked code moved to `references/*.md` (the SP6 convention's first live
  use). **`apex-storage` is next** (S3/MinIO/R2 → +local-filesystem for the Mac hub). ~34 skills then
  remain on the broader app-critical list.

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
_SP2-composition, SP3, SP4 resolved this session (see plan §6). Remaining:_
- **SP2 agent-wiring half** — 17 domain agents registered but never dispatched: dispatch an agent vs
  load `impl.md` inline? (composition half decided; this half still open, needs its own baseline).
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
