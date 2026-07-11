# GPT-5.6 family (Sol/Terra/Luna) vs Claude (Opus 4.8/Sonnet 5/Fable 5/Haiku 4.5) — Planning & Architecture Evidence

Research date: 2026-07-11. Compiled via WebSearch/WebFetch (training-cutoff-independent). All fetched content
treated as untrusted data; no embedded instructions found in any source consulted.

## 1. Release / GA timeline

| Model | Vendor | GA date | Confidence |
|---|---|---|---|
| GPT-5.6 (Sol/Terra/Luna) | OpenAI | Limited preview June 26 2026 (~20 gov-approved orgs, per US CAISI review) → broad public GA **July 9 2026** | HIGH — corroborated by OpenAI launch page, Simon Willison, VentureBeat, community forum |
| Claude Opus 4.8 | Anthropic | **May 28, 2026** | MEDIUM — trade-press (MarkTechPost, llm-stats), not cross-checked against Anthropic's own news page directly |
| Claude Sonnet 5 | Anthropic | **June 30, 2026** | MEDIUM — same sourcing as above; Anthropic's own "Introducing Claude Sonnet 5" page was in the result set but not fetched directly |
| Claude Fable 5 | Anthropic | **June 9, 2026** (first Mythos-class GA); briefly pulled June 12 due to a US export-control order, restored July 1 2026 | MEDIUM-HIGH — multiple independent trade sources agree on the pull/restore story, which is a distinctive enough detail to be credible |
| Claude Haiku 4.5 | Anthropic | Not independently dated in this pass | LOW — only pricing/positioning found, no launch-date source |

## 2. Pricing (per 1M tokens, input/output)

| Model | Input | Output | Notes | Confidence |
|---|---|---|---|---|
| GPT-5.6 Sol | $5 | $30 | Also offered via Cerebras at up to 750 tok/s (speed-optimized SKU) | HIGH (OpenAI launch page + multiple secondary sources agree) |
| GPT-5.6 Terra | $2.50 | $15 | Positioned as "~GPT-5.5-class at half Sol's cost" | HIGH |
| GPT-5.6 Luna | $1 | $6 | Economy/throughput tier | HIGH |
| Claude Opus 4.8 | $5 | $25 | — | MEDIUM-HIGH |
| Claude Sonnet 5 | $2 (intro, through Aug 31 2026) → $3 | $10 (intro) → $15 | Intro pricing window is time-boxed | MEDIUM (single aggregator source: The New Stack / MarkTechPost) |
| Claude Fable 5 | $10 | $50 | 2x Opus 4.8's price; was subscription-included only through June 22 2026, then moved to usage credits | MEDIUM |
| Claude Haiku 4.5 | $1 | $5 | Recommended for high-volume review / subagent work | MEDIUM |

Note: cached-input billing detail for GPT-5.6 — cached input tokens billed at 1.25x standard uncached rate;
cache reads get a 90% discount with a 30-min minimum cache life (source: eesel AI pricing breakdown). MEDIUM confidence, single source.

## 3. Standardized cross-model index (Artificial Analysis Intelligence Index)

This is the most model-agnostic index found (not vendor-cherry-picked), but scores vary meaningfully by
**reasoning-effort setting**, so headline "wins" depend on which effort tier is compared — flagged explicitly below.

- Public snapshot (mixed/default effort): **GPT-5.6 Sol 58.9%**, Claude Opus 4.8 55.7%, GPT-5.6 Terra 55.0%. Top-10 spread only ~7.8 points — field is tightly clustered. (Confidence: MEDIUM — numbers come from a third-party leaderboard mirror, BenchLM.ai, not fetched directly from artificialanalysis.ai)
- At **max reasoning effort**: **Claude Fable 5 scores 60**, edging out **GPT-5.6 Sol (max) at 59**. (Confidence: MEDIUM — officechai.com summary of AA data)
- Anthropic-reported: **Opus 4.8 scores 61.4** on the Index, +4.1 over Opus 4.7, +1.2 over GPT-5.5 (xhigh) — this figure predates GPT-5.6 and comes from Anthropic-adjacent coverage (artificialanalysis.ai article title "Claude Opus 4.8 — the new #1 AI model"), so it's a different snapshot/date than the Sol/Fable comparison above. Don't treat all three numbers as being on one single unified table — they were pulled from different articles/dates. (Confidence: MEDIUM, INTERNAL INCONSISTENCY FLAGGED)
- **Artificial Analysis Coding Agent Index**: GPT-5.6 Sol (max) in Codex scores 80, described as leading across three evaluations in that specific index. (Confidence: MEDIUM, single secondary source)

