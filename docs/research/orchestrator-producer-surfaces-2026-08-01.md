# Orchestrator producer surfaces — the complete evidence pack (2026-08-01)

**Why this document exists.** The `build-orchestrator-contract` spec declares the event shapes the
dispatched `apex-build-orchestrator` agent reads. Three review rounds failed to converge because each
round re-derived the producer surface from memory and got a different answer. This file is the
derivation, done once, from the code: for every producer that can put a fact in front of the
orchestrator, what it actually emits, and where that is written down. The spec's event shapes are
derived FROM this file; where the two ever disagree, this file's citations win and the spec is the
thing that gets fixed.

**Scope.** Producers only — the things that generate results. It does not cover what the orchestrator
should DO with them (that is the spec's adjudication contract) and it does not restate the wrapper's
own internal algorithm.

**Method.** Read of the live post-`retro-wrapper-hygiene` tree (integrated 2026-08-01), plus an
exhaustive grep across `~/.claude/skills/apex-code` for any normalization layer between the reviewer
producers and their consumer. None exists — see § B.4.

**Version pin.** Everything below describes the tree as of 2026-08-01. `codex-dispatch.ps1` line
numbers are that day's; a wrapper change re-opens the § A rows.

---

## A. The wrapper — `codex-dispatch.ps1`

The wrapper is the only producer that emits an exit code, and it is the producer whose surface is
most often mis-stated, because **its stdout, its `.final` file, and its ledger row carry different
subsets of the truth.** A consumer that reads only one of the three loses facts.

### A.1 The ledger dispatch row — the complete field set at completion

Written at `:3106-3137`. Every field below is present on a completed dispatch row:

| Group | Fields |
|-------|--------|
| Identity | `run_id`, `pid`, `worktree`, `worktree_key`, `spec`, `task`, `phase`, `schema` |
| Tree | `base_sha`, `head_sha`, `end_tree_digest`, `tree_moved` |
| Timing | `started`, `ended` |
| Dispatch config | `effort`, `attended`, `sandbox`, `builder_family`, `reviewer_family` |
| Paths | `log_path`, `final_path` |
| Review binding | `reviewed_run_id`, `reviewed_tree_digest` |
| Outcome | `status`, `report_status`, `unresolved`, `deviations`, `blocker` |
| Violation flags | `scopeViolation`, `scope_exit`, `encoding_violation`, `critical_violation` |

`critical_violation` is written **only on build-phase rows that had workspace-write access**
(`:3106-3137`). On a review/read-only row the field is absent — a consumer must treat it as `null`,
not as `false`.

### A.2 The fact that matters most: flags are recorded independently of the exit code

**All violation flags are recorded unconditionally in the ledger row even when a different condition
wins the exit code** (`:3128-3137`). The exit code is a single winner selected by precedence; the row
is the full record.

Exit precedence, most severe first (`:3161-3228`):

```
blocked → 67  >  tree_moved → 69  >  bad-authorized → 66  >  scopeViolation → 65
        >  critical_violation → 77  >  encoding_violation → 73  >  done_with_concerns → 68
        >  child-exit-remap → 1  >  0
```

**Consequence, and it is the whole reason this section exists:** an exit **67 masks a simultaneous
`scopeViolation`, `encoding_violation`, or `critical_violation`.** The code says "blocked"; the row
says "blocked AND out of scope". Only the ledger row reveals the masked flags. Any consumer that
routes on the exit code alone will silently accept a scope-violating tree because it was also
blocked. **Read all four flags on every dispatch, regardless of exit code.**

### A.3 Status vocabulary

Non-terminal: `leasing` · `running` · `stalled` · `adopting` · `orphaned`.

Terminal: `done` · `done_with_concerns` · `blocked` · `failed` · `abandoned-unadopted` ·
`adopted-void` · `adopted-done` · `adopted-done_with_concerns` · `adopted-blocked`.

Adopted rows additionally carry a `+scope<N>` suffix when the adopted run had a scope exit — e.g.
`adopted-done+scope65`. A status match must therefore be prefix/substring-aware, not equality against
the nine bare strings.

### A.4 Completion stdout — what is and is not printed

Always printed on the completion path:

```
[dispatch] report: <final_path>
```

Printed when concerns exist:

```
-> <final_path>.concerns.md
```

Plus a per-condition banner.

**`run_id` and `log_path` are NEVER printed on the completion path.** A host that needs either must
read the ledger row, matched by `worktree` / `spec` / `task`. This is the single most common source of
a fabricated `run_id` in a result event: there is nothing on stdout to scrape, so anything that looks
like a run id in assembled output was invented unless it came from the row.

### A.5 Review-phase dispatches

`-Phase review` forces read-only. Consequences:

- Reachable exits are **0, 67, 68, 69 only**. Exits 65, 66, 73, and 77 are **structurally
  unreachable** — they all require a write the phase forbids.
- The `.final` uses the **REVIEW** schema (`verdict` / `findings`), **not** the completion schema.
  There is no `status` field on a review `.final`.
- Verdict → exit mapping performed by the wrapper:

| Verdict in the review `.final` | Wrapper exit |
|---|---|
| `BLOCK` | 67 |
| `FLAG`, or `CLEAN` with a non-empty `findings` array | 68 |
| `CLEAN` with zero findings | 0 |
| unrecognized / unparseable | 67 |

### A.6 `-Adopt`

Requires `-Spec`, `-Phase`, `-Worktree`.

- **Success** prints: the worktree line · `[adopt] log:` · the unresolved and blocker lines · a
  `git diff` and `git status --porcelain` · `[adopt] reported status:`. It then exits with the
  **same code set as a build** — 0, 65, 66, 67, 68, 69, 73, 77 — derived from the adopted run's
  re-derived verdict. An adopt is therefore not a distinct result kind; it produces a normal build
  outcome late.
- **Refusal** exits **75**: either the coder is still alive (the pid is printed), or the row is
  already `abandoned-unadopted`.

### A.7 `-AbandonRunId`

Gated behind `-Attended` — there is no unattended abandon path.

- **Success**: exit 0, printing the closed row as compact JSON.
- **Refusal**: exit **82**, in four variants — run id not found · ambiguous match · row not
  dead-recoverable · the recorded worktree is dirty.

### A.8 The family gate — `apex-family-gate.ps1`

**Parameters `-Spec`, `-Task`, and `-WorktreeKey` are ALL MANDATORY.** The gate is **strictly
per-task**: it selects the newest terminal-success build row for that `spec` + `task` +
`worktree_key` triple and vouches for that one row.

| Exit | Meaning | Output |
|---|---|---|
| **0** | Vouched — either a cross-family review row bound by `reviewed_run_id` with a matching tree digest, or an attended human-review row | **prints NOTHING** |
| **12** | A valid build row exists, but no acceptable review is bound to it | one line |
| **13** | Cannot vouch — ledger missing or malformed, no build row, row not terminal, or unknown `builder_family` | one line, naming the cause |

**There is no spec-level gate.** The script has no notion of a spec-wide pass. "The spec passed the
family gate" can only mean: the gate was invoked once per task, and every invocation exited 0. Any
contract that models a spec-level `family_gate_result` with a null `task_id` is modelling something
the producer cannot emit.

Note the asymmetry that trips consumers: **success is silent.** A `detail` field carrying "the printed
line" is the empty string on exit 0, not a success message.

---

## B. Reviewer producers — three unreconciled vocabularies

This is the section that broke three review rounds. There are **four** reviewer producers relevant to
a build, and they emit **three mutually incompatible finding vocabularies plus a fourth verdict
convention.** No producer knows about any other.

### B.1 `apex-reviewer` (the Claude-side post-build reviewer)

`~/.claude/agents/apex-reviewer.md:54-77`. Returns JSON:

```json
{ "status": "clean", "findings": [] }
```

or

```json
{ "status": "findings",
  "findings": [ { "type": "missed_requirement|bug|risky_pattern|spec_divergence",
                  "severity": "low|medium|high",
                  "file": "...", "description": "...", "suggestion": "..." } ] }
```

Note: the top-level key is **`status`**, not `verdict`; its values are **`clean` / `findings`**, not
`CLEAN` / `FLAG` / `BLOCK`; severities are **`low` / `medium` / `high`**; and there is a **`type`**
field with a four-value enum that no other producer has.

### B.2 `apex-wave-reviewer` (the high-risk wave reviewer)

`~/.claude/agents/apex-wave-reviewer.md:45-56`. Returns **plain text, not JSON**:

```
VERDICT: BLOCK|FLAG|CLEAN
FINDINGS:
[BLOCK] {file}:{line} — {what} — {evidence}
```

A `CLEAN` result is the single line `VERDICT: CLEAN` with no FINDINGS block at all.

### B.3 `codex-review` (the cross-family reviewer, wrapper-dispatched)

`~/.claude/skills/apex-code/scripts/codex-review-schema.json`:

```json
{ "findings": [ { "severity": "BLOCK|FLAG|CLEAN", "file": "...",
                  "line": 12, "criterion": "...", "rationale": "..." } ],
  "verdict": "BLOCK|FLAG|CLEAN" }
```

`line` is integer-or-null; `criterion` is string-or-null. This is the only reviewer whose result also
carries a wrapper exit code (§ A.5) and the only one bound to a `reviewed_run_id`.

### B.4 `opus-endgate` (the mandatory AFK end-of-run adversarial pass)

`~/.claude/skills/apex-code/references/afk-endgate.md:45-58`:

```json
{ "findings": [ { "severity": "P1|P2|note", "issue": "...", "file": "...", "why": "..." } ],
  "verdict": "<free text>" }
```

Field names are `issue` and `why` — not `description`, not `rationale`. The third severity class is
literally the lowercase word **`note`**, not `P3`. The `verdict` is **free text**, not an enum.

Severity semantics, as the end-gate itself defines them:

- **P1** — a production bug; must be fixed before handoff. `apex-code` routes a P1 through
  fix-and-reverify before the handoff runs.
- **P2** — morning triage; recorded, not blocking.
- **note** — mention only.

### B.5 The finding that governs the contract: THERE IS NO NORMALIZER

An exhaustive grep across `~/.claude/skills/apex-code` (skill, references, scripts) for any mapping
between these four vocabularies returns **nothing**. There is no code, no table, and no prose that
converts `high` → `BLOCK`, or `P1` → `BLOCK`, or `status: "findings"` → `verdict: "FLAG"`. Each
producer's output is consumed in its own vocabulary or not at all.

**Therefore a contract that declares a single normalized `verdict: "BLOCK|FLAG|CLEAN"` field for all
reviewers is inventing a producer that does not exist**, and every host that fills it must guess. The
correct shape is producer-typed: carry each producer's fields verbatim under its own tag, and give the
consumer *adjudication guidance* — how to weigh a `high` against a `BLOCK` against a `P1` — rather
than a field rewrite. Guidance is advice to the reasoner; a normalized field is a lie about the wire.

The rough severity correspondence, offered as guidance only:

| Treat as | `apex-reviewer` | `apex-wave-reviewer` / `codex-review` | `opus-endgate` |
|---|---|---|---|
| Blocking | `severity: high` | `BLOCK` | `P1` |
| Concern | `severity: medium` | `FLAG` | `P2` |
| Informational | `severity: low` | a `CLEAN`-severity finding | `note` |

---

## C. Non-wrapper worker producers

These producers emit **no exit code and no wrapper ledger row.** A contract that models every result
as arriving with an exit code cannot represent them, which is why they need a carrier of their own.

### C.1 `apex-coder` — the Sonnet fallback coder

`~/.claude/agents/apex-coder.md:62-73` returns:

```json
{ "files_changed": ["..."],
  "task_summaries": [ { "task": "N", "status": "done|blocked", "files": [], "summary": "" } ],
  "decisions": [ { "task": "...", "decision": "...", "reason": "...", "review_needed": true } ],
  "blocked_actions": [ { "action": "...", "task": "...", "reason": "..." } ] }
```

**No `.final` file. No wrapper row.** Per `apex-code/SKILL.md:360-375`, the host appends an
**in-session ledger row** for a fallback build: a fresh `run_id`, `phase: build`, `builder_family:
"anthropic"`, and an `end_tree_digest` obtained from the tree-pin helper's `-Digest` mode — or the
literal string `unverifiable` when the digest cannot be taken.

**That host-appended `run_id` is what a subsequent review cites** in its `reviewed_run_id`, and it is
what the family gate selects on. It is a real run identity even though no wrapper produced it.

### C.2 `apex-docs-product-agent`

`~/.claude/agents/apex-docs-product-agent.md:61-73` returns:

```json
{ "status": "completed|completed_with_skips|failed",
  "inline_docs_added": ["..."], "changelog_updated": true,
  "readme_updated": true, "readme_section": "...", "skipped_off_scope": ["..."] }
```

A third status value — `completed_with_skips` — that a boolean done/failed model cannot carry.

### C.3 `apex-docs-technical-agent`

`~/.claude/agents/apex-docs-technical-agent.md:61-63` returns **one free-text sentence**, e.g.
"Handoff written… Spec archived… Docs: {status}". It is not JSON and must not be parsed as such.

Its **`coder_summary` input** (`:16`) is host-assembled, and the assembly rule differs by path:

- **Codex path** — built from the `.final` fields: `deviations` → decisions, `blocker` →
  blocked actions, `unresolved` carried through. **`concerns.md` is never ingested.**
- **Fallback path** — `apex-coder`'s own Step-5 JSON (§ C.1) is passed through.

**Gap this creates.** A host takeover recorded as a D1-EXCEPTION ledger row has no producer inside
that assembly rule — the row is neither a `.final` field nor `apex-coder` JSON — so the exception
never reaches the handoff unless the agent is given the exception rows as a declared input.

### C.4 The completion schema — `codex-completion-schema.json`

```json
{ "status": "done|done_with_concerns|blocked",
  "changed_files": ["..."],
  "commands_run": [ { "command": "...", "result": "pass|fail|not_run", "detail": "..." } ],
  "deviations": ["..."], "unresolved": ["..."], "blocker": null }
```

`commands_run` is an array of **objects**, not of command strings — a command that did not run is
visible as `"result": "not_run"`, never by absence. `blocker` is string-or-null and is populated both
on a `blocked` status and when the wrapper refutes a `done` claim.

### C.5 The close-out chain

`apex-code/SKILL.md:341-419` fixes this order, and it is not negotiable by the orchestrator:

```
reviewer (first and always)
  → product docs agent (only after the reviewer returns)
  → family gate (at completion, per task)
  → host discharges -ListObligations
  → technical docs agent (handoff + spec archival)
  → host reviews the docs output
```

### C.6 The exception-row writer

`~/.claude/hooks/apex-ledger-append.ps1`. Preferred invocation `-LineBase64 <base64 JSON row>`;
`-Line` and `-LedgerPath` also exist. Exits **0** appended · **2** refused on bad input · **3** mutex
not acquired. Serializes against the wrapper's ledger rewrite under the named `ApexCodexRunLedger`
mutex. A bare `Add-Content` races that rewrite and its row is silently dropped.

---

## D. What a consumer contract must therefore represent

Derived from the above; this is the checklist the spec's event shapes are graded against.

1. **Six result carriers, not five.** Wrapper dispatch, wrapper refusal, integration verify, reviewer,
   family gate — plus a carrier for the producers in § C, which have no exit code at all.
2. **Reviewer results are producer-typed** (§ B.5). One normalized verdict field is not derivable.
3. **The family gate is per-task** (§ A.8). `task_id` is required; a spec-level pass is a quantifier
   over per-task invocations.
4. **Every dispatch result carries all four violation flags plus the ledger status** (§ A.2), because
   the exit code is a lossy projection of the row.
5. **`run_id` and `log_path` come from the ledger row, never from stdout** (§ A.4).
6. **Review-phase results are a different schema and a narrower exit set** (§ A.5).
7. **Adopt results are ordinary build outcomes arriving late** (§ A.6), so they need no separate kind.
8. **The technical docs agent needs exception rows as a declared input** (§ C.3) or the D1-EXCEPTION
   record never reaches the handoff.

---

## E. Citation index

| Fact | Source |
|---|---|
| Ledger row field set | `codex-dispatch.ps1:3106-3137` |
| Flags recorded regardless of exit precedence | `codex-dispatch.ps1:3128-3137` |
| Exit precedence chain | `codex-dispatch.ps1:3161-3228` |
| Status vocabulary, `+scope<N>` suffixes | `codex-dispatch.ps1` status writer |
| Completion stdout lines; no run_id / log_path | `codex-dispatch.ps1` completion path |
| Review phase read-only, exits, verdict mapping | `codex-dispatch.ps1` review path |
| Adopt output and exit set; 75 refusals | `codex-dispatch.ps1` `-Adopt` |
| Abandon exit 0 / 82 variants | `codex-dispatch.ps1` `-AbandonRunId` |
| Family gate mandatory params, exits 0/12/13 | `apex-family-gate.ps1` |
| `apex-reviewer` return shape | `~/.claude/agents/apex-reviewer.md:54-77` |
| `apex-wave-reviewer` return shape | `~/.claude/agents/apex-wave-reviewer.md:45-56` |
| `codex-review` return shape | `skills/apex-code/scripts/codex-review-schema.json` |
| End-gate return shape and severities | `skills/apex-code/references/afk-endgate.md:45-58` |
| No normalizer exists | exhaustive grep, `skills/apex-code/**` |
| `apex-coder` return shape | `~/.claude/agents/apex-coder.md:62-73` |
| Fallback in-session ledger row | `skills/apex-code/SKILL.md:360-375` |
| Product docs agent return shape | `~/.claude/agents/apex-docs-product-agent.md:61-73` |
| Technical docs agent return + `coder_summary` | `~/.claude/agents/apex-docs-technical-agent.md:16,61-63` |
| Completion schema | `skills/apex-code/scripts/codex-completion-schema.json` |
| Close-out chain order | `skills/apex-code/SKILL.md:341-419` |
| Ledger-append helper | `~/.claude/hooks/apex-ledger-append.ps1` |
