# ADR-029 — Cross-spec parallel build

Status: **Accepted** — 2026-06-24 (session 63). **Extends** ADR-028 (parallel Codex within a wave)
from "independent tasks within one spec's wave" to "independent tasks across multiple ready specs"
at a batch **"build specs"**. Same one machine-protection cap; adds the file-disjointness invariant
as the safety headline.

## Context
ADR-028 fans out independent `▸codex` tasks *within a single spec's wave* into concurrent
`codex exec` subprocesses bounded by `max_parallel_codex` (3 on this host). It does not widen the
pool across specs: a batch build of N ready specs (the "build specs" trigger, e.g. Artemis's ~28
cluster specs) still builds them one spec at a time, even when the specs touch disjoint subtrees and
share no dependency. The host is idle while each spec's verify runs.

The cross-spec dependency structure is already declared — every spec carries `## Prerequisites`
(specs that must complete first) and a `## Files to Change` table — so a build-time topological group
is mechanical, not a planning-reasoning step. Planning declared the edges per spec; the build only
sorts them.

A dry-run of the naive design (group by `## Prerequisites` alone) against Artemis's real specs found
it **unsafe**. Dependency-independence is *not* file-disjointness: `SENS-carry-M3b` and
`SENS-carry-M4c1` have no prerequisite edge between them yet both modify `src/artemis/ports/types.py`
(one adds fields to `Chunk`, the other to `Fact`). Integration is `git checkout <branch> -- <file>`
(overwrite, never `git merge` — a hard block), so two concurrent specs writing one file silently
clobber. The package `__init__.py` re-export pattern makes this systemic — any two specs extending
the same package both write its `__init__.py`.

## Decision
1. **Cross-spec parallel at "build specs".** For a batch build over `docs/changes/*.md`, group the
   ready specs into *spec waves* and fan their tasks into the Codex pool, instead of building one spec
   fully before starting the next.
2. **Wave membership = TWO constraints, both derived from existing spec fields.** Two specs may share
   a wave only if BOTH hold:
   - **Dependency-independent** — neither is in the other's transitive `## Prerequisites` closure.
   - **File-disjoint** — their `## Files to Change` path sets do not intersect.
   File overlap between otherwise-independent specs is an **implicit serialization edge**: the
   orchestrator pushes one spec to a later wave (rebased after the earlier integrates). No new spec
   tag is introduced — the two existing fields are sufficient and now build-load-bearing.
3. **Supervision gate — parallel-*safe* is not parallel-*eligible*.** Even when two specs pass both
   safety constraints, a **high-risk** spec (`risk: high`, or an auth / security / data domain) runs
   **sequentially in the foreground**, never in the background pool. Parallel dispatch backgrounds the
   `codex exec` subprocess (`run_in_background`), which forfeits the per-spec live watch — output
   interleaves and you can't see each spec iterate on its failures. The high-risk set is exactly the
   set that earns close watching (it already triggers dual-pass wave review + `cross_model_review`), so
   it stays observable. This is an **opt-out**: routine `risk: low`/unmarked specs are pool-eligible;
   only the high-risk set is excluded. (Note the default differs from the *review* gate, where an
   *absent* `risk` defaults to cautious/dual-pass — there, absence means "be careful"; here, absence
   means "routine, fine to background.") A high-risk spec also does not fan its own tasks into the
   background pool (the ADR-028 within-spec parallel is suppressed for it) — it is built foreground,
   start to finish.
4. **Conservative path handling.** A spec whose `## Files to Change` lists a directory or a fuzzy
   path ("the ingest path — confirm exact file from M8-b1") is treated as touching that whole
   subtree → serialized against anything else under it.
5. **One shared cap across both levels.** Cross-spec parallelism draws from the *same*
   `max_parallel_codex` pool as within-spec parallelism — it is **not** multiplied per spec. N specs ×
   their tasks all contend for the one machine-protection budget (3 here); without this rule the host
   melts.
6. **Per-spec integrate → verify → commit, in dependency order.** Parallelism is the *build* phase
   only. As each spec's tasks complete, that spec integrates to the main tree, runs **its own**
   acceptance recipe, and commits under per-spec commit discipline — sequentially, in dep order. A
   conflict at integration means the disjointness check was wrong (or a fuzzy path resolved to a
   shared file) → fork that spec (capture-at-halt).
7. **Failure / fallback (ADR-027/028 unchanged).** Quota-out on any subprocess → remaining tasks fall
   back to Opus (inline, sequential).

## Consequences
- **Watchability preserved where it matters.** The high-risk set stays foreground/sequential, so the
  supervised-build experience is unchanged for exactly the specs that need a close watch; only routine
  independent specs background. The cost is forgone parallelism on the high-risk set — accepted, since
  observability there outweighs throughput.
- **Wall-clock win concentrates across modules/clusters** — specs in different package subtrees (e.g.
  a sensitivity producer ∥ a finance ledger ∥ a reactions emitter) fill the cap 3-wide. The win is
  **throttled within a module** by the shared `__init__.py` and any shared contract/types file, and is
  **zero for a serial-by-design chain** (a ledger A→B→C→D). The realistic gain is smaller than a naive
  "all independent clusters run at once" estimate.
- **Per-spec verify is a sequential floor.** On a verify-heavy stack (Artemis runs `mypy --strict` +
  full pytest per spec) the serial integrate→verify→commit caps the speedup; pipeline a spec's verify
  under the next spec's build where possible.
- **No new authoring burden, but precision matters more.** `## Prerequisites` and `## Files to Change`
  were always required; they are now also the parallel-safety inputs. A missing prereq edge or an
  unlisted shared file degrades to a needless serialization (best case) or a clobbering build (if the
  orchestrator can't see the overlap).
- **Integration stays `git checkout`-not-merge** (the hard-block-safe path) — which is *why*
  file-disjointness is mandatory rather than a nice-to-have.
- **Adoption is gated on mechanic A.** A project still driving builds via a standalone per-spec runbook
  (e.g. Artemis's `CODEX-BUILD-RUNBOOK.md`) cannot consume a spec DAG — it must first migrate onto
  `apex-code` (mechanic A) before cross-spec parallelism applies.

## Alternatives rejected
- **Group by `## Prerequisites` alone** — unsafe; dependency-independence ≠ file-disjointness (the
  `ports/types.py` collision above). Rejected with evidence from the Artemis dry-run.
- **A new spec-level `parallel_group` / `independent_of` tag** — redundant. `## Prerequisites` already
  encodes the dependency edges and `## Files to Change` the file sets; a hand-maintained tag would
  duplicate them and drift. Derive, don't re-declare.
- **`git merge` of per-spec branches** (would tolerate shared-file edits) — a permanent hard block, and
  unnecessary once waves are file-disjoint.
- **A separate per-spec concurrency cap** — multiplies Codex subprocesses (N specs × tasks) and
  exhausts the host. One shared cap is the machine-protection floor.
- **Wave-level single verify** (verify the whole integrated wave once instead of per-spec) — faster on
  a verify-heavy stack, but trades away per-spec green/commit granularity (which spec broke?) and the
  per-spec commit discipline. Left as a possible future optimization, not v1.
