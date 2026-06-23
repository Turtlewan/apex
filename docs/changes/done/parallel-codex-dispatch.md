---
spec: parallel-codex-dispatch
status: ready
token_profile: balanced
autonomy_level: L2
---

# Spec: Parallel Codex dispatch within a wave

**Identity:** apex-code launches concurrent background `codex exec` subprocesses for the independent
`▸codex` tasks in a wave, capped by `max_parallel_codex`, with git-worktree-per-task isolation.
→ why: see docs/technical/adr/ADR-028-parallel-codex-dispatch.md.

<!-- APEX self-edit, applied planning-direct (skill .md files). Invoke apex-skill-author first
     (lightweight Iron Law — structural/mechanism edit to an existing skill, per
     [[iron-law-application-depth]]). -->

## Assumptions
- apex-code SKILL.md § "Model-routing dispatch (ADR-027)" currently says "Parallel Codex is OUT of
  scope — keep `▸codex` tasks sequential" → impact: Stop (this is the exact line being replaced)
- The host (Opus `APEX_MODE=coding` session) can run Bash `run_in_background` to launch detached
  subprocesses and is re-invoked on their exit → impact: Stop (the mechanism depends on it)
- `git merge` is a permanent hard block; `git checkout <branch> -- <paths>` and `git worktree` are not
  → impact: Stop (integration mechanism depends on it)
- Spec-template / status-template already carry `coder_model` / `coder_models` knobs in the same style
  the new `max_parallel_codex` knob will follow → impact: Low

Simplicity check: considered same-tree disjoint-files (no worktree) — rejected per ADR-028 (artifact
races + Windows sandbox ACL lock). Worktree-per-task is the settled, safe minimum. No `if-parallel`
config bloat: one cap knob, default auto-sized.

## Prerequisites
- ADR-028 written (done).

## Files to change
- `~/.claude/skills/apex-code/SKILL.md` (modify)
- `~/.claude/skills/apex-orchestrate/templates/spec-template.md` (modify)
- `~/.claude/skills/apex-orchestrate/templates/status-template.md` (modify)
- `~/apex/SKILL-HISTORY.md` (modify — triple-write row)

## Tasks

### Task 1 — apex-code: replace the "Codex is sequential" rule with parallel dispatch
**Files:** `~/.claude/skills/apex-code/SKILL.md`

In § "Model-routing dispatch (ADR-027)", the `codex` dispatch bullet currently ends with:
> Parallel Codex is OUT of scope — keep `▸codex` tasks sequential.

Replace that sentence with a pointer to a new subsection, and **add** the subsection immediately after
the model-routing dispatch table (before "Task granularity is fixed…"):

```markdown
   #### Parallel Codex dispatch (ADR-028)

   Codex tasks default to **sequential**, but when a dependency (sub-)wave has **2+ independent
   `▸codex` tasks** the host runs them as **concurrent background `codex exec` subprocesses** (Bash
   `run_in_background`) — Codex subprocesses are OS processes, not subagents, so the host can fan them
   out and collect them. The Workflow / `apex-build-wave.js` path is NOT used here (its `agent()`
   spawns Claude-Code subagents, which can't drive the external Codex CLI).

   - **Cap (machine protection, not a quota device):**
     `max_parallel_codex = max(1, min(4, floor(physical_cores / 2) − 1))` → **3** on this host.
     Detect cores (`nproc` / PowerShell `(Get-CimInstance Win32_Processor).NumberOfCores`); if
     detection is unavailable, default **3**. Override per spec with `max_parallel_codex` frontmatter
     (`1` = sequential = ADR-027 behaviour; status.md carries the project default). A (sub-)wave wider
     than the cap splits into sequential sub-waves of ≤cap (mirrors `worker_cap`). Each `codex exec`
     runs the full local toolchain, so keep the cap well below the Workflow's `min(16, cores−2)`.
   - **Isolation = git-worktree-per-task.** For each parallel task: `git worktree add <path> -b
     codex/<task-id>` from HEAD, then `printf '%s' "<task prompt>" | codex exec -p apex-coder
     --sandbox workspace-write -m gpt-5.5 -C <worktree>` (same prompt + autonomy clause as the
     sequential path). Launch all tasks in the sub-wave with `run_in_background`; wait for every
     subprocess to exit before integrating.
   - **Integrate (NOT `git merge` — hard block).** Tasks in a wave write disjoint files, so bring each
     task's changes into the main tree with `git checkout codex/<task-id> -- <that task's files>`.
     Then run the spec's Verification Recipe **once on the integrated main tree** as the authoritative
     gate (each Codex already self-verified inside its worktree; the integrated re-verify catches
     project-wide issues like a whole-repo typecheck).
   - **Teardown.** `git worktree remove --force <path>` then delete the branch. If removal fails on
     Windows sandbox-SID-owned cache dirs, clear them with the codex-exec cleanup trick (§ Windows
     sandbox artifact ownership) before retrying.
   - **Failure / fallback (ADR-027 unchanged).** A subprocess that exits non-zero / rate-limited → that
     task falls back to Opus (host builds it inline). A quota-out means the pool is dead → stop
     launching further Codex and fall back the remaining sub-wave tasks to Opus (sequential). A task
     that won't converge after honest recovery → fork (capture-at-halt).
