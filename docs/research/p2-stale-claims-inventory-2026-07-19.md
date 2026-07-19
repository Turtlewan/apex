# P2 stale present-tense claims — full inventory (2026-07-19)

Survey-only pass for the status.md P2 item ("stale present-tense claims in records"). Ground truth
compared against: coder = Codex `gpt-5.6-sol` per-task subprocess, Opus fallback, DeepSeek archived
(ADR-027/034); one session, no modes / no `APEX_MODE` / no write-guard / no launchers (ADR-038);
roles = Fable host (plans/challenges only), Opus spec author, Sonnet build orchestrator,
cross-family review both directions (ADR-032/034/042); knowledge layer + registry deleted
(ADR-036); three-file doctrine (ADR-037).

**Nothing was changed.** Every row is a proposed treatment, not an applied one. ADR *decision prose*
was never flagged — only missing supersession/status headers and later-added banners that themselves
make present-tense claims.

## Summary by category

| # | Category | Findings |
|---|----------|----------|
| A | Stale model claims presented as current (gpt-5.5 / Terra-as-default / DeepSeek-as-active) | 8 |
| B | Dead mechanisms presented as current (planning/coding modes, `APEX_MODE`, write-guard, `apex-build` launcher, backend split) | 21 |
| C | References to the deleted registry / domain-skill layer as current | 9 |
| D | ADRs missing a supersession / status-amendment header | 11 |
| E | Stale status-of-work claims ("still open", "live gap", "do now") since closed | 4 |
| F | Vestigial frontmatter (systemic, one row) | 1 |
| | **Total** | **54** |

Worst files: `docs/technical/architecture/overview.md` (the ADR-014 *living* overview — 13 rows),
`ROADMAP.md` + `REQUIREMENTS.md` (whole-file rot, pre-ADR-036 world), and
`apex-plan/references/model-routing.md` (3 rows, all load-bearing routing guidance).

---

## Inventory, grouped by file

### C:\users\user\apex\docs\technical\architecture\overview.md — living System Overview (ADR-014). Worst single file; recommend a section rewrite, not line patches.

| Line | Claim (short quote) | Why stale | Cat | Treatment |
|------|--------------------|-----------|-----|-----------|
| 11 | "every file is Markdown (a skill, a registry entry, or a planning document)" | registry deleted (ADR-036) | C | update in place |
| 18 | orchestrator "detects which mode it is in" | no modes (ADR-038) | B | update in place |
| 20–24 | "happens in *planning mode*" / "happens in *coding mode*" / "each side leaves the other a single file" | mode split gone; one session plans and builds | B | rewrite section |
| 26–27 | "Domain knowledge … lives in ~40 specialist skills that load on demand" | 36 domain skills deleted (ADR-036) | C | rewrite paragraph |
| 31–32 | "APEX runs as **two modes detected from environment signals** (`APEX_MODE` / base URL) and enforced by harness hooks" | `APEX_MODE` and mode detection removed (ADR-038) | B | rewrite section |
| 34 | "**Planning mode** … may write only `.md` files" | write-guard removed (ADR-038; ADR-033 reversal) | B | rewrite section |
| 35 | "**Coding mode** runs on a Claude host (**Sonnet 5 default**…)" | role is right, frame is wrong: Sonnet is a `model: sonnet` worker in the one session, not a mode's host | B | rewrite section |
| 42 | "The two modes never share live process state" | no modes | B | rewrite section |
| 55 | "a routing registry at `~/.claude/registry/`" | registry deleted | C | update in place |
| 56–57 | "Each skill is a `SKILL.md` (loaded in planning) and optionally an `impl.md` (loaded in coding…)" | mode-conditional loading gone; only apex-coding-principles still has an impl.md | B | update in place |
| 66 | shaping-decision row: "Dual-backend, two-mode workflow — planning on Claude, coding on DeepSeek" cited uncaveated | ADR-002 superseded by ADR-038/027; table presents it as a live shaping decision | B | annotate row (superseded-by) |
| 70–71 | ADR-005/006 rows tagged "*(in implementation)*" | superseded by ADR-036/037 — never completed, deliberately | C | annotate rows |
| 80–81 | "**BACKEND-ROUTING.md** — the full backend → mode → skill routing table" / "instructions both modes follow" | file does not exist anywhere in the repo; modes gone | B | delete line / update |

