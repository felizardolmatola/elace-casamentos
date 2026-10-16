# Elace Casamentos

English · [Português](README.pt.md)

A web platform that lets couples organize their wedding in one place: planning tools, a marketplace of wedding vendors, and quote-request tracking.

> ### Work in progress
> This project is **under active development**. The interface and the API both exist and partly work, but several features are not yet connected to each other or not yet implemented. The section [What's still missing](#whats-still-missing) is an honest account of what is done and what is not.

---

## Preview

### Home page
![Home page](/frontend/src/assets/img/projeto/1.png)

### Planning tools
Twelve tools shown as cards: guest list, budget, task checklist, calendar, vendors, venue, invitations, seating chart, music, gift list, contracts and honeymoon.

![Planning tools](/frontend/src/assets/img/projeto/2.png)

### Vendors
Vendor categories: photo and video, decoration and flowers, music and entertainment, catering, venues, and cakes and sweets.

![Vendors](/frontend/src/assets/img/projeto/3.png)

### Sign in
![Sign in](/frontend/src/assets/img/projeto/4.png)

> Some vendor card images are still gray placeholders. They are part of the work in progress.

---

## What already works

**Frontend (Angular, standalone components)**
- Home page with tools and vendors sections
- Header with navigation, vendor search (`/` shortcut) and recent search history
- Login, sign-up (couple or vendor) and "create wedding" pages
- Vendor marketplace with search, category and city filters, and contact via WhatsApp, phone and email
- Three dashboards: **couple**, **vendor** and **admin**
  - Couple: checklist, budget and expenses, guests and RSVP, tables, vendor team, timeline, notes
  - Vendor: requests, services, calendar, finances, profile
  - Admin: couples, vendors, approvals, announcements, action log

**Backend (Node.js + Express 5 + TypeScript + PostgreSQL/Supabase)**
- JWT authentication with bcrypt password hashing, with `casal` (couple), `fornecedor` (vendor) and `admin` roles
- Sign-up and login for couples and vendors
- CRUD for categories, services, guests and quote requests
- Vendor approval and rejection by the admin
- Notifications and password change
- Health endpoint (`/api/health`) and configurable CORS

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Angular (standalone components, Router, HttpClient), CSS |
| Backend | Node.js, Express 5, TypeScript, `tsx` |
| Database | PostgreSQL (Supabase) with the `postgres` client |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Backend hosting | Render |

## Structure

```
.
├── backend/
│   ├── server.ts            # API entry point
│   ├── config/db.ts         # PostgreSQL connection
│   ├── middlewares/auth.ts  # JWT and role checks
│   ├── controllers/         # authentication logic
│   └── routes/              # auth, casal, fornecedor, categoria,
│                            # servico, solicitacao, convidado,
│                            # notificacao, admin
├── frontend/
│   └── src/
│       ├── main.ts          # app routes
│       ├── app/             # components (home, marketplace, dashboards...)
│       └── assets/img/      # images
└── docs/screenshots/        # images used in this README
```

## Getting started

### Backend
```bash
cd backend
npm install
cp .env.example .env     # fill in the variables below
npm run dev              # development
# or: npm run build && npm start
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URL (Supabase) |
| `JWT_SECRET` | Long, random secret key |
| `PORT` | API port (defaults to `8080`) |
| `CORS_ORIGIN` | Allowed origins, comma-separated |

The database SQL schema is not in the repository yet (see below).

### Frontend
The frontend lives in `frontend/src` and runs at `http://localhost:4200`. The Angular configuration files (`package.json`, `angular.json`, `tsconfig`) are **not included in this repository yet**, so you need to generate a project with the Angular CLI and copy `src/` into it.

## What's still missing

### 1. Connect the frontend to the backend (top priority)
Today the backend and the frontend exist side by side, but **they barely talk to each other**:

- **All three dashboards store their data in the browser's `localStorage`.** Tasks, expenses, guests, tables, requests, services, approvals and announcements are not saved to the database. If the user clears their browser or switches device, the data is lost. The backend already has routes for guests, services, requests, notifications and admin, but the dashboards do not use them yet.
- **The marketplace calls `/api/fornecedores`, but the backend route is `/api/fornecedor`** (singular). The real vendor listing needs to be aligned.
- **"Create wedding" calls `POST /api/casal/casamento`, which does not exist in the backend.**
- The frontend uses relative paths (`/api/...`). It needs a dev proxy or an environment variable holding the API URL.

### 2. Planning features without a backend
Tables and routes are missing for: **task checklist, budget and expenses, seating chart, timeline, gift list, contracts and documents, honeymoon, music and playlist, venue** and **invitations with sending and RSVP**. On the home page, several of these cards currently just lead to the general dashboard.

### 3. Vendors and marketplace
- Photo upload (there is only a `foto_url` field today, with no file storage)
- Real images for every category (some are still placeholders)
- Work gallery, ratings and reviews
- Location map: the table has `cidade` and `endereco`, but no `latitude`/`longitude`
- A complete quote-request flow, with replies and in-platform messaging

### 4. Accounts and security
- Password recovery and email verification
- Login rate limiting and stricter input validation
- Review of admin permissions and server-side audit logs (the admin dashboard's action log is local today)

### 5. Quality and infrastructure
- Angular configuration files and frontend build scripts
- SQL schema script and sample data (seed)
- Automated tests (backend and frontend)
- API documentation (for example OpenAPI/Swagger)
- Frontend deployment and a CI pipeline
- Cleanup: remove the outdated backend READMEs (they mention `.js` files), move `i18n.ts` (it is a browser script, not a server one) and settle on one product name (the UI says "Elace", the backend code says "Enlace")
- Internationalization (PT/EN), accessibility and small-screen testing

## Suggested roadmap

1. Align routes and connect login, sign-up and the marketplace to the real API
2. Move guests, services and requests from the dashboards to the backend
3. Create the tables and routes for budget, checklist, tables and timeline
4. Image upload, reviews and real-time notifications
5. Tests, API docs and full deployment
