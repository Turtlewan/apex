## Cluster verdict

This cluster contains useful domain judgment, but most `impl.md` content is too absolute, repetitive, and tailored to DeepSeek/Claude tooling for direct use by GPT-5.6 Terra. Terra benefits most from task-specific boundaries, repository evidence, exact verification commands, and explicit environment capabilities—not universal coding reminders or long checklists. Research, deep-dive, documentation policy, and context-budget material belongs primarily with Opus/Sol/Sonnet; only compact testing, debugging, and UI-test invariants should reach Terra. Replace backend-specific escalation language with a machine-readable completion contract.

## Per-skill findings

### `apex-coding-principles`

- [CUT] Remove basic syntax, naming examples, early-return advice, “simple/clear code,” comment style, DRY/SRP, and duplicated pre/post checklists from Codex-facing material (`impl.md` §§ “NEVER do,” “ALWAYS do,” “Pre-coding checklist,” “Post-coding checklist,” “Naming reference”). Terra already applies these defaults; rigid rules such as banning every variable named `result` or every repeated fragment create needless churn.
- [RESHAPE] Convert universal architecture rules into conditional spec decisions (`impl.md` §§ “Scalability,” “Security,” “Error handling”). Pagination, indexes, retries, five-second timeouts, bcrypt, async UI states, and prohibition of process-local state are not correct for every repository or task. State them only when the system’s threat model, scale, or acceptance criteria require them.
- [KEEP] Preserve the surgical-diff constraint, failed-edit re-read rule, authenticated identity sourcing, secret handling, and version inspection (`impl.md` §§ “Surgical scope,” “ALWAYS do,” “Security,” “Source-grounding protocol”). Change “only listed files” into `intended_files` plus an explicit rule for directly necessary adjacent files; otherwise Terra may either stop unnecessarily or silently violate the contract.
- [CLAUDE-IDIOM] Remove DeepSeek references, `context7` mandates, “flag to planning,” and coder-side commit/stash instructions (`SKILL.md` § “Planning-mode notes”; `impl.md` §§ “Source-grounding protocol,” “ALWAYS do”). Sonnet owns worktree recovery and escalation; dispatch must state whether documentation/network access and commits are available.

### `apex-testing`

- [CUT] Drop mandatory TDD chronology, fixed 80/15/5 proportions, “one assertion,” and generic per-function case quotas (`SKILL.md` §§ “RED-GREEN-REFACTOR,” “Test pyramid”; `impl.md` § “ALWAYS do”). They are not reliably observable in a single subprocess and can produce artificial tests.
- [KEEP] Retain public-behavior testing, boundary-only mocking, readable setup, discriminating assertions, and pre-fix/post-fix regression proof (`SKILL.md` §§ “DAMP over DRY,” “Regression tests,” “Review checklist”; `impl.md` § “NEVER do”). These materially improve Terra’s test selection.
- [MISSING] Every dispatch must supply exact targeted and broader verification commands, required services/fixtures, coverage policy, and what to do when infrastructure is unavailable. Referring to a bound stack recipe that Terra cannot see (`SKILL.md` § “When to activate”; `impl.md` §§ “Stack assumptions,” “Verification checklist”) makes the current artifact incomplete.

### `apex-ui-testing`

- [RESHAPE] Make Storybook, axe, Chromatic, and E2E requirements opt-in based on existing repository tooling and plan acceptance criteria (`SKILL.md` §§ “Testing layers for UI,” “Storybook workflow,” “Review checklist”; `impl.md` §§ “ALWAYS do,” “Verification checklist”). Requiring all four for every component/page over-tests small changes and may add dependencies without authorization.
- [CLAUDE-IDIOM] Delete DeepSeek’s “cannot see pixels,” `browser_snapshot`, MCP token-cost, and planning-mode visual handoff rules (`impl.md` §§ “NEVER do,” “ALWAYS do,” “Flag for planning-mode review”). Dispatch should instead declare Terra’s actual browser/image capabilities; screenshots are valuable when the CLI exposes them.
- [KEEP] Keep role/label locators, web-first waits, relative/configured URLs, and the ban on arbitrary sleep (`impl.md` §§ “NEVER do,” “ALWAYS do”). Reshape computed-CSS checks (`§ “Design-brief compliance checks”`) to assert only stable, acceptance-critical design tokens—not implementation details for every primary component.
- [MISSING] Provide server startup/teardown, base URL, browser project, auth/seed fixture, allowed network access, baseline ownership, and artifact paths. Chromatic approval and secret-backed runs belong to Sonnet or a human, not an isolated Terra task.

### `apex-debug`

- [KEEP] Give Terra a compact bug protocol: capture the failure, form one falsifiable hypothesis, make the smallest causal fix, rerun the reproduction, and add a discriminating regression test (`SKILL.md` §§ “Stage 1,” “Stage 3,” “Stage 4,” “Stage 5”).
- [RESHAPE] Replace “root cause must be confirmed before any fix,” the three-attempt cutoff, and automatic full-suite failure attribution (`§§ “Standard workflow,” “Rules that cannot be broken”). Compile failures, nondeterministic incidents, and unrelated baseline failures require evidence-weighted judgment, not a hard state machine.
- [CLAUDE-IDIOM] Online-research permission questions, skill routing, Sentry/GitHub integration, commit-message ownership, and “flag to planning” (`§§ “Widen the options,” “Prevent & record,” “Sentry integration”) belong to Sonnet. Terra needs the reproduction command, relevant logs, known baseline failures, environment, and a structured `blocked_reason` output instead.

### `apex-research`

