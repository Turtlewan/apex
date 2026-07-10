# WS-B: Anthropic Claude Side — Multi-Model Pipeline Research

**Proposed pipeline under evaluation:** Claude Opus 4.8 plans → GPT-5.6 Sol double-checks the plan → Claude Sonnet 5 orchestrates the build session → GPT-5.6 Terra codes. Assumption: Fable 5 is NOT available going forward (cost/retention friction — see Q3).

Research date: 2026-07-10. Method: WebSearch + WebFetch against anthropic.com, platform.claude.com, code.claude.com, support.claude.com where reachable; third-party sources (MarkTechPost, Vellum, TrueFoundry, etc.) used for benchmark aggregation where Anthropic's own blog didn't tabulate numbers. All facts tagged VERIFIED (confirmed via Anthropic/official doc fetch) / REPORTED (third-party aggregation, plausible but not first-party-confirmed) / UNKNOWN (searched, not found).

---

## Q1 — Sonnet 5 vs Opus 4.8: is Sonnet 5 credible as build-session orchestrator?

**Benchmark table (REPORTED, third-party aggregation from MarkTechPost, cross-checked against Anthropic's own Sonnet 5 announcement for qualitative claims):**

| Metric | Sonnet 4.6 | Sonnet 5 | Opus 4.8 |
|---|---|---|---|
| SWE-bench Pro (agentic coding) | 58.1% | 63.2% | 69.2% |
| Terminal-Bench 2.1 | 67.0% | **80.4%** | 74.6% (REPORTED elsewhere) / "not reported" in MarkTechPost's own table — sources disagree on whether Opus 4.8's Terminal-Bench number is 74.6 or omitted |
| OSWorld-Verified (computer use) | 78.5% | 81.2% | not reported |
| Humanity's Last Exam (with tools) | 46.8% | 57.4% | 57.9% |
| GDPval-AA v2 (knowledge work) | not reported | 1,618 | 1,615 |

Key finding: **Sonnet 5 essentially matches or slightly beats Opus 4.8 on Terminal-Bench 2.1** (the closest public proxy for "run a build session, dispatch subprocesses, verify/fix loops" — Terminal-Bench specifically scores agentic terminal/shell task completion). It is close-but-behind on SWE-bench Pro (63.2 vs 69.2, a ~6pt gap) and roughly tied on tool-augmented reasoning (HLE-with-tools: 57.4 vs 57.9) and knowledge-work (GDPval-AA v2: Sonnet 5 slightly *ahead*, 1618 vs 1615). REPORTED.

Anthropic's own positioning (VERIFIED via anthropic.com/news/claude-sonnet-5 fetch): Sonnet 5 is "built to be the most agentic Sonnet model yet" and can "make plans, use tools like browsers and terminals, and run autonomously." Anthropic explicitly frames the Sonnet-5/Opus-4.8 relationship as an **effort-dial tradeoff for agentic orchestration work**, not a capability-tier cliff — "adjust the effort level to find the right balance of cost and performance." On BrowseComp (agentic search) and OSWorld-Verified (computer use), Sonnet 5 "in some cases matches Opus 4.8's capability levels" at higher effort settings. VERIFIED.

The one place Sonnet 5 clearly trails is **dangerous/cyber-adjacent tasks** (exploit development, e.g. 0% success on a Firefox vulnerability test vs higher Opus 4.8 rates) — irrelevant to build-orchestration but worth flagging since it's the sharpest documented gap. VERIFIED (from Anthropic's own model card language fetched).

**Official Anthropic guidance found on the orchestrator/escalation split (VERIFIED, support.claude.com fetch):** Anthropic's own Claude Code usage docs recommend the pattern **"plan with Opus, execute with Sonnet"** — i.e., the *opposite* pairing direction from a naive read of "Opus is smarter so it should drive," but structurally identical to the proposed pipeline (Opus plans, cheaper/faster model executes/orchestrates the session). This is a first-party-documented pattern, not a third-party inference.

