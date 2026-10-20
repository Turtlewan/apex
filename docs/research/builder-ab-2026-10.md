# Builder A/B — gpt-5.6-sol vs gpt-6.1-sol (2026-10-05)

Spec: [engine-followups-ab](../changes/engine-followups-ab.md) (risk low). Tasks 2, 3 and 4 were each built twice from the identical dispatch pack, at the same effort (medium), in separate worktrees off the same base. Both models were confirmed live on the owner's Codex plan (gpt-6.1-sol probe 2026-10-05: 3,822 tokens for a trivial prompt). A Sonnet Critic compared each pair **blind** (candidates labelled X/Y by a random draw; key held by the host).

## Results

| Task | Model | Wall-clock (min) | Input tokens (cached) | Output tokens | Self-verify scope | First self-verify | Blind verdict |
|---|---|---|---|---|---|---|---|
| T2 wrapper override flag | gpt-5.6-sol | 4 | 0.92M (0.85M) | 3.7k | 2 suites | pass | loses: fake seed digest in fixture (flag) |
| T2 | gpt-6.1-sol | 23 | 3.77M (3.65M) | 8.0k | full recipe (17) | pass | **wins**: real tree-pin, stronger row-count guard |
| T3 runner robustness | gpt-5.6-sol | 28 | 3.39M (3.28M) | 10.3k | full recipe | fail → fixed → pass | **wins**: restores a pre-existing commit_intent |
| T3 | gpt-6.1-sol | 17 | 1.77M (1.70M) | 5.7k | full recipe | pass | loses: deletes a pre-existing commit_intent on save failure (flag) |
| T4 test strength | gpt-5.6-sol | 24 | 2.73M (2.65M) | 7.0k | 2 suites | pass | tie |
| T4 | gpt-6.1-sol | 3 | 0.20M (0.16M) | 2.1k | 2 suites | pass | tie (marginally tidier; integrated) |

All six runs: status done, zero scope violations, no blocked or concerns reports. Totals: gpt-5.6-sol 56 min, 7.0M input / 21k output; gpt-6.1-sol 43 min, 5.7M input / 15.8k output.

## Reading

- **Quality: even.** One win each plus a tie. Each loser had one real flag-level defect, not a block. Neither model over-reached on scope.
- **Speed and tokens: gpt-6.1-sol ahead overall** (about 23% less wall-clock and 19% fewer input tokens), but heavily confounded. Each run chose its own amount of verification. T2's gpt-6.1-sol run took 23 minutes because it ran the full 17-command recipe; the gpt-5.6-sol run took 4 because it ran only the two named suites. Where both ran the same scope (T3, full recipe; T4, two suites), gpt-6.1-sol was faster both times (17 vs 28; 3 vs 24 minutes).
- **None of the practitioner complaints about gpt-6-sol reproduced for gpt-6.1-sol here:** no slowness, no over-engineering, no extra files.
- **Sample size: three tasks, one run each — directional only.** Not enough to switch the default builder on its own.

## Recommendation

Do not switch yet. Run gpt-6.1-sol as the builder on the next two or three real specs, alternating with gpt-5.6-sol per task, and keep the blind-review step. Switch the default if quality stays even and the speed/token edge holds once verification scope is controlled. To control it, make the dispatch pack name the exact verify commands, so both models run the same suites.

**Decision (owner, 2026-10-19):** no alternation — gpt-6.1-sol is the coder for all builds. Wrapper and Engine already default to it; effort defaults stay medium (routine) / high (`risk: high`). gpt-5.6-sol remains only as an explicit per-spec pin.

Measurement method: wall-clock is ledger `started`→`ended`. Tokens are the last `turn.completed` usage in each run's Codex JSONL log (cumulative for the session). The Codex plan-quota percentage was not captured per run.
