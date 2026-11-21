# Ecoplate website and dashboard

Node.js (Express, ES modules, MongoDB) API plus a React (Vite, Tailwind CSS v4) site and staff dashboard.
All content and photos come from the Ecoplate pitch deck, business plan PDF and the project photos.

```
ecoplate/
  server/   Express API   (config, models, controllers, routes, middlewares, utils)
  client/   React app     (public website + dashboard)
```

## 1. Run it on your computer

You need Node 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

**API**
```bash
cd server
cp .env.example .env        # then edit .env (see below)
npm install
npm run seed                # optional: fills projects, goals, gallery, news from your documents
npm run dev                 # http://localhost:5000
```

**Website**
```bash
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## 2. Staff sign in (hidden)

There is no login button or link anywhere on the site.
The sign-in page lives at a secret address taken from your `.env` files:

| File | Variable | Example |
|---|---|---|
| `server/.env` | `ADMIN_LOGIN_PATH` | `ecoplate-staff-7f3a9c` |
| `client/.env` | `VITE_ADMIN_LOGIN_PATH` | `ecoplate-staff-7f3a9c` |

Both must match. Then open `http://localhost:5173/ecoplate-staff-7f3a9c`.
Anyone who visits `/login`, `/admin`, or `/dashboard` while signed out sees the normal "page not found" screen.
**Change the secret path before going live.**

The super admin is created automatically from `server/.env` the first time the API starts
(`SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`). Change the password after the first sign in (My account).

## 3. Roles

- **Super admin**: everything, plus the Admins page where you create admins, choose which sections each can use, switch accounts off, reset passwords and delete them.
- **Admin**: only the sections the super admin ticked: Page content, Goals and steps, Projects, Partners, Announcements, Gallery, Donations, Messages, Subscribers. The menu hides the rest and the API refuses them (403) even if someone calls it directly.

## 4. What the dashboard controls on the home page

| Home page part | Where to edit |
|---|---|
| Hero, About, Mission, Vision, The problem, Contact details, Social links, Footer, Donation text and goal | Page content |
| Goals, 12 month timeline, "How it works" production steps | Goals and steps |
| Projects (with detail pop-up) | Projects |
| Partners | Partners |
| Announcements | Announcements |
| Photo gallery (bulk upload) | Gallery |
| Donations (confirm, reject, export CSV) | Donations |
| Contact form messages (read, answered, reply by email) | Messages |
| Newsletter sign-ups (export CSV) | Subscribers |

The comparison table, revenue split and "who we serve" list on the home page come straight from the pitch deck and are fixed in `client/src/components/site/Proof.jsx`.

## 5. Donations: how they work

Donors fill in the form, get a reference code (for example `EP-9A9045`) and the mobile money number.
They send the money themselves; you see the pledge under **Donations** and press **Confirm** when the money arrives.
Confirmed gifts feed the public progress bar and thank-you list. There is **no payment gateway** connected:
if you later want card or MoMo-API payments, that needs an account with a provider and can be added to `server/src/controllers/publicController.js`.

## 6. Going live (one server)

```bash
cd client && npm run build         # creates client/dist
cd ../server && NODE_ENV=production npm start
```
In production the Express server also serves `client/dist`, so one process runs everything.
Set a long random `JWT_SECRET`, use a real `MONGO_URI`, and put the site behind HTTPS.
Uploaded images are stored in `server/uploads`. Keep that folder on persistent storage and back it up.
If the API is on a different domain from the site, set `CLIENT_URL` on the server and `VITE_API_URL` / `VITE_API_ORIGIN` in `client/.env`. `VITE_API_URL` can be the API origin or its `/api` base; the client adds `/api` when it is omitted.

## 7. Security already in place

Hashed passwords (bcrypt), signed tokens that stop working after a password change, login rate limiting,
rate limiting on public forms, a hidden honeypot field against spam bots, Helmet headers,
image-only uploads with a size limit, field whitelisting on every write, and spreadsheet-formula protection in CSV exports.

## 8. Replying to donors

Open **Donations** and press **Reply** (or **Say thanks** on a confirmed gift that has not been answered yet).
The reply window pre-fills a message with the donor's name, amount and reference code. Pick a starting point
(thank you, payment reminder, could not match, or your own), edit it, and choose how to send it:

| Channel | What happens |
|---|---|
| Email | If SMTP is set up in `server/.env`, the server sends it. If not, it opens your own email app with the message ready. |
| WhatsApp | Opens WhatsApp with the message ready. Rwanda (+250) is assumed when a number starts with 0. |
| SMS | Opens your phone's messages app with the text ready. |
| Private note | Saved on the donation for the team. The donor never sees it. |

Every reply is recorded under **Conversation** on that donation (who, when, which channel), and the donations list
shows "Answered". The Overview page lists confirmed gifts nobody has thanked yet.

To make **Send email** work from the server, fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM`
in `server/.env` (see `.env.example`), then restart the API. Run `npm install` in `server/` once (adds `nodemailer`).
