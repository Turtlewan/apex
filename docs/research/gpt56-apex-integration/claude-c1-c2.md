# Claude-side review — C1 (core loop) + C2 (meta/quality)

Reviewer: Claude host perspective (Sonnet 5), reviewing for a proposed future split — Opus plans,
GPT-5.6 Sol double-checks plans, **Claude Sonnet 5 orchestrates the build session**, Terra (`gpt-5.6-terra`) codes.
Today: Opus/Fable plans+hosts; Codex is dispatched as a `codex exec` subprocess per task; Codex never
reads skill files — the Claude host distills constraints into dispatch prompts.

Tags: `[SONNET-RISK]` `[MOVE-TO-CODER]` `[DEEPSEEK-RESIDUE]` `[FABLE-DEP]` `[OK]`

---

## Headline finding (cuts across C1 and C2)

**`[MOVE-TO-CODER]` `[SONNET-RISK]` The host loads coder-facing rules into its own context, but the
documented Codex dispatch prompt never includes them — so for the (default, common) Codex-built
path, the rules never reach the entity actually writing code.**

- `apex-code/SKILL.md` § "Verification — run the stack's recipe" (lines ~226–243): *"Read
  `~/.claude/skills/apex-coding-principles/impl.md` in full before writing any code"* and *"Load the
  bound impl.md core (once, at pre-flight)... `## NEVER do` + `## ALWAYS do`... the coder must obey
  while writing"* — this is phrased as if the reader of these instructions is the code-writer. Under
  ADR-027, the code-writer for the default path is **Codex**, an external subprocess that never reads
  `apex-code/SKILL.md` or any `impl.md`.
- The actual dispatch-prompt recipe (`apex-code/SKILL.md` § Model-routing dispatch, and
  `references/codex-observability.md` § Recipe) only interpolates: task text + files for the task +
  acceptance criterion + the "Autonomy clause." **No NEVER/ALWAYS rules, no Verification Recipe, no
  stack conventions are in that string.**
