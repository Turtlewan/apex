# APEX Finalisation Plan — "Second Brain" App Readiness

_Created 2026-05-31 (planning session 16). A design-on-record roadmap for hardening APEX before
building the user's largest application. Not an execution spec — each sub-project below becomes its
own `docs/changes/` spec when it reaches the front of the queue._

---

## 1. Target application (context that drives every decision)

> **⚠️ Scope correction (post-session-16):** the app is **not** just a second brain. It is a
> **"Jarvis-like" personal assistant that integrates with everything**, of which the **second brain
> (RAG knowledge core) is one subsystem**. This is a **multi-subsystem platform** — assistant /
> orchestration layer, integration/tool framework, the knowledge core, the interface(s) — and the
> deferred requirements pass must scope the *whole* vision and decompose it, not just the RAG part.
> The bullets below describe the second-brain subsystem and are an under-scope of the real target.

The application APEX is being geared up to build:

- **What:** a **"Jarvis-like" personal assistant** that integrates with everything (agent/tool
  orchestration over a broad integration surface), with a personal **"second brain"** — a RAG-heavy
  private knowledge system — as its *knowledge subsystem*. RAG is the core of *that subsystem*, not of
  the whole platform.
- **Ecosystem:** **100% Apple.** Built and run **entirely on a Mac** (Mac Mini / Mac Studio). Windows
  is the *planning* surface only (this Markdown-only planning mode); no app code runs on Windows.
- **Surfaces:** **desktop-is-the-hub.** The Mac desktop app is the brain — it hosts the RAG engine
  and a local API server. **iPhone + iPad** are *thin clients* that expose *some* functions,
  connecting to the hub over LAN / tunnel (no always-on cloud backend).
- **Integrations (all four classes):** local system & files · hardware / devices · heavy AI/data
  compute · cloud SaaS APIs. A kitchen-sink integration surface.
- **Build profile:** AI writes most of the code; the developer often can't catch what the AI gets
  wrong. → **AI-buildability and verifiability are the dominant selection criteria.**
- **Horizon:** ongoing, long-haul, multi-milestone.

---

## 2. Stack decision — **SwiftUI + Python** _(seeds the app's ADR-001)_

Selected merit-based, requirements-driven, across ecosystems (per `apex-stack`). Formalised as the
app project's `ADR-001` when that project is bootstrapped via `apex-init`; recorded here so the
finalisation work has a fixed target.

| Component | Pick | Rationale (all-Apple, RAG-core, merit) |
|-----------|------|----------------------------------------|
| UI — all 3 surfaces | **SwiftUI** (macOS + iOS + iPadOS) | Apple-first-party, single declarative framework across hub + clients; best native feel + tooling (Xcode); strongly-typed Swift → strong verifiability. On a 100%-Apple target, beats MAUI's second-class Mac story decisively. |
| RAG / AI / data core | **Python** (the hub engine) | Unmatched ecosystem for embeddings, vector search, chunking, retrieval, LLM orchestration, ingestion. This *is* the second brain. |
| Hub ↔ client API | **FastAPI** (local server on the Mac hub) | iPhone/iPad SwiftUI clients connect over LAN/tunnel; Mac hosts it. |
| Data + vectors | **SQLite + local vector store** (sqlite-vec / LanceDB / Qdrant-local) | Embedded; fits "desktop is the hub." |
| Local inference (optional) | **Apple MLX** | On Apple Silicon (esp. Mac Studio), runs embeddings/LLMs locally — natural for a private second brain. Behind an interface; decide at build time. |

**Runner-up ruled out — C#/.NET MAUI everywhere.** It led *only* while a "start on Windows" constraint
existed. Once the target is 100% Apple and built on Mac, MAUI-on-macOS is second-class vs native
SwiftUI, with weaker dense-desktop-UI support — and Python runs as the RAG engine either way, so
MAUI's "one language" edge evaporates (both paths are two languages). SwiftUI wins on platform fit.

**Lock-in:** SwiftUI 🔴 high (Apple-only — *intentional*, the all-Apple choice was deliberate) ·
Python core 🟢 low (swappable behind the local API) · SQLite 🟢 low · MLX 🟡 medium (Apple-Silicon
specific, optional, interface-isolated).

---

## 3. Finalisation sub-projects (the APEX hardening work)

