---
title: Task sizing guidance — apex-plan authoring rules + apex-code wave pointer
status: ready
mode: Light
---

## Intent

Add explicit task-sizing guidance to apex-plan so specs produce natural parallelism without
artificial task splitting. Add a matching pointer in apex-code's Wave Analysis to close the
loop. Discussion: 2026-06-01 planning session.

## Key decisions

- **Split by concern layer, not by file.** One task = one logical deliverable (API layer, DB
  layer, UI layer, test layer). Not one file. Not multiple features. This produces natural
  wave parallelism without manufacturing thin tasks that cost more in agent-spawn overhead
  than they save.
- **No task-count cap.** Parallelism is a byproduct of correct decomposition, not a target
  to optimise for. The sizing rule is about concern boundary, not worker count.
- **apex-plan owns sizing; apex-code does not re-decompose.** Wave Analysis executes the
  task structure as written. If a task seems too coarse to verify atomically → GRAY fork
  to planning, not a silent re-split.
- **Readiness gate gets a task-granularity check** — catches over-split and under-split
  specs before they reach coding mode.

## Files to touch

- `~/.claude/skills/apex-plan/SKILL.md` — two insertions (task-sizing bullet + gate check)
- `~/.claude/skills/apex-code/SKILL.md` — one insertion (wave analysis pointer)

## Exact changes

### 1. apex-plan/SKILL.md — task-sizing bullet

Insert as the last bullet in the "As you build the spec, enforce these rules inline:" list,
immediately before the line "**A spec is an execution script...**":

```
- **Task granularity:** size each task as one concern layer — API layer, DB layer, UI layer,
  test layer. One task should not span multiple layers; one layer should not be split into
  multiple thin tasks. Independent concern layers run in parallel waves; artificially thin
  tasks (one import, one function, one file) cost more in agent-spawn overhead than they
  save in parallelism. Natural independence is the signal — do not manufacture it.
```

### 2. apex-plan/SKILL.md — readiness gate check

Insert as the last item in the Tasks block of the Readiness Gate, after:
"[ ] Task dependencies are explicit (if Task 3 needs Task 1, say so)"

```
  [ ] Task granularity: each task is one concern layer — not one file and not multiple features; no artificially thin tasks manufactured to increase worker count
```

### 3. apex-code/SKILL.md — wave analysis pointer

Insert after the dispatch rule block (after "All tasks sequential → execute directly in
order; no agents needed"), before "Context note:":

```
**Task granularity** is fixed at spec authoring time by apex-plan — do not re-decompose
tasks during Wave Analysis. If a task appears too coarse to verify atomically after
completion, treat it as a GRAY fork and route back to planning.
```

## Acceptance criteria

- apex-plan/SKILL.md "enforce these rules inline" list contains the task granularity bullet
- apex-plan/SKILL.md Readiness Gate Tasks block contains the granularity check item
- apex-code/SKILL.md Wave Analysis section contains the pointer paragraph
- No other content changed in either file
