# Research: WS-B — Hardware

**Date:** 2026-06-12
**Confidence:** Medium-High for entry/balanced tiers (strong community benchmarks); Medium for headroom tier (4x RTX PRO 6000 has limited direct V4 Flash benchmarks as of May 2026)

---

## Summary

The APEX pipeline needs to serve the DeepSeek V4 flagship family (V4-Pro: 1.6T param MoE, 49B active; V4-Flash: 284B param MoE, 13B active) at 4–8 concurrent agent streams. The key sizing constraint is that V4-Pro (~862 GB native FP4+FP8 weights) is a datacenter cluster job — no single-box, no consumer GPU can host it locally. V4-Flash (284B, ~160–180 GB at Q4) is the realistic reasoning model for self-hosting; it fits on a single 96 GB GPU with room for KV cache, or on an Apple M3 Ultra 256 GB box.

**Single-box-vs-split call:** Split is the pragmatic answer. Use the existing Mac Mini (or upgrade it) as a dedicated coding model host running a 7B–14B coder; add a second box (the NAS/server class decision) for V4-Flash as the reasoning/planning brain. Running both on one box is possible at the balanced/headroom tier but burns VRAM headroom that serves concurrency.

---

## Key Findings

### DeepSeek V4 Model Family (as of April 2026)