Separately, a formalized **"Advisor Strategy"** (REPORTED via Medium/MindStudio, dated to an April 2026 Anthropic announcement — not independently re-verified against anthropic.com in this pass) pairs Opus as an on-demand reasoning advisor with Sonnet/Haiku as the main executor, consulted only when the executor hits a decision it can't resolve — "near-Opus-level intelligence at closer to Sonnet-level cost." This is the same shape as the proposed pipeline's Opus-plans/Sonnet-orchestrates split, just with Opus staying in the loop as an advisor tool rather than a one-shot planner.

**Read: is Sonnet-5-as-orchestrator evidence-supported or speculative?**
**Evidence-supported, not speculative.** Three independent signals converge: (1) Sonnet 5 ties or beats Opus 4.8 on the single most orchestration-relevant public benchmark (Terminal-Bench 2.1); (2) Anthropic's own product docs recommend exactly this division of labor ("plan with Opus, execute with Sonnet"); (3) the model card explicitly markets Sonnet 5 for autonomous planning/tool-use/terminal work. The one open gap is tool-use *reliability* under long-horizon, many-step agentic loops specifically — no source in this pass gave a long-horizon-loop-specific eval (e.g., a multi-hour build session success rate) distinguishing Sonnet 5 from Opus 4.8; the benchmarks found are single/short-episode agentic tasks (Terminal-Bench episodes, SWE-bench Pro issues), which is a genuine evidentiary gap for the "runs verify/fix loops across an entire build session" claim specifically, as opposed to "is a capable agentic model" generally.

---

## Q2 — Claude Max subscription pool mechanics (5x/20x tiers, July 2026)

VERIFIED (support.claude.com fetches):
- **Tier pricing:** Max 5x = $100/mo, Max 20x = $200/mo.
- **What the multiplier means:** "5x" / "20x" scale *usage per session* relative to the Pro plan baseline — Max 5x = 5× Pro's per-session usage, Max 20x = 20× Pro's per-session usage.
- **Two separate weekly caps exist on Max plans:** one cap spans *all models combined*, and a second, separate cap applies to *Sonnet-model usage only*. This means Opus and Sonnet draw from structurally different buckets on Max (unlike Pro, where everything shares one pool) — confirmed directly from support.claude.com, but the exact numeric caps are **not published** on that page (redirects to account-specific Settings > Usage).
- **Opus costs "several times more per turn than Sonnet"** and "uses meaningfully more of your quota" — this is Anthropic's own phrasing, but **no exact published multiplier** (e.g., "Opus = Nx Sonnet consumption") was found anywhere in this pass, first-party or third-party. Anthropic appears to deliberately not publish a fixed ratio.
- **`/model` switching mid-session** does not reset the conversation or change how usage accrues — usage tracking is model-agnostic at the mechanics level, just weighted differently per model.

REPORTED (third-party aggregation, not independently confirmed against a primary numeric source — treat as approximate):
- Max plans reportedly translate to roughly 140–280 Claude-Code-hours/week (Sonnet) on 5x and 240–480 hours/week (Sonnet) on 20x, with a separate ~40 Opus-hours/week cap reported to apply across *both* Max tiers (i.e., the Opus cap does NOT scale with the 5x/20x multiplier the way the Sonnet cap does). This is a notable and load-bearing claim for the proposed pipeline (Sonnet does the bulk orchestration work, Opus is only touched for planning) — if accurate, it means the pipeline's low-Opus/high-Sonnet shape is well-matched to how the caps are actually structured, since planning-only Opus use would stay well under a fixed ~40hr/week ceiling regardless of tier.
- One incident report (Anthropic-side bug, since described as fixed) noted Opus 4.8 was "triggering more tool calls in parallel than were truly needed," burning quota faster than intended — described as a bug, not by-design behavior. No stable multiplier could be extracted from this source either.

