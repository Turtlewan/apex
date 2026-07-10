# Claude host-lens review — C5 (web/UI) + C6 (stacks + AI)

Reviewer: Claude (host perspective). Companion GPT-5.6 Sol review covers the coder's-eye view of the
same files independently — not duplicated here.

Frame: Claude (Opus/Fable) plans and hosts; `codex exec -m gpt-5.6-terra` (native vision) executes
each task as a subprocess; Codex never reads skill files — the host distills constraints into
dispatch prompts. Future split adds a Sonnet-5 orchestrator between Opus-plan and Terra-code.

---

## Cross-cutting finding: `backend: deepseek` frontmatter on every impl.md

All 13 impl.md files in C5+C6 (apex-frontend, apex-nextjs, apex-design-system, apex-ui-ux-design,
apex-animation, apex-accessibility, apex-figma, apex-stack, apex-python, apex-swift, apex-tauri,
apex-mobile, apex-ai-systems) carry `backend: deepseek` in frontmatter — a naming residue from the
archived coder (ADR-027). It doesn't functionally break anything (nothing reads this field to gate
behaviour today, per apex-orchestrate's mode detection which keys off `ANTHROPIC_BASE_URL`/`APEX_MODE`,
not this field), but it is stale and misleading documentation-as-code. [DEEPSEEK-RESIDUE] — cheap
global fix: rename to `backend: coding` (or drop the field) across all impl.md in one pass, likely
best done by apex-skill-author as a housekeeping sweep, not file-by-file here.

---

## C5 — web/UI cluster

### apex-frontend
- SKILL.md / impl.md: clean, no DeepSeek-specific content beyond the frontmatter tag. [OK]
- [DEEPSEEK-RESIDUE] impl.md line 3, frontmatter only (see cross-cutting finding).
- [MOVE-TO-CODER] impl.md's NEVER/ALWAYS list (lines 26–48) + component-structure example are
  exactly the kind of content that should be distilled into a Terra dispatch prompt rather than
  read wholesale — currently there's no artifact between "impl.md as written for a human/weak
  coder" and "the prose the host actually sends Codex." This is the general C5/C6 gap, not
  frontend-specific; see § Cross-cutting recommendation below.

### apex-nextjs
- Clean split: SKILL.md = rendering-strategy/caching judgment (host), impl.md = NEVER/ALWAYS +
  patterns + **Verification Recipe** + **Common errors → fix** table (coder-facing). [OK] — this is
  the best-structured example of the "layered language ⊂ framework" Verification Recipe pattern in
  the whole set (apex-tauri and apex-python mirror it).
- [DEEPSEEK-RESIDUE] impl.md line 3 frontmatter only; body has no literal DeepSeek text.
- Verification Recipe (impl.md § Verification Recipe, lines 115–146) is the artifact apex-code's
  "recipe-driven verify loop" reads. Per apex-code's own description it is **apex-code (i.e. the
  host / future Sonnet orchestrator) that reads and runs this recipe**, not Codex directly — Codex
  only sees whatever failure text the host feeds back into the next dispatch. That already answers
  review-question 1 for this skill: the recipe is host-executed, not coder-read; nothing to move.

### apex-design-system
- Clean parallel structure (SKILL.md = token/stack decisions, impl.md = NEVER/ALWAYS + Tailwind v4
  pattern + verification checklist + "Flag for planning-mode review"). [OK]
- [DEEPSEEK-RESIDUE] frontmatter only.
- No Verification Recipe / Common-errors table of its own — it explicitly says "run the bound
  stack's Verification Recipe" (impl.md line 95), correctly deferring to the stack skill. [OK]

### apex-ui-ux-design
- **Already updated for ADR-027** — SKILL.md § "Live preview during build" (lines 326–349)
  explicitly retires the old ADR-020 image-blind-coder escalation scalpel and states "the coder
  (Codex gpt-5.6-terra, native vision; Opus on fallback) sees the render." This is the template
  every other C5 skill with a visual-gate should be brought up to. [OK] — treat as the reference
  pattern, not a residue to fix.
