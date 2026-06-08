# Spec: external-repo absorption-study dispatch recipe → apex-research

**Identity:** Codify the source-grounded, dedup-aware dispatch recipe + a reusable per-agent prompt
template for "study external repos / compare-and-absorb" passes into `apex-research`. Mechanics half
of the session-28 decision (framing half stays in the [[absorption-pass-protocol]] memory). Driven by
the 2026-06-05 online-repo pass (5/8 agents skipped cloning → confabulation).

## Files to change
1. `~/.claude/skills/apex-research/SKILL.md` (modify) — v1.1.0 → 1.2.0; backfill `description`
2. `~/.claude/skills/apex-research/references/external-repo-study-template.md` (create)
3. `~/apex/SKILL-HISTORY.md` (modify) — prepend 1 row

Registry/SKILLS.md: no change (no new domain, no activation change). Triple-write = SKILL-HISTORY only.

---

## Task 1 — `apex-research/SKILL.md`

### 1a. Frontmatter
- `version: 1.2.0`, `last_updated: 2026-06-05`.
- Backfill the missing `description` (trigger-style, per authoring contract):

```yaml
description: >
  Use when researching before a decision — comparing tools/options, verifying current best
  practice, or studying external repos/systems to absorb. Triggers: "research X", "compare A vs
  B", "is this still current", "study repo Y", absorption/compare-and-absorb passes. Spawns
  source-grounded parallel agents and synthesises with confidence + token-cost tags. Not the
  decision/spec itself (apex-plan) or an uncertain-approach deep dive (apex-deep-dive).
```

### 1b. Replace the body of `## Spawning parallel research agents` with:

```markdown
## Spawning parallel research agents

For multiple independent topics (e.g. comparing 3 tools), spawn one agent per topic:
```
Agent 1: Research Tool A — setup, performance, community, known issues
Agent 2: Research Tool B — same focus areas
Agent 3: Research Tool C — same focus areas
→ synthesise into one comparison table, score, recommend
```
Use `run_in_background: true` per agent, then synthesise together. Never spawn
overlapping agents — redundant research wastes runs.

### External-repo / absorption ("compare-and-absorb") passes

Studying real repos to decide what to adopt has two recurring failure modes — agents skipping
the source (confabulating stars/versions from web/training) and prompt-variance across
hand-written agents. Follow this recipe; use the per-agent prompt template in
**`references/external-repo-study-template.md`** (read it before dispatching such a pass):

1. **Scale to stakes.** Full parallel-clone ceremony only when results drive a real decision
   (an ADR or skill edit). A quick "what's in repo X?" is one agent, or inline.
2. **One agent per repo/facet, never overlapping. Fill the template — do NOT hand-roll
   divergent prompts.** Prompt variance is the root failure: a hedged "clone if helpful" in
   one prompt is the off-ramp a cheap model takes.
3. **Source-grounding is mandatory** (baked into the template): resolve URL first → `git clone`
   (required, not optional) → cite-or-drop → identity = URL + SHA + license-from-file.
4. **Model tier:** Sonnet gather + Opus synthesis by default (gather is mechanical; the judgment
   is in synthesis). Opus gather only when there is **no** synthesis layer (single-agent study)
   or the dedup is high-stakes/subtle. Escalate any thin/uncited result to Opus.
5. **`run_in_background` per agent**; agents write full analysis to disk and return a compact
   summary (keeps the orchestrator window lean).
6. **Verify before trusting** — check every result has `CLONED: yes` + cited candidates +
   URL/SHA *before* synthesising; re-dispatch (hardened) any that skipped grounding.
7. **Report first, no edits.** Synthesise dedup-across-agents (convergent candidates = highest
   confidence) + a token-cost watchlist + ranked bundles; let the user bundle-select before any
   skill edit (per the [[absorption-pass-protocol]] convention).
```

(Verify the `wc -l` stays under 500 after this — current 222 + ~30 lines.)

---

## Task 2 — create `apex-research/references/external-repo-study-template.md`

