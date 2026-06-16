# Agent Memory Frameworks: Landscape Report
**Wave B — Framework Deep Dive**
**Date:** 2026-06-16
**Scope:** Semantic / long-term agent-memory frameworks evaluated for fitness with a markdown-first Claude Code system.

---

## Sources

All findings fetched live during this session. Confidence tags:
- [VERIFIED] — fetched directly from the project's own README, docs, or GitHub API
- [COMMUNITY] — from third-party comparison articles or community write-ups (may lag latest release)
- [ASSUMED] — inferred from architecture / no primary source found

Primary sources consulted:
- mem0 README via raw.githubusercontent.com
- graphiti README via raw.githubusercontent.com
- Anthropic Managed Agents memory docs via platform.claude.com/docs/en/managed-agents/memory
- GitHub search results for star counts (June 2026)
- atlan.com/know/best-ai-agent-memory-frameworks-2026/
- vectorize.io/articles/mem0-vs-letta
- tokenmix.ai/blog/ai-agent-memory-mem0-vs-letta-vs-memgpt-2026
- sureprompts.com/blog/letta-memgpt-walkthrough
- agentmarketcap.ai/blog/2026/04/10/agent-memory-vendor-landscape-2026-letta-zep-mem0-langmem
- dev.to/anajuliabit/mem0-vs-zep-vs-langmem-vs-memoclaw-ai-agent-memory-comparison-2026-1l1k
- aiagentmemory.org/articles/zep-memory-pricing/
- vectorize.io/articles/zep-alternatives
- github.com/coleam00/claude-memory-compiler

---

## Framework 1: mem0

**Repo:** https://github.com/mem0ai/mem0  
**Tagline:** "Universal memory layer for AI agents"

### Mechanism [VERIFIED from README]
Hybrid retrieval combining:
- Semantic vector search (embedding similarity)
- BM25 keyword matching
- Entity extraction and linking
- Temporal reasoning for time-aware retrieval

April 2026 algorithm update introduced "single-pass ADD-only extraction" with "multi-signal retrieval scored in parallel and fused." Three storage layers: vector store (semantic search), key-value (user preferences), knowledge graph (relational facts). Graph memory is a separate subsystem.

### Integration Cost

| Deployment | Requirements |
|-----------|-------------|
| Library (pip/npm) | Python or Node; connects to your own vector DB |
| Self-hosted server | Docker; own DB; adds dashboard + auth |
| Cloud (app.mem0.ai) | API key only; zero-infra |

Self-host is a real option — the library is Apache 2.0. For a markdown-first Claude Code setup, the minimal path is `pip install mem0ai` + an OpenAI-compatible embedding API + a vector store (Chroma, Qdrant, etc.). No mandatory Python runtime visible to the agent — the agent calls the mem0 Python/Node SDK from a sidecar process or hook. Fully local is possible if you use a local embedding model (e.g. via Ollama) + a local vector DB (Chroma), but this adds operational burden.

Graph memory (the richer feature) requires Neo4j or a compatible graph DB — more infra overhead.

### Pricing [COMMUNITY]
- Free tier: 10K memories, 1K retrieval calls/month (cloud)
- Starter: ~$19/month — 50K memories
- Pro: ~$249/month — includes graph memory and multi-hop queries
- Self-hosted: no licensing cost; you pay infra

**Catch:** Graph memory is paywalled at $249/month on cloud. Free tier is adequate for prototyping, not production.

### Maturity [COMMUNITY — star counts from web search, June 2026]
- Stars: ~55,700 (one source says 48K, another 55.7K — both plausible at different snapshot times)
- License: Apache 2.0 [VERIFIED from README]
- Funding: $24M Series A (October 2025) [COMMUNITY]
- Benchmark: 91.6 LoCoMo, 94.8 LongMemEval (self-reported) [VERIFIED from README]

