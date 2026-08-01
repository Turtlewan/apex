# Codex harness — known limits and open findings

_Written 2026-07-14, after seven cross-family review rounds (12 → 20 → 20 → 12 → 9 → 11 → 12
findings, every round BLOCK). Everything below is **known and deliberately unfixed**, not forgotten._

The point of this file is that **a stated limit beats a false guarantee.** The harness spent a day
learning that a control which quietly does nothing is worse than no control, because people trust it.
So: here is exactly what it does not do.

---

## Threat model

The harness defends against a **careless coder** — one that wandered outside the file list it was
given. It is **not a security boundary** against a coder actively trying to evade it.

This is not a cop-out; it is the honest scope. Codex is sloppy, not hostile. Building a real boundary
would mean a different mechanism entirely (a sandbox that cannot write outside the authorized set),
and the guard would still not be it.

**The real defences against bad faith are elsewhere:** `--sandbox`, the review gate, and a human
reading the diff before it is committed.

## Accepted limitations (out of scope by design)

| Limit | Why it is accepted |
|---|---|
| A **corrupted `.git`** | `git status` is the only thing the scope check can see. If git cannot run, the check reports what git reports. |
| **`core.quotePath` Unicode evasion** | Paths *are* C-unquoted now, which handles the accidental case. Deliberate encoding games are evasion, not carelessness. |
| A coder that **reverts its own out-of-scope write** before exiting | There is no journal — only a before/after comparison. A write that is undone leaves no trace. Adding a journal is a real cost for an evasion-only case. |
| Writes **outside the worktree**, or through an escaping symlink | Not visible to a worktree-scoped check. This is what `--sandbox` is for. |
| **`GONE`** (a pre-dirty path that vanished) | Reported, never acted on. The host tidying its own draft mid-dispatch has the *same signature* as a coder deleting it, and the check cannot tell them apart. Named for a human to judge. |

## The encoding gate (exit 73) — stated limits

Added 2026-07-15. `codex-scope-check.ps1 -EncodingScan` catches Codex-on-Windows double-encoding
(an em-dash written as `â€"`). It exists because **the test suite cannot catch this class by
construction**: the coder writes the same corrupted bytes into the *expected* string as into the
source, so the assertion compares corrupt to corrupt and passes. A green suite is what the bug looks
like.

Two cross-family review rounds. Round 1 returned **9 BLOCKs on code that was already green** — all
real. These are what survives, and they are limits, not bugs:

| Limit | Why it is accepted |
|---|---|
| **Staged content is not scanned** | The gate reads the working tree, not the index. A file staged corrupt but clean in the worktree slips through. Codex is forbidden to `git add`/`commit` by `AGENTS.md`, and the threat model is a *careless* coder — a coder staging around the gate is evading it. |
| **A file legitimately encoded latin-1** | Its bytes decode as clean UTF-8, so real runtime mojibake reads as fine. APEX repos are UTF-8; supporting declared per-file encodings means parsing coding headers for one hypothetical. |
| **Legitimate code containing the signature** | Encoding-repair code and parser fixtures that *intentionally* hold `Ã©`-style bytes will trip it, and there is deliberately **no override switch** — every exemption in this harness became a hole someone walked through. Such a file is unshippable through this gate. Stated, not hidden. |
| **Overlong / malformed UTF-8 (C0, C1, F5–FF)** | Not emitted by a conforming encoder, so not this bug. The gate detects *double-encoding*, not malformed UTF-8 generally. |
| **Prose (`.md`, `.txt`, `.rst`, …) is not scanned** | Documentation about this bug legitimately quotes the corrupt bytes — the first cut flagged its own `SKILL.md` and comments, so a dispatch authorized to edit the harness could never come back clean. The silent-green-test failure is a *code* failure; mojibake in a `.md` is visible to a human reading the diff. |

**What it does fail closed on:** an unreadable file, an un-enumerable directory subtree, a failed
`git status`, and a missing helper script. Each was a fail-open in the first cut, and each reads as a
pass — which is worse than no gate at all.

**The lesson worth more than the gate:** the first detector was derived from the single example in the
memory (an em-dash) rather than from the encoding, so it only matched 2-byte lead chars and **missed
double-encoded CJK, Cyrillic and emoji entirely** — a mojibake detector that missed most mojibake.
Derive a mechanism from the thing itself, or you have built a confident detector of the bug you
already knew about.

