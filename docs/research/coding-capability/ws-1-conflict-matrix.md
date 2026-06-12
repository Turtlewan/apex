# WS-1 — Coding Skill Conflict & Overlap Matrix

**Date:** 2026-06-12
**Confidence:** HIGH for conflicts cited from direct reads; MEDIUM for trigger-collision estimates (inferred from description fields, not live harness observation); ASSUMED for built-in slash skills (not found as SKILL.md files — harness-level commands only).
**Re-research after:** 2026-06-26
**Method:** Direct reads of all named SKILL.md and impl.md files; conflict classification against the APEX coding cluster baseline.

---

## 1. APEX Coding Cluster — Baseline (these win by design)

| Skill | Role | Backend | Key rules that get contested |
|---|---|---|---|
| `apex-code` | Session orchestrator, execution loop, fork routing | DeepSeek | AFK-vs-Edit modes; Karpathy Pre-Flight; wave dispatch; scope lock; hard blocks; spec-driven permissions |
| `apex-coding-principles/impl.md` | Universal coding rules, auto-loaded at pre-flight | DeepSeek | NEVER build unasked-for features (YAGNI); surgical scope (only files in spec); one-hypothesis debug; commit discipline |
| `apex-testing/impl.md` | Test authoring discipline | DeepSeek | Test behaviour not implementation; AAA structure; TDD within spec scope; DAMP not DRY for tests |
| `apex-testing/SKILL.md` | TDD strategy, Playwright MCP, axe-core | Claude | RED-GREEN-REFACTOR mandatory; regression test per bug fix; DAMP over DRY |
| `apex-debug/SKILL.md` | Bug investigation workflow | Claude | 6-stage (Reproduce→Root Cause→Fix→Verify→Record); one-hypothesis-at-a-time; no fix before Stage 3 confirms root cause |
| `apex-governance/SKILL.md` | Autonomy levels, hard blocks, approval gates | Claude | L0–L5 definitions; critical-file gates; permanently-forbidden hard blocks; scope-limiting modes |
| `apex-security/impl.md` | Security invariants, OWASP alignment | DeepSeek | NEVER trust client IDs; parameterised queries; argon2id/bcrypt; pin+audit deps; flag-to-planning for new auth flows |
| `apex-plan/SKILL.md` | Spec contract and format | Claude | Spec = execution script; no why inline; cross-cutting conventions stay in impl.md; exact file paths; tasks name exact files |

**The cluster's key meta-rules relevant to conflict:**
- `apex-code` says "Questions belong in planning — execution is silent."
- `apex-code` Karpathy Pre-Flight step c (surgical scope lock): "File NOT in spec AND you need to touch it → log to blocked actions, do NOT touch it."
- `apex-governance` hard blocks are permanent "regardless of autonomy level."
- `apex-governance` owns the canonical definitions; any summary in apex-code defers to governance on conflict.

---

## 2. Full Conflict / Overlap Matrix

### 2.1 `controlled-yolo`

**Classification: CONFLICT — Severity: HIGH**

The skill activates on "yolo mode for this session" and replaces the session contract with its own autonomous loop.

| Dimension | APEX coding cluster says | `controlled-yolo` says | Conflict |
|---|---|---|---|
| Session loop | apex-code owns the session: reads status.md, lists docs/changes/, executes via AFK or Edit mode | "Pick up all pending specs. Implement all specs autonomously." (its own session flow) | Competing session controllers. If both fire, DeepSeek gets two different session flows. |
| Autonomy gate | apex-governance L2 (default): write non-critical files freely; critical files need confirmation. GRAY forks pause for user at L2. | "Make every decision yourself. Never stop to ask unless something opens the project to the internet." | `controlled-yolo` eliminates the L2 GRAY-fork ask, which apex-governance defines as a non-negotiable gate. GRAY forks that apex-code routes to the user would be silently resolved by yolo mode. |
| Deferred trigger list | apex-code BIG fork rule: stop if a needed file is not in the spec, if architecture changes, if schema/API changes. Route to planning. | yolo defers only internet-exposure decisions; all other decisions are made autonomously including "database schema details not explicitly constrained." | yolo would autonomously make schema decisions that apex-code classifies as BIG forks requiring planning sign-off. Direct contradiction. |
| Handoff | apex-code writes a handoff with Decisions Made. | yolo writes an Autonomous Decisions section. | Different formats, minor. |
| Docs deferred file | apex-code: blocked actions logged in docs/progress/{spec-name}.md | yolo: deferred items logged in docs/deferred.md | Different artifact paths for the same concept — risk of silent splits. |

**Quote citations:**
- APEX: "Coding runs silently — no questions, no gates, no approvals during execution." (apex-governance Build Mode) — **but** this assumes pre-authorised spec permissions. GRAY forks still surface at L2.
- APEX: "If assumption is wrong AND impact is Stop → halt, log to decisions table, report to user: 'Pre-flight failed'" (apex-code Karpathy step a)
- yolo: "Make every decision yourself. Never stop to ask unless something opens the project to the internet or an external service."
- yolo: "Database schema details not explicitly constrained" → decide autonomously.
- APEX: Any schema change = BIG fork: "changes a schema, public API, or data contract → capture-at-halt. Do NOT implement the fix. The spec is blocked."

**Risk to DeepSeek:** High. A weak literal executor seeing both would likely merge them into "decide everything yourself, log deferred only if internet-facing" — silently making BIG forks without routing them to planning.

