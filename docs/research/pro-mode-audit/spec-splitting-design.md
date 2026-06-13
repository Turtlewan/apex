# Tier-aware spec splitting — worked example + Phase 3 design

_Session 39 · 2026-06-13 · planning exploration. Pressure-tests the "split a feature on its
difficulty seam, route the hard kernel to Pro" idea on a real Artemis feature, then turns the
findings into the Phase 3 cost-routing design._

---

## Part 1 — Worked example: Artemis "Ask your second brain"

**Feature:** user asks a natural-language question; Artemis retrieves relevant notes from the
knowledge base and answers with citations, streamed. Stack for the example: Python/FastAPI +
sqlite-vec + FTS5 (single-user hub).

### Task breakdown (whole feature)

| # | Task | Difficulty |
|---|------|-----------|
| 1 | Hybrid retrieval: vector (sqlite-vec) + keyword (FTS5) + RRF fusion + re-rank | **Hard** |
| 2 | Context assembly: chunk selection within token budget, dedup, ordering, citation tagging | **Hard** |
| 3 | Query contextualization: rewrite the question using prior conversation turns | **Hard-ish** |
| 4 | Grounded generation: build prompt, call LLM, stream tokens, interleave citations, handle "no context"/refusal | **Hard** |
| 5 | SSE transport: stream engine output → client | Medium (boundary) |
| 6 | `POST /ask` endpoint: auth, validate, call engine, pipe stream | Routine |
| 7 | Conversation persistence: store turns (Q, A, citations, ts) | Routine |
| 8 | Chat UI: input, streaming render, citation chips, history | Routine |

### The seam

- **Kernel (→ Pro):** tasks 1–4 — the retrieval + generation engine.
- **Remainder (→ Flash):** tasks 6–8 — endpoint, store, UI. Task 5 (SSE) is the boundary.

### The interface at the seam (the load-bearing artifact)

```python
# engine/types.py  +  engine/protocols.py   — OWNED & FROZEN BY THE PRO SPEC
async def answer_query(user_id, question, conversation_id) -> AsyncIterator[Event]: ...

Event = TokenEvent(text) | CitationEvent(note_id, snippet, score) \
      | DoneEvent(usage) | EmptyEvent(reason)     # "no relevant context" is a kernel verdict

class ConversationStore(Protocol):               # kernel READS this for task 3
    def get_recent_turns(conversation_id, n) -> list[Turn]: ...
```

### Where the clean Pro→Flash sequencing BREAKS (the honest finding)

The seam is **not** a one-way interface. Task 3 (query contextualization, *kernel/Pro*) needs prior
conversation turns — which are owned by task 7 (the conversation store, *remainder/Flash*). That's a
**back-dependency**: the hard kernel depends on a data structure the routine remainder owns. A naive
"Pro first, then Flash" order is a cycle.

**Two more strain points:**
- **Streaming + citation event shape must be frozen before Flash builds the UI**, or task 8 flounders
  on an undefined contract.
- **Empty/refusal semantics** ("no relevant context found") — if undefined, that judgment leaks into
  Flash's endpoint spec, contaminating the routine slice with kernel judgment.

### The resolution (this is the rule the example earns)

**Split the contract from the implementation.** The Pro spec *defines and commits* every seam
contract — the `Event` types, the `ConversationStore` **Protocol**, the empty/refusal semantics — and
builds the kernel against a throwaway in-memory stub for its own verification. Flash then implements
the *real* store, endpoint, and UI **behind the now-frozen interfaces**, listing them as read-only
dependencies in its spec.

So the contract is **committed code, not a handoff doc.** The Pro→Flash handoff shrinks to one line:
"kernel landed at `<sha>`; interfaces frozen in `engine/types.py` + `engine/protocols.py`." This kills
the usual fragile-handoff risk (did the narrative capture the contract?) — the contract *is* the code
the Flash spec imports.

### Cost outcome

Say kernel ≈ 40% of build tokens, remainder ≈ 60%.

| Strategy | Relative cost | Hard part built by |
|----------|--------------|--------------------|
| All-Flash | 1.0 | Flash ⚠️ (risky kernel) |
| All-Pro | 3.0 | Pro ✅ |
| **Split** | **0.4×3 + 0.6×1 = 1.8** | Pro ✅ |

Split = **40% cheaper than all-Pro** while the hard kernel still gets the strong coder. That's the
sweet spot — *when a clean, freezable seam exists.*

### Contrast — when you do NOT split

- **Diffuse difficulty:** "migrate retrieval ranking from RRF to a learned re-ranker across the whole
  pipeline" — the hard reasoning is smeared across retrieval, assembly, eval, and tuning with no
  stable interface to cut on. → one Pro spec, no split.
