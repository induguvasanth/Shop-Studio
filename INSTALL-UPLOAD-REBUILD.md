# Shop Studio customer upload rebuild

This ZIP preserves all unrelated files from the supplied repository. It replaces only Customer.html, shopstudio-customer-api.js, shopstudio-config.js, and adds Code.gs plus this guide.

1. Back up the current Apps Script Code.gs. Replace it with this ZIP's Code.gs (not in the GitHub website). Save and Deploy > Manage deployments > Edit > New version > Deploy. Keep the existing deployment ID.
2. In GitHub replace Customer.html, shopstudio-customer-api.js, shopstudio-config.js. Do NOT upload Code.gs to GitHub Pages. Commit, wait for Pages, hard-refresh the browser.
3. In Google Sheets look for Upload_Diagnostics after one small test JPG upload. RECEIVED -> SAVED means stored. FAILED includes a short backend error. No entry indicates POST not received or diagnostic write failed.
4. Check Print_Jobs for previous unconfirmed IDs before retrying. Do not start the Windows print agent at home.
5. Existing owner auth, scanner, UI, printer agent and other site sections were not changed.

NOTE: This rebuild adds observable diagnostics and safer pending-ID handling; it cannot guarantee browser-to-Apps-Script uploads succeed without a live test.
