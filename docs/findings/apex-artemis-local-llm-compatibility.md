# Finding — Can APEX work on Artemis under the local-LLM expansion plan?

> **Superseded context (2026-07-19).** The mechanism this finding turns on — APEX detecting
> planning↔coding mode from the substring `deepseek` in `ANTHROPIC_BASE_URL`, with a write-guard
> that lifts in coding mode — no longer exists. Modes, `APEX_MODE`, and the write-guard were all
> removed (ADR-038); DeepSeek is archived (ADR-027, recovery-only); the coder is now Codex
> `gpt-5.6-sol` dispatched per task. The standing recommendation below ("keep 'deepseek' in the
> route", explicit `APEX_MODE` detection) is therefore moot. Kept as a dated record.

_Date: 2026-06-13 (session 37). Planning-mode analysis (no spec, no code)._

**Source plan analysed:** `~/artemis/docs/research/2026-06-13-local-llm-expansion/_SYNTHESIS-PLAN.md`
(Artemis's plan to future-proof for local DeepSeek coding + Kimi-class big-context on a tailnet
inference box, M5 Mac Mini as orchestrator; all three decisions A/B/C resolved 2026-06-13).

The question: does **APEX-the-dev-system** keep working when Artemis's *coding backend* goes local?

## Verdict: YES — zero APEX changes required today.

APEX has exactly **one** hard coupling to the backend, and the Artemis plan was written knowing it
and preserves it:

- **The coupling:** APEX detects planning↔coding mode by the substring `deepseek` appearing in
  `ANTHROPIC_BASE_URL` (SessionStart hook + global CLAUDE.md §5). Coding mode → write-guard lifts.
- **Plan preserves it:** §3.3 — "keep the local route's URL/alias containing 'deepseek' (or amend
  the detection rule)"; §7.1 — "the alias for the coding backend keeps 'deepseek' in its route name
  while APEX's mode detection depends on it."

So as long as the local coding route keeps `deepseek` in its URL/alias, the planning/coding split
keeps working unchanged.

## Why the fit is good (not merely compatible)

| APEX dependency | Plan's provision | Verdict |
|---|---|---|
| Mode detection (`deepseek` in URL) | Explicitly preserved (§3.3, §7.1) | designed-for |
| Claude Code needs an **Anthropic-compatible endpoint** | LiteLLM Anthropic passthrough / `claude-code-router` / vllm-mlx native `/v1/messages` (§3.1–3.3) | covered |
| apex-code assumes a **weak executor** (surgical specs, no-why, Karpathy pre-flight, dual review) | Plan's honest caveat: local sub-V4-Flash models "workable, not optimal," drift on long tasks (§3) | APEX is *already* built for this profile |
| Quality escape hatch | Fallback chain remote box → Mini-local small → **cloud DeepSeek** (§3.2) | matches APEX hybrid interim (ADR-016) |
| `cross_model_review` (Mac-gated — needs Claude+DeepSeek co-located) | Local DeepSeek on tailnet + Claude planning | becomes runnable |

## Three watch-items (APEX-side, none blocking)

1. **The `deepseek`-substring detection is brittle.** A string match on a URL: if a future alias
   (`artemis-coder`) ever drops "deepseek", APEX silently flips to *planning* mode and the
   write-guard blocks all code edits. Plan's mitigation (keep "deepseek" in the route) works, but
   the durable fix is an explicit `APEX_MODE` env var instead of substring-matching — which is
   **already on the books as ADR-016 P5** ("backend-routing rewire: LiteLLM + `APEX_MODE`/URL-prefix
   mode detection"). The Artemis plan's `EXP-a` (remote-inference routing) and APEX's ADR-016 P5 are
   the same seam from two sides.
2. **Context-window open question** (does coding mode actually receive the full window?) now points
   at the *local* LiteLLM→SGLang/vllm-mlx serving path instead of a third-party DeepSeek proxy —
   **more** controllable (you own the served `--max-model-len`). The empirical probe in
   `apex/docs/status.md` still applies, against your own box.
3. **Most APEX Mac-gated deferrals unblock here.** apex-swift recipe validation, destructive-command
   guard, cross-model-review executable path, and the context probe all need the live Mac/coding env
   this plan's hardware provides. The plan is what retires that backlog.

## Bottom line / next action

No APEX change required today (keep "deepseek" in the route). The one worthwhile hardening —
explicit `APEX_MODE` detection to replace/augment the substring match (= ADR-016 P5) — is the
natural APEX-side companion to the Artemis plan's `EXP-a`, to be drafted when a hardware trigger
(T1/T2/T3) fires. Parked until then.