```markdown
# Per-agent prompt template — external-repo absorption study

Reusable skeleton for one agent studying one repo in a compare-and-absorb pass. Fill every
`{SLOT}`. Keep all five SOURCE-GROUNDING rules verbatim — they are the failure-mode fix.

---

You are a research agent in a {PASS_NAME} compare-and-absorb pass. Research ONE {TARGET_TYPE}
and decide what (if anything) {ABSORBER} should adopt. Report only — make NO edits.

## SOURCE-GROUNDING — MANDATORY
1. Resolve the EXACT repo URL first. {Either give the URL, OR: "Discover it — <search hints>.
   Discovery output = the confirmed URL only; do NOT let web snippets become the analysis."}
2. `git clone --depth 1 <url>` into a temp dir. REQUIRED, not optional. Capture the commit SHA
   (`git -C <dir> rev-parse --short HEAD`).
3. If the clone fails, say so explicitly and STOP — NEVER substitute web/training summaries for
   reading the source.
4. CITE-OR-DROP: every candidate must cite a real file path (ideally + line) from the clone, or
   drop it. Stars/versions from memory are untrusted — read from the repo or omit.
5. Identity line = resolved URL + commit SHA + license (read the LICENSE file) + a 1-line
   "what it actually is" from the cloned README. Count things by measuring (`find ... | wc -l`),
   never from memory.

## DEDUP BASELINE — tag every candidate already-have / partial / novel
{Paste the relevant current state of {ABSORBER} so overlap is skipped. The user asks for this
directly. For APEX: the skill inventory + what prior passes already absorbed.}

## LENS(ES)
{Define each lens. e.g. Lens A = add to APEX (the skill system); Lens B = add to Artemis (the
app being built). Judge each candidate per lens.}

## TOKEN-COST — tag every candidate Low / Med / High
= tokens burned WHEN USED. High = always-loaded content, many subagent spawns, or large
per-invocation loads. Flag HIGH loudly.

## DELIVERABLE
1. Write the FULL analysis to `{OUTPUT_DIR}/{name}.md`: identity (URL+SHA+license+what-it-is),
   notable mechanisms (each citing a file path), a candidate table — Candidate | Lens | Dedup |
   Token-cost | Verdict (ADOPT / ADOPT-with-guardrails / NOTE / REJECT) + one-line rationale,
   each citing a file — and a bottom line. If the clone failed, say so at the top and mark all
   findings UNVERIFIED.
2. Return a COMPACT summary (≤350 words): identity (URL+SHA) in 2 lines, top 3–5 candidates as a
   terse table, a one-line bottom line, and an explicit "CLONED: yes/no". Do NOT paste the full file.

Be dedup-hard; {ABSORBER}'s charter is leanness. If everything is already-have or a token trap,
say REJECT and explain. Confirm the file is written before returning.

---

## Orchestrator checklist (the dispatcher, not the agent)
- [ ] Scaled to stakes (full pass only if it drives an ADR/skill edit)
- [ ] One agent per repo; template filled, not hand-rolled
- [ ] Model tier chosen (Sonnet gather + Opus synth default; Opus gather if no synth layer)
- [ ] `run_in_background` per agent; outputs to disk, compact summaries back
- [ ] Every result verified `CLONED: yes` + cited + URL/SHA before synthesis; thin ones re-dispatched
- [ ] Synthesised dedup-across-agents + token-cost watchlist + ranked bundles; report-first
```

---

## Task 3 — `SKILL-HISTORY.md`
Prepend (format `Date | Skill | Files | Version | Event | What Changed | Sources`):

```
2026-06-05 | apex-research | SKILL.md, references/external-repo-study-template.md | 1.2.0 | updated (SKILL) | external-repo absorption dispatch recipe (mandatory-clone + cite-or-drop + tier policy + verify-gate) + reusable per-agent prompt template; description backfill | session-28 repo-study pass
```

---

## Acceptance criteria
1. `apex-research/SKILL.md` → verify: `version: 1.2.0`, `last_updated: 2026-06-05`, `description:` present and trigger-style; `## Spawning parallel research agents` contains the "External-repo / absorption" subsection with all 7 steps and the pointer to the references file.
2. `references/external-repo-study-template.md` exists; contains the 5 SOURCE-GROUNDING rules verbatim, the `{SLOT}` skeleton, and the orchestrator checklist.
3. Length cap → `wc -l apex-research/SKILL.md` ≤ 500 (expect ~250).
4. SKILL-HISTORY.md → 1 new row at top, columns correct.
5. **Lightweight Iron Law** (convention/process edit, per [[iron-law-application-depth]]): confirm a bare agent dispatching a repo-study pass omits ≥1 grounding step (clone/cite/verify) unprompted; confirm the recipe + template name the correction. Full RED/GREEN subagent dogfood not required.

## Commands to run
```
wc -l ~/.claude/skills/apex-research/SKILL.md
grep -n "External-repo / absorption" ~/.claude/skills/apex-research/SKILL.md
grep -c "SOURCE-GROUNDING" ~/.claude/skills/apex-research/references/external-repo-study-template.md
head -6 ~/apex/SKILL-HISTORY.md
```
