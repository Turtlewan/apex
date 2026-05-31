# Research: SP2 — capability-skill composition (grounded in the second-brain app)

**Date:** 2026-05-31
**Confidence:** HIGH on the mechanism (read from `apex-code`/`apex-search` source); MEDIUM on the
vector/embedding landscape (strong 2026 community consensus).
**Re-research after:** 2026-06-30 (local-embedding tooling moves fast).
**Decides:** SP2 composition method — feeds an ADR.

## The question
When a build uses a **stack skill** (`apex-python`) *and* **capability skills** (`apex-search`,
`apex-auth`, `apex-jobs`…), how do they combine — and do capability skills get their own
Verification Recipe / binding? Two methods were on the table: **(A)** extend the `stack_skills`
binding so capability recipes union in; **(B)** a new `capability_skills` binding.

## How composition works **today** (verified from source)
- `apex-code` reads `stack_skills` from `status.md`, loads each bound skill's `## Verification
  Recipe`, and runs the **union** of layers per task (`apex-code/SKILL.md` lines 128-135).
- **Capability skills are NOT in any binding** and carry **no Verification Recipe** — `apex-search`
  has a prose *"Verification checklist"*, not runnable commands.

## The decisive finding: capability skills are **stack-coupled**
`apex-search/impl.md` is written entirely for **TypeScript + PostgreSQL/pgvector + Ollama**:
`db.query(...)`, `VECTOR(n)`, `CREATE EXTENSION vector`, HNSW/IVFFlat, `tsquery` RRF in SQL, and
`createHash` from Node `crypto`. `[VERIFIED — read the file]`

The second-brain app is **Python + SQLite + local vectors + Apple Silicon**. So `apex-search` is
**off-stack on two axes** (wrong language, wrong database). The *concepts* transfer perfectly
(chunking, content-hash dedup to skip re-embedding, hybrid RRF, HNSW vs IVFFlat, index-after-bulk);
the *code and commands do not*. `apex-ai-systems` by contrast is a planning-only advice skill (no
impl.md, stack-agnostic) — it composes fine.

**Implication:** neither method A nor B fixes anything — unioning (or separately binding) a
**pgvector/TypeScript recipe** onto a **Python/SQLite** app would inject *wrong-stack commands* into
the verify loop. The real problem isn't the binding; it's that capability *content* assumes one stack.

## What the app actually needs (capability map)
| Need | Capability skill | Stack-coupling problem | App's real choice |
|------|------------------|------------------------|-------------------|
| RAG / vector search (core) | `apex-search` | TS + pgvector + Ollama | **Python + sqlite-vec** (vectors live in the same SQLite DB — one store) or **LanceDB** (embedded, larger-than-memory, ~100× faster on a MacBook, multimodal) `[COMMUNITY]` |
| Embeddings | (in `apex-search`) | assumes Ollama HTTP | **MLX** (Apple-native, 30-50% faster, unified memory) or Ollama / sentence-transformers `[COMMUNITY]` |
| LLM orchestration / eval | `apex-ai-systems` | none (planning advice) | composes as-is |
| Doc ingestion (background) | `apex-jobs` | likely TS/BullMQ | Python (e.g. arq / Celery / a simple asyncio worker) |
| Doc storage | `apex-storage` | likely TS/S3 | local filesystem + SQLite metadata |
| Client→hub auth | `apex-auth` | likely TS | Python/FastAPI side |

For the app's RAG core: **sqlite-vec is the cleanest fit** — it keeps vectors *inside* the SQLite
store the stack already uses (one file, one backup, transactional), which is exactly the
"desktop-is-the-hub, local-first" model. LanceDB is the upgrade path if the corpus outgrows SQLite
or goes multimodal. Embeddings local via MLX (private second brain, Apple Silicon).

## Methods evaluated
| Method | What it does | Verdict for the app |
|--------|--------------|---------------------|
| **A — extend `stack_skills`** | capability skills declare a Recipe; union into the binding | ❌ injects wrong-stack (pgvector/TS) commands; also bloats the per-run context (against SP6) |
| **B — new `capability_skills` binding** | separate binding for capability recipes | ❌ same wrong-stack content problem + *more* machinery + more context to load |
| **C — capability = stack-agnostic concept skill; stack owns the recipe; assumptions flagged** | capability skills teach the *what* (planning), the stack skill's recipe verifies the *how*, capability declares its assumptions so planning adapts | ✅ no new binding; one verification source; fits SP6; fixes the real (coupling) problem |
| **D — stack-specific capability variants** (`apex-search` gets a Python/SQLite section) | per-stack capability content | ✅ correct long-term, but heavier — earn it via the SP5 sweep, not up front |

## Recommendation — **Method C now, D opportunistically (no new binding)**
1. **Do NOT add a `capability_skills` recipe binding.** The app's verification is already covered by
   `apex-python`'s recipe (`pytest`/`mypy --strict` test the RAG code). One recipe source = simplest
   and aligns with SP6 (minimise per-run context).
2. **Capability skills are planning-layer "concept + contract" skills** — loaded during planning to
   shape the spec (chunking, dedup, hybrid retrieval, index choice), *not* run as recipes.
3. **Mismatch-guard = a one-line `## Stack assumptions` header in each capability `impl.md`**
   (`apex-search`: "assumes Postgres/pgvector + TS"). Planning checks it against the bound
   `stack_skills`; on mismatch it adapts the spec ("use sqlite-vec in Python, not pgvector") and
   flags it. Cheap, planning-time, no runtime machinery.
4. **App RAG choices to record at bootstrap:** vector store **sqlite-vec** (LanceDB as scale path),
   embeddings via **MLX** (Ollama fallback). These live in the app's ADR, not a skill.
5. **SP5 linkage (method D, later):** `apex-search` (and `apex-jobs`/`apex-storage`) need a sweep to
   **de-couple concepts from the JS/pgvector implementation** — make them stack-portable. This is now
   a concrete top priority for the SP5 capability-skill sweep, *driven by this app*.

**Net:** the "which binding" question dissolves — the app needs *no* new binding. It needs capability
skills that aren't welded to one stack, plus the stack recipe as the single verifier. That's a
content fix (SP5), not a mechanism fix.

## Agent-wiring half (still open)
The 17 registered-but-never-dispatched domain agents are a separate sub-question of SP2, untouched by
this research. Default lean: **load `impl.md` inline** (cheaper, no cold-start) and reserve agent
dispatch for genuinely parallel/isolated work — but that needs its own baseline. Deferred.

## Sources
- `apex-code/SKILL.md`, `apex-search/impl.md` (read directly — Tier 1 internal)
- sqlite-vec / LanceDB / Chroma comparisons (DEV, 4xxi, MarkTechPost 2026)
- MLX on Apple Silicon for local RAG (DEV, SitePoint 2026); Ollama embedding models
