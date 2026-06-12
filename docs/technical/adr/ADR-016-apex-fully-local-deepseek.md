# ADR-016: APEX fully-local on DeepSeek — defer behind an eval gate; prepare-and-gate plan

**Date:** 2026-06-12
**Status:** Accepted
**Research:** [`docs/research/local-inference-migration.md`](../../research/local-inference-migration.md) (+ `docs/research/local-inference/ws-a…f.md`, 6-agent pass, 2026-06-12)

## Context

Goal under decision: run the entire APEX pipeline — planning AND coding — on local self-hosted
DeepSeek ("Pro V4" reasoning + "Flash" coding), no cloud LLM, integrated with the Artemis hardware
roadmap, with a model-currency strategy. The named gating risk: APEX put planning on Claude
deliberately because planning is the judgment-heavy half — can local DeepSeek do Claude-grade
planning?

The research returned three decisive facts:
1. **DeepSeek-V4-Pro cannot run at home** (1.6T MoE; ~862 GB native, ~400 GB at Q2 — datacenter-only). The home-viable model is V4-Flash (284B/13B active, ~160–180 GB at Q4_K_M).
2. **V4-Flash is 11 pp behind V4-Pro on agentic planning** (Terminal-Bench 2.0: 56.9 vs 67.9), and Pro itself trails Claude on long-run self-consistency; a Q3/Q4 quantization tax compounds on top. Local quantized tool-calling fidelity is unbenchmarked.
3. **The affordable host can't serve it concurrently**: on Apple silicon, V4-Flash runs only via experimental single-request engines (MLX unsupported); proper concurrent serving (SGLang) needs a $20–40k CUDA box that never breaks even at solo volumes. Localizing coding alone saves $5–20/month.

## Options considered

| Option | Score | Reasoning |
|--------|-------|-----------|
| Full migration now (both modes → local Flash) | ✗ | Planning quality unproven and probably below Claude-grade (11 pp Flash↔Pro agentic gap + quant tax); no concurrent serving on affordable hardware; tool-calling fidelity unmeasured |
| Coding-only migration now | ✗ (as a goal) | Saves $5–20/month; adds a maintenance tax (~2 h/week) for negligible payoff; fine as a side-effect experiment, wrong as an objective |
| Headroom CUDA build ($36–42k) to do it "properly" | ✗ | Never breaks even; 2.4–3.5 kW / server-room requirements; still serves Flash, not Pro — the quality ceiling doesn't move |
| **Prepare-and-gate (chosen)** | ✓ | All preparation steps are no-regret in every future; migration happens if and only if a measured gate passes on the real setup |

## Decision

**Defer the full-local migration. Adopt the prepare-and-gate plan. Hybrid (Claude planning +
DeepSeek coding, cloud or local) is the sanctioned interim state — not a failure mode.**

**Phases:**
- **P1 — Eval harness (build next):** promptfoo + lm-evaluation-harness + the WS-F 20-task corpus
  (10 planning / 10 coding, 4-dimension rubric incl. self-consistency + tool fidelity + buried-
  constraint long-context test). Dual-purpose: the migration gate AND the WS-D model-swap gate.
- **P2 — RAG-currency index:** reuse the Artemis second-brain vector store (LanceDB at scale);
  staleness-clock-driven re-ingestion of library docs. Pays off immediately for cloud coding.
- **P3 — Hardware on Artemis' justification:** Mac Studio M3 Ultra 256 GB ($5,999) + UPS ($240)
  [+ NAS ~$1.1k for Artemis data]; **purchase timing is a user call vs the M5 Ultra rumour
  (H2 2026)**. Mac Mini retained as coding-distill host (Ollama, native Anthropic API) + Artemis
  orchestrator. Shared box for Artemis RAG + inference; ingestion throttled off coding hours.
- **P4 — Shadow-run local Flash** on the Studio (ds4/llama.cpp-class, single-stream) against real
  APEX tasks; measure the eval gate. No production cutover.
- **P5 — Migrate only on gate-pass:** all four conditions — (1) eval ≥3.8/5 overall & planning
  ≥3.5; (2) tool-calling ≥95% on the APEX tool surface at the deployed quant; (3) a concurrent-
  batching serving path on owned hardware; (4) ≥128K usable local context without eval regression.
  Then execute the backend-routing rewire (LiteLLM proxy + `APEX_MODE`/URL-prefix mode detection).

**Model-currency strategy (applies whenever anything runs locally):** RAG-first + eval-gated model
swap (the P1 harness is the gate); fine-tuning rejected for currency (distill QLoRA reserved for
behavior alignment only). Watch-item: a non-MIT DeepSeek V5 collapses the swap strategy to API-only.

**Serving stack of record (for P4/P5):** SGLang + LiteLLM Anthropic-shim on CUDA; ds4/llama.cpp
fork on Apple silicon (experimental, single-stream); vLLM fallback-only until its V4-Flash FP8/EP
and quantized tool-token parser issues close; Ollama only for small models on the Mac Mini.

**Revisit triggers:** M5 Ultra ships ≥256 GB · DeepSeek V5 / any home-sized model closing the
agentic gap · Mac serving gains production batching for the V4 architecture · cloud planning spend
materially exceeds ~$200/month · re-research clock (2026-06-26) on any active phase.

## Consequences

- **Positive:** No quality regression risk to the judgment-heavy half of the pipeline; ~$6k+ capex
  deferred until it's justified by Artemis or a passed gate; the eval harness and RAG index are
  useful in every future; the decision is reversible by a measured gate rather than re-litigation.
- **Negative:** Cloud dependency (and ~$120–270/month spend) continues; the "100% local" end-state
  is postponed indefinitely if DeepSeek never ships a home-sized near-Pro planner; two stacks to
  understand during the shadow phase.
- **Risks:** Terminal-Bench evidence is single-source (gate measures directly); quantized
  tool-calling fidelity unknown (gate #2); DeepSeek licensing drift (watch-item); HDD/Apple price
  volatility on P3 timing.

## Sources
Per-claim citations in `docs/research/local-inference/ws-a…f.md`. Headline: DeepSeek API docs &
HF model cards (V4 lineup, MIT), kilo.ai/verdent.ai (Terminal-Bench 2.0), arXiv:2505.02390 (quant
tax), vLLM #43648 / #19001 + SGLang day-0 posts (serving), Claude Code LLM Gateway docs (harness),
Apple/Tom's Hardware (M3 Ultra 256 GB $5,999; 512 GB discontinued), WS-F break-even math
(~26–60 months, Mac path).
