---
spec: gpt56-c3-review-routing
status: ready
token_profile: balanced
autonomy_level: L2
coder_effort: medium
---

# Spec: Phase C3 — cross-family review routing + Sol escalation rung (apex-code)

**Identity:** Routes reviews cross-family under the Sonnet host (Terra-built → Claude reviews: Sonnet routine / Opus high-risk; Opus-built → Codex reviews) and inserts the Sol rung into the verify-fail escalation ladder.
→ why: see docs/technical/adr/ADR-032-gpt56-role-split.md

## Intent
- **Intent:** every *cross-model* review is by a different family than its builder (the always-on `apex-reviewer` first pass stays host-family by design — two-stage review's baseline, apex-governance; the opt-in cross-model pass is the independence layer), and a failing Codex task escalates one more rung on the OpenAI pool (Sol) before touching the Anthropic pool (Opus). The graceful-degrade path (Codex pool dead → single-model review + human flag, never silent) is retained, not a violation (Sol plan-check finding: accepted with this scoping).
- **Invariants:** apex-code SKILL.md stays ≤500 lines; evaluator independence holds at every routing row; the Sol rung fires on *verify-fail only* — quota-out skips it (Sol shares the dead ChatGPT pool) and Claude-judgment cases (GRAY forks, high-risk supervision) skip it too, both going straight to Opus; each rung runs once, never loops; all three ladder homes (SKILL.md § Model fallback = canonical, codex-observability § Effort ladder, model-routing.md) describe the same ladder incl. the skip conditions.
- **Non-goals:** no governance/hook/doc edits (C2 owns those files), no plan-check changes (C1), no change to wave-review *pass counts* or the ADR-010 dual-pass rules (1i pins the reviewer *model*, not how many passes run).

## Assumptions
- `~/.claude/skills/apex-code/SKILL.md` is exactly 500 lines (post-B2) and contains the anchors quoted in Task 1 verbatim → impact: Stop
- `~/.claude/skills/apex-code/references/codex-observability.md` § Effort ladder contains the "before falling back to Opus" wording (post-B2) → impact: Stop
- `~/.claude/skills/apex-plan/references/model-routing.md` describes the effort ladder + family-aware review (grep-anchored at apply; executor verifies before editing) → impact: Caution
- The `apex-coder` profile + dispatch mechanics work unchanged with `-m gpt-5.6-sol` (same CLI, same auth — Sol resolves on our auth, probed session 64) → impact: Low

Simplicity check: considered a separate "escalation" reference file — rejected: the ladder lives in two existing homes (SKILL.md fallback section + codex-observability § Effort ladder); a third home would violate one-home-per-fact. Edits stay in-place.

## Prerequisites
- Specs that must be complete first: `gpt56-c2-sonnet-host` (shared `~/apex/SKILL-HISTORY.md` chain; also governance's routing bullet should land with/before the apex-code side)
- Environment setup required: none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\.claude\skills\apex-code\SKILL.md` | modify | host line, Sol rung, review routing ×3; version 1.29.0 |
| `C:\Users\User\.claude\skills\apex-code\references\codex-observability.md` | modify | effort-ladder Sol-rung sync |
| `C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md` | modify | completion-routing row Sol-rung sync (Sol BLOCK) |
| `C:\Users\User\.claude\skills\apex-code\references\parallel-codex.md` | modify | quota-out fresh-worker wording (Sol BLOCK) |
| `C:\Users\User\.claude\skills\apex-plan\references\model-routing.md` | modify | ladder + family-review sync (grep-anchored) |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | prepend 1 row |

## Tasks

- [ ] **Task 1: apex-code SKILL.md — nine exact edits + frontmatter** — files: `C:\Users\User\.claude\skills\apex-code\SKILL.md` — done when: all applied; frontmatter `version: 1.29.0`, `last_updated:` today, `  - docs/technical/adr/ADR-032-gpt56-role-split.md` in `sources:`; `wc -l` ≤ 500; the strings "inline itself" and "builds the task itself inline" no longer appear.

  **1a — host line.** Replace the substring:
  ```
  **Host = an Opus `APEX_MODE=coding` session (mechanic A).** It dispatches Codex per task and, on quota-out, builds the task itself inline as Opus.
  ```
  with:
  ```
  **Host = a Claude `APEX_MODE=coding` session (mechanic A; Sonnet 5 default host — ADR-032).** It dispatches Codex per task; on quota-out the task falls back to Opus (§ Model fallback below).
  ```

  **1g — fallback bullet mechanics (sync with governance's Sonnet-host rewrite).** In the
  `- **codex → opus (manual fallback):**` bullet, replace the substring:
  ```
  on operator confirmation the
  Opus `APEX_MODE=coding` host builds the task **inline itself** (no subprocess, no session swap — the
  write-guard is already relaxed under `APEX_MODE=coding`) and re-runs the recipe.
  ```
  with:
  ```
  on operator confirmation the task is
  built by **Opus** — a fresh `model: opus` code-worker dispatch from the host, or switch the session
  (`/model opus`) for a fallback-heavy build (no backend swap; write-guard already relaxed) — then re-run the recipe.
  ```

  **1h — dispatch-table row.** Replace the table row:
  ```
  | `opus` (fallback) | the Opus `APEX_MODE=coding` host, inline | `opus` | built inline in the host session (no subagent, no subprocess) |
  ```
  with:
  ```
  | `opus` (fallback) | Opus on the Claude host | `opus` | fresh `model: opus` code-worker dispatch (or session `/model opus`) — no subprocess (ADR-032) |
  ```

  **1b — Sol rung (GRAY-fork bypass removed + from-current-effort ladder — Sol plan-check).** Replace the line beginning `- **Effort bump first (ADR-030):**` (whole line, ends `or quota-out → fall back:`) with these two lines:
  ```
  - **Effort bump first (ADR-030):** on a Codex *verify-fail* (not a quota-out), re-dispatch the same task one notch higher on `model_reasoning_effort` — from the task's current `coder_effort` toward `max` (`low→medium→high→xhigh→max`; a task already at `ultra` goes straight to the Sol rung) — logging each rung in the decisions table (a resumed build reads it; never repeat a rung).
  - **Sol rung next (ADR-032):** dial exhausted (at `max`) → re-dispatch the task once on `-m gpt-5.6-sol` (same subprocess mechanics, profile, and ChatGPT quota; keep effort `max`). Opus comes only after Sol fails, or at quota-out (Sol shares the dead pool — skip straight to Opus). A GRAY fork is NOT an escalation trigger — it routes to the user per § Forks, never silently to Opus → fall back:
  ```

  **1i — wave-review model pin (the high-risk Opus reviewers must exist where reviews actually dispatch — Sol BLOCK).** In § Wave domain review Step 2, replace the substring:
  ```
  `apex-wave-reviewer` instances — **two** (dual-pass)
  ```
  with:
  ```
  `apex-wave-reviewer` instances (fresh-context, host family; dispatch with `model: opus` for auth/security/data and any `risk: high` spec — ADR-032) — **two** (dual-pass)
  ```

  **1j — "No backend swap" bullet (missed inline site — Sol BLOCK).** Replace the substring:
  ```
  the Opus fallback builds inline in the same `APEX_MODE=coding` host.
  ```
  with:
  ```
  the Opus fallback runs as a fresh `model: opus` worker in the same `APEX_MODE=coding` host (ADR-032).
  ```
  (If the live text differs, locate via `grep -n "No backend swap" ` and fix that sentence — done when `grep -ci "inline"` on SKILL.md returns 0.)

  **1c — rung cap.** Replace:
  ```
  - One fallback is the retry; if Opus still fails, fork (capture-at-halt).
  ```
  with:
  ```
  - Each rung runs once — never loop a rung; if Opus still fails, fork (capture-at-halt).
  ```

  **1d — cross-model review derivation.** Replace:
  ```
   - **Per task, derive the reviewer from the builder:** Codex-built (the default) → **Opus** reviews;
     Opus-built (the fallback) → **Codex** reviews. (Default whole-build path: Codex built → Opus reviews
     the diff.)
  ```
  with:
  ```
   - **Per task, derive the reviewer from the builder (ADR-032):** Codex-built (the default) → **Claude**
     reviews — host family (Sonnet) routine, `model: opus` for the high-risk dual-pass set (auth/security/
     data, `risk: high`); Opus-built (the fallback) → **Codex** reviews. (Default: Codex built → Claude reviews the diff.)
  ```

  **1e — Claude-review bullet.** Replace:
  ```
   - **Opus review** (for Codex-built tasks — the common path) → dispatch one `apex-reviewer` on the Claude family, same independence rule.
  ```
  with:
  ```
   - **Claude review** (for Codex-built tasks — the common path) → dispatch one `apex-reviewer` on the host family (Sonnet); `model: opus` for high-risk. Same independence rule.
  ```

  **1f² — line-cap offset (definite, funds 1b's +1).** Replace the two lines:
  ```
  **A blocked spec stays in `docs/changes/` marked `blocked`** — do NOT move it to `drafts/`.
  That relocation (patch-in-place vs full re-draft) is planning's judgment, not coding's.
  ```
  with one line:
  ```
  **A blocked spec stays in `docs/changes/` marked `blocked`** — do NOT move it to `drafts/`; that relocation (patch-in-place vs re-draft) is planning's judgment, not coding's.
  ```

  **1f — line-cap offset.** Replace the three lines:
  ```
  (Summary for in-build checks — **apex-governance owns the canonical definitions**; on any
  conflict, governance wins. Note: the per-spec commit prompt in global CLAUDE.md applies at
  every level — committing with the user's explicit approval is never blocked by L2/L3.)
  ```
  with two lines:
  ```
  (Summary — **apex-governance owns the canonical definitions**; on conflict governance wins. The per-spec
  commit prompt in global CLAUDE.md applies at every level — user-approved commits are never blocked by L2/L3.)
  ```

- [ ] **Task 2: codex-observability.md — effort-ladder sync** — files: `C:\Users\User\.claude\skills\apex-code\references\codex-observability.md` — done when: the `max` bullet's ladder sentence names the Sol rung: replace `This is the top rung of the verify-fail recovery ladder (`medium→high→xhigh→max`) before` + the text through `falling back to Opus` with `This is the top effort rung of the verify-fail recovery ladder (`medium→high→xhigh→max`); above it sits the Sol model rung (`-m gpt-5.6-sol`, once, effort max — ADR-032) and only then the Opus fallback (quota-out and Claude-judgment cases skip Sol and go straight to Opus — SKILL.md § Model fallback)`.

- [ ] **Task 2b: dispatch-pack.md — completion-routing row (created today by B2, already stale vs the Sol rung — Sol BLOCK).** — files: `C:\Users\User\.claude\skills\apex-code\references\dispatch-pack.md` — done when: the last routing-table row's action reads `effort-bump ladder (ADR-030) → Sol rung (ADR-032) → Opus fallback per SKILL.md § Model fallback` (replacing `effort-bump ladder (ADR-030) → Opus fallback per SKILL.md § Model fallback`).

- [ ] **Task 2c: parallel-codex.md — quota-out wording (inline residue — Sol BLOCK).** — files: `C:\Users\User\.claude\skills\apex-code\references\parallel-codex.md` — done when: L44's `that task falls back to Opus (host builds it inline).` reads `that task falls back to Opus (fresh \`model: opus\` worker — ADR-032; quota-out skips the Sol rung).` and no `inline` remains in the file.

- [ ] **Task 3: apex-plan references/model-routing.md — sync (grep-anchored)** — files: `C:\Users\User\.claude\skills\apex-plan\references\model-routing.md` — done when: `grep -n "Sol rung\|gpt-5.6-sol" ~/.claude/skills/apex-plan/references/model-routing.md` hits: (i) wherever the reference describes the verify-fail ladder/fallback, insert the Sol rung between effort-max and Opus using the same shape as Task 2's sentence — once, effort max, quota-out + Claude-judgment cases skip straight to Opus (cite ADR-032); (ii) wherever it describes family-aware review, update Codex-built → Claude reviews (Sonnet routine / Opus high-risk). Locate anchors via `grep -n "fallback\|xhigh\|family"` and edit only those sentences.

- [ ] **Task 4: SKILL-HISTORY — prepend 2 rows** (one per skill whose files changed — triple-write granularity) — files: `C:\users\user\apex\SKILL-HISTORY.md` — done when: top rows are:
  ```
  | 2026-07-10 | apex-code | SKILL.md, references/codex-observability.md | 1.29.0 | updated (SKILL) | Cross-family review routing under the Sonnet host (Codex-built → Claude reviews: Sonnet routine / Opus high-risk dual-pass; Opus-built → Codex reviews; reviewer always fresh-context) + Sol escalation rung on verify-fail (effort-max → gpt-5.6-sol once → Opus; quota-out + Claude-judgment cases skip Sol); host line → Sonnet 5 default (ADR-032) | GPT-5.6×APEX report §2 Amendments 1-2, ADR-032 |
  | 2026-07-10 | apex-plan | references/model-routing.md | 1.32.1 | updated | Sync: Sol rung in the verify-fail ladder + family-aware review update (Codex-built → Claude reviews: Sonnet routine / Opus high-risk) (ADR-032); SKILL.md frontmatter patch-bumped to match | ADR-032 |
  ```

## Wave plan
Wave 1: [task 1, task 2, task 3] | Wave 2: [task 4]

## Permissions

### File Operations
| Action | Paths |
|--------|-------|
| Modify | the 4 files in ## Files to Change |
| Create / Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `wc -l ~/.claude/skills/apex-code/SKILL.md` | 500-line cap check |
| `grep -n "fallback\|xhigh\|family" ~/.claude/skills/apex-plan/references/model-routing.md` | anchor location (Task 3) |
| verification greps in ## Acceptance Criteria (each with explicit file argument) | post-apply checks |

### Git Operations
(none — host/owner commits)

### Environment Access
(none)

### Network
(none)

## Specialist Context
### Skill-author conformance (apex-skill-author)
- Iron Law: lightweight tier — user-established standing convention (memory `iron-law-application-depth`); RED evidence = Amendment 1's basis (Sol itself flagged same-family review; 93.4% finding-uniqueness) + the reversed Sol-capability deep-dive; GREEN = first Sol-rung escalation + first Sonnet-routine review in a real build. Deviation from the literal Iron Law wording surfaced in the sign-off digest.
- 500-line cap. Verified budget: 1b +1 · `sources:` +1 · 1f −1 · 1f² −1 · 1a/1c/1d/1e/1g/1h/1i/1j edit within existing physical lines (Δ0) → **net 0, file stays at 500**.
- **Accepted pre-existing debt (Sol FLAG):** the 500-line/5k-token cap's *token* half is likely exceeded by apex-code and apex-plan (~30KB each ≈ >5k tokens) — predates this spec; logged as an Open Question for a future trim pass, not fixed here.

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-032-gpt56-role-split.md | already written |
| History | ~/apex/SKILL-HISTORY.md | Task 4 |

## Acceptance Criteria
- [ ] SKILL.md edited → verify: `grep -n "Sol rung" ~/.claude/skills/apex-code/SKILL.md` hits the fallback section; `grep -n "Sonnet 5 default host" ~/.claude/skills/apex-code/SKILL.md` hits the host line; `grep -c "ADR-032" ~/.claude/skills/apex-code/SKILL.md` ≥ 2; `grep -ci "inline" ~/.claude/skills/apex-code/SKILL.md` = 0; the string "**Opus review**" no longer appears; `wc -l` ≤ 500; version 1.29.0.
- [ ] References synced → verify: `grep -n "gpt-5.6-sol" ~/.claude/skills/apex-code/references/codex-observability.md` hits; `grep -n "Sol rung" ~/.claude/skills/apex-code/references/dispatch-pack.md` hits the routing table; `grep -ci "inline" ~/.claude/skills/apex-code/references/parallel-codex.md` = 0.
- [ ] model-routing.md synced → verify: `grep -n "gpt-5.6-sol\|Sonnet" ~/.claude/skills/apex-plan/references/model-routing.md` hits both the ladder and the review sentences; apex-plan frontmatter `version: 1.32.1`.
- [ ] History rows prepended → verify: `head -10 ~/apex/SKILL-HISTORY.md` shows both rows on top.

## Progress
_(Coding mode writes here — do not edit manually)_
