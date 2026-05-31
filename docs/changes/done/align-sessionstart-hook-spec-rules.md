---
spec: align-sessionstart-hook-spec-rules
status: ready
token_profile: balanced
autonomy_level: L2
---

# Spec: Align SessionStart hook spec-requirements with the new spec-authoring rules

**Identity:** Update the planning-mode policy text in the SessionStart hook script so its
spec-requirements list matches the global CLAUDE.md spec rules (one-line identity, no *why*,
files-per-task, no Risks section).
<!-- → why: see docs/research/pipeline-artifact-model.md (cluster C) and SKILL-HISTORY.md 2026-05-30 -->

## Assumptions
- The file `C:/Users/User/.claude/hooks/backend-session-start.ps1` exists and contains the
  PLANNING policy here-string with the numbered spec list at lines ~23–30. → impact: Stop
- The here-string delimiter is `@"` … `"@` and the block is plain text (no variable interpolation
  needed in the replaced lines). → impact: Caution

Simplicity check: considered editing only the single "Scope" line; chose to replace the whole
numbered list because item 6 (Risks) also contradicts CLAUDE.md — both must change together.

## Prerequisites
- none

## Files to Change
| File | Operation | Notes |
| --- | --- | --- |
| `C:/Users/User/.claude/hooks/backend-session-start.ps1` | modify | Replace the PLANNING spec-requirements block |

## Tasks
- [ ] Task 1: In `C:/Users/User/.claude/hooks/backend-session-start.ps1`, replace the planning
  spec-requirements block (the lines from `You SHOULD: produce technical change specifications`
  through `A later DeepSeek session will execute these specs.`) with the NEW block below
  — files: `C:/Users/User/.claude/hooks/backend-session-start.ps1` — done when: the file
  contains the NEW block verbatim and no longer contains the strings "one-paragraph summary"
  or "Risks / open questions".

### Exact change

**OLD (remove):**
```
You SHOULD: produce technical change specifications as Markdown files under docs/changes/<short-name>.md. Each spec must include:
  1. Scope: one-paragraph summary of the change.
  2. Files to change: full paths.
  3. Exact changes: code-level detail (signatures, new functions, modifications). Pseudocode or full snippets.
  4. Acceptance criteria: how to verify it works.
  5. Commands to run: build, test, lint.
  6. Risks / open questions.
A later DeepSeek session will execute these specs.
```

**NEW (insert):**
```
You SHOULD: produce technical change specs as Markdown files under docs/changes/<short-name>.md. A spec is an execution script, not a design doc — rich on the *what*, stripped of the *why*. Each spec must include:
  1. Identity: one line — what this builds (+ optional ADR/discussion link). No rationale paragraph; no *why* inline.
  2. Files to change: full paths; every task names its exact files.
  3. Exact changes: code-level detail (signatures, new functions, modifications). Pseudocode or full snippets.
  4. Acceptance criteria: step -> verify, one runnable check per task.
  5. Commands to run: build, test, lint.
Resolve all risks/open questions before the spec is ready -- do not include a Risks section.
A later DeepSeek session will execute these specs.
```

## Permissions

### File Operations
| Action | Paths |
|--------|-------|
| Modify | `C:/Users/User/.claude/hooks/backend-session-start.ps1` |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell -NoProfile -File C:/Users/User/.claude/hooks/backend-session-start.ps1` | (optional) sanity-run the hook to confirm it still executes without error |

### Git Operations
| Operation | Scope |
|-----------|-------|
| `git add` | `hooks/backend-session-start.ps1` (in the `~/.claude` repo) |
| `git commit` | "fix: align SessionStart planning hook with new spec-authoring rules" |

## Acceptance Criteria
- [ ] Replace the block → verify: `grep -c "one-paragraph summary" hooks/backend-session-start.ps1` returns `0`.
- [ ] Risks line gone → verify: `grep -c "Risks / open questions" hooks/backend-session-start.ps1` returns `0`.
- [ ] New block present → verify: `grep -c "Identity: one line" hooks/backend-session-start.ps1` returns `1`.
- [ ] Hook still runs → verify: running the hook script exits 0 and prints the PLANNING policy without a PowerShell parse error.

## Progress
_(Coding mode writes here — do not edit manually)_
