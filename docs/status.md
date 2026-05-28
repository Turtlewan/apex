# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

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
- Session 6 complete: all 3 pending specs from session 5 executed and committed (`ffe9388` in `~/apex/`, `e5f1391` in `~/.claude/`)
- `~/.claude/` 8 skill files from session 6 committed; plugin/marketplace changes are pre-existing and unrelated
- All specs moved to `docs/changes/done/`

## Open Questions
- **Domain agent wiring** — 17 domain agents registered in registry but never dispatched. When to dispatch an agent vs load impl.md? Deferred.
- **apex-plan session start reads too much** — currently reads full handoff doc; should read only status.md. Parked.

## Future Discussions (parked)
- **Domain agent dispatching** — registry Agent column is populated but unused; design decision needed on reviewer/enforcer agent invocation pattern.
- **Full APEX planning + development workflow review** — end-to-end experience, apex-plan session-start tightening.
- **Large-scale application development** — phase/milestone management, context scaling, handoff efficiency at project scale.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
<!-- PLANNING:END -->
