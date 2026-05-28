# Spec: apex-google Skill

## Scope

New specialist skill covering **Google account & Workspace integrations** — OAuth2/OIDC with Google,
Sign in with Google, and the Workspace API surface (Gmail, Calendar, Drive). This is distinct from
`apex-gcp` (which handles Google Cloud Platform infrastructure). The focus here is on integrating
Google identity and Workspace services into applications: user auth via Google, reading/writing
mailboxes, calendar events, and files programmatically.

Creates:
- `~/.claude/skills/apex-google/SKILL.md` — planning mode
- `~/.claude/skills/apex-google/impl.md` — coding mode
- Registry entry in `~/.claude/registry/domains.md`
- Entry in `~/apex/SKILLS.md` quick reference table and Specialised section

---

## Files to change

| File | Action |
|------|--------|
| `~/.claude/skills/apex-google/SKILL.md` | Create (new directory) |
| `~/.claude/skills/apex-google/impl.md` | Create |
| `~/.claude/registry/domains.md` | Edit: append new row |
| `~/apex/SKILLS.md` | Edit: add row to quick reference table + Specialised section entry |

---

## Exact changes

### 1. Create `~/.claude/skills/apex-google/SKILL.md`

```markdown
---
skill: apex-google
version: 1.0.0
last_updated: 2026-05-27
sources:
  - Google Identity — developers.google.com/identity
  - Google Sign-In for Web (GIS) — developers.google.com/identity/gsi/web
  - Google OAuth2 — developers.google.com/identity/protocols/oauth2
  - Gmail API — developers.google.com/gmail/api
  - Google Calendar API — developers.google.com/calendar/api
  - Google Drive API — developers.google.com/drive/api
  - googleapis npm — github.com/googleapis/google-api-nodejs-client
staleness_threshold: 30d
---

# Google Account & Workspace Specialist — Planning Mode

## When to activate

Any time a project needs to interact with Google identity or Workspace services:
- "Add Sign in with Google" / "Google OAuth login"
- "Read emails from Gmail" / "Send calendar invites" / "Access Drive files"
- "Use a service account to access Google APIs"
- "What scopes do I need for X?"
- Designing a Google Workspace integration architecture

## Core decision: OAuth2 user credentials vs service account

| Credential type | When to use | Acts as |
|----------------|-------------|---------|
| **OAuth2 user flow** | App accesses data on behalf of a specific user | That user |
| **Service account** | App accesses its own data or domain-wide delegation | The service account |
| **Workload Identity** | GCP workload accessing Google APIs without key files | Service account (keyless) |

**Default:** use OAuth2 user flow unless you own the data (e.g. a company calendar).
Service accounts with domain-wide delegation are powerful — treat them like admin credentials.

## OAuth2 flow selection

| Flow | When | Notes |
|------|------|-------|
| **Authorization Code + PKCE** | Web apps, mobile apps | Most secure; use for user-facing apps |
| **Authorization Code (server-side)** | Server rendering with sessions | Store refresh token server-side, never client |
| **Client Credentials** | Service-to-service, no user | Not applicable to Google — use service account instead |

**Never use implicit flow** — deprecated by Google since 2019.

## Questions to ask before designing

- Does the app act on behalf of users or on its own data?
- Which Workspace APIs are needed? (determines scopes)
- Is this a web app, mobile app, or server daemon?
- Will users consent individually, or does an admin grant domain-wide access?
- Does the app need offline access? (requires `access_type=offline` + refresh token)
- Where will tokens be stored? (never in localStorage for sensitive scopes)

## Scope selection — principle of least privilege

Always request the narrowest scope that covers the use case:

| Need | Scope |
|------|-------|
| Read user profile + email | `openid email profile` |
| Read Gmail labels/subjects | `https://www.googleapis.com/auth/gmail.readonly` |
| Send email | `https://www.googleapis.com/auth/gmail.send` |
| Full Gmail access | `https://mail.google.com/` (requires verification for production) |
| Read calendar events | `https://www.googleapis.com/auth/calendar.readonly` |
| Create/edit calendar events | `https://www.googleapis.com/auth/calendar.events` |
| Read Drive files the user opens | `https://www.googleapis.com/auth/drive.file` |
| Read all Drive files | `https://www.googleapis.com/auth/drive.readonly` |

**Sensitive and restricted scopes** require Google's OAuth verification process before going to production (more than 100 users). Plan for 4–8 weeks verification time.

## Sign in with Google — web implementation checklist