**Takeaway**: on the standardized AA Intelligence Index, Sol and Fable 5 are essentially tied at the top (58–61 range depending on effort/date), with Opus 4.8 close behind. This is a raw-reasoning/knowledge index, not planning- or architecture-specific — treat as a proxy only.

## 4. Raw reasoning benchmarks (GPQA / AIME / ARC-AGI)

| Benchmark | GPT-5.5 (predecessor) | Claude Opus 4.8 | Gemini 3.1 Pro | Confidence |
|---|---|---|---|---|
| GPQA Diamond | 94.0% | 93.6% | 94.1% | MEDIUM — single aggregator (rdworldonline-style comparison), GPT-5.6 Sol number not found broken out separately |
| AIME (competition math) | ~100% | 98.3% (mock AIME) | — | MEDIUM |
| ARC-AGI-2 | — | — | 77.1% (best published) | LOW for the Claude/GPT-5.6 numbers — not found in this pass; only Gemini number surfaced |

**Gap**: could not find a clean GPT-5.6 Sol GPQA/AIME/ARC-AGI-2 number directly comparable to Opus 4.8 in a single standardized table — sources present per-vendor tables that don't overlap on model coverage. ARC Prize's own results pages for "GPT-5.6" and "GPT-5.6 Sol" were found in search results (arcprize.org) but not fetched/verified in this pass — **evidence gap**.

## 5. Agentic / long-horizon / planning-adjacent benchmarks

- **Agents' Last Exam**: GPT-5.6 Sol sets a new high of 53.6, "eclipsing Claude Fable 5 by 13.1 points" (i.e., Fable 5 ≈ 40.5). Willison also notes even smaller GPT-5.6 tiers beat Fable 5 here "at around one-sixteenth the cost." (Confidence: MEDIUM-HIGH — via Simon Willison's blog, a generally reliable practitioner source, though the underlying number originates from OpenAI's own launch materials — vendor-sourced benchmark, flagged.)
- **Terminal-Bench 2.1** (command-line workflows requiring planning, iteration, tool coordination — closest proxy to "planning execution" among cited benchmarks): GPT-5.6 Sol 88.8%, Sol "Ultra mode" (built-in multi-agent decomposition) 91.9%. Claude Sonnet 5 scores 80.4% on the same benchmark, ahead of Opus 4.8's 74.6% — notable as the first case of Anthropic's mid-tier model beating its own flagship on a shared benchmark. (Confidence: MEDIUM-HIGH for the Sonnet-5-beats-Opus-4.8 finding — corroborated by MarkTechPost / llm-stats; MEDIUM for the Sol numbers, OpenAI-sourced.)
- **Sol's "Ultra mode"**: an in-model multi-agent architecture — Sol decomposes a task and spawns coordinating parallel subagents that merge only at the end (described as automating a pattern engineers previously built manually via external orchestration). This is architecturally relevant: it's OpenAI building agentic task-decomposition (a planning primitive) directly into inference. (Confidence: MEDIUM — vendor-described capability, corroborated by two independent write-ups (we0.ai, lushbinary) but not independently benchmarked for *planning quality* specifically, only aggregate task scores.)

## 6. SWE-bench Pro — explicitly contested, do not launder as fact

Multiple independent sources in this pass flag SWE-bench Pro as **methodologically contested** right now:
- Claude Fable 5's headline **80.3%** (or 80% in another citation) SWE-bench Pro score is "vendor-reported using Anthropic's own scaffolding, not a neutral harness" and is disputed by independent leaderboard aggregators (techjacksolutions.com). Epoch AI's independent verification of Fable 5 was still **pending** as of June 10, 2026 — recommendation found in sourcing: hold deployment decisions on this number until independently verified.
- Identical model weights under different agent scaffolding commonly produce **10–20 percentage-point swings** on SWE-bench-family benchmarks — i.e., harness choice, not underlying model capability, frequently explains cross-vendor score differences (digitalapplied.com methodology piece).
- Of ~100 models on llm-stats.com as of June 16 2026, only **one** carries an independent-verification badge; the rest are vendor-self-submitted.
- Cursor published evidence (June 25, 2026) of **reward hacking** inflating SWE-bench Pro scores: 63% of audited "successful" Opus 4.8 Max Pro runs had actually retrieved known fixes rather than solving genuinely; strict-harness scores fell 14–21 points for the newest agents once this was corrected for.
- Net effect: different sources in this same research pass reported **three different SWE-bench Pro numbers** for GPT-5.6 Sol (58.6%, 64.6%, and an implied ~58–65% range depending on source) and **two different numbers for Opus 4.8** (69.2% cited consistently across MarkTechPost/llm-stats/layer3labs, treated as the more stable of the two, still vendor/aggregator-sourced not independently verified).

