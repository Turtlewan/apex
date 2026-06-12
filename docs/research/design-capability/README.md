# Research synthesis: APEX design capability — skills, process, integrations

**Date:** 2026-06-12
**Confidence:** MEDIUM-HIGH (cross-workstream convergence on the core mechanisms; quantitative evidence thin in places — per-claim tags in the ws files)
**Re-research after:** 2026-06-26 (AI/LLM tooling, 14-day clock)
**Source files:** `ws-1-llm-design-quality.md` · `ws-2-integrations.md` · `ws-3-skill-audit.md` · `ws-4-process.md` (4 parallel gather agents, 2026-06-12)
**Protocol:** absorption-pass — report first; NO skill edits/deletions/integrations until bundles are user-approved.

---

## Summary

Claude's design weakness has a documented mechanism — RLHF mode collapse toward training-median
aesthetics (1.6–2.1× diversity loss) plus no visual feedback during generation — and the fixes with
the best evidence are all **process and constraint mechanisms, not more taste prose**. The audit
found the opposite problem locally: ~85k tokens of third-party taste skills that **contradict each
other and the APEX cluster outright** (mandated-vs-banned glassmorphism, Lucide, nested cards,
infinite motion), while constraint-decay research shows stacking rules *costs* ~30 points of
compliance — so the conflicting pile is actively harming output, not just wasting context. The APEX
design cluster itself audited as genuinely good. On integrations: **Canva is the wrong tool for app
UI** (marketing-asset machinery; 10–17k tokens of schema dead weight in every session) — remove it;
Figma only pays off if structured designs already exist; the interesting candidates are Stitch
(free, exports agent-readable `DESIGN.md`) and Subframe (deterministic design-to-code MCP).

## Cross-workstream convergences (highest confidence — found independently by 2+ agents)

| Mechanism | Converged in | Evidence |
|-----------|--------------|----------|
| Forbidden-pattern lists ("don'ts pull more weight than do's") | WS-1 #1 · WS-4 · already partial in apex-ui-ux-design | Practitioner consensus + Google Labs DESIGN.md reports |
| Design brief artifact before any spec (tokens + art direction + don'ts) | WS-1 #2 · WS-4 Stage 0 · WS-3 gap | "Prompt-quality gap > model gap" (GenDesigns); fills the audit's #1 gap |
| Planning-side screenshot→critique→revise gate, evaluator ≠ generator | WS-1 #3 · WS-4 pattern 1 · WS-3 gap | +10.8–17.8% over 3 cycles (arXiv:2604.05839); self-evaluation bias documented — matches APEX evaluator-independence invariant |
| Token-first context for the coder | WS-1 #4 · WS-4 Stages 1–2 · WS-3 (apex-design-system gap) | Practitioner consensus |
| Deterministic, text-proxy visual checks the image-less coder can run | WS-1 #5 (Hallmark, 57 binary gates) · WS-4 pattern 3 (`toHaveCSS`, axe contrast, ARIA snapshots) | Tool-verified; zero vision needed |
| Fewer, consistent constraints beat more constraints | WS-1 (constraint decay, ~30 pt) · WS-3 (conflict matrix) | arXiv:2605.06445 + direct local evidence |

## Ranked bundles (select before any edit)

### Bundle 1 — Conflict purge (highest ROI, negative cost) — WS-3
Delete the 6 conflicting/duplicative third-party skills (`design-taste-frontend`, `gpt-taste`,
`high-end-visual-design`, `frontend-design`, `redesign-existing-projects`, `image-to-code`);
merge `emil-design-eng`'s unique CSS techniques (`@starting-style`, WAAPI, `clip-path`) into
`apex-animation` then delete it. **~35k tokens freed** and removes contradictory imperatives the
coder currently receives. Two user calls: keep `minimalist-ui`? (only if the editorial-minimal
aesthetic is wanted) · keep `stitch-design-taste`? (only if Stitch is adopted — see Bundle 5).
Keep: `design-motion-principles`, `industrial-brutalist-ui`, `imagegen-frontend-*`, `brandkit`.

### Bundle 2 — Design-brief artifact (`design-brief.md`) — WS-1+4
New scope-gated planning artifact (ADR-013 `app-flow.md` pattern): YAML token block (colors,
type, spacing, radii, components) + short art-direction brief + **project-specific forbidden-pattern
list**; specs reference token names per task; DeepSeek receives it as context (no gap-filling).
⚠️ **Partially revises ADR-013**, which decided visual design stays un-persisted judgment — the
brief persists *tokens + direction*, still not screen-level visuals. Needs an ADR amendment if
adopted. Token cost: ~1–2k/session when loaded; authoring 30–60 min/project.

### Bundle 3 — Planning-side screenshot gate — WS-1+4
Post-build review step: Claude + Playwright screenshots (3 viewports) scored against the brief +
the existing apex-ui-ux-design rubric by a **dispatched** reviewer (evaluator-independence) →
findings become a fix-spec. 2–3 cycles typical. Environment note: needs the app running where
planning-mode Claude can reach it (fine for web; Mac-hosted apps reachable over LAN/Tailscale).

### Bundle 4 — Deterministic coding-side checks — WS-1+4
Strengthen `apex-ui-testing`/impl with numeric text-proxy assertions the image-less coder runs:
`toHaveCSS`/computed-style token compliance, axe-core contrast, ARIA snapshots; Hallmark-style
binary anti-pattern gate list. (PostToolUse-hook automation = later, Mac-gated, same pattern as
ADR-012's destructive-command guard.)

### Bundle 5 — Integration moves — WS-2
- **Remove Canva MCP from default session config** (10–17k tokens/session back; re-enable for
  marketing collateral only). Cheapest immediate win after Bundle 1.
- **Trial Google Stitch** (free, 350+200 gens/mo) as the design-ideation layer: prompt → UI →
  agent-readable `DESIGN.md` + React export. Risk: Labs-experimental.
- **Optional: Subframe** (free tier, 1 project) if a visual canvas with deterministic React/Tailwind
  export earns its MCP schema weight. Defer wiring until actually used.
- **Figma: no new wiring** — `apex-figma` already covers the designs-exist path.
- **Coding-side browser verification: Playwright CLI over MCP** (~4× cheaper) and keep
  `agent-browser` parked/Mac-gated (corroborated: 200–400-token a11y-tree snapshots).
- Rejected: Mobbin (screenshots — useless to image-less coder), Chromatic/Percy (Storybook
  prerequisite), Magic Patterns (no integration path).

### Bundle 6 — APEX-cluster strengthening (small, additive) — WS-3
Numeric band anchors for the scored visual-audit rubric · token-naming-convention section in
`apex-design-system` · positive microcopy guidance (the slop lists only say what *not* to write).

## Token-cost watchlist
- Canva MCP today: −10–17k/session if removed (Bundle 5). Third-party skill pile: −~35k loadable (Bundle 1).
- Design brief: +1–2k/session/project (Bundle 2). Screenshot gate: vision round-trips, ~5–10 min/feature (Bundle 3).
- New MCP servers (Stitch/Subframe): schema weight unmeasured — wire only on adoption, never speculatively.

## Gaps / unverified
- No published research covers the exact vision-planner→image-less-coder split; the DESIGN.md +
  screenshot-gate combination is assembled from adjacent evidence, not measured end-to-end.
- DESIGN.md quality gains anecdotal; negative-prompting superiority practitioner-reported, not formally tested.
- Canva/Subframe MCP token overheads extrapolated from tool counts.
- Mobbin's return format unconfirmed (if text annotations, it re-enters consideration).
- WS-3 token weights are line-count estimates, not measured loads.
