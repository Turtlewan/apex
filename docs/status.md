# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-05-31 (session 13)
_Last updated by coding mode:_ 2026-05-28 (session 6)

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|

_None in flight — session-11 work committed (`~/.claude` 797b437, bab8bc8 · `~/apex` c0ce7eb)._
<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| apex-nextjs-pilot.md | Cluster 5 — author apex-nextjs + validate the buildability layer end-to-end against a real Next.js app (coding-mode). |

_Clusters 1–4 were planning-mode skill edits (direct `.md` authoring), not DeepSeek specs.
Cluster 5 is the one coding-mode deliverable — queued above._

## Buildability layer — clusters 1–4 BUILT, cluster 5 queued (pilot)
Design: **ADR-005** (stack-skill family + coverage gate + `stack_skills` binding + merit-based
selection) and **ADR-006** (verification inversion + layered Verification Recipe + composition).
Dependency order **1 → 2 → (3 ∥ 4) → 5**. Built 2026-05-31 (session 13) via the
`apex-skill-author` Iron Law + triple-write. See `SKILL-HISTORY.md` for per-cluster detail.

1. ✅ **`apex-skill-author` v1.2.0** — teaches the stack-skill family + required `## Verification
   Recipe` + the two baked-in rules (always `apex-research`; recipe run-validated, not doc-sourced).
2. ✅ **`stack_skills:` binding** — added to the orchestrate status-template + `apex-init` seed +
   surfaced at `apex-orchestrate` session-start (`apex-orchestrate` v1.1.3, `apex-init` v1.2.1).
3. ✅ **`apex-stack` v1.1.0** — merit-based cross-ecosystem selection (AI-buildability +
   verifiability weighted heavily); cross-ecosystem candidate menu; coverage gate writing `stack_skills`.
4. ✅ **The inversion** — `apex-code` v1.5.0 + `apex-testing` v1.1.0 are now stack-agnostic
   recipe-driven runners (read recipe via binding, run per task, verify-fail recovery, context7 at write).
5. ⏳ **Pilot `apex-nextjs`** — spec written: `docs/changes/apex-nextjs-pilot.md`. **Coding-mode** —
   authors apex-nextjs + validates the recipe + exercises the loop against a real Next.js app.
   Proves 1–4 end-to-end; its result is the empirical GREEN for clusters 4 & 5 (deferred from planning).

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
- **Loop granularity** — ADR-006 keeps verification at task-level, not per-edit. Revisit if
  convergence proves too slow in the pilot.
- **Stack ↔ capability skill composition** — when a stack skill and a capability skill both
  apply (e.g. a Next.js project doing auth; `apex-search` assuming pgvector), what is the
  precedence / mismatch-guard rule? Deferred by ADR-005/006 to the umbrella.
- **Domain agent wiring** — 17 domain agents registered but never dispatched; dispatch an agent
  vs load impl.md? Not resolved by ADR-005/006. Deferred.

## Future Discussions (parked)
- **Stack-skill ↔ project binding** *(✅ DECIDED 2026-05-31 — ADR-005 + ADR-006)* — the
  selection / binding / buildability facet is resolved; implementation is the roadmap above.
  Still parked: the *richer* binding manifest (pinned versions, `docs/technical/stack.md`) and
  the stack↔capability composition rule (now an Open Question). *Large-scale application
  development* remains a separate open facet.
- **doc-writer status.md template divergence** *(discovered session 13)* —
  `agents/doc-writer.md`'s "initial template" is a frontmatter-less format (no `stack` /
  `token_profile` / `specialists_default` / `stack_skills`), divergent from the canonical
  `apex-orchestrate/templates/status-template.md`. Coding mode uses it only as a "status.md
  missing" fallback. Reconcile the two (or have doc-writer defer to the orchestrate template) —
  left out of cluster 2 to stay surgical.
- **Opus 4.8 content sweep** — tag-only tracker built; the one-time Opus 4.8 review/upgrade pass
  over the ~40 Pending skills is not yet started.
- **`description` backfill** — most pre-`description` skills still lack the field; backfill
  opportunistically when each is next edited.
- **Large-scale application development** — phase/milestone management, context scaling, handoff
  efficiency at project scale.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
<!-- PLANNING:END -->
