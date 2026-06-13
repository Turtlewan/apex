# Workstream: DeepSeek V4 Pro — first-party facts

**Date:** 2026-06-13
**Confidence:** MEDIUM-HIGH (model id, limits, pricing VERIFIED from api-docs.deepseek.com; benchmarks are vendor-reported)
**Re-research after:** 2026-06-27 (AI/LLM tooling, 14-day clock)
**Source:** parallel gather agent (sonnet), api-docs.deepseek.com + DeepSeek announcement + community aggregators

---

## Model identity
- **API model string:** `deepseek-v4-pro` [VERIFIED — api-docs.deepseek.com]
- **Parameters:** 1.6T total / 49B active (MoE) [VERIFIED — official announcement]
- **Release:** 2026-04-24 [VERIFIED]
- **Open weights:** MIT on Hugging Face (expect `deepseek-ai/deepseek-v4-pro`); self-host needs ~400 GB VRAM (≈8× H100 80 GB, full FP4) [COMMUNITY]
- **API:** available at launch; OpenAI-compatible AND Anthropic-compatible endpoints [VERIFIED]

## Limits
- **Context window:** 1,000,000 tokens [VERIFIED — api-docs.deepseek.com/quick_start/pricing]
- **Max output:** 384,000 tokens [VERIFIED — same]
- **API concurrency:** 500 concurrent (vs 2,500 for Flash) [VERIFIED]

## Pricing (USD / 1M tokens, permanent as of 2026-05-31)
| Token type | Price |
|---|---|
| Input — cache miss | $0.435 |
| Input — cache hit | $0.003625 (~120× cheaper) |
| Output | $0.87 |

- Launch prices were 4× higher ($1.74 / $3.48); cut permanently 2026-05-22 [COMMUNITY — apidog.com]
- **Off-peak discount:** none confirmed for V4 Pro in official docs (older models had windows) [LOW]
- **Thinking-mode pricing:** no separate tier found; appears to bill reasoning at standard output rate [ASSUMED — not explicitly stated]

## Capabilities
- Thinking mode: three effort levels — standard / `think` / `think-max` via `reasoning_effort` [VERIFIED — api-docs.deepseek.com/guides/thinking_mode]
- Tool/function calling, JSON output, context caching, chat-prefix completion: supported [VERIFIED]
- FIM completion: non-thinking mode only [VERIFIED]
- Long-context attention: token-wise compression + DeepSeek Sparse Attention (DSA) [COMMUNITY]
- Positioning: "open-source SOTA in Agentic Coding" [VERIFIED — announcement text]

## Self-reported benchmarks [first-party-claim — vendor-reported, not independent]
| Benchmark | Score |
|---|---|
| SWE-bench Verified | 80.6% (highest open-weights at release; tied Gemini 3.1 Pro) |
| LiveCodeBench Pass@1 | 93.5% |
| Terminal-Bench 2.0 | 67.9% |
| Codeforces rating | 3,206 |
| HMMT 2026 (math) | 95.2% |
| HLE (Humanity's Last Exam) | 37.7% |

AIME 2025 / MATH-500 for V4 Pro: not found in reviewed sources.

## Not verified
1. Off-peak discount windows for V4 Pro
2. Whether thinking reasoning tokens bill separately or at output rate
3. AIME 2025 / MATH-500 numbers
4. Exact Hugging Face model-card URL

## Deprecation note
`deepseek-chat` and `deepseek-reasoner` both map to **Flash** (not Pro) and are deprecated 2026-07-24. Pipelines wanting Pro quality must use `deepseek-v4-pro` explicitly.