| # | Sub-project | Produces | Depends on |
|---|-------------|----------|-----------|
| 0 | **Stack decision** | §2 above | — ✅ done |
| 1 | **Stack skills** | `apex-swift`, `apex-python` (each with a `## Verification Recipe`) | 0 |
| 2 | **Composition + agent wiring** | stack-skill × capability-skill precedence rule; domain-agent dispatch decision | 1 |
| 3 | **Large-scale project mgmt** | phase/milestone management, context scaling, handoff-at-scale | 1–2 |
| 4 | **Settings & autonomy** | tuned autonomy level, token profile, AFK build, `specialists_default` | independent |
| 5 | **Opus 4.8 skill sweep** | ~38 Pending skills reviewed + improved via Iron Law + research; `SKILL-HISTORY.md` tracker Pending→Done | independent, ongoing |
| 6 | **DeepSeek context efficiency** | minimise what loads into the coding (DeepSeek) context window per run — lean specs + tight `impl.md` loading | independent, ongoing |

### SP1 — Stack skills `apex-swift` + `apex-python`

Built via `apex-skill-author` (Iron Law baseline-test + triple-write to registry / SKILLS.md /
SKILL-HISTORY.md). The buildability layer (ADR-005/006) *requires* a stack skill with a real,
run-validated `## Verification Recipe`; without these, coding mode has no recipe for the chosen stack.

- **`apex-swift`** — Swift + SwiftUI across macOS/iOS/iPadOS; Xcode build model; platform heads
  (Mac Catalyst vs native macOS, iOS, iPadOS); SwiftUI patterns for dense/data-heavy UI.
  Verification Recipe candidates: `swift build` → `swift test` → `xcodebuild` (per scheme) →
  `swiftlint`. **Requires a Mac to run** — recipe is authored now, run-validated when the Mac lands.
- **`apex-python`** — Python for the RAG/AI/data engine + FastAPI local server; typed-Python
  discipline (the verifiability buy-back). Verification Recipe candidates: `ruff check` →
  `mypy --strict` → `pytest`.
- **Open — skill granularity:** one `apex-swift` covering language+SwiftUI+Xcode, or split
  language vs UI (mirrors the `apex-dotnet`/`apex-maui` split)? Decide at SP1 design. Lean: single
  `apex-swift` to start (one Xcode toolchain, one recipe family); split later only if it exceeds the
  500-line cap or earns its own concerns.

### SP2 — Composition rule + domain-agent wiring

Resolves two standing open questions (see `status.md`):

- **Stack × capability composition.** The second brain stacks `apex-ai-systems` (LLM/RAG/eval) and
  `apex-search` (vector/embeddings/RAG) — and likely `apex-auth`, `apex-storage` — *on top of* the
  `apex-python` stack skill. Define precedence + a mismatch-guard (e.g. `apex-search` assuming
  pgvector when the stack chose sqlite-vec/LanceDB). Where do capability-skill Verification Recipes
  layer relative to the stack recipe (ADR-006 layering)?
- **Domain-agent wiring.** 17 specialist agents are registered but never dispatched. Decide:
  dispatch an agent vs load the skill's `impl.md` inline — and the trigger for each.

### SP3 — Large-scale project management

The parked headline gap. The ongoing second brain runs *inside* this scaffolding:

- Phase / milestone management above the single-spec level.
- Context scaling: how planning ↔ coding handoff stays cheap as the project grows large.
- Handoff efficiency at project scale (the thin-handoff model proven at small scale — does it hold?).

### SP4 — Settings & autonomy

Deliberate tuning for a long-haul project (currently `autonomy_level: L2`, `token_profile: balanced`,
`specialists_default: []`): right autonomy level, token profile, AFK build-mode posture, and a
sensible default specialist set for an all-Apple RAG app.

### SP5 — Opus 4.8 skill sweep _(ongoing track)_

Bring every skill up to an Opus-4.8-reviewed, improved state. The tracker already exists at the top
of `SKILL-HISTORY.md` (**Done** vs **Pending**); this sub-project drains Pending.

