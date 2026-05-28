# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-05-28 (session 3)

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
| `apex-code-session-start.md` | Replace handoff-doc read with git log + context discipline rule in apex-code session start |
| `apex-docs-product-skill.md` | Create SKILL.md for apex-docs-product + fix registry `—` entry |
| `apex-google-skill.md` | New apex-google skill: OAuth2, Sign in with Google, Gmail/Calendar/Drive APIs |
| `backend-routing-rule.md` | Create BACKEND-ROUTING.md; add routing section to CLAUDE.md; add `backends:` field to status.md |
| `karpathy-pipeline-discipline.md` | Bake Karpathy's 4 principles into apex-plan, apex-code, spec-template, and global CLAUDE.md as structural checkpoints |
| `skill-deepseek-language-fixes.md` | Fix "Flag for Claude review" language in 6 impl.md files; add `backend:` frontmatter to all skill files; fix apex-figma image step |
| `skill-history-tracker.md` | Create SKILL-HISTORY.md tracking table + pointer in SKILLS.md |
| `spec-template-revision.md` | Tighten spec template — remove Scope prose and Risks section from ready specs; add split rule |

## Notes
- `~/apex/CLAUDE.md` created this session — project-level rules for skill authoring, SKILL-HISTORY.md update contract, naming conventions.
- Registry already up to date — all 11 session-2 skills confirmed present in `domains.md`. ✅
- `apex-google` name confirmed (not `apex-g`).

## Open Questions
- **apex-plan session start reads too much** — `apex-plan/SKILL.md` lines 19–23 tell planning mode to read the full handoff doc at session start, the same "read everything" problem fixed in `apex-code-session-start`. Fix: replace handoff doc read with a tighter scope (pending specs + open questions from status.md only). Write a spec when revisiting the full planning + development workflow.

## Future Discussions (parked)
- **Full APEX planning + development workflow review** — improve the end-to-end experience of using APEX for any project: how planning mode is invoked, how discussions flow into specs, how the backend switch is communicated to new users. Includes apex-plan session start fix above.
- **Potential new skill domains** — `apex-websockets`, `apex-payments`, `apex-auth`, `apex-email` — not prioritised.
<!-- PLANNING:END -->
