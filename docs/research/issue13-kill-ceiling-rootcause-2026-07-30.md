# Issue-13 root cause: the background kill ceiling (2026-07-30)

**Status: historic mechanisms root-caused (below, solid). Current-harness behavior UNRESOLVED —
two probe terminations of unknown origin (E4/E5a), indistinguishable from manual task-stops;
owner asked. Do not treat any current-harness claim here as settled until that answer is in.**
Evidence dossier: `issue13-evidence-2026-07-30.md` (verbatim ledger rows, file:line cites,
incident timeline). Investigation run per apex-debug forensic mode.

## Root cause statement

The 8–12-minute background kills were **not caused by any APEX code**. The dispatch wrapper
(`codex-dispatch.ps1`) contains **zero kill paths**: its watchdog (`:1670-1684`) flags `stalled`
after 8 min of log silence and exits 124 *without* touching the child ("the caller owns that
decision"); there is no `Stop-Process` anywhere in it. The kills were **harness process-tree
ownership deaths** on the mid-July Claude Code build, via two mechanisms:

1. **Foreground tool-timeout (600-s cap):** a wrapper run inside a foreground tool call died when
   the call hit the harness's 10-min ceiling — session-76's diagnosis (07-17 handoff), matching the
   8.8–10.0-min orphan cluster of 07-16 and the wrapper's own `:651` comment.
2. **Subagent turn-end reaping:** a dispatch backgrounded by a *subagent* was reaped when that
   subagent's turn ended (the Sonnet-orchestrator early-return failure mode); the 07-30
   `Start-Process`-detach + marker-file workaround succeeding is the confirmation-by-fix.

Secondary effect that shaped the ledger signature: when the wrapper died first, the surviving codex
child lost its only stdout drainer and eventually **wedged on the full 64-KB pipe** — hence orphaned
`running` rows whose logs stop mid-event, and the 11–12.3-min `failed` band (child outliving the
wrapper by a few minutes). The watchdog's 8-min threshold coincidentally overlaps the kill band,
which muddied historical attribution (stalled-then-abandoned vs killed); the watchdog is exonerated
as a killer.

## Live reproduction results (2026-07-30, current harness)

Neither mechanism reproduces today. Lightweight heartbeat probes (file-writing PowerShell loops):

| Probe | Pattern | Result |
|-------|---------|--------|
| E1 | foreground call, deliberate 60-s tool timeout, detached child | call **migrated to background** at timeout instead of being killed; parent ran its full 150 s (exit 0); child survived |
| E2 | subagent backgrounds a heartbeat, ends turn immediately | heartbeat kept writing ≥2.5 min past turn end |
| E3a/b/c | host-backgrounded / subagent-backgrounded / `Start-Process`-detached, ~17 min each | **all 200/200 heartbeats, zero gaps >12 s, straight through the 8–10-min band** |
| E4 | host-backgrounded, 71-min probe | terminated at 12.0 min runtime (~10.5 min after last host turn); harness status `killed` / "was stopped" |
| E5a | host-backgrounded, 40-min probe, session idle | terminated at **0.9 min** runtime; same `killed` / "was stopped" signature |
| E5b | detached control | unaffected; host killed it during stand-down |

**E4/E5a interpretation — unresolved, two competing explanations:**
1. **Manual stops.** The "was stopped" phrasing matches deliberate task-stops (natural death reads
   "completed (exit code N)"), a concurrent session is active on this machine, and no timer fits
   both data points (12.0 min vs 0.9 min runtime; ~10.5 min vs ~1–2 min post-idle). If the owner
   stopped them, E4's near-match to the historic band is coincidence, and the E1–E3 conclusion
   ("no start-anchored ceiling up to at least 16.6 min while the session stays active") stands as
   the current-harness picture.
2. **A harness reap policy with non-fixed timing** (idle-triggered but event-based, not a timer).
   Cannot be excluded from inside the session.
Owner has been asked which it is; further probing suspended — repeated stops may themselves be a
human "stop" signal, which is respected.

**Facts that stand regardless (current harness, 2026-07-30):** foreground tool-timeout migrates
the call to background instead of killing it (E1); an owning subagent's turn end alone does not
kill its backgrounded process (E2, ≥2.5 min); host-, subagent-backgrounded, and detached patterns
all ran 16.6 min through the historic 8–10-min band while the session stayed active (E3, 200/200
heartbeats each, zero gaps).

## Second ceiling (~52–63 min)

Real in the historic data (orphans at 51.6–62.8 min, stalled plan-checks at 55.6/63.9, hard max
≈63 min across 1,148 closed rows) but its mechanism is **unconfirmed**; the 59–63-min rows carry
`aborted` markers consistent with manual/external aborts (the Atlas "externally killed R11/R61/…"
rows are explicitly external). E4 probes it directly. Until E4 (or a real-codex long run) says
otherwise, treat the 52–63-min band as abort/session artifacts, not a harness kill.

## Caveats — what the probes do NOT prove

- **Version-pinned:** confirmed on the 2026-07-30 harness build only. The behavior changed
  somewhere between mid-July and now and can change again; **re-verify with a ≥12-min probe before
  shipping P1(b)'s workflow variant**, and pin that re-verification into its spec's acceptance
  criteria.
- **Not codex-shaped:** probes write files, not 64-KB stdout pipes, and burn no CPU. One real
  `codex exec` dummy dispatch (~12 min, backgrounded) is the recommended final confirmation — it
  exercises the pipe-drain path the heartbeats cannot.

## Implications for the retro plan

- **P1(b) unblock:** the kill-ceiling blocker on the Codex-dispatching workflow variant is lifted
  (with the two caveats above). Attended waves may also be able to drop the foreground-only
  constraint entirely.
- **P7(c):** the 60–71-min `adopted-blocked` build outliers were kill-overrun + adoption overhead of
  a mechanism that no longer exists; re-measure durations before optimizing for them.
- **Watchdog:** keep as-is (8-min stall flag, exit 124, no kill) — it was never the problem.
- **Ledger hygiene tie-in (P5):** the orphan/`stalled`/hand-edited-`killed` row mix from this era is
  the adoption-path backlog P5(a) handles; no new mechanism needed.
