# Headroom — Compare-and-Absorb Research

## Identity

| Field | Value |
|-------|-------|
| URL | https://github.com/chopratejas/headroom |
| Commit SHA | 01fdedc |
| License | Apache 2.0 (`LICENSE`) |
| What it is | A context-compression layer for AI agents: compresses tool outputs, logs, RAG chunks, files, and conversation history before they reach the LLM. Ships as a Python/TS library, HTTP proxy, MCP server, and agent-wrap CLI. Claims 60–95% token reduction on real workloads. |
| Language | Python (834 .py files) + TypeScript SDK + Rust crates (proxy core) |
| CLONED | yes — `git clone --depth 1`, SHA `01fdedc` |

---

## Notable Mechanisms (all cited to cloned files)

### 1. ContentRouter + per-type compressors
**File:** `headroom/compression/universal.py` (lines 1–80)

`UniversalCompressor` uses Magika (ML-based content-type detector) to route each payload to the right handler, then applies:
- **SmartCrusher** — statistical selection on JSON arrays; keeps anomalies, errors, boundaries (README §How It Works)
- **CodeCompressor** — AST-aware via tree-sitter; preserves imports, signatures, types (README; `headroom/compression/handlers/code_handler.py`)
- **Kompress-base** — HuggingFace model for prose/log compression (README; `headroom/models/`)
- **Entropy mask** — high-entropy tokens (UUIDs, hex hashes) are flagged for preservation before compression (`headroom/compression/masks.py`)

### 2. CacheAligner (prefix stabilisation)
README and `llms.txt`: CacheAligner normalises prompt prefixes so provider KV-caches actually hit. This is the single idea APEX does not have at all in any form — provider-side cache stabilisation as a distinct pass upstream of compression.

### 3. CCR — Compress-Cache-Retrieve (reversible compression)
**Files:** `headroom/ccr/` directory; referenced in `headroom/compression/universal.py` (`ccr_enabled` config field)

Originals are cached locally in a TTL store. The LLM receives a compressed payload plus a `headroom_retrieve` tool call. If the model needs full detail it calls the tool; the original is returned on demand. Compression is therefore lossless from the model's perspective.

### 4. `headroom learn` — failure-mining → CLAUDE.md injection
**Files:** `headroom/learn/plugins/claude.py`, `headroom/learn/analyzer.py`, `headroom/learn/writer.py` (lines 182–226)

Reads `~/.claude/projects/` JSONL conversation logs, extracts error events, sends a digest to an LLM (via LiteLLM or Claude/Gemini CLI), gets structured `Recommendation` objects, then writes a marker-delimited block (bounded by `<!-- headroom:learn:start -->` / `<!-- headroom:learn:end -->`) into `CLAUDE.md` or `MEMORY.md`. The block is idempotent — re-running merges rather than appends.

Distinct from APEX's lean-prose discipline: this is automated, post-session, LLM-driven extraction of failure patterns → CLAUDE.md entries, not a manual guideline.

### 5. Cross-agent SharedContext + HierarchicalMemory
**Files:** `headroom/shared_context.py`, `headroom/memory/core.py`

SQLite + HNSW vector store with scoped memory (user → session → agent → turn). `SharedContext.put/get` lets Claude and Codex share compressed context without re-sending full transcripts. Requires a running Headroom process.

### 6. `headroom wrap claude` — transparent process interception
README §Agent compatibility matrix; `headroom/cli/`

Wraps the Claude Code process and inserts a proxy between it and the LLM provider. Zero code changes to CLAUDE.md or skills needed. Pre-compresses every outbound prompt and tool-result block. Works on Windows (README lists `x86_64-pc-windows-msvc` target triple; `headroom/lean_ctx/installer.py` lines 30–40).

### 7. MCP server integration
`llms.txt` and README §MCP: exposes `headroom_compress`, `headroom_retrieve`, `headroom_stats` as MCP tools. Any MCP client (Claude Code with MCP configured) gets compression as a first-class tool. Available without any changes to skills or CLAUDE.md.

### 8. `lean-ctx` third-party integration
**File:** `headroom/lean_ctx/__init__.py`

