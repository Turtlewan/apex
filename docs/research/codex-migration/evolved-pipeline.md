# Evolved pipeline — GPT-5.5 replaces Opus as the high-end coder

_Session 60, 2026-06-22. Builds on codex-as-reviewer.md. The flow the user is converging on._

## The move
Replace the **Opus 4.8 coding ceiling** (ADR-024/025: the text-coding top tier + the gated
Pro→Opus escalation) with **GPT-5.5 (Codex)**. Because Codex is sighted, this also folds in the
**Sonnet 4.6 image-only tier**. Net: Opus *and* Sonnet exit the coder set.

**Router collapses:** `{DeepSeek Flash, DeepSeek Pro, Sonnet, Opus}` → `{DeepSeek Flash/Pro (cheap),
GPT-5.5 (hard tasks + all visual work)}`.

## Why GPT-5.5 beats Opus for the coder-ceiling role
- **Cheaper:** $5/$30 vs Opus $15/$75 — ~⅓ the cost for the top tier. [WS-D, HIGH]
- **At least as strong a coder** — Codex/GPT-5.5 is purpose-built for agentic coding; on coding
  specifically it's a peer-or-better to Opus, not a downgrade.
- **Sighted** — removes the image gate, so it covers Sonnet's old image tier too.
- **Kills the ADR-025 soft-pool-starvation risk — the big one.** Opus-as-coder ("Claude coding mode")
  draws the *same Max subscription pool as planning*, and the Opus weekly cap is your scarcest
  resource. Coding with Opus literally starves planning. **GPT-5.5 codes from a separate Codex/ChatGPT
  pool → planning's Opus budget is never touched by the build.** This is the cleanest possible
  resolution of the soft-pool guard.

## The mechanism (same enabler as the reviewer)
`codex exec --sandbox workspace-write -m gpt-5.5 "implement <task> per <spec>; run <verify-recipe>"`
— its own process/auth, doesn't read `ANTHROPIC_BASE_URL`, callable from the build session via Bash.
- **Escalation ceiling = usually ONE hard task, sequential** → a single `codex exec` call. Clean. Does
  **not** require the Workflow rebuild (that gap only bites on parallel fan-out of Codex coders).
- Parallel Codex coders *would* hit the orchestration-rebuild question — so keep DeepSeek for the
  parallel bulk and use GPT-5.5 for the hard single tasks where escalation already serialised anyway.

## ⚠️ The trap: Codex can't both BUILD and REVIEW the same task
If GPT-5.5 writes a task and Codex (GPT-5.5) then reviews the diff, that task gets **same-family
self-review** — it breaks the evaluator-independence invariant (apex-governance / Odysseus
anti-collusion) that made the reviewer attractive in the first place.

**Resolution — family-aware review routing (reviewer family ≠ builder family, per task):**
- **DeepSeek-built tasks → Codex reviews** (cross-family ✓).
- **GPT-5.5-built tasks → Claude (Opus) reviews** (cross-family ✓).

This is symmetric and elegant: **Opus shifts from coder → reviewer of the Codex-built hard tasks.**
That's a *lighter* Opus load than coding (read-only, advisory, one pass) — far cheaper on the scarce
pool than having Opus write the code. Every task still gets an independent cross-family review.

## The evolved 3-family pipeline
```
PLAN     Claude Opus            (strongest reasoner; planning only)
BUILD    DeepSeek Flash/Pro     → bulk + parallel waves   (cheap)
         GPT-5.5 (Codex)        → hard tasks + all visual (replaces Opus & Sonnet)
REVIEW   Codex (GPT-5.5)        reviews DeepSeek-built tasks
         Claude Opus            reviews Codex-built tasks   (family ≠ builder)
```
Three vendors, no task built and reviewed by the same family, the scarce Opus pool spent only on
planning + light review — never on coding.

## Honest caveats
- **A Codex-built task runs in Codex's own agent loop**, outside apex-code's enforcement (Karpathy
  pre-flight, surgical-scope lock, wave review). For a single escalation task that's acceptable; for
  broad use you'd encode the guardrails into the `codex exec` prompt + the repo's `AGENTS.md`. This is
  the migration question creeping in at the edges — fine if it stays scoped to the ceiling.
- **Two build-side billing pools now** (DeepSeek API + Codex/ChatGPT window/key). Manageable, but
  watch the ChatGPT 5-hour window if GPT-5.5 does both hard builds and reviews.
- **Pin `gpt-5.5`** — Codex churns model IDs fast.
- This is incremental migration by stealth: reviewer → ceiling-coder → … Exactly the "pilot, don't
  big-bang" path, discovered organically. Good — just name it as such so it's a choice, not drift.
```
