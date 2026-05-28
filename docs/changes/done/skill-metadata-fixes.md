# Spec: skill-metadata-fixes

## Scope

Five SKILL.md files are missing `backend: claude` in their frontmatter and four of those are also missing a top-level `# Title` heading. This spec adds both, bumps each file to v1.0.1, and logs the changes in SKILL-HISTORY.md.

---

## Files to change

| File | Operation |
|------|-----------|
| `~/.claude/skills/apex-stack/SKILL.md` | Modify — add `backend: claude`, add H1 title, bump to 1.0.1 |
| `~/.claude/skills/apex-jobs/SKILL.md` | Modify — add `backend: claude`, add H1 title, bump to 1.0.1 |
| `~/.claude/skills/apex-realtime/SKILL.md` | Modify — add `backend: claude`, add H1 title, bump to 1.0.1 |
| `~/.claude/skills/apex-storage/SKILL.md` | Modify — add `backend: claude`, bump to 1.0.1 (already has H1) |
| `~/.claude/skills/apex-search/SKILL.md` | Modify — add `backend: claude`, add H1 title, bump to 1.0.1 |
| `~/apex/SKILL-HISTORY.md` | Modify — prepend 5 rows |

---

## Exact changes

### Pattern applied to all 5 SKILL.md files

**Frontmatter:** Insert `backend: claude` on the line after `skill: apex-<name>`. Bump `version` to `1.0.1`.

Before:
```yaml
---
skill: apex-<name>
version: 1.0.0
last_updated: 2026-05-28
```

After:
```yaml
---
skill: apex-<name>
backend: claude
version: 1.0.1
last_updated: 2026-05-28
```

---

### apex-stack/SKILL.md

After the closing `---` of the frontmatter, insert:

```markdown
# apex-stack — Tech Stack Selection
```

The first content section (`## Research findings`) immediately follows on the next line.

---

### apex-jobs/SKILL.md

After the closing `---` of the frontmatter, insert:

```markdown
# apex-jobs — Background Jobs
```

---

### apex-realtime/SKILL.md

After the closing `---` of the frontmatter, insert:

```markdown
# apex-realtime — Real-time Push
```

---

### apex-storage/SKILL.md

Frontmatter only — no H1 needed (already has `# File Storage Specialist — Planning Mode`).

---

### apex-search/SKILL.md

After the closing `---` of the frontmatter, insert:

```markdown
# apex-search — Search & RAG
```

---

### ~/apex/SKILL-HISTORY.md

Prepend these 5 rows (newest first, before the existing rows):

```
| 2026-05-28 | apex-search | SKILL | 1.0.1 | updated (SKILL) | Added backend: claude frontmatter, H1 title heading | — |
| 2026-05-28 | apex-storage | SKILL | 1.0.1 | updated (SKILL) | Added backend: claude frontmatter | — |
| 2026-05-28 | apex-realtime | SKILL | 1.0.1 | updated (SKILL) | Added backend: claude frontmatter, H1 title heading | — |
| 2026-05-28 | apex-jobs | SKILL | 1.0.1 | updated (SKILL) | Added backend: claude frontmatter, H1 title heading | — |
| 2026-05-28 | apex-stack | SKILL | 1.0.1 | updated (SKILL) | Added backend: claude frontmatter, H1 title heading | — |
```

---

## Acceptance criteria

- `grep 'backend: claude' ~/.claude/skills/apex-{stack,jobs,realtime,storage,search}/SKILL.md` — 5 matches
- `grep '^# apex-' ~/.claude/skills/apex-{stack,jobs,realtime,search}/SKILL.md` — 4 matches
- Each of the 5 SKILL.md files has `version: 1.0.1` in frontmatter
- SKILL-HISTORY.md has 5 new rows at the top for today's date

## Commands to run

```
grep -n 'backend' ~/.claude/skills/apex-stack/SKILL.md ~/.claude/skills/apex-jobs/SKILL.md ~/.claude/skills/apex-realtime/SKILL.md ~/.claude/skills/apex-storage/SKILL.md ~/.claude/skills/apex-search/SKILL.md
grep -n '^# apex-' ~/.claude/skills/apex-stack/SKILL.md ~/.claude/skills/apex-jobs/SKILL.md ~/.claude/skills/apex-realtime/SKILL.md ~/.claude/skills/apex-search/SKILL.md
head -5 ~/apex/SKILL-HISTORY.md
```
