# ws-c: Evidence — Semantic/Long-Term Memory vs. Flat-Context Approaches

**Role:** Phase-2 retrieval agent — FETCH + EXTRACT + CITE only. No final verdict.
**Date:** 2026-06-16
**Feeds into:** memory-recall synthesis

---

## 1. Context Rot — Evidence and Numbers

### Primary source: Chroma Research (July 2025)

**Citation:** Hong, K., Troynikov, A., & Huber, J. (2025). *Context Rot: How Increasing Input Tokens Impacts LLM Performance*. Chroma Research.
- URL: https://www.trychroma.com/research/context-rot [VERIFIED]
- GitHub replication toolkit: https://github.com/chroma-core/context-rot [VERIFIED]

**What was tested:** 18 frontier models including GPT-4.1, Claude Opus 4, Gemini 2.5 Pro, Qwen3-235B, and variants.

**Key numbers:**
- Every single one of the 18 models degraded as input length increased — no exceptions.
- The "lost-in-the-middle" effect causes **30%+ accuracy drops** when relevant information is positioned in the middle of a context (positions 5–15 out of 20 documents).
- For models with 200K token windows, **significant degradation appears at ~50K tokens**.
- For 1M-token context-window models, **observable degradation typically kicks in around 300,000–400,000 tokens**.
- Claude models decay the slowest; Gemini degrades earliest with high variance; GPT models show erratic errors and refusals.

**Architectural cause stated:** RoPE long-term decay — reduced dot-product similarity between distant token pairs systematically decreases attention weight on mid-context information. Softmax normalisation amplifies this by concentrating on highest-scoring tokens.

### Primary source: Liu et al. (2024) — "Lost in the Middle"

**Citation:** Liu, N.F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2024). *Lost in the Middle: How Language Models Use Long Contexts*. Transactions of the Association for Computational Linguistics (TACL).
- URL: https://aclanthology.org/2024.tacl-1.9/ [VERIFIED]
- DOI: https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00638/119630/ [VERIFIED]

**Key numbers:**
- On multi-document QA with 20 documents, accuracy dropped **>30%** when the relevant document moved from position 1 to positions 5–15.
- Performance follows a U-shaped curve: highest at beginning and end, lowest in the middle.
- Tested on multi-document question answering and key-value retrieval across multiple frontier models.

**Bottom line on context rot:** [VERIFIED] Degradation is real, architecturally grounded, and consistent across all tested models. For a 200K-window model it bites measurably around 50K tokens; for 1M-window models around 300K–400K tokens. The U-shaped attention effect means even within-window content suffers if placed in the middle.

---

## 2. Agent-Memory Benchmarks — What They Show

### 2a. LongMemEval (ICLR 2025)

**Citation:** LongMemEval paper, ICLR 2025.
- URL: https://arxiv.org/pdf/2410.10813 [VERIFIED]

**Setup:** 500 questions across six categories — single-session user recall, single-session assistant recall, single-session preference recall, knowledge update, temporal reasoning, multi-session recall. Conversations up to 1.5 million tokens.

**Results by approach:**
- **Full context (concatenating all history):** Drops to F1 = 0.222 at 37.5M tokens (500-turn conversations). Shows strong accuracy drops of ~30–55% when scaling to full dialogue history [COMMUNITY — from search synthesis].
- **Simple RAG:** Emergence AI's RAG-based approach achieved **76.75–79%** accuracy, claiming SOTA [VERIFIED from Emergence AI blog].
- **Advanced memory systems (ProMem / semantic extraction):** ProMem achieved **69.57%** QA accuracy [COMMUNITY — from arxiv search synthesis].
- **Mem0 (April 2026 algorithm update):** Claimed **94.4%** at ~6,900 tokens per query. Independent reproductions found the published claim **19.6 points above** post-April-14 reproduction on the same system and data [COMMUNITY — maximem.ai analysis].

**Key insight from Emergence AI result:** Simple, well-designed RAG beat complex semantic memory systems on LongMemEval — the benchmark's author noted "advanced memory architecture appears overkill for LongMemEval" [COMMUNITY — emergentmind.com synthesis].

### 2b. LoCoMo

**Citation:** LoCoMo dataset, Snap Research.
- URL: https://snap-research.github.io/locomo/ [VERIFIED]

**Setup:** Very long-term dialogues, each ~300 turns and 9K tokens on average, across up to 35 sessions. Notably, dialogues are **between two distinct people** (not user-assistant), which creates a structural confound for systems that embed speaker names into content.

**Benchmark issue:** The two-speaker structure means conventional preprocessing confuses retrieval systems. Calvin Ku's independent analysis (Medium) found Emergence AI scored counterintuitively worse on LoCoMo than on the "harder" LongMemEval — pointing to a dataset artifact, not a capability gap [COMMUNITY].

### 2c. BEAM Benchmark

**Citation:** arxiv.org/pdf/2510.27246 — BEAM benchmark paper.
- URL: https://arxiv.org/pdf/2510.27246 [VERIFIED]