Using the GIS (Google Identity Services) library:
- [ ] Load GIS from `https://accounts.google.com/gsi/client` (not the old `platform.js`)
- [ ] Use One Tap or the Sign In With Google button component
- [ ] Verify the `credential` JWT on the server — do not trust client-side
- [ ] Use Google's token info endpoint or a JWT library with Google's JWKS
- [ ] Extract user identity from verified JWT: `sub` (stable user ID), `email`, `name`, `picture`
- [ ] Never use `email` as the primary key — use `sub` (email can change)

## Token storage — security rules

| Token | Where to store |
|-------|---------------|
| Access token (short-lived, ~1h) | Memory (in-memory variable) |
| Refresh token (long-lived) | Server-side DB (encrypted), HttpOnly cookie |
| ID token | Verify server-side; discard after extracting claims |

**Never** store refresh tokens in localStorage, sessionStorage, or cookies without HttpOnly.

## Architecture patterns

### Pattern 1: User-delegated access (most common)
```
User → OAuth consent → Google → auth code → your server
Your server → exchanges code → access token + refresh token
Your server → stores refresh token encrypted in DB
Your server → uses access token to call Google APIs on user's behalf
```

### Pattern 2: Service account (backend daemon)
```
Service account JSON key (or Workload Identity on GCP)
→ google-auth-library creates JWT
→ Google token endpoint → short-lived access token
→ Call API directly
```

### Pattern 3: Domain-wide delegation (Google Workspace admin)
```
Admin grants service account permission to impersonate any user in the domain
→ Service account JWT with `sub` claim set to target user email
→ Access token impersonating that user
→ Call API as that user
```

## Review checklist

- [ ] Narrowest possible scopes requested — no over-permissioning
- [ ] Refresh tokens stored encrypted, server-side only
- [ ] Access tokens never in localStorage
- [ ] ID tokens verified server-side before trusting
- [ ] `sub` used as user identity (not `email`)
- [ ] Sensitive/restricted scopes identified — Google verification timeline planned
- [ ] Token refresh logic handles `invalid_grant` (revoked token) gracefully
- [ ] Service account keys (if used) stored in secrets manager, not in code or env files

## Hard blocks

- Do not store refresh tokens client-side under any circumstances
- Do not use `email` as the primary user identifier — it can change
- Do not request broad scopes (`drive`, `mail.google.com`) unless genuinely needed
- Do not skip server-side JWT verification for Sign in with Google
```

---

### 2. Create `~/.claude/skills/apex-google/impl.md`

```markdown
---
skill: apex-google
version: 1.0.0
last_updated: 2026-05-27
sources:
  - googleapis npm — github.com/googleapis/google-api-nodejs-client
  - google-auth-library — github.com/googleapis/google-auth-library-nodejs
  - Google Identity GIS — developers.google.com/identity/gsi/web
staleness_threshold: 30d
---

# Google Account & Workspace Implementation Rules

## NEVER do

- Store refresh tokens in localStorage, sessionStorage, or non-HttpOnly cookies
- Use `email` as the primary user key in your database — always use `sub`
- Skip server-side JWT verification for Sign in with Google credentials
- Commit service account JSON key files to source control
- Request `drive`, `mail.google.com`, or other broad scopes without explicit need
- Use the old `platform.js` GSI library (deprecated) — use the new GIS library

## ALWAYS do

- Use `google-auth-library` for all token exchange and refresh on the server
- Encrypt refresh tokens before storing in the database
- Handle `invalid_grant` errors by re-initiating OAuth flow (token was revoked)
- Use `googleapis` npm client — do not hand-roll API calls
- Verify returned tokens include expected scopes before storing

## OAuth2 client setup (Node.js)

```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI  // e.g. http://localhost:3000/auth/google/callback
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',        // get refresh token
  prompt: 'consent',             // force consent screen on every auth (to get refresh_token)
  scope: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar.readonly',
  ],
});

// Exchange code for tokens
const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);
// tokens.refresh_token — store this encrypted in DB
// tokens.access_token — use for immediate API calls (expires in ~1h)
```

## Token refresh pattern

```typescript
// On subsequent requests: load refresh token from DB, set credentials
oauth2Client.setCredentials({ refresh_token: storedRefreshToken });

// googleapis auto-refreshes when access_token is expired if refresh_token is set
// But handle revocation explicitly:
try {
  const { data } = await gmail.users.labels.list({ userId: 'me' });
  return data;
} catch (err) {
  if (err.code === 401 || err.message?.includes('invalid_grant')) {
    // Token revoked — clear from DB, redirect user to re-authenticate
    await revokeUserGoogleAuth(userId);
    throw new Error('GOOGLE_AUTH_REQUIRED');
  }
  throw err;
}
```

## Gmail API — common operations