### C:\users\user\apex\README.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 7 | "Registry: `~/.claude/registry/`" | deleted (ADR-036) | C | delete line |
| 15 | "`docs/changes/` — pending specs for coding mode to execute" | no coding mode | B | update in place ("for the build to execute") |

### C:\users\user\apex\PROJECT.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 11 | "Planning sessions produce actionable specs that coding sessions can execute" | one session (ADR-038) | B | update in place |

### C:\users\user\apex\ROADMAP.md — whole-file rot; frozen at 2026-05-27, pre-ADR-036 world.

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 5–7 | Phases 1–3 describe "impl.md files", "11 new specialist domains", tiered index | domain-skill world deleted; phases describe artifacts that no longer exist | C | rewrite file |
| 8 | "Update registry (`~/.claude/registry/domains.md`) … **Next**" | registry deleted; marked as the *next* phase | C | rewrite file |
| 10 | "Additional specialists (apex-payments, apex-auth, apex-email, apex-websockets) — Future" | building domain specialists is now expressly forbidden (ADR-036) | C | rewrite file |
| 12–29 | Phase-2 table of 11 domain skills "delivered" | historical if dated, but presented as the live phase plan | C | rewrite file |

### C:\users\user\apex\REQUIREMENTS.md — whole-file rot; scope list is the deleted 36-skill set.

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 4 | "skill files (SKILL.md + impl.md pairs)" | impl.md pairs abolished (one remains) | C | rewrite file |
| 5 | "Supporting files: `~/.claude/registry/`…" | registry deleted | C | rewrite file |
| 7 | "The planning ↔ coding backend-gated workflow" | backend gate / mode split gone (ADR-038) | B | rewrite file |
| 11–34 | "Skills in scope (as of 2026-05-27)" — lists apex-aws, apex-security, apex-frontend, … | 36 of these were deleted (ADR-036); presented as current scope | C | rewrite file |
| 42–44 | Open questions: registry update, more domain specialists | both answered by deletion | C | rewrite file |

### C:\users\user\apex\AGENTS.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 10 | "14 skills (`~/.claude/skills/apex-*/`), a registry, templates, and planning docs" | registry deleted; rest of file is current | C | update in place |

### C:\users\user\apex\docs\drafts\gpt-5.6-family-adoption.md — live draft asserting a superseded pin.

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 3–6 | "**Terra is now the default coder**… Stage 2's core move (Terra as default coder) is DONE" | default coder is Sol (ADR-034, 2026-07-13) | A | update banner or archive draft |
| 7–8 | "**Still open:** Stage 1 (`max` effort enum…), Stage 3 (`ultra` eval)" | `max` landed; `ultra` promoted as the escalation rung (ADR-034) — only the eval remains open (tracked in status.md) | E | update banner or archive draft |

### C:\users\user\apex\docs\validation\apex-code-stack-skills-session-start.md — runnable protocol whose every precondition is dead.

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 7 | "**Backend:** must run on **DeepSeek (coding mode)** — `ANTHROPIC_BASE_URL` contains `deepseek`" | DeepSeek archived; mode detection removed | A | add OBSOLETE banner or move to an archive dir |
| 8 | "Planning mode (Anthropic) cannot run it; the PreToolUse gate blocks source writes" | write-guard removed | B | same banner |
| 5, 24, 46, 130 | protocol steps addressed to "a real DeepSeek apex-code session" | stack skills themselves deleted (ADR-036/037) — the thing under test no longer exists | A | same banner |

### C:\users\user\apex\docs\findings\apex-artemis-local-llm-compatibility.md — dated finding whose *standing guidance* reads as current.

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 16–17 | "APEX detects planning↔coding mode by the substring `deepseek` appearing in `ANTHROPIC_BASE_URL`… Coding mode → write-guard lifts" | whole mechanism removed (ADR-038) | B | add superseded-context banner at top |
| 54–55 | "No APEX change required today (keep 'deepseek' in the route)… explicit `APEX_MODE` detection… is the [fix]" | standing recommendation for a dead mechanism | B | covered by same banner |

