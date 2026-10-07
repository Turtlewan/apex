# Plan brief draft — Stage 6: System map + planning gate

Sources: docs/drafts/role-redesign.md (RR) · ADR-048 · docs/research/model-refresh-2026-09/slice-cap-calibration.md (SCC) · ~/.claude/skills/apex-plan/SKILL.md (PLAN) · apex-plan/references/sol-plan-check.md (SPC) · apex-init/SKILL.md (INIT) · docs/status.md queue item 5 (line 34).

## Problem
Every non-trivial change today is planned from whatever the host re-derives from the repo; there is no durable, freshness-checked index of components/contracts/seams, no intake size label (PLAN's Mode table is Deep Details / Light / Bug Fix only, PLAN:~64-70), and the only plan-level cross-check is the pre-draft Sol architecture pass (PLAN:108-115; SPC:88-). Stage 6 adds (a) the per-repo map + freshness protocol, (b) the Trivial/Normal/Big/Bug size label with the Big-only planning gate (replacing the pre-draft pass), (c) slice caps, (d) Scribe map-section rewrites + Critic check of them, (e) the Engine size guard.

## Decisions so far (anchors)
- RR:15 item 6: one-time sweep per repo -> `docs/system-map.md`.
- RR:16-25 item 7: every later change reads it unless trivial. Freshness = each section records files covered + verified SHA; before read run `git diff <sha>..HEAD -- <files>`, re-survey only stale sections. Update = close-out refreshes touched sections, bumps SHAs. Readers = Steward + Architect; Builder gets a one-line pointer in AGENTS.md. Shape = index of components, contracts, seams, file:line pointers, dependent files, SHA; no rationale, no history. "Git still wins" (planned claims verified vs live code).
- RR:26-37 item 8: Trivial = one file, <=10 lines; path not in any section's contract/seam list (grep); no behavior change (skills/config/code count as behavior); not High-tier path (wrapper, hooks, ledger, governance). Guard: real `git diff --stat` vs prediction; overrun => map read + normal review before commit. Calibration: apex 16%, ~/.claude 6% on size criterion alone.
- RR:39-48 item 9 + 47 (RR:~297): two separate labels. Size Trivial/Normal/Big/Bug; Risk Low/Med/High (High forced by path rules). Host sets and shows both in one line; owner asked only when host proposes Big or High (item 47 amends item 9). Raise any time, never lower; a raise re-routes (Normal->Big => planning gate).
- RR:50-55 items 10-12; 38 (RR:176): Steward (Opus 5.5) writes plan itself at high effort; no fresh planner. Item 11: the gate REPLACES pre-draft Sol arch pass (item cites PLAN:105; now PLAN:108).
- RR:57-64 item 13: checker classes findings design/contract/grounding/decision/wording (wording dropped at plan level); host rules on every finding once, in writing; second read only if approach changed, changed section only; max 2 reads; then pass or park with both sides for owner.
- RR:65-75 item 14: one-screen brief: goal; approach + rejected alternatives; system changes citing the map; slices table (size, risk, predicted files per item 36); check summary incl. rejected findings; decisions needed with proposals. Owner y/n/edit; an approach-changing edit triggers the one allowed re-check.
- RR:148-161 items 35/36 + 48 (RR:289): checker gpt-6-sol xhigh (item 35) amended to **gpt-5.6-sol xhigh for now** (item 48) pending builder A/B. Slice caps adopted 2026-09-30: soft plan cap 6 slices (7+ split first); soft per-slice check: split before spec if predicted >~15 files or >6 build tasks; slices table gains predicted-file count (files AUC 0.66, tasks 0.55). Recalibrate after ~10 Big plans via item 8 diff-stat (SCC:21-29, 233-242).
- RR:138-146 items 30, 33: Scribe rewrites touched map sections from the diff and bumps SHAs; the code Critic that reviewed the code checks those edits in the same pass. Engine compares `git diff --stat` to the trivial prediction as code; on overrun holds commit prompt and hands to Steward for map read + normal review.
- RR:284-292 items 46, 49: first maps = ~/.claude, artemis, Atlas (NOT apex docs repo). Format: single `docs/system-map.md`, section per component; split to `docs/system-map/<component>.md` + index past ~400 lines.
- RR:236-244 Documents affected: apex-plan (planning gate, grounding), apex-code (Engine), apex-init (seeds system-map.md). Note INIT:17,86-95 promises/handles a System Overview stub; RR:243 flags the description/body gap (the overview stub IS seeded at INIT:86,226 — recheck the claim).
- ADR-048:79-90, 108-110, 114-121, 135, 183-184: same decisions; "until stage 6, the Sol architecture pass stays in apex-plan".
- Rollout order RR:204-210 / queue status.md:34: stage 6 follows Scribe (stage 3, building now) and Engine (stage 5); status.md:34 says Scribe map-section rewrites are added to the Scribe HERE.

## What already exists (overlap)
- `docs/technical/architecture/overview.md` (ADR-014): terse capability index, merge-on-archive by apex-docs-technical (apex-handoff SKILL:84); doc-coverage check PLAN:46-60 flags stub/stale overview (stub marker `<!-- apex:overview:stub -->`, INIT:86-90,226-245), readiness item PLAN:368 "Overview". The map is DIFFERENT: component/contract/seam/file:line/SHA index for code-change grounding; overview = capability prose for humans. Keep both; map must not duplicate overview. Doc-coverage check gains a map line (missing / stale sections), informational.
- Pre-draft Sol arch pass: PLAN:108-115, SPC:88-145, review.log round token `arch-N` (PLAN:166,262,270), exit contract 0/68/67, risk-high approval gate via apex-governance banner, session-context routing row (hooks/apex-session-context.md:34 "Both Sol reads ... pre-draft architecture pass and post-readiness cold read"). Post-readiness cold read stays (spec level). The new gate replaces ONLY the pre-draft pass; its reuse of codex-dispatch `-Task arch-check -Phase review -Schema review -Effort xhigh` is the likely mechanism (model flag -Model gpt-5.6-sol is the default).
- Mode table (PLAN): Deep Details/Light/Bug Fix. Session-context line 34 and ADR-048:157 ("Until size labels exist, Normal means Deep Details or Light"). No Trivial/Normal/Big labels anywhere in skills (rg confirmed none in apex-plan/orchestrate/init/hooks).
- Engine: skills/apex-code/scripts/apex-engine.ps1 + engine-plan/git/dispatch exist; no diff-stat/size-guard code (rg: none).
- Scribe: references/scribe.md being built by scribe-stage3 (docs/changes/scribe-stage3.md Task 1; scope = CHANGELOG/README + changed-source comments only; Critic comment-only gate). Map rewrites are NOT in it (non-goal), so they are a later amendment to scribe.md.
- Existing repo docs: ~/.claude has NO docs/ dir (only progress/; blanket gitignore -> `git add -f`, AGENTS.md 33 lines); artemis has docs/ + AGENTS.md (149 lines); Atlas has docs/ + architecture/ + ATLAS-BIBLE.md + AGENTS.md (135); autoclicker has docs/technical + status.md + AGENTS.md. No system-map.md exists anywhere (rg).
- Prior sweep notes: status.md:~37 "map-sweep finds (2026-10-02)" and "artemis client has NO lifestyle/nutrition DTO (map sweep)" — owner/host surveyed some repos informally; no artifact. Reusable as seed evidence.

## What is new
Map file + schema; freshness script/procedure; size labels in apex-plan + routing; Big planning gate (brief template, finding classes, ruling log, <=2 reads, y/n/edit); slice caps in slices table; Scribe map rewrite step; Critic map-edit check; Engine size guard; intake trivial-path grep; AGENTS.md one-line pointer; apex-init seeding of map stub; doc-coverage map line.

## Where the map lives / format (proposed)
`<repo>/docs/system-map.md` (RR item 49). Per component section:
```
## <component>
<!-- apex:map-section covers: <glob/paths...> verified: <sha> -->
Role (1 line) · Contracts: file:line ... · Seams: ... · Dependents: ... · Pointers: file:line
```
Machine-parseable header comment (covers + verified SHA) so a small PowerShell helper `apex-map-check.ps1` (new, apex-code/scripts or apex-plan) can run `git diff <sha>..HEAD -- <covers>` per section, print stale section names, and also run the Trivial grep (path in any covers/contract/seam list). Header also `<!-- apex:system-map -->` marker for doc-coverage check. Split at ~400 lines into docs/system-map/<component>.md + docs/system-map/index (item 49). ~/.claude: create `docs/system-map.md` and `git add -f` (blanket ignore). Builder pointer: one line in each repo's AGENTS.md (outside the `## Verify commands` fence: the heading must be followed directly by the fence — MEMORY m2b-gate-refuses-prose-recipes).

## Initial map authorship (bootstrap)
Not decided in the items. Proposal: a one-time "map sweep" is a Steward-run research task per repo, authored by gpt-6-sol/5.6-sol read-only via `-AuthorSpec`-style dispatch? Caution: wrapper author mode allows exactly one `docs/drafts/<name>.md` write, not docs/system-map.md. Options: (A) Steward (Opus) sweeps and writes it directly (host does not edit specs but map is a doc, not a spec; costly Opus context on big repos); (B) Explore/general-purpose subagents per component then Steward assembles; (C) Scribe (Luna low) rewrites from a Steward-provided component list — too weak for first survey; (D) Codex read-only dispatch producing map into a worktree, Critic reviews, Steward integrates (needs wrapper support for a map target path — extra spec). Recommend B for ~/.claude/Atlas/artemis (3 sweeps), reviewed by an Opus Critic grounding pass (spot-verify file:line). apex repo excluded per item 46 (self-hosting; overview.md suffices); autoclicker not named in item 46 — owner call.

## How the planning gate changes apex-plan
1. Intake (new section before Mode): host proposes Size+Risk with evidence in one line; asks owner only for Big/High; labels only rise. Mode table maps: Trivial -> no spec, one-line builder task; Normal ≈ Light/Deep Details one slice; Big -> gate; Bug -> existing Bug Fix + reproduce first (item 40).
2. Session start gains step: map freshness check (`apex-map-check`) for Normal/Big.
3. "Writing the spec" FIRST-block (PLAN:108-115) replaced for Big by planning gate; Normal Medium/High lose the pre-draft pass?? (OPEN: item 11 says gate replaces the pre-draft pass; Normal specs have no plan, so they would get no pre-draft Sol read — only the post-readiness cold read; confirm).
4. sol-plan-check.md: pre-draft section rewritten as "planning gate check" (finding classes, host ruling, <=2 reads, park both sides); `arch-N` round tokens kept or renamed.
5. Plan brief template (one-screen) + slices table with predicted files; caps checked mechanically by host (>6 slices, >~15 files, >6 tasks => split).
6. Readiness checklist (PLAN:~368) gains map-updated line; session-context routing row line 34 updated; model-routing.md updated (checker gpt-5.6-sol xhigh).
7. Spec author pack gets "relevant map sections" (item 17).

## Proposed structure — specs and waves (all file-disjoint within a wave)
Prereqs: scribe-stage3 shipped (scribe.md exists); Engine cutover ideally shipped (size guard lives in Engine) but not required for 6a-6c.

Wave 1 (parallel, disjoint):
- 6a `system-map-core` (~/.claude, risk Medium): map schema reference (`skills/apex-plan/references/system-map.md`: format, freshness protocol, trivial grep, bootstrap-sweep procedure), freshness helper `skills/apex-plan/scripts/apex-map-check.ps1` + hermetic test, apex-init seeding (`skills/apex-init/SKILL.md`: map stub + AGENTS.md pointer line). Doc-coverage line in apex-plan is NOT here (SKILL.md owned by 6b).
- 6b `planning-gate` (~/.claude, risk High because apex-plan routing + session-context hook line; critical paths hooks/): apex-plan/SKILL.md (intake labels, Mode map, gate replaces pre-draft pass, slices caps, doc-coverage map line, readiness line, version bump), references/sol-plan-check.md (gate recipe), references/model-routing.md, hooks/apex-session-context.md line 34 (HOST/owner task if hook is critical), orchestrate template stub if briefs need a plan-brief template (spec-template untouched). Depends on 6a for helper name only (reference by path; sequential if the manifest declares).
Wave 2:
- 6c `scribe-map-update` (~/.claude, Medium): amend scribe.md (map-section rewrite step, covers/SHA bump from diff, restricted to docs/system-map*.md), Critic map-edit check in apex-critic.md/apex-code SKILL Post-build step; depends on 6a (schema) and scribe-stage3.
- 6d `engine-size-guard` (~/.claude, High: wrapper/engine): size guard in apex-engine.ps1 (+ test): reads spec/task prediction (manifest field e.g. `size_prediction`/trivial flag), compares `git diff --stat`, holds commit and flags handoff. Needs spec-contract/validator tweak for the prediction field (apex-spec-validate.ps1, spec-contract.md). Depends on Engine cutover; can slip behind 6e.
Wave 3 (per-repo, sequential or parallel by repo, host/owner-run sweeps, not coder specs):
- 6e `map-bootstrap-claude`, `-artemis`, `-atlas`: sweep + Critic grounding review + AGENTS.md pointer line (+ Artemis/Atlas repos are separate: needs per-repo spec with its own AGENTS.md verify). Decision-record: apex-side ADR-048 amendment (host), SKILL-HISTORY.md rows, SKILLS.md (HOST tasks, apex repo).

Alternative: collapse 6a+6c (Scribe+schema) if Scribe is stable; keep 6b separate since High.

## File map (path / op / role)
| Path | Op | Role |
|---|---|---|
| ~/.claude/skills/apex-plan/references/system-map.md | create | schema, freshness, trivial-grep, sweep recipe |
| ~/.claude/skills/apex-plan/scripts/apex-map-check.ps1 (+ -test.ps1) | create | staleness + trivial-path helper |
| ~/.claude/skills/apex-plan/SKILL.md | modify | intake labels, gate, slice caps, coverage line |
| ~/.claude/skills/apex-plan/references/sol-plan-check.md | modify | replace pre-draft section with gate |
| ~/.claude/skills/apex-plan/references/model-routing.md | modify | checker model/effort |
| ~/.claude/hooks/apex-session-context.md | modify (critical path) | routing row line 34 |
| ~/.claude/skills/apex-init/SKILL.md | modify | seed map stub + AGENTS pointer |
| ~/.claude/skills/apex-code/references/scribe.md | modify | map rewrite step |
| ~/.claude/skills/apex-code/SKILL.md | modify | post-build Critic map-check pointer (500-line cap: currently ~478+; check) |
| ~/.claude/agents/apex-critic.md | modify | map-edit check |
| ~/.claude/skills/apex-code/scripts/apex-engine.ps1 (+test) | modify | size guard |
| ~/.claude/skills/apex-code/scripts/apex-spec-validate.ps1, references/spec-contract.md | modify | size-prediction field |
| <repo>/docs/system-map.md (~/.claude, artemis, Atlas) | create | the maps |
| <repo>/AGENTS.md (3 repos) | modify | one-line pointer |
| apex: ADR-048, SKILL-HISTORY.md, SKILLS.md, docs/status.md | modify (HOST) | amendment/history |

## Open owner decisions
1. Bootstrap method/author for the first maps (A-D above) and who reviews them.
2. autoclicker (and apex itself) map: item 46 excludes apex; autoclicker unnamed — in or out?
3. After pre-draft pass is replaced: do Normal Medium/High specs lose any pre-spec Sol read (item 11 vs PLAN's Medium/High rule)? Confirm gate = Big-only per item 9.
4. Size-guard prediction source: who records "predicted files/lines" (host at intake -> spec field/manifest) and what exactly Engine does on overrun (exit code, state).
5. Planning-gate checker model: item 48 says gpt-5.6-sol xhigh pending A/B; confirm still true given builder default status (queue item 6).
6. ~/.claude map location (new docs/ dir inside blanket-ignored repo, `git add -f`) vs elsewhere.
7. Whether Scribe (Luna low) is adequate for map rewrites or map edits go to Sol low (the map is higher stakes than comments; Critic check mitigates).
8. Trivial-change path: confirm a "trivial prediction" is made by the host and the Builder one-line task flow ships in this stage or with the Engine.
9. Apex-repo: map not required (item 46) — but Trivial grep (item 8.2) needs a map; confirm apex changes skip the map read entirely or use overview.md.

## Risk suggestion
6a medium, 6b HIGH (apex-plan/session-context routing, doctrine replacement; High-tier path rules), 6c medium, 6d HIGH (Engine/wrapper), 6e low-medium (docs only but wide read). Overall plan risk: High; Big plan itself (>1 slice, contract change) — first real use of the gate, dogfood it on this plan (pre-draft Sol pass still in force until 6b lands).

## Facts to verify before spec
PLAN:108 line numbers drifted from RR's :105; confirm INIT description vs body gap (INIT:86 does seed overview stub); apex-code SKILL.md line count vs 500 cap (scribe-stage3 bumps it to ~480+); stage-1 `spec-author-routing` and `critic-consolidation` are done (changes/done) so Mode/"Normal means Deep Details or Light" bridge is live.
