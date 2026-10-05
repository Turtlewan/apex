# ADR-046: Doctrine audit resolutions

**Date:** 2026-07-29
**Status:** Accepted
**Related:** [ADR-045](./ADR-045-four-role-split.md), [ADR-023](./ADR-023-pre-authorise-before-dispatch.md), [ADR-028](./ADR-028-parallel-codex-dispatch.md), [ADR-029](./ADR-029-cross-spec-parallel-build.md), [ADR-042](./ADR-042-critical-file-confirmation-and-achievable-cross-family.md)

## Context

Four independent reviewers audited the full APEX document surface and produced approximately 55
deduplicated findings. The root disease was ratification sweeps that stop at the first file, plus
schema drift between contracts and their consumers. The durable audit record is
[`docs/research/doctrine-audit-2026-07-29/README.md`](../../research/doctrine-audit-2026-07-29/README.md)
and [`sol-findings.json`](../../research/doctrine-audit-2026-07-29/sol-findings.json). The Sol pass
was run `fe86b30c` against tree `674fc122fafb`.

## Decision

### D1 — Build-dispatch and verification ownership

**Conflict** — ADR-045 says the Sonnet build orchestrator dispatches coders; `parallel-codex.md` and
retro P1(b) say the host launches background subprocesses.

**Options considered**

- Hold ADR-045's orchestrator-dispatch text and amend the host-launch text in `parallel-codex.md`
  and retro P1(b).
- Hold the host-launch text in `parallel-codex.md` and retro P1(b) and amend ADR-045's
  orchestrator-dispatch text.

The audit catalogued no further alternatives.

**Decided** — host mechanics = launching/monitoring background subprocesses STRICTLY from the orchestrator's wave plan + returning status/exit codes; task selection, sequencing, routing, verification, retries, and close-out are exclusively orchestrator-owned. Resolved by Sol deliberation run `0e7d2938` (ACCEPTED option A, with the above tightening). Amendment text lands in ADR-045.

**[CLOSE-OUT NARROWED (v1 activation), 2026-08-02: in v1 CLOSE-OUT -- reviewer chain, docs
agents, family gate, spec archival -- is HOST-executed per `~/.claude/skills/apex-code/SKILL.md`
§ Post-build and is not in the agent's protocol; the word "close-out" in this clause is
superseded to that extent, and v2 may restore it. See ADR-046 § D1
V1-PARTIAL.]**

The host EXECUTES the recipe as mechanics from the orchestrator's wave plan and returns the raw results; the ORCHESTRATOR owns the pass/fail adjudication and the routing that follows.

The coder never adjudicates its own output (evaluator independence) and the host never adjudicates
either.

**Ratified** — 2026-07-29.

**Consequences** — The host also **executes git operations exactly as directed** — the per-task
worktree commit and the path-scoped integration, both taken from the orchestrator's wave plan, and
the per-spec commit once the user has approved the drafted message. Those are **executions, not
decisions**. The excluded set is unchanged: task selection, sequencing, routing, verify
adjudication, retries, and close-out decisions are the orchestrator's. **[CLOSE-OUT NARROWED (v1 activation), 2026-08-02: in v1 CLOSE-OUT -- reviewer chain, docs
agents, family gate, spec archival -- is HOST-executed per `~/.claude/skills/apex-code/SKILL.md`
§ Post-build and is not in the agent's protocol; the word "close-out" in this clause is
superseded to that extent, and v2 may restore it. See ADR-046 § D1
V1-PARTIAL.]** The draft → show → approve →
commit exchange is host↔user by nature and stays host-side. **Builders still never commit** — the
AGENTS contracts' no-commit rule binds the coder, not the host, and is consistent with this.

Per-task commits onto transient `codex/<spec>-<task-id>` branches inside isolated worktrees are
build mechanics under the orchestrator's plan. Those branches are throwaway and are torn down
post-integration, so they carry no reviewable history. The draft → show → approve → commit gate
governs integration-branch commits — the per-spec, session-end commits — not worktree task-branch
commits.

`~/.claude/CLAUDE.md`'s Git rule ("Commit per-spec when a spec completes", with an unconditional
draft → show → approve gate) needs the same clarification: the gate governs integration-branch
commits, not per-task worktree commits. This spec does not make that edit: the classifier blocks
every host and build write to that file. It is queued as an owner action, applied via the
staged-file `!` one-liner at session close. This remains an open reconciliation.

