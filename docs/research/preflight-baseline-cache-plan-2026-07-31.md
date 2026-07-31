# Plan: pre-flight baseline digest→green cache (from the Artemis 2026-07-30/31 issue)

**Owner-queued 2026-07-31 (~01:00). Status: PLAN — spec authoring joins wave-3 planning (the
spec's primary file is `codex-dispatch.ps1`, owned by retro-wrapper-hygiene until it builds; and
the pre-draft Sol architecture pass now applies).** Source issue: six full-suite executions in one
Artemis session (~108 min), four of them pre-flights re-verifying a baseline that was green every
time; suite grew 871s→1196s in one night, and every dispatch pays it twice (pre-flight + arbiter).

## Coverage map — what existing work already handles

| Issue component | Handled by | State |
|---|---|---|
| exit-65 scope noise on `.mypy_cache`/`.ruff_cache`/`.codex-scratch` | `retro-scope-check-narrowing` (exact-list exclusions, presence-split predicate) | promoted, builds in wave 2 |
| family-gate exit-12 (arbiter-written caches break digest equality) | wave-3 "family-gate integrated-tree digest binding" queue item (first repro already recorded) | queued |
| per-task suite cost (two-tier verify: impacted subset per task, full suite at wave end) | retro P7(b), part of the wave-3 per-repo AGENTS.md contracts item | queued |
| **the digest→green cache itself** | **nothing** | **this plan** |
| cheap-gates-before-suite ordering | nothing (live code runs the suite at `codex-dispatch.ps1:1069` BEFORE `apex-spec-validate` at `:1094` — verified 2026-07-31) | this plan |

## The mechanism (verified against the live wrapper)

The claim in the issue checks out: `tree-pin.ps1` already computes a content digest of the tree at
pre-flight, and (better than the issue feared) its digest already excludes ignored tool caches in
every worktree (`tree-pin.ps1:198-206` — "a tool cache is derived output... ignored (`!!`) entries
only"), so the cache key needs no new digest hygiene beyond confirming `.codex-scratch` joins the
tool-cache list (the scope-check spec's lockstep pairing is the natural home to assert parity).

**Spec shape (wave 3, prereq: retro-wrapper-hygiene — same file):**
1. **Cache store**: append-only mutexed jsonl at `%LOCALAPPDATA%\apex\progress\baseline-cache.jsonl`
   (same mutex discipline as the ledger; append-only per the ratified no-row-surgery rule). Entry:
   `{repo_root, tree_digest, recipe_hash, result: green, suite_line, recorded_by: preflight|arbiter, ts}`.
2. **Key**: `(repo_root, tree_digest, recipe_hash)` where `recipe_hash` = hash of the AGENTS.md
   fenced `## Verify commands` block content (pre-flight already parses that fence — ADR-040/exit-72
   machinery). Content-addressed → self-invalidating; no TTL.
3. **Pre-flight consult**: cache hit (green entry, exact key) → print
   `[baseline-cache] HIT <digest> (green at <ts>, by <recorded_by>)` and SKIP the suite — the gate
   is SATISFIED cheaply, not bypassed (`-SkipBaselineCheck` stays classifier-refused; this is the
   distinction the issue names). Miss → run the suite; on green, append.
4. **Arbiter seeding — the big win**: the post-build verify (arbiter) appends its green under the
   post-build tree digest, so the NEXT dispatch's pre-flight on the unchanged tree hits the cache
   (this kills the exact Arbiter-#1-green→Pre-flight-#3-rerun 19:55 pattern in the issue's table).
5. **Ordering fix**: move `apex-spec-validate` (and every millisecond gate) BEFORE the baseline
   suite in the pre-flight sequence — a red spec must never cost a 14-minute suite run (the issue's
   Pre-flight-#1 case). Two-line reorder around `:1044-1094`.
6. **Flake honesty**: a cached green can mask a newly-flaky suite. Mitigations: the arbiter still
   runs the real suite on every build (never cached — it verifies a NEW tree by definition), and a
   `-ForceBaseline` attended switch forces a real run and refreshes the entry. No hit-chain cap
   needed — any tree change misses by construction.
7. **Trust domain**: cache file lives in the same state root as the ledger, same mutex, same
   attended-write conventions; a fabricated green is equivalent in trust terms to a fabricated
   ledger row (existing threat model, no new surface).

## Expected yield
Per the issue's numbers: ~68 min of the ~108 min measured was pre-flight re-verification of
already-green baselines — the cache converts nearly all of it to milliseconds, and the ordering
fix removes the suite cost from every spec-refusal path. This is the "single biggest wall-clock
win available in APEX today" per the earlier handoff, now with a concrete mechanism and hygiene
preconditions already shipping in wave 2.
