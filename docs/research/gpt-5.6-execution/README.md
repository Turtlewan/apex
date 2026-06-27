# Research: GPT-5.6 (Sol/Terra/Luna) execution model + APEX integration & visibility

**Date:** 2026-06-27
**Confidence:** MEDIUM — CLI/effort surface and pricing are Tier-1/consistent-press VERIFIED; the new
`max`/`ultra` *modes* and all GPT-5.6 model IDs are COMMUNITY/UNDOCUMENTED (limited preview, ~20 partners).
**Re-research after:** 2026-07-11 (AI/LLM tooling = 14d) — or sooner if GPT-5.6 reaches our Codex auth.
**Method:** apex-research three-phase, 4 parallel Sonnet retrieval agents (WS-A family · WS-B modes ·
WS-C CLI surface · WS-D observability) → `ws-a..d-*.md` in this folder → this synthesis.

## Summary
GPT-5.6 is a **family** — Sol (flagship), Terra (≈gpt-5.5 quality at ½ cost), Luna (cheap) — plus two
Sol-only modes: **`max`** (deeper single-chain reasoning, an extension of the effort dial) and **`ultra`**
(model-*internal*, autonomous, opaque **parallel subagents** within one task). It is **limited preview**;
no model-ID strings, no `max`/`ultra` invocation syntax, and no GA date are published. **Almost everything
that touches our `codex exec` build path is GA-gated and unverifiable today.** But the research surfaced
**three things we can act on NOW** (independent of GPT-5.6), and a sharpened GA-gated plan that resolves
the open forks: **Terra becomes the default coder; `ultra` is an accelerator, NOT a replacement for our
wave parallelism; our progress-pulse already covers standard/`max` and needs only a coarse upgrade for
`ultra`.**

## 1 · The model family (WS-A)
| Tier | For | Input / Output (per 1M) | TB-2.1 |
|------|-----|--------------------------|--------|
| **Sol** | long-horizon agents, hard coding, bio/cyber; carries `max`+`ultra` | $5 / $30 (= gpt-5.5) | 88.8 std / **91.9 ultra** |
| **Terra** | default production; ≈gpt-5.5 at ½ cost | $2.50 / $15 | 84.3 [COMMUNITY] |
| **Luna** | bulk/trivial (autocomplete, classify, extract) | $1 / $6 | 82.5 [COMMUNITY] |

- Naming: generation (`5.6`) + durable tier (Sol/Terra/Luna advance on their own cadence). [VERIFIED]
- **Selection is MANUAL** — standard `model` param / Codex `-m`; no auto-routing described. [VERIFIED]
- **Model-ID strings: NOT PUBLISHED** — do not hardcode `gpt-5.6-sol` etc. (assumed pattern only). [ASSUMED]
- gpt-5.4-mini ($0.75/$4.50) is still cheaper than Luna — Luna's edge is 5.6-gen quality, not price.

## 2 · The two new modes (WS-B)
- **`max`** — "most time to reason deeply", single chain, no subagents. Likely a new rung above `xhigh`
  on the effort dial OR a product label for Sol-at-xhigh — **parameter form UNDOCUMENTED**. ~88.8 TB-2.1
  (≈ standard). Trades latency/cost for accuracy. [T2-VERIFIED claim; mechanism UNKNOWN]
- **`ultra`** — model spawns **parallel subagents** that split one task; results consolidated; **the model
  decides decomposition autonomously and invisibly** — distinct from Codex's developer-driven subagents.
  91.9 TB-2.1 (vs gpt-5.5 83.4). **Token usage "skyrockets."** Invocation syntax, subagent count, subagent
  model, cost multiplier: **all UNDOCUMENTED.** Appears **Sol-exclusive.** [T2-VERIFIED claim; everything
  operational UNKNOWN]

## 3 · `codex exec` surface (WS-C) — what APEX actually drives
- **Model:** `-m <model>` / `-c model="…"` / config.toml / `--profile` all work in `exec`. `/model` is TUI-only. [VERIFIED]
- **Effort:** `-c model_reasoning_effort="…"`, enum **`minimal|low|medium|high|xhigh`** (`xhigh` added 2025-11-18). Maps to Responses `reasoning.effort`. [VERIFIED]
- **`max`/`ultra`:** **no documented CLI flag/config/API param.** Possibly app/interactive-only. [UNKNOWN]
- **Versions:** local **0.141.0**; latest **0.142.3**. v0.138 made "model-defined effort levels flow through
  in the order the model advertises" → new effort values may pass **without** a CLI upgrade. [COMMUNITY]
- ⚠️ **Bug #28113** (v0.139.0): `-c model_reasoning_effort` was **unreliable at `exec` startup**; fix
  status on 0.141.0 is **unconfirmed** — directly affects the ADR-030 flag we just shipped. [COMMUNITY]

## 4 · Observability (WS-D) — can we see these modes run?
`codex exec --json` (same protocol as app-server) emits structured events, available **today**:
- `thread/*`, `turn/started|completed` (full token breakdown: input/output/**reasoning**/cache), `turn/plan/updated`
- `item/reasoning/summaryTextDelta` (readable reasoning), `item/commandExecution/outputDelta`, `item/agentMessage/delta`
- **`collabToolCall`** — subagent-boundary events `{tool: spawn_agent|send_input|wait|close_agent, status, …}`
- New surfaces: **`SubagentStart`/`SubagentStop` hooks**, `/usage` views (v0.140), `~/.codex/usage.jsonl`, opt-in OTel.

