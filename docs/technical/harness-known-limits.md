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
