# Effort levels per role — study (2026-09-27)

Feeds `docs/drafts/role-redesign.md`. Three cheap retrievers (Anthropic docs, OpenAI/Codex, local
evidence). Raw notes: session scratchpad (`effort-anthropic.md`, `effort-openai.md`), not kept.

## Evidence

**Anthropic** (primary: platform.claude.com/docs/en/build-with-claude/effort, fetched 2026-09-27)
- Levels: low / medium / high / xhigh / max. Defaults: Opus 5.5 = **medium**; Sonnet 5 = high;
  Fable 5.1 = high.
- The docs warn that `max` "adds significant cost for relatively small quality gains ... can lead to
  overthinking".
- Changing effort at the top level mid-conversation **invalidates the prompt cache**. Per-message
  effort (beta, Opus 5.5 / Fable 5.1) preserves it.
- Secondary (llm-stats): Opus 5.5 at medium beats Opus 5 at max on CursorBench and FrontierCode.
- Anecdote (dev.to, ~mid-Sept): max took 8× the cost and 9× the time for the same 57/57 result as low.

**OpenAI / Codex** (openai.com returned 403; OpenAI claims come from search snippets, so lower confidence)
- Codex guidance (learn.chatgpt.com):
  - low: "clear, contained, low risk, easy to verify"
  - medium: complex work and debugging
  - high: multi-file work and refactors
- Secondary (note.com, 2026-09-23): gains are **non-monotonic**. High→xhigh adds +2.0 on DeepSWE and
  is *worse* on AutomationBench (14.5→12.6).
- Anecdote (codex issue #46645, 2026-09-19): **Astra at low effort used ~50% of a 5-hour quota** in
  one request.

**Local** (measured)
- Sol plan-check at `max`: 54–63 min per run, quota exhausted
  (`docs/research/artemis-retro-2026-07-29.md:136`, `:77`).
- Changed to `xhigh`, where reads took ~12.7 min (`artemis-rework-evidence.md` §1).
- Coder default `medium` is provisional (`spec-template.md:14`). The 10-spec medium-vs-high bakeoff
  (P7 a3) **was never run**.
- ADR-030 ladder on verify failure: medium → high → xhigh (→ max → ultra, never a default).
- Earlier Sol research: medium had the highest functional success on coding
  (`sol-effort-levels-2026-07-29.md`).

## Conclusion (host synthesis)

Effort follows **risk and difficulty**, not role prestige. Never default to `max`. Raise effort only
when something fails (the ADR-030 ladder).

| Role | Proposed effort | Raise to |
|---|---|---|
| Steward (Opus 5.5 host) | medium, held constant (cache) | high, per message, for adjudication |
| Proposer (Opus 5.5) | high | xhigh when escalating (after a park) |
| Architect check (gpt-6-sol, per role-redesign item 35; Astra trial later) | xhigh | — |
| Builder (gpt-6-sol) | medium; low for Trivial | high → xhigh (ADR-030 ladder) |
| Critic Low / Medium (Sonnet 5) | medium / high | — |
| Critic High (Opus 5.5) | high | xhigh on a third strike |
| Scribe (gpt-6-luna) | low | medium on a validation failure |

**What would flip this:**
- The P7 a3 bakeoff showing high beats medium for the Builder.
- Astra quota measured on your plan making even `high` unaffordable (then the Architect check moves
  to gpt-6-sol at xhigh).
- Opus 5.5 at medium proving too shallow as proposer in the planning bake-off.
