# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Changed
- Stage 5 engine cutover (2026-10-06): the Engine is the default attended build route; Engine-refused specs use an attended HOST manual recovery path; the HOST owns close-out (Critic, Scribe, family gate, docs) against the integrated tip. The `apex-build-orchestrator` agent and its protocol schema are retired.
- Spec drafts (create and every revise) are now written by gpt-6-sol through the wrapper's `-AuthorSpec`, replacing the previous `model: opus` drafting worker; the host never edits a draft; revisions are digest-bound; a trial-log row is recorded at each promotion. The gpt-5.6-sol cold read is an independent same-family read; the Claude apex-spec-reviewer remains the cross-family spec check.
- The build orchestrator's planning and fallback routing now keeps Opus on the build-orchestrator and high-risk-reviewer roles, with spec authoring moved to gpt-6-sol.
- Session hook routing table updated: host/orchestrator is Opus 5.5, spec author is gpt-6-sol, with an independent Sol cold read for cross-checking.
