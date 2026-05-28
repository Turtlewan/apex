---
spec: apex-code-session-start
status: ready
token_profile: balanced
autonomy_level: L2
---

# Spec: Replace handoff-doc read with git log in apex-code session start

## Prerequisites
- none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-code\SKILL.md` | modify | Session start section + AFK context note |

## Tasks

- [ ] Task 1: Replace session start steps 1–4 — acceptance: `## Session start` block no longer references `docs/handoff/`; `git log --oneline -10` is step 1; context discipline rule is present

- [ ] Task 2: Update AFK Build Mode context note — acceptance: the note no longer says "handoff docs"; says "git history" instead

- [ ] Task 3: Bump version to `1.2.0` and update `last_updated` to `2026-05-28` in frontmatter — acceptance: frontmatter reflects new values

## Permissions

### File Operations
| Action | Paths |
|--------|-------|
| Modify | `C:\Users\User\.claude\skills\apex-code\SKILL.md` |

### Commands
| Command | Purpose |
|---------|---------|
| (none) | |

### Git Operations
| Operation | Scope |
|-----------|-------|
| (none — do not commit; user will commit manually) | |

## Exact Changes

### Task 1 — `SKILL.md` lines 18–24: replace `## Session start` block

**Remove:**
```markdown
## Session start

1. Read docs/status.md:
   - Check In-Flight table for any interrupted builds
   - Note active token profile and autonomy level
2. List docs/changes/*.md — these are ready specs
3. Read latest docs/handoff/*.md — prior context and flags
4. Report: "Ready specs: {list or 'none'}. In-progress: {spec name and progress, or 'none'}."
```

**Replace with:**
```markdown
## Session start

1. Run `git log --oneline -10` — see what landed recently without loading prose docs
2. Read docs/status.md — check In-Flight table and note token_profile + autonomy_level only. Stop at the CODING block; do not read the PLANNING block.
3. List docs/changes/*.md — these are ready specs
4. Report: "Ready specs: {list or 'none'}. In-progress: {spec name and progress, or 'none'}."

**Context discipline:** When executing a spec, read only that spec and the files it explicitly lists.
Never load docs/handoff/, other pending specs, or ambient project documentation.
```

### Task 2 — `SKILL.md` line 43: update AFK Build Mode context note

**Remove:**
```
Context note: each worker agent starts with a fresh ~200k context scoped to its assigned tasks.
The main window stays lean. All shared state flows through spec files and handoff docs — not conversation memory.
```

**Replace with:**
```
Context note: each worker agent starts with a fresh ~200k context scoped to its assigned tasks.
The main window stays lean. All shared state flows through spec files and git history — not handoff docs or conversation memory.
```

### Task 3 — frontmatter

**Remove:**
```
version: 1.1.0
last_updated: 2026-05-24
```

**Replace with:**
```
version: 1.2.0
last_updated: 2026-05-28
```

## Acceptance Criteria
- [ ] `## Session start` in apex-code SKILL.md has `git log --oneline -10` as step 1
- [ ] `## Session start` contains no reference to `docs/handoff/`
- [ ] Context discipline rule is present immediately after step 4
- [ ] AFK Build Mode context note says "git history", not "handoff docs"
- [ ] Frontmatter shows `version: 1.2.0` and `last_updated: 2026-05-28`

## Progress
_(Coding mode writes here — do not edit manually)_