### C:\users\user\apex\docs\findings\deepseek-v4-paper-vs-apex-coding-assumptions.md — dated finding with an open action table.

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 64–65 | "**Therefore APEX coding mode runs at `Flash-Max` today, and `Pro-Max` under the Pro toggle**" | DeepSeek archived; no coding mode | A | add superseded-context banner |
| 132–138 | action table rows tagged "**now**" targeting `model-specific-skill-authoring.md`, `BACKEND-ROUTING.md` | target files deleted; actions moot | E | covered by same banner |

### C:\users\user\apex\docs\findings\instinct-loop-deep-dive.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 4, 17, 45 | design premise: "the Windows=planning / Mac=DeepSeek-coding split", capture "on the coding (Mac/DeepSeek) side" | split gone; DeepSeek archived. The ADR-011 decision itself stands | B | add one-line context note (decision unaffected) |

### C:\Users\User\.claude\skills\apex-plan\references\model-routing.md — load-bearing routing guidance.

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 33–35 | "The planning write-guard **exempts APEX + `~/.claude` only**… Run the build in coding mode (`apex-build`) instead" | write-guard, coding mode, and the `apex-build` launcher all removed (ADR-038); the *underlying* point (permission prompts outside allow-listed repos) needs restating in current terms | B | update in place |
| 36–38 | "**The B1 scope hole is live**… a dispatched Codex can write outside its authorized file list with nothing stopping it. Until the post-dispatch diff check lands…" | scope enforcement landed (codex-scope-check / exit-65, round 8; ADR-041/044) — the "expected to expire" note expired | E | update in place |
| 8–9 | "Legacy `coder_tier_policy` / DeepSeek tiers — **ARCHIVED (ADR-027)**" | correctly labelled — **not a finding**; listed to show the pattern that works | — | none |

### C:\Users\User\.claude\skills\apex-plan\references\sol-plan-check.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 31 | "if gate spend ever crowds **Terra build** capacity" | build model is Sol (ADR-034) | A | update in place |

### C:\Users\User\.claude\skills\apex-plan\references\design-workflow.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 133 | "logic + bigger files return → **coding mode** carries the bulk again" | no coding mode | B | update wording |
| 142 | "`docs/research/mockups/<name>.html` (that dir **auto-passes the write-guard**)" | write-guard removed — the *reason* given for the location is dead | B | update wording |
| 174 | "After a UI build completes, **in planning mode:**" | no planning mode | B | update wording |
| 182 | "be reachable **from planning mode** (local web…)" | no planning mode | B | update wording |

### C:\Users\User\.claude\skills\apex-plan\references\design-brief-template.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 3 | "visual source of truth the **image-less coding model reads**" | coder is Sol — native vision (and Opus fallback is multimodal); the "image-less coder" premise died with DeepSeek | A | update in place |

### C:\Users\User\.claude\skills\apex-plan\references\design-lane-workflow.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 19 | "browser/Mac tools **planning mode** cannot drive" | no planning mode (capability point survives; rephrase to "the host") | B | update wording |

### C:\Users\User\.claude\skills\apex-plan\references\adr-and-status-procedures.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 39 | "At the end of every **planning session**:" | no session split | B | update wording |
| 44 | "Update _Last updated by **planning mode**:_ line" | prescribes writing a stale mode-stamp into status.md | B | update in place |
| 48 | "consumed and archived in one **coding session**" | no coding session | B | update wording |

### C:\Users\User\.claude\skills\apex-code\references\permissions.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 25 | "do those in **planning mode** or a one-off approval" | no planning mode | B | update wording |

### C:\Users\User\.claude\skills\apex-context-budget\SKILL.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 99 | "The APEX surface is `apex-*` skills/agents, **the registry**, the CLAUDE.md chain, and MCP" | registry deleted (ADR-036) | C | update in place |

### C:\Users\User\.claude\skills\apex-init\SKILL.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 30 | "Each **planning and coding session** starts fresh" | one session | B | update wording |
| 91 | "so **planning mode's** coverage check flags it" | no planning mode | B | update wording |
| 237 | "**Planning mode (Claude)** fills this in" (seeded stub text) | template seeds stale mode language into every new project | B | update in place |

### C:\Users\User\.claude\skills\apex-deep-dive\SKILL.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 23 | "Goes deeper than a standard **planning session**" | minor wording; no session split | B | update wording (low priority) |

