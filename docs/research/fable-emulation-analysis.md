# Fable-emulation analysis — "make Opus run like Fable"

**One-shot absorption pass (session 63, 2026-07-08).** Sources: (1) the Claude Fable 5 system-prompt
leak (asgeirtj/system_prompts_leaks, `Anthropic/claude-fable-5.md`, 3,825 lines); (2) YouTube
"How I Make Opus Think Like Fable (5 easy steps)" (XTBWVVcF3Pk, full auto-transcript pulled).
Protocol: dedup-aware + token-cost-flagged report FIRST, no skill edits until approved
([[absorption-pass-protocol]], [[absorption-red-probe-before-content]]).

---

## 1. What the sources actually contain

### The leak is a consumer-chat prompt, not an intelligence recipe

The leaked prompt is the **claude.ai chat app** system prompt — not Claude Code's, not anything
agentic-build-shaped. By volume it is: product info, safety policy (child safety, wellbeing,
copyright hard limits), consumer-app plumbing (memory UX, user preferences, artifacts, MCP app
suggestions, visualizer routing, image search), tool schemas, and citation rules. **None of that
is "how Fable thinks."** The behavioral content that generalises to a build system is a thin
layer of micro-disciplines:

| Leak behavior | Where it lives in the prompt |
|---|---|
| "A prompt implying a file is present doesn't mean one is — check" | tone_and_formatting |
| "Address even an ambiguous query before asking; one question max" | tone_and_formatting |
| "Partial recognition from training ≠ current knowledge — verify per entity" | search_instructions |
| Scale tool calls to complexity: 1 / 3–5 / 5–10; ≥20 → hand to a deeper harness | search_instructions |
| Own mistakes without self-abasement; stay on the problem | responding_to_mistakes |
| Skills-read-first is unconditional before producing files | computer_use |
| Minimum formatting; prose over bullets | lists_and_bullets |
| Rate-of-change gating on when to search; original sources over aggregators | search_instructions |

Key read: **the intelligence is in the weights; the prompt is guardrails + product wiring.**
This directly confirms the video's own thesis and APEX's founding premise — you can't keep the
model, you keep the process.

### The video's five moves

1. **Treat the frontier model as a teacher/officer, not a workhorse** — have it package its
   method for the "junior cohort" of cheaper models.