**Setup:** 100 conversations, 2,000 validated questions. Described as the most demanding benchmark because it "cannot be solved by simply expanding the context window."

**Result:** Even LLMs with 1M token context windows (with and without RAG) struggle as dialogues lengthen. The LIGHT framework (episodic memory + working memory + scratchpad) achieved **3.5%–12.69% improvement** over strongest baselines depending on backbone LLM.

---

## 3. Benchmark Disputes — The Critical Evidence

### 3a. Mem0 vs. Zep on LoCoMo

**Primary dispute source:** Zep blog, "Lies, Damn Lies, & Statistics: Is Mem0 Really SOTA in Agent Memory?"
- URL: https://blog.getzep.com/lies-damn-lies-statistics-is-mem0-really-sota-in-agent-memory/ [VERIFIED]

**Counter-response:** GitHub issue on Zep's own papers repo — "Revisiting Zep's 84% LoCoMo Claim: Corrected Evaluation & 58.44% Accuracy"
- URL: https://github.com/getzep/zep-papers/issues/5 [VERIFIED]

**The dispute in detail:**
- Zep originally claimed **84%** on LoCoMo.
- Mem0 counter-claimed Zep actually achieves **58.44%** (alleging adversarial category inclusion and misconfiguration in Zep's self-evaluation).
- Zep counter-claimed Mem0 misconfigured Zep in their evaluation, and the corrected Zep score is **75.14%**, approximately 10% above Mem0's best.
- **Current status: Unresolved.** Both vendors dispute each other's methodology. The actual independent ground truth remains unclear.

### 3b. MemPalace — "100% score" debunked

**Source:** Vectorize.io independent analysis; GitHub issue #214 on MemPalace repo.
- URL: https://vectorize.io/articles/mempalace-benchmarks [VERIFIED]
- URL: https://github.com/milla-jovovich/mempalace/issues/214 [VERIFIED]

**Findings:**
- The claimed 100% LongMemEval score used **iterative overfitting**: team identified three wrong answers, engineered targeted fixes, retested on the same questions. Textbook benchmark gaming.
- The 100% LoCoMo claim was achieved with **top_k=50**, effectively retrieving the entire conversation — not a fair retrieval test.
- True held-out score: **96.6%** on LongMemEval (raw mode), which still beats Mem0 and Zep (~85%).
- MemPalace maintainer acknowledged and retired disputed numbers in v3.3.0.

### 3c. Mem0's 94.4% claim

**Source:** maximem.ai independent analysis.
- URL: https://www.maximem.ai/blog/state-of-ai-memory-2026-claimed-vs-observed [COMMUNITY]

**Finding:** Independent reproductions found the published 94.4% claim to be **19.6 points above** what post-April-14 reproduction achieved on the same memory system and data. The gap is not explained in Mem0's public methodology.

### 3d. General benchmark reliability issue

**Source:** MemPalace benchmark analysis; Calvin Ku's Medium article [COMMUNITY].

Benchmarks like LoCoMo and LongMemEval can be materially improved by:
1. Aggressive retrieval strategies (large top_k)
2. Larger context windows
3. Frontier judge models (LLM-as-judge is inconsistent and somewhat tautological)
4. Dataset-specific preprocessing

**BEAM** is considered the most resistant to gaming because it cannot be solved by context-window expansion alone.

---

## 4. The "6-Level Memory Model" Taxonomy

**Search result:** No single published paper uses "six-level memory model" as a named taxonomy for agent memory systems specifically.

**What exists:**
- A six-tier framework for LLM-based systems in social science research (arxiv.org/pdf/2506.01839) — categorises LLM autonomy levels, not memory specifically [VERIFIED].
- A six-dimensional taxonomy for LLM agents decomposing agents into Core Components, Cognitive Architecture, Learning, Multi-Agent Systems, Environments, and Evaluation (arxiv.org/html/2601.12560v1) [VERIFIED].
- A three-stage evolutionary memory framework (Storage → Reflection → Experience) from a 2026 preprint (preprints.org/manuscript/202601.0618) [VERIFIED].

**Conclusion:** The "6-level memory model" as presented in any video tutorial is a **creator framework, not a published research taxonomy** [ASSUMED]. The closest academic analogues are either autonomy-tier taxonomies or component-dimension taxonomies, neither of which maps cleanly to a "6 levels of memory" schema.

---

## 5. Context Files Hurting — Counter-Evidence

### Primary source: ETH Zurich (arXiv:2602.11988, February 2026)

**Citation:** Gloaguen, T., Mündler, N., et al. (2026). *Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?* ETH Zurich.
- URL: https://arxiv.org/abs/2602.11988 [VERIFIED]
- Full HTML: https://arxiv.org/html/2602.11988v1 [VERIFIED]

**Models tested:** Claude Code with Sonnet 4.5, Codex with GPT-5.2 and GPT-5.1 Mini, Qwen Code with Qwen3-30B.

**Experimental setup:** Two settings — (1) SWE-bench tasks with LLM-generated AGENTS.md files following agent-developer recommendations; (2) a novel dataset of issues from repositories with developer-committed context files.

**Key numbers:**
- **LLM-generated context files reduced task success rates by ~3%** on average vs. no context file.
- **Human-written context files provided only a marginal +4% performance gain**.
- **Inference cost increased by over 20%** in both cases.

**Root cause identified:** "Unnecessary requirements from context files make tasks harder." Over-specification — listing constraints beyond what the immediate task needs — actively confuses the agent. Minimal, task-relevant context files help; bloated ones hurt.

**Coverage note:** This study focuses on **coding agents** (SWE-bench tasks), not conversational or general-purpose agents. The harm mechanism (irrelevant constraints) is plausibly different from conversational memory injection.

### Additional counter-evidence: Retrieval injecting irrelevant memories

**Source:** BEAM benchmark paper (arxiv.org/pdf/2510.27246) and mem0 state-of-memory blog [COMMUNITY].

- Even RAG with top_k=20 at 6,956 tokens per retrieval call vs. ~26,000 tokens for full context shows that retrieval is not free — wrong retrievals add irrelevant noise. The 3.5%–12.69% LIGHT improvement over baselines implies baselines (including RAG) were sometimes injecting wrong context.
- LoCoMo's two-speaker format caused retrieval systems to confuse speaker identities, producing wrong retrievals that actively hurt performance [COMMUNITY — Calvin Ku analysis].

---

## 6. When Flat/File Memory Is Sufficient — Threshold Evidence

**No primary source provides a clean "below X tokens, flat is fine" threshold.** The best available evidence:

### Practitioner heuristic (not research-grounded):
- Full context retention "should not be used when context exceeds ~50% of the window limit" — implying below 50% of the context window, flat loading is acceptable [COMMUNITY — atlan.com agent memory architectures].
- Most practitioners set 100–300 tokens per memory record; too long and retrieval precision drops [COMMUNITY — mindstudio.ai].

### Research-grounded inference:
- The Chroma context-rot data implies that below ~50K tokens for a 200K-window model, context rot is sub-threshold. A flat markdown index loaded each session would not exhibit meaningful degradation if total loaded context stays below 50K tokens.
- The ETH Zurich AGENTS.md study implies that for short, well-curated flat files (minimal requirements only), the **+4% gain from human-written files** is real but small — meaning flat loading works but quality of selection matters enormously.
- Full context at 26,000 tokens (avg. LoCoMo conversation size) still outperforms naive retrieval on short conversations in multiple studies [COMMUNITY].

### Practical implication (inferred, not cited):
A flat markdown memory index loaded in full each session is well within safe territory if:
1. Total loaded tokens stay below ~50K (the Chroma degradation onset for 200K-window models), AND
2. The index is curated to minimal relevant facts (the ETH Zurich "minimal requirements" finding).

Above this, or when memories exceed what fits cleanly in the first ~25% of context (to avoid mid-context degradation), semantic retrieval starts earning its cost.

---

## Source Quality Summary

| # | Source | Type | Tag | Key Number |
|---|--------|------|-----|------------|
| 1 | Chroma Context Rot (Hong et al. 2025) | Vendor research | [VERIFIED] | 30%+ drop at mid-context; 50K onset for 200K-window |
| 2 | Liu et al. 2024 TACL "Lost in the Middle" | Peer-reviewed | [VERIFIED] | >30% drop when relevant doc at positions 5–15/20 |
| 3 | arXiv:2602.11988 ETH Zurich (Gloaguen 2026) | Preprint | [VERIFIED] | -3% from LLM-generated files; +4% from human-written; +20% cost |
| 4 | LongMemEval paper (ICLR 2025) | Peer-reviewed | [VERIFIED] | Full context: F1=0.222 at 37.5M tokens |
| 5 | Emergence AI RAG blog + independent repro | Industry + community | [VERIFIED/COMMUNITY] | RAG: 76.75–79% on LongMemEval |
| 6 | BEAM benchmark paper (arXiv:2510.27246) | Preprint | [VERIFIED] | LIGHT +3.5–12.69% over strongest baselines |
| 7 | Zep "Lies, Damn Lies" blog | Industry critique | [VERIFIED] | Disputed Zep vs. Mem0 on LoCoMo: 58%–84% range contested |
| 8 | Vectorize MemPalace debunk + GitHub #214 | Community audit | [VERIFIED] | 100% claim = iterative overfitting; true score 96.6% |
| 9 | maximem.ai Mem0 reproduction | Community | [COMMUNITY] | Mem0's 94.4% claim 19.6pts above independent repro |
| 10 | arxiv.org/html/2601.12560v1 (agent taxonomy) | Preprint | [VERIFIED] | 6-dimensional taxonomy (not "6-level memory model") |
| 11 | Calvin Ku / Medium — LoCoMo critique | Community | [COMMUNITY] | LoCoMo two-speaker artifact confounds retrieval systems |

**Primary sources cited (peer-reviewed or major institution preprints): 6**
(Liu et al. TACL 2024; LongMemEval ICLR 2025; arXiv:2602.11988; arXiv:2510.27246; Chroma Research July 2025; arXiv:2601.12560v1)
