---
spec: gpt56-c2-sonnet-host
status: ready
token_profile: balanced
autonomy_level: L2
coder_effort: medium
---

# Spec: Phase C2 — Sonnet 5 default build host (governance + hook + mode-docs consistency sweep)

**Identity:** Flips the `APEX_MODE=coding` host default to Sonnet 5 (Opus = per-spec escalation, GRAY-fork judgment, high-risk supervision, fallback coder) and sweeps every mode-description surface to say the same thing.
→ why: see docs/technical/adr/ADR-032-gpt56-role-split.md

## Intent
- **Intent:** builds are hosted on the Sonnet weekly bucket by default, never silently draining the Opus/planning pool; every surface describing the coding mode names the same host so no session gets a contradictory brief.
- **Invariants:** the soft pool guard stays scoped to Opus draws; "the host runs the verify loop" is stated once, canonically, in governance; hard blocks / autonomy levels untouched; the flip is wired-but-unproven until the first real Sonnet-hosted build (say so where the default is declared).
- **Non-goals:** no coder-model changes (Terra stays primary), no apex-code edits (C3 owns that file — the *governance-side* review-routing bullet lands here because C2 owns governance; build-side routing is C3), no Sol rung (C3).

## Assumptions
- `~/.claude/skills/apex-governance/SKILL.md` contains the § Coding model routing anchors quoted in Task 1 (v1.14.0) → impact: Stop
- `~/.claude/hooks/backend-session-start.ps1` contains the coding-branch and planning-branch anchor lines quoted in Task 2 (verified live this session; the planning branch still carries retired-ADR-020 + "DeepSeek session" residue) → impact: Stop
- BACKEND-ROUTING.md / status-template.md anchors are grep-located at apply time (not pre-read; executor verifies before editing) → impact: Caution
- `ANTHROPIC_MODEL` env var / `/model sonnet` selects the host model for an `APEX_MODE=coding` session; no hook change can force it — the hook *states* the default, the operator/launcher sets it → impact: Caution (the PS-profile `codex-code` launcher is host-local; flag in the report if it pins a model)

Simplicity check: considered governance-only (skip the doc sweep) — rejected: internal consistency across mode surfaces is a standing lesson (contradictions burn the reader, and the stale hook text is actively wrong today — retired ADR-020 + DeepSeek references in every planning session brief). The sweep is 6 small exact edits, not a rewrite.

## Prerequisites
- Specs that must be complete first: `gpt56-c1-sol-plan-check` (shared `~/apex/SKILL-HISTORY.md`, owned by C1)
- Environment setup required: none

## Files to Change
| File | Operation | Notes |
|------|-----------|-------|
| `C:\Users\User\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1` | modify | `apex-build` launcher (Sonnet) + `apex-opus` relabel — the producing mechanism |
| `C:\Users\User\.claude\skills\apex-governance\SKILL.md` | modify | host paragraph + pool-guard sentence + review-routing bullet; version 1.15.0 |
| `C:\Users\User\.claude\hooks\backend-session-start.ps1` | modify | coding-branch host text; planning-branch residue |
| `C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md` | modify | Step 3.5 host line + status-line format ×2; version bump |
| `C:\Users\User\.claude\CLAUDE.md` | modify | mode line + §5 coder-model para + status-line format |
| `C:\users\user\apex\CLAUDE.md` | modify | backend-routing table row |
| `C:\users\user\apex\BACKEND-ROUTING.md` | modify | Claude-coding host description (grep-anchored) |
| `C:\Users\User\.claude\skills\apex-orchestrate\templates\status-template.md` | modify | backends line gains host (grep-anchored) |
| `C:\users\user\apex\SKILL-HISTORY.md` | modify | prepend 2 rows |

## Tasks

- [ ] **Task 0: PS-profile launcher — the actual producing mechanism (Sol plan-check BLOCK: the spec was prose-only; `apex-opus` pins `ANTHROPIC_MODEL=opus`).** — files: `C:\Users\User\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1` (host-local, uncommittable) — done when: (a) a new `apex-build` function exists = copy of `apex-opus` with `$env:ANTHROPIC_MODEL = 'sonnet'` and banner `"==> CLAUDE CODING mode (Sonnet host -- ADR-032 default)"` / `"    Backend = Anthropic | APEX_MODE = coding | Model = sonnet (host); coder = Codex gpt-5.6-terra"`; (b) `apex-opus`'s banner reads `"==> CLAUDE CODING mode (OPUS host -- deliberate escalation)"` + `"    Use for risk:high supervision / fallback-heavy builds; default host is apex-build (Sonnet -- ADR-032)."`; (c) `. $PROFILE` reloads clean.