- **Method (per skill):** run it through `apex-skill-author` — **Iron Law applies to edits too**
  (baseline-test the changed behaviour first; don't tag-flip) — and `apex-research` where the domain
  is stale. Improve content (gotchas/defaults/procedures), backfill the `description` field where
  missing, then move the skill **Pending → Done** in the tracker with the date. Triple-write any
  registry/index changes.
- **Not a tag-flip.** "Done" must mean *reviewed and improved by Opus 4.8*, evidenced by a
  `SKILL-HISTORY.md` row — not merely "touched."
- **Triage order (app-driven, not alphabetical):**
  1. **App-critical capability skills first** — `apex-ai-systems`, `apex-search`, `apex-auth`,
     `apex-storage`, `apex-jobs`, `apex-realtime`, `apex-data`, `apex-backend`, `apex-testing`,
     `apex-security`, `apex-observability`. These are what the RAG second brain composes on the
     `apex-python`/`apex-swift` stack.
  2. **Specialists/design the app touches** — `apex-system-design`, `apex-architecture`,
     `apex-performance`, `apex-docs-technical`.
  3. **Everything else opportunistically** — `apex-aws/azure/gcp`, `apex-k8s`, `apex-iac`,
     `apex-homelab`, `apex-mobile` (RN/Expo — superseded for this app by `apex-swift`), `apex-figma`,
     `apex-animation`, `apex-design-system`, `apex-frontend`, `apex-accessibility`,
     `apex-ui-testing`, `apex-ui-ux-design`, `apex-docs-product`, `apex-devcontainer`,
     `apex-devops`, `apex-google`, `apex-governance`, `apex-deep-dive`, `apex-refresh`,
     `apex-stack` — swept when next touched or as time allows.
- **Scale caveat:** ~38 Pending skills × (baseline + research + rewrite) is a long-running track.
  It runs **in parallel / opportunistically** alongside SP1–SP4 — every skill SP1–SP4 edits is
  swept *for free* as part of that work (e.g. `apex-stack` was already Opus-touched in cluster 3).

### SP6 — DeepSeek coding-context efficiency _(ongoing track)_

Everything that loads into the **coding (DeepSeek) context window per run** is a recurring cost, and
DeepSeek V4 Flash degrades faster than Claude on a bloated window. As the app grows (more specs, more
runs), this compounds. Goal: keep the per-run loaded set minimal *without* losing enforcement signal.

- **What loads per run (the audit surface):** the spec (`docs/changes/*.md`) · `apex-code` SKILL ·
  each bound `stack_skills` `impl.md` (recipe + patterns) · any capability `impl.md` for the task ·
  the latest handoff · `status.md`. Measure each; trim the fat.
- **Levers:**
  1. **Spec leanness** — the execution-script model (one-line identity, no *why*, files-per-task)
     already does most of this; audit live specs for drift back toward design-doc bloat.
  2. **`impl.md` structure — recipe + hard rules always-loaded; bulky reference patterns moved to
     `references/*.md` with explicit load conditions** (a pattern `apex-skill-author` already
     supports). The Verification Recipe and NEVER/ALWAYS blocks must stay; long worked examples
     need not load every run.
  3. **Enforce the 500-line cap** and "defaults not menus" — less prose, same behaviour control.
  4. **Selective section loading (open question below)** — can coding mode load *only* a bound stack
     skill's `## Verification Recipe` + gotchas, not the whole `impl.md`?
- **Applied now:** `apex-python`'s `impl.md` is authored lean from the start (RED proved the base
  model already nails FastAPI structure — spend lines only on uv-default, the pydantic×mypy gotcha,
  the security note, and the recipe).
- Ties to memory `parked-discussion-handover` (token-efficient specs / context minimisation for
  DeepSeek) and `be-token-efficient`.

---

## 4. Sequence

`0 ✅ → 1 → 2 → 3`, with **4** landing alongside any of them (low-risk, independent). SP2 depends on
SP1 because the composition rule needs a real stack skill to compose against; SP3 best follows 1–2 so
it wraps a working, composed build loop. **SP5 (skill sweep) and SP6 (context efficiency) run
continuously in parallel** — SP5 prioritised on app-critical capability skills and absorbing any
skill SP1–SP4 edits; SP6 applied to every `impl.md`/spec as it's authored (starting with
`apex-python`).

---

## 5. Open questions (resolve within the owning sub-project)

- **SP1:** `apex-swift` granularity (single vs language/UI split); which local vector store the
  Recipe assumes (or stays store-agnostic).
- **SP2:** capability-recipe layering order vs the stack recipe; the mismatch-guard mechanism;
  agent-dispatch-vs-impl trigger.
- **SP3:** does the thin-handoff + status.md In-Flight model survive project scale, or need a
  milestone layer above it?
- **SP5:** how deep is "improve" per skill (light refresh vs full re-author), and what's the
  baseline-test method per skill *type* (discipline → pressure, capability/reference → retrieval) —
  given the isolation gotcha (subagents get contaminated by repo roadmap/ADRs; forbid planning-doc
  reads during a sweep baseline).
- **SP6:** can coding mode load *only* a bound stack skill's `## Verification Recipe` + gotchas
  rather than the whole `impl.md`? Needs an `apex-code` loading-protocol change + an `impl.md`
  section convention (e.g. an always-load vs on-demand marker). Decide before the skill sweep (SP5)
  hardens ~38 `impl.md` structures, so the convention lands once.

---

## 6. Progress & proposed resolutions (planning session 16, 2026-05-31)