### C:\Users\User\.claude\skills\apex-handoff\SKILL.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 15 | frontmatter description: "draining it at **planning session** start" | no planning session; handoff drains at session start | B | update frontmatter (via apex-skill-author) |

### C:\Users\User\.claude\skills\apex-orchestrate\templates\spec-template.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 49 | "Planning mode fills this. **Coding mode** verifies each item" | template comment stamps mode language into every new spec | B | update in place |
| 146 | "_(**Coding mode** writes here — do not edit manually)_" | same | B | update in place |

### C:\Users\User\.claude\skills\apex-orchestrate\templates\handoff-from-coding.md

| Line | Claim | Why stale | Cat | Treatment |
|------|-------|-----------|-----|-----------|
| 6 | "…**planning session** closes (inbox-zero)" (and the filename `handoff-from-coding.md` itself) | mode-era naming and wording, re-stamped into every handoff | B | update in place (rename optional) |

### Systemic — all `C:\Users\User\.claude\skills\apex-*\SKILL.md` (+ apex-coding-principles impl.md)

| Where | Claim | Why stale | Cat | Treatment |
|-------|-------|-----------|-----|-----------|
| frontmatter line 3, all 14 skills | `backend: claude` / `backend: coding` | field encodes the dual-backend split (ADR-002) removed by ADR-038; nothing reads it | F | decide via apex-skill-author (owns the frontmatter contract) — drop the field or re-purpose |

### ADRs — missing supersession / status headers only (decision prose untouched by design)

