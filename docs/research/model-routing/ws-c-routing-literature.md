# WS-C: LLM Routing Literature — Routing by Complexity

**Phase:** 2 — Retrieval  
**Date:** 2026-06-21  
**Topic:** How production systems route tasks to models by complexity  
**Scope:** Routing systems survey, difficulty signals, cascade vs. upfront-route, batching, quality-floor gating

---

## 1. Routing Systems Survey

### 1.1 System Table

| System | Family | Signal(s) | Models | Cost/Quality Result | Source |
|--------|--------|-----------|--------|---------------------|--------|
| **RouteLLM** (LMSYS/Berkeley, ICLR 2025) | Upfront-route | Human preference data (Chatbot Arena 55k), LLM-judge augmentation, MMLU golden labels → BERT classifier / matrix factorization / SW-ranking / causal LLM | GPT-4 ↔ Mixtral 8x7B (transferable to any pair) | 95% GPT-4 quality at 14% GPT-4 calls (75% cost reduction, augmented); 85% cost reduction on MT Bench; 45% on MMLU; 35% on GSM8K | [VERIFIED] arxiv.org/abs/2406.18665 |
| **FrugalGPT** (Stanford, 2023) | Cascade | DistilBERT-based generation scoring function (reliability score per query+answer pair); learned threshold per LLM in sequence | LLM cascade (any sequence) | Up to 98% cost reduction matching GPT-4 accuracy; 4% accuracy gain at same cost; 80% cost reduction + 1.5% accuracy gain on HEADLINES vs GPT-4 | [VERIFIED] arxiv.org/abs/2305.05176 |
| **AdaptiveLLM** (2025) | Upfront-route | CoT length from DeepSeek-R1-Distill as difficulty proxy → k-means (3 clusters: easy/medium/hard) → CodeBERT triplet fine-tune → XGBoost classifier | 8 code models, 1.5B–33B | 7.86% pass@1 improvement over ComplexityNet; 88.9% cost reduction vs ComplexityNet; 73.6% of GPT-4o accuracy at 82.5% lower cost | [VERIFIED] arxiv.org/abs/2506.10525 |
| **IRT-Router** (ACL 2025) | Upfront-route | BERT query embeddings + LLM metadata embeddings → Item Response Theory latent variables (difficulty b, discrimination a, ability θ) | 20 LLMs across 12 datasets | 3% higher accuracy than GPT-4o at 1/30 GPT-4o cost (in-distribution); strong OOD generalization | [VERIFIED] arxiv.org/abs/2506.01048 |
| **xRouter** (2025) | Cascade + RL | Query + conversational context; pass@k rates for difficulty estimation; cost/capability catalog | Any model pool | Near-GPT-5 accuracy on Olympiad Bench at ~1/8 cost; 80–90% accuracy at <1/5 GPT-5 cost | [VERIFIED] arxiv.org/abs/2510.08439 |
| **ConsRoute** (2025) | Cascade | Prefill hidden-state embeddings (reused, no extra encoder) → cluster-specific Bayesian thresholds; reranker-based semantic consistency between tier responses | Cloud/edge/device tiers | ≥95% cloud performance at 40% latency/cost reduction | [VERIFIED] arxiv.org/abs/2603.21237 |
| **UniRoute** (2025) | Upfront-route | LLM feature vectors from representative prompt performance → cluster-based or learned cluster map | 30+ unseen LLMs | Quantified excess risk bounds; handles zero-shot new models | [VERIFIED] arxiv.org/abs/2502.08773 |
| **Triage** (2025, proposed eval) | Upfront-route | CodeHealth composite score (25+ sub-factors: cyclomatic complexity, coupling, file size, duplication, naming, test coverage) → heuristic rules or ML classifier | Light/Standard/Heavy (Haiku/Sonnet/Opus tiers) | Proposed on SWE-bench Lite (300 tasks); routing diagonal = worst-health file in touched set | [VERIFIED] arxiv.org/abs/2604.07494 |
| **Batch-Level Routing** (2025) | Upfront-route (batch) | Joint optimization across batch under cost + GPU constraints; robust variant handles performance uncertainty | Any pool | 1–14% accuracy improvement over non-robust; batch-level outperforms per-query by up to 24% under adversarial batching | [VERIFIED] arxiv.org/abs/2603.26796 |

### 1.2 Router Architecture Variants (RouteLLM detail)

RouteLLM trains four distinct routers on the same data, enabling comparison:

