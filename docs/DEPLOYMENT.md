# Deploying Fairytale

One small Linux server (1 vCPU / 1–2 GB RAM is plenty) running Docker. The stack is three containers: **PostgreSQL**, the **Flask API**, and **Caddy**, which serves the website, forwards `/api` to Flask and handles HTTPS automatically. Because the site and API share one domain, no CORS configuration is needed.

> This setup was written but not run in the environment it was authored in. Do the first deploy with time to spare, and work through `docs/QA-CHECKLIST.md` before announcing the site.

## 1. Before you start

- A domain (e.g. `fairytale.example`) with an **A record pointing at the server's IP**.
- A server with Docker + the Compose plugin ([install guide](https://docs.docker.com/engine/install/)). Ports 80 and 443 open.
- The project copied to the server (`git clone` or upload).
- Photos optimised and added (see "Photos" below).

## 2. Configure

```bash
cp .env.production.example .env
nano .env
```

Fill in `SITE_ADDRESS`, `SITE_URL`, `POSTGRES_PASSWORD` (letters and digits only), and two long random secrets:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"   # run twice: SECRET_KEY, JWT_SECRET_KEY
```

Optionally add `NOTIFY_EMAIL` + `SMTP_*` so the owner is emailed about every booking and message.

## 3. Launch

```bash
docker compose up -d --build
docker compose ps                      # all three should be "running" / "healthy"
docker compose exec backend python scripts/create_admin.py
```

Open `https://your-domain/` (the first load can take ~30 s while the certificate is issued) and `https://your-domain/admin`.

## 4. Photos

Add the client's photos to `frontend/src/assets/images/` using the names in the README, then compress them **before building**:

```bash
cd frontend && npm install && npm run optimize-images
```

This writes web-sized WebP files (2400 px hero, 1600 px gallery) and keeps the originals in `_originals/` (not deployed). Typical camera photos shrink by 90 %+, which is the single biggest speed-up for the site. Rebuild after adding photos: `docker compose up -d --build web`.

## 5. Updating the site

```bash
git pull
docker compose up -d --build
```

Database tables are created automatically on start. Adding a *new table* in a future change works the same way; changing an *existing* table's columns needs a migration (Flask-Migrate is installed for that).

## 6. Backups (do this!)

Bookings and messages live only in the database volume.

```bash
# Backup
docker compose exec -T db pg_dump -U fairytale fairytale | gzip > backup-$(date +%F).sql.gz
# Restore (into an empty database)
gunzip -c backup-2026-11-06.sql.gz | docker compose exec -T db psql -U fairytale fairytale
```

Run the backup daily with cron and copy the file off the server (cloud storage or another machine).

## 7. Monitoring and troubleshooting

- Health: `https://your-domain/api/health` should return `{"status":"ok"}`. Point a free uptime monitor (UptimeRobot, etc.) at it.
- Logs: `docker compose logs -f backend` and `docker compose logs -f web`.
- Certificate not issued: the domain's A record must point at the server and ports 80/443 must be reachable.
- "Too many requests" for real guests: all visitors sharing one IP (e.g. a café Wi-Fi) share a rate limit; adjust `RATELIMIT_RESERVATIONS` in `docker-compose.yml`.
- Rate limits are kept in the API's memory, which is exact because it runs one worker with 4 threads. If you raise `WEB_CONCURRENCY`, switch `RATELIMIT_STORAGE_URI` to a Redis instance.

## 8. Not using Docker?

Any host works: build the frontend (`npm run build`, serve `dist/` with SPA fallback to `index.html`), run the API with `gunicorn -c gunicorn.conf.py wsgi:app` behind a reverse proxy that forwards `/api`, set the environment variables from `backend/.env.example`, and set `TRUSTED_PROXY_COUNT=1`. Use the headers in `frontend/Caddyfile` as the reference for caching and security headers.

## Security notes

- HTTPS is mandatory: the admin token is sent in a header.
- The admin login is rate limited, and a wrong email and a wrong password give the same message.
- The production API refuses to start with placeholder secrets.
- Guests' phone numbers and emails are personal data. Keep backups private, and delete old bookings/messages you no longer need from the dashboard. Consider adding a short privacy note to the site.
