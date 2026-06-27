# WS-A: GPT-5.6 Model Family & Per-Task Model Routing

**Phase:** apex-research Phase-2 retrieval
**Date:** 2026-06-27
**Topic:** GPT-5.6 Sol / Terra / Luna — tiers, pricing, model IDs, routing, availability

---

## Summary

OpenAI announced the GPT-5.6 model family on 2026-06-26 as a limited preview. Three tiers — Sol
(flagship), Terra (balanced production), Luna (budget/speed) — introduce a new naming convention
that separates *generation* (the number) from *durable capability tier* (the name). Pricing is
$5/$30, $2.50/$15, and $1/$6 per 1M tokens (input/output) respectively. **Exact API model ID
strings are not yet published** in OpenAI's developer documentation; the models are accessible only
to ~20 invited trusted partners. Model selection is manual/developer-driven — no automatic routing
is described. Broader GA rollout is expected within weeks pending US government coordination.

---

## Key Findings

### 1. Naming System

**[VERIFIED]** OpenAI introduced a two-part naming convention with GPT-5.6:
- **Generation number** (5.6): identifies the model generation
- **Capability tier name** (Sol / Terra / Luna): identifies a *durable* tier that can advance on
  its own cadence independently of the generation number

Stated intent: "The number now marks the generation. The names mark durable capability tiers."
This allows OpenAI to ship improvements within a tier without bumping the generation number, and
mirrors the approach Anthropic uses with Opus / Sonnet / Haiku.

Sources: OpenAI Community Forum announcement; MarkTechPost; The Decoder

---

### 2. The Three Tiers

#### Sol — Flagship
**[VERIFIED]** Positioned as the top capability tier, built for:
- Frontier reasoning and long-horizon agentic work
- Coding and command-line workflow planning
- Cybersecurity research (ExploitBench leadership)
- Scientific reasoning: biology, virology, pathology (9+ percentage points above GPT-5.5)

New modes introduced on Sol:
- **`max` reasoning effort** — extended reasoning for complex/deep tasks
- **`ultra` mode** — coordinated subagent architecture for multi-step workflows

Benchmarks (TerminalBench 2.1) [VERIFIED from lushbinary/MarkTechPost]:
- Sol (`ultra` mode): 91.9%
- Sol (`max` mode): 88.8%
- GPT-5.5: 83.4%

Safety classification (Preparedness Framework) [VERIFIED from deploymentsafety.openai.com]:
- Biological/Chemical: **High**
- Cybersecurity: **High**
- AI Self-Improvement: Below High

