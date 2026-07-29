# Doctrine contradiction audit — 2026-07-29

Four independent reviewers over the full APEX document surface (post-overhaul): three Claude
partitions (core skills / outer skills+agents+workflow / doctrine+ADR layer) + one Sol cross-family
pass (`sol-findings.json` in this dir, 50 findings, run `fe86b30c`, tree `674fc122fafb`).
Deduped: **~55 unique findings**. Root disease: **ratification sweeps that stop at the first file**
(A1/A2/ADR-038/ADR-045 each left live stale copies), plus schema drift between contracts and their
consumers.

## Decisions — ALL RATIFIED 2026-07-29 (owner approved D2–D8 as batch; D1 via deliberation)
The sweep spec drafts the ADR amendment text for each; ratification is recorded, drafting is not
yet done.

| # | Conflict | Options | Note |
|---|---|---|---|
| D1 | Build-dispatch ownership: ADR-045 (Sonnet orchestrator dispatches) vs parallel-codex.md + retro P1(b) (host launches background subprocesses) | **RESOLVED — deliberation run `0e7d2938`: Sol ACCEPTED (A)** with tightened wording: host mechanics = launching/monitoring subprocesses STRICTLY from the orchestrator's wave plan + returning status/exit codes; task selection, sequencing, routing, verification, retries, close-out exclusively orchestrator-owned. | ADR-045 amendment text ready; needs owner ratification (amends a ratified ADR). |
| D2 | CLAUDE.md PR-merge gate (owner-amended 07-23, allows named-PR merge on live approval) vs apex-governance "git merge permanently forbidden" | Reconcile governance to the owner amendment (carve-out mirroring CLAUDE.md text) | Owner already decided 07-23; governance edit still touches the hard-block list → ratify. |
| D3 | Governance "critical paths always need live attended confirmation; a spec cannot authorize them" vs spec-template "approving this spec approves all listed actions" + governance's own "everything listed is pre-authorized" | Codify: spec Permissions pre-authorize NON-critical actions only; critical paths always live-confirm; AFK parks | Wording decision on ratified governance text. |
| D4 | Governance forbids the agent widening its own permissions vs apex-research pre-authorizing WebFetch domains (ADR-023 flow) | Carve-out: user-approved domain allows during attended planning are not self-widening; background/AFK never edits permissions | Touches hard-block list → ratify. |
| D5 | Governance "any modification to docs/audit/ forbidden" vs L4/L5 requiring appends to docs/audit/ log | Reword: append-only by the run's own audit step is required; editing/deleting existing entries forbidden | Touches hard-block list → ratify. |
| D6 | apex-docs-technical-agent performs host-reserved duties (handoff, status.md, spec archive) vs ADR-045 reserving them for the host | Either AFK carve-out (docs agents act as host's pen, host reviews) or retire those steps to the host | Role-boundary call. |
| D7 | code-worker "never delete anything" vs spec schema `Operation: delete` | Allow spec-authorized deletes for code-workers, or route delete tasks host/codex-side only | Small, but changes a worker contract. |
| D8 | Governance forbids `git branch -d/-D` at every level vs parallel-codex teardown requiring branch deletion (why 20+ worktrees rot; user runs `!` one-liners) | Either a scoped teardown allowance (post-integration, verified-merged branches only) or codify the `!`-one-liner handback as THE mechanism | Pairs with retro P5(c). |

## Mechanical sweep (no decisions; ~45 fixes) — categories

1. **A1 fallback sweep** (Sonnet 5, not Opus): 8 sites from partition A + apex-build-wave.js header
   + agents/apex-reviewer.md + ADR banner lines (ADR-027/028/029/034/036/038/042/045 backlinks) +
   model-routing.md:8-11,57-64,94 self-contradictions + codex-review.md + retro-plan P1 premise note.
2. **A2 cap sweep** (default 2): spec-template:19-21, ADR-028/029 caveat notes, status-template.
3. **coder_model enum** unification `{codex|sonnet}` (+ `opus` = logged deliberate exception):
   spec-template, apex-plan SKILL, model-routing.
4. **Four-role wiring**: apex-orchestrate routing table gains "build → dispatch sonnet
   build-orchestrator" + "plan → dispatch opus spec-author" steps (per D1/D6 outcomes);
   apex-session-context.md gets the no-write-guard vs no-mechanical-edits reconciling clause;
   apex-coder.md relabeled Claude-fallback-only (no Bash by design); L3.md pipeline reworded;
   apex-research "(Opus)" → "(the host)".
5. **Schema drift**: apex-docs-technical-agent inputs/steps vs current handoff template (rewrite to
   four-section contract, drop ADR-006-era status.md recipe read, name overview.md step or delete
   the promise in apex-code:378); apex-docs-product-agent `## Scope` pointer; AGENTS-template +
   apex/AGENTS.md "Exact changes"/"Commands to run" headings → current Tasks/fence schema; AGENTS
   "one spec at a time" vs ADR-029 (align to ADR-029 with the cap); handoff SKILL "status.md+done/"
   vs delete-finished-rows (point at done/ + git log).
6. **Wrapper-mandatory consistency**: codex-observability + parallel-codex raw `codex exec` recipes
   rewritten as wrapper invocations; codex-review "advisory/never blocks" wording reconciled with
   exit-67 routing (verdict blocks commit, host adjudicates — say so).
7. **Verify wording**: owner (coder runs recipe during build; HOST runs the authoritative
   post-build pass) and cadence (per-task in isolated worktrees, integrated-wave pass at
   integration; state both explicitly); impl.md load instruction moved to pre-flight section;
   exit-72 recipe-less recovery path rewritten (host authors recipe attended, then redispatch).
8. **Review-vs-writes race**: post-build flow serializes apex-docs-product-agent AFTER apex-reviewer
   (or pins reviewer to a digest) — apex-code:280-311.
9. **Today's regressions**: dangling `[[memory]]` links in design-workflow.md + apex-research
   SKILL.md (retarget or inline); apex-stack impl.md/ADR-template pointers (point at
   adr-and-status-procedures.md); ADR-036-era "bound stack" references in dispatch-pack /
   context-budget / elaboration.md tail.
10. **Misc**: init "Mode: planning" banner; ADR-037 "Both read status.md" self-contradiction;
    agents-skills-projection self-contradiction + recipe-home row; cheap-mockup/design-lane
    moved-content claims; status-template model-routing pointer (partly fixed today); handoff
    WIP-commit-on-pause gains the approval-gate exception wording (or an AFK carve-out per D6);
    scope-lock vs fork "build in the real place" (state the fork amendment updates the lock);
    governance/orchestrate sources: add ADR-045 where A1/A2 language appears.

## Execution
This audit is repair-scoped for a dedicated sweep spec (apex-plan next session): mechanical
categories 1-10 as parallel-safe tasks; D1-D8 resolved first (D1 deliberation running; D2-D8 to the
owner as a batch). Sources: partition tables live in this session's task outputs; the durable copy
is this file + sol-findings.json.
