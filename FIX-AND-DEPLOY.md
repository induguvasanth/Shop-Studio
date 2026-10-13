# Shop Studio – audit and deployment (October 2026)

## What was changed
- Customer upload no longer uses the hidden Google Apps Script iframe. `Customer.html` loads `shopstudio-customer-api.js`.
- `Code.gs` accepts `customerCreate` via POST and verifies saved orders with a read-only tracking JSONP endpoint. The Windows agent `claim`/`result` POST protocol remains unchanged.
- Customer order IDs are generated client-side; repeat submissions of the same ID are idempotent. An opaque POST response alone is NEVER treated as upload success.
- Placeholder secret function replaced by `checkConfiguration()`; existing Script Properties are preserved.
- Owner GitHub page offers **Open protected owner console**, which opens the Google-hosted `OwnerConsole.html` directly instead of embedding it. This is a fallback, not a guarantee that Google will identify the signed-in owner.
- Removed visible iframe from the landing page; updated example printer names.

## Exact installation order
1. BACK UP your live Google Apps Script project, Script Properties, and GitHub repo.
2. In Apps Script, replace `Code.gs`, keep/update HTML file `Bridge`, and add **NEW HTML file named `OwnerConsole`** from `apps-script/OwnerConsole.html`.
3. In Project Settings > Script Properties, confirm `SHEET_ID`, `FOLDER_ID`, `AGENT_SECRET`, `OWNER_EMAIL`. Do not paste credentials into code. Run `checkConfiguration`; run `setup` only if the sheet/folder need initialization.
4. Deploy > Manage deployments > Edit > New version > Deploy. For customer anonymous uploads, the customer deployment must be accessible to Anyone and execute as you. Note: Google Workspace/organization policies may prevent public deployments.
5. Upload all files inside `github-pages/` to the GitHub repo ROOT (`Shop-Studio`, not `Shop-Studio-with-print`). Keep `shopstudio-config.js` pointed at the correct CURRENT `/exec` deployment.
6. Hard-refresh on phone or clear old site data if cached. Test with a tiny nonsensitive JPG or PDF; verify that the job appears PENDING in Google Sheet. Then test tracking.
7. For owner access, click Open protected owner console. `ownerSession` requires `OWNER_EMAIL` to match `Session.getActiveUser().getEmail()`. With Execute-as-Me public deployment this may be blank; in that case create a **separate authenticated deployment** and point `ownerBridgeUrl` at it. A direct Apps Script page does not remove this authentication requirement.
8. Test approve/reject, agent claim/result, printer queue and cleanup separately. Do not change the working Windows `config.json`.

## Known limitations (important)
- This is a static code audit, NOT a verified live deployment. Google may block anonymous POSTs, redirect behavior, or JSONP in your account; verify before using with customers.
- `fetch(mode:no-cors)` has no readable success response; a separate status query confirms storage. If status cannot be confirmed, do NOT assume the upload succeeded.
- Tracking uses JSONP, which puts a random tracking token in the query string. Treat tracking links as private and do not include sensitive data in IDs.
- Apps Script file size cap remains 4MB, and total request size may have additional limits.
- Owner GitHub iframe bridge may still fail. Use the direct owner console fallback and authenticated deployment. Do not make owner actions public.
- Existing agent has `dry_run:true` in its EXAMPLE, and supports automatic A4 only; do not overwrite working local config. A submitted-to-printer status does not guarantee physical print completion.
- No browser can prove printing without live Windows/Google end-to-end tests.
