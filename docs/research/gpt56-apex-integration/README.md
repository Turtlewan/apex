# GPT-5.6 × APEX integration — synthesis report

_Session 64, 2026-07-10. Inputs: 6 GPT-5.6 Sol cluster reviews (`sol-c1..c6.md`, full ~50-skill set),
3 Claude-side cluster reviews (`claude-c*.md`), 3 web research passes (`ws-a/b/c.md`), live CLI probes._
_Sol spend: ~2.17M in / 44k out tokens (ChatGPT quota). Claude agents: ~1.13M tokens (Max pool)._

---

## 1. What the probes established (VERIFIED, our auth, codex-cli 0.144.1)

| Surface | Status |
|---|---|
| `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` | ✅ all resolve + answer (GA was 2026-07-09) |
| `model_reasoning_effort`: `low..xhigh`, **`max`**, **`ultra`** | ✅ all accepted (bogus enum rejected → validation is real) |
| `gpt-5.6-sol-ultra` / `gpt-5.6-ultra` model ids | ❌ API-key-only ("not supported with a ChatGPT account") |

**Key correction to the June draft:** `ultra` is reachable on our subscription as an *effort level*,
not a model id. Draft Stage 3's eval is unblocked. Note codex 0.144 warns that multi-agent
concurrency at ultra effort burns quota fast — ultra × parallel waves stack multiplicatively.

## 2. The verdict on "Opus plans, Sol checks, Sonnet orchestrates, Terra codes"

**Directionally correct — adopt with two amendments.** Scored against the evidence:

| Role | Verdict | Evidence |
|---|---|---|
| **Opus 4.8 plans** | ✅ keep | Already the doc'd planning model. Fable→Opus costs ~11pt SWE-bench Pro on the ceiling, but Fable bundled-subscription access reportedly ends **2026-07-12** (REPORTED ×3 sources) — the "no Fable" premise is about to be literal. Planning judgment gaps get covered by the new Sol gate. |
| **Sol double-checks plans** | ✅ adopt (new role) | Cross-family review evidence is strong: a 4-tool study found 93.4% of findings unique to one tool; OpenAI itself ships a Codex↔Claude cross-review plugin. Challenge-the-plan is agentic/analytic work — Sol's strong suit — and it runs on the *other* subscription pool. **Deep-dive correction (2026-07-10, after user challenge):** the "Sol trails Opus at coding" read was over-weighted. The SWE-bench Pro 64.6-vs-Fable-80 gap is real but contested — no published OpenAI score, OpenAI's own audit estimates ~30% of SWE-bench Pro tasks are broken, and independent testers found the *harness* swings scores more than the model. Artificial Analysis's standardized Coding Agent Index (DeepSWE + Terminal-Bench v2 + SWE-Atlas-QnA, Sol-in-Codex-harness) has **Sol(max) at 80, leading all three evals, ~10% cheaper per task than Opus 4.8(max)** — and their Intelligence Index puts Sol (59) a close second to Fable (60) at ~⅓ cost. Willison hands-on: "very competent… hasn't struck me as better than Fable" on complex work. Net: Sol is frontier-class at agentic coding *in exactly the harness APEX uses*; the METR gaming flag stays a caution for benchmark interpretation, not a capability verdict. |
| **Sonnet 5 orchestrates** | ✅ adopt, after hardening + a proving run | Sonnet 5 *beats* Opus 4.8 on Terminal-Bench 2.1 (80.4 vs 74.6) and matches it on tool-augmented reasoning; Anthropic's own docs recommend "plan with Opus, execute with Sonnet." Pool economics are decisive: Opus and Sonnet draw **separate weekly caps** on Max, so moving build-hosting to Sonnet stops builds starving the scarce Opus/planning budget. Gap: no long-horizon full-session eval exists → treat the first Sonnet-hosted build as the proving run. |
| **Terra codes** | ✅ already done | Swapped this session; ≈ gpt-5.5 quality at ~½ price ($2.50/$15). Luna ($1/$6) available for trivial tiers later; NOT adopting a routing tree (ADR-027 discipline) — effort dial remains the primary lever. |

**Amendment 1 — review routing must stay cross-family.** Sol reviewing Terra-built code is
same-family review (Sol said this itself). So: **Terra-built code → Claude reviews** (Sonnet
routine / Opus for the high-risk dual-pass set), **Opus-fallback-built code → Codex reviews**
(as today), **plans → Sol reviews**. Evaluator-independence invariant preserved.