### Honest Catch
- Graph memory requires Neo4j (heavy infra) and is cloud-paywalled
- Hallucination during extraction: if the LLM misclassifies content, wrong facts get stored as memories
- No built-in markdown-native storage — everything is abstracted behind the mem0 API; you don't write markdown, the system does
- Session-level memory and agent-level memory are separate concepts that require explicit configuration

---

## Framework 2: Letta (formerly MemGPT)

**Repo:** https://github.com/letta-ai/letta  
**Tagline:** "Platform for stateful agents: AI with advanced memory that can learn and self-improve over time"

### Mechanism [COMMUNITY — verified architecture description from multiple sources]
OS-inspired memory tier model:
- **Core memory (in-context, always live):** functions like RAM — always visible to the agent without a retrieval call. Structured as named blocks (e.g. "human", "persona") with character limits.
- **Archival memory (external vector store):** the agent issues explicit `archival_memory_search(query)` tool calls to retrieve semantically similar content
- **Recall memory (conversation history):** stored externally, searchable on demand with `conversation_search(query)`

The agent is an **active curator**: it decides what moves between tiers via explicit function calls (`core_memory_append`, `core_memory_replace`, `archival_memory_insert`). Memory persists across process restarts via a database (SQLite for local, PostgreSQL for production).

Unlike mem0/Zep (which abstract memory behind an API the agent passively uses), Letta agents are aware of their own memory architecture and manage it deliberately.

### Integration Cost [COMMUNITY]
- Self-hosted: Python service (`pip install letta`), runs a local server with REST API. SQLite for dev, PostgreSQL for production.
- Cloud: Letta API (managed, requires API key)
- Agent framework: Python-first; exposes REST API so other languages can call it
- Fully local: yes — SQLite + local embedding model. No cloud dependency for core function.
- Markdown-first fit: poor native fit; Letta is its own agent runtime, not a drop-in memory layer. Integrating with Claude Code would require running Letta as a sidecar service and calling it via hooks.

### Pricing [COMMUNITY]
- Open source (self-hosted): free, Apache 2.0
- Cloud: pricing not publicly listed (API key gated)

### Maturity [COMMUNITY]
- Stars: ~23,200 (June 2026 — includes MemGPT → Letta rename period)
- License: Apache 2.0
- Actively maintained; regular releases

### Honest Catch
- Not a drop-in memory layer — it is an entire agent runtime. Integrating it as a memory sidecar for Claude Code requires significant architecture work.
- Memory management function calls consume context tokens; for large archival stores, the retrieval latency and token cost add up.
- The agent-as-curator model means memory quality depends on the agent's judgment about what to store — which varies by task type.
- letta-code (a separate repo, a dedicated coding agent) exists but is not the same as using Letta as a memory layer for Claude Code.

---

## Framework 3: Graphiti (by Zep)

**Repo:** https://github.com/getzep/graphiti  
**Tagline:** "Build Real-Time Knowledge Graphs for AI Agents"

### Mechanism [VERIFIED from README]
Hybrid retrieval combining:
- Semantic embeddings (vector similarity)
- BM25 keyword matching
- Graph traversal (knowledge graph relationships)

Data is stored as a temporal knowledge graph. Episodes (conversations, events, text) are ingested and decomposed into entities and relationships. The graph captures temporal context — facts can have valid-from/valid-to windows, enabling time-aware queries. Retrieval is "low-latency, high-precision" by combining all three signals.

Graphiti is the **open-source engine** that powers Zep's managed service. Zep Community Edition (self-hosted) has been discontinued; Graphiti is the self-hosted path.

### Integration Cost [VERIFIED from README]
- Self-hosted only — Graphiti is Python, runs as a service
- Requires: Neo4j or FalkorDB (graph database); OpenAI-compatible embedding API; Python runtime
- Kuzu support is deprecated (upstream project unmaintained) — use Neo4j or FalkorDB [VERIFIED from README]
- Zep managed cloud: requires API key, credit-based pricing
- Fully local: possible with local embeddings (Ollama) but Neo4j/FalkorDB still required — not trivial

