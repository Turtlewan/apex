## Cluster verdict

Most of C1 is a Claude-host control plane and should remain invisible to Terra; Codex needs only project conventions, the task-specific delta, non-native domain constraints, and exact verification commands. The strongest existing Codex artifact is the generated `AGENTS.md`, but absolute paths, frozen-plan obedience, generic NEVER/ALWAYS rules, and conflicting git policies would reduce Terra’s effectiveness. The proposed Sol plan-check role is not yet represented: current review is domain-focused and Claude-agent-specific rather than an independent feasibility and completeness challenge. None of these eight directories currently contains an `impl.md`, and `apex-code/references/model-routing.md` is absent; effort routing also omits the available `max` level.

## Per-skill findings

### apex-orchestrate

- [CLAUDE-IDIOM] Keep routing, `APEX_MODE`, Claude Agent/Skill dispatch, `/compact`, Cursor behavior, pause detection, and context-window management out of Codex artifacts. They are Sonnet-host mechanics (`Context discipline`, `Confirm operating mode`, `Load domain specialists`; also `CLAUDE.md` §§0, 5).

- [RESHAPE] Reuse the bounded child-return idea as a Terra output schema, not prose: `status`, `files_changed`, `checks[{command,result}]`, `deviations`, and `blocker` (`Dispatch return contract`). The current coder path captures an unconstrained final message.

- [MISSING] Add an explicit route after Opus drafts and before readiness: dispatch Sol with the original request, relevant repository evidence, and proposed spec; require criterion/file/dependency/verification findings. Do not include Opus self-review notes or domain-review verdicts, preserving independence.

### apex-plan

- [KEEP] Terra genuinely benefits from exact repo-relative files per task, concrete mechanisms, assumptions with failure impact, observable criteria, and runnable commands (`Writing the spec`, `Readiness gate`). These belong in the dispatch pack, not as references to planning ceremony.

- [RESHAPE] Replace “no why inline” with a short `Intent / invariants / non-goals` block. Terra does not need an ADR essay, but stripping all rationale makes it harder to resolve codebase/spec mismatches correctly; Sol also needs intent to detect a locally executable but conceptually wrong plan (`Writing the spec`; `spec-template.md` lines 23–32).

- [CUT] Remove the fixed “>3 files or >2 phases” split, “one concern layer per task,” and “execute wave plan verbatim with zero inference” rules (`Deep Details mode`, `Readiness gate`, `Wave plan`). Prefer cohesive, independently verifiable tasks; require Terra/Sonnet to revalidate file disjointness and dependencies against the checked-out tree before concurrency.

- [MISSING] Make Sol review risk-based rather than mode-based: Light or Bug Fix work touching auth, migrations, concurrency, public APIs, or security still deserves review. Extend `coder_effort` to `max` and define a task-level rubric rather than pinning an entire mixed-complexity spec (`Model-routing build planning`).

### apex-code

- [CUT] Do not tell Terra that the planner is stronger or require it to implement a known inferior approach (`Karpathy Pre-Flight` §b). Permit a simpler in-scope implementation when it preserves stated invariants and criteria; require reporting the deviation. Also cut generic advice Terra already follows: read errors, prefer existing patterns, avoid shotgun changes, and verify before completion.

- [KEEP] Preserve the behavior-changing contract: authorized repo-relative files, explicit non-goals, exact checks, autonomous retry, no test weakening, and a precise blocker threshold (`Model-routing dispatch`, `Verification`, `Forks`). Replace “ambiguous spec” with examples of blocking ambiguity versus safe local choice.

- [RESHAPE] Run targeted checks after each task and the full repository recipe after integration/spec completion. Repeating typecheck, lint, all tests, and build after every small task wastes time without materially improving Terra (`Run it per task`; `parallel-codex.md`, `Integrate`).

- [CLAUDE-IDIOM] Agent/Workflow dispatch, `dontAsk`, progress pulses, worktree creation, fallback, handoff, and review fan-out belong to Sonnet. Replace path-substring domain detection with spec domain tags plus changed-code inspection; remove the unavailable `/code-review ultra` recommendation (`Wave domain review`, `Post-build steps`). Add `xhigh→max` to the retry ladder and a schema-constrained coder result.

### apex-governance

- [KEEP] The user-specific safety policy is not native and must remain enforced: protected paths, no default-branch push, no destructive production-data operations, and no secret exposure (`Critical files`, `Hard blocks`). Sonnet should resolve the effective authorization before dispatch; Terra should receive concrete allowed paths/actions, not an `L2` label.

- [RESHAPE] Resolve internal contradictions before projecting rules to Codex: branch deletion is forbidden but required for worktree teardown; `docs/audit/` is immutable but L4+ must write there; cross-model findings are called advisory yet agreement must be resolved before shipping (`Hard blocks`, `Audit log`, `Cross-model review`; `parallel-codex.md`, `Teardown`).

- [CUT] Autonomy-level explanations, fallback-pool accounting, Claude permission gates, retired DeepSeek/UI history, and Ultra review belong neither in `AGENTS.md` nor Terra prompts (`Autonomy levels`, `Coding model routing`, retired escalation, `Ultra review gate`).

- [KEEP] Preserve evaluator independence. In the proposed split, Opus reviews Terra-built code; Sol may review Opus fallback code. Sol reviewing Terra code is same-family review and must not be represented as cross-family (`Cross-model review`, `Evaluator independence`).

