# Spec: Enforce ADR-015 return contract on the live coding agents

**Identity:** Make `apex-coder` and `code-worker` obey the ADR-015 dispatch return-contract — write full output to `docs/progress/`, return only a bounded pointer/status line — fixing main-context exhaustion on parallel builds. (status.md In-Flight "Context-exhaustion on parallel builds"; ADR-015; fix option **A**.)

coder_tier: flash

## Files to Change

- `~/.claude/agents/apex-coder.md` — modify (Step 4 + Step 5)
- `~/.claude/agents/code-worker.md` — modify (Inputs + Step 5)
- `~/apex/SKILL-HISTORY.md` — modify (prepend one row)

## Assumptions

- `apex-coder` is dispatched per spec (the main/`apex-code` session may dispatch several in parallel for a multi-spec build — the P6-maths case). Verify: `apex-coder.md` Step 5 currently returns a multi-field JSON block. Impact if wrong: Stop.
- `docs/progress/{spec}.md` is an existing convention (capture-at-halt writes there — `apex-code` SKILL "Capture-at-halt"). Verify: `grep -n "docs/progress/" ~/.claude/skills/apex-code/SKILL.md`. Impact if wrong: Low (the path is still valid; just newly also used for summaries).
- Parallel workers in one wave must not append to a single shared file (race). The design gives each worker its own `…task-{N}.md` file. Impact if wrong: Caution.

## Exact Changes

### Task 1 — `~/.claude/agents/apex-coder.md`: per-task progress files + bounded return

**done when:** Step 4 passes each worker a `progress_path` and reads worker detail from disk; Step 5 writes the aggregate to `docs/progress/{spec-name}.md` and returns only a one-line pointer (no JSON body).

In **Step 4: Execute waves**, replace the `2. Pass to each worker:` list and item `4.` with:

```
2. Pass to each worker:
   - The specific task text and acceptance criterion
   - The relevant file paths for that task
   - The full spec path (for context)
   - The active token profile
   - progress_path: docs/progress/{spec-name}.task-{task-id}.md
     (spec-name = basename of spec_path without the .md extension; task-id = the task number)
3. Wait for all workers in the wave to complete
4. Collect results by READING each worker's progress_path file (files changed, summary,
   decisions, blocked_reason). Do NOT rely on worker return bodies for detail — each worker
   returns only a status line + pointer (ADR-015 return contract).
5. Proceed to next wave
```

Replace **Step 5** in full with:

```
## Step 5: Consolidate and return (ADR-015 return contract)

1. Write the full aggregate summary to docs/progress/{spec-name}.md (create or overwrite),
   assembled from the per-task progress files. Use the same structured fields as before:
   files_changed (union of all tasks), task_summaries (one per task: task, status, files,
   summary), decisions (with review_needed), blocked_actions.

2. Return to the dispatcher ONLY this single bounded line — NEVER the full summary:

   DONE {spec-name} | progress: docs/progress/{spec-name}.md | tasks {done}/{total} done, {blocked} blocked | {fileCount} files changed

The dispatcher reads docs/progress/{spec-name}.md from disk if it needs the detail.
```

### Task 2 — `~/.claude/agents/code-worker.md`: write to disk, return a status line

**done when:** Inputs list a `progress_path`; Step 5 writes the full JSON to `progress_path` and returns only one status line drawn from the four-status enum, no JSON body.

In **## Inputs**, add one bullet after `token_profile`:

```
- progress_path: the file this worker writes its full summary to (provided by apex-coder)
```

Replace **Step 5** in full with:

```
## Step 5: Write summary to disk, return a pointer (ADR-015 return contract)

Write your full result as JSON to progress_path:
{
  "task": "Task N description",
  "status": "DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT",
  "files_changed": ["exact/path/file.ts"],
  "summary": "one sentence what changed",
  "decisions": [{"decision": "...", "reason": "...", "review_needed": bool}],
  "blocked_reason": "if status is BLOCKED or NEEDS_CONTEXT, why"
}

Then return to apex-coder ONLY this single status line — NEVER the JSON body:

   {STATUS} task {N} | {progress_path}

{STATUS} is one of: DONE (complete, verified) · DONE_WITH_CONCERNS (complete, flag in the JSON) ·
BLOCKED (could not complete — reason in blocked_reason) · NEEDS_CONTEXT (missing a fact/file).
This matches the worker return contract in apex-code SKILL § Wave Analysis.
```

### Task 3 — `~/apex/SKILL-HISTORY.md`: log the change

**done when:** a new top row records this change.

Prepend one row under the header (newest-first):

```
| 2026-06-19 | apex-coder, code-worker | agents/apex-coder.md, agents/code-worker.md | — | updated | ADR-015 return contract enforced: agents write full output to docs/progress/, return only a bounded pointer/status line (fixes main-context exhaustion on parallel builds) | ADR-015 |
```

## Acceptance Criteria

1. apex-coder passes a progress path → verify: `grep -q "progress_path: docs/progress/{spec-name}.task" ~/.claude/agents/apex-coder.md`
2. apex-coder reads worker detail from disk → verify: `grep -q "READING each worker.s progress_path" ~/.claude/agents/apex-coder.md`
3. apex-coder return is bounded (no JSON body) → verify: `grep -q "NEVER the full summary" ~/.claude/agents/apex-coder.md` AND `grep -q "DONE {spec-name} | progress:" ~/.claude/agents/apex-coder.md`
4. code-worker has the progress_path input → verify: `grep -q "progress_path: the file this worker writes" ~/.claude/agents/code-worker.md`
5. code-worker returns a status line, not the body → verify: `grep -q "NEVER the JSON body" ~/.claude/agents/code-worker.md` AND `grep -q "{STATUS} task {N} | {progress_path}" ~/.claude/agents/code-worker.md`
6. History row present → verify: `grep -q "ADR-015 return contract enforced" ~/apex/SKILL-HISTORY.md`

## Commands to Run

No build step (pure-Markdown system). Run the six grep checks above; each must exit 0.
