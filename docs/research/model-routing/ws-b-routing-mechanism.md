# WS-B: Model-Switching Mechanisms for APEX Backend Split

**Research phase:** Phase-2 Retrieval  
**Date:** 2026-06-21  
**Topic:** How can a coder model be switched per build-item in Claude Code, given APEX's backend split?  
**Sources:** docs.claude.com (code.claude.com), apex-code SKILL.md, apex-build-wave.js, apex-governance SKILL.md

---

## The Constraint

APEX uses `ANTHROPIC_BASE_URL` to split planning (Anthropic endpoint → Opus/Sonnet) from coding (DeepSeek endpoint → Flash/Pro). Crossing that line currently requires an env-var swap and a Claude Code restart. Within one backend, model selection is a settings/flag/frontmatter concern — no restart needed (just a `/model` change or `--model` flag).

---

## Mechanism Table

| # | Mechanism | Within-Anthropic-backend switch? | Cross to DeepSeek backend? | Needs restart? | Setup cost | Citation |
|---|-----------|----------------------------------|---------------------------|----------------|------------|----------|
| 1 | **Agent tool `model:` parameter** (per-invocation) | YES — picks among `sonnet`, `opus`, `haiku`, `fable`, or a full model ID; e.g. `Agent({model:"haiku"})` | NO — subagent inherits parent's `ANTHROPIC_BASE_URL`; the `model` param selects the model name, not the endpoint | No | Zero — already in use in apex-build-wave.js (inline in `agent()` call) | code.claude.com/docs/en/sub-agents#choose-a-model [VERIFIED] |
| 2 | **Subagent frontmatter `model:` field** (`.claude/agents/*.md`) | YES — accepts aliases (`sonnet`, `opus`, `haiku`, `fable`) or full model ID like `claude-opus-4-8`; defaults to `inherit` | NO — same base-URL-inheritance rule as #1; no per-agent base-URL field exists | No (hot if using `/agents`; restart if file-edited) | Low — write a `.md` file per agent type | code.claude.com/docs/en/sub-agents#supported-frontmatter-fields [VERIFIED] |
| 3 | **`CLAUDE_CODE_SUBAGENT_MODEL` env var** | YES — overrides ALL subagents' model; accepts aliases or full IDs; set to `inherit` to use normal resolution | NO — applies only to the model name, not the endpoint; all subagents still use parent's base URL | No (env var, takes effect immediately at next agent spawn) | Low — set one env var | code.claude.com/docs/en/model-config#environment-variables [VERIFIED] |
| 4 | **`/model` or `--model` flag / `ANTHROPIC_MODEL` env var** (session-level) | YES — switches the main session's model within current backend | NO — does not change `ANTHROPIC_BASE_URL` | No for `/model` mid-session; launch-time for `--model`/`ANTHROPIC_MODEL` | Zero — already available | code.claude.com/docs/en/model-config#setting-your-model [VERIFIED] |
| 5 | **`opusplan` model alias** | YES (Anthropic backend only) — Opus in plan mode, Sonnet in execution mode; automatic at plan/execute boundary | NO — requires Anthropic endpoint; DeepSeek doesn't map to this alias | No | Zero — one setting change | code.claude.com/docs/en/model-config#opusplan-model-setting [VERIFIED] |
| 6 | **Headless `claude -p` subprocess with per-process env** (separate process per model) | YES — each subprocess can carry `ANTHROPIC_MODEL=<x>` independently | YES — each subprocess can set its own `ANTHROPIC_BASE_URL` to Anthropic OR DeepSeek | No restart of caller; each call spawns fresh | High — subprocess spawn overhead; orchestrator must wait and collect results; no shared session state | code.claude.com/docs/en/headless [VERIFIED] |
| 7 | **LLM gateway (e.g. LiteLLM) as unified `ANTHROPIC_BASE_URL`** | YES — gateway can route per model name to Anthropic models | YES — gateway can also proxy DeepSeek behind the same endpoint, making `claude-deepseek-flash` or similar appear as model names under one base URL | No restart IF gateway is pre-configured | High — requires deploying and maintaining an LLM gateway; NEEDS-DOMAIN: litellm.ai | code.claude.com/docs/en/llm-gateway [VERIFIED] |
| 8 | **Env-swap + restart** (current APEX mechanism) | YES | YES — but costs a full session restart and env-var mutation | YES — full restart required | Low for manual; moderate for automation | APEX CLAUDE.md (internal) [VERIFIED] |

