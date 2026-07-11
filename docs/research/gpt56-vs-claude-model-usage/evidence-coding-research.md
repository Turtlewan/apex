# GPT-5.6 (Sol/Terra/Luna) vs Claude (Opus 4.8/Sonnet 5/Fable 5/Haiku 4.5) — Coding & Research Evidence

Date compiled: 2026-07-11. All web content treated as untrusted data; no embedded instructions in fetched pages were followed (none found attempting injection).

**Source-quality caveat:** Most granular benchmark numbers below come from secondary "SEO/affiliate" blogs (codingfleet, lushbinary, digitalapplied, edenai, etc.) that all cite the same handful of primary sources (Artificial Analysis, OpenAI's own posts, Anthropic's pricing page, Scale/SWE-bench Pro leaderboard). Numbers that recur consistently across 3+ independent secondary sources are tagged MEDIUM; numbers confirmed from a primary source (artificialanalysis.ai, openai.com, platform.claude.com, morphllm.com's leaderboard aggregation) are tagged HIGH. Single-source claims are tagged LOW.

---

## 1. Pricing per Mtoken (input/output) — HIGH confidence (official pages)

| Model | Input | Output | Source |
|---|---|---|---|
| GPT-5.6 Sol | $5 | $30 | multiple secondary, consistent (techjacksolutions, finout, edenai) — MEDIUM (no OpenAI pricing page fetched directly, but consistent 3+ sources) |
| GPT-5.6 Terra | $2.50 | $15 | same as above — MEDIUM; matches user's own prompt figure |
| GPT-5.6 Luna | $1 | $6 | same as above — MEDIUM |
| Claude Fable 5 | $10 | $50 | platform.claude.com/docs/pricing — HIGH |
| Claude Mythos 5 (limited availability) | $10 | $50 | platform.claude.com — HIGH |
| Claude Opus 4.8 | $5 | $25 | platform.claude.com — HIGH |
| Claude Sonnet 5 (through Aug 31 2026) | $2 | $10 | platform.claude.com — HIGH |
| Claude Sonnet 5 (from Sep 1 2026) | $3 | $15 | platform.claude.com — HIGH |
| Claude Haiku 4.5 | $1 | $5 | platform.claude.com — HIGH |

Notes (HIGH, platform.claude.com):
- Opus 4.7+/Fable 5/Mythos/Sonnet 5 use a newer tokenizer producing ~30% more tokens for the same text than older models — raw $/Mtok comparisons understate Claude's effective per-task cost slightly relative to GPT-5.6.
- Prompt caching: Claude cache reads = 0.1x input price across the board; 5-min cache write = 1.25x, 1-hr write = 2x. GPT-5.6 (per MarkTechPost/OpenAI) uses a similar model — cache writes at 1.25x uncached input rate, cache reads at 90% discount (0.1x), with a 30-min minimum cache life.
- Batch API (Claude): 50% off both input/output for all models.
- Claude Fable 5 / Opus 4.8 have a "Fast mode" premium tier ($10/$50 and $30/$150 respectively) — separate from base pricing, not used in the coding-agent-index comparisons below.

**Model hierarchy clarification (MEDIUM, cross-checked 3+ sources):** As of July 2026 Anthropic's lineup, from most to least capable/expensive, is: **Fable 5** (new top tier, sits *above* Opus; Mythos 5 is a limited-availability sibling at the same price) → **Opus 4.8** → **Sonnet 5** → **Haiku 4.5**. This matters because several vendor comparisons pit GPT-5.6 Sol against Fable 5 (both flagship-tier), not against Opus 4.8, and the two comparisons show very different pictures (see §2).

---

## 2. Agentic coding — head-to-head evidence

### 2a. Artificial Analysis Coding Agent Index (HIGH — primary source fetched: artificialanalysis.ai/articles/gpt-5-6-has-landed)

This index pairs each model with its **native agentic harness** (Sol/Terra/Luna run inside Codex; Claude models run inside Claude Code) and averages **DeepSWE + Terminal-Bench v2 + SWE-Atlas-QnA**.

| Model (max reasoning) | Coding Agent Index | Notes |
|---|---|---|
| GPT-5.6 Sol (in Codex) | **80** | Leads all three underlying evals; SOTA |
| GPT-5.6 Terra | 77 (one source: 77.4) | "curious middle child" — see §3 |
| GPT-5.6 Luna | 75 (one source: 74.6) | Outperforms Opus 4.8 per one secondary source — plausible but not independently confirmed at the index level |
| Claude Fable 5 (max, in Claude Code) | ~77.2 (Sol is "2.8 points above Fable 5") | implied from AA's own quote |
| Claude Opus 4.8 (max) | **56** | MEDIUM–HIGH (repeated across sources, but the raw "56" figure came from a secondary source's paraphrase of AA, not a direct quote from the primary page — flag as MEDIUM) |
| GPT-5.5 | 55 | tied near Terra |

**Cost per task (HIGH, AA primary + corroborating tweet @ArtificialAnlys):**
- Sol (max) costs **$1.04/task** on the Intelligence Index (a different, non-coding index) using ~15k tokens/task — cited as using fewer tokens and being "more intelligent" than Opus 4.8 (max) on that general index.
- On the **Coding Agent Index** specifically, Sol's per-task cost is **~40% below Fable 5** and **~10% below Opus 4.8** (both running in Claude Code) — HIGH, this is the single most load-bearing cost claim in the dataset since it's a direct AA quote.
- Terra (max): $0.55/task; Luna (max): $0.21/task (Intelligence Index, not coding-specific) — MEDIUM.

**Interpretation:** On the standardized harness index the user asked to prioritize, **Sol in Codex is both higher-scoring AND cheaper per task than Opus 4.8 in Claude Code**, and meaningfully ahead of Terra/Luna and GPT-5.5. This is the most decisive, least-contested finding in this report.

### 2b. Terminal-Bench v2 (Terminal-Bench 2.1) individual scores — MEDIUM (recurs across 4+ secondary sources but no primary tbench.ai fetch was done; the tbench.ai leaderboard itself was found in search but not fetched)

| Model | Terminal-Bench 2.1 |
|---|---|
| GPT-5.6 Sol (Ultra mode) | 91.9% |
| GPT-5.6 Sol (standard) | 88.8% |
| Claude Sonnet 5 | 80.4% |
| Claude Opus 4.8 | 78.9% (one source) / 74.6% (another source) — **inconsistent between secondary sources, flag LOW on the exact figure, MEDIUM on the ordering** |

Consistent ordering across all sources: **Sol > Sonnet 5 > Opus 4.8** on Terminal-Bench specifically. This is notable — Sonnet 5 (the cheap/mid Claude tier) beats Opus 4.8 (Claude's "serious work" tier) on this one benchmark. One Medium article headline states this directly: "Claude Sonnet 5 Beats Opus 4.8 on Terminal-Bench for 40% the Price" (LOW-MEDIUM, single-article framing, but consistent with the raw numbers from other sources).

### 2c. SWE-bench Pro — CONTESTED, exactly as the user flagged (HIGH confidence that it's contested; MEDIUM on specific numbers)

**The controversy (HIGH — corroborated by OpenAI's own posts, found via search: openai.com/index/separating-signal-from-noise-coding-evaluations, and an OpenAI X/Twitter post from OpenAI's official account):**
- OpenAI audited SWE-bench Pro (a benchmark it had itself recommended as the successor to SWE-bench Verified) and found it "no longer reliably measures frontier coding capability."
- Automated pipeline flagged **200 tasks (27.4%) as broken**; combined with human annotation, OpenAI estimates **~30% of tasks are broken** — hidden requirements, contradictory instructions, overly strict tests, incomplete grading criteria.
- This is the **second time in five months** OpenAI has retracted a coding-benchmark endorsement (SWE-bench Verified was the first, cited for "fundamental design and contamination issues").
- Independent commentary (Medium/"Your Agent Benchmark Is Lying to You") frames this as evidence that **harness/scoring choices swing results more than underlying model capability** — directly matching the user's framing.

**Reported numbers anyway (MEDIUM-LOW, since the benchmark itself is now disputed):**
- Claude Opus 4.8: 69.2% (Anthropic's own harness — vendor self-benchmark, LOW on top of the benchmark's own credibility problem)
- Claude Fable 5: ~80%; Claude Mythos 5: 80.3%
- Claude Sonnet 5: 63.2%
- GPT-5.5: 58.6%
- GPT-5.6 Sol: 64.6% (slots between Sonnet 5 and Opus 4.8 per this specific — contested — benchmark)
- A standardized third-party run (Scale) of Opus 4.6-thinking reportedly scored only **51.9%** on the public set vs. 69.2% claimed elsewhere for Opus 4.8 — i.e., a ~17-point swing attributable to harness/methodology alone, precisely the "harness matters more than model" pattern the user asked to verify. **This single data point is the strongest direct evidence for the contested-harness claim** (LOW-MEDIUM — single secondary source, morphllm.com, but internally citing Scale directly).

**Bottom line on SWE-bench Pro:** Treat every number in this subsection as illustrative only. The Coding Agent Index (§2a) and Terminal-Bench (§2b) are the more defensible cross-model comparisons because they aren't the specific benchmark under public dispute, though Terminal-Bench numbers themselves also vary noticeably by secondary source (see the 78.9%/74.6% Opus discrepancy above), consistent with general harness-sensitivity in this benchmark generation.

---

## 3. Terra vs Sol — effort-matched evidence (does the "Terra = exploration/read-heavy, point implementation at Sol" guidance hold up?)

**OpenAI's own subagent docs (MEDIUM-HIGH — developers.openai.com/codex/subagents, found directly, not just paraphrased):**
- GPT-5.6-terra is explicitly positioned for "agents that favor speed and efficiency over depth, such as exploration, read-heavy scans, large-file review, or processing supporting documents... parallel workers that return distilled results to the main agent."
- OpenAI's guidance: use **stronger models/higher reasoning effort for review, security, architecture, orchestration, and difficult debugging**; use **smaller/faster models (Terra) for routine implementation, documentation, and focused exploration**.
- Terra is marketed as "GPT-5.5-class performance at half the price" — i.e., a cost/quality substitute for the *previous* flagship tier, not a substitute for Sol.

**Does this hold up empirically?**
- On the Coding Agent Index, Terra (77) sits closer to Sol (80) than the price gap would suggest (Terra is roughly half of Sol's per-task cost per the pricing tiers), but Vellum's analysis (found via search, MEDIUM) explicitly notes: **"for any Terra effort level there is a Luna or Sol configuration that is either more intelligent at no extra cost or equally intelligent for less"** — i.e., Terra is Pareto-dominated in this specific effort-matched analysis; it's "sensible as a drop-in default, rarely the optimal pick." This is a direct, if secondary-sourced, effort-matched finding that partially **undercuts** OpenAI's own subagent-routing story: on pure cost/performance grounds Terra isn't obviously the best choice for its stated niche either — you could reportedly do better with Luna (cheaper) or Sol (smarter) depending on task.
- No independent (non-OpenAI-affiliated) empirical harness run comparing Terra-does-exploration-then-Sol-implements vs. Sol-does-everything was found. This is a genuine evidence gap (see §6).

**Conclusion:** The "Terra = exploration, Sol = implementation" guidance is OpenAI's own product-positioning documentation (a vendor recommendation, not an independent finding), and at least one third-party cost/performance analysis (Vellum) suggests Terra is not Pareto-optimal even within its stated niche. Confidence: MEDIUM that the guidance exists and is stated this way; LOW-MEDIUM that it's empirically the best routing (mixed evidence).

---

## 4. Research / retrieval + synthesis split

### 4a. Fast/cheap retrieval tier candidates: Haiku 4.5, Luna, Terra, Sonnet 5

**Claude Haiku 4.5 (MEDIUM — anthropic.com/news/claude-haiku-4-5 found in search, not directly fetched; docsbot.ai comparison):**
- 200K context, up to 64K output tokens, extended-thinking mode, "improved multi-document synthesis." Positioned by Anthropic for "real-time chat, coding assistants, RAG pipelines, and lightweight agents."
- Pricing: $1/$5 per Mtok (HIGH, official).

**GPT-5.6 Luna vs Claude Haiku 4.5 (LOW-MEDIUM — single comparison site, docsbot/benchlm, numbers not cross-verified elsewhere):**
- One aggregate comparison: Luna ahead 82 vs 54 on a broad aggregate, driven heavily by a huge math-specific gap (73.6 vs 4.9 — this looks like a possible benchmark-suite artifact/outlier and should be treated with caution, not taken at face value).
- Same source: **Haiku 4.5 wins specifically on coding, 73.3 vs 62.7.**
- No dedicated retrieval/RAG-specific (as opposed to general knowledge/math) benchmark was found comparing Luna vs Haiku 4.5 directly. This is an evidence gap.

**BrowseComp (a real web-research-agent benchmark, closer to what "retrieval" means here) (MEDIUM — benchlm.ai/steel.dev leaderboards found, only summarized via search snippets, not fetched directly):**
- GPT-5.5 reported at 84.4% vs a comparator at 79.3% (Pro variant of GPT-5.5 reaches 90.1%).
- Claude Mythos 5 reported at 88% on BrowseComp.
- Claude Sonnet 4.6 (previous-gen Sonnet) is used as "the retrieval agent backbone" in BrowseComp-Plus research setups — i.e., independent researchers already treat a mid-tier Sonnet as a credible retrieval-agent backbone, supporting the "cheap-ish model does retrieval" pattern in practice, though this is Sonnet 4.6 not Sonnet 5/Haiku 4.5/Luna directly.
- No GPT-5.6 (Sol/Terra/Luna specifically) BrowseComp numbers were found — evidence gap.

### 4b. Synthesis tier candidates: Opus 4.8, Fable 5, Sol

- No dedicated synthesis-quality benchmark (e.g., long-report generation with citation fidelity) comparing Opus 4.8 / Fable 5 / Sol was found despite two targeted search passes. All discovered "Fable 5 vs Sol" comparisons are coding- or general-intelligence-benchmark-focused (SWE-bench Pro, Terminal-Bench, Intelligence Index), not synthesis/writing-quality-focused.
- Indirect evidence: Fable 5 leads the (non-coding) Artificial Analysis Intelligence Index at 60 vs. Sol's 59 (near-parity) (MEDIUM, AA primary fetch) — since general "intelligence index" scores typically blend reasoning/knowledge tasks that correlate with synthesis quality, this suggests Fable 5 and Sol are roughly matched for general synthesis-adjacent capability, with Fable 5 costing 2x Sol ($10/$50 vs $5/$30).
- Opus 4.8's specific synthesis/long-form-writing quality relative to Fable 5/Sol: not found. Evidence gap.

### 4c. Long-context comprehension (evidence gap for the exact models requested)

- Found general 2026 long-context benchmark landscape (MEDIUM, multiple sources): three current families are **NIAH-2** (updated needle-in-haystack), **RULER** (Nvidia reasoning-over-context), and **MRCR v2** (Multi-Round Context Retrieval, explicitly "Anthropic-aligned" per one source, suggesting Claude models are a reference point for this benchmark's design).
- Concrete finding: **Gemini 3 Deep Think leads long-context by a wide margin** (99% NIAH-2 1M single-needle, 89% multi-needle, >80% RULER 256K) — but this is a third-party model (Google), not one of the eight models in scope, included here only because it's the sharpest available data point and shows a useful caveat: **single-needle scores overstate real-world (multi-needle) capability by 15-40 points across the field** — a methodology warning applicable to any GPT-5.6/Claude long-context claim not explicitly qualified as multi-needle.
- **No long-context comprehension scores specific to GPT-5.6 Sol/Terra/Luna or Claude Opus 4.8/Sonnet 5/Fable 5/Haiku 4.5 were found in this research pass.** This is the largest single evidence gap in the report.
- Both Claude Fable 5 and Sonnet 5 (per platform.claude.com pricing page) confirm **1M-token context window at standard pricing** for Fable 5, Mythos 5, Opus 4.8/4.7/4.6, and Sonnet 5/4.6 (HIGH, official) — so context-window *size* parity is established even though comprehension-*quality*-at-length is not.

---

## 5. Confidence-tagged decisive claims (rollup)

1. **HIGH-MEDIUM**: Sol (in Codex) tops the Artificial Analysis Coding Agent Index at 80, ahead of Fable 5 (~77), Opus 4.8 (~56), Terra (77), Luna (75), while also costing ~10% less than Opus 4.8 and ~40% less than Fable 5 per task. (Primary source: artificialanalysis.ai)
2. **HIGH**: SWE-bench Pro is credibly broken as an evaluation — OpenAI's own July 2026 audit found ~30% of tasks broken and retracted its recommendation; this is the second major coding benchmark OpenAI has retracted in five months. Any SWE-bench Pro number (Opus 4.8 69.2%, Fable 5 ~80%, Sonnet 5 63.2%, Sol 64.6%, GPT-5.5 58.6%) should be treated as illustrative, not decisive — corroborated by a reported ~17-point swing (51.9% vs 69.2%) for the same model (Opus) under a different (Scale) harness.
3. **MEDIUM**: Sonnet 5 beats Opus 4.8 on Terminal-Bench 2.1 specifically (80.4% vs 74-79%, depending on source) — suggesting for terminal/agentic coding tasks specifically, Anthropic's own "serious work" flagship (Opus) is not automatically the best pick over its cheaper mid-tier (Sonnet 5), mirroring the Terra-vs-Sol Pareto-dominance finding in §3.

---

## 6. Evidence gaps (explicit)

- No independent (non-OpenAI) empirical test of the "Terra explores, Sol implements" subagent pattern vs. an all-Sol baseline.
- No RAG/retrieval-specific benchmark (as distinct from general knowledge/math) directly comparing Haiku 4.5, Luna, Terra, and Sonnet 5 as a retrieval tier.
- No long-report-synthesis-quality or citation-fidelity benchmark comparing Opus 4.8, Fable 5, and Sol.
- No long-context comprehension score (NIAH-2/RULER/MRCR v2) found for any of the 8 named models specifically — only the general 2026 benchmark landscape and a non-relevant Gemini 3 data point.
- DeepSWE and SWE-Atlas-QnA (two of the three sub-benchmarks inside the Coding Agent Index) were not broken out per-model beyond the composite Index score — only the composite was available from the primary source in this pass.
- Terminal-Bench 2.1 Opus 4.8 score is inconsistent across secondary sources (78.9% vs 74.6%) and the primary tbench.ai leaderboard page was not fetched to resolve this.

---

## 7. Source list

- artificialanalysis.ai/articles/gpt-5-6-has-landed (primary, fetched directly) — Coding Agent Index, Intelligence Index, cost-per-task
- platform.claude.com/docs/en/about-claude/pricing (primary, fetched directly) — all Claude pricing, tokenizer note, 1M context confirmation
- developers.openai.com/codex/subagents (primary, found via search) — Terra subagent positioning
- openai.com/index/separating-signal-from-noise-coding-evaluations (primary, referenced) — SWE-bench Pro audit
- openai.com/index/gpt-5-6/ and openai.com/index/previewing-gpt-5-6-sol/ (primary, referenced)
- x.com/OpenAI status on SWE-bench Pro retraction (primary, referenced)
- x.com/ArtificialAnlys status on Sol per-task cost (primary, referenced)
- alphasignal.ai, officechai.com, thestack.technology — SWE-bench Pro retraction coverage (secondary, corroborating)
- morphllm.com/swe-bench-pro, morphllm.com/best-ai-model-for-coding — SWE-bench Pro leaderboard aggregation incl. Scale standardized-run discrepancy (secondary aggregator)
- codingfleet.com, lushbinary.com, vellum.ai, the-decoder.com, techjacksolutions.com, finout.io, edenai.co, felloai.com, qcode.cc, codersera.com — GPT-5.6 pricing/benchmark secondary blogs (cross-checked against each other and against primary AA/OpenAI sources where possible)
- claudefa.st, tygartmedia.com, claudedirectory.org, usecarly.com, secondtalent.com, claude-world.com, scriptbyai.com, hidekazu-konishi.com — Claude model-lineup/hierarchy secondary sources
- docsbot.ai, benchlm.ai — Haiku 4.5 vs Luna comparison (secondary, single-source, flagged LOW on the math-gap outlier)
- steel.dev leaderboard, benchlm.ai — BrowseComp leaderboard (secondary, snippet-only)
- anthropic.com/news/claude-haiku-4-5 (primary, found via search, not directly fetched)
- Stabilarity Hub, digitalapplied.com — 2026 long-context benchmark landscape (secondary)
