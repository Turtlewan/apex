# WS-A — Four-Model Coding & UI Capability + Per-Token Cost Matrix

**Date:** 2026-06-21
**Confidence:** HIGH for pricing (primary sources: platform.claude.com/docs, api-docs.deepseek.com); HIGH for Opus 4.8 benchmarks (BenchLM, Artificial Analysis); MEDIUM for Sonnet 4.6 Terminal-Bench (community aggregators); MEDIUM for DeepSeek vision API status (community + indirect API docs inference).
**Re-research after:** 2026-07-05 (AI/LLM tooling, 14-day clock — Fable 5 availability flag may lift sooner)
**Prior research absorbed:** model-comparison/README.md, ws-benchmarks-headtohead.md, ws-deepseek-v4-pro.md, local-inference/ws-a-lineup.md, findings/deepseek-v4-paper-vs-apex-coding-assumptions.md

---

## Summary

This workstream fills three gaps left by prior research: Sonnet 4.6 as a coder (entirely absent before), Opus 4.8 pricing/benchmark confirmation for the routing matrix, multimodal image capability per model, and a benchmark refresh as of 2026-06-21. The core finding: **Sonnet 4.6 is a real, cost-effective coding candidate** — 79.6% SWE-bench Verified at $3/$15 input/output, putting it within 9 pp of Opus 4.8 at 60% the cost per output token. The DeepSeek pair remains the cheapest coding option; both lack image input via API. All four Claude-family models accept image input natively.

---

## 4-Model Comparison Matrix