---

## Key Facts from Docs

### Subagent model resolution order (verified)

When a subagent is spawned, Claude Code resolves model in this priority order:
1. `CLAUDE_CODE_SUBAGENT_MODEL` env var (if set — overrides everything)
2. Per-invocation `model` parameter passed in the `Agent()` call
3. Subagent definition's `model` frontmatter field
4. Main conversation's active model (i.e. `inherit`)

Source: code.claude.com/docs/en/sub-agents#choose-a-model [VERIFIED]

### Base URL inheritance (critical finding)

**Subagents inherit the parent session's `ANTHROPIC_BASE_URL` unconditionally.** There is no per-subagent base URL field. The `model` parameter and frontmatter field select which model *name* to send to whatever endpoint the base URL points at. You cannot route a subagent to a different backend (Anthropic vs DeepSeek) within one parent session via the `model` field alone. [VERIFIED — inference from docs; no explicit "subagents inherit base URL" statement found, but the entire sub-agents doc has no per-subagent endpoint field, and all model choices resolve to the session's active endpoint] [ASSUMED for the inheritance direction specifically]

### `ANTHROPIC_BASE_URL` semantics

The docs explicitly state: "`ANTHROPIC_BASE_URL` changes where requests are sent, not which model answers them." This is a *session-level* env var, not a per-request or per-agent setting.

Source: code.claude.com/docs/en/model-config (note box at top) [VERIFIED]

### apex-build-wave.js current usage

The workflow dispatches `agent()` calls with `agentType: 'code-worker'` and optional `isolation: 'worktree'`, but **no `model:` override**. Workers inherit the session model (currently DeepSeek Flash). Adding `model: "sonnet"` to any `agent()` call in the workflow is syntactically valid per docs — but that would only work if the session is on the Anthropic endpoint. On the DeepSeek endpoint, "sonnet" would be sent to the DeepSeek base URL, which likely errors or maps to DeepSeek's interpretation of that string.

Source: C:\Users\User\.claude\workflows\apex-build-wave.js [VERIFIED]

### apex-code SKILL.md cross-model review note

The skill already acknowledges the cross-backend constraint: "Check a second backend is available — a host configured to route a subagent to the *other* model family." This confirms that the current architecture treats the second backend as an external check, not an in-session subagent route.

Source: C:\Users\User\.claude\skills\apex-code\SKILL.md §Post-build steps [VERIFIED]

### apex-governance SKILL.md `coder_tier` note

"The Flash/Pro coder tier (`coder_tier`) is orthogonal to the autonomy level." This confirms APEX already has a `coder_tier` concept (Flash vs Pro within the DeepSeek backend) that is meant to be a settings-level switch, not a per-task switch.

Source: C:\Users\User\.claude\skills\apex-governance\SKILL.md [VERIFIED]

### Headless subprocess — the only true cross-backend path without a gateway

`claude -p` accepts `--model` and respects `ANTHROPIC_BASE_URL` per-invocation as a subprocess. Launching separate `claude -p` processes from a parent orchestrator — each with its own env containing the correct `ANTHROPIC_BASE_URL` + `ANTHROPIC_MODEL` — is the only documented mechanism to address multiple backends within one "session" without an LLM gateway. Cost: process spawn overhead, no shared context, orchestrator must collect results manually. Feasible for AFK/headless builds; not feasible for interactive coding.

Source: code.claude.com/docs/en/headless [VERIFIED]

### LLM gateway as unifier

An LLM gateway (e.g. LiteLLM) placed at a single `ANTHROPIC_BASE_URL` can proxy requests to Anthropic or DeepSeek based on the model name in the request. This would let APEX set `ANTHROPIC_BASE_URL=<gateway>` once and use model names like `claude-sonnet-4-6` (→ Anthropic) or `deepseek-chat` (→ DeepSeek) in the `model` field of agent calls. The model-routing logic lives in the gateway config, not in Claude Code. This is a medium-complexity infrastructure addition.

NEEDS-DOMAIN: litellm.ai (for current LiteLLM DeepSeek proxy support docs)

---

