# Multi-model architecture — design capture (PARKED for stronger-model review)

**Date:** 2026-06-28
**Status:** 🟡 **Researched + reasoned, NOT yet built.** Provisional decisions below are a *prior*, not committed.
**Revisit trigger:** re-run this analysis with a stronger model when **(a)** GPT‑5.6 (Sol/Terra/Luna) reaches
our Codex auth, AND **(b)** the ADR‑016 eval harness can score candidates on our real specs. Until then, do
not bake these into skills beyond what's already shipped (ADR‑030).
**Confidence:** MEDIUM — the *economics* are robust (subscription structure, not benchmarks); the
*model-capability* claims rest on vendor/pre-GA numbers and are explicitly eval-gated.

## Why parked
GPT‑5.6 is limited-preview (no model IDs, no documented `max`/`ultra` invocation); benchmarks are
vendor-reported pre-GA; and the "which model is actually best for our specs" question is unanswerable
without the eval harness. So we captured the *design + the reasoning that survived stress-testing*, to
re-open with better models + real numbers rather than re-derive from scratch.

## The economic spine (the one durable input)
**Both providers are on subscription**, so the system is a **two-quota load-balancing** problem, not a
cash-minimization one:
- **Claude plan** — one genuinely *scarce* sub-limit: the **Opus weekly cap** (shared with planning).
  Sonnet/Haiku draw a much **looser** pool.
- **OpenAI/Codex plan** — an **independent** quota (mini → 5.4 → 5.5 → Sol/Terra/Luna), free-at-margin.

> **Governing rule:** spend the abundant independent quotas (whole OpenAI plan + Claude's loose
> Sonnet/Haiku pool) on high-volume work; **ration only the Opus cap.** "Cheapest correct" = *least
> scarce-quota consumed*. (Confirm assumption: that the Opus cap is genuinely the tightest of the three.)

