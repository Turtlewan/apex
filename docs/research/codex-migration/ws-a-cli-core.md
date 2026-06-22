# WS-A — Codex CLI Core (config, model providers, sandbox/approval, auth/billing)

Research date: 2026-06-22. Scope: OpenAI Codex CLI as a candidate replacement for Claude Code as the user's build-system harness. Focus on whether Codex can replicate the current APEX two-backend split (`ANTHROPIC_BASE_URL` swap between Anthropic for planning and DeepSeek for coding).

---

## 0. HEADLINE — the two-backend / DeepSeek question

**Codex CAN do per-session model/provider switching (profiles + CLI flags), BUT it CANNOT talk to DeepSeek's native API directly anymore, and it cannot talk to an Anthropic endpoint at all.** Two hard walls:

1. **Wire protocol lock-in (the big one).** Since **~Feb 1, 2026**, Codex CLI **only** speaks the OpenAI **Responses API**. `wire_api = "chat"` (Chat Completions) was deprecated Dec 2025 and is now a **hard error**. DeepSeek's official endpoint (`https://api.deepseek.com`) speaks **Chat Completions** (and an Anthropic-format endpoint), NOT the Responses API → a direct Codex `deepseek` provider with `wire_api = "responses"` hits a Responses path DeepSeek doesn't implement and returns **404**. So DeepSeek only works **through a translation gateway** (LiteLLM, VibeAround bridge, or similar) that converts Responses↔Chat Completions. [config-reference; discussion #7782; cc-switch #2553; jan #7413]
   - Note: APEX's CLAUDE.md describes "DeepSeek V4 Flash" via `ANTHROPIC_BASE_URL` — i.e. the user is currently driving DeepSeek through Claude Code's **Anthropic-compatible** wire format. Codex has no Anthropic-wire support at all, so even the gateway would need to expose a **Responses-API** front, not an Anthropic-API front. Different bridge than today's.

2. **No Anthropic backend.** Codex has no concept of an Anthropic-format provider. You cannot point Codex at `api.anthropic.com`. The planning side of APEX (currently Anthropic/Claude) would have to become an OpenAI model (gpt-5.x) or another Responses-API-speaking provider.

**Bottom line:** A "two-backend split" is *structurally* possible in Codex via **profiles** (`codex --profile planning` vs `codex --profile coding`) or per-invocation `-c` overrides — each profile names a different `model` + `model_provider`. But the *specific* Anthropic-planning / DeepSeek-coding split the user runs today does **not** port without (a) replacing Anthropic with an OpenAI/Responses model, and (b) fronting DeepSeek with a Responses-API translation gateway. GAP vs Claude Code, which swaps backends with a single env var and speaks Anthropic wire natively to both.

---

## 1. What Codex is today

- **Codex CLI**: an OpenAI coding agent that runs locally. **Open source, Apache-2.0**, rewritten in **Rust** (the legacy TS CLI was replaced; current distribution is a native binary). Repo: `github.com/openai/codex`. [README]
- **Install**:
  - macOS/Linux: `curl -fsSL https://chatgpt.com/codex/install.sh | sh`
  - Windows: `powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"`
  - npm: `npm install -g @openai/codex`
  - Homebrew: `brew install --cask codex`
  - Manual binaries via GitHub Releases. [README]
- **Invocation**:
  - Interactive TUI: `codex`
  - **Headless / non-interactive (scripting)**: `codex exec "<task>"` — the equivalent of Claude Code headless/`-p`. Used for automation. [config-advanced / cli docs]
  - One-off config overrides: `codex -c model_provider="openrouter" -c model="<id>"`
  - Flags: `codex --model <name> --sandbox <mode> --approval-mode <mode>` override config per run.
- **Codex cloud ("Codex Web")**: hosted agent at `chatgpt.com/codex` — runs tasks in cloud sandboxes, PRs, etc. (cloud counterpart to the CLI). [README]
- **IDE extension**: VS Code, Cursor, Windsurf. Desktop app via `codex app`. [README]

Conceptual parity with Claude Code: CLI + headless `exec` + IDE + cloud — feature-comparable surface area.

---

## 2. Configuration model — `~/.codex/config.toml`

`CODEX_HOME` defaults to `~/.codex`. Main file: **`config.toml`** (TOML, not JSON). [config-reference]

Key top-level keys (exact names):

| Key | Type / values | Notes |
|---|---|---|
| `model` | string e.g. `"gpt-5.5"` | active model |
| `model_provider` | string, default `"openai"` | references a `model_providers.<id>` block |
| `model_context_window` | number | context tokens |
| `model_reasoning_effort` | `"minimal" \| "low" \| "medium" \| "high" \| "xhigh"` | reasoning intensity |
| `approval_policy` | `"untrusted" \| "on-request" \| "never"` (also `on-failure` via flag) or a `{ granular = {...} }` table | see §4 |
| `sandbox_mode` | `"read-only" \| "workspace-write" \| "danger-full-access"` | see §4 |
| `sandbox_workspace_write` | table | `writable_roots`, `network_access`, `exclude_slash_tmp`, `exclude_tmpdir_env_var` |
| `[model_providers.<id>]` | table | see §3 |

**Profiles**: separate files `$CODEX_HOME/<profile-name>.config.toml`, activated with `codex --profile <name>`. This is the primary multi-config mechanism (e.g. a `planning.config.toml` and a `coding.config.toml`). [config-reference, config-advanced]

**Lifecycle hooks**: Codex has a hooks system; `requirements.toml` with `allow_managed_hooks_only = true` can lock down hook sources (managed-only). Rough analogue to Claude Code hooks. [docs/config.md]

**vs Claude Code `settings.json`** (conceptual):
- Format: TOML vs JSON.
- Both are layered (user/project/CLI-flag overrides). Codex profiles ≈ no direct single Claude Code equivalent — Claude Code uses settings layering + `--settings`, not named profile files. Codex profiles are arguably *cleaner* for "two mode" switching (one file per mode).
- Codex folds **model + provider + sandbox + approval** into one config tree; Claude Code splits permissions into `permissions.allow/deny` + permission *modes* and model into `model`/env. See §4 for the permission-granularity gap.

---

## 3. Model providers — `[model_providers.<id>]`

This is the heart of the migration question.

```toml
[model_providers.<id>]
name = "string"                    # display name
base_url = "string"                # API endpoint
env_key = "string"                 # env var holding the API key (sent as Bearer)
wire_api = "responses"             # ONLY supported value (see below)
requires_openai_auth = false       # bool
query_params = { key = "value" }   # extra URL query params (e.g. Azure api-version)
http_headers = { key = "value" }   # static headers
env_http_headers = { key = "ENVVAR" }  # headers sourced from env vars
```
[config-reference]

- **Reserved built-in IDs** that cannot be reused for custom providers: `openai`, `ollama`, `lmstudio`. [config-advanced]
- **API key**: read from the env var named in `env_key`, sent as a **Bearer token**.
- **Built-in OpenAI base_url override** (no custom provider needed): `openai_base_url = "https://us.api.openai.com/v1"` — for proxies / data residency.

### wire_api — CRITICAL
- **Only `"responses"` is supported** (and is the default when omitted). [config-reference, config-advanced]
- Chat Completions (`wire_api = "chat"`): deprecated Dec 2025, **hard error since ~Feb 1 2026**. Maintainer confirmation in discussion #7782 (Jan 15 2026 comment: warning → hard error on Feb 1). [discussion #7782]
- Codex CLI emits: *"Support for the 'chat' wire API is deprecated and will soon be removed. Update your model provider definition in config.toml to use wire_api = 'responses'."* (now hard-fails). [jan #7413]

### Can it point at arbitrary OpenAI-compatible endpoints?
**Yes, IF the endpoint speaks the Responses API.** Examples (exact TOML):

**Azure (Responses-capable):**
```toml
[model_providers.azure]
base_url = "https://YOUR_PROJECT.openai.azure.com/openai"
env_key = "AZURE_OPENAI_API_KEY"
query_params = { api-version = "2025-04-01-preview" }
wire_api = "responses"
```

**Mistral:**
```toml
[model_providers.mistral]
name = "Mistral"
base_url = "https://api.mistral.ai/v1"
env_key = "MISTRAL_API_KEY"
```

**Generic proxy (e.g. LiteLLM in front of anything):**
```toml
model = "gpt-5.4"
model_provider = "proxy"
[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "http://proxy.example.com"
env_key = "OPENAI_API_KEY"
```

**Ollama (built-in id, local):**
```toml
[model_providers.local_ollama]
name = "Ollama"
base_url = "http://localhost:11434/v1"
```
(Local LM Studio / llama.cpp now support the Responses API; legacy/Chat-only local setups need a bridge.) [knightli, unsloth]

### DeepSeek specifically
Naive config that **does NOT work direct** (404, because DeepSeek = Chat Completions, not Responses):
```toml
model = "deepseek-chat"
model_provider = "deepseek"
[model_providers.deepseek]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
env_key = "DEEPSEEK_API_KEY"
# wire_api defaults to "responses" -> DeepSeek rejects -> 404
```
**Working path = translation gateway.** Point `base_url` at a local/remote gateway that exposes a Responses-API front and translates to DeepSeek's Chat Completions:
- **LiteLLM proxy** (mixed reports on tool-calling fidelity across versions 1.75.x–1.80.x). [discussion #7782]
- **VibeAround API bridge** — maps Responses→Chat Completions, preserves tool calls + reasoning metadata. [discussion #7782]
- Community guides: `codex-deepseek-guide` (Tinzlu), antenore gist, knightli OpenRouter-BYOK route. [search results]
- **GAP:** This is added moving infrastructure (a running gateway process) that APEX does not need today — Claude Code reaches DeepSeek with just an env-var URL swap because DeepSeek also exposes an Anthropic-compatible wire that Claude Code speaks natively.

### Replicating the two-backend split — concrete shape
```toml
# ~/.codex/planning.config.toml
model = "gpt-5.5"
model_provider = "openai"        # or a Responses-API gateway; NOT Anthropic
model_reasoning_effort = "high"

# ~/.codex/coding.config.toml
model = "deepseek-chat"
model_provider = "deepseek_gw"   # gateway translating to DeepSeek
[model_providers.deepseek_gw]
base_url = "http://localhost:4000"   # LiteLLM/bridge exposing Responses
env_key = "DEEPSEEK_API_KEY"
```
Invoke: `codex --profile planning` / `codex --profile coding`, or per-call `codex -c model_provider=... -c model=...`.
- **Works** for switching model/provider per session — the structural equivalent of the env swap.
- **Doesn't preserve** today's exact backends: planning can't be Anthropic; coding needs a Responses gateway in front of DeepSeek.
- APEX's auto-detection (a SessionStart hook reading `ANTHROPIC_BASE_URL`) would need rewriting — Codex doesn't key off `ANTHROPIC_BASE_URL`; mode would be selected by profile/flag instead, and Codex's own hook system (`requirements.toml` + lifecycle hooks) would carry any banner/guard logic. GAP: the PreToolUse write-guard that gates planning-mode edits is a Claude Code hook contract; Codex hooks differ and would need re-implementation.

---

## 4. Sandbox & approval model

**Sandbox modes** (`sandbox_mode`):
- `read-only` — no writes, no network.
- `workspace-write` — write within workspace (+ configured roots); network off by default.
- `danger-full-access` — no sandbox.

`sandbox_workspace_write` sub-options: `writable_roots = ["..."]`, `network_access = true`, `exclude_slash_tmp = true`, `exclude_tmpdir_env_var = true`. [config-reference]

**Approval policy** (`approval_policy`):
- `untrusted` — approve everything.
- `on-failure` — only approve when a sandboxed action fails (escalation).
- `on-request` — model decides routine vs unusual; asks on unusual.
- `never` — no prompts.
- **Granular table** (newer): `approval_policy = { granular = { sandbox_approval = true, rules = true, mcp_elicitations = true, request_permissions = true, skill_approval = true } }`. [config-reference]

**Convenience flags**:
- `--full-auto` — hands-off (typically `workspace-write` + auto-approve within sandbox).
- `--dangerously-bypass-approvals-and-sandbox` — disables both approval and sandbox (CI/trusted only).
- Per-run: `codex --sandbox <mode> --approval-mode <mode>`. [cli docs]

**vs Claude Code permissions — GAP analysis:**
- Claude Code has **rule-list granularity**: `permissions.allow` / `permissions.deny` with per-tool, per-command, and pattern matchers (e.g. `Bash(npm run *)`, `Edit(src/**)`, deny specific paths). Plus permission **modes**: `default` / `acceptEdits` / `plan` / `dontAsk` / `bypassPermissions`.
- Codex is **coarser by default**: sandbox mode (3 levels) × approval policy (4 levels) + a few granular booleans. There is **no per-command allow/deny pattern list** equivalent to `Bash(...)` matchers in the core config; control is the sandbox boundary + approval prompts, not a curated command allowlist.
- **GAP:** APEX's reliance on Claude Code `permissions.allow/deny` pattern lists and the `dontAsk`/`bypassPermissions` mode distinctions (e.g. the classifier gating `.claude/` writes, allow-listed read-only Bash) does **not** map 1:1. Codex's `writable_roots` can carve out path-level write scope (closest analogue to path allow/deny), and the granular approval booleans cover MCP/skills/permission requests, but fine-grained *command-string* allowlisting is weaker. Migrating APEX's surgical write-guard / protected-path behaviour would mean leaning on `read-only` + `writable_roots` + hooks rather than `deny` rules.
- **Parity wins**: `workspace-write` network-off-by-default and OS-level sandboxing (Codex sandboxes via OS primitives) is arguably *stronger* isolation than Claude Code's permission prompts, which aren't an OS sandbox.

---

## 5. Auth & billing

**Two auth methods** [README, help center]:
1. **Sign in with ChatGPT** (recommended) — Plus, Pro, Business, Edu, Enterprise. Uses included plan usage, no per-token bill.
2. **API key** — billed via OpenAI Platform at standard API token rates; does NOT consume ChatGPT plan credits; no window limits, no cloud features; cost scales linearly.

**Rate limits (as of mid-June 2026)** [LaoZhang, morphllm, help center rate card]:
- **Plus ($20/mo)**: GPT-5.5 ~15–80 local messages / 5 hrs; GPT-5.4 ~20–100; GPT-5.4-mini ~60–350.
- **Pro ($100/mo, 5x)**: 5× Plus → GPT-5.5 ~75–400 / 5 hrs. Pick rate-limit multiplier at checkout.
- **Pro 20x ($200/mo)**: 20× Plus → ~300–1,600 GPT-5.5 / 5 hrs.
- Window is rolling **5-hour**; also Free/Go/Business/Enterprise tiers.
- Live usage check during a session: **`/status`**.
- As of **April 2, 2026**, pricing moved to **API-style token rates** (input / cached-input / output tokens) — you still buy credits but burn is token-based.

**Budget-capping headless runs:**
- **API-key mode** is the one to budget-cap: standard OpenAI Platform billing → use Platform **usage limits / hard caps / budgets** on the project/org key. This is the controllable path for unattended `codex exec` automation (no 5-hour message windows; pure token cost). [pricing, help center]
- ChatGPT-plan auth caps by message-rate windows, not a dollar budget — less suitable for predictable headless cost control.
- Cost-reduction levers OpenAI recommends: smaller models (GPT-5.4-mini) for routine work, smaller `AGENTS.md`, fewer MCP servers, tight prompts. [pricing]
- **Note vs APEX today**: APEX's MEMORY notes a "capped credit pool" for headless/programmatic Claude runs. Codex's analogue is API-key + Platform budget caps — *more* explicit dollar-budget control than ChatGPT-plan windows, so headless budgeting is arguably a parity/win **if** using API-key auth.

---

## Summary GAP list (Codex missing vs Claude Code, for APEX migration)

1. **GAP (critical):** No Anthropic-wire support; planning backend can't stay Claude. Only Responses-API providers.
2. **GAP (critical):** DeepSeek not reachable directly (Responses-only) — needs a translation gateway (LiteLLM/VibeAround) as standing infra. Today's `ANTHROPIC_BASE_URL` swap is a single env var with no extra process.
3. **GAP:** Mode detection — APEX keys off `ANTHROPIC_BASE_URL`; Codex uses profiles/flags. SessionStart routing logic must be re-authored.
4. **GAP:** Permission granularity — no `Bash(...)` / path `allow`/`deny` pattern lists or `acceptEdits`/`plan`/`dontAsk`/`bypassPermissions` modes; coarser sandbox×approval matrix + `writable_roots`. APEX write-guard / protected-path rules need re-expression.
5. **GAP:** Hook contract differs — Claude Code PreToolUse/SessionStart hooks ≠ Codex `requirements.toml` + lifecycle hooks; the write-guard and banner hooks need porting.
6. **Parity / win:** Open-source Rust binary, headless `codex exec`, profiles for clean per-mode config, OS-level sandbox (stronger isolation), explicit API-key dollar budgets for headless runs.

---

## Sources
- github.com/openai/codex — README, docs/config.md (Apache-2.0, Rust, install/invoke, hooks)
- developers.openai.com/codex/config-reference — full config.toml key reference
- developers.openai.com/codex/config-advanced — custom model providers, profiles, Azure/Mistral/Ollama examples
- developers.openai.com/codex/cli — exec/headless, --full-auto, --dangerously-bypass-approvals-and-sandbox, approval modes
- github.com/openai/codex/discussions/7782 — chat/completions deprecation (Dec 2025 → hard error ~Feb 1 2026), gateway recommendations
- github.com/farion1231/cc-switch/issues/2553; janhq/jan/issues/7413 — DeepSeek 404 / Responses-API requirement, deprecation message
- developers.openai.com/codex/pricing; chatgpt.com/codex/pricing; help.openai.com (Codex rate card, "Using Codex with your ChatGPT plan") — rate limits, API-key billing, April 2 2026 token-rate shift
- morphllm.com/codex-provider-configuration; morphllm.com/codex-pricing; ofox.ai; codex.danielvaughan.com; knightli.com; unsloth.ai/docs/basics/codex — community config + DeepSeek bridge guides
