# Shop Studio focused update (13 Oct 2026)

## What changed
- JPG/PNG in Documents and front/back ID layouts are converted in the browser into a one-page PDF before upload. A4/A5/Letter orientation is selected automatically for ordinary images; ID layout is A4. PDF uploads remain unchanged.
- Front/back preview uses a data URL, so revoking a temporary blob URL no longer breaks the image preview.
- Owner job column shows short creation date/time. QR Print Orders already embeds `Owner.html` within `index.html` and is retained. The authenticated Apps Script `?page=owner` console cannot be guaranteed to embed inside GitHub due to Google browser security restrictions. Use the separate protected owner link when embedding fails.
- Backend `BACKEND-Code.gs` adds a page-range field to claimed jobs and short owner dates; existing agent secret and credentials remain in Script Properties.
- Windows agent: checks config, SumatraPDF path, and (if pywin32 available) Windows printer names *before claiming a job*. Supports PDF page ranges using SumatraPDF print settings. Existing config.json is NOT included and must be preserved.

## Install
1. Back up GitHub repo, existing Apps Script Code.gs, and agent config.json.
2. Upload the web files (not BACKEND-Code.gs or windows10-print-agent) to the existing GitHub Pages repo; preserve your other files.
3. In Apps Script replace Code.gs with BACKEND-Code.gs, save, run `shopStudioEnsurePageRange()` once, deploy a new version (same deployment ID).
4. Check owner access using the protected console; don't publish owner secrets on GitHub.
5. At home test small JPG, PNG and ID front/back uploads. All should appear as application/pdf in Print_Jobs with PENDING status. Check Upload_Diagnostics if any fails.
6. At shop copy the agent files into your existing agent folder WITHOUT overwriting config.json. Install SumatraPDF, verify both printer queue names and set dry_run=false only when ready to print. Test one page per printer and confirm actual printed output before using automatic operation.

## Cautions
- Existing approved jobs may be claimed when the agent starts. Review the queue first.
- `subprocess.run()` exit code does not prove paper was printed; verify Windows spooler/physical output.
- Page-range selection uses SumatraPDF `-print-settings`; test against your installed version and drivers before production.
- Only PDF/JPG/PNG are supported. Converted image PDFs may be larger than source; the 4 MB backend upload limit still applies.
- PDF.js owner preview requires CDN access. Embedded owner authentication may fail due to browser cookie/iframe restrictions.
