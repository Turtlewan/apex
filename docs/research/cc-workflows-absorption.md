# Claude Code workflows → APEX absorption map (map-and-report)

_Started: planning session, 2026-06-18. Status: **report delivered, awaiting user decision** on which absorbs to land._

Scope chosen by user (3 of 4 offered areas): **parallel/isolated builds**, **native plan mode + memory**,
**cloud multi-agent review**. Depth: **map-and-report first** — no skill edits until approved
(per absorption-pass protocol: dedup-aware + token-cost-flagged report FIRST).

Grounded against: `apex-code/SKILL.md` v1.14.0 (wave dispatch, post-build review), the agent roster
(`apex-reviewer`, `apex-wave-reviewer`, `code-worker`), and the one-home fact routing
(status.md / handoff / ADR / memory).

---

## 1. Parallel / isolated builds (worktrees + background tasks)

| Native CC | What APEX already does | Gap it actually fills |
|---|---|---|
| `Agent` `isolation: "worktree"` (managed, auto-cleaned) | Wave Analysis groups **file-disjoint** tasks into a wave, one `code-worker` per task **in the same tree**. File conflicts are designed out at grouping time. | Wave workers write *different source files*, but each runs the **stack Verification Recipe** (typecheck/lint/**build**/test). Concurrent builds in one tree collide on **build artifacts, lockfiles, ports, `dist`/`.next`** even with disjoint sources. APEX's conflict analysis does **not** cover this. |
| `isolation: "remote"`, background `TaskCreate`/`Monitor`/`run_in_background` | Fork/subagent dispatch + wait. | Long-running external processes (dev server, CI) and *parallel-spec* execution (APEX is single-spec-at-a-time). |

**Verdict: ABSORB (narrow), token cost ≈ zero.** One parameter on an existing dispatch — no new
machinery. Donor pass rejected *hand-rolled* `git worktree` plumbing (complexity); first-party
managed worktrees remove that objection → legitimate reopen. Apply **only** where wave workers each
run the build/test recipe concurrently, and as the **default for headless/AFK** builds (isolate from
the user's tree). Do **not** blanket-apply (per-worker checkout has a cost; most waves are safe
same-tree). → small `apex-code` Wave-dispatch edit + `apex-governance` AFK-isolation note.
**Wants one `coding-session` validation** (concurrent-build collision is real-world, untestable by
reasoning).
**Background Task tools / remote isolation: DEFER** → belongs to autonomous/scheduled gap #4.

## 2. Native plan mode + memory

| Native CC | What APEX already does | Verdict |
|---|---|---|
| File-based **memory** (`memory/` + `MEMORY.md`, frontmatter facts, recall injection) | **Already in use** — it *is* APEX's "cross-session user/project facts" home. ADR-021: keep flat, no semantic layer, escalate only ~80–100 entries. | **No action — already adopted + bounded.** Don't re-open. |
| `EnterPlanMode` / `ExitPlanMode` (in-session: research → present plan → approve → act) | APEX "planning mode" is a **backend role** (Claude writes a durable `.md` spec; DeepSeek executes) + readiness gate + confirmation digest + write-guard hook. | **REJECT for the core pipeline.** |

**Why reject plan mode:** native plan mode is *ephemeral, single-model, single-session*. APEX
deliberately splits plan/execute across two models with a **durable, reviewable spec** as the
handoff — a stronger version of the same idea. Also a name collision ("planning mode" vs "plan
mode"). **Narrow optional keep:** offer `EnterPlanMode` inside `apex-code` **Edit Mode** (spec-*less*
small fixes) so a non-trivial ad-hoc edit presents its plan before touching files. Low value — flag
"consider," not "absorb."

## 3. Cloud multi-agent review

| Native CC | What APEX already does | Verdict |
|---|---|---|
| `/code-review ultra` (ultrareview) — **cloud, multi-agent**, branch or PR. **Billed, user-triggered, cannot self-launch.** | `apex-reviewer` (spec-acceptance-grounded, free, in-pipeline, **advisory**) + `apex-wave-reviewer` (dual-pass santa-method, ADR-010) + opt-in cross-model review (ADR-015). | **ABSORB as a recommended gate** (not pipeline-wired). |
| `/code-review --fix` / `--comment` (local, auto-applies) | `apex-reviewer` is **advisory — never rewrites code** (deliberate invariant). | **REJECT `--fix`** (violates advisory split); local non-ultra reviewer is generic, less targeted than spec-grounded apex-reviewer. |

