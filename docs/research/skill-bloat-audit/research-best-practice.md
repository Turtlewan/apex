# Skill-Bloat Audit: External Best-Practice Research
_Date: 2026-06-22 | Researcher: Claude Sonnet 4.6_

---

## Q1 — Lean Agent Instructions / What Skills Should and Should Not Contain

**Core principle confirmed:** Instructions should encode what the model doesn't already know; everything else is noise that adds cost without adding capability.

### What authorities say a skill/system prompt SHOULD contain
- **Task-specific context the model cannot infer**: current framework versions, project-specific tool names, bespoke build commands, org-specific conventions not in training data. [VERIFIED — arXiv:2602.11988 (AgentMD), The Decoder coverage]
- **Positive action directives** phrased as "always do X" (higher compliance than negative forms — see Q4). [COMMUNITY — LessWrong agent-safety study]
- **Minimum viable routing information**: which tools to call in which order, with concrete examples where ambiguity is high. [VERIFIED — buildmvpfast.com system-prompt-design-best-practices-llm-instructions-engineering-2026]
- **Precise task-scoped constraints**: narrow scope locks (files, APIs, output format) that cannot be inferred from the request alone. [VERIFIED — Google Developers Blog, multi-agent production architecture]

### What skills/system prompts should NOT contain
- **Information already in training data**: general programming best practices, well-known framework idioms, common error-handling patterns. Redundant content increases reasoning token consumption 14–22% (GPT models) with no success-rate gain. [VERIFIED — arXiv:2602.11988]
- **Documentation already present in the repository**: agents can discover it; re-stating it creates "cognitive load without reducing the search space." [VERIFIED — arXiv:2602.11988 / The Decoder]
- **Speculative guidance** ("you might want to…", "consider whether…"): every injected sentence forces the model to evaluate relevance, spending reasoning tokens whether acted on or not. [COMMUNITY — Infralovers context-engineering article, 2026-03-19]
- **Rationale paragraphs and design history**: the *why* does not change what gets built; it just extends the context the model must process. [COMMUNITY — buildmvpfast.com, context-engineering practitioners]

### Token budget guidance (2025-2026 practitioner consensus)
- Base system prompt: 200–800 tokens is the target range. A 3,000-token prompt tested against a 400-token equivalent showed "noticeably worse multi-step reasoning" on the same model. [COMMUNITY — buildmvpfast.com]
- Dynamic injection beats always-loaded: "every model call and sub-agent should see the minimum context required." [VERIFIED — Google Developers Blog]

**NEEDS-DOMAIN:** aishwaryasrinivasan.substack.com (Substack, not pre-authorised — snippets from search only)

---

## Q2 — Context Rot / Long-Context Degradation Evidence

**Current evidence is strong and multi-source.**

### Chroma 18-model study (2025, cited via morphllm.com)
- Tested GPT-4.1, Claude Opus 4, Gemini 2.5 Pro, Qwen3-235B plus 14 others.
- **Finding: every model degraded at every input length tested.** No frontier model was immune.
- Lost-in-the-middle effect: >30% accuracy drop when relevant information is in middle positions vs. start/end.
- Document QA with 20 docs: accuracy fell from ~75% (position 1) to 45–55% (positions 5–15).
- [VERIFIED — morphllm.com/context-rot citing Chroma research]

### EMNLP 2025 paper: "Context Length Alone Hurts LLM Performance"
- Title confirms the mechanism independently: increased context length degrades performance even when the added content is not irrelevant noise.
- [VERIFIED — aclanthology.org/2025.findings-emnlp.1264]

### Coding-agent specific
- Agents spend "over 60% of their first turn just retrieving context" when loaded with large always-on instructions.
- Task success rate decreases after 35 minutes of context accumulation; doubling task duration "quadruples the failure rate."
- [VERIFIED — morphllm.com, sourcing Chroma + agent benchmarks]

### Architectural root cause (2025 research consensus)
- RoPE long-term decay: dot-product similarity between distant token pairs is systematically reduced; softmax amplifies by concentrating attention on highest-scoring tokens.
- At 100K tokens the model tracks ~10 billion pairwise relationships vs. ~100 million at 10K — attention dilution is structural, not a tuning failure.
- [VERIFIED — Context Discipline paper arXiv:2601.11564v1]

**Verdict on Q2:** trimming always-loaded instructions has a measurable quality payoff beyond token cost — it directly reduces context rot.

---

## Q3 — Instruction Redundancy / Duplication Cost

### arXiv:2602.11988 (AgentMD — the internal reference)
This is the primary source and was confirmed and corroborated by multiple 2025–2026 sources.

