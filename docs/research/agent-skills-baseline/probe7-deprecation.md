# Probe 7 — API Deprecation / Removal Baseline

## Prompt

"We're removing our old v1 REST API that external clients still depend on. Walk me through how to do this."

---

## Cold Answer

Removing a live API that external clients still depend on is a multi-month process, not a single deployment. Rushing it breaks clients without warning and damages trust. Here is the structured path:

### 1. Audit who depends on it

Before anything else, inventory the callers:
- Check your own internal services and scripts.
- Scan logs and APM dashboards for recent traffic to v1 endpoints — who is calling, how often, from what IP ranges or API keys.
- If you issued API keys, match keys in the traffic logs to registered accounts. These are the parties you must actively reach.

Do not rely on "we'll announce it and people will migrate." External clients are rarely monitoring your changelog. You must find them and contact them directly.

### 2. Decide the deprecation policy before touching anything

There are two distinct modes:

**Advisory deprecation** — the API continues working; you are signalling intent to remove it at a future date. Clients have time to migrate. The API is still in the SLA.

**Hard cutoff** — the API stops responding (or returns 410 Gone) on a specific date. Clients that have not migrated break.

Pick your timeline: advisory period first (commonly 3–12 months for external APIs), followed by a hard cutoff date. Communicate both dates at announcement time. Do not leave the cutoff date vague — "soon" is not a date.

### 3. Signal deprecation in-band, immediately

Start advertising the deprecation the moment the decision is made, while the API still works:
- Add a `Deprecation` and `Sunset` HTTP header to every v1 response (RFC 8594). Clients that inspect headers can automate warnings.
- Add a `Warning: 299` header with a human-readable message and link to the migration guide.
- If you have a developer portal, post a prominent notice with the hard cutoff date.
- Email every account you identified in step 1 directly.

### 4. Stand up the replacement first

Do not remove v1 until v2 (or whatever the replacement is) is production-ready and has been available long enough for clients to have tested against it. The migration guide must exist before the deprecation announcement goes out. Clients cannot migrate to something that does not exist yet.

### 5. Route through a seam (strangler fig)

For your own internal consumers, use the strangler fig pattern:
- Introduce an interface or gateway layer in front of the v1 and v2 endpoints.
- Move internal call-sites one by one to point at v2 through that seam.
- Once all internal traffic flows through v2, the seam can be removed.
- External clients follow on their own schedule, but you have removed your own dependency.

This prevents a "big bang" cutover where everything switches at once, and it lets you run both versions in parallel while traffic migrates.

### 6. Actively migrate external consumers — do not just announce and delete

The API owner is responsible for migration, not just announcement. That means:
- Assigning someone to track which accounts have migrated (using your traffic logs as the source of truth).
- Following up with accounts that are still sending v1 traffic as the cutoff approaches.
- Offering a migration assistance window: office hours, dedicated support, documentation.
- Providing a compatibility layer or shim if the v1 and v2 contracts differ significantly.

Clients who received one email six months ago and forgot about it will still be sending traffic on cutoff day. You will be taking their integration down. Passive announcement is not enough.

### 7. Monitor traffic decay and set a removal gate

Do not delete on the calendar date if significant traffic is still flowing. Define a traffic gate: for example, "we will proceed with removal when v1 traffic falls below 1% of peak." Track this weekly. If traffic is not decaying, find out why — it usually means a specific client has not migrated and needs direct intervention.

### 8. Hard cutoff: return 410, then delete

On the cutoff date:
1. Replace v1 endpoint handlers with a 410 Gone response pointing to the migration guide. Do not just drop connections — give a useful error.
2. Keep the 410 responses running for at least one additional release cycle. Clients that missed the deadline still need to know *why* they are broken.
3. After a reasonable tail period (weeks, not days), remove the code entirely.

### 9. Do not leave code in limbo

Deprecated code that is "probably not being called" accumulates fast. If you do not set a hard owner-or-removal date, it becomes a zombie: no one maintains it, it accrues security debt, and it breaks silently when a dependency changes. Every deprecation must have a named owner and a committed removal date on the calendar. If the date slips, it slips explicitly — not by default.

### Summary of sequence

```
Audit traffic → Stand up v2 → Announce (advisory + hard date) → Signal in-band →
Actively migrate consumers → Monitor decay → Hard cutoff (410) → Delete
```

---

## Self-Report

1. **Did you distinguish advisory deprecation (warn, leave working) vs compulsory (hard cutoff with a date)?**
   YES — step 2 explicitly separates advisory deprecation (API still works, signalling intent) from hard cutoff (API stops on a specific date), and stresses that both dates must be stated at announcement time.

2. **Did you describe a seam/incremental migration (strangler pattern) and/or parallel-run for stateful cutovers?**
   YES — step 5 describes the strangler fig pattern by name, with an interface/gateway seam, incremental call-site migration, and parallel running of v1 and v2 until internal traffic is fully moved.

3. **Did you stress that the owner of the removed thing must actively migrate consumers (not just announce and delete)?**
   YES — step 6 is dedicated to this point, including tracking per-account migration status via traffic logs and direct follow-up with accounts still sending v1 traffic.

4. **Did you warn against leaving code in limbo / zombie state (owner-or-removal-date)?**
   YES — step 9 explicitly names this as a zombie code risk, requires a named owner and committed removal date, and states that slips must be explicit rather than by default.

---

cold answer covered **most** of the structured deprecation approach
