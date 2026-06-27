# WS-D: Observability / `codex exec --json` Event Stream
**Phase-2 retrieval — cite sources, no recommendations**
_Date: 2026-06-27_

---

## 1. `codex exec --json` Event Stream

### Format
`--json` ("Print newline-delimited JSON events instead of formatted text") converts stdout to a **JSONL stream** — one JSON object per line, emitted as events occur. [VERIFIED — developers.openai.com/codex/cli/reference]

The JSONL format used by `codex exec --json` is the **same underlying protocol** as `codex app-server`; the SDK explicitly documents these as two transports over the same event model:
> "Exec JSONL (default): spawns `codex exec --json` and parses JSONL events … App-Server (optional): maintains a stateful `codex app-server` subprocess … Both use newline-delimited JSON-RPC over stdio." [VERIFIED — codex-sdk.hexdocs.pm/02-architecture.html]

**Caveat**: the SDK also notes a feature parity gap — the app-server transport exposes some events that exec mode does not (`fs/changed`, `plugin/read`, `thread/shellCommand`, `item/permissions/requestApproval`, `mcpServer/startupStatus/updated`, guardian review notifications). [VERIFIED — codex-sdk.hexdocs.pm/02-architecture.html]

### Full Event Type Enumeration (app-server / exec --json stream)

Source: developers.openai.com/codex/app-server (exhaustive schema returned by `codex app-server generate-json-schema`).

#### Thread lifecycle
| Event | Payload fields |
|---|---|
| `thread/started` | `{ thread: { id, sessionId, preview, ephemeral, modelProvider, createdAt } }` |
| `thread/status/changed` | `{ threadId, status: { type: "notLoaded\|idle\|systemError\|active", activeFlags? } }` |
| `thread/name/updated` | `{ threadId, name }` |
| `thread/goal/updated` | `{ threadId, goal: { objective, status, tokenBudget, tokensUsed, timeUsedSeconds } }` |
| `thread/goal/cleared` | `{ threadId }` |
| `thread/tokenUsage/updated` | per-thread running token accounting (see §3 for fields) |
| `thread/archived` / `thread/unarchived` / `thread/closed` / `thread/deleted` | `{ threadId }` |

#### Turn lifecycle
| Event | Payload |
|---|---|
| `turn/started` | `{ turn: { id, status: "inProgress", items: [], error: null } }` |
| `turn/completed` | `turn.status` = `completed \| interrupted \| failed`; includes `tokenUsage` block (§3) |
| `turn/diff/updated` | `{ threadId, turnId, diff }` — unified diff of file changes |
| `turn/plan/updated` | `{ turnId, explanation?, plan: [{ step, status: "pending\|inProgress\|completed" }] }` |

#### Item lifecycle
| Event | Description |
|---|---|
| `item/started` | Full item object with `id` and `type` |
| `item/completed` | Authoritative final state; `status: completed\|failed\|declined` |
| `item/agentMessage/delta` | Streamed reply text (append) |
| `item/plan/delta` | Streamed proposed plan text |
| `item/reasoning/summaryTextDelta` | Readable reasoning summary; `summaryIndex` increments per section |
| `item/reasoning/summaryPartAdded` | Boundary marker between reasoning sections |
| `item/reasoning/textDelta` | Raw reasoning text — **model-dependent support** |
| `item/commandExecution/outputDelta` | Stdout/stderr chunks, base64-encoded `deltaBase64` |
| `item/commandExecution/requestApproval` | Command awaits approval; includes `command`, `cwd`, `commandActions`, `availableDecisions` |
| `item/fileChange/requestApproval` | File modification awaits approval |
| `item/tool/requestUserInput` | Prompts user with 1-3 questions (experimental) |
| `item/enteredReviewMode` / `item/exitedReviewMode` | Guardian review lifecycle |
| `item/tool/call` | MCP/dynamic tool invocation |

#### Collaboration (subagent) events
| Event | Payload |
|---|---|
| `collabToolCall` | `{ id, tool, status, senderThreadId, receiverThreadId?, newThreadId?, prompt?, agentStatus? }` |

`tool` values: `spawn_agent`, `send_input`, `resume_agent`, `wait`, `close_agent`
`status` values: `inProgress`, `completed`, `failed`

[VERIFIED — developers.openai.com/codex/app-server + search results citing app-server README]

#### Other item types
`contextCompaction`, `imageView`, `webSearch`, `mcpToolCall`, `dynamicToolCall`

#### Schema generation
```bash
codex app-server generate-ts --out ./schemas
codex app-server generate-json-schema --out ./schemas
```
Output is version-specific; regenerate after updates. [VERIFIED — developers.openai.com/codex/app-server]

---

## 2. Ultra Mode Subagent Visibility