### Pricing

**Graphiti (OSS):** Free, Apache 2.0 [COMMUNITY — license confirmed via GitHub search]  
**Zep Cloud (managed):** [VERIFIED via web search citing live pricing page]
- Free tier: 1,000 credits/month (adequate for API testing only)
- Zep Flex: ~$125/month for 50,000 credits (credit-based — every add/search/episode consumes credits)
- BYOK (bring your own keys) and BYOC (deployed in your VPC) tiers exist
- No intermediate tier between free (1K) and $125 — a meaningful gap

Zep Community Edition (self-hosted packaged product) is **gone** as of 2026. Self-hosting = running Graphiti directly.

### Maturity [COMMUNITY — June 2026 web search]
- Graphiti stars: ~26,800 | forks: ~2,719 | last push: June 9, 2026
- Zep (main repo): older, being superseded by Graphiti
- License: Apache 2.0
- Actively maintained; Python-based

### Honest Catch
- Requires Neo4j or FalkorDB — non-trivial operational dependency; Neo4j needs JVM or Docker
- LLM dependency for extraction: "Graphiti works best with LLM services that support Structured Output...Using other services may result in incorrect output schemas and ingestion failures" [VERIFIED from README]
- Small model unreliability: "very small models frequently emit JSON that doesn't match the requested schema, which surfaces as extraction failures" [VERIFIED from README]
- Rate limiting: concurrency kept low by default to avoid provider 429 errors [VERIFIED from README]
- Knowledge graph approach is architecturally richer than pure vector RAG, but the operational complexity is proportionally higher
- Zep cloud pricing model (credit consumption per operation) makes costs hard to predict

---

## Framework 4: LangMem (by LangChain)

**Repo:** https://github.com/langchain-ai/langmem  
**Tagline:** Long-term memory SDK for LangGraph agents

