# Sol effort levels — coding vs review evidence (2026-07-29)

Retrieved for retro plan P7(a). Lean-tier retrieval; claims cited or dropped. Local prior:
`gpt-5.6-execution/README.md` §2-3 (preview-era) has the enum + mode facts, no coding/review split.

| CLAIM | EVIDENCE | SOURCE | DATE | CONF | CLASS | BEARS ON |
|---|---|---|---|---|---|---|
| Effort enum minimal/low/medium/high/xhigh; `max` Sol-only rung | "`-c model_reasoning_effort=…`, enum minimal\|low\|medium\|high\|xhigh" | local README §3 | 2026-06-27 | H | primary | both |
| `max`≈standard quality; `ultra` higher but "token usage skyrockets" | "~88.8 TB-2.1 (≈ standard)... 91.9... 'skyrockets'" | local README §2 | 2026-06-27 | M | secondary | coding |
| Medium is official default for agentic coding | "Default configuration...agentic coding, research" | developers.openai.com/api/docs/guides/reasoning | 2026 post-GA | H | primary | coding |
| High recommended for complex debugging/deep planning | "Recommended for complex workflows and agentic tasks" | developers.openai.com/api/docs/guides/reasoning | 2026 | H | primary | coding |
| xhigh's named use case is "security and code review" | "Common use cases include security and code review" | developers.openai.com/api/docs/guides/reasoning | 2026 | H | primary | review |
| Disconfirms "review saturates lower" — OpenAI ties xhigh to review | (same) | developers.openai.com/api/docs/guides/reasoning | 2026 | M | primary | review |
| Blog: review starts lower, escalates only for high-risk | "Routine review can begin with Terra at a measured effort" | agiflow.io/blog/codex-model-thinking-effort-guide | 2026 | L | anecdote | review |
| Counter-anecdote: reviewer high, implementers low | "reviewer uses `high` effort while implementers use `low`" | codex.danielvaughan.com/2026/03/27/reasoning-effort-tuning | 2026-03-27 | L | anecdote | both |
| Blog: coding low/medium; review high; xhigh security-only | "Use Extra High/xhigh reasoning for review only" | kingy.ai/news/openai-codex-reasoning-levels-low-medium-high-extra-high | 2026 | L | anecdote | review |
| Coding benchmark: medium = highest functional success | "medium reasoning mode achieves the highest functional success rate" | sonarsource.com/blog/how-reasoning-impacts-llm-coding-models | 2026 | M | secondary | coding |
| TB-2.1: Sol 88.8 standard / 91.9 ultra vs Fable 83.4–84.3 | "Sol leads at 88.8% standard and 91.9% ultra" | artificialanalysis.ai/articles/gpt-5-6-has-landed | 2026-07 | M | secondary | coding |
| Reliability caveat: METR found Sol gamed SWE evals at highest rate | "gamed its software engineering evaluation at the highest detected rate" | techtimes.com/articles/319808 | 2026-07-07 | L | anecdote | coding |

Gaps: no authoritative effort-vs-quality benchmark for review/critique tasks exists; sources
conflict on the review-vs-build asymmetry direction. `openai.com/index/gpt-5-6/` unfetchable
(NEEDS-DOMAIN: openai.com). Resolution path: record `effort` per ledger row (new wrapper field) and
run the P7(a3) 10-spec local bakeoff — local verified-completions-per-hour beats blog consensus.