### What ultra mode is
GPT-5.6 Sol introduces two execution modes:
- **`max`**: deepens a single chain of reasoning ("the most time to reason deeply")
- **`ultra`**: "goes beyond the capabilities of a single agent by leveraging subagents to accelerate complex work" — coordinates multiple worker agents in parallel on a single task [VERIFIED — openai.com/index/previewing-gpt-5-6-sol/ (June 26 2026 announcement); 9to5Mac report of same]

GPT-5.6 is in **limited preview** (~20 organizations) as of June 27, 2026; broader access "coming in the coming weeks." Developer documentation has not been publicly released for ultra/max activation parameters. [VERIFIED — marktechpost.com/2026/06/26 citing OpenAI announcement]

### What the stream exposes for subagents (pre-ultra, confirmed)

The `collabToolCall` event surfaces in the parent stream for explicit multi-agent workflows:
> "child spawn begin and end, follow-up interaction begin and end, waiting begin and end, close begin and end, typed collaboration tool-call items in the item stream" [VERIFIED — codex-sdk.hexdocs.pm/10-subagents.html]

The SDK further confirms: "subagent workflows are much easier to debug when you stream events instead of waiting for only the final answer." [VERIFIED — codex-sdk.hexdocs.pm/10-subagents.html]

GitHub issue #17523 (2026-04-03) provides empirical evidence: subagent completion notifications surfaced in the parent stream as `InterAgentCommunication` assistant envelopes (this was a bug — they were leaking as raw JSON — but it confirms subagent activity DOES propagate to the parent event stream). The leaked structure was:
```json
{"author":"/root/task1_spec_review_rerun","recipient":"/root","other_recipients":[],
 "content":{"agent_path":"/root/task1_spec_review_rerun","status":{"completed":"SPEC_PASS ..."}}}
```
[COMMUNITY — github.com/openai/codex/issues/17523]

### What is UNKNOWN for ultra mode specifically

**UNKNOWN**: Whether ultra mode's automatically-spawned subagents (vs. explicitly user-requested subagents) emit `collabToolCall` events in the parent stream. Ultra is a new in-model orchestration layer announced June 26 — no developer documentation on its event surface is publicly available.

**UNKNOWN**: Whether per-subagent *internal* activity (individual reasoning steps via `item/reasoning/summaryTextDelta`, individual shell commands via `item/commandExecution/outputDelta`, per-turn token counts via `turn/completed`) appears in the parent `codex exec --json` stream, or whether only the boundary events (`collabToolCall` spawn/complete) are visible.

The Langfuse observability plugin evidence is instructive: it resolves "subagent threads from their own rollout files and nested under the spawning turn" — indicating per-subagent internals are written to SEPARATE session JSONL files at `~/.codex/sessions/YYYY/MM/DD/rollout-{UUID}.jsonl`, not piped into the parent stream. [COMMUNITY — github.com/langfuse/codex-observability-plugin]

This creates a plausible (but unconfirmed) two-tier visibility model:
- **Parent stream** (`codex exec --json`): sees `collabToolCall` boundary events (spawn/complete) with agentStatus
- **Per-subagent session files**: full item-level detail (reasoning, commands, usage) in separate JSONL rollout files

**ASSUMED** (not confirmed): this model is consistent with the existing multi-agent behavior documented for non-ultra subagents, and may apply equally to ultra's automatically-spawned workers — but this has NOT been verified against ultra mode specifically.

---

## 3. Token Usage Accounting

### Confirmed field schema

`turn/completed` carries a `tokenUsage` block [VERIFIED — developers.openai.com/codex/noninteractive]:
```json
{
  "type": "turn.completed",
  "usage": {
    "input_tokens": 24763,
    "cached_input_tokens": 24448,
    "output_tokens": 122,
    "reasoning_output_tokens": 0
  }
}
```

The app-server schema uses camelCase fields [VERIFIED — developers.openai.com/codex/app-server]:
```json
{
  "tokenUsage": {
    "inputTokens": number,
    "outputTokens": number,
    "reasoningInputTokens": number,
    "reasoningOutputTokens": number,
    "cacheCreationInputTokens": number,
    "cacheReadInputTokens": number
  }
}
```

`thread/tokenUsage/updated` carries the same structure at thread scope during active turns. The PR #18023 ("replay token usage after resume and fork") confirms this notification is used to propagate historical token counts to newly-attached clients; each subagent thread emits its own `thread/tokenUsage/updated`. [VERIFIED — github.com/openai/codex/pull/18023]

### `max` mode (deep reasoning)

Max mode = "deepens a single chain of reasoning" = effectively maps to `model_reasoning_effort: xhigh` (config accepts `minimal|low|medium|high|xhigh`). [VERIFIED — config from developers.openai.com/codex/config-reference; mode from openai.com announcement]

