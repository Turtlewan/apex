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

Two backends, one harness. Detection is automatic from `ANTHROPIC_BASE_URL`.

| Backend | URL contains | Mode | Can write source files? |
|---------|-------------|------|------------------------|
| **Claude (Anthropic)** | unset / `api.anthropic.com` | Planning | No — `.md` only |
| **DeepSeek V4 Flash** | `deepseek` | Coding | Yes — all files |

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

## Rules: creating a new skill

When creating a new `SKILL.md` or `impl.md`:

1. **Frontmatter is required** — every skill file must start with:
   ```yaml
   ---
   skill: apex-<name>
   version: 1.0.0
   last_updated: YYYY-MM-DD
   sources:
     - Source Name — url
   staleness_threshold: 30d
   ---
   ```

2. **Register it** — add a row to `~/.claude/registry/domains.md` with:
   - Domain name, SKILL.md path, impl.md path (or `—` if missing), agent (or `—`), keywords

3. **Index it** — add a row to `~/apex/SKILLS.md`:
   - Quick reference table row
   - One-paragraph entry in the correct section

4. **Log it** — prepend a row to `~/apex/SKILL-HISTORY.md`:
   ```
   | YYYY-MM-DD | apex-<name> | SKILL + impl | 1.0.0 | created | Initial creation | Source1, Source2 |
   ```

---

## Rules: updating an existing skill

When modifying any `SKILL.md` or `impl.md`:

1. **Bump the version** in frontmatter (`1.0.0` → `1.1.0` for content changes, `1.0.0` → `1.0.1` for typo/formatting fixes)
2. **Update `last_updated`** to today's date
3. **Prepend a row to `~/apex/SKILL-HISTORY.md`**:
   ```
   | YYYY-MM-DD | apex-<name> | SKILL + impl | 1.1.0 | updated | Brief description of what changed | Sources used |
   ```
   Use `updated (SKILL)` or `updated (impl)` if only one file changed.

---

## Rules: skill content quality

Every `SKILL.md` must have:
- **When to activate** — concrete trigger phrases, not vague ("use when X")
- **Questions to ask before designing** — at least 3
- **A decision table or checklist** — something scannable
- **A review checklist** — `- [ ]` items
- **Hard blocks** — things that are never acceptable

Every `impl.md` must have:
- **NEVER do / ALWAYS do** sections at the top
- **Code examples** — working snippets, not pseudocode
- **A verification checklist**

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
