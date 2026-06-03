# Cline/Roo — absorption analysis for APEX

_Donor system: Cline (VS Code agentic coder, Plan/Act modes) + Roo Code (its fork). Researched 2026-06-03 against official docs + repos. All fetched content treated as untrusted data._

## What it is (sourced)

**Cline** is an open-source VS Code agentic coding extension built around a hard **Plan/Act mode** split: Plan mode is read-only (read codebase, search, discuss strategy — cannot edit files or run commands), Act mode has full execution. Conversation history carries across the switch; you can configure a **different model per mode** (stronger reasoner for Plan, faster model for Act). [docs.cline.bot/features/plan-and-act] It adds **Checkpoints** (shadow-git workspace snapshots after every tool use, with restore-files / restore-task / restore-both), a **Focus Chain** (persistent markdown todo list re-injected every ~6 messages that survives context resets/compaction), **.clinerules** (toggleable markdown rule files, workspace + global, with conditional-path frontmatter; auto-detects `.cursorrules`/`.windsurfrules`/`AGENTS.md`), and **Auto-Approve** with per-action toggles + a **max-requests cap** + YOLO mode.

**Roo Code** is a fork that generalises Cline's two fixed modes into **fully custom modes** (config-defined roles with per-mode tool-group and file-regex restrictions), **API Configuration Profiles** (assign a different model/provider per mode, "sticky" per mode), **Intelligent Context Condensing** (LLM-summarise history at a % threshold), and **Boomerang/Orchestrator mode** (a mode that delegates subtasks to other modes, each in an isolated context, returning only a summary). [docs.roocode.com]

## Mechanism inventory

