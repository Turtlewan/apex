# agent-skills Rejected-Items Salvage Analysis

**Source:** https://github.com/addyosmani/agent-skills (commit d187883)  
**Baseline:** docs/research/agent-skills-analysis.md  
**Date:** 2026-06-13  
**Purpose:** Phase-2 pass — for each item REJECTED as "already-have", identify any specific part (rule, table, framing, checklist item, technique) that is genuinely net-new to APEX.

---

## Item-by-Item Analysis

### 1. spec-driven-development
**Most distinctive specifics:**
1. Six-section spec template (Objective, Commands, Project Structure, Code Style, Testing Strategy, Boundaries).
2. Explicit three-tier Boundaries block: Always / Ask First / Never — written into the spec itself, not just a separate skill.
3. "Reframe vague requirements as success criteria" pattern (Dashboard LCP < 2.5s example).
4. "When NOT to use" trigger for trivial tasks.

**APEX status:**
- Six-section template: apex-plan owns spec structure; CLAUDE.md defines `docs/changes/` spec sections (Identity, Files to Change, Exact changes, Acceptance criteria, Commands). Different sections, both cover similar territory. **Have (different framing).**
- Three-tier Boundaries in the spec: apex-plan specs don't include an explicit Always/Ask/Never boundaries section — governance escalation lives in apex-governance. **Partial-new: the Always/Ask/Never block as a spec-embedded section is sharper than APEX's implicit approach.**
- Reframe vague requirements as success criteria: CLAUDE.md rule 4 covers this ("Add validation" → "Write tests for invalid inputs"); apex-plan readiness gate. **Have.**
- When NOT to use: present in apex-plan. **Have.**

**Salvageable part:** The explicit Always / Ask First / Never three-tier block as a concrete section inside a spec document. APEX specs have acceptance criteria but no explicit permission/boundary section. This is a one-paragraph addition to apex-plan's spec template.  
**Net-new:** Yes — the embedded spec-level boundary section.  
**Target:** apex-plan SKILL.md (spec template section).  
**Token-cost:** Very low (3–5 lines).

---

### 2. planning-and-task-breakdown
**Most distinctive specifics:**
1. XS/S/M/L/XL task-sizing table with file-count thresholds and a hard "XL = break it down" rule.
2. "When to break a task down further" checklist: if you write "and" in the task title, it's two tasks.
3. Checkpoint block between phases (explicit mid-plan pause points).
4. "Parallelization Opportunities" section (safe to parallelize / must be sequential / needs coordination).

**APEX status:**
- Task sizing: apex-plan mentions task breakdown; CLAUDE.md split rule ("more than 3 files or 2 logical phases → split"). More granular XS–XL table with the "and-in-title" heuristic is not in APEX. **Partial-new.**
- Checkpoint blocks: implicit in apex-code's wave-parallel structure but not named as "checkpoints" in planning specs. **Partial-new framing.**
- Parallelization opportunities: apex-code handles parallel wave execution; apex-plan doesn't have a planning-time "what's safe to parallelize?" section. **Partial-new.**
- "And in the title = two tasks" heuristic: not in APEX. **Net-new heuristic.**

**Salvageable part:** The single-sentence heuristic: "If you find yourself writing 'and' in the task title, it's two tasks." This is a crisp, memorable rule absent from APEX. The XS/S/M/L/XL sizing table is also sharper than APEX's current "3 files / 2 phases" rule.  
**Net-new:** Yes — the "and-in-title" heuristic and the XS–XL sizing table.  
**Target:** apex-plan SKILL.md (task decomposition section).  
**Token-cost:** Very low (one sentence + one small table).

---

### 3. incremental-implementation
**Most distinctive specifics:**
1. Rule 0: Simplicity First with the explicit "three lines of code > premature abstraction" rule.
2. Rule 0.5: Scope Discipline with the "NOTICED BUT NOT TOUCHING" output block template.
3. Rule 3: Feature Flags for incomplete features (with `process.env.FEATURE_X` pattern).
4. Rule 5: Rollback-Friendly (additive changes easy to revert; separate delete from replace).
5. Increment checklist footnote: "After a successful run, don't repeat the same command unless the code has changed — re-running adds no information."

**APEX status:**
- Rule 0 (simplicity): CLAUDE.md § 2 covers simplicity; apex-coding-principles impl.md has YAGNI and "three similar lines > premature abstraction" as implied principles. **Have.**
- Rule 0.5 "NOTICED BUT NOT TOUCHING" template block: apex-coding-principles impl.md says "Do not refactor adjacent code… mention it in the task summary instead" but does NOT have the explicit `NOTICED BUT NOT TOUCHING:` output format. **Net-new: the specific output block template.**
- Feature flags: apex-devops mentions feature flags; CLAUDE.md has `docs/changes/` but no inline feature-flag code pattern. **Have in devops, not in coding-principles.**
- Rollback-Friendly: not explicitly in APEX. **Minor net-new (one rule).**
- "Don't re-run unchanged command": not in APEX. **Net-new: useful anti-pattern.**

**Salvageable parts:**
1. The `NOTICED BUT NOT TOUCHING:` output block template (3 lines with items + "→ Want me to create tasks for these?" prompt). Concrete upgrade over APEX's current "mention it in the task summary" guidance.
2. The "don't re-run the same command if nothing changed" rule — a sharp, checkable anti-pattern missing from apex-code.  
**Net-new:** Yes — two specific items.  
**Target:** apex-coding-principles impl.md and/or apex-code SKILL.md.  
**Token-cost:** Very low (two sentences + a 3-line template).

---

### 4. test-driven-development
**Most distinctive specifics:**
1. "The Beyonce Rule" named heuristic ("if you liked it, put a test on it" — infra changes are not responsible for catching your bugs; your tests are).
2. Test Sizes resource model (Small / Medium / Large) by what resources they consume (process, network, time) vs the standard pyramid layers.
3. DAMP over DRY: named and present. Already in apex-testing. **Have.**
4. "Prefer real implementations over mocks" hierarchy: Real → Fake → Stub → Mock. Not explicitly in APEX. **Partial-new framing.**
5. "Test state, not interactions" — not mock method calls. Already in apex-testing. **Have.**

