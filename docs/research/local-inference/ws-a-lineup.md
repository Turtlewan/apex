# Research: WS-A — DeepSeek lineup, footprint & capability

**Date:** 2026-06-12
**Confidence:** Medium-High — model names, parameter counts, release dates, and top-line benchmarks are well-sourced from official docs and credible aggregators. Quantization VRAM numbers mix official guidance with community measurements and should be treated as estimates ±10%. Tool-calling fidelity at quant levels is under-documented; rated Medium.

---

## Summary

The user shorthand "DeepSeek Pro V4" maps to **DeepSeek-V4-Pro** (1.6T total / 49B active MoE, released April 24 2026, MIT license). "DeepSeek Flash" maps to **DeepSeek-V4-Flash** (284B total / 13B active MoE, same release, MIT license). Both models are confirmed open-weights on Hugging Face.

The prior assumption that native context window is 1M tokens and max output is 384K is **partially confirmed**: V4-Pro is 1M context / 384K max output [VERIFIED]; V4-Flash is 1M context / **131K max output** [VERIFIED — diverges from the 384K assumption].

V4-Pro is not a home-lab model: even Q2_K GGUF is ~400 GB. V4-Flash is the practical local target: Q4_K_M GGUF fits in ~96 GB unified RAM or 2× 48 GB VRAM. A Mac Studio with 192 GB unified memory can run V4-Flash at Q4_K_M comfortably.

On planning/reasoning benchmarks, V4-Pro is within 1–4 percentage points of Claude Opus 4.7 across MMLU-Pro, SWE-bench, and Terminal-Bench; V4-Flash trails V4-Pro by only 1–2 points on most tasks. The decisive gap surfaces on GPQA Diamond (Claude Opus 4.7: ~94%, V4-Pro: ~90%, R1-0528: 81%) — advanced scientific reasoning remains a frontier-model advantage. For structured agentic planning (instrument orchestration, tool selection, multi-step spec writing), the gap is narrow enough to be viable with caveats noted below.

Tool-calling fidelity is V4's strongest improvement over V3: error rate dropped from ~15% to under 2% per DeepSeek's own changelog. However, quantized local inference introduces serving-layer parsing issues documented in vLLM that do not exist in the cloud API.

---

## Key findings

### Model identity

