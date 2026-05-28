# Spec: apex-code-parallel-execution

## Scope

Two changes to `apex-code/SKILL.md`: (1) Add a Wave Analysis step after the Karpathy Pre-Flight that groups independent spec tasks into parallel waves and dispatches one code-worker agent per task within each wave. (2) Parallelise the post-build agents — `apex-docs-product-agent` and `apex-reviewer` have no dependency on each other and can run concurrently; `apex-docs-technical-agent` already waits on both so it stays sequential after them.

---

## Files to change

| File | Operation |
|------|-----------|
| `~/.claude/skills/apex-code/SKILL.md` | Modify — add Wave Analysis step, update execution section, parallelise post-build |
| `~/apex/SKILL-HISTORY.md` | Modify — prepend 1 row |

---

## Exact changes

### 1. apex-code/SKILL.md — Wave Analysis step

**Frontmatter:** bump `version` from `1.2.0` to `1.3.0`.

**After the Karpathy Pre-Flight block** (after step d, before the "Context note:" line), insert step 7:

```markdown
7. **Wave Analysis** — runs after Karpathy Pre-Flight, before the first file is touched:

   For every pair of tasks (A, B) in ## Tasks, check all three:
   - **File conflict**: both tasks write to the same file path → B depends on A
   - **Output dependency**: B's inputs are produced by A (stated in spec or inferable) → B depends on A
   - **Shared state**: both tasks modify the same schema, migration, or shared config file → B depends on A

   Group tasks with no dependencies on each other into the same wave.

   Log the wave plan before execution begins:
   `"Wave 1: [task N, task M] | Wave 2: [task P] | ..."`

   Dispatch rule:
   - Wave with **2+ independent tasks** → spawn one code-worker agent per task; dispatch all in parallel; wait for all to complete before starting the next wave
   - Wave with **1 task** → execute that task directly (no agent spawn)
   - All tasks sequential (every wave has exactly 1 task) → execute directly in order; no agents needed
```

---

### 2. apex-code/SKILL.md — During execution section

**Replace** the opening line of the "During execution:" block:

Before:
```
During execution:
- Work through ## Tasks in order (respecting any dependency notes)
```

After:
```
During execution:
- Execute waves in the order produced by Wave Analysis
- Within each wave: apply the dispatch rule (parallel agents or direct execution)
- After each wave completes: verify wave outputs before starting the next wave
```

Leave all the conservative choice rules and Permissions check lines unchanged.

---

### 3. apex-code/SKILL.md — Post-build steps

**Replace** the post-build block (steps 1–4) in its entirety:

Before:
```markdown
Execute in this order:

1. Spawn apex-docs-product-agent:
   Inputs: files_changed (from apex-coder summary), spec_path, today's date
   Wait for completion. Collect docs_summary.

2. Spawn apex-reviewer (unless token_profile is "lean"):
   Inputs: spec_path, files_changed
   Wait for completion. Collect reviewer_findings.

3. Spawn apex-docs-technical-agent:
   Inputs: spec_path, coder_summary, reviewer_findings, docs_summary, today's date
   Wait for completion.

4. Report to user:
   "Build complete. Handoff at docs/handoff/{date}.md.
   Reviewer: {clean | N findings — see handoff}.
   Decisions made: {count} — review in next planning session."
```

After:
```markdown
Execute in this order:

1. Spawn in parallel (neither depends on the other):
   - apex-docs-product-agent — inputs: files_changed, spec_path, today's date
   - apex-reviewer (skip if token_profile is "lean") — inputs: spec_path, files_changed
   Wait for both to complete. Collect docs_summary and reviewer_findings.

2. Spawn apex-docs-technical-agent:
   Inputs: spec_path, coder_summary, reviewer_findings, docs_summary, today's date
   Wait for completion.

3. Report to user:
   "Build complete. Handoff at docs/handoff/{date}.md.
   Reviewer: {clean | N findings — see handoff}.
   Decisions made: {count} — review in next planning session."
```

---

### 4. ~/apex/SKILL-HISTORY.md

Prepend this row before the existing rows:

```
| 2026-05-28 | apex-code | SKILL | 1.3.0 | updated (SKILL) | Added Wave Analysis step for parallel task dispatch; parallelised post-build docs+review agents | superpowers:dispatching-parallel-agents |
```

---

## Acceptance criteria

- `apex-code/SKILL.md` has `version: 1.3.0` in frontmatter
- File contains a `## Wave Analysis` step (step 7) between the Karpathy Pre-Flight and the "Context note:" line
- "During execution:" opens with "Execute waves in the order produced by Wave Analysis"
- Post-build step 1 reads "Spawn in parallel" with both apex-docs-product-agent and apex-reviewer listed under it
- Post-build has 3 numbered steps, not 4
- SKILL-HISTORY.md top row is the apex-code 1.3.0 entry

## Commands to run

```
grep -n 'version' ~/.claude/skills/apex-code/SKILL.md
grep -n 'Wave Analysis' ~/.claude/skills/apex-code/SKILL.md
grep -n 'Spawn in parallel' ~/.claude/skills/apex-code/SKILL.md
head -3 ~/apex/SKILL-HISTORY.md
```