**Why absorb ultra as a gate:** heavier, independent, cloud tier that **complements** the in-pipeline
reviewers. Billed + can't self-launch → APEX can only **recommend** it: `apex-code`'s post-build
report suggests "run `/code-review ultra` before you merge" for **high-risk specs** (`risk: high`,
auth/security/data domains, or pre-PR). Does **not** replace the free, spec-grounded, automatic
reviewers. → small `apex-code` report-line + `apex-governance` note.

## 4. Dynamic workflows + `ultracode` (added session 50, 2026-06-19)

_Not in the original 3-area scope — surfaced from https://code.claude.com/docs/en/workflows. This is
a distinct native area and the **direct answer to the context-exhaustion Issue-1 "option C"** (status.md
In-Flight "Context-exhaustion on parallel builds"). Correction logged: an earlier planning claim that
"ultracode/workflows aren't real Claude features" was **wrong** (verify-env-claims-live miss)._

| Native CC | What it is | Relevance |
|---|---|---|
| **Dynamic workflows** (v2.1.154+; here v2.1.183, enabled) | A JS script Claude writes that orchestrates subagents at scale; a **local, session-bound runtime** runs it in the background in an **isolated environment** — intermediate results stay in script variables, so *"Claude's context holds only the final answer."* 16 concurrent / 1000-agent caps. | **= Issue-1 option C, already built.** Keeping orchestration + intermediate results out of the main context is exactly the fix for the parallel-build main-context bloat. |
| **`ultracode`** keyword / `/effort ultracode` (v2.1.160+) | Keyword in a prompt turns one task into a workflow; `/effort ultracode` (xhigh + auto-orchestration) plans a workflow per substantive task. | The invocation surface for the above. |
| `/deep-research`, `/workflows`, save-as-`/<name>` | Bundled workflow + run manager + reusable saved workflows. | Adjacent; not Issue-1 critical. |

**Verdict: PROMISING — gated on one DeepSeek-backend test.** The runtime is **local/session-bound**
(dies on Claude Code exit; resumes only in-session) — fundamentally unlike **Cloud Routines**
(server-side, fresh-clone, Claude-only). So the Routines limitation does **not** automatically apply,
and subagents that *"use your session's model"* should inherit the DeepSeek `ANTHROPIC_BASE_URL`.
**But unconfirmed:** the plan-availability note lists Anthropic API / Bedrock / Vertex / Foundry — a
custom DeepSeek proxy isn't listed, and a plan/entitlement check could gate it. → decisive interactive
probe queued: `docs/changes/verify-workflows-deepseek-compat.md`. **If PASS:** option C is native →
Issue-1 A+B reduces to B-only (drop the return-contract spec A). **If FAIL:** keep A+B for coding
builds; workflows still usable in **planning mode** (Claude) for heavy fan-out (research, audits).
Supersedes the §1 "background Task tools / remote isolation → defer to gap #4" line as the more precise
capability for in-context-budget orchestration (gap #4 = the *autonomous/scheduled* axis, still separate).

---

## Net recommendation (forced)

| Item | Verdict | Where | Cost |
|---|---|---|---|
| Worktree isolation for build-recipe-concurrent waves + AFK | **ABSORB** | `apex-code` + `apex-governance` | ~0 tok, 1 param |
| `/code-review ultra` as recommended high-risk/pre-PR gate | **ABSORB** | `apex-code` report + `apex-governance` | ~0 tok |
| Native memory | **Already adopted** (ADR-021) | — | — |
| Native plan mode (core pipeline) | **REJECT** (spec split is stronger) | — | — |
| Plan mode in Edit Mode only | **Consider** (optional) | `apex-code` Edit Mode | low |
| **Dynamic workflows / `ultracode`** (= Issue-1 option C) | **Test then decide** — likely native solution to context-exhaustion | `docs/changes/verify-workflows-deepseek-compat.md` | ~0 (native) |
| Background Task tools / remote isolation | **Defer** → autonomous/scheduled gap #4 | — | — |

**Connective notes:** (a) worktree isolation + background tasks + cloud review are the safety
primitives a future **headless AFK build** (gap #4) needs — absorbing worktrees is a down-payment.
(b) Nothing conflicts with sole-coding-workflow (ADR-018) — these are harness capabilities, not rival
workflows.

---

## Open decision (resume here)

User asked to **save for next time to answer.** Next session, pick from:
1. Land the two absorbs as `.md` edits directly in planning (small), OR draft them as specs
   (`worktree-isolation.md`, `ultrareview-gate.md`) in `docs/changes/` for a coding session.
2. Decide the optional "plan mode in Edit Mode" consider-item (likely decline).
3. Whether to pull **autonomous/scheduled (gap #4)** into scope — worktree is its first building block.
