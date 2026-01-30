# GB Rewards Program

Loyalty and rewards app for the Downtown Freeport business sector: admin, vendors (stores), and customers. Vendors can add customers via QR code scan or manual entry, award and redeem points, and use a shared rewards pool.

## Stack

* **Backend:** Node.js, Express
* **Frontend:** React (in `frontends/bijouxt/`)
* **Database:** SQLite (local); plan schema also supports stores/admins/users/histories/points

## Local development

1. **Server**
   ```bash
   cd server && npm install && node app.js
   ```
   Runs on port 4040. Creates `loyalty.db` and seeds admin (`admin@dfba.org` / `Admin123!`) and vendor (`vendor@store.com` / `Vendor123!`) if empty.

2. **Frontend**
   ```bash
   cd frontends/bijouxt && npm install && npm start
   ```
   Runs on port 3000. Set `REACT_APP_SERVER=http://localhost:4040/` in `frontends/bijouxt/.env` for local API.

## Deploy backend to Railway

1. Push this repo to GitHub (e.g. `salutethegenius/gbrewardsprogram`).
2. In [Railway](https://railway.app), New Project → Deploy from GitHub repo → select this repo.
3. Set **Root Directory** to `server` (or use a Procfile at repo root that runs `cd server && node app.js`).
4. Add **Variables**: `ADMIN_TOKEN`, `VENDOR_TOKEN`, `TOKEN` (and optionally `FRONTEND_URL` for QR join links). Leave `PORT` as provided by Railway.
5. SQLite file is ephemeral unless you add a volume; for production consider PostgreSQL and a DB adapter.

## License

Proprietary / All Rights Reserved.