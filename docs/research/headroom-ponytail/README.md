# Compare-and-Absorb: headroom + ponytail

**Date:** 2026-06-15
**Pass type:** External-repo absorption (apex-research recipe). Report-first — **no skill edits made.**
**Confidence:** HIGH — both repos cloned `--depth 1`, candidates cite real file paths (cite-or-drop).
**Re-research after:** 2026-06-29 (AI-tooling clock).

Per-repo full analyses: [`headroom.md`](./headroom.md) · [`ponytail.md`](./ponytail.md).

---

## The two repos solve different problems with different levers

| | **headroom** | **ponytail** |
|---|---|---|
| URL / SHA | `chopratejas/headroom` @ `01fdedc` | `DietrichGebert/ponytail` @ `1c420ad` |
| License | Apache 2.0 | MIT |
| What it is | **Runtime** context-compression layer (Python/TS/Rust): library + HTTP proxy + MCP server + `wrap <agent>` CLI | **Pure-Markdown** prompt-injected skill: a "laziest senior dev" persona + 6-rung YAGNI ladder |
| Lever | Compress tool-outputs/logs/RAG/history **before they hit the LLM** (claims 60–95% token cut) | Make the agent **write less code** (benchmarked 80–94% fewer LOC; tokens −16% vs no-skill baseline, only −2% vs a rival skill) |
| Layer it lives at | **Runtime / prompt-assembly** (a layer APEX deliberately does not own) | **Behavioural prose** (exactly APEX's layer) |
| Architectural fit with APEX | **Wrong layer** — needs a running process | **Right layer** — but partly redundant with APEX's existing simplicity rules |

The headline: **headroom cannot be *absorbed* by a Markdown skill system at all** (it's a tool you *run*), while **ponytail is the same *kind* of thing APEX is** — so the question for ponytail is dedup, not compatibility.

---

## headroom — verdict: REJECT for absorption (optional as a personal tool)

APEX is pure-Markdown with no runtime, no prompt-assembly layer to intercept, and a charter that explicitly forbids adding tooling. 6 of 8 candidates are REJECT/NOTE on that basis alone.

| Candidate | Verdict | Why |
|---|---|---|
| ML compressors (SmartCrusher/CodeCompressor/Kompress), CCR, SharedContext, `wrap`, MCP server | **REJECT / NOTE** | All require a running headroom process. APEX owns no layer to hook them into. CCR's "return a summary + retrieval pointer" pattern is already approximated by **ADR-015** dispatch return contract. |
| `headroom learn` (auto-mine sessions → write `CLAUDE.md`) | **REJECT (already declined by design)** | The agent flagged this as the top novel idea, not knowing APEX already ran a council on the identical mechanism (ECC instinct-engine) and chose **no-go — ADR-011**: automated learning lets a weak model poison skills; the human review gate is intentional. Nothing to adopt. |
| CacheAligner: prefix stability → KV-cache hits | **NOTE (marginal)** | A real principle, but APEX doesn't control prompt-assembly order — the harness already loads the CLAUDE.md chain at the top. At most a one-line note in `apex-context-budget`; near-zero actionable surface. |

**The genuinely useful takeaway is for *you*, not for APEX:** if on-the-wire token cost is the goal, `headroom wrap claude` (or its MCP server) is an **operator-level** tool you could run personally to compress prompts before they reach the provider — *independent of the skill system*. It works on Windows. That's a personal-tooling experiment, not a skill change, and it carries a runtime dependency + an unverified vendor benchmark. I'd treat it as "try it yourself if you want," not "wire it into APEX."

---

## ponytail — verdict: 1 keeper + 1 probe-then-decide; reject the tooling

Same *form* as APEX (Markdown skills), so the test is whether each behaviour is already model-native or already in APEX.

| Candidate | Dedup | Verdict |
|---|---|---|
| **`ponytail:` debt-comment convention** — mark a deliberate shortcut inline with its ceiling + upgrade trigger (`# ponytail: global lock, per-account if throughput matters`), harvestable by grep | **Novel** — APEX says "do less" but has no way to record *why* a shortcut was taken or *when* to revisit | **ADOPT-candidate (strongest)** — a convention/mechanism, not content a model emits cold; low cost, additive, survives in git. Fold into `apex-coding-principles` (as `# apex:`); the `ponytail-debt` grep is a one-liner, no separate skill needed. |
| **6-rung YAGNI ladder** — ordered stop-at-first-rung: exist-at-all? → stdlib? → native? → installed dep? → one line? → minimum that works | **Partial** — more concrete than APEX's "simplicity first" prose / Karpathy pre-flight, but possibly model-redundant | **RED-PROBE FIRST** — this is *content*. Per [[absorption-red-probe-before-content]], behaviour content usually doesn't earn its place. But the real executor is **DeepSeek Flash** (the weak coder), not Opus — so the probe must target whether *Flash* produces this discipline cold, not whether Opus does. |
| tag taxonomy (delete/stdlib/native/yagni/shrink) + `net: -N lines` score | Partial — `/simplify` exists | **NOTE** — absorb the output *format* into `/simplify` if the ladder lands; don't add a parallel skill |
| Node SessionStart/UserPrompt hooks, lite/full/ultra mode-switching, multi-host adapters | Already-have / incompatible | **REJECT** — APEX already has a SessionStart hook; the Node machinery + user-chosen intensity dial conflict with the pure-Markdown, backend-gated charter (intensity is set by planning/coding backend, not a `/ponytail ultra` command) |

**Why this matters for APEX specifically:** the whole reason APEX over-specifies for the coder is that DeepSeek is weak on exactly this (the status.md weak-coder evidence: prohibition rules decay fastest, constraint-stacking drops ~30pt). An *explicit ordered ladder* is the kind of positive, concrete rule that survives on a weak model better than "be simple." That's the case **for** the ladder despite redundancy on Opus — and exactly why the probe should be run on Flash.

---

## Decisions (user, 2026-06-15)

1. **headroom — DROPPED.** Wrong layer for a Markdown skill system (runtime tool, no surface to absorb), and its one "novel" idea (`headroom learn` auto-writing `CLAUDE.md`) collides with the deliberate **ADR-011** no-go on automated learning. Not parked as a personal tool. Closed out.
2. **ponytail — YAGNI ladder only, probe-then-decide.** The `# apex:` debt-comment convention was **not** selected. The 6-rung ladder advances to a RED probe before any absorption; the Node hooks / mode-switching / multi-host machinery are rejected.

### RED-probe result (YAGNI ladder) — model-redundant at the level tested

Authoritative target = **DeepSeek Flash**, which is **Mac-gated**. A directional proxy probe ran on **Haiku** (weakest cold coder available on Windows), two ladder-trap tasks, zero simplicity guidance:

- **stdlib/one-liner trap** (group words by first letter): produced a lean explicit loop, no class/abstraction; *unprompted* weighed `defaultdict`/`setdefault` and chose minimal-no-imports "for a one-off function."
- **YAGNI/abstraction trap** (read a config value + default): 6 lines, single try/except, `.get("timeout", 30)` — skipped every over-engineering trap (no ConfigManager/caching/schema/env-layering) with a YAGNI justification.

**Finding:** even the weakest cold model produces ladder-conformant code and articulates YAGNI reasoning without being told to → the 6-rung ladder as verbatim content is **model-redundant**, consistent with [[absorption-red-probe-before-content]]. APEX's existing coverage (apex-coding-principles §Surgical-scope, CLAUDE.md §2, apex-plan complexity gate) already serves the structural case.

**Recommendation: do NOT absorb the ladder. 0 skill edits from this pass.**

**Caveats (not airtight):** (1) Haiku ≠ DeepSeek Flash — Flash is the real gate. (2) The probe used single-function tasks; over-engineering manifests more at *structural* (multi-file) scale, which this under-tests.

### Authoritative Flash probe — RESOLVED 2026-06-15 (planning judgment)

Ran cold on **DeepSeek Flash**, 9 bare `general-purpose` subagents (3 tasks × N=3), verbatim prompts,
no project context. Raw output: [`flash-probe-results.md`](./flash-probe-results.md). Planning judgment:

- **Task 1 (stdlib trap):** 3/3 lean — `setdefault` loop, no abstraction; each articulated the YAGNI reasoning unprompted.
- **Task 2 (YAGNI trap):** 3/3 lean — ~6–8 lines, single try/except, `.get(...,30)`; every over-engineering trap skipped.
- **Task 3 (structural trap — the key addition):** **0/3 over-built.** Run 3 = single class + list-of-dicts, ~15 lines, cites Simplicity First; Run 2 = one dataclass + one collection class, exactly the 3 ops; Run 1 = dataclass + class but added unrequested timestamps + a "persistence later" rationale (the one mild smell — still no Repository/enum/CLI stack). None hit the over-build signature.

**Finding:** all/most runs lean **including the structural trap** → the directional "redundant" recommendation **holds on the real coder**. Both Haiku-proxy caveats (Flash ≠ Haiku; single-function under-test) are now resolved. **Do NOT absorb the 6-rung ladder. 0 skill edits. Pass closed permanently.**

### Net yield of the whole pass
**0 skill edits.** headroom = wrong layer + ADR-011 collision (dropped). ponytail ladder = model-redundant on proxy (not absorbed). The pass's value is a validated *negative*: APEX's leanness charter already covers what both repos offer at the skill layer.