**Superseded in part — 2026-08-02, see the amendment below:** Until the build-orchestrator agent contract ships (the queued retro P1–P7 spec set), the HOST
performs the scheduling, routing, and adjudication duties as interim executor. This is a recorded
transition state, not doctrine: D1's ownership assignment is the target that the P1–P7 set
implements. Every document that currently instructs the host to analyze dependencies, choose
waves, or route completions describes the interim state and must say so. The Claude-fallback path
is not a competing owner: when `apex-coder` groups waves and spawns workers it does so as a
dispatched executor under this same interim arrangement. The scheduling doctrine is unchanged by
which path executes it.

**Amendment — 2026-08-02: D1 V1-PARTIAL — attended build phase shipped.** The agent contract shipped as `~/.claude/agents/apex-build-orchestrator.md` (digest `0b4ea056`), with its normative shape contract `~/.claude/skills/apex-code/references/orchestrator-protocol-schema.json` (digest `d87a0280`, five `$defs`). The agent owns the **BUILD PHASE of ATTENDED builds only** — task selection, wave sequencing, dispatch parameters, exit-code routing, verify adjudication, retry/escalation/fork, integration order. **CLOSE-OUT** (the reviewer chain, the docs agents, the family gate, spec archival) and **UNATTENDED/AFK builds** remain **HOST-executed**, so D1's interim clause is narrowed, not retired.

Producer-side event emission is **IN v1, not deferred**: the wrapper writes the event file at every BUILD-PHASE terminal and the host passes it through unchanged rather than reconstructing it (`apex-code/SKILL.md` § Wave analysis). What remains for **v2** is the remaining event **KINDS** — review-phase results, the endgate, `agent_result`, and `integration_verify` — which have no producer yet, not emission itself.

The host's build-time role stays mechanics only, adding event **pass-through** (read the emitted file, validate it against the `$def` its `kind` names, forward it unchanged), the deterministic pre-launch structural validation, and build-state persistence — none of which is adjudication. The structural checks the HOST owns are the ones JSON Schema cannot express: cap arithmetic, per-repo wave file-disjointness, `authorized` ⊆ `Files to Change`, executability minimums, task-repo membership in the plan's own `repos` map plus an absolute `verify_contract` path that exists on disk, and the at-most-one-`complete` rule — while branch SHAPE is schema-enforced and is therefore NOT a host check.

A host takeover of orchestrator duties exists only as an attended **D1-EXCEPTION** recorded in the session handoff doc — v1 has no ledger-row carrier for it.

The build-orchestrator **agent contract** (its prompt, its inputs/outputs, its resume/status loop) is
carried by the **queued retro P1–P7 spec set, not by this sweep**. This spec only makes the existing
documents agree on who owns what.

### D2 — Named-PR merge authorization

**Conflict** — `~/.claude/CLAUDE.md` permits a named-PR merge after live owner approval; governance
says `git merge` is permanently forbidden regardless of who asks.

**Options considered**

- Hold the `~/.claude/CLAUDE.md` named-PR approval gate and amend governance's blanket prohibition.
- Hold governance's blanket prohibition and amend the `~/.claude/CLAUDE.md` named-PR approval gate.

The audit catalogued no further alternatives.

**Decided** — governance gets a carve-out mirroring the `~/.claude/CLAUDE.md` 2026-07-23 owner amendment: merging a named PR is allowed only on explicit approval in a genuine live user message this session that names the specific PR(s). The blanket "git merge permanently forbidden" wording is reconciled to it, not deleted. This is DOCTRINE-level authorization, not a mechanical bypass: `~/.claude/hooks/lib/destructive-detect.js` still intercepts `git merge` (denying it or requiring confirmation per its own rules); the carve-out says an approved named-PR merge is permitted, not that the guard will wave it through.

**Ratified** — 2026-07-29.

**Consequences** — The same doctrine/mechanics distinction applies to D8. The hook also intercepts
branch deletion. Amended 2026-10-05 (dispatch-pipeline-fixes): integration is the Engine byte copy
(`Copy-EngineTaskFiles`) or, as the manual attended fallback, the indexed `git apply --index` pipe;
path-scoped branch restore is not an integration form. P5(c) is narrowed to teardown only; until it
ships, a permitted teardown executes via the user's `!` one-liner handback.

### D3 — Spec pre-authorization and critical paths

**Conflict** — Governance says critical paths always require live attended confirmation and cannot
be authorized by a spec; the spec template and governance's general Permissions wording say
approval pre-authorizes everything listed.

**Options considered**

- Hold the critical-path live-confirmation rule and amend the blanket spec pre-authorization text.
- Hold the blanket spec pre-authorization text and amend the critical-path live-confirmation rule.

The audit catalogued no further alternatives.

**Decided** — a spec's `## Permissions` pre-authorizes NON-critical actions only. Critical paths always require live attended confirmation; AFK parks them. D6 is the SOLE named exception to this rule, scoped to exactly three artifacts (see D6). No other unattended critical-path write exists anywhere in APEX.

