# GB Rewards Program

Loyalty and rewards app for the Downtown Freeport Business Association: admin, vendors (stores), and customers. Vendors can add customers via QR code scan or manual entry, award and redeem points, and use a shared rewards pool.

## Stack

* **Backend:** Node.js, Express
* **Frontend:** React (in `frontends/bijouxt/`)
* **Database:** Supabase (PostgreSQL via Supabase JS client)

## Local development

1. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In SQL Editor, run the schema in `server/supabase-schema.sql`.
   - In Settings > API, copy **Project URL** and **service_role** key.

2. **Server**
   - Copy `server/.env.example` to `server/.env`.
   - Set `TOKEN`, `ADMIN_TOKEN`, `VENDOR_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. Optionally set `INIT_ADMIN_EMAIL` and `INIT_ADMIN_PASSWORD` to seed the first admin.
   ```bash
   cd server && npm install && node app.js
   ```
   Runs on port 4040.

3. **Frontend**
   - Copy `frontends/bijouxt/.env.example` to `frontends/bijouxt/.env`.
   - Set `REACT_APP_SERVER=http://localhost:4040/` for local API.
   ```bash
   cd frontends/bijouxt && npm install && npm start
   ```
   Runs on port 3000.

## Deploy to Railway

1. **Supabase**
   - Create a Supabase project and run `server/supabase-schema.sql` in the SQL Editor.
   - Note **Project URL** and **service_role** key (Settings > API).

2. **Railway**
   - Push this repo to GitHub.
   - In [Railway](https://railway.app), **New Project** → **Deploy from GitHub repo** → select this repo.
   - **Root Directory:** leave as `/`.
   - **Build Command:** `npm run build` (builds React and copies into `server/public`). If the build fails, add variable **`CI`** = `false`.
   - **Start Command:** `npm start` (runs the Node server; serves API and frontend from one URL).
   - **Variables** (required):
     - `TOKEN` – JWT secret for customer/user tokens
     - `ADMIN_TOKEN` – JWT secret for admin tokens
     - `VENDOR_TOKEN` – JWT secret for vendor tokens
     - `SUPABASE_URL` – Supabase project URL
     - `SUPABASE_SERVICE_KEY` – Supabase service_role key
     - `FRONTEND_URL` – Your app URL (e.g. `https://yourapp.up.railway.app`) for CORS and QR join links
   - **Variables** (optional): `NODE_ENV=production`, `INIT_ADMIN_EMAIL`, `INIT_ADMIN_PASSWORD` to seed first admin.
   - Generate a **Public Domain**. One URL serves the app and API (e.g. `https://yourapp.up.railway.app/` = landing, `/admin/login`, `/vendor/login`, `/api/...`).

3. **Frontend env (if frontend is deployed separately)**
   - Set `REACT_APP_SERVER=https://your-api.up.railway.app/` to point to the Railway API URL.

## License

Proprietary / All Rights Reserved.