**On subagent usage counting:** REPORTED, not first-party-confirmed on the pricing-mechanics side specifically — general community/blog consensus is that subagent/Task-tool token usage draws from the **same overall pool** as the main session (no separate subagent quota), and that running many subagents in parallel multiplies total token consumption 3–4x versus single-threaded work, with each subagent carrying its own ~20K-token context-priming overhead before productive work starts. No Anthropic-first-party page found that states this explicitly as pricing/quota mechanics (the Agent SDK subagents doc, fetched directly, describes subagent *behavior* — context isolation, background execution, resumability — but does not discuss quota/usage-pool mechanics at all).

**UNKNOWN:** exact numeric weekly caps (all-model and Sonnet-only) per tier; exact Opus-vs-Sonnet burn multiplier; whether subagents dispatched at a *different* model tier than the main session (e.g., a Sonnet-5-orchestrated session dispatching Haiku or Opus subagents) draws against the parent session's model-specific bucket or the subagent's own model's bucket. This last point matters directly for the proposed pipeline if Claude subagents were ever used inside it, but the pipeline as described dispatches to GPT-5.6 (a different vendor entirely) for coding, so this Claude-internal subagent-pool question is likely moot for this specific pipeline — flagging only because it was an explicit sub-question.

---

## Q3 — Opus 4.8 vs Fable 5 for planning: cost of the downgrade

REPORTED (aggregated benchmark comparison, cross-vendor comparison sites, directionally consistent across multiple independent write-ups):

| Dimension | Fable 5 | Opus 4.8 | Gap |
|---|---|---|---|
| Aggregate/provisional score | 92 | 86 | Fable 5 ahead |
| SWE-bench Pro | 80.3% | 69.2% | Fable 5 +11.1pt |
| FrontierCode Diamond | 29.3% | 13.4% | Fable 5 +15.9pt (largest gap found) |
| Knowledge tasks (avg) | 68.6 | 62.7 | Fable 5 +5.9 |
| Math (avg) | 97.6 | 96.7 | Fable 5 +0.9 (small) |
| Multimodal/grounded | 92.9 | 77 | Fable 5 +15.9 (large) |

Qualitative: Fable 5 is characterized as "the stronger model for long, complex, high-stakes reasoning," with Opus 4.8 as "the better default for everyday advanced work." At max reasoning effort, Anthropic reportedly claims Fable 5 self-validates its own moves across long planning horizons with persistent memory, yielding materially better results on tasks requiring iterative self-checking over many steps — directly relevant to a "planning" role, since planning quality often hinges on catching one's own errors before handoff.

**What downgrading from Fable 5 to Opus 4.8 for planning actually costs:** primarily long-horizon/high-stakes reasoning depth and self-verification over extended planning chains, plus a meaningful coding-benchmark gap (SWE-bench Pro, FrontierCode) that matters less for a pure-planning role (no code is written by the planner in this pipeline) but signals a broader reasoning-depth gap that likely also touches plan quality. The multimodal gap (77 vs 92.9) is largest in relative terms but is unlikely to matter for a text/spec-planning role unless the plans involve UI mockups or screenshots.

