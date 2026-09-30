# Anthropic spend by role — measured from Claude Code transcripts

Date: 2026-09-30. Purpose: decide the model-refresh rollout order (Engine / build orchestrator
first, or cheap swaps first). Read-only measurement; the throwaway scripts sat in the session
scratchpad (`spend.py`, `report.py`).

## Headline

| Role | Cost-weighted share (brief pricing) | Fable priced as Opus | Fable 5.1 cache-read 0.025x |
|---|---:|---:|---:|
| (d) Spec author (Opus general-purpose "Author/re-anchor/draft" subagents) | **44.7%** | 55.3% | ~58% |
| (a) Host session (Steward/orchestrator) | **40.4%** | 29.7% | ~25% |
| (c) Reviewers (apex-reviewer, apex-spec-reviewer, general-purpose/fork "review") | **10.5%** | 9.5% | ~10.5% |
| (f) Other subagents (research general-purpose, Explore, code-worker, apex-coder) | 2.4% | 2.9% | ~3% |
| (b2) General-purpose "Build runner"/"end-gate runner" subagents | 1.5% | 1.9% | ~2% |
| (e) Docs (apex-docs-*, "close-out docs", "CHANGELOG" agents) | 0.4% | 0.5% | ~0.5% |
| (b) **apex-build-orchestrator** subagent | **0.1%** | 0.2% | ~0.2% |

**The build orchestrator is not a big line item.** Three dispatches, 41 API calls, about $16
relative out of about $11,900. Even with the general-purpose "Build runner" agents added, the
build-side orchestration total is **1.6%**. The two big lines are the **Opus spec authors**
(driven by cache reads over long, re-anchored authoring runs) and the **Fable host**.

## Raw tokens and relative cost per role (brief pricing)

Tokens are in millions. `$` is relative dollars at the brief's rates.

| Role | API calls | input | output | cache write | cache read | total tok | $ | share |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| d spec author | 28,060 | 0.23 | 10.38 | 232.3 | 6,851.8 | 7,094.7 | 5,309 | 44.7% |
| a host | 10,762 | 0.28 | 9.58 | 38.9 | 4,549.7 | 4,598.4 | 4,793 | 40.4% |
| c reviewers | 8,719 | 0.10 | 4.12 | 57.4 | 874.3 | 935.9 | 1,244 | 10.5% |
| f other | 3,424 | 0.02 | 1.21 | 16.2 | 333.9 | 351.3 | 289 | 2.4% |
| b2 build runner (general-purpose) | 1,774 | 0.00 | 0.53 | 14.4 | 152.0 | 167.0 | 179 | 1.5% |
| e docs | 538 | 0.00 | 0.06 | 3.2 | 53.8 | 57.1 | 44 | 0.4% |
| b apex-build-orchestrator | 41 | 0.00 | 0.02 | 2.1 | 3.3 | 5.5 | 16 | 0.1% |
| **Total** | 53,318 | 0.63 | 25.9 | 364.5 | 12,819 | 13,210 | 11,874 | 100% |

Reviewer breakdown: general-purpose "Fable spec review" / "Opus code review" agents 5.2%,
apex-reviewer 2.1%, fork "Fable review" 1.7%, apex-spec-reviewer 1.4%. (apex-wave-reviewer: zero
transcripts in the window.) Other breakdown: research general-purpose 2.0%, Explore 0.1%,
code-worker 0.1%, apex-coder under 0.1%.

## Per model

| Model family | calls | output (M) | cache read (M) | $ | share |
|---|---:|---:|---:|---:|---:|
| Opus (claude-opus-5, claude-opus-5-5) | 41,160 | 17.5 | 8,820 | 6,614 | 55.7% |
| Fable (claude-fable-5, claude-fable-5-1) | 10,217 | 8.1 | 3,855 | 5,179 | 43.6% |
| Sonnet (claude-sonnet-5, claude-sonnet-4-6) | 1,941 | 0.4 | 143 | 80 | 0.7% |

Role × model: spec author on Opus 41.8% · host on Fable 34.3% · reviewers on Fable 6.2% · host
on Opus 6.1% · reviewers on Opus 4.0% · spec author on Fable 2.9% · everything else under 2% each.

## Host share: planning-heavy vs build-heavy sessions