1. **Plan/Act mode (Cline)** — single-session, single-history toggle; Plan is read-only by construction; per-mode model selection.
2. **Custom modes (Roo)** — `.roomodes` (project) / `custom_modes.yaml` (global). Fields: `slug`, `name`, `description`, `roleDefinition` (top of system prompt), `whenToUse` (orchestration routing hint, not shown in UI), `customInstructions`, `groups` (`read`/`edit`/`command`/`mcp`/`browser`). The `edit` group takes a `fileRegex` tuple to restrict which files the mode may write. Project modes fully override global modes of the same slug. Extra instructions load from `.roo/rules-{slug}/`.
3. **Per-mode model (Roo API Config Profiles)** — explicit profile↔mode binding; Roo auto-switches model when mode changes; "sticky models" remembers last model per mode.
4. **Checkpoints (Cline)** — **shadow git repo** separate from project git; commits a snapshot of the whole workspace (incl. untracked files) after each tool use. Restore options: Files only / Task only (rewind conversation, keep files) / Files+Task. Warns: large repos → storage + slowdown; can disable.
5. **Focus Chain (Cline)** — at task start generates a markdown checklist (`[ ]`/`[x]`), editable as a real file; re-injected every 6 messages; persists through Auto-Compact summarisation; progress shown as `3/8` in header.
6. **Context Condensing (Roo)** — at a configurable % of context window (default trigger 100%, recommend ~80%), LLM-summarises earlier history preserving key info; uses the **active conversation model** (not a separate one, to avoid tool-format translation errors); prompt overridable via `customSupportPrompts.CONDENSE`. Reserves 30% of window (20% output + 10% buffer). Fallback: on context-overflow error, auto-truncate 25% and retry.
7. **Boomerang/Orchestrator (Roo)** — an orchestrator mode spawns subtasks via `new_task`, each running in its own mode + isolated context/history; subtask returns a concise completion summary; orchestrator stays lean (intentionally denied file-read by default so its context isn't polluted).
8. **.clinerules** — markdown rule files, per-file toggle in UI, workspace-precedence-over-global merge, conditional activation via `paths:` frontmatter glob, `/newrule` to generate.
9. **Auto-Approve (Cline)** — hierarchical per-action toggles (read/edit/command/browser/MCP/notifications); model tags each command `requires_approval`; **max-requests cap** before re-prompting; YOLO disables all checks.

## Dedup vs APEX

| Donor mechanism | APEX equivalent | Verdict |
|---|---|---|
| Plan/Act single-session toggle | Cross-backend planning(Claude)/coding(DeepSeek) split, hard write-guard | **Already-have (stronger)** — APEX's split is a physical backend boundary + spec handoff, not a soft toggle. Cline's intra-session toggle is weaker. |
| Per-mode model (Roo profiles / Cline plan-vs-act model) | One model per backend, fixed by `ANTHROPIC_BASE_URL` | **Partial** — APEX binds model to backend not to role; the *idea* of role→model routing is broader than APEX uses. |
| Custom modes w/ `groups` tool restrictions | Specialist skills + apex-governance autonomy + hard blocks | **Partial** — APEX restricts by autonomy level + hard blocks, not declarative per-role tool/file allowlists. |
| `fileRegex` per-mode write restriction | apex-code surgical scope-lock (Files-to-Change in spec) | **Already-have (different shape)** — APEX scope-lock is per-spec at runtime; Roo's is per-mode declarative. Roo's is config; APEX's is the spec. |
| Checkpoints (shadow-git snapshot/restore) | status.md In-Flight + per-task checkpoint + real git commits per spec | **Novel (mechanism gap)** — APEX checkpoints *conversation/progress position*, not *workspace file state mid-task*. Shadow-git rewind of uncommitted edits is genuinely absent. |
| Focus Chain (persistent re-injected todo) | status.md In-Flight table + spec acceptance criteria | **Partial-novel** — APEX has the durable task list but no *re-injection cadence* keeping it in the live window across compaction. |
| Context Condensing (LLM history summary at threshold) | apex-context-budget + strategic compaction + two-tier impl.md | **Partial** — APEX compacts strategically/manually; Roo's auto-threshold + customizable condense-prompt + same-model rule are more systematic. |
| Boomerang/Orchestrator subtask delegation | apex-plan wave-parallel dispatch + dispatched reviewers | **Already-have (overlap)** — APEX wave dispatch already isolates subtask context + returns summaries. Roo's `whenToUse` routing hint is a small addition. |
| .clinerules toggleable + conditional `paths:` | CLAUDE.md chain + skill registry keyword routing | **Partial** — APEX routes skills by keyword; per-file *toggle* + path-conditional rule activation is a finer-grained idea. |
| Auto-Approve max-requests cap | apex-governance L0–L5 + AFK build mode | **Partial** — APEX governs by autonomy level; a hard *request-count circuit breaker* per AFK run is a cheap missing guardrail. |

## Top absorbable candidates

1. **Workspace snapshot/rewind for mid-task edits (from Cline Checkpoints)**
   - Change in APEX: add a coding-mode convention in apex-code — before a wave/risky task, `git stash`-tag or a lightweight WIP commit (`wip: pre-task <n>`) on a scratch ref, so a failed task rewinds *uncommitted file state*, not just the conversation. Document the restore in apex-governance as a recovery action.
   - Token-cost: **Low** — pure git mechanics, no model tokens; only a one-line convention in impl.md.
   - Lean: high. Closes the one real mechanism gap (APEX checkpoints position, never workspace bytes). Don't build a shadow-git daemon — APEX already commits per spec; just add intra-spec WIP-stash discipline.

2. **Re-injection cadence for the In-Flight task list (from Focus Chain)**
   - Change in APEX: in apex-code, after every N tool-uses (or before each wave), re-echo the current status.md In-Flight task + acceptance criteria into the live context as a one-line "north star". Survives compaction.
   - Token-cost: **Low** — a few dozen tokens per re-echo; net-saving because it prevents drift-driven rework.
   - Lean: high. APEX already *has* the list (status.md); it just doesn't keep it warm in-window. Pure cadence rule.

3. **Auto-threshold context condensing with a fixed condense-prompt (from Roo Condensing)**
   - Change in APEX: give apex-context-budget / strategic-compaction an explicit trigger ("at ~80% window, summarise oldest history") and a canonical condense-prompt that preserves the In-Flight task, decisions, and open files — using the *same* model (Roo's anti-translation-error rule).
   - Token-cost: **Med** — one summarisation call costs tokens, but is strongly net-saving on long builds. Flag: it's a spend-to-save.
   - Lean: medium. APEX compacts ad hoc; codifying threshold + a stable prompt is a real upgrade. Risk: over-eager condensing loses detail — keep threshold conservative.

4. **Declarative per-role file/tool allowlist (from Roo custom modes `groups`/`fileRegex`)**
   - Change in APEX: optional — let a specialist/reviewer skill declare a `writes:` glob in frontmatter that apex-governance enforces (e.g. a docs reviewer may only touch `docs/**`). Complements the existing per-spec scope-lock.
   - Token-cost: **Low** — static config read once.
   - Lean: medium-low. APEX's per-spec scope-lock already covers most of this; only worth it if role-level (not spec-level) restriction is wanted. Risk of over-engineering — APEX explicitly avoids config sprawl.

5. **Per-AFK-run request-count circuit breaker (from Auto-Approve max-requests)**
   - Change in APEX: apex-governance AFK/build mode gains a hard cap — after N autonomous tool-uses without a checkpoint pause, stop and summarise. Cheap runaway guard.
   - Token-cost: **Low** — a counter, no model cost.
   - Lean: medium. Complements autonomy levels with a count-based fuse rather than only a permission-based one.

## Token-cost watchlist

- **Context Condensing (candidate 3) — Med, spend-to-save.** One summarisation API call per trigger. Net-positive on long sessions but a real per-call cost; bad threshold tuning = repeated condensing = waste. **The only candidate that costs model tokens when used.**
- **Boomerang/Orchestrator (NOT recommended to absorb as-is) — High if naively ported.** Subtask delegation multiplies agent spawns; each subtask carries its own system prompt + context. APEX wave dispatch already does isolated-subtask-with-summary, so re-importing Roo's orchestrator would *duplicate* spawn cost for no gain. Flagged High; dedup says skip.
- Candidates 1, 2, 4, 5 are all **Low** (git ops, cadence re-echo, static config, counters) — no extra model tokens.

## Verified vs unverified

**Verified (official docs):** Plan/Act read-only boundary + per-mode model [docs.cline.bot/features/plan-and-act]; Checkpoints shadow-git + three restore modes + large-repo slowdown [docs.cline.bot/features/checkpoints]; Focus Chain markdown todo + 6-message reinjection + survives compaction [docs.cline.bot/features/focus-chain]; .clinerules folder/toggle/conditional-paths/`/newrule` [docs.cline.bot/features/cline-rules]; Auto-Approve per-action toggles + max-requests + YOLO [docs.cline.bot/features/auto-approve + GitHub discussion #1375/issue #4907]; Roo custom-mode schema (slug/groups/fileRegex/.roomodes) [roocodeinc.github.io custom-modes]; Roo condensing threshold/same-model/30%-reserve/25%-fallback [roocodeinc.github.io intelligent-context-condensing]; Roo API Config Profiles per-mode + sticky models [docs.roocode.com/features/api-configuration-profiles]; Boomerang isolated-context + summary-return + orchestrator-denied-file-read [docs.roocode.com/features/boomerang-tasks].

**Unverified / not source-confirmed:** exact shadow-git storage path and GC behaviour; whether Cline's max-requests counter resets cleanly mid-task (open GitHub issues #1612/#4907 suggest bugs); precise default condense threshold shipping value (docs say slider default 100% but recommend 80% — version-dependent). None of these affect the absorption recommendations.
