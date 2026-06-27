# WS-B: GPT-5.6 Execution Modes — `max` Reasoning Effort & `ultra` Mode

**Phase:** 2 — Retrieval  
**Workstream:** WS-B  
**Date:** 2026-06-27  
**Scope:** `max` reasoning effort and `ultra` mode introduced with GPT-5.6 Sol; focus on `ultra`'s parallel/subagent execution mechanics.  
**Status:** Complete — limited by preview-stage documentation gaps

---

## Source Tier Legend

- **[T1-VERIFIED]** — openai.com / developers.openai.com / help.openai.com (authoritative)
- **[T2-VERIFIED]** — Major tech press (TechCrunch, Neowin, 9to5Mac, DataCamp, The Decoder) citing OpenAI announcement copy verbatim
- **[COMMUNITY]** — Analyst blogs, aggregators, community inference
- **[ASSUMED]** — Logical inference with no direct sourcing
- **UNDOCUMENTED** — Confirmed by absence: not yet in official developer docs

---

## 1. Context: GPT-5.6 Model Family

GPT-5.6 was announced 2026-06-26 as a **limited preview** (≈20 government-approved partner organisations) with general availability planned "in the coming weeks." The family introduces a new naming tier system:

| Tier | Role | API Pricing (input/output per 1M tokens) | Source |
|------|------|-------------------------------------------|--------|
| **Sol** | Flagship — max intelligence | $5 / $30 | [T2-VERIFIED] multiple outlets |
| **Terra** | Balanced — similar to GPT-5.5 capability, 2× cheaper | $2.50 / $15 | [T2-VERIFIED] |
| **Luna** | Fast & low-cost | $1 / $6 | [T2-VERIFIED] |

GPT-5.6 is **not yet in the official developer model docs** (developers.openai.com/api/docs/models still lists GPT-5.5 as flagship). The models page notes only: "GPT-5.6 is available to select trusted partners in preview. Broad availability coming soon." [T1-VERIFIED — developers.openai.com/api/docs/models]

---

## 2. `max` Reasoning Effort

### What It Is

OpenAI describes `max` as **"a new reasoning effort that gives Sol the most time to reason deeply."** [T2-VERIFIED — multiple outlets quoting the GPT-5.6 announcement]

The mode extends the single-chain reasoning approach: one model, one inference path, with a larger compute budget than any prior effort level. It does **not** spawn subagents.

> "The max setting deepens a single chain of reasoning." [COMMUNITY — MarkTechPost, citing OpenAI description]

### Position on the Effort Ladder

The existing reasoning_effort ladder for GPT-5.5 and earlier (documented in developers.openai.com/api/docs/guides/reasoning):

```
none → minimal → low → medium → high → xhigh
```

[T1-VERIFIED — developers.openai.com/api/docs/guides/reasoning]

Whether `max` is a **new API value above `xhigh`** or a **product-level label** for `xhigh` applied to Sol is **UNDOCUMENTED** in current official developer docs. No source confirms the exact string `reasoning_effort="max"` as a valid API parameter for GPT-5.6.

The GPT-5.6 developer documentation does not yet exist on developers.openai.com; the reasoning guide references GPT-5.5 and earlier only. [T1-VERIFIED — developers.openai.com/api/docs/guides/reasoning]

### Cost / Latency

- No explicit per-mode pricing multiplier documented. [UNDOCUMENTED]
- Both `max` and `ultra` "trade latency and cost for accuracy on long-horizon problems." [T2-VERIFIED — multiple outlets quoting announcement]
- Inference speed note: OpenAI plans Cerebras-hosted Sol at "up to 750 tokens/sec" (July 2026) — not mode-specific. [T2-VERIFIED — multiple outlets]

### Benchmark: `max`

- **Terminal-Bench 2.1: Sol (max) = 88.76%** [COMMUNITY — MarkTechPost]  
  (Compared to standard Sol = 88.8% per other sources; the 88.76 vs 88.8 discrepancy may reflect rounding across sources)

---

## 3. `ultra` Mode

### Headline Description (Verified)

> "A new ultra mode goes beyond the capabilities of a single agent by leveraging subagents to accelerate complex work." [T2-VERIFIED — multiple outlets quoting official OpenAI announcement language verbatim]

> "Instead of one model working alone, ultra leverages subagents. These subagents split complex work to accelerate it." [T2-VERIFIED]

### Architecture: What Is Verifiable

| Claim | Status |
|-------|--------|
| `ultra` spawns multiple subagents | [T2-VERIFIED] — stated in announcement |
| Subagents run **in parallel** | [T2-VERIFIED] — "split/accelerate" language; multiple outlets confirm parallel execution |
| Subagents coordinate output into a unified result | [T2-VERIFIED] — "coordinate output" language |
| Architecture is **model-internal** (not developer-managed) | [COMMUNITY — multiple analyst pieces; one describes it as "OpenAI embedding loops at the model level"] |
| Exact **number of subagents** spawned | **UNDOCUMENTED** — no source specifies count |
| **Coordination mechanism** between subagents | **UNDOCUMENTED** — how tasks are decomposed, how results are merged |
| Whether subagents use the **same model** or specialised variants | **UNDOCUMENTED** |
| Whether execution is **fully parallel** or partially sequential | [COMMUNITY — "parallel" widely reported but not officially confirmed in technical detail] |

