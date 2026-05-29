# Research: Should SKILL.md / impl.md be authored differently per model?

**Date:** 2026-05-29
**Confidence:** HIGH (Anthropic + DeepSeek primary docs) / MEDIUM (model-comparison blogs)
**Re-research after:** 2026-06-12 (AI/LLM tooling — 14-day clock)

## Summary

Instructions **should** differ by model, and APEX already encodes the right
differentiator: the `SKILL.md` (Claude / judgment / planning) vs `impl.md`
(DeepSeek / execution / coding) split. The research validates that split. The
finer Flash-vs-Pro and Sonnet-vs-Opus tiering does **not** justify forking files
per model — author each file to the *weakest model that reads it* (Flash for
`impl.md`; Opus-4.8-literalism-safe for `SKILL.md`).

## Key findings

- Claude responds well to clear/explicit instructions and **generalizes from the
  *why*** — give it intent and rationale, it infers the rest.
  [VERIFIED — platform.claude.com prompting best practices]
- **Opus 4.8 interprets prompts literally; it does NOT silently generalize an
  instruction from one item to another, nor infer requests you didn't make.** You
  must state scope explicitly ("apply to every section, not just the first").
  [VERIFIED — Anthropic, "More literal instruction following"]
- Opus 4.8 calibrates verbosity to judged task complexity and respects the
  `effort` parameter strictly (scopes work tightly at low/medium).
  [VERIFIED — Anthropic]
- Sonnet 4.6 is "slightly more willing to proceed with inferred assumptions to
  maintain conversational efficiency" and compresses reasoning unless told to
  expand. [COMMUNITY — emergent.sh, nxcode.io]
- DeepSeek reasoning model: keep system prompts minimal, put instructions in the
  user prompt, temperature/top_p are ignored.
  [VERIFIED — api-docs.deepseek.com reasoning_model guide]
- DeepSeek V4 Flash (284B total / 13B active, latency-optimized) needs "more
  explicit scaffolding," "struggles with nuance" on judgment calls, and "starts
  to struggle in complex tool chains" (multi-step, state across calls, recovery
  from unexpected output). [COMMUNITY — MindStudio agent comparison, on-point]
- DeepSeek V4 Pro (1.6T total / 49B active) targets complex reasoning + agentic
  coding — much closer to Claude's autonomy than Flash. [VERIFIED — DeepSeek V4
  Preview, released 2026-04-24]
- Documentation rule of thumb (verbatim): *"For DeepSeek: write explicit schemas,
  detailed error paths, step-by-step orchestration. For Claude: focus on
  high-level intent; the model handles complexity more autonomously."*
  [COMMUNITY — MindStudio]

## The two independent axes

"Just use a bigger model and write less" is wrong because two axes move
independently:

| Axis | What it controls | Direction |
|------|------------------|-----------|
| **Judgment / quality** | How much hand-holding to produce good work | Opus & Sonnet need *less* than Flash; Pro sits between |
| **Scope literalism** | Whether the model spreads a rule across items on its own | Opus 4.8 needs scope stated *more* explicitly than Sonnet |

The trap: a more capable model (Opus 4.8) is **more** literal, so it needs
*more* explicit scope even while needing *less* scaffolding for quality.

## Model matrix for APEX

| Model | Role in APEX | Reads | Authoring stance |
|-------|--------------|-------|------------------|
| **Opus 4.8** | Planning (default) | `SKILL.md` | Judgment-framed prose OK; **state scope explicitly** (won't generalize a rule across 40 skills unless told). Don't over-scaffold mechanics. |
| **Sonnet 4.6** | Planning (fast) | `SKILL.md` | Same as Opus but tolerates more inference; tell it to expand reasoning if you need the steps shown. |
| **V4 Flash** | Coding (actual runtime) | `impl.md` | **The floor.** Explicit schemas, pre-decided choices, ≤2 tools/step, checkpoint + verify after each step, error paths. No judgment calls. |
| **V4 Pro** | Coding (heavy, if routed) | `impl.md` | Handles Flash-tuned content fine; over-specification doesn't hurt. No separate file. |

## Recommended approach

**Keep the SKILL/impl split and tune each file to its weakest reader — do not
fork files per model.**

1. **`impl.md` → author for V4 Flash (the coding-mode runtime).** Explicit
   schemas, pre-resolved decisions, copy-paste code, verification commands,
   short tool chains (≤2 tools), checkpoint after each step. Over-specification
   is safe for Pro; under-specification breaks Flash.
2. **Never put a judgment call in `impl.md`.** Flash fumbles "decide based on
   context." Either pre-resolve it in the spec or flag back to planning — the
   pattern `apex-figma` already uses for image-comparison steps.
3. **`SKILL.md` → judgment/principle prose is correct, but state scope
   explicitly.** Planning may run on Opus 4.8, which will not generalize "apply
   this rule" across the skill set unless the scope is named ("all skills",
   "every impl.md"). Give the *why* — Claude generalizes from rationale.
4. **No per-model file variants.** One `SKILL.md` + one `impl.md` per skill.
   The model differentiation is the *file-type* split, not a file-per-model fork.

### Caveat for any DeepSeek *reasoning*/DeepThink flow
If an APEX flow ever drives DeepSeek reasoning mode (not the chat/coding path),
keep injected system context light and don't over-prompt — DeepSeek docs note
heavy system prompts can slightly reduce reasoning performance, and sampling
params are ignored. Current coding mode uses the chat/execution path, so this is
a forward-looking note only.

## Assumptions / gaps

- [ASSUMED] APEX coding mode runs V4 Flash specifically (per project config
  "DeepSeek V4 Flash"); not re-verified against the live `ANTHROPIC_BASE_URL`
  target this session.
- Flash tool-chain limits ("5+ steps") are from a practitioner comparison, not a
  DeepSeek benchmark — treat the threshold as directional.
- No primary-source head-to-head on Flash vs Pro instruction-following exists yet;
  Pro guidance is inferred from its stated agentic-coding positioning.

## Sources

- Anthropic prompting best practices — platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- DeepSeek reasoning model guide — api-docs.deepseek.com/guides/reasoning_model
- DeepSeek V4 Preview (model specs, 2026-04-24) — api-docs.deepseek.com
- DeepSeek V4 Flash vs Claude Sonnet 4.6 for agents — mindstudio.ai/blog
- Claude Sonnet vs Opus 2026 — emergent.sh, nxcode.io
