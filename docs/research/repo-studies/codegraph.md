# CodeGraph — Compare-and-Absorb Study

> **CLONED: YES** — two repos cloned and verified. All findings cite real file paths from cloned source.
> First-pass results were discarded; this is ground-truth only.

---

## Discovery: Two Distinct Repos

Search resolved two plausible repos. Both were cloned.

### Primary (Repo A): colbymchenry/codegraph

| Field | Value |
|-------|-------|
| URL | https://github.com/colbymchenry/codegraph |
| Commit SHA | `bfa84d3` |
| License | MIT (`LICENSE` root) |
| Language | TypeScript / Node.js |
| What it is | Local-first CLI + MCP server: parses codebases with tree-sitter, stores symbols/edges/files in SQLite (FTS5), exposes a knowledge graph to AI agents over MCP. Self-described as "~16% cheaper · ~58% fewer tool calls · 100% local." |

### Secondary (Repo B): codegraph-ai/CodeGraph

| Field | Value |
|-------|-------|
| URL | https://github.com/codegraph-ai/CodeGraph |
| Commit SHA | `5837e84` |
| License | Apache-2.0 (`LICENSE` root) |
| Language | Rust (workspace with 27 language-parser crates) |
| What it is | Rust library + MCP server: 45 MCP tools, 37 languages via tree-sitter, persistent memory layer (BM25 + semantic via ONNX), VS Code extension, pre-edit Claude Code hooks. Graph engine uses RocksDB for persistence. |

**Primary focus for this study is Repo A** (colbymchenry/codegraph) — directly targets Claude Code, actively benchmarked against it, and dominated search results for "codegraph MCP Claude Code." Repo B mechanisms are noted where they add novel signal.

---

## Identity (Repo A in depth)

**colbymchenry/codegraph** v0.9.9 (`package.json`):

Pipeline (`src/CLAUDE.md` lines 38–46):
```
files → ExtractionOrchestrator (tree-sitter) → DB (nodes/edges/files)
       → ReferenceResolver (imports, name-matching, framework patterns)
       → GraphQueryManager / GraphTraverser (callers, callees, impact)
       → ContextBuilder (markdown/JSON for AI consumption)
```

Storage: SQLite with FTS5 (`src/db/schema.sql`). Four core tables — `nodes`, `edges`, `files`, `unresolved_refs` — with FTS5 virtual table on `nodes` (name + qualified_name + docstring + signature), maintained by INSERT/DELETE/UPDATE triggers. All within `.codegraph/` per project.

Primary MCP tool: `codegraph_explore` (`src/mcp/tools.ts` line 493) — intent-aware, adaptive token budgeting, skeletonizes off-spine symbols to signatures while expanding on-spine to full source, returns verbatim source grouped by file in one call. Server instructions injected at MCP initialize (`src/mcp/server-instructions.ts`).

Supporting tools: `codegraph_search`, `codegraph_callers`, `codegraph_callees`, `codegraph_impact`, `codegraph_node`, `codegraph_files`, `codegraph_status`.

**Benchmarks** (`README.md` lines 105–194, methodology: Claude Opus 4.8 headless, 4 runs/arm, median, re-validated 2026-06-02 by repo author — self-reported, not independently audited):

| Codebase | Language | Cost | Tokens | Tool calls |
|----------|----------|------|--------|------------|
| VS Code (~10k files) | TypeScript | 18% cheaper | 64% fewer | 81% fewer |
| Django (~3k) | Python | 8% cheaper | 60% fewer | 77% fewer |
| Alamofire (~110) | Swift | 40% cheaper | 64% fewer | 58% fewer |
| **Average** | — | 16% cheaper | 47% fewer | 58% fewer |

---

## Notable Mechanisms (each citing a file)

### 1. AST-deterministic graph (no LLM summarization)
`src/CLAUDE.md` line 7: "Extraction is deterministic — derived from AST, not LLM-summarized." `src/db/schema.sql` lines 19–55: `nodes` stores `kind`, `name`, `qualified_name`, `file_path`, `language`, `start_line`, `end_line`, `signature`, `visibility`, decorators, type_parameters — all AST-derived. `edges` has `kind` and `provenance` columns.

