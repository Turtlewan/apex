# Research Brief: Move APEX fully local — planning + coding on self-hosted DeepSeek

**Status:** READY TO RUN (launch next session)
**Created:** 2026-06-12
**Type:** Research plan / dispatch brief (not research output — the agents below produce that)
**Decision at stake:** A phased hardware + software + ops plan to run the **entire APEX pipeline —
planning *and* coding — on local self-hosted DeepSeek**, completely off the cloud, integrated with
the Artemis hardware roadmap, with a strategy so the local stack stays current rather than frozen
at download.

---

## Scope (settled — this is the target, not a research question)

- **End-state = APEX is 100% local on DeepSeek.** Both modes run on self-hosted DeepSeek:
  - **DeepSeek Pro V4 = reasoning + planning** (the role Claude plays today — spec authoring,
    judgment, ADRs, agent orchestration).
  - **DeepSeek Flash = code execution** (the coding-mode build role).
  - **No cloud LLM in the production loop.** Completely off the cloud.
- **Claude is NOT in the target architecture.** Claude is only the tool running *this research
  task* (see model cascade below). Do not design the target around keeping Claude.
- **Today's baseline being replaced:** planning runs on Claude cloud; coding runs on the DeepSeek
  cloud API (via a base-URL proxy). Both move to **local DeepSeek**. Claude Code (the *harness/CLI*)
  can stay — only the *models* it points at change — but verify that in WS-C.
- **The gating risk (call it out everywhere):** APEX split planning→Claude on purpose, because
  planning is the judgment-heavy half. The decisive question is **whether local DeepSeek Pro V4 can
  do Claude-grade planning/reasoning** — not just whether it can code. WS-A + WS-F own this verdict.
- **Decision output:** an **ADR** (permanent: "run APEX fully local on DeepSeek") **+** a phased
  hardware/ops plan in `docs/research/`. Not a spec yet — build specs come after.
- **Freshness:** AI/LLM tooling — re-research threshold **14 days**. Push hard for primary sources
  (model cards, serving-engine docs, GPU specs, head-to-head benches); this rots fast.

## Known context the agents must anchor to (do not re-derive)

- Current deployment (memory `project-deployment`): Windows = planning today; **Mac Mini = where
  DeepSeek coding runs (dev+prod)**; AWS = future scale-up only. Both LLM roles reach the cloud
  today — **that is the dependency being removed.**
- APEX backend routing today (`CLAUDE.md`/`BACKEND-ROUTING.md`): mode is detected from
  `ANTHROPIC_BASE_URL` (unset/anthropic → planning=Claude; `deepseek` → coding). Going fully local
  **rewires this routing** (both modes → local DeepSeek endpoints). That APEX rewrite is a *downstream
  consequence/build*, flagged by synthesis — **not** researched here.
- APEX leans on **parallel agent dispatch** (research, spec review, wave review). Fully local means
  those subagents also run on local DeepSeek → the serving stack must handle **concurrent agent
  fan-out**, not a single stream (WS-B/WS-C).
- `status.md`: DeepSeek V4 Flash published native window = **1M ctx / 384K output** [ASSUMED —
  DeepSeek docs, session 31]; the real *local* achievable context is WS-C's to establish.
- Artemis = flagship platform (assistant + RAG "second brain"); its hardware expands regardless —
  **plan the inference box as shared Artemis + APEX-brain infra,** not a one-off (WS-E).

---

## Model cascade for THIS research (Claude — research process only, NOT the target)

```
Fable (this orchestrator session)
  ├─ plans the dispatch
  ├─ spawns gather agents in parallel (run_in_background: true), model override per WS:
  │     Sonnet  → technical / judgment-heavy gathers (WS-A,B,C,D,F)
  │     Haiku   → cheap breadth / fact-pulls / pricing (WS-E first pass)
  └─ Fable synthesises all returns → ADR + phased plan
```

This cascade exists **only because Claude is what's running the research today.** It says nothing
about the production architecture (which is all-local DeepSeek).

**Dispatch invariant (ADR-015 — enforce on every agent):** each gather agent **writes full findings
to `docs/research/local-inference/<ws-id>.md` and returns only a ≤1–2k-token summary + pointer.**
Fable never absorbs raw transcripts. apex-research confidence tags per claim
(`[VERIFIED]`/`[COMMUNITY]`/`[ASSUMED]`); thin/uncited returns re-dispatched (hardened) before synthesis.

---

## Workstreams — one parallel agent each (no overlap)

### WS-A · DeepSeek lineup, footprint & capability — **Sonnet**
- Map the **actual current DeepSeek lineup** to the user's "Pro V4" (reasoning) + "Flash" (coding)
  — verify real released model names/sizes, don't assume the shorthand.
- Per model: total vs **MoE active params**; quant options (FP8 / INT4 / AWQ / GGUF / MLX) with
  disk + VRAM/RAM footprint and **quality degradation per quant for (a) planning/reasoning and
  (b) coding** — both matter now, not just coding.