```typescript
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// List messages
const res = await gmail.users.messages.list({
  userId: 'me',
  q: 'is:unread',
  maxResults: 10,
});

// Get full message
const msg = await gmail.users.messages.get({
  userId: 'me',
  id: messageId,
  format: 'full',  // 'minimal' | 'full' | 'raw' | 'metadata'
});

// Send email
await gmail.users.messages.send({
  userId: 'me',
  requestBody: {
    raw: Buffer.from(
      `To: recipient@example.com\r\nSubject: Hello\r\n\r\nBody text`
    ).toString('base64url'),
  },
});
```

## Calendar API — common operations

```typescript
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// List upcoming events
const events = await calendar.events.list({
  calendarId: 'primary',
  timeMin: new Date().toISOString(),
  maxResults: 10,
  singleEvents: true,
  orderBy: 'startTime',
});

// Create event
await calendar.events.insert({
  calendarId: 'primary',
  requestBody: {
    summary: 'Meeting',
    start: { dateTime: '2026-06-01T10:00:00+08:00' },
    end:   { dateTime: '2026-06-01T11:00:00+08:00' },
    attendees: [{ email: 'guest@example.com' }],
  },
});
```

## Drive API — common operations

```typescript
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// List files
const files = await drive.files.list({
  pageSize: 10,
  fields: 'files(id, name, mimeType, modifiedTime)',
});

// Download file content
const res = await drive.files.get(
  { fileId, alt: 'media' },
  { responseType: 'stream' }
);
```

## Service account setup

```typescript
import { google } from 'googleapis';

// Using a JSON key file (store path in env, never commit the file)
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

// Domain-wide delegation: impersonate a specific user
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/calendar'],
  clientOptions: { subject: 'user@yourdomain.com' },
});
```

## Sign in with Google — server-side verification (Next.js/Node)

```typescript
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleCredential(credential: string) {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error('Invalid credential');

  return {
    googleId: payload.sub,          // stable; use as foreign key
    email: payload.email!,
    emailVerified: payload.email_verified ?? false,
    name: payload.name,
    picture: payload.picture,
  };
}
```

## Environment variables

```env
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
# Service account (if used) — path to key file, not the key itself
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/run/secrets/google-sa-key.json
```

## Verification checklist

- [ ] OAuth2 client ID and secret in env vars — not hardcoded
- [ ] Refresh token encrypted before DB insert
- [ ] `invalid_grant` handler in place — clears token, redirects to auth
- [ ] Sign in with Google: `verifyIdToken` called server-side before any user creation
- [ ] `sub` (not `email`) stored as `googleId` foreign key
- [ ] Service account key file excluded from git (`.gitignore`) and stored in secrets manager
- [ ] Scopes are minimal — confirmed against actual API usage
```

---

### 3. Edit `~/.claude/registry/domains.md`

Append this row to the table (after the `research` row):

```
| google | apex-google/SKILL.md | apex-google/impl.md | — | Google, OAuth2, Sign in with Google, GIS, googleapis, google-auth-library, Gmail API, Calendar API, Drive API, Workspace, service account, Google SSO, OIDC Google |
```

---

### 4. Edit `~/apex/SKILLS.md`

**Quick reference table** — add row after the `homelab` row:
```
| **apex-google** | Google OAuth2, Sign in with Google, Gmail/Calendar/Drive APIs | topic keyword |
```

**Specialised section** — add entry after `apex-homelab`:
```
**apex-google** — Google OAuth2 / OIDC (Sign in with Google), Google Workspace API integration
(Gmail, Calendar, Drive), service account patterns, scope selection, token storage rules,
`googleapis` npm client, `google-auth-library`. Distinct from `apex-gcp` (infrastructure).
```

Also update the `_Updated:` line at the bottom:
```
_Updated: 2026-05-27 | Skills count: 29 APEX + 40 GSD + 15 misc_
```

---

## Acceptance criteria

- `~/.claude/skills/apex-google/SKILL.md` exists with frontmatter, When to activate, credential decision table, scope table, architecture patterns, review checklist, hard blocks
- `~/.claude/skills/apex-google/impl.md` exists with frontmatter, NEVER/ALWAYS, OAuth2 client setup, token refresh pattern, Gmail/Calendar/Drive examples, service account setup, Sign in with Google server verification
- `domains.md` has a `google` row with both SKILL.md and impl.md paths
- `SKILLS.md` quick reference table includes `apex-google`

---

## Commands to run

None — Markdown only.

---

## Risks / open questions

- **Skill name:** using `apex-google` rather than `apex-g` for clarity. If `apex-g` is preferred, the file paths and registry entry need to change.
- **Scope:** this spec covers OAuth2 + Workspace APIs. It does not cover Firebase Auth (even though that's a Google product) — Firebase has its own SDK and patterns. Add a note to the SKILL.md if Firebase Auth needs coverage.
