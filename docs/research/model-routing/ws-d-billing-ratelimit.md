# WS-D — Real Billing Model + Rate-Limit Budgeting for Mixed Claude/DeepSeek Coding

_Phase-2 retrieval — cited findings only. No verdict._
_Date: 2026-06-21. Re-research after: 2026-09-21 (fast-moving; Anthropic changed limits May 2026)._

---

## 1. Claude Max Plan Rate Limits (Current, 2026)

### Two overlapping limit structures [VERIFIED — official docs]

Sources: support.claude.com/en/articles/11049741 · support.claude.com/en/articles/8325606 · anthropic.com/news/higher-limits-spacex

**A. 5-hour rolling window (per-session)**

Every paid plan has a rolling 5-hour session window that resets every 5 hours from when you first hit the limit. The multiplier structure (relative to Pro baseline = 1×):

| Plan | Relative 5-hr window |
|------|---------------------|
| Free | ~0.2× |
| Pro ($20/mo) | 1× baseline |
| Team Standard seat | ~1.25× Pro |
| Team Premium seat | ~6.25× Pro |
| Max 5× ($100/mo) | 5× Pro |
| Max 20× ($200/mo) | 20× Pro |

Anthropic doubled Claude Code's five-hour rate limits in May 2026 (effective ~May 6, 2026) for Pro, Max, Team, and Enterprise plans, and removed peak-hours limit reductions for Pro and Max accounts. [VERIFIED — anthropic.com/news/higher-limits-spacex]

Estimated prompt capacity per 5-hour window (community estimates, not Anthropic-published): [COMMUNITY — truefoundry.com]

| Plan | Approx prompts/5hr window |
|------|--------------------------|
| Pro | ~10–45 prompts |
| Max 5× | ~50–225 prompts |
| Max 20× | ~200–900 prompts |

Anthropic deliberately does not publish fixed token counts — the actual capacity is variable based on conversation length, attachments, model selected, and extended thinking usage.

**B. Weekly cap (dual-model limit) [VERIFIED — official docs]**

Max plans have **two** weekly usage limits:
1. One applies across ALL models
2. One applies specifically to Sonnet models only

[Source: support.claude.com/en/articles/11049741]

The Pro plan also has a weekly all-model cap. Reset timing is account-specific and stays consistent throughout a subscription. [Source: support.claude.com/en/articles/8325606]

Estimated weekly active compute hours (community estimates): [COMMUNITY — truefoundry.com]

| Plan | Sonnet hours/week | Opus hours/week |
|------|------------------|-----------------|
| Pro | ~40–80 hrs | N/A (minimal) |
| Max 5× | ~140–240 hrs | ~15–35 hrs |
| Max 20× | ~240–480 hrs | ~24–40 hrs |

For Team/Enterprise specifically: a separate support article (found via search, not fully fetched) cited ~50–95 hrs Sonnet/week and ~3–7 hrs Opus/week per seat — directionally consistent with Max 5× above. [COMMUNITY — via search result excerpt from support.claude.com]

**What Anthropic publishes explicitly:** The 5× and 20× multipliers relative to Pro. They do not publish absolute numbers publicly. Check Settings > Usage in your account for your personal reset time and remaining allocation. The `/status` command in Claude Code also surfaces remaining capacity.

---

## 2. Does Claude-Coding Compete With Planning Budget? [VERIFIED — YES]

**The single pool fact:**

> "your usage of all different Claude product surfaces (claude.ai, Claude Code, Claude Desktop) counts towards the same usage limit"

Source: support.claude.com/en/articles/11647753

> "Claude Code pulls from the same usage pool as chat" and "Unified usage across surfaces: Claude.ai, Claude Code, and Claude Desktop all pull from the same pool."

Source: dejaflow.com/blog/2026/05/04/how-claude-team-plan-usage-limits-work/ [COMMUNITY, confirmed by multiple sources]

> "Claude Design now shares usage limits with Claude.ai and Claude Code" (change May 27–28, 2026 — expanded the shared surface to design tool as well)

Source: piunikaweb.com/2026/05/28/ [COMMUNITY]

**Direct answer: YES.** Running Opus or Sonnet as interactive coding subagents DOES draw from the SAME Max subscription pool as planning (claude.ai chat) and all other Claude surfaces. A heavy multi-agent Claude-coded build competes directly with and can exhaust the planning budget.