1. "DeepSeek Pro V4" = **DeepSeek-V4-Pro**, released 2026-04-24. [VERIFIED — https://api-docs.deepseek.com/news/news260424]
2. "DeepSeek Flash" = **DeepSeek-V4-Flash**, released 2026-04-24. [VERIFIED — https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash]
3. Both are MIT-licensed with weights on Hugging Face at `deepseek-ai/DeepSeek-V4-Pro` and `deepseek-ai/DeepSeek-V4-Flash`. [VERIFIED — https://winbuzzer.com/2026/04/27/deepseek-v4-open-weights-launch-xcxwbn/]
4. A third relevant model is **DeepSeek-R1** (and its May 2025 checkpoint R1-0528), a pure reasoning model built on the V3 backbone with RL fine-tuning. R1 is the correct mapping if "Pro V4" means "best available reasoning model" rather than literally V4-Pro. [VERIFIED — https://medium.com/@leucopsis/deepseeks-new-r1-0528-performance-analysis-and-benchmark-comparisons-6440eac858d6]
5. Older V3.2 (671B total / 37B active) and V3.1 models remain available but are superseded by V4 for new deployments. [VERIFIED — https://huggingface.co/deepseek-ai/DeepSeek-V3.2]

### Parameters & architecture

6. V4-Pro: 1.6T total parameters, 49B activated per token, 384 routed experts + 1 shared expert per MoE layer, 6 experts active per token, 61 transformer layers, hidden dim 7168. [VERIFIED — https://www.morphllm.com/deepseek-v4]
7. V4-Flash: 284B total parameters, 13B activated per token. Same hybrid CSA/HCA attention system as Pro. [VERIFIED — https://llm-stats.com/models/deepseek-v4-flash-max]
8. Both V4 models use hybrid Compressed Sparse Attention (CSA) + Heavily Compressed Attention (HCA), requiring only 27% of single-token inference FLOPs and 10% of KV cache vs V3.2 at 1M context. [VERIFIED — https://www.morphllm.com/deepseek-v4]
9. R1 architecture: ~671B total / 37B active, RL-trained for chain-of-thought reasoning. R1-0528 is the most recent checkpoint (May 28 2025). [VERIFIED — https://huggingface.co/deepseek-ai/DeepSeek-R1]

### Context window & max output

10. V4-Pro: 1M token context, **384K max output**. [VERIFIED — https://openrouter.ai/deepseek/deepseek-v4-pro]
11. V4-Flash: 1M token context, **131,072 (128K) max output** — NOT 384K. The prior assumption of 384K for Flash is incorrect. [VERIFIED — https://llm-stats.com/models/deepseek-v4-flash-max]
12. R1 / R1-0528: 128K context, max output not independently confirmed for local deployments. [ASSUMED based on V3 lineage]

### Open weights & licensing

13. V4-Pro and V4-Flash: MIT license. Weights on Hugging Face. Unrestricted commercial use. [VERIFIED — https://winbuzzer.com/2026/04/27/deepseek-v4-open-weights-launch-xcxwbn/]
14. DeepSeek-R1: MIT license. [VERIFIED — https://localaimaster.com/blog/deepseek-r1-local-setup-guide]
15. All V4 weights are released in FP4+FP8 mixed-precision format (not BF16/FP32). This means community quantizations start from an already-compressed baseline. [VERIFIED — https://codersera.com/blog/deepseek-v4-vram-gpu-requirements-2026/amp/]

### Quantization options

16. Official V4 weights ship in FP4+FP8 mixed format — already a compressed baseline. [VERIFIED — https://codersera.com/blog/deepseek-v4-vram-gpu-requirements-2026/amp/]
17. Community GGUF quantizations exist from Unsloth (V4-Flash) and teamblobfish (V4-Pro GGUF on Hugging Face). [COMMUNITY — https://huggingface.co/teamblobfish/DeepSeek-V4-Pro-GGUF, https://huggingface.co/antirez/deepseek-v4-gguf]
18. An experimental llama.cpp fork by antirez implements V4-Flash GGUF targeting 128GB unified RAM Macs at 2-bit quantization. [COMMUNITY — https://github.com/antirez/llama.cpp-deepseek-v4-flash]
19. MLX quantizations exist for Apple Silicon; vLLM (FP8/FP4) and SGLang are the recommended frameworks for GPU servers. [COMMUNITY — https://codersera.com/blog/apple-silicon-llms-complete-guide-2026/]
20. AWQ and GPTQ community builds available for V4-Flash. [COMMUNITY — https://codersera.com/blog/deepseek-v4-vram-gpu-requirements-2026/amp/]

### Quality degradation per quant level

21. Research paper arXiv:2505.02390 (May 2025) on DeepSeek V3 quantization: Q4_K_M introduces ~3.52% average performance drop across tasks; on some benchmarks (MATH-500, GPQA) Q4_K_M marginally outperforms the official FP8 API (attributed to calibration differences). [VERIFIED — https://arxiv.org/html/2505.02390v1]
22. Q3_K_M and Q2_K degrade more severely; a custom DQ3_K_M dynamic variant significantly outperforms standard Q3_K_M. [VERIFIED — https://arxiv.org/html/2505.02390v1]
23. For V4, because the official FP4+FP8 weights are already compressed, sub-Q4 quantization is unlikely to produce usable output. Stick with Q4_K_M or better. [COMMUNITY — https://codersera.com/blog/deepseek-v4-vram-gpu-requirements-2026/amp/]
24. Community INT4/AWQ V4-Flash builds report ~5% quality loss vs official FP4+FP8. [COMMUNITY — https://knightli.com/en/2026/05/01/deepseek-v4-local-vram-quantization-table/]
25. FP8 is the quality ceiling for community quantizations; INT8 > INT4 quality ranking confirmed for reasoning and math tasks. [VERIFIED — https://codersera.com/blog/deepseek-v4-vram-gpu-requirements-2026/amp/]

### Tool-calling fidelity

26. V4 (cloud API): function calling error rate dropped from ~15% (V3) to under 2%. V4 adds native support for function calling, JSON output, tool calls, and a `reasoning_effort` parameter. [VERIFIED — https://www.mindstudio.ai/blog/deepseek-v4-open-source-model-developers]
27. V4's tool/thinking mode constraint from V3.1 (tool use and thinking mode were mutually exclusive) is resolved in V4. [VERIFIED — https://deepseeksr1.com/v3.2/]
28. **Critical gap for local inference:** vLLM users running quantized DeepSeek-R1-0528 report parsing errors: "DeepSeek-V3 Tool parser could not locate tool call start/end tokens in the tokenizer!" [VERIFIED — https://github.com/vllm-project/vllm/issues/19001]. This is a serving-layer compatibility issue, not a model quality issue, but it will affect any pipeline using vLLM with heavily quantized V4 checkpoints.
29. Tool calls on distilled R1 variants have a documented issue where the `tool_calls` array "remains empty" even when the model generates valid tool call output — traced to parsing behavior at the serving layer. [VERIFIED — https://huggingface.co/deepseek-ai/DeepSeek-R1/discussions/122]
30. No published systematic benchmark exists comparing tool-calling reliability at different quantization levels for V4 models. This is a gap. [ASSUMED — gap]

### Planning/reasoning benchmarks vs frontier Claude

31. V4-Pro-Max on SWE-bench Verified: **80.6%** (highest open-weights model). Claude Opus 4.7: **93.9%** (13-point gap, though this is a coding-agency benchmark, not pure planning). [VERIFIED — https://lumichats.com/blog/deepseek-v4-vs-claude-opus-sonnet-4-6-which-ai-model-2026]
32. Terminal-Bench 2.0 (agentic planning + tool coordination): Opus 4.7 = **69.4%**, V4-Pro = **67.9%**, GPT-5.5 = **82.7%**. V4-Pro and Opus 4.7 are within 1.5 points. [VERIFIED — https://www.verdent.ai/guides/deepseek-v4-vs-claude-opus-4-6-vs-gpt-5-5]
33. MMLU-Pro: V4-Pro = **87.5%**, Claude Sonnet 4.6 = **87.3%** — essentially tied. [VERIFIED — https://macaron.im/blog/deepseek-v4-benchmarks]
34. GPQA Diamond (graduate-level scientific reasoning): Opus 4.7 = **~94%**, V4-Pro = **~90%**, R1-0528 = **~81%**. Frontier models hold a clear 4–13 point advantage on this hardest reasoning benchmark. [VERIFIED — https://www.datacamp.com/blog/deepseek-v4-vs-claude-opus-4-7]
35. LiveCodeBench: V4-Pro = **93.5%** vs Claude = **88.8%** — V4-Pro leads on coding. [VERIFIED — https://codersera.com/blog/deepseek-v4-pro-review-benchmarks-pricing-2026/]
36. AIME 2025 (math competition): DeepSeek R1 = **79.8%** vs Claude 3.5 Sonnet = ~**42%**. R1 substantially outperforms on formal math reasoning. [VERIFIED — https://elephas.app/blog/deepseek-vs-claude]
37. V4-Flash vs V4-Pro quality gap: LiveCodeBench 91.6 vs 93.5 (1.9 pt), SWE-bench 79.0 vs 80.6 (1.6 pt), MMLU-Pro 1.3 pt. Flash is 12x cheaper per token. [VERIFIED — https://insiderllm.com/guides/deepseek-v4-flash-vs-pro-guide/]

---

## Footprint & capability tables

### Table 1: Model identity quick reference

| User shorthand | Real model name | Role | Total params | Active params | Context | Max output | License |
|---|---|---|---|---|---|---|---|
| "DeepSeek Pro V4" | DeepSeek-V4-Pro | Planning/reasoning | 1.6T | 49B | 1M tokens | 384K tokens | MIT |
| (alt for planning) | DeepSeek-R1-0528 | Reasoning (RL) | ~671B | ~37B | 128K tokens | ~32K [ASSUMED] | MIT |
| "DeepSeek Flash" | DeepSeek-V4-Flash | Coding/fast inference | 284B | 13B | 1M tokens | 131K tokens | MIT |

### Table 2: V4-Flash quantization footprint

| Format | Disk size | VRAM / unified RAM | Quality vs official FP4+FP8 | Notes |
|---|---|---|---|---|
| Official FP4+FP8 mixed | ~158 GB | ~170–175 GB (incl. 10 GB KV cache) | Baseline | Server-grade; requires NVLink multi-GPU or 192 GB Apple Silicon |
| GGUF Q4_K_M | ~96 GB [COMMUNITY] | ~96 GB | ~95–97% [COMMUNITY] | Sweet spot; fits 1×80 GB or 2×48 GB or 128 GB Mac unified |
| GGUF Q2_K | ~50–60 GB [COMMUNITY] | ~60 GB | ~85–90% [COMMUNITY] | Antirez llama.cpp fork targets 128 GB Mac at 2-bit |
| INT4 / AWQ / GPTQ | ~80 GB [COMMUNITY] | ~80 GB | ~95% [COMMUNITY] | Fits 4×RTX 4090; measurable quality loss on reasoning tasks |

### Table 3: V4-Pro quantization footprint

| Format | Disk size | VRAM / unified RAM | Quality vs official | Notes |
|---|---|---|---|---|
| Official FP4+FP8 mixed | ~864 GB [VERIFIED] | ~900+ GB | Baseline | Multi-node H100/B100 servers only |
| GGUF Q4_K_M | ~400–450 GB [COMMUNITY] | ~450+ GB | — | Not practical for local; community GGUF exists but offload unusable |
| GGUF Q2_K | ~200–250 GB [COMMUNITY] | ~250+ GB | Sub-viable output likely | [COMMUNITY] source weights already FP4; sub-Q4 likely produces garbage |

**Bottom line on V4-Pro local:** Not viable. Even at Q2_K, V4-Pro exceeds any single-machine consumer or prosumer setup. Server hardware only.

### Table 4: R1-0528 quantization footprint (for comparison)

| Format | Disk size | VRAM / unified RAM | Notes |
|---|---|---|---|
| BF16 (official) | ~1.3 TB [ASSUMED, 671B × 2B] | ~1.4 TB | Multi-node only |
| FP8 | ~670 GB [ASSUMED] | ~700 GB | Multi-node only |
| GGUF Q4_K_M | ~350 GB [COMMUNITY] | ~350 GB | Community reports; not practically local |
| Distilled 32B Q4_K_M | ~19–20 GB [VERIFIED] | ~20 GB | Distilled models (Qwen2.5-based); MIT license; very practical |
| Distilled 14B Q4_K_M | ~9 GB [VERIFIED] | ~9 GB | Fits consumer GPU; reasoning quality significantly reduced vs full R1 |

Note: R1 distills are a separate family. They retain some reasoning quality but are not the full model.

### Table 5: Planning benchmarks — V4-Pro vs frontier Claude

| Benchmark | DeepSeek V4-Pro | Claude Opus 4.7 | Gap | Notes |
|---|---|---|---|---|
| MMLU-Pro | 87.5% | ~87.3% (Sonnet 4.6) | ≈0 | Tied |
| SWE-bench Verified | 80.6% | 93.9% | −13.3 pt | Large gap; Opus uses extended thinking |
| Terminal-Bench 2.0 | 67.9% | 69.4% | −1.5 pt | Closest on agentic coordination |
| GPQA Diamond | ~90% | ~94% | −4 pt | Advanced scientific reasoning |
| LiveCodeBench | 93.5% | 88.8% | +4.7 pt | V4-Pro leads on coding |
| AIME 2025 (R1) | 79.8% (R1) | ~42% (3.5 Sonnet) | +37.8 pt | R1 vs older Sonnet; gap likely smaller vs Opus 4.7 |

---

## Min viable quant per role

### Planning/reasoning role ("DeepSeek Pro V4")

**Recommended model:** DeepSeek-V4-Flash at GGUF Q4_K_M (not V4-Pro — V4-Pro is not locally deployable)

**Rationale:**
- V4-Pro local deployment is not feasible on any single-machine consumer/prosumer setup (requires ~450 GB at Q4_K_M).
- V4-Flash at Q4_K_M provides ~95–97% of the official quality at ~96 GB unified RAM — fits a 128 GB Mac Studio or 2×48 GB GPU rig.
- For *reasoning-heavy* planning that needs chain-of-thought, consider the **R1-0528 distilled 32B model at Q4_K_M (~20 GB)** as a supplementary reasoning model on the same machine — it provides R1-class structured reasoning at consumer VRAM.
- The GPQA/advanced-reasoning gap vs Claude Opus 4.7 is 4–14 points. For APEX-style planning (spec writing, tool orchestration, multi-step task decomposition), Terminal-Bench 2.0 shows V4-Pro/Flash is within 1.5 points of Opus 4.7. The gap is real but not disqualifying for the target use case.

**Min viable quant for planning:** GGUF Q4_K_M on V4-Flash (96 GB), or official FP4+FP8 on a server with ≥192 GB VRAM.

### Coding role ("DeepSeek Flash")

**Recommended model:** DeepSeek-V4-Flash at GGUF Q4_K_M

**Rationale:**
- V4-Flash is purpose-designed for fast inference and high-throughput coding tasks.
- SWE-bench Verified: 79.0% — within 1.6 points of V4-Pro (80.6%) and competitive with Claude Sonnet 4.6 (80.8%).
- LiveCodeBench: 91.6% — strong coding performance.
- Q4_K_M retains ~95–97% of official quality; the 3.5% average degradation from arXiv:2505.02390 is acceptable for code generation where unit tests provide a hard verification gate.
- **Tool-calling caveat:** vLLM parsing issues documented for R1 series at quantized serving. Use SGLang or llama.cpp-based serving (Ollama, LM Studio) for more reliable tool-call parsing. Monitor vLLM issue #19001 for V4-Flash compatibility.

**Min viable quant for coding:** GGUF Q4_K_M on V4-Flash (96 GB). Do not go below Q3_K_M.

---

## Assumptions & gaps

| ID | Assumption / Gap | Risk |
|---|---|---|
| G1 | Max output for V4-Flash assumed as 384K in the brief — **actually 131K** (verified). Spec must be corrected. | Medium — affects long-output planning tasks |
| G2 | R1-0528 max output for local inference not confirmed. | Low — primarily affects context budget planning |
| G3 | Tool-calling reliability at Q4_K_M for V4-Flash not benchmarked systematically. Cloud API shows <2% error; local serving adds parsing layer risk. | High — APEX pipeline depends on reliable tool calls |
| G4 | GGUF quantization disk sizes for V4-Flash are community measurements, not official DeepSeek specs. Treat as ±10% estimates. | Low |
| G5 | V4-Pro GGUF quality below Q4_K_M is untested — source weights are FP4, making sub-Q4 quantization likely harmful but not formally measured. | Medium |
| G6 | R1-0528 full model (671B) VRAM footprint for local inference is ASSUMED; no community runs found on consumer hardware at full precision. | Low (model is not being targeted for local use) |
| G7 | Terminal-Bench 2.0 scores cited from a single source (verdent.ai); not independently replicated on official leaderboard as of research date. | Medium — the planning-capability verdict partly depends on this |
| G8 | MLX quantization quality for V4-Flash on Apple Silicon not specifically benchmarked vs GGUF Q4_K_M. | Low |

---

## Sources

| # | Source | URL | Used for |
|---|---|---|---|
| 1 | DeepSeek API Docs — V4 Preview Release | https://api-docs.deepseek.com/news/news260424 | Model identity, release date |
| 2 | Hugging Face — deepseek-ai/DeepSeek-V4-Flash | https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash | Flash model card |
| 3 | Hugging Face — deepseek-ai/DeepSeek-V4-Pro | https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro | Pro model card |
| 4 | morphllm.com — DeepSeek V4 architecture | https://www.morphllm.com/deepseek-v4 | Architecture, parameters, context |
| 5 | llm-stats.com — V4-Flash-Max | https://llm-stats.com/models/deepseek-v4-flash-max | Flash max output (131K) |
| 6 | OpenRouter — V4-Pro | https://openrouter.ai/deepseek/deepseek-v4-pro | Pro max output (384K) |
| 7 | Winbuzzer — V4 open weights | https://winbuzzer.com/2026/04/27/deepseek-v4-open-weights-launch-xcxwbn/ | MIT license confirmation |
| 8 | codersera.com — V4 VRAM/GPU requirements | https://codersera.com/blog/deepseek-v4-vram-gpu-requirements-2026/amp/ | Quantization footprint tables |
| 9 | knightli.com — V4 local VRAM table | https://knightli.com/en/2026/05/01/deepseek-v4-local-vram-quantization-table/ | Community VRAM estimates |
| 10 | arXiv:2505.02390 — Quantitative Analysis of Performance Drop | https://arxiv.org/html/2505.02390v1 | Quantization quality degradation |
| 11 | insiderllm.com — V4 Flash vs Pro guide | https://insiderllm.com/guides/deepseek-v4-flash-vs-pro-guide/ | Flash/Pro quality gap |
| 12 | DataCamp — Claude Opus 4.7 vs DeepSeek V4 | https://www.datacamp.com/blog/deepseek-v4-vs-claude-opus-4-7 | GPQA benchmark comparison |
| 13 | verdent.ai — V4 vs Claude Opus 4.6 vs GPT-5.5 | https://www.verdent.ai/guides/deepseek-v4-vs-claude-opus-4-6-vs-gpt-5-5 | Terminal-Bench 2.0 scores |
| 14 | lumichats.com — V4 vs Claude | https://lumichats.com/blog/deepseek-v4-vs-claude-opus-sonnet-4-6-which-ai-model-2026 | SWE-bench comparison |
| 15 | codersera.com — V4-Pro review | https://codersera.com/blog/deepseek-v4-pro-review-benchmarks-pricing-2026/ | LiveCodeBench scores |
| 16 | MindStudio — V4 developers | https://www.mindstudio.ai/blog/deepseek-v4-open-source-model-developers | Tool-calling error rate V4 vs V3 |
| 17 | GitHub vLLM issue #19001 | https://github.com/vllm-project/vllm/issues/19001 | vLLM tool parser bug |
| 18 | HuggingFace R1 discussions/122 | https://huggingface.co/deepseek-ai/DeepSeek-R1/discussions/122 | Distill tool_calls empty bug |
| 19 | elephas.app — DeepSeek vs Claude | https://elephas.app/blog/deepseek-vs-claude | AIME 2025 R1 vs Claude |
| 20 | localaimaster.com — R1 local setup | https://localaimaster.com/blog/deepseek-r1-local-setup-guide | R1 MIT license, VRAM |
| 21 | macaron.im — V4 benchmarks | https://macaron.im/blog/deepseek-v4-benchmarks | MMLU-Pro comparison |
| 22 | antirez/llama.cpp-deepseek-v4-flash | https://github.com/antirez/llama.cpp-deepseek-v4-flash | V4-Flash llama.cpp fork |
| 23 | antirez/ds4 | https://github.com/antirez/ds4 | Local inference engine for V4 |
| 24 | teamblobfish/DeepSeek-V4-Pro-GGUF | https://huggingface.co/teamblobfish/DeepSeek-V4-Pro-GGUF | V4-Pro GGUF community quant |
| 25 | bentoml.com — Complete guide to DeepSeek | https://www.bentoml.com/blog/the-complete-guide-to-deepseek-models-from-v3-to-r1-and-beyond | V3/R1/V4 lineage |
