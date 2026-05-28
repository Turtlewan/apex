---
spec: spec-template-revision
status: ready
token_profile: balanced
autonomy_level: L2
---

# Spec: Tighten spec template — remove Scope prose and Risks section from ready specs

## Prerequisites
- none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-orchestrate\templates\spec-template.md` | modify | Remove Scope section; remove Risks section; add split-rule comment |
| `C:\Users\User\.claude\CLAUDE.md` | modify | Update 6-point planning spec format to match |
| `C:\Users\User\.claude\skills\apex-plan\SKILL.md` | modify | Update readiness gate + Light mode template |

## Tasks

- [ ] Task 1: Remove `## Scope` section from spec-template.md and add split-rule comment — acceptance: template has no `## Scope` heading; split-rule comment present after frontmatter

- [ ] Task 2: Remove `## Risks / Open Questions` section from spec-template.md — acceptance: template has no `## Risks / Open Questions` heading

- [ ] Task 3: Update `~/.claude/CLAUDE.md` planning spec format to drop Scope paragraph and Risks — acceptance: the 4-point list no longer mentions "one-paragraph summary" or "Risks / open questions"

- [ ] Task 4: Update `apex-plan` SKILL.md readiness gate — change "Risks/Open Questions section is empty" to "Risks/Open Questions section removed" — acceptance: readiness gate checklist reflects removal, not emptying

- [ ] Task 5: Add split-discipline note to apex-plan SKILL.md Deep Details writing section — acceptance: a split rule (>3 files OR >2 phases → split) appears in the spec-writing guidance

- [ ] Task 6: Bump versions and last_updated dates — acceptance: spec-template.md frontmatter has `last_updated: 2026-05-28`; apex-plan SKILL.md bumped to `1.3.0`

## Permissions

### File Operations
| Action | Paths |
|--------|-------|
| Modify | `C:\Users\User\.claude\skills\apex-orchestrate\templates\spec-template.md` |
| Modify | `C:\Users\User\.claude\CLAUDE.md` |
| Modify | `C:\Users\User\.claude\skills\apex-plan\SKILL.md` |

### Commands
| Command | Purpose |
|---------|---------|
| (none) | |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none — do not commit; user will commit manually) | |

## Exact Changes

### Task 1 — spec-template.md: remove Scope section, add split-rule comment

The template file begins with frontmatter (lines 1–6) then `# Spec: {title}`.

**After the closing `---` of the frontmatter, add this comment on a new line:**
```
<!-- Split rule: if this spec touches >3 files OR has >2 logical phases, split it into separate specs. -->
```

**Then remove the entire `## Scope` section:**
```markdown
## Scope
One paragraph. What this changes and why.

```
(Remove both the heading and the body line and trailing blank line. The title conveys scope.)

### Task 2 — spec-template.md: remove Risks / Open Questions section

**Remove:**
```markdown
## Risks / Open Questions
(Must be empty before spec passes readiness gate)

```
(Remove heading, body line, and trailing blank line. Risks are resolved before a spec reaches docs/changes/ — they must not travel to coding mode.)

### Task 3 — `~/.claude/CLAUDE.md`: update planning spec format

Locate the block inside the `**Anthropic backend → PLANNING mode**` section:

**Remove:**
```markdown
- Produce technical change specs as `docs/changes/<short-name>.md` containing:
  1. **Scope** — one-paragraph summary.
  2. **Files to change** — full paths.
  3. **Exact changes** — code-level detail: signatures, new functions, modifications. Pseudocode or full snippets.
  4. **Acceptance criteria** — how to verify it works.
  5. **Commands to run** — build, test, lint.
  6. **Risks / open questions**.
```

**Replace with:**
```markdown
- Produce technical change specs as `docs/changes/<short-name>.md` containing:
  1. **Files to change** — full paths and operations (create / modify / delete).
  2. **Exact changes** — code-level detail: signatures, new functions, modifications. Pseudocode or full snippets.
  3. **Acceptance criteria** — one runnable check per task.
  4. **Commands to run** — exact commands with flags.
- Resolve all risks and open questions before the spec moves to `docs/changes/`. Do not include a Risks section in the ready spec.
- Split rule: if a spec touches more than 3 files or has more than 2 logical phases, split it into separate specs.
```

### Task 4 — `apex-plan` SKILL.md: update readiness gate

Locate the readiness gate checklist under `## Readiness gate — Deep Details only`.

**Remove:**
```
  [ ] Risks/Open Questions section is empty
```

**Replace with:**
```
  [ ] Risks/Open Questions section removed from spec (not emptied — deleted)
```

### Task 5 — `apex-plan` SKILL.md: add split-discipline note to Deep Details writing section

Locate the line `Write to docs/drafts/{short-name}.md first — not docs/changes/.` under `### Deep Details mode`.

**After that line, add:**
```markdown
Split rule: if the spec touches more than 3 files or has more than 2 logical phases, split it into separate specs before proceeding.
```

### Task 6 — version bumps

**In `apex-plan` SKILL.md` frontmatter:**

Remove:
```
version: 1.2.0
last_updated: 2026-05-24
```
Replace with:
```
version: 1.3.0
last_updated: 2026-05-28
```

**In `spec-template.md` frontmatter** — the template has no version field. Add `last_updated` only if a version/date field already exists; otherwise skip (the template is not versioned like skill files).

## Acceptance Criteria
- [ ] `spec-template.md` has no `## Scope` section
- [ ] `spec-template.md` has no `## Risks / Open Questions` section
- [ ] `spec-template.md` has split-rule comment immediately after frontmatter
- [ ] `~/.claude/CLAUDE.md` planning spec list is 4 items (no Scope paragraph, no Risks entry); split rule present
- [ ] `apex-plan` SKILL.md readiness gate says "removed" not "is empty" for the Risks item
- [ ] `apex-plan` SKILL.md Deep Details section contains split rule
- [ ] `apex-plan` SKILL.md version is `1.3.0`

## Progress
_(Coding mode writes here — do not edit manually)_
