# WS-C: Codex CLI / API Invocation Surface — GPT-5.6 Models and Modes

**Phase:** 2 — Retrieval  
**Date:** 2026-06-27  
**Researcher:** apex-research Phase-2 agent  
**Topic slot:** WS-C  
**Claim tags:** [VERIFIED] = cited from Tier-1 official docs | [COMMUNITY] = press/GitHub issues/third-party | [ASSUMED] = inference from pattern, explicitly labelled

---

## 1. Model Selection in `codex exec`

### Confirmed flags

**`-m` / `--model` flag** [VERIFIED — developers.openai.com/codex/cli/reference]  
Overrides the configured model for a single run:

```bash
codex exec -m gpt-5.5 "implement the feature"
codex exec --model gpt-5.5 "implement the feature"
```

**`-c` / `--config` inline override** [VERIFIED — developers.openai.com/codex/cli/reference]  
Accepts `key=value` pairs and is repeatable:

```bash
codex exec -c model="gpt-5.5" -c model_reasoning_effort="xhigh" "task"
```

**`config.toml` (`~/.codex/config.toml`)** [VERIFIED — developers.openai.com/codex/config-reference]  
Persistent model setting:

```toml
model = "gpt-5.5"
model_reasoning_effort = "xhigh"
```

**Profile files** [VERIFIED — developers.openai.com/codex/config-advanced]  
Named overlays stored as `$CODEX_HOME/<name>.config.toml`, invoked via `--profile`:

```bash
codex exec --profile deep-review "task"
```

These carry through to `exec` runs (confirmed in the advanced config docs).

### `/model` command

`/model` is an interactive TUI slash command only [VERIFIED — developers.openai.com/codex/cli/features].  
It is not available in `codex exec` non-interactive mode. The docs explicitly state that for `codex exec`, the model must be specified upfront with the `--model` flag or via config.

### GPT-5.6 model string identifiers

