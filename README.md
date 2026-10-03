# AetherCraft HTML Minecraft Server Template

See `SETUP-GUIDE.txt` for installation, customization, API, and production notes.


## Expanded catalog update

The Blocks & Items page now contains **1,243 catalog entries**, category filters, blocks/items filtering, Minecraft ID search, result counts, pagination, and selected crafting recipes. See `PLAYER-SEARCH-API-GUIDE.txt` for direct and PHP-proxy player lookup setup.

## v1.2 interactive admin and visual effects

The admin dashboard now has working Overview, Members, Purchases, Forums, and Site Settings tabs. In the HTML demonstration, changes are stored in browser localStorage. You can add/edit/suspend/delete members, add/edit/delete purchases, pin/lock/delete forum topics, save announcements and maintenance settings, and export all dashboard data as JSON.

Every page automatically loads lightweight cursor-reactive cube particles and a glowing cube cursor from `js/common.js`. Disable either feature by removing the `setupCubeEffects` DOMContentLoaded line near the bottom of that file.


DEDICATED LOADER PAGE
---------------------
The loading animation now lives only in loader.html. Opening any public page for the first time in a browser session automatically routes through loader.html, then returns to the requested page. Normal page-to-page navigation does not replay the loader. To preview it again, close the tab/session or clear the ac_loaded sessionStorage value in browser developer tools.

## v1.3 account and transition update

- Smooth entry and exit animation between every internal page.
- Footer links softly glow green on hover and keyboard focus.
- Logged-in navigation shows the active username and Account button.
- New `account.html` member settings page.
- Members can verify and link a Java Minecraft username and UUID.
- Members can save Discord username and optional Discord user ID.
- Demo links are stored in browser localStorage. Production Discord OAuth and shared secure profiles require a PHP backend.


V1.4 UPDATE
- Every item modal now shows a crafting pattern or a clearly labeled obtaining method.
- Forum typing shows top-right login status and guest posting is blocked.
- Staff cards can be edited by an Administrator directly on staff.html; Minecraft usernames synchronize the visible name and head automatically.


## v1.5 update
- Recipe details now open as a centered overlay above the item catalog.
- Added fade/scale entrance and exit animations, backdrop click closing, Escape-key closing, and a green glowing close button.
- Voting iframes now switch to a visible system/cube fallback cursor because browsers do not allow a parent page to draw its custom DOM cursor inside a cross-origin embedded website.


## v1.7 additions
- Custom cursor remains above recipe overlays.
- Hidden sliding server-IP reveal with timed copy notification.
- Admin-managed rotating home-page announcements with visibility controls.
- Members can hide announcements locally.
- Forum login-status typing notices restored.
- Staff cards gain a subtle responsive hover lift.

## v1.8 update

- Fixed the copy-IP notification bubble so it remains fixed at the top-right and appears immediately on every copy attempt.
- Added a full paginated forum emoji browser for replies.
- Emoji browser includes category tabs, search, Previous/Next page controls, and hundreds of emojis.
- Clicking an emoji inserts it at the current caret position without closing the picker, allowing multiple emoji selections.


## v2.9 GitHub Pages update
Build Academy startup fixed, Blueprint Lab hardened, visual encyclopedia added, and official Minecraft News page added.