- [SONNET-RISK] § Visual review gate (lines 274–293) still frames the post-build screenshot
  critique as planning-mode-only ("dispatch as a fresh reviewer... environment: the app must be
  reachable from planning mode"). With a Sonnet-5 orchestrator inserted between Opus and Terra,
  this needs an explicit rule for **who** runs the gate: Sonnet (cheap, in-loop, every build) vs.
  Opus (expensive, escalation-only)? Currently unstated — a real judgment call, not mechanical.
- [DEAD-WEIGHT] At 29,271 bytes this is by far the largest file in either cluster (next largest is
  under 9KB) and loads in full on every invocation (no partial-load mechanism for Skills). The
  § Prompt-to-design lanes table (Stitch/Bitrig/FlutterFlow/Uno/WinCLI, lines 295–324) is
  comprehensive but any single project only ever uses one row — worth an apex-context-budget look
  at whether the framework-specific lane detail belongs in `references/design-lane-workflow.md`
  (partially already split out) rather than the main body. Not urgent — flagging for the leanness
  audit, not a correctness problem.
- [DEEPSEEK-RESIDUE] impl.md frontmatter only; impl.md body (coding-mode enforcement rules —
  interactive states, polish details) has no coder-model-specific content — it's stack-neutral
  polish rules a sighted or blind coder both need. [OK]

### apex-animation
- Clean; principles are surface-neutral, web defaults documented, no DeepSeek-specific content
  beyond frontmatter. [OK] [DEEPSEEK-RESIDUE] frontmatter only.
- [MOVE-TO-CODER] impl.md's NEVER/ALWAYS + code patterns (Motion/GSAP/CSS) are squarely
  per-task dispatch material — no visual-gate dependency, so this skill needs nothing changed for
  the vision upgrade. Good candidate for however the host eventually mechanises "distill impl.md
  into a dispatch prompt" (see § Cross-cutting recommendation).

### apex-accessibility
- [DEEPSEEK-RESIDUE] impl.md line 106 (verification checklist): *"needs a human at a real
  device/screen reader, which the DeepSeek coding backend does not have. DeepSeek must SKIP this
  step and flag it..."* — literal DeepSeek naming. **However**, the underlying constraint likely
  still holds for Terra: automated screen-reader testing (VoiceOver/NVDA/TalkBack) needs audio +
  a live human perception loop, which native *vision* doesn't solve. Recommend rewording to
  "the coding agent" (generic) rather than deleting the requirement — this is a genuine
  automation gap, not an artifact of the old image-blind coder. Distinguish from apex-figma below,
  where vision *does* solve the gap.
- Otherwise clean, stack-neutral WCAG 2.2 criteria, well-organized NEVER/ALWAYS + common-errors
  table. [OK]

### apex-figma — heaviest DeepSeek/image-blind residue in C5
- [DEEPSEEK-RESIDUE] impl.md § "DeepSeek image caveat — read first" (lines 25–30) is written
  entirely around DeepSeek having no image support. This is now **actually obsolete**, unlike the
  accessibility case — Terra has native vision and Figma MCP already returns screenshots, so a
  sighted coder can do the visual comparison itself.
- [DEEPSEEK-RESIDUE] impl.md NEVER list line 39 ("Claim a visual match you can't see — DeepSeek has
  no image support"), workflow step 7 (line 58: "SKIP visual screenshot comparison... FLAG it for
  planning review"), verification checklist line 70, and § Flag for planning-mode review line 75 —
  all built on the same now-false premise.
- [DEEPSEEK-RESIDUE] SKILL.md itself (planning side) line 66: *"Validate implementation against
  original design (screenshot comparison — planning/Claude only; the coding backend skips this,
  see impl.md)"* — also stale.
- [DEEPSEEK-RESIDUE] `apex-figma-agent.md` (`~/.claude/agents/apex-figma-agent.md`) frontmatter
  description literally reads **"DeepSeek only."** This is the exact tag the task called out.
  Since the agent's own behaviour steps (fetch MCP context → glob components → extend/create →
  map tokens → build) contain nothing DeepSeek-specific, this is a pure naming/scoping fix: either
  generalize the description to "the coding agent" or retarget it explicitly at Terra.
- **Net effect**: apex-figma is the one C5 skill that has NOT been brought forward to match
  apex-ui-ux-design's ADR-027 update. Recommend: fold the visual-comparison step back into the
  coder's own build loop (Terra screenshots + compares against the Figma reference inline, same
  pattern as apex-ui-ux-design's live-preview loop), and drop the "flag for planning review" path
  as the default — keep it only as an escalation for a *disputed* match, not the routine case.
- [SONNET-RISK] With the visual-gate collapsed into the build, a Sonnet orchestrator still needs a
  rule for what counts as "good enough" (no scored rubric exists here, unlike apex-ui-ux-design's
  0–10 dimension table) — worth either reusing that rubric by reference or defining a lighter one.

---

## C6 — stacks + AI cluster

### apex-stack
- [DEEPSEEK-RESIDUE] SKILL.md § Gotchas, line 169: *"The impl.md warns DeepSeek to verify current
  npm names."* — literal reference to the retired coder; the impl.md content itself (package-name
  drift, registry verification) is coder-agnostic and still correct, just needs the naming fixed
  to "the coder" / "coding mode."
