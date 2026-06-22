# WS-D — Codex: Models, Capabilities, Pricing, and the Multi-Model Question

Research date: 2026-06-22. Tool: OpenAI Codex (agentic coding tool, gpt-5.x-codex family — NOT the deprecated 2021 model).
Context: user migrating their build system off Claude Code onto Codex. Current setup routes coding across {Opus 4.8, Sonnet 4.6, DeepSeek V4 Flash, V4 Pro} by complexity/cost.

---

## 1. Current Codex models (2026)

The Codex model family has churned rapidly. As of June 2026 the **gpt-5.5 series is the current generation**; gpt-5.2 and gpt-5.3-codex were officially sunset from Codex subscription offerings in June 2026.

### Recommended / available models (from developers.openai.com/codex/models)

| Model ID | Role | Default? | Selection |
|----------|------|----------|-----------|
| `gpt-5.5` | Newest frontier model — complex coding, computer use, knowledge work, research | **Yes** (default for ChatGPT-auth sessions) | `codex -m gpt-5.5` or `model = "gpt-5.5"` |
| `gpt-5.4` | Flagship frontier — strong coding, reasoning, tool use, agentic workflows | Fallback if 5.5 unavailable | `codex -m gpt-5.4` |
| `gpt-5.4-mini` | Fast/efficient mini — responsive coding tasks and subagents | No | `codex -m gpt-5.4-mini` |
| `gpt-5.3-codex-spark` | Text-only research preview, near-instant real-time iteration | **ChatGPT Pro only** | `codex -m gpt-5.3-codex-spark` |
| `gpt-5.2-codex` | Legacy codex model for API-key-authenticated workflows | Deprecated path | API key auth |

Notes:
- The branding has shifted away from a dedicated "-codex" suffix on the flagship: the current default `gpt-5.5` is a general frontier model used as the Codex coder, not a `gpt-5.5-codex`. The `-codex`/`-spark` naming now attaches to specialised previews.
- Docs explicitly tell users to migrate off deprecated `gpt-5.2` / `gpt-5.3-codex`.
- "gpt-5-codex" (the original) and "gpt-5.2-codex" still exist as API models but are not the recommended Codex path.

### Context windows / output limits (from platform model pages)

| Model | Context window | Max output | Knowledge cutoff | Vision (image input) |
|-------|----------------|------------|------------------|----------------------|
| `gpt-5.5` | **1,050,000 tokens** | 128,000 tokens | (not stated on page) | **Yes — image input only** |
| `gpt-5.4-mini` | 400,000 tokens | 128,000 tokens | Aug 31 2025 | **Yes — text + images** |
| `gpt-5.4` | (not separately fetched; same family — large context) | ~128k | — | Yes |

WIN: gpt-5.5's ~1.05M context window dwarfs Claude's 200k (1M Sonnet beta) and DeepSeek's ~128k. Huge headroom for whole-repo context.

### Model selection mechanisms
- CLI flag: `-m` / `--model` (e.g. `codex -m gpt-5.5`).
- Config: `model = "gpt-5.5"` in `config.toml` (`~/.codex/config.toml`).
- Interactive `/model` command in the TUI.
- Per-subagent override (see §5).

---

## 2. Reasoning effort

- `gpt-5.5` `reasoning.effort` parameter supports: **none, low, medium (default), high, xhigh**.
  - Note: the levels are none/low/medium/high/xhigh — there is no "minimal" on 5.5 (older 5.x had minimal; 5.5 replaced the low end with `none` + `low` and added `xhigh` at the top).
- `gpt-5.3-codex` (now deprecated) supported "four reasoning effort levels" and was 25% faster than 5.2-codex.
- Config key for Codex sessions/subagents: `model_reasoning_effort = "high"` (etc.).
- Cost: higher effort = more reasoning (thinking) tokens billed at the output rate, so `xhigh` materially increases cost and latency. `none`/`low` cut cost for trivial edits. Default `medium`.

WIN vs current setup: a single effort dial (none→xhigh) on one model partly substitutes for the user's complexity-based model routing — dial effort down for cheap tasks instead of switching to a cheaper model.

---

## 3. Vision / images — CONFIRMED SUPPORTED