Under max, `reasoningOutputTokens` and `reasoningInputTokens` in the `turn/completed` event will be elevated. The `item/reasoning/summaryTextDelta` stream provides a human-readable summary of the reasoning in real-time; `item/reasoning/textDelta` provides raw reasoning tokens (model-dependent). [VERIFIED — developers.openai.com/codex/app-server]

**UNKNOWN**: Whether max mode introduces a separate token bucket or billing category vs standard extended-thinking, or whether it simply uses the existing `reasoningOutputTokens` field. No documentation published for GPT-5.6 max specifically.

### `ultra` mode (multiple subagents)

The documentation confirms: "subagent workflows consume more tokens than comparable single-agent runs. Each subagent does its own model and tool work." [VERIFIED — developers.openai.com/codex/cli/features + subagents page]

**UNKNOWN**: Whether ultra mode exposes per-subagent token breakdown in the parent stream (e.g., one `thread/tokenUsage/updated` per worker thread), or only an aggregate total.

**ASSUMED** (consistent with existing multi-agent behavior but not ultra-specific): each subagent thread emits its own `thread/tokenUsage/updated` — so if ultra workers run as separate threads and the parent subscribes to those threads, per-worker usage may be observable. However, whether `codex exec --json` automatically subscribes to child thread usage events is undocumented.

---

## 4. New Observability Features (GPT-5.6 era / 2026)

| Feature | Details | Source tier |
|---|---|---|
| **OpenTelemetry** | Opt-in via `[otel]` config; exports traces, logs, metrics via OTLP/HTTP or OTLP/gRPC; traces cover API requests, tool approvals, tool results, stream throughput, token counts per session | VERIFIED — developers.openai.com/codex/config-reference; codex.danielvaughan.com OTel article |
| **`usage.jsonl`** | `postTaskComplete` hook writes `{ ts, model, tokens, session_id }` to `~/.codex/usage.jsonl` | COMMUNITY — codex.danielvaughan.com OTel article |
| **Session rollout files** | `~/.codex/sessions/YYYY/MM/DD/rollout-{ISO_TIMESTAMP}-{UUID}.jsonl`; separate file per agent thread; Langfuse plugin resolves per-subagent detail from these | COMMUNITY — github.com/PixelPaw-Labs/codex-trace; github.com/langfuse/codex-observability-plugin |
| **`/usage` views** | Daily/weekly/cumulative account-level token activity added in v0.140.0 | VERIFIED — releasebot.io/updates/openai/codex |
| **`thread/goal/updated`** | Streams `{ tokenBudget, tokensUsed, timeUsedSeconds }` in real-time when goal mode active | VERIFIED — developers.openai.com/codex/app-server |
| **SubagentStart / SubagentStop hooks** | Fire when any subagent initializes / completes; receive `session_id`, `cwd`, `hook_event_name`, `model` | VERIFIED — developers.openai.com/codex/hooks |
| **Schema dump** | `codex app-server generate-ts` / `generate-json-schema` gives version-specific full schema | VERIFIED — developers.openai.com/codex/app-server |
| **Langfuse plugin** | `github.com/langfuse/codex-observability-plugin` — traces turns → generations → tool calls → subagents hierarchically; uses Langfuse TS SDK over OpenTelemetry | COMMUNITY — github.com/langfuse/codex-observability-plugin |
| **OTel metrics gap** | `codex exec`: traces ✅, logs ✅, metrics ❌ (as of v0.117.0) | COMMUNITY — codex.danielvaughan.com OTel article |
| **Stable subagent identicons** | Added to Codex app for concurrent subagent visual tracking | COMMUNITY — search results citing changelog |

Note: GPT-5.6 is in limited preview; no new observability features specific to ultra/max have been publicly announced. The observability stack listed above is inherited from the existing Codex architecture.

---

## 5. Streaming Behavior

### Standard and `max` mode
Real-time streaming is confirmed for all primary output types [VERIFIED — developers.openai.com/codex/app-server]:
- **Reasoning**: `item/reasoning/summaryTextDelta` (human-readable, incremental) + `item/reasoning/summaryPartAdded` (section boundaries)
- **Raw reasoning tokens**: `item/reasoning/textDelta` — support is model-dependent
- **Agent reply**: `item/agentMessage/delta`
- **Shell output**: `item/commandExecution/outputDelta` (base64, append in order)
- **Plan text**: `item/plan/delta`
- **Turn completion** (with token totals): `turn/completed`

For `max` mode, the reasoning stream (`summaryTextDelta`) should be richer/longer than standard mode, consistent with extended chain-of-thought. The `reasoningOutputTokens` field in `turn/completed` will be non-zero. [VERIFIED field existence; ASSUMED behavior of max mode]

