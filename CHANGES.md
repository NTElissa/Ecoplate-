# What changed in this update

**Mobile menu and navigation** (`client/src/components/site/Navbar.jsx`, `components/ScrollManager.jsx`)
- New full-screen mobile menu: large links with a short description, "How it works" sub-links, Donate button, Call, WhatsApp and dark-mode shortcuts pinned at the bottom.
- Menu links no longer reload the page. Links such as `/#about` and `/how-it-works#results` scroll to the right section, even from another page.
- Active page and active home-page section are highlighted. Desktop "How it works" dropdown opens on hover, closes on outside click or Escape.
- Fixed a 16px sideways scroll on phones.

**Home page animation** (`index.css`, `components/Reveal.jsx`, `lib/useReveal.js`, `components/site/Hero.jsx`)
- Hero headline slides in word by word. The hero photo reel changes photos with a leaf-shaped sweep, a slow zoom and a progress bar; photos come from the Gallery in the dashboard.
- Sections fade and slide in as you scroll, counters count up, steps slide in from alternating sides, arrows pulse along the loop, the Donate heart beats, the logo seal turns slowly.
- Everything respects the "reduce motion" setting.

**Dashboard redesign** (`client/src/dashboard/*`, dashboard section of `index.css`)
- Ledger look: ruled lists instead of a grid of identical cards, grouped text navigation, squarer controls, status dots, a faint furrow pattern in the sidebar.
- Overview now starts with "Needs you" (donations to confirm, gifts to thank, unread messages).
- Dark mode still works.

**Donor replies** (server: `models/Donation.js`, `controllers/donationController.js`, `utils/mailer.js`, routes; client: `dashboard/Donations.jsx`)
- Reply to any donor by email, WhatsApp, SMS or a private note, with the history saved. See README section 8.
- New optional SMTP settings in `server/.env.example`. Run `npm install` in `server/` (adds `nodemailer`).

Your own additions (separate pages, pagination, dark mode, truncated text) were kept.
