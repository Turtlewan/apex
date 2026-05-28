## Intent

apex-auth guides authentication implementation for any app — covering auth flows
(signup, login, logout, password reset, magic links, OAuth2 providers, MFA), session
management, passkeys/WebAuthn, RBAC, and multi-tenant auth (per-tenant roles, tenant
isolation, invite flows). Distinct from apex-security (which threat-models the implementation)
— this skill answers: "how do I build auth?"

## Research tasks (DeepSeek executes these FIRST before writing any skill content)

Before writing SKILL.md or impl.md, research and verify the following. Update any
preset recommendations in this spec based on findings. Tag each finding as
[VERIFIED], [ASSUMED], or [COMMUNITY].

1. **Auth.js v5 status** — is it stable/GA or still beta? What is its multi-tenant support
   story? Search: "Auth.js v5 stable release 2025" and check authjs.dev changelog.

2. **Better Auth** — current version, multi-tenant (organizations) support, TypeScript-first
   patterns, self-hosted DB schema. Check betterauth.dev docs.

3. **Passkeys / SimpleWebAuthn** — current @simplewebauthn/server + @simplewebauthn/browser
   version, registration and authentication flow patterns, credential storage schema.
   Check simplewebauthn.dev.

4. **Lucia v3** — is it actively maintained? Any deprecation notice? Check github.com/lucia-auth/lucia.

5. **Clerk organizations pricing** — what does multi-tenant (orgs feature) cost at 1k / 10k / 100k MAU?
   Check clerk.com/pricing.

6. **argon2 in Node.js** — current recommended package (`@node-rs/argon2` vs `argon2`)
   and whether it works in edge runtimes (Vercel Edge, Cloudflare Workers).

Write a ## Research findings section at the top of the output SKILL.md with a 1-line
summary per item tagged [VERIFIED/ASSUMED/COMMUNITY]. Then use findings to fill in
the library decision table and any version-specific guidance in impl.md.

## Key decisions

### SKILL.md content

**When to activate — trigger phrases:**
- "add auth" / "authentication" / "login" / "signup"
- "user sessions" / "session management"
- "OAuth2 / social login / sign in with Google/GitHub"
- "roles" / "RBAC" / "permissions"
- "passkeys" / "WebAuthn"
- "multi-tenant auth" / "per-tenant roles" / "org members"
- "password reset" / "magic link"
- "MFA" / "two-factor"

**6 questions to ask before designing (in order):**
1. Single-tenant or multi-tenant? (biggest architecture fork — affects library choice and DB schema)
2. Auth methods needed? (email+password / magic links / OAuth2 providers / passkeys / MFA — tick list)
3. Which OAuth2 providers? (Google / GitHub / Microsoft / Apple / others)
4. Where is the app running? (edge/serverless vs Node.js server — affects session storage)
5. Role complexity? (simple admin/user OR fine-grained permissions per resource)
6. Invite flow needed? (users invited to tenant by email vs self-service signup)

**Library decision table (update versions/status from research findings):**

| Scenario | Library | Why |
|----------|---------|-----|
| Single-tenant, many OAuth2 providers | Auth.js v5 | Large provider ecosystem, framework-agnostic |
| Multi-tenant, full control, self-hosted | Better Auth | Multi-tenant/orgs built-in, TypeScript-first |
| Minimal, custom flows, any DB | Lucia v3 | No magic, you own the session logic |
| Best DX, willing to pay at scale | Clerk | Orgs built-in, hosted, best UI components |
| Already on Supabase | Supabase Auth | Row-level security integrates natively |

**Session vs JWT decision table:**

| Use case | Recommendation | Reason |
|----------|---------------|--------|
| SSR app (Next.js, Remix) | Database-backed sessions | Instant revocation, no token leakage |
| Multi-tenant app | Database-backed sessions | Tenant context in session, revoke on org change |
| Stateless API / microservices | JWT (short-lived + refresh rotation) | No DB per request |
| Edge runtime | JWT or signed cookies | No DB access at edge |

JWT refresh rotation rule: access token 15min + refresh token 30d, rotate refresh on every use,
invalidate old refresh token immediately after rotation.

**Multi-tenant auth section (required — user confirmed needed):**

Tenant resolution strategies (list all three, note trade-offs):
- Subdomain: `acme.yourapp.com` — cleanest UX, requires wildcard DNS/SSL
- Path: `yourapp.com/org/acme` — simpler infra, less URL isolation
- Custom domain: `acme.com` → your app — most premium, complex routing

DB schema pattern (write as a diagram/table):
```
users       (id, email, passwordHash, createdAt)
tenants     (id, slug, name, createdAt)
memberships (id, userId, tenantId, role, createdAt)  ← role lives HERE not on user
invites     (id, email, tenantId, role, token, expiresAt, acceptedAt)
```