### How `ultra` Differs from Developer-Managed Parallelism

Developer-managed approach (Codex subagents, Agents SDK): requires explicit orchestration — tool registration, retry logic, authentication, state management, prompt routing, explicit `spawn_agents_on_csv` or natural-language prompts to the Codex app. Developers see and control the plumbing.

`ultra` mode: OpenAI claims to **internalize** this orchestration inside the model/inference layer. The developer does not write orchestration code; the model decides when to split, which subagents handle which sub-task, and when to consolidate.

**Key distinction:** Codex subagents are a *developer-visible workflow primitive*; `ultra` is described as a *model-internal compute strategy* triggered by mode selection. [COMMUNITY — The Decoder, FourWeekMBA, analyst commentary; not officially confirmed in implementation detail]

**Relationship to Codex Subagents (developers.openai.com/codex/subagents / /codex/concepts/subagents):** The official Codex subagents documentation makes **zero mention** of GPT-5.6 or ultra mode. It describes a separate, prompt-driven parallel agent dispatch ("Spawn one agent per point, wait for all of them..."). These are **distinct features** as of 2026-06-27. [T1-VERIFIED — developers.openai.com/codex/concepts/subagents; Codex changelog last entry: June 25, 2026, no GPT-5.6 reference]

### API / Codex CLI Invocation

**UNDOCUMENTED.** No official source provides:
- Whether `ultra` is passed as `reasoning={"effort": "ultra"}`, a separate `mode="ultra"` parameter, or another flag
- Whether it's available via the standard Responses API or a new endpoint
- Whether `codex exec` accepts a `--ultra` flag or model variant

The standard reasoning effort invocation pattern (from developers.openai.com cookbook) is:
```python
client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "medium"},
    ...
)
```
[T1-VERIFIED — developers.openai.com/cookbook]

Whether `"effort": "ultra"` or `"effort": "max"` are valid values for GPT-5.6 is **not yet documented** in any Tier-1 source.

### Token Cost Warning

TechCrunch notes ultra mode causes token usage to "skyrocket." [T2-VERIFIED — TechCrunch, citing OpenAI]  
No specific multiplier (e.g., "5× standard") is published. [UNDOCUMENTED]

---

## 4. Benchmarks

### Terminal-Bench 2.1 (Primary Coding/Agentic Benchmark)

| Model | Score | Source |
|-------|-------|--------|
| GPT-5.6 Sol (ultra) | **91.9%** | [T2-VERIFIED — multiple outlets; MarkTechPost, DataCamp, Lushbinary] |
| GPT-5.6 Sol (standard) | 88.8% | [T2-VERIFIED] |
| GPT-5.6 Sol (max) | 88.76% | [COMMUNITY — MarkTechPost] |
| Claude Mythos 5 | 88.0% | [T2-VERIFIED — Lushbinary, The Decoder] |
| GPT-5.6 Terra / Claude Fable 5 | 84.3% (tied) | [COMMUNITY — DataCamp, OfficeChai] |
| GPT-5.5 | 83.4% | [T2-VERIFIED — Lushbinary, Latent Space] |
| GPT-5.6 Luna | 82.5% | [COMMUNITY — DataCamp] |
| Claude Opus 4.8 | 78.9% | [COMMUNITY — Lushbinary] |
| Google Gemini 3.1 Pro Preview | 70.7% | [COMMUNITY — The Decoder] |

### Other Agentic / Domain Benchmarks

| Benchmark | Result | Source |
|-----------|--------|--------|
| Agent's Last Exam (code mode) | Sol ≈ 50.9% — "first model past halfway mark" | [T2-VERIFIED — MarkTechPost, DataCamp] |
| GeneBench v1 | Sol outperforms GPT-5.5 "using fewer tokens" | [T2-VERIFIED — multiple outlets] |
| ExploitBench / ExploitGym | Sol "matches Claude Mythos Preview with one-third output tokens" | [T2-VERIFIED — multiple outlets] |
| CVE-Bench / VulnLMP | Sol performance claimed; exact scores withheld | [T2-VERIFIED — kingy.ai benchmarks article] |

**Caveat:** Terminal-Bench 2.1 scores for `ultra` mode are the primary differentiator. The 91.9% is cited consistently across multiple independent outlets. Sol (max) benchmark score of 88.76% appears only in MarkTechPost; other outlets conflate standard and max. The ≈88.8% figures across standard and max sources may reflect rounding or represent the same mode.

---

## 5. Tier Availability: Sol / Terra / Luna

OpenAI's announcement language consistently phrases `max` and `ultra` as **Sol features**:

