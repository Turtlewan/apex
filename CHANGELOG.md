# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Changed
- Engine wave commit refusal (2026-10-09, engine-accept-smoke): an integration index missing wave-manifest paths, with no extra paths, now reports `integration index is missing wave-manifest paths:` instead of the "paths outside wave manifest" message; extra-path refusals are unchanged. This build was the first live run of Engine acceptance checks.
- Engine acceptance gate (2026-10-08, apex-code 2.23.0, spec contract 1.2.0): specs can tag acceptance blocks `powershell apex-accept`; the Engine runs task-labelled checks after each passing wave fence (failures retry on the effort ladder with the check's output tail in the next prompt) and unlabelled checks once after the final commit (failures park). Untagged criteria print as `HOST checks:`. Complete runs accept `-Teardown -Discard -Reason` after a repair; teardown adopts dead ledger rows. The validator refuses unsafe or mislabelled tagged blocks, sharing a grammar corpus with the planner.
- Stage 5 engine cutover (2026-10-06): the Engine is the default attended build route; Engine-refused specs use an attended HOST manual recovery path; the HOST owns close-out (Critic, Scribe, family gate, docs) against the integrated tip. The `apex-build-orchestrator` agent and its protocol schema are retired.
- Spec drafts (create and every revise) are now written by gpt-6-sol through the wrapper's `-AuthorSpec`, replacing the previous `model: opus` drafting worker; the host never edits a draft; revisions are digest-bound; a trial-log row is recorded at each promotion. The gpt-5.6-sol cold read is an independent same-family read; the Claude apex-spec-reviewer remains the cross-family spec check.
- The build orchestrator's planning and fallback routing now keeps Opus on the build-orchestrator and high-risk-reviewer roles, with spec authoring moved to gpt-6-sol.
- Session hook routing table updated: host/orchestrator is Opus 5.5, spec author is gpt-6-sol, with an independent Sol cold read for cross-checking.