### 2. Hybrid FTS5 + graph traversal
`src/db/schema.sql` lines 97–123: FTS5 virtual table `nodes_fts` trigger-synced on name/qualified_name/docstring/signature. `src/graph/queries.ts` lines 1–60: `GraphQueryManager` combines `QueryBuilder` (FTS5 prepared statements) with `GraphTraverser` (BFS/DFS). Repo A has no vector/embedding layer — pure keyword + graph traversal.

### 3. Adaptive token-budget explore
`src/mcp/tools.ts` lines 78–91, 2146–2154: `codegraph_explore` skeletonizes "off-spine" members to signatures, expands "on-spine" to full source, caps total output (MAX_OUTPUT_LENGTH = 15,000 chars, line 34), and steers agent away from re-reading with inline hints ("do NOT Read," "Reserve Read for a single specific line range explore can't surface").

### 4. Blast-radius impact analysis
`src/mcp/tools.ts` lines 1421–1453: compact blast radius computed from entry symbols — finds callers transitively, flags unique ones. Exposed as `codegraph_impact`. `src/mcp/server-instructions.ts` line 53: "Refactor planning: `codegraph_search` → `codegraph_callers` → `codegraph_impact`. The blast-radius answer comes from impact, not from walking callers manually."

### 5. Framework-aware reference resolution
`src/CLAUDE.md` line 55: `ReferenceResolver` covers Express, Laravel, Rails, FastAPI, Django, Flask, Spring, Gin, Axum, ASP.NET, Vapor, React Router, SvelteKit, Vue/Nuxt, Cargo workspaces — emits `route` nodes and `references` edges, completing call graphs across framework dispatch boundaries that static AST alone misses.

### 6. Pre-edit PreToolUse hook (Repo B)
`mcp-package/hooks/codegraph-pre-edit.sh` lines 1–114 (Repo B): Claude Code `PreToolUse` hook fires on Edit/Write/MultiEdit. If workspace has `.codegraph/`, emits advisory `additionalContext` nudging Claude to call `codegraph_get_edit_context` (callers + callees + related symbols) and `codegraph_analyze_impact` before the edit. Non-blocking (`permissionDecision: "allow"`). Novel: advisory injection vs gating.

### 7. Persistent memory + semantic search (Repo B)
`README.md` (Repo B) lines 168–177: 7 `memory_*` tools — store/retrieve/search notes across sessions using BM25 + ONNX semantic (`bge-small` 384d default, `jina-code-v2` 768d, `granite-97m` 384d/32K ctx). `--graph-only` flag skips ONNX for CI (10–50x faster indexing).

---

## Candidate Table

