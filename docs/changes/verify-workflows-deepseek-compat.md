# Verify: do native dynamic workflows / `ultracode` run on the DeepSeek backend?

**Identity:** A ~2-minute **interactive** verification probe (NOT an AFK build) — determines whether Claude Code's native dynamic-workflow runtime honours the DeepSeek `ANTHROPIC_BASE_URL` swap. The answer decides whether Issue-1 "option C" is solved natively (and whether the A+B specs can be dropped/reduced). Run it at the start of a DeepSeek coding session. (status.md In-Flight "Context-exhaustion on parallel builds".)

coder_tier: flash

## Why this is a checklist, not an AFK spec

This requires switching backends, an interactive `ultracode:` prompt, and reading the `/workflows`
TUI — it can't be executed unattended. The "tasks" below are manual steps for the operator.

## Pre-flight (already verified in planning, 2026-06-19)

- Claude Code **v2.1.183** (≥ v2.1.160) → `ultracode` keyword + dynamic workflows available.
- `disableWorkflows` absent from settings.json → workflows enabled; `skipWorkflowUsageWarning: true`.
- DeepSeek backend = local `ANTHROPIC_BASE_URL` env swap (process-local runtime → expected to inherit).

## Steps

1. **Switch to the DeepSeek coding backend** — set `ANTHROPIC_BASE_URL` to the DeepSeek proxy and restart Claude Code.
   - verify: session start banner shows coding mode / DeepSeek backend.
2. **Launch a trivial workflow** — at the prompt, enter:
   ```
   ultracode: list every .md file under docs/ and report the total count
   ```
   - verify: Claude highlights the `ultracode` keyword and offers to run it as a workflow (approve it).
3. **Confirm it launches** — run `/workflows`, select the run, press Enter.
   - verify: a run appears with phases/agents and progresses (does not immediately error out).
4. **Confirm the agents run on DeepSeek, not Claude** — drill into an agent (`Enter`/`→`) and inspect.
   - verify: the agents execute against DeepSeek — check token totals / response style, or which usage pool the run bills to (DeepSeek pool, not the Anthropic credit pool). This is the decisive check.

## Outcomes → routing

- **PASS (agents run on DeepSeek):** option C is native. Record in status.md; re-open the A+B scope —
  likely keep **B only** (fan-out hygiene still useful) and **drop A** (the workflow runtime keeps
  intermediate results out of context, which is what A's return-contract fix was for). Do NOT delete
  the A spec until this is confirmed.
- **FAIL (errors, or silently runs on Claude / Anthropic pool):** the Cloud-Routines-style limit
  applies after all — keep the A+B specs as the real fix for DeepSeek coding builds. Record the
  failure mode (error text or which pool it billed).

## Acceptance Criteria

1. A workflow run launches from a DeepSeek session without error → verify: step 3 shows a live run.
2. The decisive backend check is recorded → verify: status.md In-Flight row updated with PASS/FAIL + evidence (token pool or error).

## Commands to Run

None scripted — this is an interactive TUI probe. Record the result back into status.md.
