# APEX — project instructions

The APEX skill system itself. Pure Markdown — **no code, no npm, no build step.** Do not suggest
adding a package.json, tsconfig, linter, or any tooling. There is none, deliberately.

Build/execution contract for this repo → `AGENTS.md`. Live state → `docs/status.md`.

## What APEX is

14 skills that carry **workflow, state, and gates**. It carries **no domain knowledge** — the 36
domain skills were deleted in [ADR-036](./docs/technical/adr/ADR-036-remove-knowledge-layer.md),
because written-down knowledge a frontier model already has measurably degrades its output.

**The test before writing any rule down:** would a bare agent, with nothing loaded, already do this?
If yes, don't write it. Applies to skills, to `AGENTS.md`, and to this file.

## Authoring skills

**Creating, updating, or reviewing any skill → invoke `apex-skill-author` first.** It owns the Iron
Law (baseline-test before writing), the frontmatter contract, the double-write (`SKILLS.md` +
`SKILL-HISTORY.md`), the SKILL-vs-impl decision, and the 500-line cap. Don't author from memory.

`SKILL-HISTORY.md` is the source of truth for what changed when: every skill creation or meaningful
update gets a row, newest first, columns `Date | Skill | Files | Version | Event | What Changed | Sources`.

## Conventions

| Thing | Rule |
|-------|------|
| Skill folder | `apex-<name>`, kebab-case |
| `docs/drafts/` | specs still being written |
| `docs/changes/` | specs ready to execute |
| `docs/changes/done/` | specs already executed |