- Clean planning/coding split otherwise: SKILL.md owns merit-based ecosystem selection + lock-in
  table + coverage gate (host judgment); impl.md owns ADR template + package-verification
  NEVER/ALWAYS (coder-facing). [OK]
- This is the meta-skill that *writes* `stack_skills:` bindings that gate which Verification
  Recipe apex-code loads — worth noting for question 1: the binding mechanism itself is already
  the right host-side artifact; no change needed here.

### apex-python — reference-quality template
- SKILL.md (Boundary, Research findings, "What to weigh," Hard blocks) and impl.md (NEVER/ALWAYS,
  patterns, layered **Verification Recipe**: project → language+quality → composition, plus a
  **Common errors → fix** table) are exactly the shape every stack skill should have. [OK]
- No DeepSeek-specific content beyond frontmatter. [DEEPSEEK-RESIDUE] frontmatter only.
- Directly answers review-question 1's "how do Verification Recipes reach a coder" for the
  cleanest case: they don't reach Codex directly — `uv sync → mypy --strict → ruff → pytest` is
  read and run by the host/orchestrator, and only the **first failing error** (per the "one
  hypothesis per failure" discipline already written into the recipe, line 107) gets distilled into
  the next Codex dispatch. This pattern should be the standard other stack skills are measured
  against.

### apex-swift
- **Mac-gating, not DeepSeek residue** — v0.1.0/0.2.0, explicitly flagged as "authored from
  research, never run (no Xcode/macOS on the authoring machine)" (SKILL.md line 22, impl.md
  lines 22–25). This is a real environment gap independent of coder-model choice (Terra's vision
  doesn't help if there's no Mac to build on) and is honestly self-labeled — not a residue to
  clean up, but flagging because it's the one C6 skill whose core Verification Recipe is still
  unvalidated in production. [OK as self-aware, but tracked]
- [SONNET-RISK] No explicit rule for **who** validates the recipe on the first real Mac build and
  bumps 0.x → 1.0.0 — this is a host/orchestrator judgment call (reading build output, deciding
  the recipe "converged") with no decision rule written anywhere. Worth a one-line addition: "on
  first successful Mac build, the orchestrator marks the recipe validated and requests a version
  bump via apex-skill-author."
- [SONNET-RISK] impl.md § "Apple agent skills — load as context when present" (lines 46–56) adds a
  *second* context-injection path (Apple's own `swiftui-specialist`/`swiftui-whats-new-27` skills,
  gated on Xcode 27) alongside APEX's own impl.md. No rule for precedence if the two conflict, or
  for how the host detects "present" when Codex/Terra itself isn't necessarily running on the Mac
  that would have Xcode 27 installed — worth clarifying where in the pipeline this load happens.