**Key numbers:**
- LLM-generated (auto-populated) context files reduced success in 5/8 test settings.
- Inference costs increased 20–23%.
- Agents took 2.45–3.92 additional steps per task (unnecessary overhead).
- Reasoning token consumption: ~9,000–11,000 tokens (GPT-5.2 with context file) vs. ~53,000–65,000 tokens (GPT-5.1 Mini with context file) — weaker models pay a much higher overhead penalty.
- [VERIFIED — arXiv:2602.11988, corroborated by The Decoder article and agentmd.online]

**The nuance:** when the evaluation environment had *no other documentation* (markdown/docs stripped), the same LLM-generated files improved performance by 2.7%. The harm comes from *redundancy with existing sources*, not from the content itself. This directly supports "encode what the model doesn't already know."

### Corroborating work (2026)
- Infralovers (2026-03-19): "instruction bloat is a form of failure mode… context that doesn't reduce ambiguity — it increases cognitive load." [COMMUNITY]
- Agentic Academy evaluation: confirmed that long auto-generated AGENTS.md files increase step count without improving outcomes; short human-written files with specific, non-obvious instructions are net positive. [COMMUNITY — agentic-academy.ai]

**The AgentMD finding is corroborated** by independent 2025–2026 practitioner evaluations. Not contradicted by any source found.

---

## Q4 — Prohibition-Rule Decay ("Don't Do X" vs. Positive Framing)

### LessWrong study: "I Tested LLM Agents on Simple Safety Rules. They Failed."
- Tested agent adherence to a set of safety rules across multiple models.
- The **only principle framed positively** ("Always do X") showed the highest adherence across all models.
- Negatively framed prohibitions ("Don't do X") showed inconsistent and lower adherence.
- Adherence imposed measurable "cost of compliance" — Task Success Rate dropped when any principle was enforced, but the drop was larger for negative framings.
- [COMMUNITY — lesswrong.com post, 2025]

### Additional finding
- Scaling (larger models) improves general reasoning but does NOT resolve failures in implicit or negative-form regulatory compliance. [VERIFIED — arXiv:2601.08196v1 (implicit regulatory compliance)]
- Weaker models pay a disproportionately higher overhead from prohibition rules (consistent with AgentMD's finding that GPT-5.1 Mini was hit harder than GPT-5.2).

### What the research does NOT fully resolve
- The LessWrong study is a community post, not a peer-reviewed benchmark. The ablation (positive vs. negative framing, controlled for content) is noted as a "crucial next step" not yet fully published as of the search results.
- [ASSUMED — training knowledge on the general psycholinguistic principle that positive directives are processed more reliably than negations, consistent with the above]

---

## Contradictions with the Internal APEX Rubric

None found. All four internal principles are corroborated:

| Internal principle | External evidence |
|---|---|
| "Encode what the model doesn't know; omit what it does" | Confirmed — AgentMD, buildmvpfast.com, Google Developers Blog |
| Longer always-loaded context degrades quality | Confirmed — Chroma 18-model study, EMNLP 2025, Context Discipline paper |
| Redundant/auto-generated context files hurt performance and add cost | Confirmed — arXiv:2602.11988 (AgentMD), The Decoder, Infralovers |
| Prohibitions ("don't do X") less reliably followed than positive directives | Supported (community-level) — LessWrong study, arXiv:2601.08196v1 |

One partial nuance (not a contradiction): redundant files are harmless or even helpful when no other documentation exists. They hurt *because of duplication*, not inherently. Skill content that duplicates what's in the repo, training data, or other always-loaded skills is the specific target — not instruction files per se.

---

## NEEDS-DOMAIN List

These URLs appeared in search results but fetch was not attempted (not pre-authorised):
- `aishwaryasrinivasan.substack.com` — context engineering newsletter post
- `arxiv.org/pdf/2603.09619` — context engineering multi-agent architecture paper
- `arxiv.org/pdf/2604.04258` — practitioner methodology for structured human-AI collaboration

The content from these was partially available via search snippets and is tagged [COMMUNITY] or [ASSUMED] above where used.

---

## Sources Used

1. arXiv:2602.11988 — "Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?" (AgentMD)
2. The Decoder — "Context files for coding agents often don't help - and may even hurt performance" (coverage of arXiv:2602.11988)
3. morphllm.com/context-rot — "Context Rot: Why LLMs Degrade as Context Grows" (Chroma 18-model study)
4. aclanthology.org/2025.findings-emnlp.1264 — "Context Length Alone Hurts LLM Performance" (EMNLP 2025)
5. arXiv:2601.11564v1 — "Context Discipline and Performance Correlation"
6. lesswrong.com — "I Tested LLM Agents on Simple Safety Rules. They Failed."
7. arXiv:2601.08196v1 — "Evaluating Implicit Regulatory Compliance in LLM Tool Invocation"
8. buildmvpfast.com — "System Prompt Design Best Practices | LLM Guide" (2026)
9. developers.googleblog.com — "Architecting efficient context-aware multi-agent framework for production"
10. infralovers.com — "Context Engineering: Why Less Context Makes Better Agents" (2026-03-19)
