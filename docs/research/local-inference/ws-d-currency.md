# Research: WS-D — Staying Current (Not Frozen at Download)

**Date:** 2026-06-12
**Confidence:** Medium-High on RAG and model-swap levers (verified primary sources); Medium on fine-tuning feasibility for flagship-scale MoE (community reports, no controlled experiment on APEX hardware).

---

## Summary

A self-hosted DeepSeek stack is frozen at the weight snapshot pulled at install time. Three levers exist to counteract this: (1) eval-gated model swaps when upstream releases a better version, (2) local continued fine-tuning on project-specific data, and (3) RAG injection of current library docs at inference time. The verdict: **RAG is the highest-ROI lever and should be implemented first**; model-swap with a lightweight eval gate is the second pillar; fine-tuning the flagship MoE is not feasible on prosumer hardware and is not worth the maintenance burden — fine-tuning a distill is feasible but solves a different (behavior shaping) problem, not the currency problem. The recommended strategy is a RAG-first + swap-on-eval hybrid.

---

## Key Findings

### Lever 1: Model-Swap Cadence

**DeepSeek release history (verified):**

- May 2024: DeepSeek-V2 released [VERIFIED — https://deepseekai.guide/guides/deepseek-history/]
- Dec 2024: DeepSeek-V3 released (671B total, 37B active MoE) [VERIFIED — https://freedeepseekapi.com/history]
- Jan 2025: DeepSeek-R1 released (671B, reasoning model) [VERIFIED — https://en.wikipedia.org/wiki/DeepSeek]
- Mar 2025: DeepSeek-V3-0324 (incremental update, ~3 months after V3) [VERIFIED — https://www.notebookcheck.net/DeepSeek-releases-improved-V3-AI-model-three-months-after-initial-launch.989270.0.html]
- May 2025: R1-0528 incremental update [VERIFIED — https://timelines.issarice.com/wiki/Timeline_of_DeepSeek]
- Sep–Dec 2025: V3.1, V3.2, V3.2-Speciale [VERIFIED — https://freedeepseekapi.com/history]
- Apr 2026: V4-Pro (1.6T total, 49B active) and V4-Flash (284B total, 13B active), MIT license, open weights on Hugging Face [VERIFIED — https://api-docs.deepseek.com/news/news260424]

**Release cadence pattern:** Major version jumps every 12–16 months (V3 → V4 was ~16 months); incremental updates within a generation every 2–4 months [VERIFIED — synthesis of above sources]. V3-to-V4 cycle implies V5 no earlier than late 2027 [COMMUNITY — https://codersera.com/blog/deepseek-v4-complete-guide-2026/].

**Eval harnesses for local model swap:**

- **lm-evaluation-harness (EleutherAI):** Supports local HuggingFace models and any OpenAI-compatible API endpoint. Includes HumanEval, MBPP, and 200+ tasks. Powers Hugging Face Open LLM Leaderboard. Used by NVIDIA, Cohere, Mosaic ML. 2026 guides confirm it runs coding benchmarks through OpenAI-compatible APIs. [VERIFIED — https://github.com/EleutherAI/lm-evaluation-harness, https://www.morphllm.com/llm-eval-harness]
- **Promptfoo:** CLI-first, YAML-configured, open-source (MIT). Supports 50+ providers including Ollama and custom OpenAI-compatible endpoints. Acquired by OpenAI in March 2026 but remains open source. Native tool-calling support for models that support function calling (Llama 3.1, Qwen 2.5, and others). Can be integrated into CI. Side-by-side model comparison with regression detection. [VERIFIED — https://www.promptfoo.dev/docs/providers/ollama/, https://pecollective.com/tools/promptfoo/]
- **HumanEval / MBPP / BigCodeBench:** Standard coding benchmarks. HumanEval = 164 Python problems; MBPP = ~1000 entry-level problems; BigCodeBench evaluates ability to invoke diverse external libraries. EvalPlus adds harder test cases to both. [VERIFIED — https://www.datacamp.com/tutorial/humaneval-benchmark-for-evaluating-llm-code-generation-capabilities]

**Recommended eval gate design for APEX:** See dedicated section below.

**Gaps:** No published data on tool-calling regression rates specifically between DeepSeek versions. No official DeepSeek benchmark delta reports on consecutive version pairs. [ASSUMED] Tool-calling fidelity may degrade on minor updates if fine-tuning mix changes.

---

### Lever 2: Local Continued Fine-Tuning

**Feasibility at flagship MoE scale (DeepSeek V3/V4-Pro, 671B–1.6T parameters):**

- Full fine-tuning is impossible on prosumer hardware; even inference requires multi-GPU setups [VERIFIED — https://llmhardware.io/guides/deepseek-hardware-requirements]
- QLoRA VRAM requirement for 32B models is ~44GB; for 70B ~88GB [VERIFIED — https://vrlatech.com/how-much-vram-do-you-need-for-llm-fine-tuning-in-2026/]
- DeepSeek V3's MoE architecture with 256 experts makes LoRA adapter placement structurally complex: a separate LoRA matrix is needed per expert per MoE layer, multiplying adapter count [COMMUNITY — https://chat-deep.ai/guide/fine-tuning-deepseek-v3-with-lora/]
- V4-Pro (1.6T, 49B active) is even larger. No reports of consumer fine-tuning of V4-Pro or V3 full MoE [ASSUMED — based on hardware constraints above]

**Feasibility at distill scale (7B–32B):**

- DeepSeek R1 distills (7B, 14B, 32B) are runnable inference on 5.5 GB / 8.5 GB / 18 GB VRAM Q4 respectively [VERIFIED — https://willitrunai.com/blog/deepseek-r1-vram-requirements-guide]
- QLoRA fine-tuning adds ~3–4× overhead vs inference. 32B QLoRA requires ~44GB VRAM — feasible on a dual-RTX 3090/4090 or a single A100 80GB, but not a single consumer GPU [VERIFIED — https://vrlatech.com/how-much-vram-do-you-need-for-llm-fine-tuning-in-2026/]
- 7B and 14B distills are fine-tunable on 16–24GB VRAM single GPU [VERIFIED — https://aicompetence.org/deepseek-qlora-fine-tune-and-run-locally/]

**Catastrophic forgetting:**

- LoRA/QLoRA mitigates forgetting significantly vs full fine-tuning because base weights are frozen [VERIFIED — https://arxiv.org/pdf/2405.09673 ("LoRA Learns Less and Forgets Less")]
- SFT on reasoning-only corpora can cause loss of instruction-following and tool-use skills; two-stage hybrid fine-tuning (SFT → RLHF-style reinforcement) can restore generality [COMMUNITY — https://chat-deep.ai/guide/deepseek-fine-tuning/]
- Without the original pre-training data, preventing forgetting is difficult with a small adapter and a small fraction of parameters [COMMUNITY — https://chat-deep.ai/guide/fine-tuning-deepseek-v3-with-lora/]

**Worth-it-vs-swap verdict:**

Fine-tuning the flagship model is not feasible on prosumer hardware. Fine-tuning a distill model is technically feasible on hardware with 44GB+ VRAM (e.g., Mac Studio Ultra with 192GB unified memory, which was the owner's stated target machine), but it solves a **behavior-shaping** problem (making the model follow APEX conventions, prefer certain patterns) rather than a **currency** problem. Fresh knowledge baked into weights requires expensive retraining; RAG does the same job at inference time with trivial overhead. Fine-tuning for style/convention alignment on a distill model is a valid secondary tool once the infrastructure exists, but should not be the first investment for the currency problem. [ASSUMED — synthesis judgment]

---

### Lever 3: RAG for Currency

**Why RAG compensates well for stale weights:**

- Core insight (verified by 2025–2026 practitioners): volatile knowledge belongs in retrieval; stable behavior belongs in weights. Library APIs, framework versions, breaking changes = volatile. Reasoning patterns, architectural judgment = relatively stable [VERIFIED — https://umesh-malik.com/blog/rag-vs-fine-tuning-llms-2026]
- A concrete example: a stale coding assistant recommending deprecated Pandas 1.x syntax in 2026 — RAG with current docs eliminates this class of error [COMMUNITY — https://www.firecrawl.dev/blog/best-open-source-rag-frameworks]
- RAG effectiveness in coding (documentation-heavy) > RAG effectiveness in planning/judgment (stable-pattern-heavy) [VERIFIED — https://dev.to/umesh_malik/rag-vs-fine-tuning-for-llms-2026-what-actually-works-in-production-10if]

**RAG for coding (high ROI):**
Context7/library-doc injection at inference time gives the frozen model current API signatures, deprecation notices, and new library features. This directly fixes the stale-weights-for-coding problem [COMMUNITY — RAG in coding assistants pattern widely documented].

**RAG for planning/judgment (lower ROI, open question):**
Planning and architectural judgment rely on stable reasoning patterns more than current facts. The model's judgment about APEX conventions, spec structure, and design tradeoffs is baked into weights and prompts — RAG with current AI-industry blogs would help marginally. This is an open question — not well-validated in primary sources [ASSUMED].

**Tooling options (2026):**

- **LlamaIndex:** Purpose-built for document retrieval, 300+ data connectors, structured query engines. Best choice if the pipeline is primarily doc retrieval. Integrates with Qdrant/Chroma/pgvector. [VERIFIED — https://www.promptquorum.com/local-llms/best-rag-tools]
- **LangChain:** Largest ecosystem; LangGraph for agentic pipelines; LangSmith for observability. Better if orchestration complexity is high [VERIFIED — https://techsy.io/en/blog/best-rag-tools]
- **Vector stores:** Chroma (dev, handles 100K–1M documents on consumer hardware); Qdrant (production, scales beyond 1M) [VERIFIED — https://awesomeagents.ai/tools/best-ai-rag-tools-2026/]
- **Cache-Augmented Generation (CAG):** Pre-loads the entire knowledge base into the LLM's KV cache. Latency drops to near-zero for the context injection step. Viable for stable, bounded doc sets (e.g., a frozen snapshot of core library docs). [COMMUNITY — https://medium.com/@elammarisoufiane/rag-in-2026-architecture-shifts-emerging-patterns-and-what-it-means-for-java-developers-6f2803e39787]

**Integration with existing Artemis "second brain" index:**
The owner is building Artemis with a RAG document/knowledge index. Reusing that index for APEX coding sessions is architecturally straightforward: the coding model hits the same Chroma/Qdrant store. Staleness clocks in the existing research skill (AI tooling = 14-day refresh) can drive scheduled re-ingestion of library docs into the index. This synergy is the strongest reuse argument for the currency mechanism. [ASSUMED — synthesis; Artemis architecture not examined]

**Critical finding on knowledge-base hygiene:**
"Ungoverned, stale, or poorly structured knowledge bases produce ungoverned, stale, or poorly structured answers — no amount of model optimization will fix outputs if the source is ungoverned." [COMMUNITY — RAG in 2025 year-end review, https://ragflow.io/blog/rag-review-2025-from-rag-to-context] This means the RAG strategy requires a doc governance layer (staleness clocks + scheduled re-ingestion) to avoid being as stale as the weights it is trying to compensate for.

---

## Lever Comparison Table

| Dimension | Model-Swap | Fine-Tune Distill (7B–32B) | RAG Injection |
|---|---|---|---|
| **Currency problem addressed** | Full: new weights replace old knowledge | Partial: behavior shaping only; knowledge baking requires full retrain | High: volatile knowledge (API docs, library versions) injected at inference |
| **Hardware feasibility** | Pull weights + eval; no GPU constraint | 44GB+ VRAM for 32B QLoRA; 16GB for 7B | CPU-feasible; Chroma runs on consumer hardware |
| **Maintenance burden** | Medium: eval gate before each swap | High: adapter management, forgetting risk, eval after every fine-tune run | Medium: staleness clocks + re-ingestion pipeline |
| **Time-to-currency** | Days (pull + eval run) | Weeks (data curation + training run) | Hours (re-index docs) |
| **ROI for coding currency** | High (new model improves across all tasks) | Low-Medium (behavior only; doesn't fix stale API knowledge) | High (directly fixes stale API/library knowledge) |
| **ROI for planning currency** | High | Low | Low-Medium (open question) |
| **Catastrophic forgetting risk** | None (swap replaces, not mutates) | Real; LoRA mitigates but doesn't eliminate | None |
| **Synergy with Artemis index** | None direct | None direct | High (reuse same vector store + staleness clocks) |
| **Feasibility on APEX target hardware (Mac Studio Ultra M-series, 192GB unified)** | Yes | Yes (32B QLoRA fits) | Yes |

---

## Recommended Strategy + Eval Gate

### Recommended Hybrid Strategy

**Phase 1 (immediate, highest ROI): RAG for coding currency**
- Stand up a Chroma vector store (or reuse Artemis's if available).
- Ingest current library docs for the toolchain APEX builds (Python stdlib, key frameworks, DeepSeek API reference).
- Wire staleness clocks (14-day cycle for AI tooling, 30-day for stable libs) to trigger re-ingestion via a cron or the existing research-skill staleness mechanism.
- Inject retrieved chunks into the system prompt of coding sessions via LlamaIndex or a lightweight custom retriever.
- Expected outcome: eliminates deprecated-API hallucinations and keeps coding sessions current with library evolution independently of model version.

**Phase 2 (quarterly or on major DeepSeek release): eval-gated model swap**
- Pull new weights when DeepSeek releases a new version (expected major: ~every 12–16 months; incremental: every 2–4 months).
- Run the eval gate (see below) before replacing the production model.
- Roll back if gate fails; file a note in APEX handoff doc.

**Phase 3 (deferred, only if behavior-shaping need emerges): fine-tune a distill**
- If the flagship model adopts behaviors that break APEX conventions (e.g., changes in tool-calling format, spec-structure outputs) and RAG + prompting cannot fix it, fine-tune a 7B or 14B distill with a curated APEX dataset.
- Use QLoRA on the Mac Studio (192GB unified memory handles 32B fine-tuning).
- This is NOT a currency fix — it is a behavior-alignment fix. Keep expectations clear.

### Upgrade-Now Eval Gate Design

**Trigger:** A new DeepSeek release lands (any of: model weight push to Hugging Face, API changelog update, community benchmark report showing >5% regression on any gate task).

**Gate: four dimensions, all must pass at or above baseline**

1. **Planning task fidelity** (spec-writing / architectural judgment)
   - Tool: promptfoo YAML suite
   - Tasks: 10–15 fixed planning prompts drawn from real APEX planning sessions (sanitized), each with an `llm-rubric` assert graded by a lightweight judge model
   - Pass threshold: ≥90% rubric-pass rate; ≤5% regression from prior model baseline
   - Why promptfoo: local Ollama provider, YAML config, CI-compatible, tool-calling assert support [VERIFIED — https://www.promptfoo.dev/docs/providers/ollama/]

2. **Coding task fidelity** (code generation + correctness)
   - Tool: lm-evaluation-harness via OpenAI-compatible API
   - Tasks: HumanEval (164 Python problems) + MBPP (100-sample subset) + 5–10 APEX-specific coding tasks (e.g., "generate a SKILL.md frontmatter block matching spec")
   - Pass threshold: HumanEval pass@1 ≥ baseline − 3 points; MBPP ≥ baseline − 3 points; all custom tasks pass
   - Why lm-eval-harness: supports local OpenAI-compatible endpoints, used by industry, 200+ tasks available [VERIFIED — https://github.com/EleutherAI/lm-evaluation-harness]

3. **Tool-calling fidelity**
   - Tool: promptfoo with `tools` config (function-calling YAML)
   - Tasks: 10 fixed tool-call scenarios covering APEX's tool surface (Read, Edit, Glob, Grep, Bash, Write)
   - Pass threshold: ≥95% correct tool invocation (right tool, right parameters, no hallucinated tools)
   - Note: promptfoo's Ollama integration supports tool-calling for compatible models [VERIFIED — https://www.promptfoo.dev/docs/providers/ollama/]

4. **Regression on known-hard cases**
   - A curated set of 5 prompts that previously caused the current model to fail (collected during sessions)
   - Pass threshold: ≥3/5 improve or hold (not regress further)

**Gate outcome:**
- All 4 dimensions pass → promote new weights to production, update APEX handoff doc with new model version and scores.
- Any dimension fails → hold at current version, file in handoff doc under "Blocked Actions," flag for planning review.
- Estimated gate run time: ~2–3 hours on Mac Studio for HumanEval + custom tasks via local inference.

---

## Assumptions & Gaps

1. [ASSUMED] Mac Studio Ultra (192GB unified memory) is the target build machine. All hardware feasibility conclusions depend on this. If hardware is different (e.g., single RTX 4090 24GB), fine-tuning the 32B distill is not feasible.
2. [ASSUMED] Artemis RAG index uses a vector store compatible with LlamaIndex/LangChain (Chroma or Qdrant). If Artemis uses a proprietary store, reuse requires an adapter.
3. [ASSUMED] DeepSeek will continue publishing open weights under permissive licenses (MIT on V4). V5 license is unknown; if weights become non-redistributable, model-swap cadence may shift to API-only.
4. [ASSUMED] RAG compensates poorly for planning/judgment staleness (not well-validated). This is the biggest open question — a controlled experiment (RAG-augmented vs non-augmented on planning quality over 6 months) would close it.
5. [COMMUNITY — not independently verified] Two-stage fine-tuning (SFT + reinforcement) recovers from catastrophic forgetting on distills. The cited source is a practitioner blog, not a peer-reviewed result.
6. [GAP] No published benchmark delta comparing consecutive DeepSeek incremental releases (e.g., V3 → V3-0324) on APEX-relevant tasks. The eval gate design above is based on general best practice, not empirical APEX data.
7. [GAP] DeepSeek V4-Pro and V4-Flash LoRA feasibility: no community reports of fine-tuning the V4-Flash (284B, 13B active) on consumer hardware as of 2026-06-12. This is likely tractable on multi-GPU setups but untested.

---

## Sources

- [DeepSeek History: From Hedge Fund to V4 (2023-2026)](https://deepseekai.guide/guides/deepseek-history/)
- [DeepSeek Version History | V1, V2, V3, V4 Evolution Timeline](https://freedeepseekapi.com/history)
- [Timeline of DeepSeek — Timelines wiki](https://timelines.issarice.com/wiki/Timeline_of_DeepSeek)
- [DeepSeek V4 Preview Release — DeepSeek API Docs](https://api-docs.deepseek.com/news/news260424)
- [DeepSeek V4 Guide: Pro & Flash + R2/V5 Status (May 2026)](https://codersera.com/blog/deepseek-v4-complete-guide-2026/)
- [DeepSeek — Wikipedia](https://en.wikipedia.org/wiki/DeepSeek)
- [DeepSeek releases improved V3 AI model three months after initial launch — NotebookCheck](https://www.notebookcheck.net/DeepSeek-releases-improved-V3-AI-model-three-months-after-initial-launch.989270.0.html)
- [DeepSeek-V4-Flash — Hugging Face](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)
- [Promptfoo — Ollama provider docs](https://www.promptfoo.dev/docs/providers/ollama/)
- [Promptfoo Review 2026 — PE Collective](https://pecollective.com/tools/promptfoo/)
- [Promptfoo x Ollama x DeepSeek R1 — DEV Community](https://dev.to/ayush7614/promptfoo-x-ollama-x-deepseek-r1-turning-my-model-into-a-cyber-warzone-3ef5)
- [EleutherAI lm-evaluation-harness — GitHub](https://github.com/EleutherAI/lm-evaluation-harness)
- [LLM Eval Harness: Benchmark Any Model on 200+ Tasks (2026 Guide)](https://www.morphllm.com/llm-eval-harness)
- [HumanEval Benchmark — DataCamp](https://www.datacamp.com/tutorial/humaneval-benchmark-for-evaluating-llm-code-generation-capabilities)
- [Fine-Tuning DeepSeek V3 with LoRA — chat-deep.ai](https://chat-deep.ai/guide/fine-tuning-deepseek-v3-with-lora/)
- [DeepSeek Fine Tuning: The Complete 2026 Guide — chat-deep.ai](https://chat-deep.ai/guide/deepseek-fine-tuning/)
- [DeepSeek + QLoRA: Fine-Tune And Run Locally On 8GB VRAM — aicompetence.org](https://aicompetence.org/deepseek-qlora-fine-tune-and-run-locally/)
- [How Much VRAM Do You Need for LLM Fine-Tuning in 2026? — VRLA Tech](https://vrlatech.com/how-much-vram-do-you-need-for-llm-fine-tuning-in-2026/)
- [DeepSeek R1 VRAM Requirements — willitrunai.com](https://willitrunai.com/blog/deepseek-r1-vram-requirements-guide)
- [LoRA Learns Less and Forgets Less — arXiv](https://arxiv.org/pdf/2405.09673)
- [Fine-Tuning DeepSeek R1 Distilled 8B LLaMA using QLoRA — kennycason.com](https://kennycason.com/posts/2025-03-11-finetuning-deepseek-r1-distilled-8b-llama.html)
- [Distributed fine-tuning at scale: Deepseek-R1 — Nscale](https://www.nscale.com/blog/distributed-fine-tuning-at-scale-deepseek-r1)
- [RAG vs Fine-Tuning for LLMs (2026) — Umesh Malik](https://umesh-malik.com/blog/rag-vs-fine-tuning-llms-2026)
- [RAG vs Fine-Tuning for LLMs (2026) — DEV Community](https://dev.to/umesh_malik/rag-vs-fine-tuning-for-llms-2026-what-actually-works-in-production-10if)
- [From RAG to Context — 2025 year-end review — RAGFlow](https://ragflow.io/blog/rag-review-2025-from-rag-to-context)
- [8 Best RAG Tools Ranked for 2026 — TECHSY](https://techsy.io/en/blog/best-rag-tools)
- [Best RAG Tools and Vector Databases in 2026 — Awesome Agents](https://awesomeagents.ai/tools/best-ai-rag-tools-2026/)
- [15 Best Open-Source RAG Frameworks in 2026 — Firecrawl](https://www.firecrawl.dev/blog/best-open-source-rag-frameworks)
- [RAG in 2026: Architecture Shifts — Medium](https://medium.com/@elammarisoufiane/rag-in-2026-architecture-shifts-emerging-patterns-and-what-it-means-for-java-developers-6f2803e39787)
- [Build a Production-Ready RAG System (2026) — DEV Community](https://dev.to/dharshan_a_23835c7dc05682/build-a-production-ready-rag-system-over-your-own-documents-in-2026-a-practical-tutorial-4hd0)
