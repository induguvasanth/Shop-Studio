# Shop Studio focused UI upgrade

Changes: index.html (embedded same-origin Owner.html), Owner.html (PDF.js canvas preview with page navigation/download), Customer.html (PDF page range request), Code.gs (persist page range in column P). All other files copied unchanged from prior rebuilt project.

Deploy Code.gs as a NEW Apps Script version, then publish updated GitHub files. The Owner iframe still requires the existing owner Google authentication and may be affected by Google bridge restrictions; open Owner.html directly if needed.

IMPORTANT: PDF page range is stored as a REQUEST, not yet enforced by your Windows print agent. Do not promise page-range printing until the agent has been updated and tested. No PDF editing/reordering is included. PDF canvas preview loads PDF.js from cdnjs and requires internet. Image rotate/zoom/drag/save uses existing owner tools.

The printer agent and unrelated sections have not been modified. Back up existing files before deployment. Test with non-sensitive documents.