## Round-8 Wave A — stated limits (2026-07-17, ADR-044)

| Limit | Why it is accepted |
|---|---|
| **tree-pin: partial-collapse per-file hashing** | O(1) digesting applies to directories git fully collapses; ignored files listed individually inside tracked directories still hash per-file. The storm-scale dirs (node_modules-class) are the collapsed ones. |
| **tree-pin: runtime-exclusion invisibility** | On the `~/.claude` runtime tree only, ignored (`!!`) churn under the fixed runtime list (`sessions/`, `projects/`, `backups/`, `jobs/`, `shell-snapshots/`, `todos/`, `file-history/`, `history.jsonl`, `.last-update-result.json`) is invisible to the pin — the same class the exit-65 adjudication rule already treats as host noise. Tracked and `??` entries are never excluded; other worktrees get no exclusions. |
| **tree-pin: directory digest is metadata, not content** | Same path+length+mtime with different bytes, and empty-directory churn inside a collapsed ignored dir, are invisible — accepted to keep the mechanism identical to scope-check's. |
| **tree-pin: C-quoted (Unicode) paths stay trim-only** | scope-check C-unquotes; tree-pin deliberately does not. A pre-existing individually-listed Unicode ignored path can digest as missing. Per-script difference, stated. |
| **host-state classification: broader-dir-grant gap CLOSED post-hoc** (rewritten 2026-07-19, Wave B2) | Grant-token classification remains the pre-flight layer (exit 76) and a broader directory grant (e.g. `-Authorized docs`) still slips IT — but D6's post-hoc classification now classifies the coder's ACTUAL writes through the shared `Invoke-PostHocGates` helper: an unconfirmed critical write fails closed at exit 77 (subordinate to precedence — 67/69/66/65 outrank, `critical_violation:true` still recorded), and a hard block (classifier exit 11) is never confirmable. Residual: a HEAD-move surfaces as exit 65 (not 77) with the field recorded. |
| **family gate: `encoding_violation` on review rows is not discounted** (context narrowed 2026-07-18) | The `-Adopt` encoding scan is now sandbox-keyed: read-only adopts skip it, so the false-flag path (pre-existing mojibake attributed to a read-only reviewer) is closed. The gate still does not discount the flag; on a workspace-write adopt it is now true signal. |

## Round-8 Wave B2 — stated limits (2026-07-19, ADR-044 D6)

`-ReviewedRunId` is no longer recorded-but-unverified: a review launch is pin-first digest-bound to
its referenced build (exit 78 on not-found / unverifiable / mismatch / helper-unavailable), a
`-TreePinScript` override on a bound review records `tree_pin_override:true` (c3 refuses to let that
row vouch), and `apex-family-gate` disqualifies a bound review whose recorded digest is missing,
unverifiable, or disagrees with the build's `end_tree_digest` (migration-safe when either property
is absent). What remains:

| Limit | Why it is accepted |
|---|---|
| **scope-check attribution: a leaf DELETED inside a still-existing collapsed dir is unidentifiable** | The snapshot holds only an aggregate hash per collapsed dir, not leaf paths. The directory token still reaches the classifier (prefix/basename rules may fire), so a deleted critical leaf under a broad grant is catalogued, not silently dropped. |
| **digest mtime cross-time: spurious exit 78 on an mtime-only touch** | The tree digest folds untracked/ignored files' mtimes; an mtime-only touch between build close and review launch mismatches. Recovery is the attended human-review ledger row — no new override switch (every override became a hole). |
| **`-ScopeUnlocked` builds have no written set** | Post-hoc classification is unavailable; `critical_violation` is recorded ABSENT (not false). Pre-flight already required attended `-CriticalFilesConfirmed` for these. |
| **pre-completed adopts have no written set** | An adopt that reuses a recorded scope verdict cannot classify; `critical_violation` absent + loud WARN. On an attended build the dispatched `apex-build-orchestrator` adjudicates it and parks (ADR-046 D1); unattended, the host does. |
| **post-hoc classifier inherits the broad matchers** | Lock / hooks / secret-substring / auth-stem matchers can false-positive on the written set; recovery is attended `-CriticalFilesConfirmed`, adjudicated by the dispatched `apex-build-orchestrator` on an attended build and by the host on an unattended one (ADR-046 D1). |

