# Research: DeepSeek V4 Pro vs Claude Opus 4.8 — capability, performance & cost for APEX

**Date:** 2026-06-13
**Confidence:** MEDIUM-HIGH (independent leaderboards + first-party pricing HIGH; some coding/reasoning numbers vendor-reported)
**Re-research after:** 2026-06-27 (AI/LLM tooling, 14-day clock)
**Decision at stake:** none — exploratory landscape reference (not an ADR). APEX today = Opus 4.8 planning + DeepSeek **V4 Flash** coding.
**Workstreams:** `ws-deepseek-v4-pro.md` (DeepSeek first-party) · `ws-benchmarks-headtohead.md` (independent benchmarks). Opus 4.8 facts from the `claude-api` skill (authoritative).

---

## Summary

Across every **independently verified** benchmark that matters to APEX — agentic coding (SWE-bench 88.6 vs 80.6, Terminal-Bench 74.6 vs 67.9) and reasoning (Artificial Analysis Intelligence Index 61 vs 52, HLE 57.9 vs 37.7) — **Opus 4.8 leads V4 Pro by ~6–20 points**. On a *pure* coding composite the two are near-tied. V4 Pro's decisive advantages are **cost (~29× cheaper output, ~11× cheaper input, ~140× cheaper cache-hit)**, **throughput (+14% tokens/sec)**, **TTFT (6.7× lower)**, a **bigger max output (384K vs 128K)**, and **open weights (MIT)**. The current APEX split — Claude for judgment-heavy planning, a DeepSeek model for high-volume coding — is well-supported: you put the capability premium where answer quality matters (planning) and the cheap, fast, near-parity model where throughput matters (coding).

## Head-to-head (APEX-relevant)

| Dimension | Opus 4.8 | DeepSeek V4 Pro | Winner |
|---|---|---|---|
| SWE-bench Verified | **88.6%** | 80.6% (Max) | Opus +8 pp |
| Terminal-Bench 2.0 (agentic) | **74.6%** | 67.9% | Opus +6.7 pp |
| Coding composite | 76.4 | 75.9 | ≈tied |
| AA Intelligence Index | **61** | 52 | Opus +9 |
| Humanity's Last Exam | **57.9%** | 37.7% | Opus +20 pp |
| Context window | 1M | 1M | tie |
| Max output | 128K | **384K** | V4 Pro |
| Output tokens/sec | 56.7 | **64.4** | V4 Pro +14% |
| Time-to-first-token | 11.19 s¹ | **1.67 s** | V4 Pro 6.7× |
| Input $/Mtok | $5.00 | **$0.435** | V4 Pro ~11.5× |
| Output $/Mtok | $25.00 | **$0.87** | V4 Pro ~29× |
| Cache-hit input $/Mtok | ~$0.50 | **$0.003625** | V4 Pro ~140× |
| Weights | closed | **open (MIT)** | V4 Pro |

¹ Opus TTFT includes adaptive thinking before first token — not a like-for-like latency measure.

## Mapped to APEX roles

- **Planning (Claude today):** wants long-context reasoning, judgment, spec-writing, council/review. Opus 4.8's +9 Intelligence Index and +20 pp HLE are exactly this axis. V4 Pro is not a clean replacement here — the quality gap is widest on reasoning, and planning is low-volume so its cost premium barely matters. **Keep Claude for planning.**
- **Coding (V4 Flash today):** wants reliable agentic multi-step execution + high throughput at low cost. V4 Pro is **near-parity with Opus on pure coding** at ~29× lower output cost and higher throughput — and it's a real upgrade over V4 Flash (which the local-inference research, ADR-016, put ~11 pp behind Pro on agentic planning). The open question for APEX is **Flash → Pro for coding**, not Pro-vs-Opus: Pro buys measurably better agentic coding than Flash, at a still-cheap hosted price, with 384K output headroom for big multi-file builds.

## Coding cost — V4 Flash (current) vs V4 Pro (candidate upgrade)

The relevant cost question for APEX coding is **Flash vs Pro**, not Pro vs Opus. Both are cheap; the delta is small in absolute dollars. [VERIFIED — api-docs.deepseek.com/quick_start/pricing, 2026-06-13]

| Token type ($/1M) | V4 Flash | V4 Pro | Pro multiplier |
|---|---|---|---|
| Input — cache miss | $0.14 | $0.435 | **3.1×** |
| Input — cache hit | $0.0028 | $0.003625 | 1.3× |
| Output | $0.28 | $0.87 | **3.1×** |

**Rule of thumb: V4 Pro coding costs ≈3× V4 Flash** on output and fresh input; only ~1.3× on cached input (APEX coding is cache-heavy, so blended is somewhat under 3×).

Anchored to APEX's own prior figure — ADR-016 put current Flash coding spend at **~$5–20/mo** — V4 Pro coding lands at **~$15–60/mo**, an added **~$10–40/mo**. For reference, the same coding workload on Opus 4.8 (output $25 vs Pro $0.87) would be **~29× Pro's cost**, i.e. roughly $450–1,700/mo — which is why the frontier model is never the coding candidate.

**Caveat — think/think-max inflates the real cost, and it's not optional.** V4 Pro's strong
benchmark numbers are the `think-max` tier, which emits far more (output-priced) reasoning tokens.
**Update 2026-06-13:** this is APEX's *default operating state*, not a hypothetical — DeepSeek's API
has thinking enabled by default and **auto-sets effort to `max` for Claude Code requests** (no
non-think exposed; `budget_tokens` ignored over the Anthropic endpoint). So a Pro toggle = **Pro-Max**,
landing squarely above the 3.1× sticker, and APEX currently has **no way to request a cheaper `high`
tier**. The $/quality trade must clear both the ~3× base and the always-on max reasoning tokens.
See `docs/findings/deepseek-v4-paper-vs-apex-coding-assumptions.md`.

## Caveats / gaps
- **Version comparand (added 2026-06-13):** the DeepSeek-V4 technical report benchmarks Pro against **Claude Opus 4.5 / 4.6 and Sonnet 4.5** internally — *not* Opus 4.8. Its "approaches Opus 4.5" framing therefore **understates** the gap to APEX's actual planning baseline (Opus 4.8); the head-to-head table above (which uses 4.8) is the right comparand. The report also contains a **direct Flash-vs-Pro-vs-mode table (Table 7)** — the comparand the Pro-mode audit lacked.
- Several coding/reasoning numbers for one side are vendor-reported (LiveCodeBench, MMLU-Pro, GPQA) — tagged LOW; treat independent leaderboards (BenchLM, Artificial Analysis) as the trustworthy spine.
- **V4 Pro "Max" vs standard is ~7 pp on SWE-bench** — quoted figures here are Max (`think-max`); standard mode is lower and cheaper-by-latency.
- Opus 4.8 TTFT figure is inflated by adaptive thinking; don't read it as a raw network-latency loss.
- Neither model is on the fully standardized Scale SEAL harness yet; LMArena's June snapshot predates Opus 4.8.
- V4 Pro is **datacenter-only to self-host** (~400 GB VRAM, 1.6T params) — consistent with ADR-016's finding that Pro can't run on the planned Mac host; any APEX use of Pro is **via API**, not local.

## Not a recommendation to switch
This is a landscape reference. If a switch decision is later opened, the live question it informs is **"should APEX coding move from V4 Flash to hosted V4 Pro?"** — and that would be an ADR with its own eval-gate (reuse the ADR-016 P1 harness), not a conclusion of this doc.
