# gpt-6-sol vs gpt-5.6-sol as the Codex builder — 2026-10-01

Method: apex-research, three Sonnet retrievers (primary, practitioner, red team), live web, 9 days
after gpt-6-sol's release (2026-09-22). openai.com / help.openai.com blocked the fetch tool, so Codex
plan-quota metering is not primary-sourced.

**Verdict: keep gpt-5.6-sol as the builder.** Stage 2 A/Bs the successor (6.1-sol if real, else 6-sol)
on real tasks before any switch.

| Dimension | Finding | Evidence |
|---|---|---|
| API price | 6-sol $2/$10 per 1M (cached $0.2) vs 5.6-sol $4/$20 (cached $0.4) — half | primary: developers.openai.com/api/docs/models/gpt-6-sol and /gpt-5.6-sol |
| Benchmarks | 6-sol slightly better: AA Coding Agent Index 57 vs 55 (max); Terminal-Bench 4.0 43% vs 37%; SWE-Atlas-QnA 58% vs 54% | primary (benchmark maintainer): artificialanalysis.ai/articles/gpt-6-sol-and-luna-push-the-cost-efficiency-frontier |
| Token efficiency | none: ~31k vs ~29k output tokens per task; cost cut is price-driven | same AA article (M) |
| Codex quota burn | one report: 5-hour window drains "roughly 2x, possibly even 3x slower"; another: a trivial prompt used ~7% of a 5-hour window | anecdote: github.com/openai/codex/issues/49292, /49412 |
| Speed | "a few minutes" → "10–12 minutes"; "extremely slow to the point it is unusable", user reverted to 5.6 | anecdote, independent: issues/49292, /49296; HN 49897054 |
| Quality in practice | more correction rounds, over-engineering, unrequested files/abstractions; one ranking "5.6-Sol > 6.0 Sol > Astra" | anecdote: news.ycombinator.com/item?id=49897054; community.openai.com thread 1399757 |
| GPT-6.1 Sol | two mentions say a 6.1 Sol shipped as the Codex default (~2026-09-29) | UNVERIFIED (secondary: HN comment 2026-10-01; codexusage.dev) |

No controlled side-by-side (same task, measured tokens/turns/success) exists. Every practitioner signal
points the same way but all of it is anecdote.

**What would change this:** 6.1-sol confirmed and fixing the speed (→ A/B 6.1 vs 5.6); our own A/B
showing comparable wall-clock and first-pass verify rate at lower quota.
