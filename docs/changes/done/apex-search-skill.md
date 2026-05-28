## Intent

apex-search guides search implementation covering both traditional full-text search and
semantic/vector search for RAG pipelines. Primary stack: PostgreSQL full-text search +
pgvector (no extra infra, same DB you already have). Optional upgrade: Typesense for
typo-tolerant full-text with facets and autocomplete. RAG integration: embedding generation
(Ollama for local/private, OpenAI as fallback), chunking strategies, hybrid search
(full-text + vector combined via RRF reranking). Designed to serve as the retrieval
engine for an AI brain — feeds relevant context chunks to the LLM layer (apex-ai-systems).
Distinct from apex-data (schema/migrations) and apex-ai-systems (LLM orchestration) —
this skill answers: "how do I find the right data to answer a query?"

## Research tasks (DeepSeek executes FIRST before writing any skill content)

Before writing SKILL.md or impl.md, research and verify the following. Tag findings
[VERIFIED], [ASSUMED], or [COMMUNITY]. Update examples and recommendations based on findings.

1. **pgvector current version and index types** — verify current stable version, whether
   HNSW index is stable and recommended over IVFFlat, and the SQL syntax for creating
   HNSW index on a vector column. Check github.com/pgvector/pgvector.

2. **Prisma + pgvector** — verify whether Prisma supports a native `vector` field type or
   requires `unsupported()` + raw SQL for vector columns and similarity queries.
   Check github.com/pgvector/pgvector and Prisma docs for `Unsupported` type patterns.

3. **Ollama embedding models** — verify current recommended embedding models for RAG
   on a local Mac Mini: `nomic-embed-text`, `mxbai-embed-large`, `all-minilm`. Compare
   dimension sizes and quality. Check ollama.com/library.

4. **OpenAI embedding models** — verify current models (`text-embedding-3-small` vs
   `text-embedding-3-large`), dimensions (1536 vs 3072), and cost per token.
   Check platform.openai.com/docs/guides/embeddings.

5. **Hybrid search RRF pattern with pgvector** — verify current best practice for
   combining full-text search (`ts_rank`) and vector similarity search in a single
   PostgreSQL query using Reciprocal Rank Fusion. Search for "pgvector hybrid search RRF
   PostgreSQL 2024/2025".

6. **Typesense current version and Node.js client** — verify current stable version,
   `typesense` npm package name and version, and whether it runs well on Mac Mini ARM
   (Apple Silicon). Check typesense.org/docs.

7. **LangChain vs direct pgvector for RAG** — verify whether using LangChain.js /
   LlamaIndex.ts adds value over direct pgvector queries for a personal AI brain project,
   or if direct queries are simpler and more maintainable. Community consensus 2025.

Write a ## Research findings section at the top of the output SKILL.md summarising each
item in one line. Use findings to update index recommendations, embedding dimensions,
and code examples.

## Key decisions

### SKILL.md content

**When to activate — trigger phrases:**
- "search" / "full-text search" / "find relevant"
- "vector search" / "semantic search" / "similarity search"
- "RAG" / "retrieval" / "embeddings" / "pgvector"
- "AI brain retrieval" / "search my data" / "find documents"
- "autocomplete" / "faceted search" / "typo-tolerant"
- "Typesense" / "Algolia" / "Elasticsearch"
- "chunking" / "chunk documents" / "embedding pipeline"

**5 questions to ask before designing:**
1. What data is being searched? (user notes, transactions, messages, documents, sensor history)
2. Query type? (keyword exact match / typo-tolerant / semantic meaning / hybrid)
3. Is this feeding an AI/LLM? (yes → vector search + chunking required)
4. Privacy requirement? (local embeddings via Ollama vs OpenAI API)
5. Scale? (< 1M chunks → pgvector fine; > 1M → consider dedicated search engine)

**Search type decision table:**

| Use case | Approach | Stack |
|----------|----------|-------|
| Find exact keywords, moderate scale | PostgreSQL FTS | `tsvector` + `GIN` index |
| Typo-tolerant, facets, autocomplete | Typesense | Self-hosted, Docker |
| Semantic / meaning-based search | pgvector + embeddings | pgvector `HNSW` index |
| AI brain retrieval (RAG) | Hybrid: FTS + vector + RRF | pgvector + `ts_rank` + RRF |
| Hosted, no infra | Algolia | Paid, excellent DX |