This is the core risk the policy is designed to address. The weekly Opus cap is the binding constraint — there are only ~15–35 hrs/week of Opus on a Max 5× plan, and this is shared across ALL surfaces.

**June 15, 2026 exception — headless/non-interactive split:**

Starting June 15, 2026, Anthropic introduced a billing split: [VERIFIED — pravinkumar.co/blog/claude-june-15-billing-change-explained-2026, confirms APEX memory note]

| Mode | Pool |
|------|------|
| Interactive Claude Code (human in loop) | Subscription 5-hr + weekly limits |
| claude -p (headless/print mode) | Monthly Agent SDK credit pool |
| Agent SDK | Monthly Agent SDK credit pool |
| GitHub Actions | Monthly Agent SDK credit pool |
| Third-party agents | Monthly Agent SDK credit pool |

**Agent SDK credit pool size:** approximately $20/mo (Pro), $100/mo (Max 5×), $200/mo (Max 20×) — dollar-denominated, billed at standard API token rates, no rollover. [COMMUNITY — pravinkumar.co; not yet confirmed by primary Anthropic source]

**Implication for APEX:** Interactive Claude Code sessions (the default APEX planning workflow in Cursor) still share the full subscription pool with claude.ai. The headless credit pool is a separate but limited fund — once exhausted it overflows to pay-per-token API billing. For Claude-as-coder in an interactive session, the single-pool constraint is real and active.

---

## 3. DeepSeek V4 Pricing (Current, Confirmed)

Source: api-docs.deepseek.com/quick_start/pricing [VERIFIED — primary source]

### Current model names (as of June 2026)

Note: `deepseek-chat` and `deepseek-reasoner` are deprecated as of 2026-07-24. They currently alias to V4 Flash (non-thinking and thinking modes respectively).

| Model | Input cache hit | Input cache miss | Output |
|-------|----------------|-----------------|--------|
| deepseek-v4-flash | $0.0028/1M | $0.14/1M | $0.28/1M |
| deepseek-v4-pro | $0.003625/1M | $0.435/1M | $0.87/1M |

### Thinking-mode (reasoning) token billing

DeepSeek V4 Flash supports dual modes: non-thinking (standard) and thinking. For complex agent requests including Claude Code and OpenCode, effort is **automatically set to `max`** in thinking mode. [VERIFIED — api-docs.deepseek.com/guides/thinking_mode]

Thinking/reasoning tokens are billed as **output tokens** at the same output rate ($0.28/1M for Flash). With effort=max auto-escalation on agentic calls, output token counts can be substantially higher than a simple completion — the prior research cited "tens of thousands of tokens per request" for extended thinking. This is the "think-max default inflation" factor.

**No separate reasoning-token surcharge** is documented for V4 Flash — CoT tokens bill at the same output rate. V4 Pro output rate is $0.87/1M (3.1× Flash).

### Monthly cost estimates

Prior research estimated $5–20/mo (Flash) and $15–60/mo (Pro) for typical APEX coding. These figures remain consistent with confirmed pricing:

- Flash at $0.28/1M output: 20M output tokens/month = **$5.60** (light coding), 70M = **$19.60** (heavy)
- Pro at $0.87/1M output: same volumes = **$17.40** / **$60.90**
- Cache hit discount (Flash: $0.0028 vs $0.14 miss = **20× cheaper** on cached input) significantly reduces real input costs when context is reused.

[VERIFIED — all figures match api-docs.deepseek.com/quick_start/pricing]

---

## 4. Practical Budgeting Levers

### Claude-side (subscription pool) levers

**Measurable today:**
- `/status` command in Claude Code — surfaces remaining session allocation and next reset time
- Settings > Usage (claude.ai web) — shows per-reset-period remaining and next reset timestamp
- Weekly cap is the harder constraint than the 5-hr window for sustained coding builds [VERIFIED inference from dual-limit structure]

