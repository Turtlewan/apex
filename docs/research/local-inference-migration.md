# Research: APEX fully local — planning + coding on self-hosted DeepSeek

**Date:** 2026-06-12
**Confidence:** MEDIUM-HIGH (model identity, hardware pricing, serving-engine support all primary-sourced; planning-quality verdict rests on thin third-party benchmarks + one practitioner report; local quantized tool-calling fidelity unbenchmarked)
**Re-research after:** 2026-06-26 (AI/LLM tooling, 14-day clock)
**Decision record:** [ADR-016](../technical/adr/ADR-016-apex-fully-local-deepseek.md)
**Source files:** `local-inference/ws-a-lineup.md` · `ws-b-hardware.md` · `ws-c-serving.md` · `ws-d-currency.md` · `ws-e-artemis-hw.md` · `ws-f-go-no-go.md` (6 parallel gather agents, 2026-06-12)

---

## Summary

The brief's premise — **DeepSeek V4-Pro plans, V4-Flash codes, both local** — fails at the hardware
layer: V4-Pro (1.6T MoE) is datacenter-only (~862 GB native; ~400 GB even at Q2), so the only model
that can run at home is **V4-Flash (284B MoE / 13B active) for both roles**. Flash is near-Pro on
coding (−1.6 pp SWE-bench) but **11 pp behind Pro on agentic planning** (Terminal-Bench 2.0), Pro
itself trails Claude on self-consistency in long autonomous runs, and a Q3/Q4 quantization tax
compounds on top. The economically sane host (Mac Studio M3 Ultra 256 GB, ~$6k) can only serve Flash
via **experimental single-request engines** today — no concurrent agent fan-out — while CUDA boxes
that serve it properly cost $20–40k and never break even at solo-developer volumes.

**Verdict: do not migrate planning now.** Adopt a prepare-and-gate plan: build the eval harness and
RAG-currency index (no-regret in every future), buy the Phase-1 hardware on Artemis' justification,
run local Flash as a shadow/experiment, and migrate only when the WS-F eval gate passes on a
concrete local setup. Hybrid (cloud planning + cloud-or-local coding) is the stable interim state,
not a failure mode.

---

## Key findings (synthesis — full citations in the ws-* files)

### Models (WS-A)
- "Pro V4" = **DeepSeek-V4-Pro**: 1.6T total / 49B active, 1M ctx / 384K out, MIT, released 2026-04-24. [VERIFIED]
- "Flash" = **DeepSeek-V4-Flash**: 284B total / 13B active, 1M ctx / **131K out** (not 384K — corrects the session-31 status.md note). [VERIFIED]
- **V4-Pro is not locally hostable** on any consumer/prosumer box. [VERIFIED]
- V4 weights ship natively FP4+FP8 (already compressed) — sub-Q4 community quants are likely harmful; native FP4+FP8 is the local quality ceiling. [VERIFIED/COMMUNITY]
- Quant tax: Q4_K_M ≈ 3.5% average drop (V3 study, arXiv:2505.02390); community puts the planning-task floor at Q6/FP8-class, with "notable reasoning loss" at Q4. [VERIFIED/COMMUNITY]

### Adjudicated conflicts (orchestrator ruling, recorded)
1. **Flash Q4_K_M footprint = ~160–180 GB weights (~185–195 GB runtime)** — WS-B/WS-C/WS-E agree and the arithmetic checks (284B × ~4.8 bits); WS-A's "~96 GB, fits a 128 GB Mac" is overruled as implausible. On 128 GB only IQ2-class extreme quants fit (ds4 evidence). A 96 GB Mac config cannot run Flash at all.
2. **Flash max output = 131K** (WS-A, two sources, discrepancy explicitly checked) — overrules WS-C's 384K, which conflated Pro and Flash.
3. **WS-F's hardware tiers (RTX 4090 clusters, "Mac M4 Ultra") re-anchored**: there is no M4 Ultra (Apple skipped it; M3 Ultra is current, M5 Ultra rumoured H2 2026); 4090 clusters are EOL-priced ($2.5–3.8k/card) and economically upside-down. WS-F's break-even math is re-computed below on the real M3 Ultra 256 GB price ($5,999).