**Primary recommendation for this project: PostgreSQL hybrid search**
- pgvector: already in your DB, zero extra infra, HNSW index handles millions of vectors
- PostgreSQL FTS: same DB, `tsvector` columns, GIN indexes
- Hybrid RRF: combines both scores, better retrieval quality than either alone
- Typesense: opt-in if full-text quality (typo tolerance, facets) becomes a priority

**Embedding provider decision table:**

| Provider | Model | Dimensions | Privacy | Cost |
|----------|-------|-----------|---------|------|
| Ollama (local) | nomic-embed-text | 768 | ✅ fully local | Free |
| Ollama (local) | mxbai-embed-large | 1024 | ✅ fully local | Free |
| OpenAI | text-embedding-3-small | 1536 | ❌ leaves device | ~$0.02/1M tokens |
| OpenAI | text-embedding-3-large | 3072 | ❌ leaves device | ~$0.13/1M tokens |

**Recommendation for Mac Mini / personal AI brain**: Ollama local embeddings (privacy, no cost).
OpenAI as opt-in for higher quality when needed.

**DB schema for RAG (write as SQL + explanation):**
```sql
-- Source documents (one row per ingested item)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,        -- 'note', 'telegram', 'finance', 'home_sensor'
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- arbitrary source-specific fields
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chunks (split documents before embedding)
CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INT NOT NULL,
  -- FTS column (update via trigger or on insert)
  fts_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  -- Vector column (dimension matches your embedding model)
  embedding VECTOR(768),       -- 768 for nomic-embed-text; update if model changes
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX chunks_fts_idx ON chunks USING GIN(fts_vector);
CREATE INDEX chunks_embedding_idx ON chunks USING HNSW(embedding vector_cosine_ops);
```

**Chunking strategies (explain all three in SKILL.md):**

| Strategy | When to use | Chunk size |
|----------|------------|------------|
| Fixed-size with overlap | General purpose, consistent data | 512 tokens, 50 token overlap |
| Sentence/paragraph boundary | Natural language (notes, messages) | Variable, split at `\n\n` or `.` |
| Document-level | Short documents (< 512 tokens) | No chunking needed |

Overlap rule: always overlap adjacent chunks by 10-15% to avoid cutting context at boundaries.

**Hybrid search flow (RRF — Reciprocal Rank Fusion):**
1. Run PostgreSQL FTS query → get ranked list of chunk IDs (by `ts_rank`)
2. Run pgvector similarity query → get ranked list of chunk IDs (by cosine distance)
3. Apply RRF formula: `score = 1/(k + rank_fts) + 1/(k + rank_vector)` where `k=60`
4. Sort by combined RRF score → return top N chunks
5. Inject top chunks into LLM context window (apex-ai-systems handles this step)

**RAG retrieval → LLM handoff:**
apex-search returns: `{ chunks: Array<{ content, source, score }>, query }`
apex-ai-systems receives this and injects into prompt:

```
You have access to the following relevant context:
<context>
[chunk 1 content] (source: finance, score: 0.92)
[chunk 2 content] (source: telegram, score: 0.87)
</context>
Answer the user's question using this context where relevant.
```

**Hard blocks:**
- Never store embeddings as JSON arrays — use pgvector's `VECTOR` type for indexed similarity search
- Never run similarity search without an index (HNSW or IVFFlat) on tables > 10k rows
- Never embed full documents without chunking first — exceeds context window and degrades quality
- Never expose raw embedding vectors in API responses
- Never re-embed unchanged content — check content hash before calling embedding API

**Review checklist:**
- [ ] `chunks` table has both `HNSW` index (vector) and `GIN` index (FTS)
- [ ] Embedding dimensions match the model being used (768 / 1024 / 1536 / 3072)
- [ ] Chunking splits on semantic boundaries, not arbitrary byte offsets
- [ ] Overlap applied between adjacent chunks
- [ ] Content hash stored to avoid re-embedding unchanged documents
- [ ] Hybrid RRF implemented — not relying on vector alone
- [ ] Retrieved chunks trimmed to fit LLM context window before injection

