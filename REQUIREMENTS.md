# Requirements

A short current-state scope for APEX. Live and queued work lives in
[`docs/status.md`](docs/status.md); decisions live in `docs/technical/adr/`.

## In scope

- The 14 `~/.claude/skills/apex-*` workflow skills (each a `SKILL.md` plus optional `references/`;
  only `apex-coding-principles` carries an `impl.md`).
- `~/.claude/skills/apex-orchestrate/templates/` — spec, handoff, and status templates.
- Coordination between skills (orchestrator routing, session-start orientation, the gates).
- The single-session build pipeline: plan → spec → dispatch to coder → verify → handoff
  ([ADR-038](docs/technical/adr/ADR-038-single-session.md),
  [ADR-045](docs/technical/adr/ADR-045-four-role-split.md)).
- Session persistence via `docs/status.md`, `docs/handoff/`, `docs/changes/`.
- The `SKILLS.md` index and `SKILL-HISTORY.md` change log in this repo.

## Out of scope

- Domain/stack knowledge skills — deleted in
  [ADR-036](docs/technical/adr/ADR-036-remove-knowledge-layer.md); re-creating them is expressly
  forbidden.
- Non-APEX skills (design skills, third-party skill systems) — separate systems.
- Claude Code itself (the CLI) — upstream, not ours to change.
- `~/.claude/CLAUDE.md` cross-project behavioural guidelines — governed separately.

## Unreviewed pre-ADR-036 items

The original scope listed ~40 domain/stack skills (apex-aws, apex-security, apex-frontend, …), an
`impl.md`-per-skill pairing, and a `~/.claude/registry/` routing layer. All of that was removed by
ADR-036 (knowledge layer) and ADR-038 (modes/backends). It is noted here only to mark the deletion;
it is not current scope.