**Amendment 2 (revised after the Sol deep-dive) — the escalation ladder gains a Sol rung.**
Verify-fail recovery: Terra effort-bump (`…→xhigh→max`) → **Sol as the model-escalation rung**
(same family, same ChatGPT quota, same harness — frontier-class agentic coding per AA's
standardized index) → Opus inline fallback only when the Codex quota itself is out or Claude
judgment is specifically needed (GRAY forks, high-risk supervision). This keeps escalations off
the Anthropic pool one rung longer. "Sonnet orchestrates" = Sonnet is the *default* host, not
the only Claude in the loop.

### Cost/quality picture (sticker-equivalent per typical spec build)

- Today (Opus hosts + Terra codes): host ~200-400k Opus-pool tokens + Terra quota.
- Proposed (Sonnet hosts): same tokens land on the **Sonnet bucket** (~3.5-12× more weekly
  headroom, and $3/$15 vs $5/$25 sticker) + one Sol plan-check ≈ 50-150k in / ~5k out on the
  ChatGPT quota. Net: planning-pool consumption per build drops to near zero; total capability
  per week rises substantially; marginal cash unchanged (both subscriptions already paid).

## 3. The headline structural finding: the propagation gap

**The enforcement layer never reaches the coder.** apex-code has the host load
`apex-coding-principles/impl.md` + stack impl cores "before writing any code" — but the
documented Codex dispatch prompt (task + files + criterion + autonomy clause) carries none of
it, and the generated `AGENTS.md § Conventions` is left a stub. For the default (Codex-built)
path, the host burns context on rules that never shape the code. Every workstream independently
converged on the same three-layer fix, which doubles as the answer to "a file system for Codex":

| Layer | Content | Owner |
|---|---|---|
| **`AGENTS.md`** (repo root, ≤32KiB, thin) | Repo layout, conventions not enforced by tooling, setup commands, targeted + full verification commands. Stable → prompt-prefix cacheable. | apex-init creates; planning populates at first spec-ready |
| **`.agents/skills/`** (selective, generated) | NOT a mirror of 50 skills. Small cards: bound-stack cards (typed-python, tauri2, expo, swift-concurrency…), debug/testing cards, domain hazard cards, `apex-plan-review` (Sol's rubric). Each card: activation, "inspect repo first", 5-10 conditional invariants, verification discovery, references on demand. 8k-char description budget across all cards (VERIFIED current). | Projected from APEX skills by apex-skill-author convention — generated, never hand-maintained twice |
| **Dispatch pack** (per task, Sonnet-assembled) | Goal → Context → Constraints → Done-when (OpenAI's own recommended shape; Constraints is today's thin slot): objective, intent/invariants/non-goals, authorized files, resolved decisions (versions, policy values — never "adapt to the bound stack"), 3-7 task-relevant hazards, exact commands, safe-local-choice vs blocker examples, JSON completion contract via `--output-schema`. | apex-code |

**Sol's content calibration (consistent across all 6 clusters):** generic hygiene (validation,
HTTP codes, no-silent-errors, naming, DRY, measure-first) is native to GPT-5.6 — injecting it
*degrades* output via instruction competition. What earns its place: repo-specific conventions,
version-bound hazards (k8s API removals, Tauri v1→v2, ESPHome syntax), resolved policy values,
security invariants (auth-source, tenant scoping, secret handling), and runnable verification.
Also: GPT-5 suffers **more** than Claude from contradictions (burns reasoning reconciling them)
and deviates from literal NEVER/negative constraints more — so the Codex-facing layer must be
internally consistent and positively phrased ([[removal-over-prohibition]] applies double).

## 3b. Community practice + local probes (2026-07-10 addendum, ws-d + live CLI)

