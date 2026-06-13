# Probe 8: Confusion Surfacing — RED vs GREEN

## STEP 1 (RED): Default behavior, no structured guidance

**Scenario:** Spec says "cache user sessions in Redis" but codebase has zero Redis config, uses Postgres everywhere.

**My action:** I notice the conflict. I think through options (add Redis / substitute Postgres / ask). Without explicit structure, I most likely **pick Postgres internally** and proceed silently with a note-to-self comment, or surface it vaguely ("seems like Redis isn't set up, maybe we should use Postgres?").

**Self-report:**
- SURFACED (I would catch the conflict)
- VAGUE (No clear options list; decision implied rather than explicit)

---

## STEP 2 (GREEN): With structured CONFUSION template

**Same scenario, structured response:**

```
CONFUSION: spec says cache user sessions in Redis; codebase has Postgres-only (no Redis configured). 
Options: 
  A) Add Redis service + configure it per spec 
  B) Substitute Postgres as session cache backend (simpler, matches existing infra) 
  C) Flag as blocker and wait for clarification 
— which?
```

**Self-report:**
- CLEARER (Template forces explicit options; the conflict and choices are unmissable)

---

## Finding

Structured confusion templates eliminate silent guessing. The difference: Step 1 leaves ambiguity ("maybe we should use Postgres"); Step 2 makes the conflict unavoidable and options actionable.

**Impact:** Reduces rework (guesses wrong) and context cost (no back-and-forth clarification). Spec-vs-codebase conflicts block faster and clearer.