**SP0 ⚠️ PROVISIONAL** — stack pre-selected (SwiftUI + Python) from high-level answers, **not** from
real requirements, and against an **under-scoped target** (it was framed as a "second brain"; the real
app is a **Jarvis-like assistant that integrates with everything**, second brain = one subsystem —
see §1 scope correction). **Deferred: proper requirements-gathering for the WHOLE Jarvis platform →
decompose into subsystems → re-confirm or revise the stack — AFTER the APEX process is hardened and
BEFORE app `apex-init`.** SwiftUI + Python is a candidate seed only; a broad agent/integration
platform may pull the stack differently (the §2 reasoning may not survive the fuller picture).
**SP1 ✅ done** — `apex-python` (RED/GREEN validated, recipe run) + `apex-swift` (v0.1.0, recipe
PENDING Mac validation). Both triple-written + committed. _Note: built against the provisional stack.
`apex-python` is broadly useful regardless; `apex-swift` only applies if the all-Apple direction
survives the requirements pass — low sunk cost (research-grounded draft)._ Research in
`docs/research/{python,swift}-stack-best-practices.md`.

The rest are **proposed directions ⚠️ review-needed**, not yet implemented (each needs either the
app project to exist or its own Iron-Law skill edit):

- **SP4 — settings ✅ DECIDED (applies at app `apex-init`).** App-project defaults: `autonomy_level:
  L3` (user runs "auto mode" / AFK — confirmed), `token_profile` lean (ties SP6),
  `specialists_default` seeded with the security + AI specialists. _(Note: L3 runs the recipe but
  does **no git commits** — L4 adds commits; revisit if fuller AFK automation is wanted. APEX's own
  project stays L2 unless separately bumped.)_
- **SP2 — composition rule ✅ DECIDED: Method C (no new binding).** Research
  (`docs/research/sp2-capability-composition.md`) found capability skills are *stack-coupled*
  (`apex-search` = TS+pgvector), so A/B (any recipe binding) would inject wrong-stack commands.
  Decision: **no `capability_skills` binding**; capability skills stay planning-layer concept advice;
  the **stack recipe is the single verifier**; each capability `impl.md` gets a one-line
  `## Stack assumptions` header that planning checks against the bound stack and adapts on mismatch.
  Implementation moves off `apex-code` → onto `apex-skill-author` (the `## Stack assumptions`
  convention) + `apex-plan` (the mismatch-check) + **SP5** (de-couple `apex-search`/`apex-jobs`/
  `apex-storage` from JS/pgvector — now a top SP5 priority). App RAG choices (sqlite-vec + MLX) →
  app ADR at bootstrap. **Still open:** agent-wiring half (dispatch-vs-load-impl, 17 agents).
- **SP3 — large-scale project mgmt ✅ DECIDED: let it emerge.** Build the app's first real milestone
  with current tooling (thin handoff + `status.md` In-Flight), extract the pattern from experience,
  then formalise a milestone layer. No speculative process up front (YAGNI).
- **SP6 — context efficiency ✅ convention LANDED (2026-05-31).** Now in `apex-skill-author` v1.3.0
  + `apex-code` v1.6.0: an **always-load core** defined by *fixed section identity* (frontmatter +
  `## Stack assumptions` [capability only] + NEVER/ALWAYS + `## Verification Recipe` + a compact
  ≤~15-row `## Common errors → fix` table) and an **on-demand tail** in `references/<topic>.md` with
  inline load conditions. `apex-code` now loads the core (hard-rules **+** recipe — previously only
  the recipe, so the stack's NEVER/ALWAYS never reached the coder), not the whole file. SP2's
  `## Stack assumptions` one-liner rode the same schema (now a named core section). Full Iron-Law
  dogfood (user-authorised): RED divergence on file-naming / errors-table-disposition / flag-vs-identity
  → drove **identity-based core** + the **errors-table size rule**; GREEN reproduced the canonical
  structure + a correct pgvector→sqlite-vec `## Stack assumptions` line. Landed before SP5 hardens
  the ~38 `impl.md` files, as required. _Ongoing track remains: audit live specs for design-doc
  drift; apply the core/references split during each SP5 sweep._
- **SP5 — skill sweep.** Not started; triage order stands (app-critical capability skills first),
  with **de-coupling `apex-search`/`apex-jobs`/`apex-storage` from JS/pgvector now the top priority**
  (per the SP2 decision).
  `apex-python`/`apex-swift` count as Opus-native; `apex-stack`/`apex-code`/etc. already swept.
  ~36 remain. Ongoing track — run in dedicated sessions.
- **Cross-cutting:** Verification Recipes for `apex-swift` can only be *run-validated* once the Mac
  exists — until then they are authored-but-unproven (flag in SKILL-HISTORY as such).
