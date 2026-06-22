# Codex as a pipeline reviewer (not a migration)

_Session 60, 2026-06-22. The lowest-risk, highest-value way to bring Codex in — additive to the
existing APEX/DeepSeek build pipeline, fully reversible._

## Why this is the best entry point
- **Additive & reversible** — bolts onto the *review* phase; the DeepSeek/Claude build path is untouched.
  Delete the flag and it's gone. None of the migration's hard parts apply (no backend swap, no Workflow
  rebuild, no skill port, no AGENTS.md cap).
- **It realizes something APEX already built.** ADR-015 / the `cross_model_review: true` spec flag
  (wired session 32) was *designed* to dispatch an independent 2nd review on the **other model family**
  — but was tagged **Mac-gated** because it assumed two co-located Claude-family backends. **Codex
  removes that assumption.** This operationalizes cross-model review on Windows, today.
- **True evaluator-independence** (apex-governance / Odysseus anti-collusion): an OpenAI model reviewing
  DeepSeek/Claude output is a genuinely independent family — exactly the anti-correlation the invariant
  wants. Stronger than same-family dual review.
- **Codex is good at this** — it ships a dedicated review surface (`@codex review`, P0/P1 focus,
  `@codex fix it`) and structured headless output.

## The key enabler (why it "just works" here)
`codex exec` is **its own process with its own auth** (`~/.codex/auth.json`, ChatGPT mode — already set
up here). It does **not** read `ANTHROPIC_BASE_URL` (that's a Claude-Code/Anthropic env var; Codex is
OpenAI's tool). So a DeepSeek-backed apex-code session can shell out to `codex exec` and get a real,
independent review — no co-located second backend, no Mac. The old Mac-gate dissolves.

## Mechanism A — headless post-build review (PRIMARY)
After a build/wave completes, apex-code shells out:

```
codex exec --sandbox read-only --json --output-schema review-schema.json \
  "Review the current git diff against these acceptance criteria: <criteria>.
   Return findings as BLOCK / FLAG / CLEAN with file:line + rationale, cited to the criterion."
```

- `--sandbox read-only` → reviewer can't write; zero blast radius.
- `--output-schema` → schema-enforced structured findings (mirror `apex-wave-reviewer`'s
  BLOCK/FLAG/CLEAN shape) so APEX surfaces them in the existing review-report slot.
- **Advisory only** — never auto-applies fixes; findings route into the normal recovery loop, exactly
  like `apex-reviewer` today. (Don't wire `@codex fix it` — keep the reviewer non-mutating.)

## Mechanism B — GitHub PR bot (async complement)
For builds that land on a PR: `@codex review` auto-reviews the PR (honors AGENTS.md), `@codex` mentions
for follow-ups. Complements A for the async/cloud path. Compatible with APEX's hard-block (review only;
no auto-merge, no push-to-main). Needs the GitHub app installed on the repo.

## Mechanism C — Codex-as-MCP (not preferred)
`codex mcp-server` exposes `codex`/`codex-reply` as MCP tools Claude Code could call. More plumbing than
A for no real gain at review time. Skip unless you want Codex callable mid-session for other reasons.

## Where it wires into APEX (small, contained)
1. **Realize `cross_model_review`** (or add `codex_review: true`) in the spec template → apex-code's
   existing post-build review dispatch fires Mechanism A when set. Re-tag the flag from "Mac-gated" to
   live-on-Windows.
2. **Permissions:** add `Bash(codex exec:*)` to the coding allowlist (and — per the dontAsk SPOF
   lesson, sessions 54–57 — ensure it's in `permissions.allow` so a `dontAsk` build doesn't silently
   deny it).
3. **Artifacts:** a `review-schema.json` + a review prompt template (reusable, lives with apex-code).
4. **apex-governance note:** record Codex as a sanctioned independent evaluator; gate it per-spec
   (high-risk: auth/security/data + anything you want a second pair of eyes on), not every build.

## Gating, cost, caveats
- **Per-spec, not always-on.** One review pass is cheap vs a build, but on a ChatGPT plan it burns a
  turn from the 5-hour window; on an API key it's metered. Reserve for high-risk / pre-PR builds (same
  posture as the `/code-review ultra` recommendation).
- **Pin the model** (`-m gpt-5.5` or a `codex_review` profile) — Codex churns model IDs fast.
- **Advisory floor stays:** Codex findings are input to your sign-off, not a gate that blocks the
  pipeline on a third-party model's opinion. A BLOCK from Codex surfaces loudly; you decide.

## What it would take to ship (rough)
Tiny relative to the migration: 1 permission-allow entry, 1 schema + 1 prompt template, 1 apex-code
dispatch step (mostly already exists via the `cross_model_review` plumbing), 1 apex-governance line, 1
flag re-tag. A single small spec — and a one-build pilot to confirm `codex exec --json` returns clean
structured findings on this machine.
```
