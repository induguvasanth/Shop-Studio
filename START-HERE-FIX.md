# Shop Studio — GitHub UI patch

## What was corrected
- Removed blocked `script.google.com` iframe from Shop Studio dashboard.
- Dashboard Customer and Owner buttons now open GitHub-hosted Customer.html and Owner.html.
- Replaced index.html with the version you uploaded; kept other required JS/CSS assets.
- Replaced Apps Script Code.gs and Bridge.html with your uploaded versions.
- Replaced GitHub Owner.html with your uploaded version. GitHub Customer.html comes from the prior migration package because no new Customer.html was uploaded.
- Improved bridge URL validation and missing-configuration error.

## Install
1. Back up your working website and Apps Script project.
2. Upload **contents** of `github-pages/` to the root of your GitHub Pages repository. Do not upload the `github-pages` directory as a nested folder.
3. In Apps Script, update `Code.gs` from `apps-script/Code.gs` and `Bridge.html` from `apps-script/Bridge.html`. Keep your Script Properties (SHEET_ID, FOLDER_ID, AGENT_SECRET, OWNER_EMAIL). Deploy a NEW VERSION.
4. Set the current /exec URL in `github-pages/shopstudio-config.js` (customerBridgeUrl). Set ownerBridgeUrl to an authenticated owner deployment, not the public customer deployment.
5. Test Customer.html and Owner.html with harmless sample files before enabling live orders.

## Known limitation — IMPORTANT
The supplied Apps Script bridge uses a hidden iframe to invoke `google.script.run`. Google may refuse to frame Apps Script, depending on browser/security/deployment settings. Removing the **visible dashboard iframe** fixes that visible error but does **not guarantee** that the hidden bridge works. If the Customer or Owner page reports bridge timeout/refused connection, this is a remaining architecture issue, not a printer issue. A robust GitHub-only interface needs a different authenticated backend/API rather than a framed Apps Script HTML page. Do not weaken owner authentication or expose AGENT_SECRET to GitHub to work around it.

## Owner security
OWNER_EMAIL is checked by ownerSession, but owner deployment must actually identify the signed-in owner. If Session.getActiveUser().getEmail() is blank, owner login fails closed. Do not deploy owner approval methods as publicly callable without verified identity. This project has not been live-tested.

## Windows
Keep your working agent.py, config.json and auto-start. Do not overwrite local config.json.