## Decisions reached (provisional)
| # | Decision | Rationale | Gate to firm up |
|---|----------|-----------|-----------------|
| 1 | **gpt‑5.5 = default high-end coder; Opus NOT a coding tier** | gpt‑5.5 leads agentic-terminal work *and* runs on the independent quota; Opus competes with planning for the scarce cap | eval harness on our specs |
| 2 | **Coder escalation = split ceiling** | ration Opus: `effort bump → OpenAI model-up → OpenAI ceiling (Sol/max/ultra) → Opus (last)` | GPT‑5.6 GA + eval |
| 3 | **Opus = judgment & gate layer, not builder** | see reasoning chain below — both "build on Opus" reasons collapse | — (reasoning, not data) |
| 4 | **Planning OpenAI toggle**: Claude stays skill-host/orchestrator/**gate**; OpenAI does (more of) the heavy *reasoning*; skills gate every plan regardless of who reasons | preserves the skill investment AND spends the independent quota; "takeover" = OpenAI reasons more, never a host swap | GPT‑5.6 GA + eval |
| 5 | **Complexity ranking = planning-assigned (Opus)** | model-native judgment; no classifier to build | — |
| 6 | **Retrieval stays Claude (Sonnet/Haiku)** | RESOLVED, see below — not a placeholder | **closed** |

## The reasoning chain that survived stress-testing (the real value)
Two sharp objections collapsed the initial design into a cleaner one:

1. **"Skills are model-agnostic."** Correct. Skill *content* (markdown judgment/gotchas) forwards to any
   capable model; only the *loading mechanism* is Claude-native (and content is forwardable). So **skill
   content is NOT a reason to build on Opus.** A security-critical task can be **built by OpenAI (skills
   forwarded) and reviewed by an independent Claude-side gate** — which is *more* rigorous than self-review
   (family independence, ADR‑015). → "needs-claude-side" is a **review-routing** signal, not a build one.
2. **"Wouldn't all context be Claude-resident?"** In the conversation, yes — but APEX builds don't run on
   the conversation. The **spec is the build's context** by design (self-contained execution script;
   fresh-context workers; state flows through spec + git, *not* chat). So build context is **spec-resident
   → portable to any worker.** If a task "needs the conversation," that's a **spec defect** (fix via the
   readiness gate), not a reason for Opus. The only genuinely Claude-resident-build regime is **interactive
   edit-mode**, which the router doesn't govern.

**Conclusion:** within the router (spec-driven dispatch), there is **no capability/context reason to build
on Opus.** Opus-as-builder survives only as the **quota-exhaustion fallback** (OpenAI plan empty → Opus
inline, ADR‑027) and **interactive edit-mode**. Opus's real jobs: **planning reasoning + the independent gate.**

## Coding router (target design)
- **Two routing signals:** `complexity:` (planning-assigned → sets the build rung) + `needs-independent-gate`
  (→ routes the **reviewer** to the opposite family; APEX's existing family-aware review already does this).
- **Build ladder (all abundant quota):** Claude cheap (Haiku/Sonnet) or OpenAI cheap (mini) → gpt‑5.5 →
  OpenAI ceiling (Sol / `max` / `ultra` at GA).
- **Escalation order (cheapest first):** effort bump (same model/quota) → model-up within OpenAI → OpenAI
  ceiling → **Opus only as quota-fallback / human-gated**, never as a capability tier.
- **"Correctly" = passes the Verification Recipe** (+ wave/domain review on high-risk). Route-first beats
  pure cheap-first cascade (ADR‑024).

## Planning toggle (target design)
- Flag (e.g. `APEX_PLAN_ASSIST`): off → Opus plans as today; on → at key artifacts (draft spec, design
  fork, ADR call) Claude dispatches an OpenAI model for **cross-check/second opinion**, folds it in, and
  the **skills still gate**. Dial-up path → OpenAI generates candidate plans, Claude skills review/shape.
- Placeholder slots GPT‑5.6 in when it lands; "takeover" = OpenAI reasons more, Claude stays gate/host.

## Retrieval — PROVISIONAL (re-verifying the subscription path, 2026-06-28)
Provisional lean: keep apex-research Phase‑2 on **Sonnet/Haiku** (Haiku default, Sonnet for harder
extraction). The rejection of cheap OpenAI retrieval rests on a **billing-path claim under re-verification**:
the **subscription path (`codex exec --search`) appears snippets-only** (can't fetch page bodies), and the
**capable path (Responses API `web_search`) appears to be metered API ($0.01/call + 8k-token block), NOT the
ChatGPT/Codex subscription**. If a *subscription-billed* capable full-page path exists, the load-balancing
case re-opens. First comparison: `docs/research/retrieval-tier-comparison.md`; subscription-vs-API
re-verification: `docs/research/openai-subscription-retrieval-path.md` (in progress). Quality on mechanical
retrieval is a wash-to-Haiku-favored either way.

## Open questions for the stronger-model revisit
1. Is the Opus cap actually the tightest of the three quotas? (calibrate against real plan tiers)
2. Does OpenAI's ceiling (Sol/`ultra`) genuinely clear our hard tasks? — if not, the ladder re-centers on
   Opus and the rationing collapses. **The empirical linchpin.** (eval harness)
3. Exact GPT‑5.6 model IDs + `max`/`ultra` CLI invocation (currently undocumented).
4. How is skill content best *forwarded* to a dispatched OpenAI planner/coder (the loading-mechanism gap)?
5. **BANKED (2026-06-28):** the per-spec `coder_model` control + model-visibility knob (the "more control"
   ask) is folded into this router — build it alongside the router when newer OpenAI models release, NOT now.

## Cross-references
- `docs/technical/adr/ADR-030-codex-reasoning-effort-dial.md` (shipped — the effort axis)
- `docs/drafts/gpt-5.6-family-adoption.md` (access-gated execution plan)
- `docs/research/gpt-5.6-execution/` (Sol/Terra/Luna + modes + observability)
- `docs/research/retrieval-tier-comparison.md` (retrieval decision)
- `docs/research/model-routing/` + ADR‑024 (the prior complexity-router research this revives) · ADR‑027 (what it re-opens)