No official model string identifiers for GPT-5.6 Sol/Terra/Luna are published in any Tier-1 source as of 2026-06-27. The official Codex models page (developers.openai.com/codex/models) [VERIFIED] lists only: `gpt-5.5`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.3-codex-spark` (deprecated: `gpt-5.2`, `gpt-5.3-codex`).

The GPT-5.5 model API page [VERIFIED — developers.openai.com/api/docs/models/gpt-5.5] uses the pattern `gpt-5.5` (alias) and `gpt-5.5-2026-04-23` (dated snapshot). Following this pattern, the GPT-5.6 strings would likely be `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` (and dated snapshots), but this is [ASSUMED] — no Tier-1 doc confirms these strings. The preview access is gated and the API documentation page for gpt-5.6 returned 404 at time of research.

---

## 2. Reasoning Effort in `codex exec`

### Confirmed config key and accepted values

**Config key:** `model_reasoning_effort` [VERIFIED — developers.openai.com/codex/config-reference]

**Accepted values (current, from config-reference):**
```
minimal | low | medium | high | xhigh
```

The config-reference states: "Adjust reasoning effort for supported models (Responses API only; xhigh is model-dependent)."

**Semantics** [VERIFIED — developers.openai.com/codex/config-reference + community docs]:
- `low` — minimal deliberation, fastest
- `medium` — default for most tasks
- `high` — complex agentic tasks, latency matters less
- `xhigh` — "Extra High", for hardest async agentic tasks / evals, non-latency-sensitive; added November 18, 2025

**In `codex exec` inline:**
```bash
codex exec -c model_reasoning_effort="xhigh" "task"
```
[VERIFIED — GitHub issue openai/codex#28113 demonstrates this exact syntax; user confirms it is the documented approach]

**In config.toml or profile:**
```toml
model_reasoning_effort = "xhigh"
```
[VERIFIED — developers.openai.com/codex/config-advanced; profile example uses this key]

### Known bug with `codex exec` (version 0.139.0)

GitHub issue openai/codex#28113 [COMMUNITY] reports that new Codex sessions ignore `model_reasoning_effort` from config.toml on startup — sessions default to `low` even when `xhigh` is configured. Workaround: open `/model` interactively and set effort after startup. The `-c model_reasoning_effort='"xhigh"'` inline override was also reported as unreliable in that issue (version 0.139.0). Status of fix in 0.141.x / 0.142.x is **unknown** — changelog does not confirm a fix.

### Will `max` be accepted?

**Not yet documented.** GPT-5.6 Sol introduces new `max` and `ultra` reasoning modes [COMMUNITY — confirmed by multiple press sources: 9to5Mac, MarkTechPost, MacRumors]. However:
- The official config-reference enumeration (`minimal | low | medium | high | xhigh`) does not include `max` or `ultra` [VERIFIED].
- Whether `max` becomes a new `model_reasoning_effort` value, a separate API parameter, or an app-only UI toggle is **not publicly documented**.
- The Codex official changelog (developers.openai.com/codex/changelog) has no entry for GPT-5.6 or new effort values as of 2026-06-27 [VERIFIED].

---

## 3. Ultra Mode via CLI/API

### What is known

GPT-5.6 Sol introduces an "ultra" mode [COMMUNITY — multiple press sources]:
- "Ultra mode coordinates several workers on one task" (MarkTechPost)
- "Instead of one model working alone, ultra leverages subagents" (MarkTechPost)
- "Ultra mode goes beyond the capabilities of a single agent by leveraging subagents to accelerate complex work" (9to5Mac summary)
- Ultra mode "posts the top coding score in OpenAI's charts" (MarkTechPost)
- Both `max` and `ultra` "trade latency and cost for accuracy on long-horizon problems"

### Whether it is CLI-accessible

**Not yet documented** for `codex exec` or the Responses API. Specifically:
- No `--ultra` flag exists in the CLI reference [VERIFIED].
- `model_reasoning_effort` does not list `ultra` as a value [VERIFIED].
- No Responses API parameter for `ultra` is published in any Tier-1 source.
- The Codex developer changelog has no entry confirming CLI-level ultra support.
- It is possible `ultra` is currently app-level only (interactive Codex app), or is an API-only parameter not yet surfaced to the CLI, or is gated entirely within partner preview access.

**Assessment:** Ultra mode CLI/API invocation surface is **not yet documented**. Given that GPT-5.6 itself is in limited preview, CLI-level ultra support likely requires the same partner access and may arrive alongside general availability. Tag: [COMMUNITY claim, mechanism UNKNOWN].

---

## 4. Codex CLI Version

### Current local vs. latest

- Local: `0.141.0`
- Latest stable: `0.142.3` (released June 26, 2026) [VERIFIED — github.com/openai/codex/releases]
- Latest alpha: `0.143.0-alpha.26` (June 26, 2026) [VERIFIED — same source]

### What 0.142.x adds (relevant entries)

[VERIFIED — github.com/openai/codex/releases]

- **0.142.2**: MCP tool search by default; macOS auth proxy support; plugin dark-mode logos; safety-buffering UI improvements
- **0.142.1**: Windows system proxy support for auth (PAC, WPAD, static proxies)
- **0.142.3**: Maintenance-only patch, no user-facing changes

**No 0.142.x entry mentions GPT-5.6 support, new reasoning effort values, or new CLI flags for model invocation.** [VERIFIED]

### Version requirement for GPT-5.6

**Unknown.** The changelog has not been updated to reflect GPT-5.6. Because model selection is server-side (a model string the CLI passes to the Responses API), it is [ASSUMED] that any CLI version that can pass the correct model string will work — but this depends on whether the CLI has any client-side model filtering. If `max` and `ultra` require new CLI parsing, a version upgrade would be needed. This is speculative.

### Version 0.138.0 — reasoning effort relevance

Release notes mention "model-defined effort levels now flow through in the order advertised by the model" [COMMUNITY — releasebot.io/updates/openai/codex]. This suggests the CLI does dynamically honor whatever effort levels the model exposes, which is a positive signal for `max`/`ultra` working without a CLI code change.

---

## 5. Access/Rollout for Non-Partners

### Current status (as of 2026-06-27)

GPT-5.6 Sol, Terra, and Luna launched June 26, 2026 in **limited preview** to "a small group of trusted partners" via API and Codex [VERIFIED — multiple Tier-2 sources citing official OpenAI statement].

Key facts:
- The limitation was at the request of the U.S. government [VERIFIED — TechCrunch, VentureBeat citing OpenAI statement]
- OpenAI described it as "a short-term step" [COMMUNITY — press reports]
- OpenAI statement: "We believe in broad access and plan to make GPT-5.6 Sol, Terra, and Luna generally available in the coming weeks." [VERIFIED — OpenAI Threads post cited in search results]
- Access path: API + Codex for preview partners; ChatGPT for same partners initially
- No public waitlist or early-access form is documented [UNKNOWN]

### What "trusted partners" means

Approximately 20 "government-approved" partners [COMMUNITY — 9to5Mac]. No public list. Non-partner `codex exec` users cannot select GPT-5.6 model strings regardless of CLI version — the API will reject or not route them.

### GA timeline

"Coming weeks" per OpenAI (stated June 26, 2026). No specific date. If following GPT-5.5's pattern (limited preview → general availability in days to a week), GA could arrive by mid-July 2026. [ASSUMED based on GPT-5.5 precedent]

---

## 6. Responses API Specifics

### Current parameter mapping

The Codex CLI uses the Responses API exclusively for reasoning models [VERIFIED — config-reference: "Responses API only"].

**Current Responses API parameter** for reasoning effort (as mapped by Codex CLI): `reasoning.effort` [VERIFIED — developers.openai.com/api/docs/models/gpt-5.5: "Reasoning.effort supports: none, low, medium (default), high and xhigh"].

The `model_reasoning_effort` key in config.toml maps to this `reasoning.effort` parameter in the Responses API call.

### GPT-5.6 Responses API extensions

GPT-5.6 is documented (in press) as adding:
- A new `max` reasoning-effort setting [COMMUNITY — MarkTechPost, MacRumors, 9to5Mac all confirm this framing]
- An `ultra` multi-agent mode that uses subagents [COMMUNITY — same sources]
- "More predictable prompt caching" [COMMUNITY — MacRumors]

Whether these map to:
- New `reasoning.effort` enum values: `max` | `ultra`
- A separate `reasoning.mode` parameter
- An entirely separate API endpoint

...is **not published in any Tier-1 source** as of 2026-06-27. The official Responses API docs do not yet reflect GPT-5.6 additions.

---

## UNKNOWN List (explicit)

1. **Exact model string identifiers** for GPT-5.6 Sol, Terra, and Luna in the API/CLI (not yet published).
2. **Whether `max` is a `model_reasoning_effort` value** or a separate Responses API parameter or app-only UI concept.
3. **Whether `ultra` is a `model_reasoning_effort` value**, a separate API parameter, or interactive/app-only — and how subagent orchestration is triggered from `codex exec`.
4. **Minimum CLI version for GPT-5.6** — whether 0.141.0 (current local) works once access is granted, or if an upgrade to 0.142.x+ is required.
5. **Whether the `model_reasoning_effort` config bug** (issue #28113, v0.139.0) is fixed in 0.141.x/0.142.x.
6. **GA date** for GPT-5.6 beyond "coming weeks."
7. **No-partner access path** — whether there will be a waitlist or automatic rollout.

---

## Sources

### Tier-1 (OpenAI official docs)

- [CLI Reference — Codex](https://developers.openai.com/codex/cli/reference) — `-m`, `-c` flags confirmed
- [Non-Interactive / Scripting — Codex](https://developers.openai.com/codex/noninteractive) — `codex exec` flags, stdin, JSON output
- [Models — Codex](https://developers.openai.com/codex/models) — current model list (gpt-5.5, gpt-5.4, gpt-5.4-mini, gpt-5.3-codex-spark)
- [Config Reference — Codex](https://developers.openai.com/codex/config-reference) — `model_reasoning_effort` accepted values: `minimal|low|medium|high|xhigh`
- [Advanced Config — Codex](https://developers.openai.com/codex/config-advanced) — profiles, exec + profile combo
- [Changelog — Codex](https://developers.openai.com/codex/changelog) — GPT-5.5 most recent model entry (April 23 2026); xhigh added November 2025; no GPT-5.6 entry
- [CLI Features — Codex](https://developers.openai.com/codex/cli/features) — `/model` is interactive TUI only
- [GPT-5.5 Model — OpenAI API](https://developers.openai.com/api/docs/models/gpt-5.5) — `reasoning.effort` values: `none|low|medium|high|xhigh`
- [GitHub releases — openai/codex](https://github.com/openai/codex/releases) — 0.142.3 latest stable; 0.143.0-alpha.26 latest alpha

### Tier-2 / Community

- [GitHub issue #28113 — openai/codex](https://github.com/openai/codex/issues/28113) — `model_reasoning_effort` ignored in exec at v0.139.0; `-c model_reasoning_effort='"xhigh"'` syntax
- [9to5Mac — GPT-5.6 limited release](https://9to5mac.com/2026/06/26/openai-upgrading-chatgpt-and-codex-with-new-gpt-5-6-models-in-limited-release/) — max + ultra confirmed for Sol
- [MarkTechPost — GPT-5.6 preview](https://www.marktechpost.com/2026/06/26/openai-previews-gpt-5-6-with-sol-terra-and-luna-tiered-models-new-reasoning-modes-limited-access/) — ultra subagent mechanism described
- [TechCrunch — limited rollout](https://techcrunch.com/2026/06/26/openai-limits-gpt-5-6-rollout-after-government-request-says-restrictions-shouldnt-be-the-norm/) — government request, partner preview
- [MacRumors — GPT-5.6 Sol](https://www.macrumors.com/2026/06/26/openai-gpt-5-6-sol/) — Sol features summary
- [Codex Updates Releasebot](https://releasebot.io/updates/openai/codex) — 0.138.0 effort flow-through note
- [OpenAI Threads post](https://www.threads.com/@openai/post/DaEHnx7ktu5/) — "generally available in the coming weeks" statement