### Hardware (WS-B + WS-E)
| Tier | Config | All-in | Flash serving | Concurrency | Home fit |
|------|--------|--------|---------------|-------------|----------|
| Entry | Strix Halo mini-PC 128 GB | ~$3.5k | IQ1/IQ2 only — quality-disqualified for planning | 2–4 (small models) | Excellent |
| **Balanced** | **Mac Studio M3 Ultra 256 GB** (+ owned Mac Mini) | **$5,999** (+$240 UPS, +~$1.1k NAS) | Q4_K_M tight / Q3 comfortable, ~15–22 tok/s | ~4 streams *claimed* — but see serving caveat | Excellent (<200 W, near-silent) |
| Headroom | 4× RTX PRO 6000 Blackwell | $36–42k + ~$4.5k/yr power | Native FP4+FP8, 25–40 tok/s, proper batching | 8–16 streams | Poor (2.4–3.5 kW, server room) |

- 512 GB M3 Ultra discontinued March 2026; 256 GB is the largest purchasable Apple config. [VERIFIED]
- M5 Ultra rumoured H2 2026 — possible high-memory single-box answer; a purchase-timing call. [COMMUNITY]

### Serving + harness (WS-C)
- **CUDA path:** SGLang (primary; day-0 V4 support, stable batching) + LiteLLM Anthropic-shim proxy. vLLM has open V4-Flash FP8 EP crash (#43648) + SM120 crash + DeepSeek tool-token parser failures on quantized checkpoints — fallback only. [VERIFIED]
- **Mac path:** MLX does **not** support the V4-Flash architecture (open issue #1233); the only engines are ds4 / an experimental llama.cpp fork — **single-request, no production batching**. The balanced tier's "~4 concurrent streams" does not hold for V4-Flash on a Mac today. Concurrent APEX fan-out on local Flash effectively requires CUDA. [VERIFIED/COMMUNITY]
- **Claude Code stays viable as the harness** (official LLM Gateway path, `ANTHROPIC_BASE_URL` → LiteLLM). One break: APEX detects coding mode by `deepseek` in the URL — a localhost proxy URL defeats it. Fix at rewire time (URL path prefix or an `APEX_MODE` env var). [VERIFIED + ASSUMED-internal]
- **Real local context cap** (vs the 1M native window): ~256K on 2×H200-class, ~128K on 1×H100, **~32–64K on a 128 GB Mac at IQ2**; on the 256 GB M3 Ultra expect Q3/Q4 with modest KV headroom — plan around 64–128K, not 1M.

### Quality verdict — the gating risk (WS-A + WS-F)
- Cloud V4-Pro vs Claude: ties MMLU-Pro, −1.5 pp Terminal-Bench 2.0, −4 pp GPQA, −13 pp SWE-bench Verified vs Opus 4.7. Competitive on structured agentic planning, behind on hard reasoning. [VERIFIED, single-source Terminal-Bench — G7]
- **Flash vs Pro on Terminal-Bench 2.0: 56.9% vs 67.9% — an 11 pp agentic-planning gap.** This is the number that kills "Flash-grade planning ≈ Claude-grade planning". [VERIFIED — third-party test]
- Practitioner report: V4-Pro "more likely to lose track of earlier-stated constraints" than Claude in multi-step autonomous runs. Single source; highest-stakes unknown. [COMMUNITY]
- Quantized-local tool-calling fidelity is **unbenchmarked anywhere** — the biggest open risk for a tool-driven pipeline. [GAP]

### Economics (WS-F, re-anchored)
- Current cloud baseline: ~$120–270/month (Claude Max 5x/20x or API + DeepSeek API coding at $5–20/mo).
- Mac path (M3 Ultra 256 GB $5,999 + $240 UPS; ~$13/mo power): net saving $107–257/mo → **break-even ~26–60 months**. NAS (+$1.1k) is an Artemis cost, not an inference cost.
- GPU-cluster paths: never break even at solo volumes (opex can exceed savings).
- **Coding-only localization saves $5–20/month — negligible.** The economics only move if Claude planning spend is eliminated, which is exactly the part quality-gated.

### Staying current (WS-D)
Hybrid, in priority order: **(1) RAG-for-currency** — reuse the Artemis second-brain index (LanceDB preferred at scale per WS-E), staleness-clock-driven re-ingestion of library docs; high ROI for coding, unproven for planning judgment. **(2) Eval-gated model swap** — the actual currency mechanism; DeepSeek cadence ≈ incremental every 2–4 months, major every 12–16 months (V5 unlikely before late 2027). **(3) Fine-tuning deferred** — flagship MoE untunable on prosumer hardware; a distill QLoRA buys behavior alignment, not currency. Watch-item: if DeepSeek drops MIT open weights for V5, the whole swap strategy collapses to API-only.

### Artemis ecosystem (WS-E)
- **Shared box**: Artemis RAG/embedding co-hosts on the Studio (embedding models are 0.3–1 GB vs a 256 GB pool); throttle bulk ingestion off coding hours. Revisit if corpus >5M docs or >4 concurrent streams.
- **Mac Mini: retain** — APEX coding-distill host (7–14B via Ollama, 40–60 tok/s; Ollama v0.14 speaks native Anthropic API) + Artemis orchestration layer. Not a V4-Flash host.
- Backup: NAS (Synology DS923+ + 4×4 TB, ~$1.1k — HDD prices volatile, buy early) for vector indexes/configs; model weights are re-downloadable, never backed up.

---

## Recommendation

**Do not migrate APEX planning to local DeepSeek now; run the prepare-and-gate plan** (phases in
ADR-016). The decisive chain: the only near-Claude DeepSeek planner (V4-Pro) cannot run at home →
the home-viable model (V4-Flash) is 11 pp behind Pro on agentic planning before a Q3/Q4 quant tax →
the affordable host can't serve it concurrently anyway → and the money saved by localizing only
coding is ~$5–20/month. Meanwhile three moves are no-regret in every future: the **eval harness +
20-task corpus** (it is both the migration gate and WS-D's swap gate), the **RAG-currency index**
(pays off for cloud coding today and reuses Artemis infrastructure), and the **Phase-1 hardware**
(justified by Artemis regardless; doubles as the local-Flash experiment bench).

**Migration gate (all four to flip planning local):**
1. WS-F's 20-task eval passes on the actual local setup (≥3.8/5 overall, planning ≥3.5, tool fidelity ≥90%).
2. Tool-calling fidelity at the deployed quant measured ≥95% on the APEX tool surface.
3. A serving path with real concurrent batching exists on owned hardware (matured Mac engine, or M5-Ultra-era support, or a CUDA box justified by other workloads).
4. Context ≥128K usable locally without degrading the eval scores.

**Revisit triggers:** M5 Ultra ships with ≥256 GB · DeepSeek V5 (or any release that closes the
Flash↔Pro agentic gap in a home-sized model) · Mac serving stack gains production batching for V4
architecture · cloud planning spend materially exceeds ~$200/month.

---

## Assumptions / gaps
- Terminal-Bench 2.0 scores are single-source (verdent.ai / kilo.ai); not independently replicated. (WS-A G7)
- V4-Pro self-consistency report is one practitioner account. The hands-on eval is the only closure.
- Quantized tool-calling fidelity: no published benchmark; must be measured locally (gate #2).
- RAG benefit for planning/judgment currency assumed low, not validated.
- Hugging Face weight access assumed ungated; verify before building the pull pipeline.
- All prices June 2026; HDD prices volatile (+46–96% YoY), Apple lead times 6–10 weeks.

## Downstream (flagged for a later planning pass — NOT specced in this run)
1. **Eval-harness spec** — promptfoo + lm-eval-harness + the 20-task corpus (WS-F design, WS-D gate). Buildable soon; partially Mac-gated.
2. **RAG-currency index spec** — couples to Artemis SP0 requirements pass; LanceDB + staleness-clock re-ingestion.
3. **Backend-routing rewire spec** — mode detection (`APEX_MODE` env var or URL path prefix) + LiteLLM proxy config; only after a migration "go".
4. **Hardware procurement decision** — M3 Ultra 256 GB now vs wait-for-M5-Ultra (H2 2026 rumour); user purchase-timing call, not a spec.
5. **status.md correction** — Flash max output is 131K, not 384K (session-31 note).

## Sources
Tier-1/primary and community sources are cited per-claim inside the six `local-inference/ws-*.md`
files (≈150 distinct sources). Headline primaries: api-docs.deepseek.com (V4 release), Hugging Face
model cards, vLLM/SGLang/LiteLLM/Ollama docs + issue trackers, Claude Code LLM Gateway docs,
arXiv:2505.02390 (quant degradation), Apple/Tom's Hardware (M3 Ultra pricing/discontinuation),
NVIDIA RTX PRO 6000 specs, EleutherAI lm-evaluation-harness, promptfoo docs.