- `AGENTS.md` (seeded by `apex-init`, read directly by Codex — the one channel that *would* reach
  the coder without host distillation) has its `## Conventions` section left as a stub
  (`<!-- apex:agents:stub -->`, "Planning fills this... anything ruff/mypy/the linter does not
  mechanically enforce") — i.e. the coding-principles NEVER/ALWAYS list is not wired into the one
  artifact Codex actually reads either.
- **Net effect:** on the Codex-primary path, apex-coding-principles/impl.md and the bound stack
  impl.md core are read into the *host's* context for no operational effect (Codex never sees them),
  and burn per-build context for nothing. On the Opus-fallback path they matter completely (the host
  IS the coder there). The skill text does not distinguish the two cases.
- Same conflation on `context7 at the write step` ("before writing non-trivial code... consult
  context7") — context7 MCP is a host-side tool; Codex-as-subprocess has no access to it.

**Fix options (either closes the gap):**
1. Fold a condensed NEVER/ALWAYS + Verification Recipe pointer into the per-task `codex exec` prompt
   (extend the documented prompt-construction string), **or**
2. Have `apex-init`/planning populate `AGENTS.md § Conventions` from
   `apex-coding-principles/impl.md` + the bound stack's impl.md core at spec-ready time — since Codex
   already reads AGENTS.md natively, this needs no per-task host distillation at all.
3. Either way, gate "load impl.md core into host context" explicitly to the **Opus-fallback** path in
   `apex-code/SKILL.md` — stop instructing the host to load it "before writing any code" when Codex is
   the one writing.

This also means `apex-context-budget`'s per-build accounting of "impl.md core... loads... per build
run" (its loading-tier table) currently mis-states the *purpose* of that load for the Codex-primary
case — worth a follow-up line once the above is fixed.

---

## C1 — Core loop

### apex-orchestrate/SKILL.md
- `[OK]` Step 1–4 (orient, surface in-flight, mode detection, routing table) are fully mechanical —
  table-driven, Sonnet executes these correctly with no judgment gap.
- `[SONNET-RISK]` Step 4: *"If multiple match, route to the most specific"* — no tie-break rule given.
  Low-stakes (routing only), but a one-line disambiguation example would remove the one bit of
  judgment in an otherwise fully mechanical section.
- `[OK]` Governance/hard-block echoes correctly defer to apex-governance as canonical ("consult it;
  never maintain a separate copy here") — good single-source-of-truth discipline, low drift risk.
- `[OK]` Dispatch return contract + strategic-compaction sections are already fully proceduralized
  (bulleted triggers, not open judgment).

### apex-plan/SKILL.md (+ references/model-routing.md, adr-and-status-procedures.md)
- `[FABLE-DEP]` § "Widen the options — research gate": trigger is prose-judgment — *"at a meaningful
  solution-branch point... the choice has real trade-offs, touches architecture, or rests on knowledge
  that may be stale"* — no checklist, purely holistic. Since this fires in **planning** (still Opus's
  job in the proposed split, not Sonnet's), the risk is lower for the Sonnet-host stress test, but it's
  the clearest instance in this cluster of judgment-without-procedure and is worth hardening
  regardless of which model plans (a concrete trigger, e.g. "≥2 approaches AND touches architecture/
  data-model/external integration OR reverses a prior decision").
- `[OK]` Readiness Gate, Confirmation Digest mode-table, and ADR/status.md procedures are fully
  itemized checklists — low risk for any executing model.
- `[OK]` `references/model-routing.md` is already fully current for ADR-027/030 (Codex default +
  Opus fallback + effort dial) — no residue.
- Not a Sonnet-host concern under the proposed split (apex-plan is Opus's skill), but flagging for
  completeness since it's in-cluster.

### apex-code/SKILL.md (+ references/*)
This is the file the Sonnet host actually executes, so it gets the deepest stress test.

- `[OK]` Session start, AFK pre-flight steps 1–5, Karpathy Pre-Flight (a/c/d), Wave domain review
  (domain table, pass-count rule, union-verdict rule, findings-handling table), post-build steps, and
  the permissions pre-authorisation flow are **all** table-driven or exhaustively enumerated. A Sonnet
  host should execute every one of these correctly — this is the strongest part of the whole cluster
  for a weaker-reasoner host.
- `[SONNET-RISK]` **Karpathy step b (Simplicity flag)** — deciding what counts as "a significantly
  simpler implementation" vs. the "purely mechanical reductions" exception is a genuine judgment call.
  Low-stakes though (log-only, spec is still implemented as written) — no hardening needed beyond
  noting it.
- `[SONNET-RISK]` **Wave Analysis fallback** (no `## Wave plan` in the spec): the three-check pairwise
  test (file conflict / output dependency / shared state) plus "never infer an unstated dependency —
  treat as dependent if uncertain" is a good explicit safety net, but still asks the host to reason
  about *unstated* output dependencies across N tasks. Since `apex-plan`'s readiness gate already
  requires a `## Wave plan` for specs ≥3 tasks, this path is rare — but for <3-task or legacy specs a
  Sonnet host could still miss a subtle dependency the "uncertain → sequential" rule doesn't catch
  because the host judged (wrongly) that it *wasn't* uncertain. No change strictly required; flagging
  because it's the one place complex multi-task reasoning isn't table-driven.
- `[SONNET-RISK]` **Fork classification (SMALL / BIG / GRAY)** — the single highest-judgment spot in
  the whole build flow. "Keeps the spec's approach (same implementation shape)" and "a materially
  better path exists" are holistic calls, not mechanical tests, even though they're bulleted. A Sonnet
  host is more likely than an Opus-class host to mis-classify a scope-creeping "small" fix as SMALL
  (rationalizing) or to over-escalate a genuinely small fix to GRAY. **Hardening suggestion:** convert
  the two bullet lists into a single ordered decision tree (Q1: stays within Files to Change? Q2: no
  new dependency/file/schema/API change? Q3: same implementation shape? Q4: no critical file? → all
  yes = SMALL; any BIG-test hit = BIG; otherwise GRAY) so the host applies a sequence of binary checks
  instead of holding both lists in working memory and reconciling them itself. This is the highest-
  value single edit this review can recommend for C1.
- `[SONNET-RISK]` **Wave-boundary compaction** trigger — *"if main-context usage is high (≳70%)"* —
  assumes the host can self-report its own context percentage with no stated method. Recommend citing
  whatever concrete signal the harness actually exposes (a system-reminder percentage, `/context`,
  etc.) rather than leaving it to self-assessment, which models are known to do unreliably.
- `[SONNET-RISK]` **Package legitimacy / typosquat check** (AFK pre-flight step 6) — "verify the name
  is correct... the package is actively maintained" with no stated method (registry last-publish date?
  known-typosquat list?). Bounded by a safe fallback (log + don't install if uncertain), so low
  consequence, but genuinely under-specified as a *procedure*.
- `[MOVE-TO-CODER]` The intricate Bash mechanics of Codex dispatch (pipe-via-stdin, `--json`/`-o`
  split, backgrounding, tail-based progress pulses, worktree-per-task under ADR-028 parallel dispatch)
  are already given as **literal copy-paste templates** in `references/codex-observability.md` and
  `references/parallel-codex.md` — this is good practice (a Sonnet host is far less likely to
  "improve" a literal template than to correctly improvise the same invocation from prose). The one
  residual risk: the skill explicitly calls out that a bare-arg `codex exec` "hangs... proven
  2026-06-22 pilot" — a known regression a model could reintroduce if it pattern-matches to a more
  familiar `codex exec "<prompt>"` shape instead of using the literal template. No file change needed;
  just flagging this as the one spot where "prose reminds you the naive way is wrong" is doing real
  work and must not be trimmed for length in any future edit.
- `[SONNET-RISK]` Parallel Codex dispatch (ADR-028) requires the host to track N concurrent
  subprocesses × {worktree path, branch, log path, `.final` path, integration status} with no explicit
  tracking artifact prescribed. This is closer to an orchestration-engineering gap than a judgment
  gap, but a Sonnet host juggling this purely in working context is a plausible failure point at
  cap=3–4. Suggest a small tracking-table template (task-id → worktree → branch → log → status) the
  host must maintain in scratch, rather than relying on implicit state-holding.
- `[OK]` Hard blocks, autonomy-level summary, decisions-log format — fine, deliberately deferring to
  apex-governance as canonical.

### apex-governance/SKILL.md (+ levels/L0–L5.md)
- `[OK]` Fully current for ADR-027 (Codex-primary, Opus fallback, DeepSeek archived); "capability is
  not authority" rule is a clean, well-stated invariant that removes a plausible Sonnet-host
  rationalization ("the coder is stronger now, so I can relax a gate") before it can occur.
- `[OK]` L0–L5 level files are compact and mechanical — no residue, no judgment gaps.
- `[OK]` Evaluator-independence invariant and cross-model review family-routing are clean, tabular.
- Note (not a defect): § Capability-routed UI escalation is explicitly marked **RETIRED** with the
  correct reasoning (Codex/Opus are sighted) — this is a good model of how to retire stale content
  in place rather than deleting it silently; C2's apex-ui-testing/impl.md (below) needed the same
  treatment and didn't get it.

### apex-skill-author/SKILL.md
- `[DEEPSEEK-RESIDUE]` § "Authoring workflow" step 3 / § "Before you author" step 3 — **"Execution
  gate — ASK THE USER who writes the files: ... DeepSeek — write a `docs/changes/` spec; coding mode
  executes... Do not default to DeepSeek."** This is stale: coding mode is Codex-primary/Opus-fallback
  under ADR-027, not DeepSeek. This is an internal inconsistency — later in the *same file* (§ "Author
  to the executor's capability floor") the wording is correctly updated: *"impl.md → the coder (Codex
  `gpt-5.6-terra`; Opus on fallback — ADR-027)."* The execution-gate section was missed in that pass.
  Fix: replace "DeepSeek" with "coding mode (Codex/Opus)" in the execution-gate bullet.
- `[DEEPSEEK-RESIDUE]` Frontmatter contract (§ "Frontmatter contract") still enumerates
  `backend: claude | deepseek` as the only two values. Every `impl.md` file reviewed in this pass
  (apex-coding-principles, apex-testing, apex-ui-testing, apex-docs-product) carries
  `backend: deepseek` — this reads as "runs on the DeepSeek model," which is no longer true anywhere
  in the active architecture (Codex subprocess, Opus-fallback-inline, or a Claude subagent, depending
  on the file). This looks like a **naming-convention residue**, not necessarily a functional bug: the
  two-value enum was likely always shorthand for "planning-side (`claude`) vs coding-side (`deepseek`)"
  rather than a literal model binding — but the literal string is actively misleading post-ADR-027 and
  should be renamed (e.g. `backend: planning | coding`) so the field stops implying a specific,
  archived model. This is a cheap, high-value, repo-wide cleanup owned by this skill's frontmatter
  contract — recommend a dedicated sweep once approved (likely touches most of the ~15+ `impl.md`
  files across the whole skill set, not just the 4 in this cluster).
- `[OK]` Iron Law, skill-type/baseline-test table, triple-write, SKILL-vs-impl split, the two-tier
  impl.md loading-core convention, and length discipline are all well-proceduralized and current.
- `[FABLE-DEP]` § "Author to the executor's capability floor" already explicitly names this exact
  concern for Opus ("Opus interprets instructions literally and won't generalize a rule across items
  on its own — write 'apply to every skill', not 'apply this'") — good self-awareness already baked
  in; no further action needed, just confirming it's the right instinct and should be the template for
  hardening other judgment-heavy prose in this cluster (e.g. the Fork-classification and
  research-gate items flagged above).

### apex-init/SKILL.md
- `[OK]` Fully procedural (numbered steps, verbatim templates for every seeded file). Low risk for
  any executing model. AGENTS.md seeding is correctly described as "Codex-facing projection" — but
  see the headline finding above: the Conventions section it seeds as a stub never gets filled with
  the coding-principles/stack content that would actually close the coder-facing gap.
- `[OK]` Correctly gates data-model/app-flow/design-brief stub seeding to project shape (data-bearing /
  UI-bearing / headless) — no residue.

### apex-handoff/SKILL.md
- `[DEEPSEEK-RESIDUE]` § "Reading a handoff" — *"Do not author the ADR in coding mode (DeepSeek) — the
  rationale is judgment-heavy and is planning's job."* The parenthetical labels coding mode as
  DeepSeek; should read "(Codex/Opus)" or simply drop the parenthetical since "coding mode" alone is
  now unambiguous post-ADR-027.
- `[OK]` The four-section handoff contract, In-Flight state enum, and one-home-per-fact table are
  clean and already the canonical source other files correctly defer to.

### apex-refresh/SKILL.md
- `[OK]` No residue found; stocktake/audit/refresh workflows are current and don't reference DeepSeek
  or make coder-capability assumptions. Good candidate to eventually run a `--stocktake` pass that
  would have caught the two DeepSeek-residue items above mechanically (its own quality checklist
  doesn't explicitly check for stale backend/model references, though — see recommendation below).
- `[FABLE-DEP]` (minor) Recommend adding "no stale coder/model name references (DeepSeek, superseded
  Codex model ids)" as an explicit stocktake checklist item — currently the quality checklist checks
  frontmatter completeness/length/triple-write/content-quality but not model-reference currency, which
  is exactly the class of bug found twice above.

### C:\Users\User\.claude\CLAUDE.md (global) + project CLAUDE.md
- `[OK]` Global CLAUDE.md's mode-routing table and coding-session workflow are consistent with
  ADR-027 (Codex primary / Opus fallback / DeepSeek archived, stated explicitly and correctly in
  multiple places). No residue found.
- `[OK]` Project CLAUDE.md's backend-routing table matches BACKEND-ROUTING.md's framing and is
  current.

### registry/domains.md
- `[OK]` Correctly scoped (domain specialists only, workflow/spine skills excluded by design) and
  consistent with ADR-007's per-domain-agent retirement (generic `apex-spec-reviewer` for every row).
- Note (out of my cluster, flagging for the record only): the Agent column still names
  `apex-security-agent` ("DeepSeek mode: applies secure coding patterns...") and `apex-figma-agent`
  ("DeepSeek only") in their own agent descriptions — those two dedicated coding-side agents may carry
  the same DeepSeek-residue pattern found in this cluster's impl.md files, but `apex-security`/
  `apex-figma` are outside C1/C2 scope for this pass.

---

## C2 — Meta/quality

### apex-coding-principles (SKILL.md + impl.md)
- `[MOVE-TO-CODER]` impl.md's entire NEVER/ALWAYS body is textbook coder-facing content (naming,
  error handling, security, scalability) — see the headline finding. It is not planning judgment; it
  exists purely to be enforced on the code-writer, and today it doesn't demonstrably reach Codex.
- `[DEEPSEEK-RESIDUE]` Frontmatter `backend: deepseek` (naming residue — see apex-skill-author entry
  above).
- `[OK]` Content itself (NEVER/ALWAYS lists, pre/post-coding checklists, source-grounding protocol) is
  generic best-practice, not weak-coder scaffolding — no DeepSeek-Flash-era over-resolution found here
  (no lockstep checkpointing, no "the coder can't do X" hedging). This file aged well independent of
  the propagation-channel problem.
- `[OK]` SKILL.md (planning side) correctly tells planning not to repeat these principles inline.

### apex-testing (SKILL.md + impl.md)
- `[DEEPSEEK-RESIDUE]` impl.md frontmatter `backend: deepseek` (naming residue, same pattern).
- `[MOVE-TO-CODER]` impl.md's NEVER/ALWAYS test-authoring rules are coder-facing content with the same
  propagation gap as apex-coding-principles — whichever fix is chosen for that headline finding should
  cover this file too (it's meant to shape how the code-writer writes tests, not how the host plans).
- `[OK]` Content is properly stack-neutral via the `## Stack assumptions` section (Vitest/Playwright
  called out explicitly as JS-ecosystem illustrations) — good hygiene, no residue in substance.
- `[OK]` SKILL.md's RED-GREEN-REFACTOR, test pyramid, DAMP-over-DRY, and regression-test-from-apex-debug
  sections are fully proceduralized — low risk for any executing model.

### apex-ui-testing (SKILL.md + impl.md)
- `[DEEPSEEK-RESIDUE]` **— highest-priority finding in C2, actively wrong, not just stale wording.**
  impl.md repeatedly instructs the coder to treat itself as image-blind and defer *all* visual
  judgment to "planning-mode (Claude)": *"Pull a screenshot into context to 'check' a UI... the
  DeepSeek backend has no image support, so it is a wasted turn"*; *"design fidelity → flag to
  planning-mode (Claude), the only backend that can see pixels"*; *"the coder can't see"* (multiple
  places); Verification checklist's flag-list: *"Visual judgment needed... DeepSeek cannot see pixels."*
  This directly contradicts `apex-governance`'s own § Capability-routed UI escalation, which is
  explicitly marked **RETIRED (2026-06-23)** with the reasoning: *"the coder is Codex (`gpt-5.6-terra`,
  native vision) or Opus (multimodal) on fallback — it sees the render... No special exception is
  needed."* `apex-plan/references/model-routing.md` independently confirms: *"gpt-5.6-terra is
  sighted, so the old image gate is moot."*
  **Impact if unfixed:** a Sonnet host following this impl.md verbatim would suppress Codex's actual
  vision capability (forbidding `browser_take_screenshot`, routing every visual call to a planning-mode
  escalation that ADR-027/ADR-020-retirement already eliminated), silently re-imposing the exact
  constraint the architecture moved past. This is not a cosmetic label — it changes runtime behaviour
  (which tool the coder is told to use, and whether a visual-fidelity question gets escalated at all).
  **Fix:** rewrite the NEVER/ALWAYS + Verification-checklist + "Flag for planning-mode review" sections
  to reflect that the bound coder (Codex/Opus) is sighted — screenshots are now a legitimate tool for
  the coder itself; the text-proxy (token-compliance / forbidden-pattern) checks remain valuable as
  a *deterministic, cheap-to-run* layer, not as a workaround for blindness. Model on how
  apex-governance retired its own equivalent section in place (marked RETIRED with dated reasoning,
  not silently deleted).
- `[DEEPSEEK-RESIDUE]` Frontmatter `backend: deepseek` (naming residue, same pattern as above).
- `[OK]` SKILL.md (planning side) does not carry the image-blindness assumption — it's confined to
  impl.md, so the planning-time guidance is unaffected.
- `[OK]` Deterministic design-lint (`impeccable`) and token/forbidden-pattern checks are good,
  durable content independent of coder vision capability — keep these regardless of the fix above.

### apex-debug/SKILL.md
- `[OK]` No coder-model assumptions, no DeepSeek references. The 6-stage workflow (Reproduce → Isolate
  → Root Cause → Fix → Verify → Prevent) is fully proceduralized with explicit "do NOT skip" gates —
  a Sonnet host should execute this correctly end-to-end. Good template for how a discipline skill
  should read.
- `[OK]` Widen-the-options research gate here correctly defers to apex-plan's fuller form rather than
  duplicating the fuzzy trigger — no independent Fable-dependence issue introduced.

### apex-research/SKILL.md (+ references/external-repo-study-template.md)
- `[OK]` Three-phase model contract (Plan=Opus/Fable, Retrieve=Sonnet/Haiku, Synthesise=Opus/Fable)
  already anticipates a multi-tier model setup and explicitly sets model on dispatch
  (`Agent(model: "sonnet"...)`) — this is the one file in the cluster already built for exactly the
  kind of model-diversity architecture the proposed GPT-5.6 split is moving toward. No residue.
- `[OK]` Web-access-under-dispatch section (pre-authorise domains in Phase 1, discovery-first for
  unknowns, `NEEDS-DOMAIN` flag instead of silent drop) is a well-hardened procedure with no judgment
  gaps — good precedent for how to handle a background-agent permission wall elsewhere.
- Not directly a Sonnet-build-host concern (invoked from planning), included for completeness.

### apex-deep-dive/SKILL.md
- `[OK]` Structured-analysis template and Council mode (three fresh-context voices, explicit
  stake-free/independent framing) are fully specified; the evaluator-independence invariant is
  correctly cross-referenced to apex-governance rather than restated with drift risk.
- `[FABLE-DEP]` (minor) Council mode's own trigger — "a genuine go/no-go decision where the proposal
  ... risks anchoring" — mirrors the same fuzzy-trigger pattern as apex-plan's research gate. Same
  hardening suggestion applies if this is ever tightened. Low priority since it's explicitly
  offer-only, never auto-run.

### apex-context-budget/SKILL.md
- `[OK]` The loading-tier table (what actually loads, vs. flat byte-counting) is the most valuable
  content in the file and is accurate for the general case.
- `[FABLE-DEP]`/follow-up (not a bug in this file): given the headline finding above, its statement
  that "`impl.md` body... loads... core sections only, per build run" should eventually note that for
  Codex-primary builds this load may not be earning its keep (Codex never sees it) — worth a line once
  the propagation gap is fixed, so a future context audit doesn't count it as "correctly-scoped
  overhead" when it may be dead weight for the common path.
- `[OK]` Scope discipline (audit APEX, don't prescribe pruning co-installed systems) is a good,
  precise boundary — no drift risk.

### apex-docs-product (SKILL.md + impl.md)
- `[OK]` — **not** part of the coder-propagation problem: `apex-docs-product/impl.md` is consumed by
  `apex-docs-product-agent`, a **Claude subagent** (Tools: Read/Glob/Grep/Edit/Write) dispatched by
  apex-code post-build — it is not read by Codex and never needs to be. This is a useful contrast case
  showing the headline finding is specific to content meant to shape *code-writing* (coding-principles,
  testing, ui-testing), not to every impl.md file uniformly.
- `[DEEPSEEK-RESIDUE]` Frontmatter `backend: deepseek` (naming residue only, per the apex-skill-author
  entry — no functional impact since this file is genuinely Claude-subagent-facing already).
- `[OK]` Divio four-type model, changelog inclusion/exclusion rules, and the JSDoc/OpenAPI patterns are
  current and well-scoped via § Stack assumptions.

### apex-docs-technical/SKILL.md
- `[OK]` Planning-only, no coder path involved at all — no residue, no Fable-dependence beyond the
  ordinary judgment of "is this decision non-obvious enough to warrant an ADR," which is inherent to
  the task and already about as proceduralized as it can be (a per-doc-type When/Where/Format table).
- `[OK]` Merge-on-archive (ADR-014) capability-index mechanic is correctly cross-referenced rather than
  duplicated.

---

## Cross-cluster recommendation priority (if only three edits are made)

1. **Close the Codex-propagation gap** (apex-code § Verification + AGENTS.md Conventions seeding) —
   highest architectural impact; currently a silent no-op for the default build path.
2. **Fix apex-ui-testing/impl.md's stale image-blindness claims** — actively wrong, not cosmetic;
   suppresses a real, already-shipped coder capability (Codex/Opus vision).
3. **Convert the Fork SMALL/BIG/GRAY classification into an ordered decision tree** in apex-code — the
   single highest-judgment, least-proceduralized decision point a Sonnet-class host will face on every
   build that deviates from spec.

Cheap opportunistic cleanup alongside any of the above: rename the `backend: claude | deepseek`
frontmatter enum (apex-skill-author's contract), fix apex-skill-author's own stale "DeepSeek" execution
-gate wording, and drop the "(DeepSeek)" parenthetical in apex-handoff.