#### Terra — Balanced Production
**[VERIFIED]** Positioned as the mid-tier everyday model:
- Performance roughly equivalent to GPT-5.5 at approximately 2x lower cost
- Suitable for: support ticket summarization, high-volume production workloads, standard chat/API
- TerminalBench 2.1: 84.3% (above GPT-5.5's 83.4%)

#### Luna — Speed/Cost Budget
**[VERIFIED]** The fastest, most affordable tier:
- Optimized for: autocomplete, email classification, simple extraction, high-volume routine tasks
- "Strong capability at OpenAI's lowest price"
- TerminalBench 2.1: 82.5% (slightly below GPT-5.5)

---

### 3. Pricing

**[VERIFIED]** Pricing per 1M tokens (input / output):

| Model | Input | Output | Cached Input (read) | Cache Write |
|-------|-------|--------|---------------------|-------------|
| GPT-5.6 Sol | $5.00 | $30.00 | $0.50 (90% off) | 1.25× input |
| GPT-5.6 Terra | $2.50 | $15.00 | $0.25 (90% off) | 1.25× input |
| GPT-5.6 Luna | $1.00 | $6.00 | $0.10 (90% off) | 1.25× input |

**Comparison to prior models** [VERIFIED]:

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| GPT-5.5 | $5.00 | $30.00 | Sol = same price as GPT-5.5 |
| GPT-5.4-mini | $0.75 | $4.50 | Luna is ~33% more than GPT-5.4-mini input |

Key relationships:
- Sol matches GPT-5.5 price while claiming significant capability uplift
- Terra = GPT-5.5-class performance at half the cost
- Luna = cheapest OpenAI frontier model; still above GPT-5.4-mini

Caching update [VERIFIED from multiple sources]:
- Explicit cache breakpoints with guaranteed 30-minute minimum lifetime
- Cache writes: 1.25× standard input rate
- Cache reads: 90% discount off input price

**CONFLICT FLAG:** One source (Senswit) reported Sol at "$30 input / $60 output" — this is an
outlier contradicted by 6+ other sources including the OpenAI Community Forum thread and
MarkTechPost. Treat Senswit figure as likely transcription error. Do not rely on it.

---

### 4. Model IDs / API Strings

**[NOT FOUND / NOT YET DOCUMENTED]**

No official API model ID strings for GPT-5.6 Sol, Terra, or Luna have been published:
- OpenAI's `developers.openai.com/api/docs/models` and `/all` pages do not list any GPT-5.6 IDs
- Codex changelog (`developers.openai.com/codex/changelog`) ends at GPT-5.5 (April 23, 2026)
- Codex models page (`developers.openai.com/codex/models`) lists only: `gpt-5.5`, `gpt-5.4`,
  `gpt-5.4-mini`, `gpt-5.3-codex-spark` (deprecated)
- All secondary sources use only the marketing names "Sol", "Terra", "Luna"

**[ASSUMED — DO NOT USE IN PRODUCTION]** Based on the pattern of existing model IDs, the likely
strings would follow `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` — but this is *pure
inference* from prior naming conventions. OpenAI has not confirmed these strings, and the models
are not accessible to most developers yet.

Current Codex CLI documented usage (for context, GPT-5.5):
```
codex exec -m gpt-5.5 "..."
```

GPT-5.6 Codex integration: expected but not yet documented.

**Recommendation:** Do not update any model references until OpenAI publishes official IDs post-GA.

---

### 5. Per-Task Model Selection Mechanism

**[VERIFIED — manual selection; no automatic routing]**

OpenAI positions model selection as a developer responsibility, not automatic:
- The tier structure provides a clear decision framework, not an API-level auto-router
- No `route_automatically` or equivalent parameter described anywhere

Recommended developer routing heuristic [COMMUNITY — from MarkTechPost, community forum]:
| Task class | Recommended tier |
|------------|-----------------|
| Long-horizon agents, complex coding, security research | Sol |
| Standard production workloads, chat, summarization | Terra |
| High-volume, latency-sensitive, bulk classification | Luna |

In API calls: standard `model` parameter (e.g., `"model": "gpt-5.6-sol"` — ID unconfirmed).
In Codex CLI: `-m` flag (e.g., `codex exec -m gpt-5.6-sol` — ID unconfirmed).

No "per-task automatic routing" feature is described in any source. Developer chooses the tier
for each workload; the tier naming makes the mental model clearer but does not automate selection.

---

### 6. Availability

**[VERIFIED]**

Current state (as of 2026-06-27):
- **Limited preview only** — approximately 20 trusted partner organizations
- No public waitlist or self-service enrollment; OpenAI contacts eligible orgs
- Access via API and Codex only (ChatGPT UI access not yet available)
- Government-coordinated rollout: US Trump administration requested this limited release ahead of
  broader deployment; Office of Science and Technology Policy (OSTP) + Office of the National
  Cyber Director (ONCD) involved
- OpenAI stated: "We don't believe this kind of government access process should become the
  long-term default"

Broader rollout:
- General availability across ChatGPT, Codex, and the API: "coming weeks" (no hard date given)
- Sol on Cerebras (750 tokens/second): planned for July 2026

---

## Sources

### Tier-1 (OpenAI Official — partially inaccessible)

- [A preview of GPT-5.6 Sol, Terra, and Luna | OpenAI Help Center](https://help.openai.com/en/articles/20001325-a-preview-of-gpt-56-sol-terra-and-luna) — returned 403 during fetch; confirmed via search snippet
- [Previewing GPT-5.6 Sol: a next-generation model | OpenAI](https://openai.com/index/previewing-gpt-5-6-sol/) — returned 403 during fetch; confirmed via search snippet
- [GPT-5.6 Preview System Card | OpenAI Deployment Safety Hub](https://deploymentsafety.openai.com/gpt-5-6-preview) — WebFetch successful; safety classifications confirmed
- [Introducing GPT-5.6 series: Sol, Terra and Luna | OpenAI Community Forum](https://community.openai.com/t/introducing-gpt-5-6-series-sol-terra-and-luna/1384931) — WebFetch successful; tier capabilities and pricing confirmed
- [Models | OpenAI API](https://developers.openai.com/api/docs/models) — WebFetch successful; GPT-5.6 NOT listed
- [All Models | OpenAI API](https://developers.openai.com/api/docs/models/all) — WebFetch successful; GPT-5.6 NOT listed
- [Models – Codex | OpenAI Developers](https://developers.openai.com/codex/models) — WebFetch successful; GPT-5.6 NOT listed
- [Changelog – Codex | OpenAI Developers](https://developers.openai.com/codex/changelog) — WebFetch successful; GPT-5.6 NOT listed
- [Pricing | OpenAI API](https://developers.openai.com/api/docs/pricing) — WebFetch successful; GPT-5.6 pricing NOT listed

### Secondary / News

- [OpenAI Previews GPT-5.6 With Sol, Terra, and Luna | MarkTechPost](https://www.marktechpost.com/2026/06/26/openai-previews-gpt-5-6-with-sol-terra-and-luna-tiered-models-new-reasoning-modes-limited-access/) — WebFetch successful; pricing + selection framework confirmed
- [OpenAI limits GPT-5.6 rollout after government request | TechCrunch](https://techcrunch.com/2026/06/26/openai-limits-gpt-5-6-rollout-after-government-request-says-restrictions-shouldnt-be-the-norm/) — WebFetch successful; availability + gov coordination confirmed
- [OpenAI unveils GPT-5.6 Sol, Terra and Luna | VentureBeat](https://venturebeat.com/technology/openai-unveils-gpt-5-6-sol-terra-and-luna-models-but-only-accessible-to-limited-preview-partners-for-now-per-us-gov) — 403 during fetch; search snippet used
- [GPT-5.6 Sol Benchmarks Deep Dive | Lushbinary](https://lushbinary.com/blog/gpt-5-6-sol-benchmarks-terminalbench-agentic-deep-dive/) — WebFetch successful; TerminalBench scores confirmed
- [OpenAI's GPT-5.6 Sol launches | The Decoder](https://the-decoder.com/openais-claude-mythos-competitor-gpt-5-6-sol-launches-under-government-controlled-access-it-calls-unsustainable/) — WebFetch successful; caching details + gov coordination confirmed
- [GPT-5.6 Sol, Terra & Luna | Digital Applied](https://www.digitalapplied.com/blog/gpt-5-6-sol-terra-luna-preview-guide-2026) — WebFetch successful; caching pricing table confirmed
- [OpenAI upgrading ChatGPT and Codex | 9to5Mac](https://9to5mac.com/2026/06/26/openai-upgrading-chatgpt-and-codex-with-new-gpt-5-6-models-in-limited-release/) — WebFetch successful; no additional model ID data

---

## What Is Still UNKNOWN

1. **Official API model ID strings** — not published; GPT-5.6 not yet in developer docs
2. **Codex CLI `-m` flag string** for each tier — not published
3. **Context window size** for GPT-5.6 (GPT-5.5 was 1M tokens; not confirmed for 5.6)
4. **Terra and Luna benchmark details** beyond TerminalBench 2.1
5. **Exact GA date** — "coming weeks" only
6. **Self-service enrollment path** — no waitlist published; invite-only
7. **Cerebras Sol pricing** (750 tok/s planned July 2026) — not disclosed
8. **Whether the automatic-routing or per-request model-switching features will be added** — not mentioned

---

_Research agent: Phase-2 WS-A | Status: COMPLETE | Recommends: No spec action on model IDs until GA_