**Mitigation:** `controlled-yolo` is explicit-activation only ("yolo mode"), so it should not auto-fire during normal APEX AFK builds. But there is no harness-level gate preventing it from activating alongside apex-code during a session. If the user says anything like "just go" or "auto mode," the routing risk is real.

---

### 2.2 `superpowers:test-driven-development`

**Classification: CONFLICT — Severity: HIGH**

| Dimension | APEX testing cluster says | `superpowers:test-driven-development` says | Conflict |
|---|---|---|---|
| TDD scope | apex-testing SKILL.md: "TDD is the default — not optional." But apex-code pre-flight reads the **spec** — task granularity is fixed at spec time by planning. Test tasks are explicitly authored as part of spec tasks. | SP-TDD: "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST. Write code before the test? Delete it. Start over." Applies to "every new feature or bugfix, before writing implementation code." | APEX's spec-driven model can have a task "Write the authentication service" without an explicit "write failing test first" step — the test step is supposed to be authored in the spec. SP-TDD's Iron Law demands a failing test before ANY production code, which would block a code-writing task that doesn't start with a test-writing subtask. |
| Delete code written before tests | apex-testing: "Never write implementation before a failing test exists." (SKILL.md) — matches. apex-code: task granularity fixed at spec time; the spec tells you what to do. | SP-TDD: "Write code before the test? Delete it. Start over. No exceptions." | If a spec task says "implement X" without explicitly saying "write test first," SP-TDD's Iron Law says delete any code written. The spec as execution script model and the Iron Law are in direct tension — DeepSeek might delete work it just wrote because it notices there was no test-first step. |
| Post-implementation tests | apex-testing impl.md ALWAYS: "Write the test before the implementation (or immediately after the task, not at the end)" — allows post-implementation within the task. | SP-TDD: "Tests added 'later' → All of these mean: Delete code. Start over." | apex-testing explicitly allows writing the test immediately after the implementation if needed; SP-TDD forbids it unconditionally. Direct contradiction. |
| No exceptions | SP-TDD: "Exceptions (ask your human partner): Throwaway prototypes, Generated code, Configuration files." | APEX: spec-authored tasks for config changes may not include test subtasks — spec is the authority. | SP-TDD's exceptions require asking the human, which apex-code in AFK build mode forbids ("Questions belong in planning — execution is silent"). |
| Verification run | Both agree: run tests and watch them fail/pass. No conflict on the mechanics. | — | Compatible |

**Quote citations:**
- APEX: "Write the test before the implementation (or immediately after the task, not at the end)" (apex-testing impl.md ALWAYS)
- SP-TDD: "Tests added 'later' → All of these mean: Delete code. Start over." (Red Flags section)
- SP-TDD: "Violating the letter of the rules is violating the spirit of the rules."
- APEX: "Questions belong in planning — execution is silent." (apex-code)
- SP-TDD: "Exceptions (ask your human partner): Throwaway prototypes, Generated code, Configuration files."

**Risk to DeepSeek:** High. The Iron Law is written to resist all rationalisation. A literal DeepSeek could interpret the Iron Law as overriding the APEX spec task structure and halt any task that didn't explicitly start with a failing test — or could delete work between tasks. The "ask your human partner" exception path is blocked by APEX's AFK silence rule.

---

### 2.3 `superpowers:systematic-debugging`

**Classification: CONFLICT — Severity: MEDIUM**

Both skills agree on the scientific method. The conflicts are structural.

| Dimension | `apex-debug` says | `superpowers:systematic-debugging` says | Conflict |
|---|---|---|---|
| Stage sequence | 6 stages: Reproduce → Isolate → Root Cause → Fix → Verify → Prevent & Record | 4 phases: Root Cause Investigation → Pattern Analysis → Hypothesis & Testing → Implementation | Both correct on scientific method. Different named stages. Minor framing conflict — not a behavioural contradiction. |
| After 3+ failed fixes | apex-debug: after failing repeatedly, treat as a fork — route to planning if BIG fork | SP-debug Phase 4.5: "If ≥ 3: STOP and question the architecture. Discuss with your human partner before attempting more fixes." | Both agree: stop and escalate. APEX routes to planning (written artifact). SP-debug routes to human partner. In AFK mode, apex-code's fork routing (capture-at-halt) handles this; the "human partner" path is blocked by AFK silence — but the outcome (stop, capture) is compatible. |
| Fix scope | apex-debug: "Touch the minimum number of files to fix the root cause. No refactoring adjacent code." Directly mirrors apex-coding-principles surgical scope. | SP-debug Phase 4 Step 2: "Implement Single Fix — No 'while I'm here' improvements. No bundled refactoring." | **Compatible.** Both agree on surgical fixes. |
| Regression test required | apex-debug: "Always write a regression test (Stage 6 is not optional)" | SP-debug Phase 4 Step 1: "Create Failing Test Case — MUST have before fixing." References superpowers:test-driven-development for this step. | **Compatible** on regression test. But SP-debug's cross-reference to SP-TDD introduces that skill's Iron Law (test before ANY implementation) into the debug flow, compounding the SP-TDD conflict above. |
| Commit / record | apex-debug: root cause → commit body, regression test, code comment at fix site. Specific artifact homes. | SP-debug: no specific commit discipline — focuses on the investigation process. | **Gap**, not a conflict. APEX is more prescriptive on the durable record. |
| Session stop trigger | apex-debug: If not reproducible in 3 attempts: stop, use --forensic. | SP-debug: "95% of 'no root cause' cases are incomplete investigation." Encourages continuing investigation. | **Minor tension**: APEX gates on 3 attempts and pivots; SP-debug encourages deeper investigation before stopping. DeepSeek receiving both might either stop too early (APEX gate) or loop indefinitely (SP-debug "keep investigating"). |