### Mechanism [COMMUNITY]
Extracts structured facts from conversations and stores them in a configurable memory store (typically a vector store via LangGraph's storage layer). Two modes:
- **In-the-hot-path:** memories extracted and stored synchronously during conversation
- **Background:** a "dreaming" step processes conversation history asynchronously

Also includes a unique **prompt optimization** feature: periodically analyzes past interactions and proposes improvements to the agent's system prompt — a form of meta-learning.

Retrieval: vector similarity search (no graph traversal). LangGraph store handles persistence; any LangGraph-compatible backend works (in-memory, Postgres with pgvector, etc.).

### Integration Cost [COMMUNITY]
- Python package: `pip install langmem`
- Tightly coupled to LangGraph — not easily portable to non-LangChain agent stacks
- For Claude Code: would require a Python sidecar and a LangGraph runtime; not a natural fit
- Fully local: yes, if using an in-memory store or local Postgres

### Pricing [COMMUNITY]
- Open source; MIT license [COMMUNITY]
- LangGraph Cloud (managed) adds cost if you use the hosted platform

### Maturity [COMMUNITY — June 2026 web search]
- Stars: ~1,400
- License: MIT
- Actively developed by LangChain team

### Honest Catch
- LangGraph lock-in: if you switch agent frameworks, LangMem's storage integration comes with friction
- No knowledge graph support — pure vector retrieval
- 1,400 stars is relatively low compared to mem0/Graphiti — smaller community, fewer battle-tested production deployments
- Prompt optimization feature is novel but unproven at scale

---

## Framework 5: Anthropic Managed Agents Memory Stores

**Docs:** https://platform.claude.com/docs/en/managed-agents/memory  
**Tagline:** "Persistent memory that survives across sessions" — built into the Managed Agents API

### Mechanism [VERIFIED from official docs]
Not a semantic retrieval system — a **filesystem-mounted document store**. Each memory is a text file (up to 100 kB / ~25K tokens). The store is mounted as a directory under `/mnt/memory/` inside each session sandbox. The agent reads and writes it with the same file tools it uses for the rest of the filesystem.

No embedding, no vector search, no graph traversal — retrieval is **direct file reads and directory listings**. The agent decides what to read based on the path structure and the store description injected into the system prompt.

This is structurally identical to APEX's current CLAUDE.md + MEMORY.md approach, but managed and versioned via Anthropic's API.

Key limits [VERIFIED]:
- Max 2,000 memories per store
- Max 100 kB per memory (~25K tokens)
- Max 8 stores per session
- Memory versions retained 30 days (immutable audit trail)
- Optimistic concurrency via `content_sha256` precondition
- `read_only` vs `read_write` access modes per store

### Integration Cost [VERIFIED]
- Requires: Anthropic API key with `managed-agents-2026-04-01` beta header
- Cloud-only: no self-hosted option — this is Anthropic's managed infrastructure
- Markdown-first fit: **excellent** — memories are plain text files, can be `.md`, agent reads/writes them as regular files
- No Python runtime, no vector DB, no graph DB required
- Integration: API call at session creation to attach stores; agent handles the rest

### Pricing [ASSUMED — not disclosed in docs]
Pricing is bundled with Managed Agents API usage (not separately documented). Assumed to be included in API token costs; memory store operations not explicitly priced in the beta docs.

### Maturity [VERIFIED from docs]
- Beta as of June 2026 (`managed-agents-2026-04-01` beta header required)
- Officially Anthropic-supported; full SDK support across Python, TypeScript, Go, Java, C#, PHP, Ruby

### Honest Catch
- Cloud-only: zero local/self-hosted option — data lives on Anthropic's infrastructure
- Beta: API surface may change
- No semantic retrieval — the agent must know what file to read (path-based access). Works well when memory is small and well-structured; degrades as the store grows beyond what the agent can scan
- 2,000-memory limit per store is a hard ceiling; at scale you need multiple stores
- No cross-user or cross-project memory without explicit store management
- Prompt injection risk: if the agent processes untrusted input and has read-write access, a successful injection could corrupt the memory store — docs explicitly warn about this

---

## Framework 6: Markdown-RAG / claude-memory-compiler (Community Pattern)

**Repo:** https://github.com/coleam00/claude-memory-compiler  
**Tagline:** "Give Claude Code a memory that evolves with your codebase"

### Mechanism [VERIFIED from GitHub search + description]
No separate memory service. Works entirely within Claude Code's hook system:
1. Claude Code session transcript hooks capture session events
2. Claude Agent SDK extracts key decisions, patterns, and lessons from transcripts
3. An "LLM compiler" (another Claude call) organizes extractions into structured, cross-referenced knowledge articles in markdown
4. After 6 PM local time, the next session flush triggers compilation of that day's logs
5. Future sessions load the compiled articles as context (via CLAUDE.md / memory files)

Inspired by Karpathy's LLM Knowledge Base architecture. Retrieval is non-semantic: the agent reads the markdown articles directly (no vector search).

### Integration Cost [COMMUNITY]
- Zero external services — runs entirely within Claude Code hooks + Claude API calls
- Requires: Claude Code with hooks configured; Anthropic API key (already present in any CC session)
- Fully local: yes, if you count "local files" as local — the compilation step calls Anthropic's API, but there is no external database
- Markdown-first fit: **excellent** — the entire output is markdown files

### Pricing [COMMUNITY]
- Open source (GitHub)
- Cost = Claude API token usage for the compilation step (a periodic background call)

### Maturity [COMMUNITY — June 2026]
- Stars: ~868 (released April 6, 2026 — gained 237 stars on day one)
- Small community project; single maintainer
- License: not prominently listed in search results [ASSUMED — check repo]

### Honest Catch
- Small project, single maintainer — no production SLA
- Compilation is a periodic batch process (end-of-day); real-time recall not supported
- Quality of extracted knowledge articles depends entirely on the LLM compiler's judgment
- As article count grows, loading all articles into context becomes expensive — the same RAG-overflow problem as any growing markdown store
- Not a semantic recall system — if the agent doesn't know which article to read, it reads everything (context cost) or nothing (recall failure)
- A blog post from April 2026 ("Claude Code's memory tool ecosystem is mostly redundant with its own defaults") argues CC's native CLAUDE.md + auto-memory already covers this space for typical project scale

---

## Comparison Table

| Framework | Mechanism | Self-host? | Fully local? | Markdown-first fit | Stars (Jun 2026) | License | Operational burden |
|-----------|-----------|-----------|--------------|-------------------|-----------------|---------|-------------------|
| **mem0** | Vector + BM25 + KV + Graph (hybrid) | Yes (OSS) | Yes (with local embedding + Chroma) | Poor — API abstraction layer | ~55,700 | Apache 2.0 | Medium (vector DB; graph adds Neo4j) |
| **Letta** | In-context tiers + vector archival (agent-curated) | Yes | Yes (SQLite) | Poor — full agent runtime, not a layer | ~23,200 | Apache 2.0 | High (runs a server process) |
| **Graphiti / Zep** | Knowledge graph + vector + BM25 (hybrid) | Graphiti yes; Zep cloud-only | Graphiti yes (Neo4j/FalkorDB required) | Poor — no markdown storage | ~26,800 | Apache 2.0 | High (Neo4j/FalkorDB + Python service) |
| **LangMem** | Vector extraction + prompt optimization | Yes (via LangGraph store) | Yes (in-memory or local Postgres) | Poor — LangGraph-coupled | ~1,400 | MIT | Medium (LangGraph runtime required) |
| **Anthropic Memory Stores** | Filesystem-mounted markdown files (no semantic retrieval) | No (cloud-only) | No | Excellent — native markdown, path-based | N/A (official API) | Proprietary | Zero (managed by Anthropic) |
| **claude-memory-compiler** | Hook-driven LLM extraction → markdown articles | Yes (hooks + files) | Yes (API calls only) | Excellent — pure markdown | ~868 | Unlisted | Low (periodic background LLM call) |

---

## Key Finding: Fully Local, Least Operational Burden

For a markdown-first Claude Code system that wants the least operational burden and can run fully locally:

**1. claude-memory-compiler** — zero external services, pure markdown output, hooks-native to Claude Code. Catches: small community, batch-only (not real-time), quality depends on LLM compiler, single maintainer.

**2. Anthropic Memory Stores (Managed Agents API)** — zero operational burden, native markdown files, first-party support. Catch: cloud-only (data leaves your machine), beta API surface, no semantic retrieval.

**3. mem0 (self-hosted, minimal config)** — can run with local embeddings (Ollama) + Chroma. More operational overhead than the above two, but the richest retrieval semantics. Graph memory requires Neo4j and is practically cloud-paywalled for the managed version.

**Frameworks to avoid for this use case:**
- **Letta** — a full agent runtime, not a memory layer. Requires significant integration work.
- **Graphiti** — architecturally excellent but Neo4j/FalkorDB dependency is heavy; not zero-ops.
- **LangMem** — LangGraph lock-in; small community; no graph support.

---

## Supplementary Note: APEX's Current Approach vs These Frameworks

APEX already uses a variant of the markdown-RAG pattern natively:
- `~/.claude/projects/.../memory/MEMORY.md` — index pointing to topic files
- Topic-specific `.md` files owned and written by Claude Code
- Loaded at session start via the CLAUDE.md system

This is architecturally equivalent to the claude-memory-compiler's output format and to Anthropic Memory Stores (filesystem-mounted `.md` files). The key gap vs vector-based systems (mem0/Graphiti) is that APEX's recall is non-semantic — the agent must know what to look for. This works well while the memory set is small and structured. As it grows past ~50–100 distinct topics, loading all files at session start becomes expensive and semantic retrieval would add value.

The Anthropic Memory Stores API is the most natural upgrade path: it preserves the markdown-file model, adds versioning and audit trails, and requires no new infrastructure — only an API call at session creation.
