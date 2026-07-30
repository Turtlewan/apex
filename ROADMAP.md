# Roadmap

APEX is a live, self-hosting system with no fixed feature roadmap — it evolves spec-by-spec
through its own pipeline. This file records **what APEX is today**; live and queued work lives
in [`docs/status.md`](docs/status.md), and the history of how it got here lives in
`docs/changes/done/` (executed specs), `docs/handoff/` (what each build learned), and
`docs/technical/adr/` (why each decision was made).

## Current state

- **14 workflow skills** under `~/.claude/skills/apex-*/`, carrying workflow, state, and gates —
  no domain knowledge. The 36 domain/stack skills were deleted in
  [ADR-036](docs/technical/adr/ADR-036-remove-knowledge-layer.md) because written-down knowledge a
  frontier model already has degrades its output.
- **One session** plans, builds, and verifies ([ADR-038](docs/technical/adr/ADR-038-single-session.md)) —
  no modes, no `APEX_MODE`, no backend swap, no write-guard.
- **Roles, not sessions** ([ADR-045](docs/technical/adr/ADR-045-four-role-split.md)): Fable host
  reasons/plans, Opus drafts specs/ADRs, Opus 5 orchestrates builds, Codex `gpt-5.6-sol` codes
  per-task (Sonnet 5 fallback), review is cross-family both directions.
- **Harness gates** — pre-flight, baseline-green, wave dispatch, scope cap, critical-file
  confirmation, cross-family completion (ADR-039 through ADR-044).
- **Three-file doctrine** ([ADR-037](docs/technical/adr/ADR-037-three-context-files.md)):
  `CLAUDE.md` (prefs) · `AGENTS.md` (build contract) · `docs/status.md` (live state).

## Unreviewed pre-ADR-036 items

The earlier phase plan (domain-skill expansion, a routing registry, more specialist skills such as
apex-payments/apex-auth/apex-email/apex-websockets) is **obsolete** — that whole direction was
reversed by ADR-036 (knowledge layer removed) and ADR-038 (modes removed). It is recorded here only
so the reversal is legible; none of it is live or planned.
