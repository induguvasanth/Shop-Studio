# Shop Studio same-page owner + PDF preview patch

1. Back up the live GitHub repository and Apps Script files. The uploaded archive does NOT include the Apps Script `OwnerConsole.html` file. Do not delete or overwrite that existing file.
2. GitHub: upload `index.html`, `qr-print-integration.js`, `Owner.html`, and other site files. The **Open Owner Dashboard** button now scrolls to the in-page dashboard rather than opening a tab.
3. Apps Script: update `Code.gs` using `BACKEND-Code.gs` only after comparing with your current deployed version, preserving any later live changes. Add `Bridge.html` as a new HTML file if not already present. If `Bridge.html` already exists and works, keep your live version instead of replacing it blindly.
4. Deploy a new version of the web app. For a cross-origin owner bridge, Google may block third-party iframe cookies/authentication. A bridge cannot bypass those policies; keep the protected owner console fallback. `OWNER_EMAIL` must match an authenticated account on an appropriately configured deployment. Never remove server-side authorization.
5. Refresh GitHub Pages with Ctrl+Shift+R. Try the QR Print Orders section and preview a PDF. This update switches PDF.js from dynamic ES module loading to its classic script, but it cannot fix a server-side preview/authorization failure.
6. **Printer:** Do not replace the working `C:\ShopStudio\windows10-print-agent` folder or `config.json`; the ZIP contains historical agent files only. No autostart reinstall is required.

Note: The included project is a patch candidate, not a live-tested deployment. No Google API credentials or secret values are included.