**Verdict per mode:**
- **standard + `max`** → fully observable in the parent `--json` stream (reasoning summaries + commands + token usage all stream). Our pulse works as-is.
- **`ultra`** → parent stream shows **subagent boundaries (`collabToolCall`) + aggregate `thread/tokenUsage`**, but per-subagent reasoning/commands/tokens **likely go to separate `~/.codex/sessions/.../rollout-*.jsonl` files**, NOT the parent log. [ASSUMED for ultra — unverified in preview] → coarse "N spawned / M done / ~tok" is visible; deep per-subagent visibility needs a rollout-file tail or the SubagentStart/Stop hooks.

## 5 · APEX integration design — the three forks resolved
**Fork 1 — default coder tier → make Terra the default at GA.** Terra ≈ gpt-5.5 quality at ½ cost is a
clean win for the high-volume build phase. Proposed per-spec ladder (one family, monotonic cost/quality —
the *clean* tiering ADR-027 lacked when it collapsed cross-family routing): **Luna** (trivial) · **Terra**
(default) · **Sol** (risk:high/auth/security/data/hard + the `max`/`ultra` modes). This reopens a per-spec
`coder_model` route, but within-family it's a simple ladder, not the messy cross-family tree ADR-027 killed
— note this as a *scoped* refinement of ADR-027, RED-probe the per-spec tier judgment (likely model-native).

**Fork 2 — parallelism ownership → APEX waves stay primary; `ultra` is an accelerator, not a layer.**
They're different axes: `ultra` parallelizes *inside one hard task* (opaque, model-driven); APEX waves
(ADR-028/029) parallelize *across independent file-disjoint tasks* (explicit, scope-locked, observable).
Complementary — but they **stack multiplicatively** on quota (a wave of N `ultra` tasks = N×subagents;
"token skyrockets"), and `ultra`'s opacity fights APEX's surgical-scope + visibility discipline. Decision:
keep waves as the parallelism primitive; treat `ultra` as a **rare per-task escalation rung above `max`**,
and when used, **count it heavier against `max_parallel_codex` (or run ultra tasks sequential/foreground)**
to avoid blow-up and keep supervision. **EVALUATE at GA before adopting** (does ultra-on-one-task beat
`max` + our waves, at what cost?) — do not faith-bake.

**Fork 3 — visibility → current pulse covers standard/`max`; add a coarse `ultra` line.** For Sol/Terra/Luna
standard + `max`, the existing ADR-030 pulse is sufficient (just show the tier + effort). For `ultra`, add a
boundary-level pulse from `collabToolCall` + aggregate tokens ("⟳ sol·ultra · 3 subagents, 1 done · ~Xk tok");
defer per-subagent deep visibility to an optional rollout-file tail only if the coarse line proves too thin.

## 6 · NOW-actionable (independent of GPT-5.6 access)
1. **Verify the ADR-030 flag actually works** — bug #28113 made `-c model_reasoning_effort` unreliable at
   `exec` startup on 0.139.0. Run a probe on our 0.141.0 (does effort actually change behaviour/usage?);
   if broken, upgrade to **0.142.3**. *This validates the dial we shipped today.*
2. **Effort-enum correction** — the real enum is `minimal|low|medium|high|xhigh`; our `coder_effort
   {low|medium|high|xhigh}` is a safe subset but could add `minimal` for trivial specs (cheaper than `low`).
3. **Optional pulse upgrade** — parse the structured `--json` events (`turn/completed` token breakdown,
   `item/reasoning/summaryTextDelta`, `collabToolCall`) instead of a raw tail. Richer, available **today**
   on 0.141, and it pre-wires `ultra` visibility (collabToolCall) for free.

## 7 · GA-gated (promote `docs/drafts/gpt-5.6-family-adoption.md` when unblocked)
Trigger: `codex exec -m <gpt-5.6 id>` resolves on our auth. Then, re-verifying every fact: Stage 1 add `max`
to the effort enum; Stage 2 the Sol/Terra/Luna tier menu with **Terra default**; Stage 3 the `ultra` eval.

## Assumptions / gaps (the UNKNOWN surface — large)
Model-ID strings · `max`/`ultra` invocation syntax · whether `ultra` is Codex-reachable at all or app-only ·
subagent count/model/decomposition/determinism · cost multipliers · per-subagent token visibility under
`ultra` · GA date / enrollment · whether 0.141 needs upgrading for GPT-5.6. **None are blockers to act on
§6; all gate §7.**

## Sources
- OpenAI — *Previewing GPT-5.6 Sol* (openai.com, blog 403 to fetch; quoted via press) · developers.openai.com/codex {models, cli, config-reference, changelog} · platform.openai.com (Responses API reasoning) · github.com/openai/codex (releases, issues #28113 #17523, SDK) · artificialanalysis.ai · press: MarkTechPost, TechCrunch, 9to5Mac, VentureBeat, kingy.ai [COMMUNITY]
- Full per-claim citations + tiers in `ws-a..d-*.md` (this folder).