**Ratified** — 2026-07-29.

**Consequences** — This is the reconciling rule that makes spec pre-authorization and the
critical-file gate compatible. D6 cross-references this rule and exhaustively defines its sole
named exception.

### D4 — Attended WebFetch domain allows

**Conflict** — Governance forbids an agent widening its own permissions; `apex-research`
pre-authorizes WebFetch domains through the ADR-023 flow.

**Options considered**

- Hold governance's no-self-widening rule and amend the `apex-research` WebFetch-domain flow.
- Hold the ADR-023 `apex-research` WebFetch-domain flow and amend governance's no-self-widening
  wording.

The audit catalogued no further alternatives.

**Decided** — user-approved WebFetch domain allows during attended planning (the ADR-023 flow) are NOT self-widening. Background/AFK never edits permissions.

**Ratified** — 2026-07-29.

**Consequences** — This is a scoped carve-out on the hard-block list, not a removal from it.

### D5 — Audit-log append doctrine

**Conflict** — Governance forbids any modification under `docs/audit/`; L4 and L5 require the run's
own audit step to append to the audit log.

**Options considered**

- Hold governance's prohibition on every `docs/audit/` modification and amend the L4/L5 append
  requirement.
- Hold the L4/L5 append requirement and amend governance to distinguish the run's own append from
  editing or deleting an existing entry.

The audit catalogued no further alternatives.

**Decided** — `docs/audit/`: as doctrine, append-only writes by the run's own audit step are required by doctrine; the enforcement change is pending — until it ships, appends route through the host. Editing or deleting an existing entry stays permanently forbidden.

**Ratified** — 2026-07-29.

**Consequences** — The live classifier
`~/.claude/skills/apex-code/scripts/apex-critical-files.ps1` refuses any `docs/audit/` path on a
path match alone (`'(^|/)docs/audit(/|$)'` → `HARDBLOCK … : audit`, exit 11), with no append-versus-edit
distinction. Until a content-aware script change ships, all `docs/audit/` writes are blocked in
practice, including the run's own appends, and L4+ audit appends route through the host. That
script change is a named follow-up and is not in this spec; this spec changes no script. D5's
doctrine currently outruns its enforcement.

### D6 — Docs agents as the host's pen

**Conflict** — `apex-docs-technical-agent` performs the handoff, `docs/status.md`, and spec-archive
writes; ADR-045 reserves those state-keeping duties for the host.

**Options considered**

- Keep the docs agents with an AFK carve-out: they act as the host's pen and the host reviews their
  output.
- Retire those steps to the host.

**Decided** — the docs agents are KEPT with an AFK carve-out: they act as the host's pen, and the host reviews their output before session close. Not retired to the host. **This is the sole named exception to D3's host-state critical list, and it is scoped to exactly three artifacts:** (1) the handoff doc, (2) `docs/status.md`, (3) spec archival into `docs/changes/done/`. Nothing else. **Scope limit:** the carve-out covers those three document writes ONLY. It does not touch the commit approval gate, and it grants no other unattended critical-path write.

**Ratified** — 2026-07-29.

**Consequences** — Under AFK the harness may silently deny a docs-agent's off-list write
(`dontAsk` inheritance). Until the permissions follow-up ships (queued retro set), **the HOST
performs the three artifacts' writes itself** — they are host bookkeeping (state-keeping) under the
session licence clause, so no gate is crossed. The docs agents are the host's pen whenever the
harness permits; the host is always a valid writer of its own three artifacts.

D6 cross-references D3 and is its sole named exception. Its scope was tested and held: category
10's alternative of extending the AFK carve-out to cover WIP commits on pause was considered and
REJECTED. D6 authorizes docs-agent document writes, not git commits. The commit approval gate
(draft → show → approve → commit) stands at every level, attended or not; an unattended run queues
the drafted message instead of committing.

### D7 — Spec-authorized deletes

**Conflict** — The code-worker contract says never to delete anything; the spec schema supports
`Operation: delete`.

**Options considered**

- Allow spec-authorized deletes for code-workers.
- Route delete tasks host/codex-side only.

**Decided** — spec-authorized deletes ARE allowed for code-workers: a delete listed in the spec's `## Files to Change` with `Operation: delete` is pre-authorized, on non-critical paths only (per D3).

**Ratified** — 2026-07-29.

**Consequences** — D8's integration check treats a spec-authorized deleted file as integrated when
it is absent from both trees.

### D8 — Verified post-integration teardown

**Conflict** — Governance forbids `git branch -d/-D` at every level; parallel-Codex teardown
requires deletion of integrated task branches.