### apex-skill-author

- [KEEP] Baseline ablation, failure-derived content, exact verification recipes, compact gotchas, defaults, and on-demand references are the right Codex authoring principles (`Iron Law`, `Author to the executor’s capability floor`, `impl.md loading tiers`, `Content rules`).

- [RESHAPE] Replace “bare subagent” testing with reproducible CLI evaluations for each consumer: Sol plan-review tasks and Terra coding tasks, at named model/effort settings. Compare no-skill versus with-skill correctness, unnecessary edits, verification success, tokens, and latency; retest after model upgrades.

- [CLAUDE-IDIOM] `backend: claude|deepseek`, Claude execution gates, Agent-tool language, and the APEX registry triple-write are not Codex-native metadata (`Frontmatter contract`, `Authoring workflow`, `triple-write`). Codex projections should use native skill metadata and trigger descriptions; generate them from APEX rather than hand-maintaining two divergent copies.

- [CUT] Do not automatically project NEVER/ALWAYS sections. Keep only rules whose baseline shows Terra violates them, plus repository-specific constraints and factual gotchas. Generic clean-code, verification, and reasoning scaffolding adds instruction competition (`Content rules`, `Hard blocks`).

### apex-init

- [KEEP] Continue generating root `AGENTS.md`; it is the best Codex-facing project artifact (`AGENTS.md — Codex build instructions`). Before the first build, fill repo layout, conventions not enforced by tooling, setup commands, targeted checks, and final full verification—do not leave those as indefinite stubs.

- [RESHAPE] Use repo-relative paths throughout, because absolute paths can target the main checkout instead of a task worktree. Reconcile `AGENTS-template.md`’s “never commit” with spec permissions and host commit discipline; for Terra subprocesses, the clean rule should be “never commit or manipulate branches—Sonnet owns integration.”

- [CLAUDE-IDIOM] The bootstrap questionnaire, stack-selection invocation, and status scaffolding stay with Opus/Sonnet. Correct the claim that every agent loads PROJECT/REQUIREMENTS/ROADMAP/status: Terra sees only its prompt, repository, applicable `AGENTS.md`, and explicitly activated native skills (`Persistent artifacts`).

- [RESHAPE] Remove “image-less coder” language from the design brief. Terra has vision, but still benefits from exact tokens, forbidden patterns, reference-image paths, and an explicit visual verification command (`Design-brief stub`; governance’s retired UI escalation).

### apex-handoff

- [CUT] Terra should not write handoffs, mutate status, save research every two tool calls, or create WIP commits (`Writing a handoff`, `Persistent research files`, `Session recovery`). It should return the structured task result; Sonnet alone updates durable session state.

- [KEEP] Retain the one-home-per-fact model and thin decision/blocker/discovery handoff as host policy (`What the handoff is`, `Reading a handoff`). This reduces duplicate context for subsequent Opus planning.

- [RESHAPE] Remove the stale DeepSeek rationale and the assertion that a handoff is the “only” coding-to-planning channel; `status.md`, progress records, git, and structured Terra results are also deliberate channels (`Writing a handoff`, `In-Flight State`).

### apex-refresh

- [KEEP] Retain the stocktake test “does this content add gotchas/defaults/procedures the consumer lacks?” and empirical verification-recipe requirement (`Quality checklist`). Add separate verdicts for Sol-facing and Terra-facing value.

- [RESHAPE] Single-skill refresh currently writes approved content without the failing-baseline workflow required for every edit by `apex-skill-author` (`Single skill refresh`, Steps 4–6 versus `apex-skill-author`, `Iron Law`). Make baseline evaluation mandatory before proposing the rewrite.

- [CLAUDE-IDIOM] Context7, WebFetch, general-purpose subagents, chunking, and approval UI are Opus/Sonnet implementation details (`Full research pass`, `Evaluate`). Do not place them in Codex-native skills.

- [MISSING] Add projection validation: native frontmatter parses, trigger selection works, referenced files exist, dispatch size stays within budget, and no generated rule conflicts with `AGENTS.md`. The metadata template also omits the otherwise-required `description` (`Skill metadata header format`).

## Codex-native recommendations

Create only three Codex-facing layers:

1. `.agents/skills/apex-plan-review/SKILL.md` for Sol: review requirements-to-spec coverage, repository feasibility, missing dependencies, scope excess, unsafe concurrency, and verification adequacy. Return schema-constrained `BLOCK|FLAG|CLEAN` findings with spec-section and repository evidence.

2. Selective stack/domain skills for Terra: exact current API gotchas, repository defaults, forbidden project-specific patterns, setup/verification commands, and short conditionally loaded references. Do not mirror all ~50 APEX skills; project only skills that beat a Terra no-skill baseline.

3. A generated dispatch pack owned by Sonnet:

   - Objective, intent/invariants, and non-goals.
   - Authorized repo-relative files and relevant existing symbols.
   - Exact requested changes and acceptance criteria.
   - Setup state, targeted checks, and final full verification command.
   - Safe-local-choice versus blocker rules.
   - JSON completion contract.

Keep orchestration, governance resolution, parallel worktrees, observability, model fallback, status/handoff updates, init, and refresh in Sonnet’s host layer. Keep detailed product/architecture judgment with Opus, followed by the independent Sol gate. Remove generic coding maxims, historical backend commentary, arbitrary spec-size limits, Ultra references, and duplicated hard-block lists from Codex-facing content.