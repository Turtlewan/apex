# Workstream: DeepSeek V4 Pro vs Claude Opus 4.8 — independent benchmarks

**Date:** 2026-06-13
**Confidence:** mixed (independent leaderboard numbers HIGH; vendor-reported tagged LOW)
**Re-research after:** 2026-06-27 (AI/LLM tooling, 14-day clock)
**Source:** parallel gather agent (sonnet) — BenchLM.ai, Artificial Analysis, Aider, Scale SEAL, LMArena

> Opus 4.8 first-party pricing/limits come from the `claude-api` skill (authoritative), not this agent. Where this agent's pricing differs, the claude-api numbers win: Opus 4.8 = $5 in / $25 out per Mtok.

## Coding / agentic (most APEX-relevant)
| Benchmark | Opus 4.8 | V4 Pro | Lead | Confidence |
|---|---|---|---|---|
| SWE-bench Verified | **88.6%** | 80.6% (Max) | Opus +8 pp | HIGH — BenchLM.ai, 2026-06-12 |
| Terminal-Bench 2.0 | **74.6%** | 67.9% | Opus +6.7 pp | HIGH — BenchLM.ai |
| BenchLM coding composite | **76.4** | 75.9 | ≈tied (+0.5) | MEDIUM |
| BenchLM agentic composite | **80.1** | 74.0 | Opus +6.1 | MEDIUM |
| Aider polyglot | 72.0% | not listed | — | MEDIUM (Opus string may be pre-4.8) |
| LiveCodeBench | not found | 93.5% (vendor) | — | LOW — vendor-only |

## Reasoning / general intelligence
| Benchmark | Opus 4.8 | V4 Pro | Lead | Confidence |
|---|---|---|---|---|
| AA Intelligence Index | **61** (#2/152) | 52 (#3/89 open) | Opus +9 | HIGH — Artificial Analysis |
| Humanity's Last Exam | **57.9%** | 37.7% | Opus +20.2 pp | HIGH — BenchLM.ai |
| GPQA Diamond | **93.6%** | 90.1% | Opus +3.5 pp | LOW — both vendor |
| MMLU-Pro | not published | 87.5–91.2% (vendor) | — | LOW |

## Speed, latency & cost (Artificial Analysis — HIGH; price reconciled to claude-api)
| Metric | Opus 4.8 | V4 Pro | Lead |
|---|---|---|---|
| Output tokens/sec | 56.7 | **64.4** | V4 Pro +14% |
| Time to first token | 11.19 s¹ | **1.67 s** | V4 Pro 6.7× lower |
| Input price /Mtok | $5.00 | **$0.435** | V4 Pro ~11.5× cheaper |
| Output price /Mtok | $25.00 | **$0.87** | V4 Pro 28.7× cheaper |
| Cache-hit input /Mtok | ~$0.50 (0.1×) | **$0.003625** | V4 Pro ~140× cheaper |

¹ Opus 4.8 TTFT is high largely because adaptive thinking runs before first token; not a like-for-like latency measure against V4 Pro standard mode.

## Context / output limits
| | Opus 4.8 | V4 Pro |
|---|---|---|
| Context | 1M | 1M |
| Max output | 128K | **384K** |

## Data gaps
- Scale SEAL standardized SWE-bench Pro: neither model on the fully standardized harness yet — vendor-scaffold numbers not directly comparable.
- LiveCodeBench: only V4 Pro has a published score (vendor).
- IFEval / BFCL tool-calling: no independent head-to-head found.
- LMArena: Opus 4.8 not yet in the June-2026 snapshot (Opus 4.7 ≈1452 Elo; V4.1 Pro ≈1410).
- Long-context: V4 Pro vendor MRCR-1M 83.5% / CorpusQA-1M 62.0%; Opus 4.8 not on a leaderboard.
- **V4 Pro "Max" vs standard is a material gap** — SWE-bench Verified 80.6% (Max) vs 73.6% (standard), ~7 pp. Always note the tier.

## Verdict (benchmark lens)
Opus 4.8 leads every *independently verified* APEX-relevant benchmark (SWE-bench, Terminal-Bench, Intelligence Index, HLE). V4 Pro's decisive edges are **cost** (≈29× cheaper output) and **TTFT/throughput**. On pure coding composite the two are near-tied; the gap widens on agentic + reasoning.
