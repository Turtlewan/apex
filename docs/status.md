# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-05-29 (session 8)
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
- Session 8 (planning, research + skill edit): researched whether SKILL.md/impl.md must differ per model → **yes, by file-type, not per-model fork**. Wrote `docs/research/model-specific-skill-authoring.md`. Edited **apex-skill-author → v1.1.0** adding "Author to the executor's capability floor" (no judgment calls in impl.md → tune to DeepSeek V4 Flash; name scope in SKILL.md for Opus literalism). Iron Law dogfooded (RED leaked SES judgment + uncheckpointed chain → GREEN closed both). Committed: `8168e4d` (`~/apex/`), `3e7b61d` (`~/.claude/`).
- Session 7 (planning, direct skill authoring): **apex-research → v1.1.0** (merged to single-file planning-only) and **apex-skill-author created** (source of truth for skill authoring). Iron Law dogfooded for both — real RED baseline + GREEN verification subagent runs. Committed: `597e9d4` (`~/apex/`), `bc40289` (`~/.claude/`).
- Skill `.md` work is now done **directly in planning mode** (Claude), not specced to DeepSeek; a per-edit execution gate asks which backend each time. See memory `skill-authoring-workflow`.
- `apex/CLAUDE.md` skill-authoring rules shrunk to a pointer → `apex-skill-author` is the single maintained source.
- `docs/research/skill-authoring-best-practices.md` added — grounds apex-skill-author.

## Open Questions
- **Domain agent wiring** — 17 domain agents registered in registry but never dispatched. When to dispatch an agent vs load impl.md? Deferred.
- **apex-plan session start reads too much** — currently reads full handoff doc; should read only status.md. Parked.

## Future Discussions (parked)
- **`description` backfill** — ~40 existing skills predate the new required `description:` field. Decided: backfill opportunistically when each skill is next edited (no bulk migration). Revisit if discovery proves weak.
- **Domain agent dispatching** — registry Agent column is populated but unused; design decision needed on reviewer/enforcer agent invocation pattern.
- **Full APEX planning + development workflow review** — end-to-end experience, apex-plan session-start tightening.
- **Large-scale application development** — phase/milestone management, context scaling, handoff efficiency at project scale.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
<!-- PLANNING:END -->
