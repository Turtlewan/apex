# Research: Subagent-dispatch improvements (first-party orchestration guidance)

**Date:** 2026-06-08
**Confidence:** HIGH (Anthropic first-party engineering sources) + MEDIUM (2025/2026 ensemble research)
**Re-research after:** 2026-06-22 (AI/LLM tooling — 14-day clock)
**Scope:** Scoped slice — first-party Anthropic multi-agent orchestration guidance + named patterns, measured against APEX's existing dispatch mechanics. Findings only; no skill edits in this pass.
**Per-agent raw findings:** `docs/research/dispatch-study/agent{1,2,3}-*.md`

## Summary

APEX's dispatch design is **largely validated** by first-party guidance — the fan-out trigger, the
hard fork boundary, plan-to-memory checkpointing, the rule-based verifier, and worst-of-N on
security all match what Anthropic and the 2025/2026 ensemble literature recommend. The research
surfaced **one clean gap worth promoting (a universal output-compression contract)**, **one
judgment-grade candidate (an explicit evaluator-optimizer loop)**, and **one honest tension to
record (multi-agent is a weak fit for coding fan-out — invest in it for throughput, not answer
quality)**. Net: the core is sound; there are two small, well-supported upgrades, not a redesign.

## Key findings

### Token economics & when to fan out (agent 1)
- Multi-agent systems use **~15× the tokens of chat**; single-agent ~4×. The only published
  multiplier. [VERIFIED — anthropic.com/engineering/built-multi-agent-research-system]
- Anthropic's internal research eval showed **+90.2%** over single-agent — **but** an April 2026
  arxiv equal-budget study found single-agent *matches or beats* multi-agent at the **same token
  budget**, i.e. much of the gain is "spent more tokens," not "better architecture."
  [COMMUNITY — arxiv, equal-budget comparison]
- **When parallel pays:** tasks that decompose into independent threads, no shared context, exceed
  one context window, and are valuable enough to absorb 15×. **Explicitly poorly suited:**
  coding/debugging (few truly parallel subtasks, shared context, inter-task dependencies).
  [VERIFIED — same source]
- No published numeric task-count threshold; **independence is the only stated criterion.** [VERIFIED]
- "Start with simple prompts… add multi-step agentic systems only when simpler solutions fall
  short." [VERIFIED — anthropic.com/engineering/building-effective-agents]

### Context passing & long-run state (agent 2)
- **Four-part subagent task contract:** every delegation specifies *objective, output format,
  tool/source guidance, explicit out-of-scope boundaries*; vague directives cause duplication and
  gaps. [VERIFIED — built-multi-agent-research-system]
- **Artifact/pointer output:** subagents explore widely but return **1,000–2,000-token condensed
  summaries** (or write to a file and return a pointer); the orchestrator never absorbs raw
  exploration transcripts. [VERIFIED — effective-context-engineering-for-ai-agents]
- **Plan-to-memory checkpoint:** the lead agent persists its plan before context truncation so a
  long run resumes from position rather than restarting. [VERIFIED — built-multi-agent…]

### Replication & evaluator patterns (agent 3)
- **Evaluator-optimizer loop:** generator → separate evaluator returns structured critique →
  generator revises → repeat to PASS or a round cap (~3). [VERIFIED — building-effective-agents]
- **N-vs-accuracy knee:** no universal N. Hard tasks plateau ~N=5–10, can *reverse* past ~15; easy
  tasks are flat from N≈3. N=2 sits below the hard-task knee, and **N=3's marginal gain needs
  *diverse* (different model family) reviewers**, not another same-model pass. [COMMUNITY — 2025/26]
- **Worst-of-N vs majority:** majority dominates general review; **unanimity/worst-of-N is the right
  rule for unanswerable/blocked-detection** (raises over-block rate — correct for security).
  [COMMUNITY — ACL 2025]
- **Caution:** a self-critique loop on **98%-accurate** tasks dropped performance to **57%** — never
  loop a high-baseline trivial task; same-model evaluator shares blindspots (use a different family
  or a rule-based verifier: compiler/linter/tests). [COMMUNITY]

## Cross-check: confirmations vs genuine candidates

The agents had only partial APEX context. Re-checked against what APEX actually does:

### ✅ Confirmed already-correct (no action)
| External finding | What APEX already does |
|---|---|
| Independence is the real fan-out criterion | apex-code **Wave Analysis** groups tasks by explicit dependency check (file-conflict / output-dep / shared-state) *before* applying the 2+ trigger — independence **is** already the gate, count is secondary. |
| Plan-to-memory checkpoint for long runs | `status.md` **In-Flight table** + pause workflow + handoff docs persist position across truncation/session boundaries — this pattern is core APEX. |
| Use a rule-based evaluator, not same-model | The **Verification Recipe** (typecheck/lint/test/build) is exactly the recommended rule-based verifier; the LLM judge (wave review) sits on top of it. |
| Worst-of-N for blocked-detection | Dual-pass review unions **worst-of-two** on the critical subset (auth/security/data) — matches the ACL-2025 unanimity-for-block result. |
| Four-part task contract | Wave reviewers already get a structured triple (changed_files / impl_path / acceptance_criteria); workers get objective + spec path. Close to the four-part contract. |

