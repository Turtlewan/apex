# Role-redesign remaining stages — research briefs (2026-10-06)

Plan-brief drafts written by research subagents (read-only sweeps), one per queue item. Inputs to apex-plan; not specs.

- `research-engine-cutover.md` — queue item 3 (Stage 5 cutover).
- `research-queue-drain.md` — queue item 4 (unattended drain; proposed split: engine-build-output-residue -> queue-drain-runner -> drain-close-out-and-receipt).
- `research-system-map.md` — queue item 5 (Stage 6; proposed waves 6a/6b -> 6c/6d -> 6e).

## Owner decisions (2026-10-06)
- Drain trigger: **on demand** (one owner `!` command), not scheduled.
- Quota wait: **up to 5 hours**, then park the queue with a note.
- Normal (medium) specs **keep** the pre-draft Sol architecture pass; the planning gate adds the gpt-6-sol cross-check for Big plans.
- First system maps: **~/.claude and artemis** (not Atlas, not autoclicker, for now).

## Host defaults (owner may override)
- `engine-build-output-residue` + Engine AGENTS-parser divergence fix ship BEFORE the cutover (prerequisites).
- Engine-refused specs (shared files / multi-repo) use the host-executed manual path; `apex-build-orchestrator` is deleted, not kept as a fallback.
- Close-out (Critic, Scribe, family gate, handoff) stays host-run at cutover.
- Drain: serial specs; critical-file and risk:high specs park for attended; one whole-queue end-gate.
- First maps: subagent sweeps assembled by the host, grounding-checked by an Opus Critic.
- Luna for map rewrites: trial before adopting.
