# Repo Study: Understand-Anything

_Research date: 2026-06-05_
_CLONED: yes — commit SHA 7a3b751_

---

## Repo Identity

| Field | Value |
|-------|-------|
| **URL** | https://github.com/Lum1104/Understand-Anything |
| **Commit SHA** | 7a3b751 (depth-1 clone, 2026-06-05) |
| **License** | MIT (LICENSE file: "Copyright (c) 2026 Yuxiang Lin") |
| **What it is** | A Claude Code plugin (also installable on Codex, Cursor, Copilot, Gemini CLI, and ~10 others) that runs a multi-agent pipeline to build an interactive JSON knowledge graph from any codebase, doc set, or Karpathy-pattern wiki. Tagline from README.md line 36: "The goal isn't a graph that wows you with how complex your codebase is — it's a graph that quietly teaches you how every piece fits together." |

**Primary structure** (from `ls understand-anything-plugin/`): `agents/` (agent .md files), `skills/` (per-command SKILL.md files), `packages/core/` (TypeScript library: search, embeddings, fingerprints, staleness), `src/` (command handler .ts files).

---

## Architecture & Notable Mechanisms

All findings cite cloned file paths.

### 1. Hybrid Deterministic + LLM Analysis Pipeline

`understand-anything-plugin/agents/project-scanner.md`: Phase 1 runs two bundled Node scripts — `scan-project.mjs` (file enumeration via `git ls-files`, language/category tagging, line counting) and `extract-import-map.mjs` (tree-sitter-based import resolution for 12 languages: TS, JS, Python, Go, Rust, Java, Kotlin, C#, Ruby, PHP, C, C++). LLM only synthesises the narrative `description` field and reads README/manifests. The split cleanly separates reproducible facts from semantic interpretation.

`understand-anything-plugin/agents/file-analyzer.md`: Two-phase per-file analysis: Phase 1 runs a structural extraction script (deterministic), Phase 2 applies LLM semantic summarisation on top of those results — never guessing structure from context alone.

### 2. Seven-Phase Orchestration with Up-to-5 Parallel Subagents

`understand-anything-plugin/skills/understand/SKILL.md` defines 7 numbered phases:

| Phase | Name | Key action |
|-------|------|-----------|
| 0 | Pre-flight | Determine full vs incremental; worktree redirect; build check |
| 0.5 | Ignore config | Set up `.understandignore` |
| 1 | SCAN | Dispatch `project-scanner` subagent |
| 1.5 | BATCH | Run `compute-batches.mjs` to compute semantic file groupings |
| 2 | ANALYZE | Dispatch up to 5 concurrent `file-analyzer` subagents |
| 3–5 | ASSEMBLE / ARCH / TOUR | `assemble-reviewer`, `architecture-analyzer`, `tour-builder` |
| 6–7 | REVIEW / SAVE | Graph validation + `build-fingerprints.mjs` write |

Additional agents: `domain-analyzer.md` (business flow/process extraction for `/understand-domain`), `article-analyzer.md` (Karpathy-wiki implicit entity + claim extraction).

### 3. Fingerprint-Based Incremental Re-Analysis

`understand-anything-plugin/packages/core/src/staleness.ts`: `getChangedFiles()` runs `git diff <lastCommitHash>..HEAD --name-only`. `mergeGraphUpdate()` removes old nodes/edges for changed file paths and splices in new analysis — only changed files cost LLM tokens on update.

`understand-anything-plugin/packages/core/src/fingerprint.ts` (file present in `ls` output): used in Phase 7 (`build-fingerprints.mjs`) to record the graph baseline, enabling the pre-flight change-detection gate.

### 4. Committed Shared JSON Artifact

Output is `.understand-anything/knowledge-graph.json` committed to the repo. A `--auto-update` flag writes a git post-commit hook. Teammates load the pre-built graph (zero LLM cost). The `meta.json` stores `gitCommitHash` so staleness is detectable at startup.

### 5. Fuzzy + Semantic Hybrid Search for Chat

`understand-anything-plugin/packages/core/src/search.ts`: `SearchEngine` wraps Fuse.js with field weights (name 0.4, tags 0.3, summary 0.2, languageNotes 0.1) and extended OR-search across space-separated query tokens.

`understand-anything-plugin/packages/core/src/embedding-search.ts`: `SemanticSearchEngine` stores pre-computed vector embeddings per node; cosine similarity search. Used as the secondary path.

`understand-anything-plugin/src/context-builder.ts`: `buildChatContext()` runs `SearchEngine.search()` for top-N nodes, expands 1 hop via edges, then collects layers containing any relevant node. Structured graph context is passed to the LLM — not flat vector chunks.

### 6. Diff Impact Analysis

`understand-anything-plugin/skills/understand-diff/SKILL.md`: `/understand-diff` Greps node IDs for changed file paths in the committed graph JSON, follows 1-hop import/call edges to identify blast radius, and reports affected architectural layers + complexity scores — entirely grep-and-read, no new LLM inference.

### 7. Knowledge-Base Graph (`/understand-knowledge`)

`understand-anything-plugin/skills/understand-knowledge/SKILL.md`: Targets Karpathy-pattern LLM wikis. `parse-knowledge-base.py` deterministically extracts wikilinks, categories, and headings. `article-analyzer.md` subagents (batches of 10–15, up to 3 concurrent) extract implicit entities, claims, and relationships (`builds_on`, `contradicts`, `exemplifies`, `cites`). `merge-knowledge-graph.py` merges + deduplicates.

### 8. Token / Cost Profile

Initial scan: up to 5 concurrent LLM calls per batch during Phase 2, proportional to codebase size. Incremental: LLM calls only for changed files. Chat/diff: read-only against committed JSON — zero LLM cost for retrieval itself (inference only on response generation). Cross-team sharing of committed graph = zero re-analysis cost for teammates.

---

## Candidate Table

Each candidate cites cloned files.

| Candidate | Lens | Dedup (APEX baseline) | Token-cost | Verdict | Rationale |
|-----------|------|-----------------------|------------|---------|-----------|
| Hybrid deterministic + LLM parsing (tree-sitter edges, LLM summaries) | APEX | partial — apex-search does chunking/embeddings; no deterministic structural parse step | Low (design pattern, not runtime) | NOTE | Worth citing in apex-search/apex-deep-dive as a pattern. No new skill needed; APEX's charter is Markdown, not running tree-sitter. File: `agents/project-scanner.md` |
| Committed shared graph artifact (teammates skip pipeline; zero re-analysis cost) | Artemis | novel for Artemis | Low | ADOPT | Artemis knowledge-core should cache ingestion output as a committed/persisted artifact. Prevents per-user re-ingest cost. File: `skills/understand/SKILL.md` Phase 7 + `packages/core/src/staleness.ts` |
| Fingerprint-based incremental re-analysis (only changed files re-processed) | Artemis | novel for Artemis | Low | ADOPT | Artemis second-brain will re-ingest frequently; incremental fingerprint diffing keeps cost proportional to churn, not corpus size. File: `packages/core/src/staleness.ts` `mergeGraphUpdate()` |
| Graph-grounded chat RAG (1-hop neighbour expansion, structured node context) | Artemis | already-have in concept (apex-search covers flat RAG); structured graph variant is novel for Artemis | Med (retrieval per query, inference on answer) | ADOPT-with-guardrails | Artemis knowledge-core should prefer graph-grounded retrieval for structured/codebase content. Guardrail: keep flat vector fallback for unstructured docs. File: `src/context-builder.ts` |
| Diff impact traversal (`/understand-diff`) — grep graph for changed paths, follow 1-hop edges | APEX | novel — APEX has no change-impact mechanism | Low (grep + read, no LLM scan) | ADOPT-with-guardrails | apex-code or apex-debug could adopt: before executing a spec, check if a committed graph artifact exists and traverse 1-hop to flag cross-cutting impact. Guardrail: only invoke if artifact exists; never mandate graph build as precondition. File: `skills/understand-diff/SKILL.md` |
| Wiki entity + implicit-relationship extraction (`article-analyzer`) | Artemis | novel for Artemis | Med (LLM per batch of 10–15 articles) | NOTE | Artemis second-brain may ingest wiki/markdown knowledge bases; the `builds_on`/`contradicts`/`exemplifies` edge taxonomy is worth adopting. Defer until Artemis architecture is defined. File: `agents/article-analyzer.md` |
| Seven-phase sequential pipeline with parallel subagents (up to 5 concurrent) | APEX | partial — APEX has dispatched reviewers; no explicit concurrency-within-phase pattern | Med (spawns subagents) | NOTE | gsd-map-codebase already covers brownfield mapping; no new APEX skill warranted. The parallel-within-stage dispatch pattern is worth noting as a refinement in apex-code. File: `skills/understand/SKILL.md` Phase 2 |
| Persona-adaptive detail level in dashboard output | APEX | partial — apex-context-budget does audience-based compaction; explicit persona toggle is new | Low | NOTE | Not critical enough for a new skill; note as possible refinement in apex-docs-product |
| Multi-language output (7-language generation via `--language` flag) | Artemis | novel | Low | REJECT | No evidence Artemis needs multi-language; premature feature |
| Post-commit hook auto-update of graph (`--auto-update`) | Artemis | novel | Low | NOTE | Useful if Artemis knowledge core covers code. Defer until Artemis architecture is defined. File: `skills/understand/SKILL.md` Phase 0 |
| Fuzzy + semantic hybrid search (Fuse.js + cosine similarity, field-weighted) | Artemis | already-have in concept (apex-search); concrete dual-engine implementation is novel | Low (per-query, no LLM) | ADOPT-with-guardrails | Artemis search should implement field-weighted fuzzy as primary + embedding cosine as secondary — not just pure vector. Files: `packages/core/src/search.ts`, `packages/core/src/embedding-search.ts` |

---

## Bottom Line

Understand-Anything is a well-engineered codebase-comprehension plugin, not a general agent framework. Most mechanisms have APEX conceptual equivalents. The concrete pickups are:

**APEX (1 ADOPT):** `/understand-diff` change-impact traversal pattern — adopt in apex-code as an optional pre-execution dependency check when a committed graph artifact exists. Zero LLM cost; pure grep + read.

**Artemis (4 ADOPTs):** (1) committed cached ingestion artifact, (2) fingerprint-based incremental re-analysis, (3) graph-grounded RAG with 1-hop neighbour expansion, (4) field-weighted fuzzy + embedding cosine hybrid search. These four directly serve Artemis's "second brain" knowledge core.