**Pricing (VERIFIED, cross-referenced against the claude-api skill's cached pricing table and confirmed live via search):**
- Opus 4.8: $5/$25 per MTok (input/output).
- Fable 5: $10/$50 per MTok — **exactly 2× Opus 4.8's price**, no long-context premium beyond that.

**Is "no Fable moving forward" consistent with Anthropic's positioning? — YES, strongly supported (VERIFIED + REPORTED, converging):**
1. **Retention requirement:** Fable 5 requires **30-day data retention** and is flatly unavailable under zero-data-retention (ZDR) org configurations — a 400 error on every request if the org's retention policy doesn't meet this bar. For any org running under ZDR (common for security/compliance-conscious API users), Fable 5 is categorically inaccessible regardless of budget. VERIFIED (claude-api skill, cross-checked against search results on the pricing-credits transition).
2. **Pricing/access transition already underway as of this research date (2026-07-10):** Anthropic extended *included* Fable 5 access (up to 50% of weekly limits on Pro/Max/Team/select-Enterprise plans) only through **July 12, 2026** — three days from today. Starting **July 13, 2026**, continued Fable 5 use on subscription plans switches to metered usage credits at the full $10/$50 per-MTok API rate, i.e., subscribers lose free/bundled access and must pay per-token like a raw API consumer. REPORTED (multiple converging sources: DigitalApplied, Forbes/Sandy Carter, TechTimes — all dated within days of this research, describing the same July 12→13 cutover).
3. **Prior availability instability:** Fable 5 was reported offline entirely from June 12 to July 1, 2026 due to U.S. export control restrictions before being restored globally — i.e., even setting aside cost, Fable 5's availability has been non-continuous within the last month, which independently supports treating it as non-load-bearing for a production pipeline. REPORTED.
4. **Positioning:** Anthropic itself frames Fable 5 as reserved for "the hardest accuracy-critical tasks" / "deep planning, repository-scale review, long-context synthesis, final judgment" — i.e., explicitly a premium escalation tier, not a default, which is consistent with treating it as excluded from a standard pipeline rather than as the planner.

**Conclusion:** given (a) the imminent end of bundled/subscription access (3 days out from this research date), (b) the 2× price premium at metered rates, (c) the ZDR incompatibility, and (d) recent availability instability, excluding Fable 5 from the pipeline and using Opus 4.8 as the planner is well-supported by Anthropic's own positioning and pricing structure — this is not an arbitrary exclusion, it tracks Anthropic's own "escalation-only, not default" framing plus a real near-term cost cliff.

---

## Q4 — Claude Code specifics: per-subagent model selection, `/model` interaction, orchestration guidance

**Can a session's model differ per subagent? — YES, VERIFIED (code.claude.com/docs/en/agent-sdk/subagents, fetched directly).**
The `AgentDefinition` type accepts a `model` field per subagent: "Accepts an alias such as `'fable'`, `'opus'`, `'sonnet'`, `'haiku'`, `'inherit'`, or a full model ID. Defaults to main model if omitted." This is exactly the mechanism the ADR-030/APEX build system already uses (per-task `model` override on Task/Agent dispatches — matches this tool's own `Agent` tool `model` parameter with the same enum). Confirmed directly in the fetched docs page, including a worked example (`create_security_agent`) that dynamically picks `model="opus"` vs `model="sonnet"` per invocation based on runtime strictness level — i.e., Anthropic's own documented pattern is precisely "cheap model for routine work, escalate to Opus for high-stakes sub-tasks," the same shape as the proposed pipeline's Sonnet-orchestrates/Opus-plans split, just inverted in which role each model occupies.

**Does `/model sonnet` on the host session change subagent defaults? — YES by default, VERIFIED.** Per the fetched doc: "Defaults to main model if omitted" — an `AgentDefinition` with no explicit `model` field inherits whatever the parent session's active model is. So a coding-host session running under `/model sonnet` (or `APEX_MODE=coding` pinned to Sonnet 5) would, by default, dispatch subagents also running Sonnet 5, *unless* a specific subagent definition overrides `model` to something else (e.g., `opus` for a security-review subagent, or `inherit` explicitly, which is a distinct value from omitting the field — worth noting `'inherit'` exists as an explicit alias alongside the "just omit it" default-inherit behavior, suggesting `inherit` may have specific semantics around dynamic model-changes mid-session vs a static default captured at definition time; the doc doesn't fully disambiguate this and it wasn't checked further in this pass — flag as a minor open question, low stakes).

**Official guidance on Sonnet-as-driver / Opus-as-escalation pattern:** Confirmed twice, from two different angles:
1. Anthropic's own support docs (Models/usage/limits page): **"plan with Opus, execute with Sonnet."**
2. The Agent SDK subagents doc's own worked example: dynamically escalate to `model="opus"` only for the high-stakes case ("strict" security review), Sonnet otherwise — i.e., Sonnet-as-default-driver, Opus-as-selective-escalation, is Anthropic's own recommended and documented pattern, not a community workaround.

Both of these support the proposed pipeline's shape (Opus does the planning/highest-stakes reasoning up front, Sonnet 5 drives the actual session) as consistent with Anthropic's documented best practice, not against the grain of it.

**Behavior notes relevant to APEX's build-host use case (VERIFIED, from the fetched subagent doc):**
- Subagents run in the **background by default** as of Claude Code v2.1.198+ (an Agent tool call without `run_in_background` set launches non-blocking; the orchestrating model decides when it needs the result synchronously).
- Subagents can **spawn their own subagents** up to 5 levels deep (as of v2.1.172+).
- A subagent inherits the **parent's extended-thinking config** (as of the same version window) — earlier versions disabled thinking inside subagents regardless of parent settings.
- API errors that end a subagent early (rate limit, overload) are handled gracefully as of v2.1.199+ — partial output is returned with a note rather than silently discarded.
- For coordinating **dozens to hundreds** of subagents (beyond APEX's typical wave-parallel dispatch scale), Anthropic recommends the separate `Workflow` tool rather than turn-by-turn subagent delegation — not directly relevant to the 4-model pipeline in question but worth flagging as an escalation path if APEX's own wave-parallel builds ever need to scale beyond a handful of concurrent code-workers.

---

## Q5 — Cross-vendor price/quality table, July 2026

VERIFIED (Anthropic side, from claude-api skill's cached table, cross-checked live) / REPORTED (OpenAI side, GPT-5.6 family, from search aggregation — GPT-5.6 launched as limited preview June 25, 2026 via API + Codex only, pricing may change at GA):

| Model | Input $/MTok | Output $/MTok | Notes |
|---|---|---|---|
| Claude Opus 4.8 | $5.00 | $25.00 | VERIFIED |
| Claude Sonnet 5 | $3.00 (**$2.00 intro through 2026-08-31**) | $15.00 (**$10.00 intro**) | VERIFIED |
| Claude Haiku 4.5 | $1.00 | $5.00 | VERIFIED |
| Claude Fable 5 | $10.00 | $50.00 | VERIFIED; imminent bundled-access cutoff July 13, 2026 (see Q3) |
| GPT-5.6 Sol (flagship) | $5.00 | $30.00 | REPORTED, preview pricing, may change at GA |
| GPT-5.6 Terra (balanced) | $2.50 | $15.00 | REPORTED, preview pricing |
| GPT-5.6 Luna (fast/affordable) | $1.00 | $6.00 | REPORTED, preview pricing |

**Pricing changes since June (flagged as requested):**
- **Sonnet 5** launched June 30, 2026 with introductory pricing ($2/$10) running through **August 31, 2026**, after which it reverts to standard $3/$15 — this is a scheduled future price increase, not yet in effect, and relevant to any cost model APEX builds around a Sonnet-5-orchestrator pipeline (budget for the higher rate from September 2026 onward).
- **Fable 5** subscription-bundled access ends **July 12, 2026** (3 days after this research date) — see Q3. This is the most time-sensitive pricing change found in this pass.
- **GPT-5.6 family** is brand new (announced June 25, 2026), so there is no "change since June" to report for it — it *is* the June/July news. All three tiers (Sol/Terra/Luna) carry a stated caveat that preview pricing "may change at general availability," so GPT-5.6 pricing should be treated as provisional, not final, when used in cross-vendor cost modeling.

**Rough cross-vendor read:** Opus 4.8 ($5/$25) sits between GPT-5.6 Terra ($2.50/$15) and Sol ($5/$30) on input price, and is cheaper than Sol on output ($25 vs $30). Sonnet 5 at intro pricing ($2/$10) undercuts every GPT-5.6 tier on both axes simultaneously except matching Luna's input price while beating its output price — i.e., at intro pricing Sonnet 5 is currently the cheapest capable-tier model in this entire cross-vendor set on a $/output-token basis relative to its benchmarked capability, though this is a temporary window that closes August 31, 2026.

---

## Sources

- [Introducing Claude Sonnet 5 — Anthropic](https://www.anthropic.com/news/claude-sonnet-5)
- [Anthropic Claude Sonnet 5 vs Sonnet 4.6 vs Opus 4.8 — MarkTechPost](https://www.marktechpost.com/2026/06/30/anthropic-claude-sonnet-5-vs-sonnet-4-6-vs-opus-4-8-agentic-coding-benchmarks-api-pricing-and-cost-performance-tradeoffs-compared/)
- [Claude Sonnet 5 Benchmarks Explained — Vellum](https://www.vellum.ai/blog/claude-sonnet-5-benchmarks-explained)
- [Claude Sonnet 5 Beats Opus 4.8 on Terminal-Bench — Medium](https://medium.com/@sebuzdugan/claude-sonnet-5-beats-opus-4-8-on-terminal-bench-for-40-the-price-cb2f3d8a0de5)
- [What is the Max plan? — Claude Help Center](https://support.claude.com/en/articles/11049741-what-is-the-max-plan)
- [Models, usage, and limits in Claude Code — Claude Help Center](https://support.claude.com/en/articles/14552983-models-usage-and-limits-in-claude-code)
- [Claude Code Usage Limits (2026) — morphllm](https://www.morphllm.com/claude-code-usage-limits)
- [Claude Code Resets Usage Limits Again: the Real Culprit Is Opus 4.8 — Pasquale Pillitteri](https://pasqualepillitteri.it/en/news/3995/claude-code-resets-usage-limits-opus-4-8-not-dynamic-workflows)
- [Claude Fable 5 Pricing: The July 7 Usage-Credits Switch — DigitalApplied](https://www.digitalapplied.com/blog/claude-fable-5-usage-credits-july-7-pricing-guide-2026)
- [Claude Fable 5 Extends By Five More Days — Forbes](https://www.forbes.com/sites/sandycarter/2026/07/07/claude-fable-5-extends-by-five-more-days-10-moves-to-make-now/)
- [Fable 5 Subscription Ends Tomorrow — TechTimes](https://www.techtimes.com/articles/319767/20260706/fable-5-subscription-ends-tomorrow-per-token-costs-who-gets-hit-hardest.htm)
- [Claude Fable 5 and Claude Mythos 5 — Anthropic](https://www.anthropic.com/news/claude-fable-5-mythos-5)
- [Claude Fable 5 vs Opus 4.8: Benchmarks, Pricing & When to Use Each — TrueFoundry](https://www.truefoundry.com/blog/claude-fable-5-vs-opus-4-8-benchmarks-pricing-when-to-use-each)
- [Claude Fable 5 & Claude Mythos 5 Full Benchmark Breakdown — Vellum](https://www.vellum.ai/blog/claude-fable-5-and-mythos-5-benchmarks-explained)
- [Subagents in the SDK — Claude Code Docs](https://code.claude.com/docs/en/agent-sdk/subagents)
- [The Advisor Strategy — Medium](https://medium.com/@ai_93276/the-advisor-strategy-how-anthropics-new-pattern-delivers-opus-level-agents-at-sonnet-prices-933510b21200)
- [Claude Code Models: Choose the Right AI for Every Task — claudefa.st](https://claudefa.st/blog/models/model-selection)
- [Previewing GPT-5.6 Sol — OpenAI](https://openai.com/index/previewing-gpt-5-6-sol/)
- [A preview of GPT-5.6 Sol, Terra, and Luna — OpenAI Help Center](https://help.openai.com/en/articles/20001325-a-preview-of-gpt-56-sol-terra-and-luna)
- [GPT-5.6 Pricing 2026: Sol, Terra and Luna Tiers Explained — Finout](https://www.finout.io/blog/gpt-5.6-pricing-2026-sol-terra-and-luna-tiers-explained)
- [OpenAI sets GPT-5.6 pricing — CryptoBriefing](https://cryptobriefing.com/openai-gpt-56-pricing-tiers/)
- [The new GPT-5.6 family: Luna, Terra, Sol — Simon Willison](https://simonwillison.net/2026/Jul/9/gpt-5-6/)
