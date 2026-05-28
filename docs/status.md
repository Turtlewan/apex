# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-05-28 (session 7)

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
| `apex-code-parallel-execution.md` | Add Wave Analysis step to apex-code AFK pre-flight; parallelise post-build docs+review agents |
| `skill-impl-fixes.md` | Fix apex-search embedding insert (JSON.stringify → pgvector literal); add post-upload validation note to apex-storage impl |
| `skill-metadata-fixes.md` | Add `backend: claude` + H1 heading to 5 SKILL.md files (apex-stack, apex-jobs, apex-realtime, apex-storage, apex-search) |

## Notes
- Session 4 complete: 6 new skills created (apex-stack, apex-auth, apex-jobs, apex-realtime, apex-storage, apex-search) @ e08d6e7
- `~/.claude/` skill files from session 4 still uncommitted — housekeeping deferred to next coding session
- All 3 pending specs are independent and can be executed in any order or in parallel

## Open Questions
- **Domain agent wiring** — 17 domain agents registered in registry but never dispatched. When to dispatch an agent vs load impl.md? Deferred.
- **apex-plan session start reads too much** — currently reads full handoff doc; should read only status.md. Parked.

## Future Discussions (parked)
- **Domain agent dispatching** — registry Agent column is populated but unused; design decision needed on reviewer/enforcer agent invocation pattern.
- **Full APEX planning + development workflow review** — end-to-end experience, apex-plan session-start tightening.
- **Large-scale application development** — phase/milestone management, context scaling, handoff efficiency at project scale.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
<!-- PLANNING:END -->
