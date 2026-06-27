# Retrieval-Tier Model Comparison: Claude Cheap Tiers vs Cheap OpenAI Models

**Research phase:** Phase-2 retrieval (facts + citations; no recommendation)
**Date:** 2026-06-28
**Consumer:** apex-research fan-out pipeline — dispatched parallel retrieval workers (fetch → extract → cite)

---

## Summary

gpt-5.4-mini and gpt-5.4-nano both support hosted `web_search` via the OpenAI Responses API. So does gpt-4.1-mini; gpt-4.1-nano is unconfirmed. All four are meaningfully cheaper on tokens than Haiku 4.5 or Sonnet 4.6. However, Claude has a structural advantage for page-fetch-heavy pipelines: `WebFetch` is **free** (tokens only), while every OpenAI `web_search` call costs $0.01 + an 8 k fixed token block. Codex exec can search non-interactively but returns snippets only — it cannot do full-page fetch. On mechanical retrieval quality, Haiku 4.5 slightly edges GPT-4.1 mini on BFCL v3 tool use (84.3% vs 81.7%); GPT-4.1 mini leads on large-context needle retrieval. No controlled benchmark for the specific web-fetch-extract-cite task exists.

---

## Key Findings

### 1. Cheap OpenAI Model Lineup for Retrieval / Subagent Work

| Model | Input $/MTok | Output $/MTok | Cached $/MTok | Context | OpenAI stated best-use |
|-------|-------------|--------------|--------------|---------|------------------------|
| gpt-5.4-mini | $0.75 | $4.50 | $0.075 | 400k | "coding, computer use, and subagents" |
| gpt-5.4-nano | $0.20 | $1.25 | $0.020 | 400k | "classification, data extraction, ranking, sub-agents" |
| gpt-4.1-mini | $0.40 | $1.60 | ~$0.10 | 1M | instruction following, tool calling |
| gpt-4.1-nano | $0.10 | $0.40 | $0.025 | 1M | "fastest, most cost-efficient GPT-4.1" |

Sources: developers.openai.com/api/docs/pricing, developers.openai.com/api/docs/models/gpt-5.4-mini, developers.openai.com/api/docs/models/gpt-5.4-nano, developers.openai.com/api/docs/models/gpt-4.1-nano

Tags: [VERIFIED] for gpt-5.4-mini, gpt-5.4-nano, gpt-4.1-nano pricing (direct page fetches). [VERIFIED] for gpt-4.1-mini pricing (multiple corroborating sources).

Batch API gives a flat 50% discount across all OpenAI models. [VERIFIED — developers.openai.com/api/docs/pricing]

**gpt-5.4-mini** is explicitly positioned for subagent work by OpenAI and listed alongside coding and computer use. [VERIFIED]
**gpt-5.4-nano** is explicitly for "classification, data extraction, ranking, and sub-agents" — the closest to a retrieval-worker role. [VERIFIED]

---

### 2. Web-Retrieval Capability of Cheap OpenAI Models

#### (a) Hosted web_search tool support in the OpenAI Responses API

| Model | web_search via Responses API? | Source |
|-------|------------------------------|--------|
| gpt-5.4-mini | YES | developers.openai.com/api/docs/models/gpt-5.4-mini [VERIFIED] |
| gpt-5.4-nano | YES | developers.openai.com/api/docs/models/gpt-5.4-nano [VERIFIED] |
| gpt-4.1-mini | YES (documented in web search guide) | developers.openai.com/api/docs/guides/tools-web-search [VERIFIED] |
| gpt-4.1-nano | UNCONFIRMED | model page lists function calling + structured output but does not enumerate web_search [ASSUMED gap] |

Usage: add `{ "type": "web_search" }` to the tools array in a Responses API call; model decides whether to search (`tool_choice: "auto"`) or can be forced (`tool_choice: "required"`). [VERIFIED — developers.openai.com/api/docs/guides/tools-web-search]

The gpt-4.1 models supported an older `gpt-4o-mini-search-preview` path (Chat Completions) that is being deprecated July 2026. The Responses API path (`web_search` tool) is the current recommended integration. [VERIFIED]

#### (b) codex exec (CLI) web fetch/search in non-interactive mode

**Yes, codex exec can perform web searches non-interactively**, but with important limitations:

- Default mode: `cached` — results come from an OpenAI-maintained pre-indexed snapshot, NOT live pages. [VERIFIED — developers.openai.com/codex/noninteractive + developers.openai.com/codex/cli/features]
- Live mode: set `web_search = "live"` in `~/.codex/config.toml` or pass `--search` per run — returns live snippets from the web. [VERIFIED]
- **Critical limitation:** Even in live mode, the built-in search returns **snippets only**. It does NOT support full-page scraping, multi-page crawling, or structured data extraction. [VERIFIED — community sources corroborated by Firecrawl glossary]
- Transcript visibility: `codex exec --json` includes `web_search` items in the output, allowing audit of which domains were accessed. [VERIFIED]
- Model used: configured per `~/.codex/config.toml`; no model-specific restriction documented for the search feature.

