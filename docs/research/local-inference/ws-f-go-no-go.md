# Research: WS-F — Go/no-go + economics

**Date:** 2026-06-12
**Confidence:** Medium — cloud-vs-cloud benchmark data is well-sourced; quantization-loss and local-throughput data is thinner (community reports, emerging). Self-consistency reliability gap is the most significant uncertain factor.

---

## Summary

**Provisional per-tier verdict:**

| Tier | Model fit | Quality risk | Break-even | Verdict |
|------|-----------|-------------|------------|---------|
| Entry (~$3–5k, 2×RTX 4090, ~48 GB VRAM) | V4-Flash Q4_K_M only | HIGH — planning quality below threshold; agentic reliability gap 11 pp on complex tasks | N/A — quality gate fails | **NO-GO for planning** (coding: conditional yes) |
| Balanced (~$8–12k, 4×RTX 4090, ~96 GB VRAM) | V4-Flash FP8 or Q6_K | MEDIUM — Flash closes to within ~2 pp on SWE-bench; autonomous multi-step still 11 pp behind Pro | ~18–22 months vs Max 5x | **CONDITIONAL — pass eval gate first** |
| Headroom (~$15–20k+, 8×H200 or equivalent) | V4-Pro FP8 | LOW — 80.6% SWE-bench (Pro), near-Claude Opus 4.6 (80.8%) on coding; planning gap real but narrowing | ~30–40 months (capex-heavy) | **NO-GO on economics alone** — enterprise hardware cost dwarfs plausible savings |

**Core finding:** The gating risk is real. Cloud DeepSeek weights are competitive with Claude on coding but trail on autonomous multi-step planning/reasoning consistency. Quantized local V4-Flash is the only economically tractable local path; it further widens that gap. Run the eval gate before committing. If the eval passes at balanced tier, break-even at ~18–22 months vs a Max 5x plan is achievable and reasonable.

---

## Key findings

### Model landscape (current, 2026-06-12)

