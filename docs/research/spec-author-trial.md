# Spec-author trial log

One row per spec promotion (apex-plan § promotion; ADR-048). Counts come from the spec's `.review.log` sidecar, appended before the sidecar is deleted.

| date | repo | spec | author models | reviewer-family rounds | Sol rounds | intent drift | notes |
|---|---|---|---|---|---|---|---|
| 2026-10-01 | C:\Users\User\.claude | spec-author-routing | gpt-6-sol create x1; revise gpt-6-sol x6 | 3 | 2 | n | pre-convention sidecar (author dispositions not `launched`; all executed author rows counted); 1 pre-draft arch check excluded; final Sol read parked → owner fix-then-promote; 1 false exit 65 from host writes during author run |
| 2026-10-01 | C:\Users\User\.claude | routing-build-asides | gpt-6-sol create x1; revise gpt-6-sol x2 | 1 | 2 | n | pre-convention sidecar; 1 VOID Sol read (memory-pressure reaper) excluded; final Sol read parked → owner fix-then-promote |
| 2026-10-01 | C:\Users\User\.claude | routing-session-hook | gpt-6-sol create x1; revise gpt-6-sol x3 | 2 | 2 | n | pre-convention sidecar; 1 VOID Sol read excluded; final Sol read parked → owner fix-then-promote |
| 2026-10-02 | C:\Users\User\.claude | critic-consolidation | gpt-6-sol create x1; revise gpt-6-sol x2 | 3 | 1 | n | first spec under ADR-048 author rules; create exit 68 (benign host-dirt note) owner-accepted; sol-1 BLOCK 8B advisory (medium) simplified; round 3 CLEAN; row appended just after sidecar deletion (host script error), data from session record |
| 2026-10-02 | C:\Users\User\.claude | exec-manifest | gpt-6-sol create x1; revise gpt-6-sol x2 | 3 | 1 | n | first spec reviewed by apex-critic (rounds 2-3); sol-1 BLOCK 5B advisory (medium) adjudicated; split-rule exception owner-confirmed at digest |
| 2026-10-02 | C:/Users/User/.claude | engine-core | gpt-6-sol create x1; revise gpt-6-sol x4 | 4 | 4 | n | risk high; arch-2 unparked by owner; critic + Sol concurrent each round; revise-2 killed by host low-memory reap, adopted and resumed; round-3 escalation, owner (b) one extra cycle; promoted under pre-committed pass-or-park, round-4 flag + sol-4 9B accepted as wave-2 backlog |
| 2026-10-04 | C:/Users/User/.claude | engine-hardening | gpt-6-sol create x1; revise gpt-6-sol x2 | 3 | 1 | n | risk medium; arch-1 BLOCK (2B/2F, all accepted pre-draft); Critic r1 block -> r2 clean -> r3 clean (Sol-driven revise); sol-1 BLOCK advisory, 9 accepted, 1 rebutted (T3/T6 split kept: attended build path); first arch dispatch not-launched (prompt arg-split via powershell -File) |