**Frontmatter for SKILL.md (update from research):**
```yaml
skill: apex-search
backend: claude
version: 1.0.0
last_updated: 2026-05-28
sources:
  - pgvector — github.com/pgvector/pgvector
  - Ollama — ollama.com/library
  - OpenAI Embeddings — platform.openai.com/docs/guides/embeddings
  - Typesense Docs — typesense.org/docs
  - PostgreSQL FTS — postgresql.org/docs/current/textsearch.html
staleness_threshold: 30d
```

---

### impl.md content

**NEVER do:**
- Store embedding vectors as `float[]` or JSON — use `VECTOR(n)` type (requires pgvector extension)
- Run `ORDER BY embedding <-> $1 LIMIT 10` without an HNSW or IVFFlat index on large tables
- Embed the same content twice — always check content hash before calling embedding API
- Send raw document text to embedding API without chunking
- Return embedding vectors in API responses — they're internal only
- Use IVFFlat index if table has fewer than 1M rows — HNSW is better for small-medium scale

**ALWAYS do:**
- Enable pgvector extension before running migrations: `CREATE EXTENSION IF NOT EXISTS vector`
- Match `VECTOR(n)` dimension to the exact model output dimension
- Chunk content before embedding, with overlap
- Store `contentHash` (SHA-256) on each chunk to skip re-embedding unchanged content
- Apply HNSW index after initial bulk insert (faster than indexing during insert)

**Code example — enable pgvector in migration:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Code example — generate embedding with Ollama:**
```typescript
async function embed(text: string): Promise<number[]> {
  const res = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
  })
  const { embedding } = await res.json()
  return embedding
}
```

**Code example — chunk text with overlap:**
```typescript
function chunkText(text: string, chunkSize = 512, overlap = 50): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
    i += chunkSize - overlap
  }
  return chunks
}
```

**Code example — hybrid search query (RRF):**
```sql
WITH fts AS (
  SELECT id, ts_rank(fts_vector, query) AS rank,
         ROW_NUMBER() OVER (ORDER BY ts_rank(fts_vector, query) DESC) AS rn
  FROM chunks, plainto_tsquery('english', $1) query
  WHERE fts_vector @@ query
  LIMIT 20
),
vec AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY embedding <=> $2::vector) AS rn
  FROM chunks
  ORDER BY embedding <=> $2::vector
  LIMIT 20
),
rrf AS (
  SELECT
    COALESCE(fts.id, vec.id) AS id,
    COALESCE(1.0 / (60 + fts.rn), 0) + COALESCE(1.0 / (60 + vec.rn), 0) AS score
  FROM fts FULL OUTER JOIN vec ON fts.id = vec.id
)
SELECT chunks.content, chunks.document_id, rrf.score
FROM rrf JOIN chunks ON chunks.id = rrf.id
ORDER BY rrf.score DESC
LIMIT $3;
```

**Code example — ingest document (chunk + embed + store):**
```typescript
import { createHash } from 'crypto'

async function ingestDocument(docId: string, content: string) {
  const chunks = chunkText(content)

  for (let i = 0; i < chunks.length; i++) {
    const hash = createHash('sha256').update(chunks[i]).digest('hex')

    // Skip if already embedded (idempotent ingest)
    const existing = await db.query(
      'SELECT id FROM chunks WHERE document_id = $1 AND chunk_index = $2 AND content_hash = $3',
      [docId, i, hash]
    )
    if (existing.rows.length > 0) continue

    const embedding = await embed(chunks[i])

    await db.query(
      `INSERT INTO chunks (document_id, content, chunk_index, content_hash, embedding)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (document_id, chunk_index) DO UPDATE
       SET content = $2, content_hash = $4, embedding = $5`,
      [docId, chunks[i], i, hash, JSON.stringify(embedding)]
    )
  }
}
```

**Verification checklist:**
- [ ] `CREATE EXTENSION IF NOT EXISTS vector` runs without error
- [ ] Insert a chunk with embedding → stored as `VECTOR` type, not JSON
- [ ] `EXPLAIN` on similarity query shows index scan (not seq scan)
- [ ] Ingest same document twice → no duplicate chunks (idempotent)
- [ ] Hybrid search returns results combining both FTS and vector scores
- [ ] Embedding dimensions match `VECTOR(n)` column definition
- [ ] Ollama running locally: `curl http://localhost:11434/api/embeddings` responds

