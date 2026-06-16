# Research synthesis — semantic memory / recall for APEX

**Date:** 2026-06-16 (planning session 46)
**Confidence:** HIGH (6 primary sources on the decisive question; tool-maturity numbers MEDIUM)
**Re-research after:** 2026-06-30 (AI/LLM tooling, 14-day clock)
**Feeds:** the apex-deep-dive on APEX's memory model (audit backlog #1, `agentic-os-video-audit.md`)

## Question
Should APEX add a semantic-recall memory layer (the video's "level 3"), or is the flat
`MEMORY.md` + handoff/ADR model correct? Three Phase-2 agents: WS-A `claude-mem` (the named tool),
WS-B framework landscape, WS-C the evidence. Full findings in `ws-a/b/c.md`.

## Recommendation — **flat-model-is-correct at current scale; full-adopt rejected; adopt-lite held behind a trigger**

The evidence is one-sided at APEX's scale. Semantic memory infra earns its cost **above ~50K tokens
of loaded context**; APEX's entire memory surface (MEMORY.md index ≈ 22 entries + the memory files)
is **~2–5K tokens — an order of magnitude under the threshold.** Adding a vector layer now solves a
problem APEX doesn't have, and the strongest counter-evidence shows generated/over-specified context
*actively hurting*. So: keep the flat model, define the trigger that would change the answer, and
keep `claude-mem` as the documented adopt-lite path for when (if) the trigger fires.

## Key findings

**The decisive evidence (WS-C — HIGH):**
- **Context-rot onset ≈ 50K tokens** for 200K-window models (~300–400K for 1M-window), no model
  immune. Mid-context relevant content → >30% accuracy drop. [VERIFIED — Liu et al. TACL 2024;
  Chroma Research Jul 2025]
- **Semantic memory often loses to simple RAG / is overkill** — LongMemEval (ICLR 2025): simple RAG
  76–79% beat complex semantic systems (ProMem 69.6%); authors call advanced architecture "overkill"
  for that benchmark. [VERIFIED]
- **The headline wins are disputed/overfit** — mem0's 94.4% is ~19.6pp above independent
  reproduction; MemPalace's 100% was overfitting (true 96.6%); Zep-vs-mem0 LoCoMo scores contested
  58–84%. [VERIFIED + COMMUNITY] Structured memory only reliably beats RAG (3.5–12.69%, BEAM) **at
  scale**, which APEX is nowhere near.
- **Counter-evidence — context infra can hurt:** ETH Zurich arXiv:2602.11988 (Feb 2026) — LLM-generated
  AGENTS.md/CLAUDE.md files *reduced* agent success ~3% and raised cost >20%; human-written added only
  +4%. Over-specification confuses agents. [VERIFIED]
- **The "6-level memory model" is creator framing, not a research taxonomy.** [VERIFIED — no academic source]

**The tool, if we ever adopt (WS-A — mechanism VERIFIED, maturity MEDIUM):**
- `claude-mem` (thedotmack, Apache 2.0): five CC lifecycle hooks capture tool calls → session-end AI
  compression → local **SQLite FTS5 + ChromaDB** with **local all-MiniLM-L6-v2 ONNX embeddings (no
  external embedding API)**. Injects at SessionStart + UserPromptSubmit. `mem-search` is just its MCP
  search tool, not a separate product.
- **Costs that matter for APEX:** a persistent background Bun worker (port 37777) must stay alive; **one
  Claude Agent SDK compression call per session end → hits the capped credit pool**, not the
  subscription (cf. memory `claude-agent-sdk-billing-split`); MCP tool defs always in context.
- ⚠️ **Maturity numbers unverified** — the 82,600-star / v13.6.1 figures came from a single WebFetch
  (clone was sandbox-blocked). Treat as indicative, re-verify before any adoption.

**Landscape (WS-B — MEDIUM):** mem0 (vector+graph, local via Ollama+Chroma, graph paywalled), Letta
(full agent runtime — too heavy, needs a sidecar), Graphiti/Zep (Neo4j/FalkorDB operational
dependency; Zep CE discontinued), LangMem (LangGraph lock-in), Anthropic Memory Stores (markdown
files, **no semantic retrieval**, cloud-only), claude-memory-compiler (hooks→markdown, batch, no
semantic search). Least-burden markdown-native options: claude-memory-compiler or Anthropic Memory
Stores; richest local retrieval: mem0-minimal or claude-mem.

## The trigger (when to revisit — converts "no" to "adopt-lite")
Re-open this decision when **any** holds:
1. Total memory that loads per session approaches **~25K tokens** (half the 50K onset — safety margin),
   OR MEMORY.md exceeds **~80–100 entries**.
2. "What did we decide about X weeks ago" becomes a **recurring** manual-grep pain over
   `docs/handoff/` + ADRs (i.e. keyword grep is failing on meaning).
3. The handoff/ADR corpus — not the flat memory — becomes the real recall bottleneck (it grows faster
   than MEMORY.md and is the more likely first mover).

If triggered, default adopt-lite = **claude-mem** (hooks-native, local embeddings, markdown-compatible),
with two pre-registered watch-items: the **credit-pool compression call** and the **always-on worker**.
Re-verify its maturity numbers first.

## Assumptions / gaps
- The ~50K onset is a frontier-model finding; DeepSeek-Flash (the coder) may differ — but planning
  recall runs on Opus, so the onset applies to the surface that loads MEMORY.md.
- No source gives a clean "flat is fine below N memories" number; the 50K-token onset is the
  defensible proxy, converted to ~25K/80–100-entries as the action trigger.

## Sources
WS-A `ws-a-claude-mem.md` · WS-B `ws-b-frameworks.md` · WS-C `ws-c-evidence.md` (6 primary: Liu TACL
2024; LongMemEval ICLR 2025; arXiv:2602.11988; arXiv:2510.27246; Chroma Jul 2025; arXiv:2601.12560).
