# Research: "pi" — Disambiguation & Absorption Analysis (RE-RUN, source-grounded)

_Date: 2026-06-05 | Researcher: Claude Code (Sonnet 4.6) | RE-RUN with mandatory source-grounding_

---

## 0. Source-Grounding Log

| Project | Clone status | Evidence basis |
|---------|-------------|----------------|
| **earendil-works/pi** | CLONED: yes — `/tmp/pi-earendil`, commit `89a92207f1c9303d53d822fd9b0ac21578834cb4` | Real file paths cited below |
| **withpi / Pi Labs** | CLONED: no — proprietary SaaS backend; Python SDK (`withpi` on PyPI v1.67.0) not downloadable from this machine (pip returns "No matching distribution found"); no public GitHub SDK repo found | Marked SDK/docs-sourced throughout; sources: PyPI page, Promptfoo docs, HN threads |
| **Inflection Pi** | Not cloned; consumer chatbot, prior-art only | HN + product site |

---

## 1. Disambiguation

**"pi"** is genuinely ambiguous — three distinct projects exist:

| Candidate | Resolved URL | Status |
|-----------|-------------|--------|
| **withpi / Pi Labs** | https://withpi.ai · SDK docs: https://code.withpi.ai · PyPI: https://pypi.org/project/withpi/1.67.0/ | LLM eval/scoring SaaS |
| **earendil-works/pi** | https://github.com/earendil-works/pi | Open-source coding agent (MIT, TS) |
| **Inflection Pi** | https://pi.ai | Consumer chatbot — prior art only |

**Resolution:** Given the company it keeps (a list of AI/skills repos), **earendil-works/pi** is the primary fit — it is an open-source AI agent harness directly analogous to Claude Code. **withpi (Pi Labs)** is the secondary candidate: an LLM eval SaaS with a Python SDK. Both are covered fully. Inflection Pi is consumer-facing and not absorb-relevant.

---

## 2. Candidate A: earendil-works/pi

### Identity (CLONED)

- **URL:** https://github.com/earendil-works/pi
- **Commit SHA:** `89a92207f1c9303d53d822fd9b0ac21578834cb4` (depth-1 clone, 2026-06-05)
- **License:** MIT — confirmed in `/tmp/pi-earendil/LICENSE` ("MIT License Copyright (c) 2025 Mario Zechner")
- **What it is:** A minimal, self-extensible terminal coding agent harness and AI agent toolkit. npm-distributed TypeScript monorepo. 60.1k GitHub stars. Latest release v0.78.1 (2026-06-04).

### Monorepo Structure (from clone)

Cloned root: `/tmp/pi-earendil/`

```
packages/
  agent/         — @earendil-works/pi-agent-core (agent loop, tool calling, state)
  ai/            — @earendil-works/pi-ai (unified multi-provider LLM API)
  coding-agent/  — @earendil-works/pi-coding-agent (primary CLI + SDK)
  tui/           — @earendil-works/pi-tui (differential terminal UI)
```

Key files cited:
- `/tmp/pi-earendil/LICENSE` — MIT confirmed
- `/tmp/pi-earendil/packages/coding-agent/README.md` — architecture, skills, extensions, philosophy
- `/tmp/pi-earendil/packages/coding-agent/docs/sdk.md` — programmatic SDK API
- `/tmp/pi-earendil/packages/coding-agent/CHANGELOG.md` — version history
- `/tmp/pi-earendil/packages/agent/src/` — `agent-loop.ts`, `agent.ts`, `harness/`, `index.ts`, `node.ts`, `proxy.ts`, `types.ts`

### Key Mechanisms (all cited from cloned files)

**Default tool set** (from `packages/coding-agent/README.md`):
> "By default, pi gives the model four tools: read, write, edit, and bash."
Additional built-ins: `grep`, `find`, `ls`.