Headroom optionally downloads and manages a separate binary `lean-ctx` (https://github.com/yvgude/lean-ctx) for additional tool-output filtering at the agent's output boundary. This is a dependency on a third-party external binary, not part of headroom's own implementation.

---

## Candidate Table

| Candidate | Dedup vs APEX | Token-cost when used | Verdict | Rationale (with file cite) |
|-----------|--------------|---------------------|---------|---------------------------|
| **`headroom learn`** (failure-mining → CLAUDE.md) | Novel — APEX has no automated session-mining to CLAUDE.md | Low (one offline LLM call after session, not inline) | ADOPT-with-guardrails | Fills a real gap: APEX accrues MEMORY.md entries manually; `headroom learn` automates extraction of repeated failure patterns. Risk: it writes into CLAUDE.md autonomously — needs review gate before commit. Cite: `headroom/learn/writer.py` lines 182–226, `headroom/learn/plugins/claude.py`. |
| **CacheAligner (prefix stabilisation)** | Novel — APEX has no KV-cache prefix strategy | Zero (pure prompt-ordering, no tokens burned) | NOTE | The idea that prefix stability = provider cache hits is not captured anywhere in APEX docs. Worth documenting in `apex-context-budget` as a note: keep the always-loaded CLAUDE.md chain at the top of every prompt, never shuffle it. Headroom's implementation is code; the principle is adoptable as a prose rule. Cite: `headroom/compression/universal.py` config field `CacheAligner`; README §How it works. |
| **CCR reversible compression** | Novel concept, but requires running Headroom process | Zero-token (compression is offline; retrieval only when LLM calls tool) | NOTE | The *pattern* (compress aggressively; store originals locally; give the model a retrieval tool to fetch what it needs) is genuinely different from APEX's /compact strategy. However: APEX is a Markdown skill system — it doesn't own the prompt assembly layer. CCR requires code-level interception. Cannot be adopted as a skill. Worth noting the conceptual pattern: "dispatch returns ≤2k summary + retrieval pointer." APEX's ADR-015 dispatch return contract already approximates this. Tag: PARTIAL/already-have. Cite: `headroom/compression/universal.py` (`ccr_enabled`); `headroom/ccr/`. |
| **ContentRouter + ML compressors (SmartCrusher, CodeCompressor, Kompress)** | Novel implementation; APEX doesn't compress payloads at all | N/A — requires Headroom runtime | REJECT (for APEX) | APEX is a pure-Markdown skill system with no prompt-assembly code layer. It cannot intercept and compress tool outputs or RAG chunks. These compressors require `pip install headroom-ai` and code. Not adoptable as skills or CLAUDE.md rules. Cite: `headroom/compression/universal.py`; `plugins/openclaw/README.md`. |
| **MCP server (`headroom_compress` tool)** | Novel integration point | Low once installed; zero per-invocation tokens beyond normal tool use | ADOPT-with-guardrails | If APEX-built projects use MCP-enabled Claude Code sessions, wiring `headroom mcp install` into the project's `.claude/settings.json` would compress tool outputs with zero skill changes. But: Windows planning sessions are MCP-compatible; Mac/DeepSeek coding sessions need validation. The install is a one-command operation (`headroom mcp install`). Worth a CLAUDE.md note or a `apex-context-budget` callout. Cite: `llms.txt`; README §MCP server. |
| **`headroom wrap claude`** | Novel — APEX has no process-level proxy | Zero tokens (compression is transparent) | NOTE | Wrapping Claude Code with `headroom wrap claude` is the lowest-friction option for APEX's Windows planning sessions. No skill changes, no CLAUDE.md changes. The proxy compresses outbound prompts before they hit Anthropic. Main risk: adds a local process dependency; proxy must be running. Not something that goes in a skill — it's an operator-level setup step. Cite: README §Get started. |
| **SharedContext / HierarchicalMemory** | Partial — APEX has thin handoff docs + status.md for cross-session state | HIGH — requires SQLite + vector index + embedder process | REJECT | APEX's charter is no-runtime, Markdown-only. SharedContext requires a persistent process with a vector store. Even if the mechanism is interesting, it conflicts directly with APEX's zero-infra principle. The existing thin handoff doc + status.md "current state only" discipline covers the same intent at near-zero cost. Cite: `headroom/memory/core.py`; `headroom/shared_context.py`. |
| **`lean-ctx` binary integration** | Irrelevant — external binary, unrelated to APEX's domain | N/A | REJECT | Third-party binary dependency (`github.com/yvgude/lean-ctx`) with no documentation in this repo. No clear fit for a Markdown skill system. Cite: `headroom/lean_ctx/__init__.py`. |

---

## Can APEX Actually Use Headroom?

APEX is a **pure-Markdown skill system** with no runtime code, no Python environment, and no prompt-assembly layer it controls. Most of headroom's value — the compressors, CCR, SharedContext — lives at the runtime/infrastructure layer that APEX deliberately does not own.

**What APEX can use:**
1. **`headroom learn` as a personal workflow tool** (not a skill): Run `headroom learn` after long sessions to mine failure patterns and propose CLAUDE.md additions. Manually review before committing. This is the single highest-value idea that is both novel and actionable within APEX's constraints.
2. **CacheAligner principle as an `apex-context-budget` prose rule**: Add a note that the always-loaded CLAUDE.md chain should appear at the top of every prompt (before any dynamic context) to maximise KV-cache hit rate with Anthropic's prompt caching.
3. **MCP integration note in `apex-context-budget`**: For projects that run Claude Code with MCP enabled, `headroom mcp install` adds transparent compression with zero skill changes.
4. **`headroom wrap claude` as an operator setup note**: Worth a MEMORY.md entry or `apex-context-budget` callout — not a skill.

**What APEX cannot use:** everything requiring a running process (proxy, SharedContext, HierarchicalMemory, the ML compressors). APEX has no code layer to hook into.

---

## Bottom Line

Headroom is a real, well-engineered runtime tool — not a methodology. Six of eight candidates are REJECT or NOTE because APEX controls no runtime layer. The two adoptable ideas are:

1. **`headroom learn`** (ADOPT-with-guardrails): the only novel, APEX-compatible mechanism. Mine Claude Code sessions for failure patterns; auto-propose CLAUDE.md entries. Use as a personal workflow tool with a manual review gate, not an always-on background process.
2. **CacheAligner principle** (NOTE for `apex-context-budget`): prefix-stability → KV-cache hits is a zero-cost prose rule APEX doesn't currently state.

Everything else is either already-have (CCR ≈ ADR-015 dispatch contract), a token trap (SharedContext), or architecturally incompatible (ML compressors, lean-ctx).

---

## Alternates Noted

No credible alternate "headroom" repos found for LLM token reduction. Other GitHub repos named "headroom" are audio-dynamics tools, CSS scroll-offset utilities, or Prometheus monitoring — none related to LLM context compression.