1. **Similarity-Weighted (SW) Ranking Router** — weighted Elo from prompt similarity to preference data; no LLM inference needed at routing time
2. **Matrix Factorization** — learns latent prompt/model compatibility scores; best result (95% quality at 14% strong-model calls with augmentation)
3. **BERT Classifier** — transformer embeddings → binary strong/weak prediction; under 10ms latency; no inference cost
4. **Causal LLM Classifier** — LLM predicts which model will win; highest latency, highest accuracy

Transfer learning result: routers trained on GPT-4/Mixtral transferred zero-shot to Claude 3 Opus/Llama 3 8B with comparable performance. [VERIFIED]

---

## 2. Difficulty / Complexity Estimation — Feature Taxonomy

### 2.1 Features That Predict Needing a Stronger Model

**Lexical / structural (pre-generation, cheap):**
- Query / task length in tokens (short → cheap model) [COMMUNITY]
- Presence of domain keywords: "debug", "refactor", "concurrency", "security", "auth" [COMMUNITY]
- Syntactic complexity of the prompt [COMMUNITY]
- Word rarity / idiomatic language [COMMUNITY]

**Embedding-based (moderate cost):**
- Semantic embedding distance from difficulty-labeled examples (IRT-Router, UniRoute, ConsRoute) [VERIFIED]
- Embedding similarity to cluster centroids derived from historical routing outcomes [VERIFIED]

**Code-specific static signals (Triage framework):**
- **Cyclomatic complexity** of touched files [VERIFIED — Triage, arxiv 2604.07494]
- **Coupling** (inter-module dependencies of changed files) [VERIFIED]
- **File size** (lines of code) [VERIFIED]
- **Duplication density** [VERIFIED]
- **Naming convention violations** [VERIFIED]
- **Test coverage** of touched code [VERIFIED]
- **Number of files touched** (Triage uses worst-health file as routing key — "one complex file can cascade failures") [VERIFIED]
- **CodeHealth composite** (1–10 aggregate of 25+ sub-factors): ≥9 → light; 5–8 → standard; 1–4 → heavy [VERIFIED]

**Reasoning-length proxy (AdaptiveLLM, 2025):**
- CoT length from a reasoning model (e.g., DeepSeek-R1-Distill): simple tasks ~6,832 tokens; complex tasks ~41,058 tokens [VERIFIED]
- K-means on CoT length (3 clusters) → difficulty tier → lightweight XGBoost routing [VERIFIED]

**Latent psychometric signals (IRT-Router, ACL 2025):**
- Item difficulty (b) and discrimination (a) estimated per query using IRT; model ability (θ) estimated per LLM [VERIFIED]
- Observable inputs: BERT query embedding + LLM metadata (release date, developer, description) [VERIFIED]

**Post-generation confidence signals (cascade-only):**
- Mean sequence log-probability of generated response [VERIFIED — survey, FrugalGPT]
- Token-level entropy / perplexity [VERIFIED]
- Self-reported model confidence tokens (Self-REF) [VERIFIED]
- Output diversity / consistency across multiple samples (ConsRoute, AutoMix) [VERIFIED]

### 2.2 Coding-Task-Specific Guidance

The strongest coding-specific signal identified in the literature (2025) is **CodeHealth / code quality of the files being touched**, used by Triage. The key insight: routing difficulty correlates with the *maintainability state of the target code*, not just the abstract task description. A "add a field" task in a file with cyclomatic complexity 40 and zero test coverage is harder than a "implement algorithm" task in a clean, well-tested file.

Secondary proxy confirmed by AdaptiveLLM: **CoT length from a reasoning model** correlates with human-labeled difficulty (LeetCode/Codeforces) and predicts pass@1 with an 8-model selection pool.

---

## 3. Cascade vs. Upfront-Route — Comparison

### 3.1 Family Definitions

**Family A — Upfront Route (predict-then-dispatch):**
A classifier or scoring function runs before any generation. Routes query to exactly one model. No generation happens until routing is complete.

**Family B — Verify-Then-Escalate (cascade):**
Cheap model generates first. A quality estimator scores the output. If score < threshold → escalate to next tier. Continues until quality passes or final tier is reached.

### 3.2 Head-to-Head Comparison

