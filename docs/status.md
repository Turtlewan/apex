# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-05-30 (session 9)
_Last updated by coding mode:_ 2026-05-28 (session 6)

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|

_(empty — nothing in progress)_
<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|
| _(none — all specs completed)_ |

## Notes
_status.md holds current state only — session history lives in git + handoff docs._
- **Pipeline artifact model is now implemented** (clusters A–E, 2026-05-30): thin handoff +
  triage-drain (`apex-handoff`, global CLAUDE.md, orchestrate template); apex-plan session-start
  drain + upfront elicitation; spec = execution-script (one-line identity, no-why, files-per-task);
  apex-code three-zone fork routing + capture-at-halt; bug records homed in git/test/comment +
  unfixed→GitHub Issues (gated). Design doc: `docs/research/pipeline-artifact-model.md`.
- **Opus 4.8 first-pass tracker** lives at the top of `SKILL-HISTORY.md` (Done/Pending list) —
  marks which skills have had an Opus 4.8 review/edit so a future sweep doesn't redo them.
- Skill `.md` work is done **directly in planning mode** (Claude); per-edit backend gate. See memory `skill-authoring-workflow`.

## Open Questions
- **Domain agent wiring** — 17 domain agents registered in registry but never dispatched. When to dispatch an agent vs load impl.md? Deferred.
- **SessionStart hook ↔ CLAUDE.md drift** — the planning SessionStart hook text (in `~/.claude/settings.json`) still says "Scope: one-paragraph summary"; the global CLAUDE.md spec rules now say one-line identity. settings.json is non-`.md` (blocked in planning) — needs an `update-config`/coding-mode edit to realign the hook text.

## Future Discussions (parked)
- **`description` backfill** — most pre-`description` skills still lack the field; backfill opportunistically when each is next edited (apex-debug, apex-github done this session). Revisit if discovery proves weak.
- **Domain agent dispatching** — registry Agent column is populated but unused; design decision needed on reviewer/enforcer agent invocation pattern.
- **Opus 4.8 content sweep** — tag-only tracker is built; the actual one-time Opus 4.8 review/upgrade pass over the ~40 Pending skills is not yet started.
- **Large-scale application development** — phase/milestone management, context scaling, handoff efficiency at project scale.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
<!-- PLANNING:END -->
