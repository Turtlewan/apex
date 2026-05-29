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
- Session 8 (planning, design discussion): worked out the full **pipeline artifact model** end-to-end (both directions + amend + knobs + debug loop / bug records) → `docs/research/pipeline-artifact-model.md` (supersedes `handoff-efficiency.md`). No skills/CLAUDE.md changed yet — design only; **8** concrete edits listed for a future implementing session, all Claude-direct. **Paused mid-discussion** on the debug-loop/bug-records thread (resolved in design; could continue to domain-agent wiring or large-scale next).
- Session 8 (planning, research + skill edit): researched whether SKILL.md/impl.md must differ per model → **yes, by file-type, not per-model fork**. Wrote `docs/research/model-specific-skill-authoring.md`. Edited **apex-skill-author → v1.1.0** adding "Author to the executor's capability floor" (no judgment calls in impl.md → tune to DeepSeek V4 Flash; name scope in SKILL.md for Opus literalism). Iron Law dogfooded (RED leaked SES judgment + uncheckpointed chain → GREEN closed both). Committed: `8168e4d` (`~/apex/`), `3e7b61d` (`~/.claude/`).
- Session 7 (planning, direct skill authoring): **apex-research → v1.1.0** (merged to single-file planning-only) and **apex-skill-author created** (source of truth for skill authoring). Iron Law dogfooded for both — real RED baseline + GREEN verification subagent runs. Committed: `597e9d4` (`~/apex/`), `bc40289` (`~/.claude/`).
- Skill `.md` work is now done **directly in planning mode** (Claude), not specced to DeepSeek; a per-edit execution gate asks which backend each time. See memory `skill-authoring-workflow`.
- `apex/CLAUDE.md` skill-authoring rules shrunk to a pointer → `apex-skill-author` is the single maintained source.
- `docs/research/skill-authoring-best-practices.md` added — grounds apex-skill-author.

## Open Questions
- **Domain agent wiring** — 17 domain agents registered in registry but never dispatched. When to dispatch an agent vs load impl.md? Deferred.
- **apex-plan session start reads too much** — now folded into the pipeline artifact model (`docs/research/pipeline-artifact-model.md`, change #3): read status.md + git log + slim handoff. Resolved in design; pending implementation.

## Future Discussions (parked)
- **`description` backfill** — ~40 existing skills predate the new required `description:` field. Decided: backfill opportunistically when each skill is next edited (no bulk migration). Revisit if discovery proves weak.
- **Domain agent dispatching** — registry Agent column is populated but unused; design decision needed on reviewer/enforcer agent invocation pattern.
- **Full APEX planning + development workflow review** — end-to-end experience; apex-plan session-start tightening + elicitation front-end now folded into the pipeline artifact model.
- **Pipeline artifact model** — full design captured in `docs/research/pipeline-artifact-model.md`: artifact-ownership (one-home-per-fact), return path (thin handoff + triage-drain), amend model (two types, gray-zone asks, park-and-continue), forward path (spec = execution script, no-why, list-files-per-task), completeness burden → planning elicitation front-end, the token_profile/autonomy_level knobs. Has a **Concrete capturable changes** list (7 edits incl. global CLAUDE.md). Implementation deferred — each edit goes through apex-skill-author + Iron Law.
- **Documentation & knowledge artifacts (APEX optimisation)** — *resolved in design* (pipeline artifact model §7 + change #8). Bug knowledge homed in git (root cause→commit msg) / test (prevention) / code comment (high-risk warning); unfixed-bug **backlog → GitHub Issues** (A2, auto-closed by `fixes #N`), gated by a security/visibility rail (security bugs never auto-file; stub-only on public repos). status.md drops the bug backlog. Project docs/spec artifacts deemed already-covered. Implementation pending (Claude-direct).
- **Large-scale application development** — phase/milestone management, context scaling, handoff efficiency at project scale.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
<!-- PLANNING:END -->