| Dimension | Upfront Route | Verify-Then-Escalate |
|-----------|---------------|---------------------|
| **Latency profile** | Classifier adds 5–50ms (BERT), 200–800ms (LLM judge); single generation path | Full first-model generation latency always paid; second model latency paid on escalation; total latency can be 2–3× for hard queries |
| **When it wins** | Query characteristics are clear upfront; task taxonomy is well-defined and stable; routing classifier has good coverage | Cheap model succeeds on most queries (high base pass rate); difficulty is hard to estimate without seeing model output; latency budget is generous |
| **Cost structure** | Pays classifier overhead on every query; saves expensive model calls for hard queries | Always pays cheap model cost; saves expensive model for failures only; total cost optimal when cheap model solves >50–70% |
| **Accuracy dependency** | Depends on classifier accuracy; errors send easy tasks to expensive models (overpay) or hard tasks to cheap models (quality failure) | Depends on quality estimator calibration; miscalibrated threshold → always cascade (cost defeat) or never cascade (no savings) |
| **Training requirements** | Needs labeled difficulty data or human preference pairs (RouteLLM: 55k Chatbot Arena pairs) | Needs calibrated quality estimator (DistilBERT scorer, logprob threshold, or verifier model) |
| **Latency SLO compatibility** | Viable for <300ms SLOs with BERT-class classifiers | Only viable for <300ms SLOs if cheap model is very fast; cascade adds full model round-trip |
| **Transfer across model pairs** | RouteLLM shows strong transfer (GPT-4/Mixtral → Claude/Llama zero-shot) | Quality estimator may need recalibration when models change |
| **Reported savings** | 75–85% cost reduction (RouteLLM MT Bench); 82.5% (AdaptiveLLM vs GPT-4o) | 59–98% (FrugalGPT); 40% latency+cost (ConsRoute) |

### 3.3 Hybrid Approach (Recommended in Practice)

Multiple sources [COMMUNITY — tianpan.co, zylos.ai] converge on a hybrid: **route first to avoid obviously mismatched tiers, then cascade within a tier**. Example:

```
Query → Rule-based pre-filter (keyword heuristic, length)
  → BERT classifier (5–15ms) → tier assignment
  → cheap model in that tier generates
  → logprob/confidence check
  → if below threshold → escalate within tier
```

The survey (arxiv 2603.04445) confirms: "real-world deployments rarely conform to a single paradigm" and combine both strategies.

---

## 4. Batching to Minimise Model Switches

### 4.1 Literature Coverage

The main routing survey (arxiv 2603.04445) **does not address batching** for minimizing model switches — confirmed gap. Coverage below is from batch-routing-specific papers and production engineering sources.

### 4.2 Batch-Level Routing (arxiv 2603.26796)

Joint optimization across a batch of queries simultaneously rather than per-query routing:
- Assigns models to batches respecting cost + GPU constraints as a joint optimization problem
- Robust variant accounts for prediction uncertainty
- **Result:** 1–14% accuracy improvement over per-query routing; up to 24% advantage under adversarial query distributions [VERIFIED]

### 4.3 Production Engineering Patterns [COMMUNITY — zylos.ai, portkey.ai]

- **Dynamic batching by assigned tier:** after routing decisions are made, requests assigned to the same model are batched together (50–100ms window) before dispatch — reduces per-request overhead and KV-cache fragmentation
- **Per-model batch size limits:** 7B model → batch size up to 128+; 70B on same GPU → batch size 8–16; batch configs must be model-specific
- **Cross-model decode merging:** requests from different task modules can merge into a unified decode batch if architectures allow (SUN framework, arxiv 2603.02599)
- **QoS tiers as batch buckets:** Realtime/Standard/Premium/Batch tiers map requests into latency-appropriate pools; Batch tier allows accumulation into larger, more efficient batches

### 4.4 Practical APEX Implication

For APEX's build pipeline (tasks are pre-planned, not interactive): batching is straightforward — score all tasks at plan time, group by assigned tier, dispatch tier-groups together. No latency pressure at routing time. This is a structural advantage over interactive systems.

---

## 5. Quality-Floor Gating Mechanisms

### 5.1 Mechanism Taxonomy