- [ ] **Task 1: apex-governance SKILL.md** — files: `C:\Users\User\.claude\skills\apex-governance\SKILL.md` — done when: both edits applied; frontmatter `version: 1.15.0`, `last_updated:` today, `  - docs/technical/adr/ADR-032-gpt56-role-split.md` in `sources:`.

  **1a — host paragraph + fallback-paragraph rewrite (no adjacent contradiction).** First, in the
  existing "**Opus is the manual fallback coder**" paragraph, replace the substring:
  ```
  the build runs in an Opus `APEX_MODE=coding` host
  that dispatches Codex per task; when Codex quota runs out the **same host builds the task inline as
  Opus** (no restart, no backend swap)
  ```
  with:
  ```
  the build runs in a Claude `APEX_MODE=coding` host
  (Sonnet 5 default — below) that dispatches Codex per task; when Codex quota runs out the task is
  built by **Opus** — a fresh `model: opus` code-worker dispatch, or the operator switches the session
  (`/model opus`) for a fallback-heavy build (no restart, no backend swap)
  ```
  Then, after that paragraph (ending `See apex-code § Model
escalation on verify-fail.`), insert:

  ```
  **The build host runs Sonnet 5 by default (ADR-032).** The `APEX_MODE=coding` session that
  orchestrates dispatch — and **runs the verify loop; never the coder subprocess judging itself**
  (evaluator independence at task level) — is Sonnet 5 (`/model sonnet` / `ANTHROPIC_MODEL`),
  drawing its own separate weekly bucket. Opus in coding mode is a deliberate choice, not the
  default: the per-spec **coder** pin (`coder_model: opus` — selects who codes, a different axis
  from who hosts), an Opus **host** as an operator choice for `risk: high` supervision or
  GRAY-fork-heavy work, and the Opus fallback coder at Codex quota-out (dispatched as above).
  The first real Sonnet-hosted build is the flip's proving run.
  ```

  **1c — soft-pool-guard sentence (false under Sonnet host — Sol BLOCK).** Replace:
  ```
  OpenAI pool; the only Max-pool draw is light (host orchestration + Opus reviewing Codex-built tasks).
  ```
  with:
  ```
  OpenAI pool; the light Anthropic-pool draw lands mostly on the Sonnet bucket (host orchestration + routine Claude reviews); Opus draws only for high-risk dual-pass reviews and the fallback below.
  ```

  **1b — cross-model review routing (Amendment 1).** Replace:
  ```
  - **Codex-built** task (the default coder) → **Opus** (Claude) reviews (`apex-reviewer`, Claude family).
    This is the common path.
  ```
  with:
  ```
  - **Codex-built** task (the default coder) → **Claude** reviews (`apex-reviewer`, always a **fresh
    context** — never the orchestrating host reviewing its own build): the host family (Sonnet)
    routinely; **Opus** reviewers for the high-risk dual-pass set (auth / security / data,
    `risk: high`). This is the common path (ADR-032).
  ```

- [ ] **Task 2: backend-session-start.ps1 — coding branch + planning residue** — files: `C:\Users\User\.claude\hooks\backend-session-start.ps1` — done when: all four edits applied and the hook still emits valid output (Task 6 probe).

  **2a** — Replace `    $backend = 'Anthropic (Claude coding mode -- Opus fallback coder)'` with `    $backend = 'Anthropic (Claude coding mode -- Codex primary coder)'` (model-agnostic — an Opus-host session must not be labelled "Sonnet host" [Sol BLOCK]; the Host model line carries the actual model)

  **2b** — Replace `    $coderModel = if ($model) { $model } else { 'Opus (fallback coder for this mode)' }` with `    $coderModel = if ($model) { $model } else { 'Sonnet 5 (default host -- ADR-032; set via /model or ANTHROPIC_MODEL)' }`

  **2c** — Replace the policy line beginning `Coder model: $coderModel. This is the Codex-quota FALLBACK build path (ADR-027):` (the whole line) with:
  ```
  Host model: $coderModel. The host orchestrates dispatch and runs the verify loop (ADR-032). Codex (gpt-5.6-terra) is the primary coder, dispatched per task via `codex exec`; verify-fail escalation and the Opus quota-out fallback are handled per apex-code § Model fallback. No backend swap.
  ```
  Keep the SOFT POOL GUARD line, but replace its lead-in `SOFT POOL GUARD (ADR-027, scoped to fallback): Opus building draws` with `SOFT POOL GUARD (ADR-027, scoped to the Opus fallback only -- Sonnet hosting draws a separate bucket): Opus building draws`

  **2d — planning-branch residue.** In the PLANNING policy: (i) replace the sentence `Default: defer code edits to a DeepSeek coding session. One sanctioned exception -- capability-routed UI escalation (ADR-020): you MAY approve the prompt for a bounded, view-layer-only UI fix when an inherently-visual divergence can't be resolved by prose to the image-blind coder. See apex-governance.` with `Default: defer code edits to a coding session (APEX_MODE=coding; Codex-primary -- ADR-027).` (ii) replace `A later DeepSeek session will execute these specs.` with `A later coding session (Codex-primary) will execute these specs.`