**Skills system** (from `packages/coding-agent/README.md`, `## Skills` section):
Follows the [Agent Skills standard](https://agentskills.io). Skill format is SKILL.md with front matter — same format as APEX skills. Discovery paths: `~/.pi/agent/skills/`, `~/.agents/skills/`, `.pi/skills/`, `.agents/skills/` (cwd upward). Invoked via `/skill:name`. This means APEX's `~/.claude/skills/apex-*/SKILL.md` files are compatible with pi if a user runs both.

**Extensions** (from `packages/coding-agent/README.md`, `## Extensions` section):
TypeScript modules; the documented factory signature is:
```typescript
export default function (pi: ExtensionAPI) {
  pi.registerTool({ name: "deploy", ... });
  pi.registerCommand("stats", { ... });
  pi.on("tool_call", async (event, ctx) => { ... });
}
```
Can replace built-in tools entirely; enables sub-agents, plan mode, permission gates.

**SDK embedding** (from `/tmp/pi-earendil/packages/coding-agent/docs/sdk.md`):
Primary entry point `createAgentSession()` from `@earendil-works/pi-coding-agent`. Key interfaces:
- `AgentSession.prompt(text, options)` — send a message
- `AgentSession.subscribe(listener)` — stream events (`message_update`, `tool_execution_start/end`, `turn_end`)
- `AgentSession.compact()` — compress conversation history
- `defineTool()` — type-safe custom tool definition with TypeBox schemas

**Philosophy** (from `packages/coding-agent/README.md`, `## Philosophy` section):
> "No MCP. No sub-agents. No plan mode. No permission popups."
All baked-in features are extensions available to build; none are included by default. System prompt target under 1,000 tokens. The MCP-avoidance rationale links to a blog post arguing Playwright MCP adds 13,700+ tokens of unused tool description.

**Multi-provider support** (from `packages/coding-agent/README.md`, `## Providers & Models`):
Subscriptions: Anthropic Claude Pro/Max, OpenAI ChatGPT Plus/Pro, GitHub Copilot. API keys: Anthropic, Ant Ling, OpenAI, Azure OpenAI, DeepSeek, NVIDIA NIM. Mid-session model switching.

**Recent changelog** (from `/tmp/pi-earendil/packages/coding-agent/CHANGELOG.md`, v0.78.1):
Added Ant Ling + NVIDIA NIM providers, `ctx.mode` for extensions, containerization docs. Project trust gating for project-local settings (parallel to APEX's backend-gated write guard).

---

## 3. Candidate B: withpi / Pi Labs

### Identity (SDK/docs-sourced, not core-cloned)

- **URL:** https://withpi.ai
- **SDK docs:** https://code.withpi.ai (ECONNREFUSED at research time; content sourced from HN + PyPI + Promptfoo)
- **PyPI:** https://pypi.org/project/withpi/1.67.0/ (package confirmed to exist; not downloadable from this Windows machine — pip returned "No matching distribution found"; no public GitHub SDK repo found via search)
- **License:** Proprietary SaaS; Python SDK is an open REST client, backend is closed. UNVERIFIED — no LICENSE file found.
- **What it is (SDK/docs-sourced):** An LLM evaluation and optimization platform. Core idea: replace "LLM-as-a-judge" with a tree of specialized fine-tuned encoder models (ModernBERT-based) that score 20+ quality dimensions. SDK: Python `withpi` package providing `PiClient` for `scoring_system.score()`.

### How It Works (SDK/docs-sourced)

Sources: HN thread https://news.ycombinator.com/item?id=43362535, HN https://news.ycombinator.com/item?id=44061414, Promptfoo docs https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/pi/

**Scoring system:** A hierarchical JSON "scoring spec" — a tree of dimensions (e.g., "conciseness", "avoids jargon", "answers the question"). Each leaf selects either:
- A **Pi scorer** — a fine-tuned encoder model (ModernBERT-based); sub-100ms, deterministic, same input always = same score
- A **Python function** — quantitative checks (regex, length, format)

**Pi Co-pilot (SDK/docs-sourced):** Conversational interface to bootstrap a scoring spec from examples or a system prompt; generates ~10-20 evaluation questions, then selects scorer/function per question. From HN #44061414: "turn that into a scoring spec — a set of ~10-20 concrete questions that probe the output against dimensions of quality you care about."

**Optimizers (SDK/docs-sourced):** Platform reformulates ML techniques (DSPy, GRPO, prompt optimization, synthetic data generation) as optimizers that compile against the scoring spec. When the spec updates, optimizers recompile.

**Promptfoo integration (SDK/docs-sourced):** Cited from https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/pi/ — drop-in `type: pi` assertion. Requires `WITHPI_API_KEY`. Scores are numeric 0–1 with configurable threshold. "Always generates the same score, when given the same input" — deterministic by design.

**Tech stack (SDK/docs-sourced):** From HN: Next.js + Vercel on GCP frontend; GPT-4o on Azure + fine-tuned Llama + ModernBERT on GCP; RunPod + SFCompute for training.

**Pricing (SDK/docs-sourced):** From HN: $10 free credits (~25M input tokens) for new accounts. API key required. Enterprise pricing by contact.

**PyPI package details (SDK/docs-sourced):** From web search citing PyPI v1.67.0: provides `PiClient` and `AsyncPiClient` powered by httpx; method `scoring_system.score(llm_input, llm_output, questions=[...])` returns `metrics.total_score`. Env var `PI_CLIENT_LOG=info` for logging.

---

## 4. Candidate C: Pi by Inflection AI

### Identity

- **URL:** https://pi.ai (consumer app)
- **License:** Proprietary
- **What it is:** Consumer emotional-support conversational AI. Inflection 2.5 model. Empathetic personality, persistent memory, multi-platform (web, iOS, Android, WhatsApp). Not a developer tool.
- **Relevance:** Prior art only for Artemis (Lens B) — shows design patterns for a persistent personal assistant with broad platform reach.

---

## 5. Candidate Table

| Candidate | Lens | Dedup vs APEX | Token-cost | Verdict |
|-----------|------|--------------|------------|---------|
| **withpi — encoder-model scorer** | Lens A (apex-ai-systems) | **Partial** — apex-ai-systems covers LLM-as-judge and rubric evals conceptually. Does NOT mention encoder-model scorers, sub-100ms deterministic scoring, or Promptfoo integration. Novel mechanism. | **Low** — 2-3 bullets in apex-ai-systems eval section | **Absorb (light):** Add Pi Labs as a named alternative-to-LLM-judge under the Evaluation section of apex-ai-systems. Call out: encoder-model scorer (deterministic, <100ms), Promptfoo drop-in, `scoring_system.score()`. One bullet + link. |
| **withpi — scoring-spec optimizer loop** | Lens A (apex-ai-systems) | **Novel** — scorer-drives-optimizer-recompile pattern not covered anywhere in APEX. Relevant when Artemis AI features need iterative quality improvement post-launch. | **Low** — concept mention only | **Absorb (light):** One additional bullet in apex-ai-systems noting score→calibrate→recompile-optimizers feedback loop. |
| **earendil-works/pi — skills compatibility** | Lens A (apex-skill-author) | **Already-have** — APEX skills use same SKILL.md + frontmatter format. pi's system is compatible and more lenient (name != dir is OK). badlogic/pi-skills community repo is directly usable by APEX users. | **Low** | **Note only:** Flag in apex-skill-author that APEX skills are cross-compatible with pi, Codex CLI, Amp harnesses. No spec change needed. |
| **earendil-works/pi — context-minimal philosophy** | Lens A (all skills) | **Already-have** — APEX token-efficiency memory and 500-line skill cap already reflect this. MCP-token-count concern (Playwright MCP = 13,700 tokens) is a concrete data point not in APEX docs. | **Low** | **Skip:** Philosophy already lived. MCP token count is a useful footnote but not worth a spec. |
| **earendil-works/pi — extension/SDK system** | Lens A (apex-code, apex-orchestrate) | **Novel** — pi's TypeScript extension API (`defineTool`, `registerCommand`, event hooks) is a concrete embedding model. APEX has no equivalent — skills are Markdown-only. | **Low** | **Park:** Interesting for a future "APEX as SDK" direction but no current absorption target. No APEX skill covers TypeScript agent SDKs. |
| **earendil-works/pi — cross-provider mid-session** | Lens A (apex-orchestrate) | **Novel** — APEX's two-backend model is fixed at session boundaries. Pi's mid-session switching + thinking-trace serialization (Anthropic→OpenAI) is technically distinct. | **Low** | **Skip:** Conflicts with APEX's intentional planning/coding gate design. No absorption. |
| **Pi (Inflection) — persistent empathetic assistant** | Lens B (Artemis product prior art) | **Novel as product design** — Artemis has no prior-art analysis done yet. Pi is the closest shipped example of a persistent conversational personal assistant. | **Low** | **Artemis Lens B:** Park for Artemis product-design phase. Not an APEX absorption. |

---

## 6. Bottom Line

**Disambiguation conclusion:** Given the company it keeps (AI/skills repos list), **earendil-works/pi** (open-source coding agent, MIT, TypeScript, 60k stars) is the primary intended match — it is a direct peer to Claude Code. **withpi (Pi Labs)** is a legitimate secondary find: an LLM eval SaaS with a Python SDK client. Both warrant coverage; Inflection Pi is prior-art only.

**APEX absorb (withpi):** Light — two bullets in `apex-ai-systems` eval section: (1) Pi Labs encoder-model scorer as fast deterministic alternative to LLM-as-judge, Promptfoo-compatible; (2) scoring-spec → optimizer-recompile loop. No new skill.

**APEX absorb (earendil-works/pi):** Note-only — flag SKILL.md format cross-compatibility in `apex-skill-author`. No spec changes.

**Artemis (Lens B):** Park Inflection Pi as product prior art for assistant design phase.

**Token-cost tag:** LOW for all absorptions.

**CLONED:** earendil-works/pi = yes (SHA `89a92207`, MIT, TypeScript). withpi = no (proprietary SaaS; PyPI package not downloadable from this machine; all withpi findings are SDK/docs-sourced).

---

## Sources

- https://github.com/earendil-works/pi — CLONED at `89a92207f1c9303d53d822fd9b0ac21578834cb4`
- `/tmp/pi-earendil/packages/coding-agent/README.md` — architecture, skills, extensions, philosophy (cloned file)
- `/tmp/pi-earendil/packages/coding-agent/docs/sdk.md` — SDK API (cloned file)
- `/tmp/pi-earendil/packages/coding-agent/CHANGELOG.md` — version history (cloned file)
- `/tmp/pi-earendil/packages/agent/src/` — agent-loop.ts, agent.ts, etc. (cloned directory listing)
- `/tmp/pi-earendil/LICENSE` — MIT confirmed (cloned file)
- https://pypi.org/project/withpi/1.67.0/ — withpi PyPI page (SDK/docs-sourced; page did not load directly, content from web search summary)
- https://news.ycombinator.com/item?id=43362535 — Pi Labs HN launch (SDK/docs-sourced)
- https://news.ycombinator.com/item?id=44061414 — Pi Co-pilot HN update (SDK/docs-sourced)
- https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/pi/ — Promptfoo Pi integration (SDK/docs-sourced)
- https://withpi.ai/solutions/evals — Pi Labs eval page (ECONNREFUSED; content from HN threads)
- https://pi.ai — Inflection Pi (consumer product)