Per-tenant roles rule: role is stored on `memberships`, never on `users`.
A user can be `admin` in tenant A and `member` in tenant B.

Invite flow steps:
1. Admin creates invite record with hashed token, sets expiresAt
2. App sends invite email with token link (or renders link if no email skill)
3. Recipient clicks link → verify token not expired, not already accepted
4. If user exists: create membership. If not: signup → create membership
5. Mark invite acceptedAt, redirect to tenant

Cross-tenant access prevention rule:
Every query that touches tenant-scoped data must include `WHERE tenantId = session.tenantId`.
Never derive tenantId from URL params or request body — always from server-side session.

**Passkeys / WebAuthn section (required — user confirmed needed):**

Library: `@simplewebauthn/server` (Node) + `@simplewebauthn/browser` (client)

Credential storage schema:
```
passkey_credentials (
  id, userId, credentialId (unique), publicKey, counter,
  deviceType, backedUp, transports, createdAt
)
```

Registration flow (4 steps):
1. Server generates options via `generateRegistrationOptions()`, stores challenge in session
2. Client calls `navigator.credentials.create()` via `startRegistration()`
3. Client sends response to server; server calls `verifyRegistrationResponse()`
4. On success: save credential to DB, clear challenge from session

Authentication flow (4 steps):
1. Server generates options via `generateAuthenticationOptions()`, stores challenge in session
2. Client calls `navigator.credentials.get()` via `startAuthentication()`
3. Client sends response to server; server calls `verifyAuthenticationResponse()`
4. On success: update credential counter in DB, create session

Replay attack prevention: always verify `counter` is greater than stored value.
Always offer password/magic link fallback — passkeys may not be available on all devices.

**RBAC patterns:**

Simple (most apps): `role` enum on `memberships` — `admin | member | viewer`
Fine-grained: `permissions` string array on membership or separate `role_permissions` table

Route protection pattern: middleware reads session, checks role before handler runs.
Never check permissions inside the handler after doing DB work — fail early.

**Hard blocks:**
- Never store passwords without argon2id or bcrypt (cost ≥ 12) hashing
- Never log tokens, session IDs, or raw passwords anywhere
- Never return password hash in any API response
- Never trust role/permission claims from client — always read from session or DB
- Never share session context across tenants — tenantId must come from server-side session only
- Never return "User not found" vs "Wrong password" as separate errors (user enumeration)

**Review checklist:**
- [ ] Passwords hashed with argon2id or bcrypt (cost ≥ 12)
- [ ] Session cookies: httpOnly, Secure, SameSite=Lax
- [ ] All protected routes check auth in middleware, not inside handler
- [ ] Multi-tenant: every tenant-scoped query uses tenantId from session
- [ ] OAuth2 state parameter validated on callback (CSRF)
- [ ] Refresh token rotation implemented if JWT strategy chosen
- [ ] Passkey counter verified and updated on each authentication
- [ ] Generic error messages on auth failure (no user enumeration)
- [ ] Invite tokens hashed in DB (not stored raw)

**Frontmatter for SKILL.md (update last_updated and sources from research):**
```yaml
skill: apex-auth
backend: claude
version: 1.0.0
last_updated: 2026-05-28
sources:
  - Auth.js Docs — authjs.dev
  - Better Auth Docs — better-auth.com
  - SimpleWebAuthn Docs — simplewebauthn.dev
  - Lucia Docs — lucia-auth.com
  - WebAuthn Spec — w3.org/TR/webauthn-3
  - OWASP Auth Cheat Sheet — cheatsheetseries.owasp.org
staleness_threshold: 30d
```

---

### impl.md content

**NEVER do:**
- Hash passwords with MD5, SHA-1, SHA-256, or any reversible method
- Store session tokens in localStorage — httpOnly cookies only
- Put auth checks inside route handlers after DB work has started — middleware first
- Derive tenantId from URL params, query strings, or request body
- Return different error messages for "user not found" vs "wrong password"
- Share JWT secrets across environments
- Skip verifying the WebAuthn counter on passkey authentication

**ALWAYS do:**
- Hash passwords with argon2id (preferred) or bcrypt, cost factor ≥ 12
- Set cookies: `httpOnly: true, secure: true, sameSite: 'lax', path: '/'`
- Scope every tenant query to `tenantId` pulled from server-side session
- Return `{ error: 'Invalid credentials' }` for all auth failures (generic)
- Rotate refresh tokens on every use and invalidate the previous one immediately
- Invalidate all sessions when user changes password

**Code example — password hashing (argon2id):**
```typescript
import { hash, verify } from '@node-rs/argon2'

// On signup
const passwordHash = await hash(password, {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
})

// On login
const valid = await verify(storedHash, password)
if (!valid) return { error: 'Invalid credentials' }
```

**Code example — session cookie config:**
```typescript
res.cookie('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
})
```