- [ ] **Task 3: apex-orchestrate SKILL.md** — files: `C:\Users\User\.claude\skills\apex-orchestrate\SKILL.md` — done when: Step 3.5 line 2 reads `2. Else \`APEX_MODE=coding\` → **Claude coding** = the build host (**Sonnet 5 default host — ADR-032**): **Codex (\`gpt-5.6-terra\`) is the primary coder** (dispatched per task as a \`codex exec\` subprocess); **Opus is the fallback** (fresh \`model: opus\` worker / \`/model opus\`) when Codex quota runs out. Write-guard relaxed → route to apex-code.` (the word "inline" must not appear — Sol BLOCK); both status-line format strings read `claude-coding (Sonnet host; Codex-primary, Opus fallback)`; frontmatter version → 1.7.0, `last_updated:` today, ADR-032 in `sources:`.

- [ ] **Task 4: global + project CLAUDE.md — five exact edits (anchor counts corrected per Sol plan-check: the detection line occurs ONCE; §5 uses different phrasing; +L216 residue).** — files: `C:\Users\User\.claude\CLAUDE.md`, `C:\users\user\apex\CLAUDE.md` — done when:
  - Global L123: `**Claude coding mode** = the build host:` → `**Claude coding mode** = the build host (Sonnet 5 default — ADR-032):` AND same line `**Opus is the inline fallback**` → `**Opus is the fallback** (fresh \`model: opus\` worker)`.
  - Global L149 (§5 variant): `The build host is **Claude coding mode** (\`APEX_MODE=coding\` on the Anthropic backend; write-guard relaxed).` → `The build host is **Claude coding mode** (\`APEX_MODE=coding\` on the Anthropic backend; **Sonnet 5 default host — ADR-032**; write-guard relaxed).` AND same line `**Opus is the inline fallback**` → `**Opus is the fallback** (fresh \`model: opus\` worker)`.
  - Global L216 residue: `default guidance is to defer code edits to a DeepSeek coding session` → `default guidance is to defer code edits to a coding session (\`APEX_MODE=coding\`, Codex-primary)`.
  - Global: every `claude-coding (Codex-primary, Opus fallback)` → `claude-coding (Sonnet host; Codex-primary, Opus fallback)` (replace_all).
  - Project L24 row: `**Codex \`gpt-5.6-terra\` primary** (codex exec subprocess); **Opus inline fallback** on Codex quota-out` → `host = Sonnet 5 (ADR-032); **Codex \`gpt-5.6-terra\` primary** (codex exec subprocess); **Opus fallback** (fresh \`model: opus\` worker) on quota-out` (grep-verify the cell before editing).

- [ ] **Task 5: BACKEND-ROUTING.md + status-template.md (sites enumerated — Sol FLAG on "every description")** — files: `C:\users\user\apex\BACKEND-ROUTING.md`, `C:\Users\User\.claude\skills\apex-orchestrate\templates\status-template.md` — done when:
  - BACKEND-ROUTING.md, exactly these sites (line numbers verified 2026-07-10): L4 (`dispatched from a **Claude coding host**` gains `(Sonnet 5 default — ADR-032)`); L17 table Coder cell (prefix `host=Sonnet 5;`, `**Opus** inline fallback` → `**Opus** fallback (fresh worker)`); L20-21 (add `apex-build` = Sonnet default-host launcher; `apex-opus` = deliberate Opus host); L58-59 (host mention gains Sonnet default); L149-152 (`Opus fallback — the Claude coding host` block → Sonnet-host + fresh-worker wording, `apex-opus` relabelled deliberate); L175 + L186 footer (add `host = Sonnet 5 (apex-build)`). No routing *signals* change.
  - status-template.md `coder_models:` comment: append after `a legacy coder_tier_policy maps to [codex].`: ` Build host = Sonnet 5 default (ADR-032); an Opus host is a deliberate escalation.` (appended at the end — keeps the quota-out clause attached to the fallback coder, Sol grammar FLAG).