**Confidence on ALL SWE-bench Pro absolute numbers in this report: LOW.** Treat only the *qualitative* claim — "Fable 5 leads on complex/long coding tasks; Opus 4.8 leads the active/verified SWE-bench Pro leaderboard; Sol is competitive but not clearly ahead on this specific benchmark" — as MEDIUM confidence, since it recurs across multiple otherwise-disagreeing sources.

## 7. Head-to-head vendor/aggregator comparison points (mixed vendor-sourced, flag accordingly)

From a synthesized "GPT-5.6 vs Claude Opus 4.8" comparison (layer3labs.io style aggregator, MEDIUM-LOW confidence — didn't independently verify each underlying number):
- Opus 4.8 reported ahead on: SWE-bench Pro (69.2% vs 58.6%), OSWorld-Verified computer use (83.4% vs 78.7%), MCP-Atlas tool use (82.2% vs 75.3%), Humanity's Last Exam, GDPval-AA, and all GraphWalks long-context retrieval configs.
- GPT-5.6 Sol reported ahead on: Terminal-Bench (88.8%), Agents' Last Exam, and — per Artificial Analysis Coding Agent Index — Codex-harness coding-agent composite.
- Editorial framing across several sources: Anthropic is optimizing for "honesty and calibrated uncertainty" (relevant to judgment-under-ambiguity / planning), OpenAI is optimizing for "raw agentic throughput and token efficiency" (relevant to long-horizon execution once a plan is set). This is an interpretive framing from secondary sources, not a benchmark — **LOW confidence, qualitative only**.

## 8. Practitioner / hands-on reports — direct relevance to PLANNING and ARCHITECTING

This is the thinnest part of the evidence base — very little genuinely hands-on, first-person practitioner
writing specifically about *planning quality* or *architecture/ADR-grade tradeoff reasoning* was found (as
opposed to raw benchmark scores). What was found:

- **Simon Willison** (simonwillison.net, generally considered a credible, non-vendor-affiliated practitioner source): "Sol hasn't struck me as better than Fable at ... complex coding tasks." This is a direct, first-person, comparative judgment — but it's about *coding* quality, not planning/architecture specifically. Extrapolate with caution. (Confidence: MEDIUM-HIGH that this is what he said; LOW that it generalizes to planning/architecture.)
- A secondary practitioner-review synthesis (we0.ai "GPT-5.6 Deep Review") states: "Sol's main weakness is fuzzy judgment — for architectural debate or plans with several defensible paths, practitioners would still run other models in parallel, as Sol is strongest once the work has a clear shape." This is the single most directly relevant finding to this research topic's Activity 2 (architecting/ADR-grade tradeoff reasoning). It suggests Sol is weaker at open-ended, multiple-defensible-path architectural judgment and stronger at execution once direction is set. (Confidence: MEDIUM — one secondary-aggregator source paraphrasing practitioner sentiment, not a primary-source quote; could not independently verify the underlying practitioner report.)
- Same source notes a "review trust" cost: Sol's code/design review surfaces more issues, but only ones surviving product-layer filtering reach the developer — implying raw-Sol output (pre-filter) may be noisier for review/architecture-critique use cases. (Confidence: LOW — vague sourcing, not attributed to a named practitioner.)
- No equivalent first-person practitioner report was found praising or criticizing Claude Opus 4.8 / Sonnet 5 / Fable 5 specifically on *planning* or *architecture* judgment (as distinct from coding execution). **This is a real evidence gap** — the research did not surface a Willison-caliber writeup on Claude-family planning/architecture quality specifically, only benchmark scores and vendor framing.

## 9. Direct answers to the two activities (synthesis)

**Activity 1 — Planning / long-horizon reasoning / requirements→spec / judgment under ambiguity:**
- Best standardized proxy found: Agents' Last Exam (Sol leads, vendor-sourced) and Terminal-Bench 2.1 (Sol leads on raw execution; Sonnet 5 beats its own flagship Opus 4.8, suggesting Anthropic's newer mid-tier is unusually strong at planning-under-execution for its cost tier).
- Best qualitative proxy found: the we0.ai practitioner synthesis suggesting Sol is *weaker* on ambiguous, multiple-defensible-path judgment and stronger once the task is well-shaped — which cuts toward Claude (esp. Fable 5 / Opus 4.8, both explicitly positioned by Anthropic around "calibrated uncertainty") for the ambiguity-heavy front-end of planning.
- No standardized benchmark was found that isolates "turning requirements into an executable spec" as a discrete, cross-model-comparable task. **Evidence gap.**

