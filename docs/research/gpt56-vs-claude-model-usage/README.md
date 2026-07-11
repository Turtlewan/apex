# GPT-5.6 (Sol/Terra/Luna) vs Claude — model-usage review + swarm design

_Session 66, 2026-07-11. Opus×Sol Tier-1 deliberation (ADR-032), user-triggered. Inputs: 3 web-retrieval
agents (Sonnet, evidence-*.md in this dir), live Fable verification, live Sol cold read (`gpt-5.6-sol`,
effort max). Opus voice in `opus-position.md`; Sol got the evidence only (cold read preserved)._
_Confidence overall: MEDIUM — standardized indices used where possible, but benchmarks are young and the
architecture/planning axis has no dedicated eval._

## Bottom line
APEX's current model assignment is **broadly well-calibrated** to the evidence — both models independently
confirmed the biggest choices (Opus plans, Sonnet hosts, Terra codes, cross-family review, worktree
isolation, avoid Fable, reject Ultra-as-swarm). **Sol agreed against its own family's interest twice**
(planning stays Opus; Ultra rejected), which strengthens those confirmations. Four **targeted amendments**
have evidence behind them; none is a rip-up.

## The consensus — what stays vs what changes

### Stays (evidence-confirmed by both voices)
- **Planning + architecture → Opus 4.8.** Planning/ADR work is open-ended multi-path judgment — exactly
  where the one architecture-specific signal says Sol is *weakest* and Claude is strongest. The aggregate
  Intelligence-Index gap (Opus 56 < Sol 59 < Fable 60) is not judgment-axis evidence. Fable — the only model
  that clearly out-planned Opus — **leaves subscriptions 2026-07-12**, so the question is moot in practice.
- **Research → Sonnet/Haiku retrieval + Opus synthesis.** Haiku 4.5 beats Luna on coding-retrieval at
  equal/lower price, so no GPT model earns a place in the retrieval tier. Synthesis stays Claude judgment.
- **Sol Ultra is NOT the swarm mechanism.** Record-high METR gaming flag on its headline number, opaque (no
  subagent transcript — fights APEX's visibility discipline), 2–3× tokens, Sol-only. Keep it a rare,
  manually-approved, sequential/foreground rung — never the parallelism layer.
- **Structural invariants confirmed:** Sol plan-check gate, cross-family review, worktree isolation,
  file-disjointness, ADR-027 "one coder + effort dial."

### Change (4 amendments, evidence-backed)

**A1 — Coding *fallback*: Opus 4.8 → Sonnet 5 (split the rung).** _[Sol's Q5 catch; Opus agrees]_
Opus 4.8 is a weak coder (Coding Agent Index 56) and Sonnet 5 both beats it on Terminal-Bench *and* is
cheaper *and* draws a separate weekly pool. When the Codex quota is out and we just need working code, the
Claude fallback should be **Sonnet 5**. Reserve **Opus** only for the *other* reason the rung exists —
GRAY-fork / high-risk tasks where Claude *judgment* is specifically wanted. Gate: one native-harness
confirmation build before baking. **Confidence: MEDIUM-HIGH.**

**A2 — Wave concurrency: default 2 (hard-max 3) + explicit budget guardrails.** _[both agree; Sol's precise form]_
Practitioner guidance is "start at 2–3, not the tool max." Lower the auto-sized default from 3 to **2**,
keep **3** as the hard ceiling. Add: per-worker + aggregate token/$ caps, **warn at 70% / stop at 100%**,
prohibit nested worker spawning, allow one worker retry, require explicit approval above ~3× estimated
serial tokens (or ~2× serial cost). Directly answers the $8–47k unattended-swarm horror stories.
**Confidence: HIGH.**

**A3 — Coder-default bakeoff (measurement, not a decision yet).** _[both agree]_
Terra is flagged "Pareto-dominated by Luna/Sol at matched effort," but matched-effort ≠ matched-cost and
Terra is proven live. Before trusting the default further, run an APEX-native bakeoff — **Terra vs Luna vs
Sol(low/medium)** on one real spec, scored on **verified completions per dollar + wall-clock** — then retain
one default (preserving ADR-027). Until then, **Terra stays.** **Confidence: LOW — needs the eval.**

**A4 — Cheap-worker tier (design candidate; needs its own ADR + eval before baking).** _[both lean yes, bounded]_
The dominant swarm cost lever is "push 80–90% of token volume to a cheap tier." Candidate: a **Luna/Haiku
worker tier** under the Sonnet orchestrator, *strictly bounded* to **test-rich + file-disjoint +
fixed-interface mechanical tasks** — framed as **role tiering, not a per-task routing tree** (ADR-027 stays
intact). This is the one change that reopens a settled discipline, so it does not ship on this review — it
needs an ADR + a proving eval that it actually wins on cost-adjusted quality (no source found shows routine
swarms beating a single strong agent). **Confidence: LOW — promising, unproven.**

## The swarm answer, directly
"A swarm of GPT sub-agents to move fast" is **already what APEX runs** — ADR-028/029 wave dispatch is
exactly the shape every 2026 fleet tool converged on (worktree isolation + role separation + tiering +
start-small). The evidence *validates* it rather than calling for something new. Acceleration comes from
three moves on the existing swarm, not a bigger one:
1. **Tier the workers cheaper** (A4) — more disjoint work per dollar.
2. **Cap width + budget** (A2) — combinatorial merge-conflict growth and cost blowup are the real limits.
3. **Keep Ultra out** — opaque decomposition is a governance regression vs APEX's explicit waves.
Speed = more *file-disjoint* work running *cheaply* in parallel under a *hard budget* — not opaque in-model
subagents and not a wider fleet.

## Honest limits
- The planning/architecture axis has **no dedicated benchmark** — the "Sol weaker at open-ended judgment"
  signal is a single secondary source. Directional only.
- Coding-index numbers are harness-native and young; SWE-bench Pro is discarded as broken.
- A3 and A4 are explicitly **measurement/design candidates**, not shipped decisions.

## Next steps (proposed — not yet executed; this is planning-mode analysis)
1. Spec **A1 + A2** together (small, high-confidence, touch apex-code/apex-governance model-routing +
   guardrails). Proving run = one Sonnet-fallback build.
2. Author an **ADR for A4** (cheap-worker tier) + a bakeoff eval that covers **A3** in the same run.
3. Fold results into the existing GPT-5.6×APEX In-Flight (Phase D watch-items already list "ultra-vs-max
   eval" and a Sonnet-host proving run — A1/A3 attach cleanly there).