**Empirically PROVEN on this machine (closes ws-d's open question):** headless `codex exec`
discovers repo-local `.agents/skills/` and retrieves skill bodies on demand — a scratch-repo
probe skill was found by name and its content correctly applied (Luna, 7k tokens). The
projection layer works in exactly our dispatch shape with zero per-dispatch prompt cost.

- **OpenAI's own `skill-creator` system skill** (bundled in `~/.codex/skills/.system/`) preaches
  APEX's doctrine verbatim — "Codex is already very smart… does this paragraph justify its token
  cost?" Authoring discipline transfers 1:1; system skills also model the full folder shape
  (SKILL.md + agents/ + references/ + scripts/).
- **Adopt: skill trigger-eval gate.** OpenAI's eval-skills method — a small CSV of
  trigger/no-trigger prompts (`should_trigger=true/false`, negative controls included, run via
  `codex exec --json`) — becomes part of the Phase-B projection convention. Dominant community
  failure mode is skills firing too eagerly.
- **AGENTS.md discipline:** strong community convergence on a ~150-200-line ceiling (real
  cost/perf penalties beyond; AGENTS.md size is an official quota lever). Lean root file +
  nested per-directory files. CLAUDE.md↔AGENTS.md: thin cross-reference stub, NOT a symlink —
  different audiences (one-home-per-fact).
- **`allow_implicit_invocation: false`** exists for skills that must never auto-fire — use for
  dispatch-prompt-only cards.
- **Config gotchas:** `approval_policy=never` + `--sandbox read-only` silently blocks all writes
  (fine for our review dispatches — intentional; never use for build dispatches). Since CLI
  0.36, API-key `codex exec` needs `CODEX_API_KEY` (our ChatGPT-auth path unaffected).
- **Tension to watch:** OpenAI's subagent docs position `gpt-5.6-terra` as the
  "Exploration/read-heavy, medium effort" tier, with implementation pointed at other models.
  We keep Terra-as-default-coder on the stronger evidence (AA intelligence 55 ≈ gpt-5.5-class,
  explicit "matches gpt-5.5 at half cost" positioning, our live builds) — but if Terra
  under-performs on implementation in practice, revisit with a Terra-vs-Sol effort-matched eval.
- **Consciously not adopting:** the `claude mcp add codex-writer -- codex mcp-server`
  MCP-registration pattern (community alternative to our subprocess dispatch). Subprocess wins
  for APEX: background-able, worktree-isolatable, per-task profile/effort control, tailable logs.

## 4. Change plan

### Phase A — hygiene + effort ladder (cheap, this week; no architecture risk)
1. **Global residue sweep:** `backend: deepseek` frontmatter → `backend: coding` across ~36
   impl.md (enum owned by apex-skill-author); literal DeepSeek/image-blind text in
   apex-ui-testing/impl.md (**actively wrong** — suppresses Terra's shipped vision),
   apex-figma (full ADR-027 pass) + apex-figma-agent.md "DeepSeek only", apex-accessibility
   L106 / apex-mobile L157 ("DeepSeek must SKIP" → capability-neutral wording, rule kept),
   apex-handoff, apex-skill-author execution gate, apex-stack L169.
2. **Bug fix:** apex-system-design impl.md NEVER list carries an apex-auth rule (copy-paste) — remove.
3. **Effort ladder:** enum → `{low|medium|high|xhigh|max|ultra}` in apex-code dispatch line,
   apex-plan rubric, spec-template, references (draft Stage 1 + the ultra discovery). Retry
   ladder gains `xhigh→max`; `ultra` = rare per-task rung, counts double against
   `max_parallel_codex`, EVALUATE head-to-head before routine use (Stage 3).
4. **apex-ai-systems model-landscape refresh** (30 days past its own staleness threshold;
   doesn't know Sonnet 5 / GPT-5.6 / Fable retirement).

### Phase B — close the propagation gap (the Codex file system; 2-3 specs)
5. **AGENTS.md population step:** apex-plan readiness gate + apex-init — at first spec-ready,
   distill bound-stack recipe + repo conventions into `AGENTS.md § Conventions`; repo-relative
   paths; "never commit/branch — the host owns integration" rule for Terra subprocesses.
6. **Dispatch-pack contract in apex-code:** the Goal/Context/Constraints/Done-when shape +
   JSON completion contract (`--output-schema`: status, changed_files, commands_run+results,
   deviations, unresolved, blocker) replacing the unconstrained final message. Fixes the
   pause/resume nuance too: distinguish Codex retry-exhausted-paused (resumable) from failure
   before Opus fallback.
7. **Spec template:** add compact `Intent / invariants / non-goals` block (Sol: stripping ALL
   rationale makes mismatch resolution worse; keeps the no-ADR-essay discipline).
8. **`.agents/skills/` projection convention** in apex-skill-author: which content projects,
   generated-not-duplicated, each card gated on a Terra no-skill baseline (Iron Law extended to
   the Codex consumer) **plus the trigger-eval CSV gate** (§3b — should_trigger/should-not
   probes via `codex exec --json`), projection validation checklist (frontmatter parses, budget
   fits, no AGENTS.md conflicts, `allow_implicit_invocation` set deliberately per card). Start
   with bound-stack cards + debug/testing + plan-review only. Headless pickup PROVEN (§3b).

### Phase C — the role split (gated on B; each step has a proving run)
9. **Sol plan-check gate + cross-model deliberation mode** in apex-plan (user decision
   2026-07-10): after readiness, dispatch
   `codex exec -m gpt-5.6-sol -c model_reasoning_effort=max --sandbox read-only` with spec +
   repo evidence (no Opus self-review notes — the cold first read is sacred);
   schema-constrained BLOCK/FLAG/CLEAN. Advisory by default, blocking for `risk: high`.
   (METR gaming flag → Sol never auto-edits the spec; findings route through the human gate.)
   **Deliberation extension (Tier 1)** — for high-risk specs only, **never auto-runs: the
   user triggers it, or the host suggests it and asks, every time** (mirrors Council-mode
   offer-only). After the cold read: Opus answers each finding (amend or rebut with
   evidence) into the *same* Sol conversation (`exec resume`/`codex-reply`), **≤2 rounds**
   (ADR-015 cap). Termination is NOT consensus — each finding resolves to
   `accepted` / `withdrawn` / `DISPUTED (both positions → user arbitrates)`; the resolution
   table lands in the spec's intent block. Anti-collusion valve: disputes surface, never
   negotiate away (Odysseus/ADR-010 lesson). **Tier 2 — blind dual-draft** (user-invoked
   only, rarest/biggest decisions): both models draft from the problem brief independently
   → exchange → ≤2 rounds → merge doc with agreements + disputes for the user. Needs an ADR
   (extends ADR-010/015 + evaluator-independence) authored with the Phase C spec.
10. **Sonnet-orchestrator hardening, then flip:** proceduralize the three judgment points the
    reviews flagged — Fork SMALL/BIG/GRAY as an ordered decision tree, the BLOCK/FLAG
    escalation convention extended from apex-security to the infra skills, an explicit "who
    runs the verify loop" line in apex-code/governance. Then run one real build with the
    coding-session host on Sonnet 5 (`/model sonnet` in APEX_MODE=coding) as the proving run;
    Opus stays per-spec escalation + high-risk supervision.
11. **Review routing update** (apex-governance/apex-code): Terra-built → Sonnet review routine
    / Opus dual-pass high-risk; Opus-fallback-built → Codex review (Sol or Terra). Cross-family
    preserved.

### Phase D — watch-items (no build yet)
- **Codex Memories** (`~/.codex/memories/`) can develop a narrative independent of
  status.md/handoffs — reconcile or disable for APEX dispatches.
- **Codex hooks** (PreToolUse etc., mirrors Claude) — candidate for enforcing surgical-scope
  natively inside Codex; evaluate when the dispatch pack lands.
- **GPT-5.6 system card**: greater tendency to exceed user intent agentically → keep
  `--sandbox workspace-write` + file-list scoping framed as a *safety* control (governance note).
- **Ultra head-to-head eval**; **Terra overage-rate anomaly** (ws-a flag); **help.openai.com
  403s** — re-verify quota mechanics when fetchable; **Fable access end 07-12** — verify, then
  update planning-model line if confirmed.

## 5. What was deliberately rejected

- **Mirroring all ~50 skills into `.agents/skills/`** — Sol (all 6 clusters): most content is
  planning judgment or native hygiene; projection is selective + baseline-gated or it's noise.
- ~~**Sol as coding-escalation tier** — SWE-bench Pro 64.6 + METR flag; Opus fallback stays.~~
  **REVERSED by the 2026-07-10 deep-dive** (see §2 Sol row): Sol IS the escalation rung above
  Terra; Opus fallback becomes the quota-out / Claude-judgment rung. The SWE-bench Pro reading
  was over-weighted (contested benchmark, harness-dominated; AA's standardized Codex-harness
  index has Sol leading Opus 4.8 at lower per-task cost).
- **Luna/`gpt-5.4-mini` cheap routing tier** — re-adds the tree ADR-027 collapsed; effort dial
  + (rare) ultra covers the range. Revisit only with a measured cost problem.
- **Blanket relaxation of spec discipline** — Sol wants *resolved decisions*, not freedom;
  the change is adding intent/invariants, not reopening judgment mid-build.
