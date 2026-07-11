# Opus position — GPT-5.6 (Sol/Terra/Luna) vs Claude for APEX model usage + swarm design

_Session 66, 2026-07-11. Author: Opus 4.8 (planning host). Grounded in the 3 evidence files in this dir
+ live Fable verification. This is the Opus voice for the ADR-032 Tier-1 Opus×Sol deliberation the user
triggered. Sol gets the evidence, NOT this file (cold read)._

## Evidence in one paragraph
Sol tops the standardized **Coding Agent Index (80)**, ahead of Fable, Terra, Luna and well ahead of
Opus 4.8 (56), at ~10% less per task than Opus. On the **Intelligence Index** Sol (59) ≈ Fable (60) >
Opus (56). SWE-bench Pro is now credibly broken (OpenAI retracted its endorsement). Sonnet 5 beats Opus
4.8 on Terminal-Bench. Terra is reportedly **Pareto-dominated by Luna/Sol at matched effort**. Haiku 4.5
beats Luna on coding-retrieval at equal/lower price. The one architecture-specific signal: **Sol weaker
at open-ended, multiple-defensible-path judgment; stronger once work is shaped.** Swarms cost ~7× tokens,
merge conflicts grow **combinatorially**, and **no source found claims a swarm beats a single strong agent
on cost-adjusted quality for routine work**. Sol Ultra: 2–3× tokens, opaque, METR record-high gaming flag,
Sol-only. Fable leaves subscriptions 2026-07-12.

## Position per activity

**Planning — KEEP Opus 4.8. No change.** Planning is ambiguity-heavy (multiple defensible paths), which
is exactly where the evidence says Sol is *weakest* and Claude's calibrated-uncertainty positioning is
strongest. The Index gap (Opus 56 < Sol 59) is on aggregate intelligence, not on the open-ended-judgment
axis that planning actually taxes. Fable (the only model that clearly out-planned Opus) exits tomorrow.
Sol already sits on the *other side* of planning as the independent plan-check — moving planning itself to
Sol would collapse evaluator-independence. **Confidence: HIGH the direction is right; MEDIUM on magnitude.**

**Architecting — KEEP Opus 4.8. No change.** Same reasoning as planning, more so — ADR-grade tradeoff
reasoning is the definition of open-ended multi-path judgment. Sol stays the skeptic (plan-check), not the
author.

**Coding (default coder) — CHANGE the framing, probably KEEP Terra as default but tighten the rule.**
This is the one genuinely live call. Two readings:
- *Keep Terra:* it's $2.50/$15 (½ of Sol), Index 77 vs Sol 80 — 3 points behind at half price is defensible
  as the cost-efficient default, with Sol as the escalation rung (current config). ADR-027 "one coder +
  effort dial, no routing tree" stays intact.
- *The challenge:* "Terra Pareto-dominated by Luna/Sol at matched effort" (Vellum) says Terra may be the
  *worst* quality-per-dollar point — Luna is cheaper (Index 75, $1/$6) and Sol is better ($5/$30, Index 80).
  If true, the efficient frontier is **Luna for cheap/mechanical, Sol for hard** — and Terra is a dominated
  middle. That's a real threat to the current default.
- *My call:* keep Terra as the **untagged default** for now (it is proven live in real APEX builds; the
  "Pareto-dominated" claim is a single secondary source at "matched effort," and matched-effort ≠
  matched-cost), but **run a Terra-vs-Sol(low)-vs-Luna effort-and-cost-matched eval on a real spec** before
  trusting it further. This is a measurement gap, not a decision. **Confidence: LOW — needs an eval.**

**Research — KEEP Sonnet/Haiku retrieval + Opus synthesis. No change; drop any Luna-retrieval idea.**
Haiku 4.5 beats Luna on coding-retrieval at equal/lower price, so Luna earns no place in the retrieval
tier. Synthesis stays on Opus (Claude judgment strength + apex-research's in-context-synthesis contract);
Fable would've been marginally better but is leaving. No GPT model improves this pipeline. **Confidence: HIGH.**

## Swarm design — "a swarm of GPT sub-agents to move fast"

**The key finding: APEX's existing ADR-028/029 wave dispatch already IS the recommended swarm architecture.**
Every 2026 fleet tool converges on exactly APEX's shape — worktree isolation, role separation
(Planner/Host/Worker/Reviewer, workers never coordinate), model-tiering, and "start at 2–3 parallel, not
the max." The research *validates* the current design rather than calling for a new one. So the answer is
not "build a swarm" — it's **three targeted upgrades to the swarm we already run:**

1. **Add a cheap-worker tier (Luna or Haiku) under the Sonnet orchestrator — the single biggest speed/cost
   lever.** The dominant swarm cost pattern is "push 80–90% of token volume to a cheap tier." APEX currently
   runs *all* wave workers on Terra. Routing mechanical/boilerplate/independent tasks to Luna ($1/$6) or
   Haiku while reserving Terra/Sol for the hard ones is the evidence-backed acceleration. **Caveat:** this
   reopens the ADR-027 "no routing tree" discipline — but a *two-tier* cheap/hard split (not a per-task model
   tree) is the minimal form, and the swarm-economics evidence is strong enough to reconsider. This is the
   main thing I want Sol to pressure-test.

2. **Reject Ultra-as-swarm; keep it a rare, sequential, foreground rung.** Ultra's 91.9% is under a
   record-high METR gaming flag, it's opaque (no subagent transcript — fights APEX's visibility discipline),
   2–3× tokens, and Sol-only (Terra can't use it). APEX's *explicit, observable, file-disjoint* waves are
   strictly better-governed than Ultra's *opaque in-model* subagents. Ultra stays where the draft already
   put it: a rare per-task escalation counted heavy against the concurrency cap, never the parallelism layer.

3. **Add a hard token/cost guardrail + keep max_parallel_codex=3.** The swarm horror stories ($8–47k
   unattended runs) and combinatorial merge-conflict growth mean width must stay disciplined: the current
   cap of 3 matches the "start at 2–3" guidance exactly, and APEX's file-disjointness invariant (ADR-029)
   is precisely the merge-conflict mitigation the arXiv AgenticFlict dataset warns about. Add a per-session
   token budget ceiling with a visible warn/stop so a runaway wave can't silently burn the pool.

**Net swarm verdict:** don't chase a bigger/faster swarm; make the existing one *cheaper per unit* (tier
the workers) and *safer at width* (budget cap + strict disjointness). Speed comes from more disjoint work
running cheaply in parallel, not from Ultra's opaque decomposition.

## Candidate DISPUTED items to put to Sol (where I expect disagreement)
- Q-coding-default: I keep Terra pending an eval; Sol may push for Sol-default (self-interested) or
  Luna-default. Watch the conflict.
- Q-cheap-worker-tier: I lean yes (two-tier); this reopens ADR-027 — Sol's view matters but is self-interested
  toward more GPT usage.
- Q-planning-on-Opus: I keep Opus; Sol may argue the Index gap favors a GPT planner. This is the sharpest
  test of Sol's self-eval bias — its own cutoff is June 2024 so it cannot even recall these benchmarks.
