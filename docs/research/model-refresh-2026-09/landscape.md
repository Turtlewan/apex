# Frontier coding model landscape — refresh as of 2026-09-23

Research pass for a model-routing decision. Current routing (~July 2026): host/planner =
Claude Fable 5; spec author + build orchestrator = Claude Opus 5; coder = OpenAI Codex
`gpt-5.6-sol` via `codex exec` (ChatGPT subscription), fallback Sonnet 5; cross-family review
(Codex checks Claude specs, Claude reviews Codex code).

All facts below are web-search-verified on 2026-09-23 unless marked UNVERIFIED. Cached
knowledge from the bundled `claude-api` skill (snapshot dated 2026-06-24) was used only as a
prior, not as a source — every pricing/capability claim taken from it was cross-checked live.

---

## 1. Anthropic: Fable 5.1 and Opus 5.5 vs Fable 5 / Opus 5

### Claude Fable 5.1 (`claude-fable-5-1`)

- **Release date: September 1, 2026.** GA immediately on Claude API, AWS, Google Cloud,
  Microsoft Azure. VERIFIED — [MacRumors](https://www.macrumors.com/2026/09/01/anthropic-claude-fable-5-1/),
  [Anthropic](https://www.anthropic.com/claude-fable-and-mythos-5-1), [VentureBeat](https://venturebeat.com/technology/anthropics-claude-fable-5-1-and-mythos-5-1-arrive-with-a-75-cost-reduction-for-fable-cache-reads).
- **Positioning vs Fable 5:** same tier, "similar or better" at low/medium effort, "much higher
  performance at higher effort tiers." Anthropic claims it outperforms Fable 5, Opus 5, and
  OpenAI's GPT-5.6 Sol across benchmarks (vendor claim — no independent confirmation found).
  VERIFIED (claim sourced) / UNVERIFIED (independent replication).
- **Benchmark deltas (VERIFIED, llm-stats.com research post):**
  - Terminal-Bench-Science: 24.7% → 52.6% (more than doubled)
  - Terminal-Bench 4.0 (coding): 42.0% → 55.8%
  - SWE-bench Verified: → 95.0%
  - AutomationBench (multi-step agentic): 17.1% → 31.4% (nearly doubled)
  - Anthropic's own reported SWE-bench Pro figure for Fable 5.1 is 81.2, described as only a
    "slim lead" over Fable 5 and Opus 5 — Anthropic did **not** headline a SWE-bench number for
    5.1, so treat that 95.0% Verified figure and the 81.2 Pro figure as from different sources/
    methodologies. UNVERIFIED which one Anthropic's own model card leads with — sources
    disagree on framing.
  - **Overall pattern (VERIFIED across sources):** Fable 5.1's gains concentrate almost entirely
    in long-horizon, multi-step, tool-using agentic work — not short single-turn tasks or
    instruction-following in isolation. Relevant to a build-orchestrator role, which is
    long-horizon by nature.
- **Reliability / false positives:** Claude Code users should see "around 60% fewer
  cybersecurity false positives" vs Fable 5. VERIFIED (MacRumors, citing Anthropic). Fable 5.1
  can now discover (but not develop exploits for) software vulnerabilities — new capability,
  gated by safety classifiers.
- **Pricing:** headline $10/$50 per MTok unchanged from Fable 5. Cache-read price cut 75%, from
  $1.00 to $0.25 per MTok. Net effect: ~25% cost reduction for typical workloads, up to 45% for
  highly agentic (cache-heavy) work. VERIFIED.
- **Context window:** 1M tokens (same as Fable 5), 128K max output. VERIFIED via cached skill
  data, consistent with all fetched sources — no source reported a change.
- **Claude Code / subscription usage:** Fable 5.1 is metered identically to Fable 5 — same
  Max/premium-seat inclusion up to 50% of the weekly pool, same usage-credit behavior on
  Pro/standard seats, same shared weekly allowance. VERIFIED (continuumcode.ai, cross-checked
  against Anthropic's plan-limits framing). Separately, Anthropic ran a +50% weekly-limit boost
  through 2026-09-14, after which standard weekly limits became **permanently 25% higher** than
  the pre-boost baseline for Pro/Max/Team/seat-based Enterprise — this is a platform-wide
  change, not Fable-5.1-specific. VERIFIED.

### Claude Opus 5.5 (`claude-opus-5-5`)

- **Release date: September 22, 2026** — one day before this research, and under two months
  after Opus 5. VERIFIED — [MarkTechPost](https://www.marktechpost.com/2026/09/22/anthropic-claude-opus-5-5-release/),
  [Vellum](https://www.vellum.ai/blog/claude-opus-5-5-benchmarks-explained).
- **Headline pitch:** "Fable 5.1-class performance at ~40% lower running cost than Opus 5."
  VERIFIED (multiple independent sources converge on this framing).
- **Benchmark deltas vs Opus 5 (VERIFIED, MarkTechPost, cites Anthropic's own release table —
  note one internal inconsistency flagged below):**
  - Terminal-Bench 4.0: 52.3% → 66.4% (+14.1 pts) — but a second source (Vellum, citing
    Anthropic's benchmark table) reports Opus 5's Terminal-Bench-4.0-relevant baseline
    differently (an earlier comparison put Opus 5 around 56% depending on effort level).
    UNVERIFIED exact baseline — flag for the routing decision: Opus 5's Terminal-Bench 4.0
    number is not perfectly consistent across sources, likely an effort-level (`high` vs
    `xhigh`/`max`) discrepancy rather than a factual error.
  - FrontierCode v1.1: 48.0% → 54.4% (+6.4 pts)
  - CursorBench 4.0: 46.6% → 57.8% (+11.2 pts)
  - OSWorld 2.0: 74.0% → 81.8% (+7.8 pts)
  - SWE-bench Pro: Opus 5.5 tops Anthropic's table at 89.9%, a **+10.7 pt jump over Opus 5**.
    VERIFIED (Vellum).
- **Long-horizon / agentic:** Artificial Analysis Intelligence Index — Opus 5.5 takes the #1
  spot at index score 58 (max effort), leading on 6 of 10 core evals, with roughly a 5-point
  lead over GPT-6 Astra. VERIFIED — [Artificial Analysis](https://artificialanalysis.ai/models/releases/comparisons/claude-opus-5-5-vs-gpt-6-astra),
  [officechai.com](https://officechai.com/ai/claude-opus-5-5-creates-5-point-lead-over-gpt-6-astra-jumps-to-top-spot-on-artificial-analysis-intelligence-index/).
  On Artificial Analysis's Coding Agent Index specifically, figures are inconsistent across two
  cited snapshots of the same source (62 vs 70 for Fable 5.1 in Claude Code; 62 vs 67 for Astra
  in Codex) — likely a methodology-version update mid-month. UNVERIFIED which snapshot is
  current; re-check Artificial Analysis directly before citing a specific number.
- **Instruction following / writing quality:** MarkTechPost reports the model "puts key
  information first, uses less jargon, and follows the writing rules you give it" — relevant to
  spec-authoring quality. UNVERIFIED against a quantitative benchmark (this is qualitative
  reviewer commentary, not a scored eval).
- **Reliability / first-pass correctness / review quality:** Deloitte (cited by MarkTechPost)
  reported Opus 5.5 "caught 72% of known review bugs" at **lowest** effort, vs Opus 5's 56% at
  **high** effort — i.e., cheaper-effort Opus 5.5 already beats expensive-effort Opus 5 on a
  bug-catching review task. VERIFIED (single-source citation of a Deloitte finding — treat as
  credible but not independently replicated). MarkTechPost also cautions that "benchmark margins
  are becoming a less reliable guide" to real-world performance gaps. A user anecdote: a
  680,000-line code migration completed in under a day (UNVERIFIED, single anecdote, not a
  controlled eval).
- **Pricing:** $4/$20 per MTok (down from Opus 5's $5/$25 — a 20% cut on raw tokens). Cache
  reads cut 60% to $0.20/MTok, driving the ~40% typical-cost-reduction claim. Fast mode:
  $8/$40 (2x standard), up to 2.5x speed. VERIFIED, consistent across sources and matches the
  claude-api skill's cached pricing table exactly.
- **Context window:** 1M tokens, 128K max output — unchanged. Managed API only; weights not
  released, no self-hosting. VERIFIED.
- **Claude Code subscription usage limits:** Anthropic raised 5-hour usage limits on
  Pro/Max/Team/seat-based Enterprise plans alongside the release, plus a new "saved-reset"
  feature. VERIFIED that limits were raised; specific new numeric thresholds were **not found**
  in any fetched source — UNVERIFIED / GAP. Recommend pulling Anthropic's own plan-limits page
  directly before finalizing routing if exact 5-hour caps matter to the decision.
- **Note on the skill's cached table:** the claude-api skill (cached 2026-06-24) already had
  `claude-opus-5-5` provisioned as "launching — use only when user names it," with the exact
  pricing above and a note that thinking cannot be disabled at any effort level (default effort
  `medium`, one level below Opus 5's `high`). That API-behavior claim is skill-internal
  (Anthropic API mechanics), not independently web-verified here, but is consistent with
  Anthropic's known pattern of tightening thinking controls release-over-release.

---

## 2. OpenAI: what shipped since gpt-5.6-sol

- **GPT-5.6 family (Sol / Terra / Luna) — already your baseline, confirmed still current as
  the second-tier option.** GA July 9, 2026 across ChatGPT, Codex, API. Sol = flagship, Terra =
  cost-competitive-with-5.5, Luna = fastest/cheapest. Codex CLI **0.144.0+** required. Pricing
  cut July 30, 2026: Terra −20%, Luna −80% (Luna now $0.20/$1.20 per MTok). VERIFIED —
  [OpenAI](https://openai.com/index/gpt-5-6/), [Vellum](https://www.vellum.ai/blog/gpt-5-6-sol-terra-luna-explained),
  [codex.danielvaughan.com](https://codex.danielvaughan.com/2026/08/05/gpt-5-6-model-migration-codex-cli-luna-terra-sol-config-profiles-task-routing/).
- **No GPT-5.7 exists.** Searches turned up nothing; OpenAI's numbering jumped from the 5.x line
  directly to a new major generation. VERIFIED (absence — multiple targeted searches, including
  OpenAI's own release-notes page, returned no 5.7).
- **GPT-6 Astra — the actual successor, and this is the key finding for the routing decision.**
  - **Release date: September 3, 2026.** VERIFIED — [OpenAI](https://openai.com/index/gpt-6-astra/),
    [Yotta Labs](https://www.yottalabs.ai/post/gpt-6-release-date-rumors-what-is-known-2026),
    [codex.danielvaughan.com](https://codex.danielvaughan.com/2026/09/03/gpt-6-astra-codex-cli-configuration-context-notes-safety/).
  - **Codex CLI version required: 0.153.0+.** VERIFIED — [codexusage.dev](https://www.codexusage.dev/limits/astra),
    community forum corroboration.
  - **Codex harness update alongside Astra:** a note-keeping feature that preserves context
    across context windows instead of compressing into summaries (experimental at launch,
    becoming the Astra default "in the coming weeks" — as of Sept 3 framing, likely live or
    near-live by now, Sept 23). Updated harness claims **1.9x faster task completion** vs the
    GPT-5.6 Sol experience on Mind2Web. VERIFIED (OpenAI's own release claim; independent
    replication not found — treat the 1.9x figure as vendor-reported).
  - **Benchmark deltas vs GPT-5.6 Sol (VERIFIED, OpenAI + Vellum):**
    - FrontierMath Tier 4: saturates at 97.6%
    - ARC-AGI-3: 99.9%
    - OSWorld 2.0: 65.7% → 72.6% (Sol → Astra), and ~1.9x faster (75 min → ~40 min per task)
    - Terminal-Bench 4.0: 37.3% (Sol) → 57.9% (Astra) — a large jump
    - DeepSWE v1.1: 72.7% → 74.1%
    - FrontierCode 1.1 Extended: 60.6% → 64.5%
  - **Subscription / plan availability:** GPT-6 Pro (powered by Astra) ships on ChatGPT Pro
    $100/$200, Business, Enterprise. Plus plans get Astra in ChatGPT Work and Codex with limited
    quota, plus optional paid credits beyond that. Codex-specific 5-hour local-message limits by
    plan (VERIFIED, [codexusage.dev](https://www.codexusage.dev/limits/astra)):
    - Plus / Business Standard: 5–45 msgs/5h
    - Pro $100: 25–225 msgs/5h
    - Pro $200: 100–900 msgs/5h
    - Business Premium: no 5-hour limit
    - These ranges (rather than single numbers) reflect Astra's variable per-task cost —
      OpenAI doesn't publish a flat message count.
- **How Astra compares to Claude on coding specifically (mixed picture — this matters for the
  coder-role decision):**
  - GPT-6 Astra **beats** Claude Opus 5 on 7 of a larger benchmark set including ARC-AGI-3,
    AutomationBench, BrowseComp, DeepSWE 1.1, HealthBench Professional, OSWorld 2.0, and
    Terminal-Bench 4.0 (vs Opus 5's older Terminal-Bench score). Opus 5 leads Astra on
    FrontierCode 1.1 and on Artificial Analysis's "public agentic lane" (78.8 vs 70.5).
    VERIFIED, [llm-stats.com](https://llm-stats.com/models/compare/claude-opus-5-vs-gpt-6-astra).
  - But against the **newer** Opus 5.5 (released 19 days after Astra), Claude reclaims the
    coding lead: Opus 5.5's Terminal-Bench 4.0 (66.4%) beats Astra's (57.9%); Opus 5.5 leads the
    Artificial Analysis Intelligence Index outright. VERIFIED, per section 1 above.
  - Cost: Claude Opus 5 was roughly 2x cheaper per token than Astra on a blended 3:1 basis
    (pre-Opus-5.5 pricing cut, which would widen this further). Astra accepts a larger raw
    context window (~1.05M vs 1M) — a marginal difference. VERIFIED.
  - **Net read for your coder-role question:** GPT-6 Astra is a real, more-capable-than-Sol
    successor already integrated into Codex CLI (0.153.0+) with its own harness improvements
    (persistent context, faster task completion). If the coder role is currently pinned to
    `gpt-5.6-sol`, **Astra is the natural upgrade candidate on the OpenAI side** — it beats Sol
    substantially on Terminal-Bench 4.0 (37.3%→57.9%) and OSWorld. Whether it's worth the
    quota/plan tier tradeoff (Astra Codex access is gated more tightly on lower ChatGPT plans
    than Sol was) is a policy question outside this research's scope.

---

## 3. Independent (non-vendor) evals

### (a) Agentic coding first-pass correctness

- No single independent (non-vendor) benchmark run was found that directly scores "first-pass
  correctness" for Fable 5.1 / Opus 5.5 / GPT-6 Astra head-to-head under identical harness
  conditions. The closest are third-party aggregator sites (llm-stats.com, Vellum, BenchLM.ai,
  Artificial Analysis, morphllm.com) that re-host and cross-tabulate each vendor's own published
  benchmark numbers (Terminal-Bench, SWE-bench Pro/Verified, OSWorld, FrontierCode) rather than
  running fresh evals themselves. Treat all specific percentage figures above as
  **vendor-reported, independently re-tabulated** — not independently re-run. This is an
  important caveat: none of it is a from-scratch third-party benchmark execution.
  UNVERIFIED / GAP: a genuinely independent (re-run, not re-tabulated) first-pass-correctness
  comparison.
- Artificial Analysis is the closest thing to an independent aggregator with its own composite
  Coding Agent Index and Intelligence Index, but it still consumes vendor-published or
  vendor-facilitated benchmark runs rather than running blind evals itself; its methodology
  changed mid-month (see the Coding Agent Index inconsistency noted in section 1), which should
  lower confidence in any single snapshot.
- `arXiv:2608.02499`, "SWE-Touch: Benchmarking Coding Agents When Users Touch the Code" — a
  genuinely independent academic benchmark, found in search results but not fetched in this
  pass (time-boxed). It specifically targets a gap vendor benchmarks miss: agent performance
  when a human edits code mid-task. Flagged as a promising follow-up source, not yet read.
  UNVERIFIED — GAP, recommend a follow-up fetch if first-pass correctness under realistic
  (human-touched) conditions matters for the routing decision.

### (b) Code review / spec review precision (false positives, real-bug detection)

- Anthropic's own Claude Code Review reports **<1% of findings dismissed as false positives** by
  engineers, attributed to a dedicated verification pass that tries to disprove each finding
  before posting it. VERIFIED as a vendor-published figure — **not independently confirmed**,
  and no equivalent false-positive benchmark has been independently published for Codex's
  review feature (so no apples-to-apples FP-rate comparison exists). GAP.
- **Directly relevant paper found: Xiang, Zhang, Zhang, Xu (July 27, 2026), "Cross-Model LLM
  Code Review: Should you use Claude to review Codex or vice versa?"** (`arXiv:2607.21656`,
  PDF fetched). This is exactly your current cross-family-review architecture question. Findings
  extracted:
  - Methodology: evaluates Claude and Codex both reviewing each other's generated code (cross-
    model review) vs. self-review, using LiveCodeBench-sourced code and measuring real-bug
    detection rate and false-positive frequency per model pairing.
  - **UPDATE (this pass): numbers now extracted — see the "Cross-review paper + claim checks"
    section below for the full pass-rate table, fix/regression counts, significance tests, and
    the finding that this paper does NOT test iteration/convergence (single-pass only). The
    earlier "could not extract" note below described a prior pass's tool failure and is now
    stale — full primary-source read superseded it.

### (c) Planning / spec-writing quality

- No independent benchmark or study was found that specifically scores spec-writing or planning
  quality (as opposed to code generation) across Fable 5.1 / Opus 5.5 / GPT-6 Astra. The closest
  signal is qualitative reviewer commentary on Opus 5.5's writing style (see section 1: "puts
  key information first, uses less jargon, follows writing rules") — not a scored eval, single
  source (MarkTechPost), UNVERIFIED as a generalizable claim. GAP: no controlled comparison
  exists for the spec-author role specifically; the routing decision here would have to lean on
  the general Intelligence Index / instruction-following proxies rather than a task-specific
  eval.

---

## Summary of gaps / things not found

1. Exact new Claude Code 5-hour usage thresholds post-Opus-5.5 (raise confirmed, numbers not).
2. Independent, freshly-re-run (not re-tabulated) first-pass correctness comparison across all
   three current-generation models.
3. ~~The quantitative results inside arXiv:2607.21656~~ — RESOLVED this pass, full numbers now in
   the "Cross-review paper + claim checks" section. Remaining gap: the paper tests Claude Opus 4.7
   / Codex GPT-5.5 (one generation behind Opus 5.5 / GPT-6 Astra), and does not test iteration or
   convergence at all (single-pass design only).
4. Any dedicated, controlled eval of spec/planning-writing quality specifically (as distinct from
   general instruction-following or coding benchmarks).
5. Independently-published false-positive rate for Codex's code-review feature, to compare
   against Anthropic's <1% claim.
6. Confirmation of which Artificial Analysis Coding Agent Index snapshot (62 vs 70 for Fable 5.1)
   is current — methodology appears to have changed mid-September.

---

## Cross-review paper + claim checks

### arXiv:2607.21656 — full numbers now extracted (supersedes the GAP noted in section 3(b))

The earlier pass could only fetch this PDF through a summarizing tool and got garbled/compressed
output. This pass read the PDF directly page-by-page. Full citation, methodology, and every
numeric table below are now VERIFIED against the primary source text (not a re-summarization).

**Citation:** Zuodong Xiang, Yike Zhang, YueMing Zhang, Hailu Xu (UC Davis / Johns Hopkins / CSU
Long Beach). "Cross-Model LLM Code Review: Should you use Claude to review Codex or vice versa?"
Agentic SE @ KDD '26, Jeju, Korea, presented 2026-08-10. arXiv:2607.21656v1 [cs.SE], submitted
2026-07-22. Artifact/code: https://github.com/shawnzxiang/cross-model-review-code. Funded in part
by NSF Award #2436427.

**Important framing correction:** this paper does **not** report a "real-bug detection rate" or
a "false-positive rate" in those terms. It measures **pass rate** on hidden LiveCodeBench test
suites (did the final submitted program pass, yes/no), plus **fix rate** (writer failed, review
made it pass) and **regression rate** (writer passed, review made it fail — the closest proxy to
a harmful-intervention / false-positive-style metric, since it's the reviewer breaking something
that wasn't broken). There is no separate "flagged a bug that wasn't real" metric because the
reviewer's only output is a replacement program, not a list of findings.

**Model versions tested:** Claude Opus 4.7 (via Claude Code 2.1.50) vs Codex GPT-5.5 (via Codex
CLI), both at the vendors' **high** reasoning-effort setting. (Note: these are one generation
behind the Opus 5.5 / GPT-6 Astra pair covered in sections 1–2 of this doc — the paper explicitly
flags in its limitations section that newer model versions likely shift these numbers.)

**Task set:** 116 complete-case tasks pooled from LiveCodeBench hard+medium difficulty tiers,
released after 2025 (post-training-cutoff for both models, contamination-controlled). Single-file
Python, hidden test suite. Reviewer sees the problem + writer's draft but **cannot execute code or
tests** — pure static/pre-CI-style review. Six conditions: two solo baselines (A=Claude solo,
O=Codex solo), two same-model self-review (AA, OO), two cross-model review (AO = Claude written,
Codex-reviewed; OA = Codex written, Claude-reviewed).

**Headline pass-rate table (Table 2/3 in the paper):**

| Condition | Pass rate | Δ vs writer's solo baseline | Regression rate | Cost/task | Latency/task |
|---|---|---|---|---|---|
| A: Claude solo | 91.4% [.862–.957] | — | — | $0.226 | 86.2s |
| O: Codex solo | 71.6% [.629–.793] | — | — | $0.190 | 38.5s |
| AA: Claude reviewed by Claude | 91.4% | +0.0 pp | 2.6% | $0.389 | 135.8s |
| AO: Claude reviewed by Codex | 82.8% [.759–.897] | −8.6 pp | 11.2% | $0.382 | 118.0s |
| OA: Codex reviewed by Claude | 89.7% [.836–.948] | +18.1 pp | 4.3% | $0.443 | 112.4s |
| OO: Codex reviewed by Codex | 84.5% [.776–.905] | +12.9 pp | 5.2% | $0.312 | 67.9s |

**Fix/regression counts (out of 116 paired tasks), net passes:**
- OA (Codex written, Claude-reviewed): 26 fixes, 5 regressions → net +21
- OO (Codex self-review): 21 fixes, 6 regressions → net +15
- AO (Claude written, Codex-reviewed): 3 fixes, 13 regressions → net **−10**
- AA (Claude self-review): 3 fixes, 3 regressions → net 0 (noise floor)

**Statistical significance (McNemar test, Benjamini-Hochberg corrected, Table 4):**
- OA vs O (Codex solo): p_BH = .0010 — significant improvement
- OO vs O: p_BH = .0222 — significant improvement
- AO vs A (Claude solo): p_BH = .0456 — significant **degradation**
- AA vs A: p_BH = 1.0000 — no effect
- AA vs AO: p_BH = .0323 — reviewer choice matters even for the stronger writer
- Direct AO-vs-OA ordering contrast: p_BH = .1444 — does **not** survive correction, so the paper
  explicitly declines to claim the two cross-model orderings are statistically separable as
  standalone conditions on this sample (116 tasks is called out as a bounded diagnostic sample,
  not enough for stable ranking).

**Bottom line / asymmetry finding:** Claude reviewing Codex helps a lot (+18.1pp) and is the best
accuracy option; Codex reviewing itself also helps (+12.9pp) at lower cost/latency; Codex
reviewing Claude actively hurts (−8.6pp, highest regression rate of any condition at 11.2%);
Claude reviewing itself is a no-op. The paper's own practical recommendation: if Codex writes,
add Claude as reviewer for best accuracy or Codex self-review for cost/latency; if Claude writes,
skip review entirely — no tested reviewer beat Claude solo. Qualitatively, Codex-as-reviewer
tends to discard the writer's approach and rewrite from scratch when uncertain (higher regression
risk); Claude-as-reviewer tends to keep the writer's structure and patch one local invariant.

**Convergence / iteration / rounds — explicitly NOT tested, do not extrapolate:** the design is
single-pass only. Direct quote (Section 2.2): "the reviewer is a different model, runs once, has
no execution feedback, and has no memory of prior attempts. This removes iteration and tool use,
so that the measured effect can be attributed to the cross-model review pass itself." No
convergence data, round count, or diminishing-returns curve exists in this paper — it is flagged
only as future work ("whether models can benefit from memory of past failures... test driven
development, or feedback on draft results").

**Caveats relevant to using this for your routing decision:**
- Self-contained competitive-programming functions, not repo-scale/multi-file changes — the
  paper explicitly says this does not generalize to "repository-scale bug fixing, build systems,
  or multi-file review," which is closer to what apex-code's cross-family review actually does.
  Static review only (no test execution) likely **understates** what a tool-using agent with a
  sandbox (like your Codex/Claude review setup, which presumably can run things) would achieve.
  Single model pair only — untested whether the Claude-reviews-better-than-Codex-reviews
  asymmetry generalizes to Gemini/DeepSeek/Qwen/Grok or newer Claude/Codex versions. Manually
  written prompts, not tuned per model. Reviewer always outputs a replacement program with no
  explicit "should I even intervene?" decision step, which the authors suspect drives Codex's
  high regression rate.
- This paper's Claude Opus 4.7 / Codex GPT-5.5 pairing is **one generation behind** the current
  Opus 5.5 / GPT-6 Astra pairing this landscape doc otherwise covers — treat the specific
  percentages as dated, but the qualitative asymmetry finding (a stronger self-verifying writer
  gains little from review; a weaker writer gains a lot from a stronger cross-model reviewer,
  and the reverse direction risks regressions) as the more durable takeaway.

Saved PDF (session-scoped, may not persist): `C:\Users\User\.claude\projects\C--users-user-apex\884f73e9-5f44-4e01-8863-c97654dc09fc\tool-results\webfetch-1790173472763-i9oewa.pdf`

### Claim check 1: Deloitte / Claude Opus 5.5 review-bug-catch-rate — CONFIRMED

Exact quote, sourced from Anthropic's own Opus 5.5 announcement page
(https://www.anthropic.com/claude-opus-5-5), attributed to Deloitte Consulting LLP:

> "Even at its lowest effort setting, Claude Opus 5.5 caught 72% of known bugs in our code
> reviews to Opus 5's 56% at high effort, with fewer false alarms and a fraction of the output."

This matches the number already recorded in section 1 of this doc (lines ~88–95) almost verbatim
— re-confirmed directly against the primary source rather than the MarkTechPost secondary citation
used previously. Same caveat as before: single vendor-published customer quote, not an
independently replicated benchmark.

### Claim check 2: GPT-6 Astra Codex quota per plan tier — CONFIRMED (consistent with section 2)

Cross-checked via web search against codexusage.dev and OpenAI's own help-center framing (direct
fetch of the OpenAI help-center page returned HTTP 403, so this relies on the secondary source
already cited in section 2, now corroborated by a second independent search pass):

- Plus / Business Standard: 5–45 Astra messages per 5-hour window
- Pro $100: 25–225 messages per 5-hour window
- Pro $200: 100–900 messages per 5-hour window
- Business Premium: no 5-hour limit (5x Standard usage instead)

These are ranges rather than fixed numbers because Astra's per-message cost varies with task
complexity/reasoning effort — OpenAI does not publish a flat count. This matches what's already
recorded in section 2 (lines ~146–155) of this document; no new information, confirmed stable.

---

## Sources

- https://www.anthropic.com/claude-fable-and-mythos-5-1
- https://www.macrumors.com/2026/09/01/anthropic-claude-fable-5-1/
- https://venturebeat.com/technology/anthropics-claude-fable-5-1-and-mythos-5-1-arrive-with-a-75-cost-reduction-for-fable-cache-reads
- https://llm-stats.com/blog/research/claude-fable-5-1-launch
- https://emergent.sh/learn/claude-fable-5-1-benchmarks
- https://www.marktechpost.com/2026/09/22/anthropic-claude-opus-5-5-release/
- https://www.vellum.ai/blog/claude-opus-5-5-benchmarks-explained
- https://artificialanalysis.ai/models/releases/comparisons/claude-opus-5-5-vs-gpt-6-astra
- https://officechai.com/ai/claude-opus-5-5-creates-5-point-lead-over-gpt-6-astra-jumps-to-top-spot-on-artificial-analysis-intelligence-index/
- https://continuumcode.ai/guides/claude-code-limits/
- https://openai.com/index/gpt-5-6/
- https://www.vellum.ai/blog/gpt-5-6-sol-terra-luna-explained
- https://codex.danielvaughan.com/2026/08/05/gpt-5-6-model-migration-codex-cli-luna-terra-sol-config-profiles-task-routing/
- https://openai.com/index/gpt-6-astra/
- https://www.yottalabs.ai/post/gpt-6-release-date-rumors-what-is-known-2026
- https://codex.danielvaughan.com/2026/09/03/gpt-6-astra-codex-cli-configuration-context-notes-safety/
- https://www.codexusage.dev/limits/astra
- https://llm-stats.com/models/compare/claude-opus-5-vs-gpt-6-astra
- https://www.vellum.ai/blog/gpt-6-astra-benchmarks-explained
- https://arxiv.org/pdf/2607.21656 (Xiang, Zhang, Zhang, Xu — Cross-Model LLM Code Review, 2026-07-27; full text read directly, numbers extracted and verified)
- https://github.com/shawnzxiang/cross-model-review-code (paper's released artifact/code)
- https://www.anthropic.com/claude-opus-5-5 (primary source for the Deloitte 72%/56% quote)
- https://arxiv.org/pdf/2608.02499 (SWE-Touch — not yet fetched, flagged as follow-up)
- https://www.morphllm.com/best-ai-model-for-coding
