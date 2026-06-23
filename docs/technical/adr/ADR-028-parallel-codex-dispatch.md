# ADR-028 — Parallel Codex dispatch within a wave

Status: **Accepted** — 2026-06-23 (session 62). **Extends** ADR-027 (Codex-primary / Opus-fallback)
and ADR-026 (Codex as an in-session `codex exec` subprocess). Narrows ADR-027's "Codex is sequential,
so Codex-primary loses DeepSeek's parallel-wave default" consequence: parallelism is re-introduced for
the Codex path via concurrent subprocesses (not Workflow fan-out).

## Context
Under ADR-027 the Opus `APEX_MODE=coding` host dispatches one `codex exec -p apex-coder` subprocess per
task, **sequentially**, and the workflow/`apex-build-wave.js` fan-out path (which spawns Claude-Code
subagents) cannot drive the external Codex CLI. So a dependency wave of N independent tasks runs N Codex
subprocesses back-to-back even though they share no files — wall-clock = sum of the tasks, not the
slowest one. The host is otherwise idle while each Codex runs.

Codex subprocesses are OS processes, not Claude subagents, so the host **can** launch several at once
(Bash `run_in_background`) and collect them. The unlock is purely host-side orchestration; nothing in
the Codex CLI or auth changes.

Two costs make naive concurrency unsafe: (1) each `codex exec` runs the full local toolchain (build,
test, lockfile mutation) so same-tree concurrency collides on build artifacts, ports, and — on this
Windows host — the restricted-token sandbox ACL lock (see apex-code § Windows sandbox artifact
ownership); (2) Codex is far heavier per process than a Claude subagent, so the safe concurrency ceiling
is much lower than the Workflow's `min(16, cores−2)`.

## Decision
1. **Parallel Codex within a wave.** When the coder is Codex (the default) and a dependency (sub-)wave
   has **2+ independent `▸codex` tasks**, the host launches them as **concurrent background
   `codex exec` subprocesses** instead of sequentially. Barrier between waves is unchanged (the existing
   dependency-wave model already guarantees within-wave independence).
2. **Concurrency cap — machine protection, not a quota device.**
   `max_parallel_codex = max(1, min(4, floor(physical_cores / 2) − 1))` → **3** on this host
   (8 physical / 16 logical cores). Auto-sized from cores; default to **3** when core detection is
   unavailable. Overridable per spec (`max_parallel_codex: <n>`, `1` = sequential = ADR-027 behaviour).
   Waves wider than the cap split into sequential sub-waves of ≤cap (mirrors the existing `worker_cap`).
3. **Isolation = git-worktree-per-task.** Each parallel Codex task runs in its own managed git worktree
   on a throwaway branch (`codex exec -C <worktree>`), so concurrent recipes never collide. Integration
   back to the main tree is by **`git checkout <branch> -- <task's files>`** (disjoint files → no
   conflict, and **not** `git merge`, which is a hard block). Worktrees are torn down after integration.
4. **Collect → integrate → verify.** Wait for all subprocesses in the sub-wave; integrate each task's
   files; then run the spec's Verification Recipe **once on the integrated main tree** as the
   authoritative gate (Codex self-verifies inside its own worktree; the integrated re-verify catches
   cross-task issues such as a project-wide typecheck).
5. **Quota economics — the cap is a rate dial, not a budget cap.** Parallel builds the *same* tasks →
   the **same total Codex tokens**, just at a faster rate. The weekly cap is identical either way; rate
   only matters for the 5-hour rolling window. Most single-spec builds fit one window, so parallel ≈
   free wall-clock speed.
6. **Failure / fallback (ADR-027 unchanged).** A Codex subprocess that exits non-zero / rate-limited →
   that task falls back to Opus (host builds it inline). A quota-out on any subprocess means the pool is
   dead → stop launching further Codex, fall back the remaining sub-wave tasks to Opus (sequential). A
   task that won't converge after honest recovery → fork (capture-at-halt).

## Consequences
- **Wall-clock win** on multi-task waves: a 3-independent-task wave finishes in ~one task's time instead
  of three. Single-task and fully-sequential specs are unchanged (cap or independence gate not met).
- **Worktree overhead** per parallel task (checkout + teardown). Bounded by the cap (≤3) and only paid
  when a wave actually fans out. Same-tree (no worktree) was rejected — see below.
- **Windows sandbox residue:** a worktree whose Codex subprocess wrote sandbox-SID-owned cache dirs can
  resist `git worktree remove`. Mitigated by the existing apex-coder cache suppression + the
  codex-exec cleanup trick (apex-code § Windows sandbox artifact ownership); `--force` then codex-cleanup
  is the teardown path.
- **Still single-vendor / sequential-on-fallback:** the Opus fallback path stays inline-sequential
  (ADR-027); only the Codex path parallelizes. No change to vendor dependency or governance surface.
- **No Workflow rebuild:** `apex-build-wave.js` is untouched (it remains the Opus-fallback fan-out path).
  Parallel Codex is orchestrated entirely by apex-code via Bash.

## Alternatives rejected
- **Shared-repo, disjoint-files (no worktree)** — lighter (no checkout/teardown), but concurrent
  artifact-producing recipes race on `dist`/ports/lockfiles, and the Windows sandbox ACL lock bites
  under concurrency. Rejected for safety; worktree isolation is the settled choice.
- **Drive Codex through `apex-build-wave.js` / Workflow fan-out** — impossible: `agent()` spawns
  Claude-Code subagents, which cannot invoke the external Codex CLI. The whole reason parallel Codex is
  host-orchestrated.
- **`git merge` of worktree branches** — a permanent hard block, and unnecessary for disjoint files;
  `git checkout <branch> -- <paths>` integrates surgically without it.
- **Uncapped / Workflow-sized concurrency** — each `codex exec` runs the full toolchain; uncapped
  concurrency exhausts the box. The low auto-sized cap is the machine-protection floor.