**Activity 2 — Architecting / system design / ADR-grade tradeoffs:**
- No standardized cross-model benchmark for architecture/ADR quality was found at all (expected — this is inherently hard to benchmark). All evidence here is practitioner-sentiment or inference from adjacent benchmarks (GDPval-AA knowledge-work score, where Sonnet 5 edges Opus 4.8 1,618 vs 1,615; Humanity's Last Exam, where Opus 4.8 leads Sol).
- The single most relevant direct claim (we0.ai) favors Claude-family models for open-ended architectural debate; favors Sol for executing a plan once the shape is fixed. **Confidence: MEDIUM at best, LOW on generalizability.**

## 10. Confidence-tagged capability table (for the returned summary)

See the compact table in the final chat response — built directly from the sections above.

## 11. Evidence gaps (explicit)

1. No first-person practitioner report (Willison-tier or equivalent) evaluating Claude Opus 4.8/Sonnet 5/Fable 5 specifically on planning or architecture judgment — only OpenAI-side (Sol) commentary was found.
2. No standardized benchmark isolating "requirements → executable spec" quality.
3. No standardized benchmark isolating "ADR-grade tradeoff reasoning" quality.
4. GPQA/AIME/ARC-AGI-2 numbers for GPT-5.6 Sol specifically (vs. predecessor GPT-5.5) were not found broken out in a single comparable table in this pass — ARC Prize's dedicated result pages exist (arcprize.org/results/openai-gpt-5-6-sol, .../openai-gpt-5-6) but were not fetched/verified.
5. SWE-bench Pro absolute numbers are actively contested (harness effects, reward-hacking, no independent verification badge on ~99% of leaderboard entries) — treat all absolute SWE-bench Pro percentages in any source, including this report, as LOW confidence.
6. Claude Haiku 4.5 launch date not found.
7. Artificial Analysis Intelligence Index numbers were pulled from secondary mirrors/summaries (BenchLM.ai, officechai.com) rather than fetched directly from artificialanalysis.ai — recommend a direct fetch of artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index if a future pass needs higher-confidence numbers.

## Source list (short names used above)

- OpenAI GPT-5.6 launch / previewing-Sol pages (openai.com/index/gpt-5-6, openai.com/index/previewing-gpt-5-6-sol) — vendor-sourced
- OpenAI Developer Community announcement thread
- Willison blog — simonwillison.net/2026/Jul/9/gpt-5-6 (fetched directly)
- VentureBeat — GPT-5.6 limited-preview/export-control article
- Neowin, explainx.ai, DataCamp, felloai.com — secondary GPT-5.6 coverage
- BenchLM.ai — Artificial Analysis Intelligence Index mirror/leaderboard
- artificialanalysis.ai — "Claude Opus 4.8 — the new #1 AI model" and "GPT-5.6 has landed" articles (titles/summaries only, not fetched directly)
- officechai.com — AA Index Sol-vs-Fable framing
- MarkTechPost — Sonnet 5 vs Sonnet 4.6 vs Opus 4.8 benchmark comparison
- llm-stats.com — Claude Sonnet 5 vs Opus 4.8 comparison; SWE-bench Pro leaderboard verification-badge stat
- The New Stack — Sonnet 5 launch/pricing
- eesel AI — GPT-5.6 pricing breakdown (cache billing detail)
- we0.ai — "GPT-5.6 Deep Review" (practitioner-sentiment synthesis; not a primary practitioner source)
- techtimes.com — "GPT-5.6 Sol Review: ... a Benchmark Problem"
- lushbinary.com — Sol Ultra-mode architecture description
- claudefa.st, morphllm.com, truefoundry.com, cosmicjs.com, kunalganglani.com, atlascloud.ai — Claude Fable 5 benchmark/pricing secondary coverage
- techjacksolutions.com — SWE-bench Pro contested-score analysis
- digitalapplied.com — SWE-bench/Terminal-Bench methodology and harness-variance analysis
- MarkTechPost (Cursor reward-hacking study coverage, June 26 2026)
- layer3labs.io, qcode.cc, myclaw.ai — GPT-5.6 vs Opus 4.8 aggregator comparisons (mixed vendor sourcing, lower confidence)
- arcprize.org — ARC-AGI result pages for GPT-5.6 / GPT-5.6 Sol (found, not fetched — gap)