This was a hard capability gate in the user's current system (DeepSeek skips image steps). Codex clears it.

**CLI:**
- `--image` / `-i` flag attaches one or more image files to the prompt: `--image img1.png,img2.jpg` or repeat the flag.
- Supported formats: PNG, JPEG, GIF, WebP (PNG recommended for screenshots/UI).
- Codex reads screenshots / design specs alongside the prompt.

**Desktop app (macOS):**
- "Appshots" — press both Command keys to send the frontmost app window (screenshot + available text) to Codex automatically.

**Cloud (Codex web):**
- For front-end tasks, gpt-5-codex/current models can **display screenshots of the UI in Codex web** (image *output* for review) so you iterate on design without checking out the branch. So both image input AND rendered-screenshot output exist in cloud.

**Model-level:** gpt-5.5 = "Image — Input only"; gpt-5.4-mini = "Text and images". So vision is native to the models, not a CLI hack.

WIN: This removes the user's "image work is a hard capability gate" problem entirely. Both the flagship and the cheap mini accept images — no need to reserve a separate vision-capable model. Cloud even renders UI screenshots back.

---

## 4. Pricing

### Codex API token pricing (USD per 1M tokens) — from platform pricing + Codex rate card

Codex bills in "credits" where **1 credit ≈ $0.04** (credits track API token prices). USD equivalents:

| Model | Input $/1M | Cached input $/1M | Output $/1M | (Codex credits: in / cached / out per 1M) |
|-------|-----------|-------------------|-------------|--------------------------------------------|
| `gpt-5.5` | **$5.00** | $0.50 | **$30.00** | 125 / 12.5 / 750 |
| `gpt-5.4` | $2.50 | $0.25 | $15.00 | 62.5 / 6.25 / 375 |
| `gpt-5.4-mini` | $0.75 | $0.075 | $4.50 | 18.75 / 1.875 / 113 |
| `gpt-5.3-codex` (deprecated) | $1.75 | $0.175 | $14.00 | — |
| `gpt-5-codex` (legacy) | $1.25 | — | $10.00 | — |

- Prompt caching: cached input is ~90% off list (e.g. 5.5 cached = $0.50 vs $5.00). Real-world repeated-context savings cited at 60–80%.
- "Fast mode" increases rates for supported models.
- Typical Codex task on gpt-5.5 ≈ 5–45 credits ($0.20–$1.80) depending on complexity.

### ChatGPT plan inclusions (subscription path — no per-token billing within limits)

| Plan | Price | Codex usage |
|------|-------|-------------|
| **Plus** | $20/mo | Local + Cloud tasks share a 5-hour rolling window; ~15–80 GPT-5.5 messages per window. Web, CLI, IDE ext, iOS. Can buy extra credits. |
| **Pro** | $100+/mo | 5x or 20x Plus limits (~75–400 or 300–1600 msgs / 5-hr window). Access to gpt-5.3-codex-spark preview. |
| **Business** | PAYG/seat | Plus base limits + larger cloud VMs, SAML SSO, MFA. Usage-based seat option. |
| **Enterprise/Edu** | Custom | No fixed rate limits — usage scales with credits. Priority processing, SCIM, EKM, audit logs, data residency. |

### Rough comparison to user's current models

| Model | Input $/1M | Output $/1M |
|-------|-----------|-------------|
| Claude Opus (4.x) | ~$15 | ~$75 |
| Claude Sonnet (4.x) | ~$3 | ~$15 |
| Claude Haiku | ~$1 | ~$5 |
| DeepSeek V4 (Flash/Pro) | ~$0.27–0.55 in | ~$1.10–2.20 out (rough; DeepSeek is the cheap tier) |
| **gpt-5.5** | $5 | $30 |
| **gpt-5.4** | $2.50 | $15 |
| **gpt-5.4-mini** | $0.75 | $4.50 |

