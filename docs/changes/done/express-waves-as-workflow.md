# Spec: Express wave worker fan-out as a Workflow script (Option C)

**Identity:** Add an opt-in workflow-dispatch path to `apex-code`: a reusable parameterised Workflow script runs each build wave's `code-worker` fan-out in the Workflow runtime's isolated context, returning a bounded per-task status array — so worker transcripts never enter the main coding-session context. (status.md In-Flight "Context-exhaustion on parallel builds", fix option **C**; supersedes retired spec A `coding-return-contract-enforcement.md`; complements pending spec B `apex-code-fanout-cap.md`. Decisive probe PASSED 2026-06-20: the Workflow tool runs `agent()` on DeepSeek, gated only by `enableWorkflows`.)

coder_tier: flash

## Files to Change

- `~/.claude/workflows/apex-build-wave.js` — **create** (the reusable per-wave fan-out workflow script)
- `~/.claude/skills/apex-code/SKILL.md` — modify (frontmatter version; add a `### Workflow dispatch path (opt-in)` subsection under § Wave Analysis; add one pointer bullet in the dispatch rule)
- `~/apex/SKILL-HISTORY.md` — modify (prepend one row)

## Assumptions

- `enableWorkflows: true` is set in `~/.claude/settings.json` (set during the session-51/52 probe; the Workflow tool is the only gate). Verify: `grep -n '"enableWorkflows"' ~/.claude/settings.json`. Impact if wrong: Stop (the workflow path cannot run; the inline fallback still works, but this spec's path is inert).
- `code-worker` is a registered agent type with `Read, Glob, Grep, Edit, Write, Bash, Skill` tools. Verify: `grep -n '^name: code-worker' ~/.claude/agents/code-worker.md`. Impact if wrong: Stop.
- The `agent()` `schema` option enforces a bounded structured return and **composes with** `agentType` (the custom agent's prompt gets a StructuredOutput instruction appended). Therefore `code-worker.md` needs **no change** — the workflow's schema governs the return shape, which is what makes C supersede A. Impact if wrong: Caution (if schema does not override code-worker Step 5's fat JSON, a follow-up trims code-worker.md; do not edit it pre-emptively in this spec).
- `apex-code` SKILL § Wave Analysis owns the dispatch rule. Verify: `grep -n "Dispatch rule:" ~/.claude/skills/apex-code/SKILL.md`. Impact if wrong: Stop.
- Current `apex-code` version is `1.14.0` (or `1.15.0` if spec B landed first). This spec sets `1.16.0` regardless (1.15.0 is reserved for spec B). Verify: `grep -n "^version:" ~/.claude/skills/apex-code/SKILL.md`. Impact if wrong: Caution.
- `~/.claude` is under blanket gitignore; the new script must be force-added by name when committed (`git add -f`), exactly as skill files are. Impact if wrong: Low (affects commit step only, not execution).

## Exact Changes

### Task 1 — create `~/.claude/workflows/apex-build-wave.js`

**done when:** the file exists and `node --check` parses it (syntax-valid JS), and `meta.name` is `apex-build-wave`.

Create the directory if absent, then write this file verbatim:

```js
export const meta = {
  name: 'apex-build-wave',
  description: 'Run one APEX build wave: dispatch a code-worker per task in parallel, return a bounded per-task status array. Intermediate worker transcripts stay in the workflow runtime, not the main context (ADR-015).',
  phases: [
    { title: 'Wave', detail: 'parallel code-worker fan-out for one wave' },
  ],
}

// args = {
//   spec_path:      string  — full path to the spec (workers read it; the script cannot)
//   token_profile:  string  — lean | balanced | thorough | custom
//   wave_label:     string  — e.g. "Wave 2" (for the returned summary)
//   tasks:          [ { id: string, text: string, files: string[], acceptance: string } ]
// }

const STATUS_SCHEMA = {
  type: 'object',
  properties: {
    task: { type: 'string' },
    status: { type: 'string', enum: ['DONE', 'DONE_WITH_CONCERNS', 'BLOCKED', 'NEEDS_CONTEXT'] },
    files_changed: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    concern: { type: 'string' },
  },
  required: ['task', 'status', 'files_changed', 'summary'],
  additionalProperties: false,
}

phase('Wave')

const results = await parallel(
  args.tasks.map((t) => () =>
    agent(
      [
        `Execute exactly one coding task from the spec at ${args.spec_path}.`,
        `Token profile: ${args.token_profile}.`,
        ``,
        `Task ${t.id}: ${t.text}`,
        `Files for this task: ${t.files.join(', ')}`,
        `Acceptance criterion: ${t.acceptance}`,
        ``,
        `Follow your code-worker contract: read every listed file before writing; implement`,
        `exactly this task and nothing more; run the spec's applicable commands; verify the`,
        `acceptance criterion before returning. Make the conservative choice on micro-ambiguity.`,
        `Return ONLY the bounded status object — never a transcript.`,
      ].join('\n'),
      { label: `worker:${t.id}`, agentType: 'code-worker', schema: STATUS_SCHEMA }
    )
  )
)

return { wave: args.wave_label, tasks: results.filter(Boolean) }
```

### Task 2 — `~/.claude/skills/apex-code/SKILL.md`: add the opt-in workflow dispatch path

**done when:** a `### Workflow dispatch path (opt-in)` subsection exists under § Wave Analysis, and the dispatch rule carries one pointer bullet to it; the inline Agent dispatch remains the default path.

