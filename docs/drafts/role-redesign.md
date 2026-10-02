# Role redesign — design draft (pre-spec)

Goal: cut Anthropic token spend by restructuring APEX roles (direction B: OpenAI authors, Claude is a
thin host + cross-family checker). This is a design draft, not an executable spec. It goes to
apex-plan once the open items are resolved, and becomes ADR-048 plus staged specs.

## Settled (owner-confirmed 2026-09-27)

1. **Goal:** cut Anthropic token spend.
2. **Host stays Claude.** Astra is dispatched as a deliberator (it can't host Claude Code).
3. **Direction B:** OpenAI authors specs and code; Claude is the thin host and cross-family checker.
4. **Roles are redesigned** from the functions the system needs, not reassigned one for one.
5. **Planning gate:** for new unplanned changes, one model plans and another cross-checks (models
   superseded by items 10, 35 and 38).
6. **System map:** a one-time sweep per repo produces `docs/system-map.md`.
7. **Every later change reads the map before any change is made,** unless it's trivial (below). This
   covers:
   - **Freshness:** each section records the files it covers and the SHA it was verified at.
     Before a read, run `git diff <sha>..HEAD -- <files>`, and re-survey only the stale sections.
   - **Update:** each close-out refreshes the sections the change touched and bumps their SHAs.
   - **Readers:** the Steward and the Architect read it. The Builder gets a one-line pointer in
     `AGENTS.md`.
   - **Shape:** an index of components, contracts, seams, `file:line` pointers, dependent files and
     the verified SHA. No rationale (that's in the ADRs) and no history (that's git).
   - **Git still wins:** the map says where to look, and planned claims are verified against live code.
8. **Trivial change:** exempt from the map read only when all four hold:
   1. one file, ≤10 changed lines
   2. the path isn't in any map section's contract or seam list (a grep, not a read)
   3. no behavior change: prose, or edits confined to comments. Skill instructions, config and code
      are behavior.
   4. not a High-tier path (wrapper, hooks, ledger, governance)

   **Guard:** the real `git diff --stat` is compared with the prediction afterwards. If it went
   over, the map read and a normal review happen before commit.

   **Calibration (2026-09-27, size criterion only, last ≤400 non-merge commits):** `apex` 39/240
   (16%), `~/.claude` 10/170 (6%). Target band ~10–15% before criteria 2–4 are applied.

9. **Stage 1, Intake:** every request gets two **separate** labels.
   - **Size** sets the path:
     - Trivial: the four-part definition above
     - Normal: one slice, a known approach → map read → spec
     - Big: more than one slice, a new approach, or a contract change → map read → planning gate
     - Bug: reproduce and root-cause first, then rejoin at spec
   - **Risk** (Low / Medium / High) sets review depth. High is forced by path rules.
   - **Who decides:** the host presents the evidence and proposes both labels; the owner decides.
   - Labels can be **raised at any later stage, never lowered.** A raise re-routes the change (for
     example Normal → Big sends it to the planning gate).

10. **Stage 3, planner:** Claude **Opus 5.5** proposes the plan, not Fable. This replaces item 5's
    "Fable plans". Fable has no default seat; it gets one only if a bake-off shows a win.
11. **Stage 3, one gate:** the new planning gate **replaces** the existing pre-draft Sol architecture
    pass (`apex-plan/SKILL.md:105`).
12. **Effort per role:** adopt the table in `docs/research/model-refresh-2026-09/effort-levels.md`
    as the working proposal. Never default to `max`; raise effort only on failure.

13. **Stage 3, the check:**
    - Astra classes each finding: **design**, **contract**, **grounding** (settled by reading the
      code), **decision** (goes to the owner), or **wording** (dropped at plan level; precision is
      checked at spec).
    - The host rules on every finding once, in writing.
    - A second read happens only if the approach changed, and covers only the changed section. At
      most 2 reads.
    - Then pass, or park with both sides laid out for the owner.
14. **Stage 3, approval (brief shown, no objection):** the owner approves each plan from a one-screen
    brief showing:
    - goal
    - approach and rejected alternatives
    - system changes, citing the map
    - a slices table with size and risk
    - the check summary, with rejected findings listed
    - decisions needed, each with a proposal

    The owner answers `y / n / edit`. An edit that changes the approach triggers the one allowed
    re-check.

15. **Stage 4, spec review:**
    - The Critic reviews each spec against the plan, the map and the live code.
    - **At most 3 rounds at every risk tier**, then it escalates to the owner.
    - Fixes are executed before re-review.
    - A third strike on the same defect class also escalates.
    - Wording counts at this stage.
    - The owner doesn't see specs unless one escalates, or a label is raised.
16. **Stage 4, Trivial changes:** no spec. The Builder gets a one-line task, and the size check
    afterwards is the guard.

17. **Stage 4, spec author:**
    - A **fresh gpt-6-sol** writes every spec: for Normal changes from the host's intent brief, for
      Big changes from the plan slice plus the plan's contracts.
    - It gets the relevant map sections and read-only access to the repo.
    - **Fallback:** if the first 5 Normal specs average more than 2 Critic rounds, or show intent
      drift, trial host-written Normal specs and compare.
18. **Stage 4, just in time:** each Big slice's spec is written right before that slice is built.
    - The plan owns cross-slice contracts, and the Critic checks that each spec conforms to them.
    - A spec that needs a contract changed is a label raise and goes back to the plan.
19. **Stage 4, review scope:**
    - Round 1 is a full review by a fresh Critic.
    - Rounds 2–3 are a **fix check**, also in fresh context: were the previous findings fixed, and
      did the changed text break anything? Unchanged text isn't re-audited.
    - Every author and reviewer runs in fresh context. The host only assembles the input bundles and
      relays verdicts.

20. **Stage 5, quota exhausted:** the build pauses and the **owner is informed** and decides (wait
    for reset, or fall back to Sonnet). There's no silent automatic fallback.

21. **Stage 5, the Engine:** fixed rules run as **code** in the wrapper, not as a paid model:
    - wave planning by file overlap and dependencies
    - dispatch, worktrees and the ledger
    - verify, scope check and baseline comparison
    - the retry ladder, medium → high → xhigh
22. **Stage 5, odd results:** anything the rules can't classify (for example a flaky test) goes to
    the **Steward (Claude)**, never to Sol.
23. **Stage 5, real failures:** when the ladder is used up, or something else goes wrong, the Steward
    analyses it and **brings it to the owner** with a diagnosis and a recommendation (fix the spec,
    split the task, or other). The owner decides.
24. **Stage 5, parallel cap:** stays at 2. Test 3–4 once the Engine exists, with timing and quota
    evidence.

25. **Stage 6, code review:**
    - A fresh Claude Critic reviews: Sonnet for Low and Medium risk, Opus 5.5 for High.
    - **When:** after every wave for High risk; once at the end for everything else.
    - Round 1 is a full review, rounds 2–3 are a fix check, and after 3 rounds it goes to the owner
      with the Critic's analysis.
    - **No extra Sol cross-family pass.** The Claude Critic is enough, because the builder is Sol.
      This supersedes the "one Sol pass" in the proposed loop rule below.

26. **Stage 7, commit approval:** each spec still gets **its own commit and message**, but the
    approval prompts are **held until session end** and shown there one after another, one per spec.
    A finished spec's work stays integrated and uncommitted until then. This amends the global
    CLAUDE.md rule ("commit per-spec when a spec completes"), so it's added to Documents affected.
27. **Stage 7, cleanup:** the Engine auto-deletes worktrees and branches when a build succeeds, and
    keeps them when it fails, for diagnosis. This replaces the manual D8 deletion by the owner.
28. **Stage 7, clashes:** the Steward diagnoses merge clashes and brings them to the owner with a
    recommendation, per item 23. No model resolves a clash on its own.
29. **Item 22 confirmed:** the Steward handles odd results itself (a flaky test gets noted in the
    handoff, then work continues). Only real failures go to the owner.

30. **Stage 8, map update:** the Scribe rewrites the map sections a change touched, from the diff,
    and bumps their SHAs. The Critic that reviewed the code checks those map edits in the same pass.
31. **Stage 8, handoff:** the Steward writes `docs/handoff/`, because it alone saw the decisions and
    the odd results it absorbed (item 29).
32. **Stage 8, paperwork:** the Steward owns `status.md`. The Engine archives specs to
    `changes/done/` as code (`git mv`). The Scribe owns CHANGELOG, README and inline docs.
33. **Stage 8, size guard:** the Engine compares the real `git diff --stat` with the trivial-change
    prediction, as code. If the change went over, it holds the commit prompt and hands the change to
    the Steward for the map read and a normal review (item 8).

34. **Steward (host) model:** Opus 5.5 at medium. Revisit once the spend-by-role measurement
    exists; if the host dominates spend, trial Sonnet 5 despite the early-return risk.
35. **Architect check model:** gpt-6-sol at xhigh. Astra is trialled only after its live probe, and
    once there's quota and scope-overreach evidence.
36. **Slice-cap calibration:** do a full calibration now, against the Artemis review logs, before
    anything ships. It becomes a prerequisite (below). The ~5–7 range stays provisional until it's
    done.
    **Done 2026-09-30** (`docs/research/model-refresh-2026-09/slice-cap-calibration.md`, 322 built
    Artemis specs). **Owner-adopted 2026-09-30:** a soft plan cap of 6 slices (7 or more → split
    first), plus a soft per-slice check (split before the spec if it's predicted to touch >~15 files
    or need >6 build tasks). The slices table gains a predicted file count. Files touched is the best
    predictor (AUC 0.66); task count is weak. The worst loops came from unsettled design, not size,
    and are handled by items 13 and 15. Confidence: low–medium. Recalibrate after ~10 Big plans using
    item 8's diff-stat comparison.
37. **Rollout order:** decide after the spend measurement. Probes and the spend-by-role measurement
    come first. If the build orchestrator is a big cost, build the Engine first; otherwise do the
    cheap swaps first (Builder → Scribe → Critic → Engine). In both orders the system map and
    planning gate come next-to-last and the host decision last. `dispatch-receipt-preflight` is
    folded into the Engine rather than built on its own.
    **Measured 2026-09-30** (`docs/research/model-refresh-2026-09/spend-by-role.md`, ~30 days, 99%
    Artemis). The build orchestrator is 0.1% of spend, so the **cheap swaps go first**. Cost shares:
    spec authors 44.7% (Opus, almost all cache re-reads), host 40.4% (mostly Fable 5.1), reviewers
    10.5%. The largest saving is item 17 (gpt-6-sol writes specs), so the spec-author swap belongs
    in the first rollout stage.
    When the Engine absorbs `dispatch-receipt-preflight`, its receipt gate must exempt `-AuthorSpec`
    dispatches (no spec exists yet to hold a receipt), and it must be built on top of
    `wrapper-model-author`'s edits to `codex-dispatch.ps1` and `AGENTS.md`.

38. **Planner:** the Steward (host) writes plans itself, with effort raised to high per message (which
    keeps the cache). There is no fresh planner agent, which avoids the re-read cost behind the
    spec-author spend.
39. **Scribe model:** gpt-6-luna at low, after a live probe (`codex exec -m gpt-6-luna "reply ok"`).
    If the probe fails, fall back to gpt-6-sol at low.
40. **Debugging:** the Steward reproduces and root-causes the bug. The fix then takes the normal path
    (spec → Builder → Critic).
41. **Host swap timing:** Fable 5.1 → Opus 5.5 moves to rollout stage 1, alongside the spec-author
    swap. Verify Fable's price first, measure a week of sessions, and roll back if quality drops.
    This supersedes "host swap last".

## Final roster (consolidated 2026-09-30 from items 1–41; the items win on any conflict)

| Role | Covers | Model · effort |
|---|---|---|
| Steward | talking with the owner, intake labels, **plans** (item 38), **debug root-cause** (item 40), odd results, failure/clash diagnosis, handoff, status, commit gates | Opus 5.5 host · medium, high per message for plans and adjudication |
| Spec author | writes every spec, fresh per spec (item 17) | gpt-6-sol · high (provisional, no effort-table row yet) |
| Architect check | one plan cross-check, ≤2 reads (items 13, 35) | gpt-6-sol · xhigh (Astra trial later) |
| Builder | writes the code | gpt-6-sol · medium, low for Trivial, ladder medium → high → xhigh; Sonnet 5 only on owner decision at quota-out (item 20) |
| Critic | spec review + code review, fresh context, ≤3 rounds (items 15, 19, 25), checks Scribe map edits (item 30) | Sonnet 5 for Low/Medium, Opus 5.5 · high for High |
| Scribe | CHANGELOG, README, inline docs, map section rewrites | gpt-6-luna · low (item 39) |
| Engine (code) | waves, dispatch, worktrees, ledger, verify, retry ladder, cleanup, archival, size guard, receipt preflight | wrapper code in `~/.claude` |

**Retired agent definitions:** `apex-build-orchestrator` → Engine · `apex-coder`, `code-worker` →
Builder (Codex) · `apex-reviewer`, `apex-spec-reviewer`, `apex-wave-reviewer` → Critic ·
`apex-docs-product-agent` → Scribe · `apex-docs-technical-agent` → Steward (handoff) + Engine
(archival). Research/Explore subagents (2.4% of spend) are unchanged.

**Rollout** (item 37 + item 41; each stage measured):
1. Host Fable 5.1 → Opus 5.5 **and** spec author → gpt-6-sol
2. Builder A/B (gpt-6-sol vs gpt-5.6-sol)
3. Scribe (after the Luna probe)
4. Critic consolidation
5. Engine
6. System map + planning gate

## Open

Resolved since the first draft: Engine as code (item 21); escalations to the Steward (items 22–23);
Fable dropped as default, Opus 5.5 plans (item 10); the planning-gate threshold is the Big size
label (item 9).

Stage 7 and item 22 were settled 2026-09-30 (items 26–29).

Stage 8 was settled 2026-09-30 (items 30–33).

All open items were settled 2026-09-30 (items 34–41).

## Prerequisites (all resolved 2026-09-30)

- Live probes (owner): `gpt-6-sol` PASSED 2026-09-30 (codex 0.157.1, replied ok, 4,617 tokens).
  `gpt-6-luna` PASSED 2026-09-30 (replied ok, 9,302 tokens: ~2× Sol's overhead on the same trivial
  call, so check real quota cost per doc task in rollout stage 3 before assuming Luna is cheaper).
  `gpt-6-astra` PASSED 2026-09-30 (replied ok, 17,174 tokens, ~3.7× Sol's overhead for the same
  trivial call, an early quota-burn signal for the item 35 trial).
- ChatGPT plan tier: **Pro** (owner, 2026-09-30). B moves most of the quota load to OpenAI.
- Measure the Anthropic spend split by role, to size the savings and confirm the host is the main
  cost. This also decides the rollout order (item 37).
- Slice-cap calibration against the Artemis review logs (item 36): DONE and adopted 2026-09-30.

## Documents affected

- New ADR-048, which supersedes parts of ADR-045 and ADR-046 D1, amends ADR-032/034/042 and ADR-038
  (if hosts are swapped).
- Wrapper `-Model` parameter.
- The routing table in `~/.claude/hooks/apex-session-context.md`.
- Agent definitions.
- `apex-plan` (planning gate, grounding), `apex-code` (Engine), `apex-init` (seeds `system-map.md`).
  `apex-init`'s description already promises a "System Overview stub" that its `SKILL.md` doesn't
  contain.
- Global `~/.claude/CLAUDE.md` § Git: approvals for per-spec commits are held until session end
  (item 26).
- `dispatch-receipt-preflight` may be absorbed by the Engine; decide before building it.

## Where I stopped

- **Paused 2026-09-27 at the owner's request, mid Stage 7.** Stages 1–6 are settled (items 1–25).
- **Owner direction:** design the ENTIRE build system first. No sweep and no spec (the map included)
  until the whole design is settled. Walk it stage by stage: intake → grounding → plan → spec →
  build → review → integrate → close-out.
- **2026-09-30:** Stage 7 and item 22 settled (items 26–29).
- **2026-09-30:** Stage 8 settled (items 30–33). The stage walk-through is complete.
- **2026-09-30:** Open 6–9 settled (items 34–37). **The design is complete.**
- **2026-09-30:** all four prerequisites resolved (both probes passed, Pro tier, spend measured,
  slice cap adopted).
- **Next:** apex-plan → ADR-048 and the staged specs, starting with the cheap swaps (spec author
  first).
- **Owner preference:** explain in plain language, with analogies (the building-site picture worked).
  One stage at a time, with 2–4 questions each, each with a recommendation.
- **After the design:** resolve the prerequisites (all four resolved 2026-09-30), then apex-plan → ADR-048 and the staged
  specs.

## Stage 5 + 6 spec-level decisions (owner, 2026-10-01/02)

**Stage 5 — Engine**
42. **Engine form:** a new runner `skills/apex-code/scripts/apex-engine.ps1` reads a spec, plans waves
    by file overlap and stated dependencies, calls the existing wrapper once per task, then runs
    verify, integration and cleanup, logging to the ledger. `codex-dispatch.ps1` stays a
    single-dispatch tool.
43. **Where it runs:** its own process, outside Claude Code, started automatically. The owner
    registers a Windows scheduled task once (one `!` command at build time); it watches a queue file
    and picks up queued specs. The host only writes the queue file and never launches processes.
44. **On failure:** the failed spec is parked with its worktree kept; dependents are skipped;
    independent specs continue. On quota exhaustion the Engine waits for the reset and resumes, and
    never falls back to another model on its own (item 20 still holds for the fallback decision).
45. **Unattended review:** builds finish integrated and uncommitted; Critic code reviews run at the
    attended close-out. No headless `claude -p` (separate capped credit pool).

**Stage 6 — system map + planning gate**
46. **First maps:** `~/.claude`, `artemis`, `Atlas` (not the apex docs repo).
47. **Intake labels:** the host sets size and risk and shows them in one line; the owner is asked only
    when the host proposes Big or High. Amends item 9's "owner decides" for Trivial/Normal and
    Low/Medium. Labels can still be raised at any time, never lowered.
48. **Planning-gate checker:** gpt-5.6-sol at xhigh for now (amends item 35's gpt-6-sol), pending
    the builder A/B on 6 / 6.1-sol. Research: docs/research/model-refresh-2026-09/gpt6-sol-vs-56-builder-2026-10-01.md.
49. **Map format:** one `docs/system-map.md`, a section per component; split into
    `docs/system-map/<component>.md` plus an index if it passes ~400 lines.

**Builder:** stays gpt-5.6-sol. Stage 2's A/B compares 6.1-sol (if real) or 6-sol against it on real
tasks (owner-reviewed research verdict, 2026-10-01).