**Verdict for retrieval pipelines:** codex exec web search is unsuitable for the fetch-page-content pattern. It can return snippet-level search results (useful for URL discovery) but cannot fetch and return full page body content.

#### (c) Per-call cost for the web_search tool (OpenAI)

- **$10 per 1,000 calls = $0.01 per search call** (standard, non-preview path). [VERIFIED — developers.openai.com/api/docs/pricing, community.openai.com corroboration]
- For non-reasoning mini/nano models using the non-preview tool: search content tokens are billed as a **fixed block of 8,000 input tokens per call** at the model's standard input rate, in addition to the $0.01 tool call fee. [VERIFIED — developers.openai.com/api/docs/pricing + community.openai.com/t/heads-up-web-search-tool-billing]
- Effective additional token cost per search on gpt-5.4-nano: 8,000 × $0.20/MTok = $0.0016/call
- Effective additional token cost per search on gpt-5.4-mini: 8,000 × $0.75/MTok = $0.006/call
- Batch API discount does NOT apply to the $0.01 tool call fee (applies to token costs only). [ASSUMED based on pricing page structure]

---

### 3. Claude Cheap Tier Pricing + Web Tools

Official pricing from platform.claude.com/docs/en/about-claude/pricing (fetched 2026-06-28): [VERIFIED]

| Model | Input $/MTok | Output $/MTok | Cache read $/MTok | Batch input $/MTok | Batch output $/MTok | Context |
|-------|-------------|--------------|------------------|-------------------|--------------------|----|
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 | $0.50 | $2.50 | 200k |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 | $1.50 | $7.50 | 1M |

**Web tool availability for Claude subagents:**

- **WebSearch:** $10 per 1,000 searches ($0.01/search) + standard input token costs for search-generated content. Available to Haiku 4.5 and Sonnet 4.6 natively as Claude Code subagents. [VERIFIED — platform.claude.com pricing page]
- **WebFetch:** **No per-call fee. Token costs only.** Average page (~10 kB) ≈ 2,500 tokens; large doc page (~100 kB) ≈ 25,000 tokens. Available natively to Claude Code subagents. [VERIFIED — platform.claude.com pricing page]

**Key structural difference:** Claude exposes WebFetch as a separate tool with no per-call cost. OpenAI's web_search tool bundles search + retrieval into one $0.01 call. For pipelines that fetch pre-known URLs rather than searching, Claude WebFetch is strictly cheaper on a per-fetch basis (you pay only input tokens from the page content + output tokens from the extraction, same as OpenAI but without the $0.01 overhead).

---

### 4. Quality Signal for Mechanical Retrieval

"Mechanical retrieval" here = simple fetch-URL → extract-fact → cite, not deep reasoning.

#### Available benchmark data

**BFCL v3 (function/tool calling accuracy):**
- Claude Haiku 4.5: **84.3%**
- GPT-4.1 mini: **81.7%**
- Difference: +2.6 pp for Haiku [COMMUNITY — benchlm.ai/compare/claude-haiku-4-5-vs-gpt-4-1-mini]

This gap "matters when chained across multiple tool calls" and was observed to translate in a 5-tool agent test: Haiku required 1.18 calls/resolution vs GPT-4.1 mini's 1.34. [COMMUNITY — benchlm.ai]

**Needle-in-haystack (retrieval at large context depth, 60% insertion):**
- GPT-4.1 mini at 250k context: **94%** accuracy
- Claude Haiku 4.5 at 180k (max usable): **89%** accuracy
- GPT-4.1 mini wins on large-context retrieval, with a larger usable context window (1M vs 200k for Haiku). [COMMUNITY — benchlm.ai]

**gpt-5.4-mini vs Haiku 4.5 for structured output at volume:**
- gpt-5.4-mini reportedly stronger on "reliable structured output at volume" and classification/information-retrieval benchmarks (MMLU cited). [COMMUNITY — mindstudio.ai/blog/gpt-54-mini-vs-claude-haiku-sub-agent-comparison]
- Haiku 4.5 advantage: "long-context handling" for retrieval of extensive documents in single passes. [COMMUNITY]

#### Unknowns / gaps

- No controlled benchmark for the specific task pattern of **web-fetch-from-URL → extract → cite** was found. Existing comparisons use BFCL tool use, MMLU, or RAG chunking rather than the live-page-content pattern.
- No quality data found comparing **gpt-5.4-nano** vs Haiku 4.5 for any retrieval task.
- No data on **gpt-4.1-nano** vs Haiku 4.5 for retrieval.
- Whether gpt-5.4-mini's structured output advantage holds for citation extraction specifically is UNKNOWN.