### Ultra mode streaming
**UNKNOWN**: Whether the stream from ultra-mode subagents (their reasoning steps, command outputs) is multiplexed into the parent's `codex exec --json` stdout, or whether each subagent's activity streams only into its own session file.

The existing `collabToolCall` event (`agentStatus` field) provides status snapshots at coordination boundaries — this IS expected to appear in the parent stream. But continuous per-step streaming from each subagent worker into the parent stream is not documented and is likely NOT the case based on the session-file architecture observed in the Langfuse plugin.

### Responses API
The Responses API (released alongside GPT-5.5 era) supports streaming. For reasoning models, it streams `reasoning` summary content. Whether the Responses API exposes ultra-mode subagent activity separately from the final merged result is **UNKNOWN** — no documentation on this has been released as of June 27, 2026. [COMMUNITY — venturebeat.com GPT-5.6 coverage]

---

## UNKNOWN List (explicit)

1. **Ultra subagent internal visibility in parent stream**: Whether per-subagent reasoning steps (`item/reasoning/summaryTextDelta`), shell commands (`item/commandExecution/outputDelta`), and turn completions (`turn/completed` with usage) from ultra workers appear in the parent `codex exec --json` stream, or only `collabToolCall` boundary events.

2. **Ultra per-subagent token breakdown**: Whether the parent stream receives separate `thread/tokenUsage/updated` events per worker thread, or only an aggregate post-completion total.

3. **Ultra activation parameter**: The exact `codex exec` flag or config key to enable ultra mode (GPT-5.6 is in limited preview; the parameter is not publicly documented).

4. **`codex exec --json` vs app-server parity for collab events**: The SDK documents a feature parity gap; it is unconfirmed whether `collabToolCall` events appear in the exec transport or only via the app-server transport.

5. **Max mode token category**: Whether `max` reasoning effort introduces new billing/token fields vs. existing `reasoningOutputTokens`, or simply produces larger values in the same fields.

6. **Responses API ultra streaming**: Whether the Responses API (vs. Codex CLI) multiplexes per-subagent streams or returns only the final merged result for ultra mode calls.

7. **GPT-5.6 stream format changes**: Whether GPT-5.6 introduces new event types or modifies existing schemas vs. the schema documented above (which is current as of the GPT-5.5 era).

---

## Sources

**Tier 1 (official docs):**
- [Codex CLI reference — --json flag](https://developers.openai.com/codex/cli/reference)
- [Codex noninteractive / scripting](https://developers.openai.com/codex/noninteractive)
- [Codex app-server (full event schema)](https://developers.openai.com/codex/app-server)
- [Codex config reference (otel, agents.*, model_reasoning_effort)](https://developers.openai.com/codex/config-reference)
- [Codex subagents](https://developers.openai.com/codex/subagents)
- [Codex hooks (SubagentStart/Stop)](https://developers.openai.com/codex/hooks)
- [Codex changelog](https://developers.openai.com/codex/changelog)
- [Previewing GPT-5.6 Sol — official announcement](https://openai.com/index/previewing-gpt-5-6-sol/)

**Tier 1 (GitHub):**
- [openai/codex app-server README](https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md)
- [PR #18023 — replay token usage after resume and fork](https://github.com/openai/codex/pull/18023)
- [Issue #17523 — subagent notifications leaking as raw JSON](https://github.com/openai/codex/issues/17523)

**Community / verified secondary:**
- [Codex SDK (Elixir) architecture — transport comparison](https://codex-sdk.hexdocs.pm/02-architecture.html)
- [Codex SDK — subagents event visibility](https://codex-sdk.hexdocs.pm/10-subagents.html)
- [Langfuse codex-observability-plugin](https://github.com/langfuse/codex-observability-plugin)
- [codex-trace (session JSONL viewer)](https://github.com/PixelPaw-Labs/codex-trace)
- [OTel observability article — codex.danielvaughan.com](https://codex.danielvaughan.com/2026/03/28/codex-cli-opentelemetry-observability/)
- [App-server JSON-RPC protocol — codex.danielvaughan.com](https://codex.danielvaughan.com/2026/03/28/codex-app-server-json-rpc-protocol/)
- [GPT-5.6 tiered models coverage — MarkTechPost](https://www.marktechpost.com/2026/06/26/openai-previews-gpt-5-6-with-sol-terra-and-luna-tiered-models-new-reasoning-modes-limited-access/)
- [9to5Mac — GPT-5.6 limited release](https://9to5mac.com/2026/06/26/openai-upgrading-chatgpt-and-codex-with-new-gpt-5-6-models-in-limited-release/)
- [Releasebot — Codex v0.140.0 /usage views](https://releasebot.io/updates/openai/codex)
- [Firecrawl — multi-agent orchestration](https://www.firecrawl.dev/blog/codex-multi-agent-orchestration)
