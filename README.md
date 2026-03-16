# Link-up.us Admin Portal

Standalone admin app (Vite + React + TypeScript) matching the main frontend design. Uses the same backend API with admin-only routes under `/api/admin/*`.

## Features

- **Auth**: Login, Forgot password, Reset password (via email link), Change password
- **Dashboard**: Overview with links to all sections
- **Users**: Full CRUD, active/inactive, view banners, change member ID
- **Subscriptions**: List active payments, cancel (at period end or now), extend period (no Stripe charge)
- **Invoices**: List invoices (all or by user)
- **Referrals**: All referral links and details per link
- **Marketplace**: Add/edit/delete member marketplace items (not necessarily real accounts)
- **Partners**: Add/edit/delete partners
- **Email templates**: CRUD + HTML template builder (edit HTML, preview)
- **Training library**: Courses → Sections → Videos CRUD; view completion progress

## Setup

1. From repo root:  
   `cd link-up-us-admin && npm install`
2. Create `.env` or set `VITE_API_URL` to your backend (e.g. `http://localhost:3001`).
3. Run backend and seed an admin user:  
   `cd link-up-us-backend && node scripts/seed.js`  
   Default admin: `admin@linkup.us` / `admin123` (override with `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
4. Start admin app:  
   `npm run dev`  
   Opens at http://localhost:5174 (or the port in vite.config).

## Build & deploy

- **Local build**: `npm run build` → output in `link-up-us-admin/dist/`.
- **GitHub Actions**: The only admin deploy workflow is at repo root: `.github/workflows/deploy-admin.yml`. It builds `link-up-us-admin/` and deploys to FTP under `/${{ vars.SERVER_DIR }}/admin/`. Set `SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `SERVER_DIR` in the repo.

## Base path

The app is built with `base: "/link-up-us-admin/"` so it can be served at `https://yoursite.com/link-up-us-admin/`. Adjust `base` in `vite.config.ts` and the router `basename` in `main.tsx` if you use another path.
