# Currency-check: apex-realtime — voice / WebRTC transport

_Planning-mode currency-check (research + proposed diff only; no skill edited). 2026-06-08._

## Verdict: GENUINE GAP
WebRTC and real-time voice (STT→LLM→TTS pipeline, barge-in, turn-taking, sub-second latency) appear **nowhere** in `apex-realtime` SKILL.md, impl.md, or registry keywords. The skill's transport decision is a two-value axis — **SSE (server→client) vs WebSocket (bidirectional)** — keyed only on *direction*. Live voice is a categorically different third tier the direction axis can't reach. The only "AI streaming" present is text-token SSE, which is the *wrong* tier for audio. Today an "add voice to my assistant" request would be mis-routed to SSE/WebSocket. Change is purely **additive** (nothing in the skill is wrong) and reuses existing invariants (auth-before-connect, identity-from-token, etc.).

## Evidence (2026)
1. **WebRTC is the right transport for live voice; WS/SSE are wrong.** ~20–40ms RTT vs WS ~200ms tail; ships AEC + noise-suppress + Opus + NAT traversal. Exception: PSTN/telephony → WS bridge fine. *(LiveKit "Why WebRTC beats WebSockets"; Prodinit)*
2. **Voice = an overlapped STT→LLM→TTS pipeline.** Streaming STT ~100ms partials → LLM TTFT ~200–400ms → streaming TTS ~200–400ms; user-stops→first-audio ≈ 600–900ms. Cost lives in turn-taking + LLM TTFT, not transport. *(Retell AI; AssemblyAI; Channel.tel)*
3. **Turn-taking/barge-in need a neural endpointing model, not a silence timeout** — provided by frameworks (LiveKit Agents v1.5.6, Pipecat); don't hand-roll. *(softcery; LiveKit)*
4. **Two architectures, pick explicitly:** speech-to-speech (OpenAI Realtime API — simplest) vs composed pipeline (max control). Don't point a browser straight at a model API — front it with your own agent/SFU. *(LiveKit; Forasoft)*
5. **Cheapest on-ramp = wrap an existing chat/RAG brain with one callback** (ElevenLabs Speech Engine — LLM/RAG untouched). Relevant when an apex-ai-systems/apex-search brain already exists. *(ElevenLabs; Deepgram)*

## Proposed change (minimal, dedup-aware)
~16 lines net to SKILL.md → new total ~170, well under the 500 cap:
- **SKILL.md `## Stack assumptions`** — add a 3rd transport bullet: "Live voice → WebRTC (not WS/SSE) via LiveKit Agents / Pipecat; don't hit a model API direct; PSTN exception → WS bridge."
- **SKILL.md protocol decision table** — 2 rows (live voice agent → WebRTC+framework; PSTN voice → WS bridge).
- **SKILL.md** — new ~8-line `## Voice pipeline (STT→LLM→TTS)` subsection (overlapped stages, turn-taking note, two architectures, ElevenLabs-wrap on-ramp).
- **registry `domains.md`** — append keywords: WebRTC, voice agent, STT, TTS, barge-in, turn-taking, LiveKit, Pipecat, OpenAI Realtime API, realtime audio.
- **impl.md `## Stack assumptions`** — 1 parallel bullet (~2 lines).
- **Stack-specific code stays OUT** of SKILL.md/impl.md → a new `references/voice-pipeline.md` (load-on-demand), matching the existing `references/socketio-typescript.md` convention. Flagged as a **separate larger follow-up**, not part of this minimal diff.

## Cross-skill note
Aligns with the Artemis M5 voice design (which already does barge-in via Silero + local pipeline) — but apex-realtime is stack-neutral, so the proposal names the cloud frameworks (LiveKit/Pipecat/OpenAI Realtime) with local swaps belonging in references/.
