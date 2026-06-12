# Research: WS-C — Serving stack + harness wiring

**Date:** 2026-06-12
**Confidence:** Medium-High on serving engines and harness wiring; Medium on exact KV-cache math (hardware-specific, rapidly evolving)

---

## Summary

**Recommended stack:** SGLang (primary) + vLLM (fallback) as the serving engine for DeepSeek V4 Flash on CUDA; LiteLLM proxy as the Anthropic-API shim. Claude Code's `ANTHROPIC_BASE_URL` mechanism is confirmed compatible with this path. The native 1M context / 384K output window is verified for V4 Flash, but realistically achievable local context is hardware-gated: 128K–256K on 2× H200 class hardware (the practical minimum for V4-Flash), scaling to full 1M only on 4–8× H200/B200. For the APEX target (Mac Mini as dev+prod), V4 Flash is feasible with 128GB unified memory at IQ2 quantization with a hard cap around 32K–64K context, not 1M. Apple Silicon path requires ds4 or llama.cpp forks rather than vLLM/SGLang.

---

## Key Findings

1. **DeepSeek V4 Flash specs confirmed:** 284B total / 13B active parameters (MoE), 1M token native context window, 384K max output tokens, FP8+FP4 native weights, MIT license, open weights on Hugging Face. [VERIFIED — https://bibigpt.co/en/features/deepseek-v4-1m-context-explained] [VERIFIED — https://api-docs.deepseek.com/news/news260424]

2. **V4 Flash is NOT the same as "DeepSeek V4 Flash" the cloud product:** The published open-weight model is the model to run locally. The cloud "V4 Flash" API references the same checkpoint. [VERIFIED — https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash]

3. **vLLM supports V4 Flash day-0** with MoE expert parallelism, hybrid CSA+HCA attention, and FP4/FP8 checkpoint support. Requires vLLM ≥ 0.7.0. Tool calling uses the `deepseek_v3` parser. [VERIFIED — https://vllm.ai/blog/2026-04-24-deepseek-v4] [VERIFIED — https://docs.vllm.ai/en/latest/features/tool_calling/]

4. **SGLang supports V4 Flash day-0** with dedicated cookbook recipes. SGLang's RadixAttention and prefix caching provide strong throughput for concurrent agentic workloads. [VERIFIED — https://www.lmsys.org/blog/2026-04-25-deepseek-v4/]

5. **Critical vLLM bug (open as of May 2026):** DeepSeek-V4-Flash-FP8 crashes consistently under data-parallel + expert-parallel on H200 (Issue #43648, vllm v0.20.1). Additional crash: SM120 (RTX Pro 6000 Blackwell) load failure (Issue #40821). **SGLang is the more stable choice for V4 Flash today.** [VERIFIED — https://github.com/vllm-project/vllm/issues/43648]

6. **SGLang concurrent function calling bug on V3.2 (Dec 2025):** Under high concurrency, V3.2 function calling breaks (Issue #15042). Status: was open as of late 2025. V4 has a separate roadmap issue and day-0 support announcement does not reference this regression. [COMMUNITY — https://github.com/sgl-project/sglang/issues/15042] — **Verify fix status before production use.**

7. **LiteLLM proxy is the recommended Anthropic-API shim.** It accepts Anthropic `/v1/messages` requests and translates to OpenAI format for local vLLM/SGLang. Claude Code sets `ANTHROPIC_BASE_URL=http://localhost:4000` and talks to LiteLLM. [VERIFIED — https://docs.litellm.ai/docs/providers/vllm] [VERIFIED — https://androidexperto.com/running-claude-code-with-local-llms-via-vllm-and-litellm/]

8. **Claude Code LLM Gateway is the official integration path.** Claude Code v2.1.129+ supports ANTHROPIC_BASE_URL pointing at any Anthropic-format gateway, with model discovery via `/v1/models`. Supports Anthropic Messages API format natively. [VERIFIED — https://code.claude.com/docs/en/llm-gateway]

9. **Ollama v0.14+ has native Anthropic Messages API** at `/v1/messages`, eliminating the need for a translation proxy if Ollama is the serving engine. However, Ollama is single-request-at-a-time by design and not suitable for 4–8 concurrent agent fan-out. [VERIFIED — https://github.com/ollama/ollama/releases/tag/v0.14.0] [COMMUNITY — https://docs.ollama.com/api/anthropic-compatibility]

10. **LiteLLM tool_use translation has known gaps:** reasoning_content (thinking blocks) dropped in Anthropic→OpenAI conversion; tool result formatting sometimes incorrect; multi-turn with reasoning models may fail. For V4 Flash (non-thinking variant), basic tool calling translation is reliable. [VERIFIED — https://github.com/BerriAI/litellm/issues/27946] [VERIFIED — https://github.com/BerriAI/litellm/discussions/18271]

11. **Apple Silicon (Mac Mini) path requires ds4 or llama.cpp fork:** mlx-lm does not support V4 Flash architecture (Issue #1233 open as of mid-2026). ds4 (Salvatore Sanfilippo) runs V4-Flash on 128GB Macs with Metal backend at IQ2 quantization, ~26 tok/s generation. Not production-grade for 4–8 concurrent requests. [COMMUNITY — https://flowtivity.ai/blog/deepseek-v4-flash-ds4-local-inference-128gb-mac/] [VERIFIED — https://github.com/ml-explore/mlx-lm/issues/1233]

12. **KV cache math for V4 Flash:** V4 Flash uses ~9.62 GiB KV cache per sequence at full 1M context (bf16), or ~5 GiB with FP4/FP8 compression — roughly 8–10x smaller than a comparable V3.2-style stack at same length. [VERIFIED — https://vllm.ai/blog/2026-04-24-deepseek-v4] [VERIFIED — https://knightli.com/en/2026/05/18/deepseek-v4-kv-cache-compressed-attention/]

13. **Claude Code subagent concurrency:** The harness spawns parallel subagents each making their own `ANTHROPIC_BASE_URL` calls. The concurrency cap is governed by `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY`. A local serving engine must queue these; vLLM and SGLang both support continuous batching for this. [VERIFIED — https://code.claude.com/docs/en/errors]

---

## Engine Comparison Table

| Engine | DeepSeek V4 Flash support | Tool calling | Long context | Concurrent/batched | Platform | Notes |
|--------|--------------------------|--------------|-------------|-------------------|----------|-------|
| **vLLM** | Yes (day-0, ≥ 0.7.0) | Yes (`deepseek_v3` parser) | Up to 1M (hardware-gated) | Yes (continuous batching, EP+TP) | CUDA only | FP8+EP crash bug open (Issue #43648) as of May 2026; avoid EP+DP until fixed |
| **SGLang** | Yes (day-0, ≥ 0.4.4) | Yes (with V4, V3.2 has concurrent bug) | Up to 1M | Yes (RadixAttention, prefix cache, TP+DP) | CUDA only | More stable for V4 Flash today; recommended primary |
| **Ollama** | Yes (V4-Flash in library) | Yes (with Anthropic-compat) | Limited (community reports 32K–128K practical) | No — single-request serialized | CUDA + Apple Silicon | v0.14+ has native /v1/messages; not suitable for agent fan-out |
| **llama.cpp** | Experimental only (antirez fork) | Partial | Limited by quant/VRAM | Limited (no true batching server) | CPU + CUDA + Metal | Not production-grade for V4 Flash |
| **MLX-LM** | Not supported (arch unsupported, Issue #1233 open) | N/A | N/A | No | Apple Silicon only | Use ds4 or llama.cpp fork instead |
| **ds4** | Yes (purpose-built for V4-Flash) | Unknown | ~32K–64K at 128GB RAM | Single request | Apple Silicon Metal | Experimental; good for Mac dev, not concurrent agentic use |
| **TGI (HuggingFace)** | Community support via MoE handlers | Partial | Limited | Yes (batching) | CUDA | Less tested than vLLM/SGLang for V4 specifics; not recommended |
| **LM Studio** | Yes (via llama.cpp backend) | Partial | Limited | Single request | CPU + CUDA + Metal | GUI tool, not a production server |

---

## Recommended Stack + Config Sketch

### Tier 1: CUDA GPU (2× H200 or equivalent, ~160–175 GB VRAM) — Full stack

**Serving engine:** SGLang (primary), vLLM as fallback once EP crash is resolved.

**SGLang launch (V4 Flash, TP=2, 256K context):**
```bash
python -m sglang.launch_server \
  --model-path deepseek-ai/DeepSeek-V4-Flash \
  --tp 2 \
  --max-model-len 262144 \
  --dtype fp8 \
  --port 8000 \
  --host 0.0.0.0
```

**LiteLLM proxy config (litellm_config.yaml):**
```yaml
model_list:
  - model_name: deepseek-planning          # planning mode role
    litellm_params:
      model: openai/deepseek-ai/DeepSeek-V4-Flash
      api_base: http://localhost:8000/v1
      api_key: local
      max_tokens: 16384

  - model_name: deepseek-coding            # coding mode role
    litellm_params:
      model: openai/deepseek-ai/DeepSeek-V4-Flash
      api_base: http://localhost:8000/v1
      api_key: local
      max_tokens: 8192

general_settings:
  master_key: "local-only"
```

**LiteLLM proxy launch:**
```bash
litellm --config litellm_config.yaml --port 4000
```

**Environment variables for Claude Code:**
```bash
# Planning session
export ANTHROPIC_BASE_URL=http://localhost:4000
export ANTHROPIC_API_KEY=local-only
export ANTHROPIC_MODEL=deepseek-planning

# Coding session (same proxy, different model alias if desired)
export ANTHROPIC_BASE_URL=http://localhost:4000
export ANTHROPIC_API_KEY=local-only
export ANTHROPIC_MODEL=deepseek-coding
```

**Model routing note:** The APEX harness uses `ANTHROPIC_BASE_URL` presence/absence + `deepseek` in the URL to detect planning vs coding mode. With a local proxy at `localhost:4000`, the harness will NOT detect deepseek in the URL. Two options:
- Option A: Use two separate proxy endpoints (e.g., `localhost:4000` for coding, `localhost:4001` for planning) and name one with a path containing `deepseek`.
- Option B: Use `http://localhost:4000/deepseek/v1` — configure LiteLLM to serve on that path prefix.
- Option C: Update the APEX mode-detection logic in `apex-orchestrate` to also detect by model name or a custom env var (e.g., `APEX_MODE=coding`). [ASSUMED — this is an architectural decision for the APEX team; verify how apex-orchestrate reads mode]

### Tier 2: Apple Silicon Mac Mini (128GB unified memory) — Development only

**Serving engine:** ds4 for V4-Flash (experimental, sequential requests only).

**Constraint:** ds4 is single-request, no Anthropic-API compatibility layer confirmed. Not suitable for the 4–8 concurrent subagent fan-out the APEX pipeline requires. Treat as a testing/prototyping path only.

**For concurrent agentic use on Mac:** Not feasible with V4-Flash today. Fallback options:
- Route to cloud API for concurrent work
- Use a smaller model (DeepSeek-R1 7B/14B via Ollama) for the fan-out, reserving the large model for planning

---

## Local Context Cap

### Published native window
V4 Flash: **1M tokens context / 384K tokens max output** [VERIFIED — https://bibigpt.co/en/features/deepseek-v4-1m-context-explained]

### Realistic achievable context by hardware class

| Hardware | VRAM | Practical max context (V4 Flash FP8) | Notes |
|----------|------|--------------------------------------|-------|
| 2× RTX 4090 (48GB) | 48 GB | ~16K–32K | Heavily quantized; marginal viability |
| 1× H100 80GB | 80 GB | ~128K–256K | FP8 weights ~80GB leaves minimal KV headroom; needs quantization |
| 2× H200 (160GB) | 160 GB | ~256K comfortable | Reference deployment; KV ~5GB/seq at FP8+FP4 |
| 4× H200 (320GB) | 320 GB | ~512K–1M | Full 1M requires prefill/decode disaggregation |
| Mac Mini / MacBook 128GB unified | 128 GB | ~32K–64K (IQ2 quant) | Via ds4/llama.cpp; weights ~81GB leaves ~45GB for KV |

**KV cache math (V4 Flash, compressed attention):**
- bf16 KV per sequence at 1M context: ~9.62 GiB [VERIFIED — vllm.ai blog]
- FP4/FP8 compressed: ~5 GiB per sequence at 1M context [VERIFIED — knightli.com]
- At 128K context (1/8 of 1M): ~0.6–1.2 GiB per sequence
- At 8 concurrent requests × 128K context: ~5–10 GiB KV overhead
- On 2× H200 (160 GB): 175 GB model weights (FP8) + 10 GB KV (8 concurrent, 128K) ≈ marginal; 64K context per request is safer at 8-way concurrency

**Practical recommendation for APEX:** Set `--max-model-len 65536` (64K) initially for 4–8 concurrent agent requests on 2× H200. Scale to 128K if monitoring shows VRAM headroom. The planning subagents that process long codebases will need this ceiling monitored carefully.

---

## Assumptions & Gaps

1. [ASSUMED] The APEX harness `apex-orchestrate` detects planning vs coding mode by checking whether `ANTHROPIC_BASE_URL` contains the string "deepseek". With a `localhost:4000` proxy the detection breaks. **Resolution required before going fully local.**

2. [ASSUMED] The "Mac Mini being bought" in project memory is an M4 Ultra with 128GB unified memory. If it is a lesser spec (M4 Pro, 64GB), V4-Flash is not runnable even at IQ2.

3. [COMMUNITY] SGLang V3.2 concurrent function calling bug (Issue #15042) — unclear if fixed in V4 lineage. The SGLang day-0 V4 announcement does not explicitly confirm the fix. Test before deployment.

4. [ASSUMED] LiteLLM's translation of Anthropic-style `tool_use` blocks to OpenAI function-call format is accurate for V4 Flash (non-thinking). The known reasoning_content gap only affects thinking-mode models. Verify with the APEX tool-calling patterns (file read/write/search) before committing.

5. [ASSUMED] DeepSeek V4 Flash open weights are publicly available and not gated. The Hugging Face page shows the model card but weight download access should be verified.

6. [ASSUMED] CUDA hardware is available (the project deployment notes mention Mac Mini as the target; if no CUDA GPU is attached, the full vLLM/SGLang stack is not applicable).

7. [ASSUMED] vLLM EP+DP crash (Issue #43648) is specific to data-parallel configurations; single-node TP-only launch on H200 may be unaffected. Verify with a minimal test before concluding vLLM is unusable.

8. [ASSUMED] ds4 (the antirez project) exposes an HTTP API compatible with a proxy translation layer. This was not confirmed in search results; ds4's API surface needs investigation.

---

## Sources

- [vLLM DeepSeek-V3.2 Usage Guide](https://docs.vllm.ai/projects/recipes/en/latest/DeepSeek/DeepSeek-V3_2.html)
- [vLLM Tool Calling docs](https://docs.vllm.ai/en/latest/features/tool_calling/)
- [vLLM DeepSeek V4 Blog](https://vllm.ai/blog/2026-04-24-deepseek-v4)
- [vLLM DeepSeek-V4-Flash Recipe](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash)
- [vLLM Issue #43648 — V4-Flash FP8 crash](https://github.com/vllm-project/vllm/issues/43648)
- [vLLM Issue #41132 — structured output + thinking bug](https://github.com/vllm-project/vllm/issues/41132)
- [SGLang DeepSeek V4 day-0 blog](https://www.lmsys.org/blog/2026-04-25-deepseek-v4/)
- [SGLang DeepSeek V3.2 docs](https://docs.sglang.io/cookbook/autoregressive/DeepSeek/DeepSeek-V3_2)
- [SGLang Issue #15042 — V3.2 concurrent tool calling bug](https://github.com/sgl-project/sglang/issues/15042)
- [SGLang DeepSeek V4 Roadmap](https://github.com/sgl-project/sglang/issues/23602)
- [LiteLLM vLLM provider docs](https://docs.litellm.ai/docs/providers/vllm)
- [LiteLLM Anthropic provider docs](https://docs.litellm.ai/docs/providers/anthropic)
- [LiteLLM Issue #27946 — reasoning_content loss](https://github.com/BerriAI/litellm/issues/27946)
- [LiteLLM Discussion #18271 — tool call formatting limitations](https://github.com/BerriAI/litellm/discussions/18271)
- [Claude Code LLM Gateway docs](https://code.claude.com/docs/en/llm-gateway)
- [Running Claude Code with local LLMs via vLLM and LiteLLM](https://androidexperto.com/running-claude-code-with-local-llms-via-vllm-and-litellm/)
- [Claude Code + Local LLMs Medium guide](https://medium.com/@michael.hannecke/connecting-claude-code-to-local-llms-two-practical-approaches-faa07f474b0f)
- [Claude Code Router Guide 2026](https://www.getaiperks.com/en/ai/claude-code-router-guide)
- [Ollama v0.14 release (Anthropic API compat)](https://github.com/ollama/ollama/releases/tag/v0.14.0)
- [Ollama Anthropic compatibility docs](https://docs.ollama.com/api/anthropic-compatibility)
- [DeepSeek V4 VRAM requirements](https://willitrunai.com/blog/deepseek-v4-vram-requirements)
- [DeepSeek V4 KV cache explained](https://knightli.com/en/2026/05/18/deepseek-v4-kv-cache-compressed-attention/)
- [DeepSeek V4 1M context HuggingFace blog](https://huggingface.co/blog/deepseekv4)
- [DeepSeek V4 Preview release notes](https://api-docs.deepseek.com/news/news260424)
- [DeepSeek V4 Flash — Mac local inference with ds4](https://flowtivity.ai/blog/deepseek-v4-flash-ds4-local-inference-128gb-mac/)
- [MLX-LM Issue #1233 — V4 Flash arch unsupported](https://github.com/ml-explore/mlx-lm/issues/1233)
- [Mac inference framework comparison 2026](https://macgpu.com/en/blog/2026-mac-inference-framework-vllm-mlx-ollama-llamacpp-benchmark.html)
- [DeepSeek V4 self-hosting vLLM guide](https://lushbinary.com/blog/deepseek-v4-self-hosting-guide-vllm-hardware-deployment/)
- [Run DeepSeek V4 Flash Locally 2026 guide](https://codersera.com/blog/run-deepseek-v4-flash-locally-full-2026-setup-guide/)
- [HuggingFace V3.2 deployment discussion](https://huggingface.co/deepseek-ai/DeepSeek-V3.2/discussions/15)
- [DeepSeek V4 Insights arXiv paper](https://arxiv.org/pdf/2505.09343)