**Options considered**

- Add a scoped teardown allowance for post-integration, verified-integrated branches only.
- Codify the `!` one-liner handback as the teardown mechanism.

**Decided** — scoped teardown allowance: the creator of a worktree/branch may tear it down POST-INTEGRATION, only when **verified integrated**. The governance blanket ban on `git branch -d / -D` gains exactly this carve-out and no other.

**Ratified** — 2026-07-29.

**Consequences** — This subsection is the single canonical home of the D8 verification algorithm.
Other documents carry one summary sentence and cite this subsection rather than restating it.

(a) **WORKTREE REMOVAL requires `git status --porcelain` empty in that worktree.** No alternative, no per-file byte-identity substitute. A scope violation (exit 65) can leave unauthorized writes sitting in the tree, and those may be the only copy. **Remove with `git worktree remove <path>` — WITHOUT `--force`.** Git re-checks for uncommitted content at execution time, so dropping the flag turns the porcelain check into a belt-and-braces pair rather than a single fallible gate. A dirty worktree is surfaced and left alone, never force-removed.

(b) **BRANCH DELETION additionally requires** the branch's path-scoped diff against the integration branch to be empty: `git diff <branch>..<integration> -- <files>`. **Because integration commits land only after the user approves the per-spec commit, branch deletion NECESSARILY WAITS until that commit has landed.** Worktree removal may precede it, once (a) holds.

**Deleted files (D7 interop):** a file whose spec Operation is `delete` counts as integrated when it is **ABSENT from both** trees; never run a content comparison against an absent path.

**Ancestry checks are NOT valid evidence** — integration is the Engine byte copy (`Copy-EngineTaskFiles`) or the indexed `git apply --index` pipe (manual attended fallback; amended 2026-10-05, dispatch-pipeline-fixes), never `git merge`, so `git branch --merged` and `git merge-base --is-ancestor` false-negative on correctly-integrated branches.

**Also DOCTRINE-level, not a mechanical bypass:** `~/.claude/hooks/lib/destructive-detect.js`
intercepts `git branch -d/-D` (denying or requiring confirmation per its rules). Amended 2026-10-05
(dispatch-pipeline-fixes): integration is the Engine byte copy or the indexed `git apply --index`
pipe, so the hook has no integration form to allow; the `destructive-detect.js` change queued under
retro P5(c) is narrowed to teardown only.

### D8 amendment (2026-07-30) — wrapper-owned teardown channel

The creator-teardown allowance extends to `codex-dispatch.ps1`'s close-out finally-path as an
authorised execution channel alongside the user's `!` one-liner handback. D8(a)'s empty-porcelain
requirement and prohibition on `--force` apply unchanged. D8(b) branch deletion is explicitly
**not** delegated to the wrapper: the wrapper records a `branch_teardown_obligation` instead.

The sequencing split is exact and refines the post-integration wording above for worktree removal:
**wrapper worktree removal is gated on empty porcelain plus no live-or-unresolved sibling row, and
on nothing else — it does NOT wait for verified integration**. It is **branch deletion alone** that
necessarily waits for the approved integration commit, exactly as clause (b) already sequences it.

## Consequences

**Good**
- D2, D4, D5, and D8 are scoped carve-outs on the hard-block list, not removals. D3 reconciles
  spec pre-authorization with the critical-file gate.
- D1 gives dispatch, verification, git execution, and interim-executor duties explicit owners
  without collapsing evaluator independence.
- D6 preserves docs agents as the host's pen while limiting their AFK exception to exactly three
  document artifacts.

**Bad / accepted**
- D5's doctrine currently outruns its enforcement. The content-aware
  `apex-critical-files.ps1` change is a known, tracked follow-up rather than a silent
  inconsistency; until it ships, all audit-log appends route through the host.
- D8 is doctrinally settled before its hook support ships. The wrapper finally-path may remove an
  eligible worktree; until the queued retro P5(c) hook change (teardown only, per the 2026-10-05
  dispatch-pipeline-fixes amendment) ships, branch deletion remains a
  handback obligation and is never performed by the wrapper.
- The build-orchestrator contract and permissions follow-ups remain queued; documented interim
  mechanics are necessary until they ship.

**Neutral**
- D6's scope was tested and held: category 10's WIP-commit-on-pause alternative was considered and
  REJECTED. D6 authorizes docs-agent document writes, not git commits. The draft → show → approve →
  commit gate stands at every level, attended or not; an unattended run queues the drafted message
  instead of committing.
- D2 and D8 are doctrine-level authorizations, not bypasses of
  `~/.claude/hooks/lib/destructive-detect.js`.
