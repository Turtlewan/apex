# Verify: does the native **Workflow tool** orchestrate on the DeepSeek backend? (Option C decisive test)

**Identity:** A ~5-minute **interactive** probe (NOT an AFK build) — determines whether Claude Code's native **Workflow tool** (the scriptable orchestration runtime, *separate* from the model-gated `ultracode` effort tier) runs its `agent()` fan-out on the **DeepSeek** session model. PASS = Option C is native and may **supersede spec A** (`coding-return-contract-enforcement`). Run at the start of a DeepSeek coding session. (status.md In-Flight "Context-exhaustion on parallel builds".)

coder_tier: flash

## Why this is a checklist, not an AFK spec

It requires switching backends, toggling a config setting + restart, and reading the `/workflows`
TUI — it can't run unattended. The "tasks" below are manual operator steps.

## Background (binary-verified, session 51 — `claude.exe` v2.1.183)

- The **Workflow tool** is gated **only** by `enableWorkflows` (config) / `CLAUDE_CODE_DISABLE_WORKFLOWS` —
  **no effort/model check in that code path.** The `ultracode` *effort tier* is separately gated by a
  model-capability check (Anthropic-only: Fable/Opus/Sonnet/Haiku) — that gate is NOT what blocks the
  Workflow tool. We are deliberately testing the Workflow tool, not the `ultracode:` keyword.
- Workflow `agent()` model = session model by default (`CLAUDE_CODE_SUBAGENT_MODEL="inherit"`) or a
  per-workflow `defaultModel`. On DeepSeek it *should* inherit DeepSeek.
- **The one unknown this probe resolves:** the `agent()` call validates the subagent model against
  `availableModels`, which is populated by a `[modelCapabilities]` fetch that can `fetch failed`. Over
  the DeepSeek→Anthropic proxy that fetch may fail or omit the DeepSeek model → `agent()` could reject
  with *"Subagent model '…' is not in the availableModels"*. PASS/FAIL hinges on this.

## Files to change

- **Create** `~/.claude/workflows/probe-deepseek.js` — the throwaway test workflow script (Task 2).

## Steps

1. **Switch to the DeepSeek coding backend** — set `ANTHROPIC_BASE_URL` to the DeepSeek proxy and restart Claude Code.
   - verify: session-start banner shows coding mode / DeepSeek backend.

2. **Enable dynamic workflows + create the probe script.**
   a. Set `enableWorkflows: true` in `~/.claude/settings.json` (or `/config` → "Dynamic workflows" → on). Restart if prompted.
      - verify: `/work` autocomplete now lists **`/workflows`** (absent when workflows are disabled — this confirms the toggle took).
   b. Create `~/.claude/workflows/probe-deepseek.js` with a minimal one-agent script:
      ```js
      export const meta = {
        name: "probe-deepseek",
        description: "Single agent() fan-out — tests whether workflow agents run on the DeepSeek session model.",
      };

      export default async function () {
        const out = await agent({
          agentType: "general-purpose",
          prompt: "Reply with exactly the number of .md files under docs/ (run a count). Output only the number.",
        });
        log(out);
        return out;
      }
      ```
      - **API note (the script shape is reverse-engineered):** the runtime requires `export const meta = { name, description }` + an exported function using `agent()/parallel()/pipeline()/phase()/log()`, and scripts **must be deterministic** (no `Date.now()`/`Math.random()`/`import()`). If the Workflow tool rejects this script, read the error + the tool's input schema (visible once workflows are enabled) and adjust the `agent()` signature accordingly — the *decisive observation is the model behaviour at the `agent()` step*, not script perfection.

3. **Launch the workflow.** In the DeepSeek session, instruct it to invoke the Workflow tool:
   `Workflow({scriptPath: "~/.claude/workflows/probe-deepseek.js"})` (or by name `probe-deepseek`).
   - verify: a run appears under `/workflows` and reaches the `agent()` step (does not error at parse/launch).

4. **DECISIVE — inspect the `agent()` step.** Drill into the run (`/workflows` → the run → the agent).
   - verify (PASS): the `agent()` executes and the work runs on **DeepSeek** (check token pool / response style / model label) — NOT the Anthropic credit pool.
   - verify (FAIL): the `agent()` rejects with *"Subagent model … not in availableModels"*, or `[modelCapabilities] fetch failed`, or it silently runs on Claude/Anthropic pool.
   - **Fallback before declaring FAIL:** set `CLAUDE_CODE_SUBAGENT_MODEL` to the DeepSeek model string (the value of `ANTHROPIC_MODEL`) and re-run Task 3. If it then runs on DeepSeek → PASS-with-config; record the required env.

## Outcomes → routing

- **PASS (agent() runs on DeepSeek):** Option C is native via the Workflow tool. Re-open the A+B scope —
  likely **drop spec A** (`coding-return-contract-enforcement`) in favour of expressing APEX's parallel
  build waves as a workflow script (the runtime keeps intermediate `agent()` results out of the main
  context, which is exactly what A's return-contract fix was for). **Keep spec B** (fan-out hygiene still
  useful). Do NOT delete spec A until a follow-up planning session designs the workflow-script approach.
- **FAIL:** the model-capability gate reaches the Workflow tool's `agent()` after all — keep **A+B** as the
  real fix for DeepSeek builds. Record the exact failure mode (error text / which pool billed / whether
  the `CLAUDE_CODE_SUBAGENT_MODEL` fallback changed anything).

## Acceptance Criteria

1. `/workflows` appears after enabling → verify: Step 2a autocomplete check passes.
2. A workflow run launches and reaches its `agent()` step → verify: Step 3 shows a live run in `/workflows`.
3. The decisive backend result is recorded → verify: status.md In-Flight row updated with PASS/FAIL + evidence (token pool / error text / fallback outcome).

## Commands to Run

None scripted beyond editing settings + the one script file — this is an interactive TUI probe. Record the result back into status.md and delete `~/.claude/workflows/probe-deepseek.js` when done.
