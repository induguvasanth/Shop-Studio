# Shop Studio owner live updates + QR

1. Back up the existing GitHub repository and Apps Script project.
2. Upload updated Owner.html and the other files from this package to GitHub Pages.
3. Hard-refresh Shop Studio (Ctrl+Shift+R) and open QR Print Orders.
4. Click **Show customer QR**. Scan with a phone and confirm it opens Customer.html.
5. Embedded dashboard first attempts Google owner identity. If it cannot verify, enter the owner password already configured through OWNER_HASH and OWNER_SALT. No password is stored locally. If the Google bridge iframe itself is blocked, the protected console remains the fallback.
6. When signed in, jobs are checked every 12 seconds while the tab is visible. This is polling, not instantaneous push.
7. For PDFs, use the canvas-based preview in Owner.html. If it reports PDF.js unavailable, check browser developer console/network access to cdnjs.cloudflare.com; Download PDF is a fallback.
8. Do not disable owner authentication or expose AGENT_SECRET.

## Limitations
The protected Google Apps Script owner console cannot reliably be embedded in GitHub due to cross-origin authentication/frame restrictions. The GitHub Owner.html is embedded in Shop Studio instead. The hidden Apps Script bridge can also be blocked by browser privacy settings; password fallback cannot fix a blocked bridge. QR library requires CDN connectivity. This update does not change printer execution or PDF editing.