---

## Price Comparison Table

### Token costs only (per retrieval call, estimated: 10k input tokens from page content, 1k output tokens for extraction)

| Model | Input cost | Output cost | Total tokens/call | WebFetch/search overhead |
|-------|-----------|------------|-------------------|--------------------------|
| gpt-5.4-nano | $0.002 | $0.00125 | $0.00325 | + $0.01 + $0.0016 fixed block = **$0.0149/call** |
| gpt-4.1-nano | $0.001 | $0.0004 | $0.0014 | + $0.01 (if web_search works) = **~$0.0114/call** |
| gpt-4.1-mini | $0.004 | $0.0016 | $0.0056 | + $0.01 + $0.006 fixed block = **$0.0216/call** |
| gpt-5.4-mini | $0.0075 | $0.0045 | $0.012 | + $0.01 + $0.006 fixed block = **$0.028/call** |
| Claude Haiku 4.5 | $0.01 | $0.005 | $0.015 | WebFetch: $0 overhead = **$0.015/call** |
| Claude Sonnet 4.6 | $0.03 | $0.015 | $0.045 | WebFetch: $0 overhead = **$0.045/call** |

Notes:
- OpenAI numbers assume web_search tool call (bundled search + content) with 8k fixed input block for mini/nano
- Claude numbers assume WebFetch (free, token-only) with known URL; add $0.01 if a WebSearch call precedes it
- All per-call estimates are illustrative at 10k input / 1k output; actual page sizes vary widely
- Batch API (50% off tokens) would improve all entries; tool call fee unchanged for OpenAI

---

## UNKNOWN List

1. Whether **gpt-4.1-nano** supports the `web_search` tool via Responses API (model page does not enumerate it)
2. Whether OpenAI **gpt-5.4-nano** web_search returns full page body or only excerpts/snippets in Responses API mode (the codex exec limitation is documented; the Responses API behavior is undocumented for nano)
3. Quality of **gpt-5.4-nano vs Haiku 4.5** on any retrieval task (no benchmark found)
4. Whether the batch API discount applies to OpenAI's $0.01/search tool call fee
5. Controlled benchmark for the specific **fetch → extract → cite** task shape (not found — all available data is BFCL/MMLU/needle-in-haystack proxies)
6. Whether the **citation accuracy** (hallucination rate on source attribution) differs between models at cheap tiers

---

## Sources

- [Pricing | OpenAI API](https://developers.openai.com/api/docs/pricing)
- [GPT-5.4 mini Model | OpenAI API](https://developers.openai.com/api/docs/models/gpt-5.4-mini)
- [GPT-5.4 nano Model | OpenAI API](https://developers.openai.com/api/docs/models/gpt-5.4-nano)
- [GPT-4.1 nano Model | OpenAI API](https://developers.openai.com/api/docs/models/gpt-4.1-nano)
- [GPT-4.1 mini Model | OpenAI API](https://platform.openai.com/docs/models/gpt-4.1-mini)
- [Web search | OpenAI API](https://developers.openai.com/api/docs/guides/tools-web-search)
- [Non-interactive mode – Codex | OpenAI Developers](https://developers.openai.com/codex/noninteractive)
- [Codex CLI Web Search Configuration | Codex Knowledge Base](https://codex.danielvaughan.com/2026/05/09/codex-cli-web-search-configuration-cached-live-domain-allow-lists-prompt-injection-defence/)
- [Pricing - Claude Platform Docs](https://platform.claude.com/docs/en/about-claude/pricing) ← primary Claude pricing source, fetched directly
- [Claude Haiku 4.5 | Anthropic](https://www.anthropic.com/claude/haiku)
- [Claude Haiku 4.5 vs GPT-4.1 mini: AI Benchmark Comparison 2026 | BenchLM.ai](https://benchlm.ai/compare/claude-haiku-4-5-vs-gpt-4-1-mini)
- [GPT-5.4 Mini vs Claude Haiku 4.5: Which Is the Better Sub-Agent Model? | MindStudio](https://www.mindstudio.ai/blog/gpt-54-mini-vs-claude-haiku-sub-agent-comparison)
- [Heads up: Web Search Tool Billing Can Be Higher Than You Expect | OpenAI Community](https://community.openai.com/t/heads-up-web-search-tool-billing-can-be-higher-than-you-expect-here-s-why/1236954)
- [Introducing GPT-5.4 mini and nano | OpenAI](https://openai.com/index/introducing-gpt-5-4-mini-and-nano/)