Each main session was classified from its own tool calls. Build signals: Skill `apex-code` or
`apex-build-wave` (weight 3), dispatches of build-type agents, and `codex exec`/dispatch shell
commands. Plan signals: Skill `apex-plan`/`apex-deep-dive`/`apex-research` (weight 3), and
spec-reviewer or spec-author dispatches. A class is "heavy" when its signals are more than 2x the
other class.

| Session class | sessions | host $ | host share of host total | notable subagent $ in same sessions |
|---|---:|---:|---:|---|
| Build-heavy | 10 | ~1,150 | 24% | small; the build orchestrator ($13 of its $16) sits here |
| Planning-heavy | 9 | ~1,158 | 24% | **spec authors ~$3,195 (2.8x the host)** |
| Mixed (one session plans and builds) | 14 | ~2,396 | 50% | spec authors plus build runners |
| No signal (misc/other projects) | ~15 | ~90 | 2% | — |

Most heavy sessions are mixed, which is expected under the one-session model. The host costs
about the same in build-heavy and planning-heavy sessions. What sets planning sessions apart is
the Opus authoring fan-out beside the host.

## Method

- Source: every `*.jsonl` under `C:\Users\User\.claude\projects\` (main sessions at the project
  root, subagents under `<session>\subagents\agent-*.jsonl`, each with a sibling `.meta.json`
  carrying `agentType`, `description` and `model`). Window filter: message `timestamp` ≥
  2026-08-01. That is 48 main sessions and 863 subagent transcripts.
- Only assistant records with `message.usage` were counted. Streaming writes several records per
  API response, so records were de-duplicated on (`message.id`, `requestId`), keeping the record
  with the largest `output_tokens`. 32 `<synthetic>` records were skipped.
- Role attribution used the `.meta.json` `agentType`. For `general-purpose`, `fork` and `claude`
  agents, the `description` was matched by keyword. "review" → reviewer. "Build runner" /
  "end-gate runner" → build runner. "close-out docs" / "CHANGELOG" / "handoff" → docs.
  "Author" / "draft" / "re-anchor" / "re-derive" / "unpark" / "seed" → spec author.
  Everything else → other.
- Pricing (relative $/MTok): Opus 5/25, Sonnet 3/15, Haiku 1/5, cache write 1.25x input, cache
  read 0.1x input. **Fable is not in the brief's list.** It was priced at its documented $10/$50
  (`landscape.md` in this folder). Two sensitivity columns are shown: Fable priced as Opus, and
  Fable 5.1's cut cache-read price ($0.25, i.e. 0.025x). The second was approximated by applying
  it to all Fable cache reads (about 93% of Fable records are 5.1). `claude-sonnet-4-6` was
  priced as Sonnet. No Haiku usage appeared.

## Caveats

- **Effective window is about 30 days, not 60.** Every surviving main transcript is newer than
  2026-08-01, and the oldest apex session file is dated 2026-08-31. Claude Code's default
  transcript cleanup (no `cleanupPeriodDays` override in settings) has pruned the rest.
- **Artemis is 99% of the measured spend.** apex, Atlas and others add about 1%. The split
  describes Artemis-style APEX operation (heavy one-session plan+build waves).
- The spec-author bucket is inferred from free-text descriptions. APEX has no dedicated
  spec-author agent type in these transcripts; authors run as `general-purpose` with
  `model: opus`. Misclassification risk is low for the big items but non-zero. Each of the 225
  author agents averaged about 125 calls and about 30M cache-read tokens.
- Cost is dominated by **cache reads**: about 12.8B of the 13.2B tokens. For the Fable host,
  about $3,357 of $4,069 is cache reads. The cost therefore scales with how long a context lives
  and how many turns it runs, not with output size. Fable 5.1's 75% cache-read cut matters a
  lot for the host line.
- Subscription billing is not per-token. These are relative weights for prioritisation, not
  invoices.
- Codex (`gpt-5.6-sol`) coder spend is outside Anthropic transcripts and is not included.
- The planning/build session classifier is heuristic. The ~2% "no signal" bucket also holds the
  small non-APEX sessions.

## Implication for rollout

The build orchestrator (Engine) line is about 0.1–1.6% even under generous grouping, so moving
it first buys almost nothing on cost. By spend, the priority order is: (1) spec-author runs
(Opus, cache-read heavy: model swap, or shorter or fewer re-anchored authoring runs), (2) the
host (Fable: the 5.1 cache-read price and session length are the levers), (3) reviewers. That
supports doing **cheap swaps first**, not Engine first.