**Frontmatter for impl.md (update from research):**
```yaml
skill: apex-search
backend: deepseek
version: 1.0.0
last_updated: 2026-05-28
sources:
  - pgvector — github.com/pgvector/pgvector
  - Ollama — ollama.com/library
  - OpenAI Embeddings — platform.openai.com/docs/guides/embeddings
staleness_threshold: 30d
```

---

### Registry row to add in `~/.claude/registry/domains.md`

```
| search | apex-search/SKILL.md | apex-search/impl.md | — | search, full-text search, vector search, semantic search, RAG, retrieval, embeddings, pgvector, similarity search, chunking, hybrid search, Typesense, Algolia |
```

### SKILLS.md additions in `~/apex/SKILLS.md`

Quick reference table row:
```
| **apex-search** | Search and retrieval — PostgreSQL FTS, pgvector, hybrid RRF, RAG chunking pipeline | topic keyword |
```

New entry under the **Application development** section (after apex-storage):
```
**apex-search** — Search and RAG retrieval. PostgreSQL full-text search + pgvector hybrid
search (RRF reranking) as the default stack — no extra infra. Covers chunking strategies,
embedding generation (Ollama local or OpenAI), HNSW index setup, hybrid search queries,
idempotent ingest pipeline, and handoff to apex-ai-systems for LLM context injection.
Optional: Typesense for typo-tolerant full-text with facets.
```

### SKILL-HISTORY.md row to prepend in `~/apex/SKILL-HISTORY.md`

```
| 2026-05-28 | apex-search | SKILL + impl | 1.0.0 | created | Search + RAG retrieval — pgvector hybrid search, chunking, Ollama/OpenAI embeddings, RRF reranking, Typesense option | pgvector, Ollama, OpenAI Embeddings, Typesense Docs, PostgreSQL FTS |
```

## Gotchas / edge cases

- **pgvector extension must be enabled before migration**: `CREATE EXTENSION IF NOT EXISTS vector`
  must run before any table with a `VECTOR` column is created. In Prisma this means a raw
  SQL migration step before the schema migration. The impl.md must include this explicitly.

- **Prisma vector support**: Prisma uses `Unsupported("vector(768)")` for vector columns,
  meaning similarity queries must use `$queryRaw`. Research task #2 must confirm current
  Prisma patterns — this is a common friction point. If Drizzle has better support, note it.

- **HNSW vs IVFFlat**: HNSW is generally faster for query time and doesn't require a
  training step. IVFFlat requires `lists` parameter tuning based on row count. For this
  project's scale, HNSW is the default. Research task #1 must confirm current recommendation.

- **Embedding dimension must match exactly**: If you use `nomic-embed-text` (768 dims) and
  define `VECTOR(1536)`, queries will fail. The column definition and the model must be
  locked together. Changing models requires re-embedding all chunks (expensive). Note this
  as a high lock-in decision in the SKILL.md.

- **Ollama must be running for ingest and query**: If Ollama is down, embedding generation
  fails. The impl.md must show error handling for Ollama unavailability and recommend a
  health check before starting the ingest pipeline.

- **Idempotent ingest is critical**: Re-running ingest on the same document should not
  create duplicates. The content hash pattern in the code example handles this. Without it,
  every re-ingest doubles the chunk count, degrading retrieval quality.

- **RRF k=60 is a convention**: The value 60 is widely used but not magic. Note it is
  tunable — lower k gives more weight to top-ranked results, higher k distributes weight
  more evenly. Default 60 is a safe starting point.

- **Context window budgeting**: Retrieved chunks must fit in the LLM's context window
  alongside the system prompt and conversation history. The review checklist must include
  a token-count check before injection. apex-ai-systems handles this but the search skill
  should note the constraint.

- **SKILL-HISTORY.md prepend**: coding mode must prepend, not append. File is newest-first.

## Files to touch

- `~/.claude/skills/apex-search/SKILL.md` — create (new skill, planning-mode guidance)
- `~/.claude/skills/apex-search/impl.md` — create (new skill, coding-mode patterns)
- `~/.claude/registry/domains.md` — add `search` row (see exact row above)
- `~/apex/SKILLS.md` — add quick-ref table row + Application development entry
- `~/apex/SKILL-HISTORY.md` — prepend creation row (see exact row above)