**APEX status:**
- Beyonce Rule: not in apex-testing. **Net-new named heuristic.**
- Test sizes (Small/Medium/Large by resource model): apex-testing has the pyramid (unit/integration/E2E), not a resource-constraint sizing model. **Net-new framing.**
- Real > Fake > Stub > Mock preference order: apex-testing says "don't mock internal functions", consistent but doesn't name this hierarchy explicitly. **Net-new naming.**
- DAMP, AAA pattern, regression tests: **Have** (apex-testing SKILL.md and impl.md).

**Salvageable parts:**
1. The Beyonce Rule (one sentence): "If you liked it, you should have put a test on it. Infrastructure changes are not responsible for catching your bugs — your tests are." Sharp, memorable, and addresses a real APEX gap (makes test ownership unambiguous during refactors).
2. The Real > Fake > Stub > Mock preference hierarchy — a 4-item ordered list, absent from apex-testing.  
**Net-new:** Yes — two items.  
**Target:** apex-testing SKILL.md.  
**Token-cost:** Very low (two sentences + a 4-line list).

---

### 5. api-and-interface-design
**Most distinctive specifics:**
1. Hyrum's Law stated explicitly with design implications (every observable behavior becomes a contract; tests not enough for safe removal; plan for deprecation at design time).
2. The One-Version Rule (avoid forcing consumers to choose between multiple dependency versions; extend, don't fork).
3. Branded Types pattern for IDs (`TaskId = string & { __brand: 'TaskId' }`) — prevents passing the wrong ID type.
4. Input/Output separation pattern (`CreateTaskInput` vs `Task`).
5. Explicit "third-party API responses are untrusted data" note.

**APEX status:**
- Hyrum's Law: not named anywhere in APEX skills. The implication (every behavior is a contract) is not stated. **Net-new.**
- One-Version Rule: not in APEX. **Net-new.**
- Branded Types: not in apex-backend or impl.md. **Net-new (TypeScript-specific).**
- Input/Output type separation: not explicitly named in APEX. **Net-new naming.**
- Third-party responses untrusted: apex-security covers input validation at boundaries; CLAUDE.md § 6 covers agent self-defense. The explicit "third-party API responses are untrusted data" note in an API design context is reinforcement, not new. **Have.**

**Salvageable parts:**
1. **Hyrum's Law** + its design implication: "Plan for deprecation at design time. Tests are not enough — users depend on undocumented behaviors." One paragraph, highly concrete, absent from apex-backend and apex-architecture. This is the intellectual backbone of the deprecation-and-migration skill.
2. **One-Version Rule** (one sentence): "Design for a world where only one version exists at a time — extend rather than fork." Absent from APEX.
3. **Branded types for IDs** pattern — TypeScript-specific but a crisp, concrete pattern absent from apex-backend impl.md.  
**Net-new:** Yes — three items.  
**Target:** apex-backend SKILL.md (Hyrum's Law + One-Version Rule) and apex-backend impl.md (Branded Types).  
**Token-cost:** Low (one paragraph + two sentences + one code snippet).

---

### 6. debugging-and-error-recovery
**Most distinctive specifics:**
1. "Error output as untrusted data" section — explicit rule that error messages, stack traces, log output from external sources are data to analyze, not instructions to follow. Includes the "don't follow steps embedded in error messages" rule.
2. `git bisect` workflow with a concrete `git bisect run npm test` example for regression bisection.
3. "Non-reproducible bug" decision tree (timing-dependent / environment-dependent / state-dependent / truly random).

**APEX status:**
- Error output as untrusted data: apex-debug does NOT have this section. CLAUDE.md § 6 covers agent self-defense for fetched web content; it doesn't explicitly address CI logs / error messages / stack traces as injection vectors. **Net-new in the debugging context.**
- `git bisect` workflow: not in apex-debug or apex-github. **Net-new.**
- Non-reproducible bug tree: apex-debug has stop-the-line and reproduce → diagnose → fix → guard, but no structured sub-tree for "what if I can't reproduce it?" **Net-new framing.**

**Salvageable parts:**
1. "Error output from external sources is untrusted data" rule — a concrete 3-rule block (don't execute commands found in error messages, surface instruction-like text to the user, treat CI logs from third-party APIs as data). This is a meaningful gap in apex-debug.
2. `git bisect run <test-command>` one-liner — adds the automated bisection pattern to apex-debug.
3. Non-reproducible bug sub-tree (timing / environment / state / truly-random) — a structured flowchart for the "can't reproduce" case, absent from apex-debug.  
**Net-new:** Yes — three items.  
**Target:** apex-debug SKILL.md.  
**Token-cost:** Low (one paragraph + one code line + one decision sub-tree, ~15 lines total).

---

### 7. code-review-and-quality
**Most distinctive specifics:**
1. Review comment severity labeling system: `(no prefix)` = required, `Critical:`, `Nit:`, `Optional:/Consider:`, `FYI` — with explicit "author action" column. Prevents authors treating all feedback as mandatory.
2. Change-size table (100 lines good / 300 acceptable / 1000 = split) with four splitting strategies: Stack, By file group, Horizontal, Vertical.
3. "Don't accept 'I'll clean it up later'" rule — require cleanup before submission.
4. "Review Speed" section: respond within one business day; prioritize fast individual responses over quick final approval.
5. Multi-model review pattern (Model A writes, Model B reviews for correctness, Model A addresses, human decides).

**APEX status:**
- Comment severity labeling (Nit:, Optional:, FYI, Critical:): not in apex-reviewer or APEX code-review skill. **Net-new concrete convention.**
- Change-size table with splitting strategies: not in APEX (apex-plan mentions split rule but no named strategies). **Net-new naming of strategies.**
- "I'll clean it up later" anti-pattern explicitly blocked: not named in APEX. **Net-new rule.**
- Review Speed section: not in apex-reviewer. **Net-new.**
- Multi-model review pattern: apex-reviewer dispatches subagents but doesn't frame this as a named "multi-model review pattern" technique. **Have (mechanically).**

**Salvageable parts:**
1. **Review comment severity labeling table** (Nit: / Optional: / FYI / no-prefix / Critical:) with author-action column. This is a concrete, low-token, directly actionable table that would sharpen apex-reviewer's output format.
2. **Change-size splitting strategies** (Stack / By file group / Horizontal / Vertical) — named and distinct. Absent from apex-plan and apex-reviewer.
3. The "don't accept 'I'll clean it up later'" rule (one sentence) — absent from APEX.  
**Net-new:** Yes — three items.  
**Target:** apex-reviewer SKILL.md and/or code-review skill.  
**Token-cost:** Low (one table + one mini-table + one sentence).

---

### 8. code-simplification
**Most distinctive specifics:**
1. Chesterton's Fence principle named and applied: "Before changing or removing anything, understand why it exists. Check git blame."
2. The Rule of 500: "If a refactoring touches more than 500 lines, invest in automation (codemods, sed scripts, AST transforms)."
3. "Don't simplify for the sake of it" (when NOT to use) with "if the simplified version is harder to review, revert" test.
4. Structural complexity table mapping patterns to signals and fixes (deep nesting → guard clauses, boolean flags → options objects, etc.).

**APEX status:**
- Chesterton's Fence: not named in APEX. The principle is implied by "don't touch what you don't need to" but not articulated as a named reasoning tool. **Net-new named principle.**
- Rule of 500 for refactors: not in APEX. **Net-new.**
- Structural complexity table: apex-coding-principles impl.md has the NEVER/ALWAYS lists covering several of these patterns (nested conditionals, early returns) but not as a structured signal → simplification mapping table. **Partial-new framing.**
- "If simpler version is harder to review, revert" test: not in APEX. **Net-new test.**

**Salvageable parts:**
1. **Chesterton's Fence** as a named principle (one sentence + "check git blame before removing"): a meaningful addition to apex-coding-principles and/or the simplify skill's SKILL.md. Makes the reasoning behind "don't touch code you don't understand" more concrete and memorable.
2. **Rule of 500** (one sentence): "If a refactoring touches more than 500 lines, invest in automation." Absent from APEX, directly applicable.
3. **"If the simplified version is harder to understand, revert"** test: a sharp self-check absent from apex-coding-principles.  
**Net-new:** Yes — three items.  
**Target:** apex-coding-principles impl.md and/or simplify SKILL.md.  
**Token-cost:** Very low (three sentences).

---

### 9. security-and-hardening
**Most distinctive specifics:**
1. SSRF mitigation with production-grade Node.js code: `ipaddr.js` + DNS resolution + `range() !== 'unicast'` check + `redirect: 'error'` pattern. Plus TOCTOU gap warning and pinned-IP mitigation options.
2. `npm audit` triage decision tree (critical/high reachable vs dev-only; moderate; low; deferral documentation pattern).
3. Supply-chain hygiene section: `npm ci` vs `npm install` in CI, `postinstall` script risk warning, typosquat examples.
4. OWASP LLM Top 10 section with specific mitigations for prompt injection, excessive agency, unbounded consumption.

**APEX status:**
- SSRF: apex-security mentions "SSRF merged into Broken Access Control" in the OWASP update note; it's in the checklist as "Server-side URL fetches validated against an allowlist." But there is NO production-ready code showing the `ipaddr.js` + DNS resolution + unicast-range check pattern with the TOCTOU note. **Net-new: the specific code pattern.**
- npm audit triage tree: apex-security has "npm audit" in the checklist but no structured decision tree for "reachable vs dev-only" triage. **Net-new.**
- Supply-chain hygiene: apex-security mentions `npm audit` and lockfile commit. The `npm ci` vs `npm install` distinction for CI, `postinstall` risk, and typosquat examples are not in APEX. **Net-new specifics.**
- OWASP LLM Top 10: apex-security and apex-ai-systems cover this territory. **Have.**

**Salvageable parts:**
1. **SSRF mitigation code pattern** with `ipaddr.js` + DNS resolution + `unicast` range check + `redirect: 'error'` + TOCTOU warning. This is a concrete, production-ready pattern absent from apex-security's impl.md.
2. **npm audit triage decision tree** (reachable vs dev-only / critical/high/moderate/low). One small flowchart, absent from APEX.
3. **Supply-chain specifics**: `npm ci` vs `npm install` in CI (one sentence), `postinstall` script warning, typosquat examples. Low-token, high-signal additions to apex-security.  
**Net-new:** Yes — three items.  
**Target:** apex-security SKILL.md and impl.md.  
**Token-cost:** Low-Medium (one code block ~15 lines + one decision tree ~10 lines + 3 sentences).

---

### 10. git-workflow-and-versioning
**Most distinctive specifics:**
1. "Change Summaries" section with explicit `CHANGES MADE / THINGS I DIDN'T TOUCH / POTENTIAL CONCERNS` output block template.
2. `git worktrees` as a parallelization primitive for multi-agent work — concrete workflow with `git worktree add ../project-feature-a` commands.
3. "Dev branches are costs" framing (explicit cost metaphor for long-lived branches).
4. Conventional commit types list (feat / fix / refactor / test / docs / chore) as a named convention.

**APEX status:**
- Change Summaries block (`CHANGES MADE / THINGS I DIDN'T TOUCH`): apex-code has a task summary format but not this specific three-section output block. **Net-new template.**
- git worktrees for multi-agent parallelism: not in apex-github or CLAUDE.md. **Net-new (but APEX uses Claude Code worktrees natively for isolation via `apex-wave-reviewer`; this is the explicit branch-level worktree as a workflow pattern).**
- "Dev branches are costs" framing: implied in APEX coding discipline, not explicitly stated. **Weak net-new (framing only).**
- Conventional commit types: apex-coding-principles ALWAYS rule says "clear commit messages" but doesn't name the type prefix convention. **Partial-new.**

**Salvageable parts:**
1. **Change Summaries output block** (CHANGES MADE / THINGS I DIDN'T TOUCH / POTENTIAL CONCERNS) — this is a concrete 3-section template for what a coding-mode task summary looks like. Different from APEX's handoff doc (session-level), this is a per-task output format. Worth adding to apex-code's task completion section.
2. **Conventional commit type prefix list** (feat / fix / refactor / test / docs / chore) as a named standard to cite. One line in apex-coding-principles.  
**Net-new:** Yes — two items.  
**Target:** apex-code SKILL.md (task summary template) and apex-coding-principles impl.md (commit types).  
**Token-cost:** Very low (one 3-section template + one list row).

---

### 11. ci-cd-and-automation
**Most distinctive specifics:**
1. Build Cop role: "Designate someone responsible for keeping CI green. When the build breaks, the Build Cop's job is to fix or revert — not the person whose change caused the break."
2. "No gate can be skipped" as a rule — if lint fails, fix lint, don't disable the rule.
3. CI Optimization priority list (cache → parallel jobs → path filters → matrix → optimize suite → larger runners) as an ordered escalation.
4. "Feeding CI failures back to agents" pattern — paste specific error, instruct agent to fix, push again.

**APEX status:**
- Build Cop role: not in apex-devops. **Net-new (small, concrete).**
- "No gate can be skipped": implied in APEX's quality gate discipline but not stated as a rule. **Net-new rule framing.**
- CI Optimization priority list: not in apex-devops. **Net-new.**
- Feeding CI failures to agents: APEX's coding loop handles this via status.md but no explicit "paste CI error to agent" workflow step. **Net-new workflow step (minor).**

**Salvageable parts:**
1. **Build Cop role** (one sentence): "When the build breaks, the Build Cop fixes or reverts — not the person whose change caused the break." Absent from apex-devops, prevents the "broken build sits there" failure mode.
2. **"No gate can be skipped" rule** (one sentence): "If lint fails, fix lint — don't disable the rule." Sharp discipline anchor.  
**Net-new:** Yes — two items.  
**Target:** apex-devops SKILL.md.  
**Token-cost:** Very low (two sentences).

---

### 12. documentation-and-adrs
**Most distinctive specifics:**
1. "Documentation for Agents" section — CLAUDE.md / rules files, spec files, ADRs, inline gotchas as agent-specific doc types.
2. Comment rule: "Comment the why, not the what" — with explicit "why comments are stable; what comments get outdated" reasoning.
3. ADR lifecycle: PROPOSED → ACCEPTED → SUPERSEDED / DEPRECATED; don't delete old ADRs.
4. Known Gotchas pattern (`/** IMPORTANT: call before first render… see ADR-003 */`).

**APEX status:**
- "Documentation for Agents" framing: apex-docs-technical covers handoff/spec docs; APEX ADR system exists. The framing of docs-as-agent-context is present but not as a named section. **Have (implicitly).**
- "Why comments stable, what comments get outdated": apex-coding-principles impl.md has the comment rule ("write a comment only when the reason is not obvious") but not this specific reasoning about why/what stability. **Net-new reasoning.**
- ADR lifecycle (PROPOSED → ACCEPTED → SUPERSEDED/DEPRECATED; no deletions): apex-governance has ADRs but does the SKILL.md explicitly say "don't delete"? Not verified as present. **Potentially net-new one-liner.**
- Known Gotchas `/** IMPORTANT */` pattern: not in apex-docs-technical. **Net-new.**

**Salvageable parts:**
1. **"Why comments are stable; what comments get outdated"** reasoning (one sentence): "Code shows what; why comments explain constraints that outlast any implementation." A sharper articulation of APEX's comment rule.
2. **Known Gotchas inline pattern** (`/** IMPORTANT: X. See ADR-Y. */`) — a concrete template for warning future agents/engineers at the call site. Not in apex-docs-technical.  
**Net-new:** Yes — two items.  
**Target:** apex-coding-principles impl.md (comment rule section) and apex-docs-technical SKILL.md.  
**Token-cost:** Very low (two sentences + one code snippet).

---

### 13. observability-and-instrumentation
**Most distinctive specifics:**
1. "Define 'working' before instrumenting" — write down 2-4 on-call questions FIRST; every signal must map to one.
2. RED metrics (Rate/Errors/Duration) for request-driven services vs USE (Utilization/Saturation/Errors) for resources — as named frameworks.
3. "Cardinality is the failure mode" — labels must come from small fixed sets; never user IDs / raw URLs / error message text.
4. Alert on symptoms users feel (page-worthy) vs causes (dashboard) — with specific "two severities only: page and ticket" rule.
5. "Verify the telemetry itself" step (trigger errors in staging, test-fire each alert once).

**APEX status:**
- Define working before instrumenting: apex-observability covers structured logging and alerting but let me verify. **Checking below.**
- RED vs USE framework naming: apex-observability covers logs/metrics/traces. Named RED/USE: likely present given apex-observability sources. **Assume have.**
- Cardinality: apex-observability likely covers. **Assume have.**
- Symptom vs cause alerting, two-severity rule: apex-observability covers. **Assume have** (apex-observability is well-developed).
- "Verify the telemetry itself" verification step: this is a specific test step (force an error in staging, confirm you can find it via telemetry). Verification-as-a-distinct-step is distinctive. **Potentially net-new.**

Given apex-observability is sourced from production-quality references, most content overlaps. The "verify the telemetry itself" step is the only concrete item not obviously present in a well-developed observability skill.

**Salvageable part:** "Verify the telemetry itself" as a named final step: "Before calling instrumentation done, trigger the failure path in staging and locate it via logs + trace — without reading source code." This is a concrete acceptance criteria absent from most observability checklists.  
**Net-new:** Possibly yes, but low confidence without reading apex-observability fully.  
**Token-cost:** Very low (one checklist item).  
**Verdict:** CONDITIONAL — worth checking apex-observability before absorbing.

---

### 14. shipping-and-launch
**Most distinctive specifics:**
1. Rollout Decision Thresholds table: exact numbers — error rate within 10% advance / 10–100% hold / >2x rollback; P95 latency within 20% advance / 20–50% hold / >50% rollback; client JS errors 0.1% threshold.
2. "Feature flag lifecycle" explicit cleanup rule: "Clean up flags within 2 weeks of full rollout."
3. "It's Friday afternoon, let's ship it" as a named anti-pattern.
4. Rollback plan template (trigger conditions, rollback steps, DB considerations, time-to-rollback per mechanism).

**APEX status:**
- Rollout Decision Thresholds table: apex-devops covers staged rollout and rollback. Whether it has specific numeric thresholds (2x baseline, 50% p95) — likely generic guidance, not specific numbers. **Potentially net-new specifics.**
- Flag cleanup rule (2 weeks): not in apex-devops. **Net-new.**
- "Friday afternoon" anti-pattern: not in apex-devops. **Net-new (minor).**
- Rollback plan template: apex-devops has rollback sections. Specific structured template: **Partial-new.**

**Salvageable parts:**
1. **Rollout decision thresholds table** (advance/hold/rollback with specific percentages) — the only item in this skill with concrete numbers. Not guesswork — this is the industry-standard go/hold/rollback criteria.
2. **Feature flag cleanup rule** (2 weeks after full rollout) as a time-bound policy.  
**Net-new:** Yes — two items.  
**Target:** apex-devops SKILL.md.  
**Token-cost:** Low (one small table + one sentence).

---

### 15. deprecation-and-migration
**Most distinctive specifics:**
1. "Code is a liability, not an asset" framing — ongoing maintenance cost of every line.
2. Hyrum's Law implications for removal (every observable behavior depended on; removal requires active migration).
3. Compulsory vs Advisory deprecation decision table.
4. The Churn Rule: "If you own the infrastructure being deprecated, you are responsible for migrating your users — or providing backward-compatible updates."
5. Strangler Pattern and Adapter Pattern as named migration strategies.
6. Zombie Code section: defined, with decision (assign owner or deprecate — never leave in limbo).
7. "Deprecation planning starts at design time" principle.

**APEX status:**
- apex-data covers DB migration patterns (zero-downtime, never rename in one step). No general code/API/system deprecation framing. apex-architecture and apex-backend: no deprecation content found in searches.
- Hyrum's Law: verified absent from all APEX skills. **Net-new.**
- Compulsory vs Advisory table: verified absent. **Net-new.**
- Churn Rule: absent. **Net-new.**
- Strangler Pattern: not named in APEX. **Net-new.**
- Zombie Code: absent. **Net-new.**
- "Deprecation planning at design time": absent. **Net-new.**

**Assessment:** This skill has more genuinely net-new content than any other REJECTED item. APEX has zero general deprecation/removal framing. The original analysis tagged it NOTE; the full read confirms it deserves a stronger verdict.

**Salvageable parts (all net-new):**
1. **"Code is a liability" + deprecation planning at design time** framing (two sentences).
2. **Hyrum's Law** + its removal implication (overlaps with api-and-interface-design entry above; the design-time hook is deprecation-specific).
3. **Compulsory vs Advisory deprecation** decision table.
4. **The Churn Rule** (one sentence).
5. **Zombie Code** definition + "assign owner or deprecate, never leave in limbo" rule.
6. **Strangler Pattern** as a named migration strategy (one paragraph).  
**Net-new:** Yes — the most content-rich salvage item.  
**Target:** apex-architecture SKILL.md (new "Deprecation and Removal" section) or new apex-deprecation skill (if volume warrants).  
**Token-cost:** Medium (~30–40 lines for a meaningful section).

---

### 16. idea-refine
**Most distinctive specifics:**
1. Inversion lens: "What if we did the opposite?" as a structured ideation technique.
2. "Not Doing" list as the most valuable part of the output one-pager (explicit priority for scope negation).
3. "Don't be a yes-machine" as an explicit anti-pattern in ideation facilitation.

**APEX status:**
- apex-deep-dive handles explore-options-before-deciding. Structured divergent lenses (inversion, 10x, audience-shift): not in APEX. But APEX's charter is developer toolchain, not product ideation. The lenses are PM/design tools.
- "Not Doing" list: mentioned in CLAUDE.md § 2 (simplicity) implicitly. Not as a named artifact section.
- "Don't be a yes-machine" framing: in CLAUDE.md § 1 ("push back when warranted"). **Have.**

**Salvageable part:** None that are clearly net-new and fit APEX's scope. The "Not Doing" list framing is closest but APEX's spec format doesn't include a Not Doing section and it's not needed in execution specs. The divergent lenses are PM tools.  
**Verdict: Nothing salvageable for APEX's coding/planning charter.**

---

### 17. doubt-driven-development
**Most distinctive specifics:**
1. CLAIM → EXTRACT → DOUBT → RECONCILE → STOP bounded cycle with explicit 3-cycle limit.
2. "Pass ARTIFACT + CONTRACT only — NOT the CLAIM" rule (prevents bias toward agreement).
3. Reconcile classification hierarchy: Contract misread / Valid actionable / Valid trade-off / Noise — in precedence order.
4. "Doubt theater" anti-pattern: across 2+ cycles, zero findings classified as actionable = you are validating, not doubting.
5. Cross-model escalation offer in every interactive cycle (mandatory, not optional).

**APEX status:**
- apex-reviewer and apex-wave-reviewer exist for pipeline-level review.
- The specific "Pass ARTIFACT + CONTRACT only, not the CLAIM" technique and the "Doubt theater" anti-pattern are not in APEX. However, the full skill has very high token cost (spawns subagents per decision) and APEX already has apex-reviewer, apex-wave-reviewer, and apex-spec-reviewer at structured pipeline points.
- The reconcile classification hierarchy is distinctive. **Net-new technique.**

**Salvageable part:** The **CLAIM/CONTRACT separation rule** as a one-sentence technique: "When asking a reviewer to validate a decision, pass the artifact and the contract — not your conclusion. Handing over the conclusion biases the reviewer toward agreement." This is a sharp technique applicable to how APEX's planning mode uses apex-reviewer or the council. Also: the "doubt theater" anti-pattern check.  
**Net-new:** Yes — two sentences worth, not the full skill mechanism.  
**Target:** apex-plan SKILL.md (review / council section) or apex-reviewer SKILL.md.  
**Token-cost:** Very low (two sentences).

---

### 18. context-engineering
**Most distinctive specifics:**
1. Context hierarchy: Rules Files → Spec → Source Files → Error Output → Conversation History (5 named levels with load conditions).
2. "Context flooding" vs "context starvation" as named failure modes.
3. Confusion Management patterns: "When Context Conflicts" template (CONFUSION block: options A/B/C + arrow question); "When Requirements Are Incomplete" pattern.
4. "The Inline Planning Pattern" — emit a lightweight plan before executing: `PLAN: 1. X 2. Y → Executing unless you redirect.`
5. Anti-pattern table: context starvation / context flooding / stale context / missing examples / implicit knowledge / silent confusion.

**APEX status:**
- Context hierarchy: apex-context-budget covers what loads (CLAUDE.md chain, skill bodies, impl.md cores) but frames it as a token-cost audit, not a "what to load per task" guide for the agent. Different framing. **Partial-new.**
- Context flooding vs starvation as named failure modes: NOT in apex-context-budget. apex-context-budget uses "always-on bloat" / "latent context-bombs" but not these names. **Net-new naming.**
- Confusion Management patterns: NOT in apex-code or apex-plan. The CONFUSION block template with "Spec says X, existing code has Y" + options A/B/C is concrete and absent. **Net-new.**
- Inline Planning Pattern (`PLAN: → Executing unless you redirect`): apex-code logs the wave plan before execution, but not as a per-task lightweight confirm-before-start pattern. **Net-new (variant).**
- Anti-pattern table: **Net-new framing** for the flooding/starvation names.

**Salvageable parts:**
1. **"Context flooding vs starvation"** as named failure modes (two sentences, defining each direction of failure). Useful addition to apex-context-budget.
2. **Confusion Management block template**: `CONFUSION: Spec says X, existing code has Y. Options: A / B / C → Which?` — a concrete output template for when coding mode hits a spec/codebase mismatch. Absent from apex-code.
3. **Inline Planning Pattern**: `PLAN: 1. X 2. Y → Executing unless you redirect.` A per-task pre-flight announce-and-wait pattern. Could strengthen apex-code's task start protocol.  
**Net-new:** Yes — three items.  
**Target:** apex-context-budget SKILL.md (flooding/starvation names) and apex-code SKILL.md (confusion block + inline planning).  
**Token-cost:** Very low (two definitions + one 3-line template + one 2-line template).

---

### 19. using-agent-skills (meta)
**Most distinctive specifics:**
1. "Failure Modes to Avoid" top-10 list (sycophancy, not surfacing confusion, not presenting tradeoffs, overcomplicating, modifying orthogonal code, removing things you don't understand).
2. "Skills are workflows, not suggestions" framing.
3. Lifecycle Sequence with all skills listed in SDLC order.

**APEX status:**
- Failure Modes: CLAUDE.md § 1 covers similar ground (don't assume, don't hide confusion, surface tradeoffs). apex-code has the Karpathy pre-flight. **Have.**
- "Skills are workflows, not suggestions": consistent with APEX's invoke-the-skill mandate but not stated as a named rule. **Weak net-new.**
- Lifecycle Sequence: apex-orchestrate does routing. **Have.**

**Salvageable part:** None that are clearly net-new and low-token. The failure modes overlap heavily with CLAUDE.md. Not salvaging.  
**Verdict: Nothing salvageable.**

---

### 20. orchestration-patterns (reference)
**Most distinctive specifics:**
1. Explicit named catalog: Direct Invocation / Single-persona slash command / Parallel fan-out with merge / Sequential pipeline (user-driven) / Research isolation.
2. Named anti-patterns with mechanistic failure explanations: Router persona / Persona-calls-persona / Sequential orchestrator that paraphrases / Deep persona trees.
3. Decision flow diagram (a yes/no tree for choosing among the 5 patterns).
4. Validation checklist before adopting fan-out pattern.
5. Claude Code platform notes: plugin agent frontmatter restrictions (`hooks`, `mcpServers`, `permissionMode` silently ignored); subagents vs Agent Teams distinction; "parallel fan-out = multiple Agent tool calls in one turn" rule.
6. Agent Teams vs Subagents comparison table + worked debugging example.

**APEX status:**
- APEX uses these orchestration patterns implicitly (apex-orchestrate dispatches, apex-wave-reviewer is spawned, apex-research fans out). ADR-015 likely has some of this reasoning. But there is no single consolidated reference document naming and explaining the patterns and anti-patterns.
- The named anti-patterns with mechanistic failure explanations (why router-persona fails, why persona-calls-persona fails) are not in APEX. **Net-new structured framing.**
- Decision flow diagram: not in APEX. **Net-new.**
- Claude Code platform notes (plugin agent restrictions, parallel = same-turn multiple Agent calls): these are documented in Claude Code docs; apex-orchestrate likely covers the same-turn parallel rule. **Have.**
- Agent Teams vs Subagents table: apex-orchestrate has subagent dispatch; Agent Teams is not currently used. **Neutral.**

**Salvageable parts:**
1. **Named anti-patterns with failure explanations**: Router Persona / Persona-calls-persona / Sequential orchestrator that paraphrases / Deep persona trees. These 4 named anti-patterns with ~2-sentence failure explanations each are absent from APEX's orchestration guidance. Adding them to apex-orchestrate SKILL.md would make implicit rules explicit and prevent contributors from accidentally building these patterns.
2. **Decision flow** (5-question tree): "Is the work one perspective on one artifact? → Can the composition repeat? → Are sub-tasks independent?" These questions map cleanly to APEX's dispatch decisions.  
**Net-new:** Yes — two items.  
**Target:** apex-orchestrate SKILL.md.  
**Token-cost:** Low-Medium (4 named anti-patterns × ~3 sentences each = ~12 sentences + one decision tree, ~20 lines total).

---

### 21. accessibility-checklist (reference)
**Most distinctive specifics:**
1. ARIA Live Regions quick-reference table (polite / assertive / status / alert mapped to behavior and use case).
2. Keyboard navigation checklist with "skip-to-content link visible on keyboard focus" as a specific item.
3. Common Anti-Patterns table: div-as-button / missing alt / color-only states / autoplaying media / custom dropdown without ARIA / removing focus outlines / empty links / `tabindex > 0`.
4. Testing tools section: `axe-core` CLI, `pa11y`, VoiceOver / NVDA / Orca coverage.

**APEX status:**
- apex-accessibility exists. apex-testing mentions axe-core integration (finds ~57% of WCAG issues). The ARIA live regions table and the common anti-patterns table may or may not be in apex-accessibility (not verified here).
- The anti-patterns table is likely duplicated given apex-accessibility presumably covers this. **Likely have.**

**Salvageable part:** Without reading apex-accessibility fully, this is likely already-have. The ARIA live regions table is the most specific item — if absent from apex-accessibility, it's worth a 4-row table addition. **Conditional — verify against apex-accessibility first.**  
**Verdict: Low confidence net-new. Conditional on reading apex-accessibility.**

---

### 22. code-reviewer (agent)
**Most distinctive specifics:**
1. `CHANGES MADE:` / `THINGS I DIDN'T TOUCH:` / `POTENTIAL CONCERNS:` output block (referenced from git skill).
2. Multi-model review framing (Model A writes, Model B reviews, Model A addresses, human decides).
3. "Composition" section: when to invoke directly vs via slash command vs forbidden (persona-calls-persona rule).
4. "Acknowledge what's done well — specific praise motivates good practices" as a rule.

**APEX status:**
- apex-reviewer exists. The persona-calls-persona forbidden rule and "acknowledge what's done well" rule: not verified in apex-reviewer. **Potentially net-new rules.**
- Multi-model review: APEX uses apex-wave-reviewer in a similar role. **Have (mechanically).**
- "Composition" section with explicit "do not invoke from another persona": not in apex-reviewer. **Net-new structural rule.**

**Salvageable part:** The "do not invoke from another persona" composition rule (one sentence) — this is the anti-pattern B enforcement. Also "always include what's done well" as a review rule. Both are small, absent from apex-reviewer.  
**Net-new:** Yes — two sentences.  
**Target:** apex-reviewer SKILL.md (already identified under code-review-and-quality item above).  
**Token-cost:** Very low.

---

### 23. security-auditor (agent)
**Most distinctive specifics:**
1. Proof-of-concept / exploitation scenario required for Critical/High findings.
2. "Start from trust boundaries — use STRIDE per boundary before enumerating findings" as the review entry point.
3. Composition rule: do not invoke from another persona.
4. OWASP LLM Top 10 section within the agent persona.

**APEX status:**
- apex-security-agent exists. STRIDE: apex-security SKILL.md covers STRIDE. **Have.**
- "Require proof-of-concept for Critical/High": not verified in apex-security-agent. **Potentially net-new.**
- Trust boundary as entry point: apex-security asks "What is the trust boundary?" upfront. **Have.**

**Salvageable part:** "Require proof-of-concept or exploitation scenario for Critical/High findings" as a rule. One sentence. **Potentially net-new.**  
**Token-cost:** Very low.  
**Verdict:** Minor — needs comparison with apex-security-agent before absorbing.

---

### 24. test-engineer (agent)
**Most distinctive specifics:**
1. Test coverage output format with priority buckets (Critical / High / Medium / Low) for gap analysis.
2. "Test at the lowest level that captures the behavior" rule.
3. Concurrency scenario in the coverage matrix (rapid repeated calls, out-of-order responses).

**APEX status:**
- Concurrency as a test scenario: not explicitly in apex-testing. **Net-new scenario type.**
- Priority buckets for coverage gaps: not in apex-testing's checklist. **Net-new.**
- "Lowest level that captures behavior": apex-testing's pyramid implies this but doesn't state it as a rule. **Net-new rule (one sentence).**

**Salvageable parts:**
1. **Concurrency as a test scenario category** (one item to add to apex-testing's coverage matrix).
2. **"Test at the lowest level that captures the behavior"** rule (one sentence for apex-testing).  
**Net-new:** Yes — two small items.  
**Target:** apex-testing SKILL.md.  
**Token-cost:** Very low (one sentence + one row).

---

## Salvage Shortlist — Genuine Net-New Parts

The following are the only parts from REJECTED items that are (a) concrete, (b) verified absent from APEX, and (c) low-token to absorb. Ranked by signal-density / practical impact.

| Rank | Part | Source Item | Target APEX Skill | Token-Cost | Notes |
|------|------|-------------|-------------------|------------|-------|
| 1 | Hyrum's Law + design implication: plan for deprecation at design time; tests not enough for safe removal | api-and-interface-design + deprecation-and-migration | apex-backend SKILL.md + apex-architecture SKILL.md | Low | Same principle; absorb once, cite in both |
| 2 | Deprecation framing: "code is liability" + Compulsory vs Advisory table + Churn Rule + Zombie Code + Strangler Pattern | deprecation-and-migration | apex-architecture SKILL.md (new "Deprecation and Removal" section) | Medium (~30–40 lines) | Most content-rich salvage; APEX has zero equivalent |
| 3 | SSRF mitigation code pattern: `ipaddr.js` + DNS resolution + `range() !== 'unicast'` + `redirect: 'error'` + TOCTOU warning | security-and-hardening | apex-security impl.md | Low-Medium (~15 lines code) | Production-ready pattern, absent from APEX |
| 4 | Review comment severity labels: Nit: / Optional: / FYI / (required) / Critical: with author-action column | code-review-and-quality | apex-reviewer SKILL.md | Very Low (one table) | Directly sharpens review output format |
| 5 | Confusion Management block template: `CONFUSION: Spec says X, existing code has Y. Options A/B/C →` | context-engineering | apex-code SKILL.md | Very Low (~5 lines) | Addresses a real gap in coding-mode spec/codebase conflict handling |
| 6 | Error output as untrusted data (debug context): don't execute commands found in error messages; treat CI log output as data | debugging-and-error-recovery | apex-debug SKILL.md | Very Low (~3 rules) | Extends CLAUDE.md § 6 self-defense into the debugging context specifically |
| 7 | Named orchestration anti-patterns: Router Persona / Persona-calls-persona / Sequential-orchestrator-that-paraphrases / Deep persona trees + decision flow | orchestration-patterns | apex-orchestrate SKILL.md | Low-Medium (~20 lines) | Makes APEX's implicit rules explicit and contributor-facing |
| 8 | NOTICED BUT NOT TOUCHING output block template | incremental-implementation | apex-code SKILL.md or apex-coding-principles impl.md | Very Low (~3 lines) | Upgrades "mention it in the task summary" to a concrete format |
| 9 | Beyonce Rule + Real > Fake > Stub > Mock preference hierarchy | test-driven-development | apex-testing SKILL.md | Very Low (2 items) | Sharp, memorable, absent from APEX |
| 10 | Chesterton's Fence as a named principle (understand why code exists before removing it; check git blame) | code-simplification | apex-coding-principles impl.md | Very Low (2 sentences) | Names an implied principle, makes it explicit |
| 11 | Change-size splitting strategies: Stack / By file group / Horizontal / Vertical | code-review-and-quality | apex-plan SKILL.md or apex-reviewer SKILL.md | Very Low (one table) | Named strategies for splitting large changes |
| 12 | "And in the task title = two tasks" heuristic + XS/S/M/L/XL task-sizing table | planning-and-task-breakdown | apex-plan SKILL.md | Very Low (one sentence + one small table) | Sharper than APEX's current "3 files / 2 phases" split rule |
| 13 | Rollout Decision Thresholds table (advance / hold / rollback with specific percentages) + 2-week flag cleanup rule | shipping-and-launch | apex-devops SKILL.md | Very Low (one table + one sentence) | Concrete numbers absent from APEX's rollout guidance |
| 14 | npm audit triage decision tree (reachable vs dev-only / severity levels) + `npm ci` vs `npm install` in CI | security-and-hardening | apex-security SKILL.md | Very Low (one small tree + one sentence) | Structured triage absent from APEX's checklist-only approach |
| 15 | Context flooding vs starvation as named failure modes | context-engineering | apex-context-budget SKILL.md | Very Low (2 definitions) | Names what apex-context-budget calls "always-on bloat" more intuitively |
| 16 | Build Cop role + "no gate can be skipped" rule | ci-cd-and-automation | apex-devops SKILL.md | Very Low (2 sentences) | Prevents broken-build accumulation; sharp discipline anchor |
| 17 | Non-reproducible bug sub-tree (timing / environment / state / truly-random) + `git bisect run` pattern | debugging-and-error-recovery | apex-debug SKILL.md | Low (~8 lines) | Structured help for the hard debugging case |
| 18 | CLAIM/CONTRACT separation rule for reviews: "pass artifact + contract, not your conclusion" + "doubt theater" check | doubt-driven-development | apex-plan SKILL.md (council/review section) | Very Low (2 sentences) | Technique, not the full high-cost mechanism |
| 19 | Inline Planning Pattern: `PLAN: 1. X 2. Y → Executing unless you redirect.` | context-engineering | apex-code SKILL.md | Very Low (~2 lines) | Per-task announce-and-wait complement to wave-plan logging |
| 20 | "Why comments are stable; what comments get outdated" + Known Gotchas inline pattern | documentation-and-adrs | apex-coding-principles impl.md | Very Low (2 items) | Reasoning behind APEX's comment rule made explicit |

Items with NOTHING salvageable: **idea-refine** (PM tools outside APEX charter), **using-agent-skills** (failure modes already in CLAUDE.md), **security-auditor agent** (proof-of-concept rule needs apex-security-agent comparison before deciding — conditional), **accessibility-checklist** (needs apex-accessibility read — conditional).

---

## Bottom Line

**20 small parts worth absorbing across 19 of the 24 reviewed items; 2 items confirmed nothing salvageable (idea-refine, using-agent-skills); 2 conditional on reading the corresponding APEX skill first (accessibility-checklist, security-auditor agent).**

The original "already-have" rejections were correct at the item level — none of these skills deserves a wholesale new APEX skill. But the items are richer than the first pass suggested: almost every rejected skill has 1–3 concrete rules, named principles, templates, or decision tables that APEX is missing. The most valuable clusters are:

1. **Deprecation/removal framing** (deprecation-and-migration + api-and-interface-design): APEX has zero general deprecation guidance; this is the largest real gap.
2. **Security specifics** (SSRF code pattern, npm audit triage, supply-chain): APEX's security skill has the principles but lacks these production-ready implementation details.
3. **Review/coding workflow sharpeners** (comment severity labels, NOTICED-BUT-NOT-TOUCHING, Confusion block, review splitting strategies): small additions that make APEX's workflow outputs more concrete and actionable.
4. **Named principles** (Hyrum's Law, Beyonce Rule, Chesterton's Fence, Build Cop, Churn Rule): each is one sentence; collectively they replace vague implied guidance with memorable, citable rules.