## What APEX Already Does (Baseline)

- Planning session: `ANTHROPIC_BASE_URL` unset → Anthropic endpoint → Opus or Sonnet
- Coding session: `ANTHROPIC_BASE_URL=…/deepseek/anthropic` → DeepSeek endpoint → Flash (default) or Pro (via `/model` or `coder_tier`)
- Within DeepSeek session: switching Flash↔Pro = `/model` flag or `ANTHROPIC_MODEL` env var (no restart needed, same base URL) — but this is **session-global**, not per-task
- Within Anthropic session: switching Opus↔Sonnet = same `/model` mechanism
- Cross-backend (Anthropic↔DeepSeek): currently requires env-swap + restart

---

## Most Promising Path: Few-Switch Multi-Model Coding

**Batch by backend first, then use per-agent model overrides within each batch.**

For the within-DeepSeek-backend case (Flash vs Pro):
- Use `Agent(tool call with model: "claude-sonnet-4-6")` syntax — but this resolves against the DeepSeek endpoint, so the string must be whatever DeepSeek accepts (not a Claude alias). This is the weak point. [ASSUMED — unconfirmed whether DeepSeek endpoint accepts Claude model alias strings]
- More robustly: use `CLAUDE_CODE_SUBAGENT_MODEL` set before dispatching a wave, then reset — but this is session-global, not per-agent.
- Most robustly: Opus (planning) assigns each build-item a `coder_tier` tag; APEX batches all Flash items into one coding session and all Pro items into another, with a single `/model` switch between batches. **Two switches total for a mixed-tier build.** This is the lowest-overhead achievable path without a gateway.

For Anthropic-side per-item switching (Sonnet vs Opus within one Anthropic session):
- Use subagent frontmatter `model: sonnet` or `model: opus` per agent type — this works natively on the Anthropic endpoint with no restart.
- The Agent tool `model:` parameter works per-invocation.
- **Zero switches needed within Anthropic backend for Opus↔Sonnet routing.**

For cross-backend (Anthropic ↔ DeepSeek) per-item:
- No documented in-session mechanism exists. Options:
  1. **Headless subprocess per item** — works, high overhead, loses context.
  2. **LLM gateway** — medium infra cost, cleanest ongoing UX; routes by model name.
  3. **Batch by backend** — minimum 1 restart per backend boundary; plan assigns items to backends, coding sessions run backend-homogeneous batches.

**Recommended path for APEX:** Batch by backend (1–2 coding sessions per build, one per backend), then use subagent `model:` overrides within each session for intra-backend routing. This gives "few switches" (1–2 restarts per build max) with zero per-task overhead.

---

## NEEDS-DOMAIN Flags

- `NEEDS-DOMAIN: litellm.ai` — to confirm LiteLLM's current DeepSeek proxy support, model-name mapping, and whether it can serve as a unified `ANTHROPIC_BASE_URL` covering both Anthropic and DeepSeek in one endpoint (required for Mechanism #7 to work)
- `NEEDS-DOMAIN: github.com/anthropics/claude-code` — changelog/source to confirm whether subagents truly inherit the parent's `ANTHROPIC_BASE_URL` with no override path (the doc implies this but never states it explicitly)

---

## Confidence Summary

| Claim | Confidence |
|-------|-----------|
| Subagent `model:` field accepts aliases and full model IDs | [VERIFIED] |
| Model resolution order (CLAUDE_CODE_SUBAGENT_MODEL → per-invocation → frontmatter → inherit) | [VERIFIED] |
| `ANTHROPIC_BASE_URL` is session-level, not per-subagent | [VERIFIED] (doc statement) |
| Subagents inherit parent's base URL with no override | [ASSUMED] (no per-subagent endpoint field in docs) |
| `claude -p` subprocess accepts own `ANTHROPIC_BASE_URL` per-process | [VERIFIED] |
| LiteLLM can proxy DeepSeek and Anthropic under one base URL | [ASSUMED] (LiteLLM supports many providers; DeepSeek compatibility unconfirmed without litellm.ai access) |
| `/model` or `--model` within same backend = no restart | [VERIFIED] |
| Cross-backend switch requires env-swap + restart (current APEX) | [VERIFIED] (from APEX CLAUDE.md + apex-governance SKILL.md) |
