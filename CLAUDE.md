# APEX Project — Claude Instructions

Project-level rules for working on the APEX skills system.
These override the global `~/.claude/CLAUDE.md` where they conflict.

---

## What this project is

A pure-Markdown system of Claude Code skills. There is no code, no npm, no build step.
Every file is a `.md` skill, registry entry, or planning document.

**Do not suggest** adding a package.json, tsconfig, linter, or any tooling. This project has none.

---

## Backend routing

Detection is automatic from `ANTHROPIC_BASE_URL` + `APEX_MODE` (ADR-027).

| Session | Signal | Mode | Coder | Can write source files? |
|---------|--------|------|-------|------------------------|
| **Planning** | Anthropic, no flag | Planning | — | No — `.md` only* |
| **Claude coding** | `APEX_MODE=coding` (Anthropic) | Coding | host = Sonnet 5 (ADR-032); **Codex `gpt-5.6-sol` primary** (codex exec subprocess); **Opus fallback** (fresh `model: opus` worker) on quota-out | Yes — all files |
| **DeepSeek** | `deepseek` URL | Coding | _archived (ADR-027) — recovery-only_ | Yes — all files |

\* In planning mode the non-`.md` write-guard is an approval prompt (default: defer to coding
mode), **except** within the APEX project itself, `~/.claude/` system files, and any project's
`docs/research/mockups/` (logic-free cheap-mockup design artifacts — ADR-020), which pass
silently — APEX is self-hosting. See [ADR-009](./docs/technical/adr/ADR-009-harden-session-start-and-write-guard.md).

Full routing table: see [BACKEND-ROUTING.md](./BACKEND-ROUTING.md).

**All skills are callable from both backends.** Skills have a `backend:` frontmatter field
indicating which mode they were designed for, but this does not restrict invocation.
Exception: `apex-figma` visual comparison steps require image support — DeepSeek skips
these and flags for planning-mode review.

---

## Skill file locations

| File | Path pattern | Purpose |
|------|-------------|---------|
| Planning mode | `~/.claude/skills/apex-<name>/SKILL.md` | Loaded when planning — guides decisions |
| Coding mode | `~/.claude/skills/apex-<name>/impl.md` | Loaded when coding — enforces patterns |
| Registry | `~/.claude/registry/domains.md` | Routing table — maps keywords to skills |
| Index | `~/apex/SKILLS.md` | Human-readable index of all skills |
| History | `~/apex/SKILL-HISTORY.md` | Update log — one row per change event |

---

## Authoring & updating skills

**Creating, updating, or reviewing any skill → invoke `apex-skill-author` first.**
It is the source of truth for skill authoring: the Iron Law (baseline-test before
writing), the frontmatter contract (incl. the required `description` field), the
registry + index + history triple-write, the SKILL-vs-impl decision, content-quality
gates, and the 500-line cap. Don't author from memory of these rules — load the skill.

---

## Naming conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Skill folder | `apex-<domain>` (kebab-case) | `apex-google` |
| Domain in registry | same as folder name without `apex-` | `google` |
| Keywords | lowercase, comma-separated | `Google, OAuth2, googleapis` |

---

## SKILL-HISTORY.md — the contract

`~/apex/SKILL-HISTORY.md` is the source of truth for "what changed when."

- **Every** skill creation or meaningful update gets a row — no exceptions
- Rows are sorted newest first — prepend, never append
- Column order: `Date | Skill | Files | Version | Event | What Changed | Sources`
- `Event` values: `created` · `updated` · `updated (SKILL)` · `updated (impl)`
- Sources: short names only (e.g. `Google Identity Docs`, not full URLs)

---

## What goes in docs/changes/ vs done/

- `docs/changes/` — specs ready for coding mode to execute
- `docs/changes/done/` — specs coding mode has completed (move after execution)
- `docs/drafts/` — specs still being written (not ready to execute)
