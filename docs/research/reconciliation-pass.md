# The reconciliation pass — is it enforced, or just written down?

_2026-07-14 (session 72). Source ledgers: `reconciliation-ledger-part1.md` (a–l),
`reconciliation-ledger-part2.md` (m–z)._

## The corpus

58 memory files in Artemis. Classified:

| Scope | Count | Verdict |
|-------|-------|---------|
| **APEX-GENERIC** — build-system lessons parked in a consumer project | **23** | belong to APEX, not Artemis |
| ARTEMIS-DOMAIN — product architecture, stack, features | 28 | correctly located; leave |
| USER-PREF — durable working preferences | 9 | correctly located; leave |

**12 of the 23 APEX-GENERIC memories carry RECURRED evidence** — the problem bit again *after* being
written down.

## The finding

The lessons that **stopped** recurring are exactly the ones that got a **hook or a script**. Every
lesson still recurring is one that only ever got a **paragraph**. Nothing else correlates — not how
well the memory was written, not how emphatic it was, not how many times it was restated.

`ab-revert-codex-worktree-trap` is the proof in one line: named, understood, filed — and it still
destroyed a coder's work on 2026-07-14. It stopped being a risk the moment `git checkout -- <path>`
became a hard deny in `destructive-command-guard.js`, hours later.

**A memory is not a mechanism.** Six of these were quietly mechanised by session 71's harness rebuild
and can be retired. Three more are mechanically checkable and are not checked. The rest are judgment,
and prose is the right home for judgment.

## Already mechanised — retire these (the harness now enforces them)

| Memory | What now enforces it |
|--------|----------------------|
| `codex-exec-stdin-wedge` | wrapper writes + closes the child's stdin; no shell redirect anywhere |
| `sonnet-orchestrator-early-return` (11 hits) | the `.final` report is the verdict, not an agent's claim; exit 75 = "your call died, the coder did not" |
| `codex-rewrites-status-md` | scope check → exit 65; the blanket auto-revert that wiped host edits is gone |
| `codex-dispatch-needs-a-quiet-tree` | auto-revert cut entirely; exit 69 = tree moved under a gate → verdict VOID |
| `ab-revert-codex-worktree-trap` | `destructive-detect.js`: `git checkout … --` is a hard deny |
| `worktree-integration-git-technique` (partial) | `checkout --` denied; the `git mv` index-blob trap is **still** prose |

## Still prose, still recurring, and mechanically checkable — the backlog

### M1 — BUILT (2026-07-15). What it cost, honestly.

Shipped as `-EncodingScan` on `codex-scope-check.ps1`, wired into both the normal and `-Adopt` paths
of the wrapper, new **exit 73**, 13 tests. But the *process* is the finding:

**Round 1 of cross-family review returned nine BLOCKs on code I had just tested green.** Every one was
real. The pattern is identical to session 71 — I wrote the code, I wrote the tests, and they shared my
blind spots exactly:

- The detector **missed most mojibake**. I derived it from the one example in the memory (an em-dash)
  instead of from the encoding, so it only caught 2-byte lead chars. Double-encoded CJK, Cyrillic and
  emoji sailed through a gate built specifically to catch them.
- It **fired on its own documentation** — SKILL.md's exit table and the script's own comments quote the
  corrupt bytes as the example, so any dispatch authorized to edit the harness could never come back
  clean. First cut: 180 hits on a real tree, **zero of them the bug** — most were the wrapper's own
  transcript logs, which contain mojibake because they faithfully *record* it. The harness writing into
  the tree it judges, growing straight back inside the mechanism written to honour that very lesson.
- It **failed open in four places** (missing helper, unreadable file, failed `git status`, directory
  authorization) — each of which reads as a pass.
- **The test file was not in git at all** (`~/.claude` has a blanket `*` gitignore), and two of my five
  tests were **tautologies that would pass with the code they tested deleted**. Lesson #3, verbatim.

And the one no reviewer found — the **false-positive test I nearly didn't write** did: PowerShell's
`-match` is **case-insensitive by default**, which silently collapsed the uppercase/lowercase lead
distinction the whole detector rests on. A legitimate `café` + non-breaking space read as corrupt.
`-cmatch` fixes it.

**The lesson generalises past this gate:** a mechanism written from one example only catches that
example. Derive it from the thing itself — here, from the byte structure of UTF-8 — or you have built
a very confident detector of the bug you already knew about.

### M1 · Mojibake scan — the original case
`codex-windows-mojibake-artifact` · **recurred 2× on one day**.
Codex-on-Windows double-encodes non-ASCII into source (`—` → `â€"`). **Tests cannot catch this by
construction** — the coder writes the same corrupted bytes into the *expected* string, so the
assertion passes. A machine sees it instantly; a model demonstrably does not.
→ Post-dispatch check in the wrapper: scan changed files for `â€` / `Â`. Fail the run.

### M2 · Baseline-green gate (unifies two memories)
`codex-dispatch-baseline-must-be-green` + `host-verify-full-mypy` · **recurred 2× each**.
These are one rule seen from both ends: the full project verify must be green **before dispatch**
(Codex refuses a red tree, and its scope lock forbids fixing the drift) and **before commit** (Codex's
file-scoped recipe reports green while the whole-project baseline is red — which then makes the *next*
dispatch refuse to build). Today both are prose in `AGENTS.md`.
→ Wrapper pre-flight runs the repo's verify quad and refuses to dispatch on red; host pre-commit runs
the same quad. One mechanism, both ends.

### M3 · Readiness gate: Files-to-Change completeness
`spec-files-to-change-include-tests` + `specs-underlist-api-shape-tests` · **bitten 3×+**.
Two memories, one rule. A spec's `## Files to Change` must contain every file its acceptance criteria
and task bodies name — that list is also the wave-grouping and the scope-lock, so an omission forces
the coder into an out-of-spec deviation (and now, exit 65).
→ Mechanical check at the readiness gate: every path mentioned in criteria/tasks ∈ Files to Change.
Pre-identified in the session-71 handoff; this pass independently re-derived it from two more memories.

**Note the shape of the readiness gate itself: ten checkboxes of prose in a SKILL.md, self-checked by
the model.** That is structurally identical to "always dispatch through the wrapper" — which lost
three times in a row until a hook made it impossible. The gate is the next prose control to fail.

## Genuinely prose — leave them (judgment, not rules)

`afk-spec-drafting-workflow` · `agent-loop-reliability-research` · `artemis-v2-build-cadence` ·
`autonomous-wave-build-cadence` · `sp0-parallel-agents-authorized` · `session-host-switch-prompts` ·
`sol-scoping-and-cross-check-role` · `review-ensemble-design-parked` · `codex-openai-proxy-pattern` ·
`live-smoke-real-integrations` · `changes-dir-has-built-unarchived-specs` ·
`codex-sandbox-flake-client-builds` (a transient flake — diagnosable, not preventable)

## Housekeeping

- `codex-exec-stdin-wedge` and the "third flavour" of `codex-sandbox-flake-client-builds` are **the
  same failure recorded twice**, two days apart — evidence the stdin wedge recurred even though
  neither file says so alone. De-dup.
- The 23 APEX-GENERIC memories live in a **consumer project's** memory dir. They should move to APEX's
  own memory (or die, if mechanised). A lesson about the build system, filed under the thing it built,
  is invisible to the next project.
