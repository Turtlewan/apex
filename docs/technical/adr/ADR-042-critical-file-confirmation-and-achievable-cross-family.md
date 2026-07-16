# ADR-042 — Two-layer critical-file confirmation and achievable cross-family review

- **Status:** Accepted
- **Date:** 2026-07-17
- **Supersedes/refines:** ADR-032 (cross-family review invariant); refines apex-governance § Critical files and § Evaluator independence.
- **Source:** `docs/research/apex-v2-joint-audit-2026-07-15.md` findings #3 and #7.

## Context

Two joint-audit BLOCKs share the property that governance states a rule as prose and the
mechanism enforces something weaker.

**#3 — critical-file confirmation is prose only.** Governance says critical files (migrations, auth,
CI, lockfiles, hooks, permission settings, secrets) always need confirmation and *"an authorising
spec does not settle it."* But `apex-code` treats everything in a spec's `## Permissions` as
pre-authorised, and `codex-dispatch.ps1` accepts any `-Authorized` path into a non-interactive
workspace-write dispatch. The stronger rule has no mechanism. The core obstacle is structural: the
wrapper is a **non-interactive subprocess**, so the *human* confirmation cannot live inside it — a
switch it reads can be set by anything that launches it, including spec text.

**#7 — cross-family review breaks exactly when the fallback fires.** Codex quota exhaustion is what
makes Opus build — and Codex is then also the unavailable reviewer, while the always-on
`apex-reviewer` is pinned `model: sonnet` (same family as an Opus builder). The global
"cross-family, always" promise is unachievable on that path. `codex-dispatch.ps1` additionally
hardcodes `-m gpt-5.6-sol`: every wrapper dispatch is OpenAI, and the Opus fallback build is an
in-session worker that never touches the wrapper (ADR-038). So no single "coder model" parameter
reaches the wrapper — the family of a wrapper-run worker is knowable, the family of an in-session
worker is known only to `apex-code`.

## Decision

**#3 — two layers, because the human gate cannot live in the subprocess.**

- **Two tiers, matching governance.** The classifier distinguishes **TIER-1 HARD-BLOCK** — a
  `docs/audit/` edit, which governance §77 forbids at every level (signal: exit 11 / `HARDBLOCK`) and
  which `-CriticalFilesConfirmed` **never** overrides — from **TIER-2 CRITICAL** (§100-103), which is
  confirmable (signal: exit 10 / `CRITICAL`). Folding the hard block into the confirmable set would
  let a switch clear a permanent prohibition; the tiers keep them distinct.
- **Layer A (skill, interactive).** `apex-code`'s pre-dispatch step classifies each task's
  `-Authorized`. Hard-block → refuse the task outright. Critical + **attended** → an interactive
  confirmation the user answers (spec text cannot satisfy it), then dispatch with
  `-CriticalFilesConfirmed`; critical + **AFK / dontAsk / autonomous** → **park and surface**, do not
  dispatch.
- **Layer B (wrapper, mechanical backstop).** `codex-dispatch.ps1` pre-flight classifies
  `-Authorized` with the **same** script; a hard-block, a critical match with no switch, a
  `-ScopeUnlocked` build with no switch, or a missing classifier → **refuse (exit 76)** before
  reservation, no ledger row, no log — the framing of exit 72/74. Layer B is a mechanical backstop: it
  ensures a switch was *passed*; it cannot verify a boolean's human provenance — that is Layer A's job,
  and an autonomous run parks precisely because it has no human to say yes. A spec's `## Permissions`
  text never sets the switch.
- **One shared definition.** The classifier lives in a single executable file,
  `apex-critical-files.ps1`; every layer calls it. Divergent copies fail open — the lesson this
  harness keeps paying for — so there is exactly one. Governance § Hard blocks + § Critical files
  remain the human-readable canonical source; the integrity sweep (audit #11) reconciles the two.

**#7 — record family, gate at completion, no third model family.**

- The wrapper records `builder_family` on a build-phase dispatch and `reviewer_family` on a
  review/end-gate dispatch, each **derived from the model it launches** (`codex`/`gpt*` → `openai`;
  `opus`/`sonnet`/`haiku`/`claude*` → `anthropic`). Because the wrapper only ever launches
  `gpt-5.6-sol`, these are `openai` for every wrapper dispatch; the anthropic side (Opus fallback
  build, Claude `apex-reviewer`) is in-session, and `apex-code` **records its family to the same
  ledger** as a terminal-status annotation row at the worker's completion, so the gate reads it as a
  durable fact rather than re-deciding it at grading time.
- **The gate is an executable script, not a prose self-check** (audit #4's anti-pattern).
  `apex-family-gate.ps1` reads the ledger and exits pass/refuse; `apex-code`'s completion step **runs
  it** like the M3 validator. It **derives the selected build from the ledger** (the latest
  terminal-success build row — no caller-supplied SHA to point it at the wrong diff), counts only
  **terminal-success** rows (a failed attempt or crashed reviewer cannot satisfy it), takes
  `builder_family` from that selected build, and counts a review only when its **non-empty**
  `reviewed_run_id` equals the selected build's **non-empty** `run_id` AND its `reviewer_family` is a
  *known* family (`openai`/`anthropic`) differing from the builder's. It refuses (exit 12) when no
  such build-bound cross-family review and no build-bound attended human review exist; a stale review
  of an earlier build, an `unknown`/empty family, or an empty run_id never satisfies it. No valid
  terminal build (missing, unknown family, or empty run_id) → fail closed (exit 13).
  **AFK → park.** Same-family *automated* review may stay advisory but cannot satisfy the gate.
- The "cross-family, always" promise is reworded to the achievable policy: cross-family when both
  families are available; on same-family fallback, a diff-bound attended human review substitutes.

## Consequences

- A critical-file edit now requires a human "yes" that no spec, prompt, or config can forge —
  enforced twice, once where the human is (Layer A) and once where the machine is (Layer B).
- The cross-family guarantee degrades honestly instead of silently: it names the fallback and demands
  a human in the loop rather than accepting same-family review as if it were independent.
- No new model family, no new quota surface. The wrapper stays hardwired to `gpt-5.6-sol`; the family
  fields describe what it launched, and the gate combines them with the in-session family rows
  `apex-code` records to the same ledger — read as durable facts by a script, never re-judged at
  grading time.
- Exit **76** is added to the wrapper contract (critical-file gate refused). #7 adds no *wrapper* exit
  code — its gate is `apex-family-gate.ps1`'s own exit space (0 pass / 12 same-family / 13
  unverifiable), read by the completion step, not a dispatch refusal.