| File (C:\users\user\apex\docs\technical\adr\) | Header today | Gap | Treatment |
|---|---|---|---|
| ADR-002-dual-backend-two-mode-workflow.md:4 | "Status: Accepted" | the entire mechanism (two modes, two backends) was removed by ADR-038; DeepSeek archived by ADR-027 | add supersession header |
| ADR-005-stack-best-practice-skills.md:4 | "Status: Accepted" | superseded (stack-skill family + Verification Recipe binding) by ADR-036/037 — those ADRs say so; this one doesn't | add supersession header |
| ADR-006-buildability-layer-verification-inversion.md:4 | "Status: Accepted" | same as ADR-005 (recipe now lives in each repo's AGENTS.md) | add supersession header |
| ADR-009-harden-session-start-and-write-guard.md:4 | "Status: Accepted" | the write-guard half was removed by ADR-038 (session-start orchestration survives) | add partial-supersession header |
| ADR-016-apex-fully-local-deepseek.md:4 | "Status: Accepted" | moot — DeepSeek archived (ADR-027); the gated plan will never run | add moot/superseded header |
| ADR-019-coder-tier-build-planning.md:3 | "Status: Accepted · 2026-06-13" | superseded by ADR-024 (which states "Supersedes ADR-019") and the tiers archived by ADR-027 | add supersession header |
| ADR-024-complexity-routed-multi-model-coding.md:3 | amendment note cites ADR-026 only | the flash/pro half of its coder menu was archived by ADR-027 — header never caught up | extend amendment note |
| ADR-025-claude-coding-mode.md:4 | discharge note cites ADR-026 only | ADR-038 explicitly supersedes ADR-025 (coding mode abolished); ADR-025's header doesn't say so | add supersession header |
| ADR-027-…-deepseek-archived.md:2–6 | ADR-034 model-update banner present | ADR-038 superseded its mode-detection half (`APEX_MODE=coding` host framing at line 7) — not noted | extend banner |
| ADR-032-gpt56-role-split.md:3–7 | ADR-034 partial-supersession noted; claims "the Sonnet build host … unchanged" | ADR-038 superseded the § build-host flip (separate coding session → in-session `model: sonnet` worker); banner's "unchanged" is now itself a stale present-tense claim | extend banner |
| ADR-035-host-direct-build.md:3 | "Status: Accepted" | contradicted by the 2026-07-16 role split (host makes no mechanical edits — CLAUDE.md + memory). Also: that split appears to have **no ADR of its own** — the strongest current role rule is recorded only in CLAUDE.md/memory | add supersession header; consider an ADR for the 2026-07-16 split |

### Later-added ADR banner with a stale present-tense claim (banner is editable metadata, not decision prose)

| File | Line | Claim | Why stale | Treatment |
|---|---|---|---|---|
| ADR-020-capability-routed-ui-escalation.md | 5 | supersession banner: "under ADR-027 the coder **is** Codex (`gpt-5.5`, native vision)" | wrong twice since (5.5 → terra → sol); already catalogued as a defect in `docs/findings/artemis-13-7-issues.md` B4 | update model string in the banner (banner, not decision) |

### Surveyed and clean (no findings)

`docs/status.md` · `SKILLS.md` · `SKILL-HISTORY.md` (append-only log) · `CHANGELOG.md` ·
`C:\users\user\apex\CLAUDE.md` · `C:\Users\User\.claude\CLAUDE.md` ·
`docs/technical/harness-known-limits.md` · apex-orchestrate/apex-governance/apex-code SKILL bodies
(AFK usage there is the *current* dontAsk-based AFK, not the reverted flag gate) ·
`apex-code/REVIEW-ENSEMBLE-DESIGN.md` (its `gpt-5.5` is a dated past-tense run record — correct
as-is) · handoffs, probes, `docs/changes/done/`, `docs/research/` reports (dated records — see
below).

---

## Sweep mechanism observations

**Which file classes rot, ranked:**

1. **Living overview/scope docs rot worst and matter most** — `overview.md` (ADR-014 obliges it to
   be current; it froze around session 65), `ROADMAP.md`, `REQUIREMENTS.md`, `README.md`,
   `PROJECT.md`. These were written once at project start and never revisited by any workflow step.
   Nothing in apex-plan/apex-code/apex-handoff ever touches them.
2. **Skill `references/*.md` rot second** — SKILL.md bodies get version-bumped through
   apex-skill-author, but their references files (`model-routing.md`, `design-workflow.md`,
   `permissions.md`, templates) keep pre-ADR-038 mode language. The 2026-07-14 sweep (SKILL-HISTORY
   1.34.1) fixed exactly one such line in model-routing.md and missed the two lines below it —
   evidence that ad-hoc grep sweeps under-reach.
3. **Templates and seeded stubs are multiplier rot** — `spec-template.md`,
   `handoff-from-coding.md`, apex-init's stub text re-stamp stale language into every *new*
   artifact.
4. **Drafts and validation protocols rot silently** — `docs/drafts/` and `docs/validation/` hold
   "current until promoted" content with no expiry check; the Terra draft banner outlived its truth
   by six days, the DeepSeek validation protocol by a month-plus.
5. **Findings age acceptably IF dated, badly if they carry standing guidance** — "no change
   required today, keep `deepseek` in the route" reads as an instruction forever.
6. **ADR headers lag their superseders** — new ADRs faithfully write "Supersedes: X", but nobody
   back-writes the note into X. 11 of 44 ADRs are missing it. One direction of the double-link is
   systematically dropped.
7. **Historical records (handoffs, probes, done-specs, dated research) don't need sweeping** —
   they're past-tense and dated; treat like ADR prose.

**What a pin-change sweep checklist needs to cover** (triggered by any model/mechanism pin change):

1. Grep the *old* pin string (e.g. `gpt-5.6-terra`) across: repo root `*.md`, `docs/` minus
   `adr/ handoff/ probes/ changes/done/ research/`, and `~/.claude/skills/apex-*/**` **including
   references/ and templates/** (note: ripgrep is blind under `~/.claude` — its blanket `.gitignore`
   hides everything; the sweep must use `--no-ignore` or Select-String).
2. Grep *mechanism* words retired by the change (mode names, env vars, launcher names, guard
   names), not just model ids — mechanism rot outnumbered model rot ~21:8 in this pass.
3. Back-write the supersession header into every ADR the new ADR names in its "Supersedes" line
   (make this a step of the ADR template itself).
4. Re-read the four living scope docs (`overview.md`, `README.md`, `ROADMAP.md`,
   `REQUIREMENTS.md`) — they rot by omission, which grep can't catch.
5. Age-check `docs/drafts/` and `docs/validation/`: every file either still true, updated, or
   archived with a banner.
6. Skip-list: `docs/handoff/`, `docs/probes/`, `docs/changes/done/`, `docs/research/`,
   `SKILL-HISTORY.md`, ADR decision prose — dated records, never edited.