**2a.** In **§ AFK Build Mode → Wave Analysis**, inside the `Dispatch rule:` block, add this bullet as the **first** item under `Dispatch rule:` (before the existing "Wave with 2+ independent tasks" bullet):

```
   - **Workflow dispatch (opt-in):** if `wave_dispatch: workflow` is set (spec frontmatter, else
     status.md, else default `inline`) AND the wave has **2+ independent tasks**, dispatch the wave
     via the Workflow runtime instead of spawning code-worker agents inline — see § Workflow dispatch
     path below. The runtime isolates worker transcripts so they never enter this context. Otherwise
     use the inline rules below.
```

**2b.** Immediately **after** the entire `Dispatch rule:` block (after the last `- All tasks sequential …` line, before the "**Worker return contract**" paragraph), insert this new subsection:

```
   #### Workflow dispatch path (opt-in)

   When `wave_dispatch: workflow` is active, run each **2+-task (sub-)wave** through the native
   Workflow tool instead of inline Agent dispatch. This keeps the per-worker transcripts inside the
   Workflow runtime (ADR-015 isolation) — the main context receives only a bounded status array.

   Per 2+-task (sub-)wave:
   1. Build the `args` object from the wave plan you already produced:
      ```
      {
        "spec_path": "<full path to the spec being built>",
        "token_profile": "<active token profile>",
        "wave_label": "Wave <N>",
        "tasks": [
          { "id": "<task id>", "text": "<exact task text>",
            "files": ["<file>", ...], "acceptance": "<the task's done-when / acceptance criterion>" }
        ]
      }
      ```
   2. Invoke `Workflow({ scriptPath: "<home>/.claude/workflows/apex-build-wave.js", args })`
      (resolve `<home>` to the absolute home directory, e.g. `C:/Users/User` here).
   3. The call returns `{ wave, tasks: [ { task, status, files_changed, summary, concern? } ] }`.
      Route each returned status through the **same Worker return contract** below — `DONE` /
      `DONE_WITH_CONCERNS` → decisions table; `BLOCKED` / `NEEDS_CONTEXT` → Forks (capture-at-halt
      stays here in apex-code, fed by the returned status).
   4. Single-task waves still execute directly (no workflow, no agent), exactly as the inline rule.
   5. After the wave returns, run § Wave domain review and continue — review, sequencing, and
      post-build are unchanged by this path.

   Prerequisite: `enableWorkflows: true` in settings (already set). If the `Workflow` tool is
   unavailable or errors at dispatch, fall back to inline Agent dispatch for that wave and log it in
   the decisions table — never block the build on the workflow path.

   Validation status: this path is unproven end-to-end. The first build run with
   `wave_dispatch: workflow` is its proving run; if it misbehaves, unset the flag (or
   `enableWorkflows: false`) to fall back to inline dispatch.
```

### Task 3 — `~/.claude/skills/apex-code/SKILL.md`: frontmatter bump

**done when:** version is `1.16.0` and `last_updated` is `2026-06-20`.

- Change `version:` line value → `1.16.0`
- Change `last_updated:` line value → `2026-06-20`

### Task 4 — `~/apex/SKILL-HISTORY.md`: log the change

**done when:** a new top row records this change.

Prepend one row under the header (newest-first):

```
| 2026-06-20 | apex-code | skills/apex-code/SKILL.md, workflows/apex-build-wave.js | 1.16.0 | updated (SKILL) | Opt-in Workflow dispatch path (wave_dispatch: workflow) — per-wave code-worker fan-out runs in the Workflow runtime, returning a bounded per-task status array; worker transcripts stay out of main context (ADR-015, Option C). New reusable workflow script apex-build-wave.js. | Workflow tool DeepSeek probe (session 52) |
```

## Acceptance Criteria

1. Workflow script exists and parses → verify: `node --check ~/.claude/workflows/apex-build-wave.js` exits 0.
2. Script declares the right name → verify: `grep -q "name: 'apex-build-wave'" ~/.claude/workflows/apex-build-wave.js`.
3. Script dispatches code-worker via agentType → verify: `grep -q "agentType: 'code-worker'" ~/.claude/workflows/apex-build-wave.js`.
4. Workflow dispatch subsection present → verify: `grep -q "Workflow dispatch path (opt-in)" ~/.claude/skills/apex-code/SKILL.md`.
5. Opt-in flag documented in dispatch rule → verify: `grep -q "wave_dispatch: workflow" ~/.claude/skills/apex-code/SKILL.md`.
6. Inline fallback preserved → verify: `grep -q "fall back to inline Agent dispatch" ~/.claude/skills/apex-code/SKILL.md`.
7. Version bumped → verify: `grep -q "^version: 1.16.0" ~/.claude/skills/apex-code/SKILL.md`.
8. History row present → verify: `grep -q "Opt-in Workflow dispatch path" ~/apex/SKILL-HISTORY.md`.

Note: criteria 1–8 verify the artifact. **End-to-end behaviour (workers run isolated on DeepSeek, bounded return) is proven only by the first real build run with `wave_dispatch: workflow`** — not assertable by grep. That proving run is the explicit follow-up.

## Commands to Run

```
mkdir -p ~/.claude/workflows
node --check ~/.claude/workflows/apex-build-wave.js
```
Then run the eight checks above; each must exit 0.