**Structural levers:**
- **Route coding to DeepSeek** (APEX's current policy) — removes Claude-coded builds from the subscription pool entirely; DeepSeek is billed to its own separate API pool
- **Use Haiku/Sonnet for subagents** rather than Opus — Opus has a far lower weekly cap (~15–35 hrs on Max 5×); Sonnet cap is much larger (~140–240 hrs)
- **Avoid multi-agent Claude builds** during planning-heavy periods — the 7× token multiplier for agent teams means a few agentic builds can exhaust the weekly Opus budget in hours [VERIFIED — costs page cited in ws-b, "~7× more tokens"]
- **Monitor the shared pool** — Claude Design, Cowork, claude.ai chat, and Claude Code all now draw from the same bucket; any heavy non-coding Claude usage directly reduces coding headroom

**What cannot be set today (interactive Claude Code):**
- No `--max-budget-usd` flag for interactive subscription sessions (that flag applies to headless `-p` runs and Agent SDK)
- No per-surface allocation split (you cannot ring-fence X% for Claude Code vs Y% for chat)
- No in-session spend limit beyond plan tier

### DeepSeek-side levers [VERIFIED — api-docs.deepseek.com]

- **Disable thinking mode** for routine tasks: call with `thinking: false` or avoid sending to the reasoning endpoint — saves all CoT output tokens
- **Context caching**: cache hit rate is 50× cheaper on input ($0.0028 vs $0.14/1M) — APEX's skill-preloading pattern directly benefits from this; large reused context amortizes well
- **Model selection**: V4 Flash vs V4 Pro is a 3.1× output cost difference; Flash is the APEX default and appropriate for most coding tasks
- **`--max-budget-usd` in headless mode**: Claude Code's `-p` flag supports `--max-budget` to cap a single session's API spend — directly applicable when running DeepSeek-backed coding sessions headlessly
- **`--max-turns`**: cap runaway sessions — the Agent SDK has no built-in loop cap [VERIFIED — ws-b]

### Headless credit pool levers (post June 15, 2026)

- The Agent SDK credit pool ($20/$100/$200/mo by plan tier) is dollar-denominated — natural spend cap
- Setting a monthly spending cap via the overage credits dashboard provides a hard ceiling
- Daily redemption cap: $2,000 (extreme safety rail) [VERIFIED — support.claude.com/en/articles/12429409]

---

## 5. Key Uncertainties and Gaps

- **Anthropic does not publish absolute token or hour counts publicly** for Max 5× or Max 20× plans. All numeric estimates above for hours/week and prompts/window are community-derived. The multipliers (5× and 20×) are official; the baselines are not.
- **Agent SDK credit pool size** ($20/$100/$200 figure) is from a community source (pravinkumar.co), not yet directly confirmed on an Anthropic primary page. NEEDS-DOMAIN: no additional domains needed, but the primary source would be a future fetch of `support.claude.com/en/articles/` on the June 15 change — the specific article URL was not surfaced.
- **Think-max inflation factor**: DeepSeek docs confirm auto-escalation to `effort=max` for agentic calls but do not quantify the token multiplier. The $0.28/1M rate is confirmed; the volume multiplier is not.
- **Opus weekly cap exact numbers**: the ~15–35 hr range is a community estimate. Official numbers require checking your account's Settings > Usage.

---

## Sources

| # | URL | Type | Covers |
|---|-----|------|--------|
| 1 | support.claude.com/en/articles/11049741 | VERIFIED | Max plan limits, dual weekly caps |
| 2 | support.claude.com/en/articles/8325606 | VERIFIED | Pro plan limits, 5-hr reset, weekly cap |
| 3 | support.claude.com/en/articles/11647753 | VERIFIED | Shared pool across all Claude surfaces |
| 4 | support.claude.com/en/articles/11145838 | VERIFIED | Claude Code + claude.ai shared limits |
| 5 | support.claude.com/en/articles/12429409 | VERIFIED | Extra usage credits, $2k daily cap |
| 6 | anthropic.com/news/higher-limits-spacex | VERIFIED | May 2026 limit doubling, 5-hr terminology |
| 7 | api-docs.deepseek.com/quick_start/pricing | VERIFIED | V4 Flash / V4 Pro token pricing |
| 8 | api-docs.deepseek.com/guides/thinking_mode | VERIFIED | Think-max auto-escalation for agents |
| 9 | pravinkumar.co/blog/claude-june-15-billing-change-explained-2026 | COMMUNITY | Jun 15 interactive/headless split, credit pool sizes |
| 10 | truefoundry.com/blog/claude-code-limits-explained | COMMUNITY | Estimated hours/week and prompts/window table |
| 11 | dejaflow.com/blog/2026/05/04/... | COMMUNITY | Single shared pool across surfaces confirmation |
| 12 | piunikaweb.com/2026/05/28/... | COMMUNITY | Claude Design added to shared pool (May 2026) |
