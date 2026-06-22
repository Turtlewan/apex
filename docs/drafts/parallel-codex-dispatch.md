# Draft: parallel Codex dispatch (extends ADR-027 / mechanic A)

_Design-in-progress. Decisions settled; ADR + spec not yet written. Pick up here._

## What this builds
Weave parallelism into mechanic A: the Opus `APEX_MODE=coding` host fires multiple `codex exec`
subprocesses concurrently for the independent tasks in a dependency wave, instead of one at a time.

## Decisions made (settled)
- **Mechanism:** host launches background `codex exec` subprocesses (Bash `run_in_background`) and
  collects them — NOT the Workflow/`apex-build-wave.js` path (its `agent()` spawns Claude-Code
  subagents, which can't drive the external Codex CLI). This is the unlock: subprocesses parallelize.
- **Wave grouping:** reuse apex-code's existing dependency-wave model (tasks in a wave are independent
  by construction) — fan out within a wave, barrier between waves.
- **Isolation:** lean **git-worktree-per-task** (reuse the `isolate` pattern in `apex-build-wave.js`),
  then merge back. Alternative = shared-repo-disjoint-files (lighter, but risks build-artifact races +
  the Windows sandbox ACL lock under concurrency).
- **Concurrency cap (machine protection, NOT a quota device):**
  `max_parallel_codex = min(4, floor(physical_cores/2) − 1)` → **3** on this box (8 physical / 16
  logical cores, 31 GB). Auto-sized from cores; each `codex exec` runs the full local toolchain so it's
  far heavier than a Claude subagent — keep well below the Workflow's `min(16, cores−2)`.
- **Quota economics (resolved):** parallel builds the same tasks → **same TOTAL Codex tokens**, just a
  **faster rate**. Weekly cap identical either way. Rate only matters for the **5-hour rolling window**:
  a build whose total exceeds one window can trip it sooner when front-loaded. Most single-spec builds
  fit a window → parallel ≈ **free wall-clock speed**. The cap is the rate dial for this.
- **Build approach:** draft the ADR + spec **inline** (not fan-out) — all needed context is already in
  the session; the artifact is one coherent ADR + one spec.

## Where I stopped — next steps
1. Write a short ADR (parallel-codex dispatch; extends ADR-027) — the why for worktree isolation + cap.
2. Write one spec: apex-code parallel `codex exec` dispatch within a wave + `max_parallel_codex` cap +
   worktree isolation + collect/verify-per-task + failure→fork routing.
3. Build it (apex-code edit; planning-direct).

## Related open items (carry forward)
- **Mechanic A PROVEN today** (2026-06-22 build): the Opus host dispatched `codex exec` per task —
  evidence in `~/.codex/history.jsonl` (M4-d-1, tooling-cleanup, codex-model-adapter prompts, apex-code
  style). **TODO:** record this in ADR-027 + SKILL-HISTORY — they still carry it as "unproven."
- **Still unproven:** the Codex-quota-out → inline-Opus fallback (only triggers at the cap).
- **4 deferred Plan-A follow-ups:** apex-plan "DeepSeek can't fill gaps" spec-discipline recalibration;
  ADR-020 image-gate now moot (Codex/Opus sighted); apex-skill-author "author impl.md to the Flash
  floor"; Artemis's standalone runbook → migrate to mechanic A.