2. **Extract a "Fable mode" skill**: five gates — scoping (incl. devil's-advocate on unknowns),
   evidence before reasoning, adversarial reasoning, verify before declaring done,
   calibrated reporting. Install it on Opus/Sonnet/GPT/open models.
3. **Effort routing per task** — Fable-low ≈ Opus-high on the release benchmark; max effort
   often *overthinks* and produces worse output than high.
4. **Model-routing table** in context: models × cost × intelligence × taste; orchestrator
   delegates down. His empirical result: Fable-orchestrator + Sonnet (or Haiku) workers ≈
   Fable + Fable workers at ~⅓ the cost.
5. **Deliverable post-mortem**: when an output was unexplainably great, ask the model "what did
   you think about to get here, how did you prove it worked" and distill the answer into a skill.

---

## 2. Dedup map — the "Fable method" vs what APEX already runs

This is the core finding: **APEX is already the Fable method, externalized as structure rather
than exhortation.** Every gate in the video's skill has a stronger, *enforced* APEX home:

| Video/leak mechanism | APEX home (already shipped) | Verdict |
|---|---|---|
| Scoping gate + devil's advocate on unknowns | apex-plan intent elicitation, readiness gate (complexity challenge, coverage audit, Sufficiency audit), risks resolved before spec ships | **dup** |
| Evidence before reasoning | verify-env-claims-live, source-grounding (apex-coding-principles), research/council widen-options gate, apex-research three-phase contract | **dup** |
| Adversarial reasoning | ADR-010 council (3 blind voices, anti-anchoring), dispatched apex-spec-reviewer, dual-pass wave review, RED probes | **dup** |
| Verify before done | Verification Recipe per stack (ADR-005/006), Karpathy pre-flight step d (done-criteria → verify), step→verify acceptance criteria format | **dup** |
| Calibrated reporting | handoff contract (apex-handoff), confirmation digest, 4-status worker return contract (ADR-015) | **dup** |
| Frontier-orchestrator + cheap workers | Config A: Opus-plan / Codex-build / Opus-verify (ADR-027, session 61); apex-research Opus-plan+synthesise / Sonnet-Haiku-retrieve (ADR-015) | **dup — and his A/B test is external validation of config A** |
| Effort routing per task | ADR-030 `coder_effort` dial (low/medium/high/xhigh), default medium, verify-fail bumps one notch before model fallback | **dup for the Codex side** |
| Model toolkit table (cost/intelligence/taste) | ADR-024 two-step router — built, then **deliberately collapsed** by ADR-027 to one frontier coder + effort dial; GPT-5.6 tier menu parked as draft S2 | **dup + consciously retired** |
| "Have Fable improve your skills while you have it" | Session 32 full Fable-5 `--stocktake` (30 skills updated); multi-model research banked for stronger-model revisit | **dup (done)** |
| Leak: file-implied-present → check | apex-code Karpathy pre-flight step a (verify every `## Assumptions` item against the codebase) | **dup** |
| Leak: answer ambiguous query first, ask one question max | apex-plan elicitation + [[user-autonomy-preference]] (decide autonomously, batch questions to end) | **dup** |
| Leak: partial recognition ≠ current knowledge | claude-api skill trigger ("never answer from memory" on LLM facts), apex-research currency checks, [[research-tier-by-difficulty]] | **dup** |
| Leak: scale tool calls 1 / 3–5 / 5–10 / ≥20→harness | [[research-tier-by-difficulty]] (lean → apex-research → deep-research harness) | **dup** |
| Leak: max effort overthinks | ADR-030 default `medium`, escalate-on-evidence; DeepSeek-paper session-40 finding ("over-thinking" cost corner) | **dup** |

Why structural beats prose here: the video's audience runs a bare chat/CLI and needs the method
*injected as prompt text*. APEX enforces the same method with hooks, gates, dispatch contracts,
and per-task verification — which survives model swaps and doesn't decay the way prohibition
prose does ([[removal-over-prohibition]]). A "Fable mode" skill would re-state, in weaker form,
what the pipeline already forces.

---

## 3. What I propose to change (small — and that's the finding)

**P1 — Deliverable post-mortem trigger (adopt).** The one genuinely new, cheap mechanism: when
the user flags an output they loved (or a build goes unusually well), run a "how did you get
here" extraction — what was reasoned about, what was checked, what proved it worked — and fold
the answer into the existing ADR-011 learning rail (feedback memory now, `--stocktake` promotion
if it recurs). Home: one convention line in apex-plan's handoff-drain + a `feedback` memory.
Token cost: ~2 lines in one SKILL.md — negligible. Iron-Law tier: lightweight (convention edit,
[[iron-law-application-depth]]). Confidence: medium — it sharpens ADR-011's trigger from
"recurrence across handoffs" to also catch one-shot wins while they're still in context.

**P2 — Opus-fallback effort mapping (defer, watch-item).** ADR-030 wired the effort dial for
Codex only. When Opus codes inline (quota-out fallback), spec `coder_effort` currently means
nothing to it. A one-line mapping (`high`/`xhigh` → think-hard guidance per task) is possible but
predicted model-redundant — Opus self-scales reasoning, and the harness owns thinking budgets.
Do nothing until a real fallback build shows over- or under-thinking; then it's a one-line
apex-code edit. Cost if adopted: ~1 line.

**P3 — Log the external validation (adopt, zero skill cost).** The video's Fable+Sonnet ≈
Fable+Fable A/B result and his Opus-orchestrator/Haiku-scouts test corroborate config A's pool
economics (heavy execution on the cheap pool, scarce frontier pool for plan+verify). Record here
+ status.md line; no skill edit. It also corroborates ADR-027's collapse decision: he ends up
recommending exactly one strong model + effort dial + cheap delegation — the shape APEX landed on.

Nothing else survives dedup. Total proposed skill-edit cost across all adoptions: **~3 lines.**

---

## 4. What I would NOT add, and why

**A monolithic "Fable mode" skill.** Every one of its five gates is a dup of an enforced APEX
mechanism (§2). Beyond redundancy: (a) per [[absorption-red-probe-before-content]], think-better
prose is exactly the class that RED probes keep showing is model-native to Opus-tier models —
prior passes (headroom/ponytail, Impeccable prose-four, agent-skills elicitation) all cut this
class; (b) a second "how to work" prompt layer alongside apex-plan/apex-code is a rival-workflow
seed — the exact confusion [[apex-sole-coding-workflow]] exists to prevent; (c) it's an always-on
context tax on every session for content the pipeline already enforces situationally.

**The leak's consumer plumbing (the other ~90%).** Safety policy, wellbeing, child-safety,
copyright hard limits, memory-UX phrasing bans, artifact/visualizer routing, MCP-app suggestion
etiquette, citation formats: the Claude Code harness ships its own current versions of everything
here that applies, and the rest targets a chat product APEX isn't. Copying any of it in is pure
token cost plus a maintenance liability (Anthropic revs these every release — we'd be pinning a
stale copy of someone else's guardrails).

**The leak's micro-behaviors as skill lines.** All four candidates (file-existence check,
answer-then-ask, partial-recognition≠knowledge, tool-call scaling) dedup to existing homes (§2
table). Absorbing them anyway would fail the Iron Law's baseline test — the bare model + existing
skills already produce the behavior. No RED probes needed; the dedup citations are sufficient
under the lightweight tier.

**A model-routing table with cost/intelligence/taste scores.** APEX built the researched version
(ADR-024: eligibility filter → cheapest-eligible-over-the-bar, real benchmarks) and then ADR-027
deliberately collapsed it because one frontier coder + an effort dial beat a routing tree on
simplicity and pool economics. Re-adding a taste-scored menu revives the complexity ADR-027
killed, on weaker evidence (vibes-scored axes vs ADR-024's benchmark grounding). The tier menu
already has its comeback path if warranted: the parked GPT-5.6 draft (S2).

**Effort-dial expansion beyond ADR-030's shape.** The video's "play with effort levels" is
directionally right and already implemented where APEX controls effort (Codex `-c
model_reasoning_effort`). His own caveat — max overthinks — is why ADR-030 defaults `medium` and
escalates on a real verify-fail rather than pre-emptively. No change.

**"Have the frontier model rewrite your setup while you have it."** Already done (session 32
Fable stocktake, 30 skills) and standing (this session runs on Fable; [[apex-ongoing-not-artemis-gated]]).
The banked multi-model capture doc already earmarks the stronger-model revisit. No new mechanism.

---

## 5. Bottom line

The honest answer to "what do we change to make Opus run like Fable" is: **almost nothing,
because APEX was built as exactly that translation layer, and both sources independently validate
its current shape** (one frontier coder + effort dial + cheap delegation + structural gates).
The leak proves the magic isn't in the prompt; the video's experiments reproduce APEX's config-A
economics. Adopt the deliverable post-mortem trigger (~2 lines), log the validation, park the
Opus-fallback effort mapping as a watch-item, and decline the rest as dups or retired complexity.