- [ ] **Task 6: hook smoke test** — files: none — done when: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\User\.claude\hooks\backend-session-start.ps1` (Bypass is required — script execution is disabled on this host and the installed hook config uses it; Sol BLOCK) with no APEX_MODE exits 0, output contains `Mode: PLANNING`, no `ADR-020` / `DeepSeek` text; with `APEX_MODE=coding` output contains `Host model:` + `Sonnet` and `SOFT POOL GUARD`.

- [ ] **Task 7: SKILL-HISTORY — prepend 2 rows** — files: `C:\users\user\apex\SKILL-HISTORY.md` — done when: top rows are:
  ```
  | 2026-07-10 | apex-governance | SKILL.md | 1.15.0 | updated (SKILL) | Sonnet 5 default build host (host runs the verify loop; Opus = per-spec escalation / GRAY-fork judgment / high-risk supervision / fallback coder; pool guard stays Opus-scoped) + cross-family review routing: Codex-built → Claude reviews (Sonnet routine, Opus high-risk dual-pass) (ADR-032) | GPT-5.6×APEX report §2, ADR-032 |
  | 2026-07-10 | apex-orchestrate (+ hook + mode docs + PS profile) | SKILL.md; hooks/backend-session-start.ps1; ~/.claude/CLAUDE.md; apex CLAUDE.md + BACKEND-ROUTING.md; templates/status-template.md; PS profile (host-local) | 1.7.0 | updated (SKILL) | Mode-surface consistency sweep for the Sonnet host (ADR-032): Step 3.5 + status-line strings; hook coding-branch host text + planning residue purge (retired ADR-020 sentence, "DeepSeek session"; + global CLAUDE.md L216 same residue); new `apex-build` launcher (Sonnet host) + `apex-opus` = deliberate Opus host — the launcher was the actual default-producing mechanism (Sol plan-check catch) | ADR-032; Sol plan-check proving run (session 65) |
  ```

## Wave plan
Wave 1: [task 0, task 1, task 2, task 3, task 4, task 5] | Wave 2: [task 6, task 7]

## Permissions

### File Operations
| Action | Paths |
|--------|-------|
| Modify | the 8 files in ## Files to Change |
| Create / Delete | (none) |

### Commands
| Command | Purpose |
|---------|---------|
| `powershell -NoProfile -ExecutionPolicy Bypass -File ~/.claude/hooks/backend-session-start.ps1` | hook smoke test (Task 6), planning + coding env |
| `. $PROFILE` (PowerShell) | launcher reload check (Task 0) |
| verification greps in ## Acceptance Criteria | post-apply checks |
| `grep -n "APEX_MODE\|build host\|Opus" ~/apex/BACKEND-ROUTING.md` | anchor location (Task 5) |

### Git Operations
(none — host/owner commits)

### Environment Access
| Variable | Purpose |
|----------|---------|
| `APEX_MODE` | set to `coding` transiently for the Task 6 smoke test, then unset |

### Network
(none)

## Specialist Context
### Skill-author conformance (apex-skill-author)
- Iron Law: lightweight tier — user-established standing convention (memory `iron-law-application-depth`), not a spec-local self-exemption. RED evidence = the live hook read this session: the coding branch labels the host "Opus (fallback coder)" and the planning branch still instructs the retired ADR-020 escalation + "a later DeepSeek session" — actively wrong text injected into every session brief. GREEN = Task 6 smoke test + the first Sonnet-hosted build (proving run). Deviation from the literal Iron Law wording surfaced in the sign-off digest.
- governance SKILL.md is ~250 lines — no cap pressure; keep the host paragraph the single canonical home ("who runs the verify loop" lives here, summaries elsewhere).

## Documentation
| Doc type | File | Action |
|----------|------|--------|
| ADR | docs/technical/adr/ADR-032-gpt56-role-split.md | already written |
| History | ~/apex/SKILL-HISTORY.md | Task 7 |

## Acceptance Criteria
- [ ] Governance edited → verify: `grep -n "Sonnet 5 by default\|runs the verify loop" ~/.claude/skills/apex-governance/SKILL.md` hits; `grep -c "ADR-032"` ≥ 2; version 1.15.0.
- [ ] Hook edited → verify: Task 6 smoke test passes both branches (planning output free of `ADR-020`/`DeepSeek session`; coding output names Sonnet + keeps the pool guard).
- [ ] Orchestrate edited → verify: `grep -c "Sonnet host; Codex-primary" ~/.claude/skills/apex-orchestrate/SKILL.md` = 2; Step 3.5 names the Sonnet default.
- [ ] CLAUDE.md ×2 + BACKEND-ROUTING + status-template edited → verify: `grep -rn "Sonnet host; Codex-primary\|Sonnet 5 default\|host=sonnet-5"` hits in each of the four files; `grep -n "image-blind" ~/.claude/CLAUDE.md` — global CLAUDE.md §BACKEND text unchanged where not tasked (surgical scope).
- [ ] History rows prepended → verify: `head -8 ~/apex/SKILL-HISTORY.md` shows both rows above C1's.

## Progress
_(Coding mode writes here — do not edit manually)_