- Current DeepSeek flagship coding model: **V4-Flash** (284B MoE, ~15B active params, released April 24 2026, MIT-derived license) [VERIFIED — https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash]
- Current DeepSeek flagship reasoning/planning: **V4-Pro** (1.6T MoE, released April 27 2026) [VERIFIED — https://www.morphllm.com/deepseek-v4]
- Both open-weight, commercially permissible [VERIFIED — https://www.buildmvpfast.com/blog/deepseek-v4-open-weight-moe-model-self-hosted-2026]

### Quality: cloud DeepSeek vs Claude (weights capability — no quantization loss yet)

- **SWE-bench Verified:** DeepSeek V4-Pro 80.6% vs Claude Opus 4.6 80.8% — essentially tied on coding [VERIFIED — search results citing vendor benchmarks and https://codersera.com/blog/deepseek-v4-pro-review-benchmarks-pricing-2026/]
- **SWE-bench, V4-Flash:** 79.0% — 1.6 pp behind Pro [VERIFIED — https://benchlm.ai/models/deepseek-v4-flash]
- **Terminal-Bench 2.0 (autonomous agentic):** V4-Pro 67.9% vs V4-Flash 56.9% — 11 pp gap [VERIFIED — https://blog.kilo.ai/p/we-tested-deepseek-v4-pro-and-flash]
- **Claude vs DeepSeek on planning consistency:** Claude Opus 4.6 identified "second-order effects other models missed"; practitioners report Claude has notably more self-consistency in multi-step autonomous runs — V4-Pro is "more likely to lose track of earlier-stated constraints" [COMMUNITY — https://www.datastudios.org/post/claude-vs-deepseek-for-coding-full-2026-comparison-agent-workflows-benchmarks-pricing-and-repo; https://andrew.ooo/answers/deepseek-v4-self-hosted-vs-api-april-2026/]
- **GPQA Diamond:** V4-Pro 86.2 — competitive with frontier [COMMUNITY — search aggregation]
- **MATH-500:** V4-Pro 92.8 — leads all models [COMMUNITY — search aggregation]
- **MCP Atlas tool selection accuracy:** DeepSeek above 80%, same band as Claude [COMMUNITY — https://decodethefuture.org/en/deepseek-r2-explained/]
- **Bottom line on cloud weights:** V4-Pro is nearly Claude-level on coding; planning/spec consistency gap is real but not catastrophic — agentic reliability is the key discriminator

### Quality: local quantized vs cloud full-precision (quantization tax)

- **FP8/INT8 large models:** 97%+ accuracy recovery on reasoning benchmarks [VERIFIED — https://developers.redhat.com/articles/2025/03/03/deployment-ready-reasoning-quantized-deepseek-r1-models]
- **Q4_K_M (INT4):** ~97%+ recovery on 7B+ models on standard benchmarks; reasoning-specific benchmarks show more degradation [VERIFIED — https://arxiv.org/html/2505.02390v1]
- **V4-Flash Q4_K_M on 4×4090 (96 GB):** Community reports note "notable quality loss on reasoning tasks" for INT4 path [COMMUNITY — https://knightli.com/en/2026/05/01/deepseek-v4-local-vram-quantization-table/]
- **V4-Flash Q6_K (~48 GB) or FP8 (~80 GB):** "Negligible quality loss" — the preferred local quant if hardware allows [COMMUNITY — https://chatgptaihub.com/deepseek-v4-self-hosting-guide/]
- **V4-Pro local:** Requires 8×H200 for FP8 or community AWQ INT4 with ~5% quality loss; at that scale self-hosting economics collapse ($500k–$1M hardware) [VERIFIED — hardware cost research; https://lushbinary.com/blog/deepseek-v4-self-hosting-guide-vllm-hardware-deployment/]
- **ds4 engine (antirez):** V4-Flash custom 2-bit mix on 128 GB Mac — validated against official logits, no looping issues in agent mode [COMMUNITY — https://github.com/antirez/ds4]
- **Compounding gap:** Cloud-vs-local quantization loss (modest for Q6_K, meaningful for Q4) sits on top of the already-real cloud-DeepSeek-vs-Claude planning gap — the two losses compound for planning tasks

### Throughput at relevant tiers

- **Entry (2×RTX 4090, 48 GB, offloaded):** < 5 tokens/sec (1.58-bit with RAM offload); effectively unusable for interactive planning [VERIFIED — https://unsloth.ai/blog/deepseekr1-dynamic]
- **Balanced (4×RTX 4090, 96 GB):** V4-Flash Q4_K_M — community estimates 2–5× slower than single H100; rough estimate 8–15 tok/s [ASSUMED — extrapolated from available data]
- **Headroom (Mac M4 Ultra 192 GB):** V4-Flash Q4 at ~40 tok/s on M4 Ultra [COMMUNITY — https://tokenmix.ai/blog/deepseek-for-mac-local-setup-2026]
- **Note:** The user's target machine is a Mac Mini (being bought) — M4 Ultra Mac Studio (192 GB) runs V4-Flash at viable speed; this is the more relevant tier than RTX builds for this specific deployment

---

## Hands-on eval design

**Purpose:** Before committing to local, run this gate to verify quality is acceptable for the APEX pipeline's planning half.

### Eval corpus (build once, reuse across sessions)

Build a 20-task corpus drawn from real APEX pipeline work:

**Planning tasks (10 tasks):**
1. Write a spec from a natural-language requirement (3 variants: simple, ambiguous, multi-file)
2. Review a draft spec and identify gaps/ambiguities (2 variants)
3. Make an architecture decision: given two approaches, recommend one with rationale (2 variants)
4. Identify the correct files to modify for a cross-cutting change (1 task)
5. Split an over-scoped spec into two appropriately scoped specs (1 task)
6. Detect a contradiction in requirements and surface it (1 task)

**Coding tasks (10 tasks):**
1. Implement a spec step (3 variants: straightforward, multi-file, edge-case)
2. Fix a bug given a description and file (2 variants)
3. Tool-call fidelity: complete a task requiring 3+ sequential tool calls without losing state (2 variants)
4. Long-context: read a 50k-token context and answer a precise question about it (1 task)
5. Regenerate after a mid-run correction without repeating work (2 variants)

### Scoring method

For each task, collect both:
- **Cloud reference output:** current Claude Sonnet 4.6 (planning tasks) or cloud DeepSeek V4-Flash API (coding tasks) — treat as gold standard
- **Local candidate output:** local quantized model

Score on 4 dimensions (1–5 each):
| Dimension | What to check |
|-----------|--------------|
| Completeness | All required elements present |
| Correctness | No factual/logical errors or contradictions |
| Self-consistency | Later outputs don't contradict earlier ones in multi-turn |
| Tool fidelity | Correct tool called, correct arguments, no hallucinated tool names |

**Pass threshold:** average ≥ 3.8/5 across all 20 tasks, no individual dimension below 3.0. If planning tasks specifically average below 3.5, do not migrate planning.

### Long-context specific test

Pass a 60k-token APEX skill context (full skill suite) and ask: "Which skill handles multi-agent orchestration?" — verify the model cites the right file. Repeat with a deliberately buried constraint in a spec and verify the model honours it 8 turns later.

### Tool-calling fidelity test

Run a simulated 5-step apex-code-like agent loop with tool definitions injected. Count: (a) correct tool name; (b) correct argument schema; (c) no spurious tool calls. Target: ≥ 90% fidelity across 20 calls.

**Time budget:** ~4 hours to run the eval after corpus setup.

---

## Economics + break-even

### Current cloud baseline spend (monthly)

**Planning (Claude):**
- Claude Code Max 5x subscription: $100/month [VERIFIED — https://www.finout.io/blog/claude-code-pricing-2026]
- Heavy users (multi-agent workflows all day) may need Max 20x at $200/month or face API overages [VERIFIED — https://www.ssdnodes.com/blog/claude-code-pricing-in-2026-every-plan-explained-pro-max-api-teams/]
- API direct billing for heavy agentic use: $100–$200/month based on practitioner reports [COMMUNITY — https://www.morphllm.com/ai-coding-costs]
- Planning baseline assumption: **$100–$200/month** (single developer pipeline, not a team)

**Coding (DeepSeek API):**
- V4-Flash API: $0.14/M input, $0.28/M output [VERIFIED — https://www.cloudzero.com/blog/deepseek-pricing/]
- V4-Pro API: $1.74/$3.48/M standard; currently ~$0.44/$0.87 at 75% promo discount [VERIFIED — https://costgoat.com/pricing/deepseek-api]
- For a solo developer running an APEX-class pipeline: estimated 5–20M tokens/month coding usage → $1–$6/month at V4-Flash rates
- Coding baseline assumption: **$5–$20/month** (V4-Flash), **$20–$70/month** (V4-Pro cloud)
- **Total current cloud baseline: ~$120–$270/month** for a solo developer

### Local capex + opex

**Tier assumptions (deferring exact hardware specs to WS-B):**

| Tier | Hardware | All-in capex estimate | Monthly power (50% utilization) |
|------|----------|----------------------|--------------------------------|
| Entry (~$3–5k) | 2×RTX 4090 workstation | $8–15k actual (GPUs now $2,500–$3,775 ea) [VERIFIED] | 2×575W × 50% × 730h × $0.18/kWh = ~$75/mo |
| Balanced (~$8–12k) | 4×RTX 4090 or equivalent | $15–20k realistic (GPU premium + Threadripper + dual PSU) [VERIFIED — https://medium.com/@danny_54172] | 4×575W × 50% × 730h × $0.18/kWh = ~$150/mo |
| Mac M4 Ultra | Mac Studio / Mac Mini Ultra ~192 GB | $5–8k (Apple pricing) [ASSUMED — Apple pricing not verified] | ~100W × 730h × $0.18/kWh = ~$13/mo |

Note: RTX 4090 is now end-of-life, priced $2,500–$3,775 each as of 2026 [VERIFIED — https://electronics.alibaba.com/question/rtx-4090-price-guide-why-it%E2%80%99s-$2,500%E2%80%93$3,700+-in-2026]. Original WS-B "entry ~$3–5k" anchor understates realistic GPU-cluster cost significantly.

**Electricity rate used:** $0.18/kWh (US average 2026: $0.176–$0.188/kWh) [VERIFIED — https://www.electricchoice.com/electricity-prices-by-state/]

### Break-even calculation

Formula: `break-even months = capex / (monthly_cloud_savings - monthly_opex)`

Monthly cloud savings if fully local = $120–$270/month (baseline eliminated)
Conservative case: $120/month savings; optimistic: $270/month savings

| Tier | Capex | Monthly opex (power) | Savings/mo (conservative) | Savings/mo (optimistic) | Break-even conservative | Break-even optimistic |
|------|-------|----------------------|--------------------------|------------------------|------------------------|-----------------------|
| Entry RTX 2×4090 | $12k | $75 | $45 net | $195 net | 267 months — never viable | 62 months |
| Balanced RTX 4×4090 | $18k | $150 | $-30 net (upside down) | $120 net | Never — opex exceeds savings at low use | 150 months |
| Mac M4 Ultra | $6.5k | $13 | $107 net | $257 net | **61 months** | **25 months** |
| Mac M4 Ultra (Max 20x plan, $200/mo) | $6.5k | $13 | $187 net | $257 net | **35 months** | **25 months** |

**Key insight:** The Mac M4 Ultra path (the user's stated plan per project memory) is the only tier where break-even is plausible under ~36 months. The RTX GPU cluster path is economically upside-down at solo-developer usage volumes unless cloud spend is significantly higher than estimated.

**If the user already has a Mac Mini M4 (standard, ~64–128 GB):** can run V4-Flash at Q4 (~40 GB) but at degraded speed (~11–14 tok/s); opex ~$8/month. At $6k sunk cost, break-even ~56 months at conservative savings. Still marginal.

---

## Risk register + rollback

### Risk register

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|------------|
| **Quality regression — planning** | HIGH | HIGH (based on evidence) | Eval gate before migration; keep Claude Max active for 3 months post-migration as fallback |
| **Quantization compounds planning gap** | HIGH | MEDIUM-HIGH | Use Q6_K or FP8 only; do not use Q4 for planning tasks |
| **Single-box failure (no redundancy)** | HIGH | MEDIUM | Keep cloud API keys active; env var proxy switch (30 min to restore) |
| **Model currency drift** | MEDIUM | HIGH | DeepSeek ships major versions ~every 3–4 months; local version will lag cloud; budget 4–8h/quarter for updates |
| **Context cap locally** | MEDIUM | MEDIUM | V4-Flash supports 1M context locally in ds4/vLLM — matches cloud, but KV cache RAM is a real constraint at 96 GB |
| **Tool-call reliability** | MEDIUM | MEDIUM | ds4 reports zero looping; but formal APEX multi-agent loop not tested — run tool-fidelity eval |
| **Maintenance time tax** | MEDIUM | HIGH | Self-hosted LLM requires OS updates, driver updates, weight updates, serving stack troubleshooting — budget ~2 hrs/week |
| **DeepSeek geopolitical/availability risk** | LOW-MED | LOW | Open weights are already downloaded; local inference is immune to API outages and restrictions once weights are on-device |
| **Power/thermal in home environment** | LOW | MEDIUM | 4×4090 draws ~2.3 kW sustained — requires dedicated circuit; Mac is ~100W total — non-issue |

### Rollback path

**Design for zero-downtime fallback:**
1. Keep `ANTHROPIC_BASE_URL` switchable via env var (already the APEX design)
2. Maintain active Claude Code Max subscription for 3 months post-migration minimum
3. Maintain DeepSeek cloud API key with $20 credit pre-loaded
4. Proxy architecture: local inference server exposes OpenAI-compatible endpoint; routing layer (1 env var) directs to local vs cloud
5. If local underperforms on a specific task: fall back per-task, not wholesale — hybrid routing (local for coding, cloud for planning) is a valid stable state

**Hybrid state as a destination (not just fallback):**
Given the evidence, a stable long-term architecture may be:
- Planning: remain on Claude cloud (Max 5x $100/month) — judgment quality justifies cost
- Coding: local V4-Flash (already using DeepSeek cloud for this; local saves $5–$20/month — marginal)
- Net saving from full migration: modest unless Claude spend is higher than baseline

---

## Assumptions & gaps

### Assumptions made (ASSUMED tags)
- Solo developer pipeline (not a team); monthly token volume extrapolated from public practitioner reports
- Mac M4 Ultra pricing estimated at $5–8k (Apple Silicon pricing not directly verified)
- "Balanced tier" GPU cluster capex revised upward from WS-B's stated $8–12k anchor to $15–20k based on current RTX 4090 market prices — WS-B should validate
- Local throughput for 4×4090 V4-Flash is extrapolated; no direct benchmark found for that exact config

### Key gaps (request parallel workstreams to fill)
- **WS-A:** Confirm exact model identifier for "flagship reasoning" and "coding-tier" in the local context (V4-Pro vs V4-Flash vs a distilled variant); confirm which quant level is realistic at balanced tier
- **WS-B:** Confirm realistic hardware cost for balanced tier; validate whether Mac M4 Ultra is the actual target machine
- **WS-C:** Confirm serving stack (vLLM vs ds4 vs llama.cpp) and whether token throughput at balanced tier meets interactive use (need ≥ 10 tok/s for usable planning experience)
- **Missing benchmark:** No published head-to-head comparing *local quantized V4-Flash* specifically on multi-step spec-writing tasks against Claude — this is the exact gap the hands-on eval must fill
- **Self-consistency under long agentic runs:** The practitioner report about V4-Pro losing constraint tracking is from a single community source; needs corroboration

---

## Sources

- [DeepSeek R2 / V4 benchmarks vs Claude](https://decodethefuture.org/en/deepseek-r2-explained/)
- [DeepSeek V4 vs Claude Opus 4.6 vs GPT-5.5 (Verdent)](https://www.verdent.ai/guides/deepseek-v4-vs-claude-opus-4-6-vs-gpt-5-5)
- [LLM Benchmark Leaderboard 2026: SWE-bench (CodeSOTA)](https://www.codesota.com/llm)
- [DeepSeek Coding Agent 2026: Reasonix vs Claude Code (Totalum)](https://www.totalum.app/blog/deepseek-coding-agent-totalum-2026)
- [Best Open-Source LLMs for Agentic Coding 2026 (MindStudio)](https://www.mindstudio.ai/blog/best-open-source-llms-agentic-coding-2026)
- [Quantitative Analysis of Performance Drop in DeepSeek Quantization (arXiv)](https://arxiv.org/html/2505.02390v1)
- [Deployment-ready reasoning with quantized DeepSeek-R1 (Red Hat)](https://developers.redhat.com/articles/2025/03/03/deployment-ready-reasoning-quantized-deepseek-r1-models)
- [Run DeepSeek-R1 Dynamic 1.58-bit (Unsloth)](https://unsloth.ai/blog/deepseekr1-dynamic)
- [Running DeepSeek R1 Locally: Hardware, Quantization, Throughput (Groundy)](https://groundy.com/articles/running-deepseek-r1-locally-hardware-requirements-quantization-and-real-throughput/)
- [Claude Code Pricing 2026 (Finout)](https://www.finout.io/blog/claude-code-pricing-2026)
- [Claude Pricing: Every Plan and API Cost May 2026 (mem0)](https://mem0.ai/blog/anthropic-claude-pricing)
- [Claude Code Pricing in 2026: Every Plan Explained (SSD Nodes)](https://www.ssdnodes.com/blog/claude-code-pricing-in-2026-every-plan-explained-pro-max-api-teams/)
- [AI Coding Costs 2026: Token Math (morphllm)](https://www.morphllm.com/ai-coding-costs)
- [DeepSeek API Pricing 2026 (CloudZero)](https://www.cloudzero.com/blog/deepseek-pricing/)
- [DeepSeek API Pricing — All Models (pricepertoken)](https://pricepertoken.com/pricing-page/provider/deepseek)
- [DeepSeek API Pricing Calculator (costgoat)](https://costgoat.com/pricing/deepseek-api)
- [DeepSeek V4 Pro and Flash vs Claude Opus 4.7 (Kilo.ai)](https://blog.kilo.ai/p/we-tested-deepseek-v4-pro-and-flash)
- [DeepSeek V4 Flash Benchmarks (BenchLM)](https://benchlm.ai/models/deepseek-v4-flash)
- [DeepSeek V4 Pro vs Flash: Benchmarks (Codersera)](https://codersera.com/blog/deepseek-v4-pro-vs-flash/)
- [DeepSeek V4 Flash Benchmarks vs Pro (AICybr)](https://aicybr.com/blog/deepseek-v4-pro-flash-complete-guide)
- [Claude vs DeepSeek for Coding Full 2026 (DataStudios)](https://www.datastudios.org/post/claude-vs-deepseek-for-coding-full-2026-comparison-agent-workflows-benchmarks-pricing-and-repo)
- [Claude Opus 4.7 vs DeepSeek V4 (DataCamp)](https://www.datacamp.com/blog/deepseek-v4-vs-claude-opus-4-7)
- [DeepSeek V4-Pro Self-Hosted vs API April 2026 (andrew.ooo)](https://andrew.ooo/answers/deepseek-v4-self-hosted-vs-api-april-2026/)
- [Self-Hosting DeepSeek V4 vLLM Hardware Guide (Lushbinary)](https://lushbinary.com/blog/deepseek-v4-self-hosting-guide-vllm-hardware-deployment/)
- [DeepSeek V4 Local VRAM Quantization Table (knightli)](https://knightli.com/en/2026/05/01/deepseek-v4-local-vram-quantization-table/)
- [DeepSeek V4 Self-Hosting Guide Pro vs Flash (chatgptaihub)](https://chatgptaihub.com/deepseek-v4-self-hosting-guide/)
- [DeepSeek V4 Pro Ollama 1.6T Local (justoborn)](https://justoborn.com/deepseek-v4-pro-ollama/)
- [ds4 Local Inference Engine GitHub (antirez)](https://github.com/antirez/ds4)
- [DeepSeek V4 Flash ds4 on Mac (Flowtivity)](https://flowtivity.ai/blog/deepseek-v4-flash-ds4-local-inference-128gb-mac/)
- [RTX 4090 Price Guide 2026 (Alibaba/Electronics)](https://electronics.alibaba.com/question/rtx-4090-price-guide-why-it%E2%80%99s-$2,500%E2%80%93$3,700+-in-2026)
- [AI Workstation Build Guide H100 vs 4090 vs 4×4090 (Medium)](https://medium.com/@danny_54172/the-definitive-ai-workstation-build-guide-h100-vs-4090-vs-4x-4090-e8033f9777fd)
- [Local LLM Power Consumption 2026 RTX 4090 (PromptQuorum)](https://www.promptquorum.com/local-llms/local-llm-power-consumption)
- [AI Inference Power Consumption 2026 (Spheron)](https://www.spheron.network/blog/ai-inference-power-electricity-cost-2026/)
- [Electricity Rates by State June 2026 (ElectricChoice)](https://www.electricchoice.com/electricity-prices-by-state/)
- [Mac Mini M4 DeepSeek R1 Benchmarks (like2byte)](https://like2byte.com/mac-mini-m4-deepseek-r1-ai-benchmarks/)
- [DeepSeek for Mac Local Setup 2026 (TokenMix)](https://tokenmix.ai/blog/deepseek-for-mac-local-setup-2026)
- [DeepSeek-V3 20 tok/s on Mac Studio (VentureBeat)](https://venturebeat.com/ai/deepseek-v3-now-runs-at-20-tokens-per-second-on-mac-studio-and-thats-a-nightmare-for-openai)
- [Self-Hosted LLM Costs 2026 (SitePoint)](https://www.sitepoint.com/self-hosted-llm-costs-2026/)
- [DeepSeek V4 Pro Review 80.6% SWE-bench (Codersera)](https://codersera.com/blog/deepseek-v4-pro-review-benchmarks-pricing-2026/)
- [DeepSeek V4 1.6T Architecture Benchmarks Pricing (morphllm)](https://www.morphllm.com/deepseek-v4)
- [DeepSeek HuggingFace V4 Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)