- **Tool-calling / function-calling fidelity per quant** (APEX planning *and* coding depend on it).
- Surface any published **benchmarks of Pro V4 vs frontier (Claude-class) on planning/reasoning
  tasks** — the input to the gating verdict.
- Deliverable: footprint + capability table, min viable quant for each role.

### WS-B · Hardware to serve the whole APEX brain — **Sonnet**
- Size for **Pro V4 as a heavily-used reasoning/planning model + Flash for coding + concurrent
  agent fan-out** (APEX spawns parallel subagents). Same box or split reasoning/coding hosts?
- Option families with realistic **tokens/sec** and memory math at WS-A quants: multi-GPU NVIDIA
  (RTX 5090 / RTX 6000 Blackwell / H100), **Apple M3 Ultra 512 GB unified**, AMD. Power, thermal,
  **noise** (home), price bands.
- Deliverable: 2–3 build tiers (entry / balanced / headroom) with $, tok/s, and concurrency ceiling.

### WS-C · Serving stack + harness wiring — **Sonnet**
- Serving engine for DeepSeek + tool-calling + long context + **concurrency**: vLLM / SGLang /
  llama.cpp / Ollama / LM Studio / MLX / TGI — which support the WS-A models *and* function-calling
  *and* parallel requests.
- **Harness wiring:** confirm Claude Code (the CLI) can point **both** planning and coding at local
  DeepSeek endpoints via the Anthropic-API shim (LiteLLM / claude-code-router / anthropic-proxy);
  tool-use translation fidelity, streaming, structured output. Establish the **real local context cap.**
- Deliverable: recommended serving + proxy stack with config sketch + concurrency notes.

### WS-D · Keeping the stack current ("not frozen at download") — **Sonnet** ⭐ differentiator
Evaluate three levers (for the whole local stack), recommend a **hybrid** + an upgrade eval gate:
1. **Model-swap cadence** — eval-gated re-pull of new DeepSeek releases (simplest "improves with
   advancements"); define the regression eval before swapping.
2. **Local continued-tuning** — LoRA/QLoRA on project planning+coding data + accept/reject feedback;
   hardware/data cost, catastrophic-forgetting risk, worth-it-vs-swap.
3. **RAG-for-currency** — inject a **fresh index of current library docs / best-practice** at
   inference so frozen weights get current *context* (cheap; **reuses Artemis' second brain +
   apex-research staleness clocks**). Likely highest ROI.
- Deliverable: recommended currency strategy + the "upgrade now" eval gate.

### WS-E · Artemis hardware-ecosystem integration — **Haiku → escalate to Sonnet if thin**
- Place the inference box in the Artemis roadmap: **shared** (one box runs Artemis runtime/RAG +
  the APEX brain) or **dedicated**? Homelab concerns (cross-ref apex-homelab): rack/power/cooling/UPS,
  network + **Tailscale**, backups. **Mac Mini repurpose or obsolete?** Phasing + budget.
- Deliverable: phased hardware path (today → APEX-local → Artemis-scale) with $.

### WS-F · Go/no-go: can local DeepSeek replace the cloud? + economics — **Sonnet** (gating)
- **Quality verdict — the decisive question.** Can local quantized **Pro V4 do Claude-grade
  planning/reasoning**, and local **Flash match cloud-DeepSeek coding**? Use WS-A benches + define a
  hands-on eval (run real APEX planning + coding tasks on a candidate local setup, score vs current).
- **Economics:** all current LLM spend (Claude planning + DeepSeek coding API) vs local capex + opex
  (power) → break-even months per WS-B tier.
- **Rollback** path if local underperforms; risk register.
- Deliverable: a per-build-tier **go / no-go** on going fully local, with the quality evidence.

---

## Synthesis step (Fable)
After all agents return + are verified grounded:
1. Read the six `docs/research/local-inference/*.md` files.
2. Produce **`docs/research/local-inference-migration.md`** (apex-research template: summary,
   findings, options tables, recommendation, gaps, sources, **re-research after 2026-06-26**).
3. Produce **`docs/technical/adr/ADR-016-apex-fully-local-deepseek.md`** — the permanent decision
   (go/no-go on fully-local; recommended build tier; serving + proxy stack; model-currency strategy).
4. Flag the **downstream APEX rewire** (backend-routing/mode-split → both modes local) and the
   follow-on **build specs** (hardware procurement, serving setup, proxy/harness config, eval harness,
   RAG-currency index) for a later planning pass — do **not** write those specs in this run.

## Launch instructions (tomorrow)
1. Open a planning session (Fable). Say: **"run the local-inference research brief."**
2. Fable dispatches WS-A…F per the model assignments above (`run_in_background: true`, ADR-015
   return contract), verifies grounding, then synthesises into the ADR + plan.

**Re-research after:** 2026-06-26 (AI/LLM tooling, 14-day clock).