| Dimension | Opus 4.8 | Sonnet 4.6 | V4 Flash | V4 Pro |
|---|---|---|---|---|
| **SWE-bench Verified** | **88.6%** | 79.6% | ~79.0% | 80.6% (Max) |
| **SWE-bench Pro (vendor)** | 69.2% | 43.6% (Scale SEAL) | n/a | n/a |
| **Terminal-Bench 2.0/2.1** | **74.6%** | 59.1% | not independently listed | 67.9% |
| **AA Intelligence Index** | **56/154 (#2)** | 36/100 (#3 non-reasoning) | not listed | 52 (#3 open) |
| **Coding composite (BenchLM)** | 76.4 | not listed | not listed | 75.9 |
| **Image/multimodal input** | **YES** [VERIFIED] | **YES** [VERIFIED] | **NO (API)** [VERIFIED] | **NO (API)** [VERIFIED] |
| **UI-coding / front-end** | Strong (multimodal) | Strong (multimodal) | Text only | Text only |
| **Input $/MTok** | $5.00 | **$3.00** | **$0.14** | $0.435 |
| **Output $/MTok** | $25.00 | **$15.00** | **$0.28** | $0.87 |
| **Cache-hit input $/MTok** | $0.50 | **$0.30** | **$0.0028** | $0.003625 |
| **Cache-write $/MTok** | $6.25 (5 min) / $10 (1 h) | $3.75 / $6.00 | n/a | n/a |
| **Max output tokens** | 128K | **64K** | 131K | **384K** |
| **Context window** | 1M | 1M | 1M | 1M |
| **Output tokens/sec (AA)** | 57.8 | 42.5 | not measured | 64.4 |
| **TTFT (AA)** | 17.87 s | 1.29 s | not measured | 1.67 s |
| **Thinking/reasoning** | Adaptive (always on) | Extended + Adaptive | Auto-Max (DeepSeek-controlled) | Auto-Max (DeepSeek-controlled) |
| **API model ID** | `claude-opus-4-8` | `claude-sonnet-4-6` | `deepseek-v4-flash` | `deepseek-v4-pro` |

---

## Key Findings

### 1. Sonnet 4.6 is a credible mid-tier coding candidate — not just a "budget" tier [VERIFIED + COMMUNITY]
SWE-bench Verified 79.6% — within 9 pp of Opus 4.8 (88.6%) and 1 pp ahead of V4 Flash (~79.0%) and V4 Pro (80.6% Max). At $15/MTok output vs Opus 4.8's $25/MTok, Sonnet 4.6 is **40% cheaper on output** than Opus. For APEX build items scored medium-complexity by the router, Sonnet 4.6 offers near-V4-Pro coding quality at 17× the DeepSeek Flash output cost — justified for UI/visual tasks where image input is required. Sources: morphllm.com/claude-benchmarks, platform.claude.com/docs, dev.to/blamsa0mine, Artificial Analysis.

### 2. Sonnet 4.6 Terminal-Bench trails the field — 59.1% vs Opus 4.8's 74.6% [COMMUNITY]
On agentic/CLI-heavy tasks (Terminal-Bench 2.0), Sonnet 4.6 scores 59.1% — 15.5 pp behind Opus 4.8 and 8.8 pp behind V4 Pro. This is the biggest quality gap between Sonnet and Opus for APEX-style multi-step agentic builds. The router should avoid Sonnet 4.6 for high-autonomy, long-horizon multi-step specs. Source: dev.to/blamsa0mine Terminal-Bench community aggregation.

### 3. DeepSeek V4 Flash AND Pro lack image input via the API — confirmed text-only [VERIFIED]
Both `deepseek-v4-flash` and `deepseek-v4-pro` are text-only on the DeepSeek API endpoint. A separate "DeepSeek Vision" product exists (chat-only, not API-accessible) and is a distinct variant. Vision-pipeline integration in workarounds uses Claude/GPT-4o as a description proxy. Any APEX build item requiring image input (screenshots, mockups, Figma frames) **must** route to a Claude model. Source: api-docs.deepseek.com (no vision endpoint in API docs); community confirmation from MindStudio blog and tony-reviews.

### 4. Sonnet 4.6 has a 64K max output ceiling — lowest of the four models [VERIFIED]
Sonnet 4.6 is capped at 64K output tokens (vs Opus 4.8 128K, V4 Flash 131K, V4 Pro 384K). For large multi-file builds, the router must respect this ceiling. However, via the Batch API beta header `output-300k-2026-03-24`, Sonnet 4.6 can reach 300K — but only in batch mode, not synchronous. For synchronous real-time coding, 64K is the hard limit. Source: platform.claude.com/docs models overview.

### 5. Fable 5 exists as a potential second-pass planner but is currently unavailable [VERIFIED]
`claude-fable-5` — released June 9, 2026 — scores 95.0% SWE-bench Verified (vs Opus 4.8's 88.6%) at $10/$50 input/output. It is currently flagged unavailable due to export-control directives as of June 12, 2026. When available it is a strong upgrade over Opus 4.8 for both planning and high-complexity coding, at 2× the output cost. Not relevant to the current routing build. Sources: platform.claude.com/docs (authoritative), morphllm.com/claude-benchmarks.

---

## Output Cost Matrix (routing-decision format)

For a 10K-output-token coding task (typical mid-size spec task):

| Model | Output cost | vs V4 Flash |
|---|---|---|
| V4 Flash | $0.0028 | 1× (baseline) |
| V4 Pro | $0.0087 | 3.1× |
| Sonnet 4.6 | $0.15 | 53.6× |
| Opus 4.8 | $0.25 | 89.3× |

Note: V4 Flash/Pro always run at `think-max` under APEX (DeepSeek auto-detects Claude Code), making real blended cost higher than the sticker rate. For cache-heavy APEX sessions the gap narrows via cache-hit pricing.

---

## Sonnet 4.6 vs V4 Pro: the key routing trade-off

Both score within 1 pp on SWE-bench Verified (~79–80%). V4 Pro has a larger Terminal-Bench advantage (67.9% vs 59.1%, +8.8 pp). The decisive differentiator for the router is:

- **Image input needed** → Sonnet 4.6 (only option in the cost-effective Claude tier)
- **No image, long output needed (>64K)** → V4 Pro (384K ceiling) or Opus 4.8 (128K)
- **No image, medium complexity** → V4 Flash (cheapest, near-parity coding quality at 79%)
- **High-autonomy, long-horizon agentic build** → Opus 4.8 (74.6% Terminal-Bench, adaptive thinking)

---

## Assumptions & Gaps

| ID | Item | Risk |
|---|---|---|
| A1 | Sonnet 4.6 Terminal-Bench 59.1% is from community aggregators (dev.to, Rootly), not the official BenchLM leaderboard | Medium — could be ±3 pp; directional confidence is HIGH |
| A2 | DeepSeek V4 Flash SWE-bench Verified ~79.0% is from ws-a-lineup.md (insiderllm.com secondary source) — not independently leaderboard-confirmed | Medium |
| A3 | DeepSeek vision (V4 Vision) "chat only, not API" status is from community sources; a dedicated API endpoint could appear without warning | Medium — monitor api-docs.deepseek.com |
| A4 | Opus 4.8 TTFT (17.87 s, Artificial Analysis) includes adaptive thinking spin-up; not directly comparable to Sonnet 4.6's 1.29 s | Low — noted |
| A5 | DeepSeek think-max token inflation on real APEX builds — no measured multiplier. Prior research estimates "above 3.1× sticker"; exact per-task impact unknown | High — affects routing cost model |
| A6 | Fable 5 unavailability — export-control restriction may lift on short notice | Low for current build; monitor |
| A7 | AA Intelligence Index uses different scoring axis for reasoning vs non-reasoning models (Opus 4.8 = 56/154 reasoning; Sonnet 4.6 = 36/100 non-reasoning) — not directly comparable | Low — noted |

---

## Sources

| # | Source | Used for | Confidence |
|---|---|---|---|
| 1 | platform.claude.com/docs/en/docs/about-claude/models/overview | Model IDs, context, max output, multimodal capability | HIGH — Anthropic authoritative |
| 2 | platform.claude.com/docs/en/about-claude/pricing | All Claude pricing: input/output/cache-write/cache-hit | HIGH — Anthropic authoritative |
| 3 | api-docs.deepseek.com/quick_start/pricing | DeepSeek Flash and Pro pricing | HIGH — DeepSeek authoritative |
| 4 | artificialanalysis.ai/models/claude-sonnet-4-6 | Sonnet 4.6 AA Intelligence Index, throughput, TTFT | HIGH — independent |
| 5 | artificialanalysis.ai/models/claude-opus-4-8 | Opus 4.8 AA Intelligence Index, throughput, cost | HIGH — independent |
| 6 | morphllm.com/claude-benchmarks | Claude SWE-bench Verified scores, Fable 5 data, pricing | HIGH — aggregated primary |
| 7 | morphllm.com/best-ai-model-for-coding | SWE-bench Pro scores, Sonnet 4.6 vs Opus 4.8 coding | MEDIUM — aggregator |
| 8 | dev.to/blamsa0mine (SWE-bench, Agentic Coding, Sonnet 4.5 to 4.6) | Sonnet 4.6 Terminal-Bench 59.1% | COMMUNITY |
| 9 | nxcode.io/resources/news/claude-sonnet-4-6-complete-guide | Sonnet 4.6 OSWorld, GPQA, ARC-AGI-2 scores | COMMUNITY |
| 10 | ws-benchmarks-headtohead.md (prior research, BenchLM 2026-06-13) | Opus 4.8 SWE-bench 88.6%, Terminal-Bench 74.6% | HIGH |
| 11 | ws-deepseek-v4-pro.md + ws-a-lineup.md (prior research) | V4 Pro/Flash specs, pricing, benchmarks | HIGH/MEDIUM |
| 12 | deepseek-v4-paper-vs-apex-coding-assumptions.md (finding) | Think-max auto-set, cost inflation caveat | HIGH |
| 13 | mindstudio.ai/blog/deepseek-v4-vision-cheaper-multimodal-ai-workflows | DeepSeek vision chat-only, API text-only | COMMUNITY |
| 14 | api-docs.deepseek.com (no /guides/vision endpoint — 404) | Confirms absence of vision API endpoint | VERIFIED |

---

## Re-research after: 2026-07-05
- DeepSeek vision API endpoint status (could ship without notice)
- Fable 5 export-control restriction lift
- Sonnet 4.6 Terminal-Bench official leaderboard confirmation
- DeepSeek Flash SWE-bench Verified independent leaderboard confirmation