| Candidate | Lens | Dedup vs APEX | Token-cost | Verdict |
|-----------|------|---------------|------------|---------|
| **codegraph_explore — single-call source retrieval** | A (APEX skills) | Novel — apex-search uses RRF retrieval but has no graph-backed symbol traversal. gsd-map-codebase does whole-repo scan (one-time batch, LLM narrative output), not per-query graph lookup. No APEX skill does "find and return verbatim source of related symbols in one graph call." | Low (per-query SQLite lookup) | **ABSORB** — pattern: front-load discovery offline, query at session-start. Applicable to how apex-code and gsd-map-codebase orient agents in unfamiliar codebases. Key cite: `src/mcp/tools.ts` line 493, `src/mcp/server-instructions.ts` line 41. |
| **codegraph_impact — machine-computed blast radius** | A (APEX skills) | Partial — apex-code has "surgical scope lock" (Files to Change declared in spec). That is human-declared scope; this is machine-computed from the call graph. Different: scope lock is a guardrail, impact analysis is discovery. | Low (graph BFS on indexed data) | **ABSORB** — pattern: compute what would break before confirming scope, not just after. Relevant to apex-code's pre-flight. Cite: `src/mcp/tools.ts` lines 1421–1453. |
| **Pre-edit advisory hook (Repo B)** | A (APEX skills) | Partial — APEX has a PreToolUse write-guard (ADR-009, blocking). Repo B's hook injects additionalContext (advisory, non-blocking). Different intent and mechanism. | Low | **ABSORB (pattern only)** — advisory `additionalContext` injection before a source edit is a Claude Code hook pattern APEX doesn't currently use. Could inform an apex-code hook variant that surfaces context without blocking. Cite: `mcp-package/hooks/codegraph-pre-edit.sh` lines 99–103. |
| **Persistent ONNX-local memory layer (Repo B)** | B (Artemis) | Novel for Artemis — Artemis is building a RAG-heavy second brain. Repo B's session-scoped memory (BM25 + ONNX, no API calls) is a concrete design comparator. Differs in scope (code-scoped vs general knowledge). | Med (ONNX model load at startup; sub-ms per query after) | **ABSORB** — Artemis's knowledge core faces the same hybrid BM25+semantic design decisions. The `bge-small` ONNX local approach and the `--graph-only` fast-path (skip embeddings for structural queries) are concrete staging patterns. Cite: `README.md` (Repo B) lines 80–84. |
| **Headless benchmark methodology** | A (APEX skills) | Novel — APEX has no formal skill-evaluation framework with token/cost metrics. The Iron Law is structural but not quantitative. | Low | **ABSORB** — `claude -p --strict-mcp-config` WITH/WITHOUT MCP, 4 runs/arm, median, `total_cost_usd` + token + tool-call counts is the clearest published methodology for measuring MCP tool impact. Relevant for apex-skill-author Iron Law extension. Cite: `README.md` lines 196–215. |
| **Whole-repo SQLite index (gsd-map-codebase overlap)** | A (APEX skills) | Dedup-hard — gsd-map-codebase already addresses brownfield orientation (parallel agents → `.planning/codebase/*.md`). Same goal, different mechanism (queryable index vs one-shot narrative). | Med (index build for large repos) | **ALREADY-HAVE (different mechanism)** — not worth displacing gsd-map-codebase; note as complementary. The index is machine-queryable; the map is human-readable. |
| **Framework route-node emission** | A (APEX skills) | Novel concept, but too implementation-specific for a Markdown skill system. | Low | **NOTE ONLY** — useful design vocabulary for apex-architecture ADRs but not directly absorbable into APEX's skills layer. |

---

## Bottom Line

**colbymchenry/codegraph** is a production-grade MCP server that front-loads codebase discovery into an offline AST parse, then serves it at near-zero token cost per query. It is benchmarked (self-reported) against Claude Opus 4.8 on 2026-06-02 and shows real reductions in tool calls and tokens.

**For APEX (Lens A):** Highest-value absorb is the pattern, not the tool: pre-index symbols + edges offline → serve via MCP → replace grep/Read discovery loops. This should inform apex-code guidance (orient via pre-built index before editing). The blast-radius-before-edit pattern is directly applicable to apex-code's scope discipline. The headless benchmark methodology is worth absorbing into the Iron Law. **Practical recommendation:** install codegraph on the Mac Mini build machine (where DeepSeek runs) for any project with > ~50 files.

**For Artemis (Lens B):** Repo B's hybrid BM25+ONNX memory layer (`bge-small`, local, no API cost) is a concrete design comparator for Artemis's knowledge core. The `--graph-only` fast-path (skip embeddings for structural queries) is a useful staging pattern for Artemis's build phases.

**Token-cost:** Index build is Med-cost (one-time, tree-sitter parse of all files). Per-query cost is Low. Not a HIGH token trap — the expensive step is offline setup, not per-agent-call. Flag: if `codegraph_explore` responses are large (up to 15k chars), they cost tokens at query time — but this replaces multiple grep/Read calls, so the net is still lower.

---

## Alternatives Noted (not cloned)

- `Jakedismo/codegraph-rust`: 100% Rust, SurrealDB backend, MCP. URL: https://github.com/Jakedismo/codegraph-rust
- `Abhishek-Aditya-bs/CodeGraph`: Python/Neo4j + Streamlit, GraphRAG + vector embeddings. URL: https://github.com/Abhishek-Aditya-bs/CodeGraph
- `FalkorDB/code-graph`: FalkorDB-backed GraphRAG-SDK demo. URL: https://github.com/FalkorDB/code-graph

None matched the Claude Code MCP focus of the primary repo.