## Post-wave hardening (2026-07-19, c4/c5)

The c2 coverage debt is closed (the pin-first read path and the adopt exit-77 rung now have real
test cases; the two deliberate duplications carry lockstep comments). The scope check now excludes
untracked session churn under the nine runtime dirs on the runtime root (`-Check` only), using an
index-or-HEAD host-curated discriminator — live-smoked: 138 session paths excluded, check clean on
the running tree. What remains:

| Limit | Why it is accepted |
|---|---|
| **runtime mask: a brand-NEW coder file under a runtime dir is masked** | In neither the index nor HEAD — indistinguishable from session churn by construction. Point-in-time inventories add a narrow same-run staging race to the same class. Defenses: `--sandbox`, the review gate, the human diff. The mask is root-scoped, ref-gated, dir-list-scoped, fail-closed on inventory failure, and LOUD (per-run excluded count). `-RuntimeExclusionRoot` is a test seam — a caller abusing it is out of the careless-coder threat model. |
| **wave-final reviews digest-bind only the final task's build** | Sequential same-worktree tasks record per-task `end_tree_digest` (intermediate trees); one wave-final review can honestly bind only the last. Earlier tasks' review rows omit the digest (the gate's documented not-digest-bound path) with an explanatory note. Per-task binding would need per-task reviews — undesigned, revisit if it matters. |
| **tree-pin runtime exclusions omit `tasks/`** | The session's task-tool storage under `~/.claude\tasks/` churns during a session and voids live-tree pins (bit two plan-check rounds). Workaround: `-NoTreePin -NoTreePinReason` for spec-text reviews. A list addition is a tree-pin + scope-check lockstep change — queue it with the next harness spec. |
| **Codex nested-sandbox suite observation is non-deterministic** (new, 2026-07-18) | A Codex coder running a test suite that itself launches the dispatcher (nested sandbox) can observe the suite's failure set incorrectly — two consecutive b1 task-4 dispatches reported contradictory, independently-falsified states of `dispatch-scopelock-test.ps1`. Treatment: delegate such suites' runtime verification to HOST runs (evaluator independence prefers this anyway); never route on a coder's claim about a dispatcher-launching suite without a host re-run. |

## Open findings from round 7 (fixed, but worth re-testing)

All twelve round-7 findings were fixed and are covered by tests. They are listed here because the
fixes are new and unreviewed — **round 8 was never run.** If something in this area misbehaves, start
here:

1. `-Adopt` reworked substantially: requires `-Worktree`, refuses terminal rows, honours the recorded
   `failed` status over a cheerful report, re-runs the armed gates, and closes the row only *after*
   they run (`adopting` → `adopted-*`).
2. Gate evidence (scope snapshot, tree pin) is now keyed by **run id**, not a lossy `spec-task` label.
3. `status: done` alongside a `blocker` or non-empty `unresolved` is now treated as a contradiction —
   the *evidence* outranks the *claim*.
4. Every non-zero child exit is normalised to `1`; the wrapper's exit space is a closed contract.
5. The hook now treats `Start-Process`, `Start-Job {…}`, `Invoke-Command -ScriptBlock`, and
   `iex` as command carriers.

## The known cost of the hook

Tightening a command guard **always** costs false positives, and a guard with too many gets switched
off. The current one blocks a raw `codex exec` in 46 spellings — and it will also block a shell
heredoc that *documents* one (it blocked the very command writing this file's sibling test). Use the
editor rather than a heredoc for content containing example dispatch commands. `APEX_CODEX_GUARD=off`
disables it deliberately.

This is a real trade, not a bug. Note it before proposing the next tightening.

## What no amount of further rounds fixes

I wrote the harness **and** its tests, so they share my blind spots by construction. That is not a
thing more effort removes — it is why the cross-family rule exists. Three of the worst defects in this
change set were **regressions introduced by my own fixes**, and twice I wrote a review pack claiming
fixes I had never made. The reviewer read the code instead of my summary.

**If you change this harness, have the other family review it. Do not trust its author's summary —
including mine, above.**