- [CUT] Do not expose this skill to Terra. The fixed Opus/Fable–Sonnet/Haiku phase contract and Claude permission mechanics (`SKILL.md` §§ “Three-phase model contract,” “Web access under dispatch,” “Spawning parallel research agents”) are orchestration policy, not coding guidance, and contradict the stated no-Fable future.
- [RESHAPE] For Opus/Sol, replace the tier numbering with `primary/official`, `independent secondary`, and `community`; cite claims that affect the decision rather than tagging every sentence (`§§ “Research strategy,” “Confidence tagging”). The current taxonomy labels primary sources as Tier 3 while also requiring Tier 1 first.
- [KEEP] Preserve decision-first scoping, freshness/version capture, source-grounded claims, gaps, and durable placement when research will be reused (`§§ “Questions to ask,” “Where research output goes,” “Staleness”).
- [MISSING] Sol’s plan check needs a narrower research contract: claims to verify, repository/library versions, accepted source domains, date checked, and whether contrary evidence blocks the plan or merely lowers confidence.

### `apex-deep-dive`

- [KEEP] Use the project-specific alternatives, explicit trade-offs, implementation implications, risks, and strongest opposing case as Sol’s plan-review rubric (`SKILL.md` §§ “Read project context,” “Produce structured analysis”).
- [CUT] Remove periodic findings writes, forced 2–3 alternatives, tool prescriptions, slash-command ceremony, and automatic offer to begin planning (`§§ “Persist findings,” “Research tools available,” “Offer next step”). These are workflow preferences, not reasoning requirements.
- [RESHAPE] Replace Claude’s four-agent Council (`§ “Council mode”`) with the existing cross-family gate: Sol independently returns `BLOCKERS`, `UNSUPPORTED_ASSUMPTIONS`, `MISSED_ALTERNATIVES`, `VERIFICATION_GAPS`, and `VERDICT`. Optional clean-room reviewers should be reserved for genuinely irreversible decisions.

### `apex-context-budget`

- [CUT] Keep this entirely out of task dispatches. Its Claude paths, system-reminder accounting, Agent schemas, MCP estimates, `/compact`, and assumed 200k contexts (`SKILL.md` §§ “Loading-tier,” “Heuristics,” “Two levers”) do not describe Codex CLI behavior.
- [RESHAPE] Create a separate APEX-maintainer audit that measures actual `codex exec` prompt bytes, `AGENTS.md` inheritance, matched `.agents/skills` descriptions/bodies, tool schemas, and returned output size. Use observed CLI/model limits rather than fixed token heuristics.
- [KEEP] Retain only the conceptual distinction between always-injected, conditionally loaded, and latent content, plus ranked savings (`§§ “Classify,” “Report”). That principle directly supports a lean Terra dispatch pack.

### `apex-docs-product`

- [RESHAPE] Keep doc-type and audience selection with Opus, but remove the absolute prohibition on mixed document types (`SKILL.md` §§ “Four doc types,” “README design”). The proposed README itself legitimately combines tutorial and reference material.
- [CUT] Remove generic tone reminders and blanket requirements for README changes, changelog entries, and examples for every endpoint (`SKILL.md` §§ “Documentation review checklist,” “Hard blocks”; `impl.md` § “ALWAYS do”). Terra writes better docs when the requested audience, delta, and source of truth are explicit.
- [KEEP] Preserve factual user-visible change descriptions, no publishable placeholders, and executable examples when examples are part of acceptance (`impl.md` §§ “NEVER do,” “Verification checklist”).
- [RESHAPE] Delete the instruction to install `eslint-plugin-jsdoc` automatically and the blanket exported-function documentation gate (`impl.md` § “Verification checklist”). Dependency mutation requires explicit spec authorization; use the repository’s existing doc linter/link checker.

### `apex-docs-technical`

- [KEEP] Retain the document-selection rules, target paths, and concise ADR/runbook/setup templates for Opus (`SKILL.md` §§ “Documentation types,” “ADR format”).
- [RESHAPE] Make ADR, overview, and architecture updates explicit spec outputs rather than automatic consequences of every “non-obvious” choice or component change (`§ “Review checklist”). Terra should never infer documentation expansion from a code task.
- [CLAUDE-IDIOM] “Planning Mode (Claude only)” is directionally correct, but merge-on-archive capability maintenance (`§ “System Overview”) belongs to Sonnet’s integration/archive phase.
- [MISSING] A docs dispatch needs exact facts to reflect, target file, audience, commands/link checks, generated-doc policy, and prohibited duplication. No coder-side `impl.md` is necessary if those appear in the task.

## Codex-native recommendations

Use a small `.agents/skills` tree:

- `apex-debug/SKILL.md`: evidence → hypothesis → minimal causal fix → regression proof.
- `apex-testing/SKILL.md`: observable behavior, discriminating checks, boundary mocking, baseline-failure handling.
- `apex-ui-testing/SKILL.md`: stable locators/waits plus capability-gated accessibility and visual verification.
- Optionally one merged `apex-doc-writing/SKILL.md`, triggered only by explicit documentation tasks.

Do not port the large coding-principles core. Put a 150–300-token contract directly in each Terra dispatch containing: objective, acceptance criterion, intended and permitted files, repository conventions to read, exact verification commands, required services, available tools/network, baseline failures, dependency-change authority, and required completion output (`changed_files`, `commands_run`, `results`, `unresolved`, `scope_expansions`).

Role placement should be:

- Opus spec: architectural/domain decisions, test layers, documentation obligations, security/scalability requirements.
- Sol plan check: repository-grounded feasibility, missing files/dependencies, competing approaches, discriminating acceptance criteria, exact verification, rollback and integration risks.
- Sonnet orchestration: prompt assembly, capability declaration, worktrees, secrets/services, external approvals, commits, integration verification, archive/overview updates.
- Terra coding: the task contract plus only the matching compact native skill.