- **Trivial:** "add `/health` + 3 CRUD routes" → one Flash spec, no split.

---

## Part 2 — Refined rules (what the example proved)

- **R1 — Freezable-interface test.** Split on a difficulty seam *only* when the difficulty is
  localizable behind an interface you can freeze before the remainder is built. If not → don't split.
- **R2 — Pro owns contracts, Flash owns implementations.** The kernel (Pro) spec defines **and
  commits** all seam contracts (interfaces, types, error/empty semantics). Flash specs implement
  behind frozen contracts and list them as read-only deps. The contract is committed code, not prose.
- **R3 — Back-dependencies resolve via interface-in-Pro / impl-in-Flash.** When the kernel needs
  something the remainder owns (e.g. the conversation store), Pro defines the *interface* + a stub for
  its own verification; Flash builds the *implementation*. Build order: Pro kernel+contracts → Flash.
- **R4 — No freeze, no split.** If no contract can be frozen before the remainder is built (diffuse
  difficulty / unstable interface) → single spec, whole-feature tier (Pro if hard, Flash if routine).
- **R5 — Tier is a spec-level (= session) property.** A coding session runs one model, so tier lives
  on the spec, never on a wave. Within a tier-spec the size rule still applies (looser ceiling inside
  Pro specs — this is where the Subset-A "3→5 files" relaxation actually attaches).

---

## Part 3 — Phase 3 design (cost-routing = tier-aware splitting)

**Goal:** "toggle to Pro for the important items" delivered with **zero guardrail relaxation** in v1.
The Subset A/B coder relaxations become a later, optional layer gated on the Mac eval.

### 3.1 Spec frontmatter
Add `coder_tier: flash | pro` (default `flash`), alongside the existing `risk:` and
`cross_model_review:` flags. Optionally `depends_on: <spec>` to encode Pro-kernel→Flash-remainder
build order (only if apex-plan's existing Pending/wave ordering doesn't already cover it — verify
before adding, don't duplicate).

### 3.2 apex-plan decomposition gains a "tier seam" step
After the task/wave breakdown, before specs are finalised:
1. **Tag difficulty** per the rubric (below).
2. **Locate the hard kernel.** If difficulty is diffuse → whole-feature tier, stop.
3. **Apply R1 (freezable-interface test).** If it fails → whole-feature tier, stop.
4. **If it holds → emit split specs:** a Pro kernel spec that owns+commits the seam contracts, and
   one or more Flash remainder specs that import them; set `coder_tier` + build order on each.
5. **Apply the size rule within each** tier-spec (looser ceiling inside Pro).

### 3.3 Difficulty rubric (lives in apex-plan)

| → Pro (kernel) | → Flash (remainder) |
|---|---|
| Novel algorithm / non-obvious logic | CRUD, list/detail, forms |
| Security or auth boundary | Config, env wiring, scaffolding |
| Concurrency / async / ordering | Well-trodden framework patterns |
| Cross-cutting state or invariants | Mechanical refactor / rename |
| Ambiguous requirements needing judgment | Spec'd-to-the-line mechanical work |
| High blast radius if wrong | Low blast radius, easily reverted |

### 3.4 Cost heuristic
Default **Flash**. Escalate a spec (or carved kernel) to **Pro** when it clears the rubric's left
column. **Split** only when R1 holds; otherwise route the whole feature to one tier. Rough payoff:
splitting saves `routine_fraction × (3×−1×)` minus one extra session + handoff — worth it when the
routine fraction is large and the seam is clean.

### 3.5 Governance (unchanged, one clarification)
Tier is **capability, not authority** — it does **not** change the autonomy level, approval gates, or
any hard block. "Let Pro do more autonomously" = raise L-level, a separate axis (WS-B/WS-D both flag
this). No governance edit beyond a one-line note that `coder_tier` is orthogonal to autonomy.

### 3.6 What this does NOT need
No skill relaxations. Every NEVER/ALWAYS, every verify-loop, every review pass runs identically — the
hard slice just gets a better coder. The relaxation dial (Subset A/B) is deferred and optional.

### 3.7 To land it (Phase 4, not yet)
apex-plan edit (decomposition step + rubric) · spec-template frontmatter (`coder_tier`) · one-line
apex-governance + apex-handoff notes · Iron-Law baseline via apex-skill-author · new ADR (introduces
the coder-tier dimension + splitting discipline). **Mac-deferred:** eval-harness confirmation of the
optional relaxations only — the splitting discipline itself needs no Mac validation (it's a planning
discipline, not a coder behaviour).