Findings:
- WIN: `gpt-5.5` ($5/$30) is roughly **1/3 the price of Claude Opus** ($15/$75) for a comparable-or-better frontier coder. If the user used Opus 4.8 as their top tier, gpt-5.5 is a large cost cut at the top.
- gpt-5.4 ≈ Claude Sonnet pricing ($2.50/$15 vs $3/$15) — near-parity mid tier.
- GAP: `gpt-5.4-mini` ($0.75/$4.50) is the cheapest Codex tier but is **still ~2–4x more expensive than DeepSeek V4**. DeepSeek remains the absolute cost floor. Anyone running heavy bulk/cheap coding on DeepSeek for cost will pay more on Codex's cheapest model.
- For subscription users, the $20 Plus / $100 Pro flat plans can be dramatically cheaper than per-token if you live inside the rate windows — no per-task billing.

---

## 5. Multi-model routing — evidence-based view

### (a) Can Codex itself route across multiple models automatically?
**No automatic complexity-based routing.** Docs are explicit: "Codex only spawns a new agent when you explicitly ask it to." There is no built-in router that picks Opus-vs-Haiku-equivalent per task. Routing is manual/explicit via subagents.

### (b) Subagents with per-task model + effort (the manual routing path)
Codex DOES support per-task model assignment via **subagents**:
- Defined as TOML files in `~/.codex/agents/` (personal) or `.codex/agents/` (project).
- Required fields: `name`, `description`, `developer_instructions`.
- Optional per-agent overrides: `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, `skills.config` (inherit from parent if omitted).
- Example: a "cheap-edits" subagent with `model = "gpt-5.4-mini"`, `model_reasoning_effort = "low"`; a "hard-architecture" subagent with `model = "gpt-5.5"`, `model_reasoning_effort = "xhigh"`.
- `agents.max_depth` defaults to 1 (a child can spawn but no deeper nesting); raising it enables fan-out.
- So the user CAN reconstruct complexity-based routing — but it's manual (you tell Codex which subagent to use, or instruct it in AGENTS.md), not automatic.

### (c) Non-OpenAI models via model_providers (DeepSeek, Claude)
Codex supports custom providers: `[model_providers.<id>]` with `name`, `base_url`, `env_key`, `wire_api`.
- **CRITICAL GAP — wire_api:** Codex deprecated `wire_api = "chat"` in favour of OpenAI's Responses API; current docs only document `wire_api = "responses"`. Setting `"chat"` makes Codex **refuse to start**.
- **DeepSeek only speaks Chat Completions**, so direct DeepSeek integration into Codex is **no longer reliable**. Workarounds: (1) a local gateway that bridges Responses→Chat, or (2) OpenRouter BYOK as a proxy (Codex→OpenRouter→DeepSeek, key bound in OpenRouter dashboard).
- Claude / other providers: similarly need to speak the Responses API or go through a proxy. (Anthropic exposes its own API, not OpenAI Responses — would require a translation proxy too.)
- Built-in provider IDs `openai`, `ollama`, `lmstudio` are reserved and can't be overridden.
- Whether a *subagent* can target a custom non-OpenAI provider is not clearly documented (subagent examples are all OpenAI models). Assume parent-session provider unless proven otherwise.

GAP: The user's current DeepSeek-as-cheap-coder strategy does NOT port cleanly to Codex. DeepSeek-via-Codex requires a gateway/OpenRouter proxy and fights the Responses-only wire API. This is the single biggest friction point in the migration.

### (d) Does a single strong Codex model remove the NEED for multi-model routing?
**Plausibly yes, for most of the user's routing goals — with caveats.**
- The user routes for two reasons: (1) capability (hard tasks → Opus/Sonnet), (2) cost (cheap tasks → DeepSeek).
- Capability axis: gpt-5.5 is a frontier coder with a 1M+ context and an effort dial (none→xhigh). One model + effort dial covers most of the "use a stronger model for hard tasks" need without switching models. This collapses the capability-routing dimension.
- Cost axis: the effort dial + gpt-5.4-mini handle "cheap tasks cheaply" reasonably — but mini is still ~2–4x DeepSeek. If absolute cost-floor matters (bulk/AFK builds), losing DeepSeek hurts.
- Net: a Codex-first world can largely replace *capability* routing with one model + reasoning effort, and replace *cost* routing with gpt-5.4-mini (good enough, not as cheap as DeepSeek). True multi-model routing is reduced from a necessity to an optional optimisation. The strongest argument for keeping multi-model is the DeepSeek cost floor — and that's exactly the integration that's now awkward inside Codex.

Recommendation framing: migrate routing logic to **one provider (OpenAI) + effort dial + a mini subagent**, drop cross-provider routing unless the DeepSeek cost delta is proven to matter at the user's volume. If DeepSeek must stay, budget for an OpenRouter/gateway proxy.

---

## 6. Memory / persistent context across sessions

Codex has THREE persistence layers (a real upgrade over AGENTS.md-only):

1. **AGENTS.md** — durable, manual, version-controlled project guidance (build/test commands, conventions, review expectations). Travels with the repo. Equivalent to CLAUDE.md. Applied before the agent starts. You edit it explicitly.

2. **Memories** (preview, shipped ~April 2026) — persistent context that carries across threads/sessions. After enabling, Codex remembers stable preferences, recurring workflows, tech stacks, project conventions, known pitfalls — so you don't re-explain context each thread. Stored as **unencrypted markdown files** you can read/edit/search. This is genuinely cross-session memory beyond AGENTS.md.

3. **Chronicle** (experimental, opt-in, announced Apr 20 2026, macOS app) — **screen-aware** memory. Runs sandboxed background agents that periodically capture screen frames + OCR text + timing + local file paths, and summarise recent activity into memories. Stored locally under `$CODEX_HOME/memories_extensions/chronicle/` (~/.codex/...). Screen captures >6h auto-deleted. Pause/Resume via menu-bar icon (pause for sensitive content/meetings). Generated memories are normal Codex memories (markdown).

WIN: Codex has real cross-session memory (Memories) — the user's current setup leans on status.md / handoff docs for this manually. Codex's Memories could absorb part of that handoff burden.
PRIVACY FLAG: Chronicle reads your screen continuously — flagged in press (Help Net Security) for privacy concerns. Opt-in only; the user should treat it as off by default. Memories being unencrypted plaintext is also a consideration for any secrets hygiene.

---

## Summary of GAP / WIN tags

- WIN: gpt-5.5 ≈ 1/3 the price of Claude Opus for a frontier coder; 1.05M context window.
- WIN: Native vision on flagship AND cheap mini — removes the "image work" capability gate entirely; cloud even renders UI screenshots back.
- WIN: Reasoning-effort dial (none→xhigh) substitutes for much capability-based model switching.
- WIN: Real cross-session Memories + Chronicle (beyond AGENTS.md) — can offload handoff burden.
- GAP: No automatic complexity-based model routing — only explicit subagents.
- GAP: DeepSeek (and Claude) integration is awkward — Codex is Responses-API-only, DeepSeek is Chat-Completions-only; needs a gateway or OpenRouter proxy. The user's DeepSeek cost-floor strategy doesn't port cleanly.
- GAP: Cheapest Codex tier (gpt-5.4-mini, $0.75/$4.50) is still ~2–4x DeepSeek V4 — loss of the absolute cost floor.
- FLAG: Model churn is extreme (5.2→5.3→5.4→5.5 within months; frequent deprecations) — pin model IDs and expect to chase deprecations.
- FLAG (privacy): Chronicle screen-watching + unencrypted markdown memories.

## Sources
- developers.openai.com/codex/models
- developers.openai.com/codex/pricing ; developers.openai.com/api/docs/pricing
- developers.openai.com/api/docs/models/gpt-5.5 ; .../gpt-5.4-mini
- developers.openai.com/codex/cli (and /cli/features, /cli/reference)
- developers.openai.com/codex/config-advanced ; /config-reference
- developers.openai.com/codex/subagents ; /concepts/customization
- developers.openai.com/codex/memories ; /codex/memories/chronicle
- help.openai.com/en/articles/20001106-codex-rate-card
- openai.com/index/introducing-gpt-5-5/ ; .../introducing-gpt-5-3-codex/ ; .../introducing-upgrades-to-codex/
- github.com/openai/codex discussions/issues on image input (#2085, #1619, #2573)
- Secondary (corroboration only): pricepertoken.com, verdent.ai, morphllm.com, knightli.com, helpnetsecurity.com