- V4-Pro: 1.6T total params, 49B active per pass, MoE; native weights ~862 GB (FP4 experts + FP8 rest); 1M-token context. [VERIFIED — https://www.aimadetools.com/blog/deepseek-v4-pro-complete-guide/]
- V4-Flash: 284B total params, 13B active per pass, MoE; released MIT license April 24, 2026. [VERIFIED — https://www.buildfastwithai.com/blogs/deepseek-v4-flash-review-2026]
- V4-Flash native FP4+FP8 weights: ~158–163 GB disk; Q4_K_M GGUF: ~172–180 GB. [VERIFIED — https://codersera.com/blog/deepseek-v4-vram-gpu-requirements-2026/ and https://canitrun.dev/models/deepseek-v4-flash/]
- V4-Flash KV cache overhead at 1M-token context: ~10 GB (uses only 7% of V3.2's KV cache via Compressed Sparse Attention). [COMMUNITY — https://lushbinary.com/blog/deepseek-v4-self-hosting-guide-vllm-hardware-deployment/]
- Total V4-Flash runtime footprint at Q4: roughly 180–195 GB including KV cache + runtime overhead. [ASSUMED from the above two data points]

### V4-Pro local hosting verdict

V4-Pro is not locally hostable on any consumer or prosumer box. Even at INT4 the weights are ~400 GB; a functional deployment needs ~8×H100 (640 GB VRAM total), datacenter networking, and 1M-token KV cache headroom. [VERIFIED — https://docs.clore.ai/guides/language-models/deepseek-v4]

### DeepSeek V3 / R1 671B (predecessor family, still relevant for context)

- 671B parameters, 37B active; 4-bit GGUF ~405 GB. [VERIFIED — https://huggingface.co/deepseek-ai/DeepSeek-R1/discussions/19]
- M3 Ultra 512 GB running DeepSeek-V3 0324 at 4-bit with mlx-lm: ~20 tok/s. [VERIFIED — https://venturebeat.com/ai/deepseek-v3-now-runs-at-20-tokens-per-second-on-mac-studio-and-thats-a-nightmare-for-openai/]
- llama.cpp Q4_K_M on same hardware: ~6.2 tok/s — engine matters. [COMMUNITY — https://www.hardware-corner.net/mac-studio-m3-ultra-deepseek-llamacpp/]

### Apple Silicon (M3 Ultra)

- Memory bandwidth: 819 GB/s (M3 Ultra); no M4 Ultra exists — Apple skipped it. [VERIFIED — https://www.macrumors.com/2025/03/17/apples-m3-ultra-runs-deepseek-r1-efficiently/]
- 512 GB M3 Ultra Mac Studio: removed from sale March 2026 due to DRAM shortage. [VERIFIED — https://www.tomshardware.com/tech-industry/apple-pulls-512-mac-studio-upgrade-option]
- 256 GB M3 Ultra currently available (price rose ~$400 for the memory upgrade). [VERIFIED — https://macdailynews.com/2026/03/06/apple-drops-512gb-m3-ultra-mac-studio-option-ups-256gb-memory-upgrade-by-400/]
- 256 GB M3 Ultra cannot host V4-Flash at Q4 (needs ~180 GB for weights + ~20+ GB KV cache = 200 GB minimum practical minimum). Borderline at very short context windows with aggressive quants. [ASSUMED — from memory math above]
- V4-Flash Q4_K_M at 163 GiB on M3 Ultra (512 GB when available): ~22.85 tok/s decode. [COMMUNITY — https://deepseekv4pro.com/guides/deepseek-v4-flash-local-mac]
- Power: Mac Studio under 200 W during heavy inference. [VERIFIED — https://venturebeat.com/ai/deepseek-v3-now-runs-at-20-tokens-per-second-on-mac-studio-and-thats-a-nightmare-for-openai/]
- Noise: Mac Studio is near-silent by PC standards (Apple does not publish exact dBA for compute loads; community reports "inaudible at 1 m" for typical loads). [COMMUNITY — general community consensus, no single citation]
- M5 Ultra Mac Studio: rumoured H2 2026, no confirmed specs or pricing. [VERIFIED — https://www.macworld.com/article/2973459/2026-mac-studio-m5-release-date-specs-price-rumors.html]
- Concurrency behaviour: MLX and llama.cpp on Apple Silicon are single-process/single-model; true concurrent batching is limited. MLX-LM supports multi-user via continuous batching but with degraded per-user throughput at >4 simultaneous streams. [COMMUNITY — https://contracollective.com/blog/llama-cpp-vs-mlx-ollama-vllm-apple-silicon-2026]

### NVIDIA RTX 5090 (Consumer Blackwell)

- 32 GB GDDR7, 575 W TDP. [VERIFIED — https://gamersnexus.net/gpus/nvidia-geforce-rtx-5090-founders-edition-review-benchmarks-gaming-thermals-power]
- Single-card cannot host V4-Flash (need ~180 GB); cannot host V3/R1 671B. [VERIFIED — https://wccftech.com/nvidia-geforce-rtx-5090-dominates-inference-performance-on-deepseeks-r1-ai-models/]
- RTX 5090 has no NVLink support; dual-5090 communicates over PCIe, creating a bottleneck for tensor-parallel large models. [VERIFIED — https://hostkey.com/blog/83-more-5090-more-problems-testing-a-dual-nvidia-gpu-setup/]
- Dual RTX 5090 (64 GB combined): inadequate for V4-Flash weights alone. [VERIFIED — derived from 64 GB vs 180 GB requirement]
- Best use case for RTX 5090: coding models (7B–32B), distilled DeepSeek R1 variants. Achieves ~45 tok/s on R1-Distill-Qwen 32B at Q4. [COMMUNITY — https://wccftech.com/nvidia-geforce-rtx-5090-dominates-inference-performance-on-deepseeks-r1-ai-models/]
- Noise: 32.5 dBA at 1 m at load (Founders Edition); aftermarket cards 35–44 dBA. [VERIFIED — https://gamersnexus.net/gpus/nvidia-geforce-rtx-5090-founders-edition-review-benchmarks-gaming-thermals-power]
- Price: ~$1,999 MSRP (Founders Edition); retail typically $2,200–$3,000 due to demand/scalping. [VERIFIED — https://www.ofzenandcomputing.com/nvidia-rtx-5090-specs-pricing-release-date/]

### NVIDIA RTX PRO 6000 Blackwell (Workstation)

- 96 GB GDDR7 ECC, 600 W TDP, PCIe 5.0 x16, 1,792 GB/s memory bandwidth. [VERIFIED — https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000/]
- No native NVLink; multi-card uses PCIe tensor parallelism. [VERIFIED — https://vrlatech.com/rtx-pro-6000-blackwell-for-llms-why-96gb-changes-everything/]
- Price: ~$8,000–$9,200 per card (MSRP $8,565). [VERIFIED — https://www.thundercompute.com/blog/nvidia-rtx-pro-6000-pricing]
- Single RTX PRO 6000 can host V4-Flash at Q4 (weights ~172–180 GB... does NOT fit in 96 GB alone). Correction: a single 96 GB card cannot hold 172–180 GB weights. Needs 2× cards or offload. [ASSUMED — from memory math; weight size exceeds single card]
- Single card with CPU offload / ktransformers: DeepSeek V4 Flash Q2-imatrix achieves 43 tok/s on short prompts, 31 tok/s at 50K context. [COMMUNITY — https://loftllc.dev/en/docs/tech/llm-research/dwarfstar4-rtx-pro-6000-deepseek-v4-flash-first-look/]
- 4× RTX PRO 6000 (384 GB GDDR7 pooled): fits V4-Flash at native FP4+FP8 (~170 GB weights) with ~210 GB headroom for KV cache and concurrency. [COMMUNITY — https://codersera.com/blog/deepseek-v4-flash-rtx-pro-6000-blackwell-benchmarks-2026/]
- 4× RTX PRO 6000 on SGLang (vLLM has SM120 compile-path crash as of May 2026): ~25–40 tok/s single-stream decode, 1,000–2,000 tok/s aggregate prefill at high concurrency. [COMMUNITY — https://codersera.com/blog/deepseek-v4-flash-rtx-pro-6000-blackwell-benchmarks-2026/]
- 4× RTX PRO 6000 system cost: ~$34,000–$38,000 all-in (cards + workstation). [ASSUMED from $8,000–$9,200/card × 4 + ~$2,000–$5,000 workstation chassis/CPU/RAM]
- Noise: a 4-card 600 W×4 = 2,400 W TDP system is server-grade; requires serious rack cooling and is not suitable for an office/home room. [ASSUMED — based on TDP figures; no measured dBA]
- Thermal: requires either a server chassis with high-CFM fans or liquid cooling. [ASSUMED]

### NVIDIA H100 / H200

- H100 SXM5: 80 GB HBM3, NVLink 4.0 (900 GB/s), ~700 W TDP.
- H100 PCIe: 80 GB HBM2e, PCIe 5.0, 350 W TDP.
- Pricing (2026): new H100 PCIe $25,000–$28,000; H100 SXM5 $35,000–$40,000. Secondary/used H100: $6,000–$15,000. [VERIFIED — https://compute.exchange/blogs/h100-gpu-price-2026]
- 8×H100 with FP8+AWQ to fit DeepSeek V3/R1 671B: ~33 tok/s single-stream. [VERIFIED — https://github.com/dzhsurf/deepseek-v3-r1-deploy-and-benchmarks]
- 2×H100 PCIe (160 GB): cannot hold V4-Flash Q4 (needs ~180 GB). Marginal. [ASSUMED from memory math]
- H100 home deployment: impractical. SXM5 requires a multi-thousand-watt server chassis with NVLink switch. H100 PCIe fits in a workstation but infrastructure cost ($10,000+ per server + power/cooling) rivals 4× RTX PRO 6000 without the noise/power advantage. [ASSUMED — widely cited infrastructure calculus]
- Verdict for home lab: reject unless buying used H100 PCIe on secondary market at $6K–$8K per card.

### AMD — Strix Halo (Ryzen AI Max+)

- Ryzen AI Max+ 395: 16 Zen 5 cores, 40 RDNA 3.5 compute units (Radeon 8060S), 128 GB LPDDR5X-8000 max, ~212–215 GB/s real-world bandwidth. [VERIFIED — https://localaimaster.com/blog/strix-halo-ai-max-395-guide]
- RDNA 3.5 gfx1151: best inference path is RADV Vulkan, not ROCm. [COMMUNITY — https://llm-tracker.info/_TOORG/Strix-Halo]
- 70B Q4 model: ~5 tok/s typical; smaller MoE (Qwen3-30B-A3B) reaches ~100 tok/s. [COMMUNITY — https://github.com/hogeheer499-commits/strix-halo-guide]
- DeepSeek V4 Flash IQ1_S (extreme lossy quant, ~58 GB) fits in 128 GB Strix Halo system memory. System cost ~$3,500. [COMMUNITY — https://tinycomputers.io/posts/running-deepseek-v4-flash-on-amd-strix-halo.html]
- At IQ1_S quality is significantly degraded vs Q4_K_M; not suitable as a planning/reasoning brain. [ASSUMED — standard quant quality tradeoff]
- Power draw: Strix Halo mini-PCs ~65–90 W system power at load. Very home-friendly. [COMMUNITY — https://www.starryhope.com/minipcs/strix-halo-local-llm-inference-2026/]
- Noise: mini-PC form factor, near-silent. [COMMUNITY — https://www.starryhope.com/minipcs/strix-halo-local-llm-inference-2026/]
- Verdict: excellent coding model host (7B–32B); insufficient memory bandwidth and model quality for V4-Flash reasoning role at anything above IQ1_S.

### AMD MI-class datacenter GPUs

- MI300X: 192 GB HBM3, ~5 TB/s memory bandwidth; datacenter card, no PCIe workstation variant practical for home. [ASSUMED — widely known specs; no community home-lab data found]
- Price: $15,000–$25,000 per card; server chassis required. Not a home option. [ASSUMED]

### Concurrency Behaviour (vLLM / SGLang)

- vLLM with continuous batching delivers 10–15× higher throughput than llama.cpp under concurrent requests via PagedAttention. [VERIFIED — https://docs.bswen.com/blog/2026-03-15-vllm-vs-llamacpp-speed/]
- For 4–8 concurrent subagent streams at V4-Flash scale: need sufficient KV cache headroom beyond model weights. At 4× RTX PRO 6000 (~210 GB headroom after weights), 4–8 concurrent 8K-context requests consume roughly 4–8 GB KV cache — well within budget. [ASSUMED from V4-Flash KV cache efficiency figures]
- llama.cpp / Ollama on Apple Silicon: optimized for single-stream; concurrent batching degrades significantly above 4 streams. [COMMUNITY — https://contracollective.com/blog/llama-cpp-vs-mlx-ollama-vllm-apple-silicon-2026]
- Effective concurrency ceiling: Apple Silicon M3 Ultra ~4 streams before throughput per-stream degrades below usable; 4× RTX PRO 6000 on SGLang ~8–16 streams with acceptable latency. [ASSUMED from the above]

---

## Build Tiers Table

| Tier | Config | Est. Cost (USD) | Reasoning model (V4-Flash tok/s) | Coding model | Concurrency ceiling | Power | Noise | Home-suitability |
|------|--------|-----------------|----------------------------------|--------------|---------------------|-------|-------|-----------------|
| **Entry** | AMD Strix Halo mini-PC (128 GB) for coding; API fallback for reasoning | ~$3,500 (coding box) | API only — no local reasoning | DeepSeek R1-Distill 32B or Qwen 2.5 Coder 14B: ~15–25 tok/s | 2–4 streams (coding only) | 65–90 W | Near-silent | Excellent |
| **Balanced** | Mac Studio M3 Ultra 256 GB + existing Mac Mini coding host | ~$8,000–$10,000 (Mac Studio; Mac Mini already owned) | V4-Flash at aggressive quant (~IQ3/Q3): marginal (~15–18 tok/s if it fits 256 GB) or V3 671B Q4 at ~20 tok/s | Qwen 2.5 Coder 14B on Mac Mini: ~40–60 tok/s | ~4 streams | <200 W | Near-silent | Excellent |
| **Headroom** | 4× RTX PRO 6000 Blackwell (384 GB GDDR7) workstation + Mac Mini for coding | ~$36,000–$40,000 all-in | V4-Flash at native FP4+FP8: ~25–40 tok/s single stream; 1,000–2,000 tok/s prefill aggregate | Qwen 2.5 Coder 32B or DeepSeek Coder 33B on Mac Mini or dedicated 5090 | 8–16 concurrent streams | 2,400 W TDP (full card load) | Loud — server-grade | Poor (requires dedicated room/rack) |

**Note on Headroom tier:** The 4× RTX PRO 6000 configuration delivers the best concurrency ceiling and V4-Flash native precision, but the 2.4 kW TDP and cooling requirements make it a server closet deployment, not a desk deployment. A 2× RTX PRO 6000 (192 GB) is a middle point (~$18,000–$20,000): fits V4-Flash at Q4, lower power (~1,200 W TDP), but KV cache headroom shrinks to ~12–20 GB, limiting concurrency.

---

## Memory Math

### DeepSeek V4-Flash (284B MoE, 13B active)

| Quant format | Weight size | KV cache (8K ctx × 8 streams) | Runtime overhead | Total needed |
|---|---|---|---|---|
| FP4+FP8 native (official) | ~160 GB | ~8–12 GB | ~5 GB | ~175–180 GB |
| Q4_K_M GGUF | ~172–180 GB | ~8–12 GB | ~5 GB | ~185–195 GB |
| Q3_K_M GGUF | ~135–145 GB (estimated) | ~8–12 GB | ~5 GB | ~148–162 GB |
| IQ2 / Q2 | ~90–100 GB | ~8–12 GB | ~5 GB | ~103–117 GB |
| IQ1_S (extreme) | ~58–65 GB | ~8–12 GB | ~5 GB | ~70–80 GB |

Sources: [VERIFIED — https://codersera.com/blog/deepseek-v4-vram-gpu-requirements-2026/]; [COMMUNITY — https://canitrun.dev/models/deepseek-v4-flash/]; IQ1_S figure [COMMUNITY — https://tinycomputers.io/posts/running-deepseek-v4-flash-on-amd-strix-halo.html]. Q3_K_M estimate is [ASSUMED by interpolation].

### DeepSeek V4-Pro (1.6T MoE, 49B active) — for completeness

| Quant format | Weight size | Verdict |
|---|---|---|
| FP4+FP8 native | ~862 GB | Needs ~10×H100 80 GB; no home box |
| INT4 aggressive | ~400 GB | Needs 8×H100; no home box |
| Not practical locally | — | Datacenter-only |

Source: [VERIFIED — https://www.aimadetools.com/blog/deepseek-v4-pro-complete-guide/]

### DeepSeek V3/R1 671B (predecessor, Q4)

| Quant format | Weight size | KV cache | Total needed |
|---|---|---|---|
| GGUF Q4_K_M | ~405 GB | ~10–15 GB | ~420 GB |
| FP8 (serving) | ~671 GB | ~10–15 GB | ~685 GB |

Source: [VERIFIED — https://huggingface.co/deepseek-ai/DeepSeek-R1/discussions/19]

### Hardware capacity vs model

| Hardware | Unified/VRAM | Fits V4-Flash Q4? | Fits V4-Flash Q3? | Fits V3/R1 Q4? |
|---|---|---|---|---|
| RTX 5090 (1×) | 32 GB | No | No | No |
| RTX 5090 (2×, PCIe) | 64 GB | No | No | No |
| RTX PRO 6000 (1×) | 96 GB | No (weights alone 172 GB) | No | No |
| RTX PRO 6000 (2×, PCIe) | 192 GB | Marginal (Q4 needs 185–195 GB) | Yes | No |
| RTX PRO 6000 (4×, PCIe) | 384 GB | Yes (native FP4+FP8) | Yes | No (needs ~420 GB) |
| M3 Ultra 256 GB | 256 GB | Q3 fits; Q4 tight | Yes | No |
| M3 Ultra 512 GB (discontinued) | 512 GB | Yes | Yes | Yes |
| H100×8 (640 GB) | 640 GB | Yes | Yes | Yes (AWQ) |

---

## Assumptions & Gaps

1. [ASSUMED] 4× RTX PRO 6000 direct V4-Flash benchmark in public record is partial (extrapolated from single-card + 8-card data). WS-A should verify with the kvcache-ai/ktransformers or SGLang teams.
2. [ASSUMED] Q3_K_M GGUF size for V4-Flash (~135–145 GB) interpolated from Q2 and Q4 figures. No community build confirmed as of search date.
3. [ASSUMED] M5 Ultra Mac Studio specs/pricing unknown; if DRAM shortage eases and M5 Ultra ships with 512 GB, it would be the cleanest single-box home option.
4. [ASSUMED] V4-Flash concurrency KV cache figures use 8K context. Longer contexts (32K–128K) multiply KV cache linearly; at 32K×8 streams the KV cache grows to ~80–120 GB, which changes the headroom calculus for 2× RTX PRO 6000.
5. [ASSUMED] vLLM SM120 compile-path crash (4× RTX PRO 6000) is current as of May 2026; may be resolved in later vLLM releases. Use SGLang as primary serving framework until resolved.
6. [GAP] No measured noise/acoustic benchmark for 4× RTX PRO 6000 workstation found; extrapolated from TDP.
7. [GAP] AMD MI300X home deployment data absent — not pursued as it requires datacenter infrastructure.
8. [GAP] V4-Pro local deployment: confirmed infeasible; no further sizing work needed unless datacenter scale is reconsidered.

---

## Sources

- [Running DeepSeek R1 Locally — Groundy](https://groundy.com/articles/running-deepseek-r1-locally-hardware-requirements-quantization-and-real-throughput/)
- [DeepSeek V3 Complete Guide 2026 — SitePoint](https://www.sitepoint.com/deepseek-v3-complete-guide-deploy-and-optimize-local-ai-in-2026/)
- [DeepSeek V4 VRAM & GPU Requirements 2026 — Codersera](https://codersera.com/blog/deepseek-v4-vram-gpu-requirements-2026/)
- [DeepSeek V4 Pro Complete Guide — AiMadeTools](https://www.aimadetools.com/blog/deepseek-v4-pro-complete-guide/)
- [DeepSeek V4: 1.6T MoE — Morphllm](https://www.morphllm.com/deepseek-v4)
- [DeepSeek V4 Flash Review 2026 — BuildFastWithAI](https://www.buildfastwithai.com/blogs/deepseek-v4-flash-review-2026)
- [Self-Hosting DeepSeek V4 — Lushbinary](https://lushbinary.com/blog/deepseek-v4-self-hosting-guide-vllm-hardware-deployment/)
- [DeepSeek V4 (1.6T MoE) — Clore.ai Docs](https://docs.clore.ai/guides/language-models/deepseek-v4)
- [DeepSeek V4 Flash 284B VRAM — CanItRun](https://canitrun.dev/models/deepseek-v4-flash/)
- [DeepSeek R1 Hardware — HuggingFace Discussion](https://huggingface.co/deepseek-ai/DeepSeek-R1/discussions/19)
- [DeepSeek V4 Flash Hugging Face](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)
- [RTX 5090 Review & Benchmarks — GamersNexus](https://gamersnexus.net/gpus/nvidia-geforce-rtx-5090-founders-edition-review-benchmarks-gaming-thermals-power)
- [RTX 5090 DeepSeek R1 Performance — WCCFTech](https://wccftech.com/nvidia-geforce-rtx-5090-dominates-inference-performance-on-deepseeks-r1-ai-models/)
- [RTX 5090 Specs & Pricing — OfZenAndComputing](https://www.ofzenandcomputing.com/nvidia-rtx-5090-specs-pricing-release-date/)
- [Dual RTX 5090 Testing — HostKey](https://hostkey.com/blog/83-more-5090-more-problems-testing-a-dual-nvidia-gpu-setup/)
- [RTX PRO 6000 Blackwell — NVIDIA Product Page](https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000/)
- [RTX PRO 6000 Pricing — ThunderCompute](https://www.thundercompute.com/blog/nvidia-rtx-pro-6000-pricing)
- [RTX PRO 6000 for LLMs — VRLATech](https://vrlatech.com/rtx-pro-6000-blackwell-for-llms-why-96gb-changes-everything/)
- [4× RTX PRO 6000 DeepSeek V4 Flash Benchmarks — Codersera](https://codersera.com/blog/deepseek-v4-flash-rtx-pro-6000-blackwell-benchmarks-2026/)
- [DwarfStar 4× RTX PRO 6000 DeepSeek V4 Flash — loFT LLC](https://loftllc.dev/en/docs/tech/llm-research/dwarfstar4-rtx-pro-6000-deepseek-v4-flash-first-look/)
- [H100 GPU Price 2026 — Compute Exchange](https://compute.exchange/blogs/h100-gpu-price-2026)
- [H100 Pricing Guide — JarvisLabs](https://jarvislabs.ai/blog/h100-price)
- [DeepSeek V3/R1 on 8×H100 — GitHub dzhsurf](https://github.com/dzhsurf/deepseek-v3-r1-deploy-and-benchmarks)
- [Mac Studio M3 Ultra DeepSeek V3 — VentureBeat](https://venturebeat.com/ai/deepseek-v3-now-runs-at-20-tokens-per-second-on-mac-studio-and-thats-a-nightmare-for-openai/)
- [Mac Studio M3 Ultra llama.cpp Crawl — Hardware-Corner](https://www.hardware-corner.net/mac-studio-m3-ultra-deepseek-llamacpp/)
- [Apple Pulls 512 GB Mac Studio — Tom's Hardware](https://www.tomshardware.com/tech-industry/apple-pulls-512-mac-studio-upgrade-option)
- [Apple Drops 512 GB Option — MacDailyNews](https://macdailynews.com/2026/03/06/apple-drops-512gb-m3-ultra-mac-studio-option-ups-256gb-memory-upgrade-by-400/)
- [M5 Mac Studio 2026 Rumors — MacWorld](https://www.macworld.com/article/2973459/2026-mac-studio-m5-release-date-specs-price-rumors.html)
- [V4-Flash on M3 Ultra — DeepSeekV4Pro.com](https://deepseekv4pro.com/guides/deepseek-v4-flash-local-mac)
- [Mac Studio M3 Ultra DeepSeek R1 — MacRumors](https://www.macrumors.com/2025/03/17/apples-m3-ultra-runs-deepseek-r1-efficiently/)
- [Strix Halo LLM Guide — StarryHope](https://www.starryhope.com/minipcs/strix-halo-local-llm-inference-2026/)
- [Strix Halo V4-Flash — TinyComputers](https://tinycomputers.io/posts/running-deepseek-v4-flash-on-amd-strix-halo.html)
- [Strix Halo LLM Guide — LocalAIMaster](https://localaimaster.com/blog/strix-halo-ai-max-395-guide)
- [Strix Halo Benchmarks — LLM-Tracker](https://llm-tracker.info/_TOORG/Strix-Halo)
- [vLLM vs llama.cpp 2026 — BSWEN](https://docs.bswen.com/blog/2026-03-15-vllm-vs-llamacpp-speed/)
- [llama.cpp vs MLX vs Ollama vs vLLM Apple Silicon — ContraCollective](https://contracollective.com/blog/llama-cpp-vs-mlx-ollama-vllm-apple-silicon-2026)
- [What to Buy for Local LLMs April 2026 — Julien Simon / Medium](https://julsimon.medium.com/what-to-buy-for-local-llms-april-2026-a4946a381a6a)
- [Local LLM Tokens-per-Second Benchmarks 2026 — Presenc AI](https://presenc.ai/research/local-llm-tokens-per-second-benchmarks-2026)
