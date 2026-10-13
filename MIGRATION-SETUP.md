# Shop Studio — GitHub UI / Apps Script backend migration

## Architecture

- GitHub Pages hosts the complete `Customer.html` and `Owner.html` interfaces.
- Apps Script keeps `Code.gs` plus a **minimal `Bridge.html` transport page** (not a duplicate interface).
- The bridge uses `postMessage` to call `google.script.run` inside Apps Script. This is necessary because Apps Script's public ContentService responses are not a reliable cross-origin JSON API for browser fetch.
- Windows print agent and its private config are unchanged.

## One-time deployment

1. BACK UP the working Apps Script project and GitHub repository.
2. In Apps Script, replace `Code.gs` with `apps-script/Code.gs` and add a new HTML file named **Bridge** using `apps-script/Bridge.html`. Do not delete existing Customer/Owner until testing succeeds; afterwards they are unused.
3. Deploy > Manage deployments > Edit > New version. Keep your existing public deployment URL if possible. For the customer bridge use Execute as **Me**, access **Anyone**, because customers do not sign in. Verify `?page=bridge` loads.
4. Upload the files in `github-pages/` to your GitHub repository root. In `shopstudio-config.js`, set the current public Apps Script deployment URL. GitHub Pages must be served at `https://induguvasanth.github.io/Shop-Studio-with-print/`.
5. Visit `Customer.html`, submit a small non-sensitive test file, track its status, approve it through your existing working owner interface, and verify agent printing.
6. Owner security: **do not** deploy a public passwordless owner API. The existing `ownerSession()` only works if `Session.getActiveUser().getEmail()` returns the configured `OWNER_EMAIL`; a public Execute-as-Me deployment typically returns blank. Create a separate authenticated deployment if your Google Workspace/Apps Script permissions support identifying the owner, set `ownerBridgeUrl` to that deployment, and test `Owner.html`. If that fails, keep using the original protected owner dashboard until an authenticated backend is configured.
7. Only after both pages work, delete the unused Apps Script `Customer.html` and `Owner.html`.

## Limitations and safety

- This uses a small Apps Script HTML bridge, not a pure JSON REST API. Apps Script remains the backend.
- The bridge checks the expected GitHub origin and a session nonce. **Origin checks are not authentication**; public methods are intentionally accessible to customers. Owner actions still require backend authentication.
- Google authentication cookies and iframe restrictions can block embedded owner sign-in in some browsers. If so, a different backend with real OAuth/JWT and CORS is needed for a fully standalone GitHub owner dashboard.
- Do not commit `config.json`, agent secrets, passwords, or customer files. Rotate any previously shared secrets.
- Existing Apps Script file upload limit is 4 MB per file, and the agent's physical printing confirmation is not guaranteed.
- GitHub's HTML file names are case-sensitive.
- The previous HTML UI had limited ID auto-trim and no reliable four-corner perspective correction; this migration does not add that capability.
- Keep the working Windows print agent untouched.