### 🟡 Genuine candidates (earn a decision)

**1. Universal output-compression contract — STRONGEST, low cost.**
APEX rigorously specifies what goes **into** a child (by value) but has **no system-wide rule for
what comes back**. It's present *piecemeal* — `code-worker` returns one status enum; apex-research
agents write-to-disk + return ≤200-word summaries (used in this very pass); wave reviewers return a
verdict — but it is **not a named invariant**, so unbounded returners exist (council voices,
spec-reviewer, future dispatchers can flood the orchestrator). **Candidate:** promote
"**explore freely, write full output to disk, return a ≤1–2k-token summary or a pointer**" to a
named dispatch invariant (orchestrate/skill-author contract). Cheap, purely additive, directly
protects the 30–40% main-window target against context rot.

**2. Explicit evaluator-optimizer loop — judgment-grade.**
APEX's BLOCK path already prepends the finding to the re-run task — a **1-round, implicit**
evaluator-optimizer. The literature uses up to ~3 rounds. **But** two cautions bound this hard:
(a) the 98%→57% trivial-task degradation means **never** loop low-risk/high-baseline work, and
(b) same-model critique shares blindspots. APEX's current design already respects both — the
verifier is rule-based (recipe) and the one-retry cap avoids over-looping. **Candidate is narrow:**
consider naming the BLOCK-retry as an evaluator-optimizer and *whether* a second structured-critique
round (still rule-or-cross-model evaluated, still capped) earns its keep on **non-trivial** blocks
only. Likely a small refinement of the existing fork, not a new mechanism. Needs a judgment call.

**3. Model-family diversity for replication — note for Artemis.**
N=3 same-model passes are low-yield; real signal past N=2 needs a **different model family**. APEX's
two wave-review passes are same-model. Today this is moot (one backend per session), but once the
Mac host runs both Claude and DeepSeek, the higher-leverage move for critical review is a
**cross-family** second pass, not a same-family third. Park for the Artemis build.

### ⚠️ Tension to record (not a fix)
Anthropic explicitly rates multi-agent a **weak fit for coding/debugging**, and the equal-budget
study says single-agent matches multi-agent at equal spend. APEX's coding fan-out is **task-level
with real dependency analysis** (not blind decomposition), so it's defensible — but be honest that
its payoff is **throughput + context isolation, not better answers**. Don't over-invest in
coding-side parallelism expecting a quality lift; the quality lift lives in the **verifier + review**
layer, which is where APEX already puts it.

## Recommended approach

1. **Promote the output-compression contract** (candidate 1) — the one clear, cheap win. Smallest
   surface: a named invariant in `apex-orchestrate` (dispatch principles) + a line in
   `apex-skill-author`'s dispatch guidance. Likely additive, possibly an ADR for the invariant.
2. **Hold candidate 2 (evaluator-optimizer) for a judgment call** — decide whether a capped,
   non-trivial-only second critique round beats the current 1-retry. Could fold into apex-code's
   fork section; not obviously worth it given the degradation caution.
3. **Park candidate 3 (cross-family review)** under the Artemis/Mac open items — no-op until two
   model families are co-resident.
4. **Record the coding-fan-out tension** so future work doesn't chase a quality lift that isn't there.

## Assumptions / gaps
- The 15× multiplier and four-part contract are Anthropic-internal to *their* research product; the
  ratio will differ for APEX's task-level coding fan-out (smaller children, tighter scope).
- N-vs-accuracy knees are from general ensemble/self-consistency research, not dispatch-specific;
  treat the numbers as directional, not exact thresholds for review-pass counts.
- No hands-on measurement of APEX's own per-dispatch token cost was done — that needs the live Mac
  coding env (ties to the parked context-budget instrumentation).

## Sources
- Anthropic — "How we built our multi-agent research system" — anthropic.com/engineering/built-multi-agent-research-system
- Anthropic — "Building effective agents" — anthropic.com/engineering/building-effective-agents
- Anthropic — "Effective context engineering for AI agents" — anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Equal-budget single-vs-multi-agent comparison (arxiv, April 2026) — [COMMUNITY]
- Self-consistency / panel-of-judges ensemble research, incl. ACL 2025 unanimity-for-block — [COMMUNITY]
- Full per-agent extraction: `docs/research/dispatch-study/agent{1,2,3}-*.md`
