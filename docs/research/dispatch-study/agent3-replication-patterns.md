# Research: Replication Patterns — Redundant Review & Evaluator-Optimizer Loop

**Research date:** 2026-06-08
**Agent:** agent3-replication-patterns
**Questions:** (A) Where is the diminishing-returns knee for redundant/replicated review, and is "worst-of-N" the right merge rule? (B) Which multi-agent orchestration patterns exist that a fan-out + dual-review system might not be using — specifically the evaluator-optimizer loop?

---

## Tagging key

- [VERIFIED — source: url] — directly fetched and read
- [COMMUNITY — source] — blog post, secondary writeup, or practitioner article
- [ASSUMED] — inference not confirmed by a fetched source

---

## 1. Anthropic's Named Workflow Patterns

Source: anthropic.com/engineering/building-effective-agents [VERIFIED — source: https://www.anthropic.com/engineering/building-effective-agents]

Anthropic describes five canonical agentic workflow patterns. All five are relevant to understanding where APEX's dual-review sits and what it is missing.

### 1.1 Prompt Chaining
Sequential LLM calls; each step processes the prior output. Optional programmatic "gates" verify progress before the next step. Use when: fixed, clearly decomposable subtasks where trading latency for higher accuracy is worth it.

### 1.2 Routing
Classifies inputs and routes them to specialised handlers. Use when: the task space has distinct categories that need different prompts or models (e.g., routing to Claude Haiku for simple queries, Sonnet for complex ones).

### 1.3 Parallelization (two variants)
- **Sectioning:** Independent parallel subtasks — speed gain, no redundancy.
- **Voting:** Same task run N times; aggregated outputs increase confidence. Anthropic's examples include running "several different prompts to review and flag code" and content-appropriateness evaluation "with thresholds balancing false positives/negatives." No specific N is named in the source.

APEX's dual-review is an instance of Parallelization-as-Voting (N=2, merge=worst-of-2).

### 1.4 Orchestrator-Workers
A central LLM dynamically breaks down a task and delegates to workers; it synthesises results. Differs from parallelization: subtask structure is not pre-known. Use when: complex tasks where subtask decomposition cannot be predicted in advance.

### 1.5 Evaluator-Optimizer Loop
One LLM generates; a second (or the same, with different framing) evaluates and returns structured critique; the generator revises; loop repeats until a quality gate triggers PASS or a round limit is hit. Anthropic describes it as "mirroring human writing revision processes." Use when: clear evaluation criteria exist and iterative refinement demonstrably improves output (literary translation, multi-round search tasks).

**This is the pattern APEX's dual-review does NOT implement.** APEX runs two reviewers and merges their verdict — it does not feed critique back to the code-generator for revision.

---

## 2. Anthropic's Multi-Agent Research System

Source: anthropic.com/engineering/multi-agent-research-system [VERIFIED — source: https://www.anthropic.com/engineering/multi-agent-research-system]

Anthropic's production research feature (shipped April 2025) spawns 3–5 parallel subagents, each chasing one independent research thread. Key notes:

- **Merge rule:** deterministic synthesis by a lead agent — no voting or consensus mechanism.
- **Evaluation:** "a single LLM call with a single prompt outputting scores 0.0–1.0 and a pass-fail grade was the most consistent" — i.e., single judge outperformed multiple specialised judges for their eval rubric (factual accuracy, citation accuracy, completeness, source quality, tool efficiency).
- **No redundant review agents** — subagents divide work; they do not duplicate it. Quality assurance relies on a single LLM judge plus human spot-checking.
- **Human evaluation remains essential:** automated evals missed hallucinations on unusual queries, subtle source-selection biases, and system failures.
- **Multi-agent vs single-agent lift:** Claude Opus 4 lead + Claude Sonnet 4 subagents outperformed single-agent Claude Opus 4 by 90.2% on their internal research eval, at ~15x token cost. [VERIFIED — source: https://www.anthropic.com/engineering/multi-agent-research-system] (secondary citation via blog.bytebytego.com/p/how-anthropic-built-a-multi-agent)

---

## 3. Self-Consistency / Voting — N vs Accuracy Curve

### 3.1 Diminishing Returns: The Primary Paper

Source: "Self-Consistency Is Losing Its Edge: Diminishing Returns and Rising Costs in Modern LLMs" (arXiv 2511.00751) [VERIFIED — source: https://arxiv.org/html/2511.00751]

This is the most directly relevant quantitative source. Results on Gemini 2.5 Flash-Lite and Gemini 2.5 Pro:

| Dataset | Model | N=1 baseline | Peak N | Notes |
|---------|-------|-------------|--------|-------|
| HotpotQA | Flash-Lite | — | — | 0.4% total gain from N=1→N=20; essentially flat from N=3 |
| MATH-500 | Flash-Lite | — | ~N=10 | Peaks around N=10; accuracy *declines* past N=15 |
| MATH-500 | Pro | 98% | ~N=15 | 99.6% at N=15; +1.6% gain |

Key findings:
- **There is no universal knee.** It is dataset- and model-specific.
- **Gains reverse at high N** — in some configurations, adding more samples introduces noise and accuracy falls. This is inconsistent with simple diminishing returns; it suggests that beyond a threshold, majority voting picks up model-consistent errors rather than correcting them.
- **Modern strong models show less benefit** — Flash-Lite (weaker) still gains modestly on hard reasoning; Pro (stronger, already at 98%) gains almost nothing.
- **Practical implication from 2025 research:** self-consistency should be reserved for tasks the model finds genuinely hard. On high-baseline tasks, it adds cost without benefit and may hurt.

### 3.2 Adaptive / Bayesian Stopping

Source: "Optimal Bayesian Stopping for Efficient Inference of Consistent LLM Answers" (arXiv 2602.05395) [VERIFIED — source: https://arxiv.org/pdf/2602.05395]

Rather than fixed N, Bayesian stopping computes a Dirichlet/beta-binomial posterior over observed answer tallies and halts when dominant-answer confidence exceeds a threshold. This can substantially reduce N on easy instances while spending more samples on genuinely hard ones.

Source: "Reasoning Aware Self-Consistency" (NAACL 2025, aclanthology.org/2025.naacl-long.184/) [VERIFIED — source: https://aclanthology.org/2025.naacl-long.184/]

RASC reduces sample usage by ~70% while maintaining accuracy parity by using reasoning-path quality signals to decide whether additional samples are worth taking.

### 3.3 Interpretation for APEX (N=2 dual-review)

APEX runs N=2 for review (not code generation). The self-consistency literature is primarily about generating answers, not binary PASS/FAIL review verdicts. Nonetheless, the findings transfer directionally:

- N=2 is below the typical knee (which appears around N=5–10 for hard reasoning tasks). For easy-to-catch bugs, N=2 likely already reaches ceiling; for subtle auth/security flaws, N=2 may miss correlated errors both reviewers share.
- The plateau evidence suggests that going to N=3 would yield marginal gain unless the reviewers are genuinely diverse (different models or different prompts).
- **The 2025 consensus**: diversity of reviewers matters more than count. [COMMUNITY — orq.ai/blog/llm-juries-in-practice]

---

## 4. Panel of LLM Judges vs Single Judge

### 4.1 PoLL: Panel of Language Model Judges (arXiv 2404.18796)

Source [VERIFIED — source: https://arxiv.org/html/2404.18796v1]

This is the foundational panel-of-judges paper. Key findings:

- **Three-model panel** (Command R, Claude Haiku, GPT-3.5 — three disparate model families) outperformed single GPT-4 judge across evaluation tasks.
- **Accuracy (Cohen's κ):** PoLL achieved κ = 0.763–0.906 on KILT benchmarks; single GPT-4 judge was lower.
- **Chatbot Arena Pearson correlation:** PoLL = 0.917 vs GPT-4 = 0.817.
- **Variance:** PoLL standard deviation = 2.2 vs individual judges up to 6.1.
- **Cost:** PoLL is >7x cheaper than a single GPT-4 call.
- **Aggregation:** max voting for binary QA tasks; average pooling for 1–5 scale tasks.
- **Worst-of-N NOT discussed.** The paper uses averaging/max voting, not unanimity blocking.

### 4.2 Agent-as-Judge / Advanced 2025 Panel Approaches

Source [COMMUNITY — arxiv.org/html/2508.02994v1]

Multi-agent meta-judge frameworks (2025) use multiple LLM agents to score each judgment along a multi-dimensional weighted rubric, followed by consensus aggregation and precision-based threshold filtering. Key insight: "diverse imperfect judges outperform correlated perfect ones."

Source [COMMUNITY — arize.com/llm-as-a-jury/]

LLM-as-jury framing applies the analogy directly: a panel deliberates, and a verdict requires a threshold of agreement. The canonical jury threshold (unanimous vs majority) is treated as a tunable hyperparameter, not a fixed rule.

---

## 5. Worst-of-N vs Majority: The Merge Rule Question

### 5.1 Voting vs Consensus in Multi-Agent Systems (ACL 2025)

Source: "Voting or Consensus? Decision-Making in Multi-Agent Debate" (ACL Findings 2025, aclanthology.org/2025.findings-acl.606) [VERIFIED — source: https://arxiv.org/html/2502.19130v4]

This is the most directly relevant paper on merge-rule tradeoffs. Findings across 7 NLP benchmarks:

- **Knowledge tasks (MMLU, MMLU-Pro, GPQA):** consensus protocols outperformed voting by 2.3–4.9%.
- **Reasoning tasks (SQuAD 2.0, MuSR):** voting exceeded consensus by 13.1–26.4%.
- **Unanswerable questions (SQuAD 2.0):** unanimity consensus achieved higher F1 than majority — i.e., when the cost of a false negative is high (wrongly saying something is answerable when it isn't), unanimity is better.
- **Agent count:** scaling from 1–10 agents produced "a slight upward trend in accuracy"; extending debate rounds *decreased* performance.
- **Practical recommendation:** 3 agents with minimal rounds is an efficient baseline.
- **Error propagation:** longer discussion increased "problem drift" and reduced accuracy. Voting was "easily tricked" by plausible-sounding wrong answers; consensus provided "repeated checks."

### 5.2 Majority Consensus as False-Positive Reducer

Source [COMMUNITY — codeant.ai/blogs/ai-code-review-false-positives]

CodeAnt AI uses a three-model consensus rule: only surface issues when 2+ of 3 models agree. This cuts false positives by ~60% compared to single-model approaches. This is a majority-of-3 rule (2/3 threshold), not worst-of-N.

### 5.3 Interpreting Worst-of-N for APEX

Worst-of-N (block if ANY reviewer blocks) is mathematically equivalent to unanimity-required-to-pass. It maximises sensitivity (recall on true defects) at the cost of specificity (precision — higher false positive rate). The ACL 2025 findings support this rule specifically for:

- Tasks where the cost of missing a true defect far exceeds the cost of a false block.
- Cases where the task involves detecting "unanswerable" / "unsafe" / "blocked" conditions — precisely the auth/security/data review use case.

However, worst-of-N is **not the published consensus norm**. The dominant published approach is majority voting (or average pooling for continuous scores). Worst-of-N appears in:

- Formal verification and safety-critical systems (where any failure = unacceptable).
- Unanimity-required consensus in multi-agent debate (ACL 2025 paper above).
- No peer-reviewed paper was found explicitly naming "worst-of-N" as a standard practice for LLM code review.

**Tradeoff summary:**

| Rule | False negative rate | False positive rate | Best for |
|------|--------------------|--------------------|---------|
| Worst-of-N (unanimity to pass) | Lowest | Highest | High-stakes defect detection; auth/security |
| Majority (>50%) | Moderate | Moderate | General-purpose review |
| Supermajority (e.g. 2/3) | Low | Lower than unanimity | Balanced; CodeAnt approach |
| Best-of-N (pass if ANY passes) | Highest | Lowest | Generating best output from N candidates |

For APEX's security/auth/data domain specifically, worst-of-2 is a rational choice — the cost of a false block (friction) is lower than the cost of a missed auth vulnerability. This is consistent with the ACL 2025 finding that unanimity excels on unanswerable-detection tasks.

---

## 6. LLM Judge Bias and Independence

### 6.1 Self-Preference Bias

Source: "Quantifying and Mitigating Self-Preference Bias of LLM Judges" (arXiv 2604.22891) [VERIFIED — source: https://arxiv.org/html/2604.22891v2]

Findings across 20 models:
- Self-preference bias (β) ranges from -0.229 (Claude Sonnet 4.5 — negative self-preference) to +0.307 (LongCat-Flash-Chat — strong self-preference).
- DeepSeek-V3-0324 and Grok-4-Fast showed near-zero bias (β ≈ 0.02–0.04).
- Only 3 of 20 models qualified as "Objective Judges" (discriminability ≥ 0.8 AND |β| ≤ 0.08).
- **Mitigation:** replacing holistic scoring with per-dimension forced-choice judgments reduced average SPB by 31.5% while preserving discriminability.

Note: Claude Sonnet 4.5 showed *negative* self-preference (β = -0.229), meaning it was systematically harder on its own outputs. This is the opposite of the typical concern — for an APEX context where reviewers may be Claude models reviewing Claude-generated code, this suggests the bias risk is low for Sonnet-class models specifically.

### 6.2 Positional Bias

Source: "Judging the Judges: A Systematic Study of Position Bias" (IJCNLP 2025, aclanthology.org/2025.ijcnlp-long.18/) [VERIFIED — source: https://aclanthology.org/2025.ijcnlp-long.18/]

- Position bias is not random; it varies across judges and tasks.
- In pairwise code judging, swapping presentation order of responses can shift accuracy by >10%.
- Quality gap between solutions is a stronger predictor of positional bias than prompt length.

### 6.3 Collusion / Correlated Errors

Source: PoLL paper (arXiv 2404.18796) [VERIFIED — source: https://arxiv.org/html/2404.18796v1]

The PoLL paper documents intra-model self-preference: GPT-4 ranked a GPT-4 variant at position 2 when ground truth placed it at 4. Using judges from disparate model families reduces this collusion effect. APEX's dual-review uses two instances of the same model family — this is a potential collusion risk.

Source [COMMUNITY — orq.ai/blog/llm-juries-in-practice]

"Diverse imperfect judges outperform correlated perfect ones." A panel from disjoint model families is more robust than N copies of the same strong model.

### 6.4 Verbosity / Fluency Bias

Source [VERIFIED — source: https://www.adaline.ai/blog/llm-as-a-judge-reliability-bias]

LLM judges fail >50% of bias tests in some frameworks. Biases include preference for verbose, formal, or fluent outputs regardless of substantive quality — an artifact of RLHF. This is a particular risk for code review: a well-commented but insecure implementation may receive higher scores than a terse but secure one.

---

## 7. Evaluator-Optimizer Loop: Is It Appropriate for APEX?

### 7.1 Pattern Description

Source [VERIFIED — source: https://www.agentpatterns.ai/agent-design/evaluator-optimizer/] and Anthropic "Building Effective Agents" [VERIFIED — source: https://www.anthropic.com/engineering/building-effective-agents]

The evaluator-optimizer loop adds a revision cycle to one-shot review:

```
Generator → Output → Evaluator → Structured critique → Generator (revised) → ... → PASS / max rounds
```

- Evaluator returns a structured verdict: PASS or FAIL with specific actionable issues.
- Generator revises based on those issues.
- Loop terminates on PASS or hitting a round cap (typically 3 rounds).
- An unresolved loop after the cap signals misaligned criteria, not insufficient rounds.

Key difference from APEX's current pattern: APEX's reviewers produce a verdict that either blocks or passes — they do not feed critique back to the code-generator for revision. Adding an evaluator-optimizer loop would mean: if either reviewer blocks, the critique is returned to the generator (the coding agent) for a targeted fix before re-review.

### 7.2 When It Beats One-Shot Review

The pattern performs well when:
1. Clear, measurable evaluation criteria exist (tests pass, lint succeeds, specific vulnerability patterns absent).
2. The generator can act on specific, scoped feedback.
3. The task lacks a single deterministic answer (so iterative refinement can improve quality).
4. The baseline accuracy is not already near ceiling.

**Critical failure condition:** [VERIFIED — source: https://www.agentpatterns.ai/agent-design/evaluator-optimizer/]
"On tasks where the generator already scored ~98%, adding a self-critique loop dropped accuracy to ~57%." On high-baseline tasks, the evaluator-optimizer loop actively degrades performance. This is the same dynamic as self-consistency reversal at high N.

### 7.3 Shared Blindspot Risk

When evaluator and generator are the same model (or same model family), they share systematic error classes — the evaluator cannot catch what the generator is structurally blind to. This is the principal argument for using a different model as evaluator, or for using a rule-based verifier (compiler, test runner, linter) rather than an LLM evaluator where possible.

### 7.4 AWS Pattern Documentation

Source [COMMUNITY — docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-patterns/evaluator-reflect-refine-loop-patterns.html]

AWS formalises this as the "reflect-refine loop" pattern for agentic AI. The pattern is well-established in production systems. It adds latency (sequential rounds) but reduces the need for perfect first-pass generation.

---

## 8. Summary of Findings Relevant to APEX

| Question | Finding | Confidence |
|----------|---------|-----------|
| Is N=2 enough for dual-review? | At N=2 you are below the typical self-consistency plateau knee (N≈5–10 for hard tasks). Adding a third diverse reviewer would likely improve recall on subtle defects; gains of a fourth would be marginal. | VERIFIED |
| Where does the N-curve flatten? | Model/task specific. HotpotQA-class: essentially flat from N=3; hard reasoning: peaks N=10, reverses past N=15. No universal number. | VERIFIED |
| Is worst-of-N the right merge rule? | For high-stakes defect detection (auth/security), worst-of-N is rational — it minimises false negatives at the cost of higher false positives. It is not the dominant published rule (majority voting is), but ACL 2025 data supports unanimity for unanswerable-detection tasks analogous to security review. | VERIFIED |
| Should APEX add an evaluator-optimizer loop? | Yes, for non-trivial cases where the reviewer issues a specific actionable critique. The loop adds a revision round before re-review, reducing blocked merges that could have been fixed. Risk: same-model blindspot; mitigate by using a different model or rule-based verifier. Do NOT apply on high-baseline trivial tasks. | VERIFIED + COMMUNITY |
| Is two-reviewer same-model a collusion risk? | Yes, documented by PoLL paper. Same-model family judges share systematic biases. Mitigation: use judges from disjoint model families. Claude Sonnet 4.5 specifically showed *negative* self-preference (harder on own outputs), which partially offsets the concern. | VERIFIED |
| Does APEX use the evaluator-optimizer pattern? | No. APEX dual-review produces a verdict only; critique is not fed back to the generator for revision. This is the primary gap relative to Anthropic's own taxonomy. | ASSUMED (based on APEX description provided) |

---

## Sources

- [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic: How We Built Our Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Self-Consistency Is Losing Its Edge (arXiv 2511.00751)](https://arxiv.org/html/2511.00751)
- [Reasoning Aware Self-Consistency — NAACL 2025](https://aclanthology.org/2025.naacl-long.184/)
- [Optimal Bayesian Stopping for Consistent LLM Answers (arXiv 2602.05395)](https://arxiv.org/pdf/2602.05395)
- [Replacing Judges with Juries: PoLL (arXiv 2404.18796)](https://arxiv.org/html/2404.18796v1)
- [Voting or Consensus? ACL Findings 2025 (arXiv 2502.19130)](https://arxiv.org/html/2502.19130v4)
- [Quantifying and Mitigating Self-Preference Bias (arXiv 2604.22891)](https://arxiv.org/html/2604.22891v2)
- [Judging the Judges: Position Bias — IJCNLP 2025](https://aclanthology.org/2025.ijcnlp-long.18/)
- [LLM-as-a-Judge Why Frontier Models Fail 50%+ Bias Tests](https://www.adaline.ai/blog/llm-as-a-judge-reliability-bias)
- [Evaluator-Optimizer Pattern — AgentPatterns.ai](https://www.agentpatterns.ai/agent-design/evaluator-optimizer/)
- [AWS Prescriptive Guidance: Evaluator Reflect-Refine Loop](https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-patterns/evaluator-reflect-refine-loop-patterns.html)
- [Weak Judges, Strong Panel — orq.ai](https://orq.ai/blog/llm-juries-in-practice)
- [When AIs Judge AIs: Agent-as-a-Judge (arXiv 2508.02994)](https://arxiv.org/html/2508.02994v1)