### apex-tauri — cleanest, most current file in either cluster
- Authored 2026-06-24 (most recent `last_updated` of any file reviewed), already fully in the
  post-ADR-027 idiom: no DeepSeek references anywhere, NEVER/ALWAYS + patterns + **layered
  Verification Recipe** (frontend / Rust / Tauri integration) + a 17-row **Common errors → fix**
  table (impl.md lines 86–104). [OK] — use as the template for refreshing apex-figma and
  apex-mobile's coder-facing sections.
- The MSVC-toolchain gotcha (impl.md line 33, "ALWAYS build on Windows with the MSVC toolchain") is
  a good example of a stack-specific environment trap that's already correctly coder-facing (Codex
  would hit `dlltool.exe not found` and the fix is right there in Common errors — no host judgment
  needed to resolve it).

### apex-mobile
- [DEEPSEEK-RESIDUE] impl.md line 157 (verification checklist): *"needs a human with
  simulators/emulators, which the DeepSeek coding backend does not have. DeepSeek must SKIP this
  step and flag it..."* — same pattern as apex-accessibility. Genuinely still true for iOS
  Simulator (Mac-only, unrelated to vision); murkier for Android emulator, which *can* run
  headless on a non-Mac host in principle. Recommend: reword away from "DeepSeek" naming, and have
  planning explicitly decide whether Codex/Terra (subprocess, presumably still Windows-hosted per
  current environment) is expected to attempt Android emulator runs or continue flagging both
  platforms for human testing.
- [SONNET-RISK] The flag lands as "flag for planning-mode / human review" with no explicit tie to
  an actual gate mechanism (apex-governance's approval gates aren't referenced here) — a Sonnet
  orchestrator would need a rule for what "flag" cashes out to operationally (block the build?
  note in handoff? require an approval prompt?).
- Otherwise clean: native-vs-cross-platform decision (SKILL.md) + Expo/RN NEVER/ALWAYS + bootstrap
  + EAS commands + Verification Recipe (impl.md). [OK]

### apex-ai-systems
- [DEAD-WEIGHT] SKILL.md § "Current model landscape — June 2026" (lines 42–54) has
  `staleness_threshold: 7d` and `last_updated: 2026-06-10`; today is 2026-07-10 — **30 days past
  its own staleness gate**, a full month stale by its own declared rule. The table (Fable 5 /
  Opus 4.8 / Sonnet 4.6 / Haiku 4.5) doesn't reflect the fleet this very review assumes (Sonnet 5,
  Terra/GPT-5.6 as the primary coder) — the skill whose entire job is "pick the right model" has
  the most conspicuously stale model table in the set. This should be the first thing an
  apex-refresh pass on this cluster fixes.
- Otherwise well-structured: provider/framework-neutral patterns, eval strategy, cost levers, and
  a clean coder-facing impl.md (NEVER/ALWAYS, caching pattern, Common errors table). [OK] beyond
  the staleness issue.
- No DeepSeek-specific residue — this skill was always model-agnostic in its actual guidance;
  only the landscape table needs a refresh, not a structural fix.

---

## § Cross-cutting recommendation (question 1, synthesized)

The clean pattern already exists in apex-python / apex-nextjs / apex-tauri: SKILL.md carries
judgment (host), impl.md carries **NEVER/ALWAYS + Verification Recipe + Common-errors-to-fix**
(coder-facing, but *host-executed* — apex-code/the orchestrator runs the recipe and translates
failures into the next dispatch prompt; Codex never reads impl.md directly). Two gaps:
1. Not every skill has a Common-errors table (apex-figma, apex-mobile, apex-design-system,
   apex-frontend lack one) — this is the most reliable bridge format found in the set and should
   be the bar for "coder-facing content," not raw NEVER/ALWAYS prose.
2. No skill states *who* (Sonnet vs. Opus) runs the recipe loop and diagnoses failures once the
   proposed Sonnet-orchestrator layer exists — apex-code's description implies "the orchestrator,"
   but none of the 13 files reviewed name Sonnet specifically. This is a governance-layer gap
   (apex-code / apex-governance), not a per-skill content problem.
