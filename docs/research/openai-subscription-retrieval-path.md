# OpenAI Subscription vs API — Web Retrieval Path Investigation

**Phase:** 2 — Retrieval (facts only; no recommendation)
**Date:** 2026-06-28
**Commissioned by:** apex-research three-phase contract
**Prior agent conclusion:** Cheap OpenAI models can do web retrieval via the OpenAI API `web_search` tool ($0.01/call, pay-per-token), NOT via the ChatGPT/Codex subscription (codex exec --search = snippets only). User is challenging whether the subscription path can do capable full-page retrieval "for free at the margin."

---

## Question 1 — Are the ChatGPT/Codex SUBSCRIPTION and the OpenAI API two SEPARATE billing products?

**Finding: YES — completely separate billing systems.** [VERIFIED]

- ChatGPT and the OpenAI API platform use **independent billing systems**. Charges and billing history are managed separately. [VERIFIED — OpenAI Help Center: "Managing Billing Settings in ChatGPT vs Platform" (https://help.openai.com/en/articles/9039756-billing-settings-in-chatgpt-vs-platform)]
- A ChatGPT Plus subscription ($20/month) provides enhanced access to chat.openai.com. It does **not** include any OpenAI API credits, API access, or the ability to make programmatic API calls. [VERIFIED — multiple OpenAI help articles + toolcolumn.com/learn/chatgpt-subscription-vs-openai-api-pricing]
- This separation extends across **all** subscription tiers: ChatGPT Pro ($200/month), Business, and Enterprise subscriptions **do not** include API credits or reduce API usage costs. [VERIFIED — community.openai.com/t/api-access-without-paying-for-a-chatgpt-plus-subscription/330848]
- Codex is **included in every ChatGPT plan** (Free, Go, Plus, Pro, Business, Enterprise/Edu) via ChatGPT sign-in. The subscription gives you Codex subject to 5-hour-window rate limits. This is **not** API access — it is the same ChatGPT subscription billing, separate from the platform. [VERIFIED — developers.openai.com/codex/pricing]
- The **API key route** for Codex CLI is a different path: it bills per-token at standard OpenAI API rates (gpt-5.3-codex: $1.75/M input, $14.00/M output) with **no subscription** required. [VERIFIED — developers.openai.com/codex/pricing]

**Short answer:** Subscription (ChatGPT sign-in for Codex) and the OpenAI API are two separate billing products. The subscription does not include any API credits.

---

## Question 2 — Within the ChatGPT/Codex SUBSCRIPTION, is there ANY path for FULL-PAGE web retrieval non-interactively?

**Finding: NO.** [VERIFIED]

### Codex CLI web search — what it actually returns

Codex CLI ships with a built-in web search tool enabled by default (subscription path):

| Mode | How enabled | What is returned |
|------|------------|-----------------|
| `cached` (default) | Always on | Snippets from an OpenAI-maintained pre-indexed cache. Does **not** fetch live pages. |
| `live` | `--search` flag or `web_search = "live"` in config | Live snippets from the web. Still does **not** scrape or return full page body content. |
| `disabled` | `web_search = "disabled"` | No web search tool available. |

**Critical detail:** [VERIFIED — firecrawl.dev/glossary/web-search-apis/codex-cli-agent-browse-web]:
> "the built-in search returns snippets only and does not scrape page content"
> Cannot read page content, perform multi-page crawls, or extract structured data.

The `codex exec --search` flag activates live mode but the return is still snippets — the prior agent's claim that "codex exec --search = snippets only" is **confirmed correct**. [VERIFIED]

As of Codex CLI v0.142.0 (June 22 2026), an indexed web-search mode was added that "permits live searches while restricting direct page access to server-approved URLs" — which further confirms full page access is not available to arbitrary URLs in the subscription path. [VERIFIED — releasebot.io/updates/openai/codex]

### ChatGPT browsing (subscription)

ChatGPT Plus/Pro subscribers can use web browsing within the **interactive ChatGPT interface** (chat.openai.com). This can retrieve page content and produce cited answers. However:
- It is **interactive only** — tied to the user session in the ChatGPT UI.
- There is **no programmatic/non-interactive API** to invoke ChatGPT's browsing from code or a script. [VERIFIED — no such API surface exists in any OpenAI documentation]
- It is not invokable via `codex exec` or any CLI/SDK path. [ASSUMED based on absence of any such capability in Codex/API docs]

### Workaround (not subscription-native)

The Firecrawl documentation explicitly identifies this gap and recommends pairing Codex with Firecrawl (via MCP or CLI) to get full-page content — confirming that Codex alone cannot do it. This is a **third-party tool**, not a subscription-billed OpenAI capability. [VERIFIED — firecrawl.dev glossary page]

---

## Question 3 — Does Codex "Browser Use" / the Chrome extension offer programmatic/non-interactive full-page retrieval subscription-billed?

**Finding: NO — not available non-interactively.** [VERIFIED]

### Codex browser use (in-app)

- Codex includes an embedded browser view where the AI agent can "load webpages or local dev servers," click, type, inspect DOM state, and take screenshots. [VERIFIED — chierhu.medium.com/openai-codexs-browser-use-feature-b7dffa761d45]
- This is an **interactive feature** within the Codex UI (web or desktop app). It is **tied to a user session** and cannot be invoked headlessly or non-interactively. [VERIFIED]
- A feature request for "Headless Codex computer-use (server-side UI automation)" was **explicitly declined** by OpenAI staff (closed with "can't promise implementation or provide a timeline"). [VERIFIED — community.openai.com/t/feature-request-headless-codex-computer-use-server-side-ui-automation/1379625]
- The embedded browser **lacks authentication support**, making it unsuitable for pages requiring login. [VERIFIED — Medium article above]

### Codex Chrome Extension (May 2026 launch)

- The Chrome extension allows Codex to **drive your actual Chrome profile** (not a headless browser), operating within authenticated sessions for sites like Salesforce, Gmail, or internal dashboards. [VERIFIED — ofox.ai/blog/codex-chrome-extension-codex-app-2026]
- This is **interactive** — it drives the user's desktop Chrome session. There is no documented path to invoke it programmatically, non-interactively, or from `codex exec`. [VERIFIED — no such API surface in docs; confirmed by headless feature-request thread above]
- It is subscription-billed (draws from ChatGPT plan limits) but is **not programmatic**. [VERIFIED]

---

## Question 4 — The metered API: is it the ONLY capable full-page path?

**Finding: YES, as of June 2026, the OpenAI API `web_search` tool is the only full-page retrieval path available programmatically.** [VERIFIED with one nuance — see below]

### API `web_search` tool (Responses API)

- Available via the **OpenAI Responses API** and Chat Completions API (`gpt-5-search-api` model variant). [VERIFIED — developers.openai.com/api/docs/guides/tools-web-search]
- Returns search results **with page content** made available to the model. The `search_context_size` parameter (`low`/`medium`/`high`) controls how much context from retrieved pages is included — not just snippets. [VERIFIED — developers.openai.com/api/docs/guides/tools-web-search]
- Pricing: **$10.00 per 1,000 calls** ($0.01/call) + standard model token rates for the search content tokens ingested. For gpt-4o-mini/gpt-4.1-mini, search content is billed as a fixed 8,000 input token block per call. [VERIFIED — developers.openai.com/api/docs/pricing, community.openai.com/t/help-me-understand-the-web-tool-cost/1369991]
- **Strictly API-billed** — not included in ChatGPT subscription. [VERIFIED]

### Nuance: "Search in ChatGPT" is referenced in API docs

The web search API documentation mentions "Search in ChatGPT" as a parallel surface — but this refers to the **interactive ChatGPT UI feature**, not an API endpoint. It does not create a programmatic retrieval path via subscription. [COMMUNITY — interpretation of API docs; docs do not provide a programmatic subscription path]

---

## Summary Table

| Path | Billing | Full-page? | Non-interactive? | Verdict |
|------|---------|-----------|-----------------|---------|
| Codex CLI `--search` (subscription) | ChatGPT subscription | NO — snippets only | YES | Not capable for full-page |
| Codex browser use (in-app) | ChatGPT subscription | Potentially YES | NO — interactive only | Not usable programmatically |
| Codex Chrome extension | ChatGPT subscription | Potentially YES | NO — desktop Chrome | Not usable programmatically |
| ChatGPT browsing (chat.openai.com) | ChatGPT subscription | YES (in UI) | NO — interactive only | Not usable programmatically |
| OpenAI API `web_search` (Responses API) | Metered API ($0.01/call + tokens) | YES | YES | Only capable + programmatic path |

---

## UNKNOWN List

1. **Exact content depth of Codex CLI "live" mode web search.** The docs confirm "snippets only" at a high level, but the precise format of `web_search` transcript items (number of results, character count, citation structure) is not fully specified in public documentation. [UNKNOWN]
2. **Whether Codex CLI subscription web search (snippets) counts against any quota/limit separately.** Docs say it "draws from the same 5-hour-window limits" as general Codex usage, but whether there is a separate web search call limit is unspecified. [UNKNOWN]
3. **Whether the indexed web-search mode (v0.142.0 "server-approved URLs") includes any curated set of full-page-accessible domains.** The changelog reference is brief and this detail was not found in public docs. [UNKNOWN]
4. **Codex browser use — can it return page content as structured output to the agent?** The embedded browser allows DOM inspection and screenshots, but whether the subscription-billed agent can extract and return page body text in a form useful for extraction+citation (vs. visual interaction only) is not confirmed. [UNKNOWN]

---

## Phase 3 — Synthesis & recommendation (for the banked multi-model architecture)

**Recommendation: retrieval stays on Claude. Do not route APEX web retrieval through OpenAI.** [Confidence: HIGH]

The dive was commissioned to test one challenge — *can the ChatGPT/Codex subscription do capable full-page web retrieval "for free at the margin"?* The answer is **no**, on two independent grounds that both hold:

1. **No subscription path is both capable and programmatic.** Full-page retrieval in the OpenAI subscription exists only behind an interactive surface (ChatGPT browsing, Codex browser-use, the Chrome extension). Every non-interactive path (`codex exec --search`) returns snippets, not page bodies. Headless computer-use was explicitly declined by OpenAI — so this is a deliberate product boundary, not a temporary gap to wait out.
2. **The only capable + non-interactive path is metered.** The Responses-API `web_search` tool does return page content non-interactively, but it bills ~$0.01/call + token rates on the **separate** API product the subscription does not fund. Adopting it means a new metered cost line, not a free-at-the-margin reuse of the Codex subscription.

**Why this confirms "retrieval stays Claude."** APEX's retrieval (apex-research Phase-2) already runs on the Anthropic subscription via dispatched Sonnet/Haiku agents with `WebFetch`/`WebSearch` — capable full-page retrieval, already paid for at the margin. Switching to OpenAI would either (a) lose the capability (snippet-only subscription path) or (b) add a metered bill (API path) for no quality gain over what the Claude subscription already covers. Neither clears the bar.

**Net effect on the multi-model architecture:** the provisional "**retrieval stays Claude**" decision is **upgraded from provisional to settled** — there is no economic or capability case for an OpenAI retrieval tier. This does **not** disturb the rest of the banked design (gpt-5.5 = default coder, Opus = judgment/gate layer); it closes one sub-question cleanly. The metered `web_search` API remains a known fallback **only** if a future use case needs OpenAI-model-grounded retrieval specifically (e.g. an OpenAI-native agent that must cite its own search) — not a general retrieval substrate for APEX.

**Residual UNKNOWNs do not change the call:** the four open items (exact live-mode snippet depth, web-search quota accounting, the v0.142.0 server-approved-URL set, browser-use structured extraction) are all *within* the subscription paths already ruled out as non-programmatic — resolving them cannot turn a snippet/interactive path into a capable programmatic one.

---

## Sources

| Source | Tier | URL |
|--------|------|-----|
| OpenAI Codex Pricing docs | Tier-1 | https://developers.openai.com/codex/pricing |
| OpenAI Codex CLI Features docs | Tier-1 | https://developers.openai.com/codex/cli/features |
| OpenAI Codex CLI Command Reference | Tier-1 | https://developers.openai.com/codex/cli/reference |
| OpenAI Codex Config Reference | Tier-1 | https://developers.openai.com/codex/config-reference |
| OpenAI Web Search API Guide | Tier-1 | https://developers.openai.com/api/docs/guides/tools-web-search |
| OpenAI API Pricing | Tier-1 | https://developers.openai.com/api/docs/pricing |
| OpenAI Codex Changelog | Tier-1 | https://developers.openai.com/codex/changelog |
| OpenAI Community — web tool cost | Tier-1 | https://community.openai.com/t/help-me-understand-the-web-tool-cost/1369991 |
| OpenAI Community — headless computer-use request | Tier-1 | https://community.openai.com/t/feature-request-headless-codex-computer-use-server-side-ui-automation/1379625 |
| OpenAI GitHub — codex repo | Tier-1 | https://github.com/openai/codex |
| Firecrawl — "Why can't Codex CLI browse the web?" | Community | https://www.firecrawl.dev/glossary/web-search-apis/codex-cli-agent-browse-web |
| Chier Hu — Codex Browser Use feature (Medium) | Community | https://chierhu.medium.com/openai-codexs-browser-use-feature-b7dffa761d45 |
| ofox.ai — Codex Chrome Extension | Community | https://ofox.ai/blog/codex-chrome-extension-codex-app-2026 |
| ToolColumn — ChatGPT subscription vs API billing | Community | https://www.toolcolumn.com/learn/chatgpt-subscription-vs-openai-api-pricing |
| Releasebot — Codex June 2026 updates | Community | https://releasebot.io/updates/openai/codex |
