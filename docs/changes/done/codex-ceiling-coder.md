---
spec: codex-ceiling-coder
status: draft
token_profile: balanced
autonomy_level: L2
---

# Spec (DRAFT — gated on the Phase-1 reviewer pilot): GPT-5.5 replaces Opus as coder ceiling + family-aware review

**Identity:** Swap the coder menu from `{flash,pro,sonnet,opus}` → `{flash,pro,codex}` (GPT-5.5 = hard +
visual ceiling, replacing Opus text-ceiling + Sonnet image-tier), and route review by *family ≠ builder*.
→ why: see docs/technical/adr/ADR-026-codex-third-model-family.md

> **DO NOT BUILD YET.** Gated on: (a) Phase-1 (`codex-reviewer.md`) shipped + piloted green; (b) Codex
> CLI confirmed installed/authed with `gpt-5.5` coder-capable; (c) a decision to retire Opus/Sonnet from
> the coder set. This draft captures the design so it's ready to finalize after the pilot.

## Where I stopped
- Decision reached: GPT-5.5 takes the coding ceiling (cheaper, sighted, off the scarce Opus pool);
  Opus shifts to reviewer-of-Codex-built-tasks; family-aware review is the new standing invariant.
- Next question to resolve: keep `opus`/`sonnet` selectable as a fallback coder, or remove entirely?
  (Lean: remove from coder menu; Opus stays only as planner + reviewer.)
- Open items: the parallel-Codex-coding case (needs the Workflow rebuild) is explicitly OUT — confirm
  the escalation ceiling stays single/sequential so a plain `codex exec` suffices.

## Assumptions
- `gpt-5.5` via `codex exec --sandbox workspace-write` can complete a scoped build task + run the
  Verification Recipe and return a usable diff → impact: Stop (the whole ceiling path). Pilot-verify.
- The ceiling/escalation case is ~1 sequential hard task → a single `codex exec` call (no fan-out) →
  impact: Caution (parallel Codex coding is out of scope; would need the Workflow rebuild).
- Guardrails (surgical scope, no-unrequested-work) can be carried by the `codex exec` prompt + repo
  `AGENTS.md` adequately for a single task → impact: Caution.

Simplicity check: simpler option = keep Opus as ceiling and only add the reviewer (Phase 1). Why this
version: Opus-as-coder is strictly worse (pricier, blind, pool-starving) — ADR-026 §Alternatives.

## Files to Change (provisional)
| File | Operation | Notes |
|------|-----------|-------|
| `C:/Users/User/apex/docs/status.md` | modify | `coder_models` → `{flash, pro, codex}`; note Opus/Sonnet out of coder set |
| `C:/Users/User/.claude/skills/apex-plan/SKILL.md` | modify | Routing: GPT-5.5 = hard + all-visual ceiling; emit `▸codex` tags; derive reviewer family from builder |
| `C:/Users/User/.claude/skills/apex-plan/references/model-routing.md` | modify | Update the 2-step select + emit-format for the 3-coder menu + family-aware review |
| `C:/Users/User/.claude/skills/apex-code/SKILL.md` | modify | Dispatch `▸codex` tasks via `codex exec --sandbox workspace-write`; family-aware review routing (DeepSeek→Codex review, Codex→Opus review) |
| `C:/Users/User/.claude/skills/apex-governance/SKILL.md` | modify | Opus out of coder set → ADR-025 soft-pool guard discharged; "builder family ≠ reviewer family" invariant |
| `C:/Users/User/.claude/skills/apex-orchestrate/templates/spec-template.md` | modify | `coder_model` menu values → include `codex`, drop `opus`/`sonnet` from coder list |
| `C:/Users/User/.claude/workflows/apex-build-wave.js` | modify | Add a `codex`-model dispatch branch (shell `codex exec`, not a Claude subagent) |
| `C:/Users/User/apex/docs/technical/adr/ADR-024-*.md`, `ADR-025-*.md` | modify | Supersession notes (coder-set change; soft-guard discharged) |
| `C:/Users/User/apex/SKILLS.md`, `SKILL-HISTORY.md` | modify | Index + history triple-write |

## Tasks (provisional — finalize post-pilot)
- [ ] Task 1: Update `coder_models` menu + status.md note — files: `docs/status.md`.
- [ ] Task 2: apex-plan routing for the 3-coder menu + family-aware reviewer derivation — files: `apex-plan/SKILL.md`, `apex-plan/references/model-routing.md`.
- [ ] Task 3: apex-code `▸codex` build dispatch (`codex exec --sandbox workspace-write`) + family-aware review routing — files: `apex-code/SKILL.md`.
- [ ] Task 4: apex-build-wave.js codex dispatch branch — files: `apex-build-wave.js`.
- [ ] Task 5: governance update (Opus-out, soft-guard discharge, family≠builder invariant) + template menu — files: `apex-governance/SKILL.md`, `spec-template.md`.
- [ ] Task 6: ADR-024/025 supersession notes + triple-write — files: `ADR-024-*`, `ADR-025-*`, `SKILLS.md`, `SKILL-HISTORY.md`.

> Split note: this exceeds 3 files / 2 phases — when finalizing, split into (2a) router+menu
> [Tasks 1,2,5] and (2b) build/dispatch wiring [Tasks 3,4] + (2c) docs [Task 6], or keep as one
> coordinated spec if executed in a single Claude skill-edit session. Decide at finalize time.

## Acceptance Criteria (provisional)
- [ ] `coder_models` = `{flash,pro,codex}` → verify: status.md + template agree; no `opus`/`sonnet` in the coder list.
- [ ] A `▸codex` task builds via `codex exec --sandbox workspace-write` and produces a verified diff → verify: pilot build on one hard task.
- [ ] Family-aware review holds → verify: a DeepSeek-built task is reviewed by Codex; a Codex-built task is reviewed by Opus; no task is reviewed by its own builder family.
- [ ] Soft-pool guard discharged → verify: apex-governance states Opus is no longer a coder and the ADR-025 guard is retired.

## Progress
_(empty — draft)_
