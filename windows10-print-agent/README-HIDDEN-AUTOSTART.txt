SHOP STUDIO: NO BLACK WINDOW AUTOMATIC STARTUP (WINDOWS 10)

1. Copy these files into C:\ShopStudio\windows10-print-agent
2. KEEP your working config.json. Do not overwrite it.
3. Double-click INSTALL-HIDDEN-AUTOSTART.cmd ONCE on each computer.
4. Sign out of Windows and sign in. The print agent starts in background.

No black Command Prompt window is shown during normal operation.
See logs\print-agent.log for messages and errors.
To stop background agent: use Task Manager > Details, locate the Python process
running agent.py and end it, or sign out of Windows.
To disable future startup: run REMOVE-AUTOSTART.cmd.
The installation replaces the earlier visible Startup shortcut with the hidden one.
Future updates in the same folder do not require reinstalling startup.
IMPORTANT: Each computer needs one-time setup. Only run one agent for a given
print queue. Check APPROVED jobs before signing in, since they may print.