**Risk to DeepSeek:** Medium. The structural differences are resolvable by a strong reasoner. The main risk is the cross-reference to SP-TDD Iron Law, which a literal executor could follow into the debug flow — adding "must see test fail before any fix code" as a hard gate in debugging contexts.

---

### 2.4 `superpowers:executing-plans`

**Classification: CONFLICT — Severity: HIGH**

| Dimension | `apex-code` says | `superpowers:executing-plans` says | Conflict |
|---|---|---|---|
| Session loop controller | apex-code owns the session: reads status.md → lists docs/changes/ → AFK/Edit dispatch → Karpathy Pre-Flight → Wave Analysis | SP-executing-plans: "Load plan → Review critically → Execute tasks → finishing-a-development-branch" — its own end-to-end loop | Two competing session controllers. Both claim to orchestrate the coding session. |
| Plan source | docs/changes/*.md (APEX spec format with Permissions, Tasks, Wave plan, Assumptions, Acceptance Criteria) | Any plan file (SP-writing-plans format: docs/superpowers/plans/YYYY-MM-DD-*.md) | Different spec formats. Incompatible source paths and structures. |
| Blocker handling | BIG fork: capture-at-halt, mark blocked, route to planning | "STOP executing immediately when: Hit a blocker... Ask for clarification rather than guessing." | APEX routes blocked specs to planning without asking; SP routes to "your human partner" — in AFK mode these diverge. |
| Branch discipline | apex-governance hard blocks: "Never start implementation on main/master branch without explicit user consent" — must be in spec permissions | SP-executing-plans: "Never start implementation on main/master branch without explicit user consent" | **Compatible.** Both agree on main-branch protection. |
| Finish step | apex-code post-build: apex-docs-product-agent + apex-reviewer + apex-docs-technical-agent (writes handoff, archives spec) | SP-executing-plans: REQUIRED use of superpowers:finishing-a-development-branch (verify tests, present merge/PR/keep/discard options) | SP-finishing-a-development-branch presents 4 user-facing options — this requires interactive user input, which apex-code's AFK mode forbids. **Direct conflict.** |
| Verification | APEX: run the stack's Verification Recipe (from bound stack skill impl.md) — no npm/test commands hardcoded | SP: "Run verifications as specified" in the plan — plan-authored commands | Compatible if plan is from APEX; incompatible if SP-writing-plans format is used (different section names). |

**Quote citations:**
- APEX: "Coding runs silently — no questions, no gates, no approvals during execution." (apex-governance Build Mode)
- SP-executing-plans: "STOP executing immediately when: Hit a blocker... Ask for clarification rather than guessing."
- SP-finishing-a-development-branch: "Present Options: 1. Merge back to <base-branch> locally / 2. Push and create a Pull Request / 3. Keep the branch as-is / 4. Discard this work. Which option?" (requires interactive user response)
- APEX: post-build steps are automated agent dispatches (apex-docs-product-agent, apex-reviewer, apex-docs-technical-agent).

**Risk to DeepSeek:** High. If both fire in a session: DeepSeek has two competing session loops, two plan-source paths, and two finishing protocols — one interactive (SP), one automated (APEX). A literal executor would likely merge them inconsistently, probably following the last-loaded one.

---

### 2.5 `superpowers:subagent-driven-development`

**Classification: CONFLICT — Severity: HIGH**

| Dimension | `apex-code` Wave Analysis says | `superpowers:subagent-driven-development` says | Conflict |
|---|---|---|---|
| Worker dispatch model | Wave Analysis: group independent tasks into waves → spawn one `code-worker` agent per task in a wave; worker returns DONE/DONE_WITH_CONCERNS/BLOCKED/NEEDS_CONTEXT | SP-SDD: "Fresh subagent per task" but "Dispatch multiple implementation subagents in parallel (conflicts)" — explicitly bans parallel dispatch | **Direct contradiction.** APEX dispatches workers in parallel within a wave; SP-SDD explicitly forbids parallel dispatch. |
| Two-stage review per task | apex-code wave domain review: triggered only for high-risk domains (auth/security/data) after each wave, using `apex-wave-reviewer` | SP-SDD: "Two-stage review after each task: spec compliance first, then code quality" — mandatory for every task regardless of domain | APEX's wave review is selective (domain-triggered, not every task). SP-SDD mandates two-stage review on every single task. Stacking both means every low-risk task gets two unnecessary review passes. |
| Spec format | apex-code reads APEX spec format | SP-SDD reads SP-writing-plans format (docs/superpowers/plans/) | Incompatible plan sources. |
| Finish step | apex-code: automated post-build agents | SP-SDD: REQUIRED superpowers:finishing-a-development-branch | Same conflict as SP-executing-plans above. |
| Worker status handling | apex-code: DONE/DONE_WITH_CONCERNS → decisions table; BLOCKED/NEEDS_CONTEXT → Forks | SP-SDD: DONE/DONE_WITH_CONCERNS/NEEDS_CONTEXT/BLOCKED with specific resolution protocols | Structurally compatible (same status taxonomy), but SP-SDD routes BLOCKED through "break into smaller pieces" / "escalate to the human" rather than apex-code's BIG fork protocol. |

**Quote citations:**
- APEX: "Wave with 2+ independent tasks → spawn one code-worker agent per task; dispatch all in parallel" (apex-code Wave Analysis dispatch rule)
- SP-SDD: "Never: Dispatch multiple implementation subagents in parallel (conflicts)" (Red Flags)

**Risk to DeepSeek:** High. The parallel-vs-sequential dispatch contradiction alone is a hard behavioural conflict. A literal executor following both would have contradictory dispatch rules for exactly the situation both skills address.

---

### 2.6 `superpowers:writing-plans`

**Classification: CONFLICT — Severity: MEDIUM (planning mode, but fires in coding context)**

| Dimension | `apex-plan` says | `superpowers:writing-plans` says | Conflict |
|---|---|---|---|
| Spec output path | docs/changes/{short-name}.md (or docs/drafts/ first) | docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md | Different artifact paths. A coder reading status.md finds specs in docs/changes/; SP plans live elsewhere. apex-code's session-start step explicitly scans docs/changes/ only. |
| Spec format | Identity + Files to Change + Exact changes + Acceptance criteria + Commands + Permissions + Assumptions + Wave plan | Architecture + Tech Stack + Task list with step-by-step substeps (write test → run → implement → run → commit per step) | Different formats. APEX spec is an execution script; SP plan is a verbose step-by-step guide. apex-code's Karpathy Pre-Flight reads APEX-format sections (## Permissions, ## Assumptions, ## Tasks, ## Files to Change). SP format has none of these headers. |
| Task granularity | APEX: "one concern layer — API layer, DB layer, UI layer, test layer. Do not re-decompose tasks during Wave Analysis." | SP: "Each step is one action (2-5 minutes): 'Write the failing test' — step; 'Run it' — step; 'Implement the minimal code' — step." Extremely fine-grained. | APEX task = concern layer (may be 30-120 min). SP task step = 2-5 min atomic actions. A DeepSeek trying to read an SP plan via apex-code's Wave Analysis would misfire — it groups tasks into waves based on file conflicts, not 2-min substeps. |
| No-placeholder rule | APEX: greppable [NEEDS CLARIFICATION:…] markers allowed, blocked by readiness gate | SP: "No Placeholders — these are plan failures: TBD, TODO" | Compatible on outcome; different enforcement mechanism. |

**Risk to DeepSeek:** Medium. This is a planning-mode skill, so it fires before DeepSeek. But if SP-writing-plans fires on the Claude planning side and produces a plan in SP format, apex-code on DeepSeek will fail to find the plan (wrong path) and fail to read APEX-format sections (wrong headers). Effectively a planning→coding handoff breakage.

---

### 2.7 `superpowers:finishing-a-development-branch`

**Classification: CONFLICT — Severity: HIGH**

This skill fires as a REQUIRED sub-skill at the end of SP-executing-plans and SP-SDD. It directly conflicts with apex-code's post-build protocol.

| Dimension | `apex-code` post-build says | `superpowers:finishing-a-development-branch` says | Conflict |
|---|---|---|---|
| Post-build sequence | Automated: spawn apex-docs-product-agent + apex-reviewer in parallel → then apex-docs-technical-agent (writes handoff, archives spec, updates overview.md) | "Present Options: 1. Merge locally / 2. Push and create a PR / 3. Keep as-is / 4. Discard." Waits for user interactive response before any git action. | APEX post-build is automated and non-interactive. SP-finishing stops the build and waits for user input. **Mutually exclusive approaches.** |
| Test verification before finish | Not explicitly a step (recipe passes per task, not a post-build gate) | "Before presenting options, verify tests pass: If tests fail — Cannot proceed with merge/PR until tests pass." Blocks finish until tests pass. | SP-finishing adds a blocking test gate at the session end that apex-code does not have as a post-build step (recipe runs per task, not as a post-build gate). Minor difference, but the blocking gate is a new control flow APEX doesn't route. |
| Branch cleanup | apex-code never deletes branches (branch -d / -D is a hard block in apex-governance) | SP-finishing option 1 (Merge locally) then: "git branch -d <feature-branch>" — deletes feature branch on merge | `git branch -d` is in apex-governance's permanent hard block list: "git branch -d or git branch -D." SP-finishing routinely executes it. **Hard block violation.** |
| Hard block: git merge | apex-governance: "git merge (any branch)" is permanently forbidden | SP-finishing option 1: "git checkout <base-branch>; git merge <feature-branch>" | **Direct hard block violation.** SP-finishing's primary merge path executes a permanently forbidden APEX action. |

**Quote citations:**
- apex-governance: "git merge (any branch) — permanently forbidden at every level."
- apex-governance: "git branch -d or git branch -D — permanently forbidden at every level."
- SP-finishing: "git checkout <base-branch>; git pull; git merge <feature-branch>" (Option 1)
- SP-finishing: "git branch -d <feature-branch>" (after merge)

**Risk to DeepSeek:** CRITICAL. SP-finishing is a REQUIRED sub-skill of SP-executing-plans and SP-SDD. Any session that activates the SP execution chain will end with a skill that instructs DeepSeek to execute two permanently-forbidden APEX actions (git merge and git branch -d). A literal executor will follow the most recently loaded instruction.

---

### 2.8 `superpowers:verification-before-completion`

**Classification: COMPLEMENT — no conflict**

SP-verification-before-completion mandates "evidence before claims, always." This is compatible with apex-code's per-task done-criteria (Karpathy step d: "verify the criterion before checking it off") and apex-coding-principles' post-coding checklist. The "No completion claims without fresh verification evidence" rule strengthens the APEX discipline rather than contradicting it. No behavioural conflict.

---

### 2.9 `superpowers:receiving-code-review`

**Classification: COMPLEMENT with minor overlap**

SP-receiving-code-review: "verify before implementing," "push back if reviewer is wrong," YAGNI-check additions. apex-governance § Acting on review findings: "verify before implementing — a finding can be wrong; confirm against the code before acting. No performative agreement; push back with evidence when a finding is mistaken; YAGNI-check any suggested addition." These are near-identical — apex-governance already absorbed this pattern from the Superpowers donor analysis. **DUPLICATE** in effect; the APEX version is the canonical one. No conflict.

---

### 2.10 `superpowers:requesting-code-review`

**Classification: DUPLICATE — partial**

SP-requesting-code-review dispatches a code-reviewer subagent after task completion. apex-code's post-build already dispatches apex-reviewer and (optionally) cross-model review. The SP skill is a narrower single-task review, while APEX's is post-build. **No contradiction**, but activating both means a session ends with both apex-reviewer and SP-code-reviewer reviewing the same output — redundant token spend. classify as DUPLICATE for the post-build use case.

---

### 2.11 `superpowers:using-git-worktrees`

**Classification: COMPLEMENT with risk**

SP-using-git-worktrees sets up an isolated workspace before feature work. apex-code has no equivalent setup step — it reads the existing repo. For the APEX workflow, worktrees are a harness concern (the `EnterWorktree` tool). SP-using-git-worktrees explicitly checks for native worktree tools first ("Do you already have a way to create a worktree? It might be a tool with a name like EnterWorktree..."), so it defers to the harness correctly. **COMPLEMENT** — adds isolation that APEX doesn't cover. However, the fallback path (`git worktree add`) and cleanup paths in SP-finishing overlap with apex-governance's hard blocks on branch deletion. **No conflict in the setup step itself.**

---

### 2.12 `superpowers:brainstorming`

**Classification: INERT during coding, CONFLICT with apex-plan in planning**

SP-brainstorming is a planning-mode skill. Its `<HARD-GATE>` "Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it" could fire before apex-plan's planning flow. It saves plans to `docs/superpowers/specs/` and transitions to `writing-plans`, bypassing apex-plan's template, readiness gate, and docs/changes/ spec path. If it fires on Claude backend, it competes with apex-plan as a planning orchestrator. **INERT in coding mode. CONFLICT with apex-plan in planning mode.**

---

### 2.13 `superpowers:using-superpowers`

**Classification: CONFLICT — Severity: HIGH (meta-level)**

This is the most dangerous skill in the set. It is a meta-skill that fires "when starting any conversation" and mandates:

"If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill. IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT. This is not negotiable. This is not optional."

| Dimension | APEX session contract says | `superpowers:using-superpowers` says | Conflict |
|---|---|---|---|
| Session start | apex-code owns session start: git log → read status.md → list docs/changes/ → report. | SP-using-superpowers: "Invoke relevant or requested skills BEFORE any response or action." Establishes Superpowers skills as mandatory-invoke layer before anything else. | Two session openers claiming to run first. |
| Skill invocation mandate | APEX skills are loaded by the harness based on trigger keywords; apex-code loads impl.md cores selectively (only NEVER/ALWAYS + Verification Recipe, not whole file). | "You MUST invoke the skill" even at 1% chance. Forces reading skill content. Directly counters apex-code's "Do not load the whole impl.md" selective-loading discipline. | If SP-using-superpowers fires, every 1%-chance APEX skill must be fully invoked — exploding context load that APEX's context discipline explicitly guards against. |
| Instruction priority | CLAUDE.md > APEX skills > defaults. apex-governance is canonical. | "Superpowers skills override default system prompt behavior... User instructions always take precedence." | Explicitly claims to override system behavior (below user instructions). Whether APEX skills count as "user instructions" or "system behavior" is ambiguous and would be resolved arbitrarily by a literal executor. |
| Process skills first | SP-using-superpowers: "Process skills first (brainstorming, debugging) — these determine HOW to approach the task." For "Let's build X": brainstorming first. For "Fix this bug": debugging first. | APEX routes via apex-orchestrate (planning vs coding detection), not via SP's process-skill ordering. | Competing routing hierarchies. SP's ordering (brainstorm → write-plans → execute) competes with APEX's routing (apex-plan → docs/changes/ → apex-code). |

**Quote citations:**
- SP-using-superpowers: "IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT."
- apex-code: "Load the bound impl.md core (once, at pre-flight) — not the whole file: Read ## NEVER do + ## ALWAYS do... Do not load the whole impl.md."
- SP-using-superpowers: "Superpowers skills override default system prompt behavior."
- CLAUDE.md: "These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication."

**Risk to DeepSeek:** CRITICAL. This skill installs itself as a mandatory session-opener that forces full invocation of every possibly-relevant skill. If it fires in a coding session, it will: (a) force SP-brainstorming (which blocks code), (b) force SP-test-driven-development with its Iron Law, (c) force SP-systematic-debugging with its SP-TDD cross-reference, and (d) explode context load by loading whole impl.md files rather than selective cores. It is the vector through which every other Superpowers conflict becomes active.

---

### 2.14 `superpowers:writing-skills`

**Classification: CONFLICT with apex-skill-author**

SP-writing-skills: TDD-for-documentation approach; Iron Law: "NO SKILL WITHOUT A FAILING TEST FIRST"; saves skills to `~/.claude/skills` (Claude Code) or `~/.agents/skills/` (Codex). apex-skill-author owns skill authoring: APEX Iron Law, frontmatter contract (requires `description` field, version, backend, sources, staleness_threshold), registry + index + history triple-write, SKILL-vs-impl decision, 500-line cap. SP-writing-skills has different frontmatter fields (only `name` + `description` per agentskills.io spec — no APEX fields). The core TDD-for-documentation discipline is compatible; the frontmatter contract and artifact targets differ. **CONFLICT on authoring contract; COMPLEMENT on the underlying TDD discipline.** Low active risk (neither fires autonomously in coding sessions).

---

### 2.15 `full-output-enforcement`

**Classification: CONFLICT — Severity: MEDIUM**

| Dimension | `apex-coding-principles` says | `full-output-enforcement` says | Conflict |
|---|---|---|---|
| Completeness vs. brevity | APEX context discipline: load only necessary context; per-task focus. apex-code: workers scoped to assigned tasks. | "Treat every task as production-critical. A partial output is a broken output. Do not optimize for brevity — optimize for completeness." | "Do not optimize for brevity" is a direct contradiction of APEX's context budget discipline and "be token-efficient" user memory. |
| Banned patterns | Full-output-enforcement bans "// rest of code", "// similar to above" — which are code truncation patterns. | apex-coding-principles bans commented-out code: "NEVER leave commented-out code in the file." | **Compatible** on the commented-out-code rule. Complementary on truncation bans. |
| Long outputs | "Write at full quality up to a clean breakpoint... End with: [PAUSED — X of Y complete. Send 'continue' to resume]" | APEX: no equivalent pause mechanism; apex-code does not have a resume-from-pause-token protocol within a task. | The PAUSED protocol introduces an interactivity pattern that doesn't exist in APEX's execution model. Not a hard conflict but introduces undefined behaviour. |
| Scope | "If the user asks for a full file, deliver the full file... No exceptions." | apex-coding-principles: "Change ONLY files listed in the spec's Files to Change." | The "no exceptions" completeness mandate conflicts with surgical scope — if a full file is requested but only part of it is in spec scope, these rules directly contradict. |

**Risk to DeepSeek:** Medium. The "optimize for completeness not brevity" directive conflicts with token discipline. More concretely, the surgical scope rule (touch only what the task names) can conflict with the "deliver the full file" rule when the spec names a partial file edit.

---

### 2.16 `write-feature-spec`

**Classification: INERT for APEX projects; CONFLICT if it fires**

`write-feature-spec` is hardcoded to the orion-v2 project (`C:\Users\User\Projects\orion-v2`), writes to `docs/specs/functional/` and `docs/specs/technical/` (not APEX's `docs/changes/`), and dispatches a separate Spec Writer subagent. It is project-specific and should not activate in other projects. **INERT** under normal routing. If it somehow fires in an APEX project, it would write spec artifacts to the wrong paths and bypass apex-plan's readiness gate. Low risk given the hardcoded project reference.

---

### 2.17 GSD cluster (`gsd-execute-phase`, `gsd-debug`, `gsd-code-review`, `gsd-add-tests`, `gsd-autonomous`, `gsd-fast`, `gsd-quick`, `gsd-verify-work`, `gsd-validate-phase`, `gsd-secure-phase`, `gsd-spike`)

**Classification: DUPLICATE for many functions; CONFLICT at session-loop level**

GSD is a complete parallel development system with its own planning→execution loop, state management (`.planning/STATE.md`, `.planning/ROADMAP.md`), spec format (GSD PLAN.md with frontmatter), and workflow commands. It is not designed to interoperate with APEX.

| Dimension | APEX says | GSD says | Classification |
|---|---|---|---|
| Session state | `docs/status.md` In-Flight table, `docs/changes/*.md` specs | `.planning/STATE.md`, `.planning/ROADMAP.md`, phase-based PLAN.md | **CONFLICT**: Competing state machines in different paths. Both could fire on "start build." |
| Execution loop | apex-code: wave-based parallel subagent dispatch, Karpathy Pre-Flight, apex-code-worker agents | gsd-execute-phase: wave-based parallel execution (same concept), gsd-executor agents, phase-based | **DUPLICATE** in concept; different agent types, artifact paths, and state stores. |
| Debugging | apex-debug: 6-stage reproduce-first workflow | gsd-debug: scientific method with subagent isolation, gsd-debugger/gsd-debug-session-manager agents | **DUPLICATE** — same method, different agent types. gsd-debug adds checkpoint/continuation across context resets which apex-debug lacks. Minor COMPLEMENT for the persistence feature. |
| Code review | apex-reviewer (post-build, dispatched by apex-code) | gsd-code-review: phase-based review, spawns gsd-code-reviewer | **DUPLICATE** — same function, different agents. |
| Testing | apex-testing impl.md | gsd-add-tests: RED-GREEN conventions, test plan approval gate | **DUPLICATE** — same discipline. gsd-add-tests requires user approval of a test plan (interactive gate), which apex-code's AFK mode would block. **Minor CONFLICT** on the approval gate. |
| Autonomous mode | apex-governance autonomy levels L0–L5; AFK build = autonomous but spec-gated | gsd-autonomous: "discuss→plan→execute per phase, pauses only for user decisions (grey area acceptance, blockers)" | **DUPLICATE** concept; different scope (gsd-autonomous covers a whole milestone). |
| Fast/quick tasks | Edit Mode in apex-code (direct instruction, no spec) | gsd-fast / gsd-quick (trivial tasks vs small tasks with quality guarantees) | **DUPLICATE** in function. |
| Security | apex-security impl.md (OWASP Top 10:2025 invariants) | gsd-secure-phase (retroactive threat mitigation audit) | **COMPLEMENT** — different timing (inline vs retroactive). No conflict. |
| Spec format | APEX spec: Identity + Files to Change + Exact changes + Acceptance criteria + Commands + Permissions + Assumptions + Wave plan | GSD PLAN.md: GSD-specific frontmatter, gap_closure, phase-based structure | **CONFLICT**: apex-code's Karpathy Pre-Flight reads specific APEX section headers. It cannot parse a GSD PLAN.md. |

**Overall GSD risk to DeepSeek:** Medium-High. GSD will not auto-fire in normal APEX sessions because its trigger surfaces ("execute phase 2", "gsd-execute-phase") are explicit slash commands. But if both systems are active in a session, state could fragment across `docs/status.md` and `.planning/STATE.md`. The main active risk is `gsd-autonomous` — if triggered, it runs a full milestone build loop that competes with apex-code's session contract.

---

### 2.18 Built-in slash skills (`code-review`, `simplify`, `verify`, `run`, `security-review`, `review`)

**Classification: COMPLEMENT — no SKILL.md found; harness-level commands**

These are listed in the system-reminder as available skills but no SKILL.md files were found in `~/.claude/skills/`. They are harness-level commands. As slash commands (user-invoked), they do not auto-fire in coding sessions. They complement APEX's review pipeline and do not conflict with it. **INERT unless explicitly invoked; COMPLEMENT when invoked.**

---

## 3. Trigger-Collision Analysis

**Scenario: DeepSeek coding session, user says "start build"**

Plausibly activating skills and estimated token load:

| Skill | Fires on | Estimated tokens | Classification |
|---|---|---|---|
| `apex-code` | session start, all builds | ~3,000 | BASELINE |
| `apex-coding-principles/impl.md` | auto-loaded at pre-flight | ~1,500 | BASELINE |
| `superpowers:using-superpowers` | "when starting any conversation" | ~800 | CRITICAL CONFLICT |
| `controlled-yolo` | "yolo mode" (opt-in, should not fire) | ~700 | HIGH CONFLICT if fires |
| `superpowers:executing-plans` | "have a written implementation plan to execute" | ~500 | HIGH CONFLICT |
| `superpowers:subagent-driven-development` | "executing implementation plans with independent tasks" | ~1,500 | HIGH CONFLICT |
| `superpowers:test-driven-development` | "implementing any feature or bugfix, before writing implementation code" | ~2,000 | HIGH CONFLICT |
| `superpowers:systematic-debugging` | any bug/failure encountered | ~1,500 | MEDIUM CONFLICT |
| `superpowers:finishing-a-development-branch` | after any SP execution plan | ~700 | CRITICAL CONFLICT (hard blocks) |
| `full-output-enforcement` | "any task requiring exhaustive, unabridged output" | ~600 | MEDIUM CONFLICT |
| `superpowers:verification-before-completion` | "about to claim work is complete" | ~600 | COMPLEMENT |
| `superpowers:receiving-code-review` | "when receiving code review feedback" | ~600 | DUPLICATE |
| `gsd-execute-phase` | "execute" or "phase" keywords | ~300 | MEDIUM CONFLICT |

**Combined context at start of a build session: ~13,800–14,500 tokens just for skill context.**
Compared to APEX-only baseline (~6,500 tokens: apex-code + coding-principles + bound stack cores). ~2× overhead from the conflict pile.

The more dangerous problem is not token cost but **instruction contradiction depth**: DeepSeek would receive mutually exclusive session controllers, dispatch models, and hard block instructions in the same context.

---

## 4. Severity Rankings

Ranked from most likely to derail a literal weak coder:

| Rank | Skill | What it breaks | Severity |
|---|---|---|---|
| 1 | `superpowers:finishing-a-development-branch` | Executes `git merge` and `git branch -d` — apex-governance permanently-forbidden hard blocks | CRITICAL |
| 2 | `superpowers:using-superpowers` | Meta-override: forces full-skill-load on every 1%-chance match, competes for session ownership, routes "fix this bug" to SP-debugging before apex-debug | CRITICAL |
| 3 | `superpowers:executing-plans` / `superpowers:subagent-driven-development` | Competing session loop, incompatible plan source (docs/superpowers/plans/ vs docs/changes/), interactive finish (blocked in AFK) | HIGH |
| 4 | `superpowers:test-driven-development` | Iron Law ("delete code, start over") conflicts with "immediately after the task" allowance in apex-testing; "ask your human partner" exceptions blocked in AFK | HIGH |
| 5 | `controlled-yolo` | Eliminates GRAY fork escalation to planning; autonomously makes schema decisions that apex-code routes as BIG forks; competing session loop | HIGH |
| 6 | `superpowers:subagent-driven-development` (parallel dispatch ban) | Directly contradicts apex-code's core wave-parallel dispatch model | HIGH |
| 7 | `full-output-enforcement` | "optimize for completeness not brevity" vs APEX context discipline; surgical scope vs "deliver the full file" | MEDIUM |
| 8 | `superpowers:systematic-debugging` (via SP-TDD cross-ref) | Imports SP-TDD Iron Law into debug flow; minor session-stop trigger tension | MEDIUM |
| 9 | GSD cluster (session state) | Competing state machines if both active | MEDIUM |
| 10 | `superpowers:brainstorming` | Planning-mode competitor to apex-plan; HARD-GATE blocks code before design approval | LOW (only in planning mode) |

---

## 5. Keep / Purge / Quarantine Recommendations

### PURGE (removes active conflicts with hard-block violations or competing execution loops)

| Skill | Reason | Token savings |
|---|---|---|
| `superpowers:finishing-a-development-branch` | Executes apex-governance permanently-forbidden hard blocks (git merge, git branch -d). Cannot be safely used alongside APEX. | ~700 |
| `superpowers:using-superpowers` | Meta-override that would force load every conflicting SP skill. Session ownership conflict. Competes with apex-orchestrate. | ~800 |
| `superpowers:executing-plans` | Competing execution loop; incompatible plan source; interactive finish blocked by AFK mode. | ~500 |
| `superpowers:subagent-driven-development` | Parallel dispatch ban directly contradicts apex-code wave dispatch. Two-stage-review-every-task inflates cost. Incompatible plan source. | ~1,500 |
| `superpowers:writing-plans` | Writes plans to wrong path (docs/superpowers/plans/ vs docs/changes/); wrong spec format; would break apex-code session-start plan discovery. | ~900 |
| `superpowers:brainstorming` | Competes with apex-plan as planning orchestrator; HARD-GATE blocks code until it approves a design; writes specs to wrong path. | ~1,000 |

**Total conservative savings from purge: ~5,400 tokens + elimination of all hard-block violations.**

### QUARANTINE (isolate behind explicit activation; do not let auto-fire in APEX sessions)

| Skill | Issue | Recommended action |
|---|---|---|
| `controlled-yolo` | Competes with APEX session loop; eliminates GRAY fork escalation. Already opt-in activation ("yolo mode"). | Keep but verify harness does not let it fire alongside apex-code. Document mutual exclusion. |
| `superpowers:test-driven-development` | Iron Law conflicts with apex-testing's "immediately after the task" allowance; "ask human" exceptions blocked in AFK. | Keep as planning-side reference skill (the discipline is good); add a note: "In APEX AFK mode, test step timing is governed by apex-testing impl.md, not this Iron Law." Or suppress in coding sessions. |
| `full-output-enforcement` | "Optimize for completeness not brevity" conflicts with token discipline; "full file" conflicts with surgical scope. | Keep for non-APEX coding contexts (useful in interactive edit mode where surgical scope doesn't apply). Add frontmatter trigger narrowing to exclude APEX AFK sessions. |
| `superpowers:systematic-debugging` | Structural overlap with apex-debug; imports SP-TDD Iron Law into debug flow. | DEFER to apex-debug. The Sentry integration in apex-debug and the checkpoint persistence in gsd-debug together cover more. Keep as reference only. |
| GSD cluster | Full competing system. Useful on GSD projects; harmful if active alongside APEX. | Keep but segregate by project (CLAUDE.md override per project). Ensure `.planning/` state and `docs/` state don't co-exist in APEX projects. |

### KEEP (no change needed; complement or duplicate with no conflict)

| Skill | Reason |
|---|---|
| `superpowers:verification-before-completion` | Pure complement to apex-code Karpathy step d. No conflict. |
| `superpowers:receiving-code-review` | DUPLICATE of apex-governance's review-reception discipline. Harmless; minor token overhead. |
| `superpowers:requesting-code-review` | DUPLICATE for the post-task review pattern. APEX covers this better (apex-reviewer). Harmless if not triggered. |
| `superpowers:using-git-worktrees` | COMPLEMENT — adds workspace isolation that APEX doesn't cover. Setup step is safe; defer to harness's native EnterWorktree. |
| `superpowers:writing-skills` | CONFLICT with apex-skill-author on frontmatter contract; compatible on TDD discipline. Keep as reference for the TDD-for-documentation method; use apex-skill-author for actual APEX skill authoring. |
| `write-feature-spec` | INERT — hardcoded to orion-v2 project. No risk in other projects. |
| GSD skills used on GSD projects | They form a coherent competing system that is internally consistent. The problem is co-activation with APEX, not the GSD skills themselves. |

---

## 6. Assumptions & Gaps

1. **Trigger activation model** [ASSUMED]: This analysis assumes skills can co-activate on a single session based on description-field keyword matching. If the harness enforces single-skill-dispatch (first match wins), collision impact drops significantly. The exact harness dispatch model was not verified from harness config.

2. **superpowers:using-superpowers activation** [CONFIRMED from file]: Its description explicitly says "Use when starting any conversation." If this fires in a DeepSeek session, it functions as a mandatory pre-loader for all other Superpowers skills.

3. **Built-in slash skills** [INFERRED]: `code-review`, `simplify`, `verify`, `run`, `security-review`, `review` were not found as SKILL.md files. Treated as harness-level commands (user-invoked only). If they have hidden SKILL.md files elsewhere, this may change their classification.

4. **GSD trigger surfaces** [ASSUMED]: GSD skills use explicit slash command invocation (e.g., `/gsd-execute-phase 2`). They should not auto-fire on generic "start build" keywords. If any GSD description field matches generic coding keywords, the collision risk would be higher.

5. **Token estimates** [ESTIMATED]: Token costs are line-count-based estimates (~14 tokens/line for prose). Actual tokeniser output varies ±20%.

6. **`controlled-yolo` opt-in claim** [CONFIRMED from file]: "Only active when the user explicitly says 'use yolo mode'... Normal coding sessions are unchanged." The opt-in gate is in the skill itself, not in the harness — DeepSeek must recognise the activation condition correctly.

7. **apex-governance hard block authority** [CONFIRMED from file]: "This file is the canonical home of the level definitions and the hard-block list — apex-orchestrate and apex-code carry summaries only; on conflict, this file wins." The git merge and git branch-d hard blocks are unambiguous.