> "With GPT-5.6, OpenAI is introducing a new max reasoning effort **to give Sol the most time to reason deeply**, and a new ultra mode..." [T2-VERIFIED — multiple outlets quoting announcement]

No source confirms Terra or Luna support for `max` or `ultra`. One source notes feature availability for Terra/Luna as "implied no." [COMMUNITY — kingy.ai]

**Assessment:** `max` and `ultra` appear to be **Sol-exclusive** features in the current preview. Terra and Luna are positioned as capability-efficient tiers without the compute-intensive modes. [ASSUMED — based on announcement language and benchmark absence for Terra/Luna in mode-specific scores]

---

## 6. UNKNOWNS (Explicit List)

The following are not yet documented in any Tier-1 source and cannot be verified:

1. **Exact API parameter syntax** for invoking `max` or `ultra` (is it `reasoning={"effort": "max"}`, `mode="ultra"`, or another mechanism?)
2. **Whether `max` is a new `reasoning_effort` string value** above `xhigh`, or a product label
3. **Number of subagents** spawned in `ultra` mode (OpenAI has not disclosed this)
4. **Task decomposition algorithm**: how `ultra` decides which subtasks to parallelize
5. **Subagent model**: whether subagents use Sol, a lighter model, or specialised variants
6. **Cost multiplier** for `max` and `ultra` vs standard (only described as "higher latency and cost")
7. **Whether `ultra` is available via the standard Responses API** or requires a Codex/agentic endpoint
8. **Whether `codex exec` exposes a flag** for `ultra` mode
9. **Terra/Luna `max` / `ultra` support** (currently assumed Sol-exclusive)
10. **Whether `ultra` mode results are reproducible** or stochastic across subagent runs

---

## 7. Raw Sources

### Tier 1 (openai.com / developers.openai.com)

- `developers.openai.com/api/docs/models` — confirms GPT-5.6 in preview; no model card yet
- `developers.openai.com/api/docs/guides/reasoning` — effort ladder (none/minimal/low/medium/high/xhigh) for GPT-5.5 and earlier; no GPT-5.6 entry
- `developers.openai.com/codex/concepts/subagents` — Codex subagents docs; no mention of GPT-5.6 or ultra
- `developers.openai.com/codex/changelog` — latest entry June 25, 2026; no GPT-5.6 reference
- `help.openai.com/en/articles/20001325-a-preview-of-gpt-56-sol-terra-and-luna` — 403 Forbidden (restricted to authenticated users)
- `openai.com/index/previewing-gpt-5-6-sol/` — 403 Forbidden (official blog post; inaccessible)

### Tier 2 (Major Press, quoting announcement)

- [MarkTechPost — GPT-5.6 preview](https://www.marktechpost.com/2026/06/26/openai-previews-gpt-5-6-with-sol-terra-and-luna-tiered-models-new-reasoning-modes-limited-access/)
- [DataCamp — GPT-5.6 Sol/Luna/Terra](https://www.datacamp.com/blog/gpt-5-6-sol-luna-terra)
- [TechCrunch — GPT-5.6 limited rollout](https://techcrunch.com/2026/06/26/openai-limits-gpt-5-6-rollout-after-government-request-says-restrictions-shouldnt-be-the-norm/)
- [9to5Mac — GPT-5.6 limited release](https://9to5mac.com/2026/06/26/openai-upgrading-chatgpt-and-codex-with-new-gpt-5-6-models-in-limited-release/)
- [MacRumors — GPT-5.6 Sol](https://www.macrumors.com/2026/06/26/openai-gpt-5-6-sol/)
- [Neowin — GPT-5.6 Sol](https://www.neowin.net/news/openai-announces-gpt56-sol-its-next-generation-flagship-model-beating-claude-mythos-5/)
- [Latent Space AI News](https://www.latent.space/p/ainews-openai-gpt-56-sol-terra-luna)

### Community / Analyst

- [Lushbinary — Terminal-Bench deep dive](https://lushbinary.com/blog/gpt-5-6-sol-benchmarks-terminalbench-agentic-deep-dive/)
- [kingy.ai — benchmarks and specs](https://kingy.ai/news/openai-gpt-5-6-sol-benchmarks-specs-pricing-safety-evals/)
- [FourWeekMBA — Sol/Terra/Luna subagents](https://fourweekmba.com/openai-gpt-5-6-sol-terra-luna-subagents-government/)
- [Digital Applied — guide](https://www.digitalapplied.com/blog/gpt-5-6-sol-terra-luna-preview-guide-2026)
- [The Decoder — government access](https://the-decoder.com/openais-claude-mythos-competitor-gpt-5-6-sol-launches-under-government-controlled-access-it-calls-unsustainable/)
- [OfficeChai — TerminalBench](https://officechai.com/ai/openai-launches-gpt-5-6-sol-beats-mythos-on-terminalbench/)
- [Coursiv — Sol overview](https://coursiv.io/blog/chatgpt-5-6-sol)

---

*Research agent: WS-B retrieval pass. No recommendations made. All claims tagged. Synthesis is Phase 3.*