```

Then, in § "Verification — run the stack's recipe", in the **Model fallback on verify-fail or
quota-out** block, append one sentence to the `codex → opus` bullet:
> Under parallel dispatch (ADR-028) a quota-out on any concurrent subprocess fails the whole Codex pool
> → fall back the remaining sub-wave tasks to Opus (sequential).

**done when:** SKILL.md no longer contains "Parallel Codex is OUT of scope"; the new
`#### Parallel Codex dispatch (ADR-028)` subsection is present with cap, worktree, `git checkout`
integration, teardown, and fallback bullets; the verification-fallback sentence is added. SKILL.md is
still ≤500 lines (`wc -l`).

### Task 2 — spec-template: add the `max_parallel_codex` knob
**Files:** `~/.claude/skills/apex-orchestrate/templates/spec-template.md`

After the `# coder_model: codex` commented block (line ~12), add:

```
# max_parallel_codex: 3      # optional — cap on concurrent `codex exec` subprocesses per wave
#                              (ADR-028). 1 = sequential. Absent → status.md default (auto-sized
#                              min(4, floor(cores/2)−1), fallback 3). Machine-protection, not a quota cap.
```

**done when:** the commented `max_parallel_codex` line is present in the spec-template frontmatter block.

### Task 3 — status-template: add the project default
**Files:** `~/.claude/skills/apex-orchestrate/templates/status-template.md`

After the `coder_models:` line (line ~9), add:

```
max_parallel_codex: 3     # project default cap on concurrent `codex exec` subprocesses per wave (ADR-028); machine-protection rate dial, not a quota cap. Auto-sized min(4, floor(cores/2)−1); 1 = sequential.
```

**done when:** the `max_parallel_codex: 3` line is present in the status-template frontmatter block.

### Task 4 — triple-write SKILL-HISTORY
**Files:** `~/apex/SKILL-HISTORY.md`

Prepend one row (newest-first) to the history table:

```
| 2026-06-23 | apex-code | SKILL.md (+ orchestrate templates) | 1.23.0 | updated | Parallel Codex dispatch within a wave: concurrent background `codex exec` subprocesses for 2+ independent `▸codex` tasks, `max_parallel_codex` cap (default 3, auto-sized), git-worktree-per-task isolation, `git checkout`-integrate (not merge), Opus fallback on quota-out. | ADR-028 |
```

Bump apex-code SKILL.md frontmatter `version` to `1.23.0` and `last_updated` to `2026-06-23`; add
`docs/technical/adr/ADR-028-parallel-codex-dispatch.md` to its `sources:` list.

**done when:** the SKILL-HISTORY row is the top data row; apex-code frontmatter shows `version: 1.23.0`,
`last_updated: 2026-06-23`, and the ADR-028 source line.

## Acceptance criteria
1. `grep -c "Parallel Codex is OUT of scope" ~/.claude/skills/apex-code/SKILL.md` → `0`.
2. `grep -c "Parallel Codex dispatch (ADR-028)" ~/.claude/skills/apex-code/SKILL.md` → `1`.
3. `grep -c "max_parallel_codex" ~/.claude/skills/apex-orchestrate/templates/spec-template.md` → ≥1.
4. `grep -c "max_parallel_codex" ~/.claude/skills/apex-orchestrate/templates/status-template.md` → ≥1.
5. `head -1` of the SKILL-HISTORY data rows references ADR-028 / parallel Codex.
6. `wc -l ~/.claude/skills/apex-code/SKILL.md` ≤ 500.

## Commands to run
```
grep -n "Parallel Codex" ~/.claude/skills/apex-code/SKILL.md
grep -n "max_parallel_codex" ~/.claude/skills/apex-orchestrate/templates/spec-template.md ~/.claude/skills/apex-orchestrate/templates/status-template.md
wc -l ~/.claude/skills/apex-code/SKILL.md
```