**Code example — multi-tenant query scoping:**
```typescript
// CORRECT — tenantId from session, never from request
const { tenantId, userId } = session

const items = await db.item.findMany({
  where: { tenantId, deletedAt: null },
})

// WRONG — never do this
const tenantId = req.params.tenantId // attacker can spoof
```

**Code example — route protection middleware:**
```typescript
// Check auth before handler, not inside it
async function requireAuth(req, res, next) {
  const session = await getSession(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  req.session = session
  next()
}

async function requireRole(role: string) {
  return async (req, res, next) => {
    if (req.session.role !== role) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}
```

**Verification checklist:**
- [ ] `npm run build` — 0 TypeScript errors
- [ ] POST /signup with weak password → 400 error (not 500)
- [ ] POST /login wrong password → "Invalid credentials" (not "Wrong password" or "User not found")
- [ ] Accessing protected route without session → 401
- [ ] Accessing protected route with wrong role → 403
- [ ] Multi-tenant: user in tenant A cannot access tenant B's data
- [ ] Session cookie in DevTools: httpOnly ✓, Secure ✓, SameSite=Lax ✓

**Frontmatter for impl.md (update from research):**
```yaml
skill: apex-auth
backend: deepseek
version: 1.0.0
last_updated: 2026-05-28
sources:
  - Auth.js Docs — authjs.dev
  - Better Auth Docs — better-auth.com
  - SimpleWebAuthn Docs — simplewebauthn.dev
  - OWASP Auth Cheat Sheet — cheatsheetseries.owasp.org
staleness_threshold: 30d
```

---

### Registry row to add in `~/.claude/registry/domains.md`

```
| auth | apex-auth/SKILL.md | apex-auth/impl.md | — | authentication, auth, login, signup, logout, password, session, JWT, OAuth2, RBAC, roles, permissions, multi-tenant, passkeys, WebAuthn, MFA, magic link, invite |
```

### SKILLS.md additions in `~/apex/SKILLS.md`

Quick reference table row:
```
| **apex-auth** | Authentication flows, sessions, OAuth2, passkeys, RBAC, multi-tenant auth | topic keyword |
```

New entry under the **Application development** section (after apex-stack):
```
**apex-auth** — Authentication implementation. Covers signup/login/logout, password reset,
magic links, OAuth2 social providers, MFA, passkeys/WebAuthn, session management (stateful
vs JWT refresh rotation), RBAC, multi-tenant auth (per-tenant roles, invite flows, tenant
isolation), and route protection patterns. Library decision table: Auth.js, Better Auth,
Lucia, Clerk, Supabase Auth.
```

### SKILL-HISTORY.md row to prepend in `~/apex/SKILL-HISTORY.md`

```
| 2026-05-28 | apex-auth | SKILL + impl | 1.0.0 | created | Auth flows, sessions, OAuth2, passkeys/WebAuthn, RBAC, multi-tenant auth, invite flows | Auth.js Docs, Better Auth Docs, SimpleWebAuthn Docs, OWASP Auth Cheat Sheet |
```

## Gotchas / edge cases

- **argon2 at edge**: `argon2` npm package uses native bindings and does NOT run in Cloudflare
  Workers or Vercel Edge Runtime. Use `@node-rs/argon2` (WASM-based) for edge compatibility.
  Research task #6 should confirm current best package.

- **Better Auth vs Auth.js for multi-tenant**: Auth.js does not have built-in multi-tenant/org
  support — it requires significant custom work. Better Auth has organizations as a first-class
  plugin. The library table must make this distinction clear.

- **WebAuthn counter must be stored and verified**: Many tutorials skip counter verification.
  The impl.md must include it explicitly — omitting it allows credential cloning attacks.

- **Invite token storage**: Store a bcrypt/argon2 hash of the invite token in the DB, not the
  raw token. The raw token only exists in the email link. Treat it like a password.

- **tenantId in JWT payloads**: If using JWT, include `tenantId` in the payload but ALWAYS
  re-verify tenant membership from DB on sensitive operations — JWT payload is not invalidated
  if membership is revoked.

- **OAuth2 state parameter**: Many implementations skip CSRF validation on the OAuth callback.
  The review checklist must explicitly check for state validation.

- **Session invalidation on password change**: When a user changes their password, all existing
  sessions (including current one) must be invalidated. This is commonly missed.

- **SKILL-HISTORY.md prepend**: coding mode must prepend, not append. File is newest-first.

## Files to touch

- `~/.claude/skills/apex-auth/SKILL.md` — create (new skill, planning-mode guidance)
- `~/.claude/skills/apex-auth/impl.md` — create (new skill, coding-mode patterns)
- `~/.claude/registry/domains.md` — add `auth` row (see exact row above)
- `~/apex/SKILLS.md` — add quick-ref table row + Application development entry
- `~/apex/SKILL-HISTORY.md` — prepend creation row (see exact row above)