| Mechanism | Description | Cost | Calibration Required? | Source |
|-----------|-------------|------|----------------------|--------|
| **Log-probability threshold** | Mean sequence log-probability of generated output; low logprob → uncertain → escalate | Near-zero (uses generation logits) | Yes — threshold per domain | [VERIFIED] FrugalGPT, survey |
| **Token-level entropy** | Entropy of token probability distribution; high entropy → uncertain → escalate | Near-zero | Yes | [VERIFIED] survey |
| **DistilBERT scorer** | Small model (DistilBERT for regression) scores (query, response) pair for reliability | Cheap inference (<10ms) | Yes — trained on labeled data | [VERIFIED] FrugalGPT |
| **Confidence tokens (Self-REF)** | LLM fine-tuned to emit special confidence tokens after generation | Fine-tuning cost; zero inference overhead after | No — baked into model | [VERIFIED] survey |
| **Few-shot self-verification (AutoMix)** | LLM prompted to verify its own answer via few-shot examples | Adds ~1 inference call at cheap model cost | Minimal | [VERIFIED] survey |
| **Reranker semantic consistency (ConsRoute)** | Reranker compares responses from adjacent tiers; low semantic consistency → escalate | Reranker inference cost | Bayesian per-cluster | [VERIFIED] arxiv 2603.21237 |
| **Conformal Prediction (CP-Router)** | Conformal prediction on logits; calibration set derives coverage-guaranteed threshold | Calibration set required; inference near-zero | Yes — calibration split | [VERIFIED] survey |
| **LLM-as-Judge** | External model evaluates response quality | Full inference cost of judge model | No (but expensive) | [COMMUNITY] |
| **Test-pass signal** | Run tests/verification recipe against generated output; failure → escalate | Test execution cost | No — deterministic | [ASSUMED for coding tasks — no direct paper found] |
| **IRT scoring function** | 𝒮(q,M) = α·P̂(q,M) − β·C(M); probabilistic quality prediction balanced against cost | Lightweight inference post-training | Training required | [VERIFIED] IRT-Router |

### 5.2 Threshold Calibration

Most threshold-based mechanisms require domain-specific calibration [COMMUNITY — tianpan.co]:
- Benchmarks' thresholds rarely transfer to production distributions
- Re-calibrate monthly as traffic distribution shifts
- Shadow mode recommended before promoting new threshold to production

### 5.3 Quality Floor for Coding Tasks

For coding tasks, **test-pass signal is the natural quality floor** — if tests pass, cheap model output is sufficient; if they fail, escalate. This is deterministic, cheap to evaluate, and requires no calibration. No paper directly evaluates this as a cascade trigger, but it aligns structurally with Triage's verification gate and APEX's existing verification recipe pattern. [ASSUMED — inferred from Triage + APEX's own spec pattern]

---

## 6. Key Papers Index

| Paper | arXiv | Year | Relevance |
|-------|-------|------|-----------|
| RouteLLM: Learning to Route LLMs with Preference Data | 2406.18665 | 2024 | Core router framework, 4 variants, transfer learning |
| FrugalGPT: How to Use LLMs While Reducing Cost | 2305.05176 | 2023 | Cascade architecture, DistilBERT quality estimator |
| Dynamic Model Routing and Cascading for Efficient LLM Inference: A Survey | 2603.04445 | 2026 | Taxonomy, difficulty signals, quality-floor mechanisms |
| AdaptiveLLM: Selecting LLM for Code via CoT Length | 2506.10525 | 2025 | CoT-length difficulty, coding-specific, 8-model pool |
| Triage: Routing SE Tasks via Code Quality Signals | 2604.07494 | 2025 | Code health signals, 3-tier Haiku/Sonnet/Opus |
| IRT-Router: Multi-LLM Routing via Item Response Theory | 2506.01048 | 2025 | Latent difficulty modeling, 20 LLMs, cold-start |
| xRouter: Cost-Aware LLM Orchestration via RL | 2510.08439 | 2025 | RL-based routing, cost-aware reward function |
| ConsRoute: Consistency-Aware Adaptive Query Routing | 2603.21237 | 2025 | Prefill-based routing, semantic consistency gating |
| Robust Batch-Level Query Routing | 2603.26796 | 2025 | Batch-joint optimization, adversarial robustness |
| Universal Model Routing for Efficient LLM Inference | 2502.08773 | 2025 | Dynamic routing to unseen models |

---

## 7. NEEDS-DOMAIN Flags

- `NEEDS-DOMAIN: aclanthology.org` — IRT-Router full PDF is at aclanthology.org/2025.acl-long.761.pdf (full results table not fetchable without this domain)
- `NEEDS-DOMAIN: medium.com` — "Least Privilege for LLM Agents" post (risk-tiered model selection security framing)
- `NEEDS-DOMAIN: portkey.ai` — task-based LLM routing production patterns (partial data from search snippet only)
- `NEEDS-DOMAIN: dl.acm.org` — AdaptiveLLM full proceedings paper
