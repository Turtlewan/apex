# ADR-027 — Codex-primary coding, Opus manual fallback, DeepSeek archived

> **Model updated by [ADR-034](./ADR-034-sol-default-coder.md) (2026-07-13):** the default coder is now
> **`gpt-5.6-sol`**, not `gpt-5.6-terra`. This ADR's *shape* is intact — one frontier coder, one effort dial,
> Opus as the manual quota-out fallback, DeepSeek archived — only the model string changed.

Status: **Accepted** — rolled out. **Mechanic A proven live 2026-06-22** (session 61): the Opus
`APEX_MODE=coding` host dispatched `codex exec -p apex-coder` per task end-to-end — Codex built files
and the verify recipe passed (evidence `~/.codex/history.jsonl`; pilot `docs/probes/codex-pilot-results.md`).
The Codex-quota-out → inline-Opus fallback path is still unexercised (only triggers at quota exhaustion).
Parallelism within a wave added by ADR-028.
Date: 2026-06-22 (session 61). **Promotes** ADR-026 (Codex ceiling → primary coder); **supersedes**
ADR-019 (DeepSeek Flash/Pro tiers) and **ADR-016's local-inference end-state** (abandoned — Codex is
cloud-only); **collapses** the ADR-024 multi-model router to a single proactive coder; **redefines**
ADR-025's Claude-coding mode as the Opus-quota fallback mechanism; **re-instates** the ADR-025 soft-pool
guard, scoped to the fallback state.

## Context
ADR-026 (same day) made Codex (`gpt-5.5`) the ceiling coder + independent reviewer, with DeepSeek
Flash/Pro as the everyday coders and the soft-pool guard discharged (Codex spends a separate OpenAI
pool). A real Codex pilot + the seamless `apex-coder` profile proved Codex is a strong, low-friction
coder on this host. The user's chosen flow: **Codex builds everything; when its ChatGPT quota runs out,
manually fall back to Opus.** DeepSeek is no longer wanted in the active loop, and the fully-local
inference aspiration (ADR-016) is abandoned because Codex is cloud-only with no local path.

## Decision
1. **Codex (`gpt-5.5`) is the PRIMARY / default coder.** `coder_models` default menu → `[codex]`.
   Promoted from ADR-026's ceiling role.
2. **Opus is the MANUAL fallback coder** when Codex quota is exhausted — via **mechanic A**: an Opus
   `APEX_MODE=coding` host session (apex-code) dispatches `codex exec -p apex-coder` per task; on
   Codex quota-out the **same host builds the task inline as Opus**. No session restart, no backend
   swap. The switch is operator-driven, not auto-escalation. This keeps Codex **inside** the APEX
   harness — the host owns verify, family-aware review, docs, and the In-Flight checkpoint (resolves
   ADR-026's "Codex outside APEX" + "no checkpoint on quota-out mid-spec" gaps).
3. **DeepSeek (Flash + Pro) is ARCHIVED / PARKED — recoverable, not deleted.** PS launchers parked
   (renamed/commented), hook `*deepseek*` branches left inert, legacy `coder_tier` mappings kept behind
   an "archived" note, `DEEPSEEK_API_KEY` retained. Reversible by un-parking.
4. **Planning stays Opus** (unchanged).
5. **The fully-local inference goal (ADR-016) is ABANDONED.** Codex is cloud-only (OpenAI Responses
   API); there is no local path without re-introducing a local model. Removed from the active roadmap.
6. **Cross-model review stays family-aware** (reviewer family ≠ builder): Codex-built → **Opus**
   reviews (the common path); Opus-built (fallback) → **Codex** reviews. If Codex quota is exhausted —
   the very trigger for the Opus fallback — cross-model review of Opus-built tasks **degrades to
   single-model + human flag** (cannot review on an exhausted pool).
7. **Soft-pool guard RE-INSTATED, scoped to the fallback state** (warn, not block). In steady state
   the draw on the scarce Max weekly pool is light-but-nonzero (host orchestration + Opus reviewing
   Codex-built code). When the build falls back to Opus, Opus builds draw the **same Max weekly pool
   as planning** — surface remaining planning headroom at the switch; prefer parking or splitting the
   build over draining the shared pool.

## Consequences
- **Simplification:** per-task routing collapses to "codex unless quota → opus" — the ADR-024
  complexity rubric and DeepSeek wave-batching dissolve. Steady-state coding bills a single OpenAI pool.
- **Costs / risks:**
  - **Single-vendor coding dependency** — Codex CLI + OpenAI auth + `gpt-5.5` model-ID pinning (ID churn
    flagged in ADR-026). Archiving DeepSeek removes the vendor diversity the multi-model router gave.
  - **Loss of the cheap, pool-neutral bulk coder** and the "no cloud dependency" aspiration (ADR-016).
  - **Throughput:** Codex is sequential, so Codex-primary loses DeepSeek's parallel-wave default;
    parallelism (workflow fan-out) survives only on the Opus-fallback path.
  - **Pool contention during fallback:** a large Opus-fallback build can starve subsequent planning in
    the same Max weekly window — the re-instated guard mitigates by discipline, not enforcement.
- **Mechanic A upside:** one host, two execution channels (codex subprocess vs inline-Opus), manual
  toggle — Codex runs under full APEX governance instead of a bare standalone CLI.

## Alternatives rejected
- **Standalone Codex CLI as the system primary (option B)** — leaves Codex fully outside the harness
  (no verify/review/handoff/checkpoint). Rejected as the default; retained only as Artemis's interim
  per-spec runbook until it migrates to A.
- **Keep DeepSeek as the bulk coder** — preserves vendor diversity + a cheap, planning-pool-neutral
  pool, but keeps the dual-backend complexity this shift removes. User chose a single strong coder.
- **Keep pursuing local inference (ADR-016)** — no local target exists without re-introducing a local
  model; incompatible with archiving DeepSeek. Abandoned.
