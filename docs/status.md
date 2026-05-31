# Project: APEX — Coding/Development System
_A system of AI-assisted development skills for Claude Code: orchestration, planning, coding, debugging, and specialist domain tools._

stack: Markdown / Claude Code skills
token_profile: balanced
autonomy_level: L2
specialists_default: []
backends: planning=claude | coding=deepseek-v4-flash

_Last updated by planning mode:_ 2026-05-31 (session 11)
_Last updated by coding mode:_ 2026-05-28 (session 6)

<!-- CODING:START -->
## In-Flight
| What | Mode | State | File | Stopped at | Uncommitted |
|------|------|-------|------|------------|-------------|
| align-sessionstart-hook-spec-rules | coding | `🟡 uncommitted` | `~/.claude/hooks/backend-session-start.ps1` + spec moved to `done/` + `status.md` | executed — commit only | 🟡 |
| apex-plan-confirmation-digest | planning | `🟡 uncommitted` | `~/.claude/skills/apex-plan/SKILL.md` (v1.6.0) + `~/apex/SKILL-HISTORY.md` | done — commit only | 🟡 |
| per-project-docs (ADR-001, edits 1–4/4 ✅) | planning | `🟡 uncommitted` | `~/apex/docs/technical/adr/ADR-001-*.md` (new) + `~/.claude/skills/apex-docs-technical/SKILL.md` (v1.1.0) + `~/.claude/skills/apex-init/SKILL.md` (v1.2.0) + `~/.claude/skills/apex-plan/SKILL.md` (v1.7.0) + `~/.claude/skills/apex-handoff/SKILL.md` (v1.3.0) + `~/.claude/skills/apex-orchestrate/templates/handoff-from-coding.md` (v1.1.3) + `~/apex/SKILL-HISTORY.md` + `~/apex/SKILLS.md` + memory files | complete — commit only | 🟡 |
<!-- CODING:END -->

<!-- PLANNING:START -->
## Pending Specs
| Spec | Summary |
|------|---------|

_None pending — `align-sessionstart-hook-spec-rules` executed; awaiting commit (see In-Flight)._

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

## Future Discussions (parked)
- **Stack-skill ↔ project binding** *(umbrella — raised 2026-05-31)* — how do tech-stack skills
  integrate into a project? Today integration is *reactive keyword detection* (spec says "OAuth"
  → apex-auth loads); the project's `stack:` is a bare string in status.md, not a binding. Gaps:
  (1) stack-assumption mismatch — e.g. apex-search/impl.md assumes pgvector/Postgres, nothing
  checks against the chosen DB; (2) library version drift between a skill's patterns and the
  project's installed deps; (3) no persistent project-level "skills in play" — every spec
  re-discovers relevant skills. Options to weigh: **A** structured stack-profile manifest
  (status.md or `docs/technical/stack.md`) that binds active skills + versions, orchestrator
  loads impl.md deterministically; **B** keep keyword detection + a per-skill stack-compatibility
  guard that flags mismatch; **C** stack-aware skill variants. Subsumes the two items below
  (*Domain agent wiring*, *Large-scale application development*) — they are facets of the same
  "how do skills bind to a project" question. Seam with ADR-001: the stack profile feeds the
  System Overview's "How it's structured" section.
- **Per-project "what + why" documentation** *(✅ DONE 2026-05-31 — ADR-001 fully wired)* — all 4
  skill edits landed: apex-docs-technical v1.1.0 (System Overview doc type), apex-init v1.2.0 (seed
  overview.md stub), apex-plan v1.7.0 (readiness-gate ADR-coverage + overview-currency + session-start
  coverage check), apex-handoff v1.3.0 + handoff template v1.1.3 (`[arch]`-tag → required ADR drain).
  Design rationale lives in ADR-001; change log in SKILL-HISTORY. **Follow-up:** the contract is wired
  but APEX has not yet *exercised it on itself* — only ADR-001 exists; no real System Overview for APEX,
  and pre-ADR-001 architectural decisions are un-ADR'd. Dogfood pass deferred.
- **`description` backfill** — most pre-`description` skills still lack the field; backfill opportunistically when each is next edited (apex-debug, apex-github done this session). Revisit if discovery proves weak.
- **Domain agent dispatching** — registry Agent column is populated but unused; design decision needed on reviewer/enforcer agent invocation pattern.
- **Opus 4.8 content sweep** — tag-only tracker is built; the actual one-time Opus 4.8 review/upgrade pass over the ~40 Pending skills is not yet started.
- **Large-scale application development** — phase/milestone management, context scaling, handoff efficiency at project scale.
- **Potential new skill domains** — `apex-payments`, `apex-email` — not prioritised.
<!-- PLANNING:END -->
