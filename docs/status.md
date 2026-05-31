# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-05-31 (session 12)
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

_None pending in `docs/changes/`. The stack-skill buildability work below is **planning-mode
skill editing** (direct `.md` authoring per project convention), not DeepSeek specs — it does
not queue here._

## Next implementation — stack-skill buildability layer (DECIDED, ready to build)
Design captured in **ADR-005** (stack-skill family + coverage gate + `stack_skills` binding +
merit-based selection) and **ADR-006** (verification inversion + layered Verification Recipe +
composition). Five clusters; dependency order **1 → 2 → (3 ∥ 4) → 5**. Each is a direct
planning-mode skill edit via `apex-skill-author` — Iron Law baseline + triple-write per edit.

1. **`apex-skill-author`** — teach the stack-skill *family* + the required `## Verification
   Recipe` section; bake in "stack skills always trigger `apex-research`; the recipe is
   empirically validated in the pilot, not doc-sourced." *(foundation — do first)*
2. **`stack_skills:` binding** — add the field to the status.md template (`apex-init` seed +
   orchestrate / doc-writer templates). *(small; unblocks 3 & 4)*
3. **`apex-stack` redesign** — requirements-driven, merit-based selection weighing
   AI-buildability / verifiability heavily; cross-ecosystem candidates (drop the JS-only preset
   bias); add the coverage gate (registry check → record-gap-and-proceed). *(large)*
4. **The inversion** — `apex-code` + `apex-testing` become stack-agnostic, recipe-driven
   runners: read the recipe via the binding, run it each task, verify-fail recovery loop, and
   wire `context7` into the write step. *(large, load-bearing)*
5. **Pilot stack skill `apex-nextjs`** — framework patterns + Verification Recipe; validates the
   whole loop end-to-end. *(do last — it proves 1–4)*

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
- **Opus 4.8 content sweep** — tag-only tracker built; the one-time Opus 4.8 review/upgrade pass
  over the ~40 Pending skills is not yet started.
- **`description` backfill** — most pre-`description` skills still lack the field; backfill
  opportunistically when each is next edited.
- **Large-scale application development** — phase/milestone management, context scaling, handoff
  efficiency at project scale.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
<!-- PLANNING:END -->
