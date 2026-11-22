# Deploy

One server with Docker. Caddy serves the site over HTTPS and renews the certificate by itself.

## First time

1. Point the domain's A record at the server.
2. On the server: `git clone https://github.com/hanegbi/animarka.git && cd animarka`
3. `cp infra/compose/.env.example infra/compose/.env` and fill it in. Use long random values for the
   passwords and `RENDER_SECRET`. This file is never committed.
4. Start everything:

   ```
   docker compose -f infra/compose/docker-compose.prod.yml --env-file infra/compose/.env up -d --build
   ```

   The API migrates the database and seeds styles, backgrounds and presets on start.
5. Load the catalog once (about an hour for 2,322 images; reruns skip unchanged files):

   ```
   docker compose -f infra/compose/docker-compose.prod.yml --env-file infra/compose/.env exec worker python -m animarka_workers.ingest
   ```

## Update

```
git pull
docker compose -f infra/compose/docker-compose.prod.yml --env-file infra/compose/.env up -d --build
```

## Check

- `docker compose -f infra/compose/docker-compose.prod.yml --env-file infra/compose/.env ps` shows every service healthy.
- Only ports 80 and 443 are open. The database, Redis and RabbitMQ are on the internal network only.

Still to come in M6: nightly backups (M6.3) and deploy from CI (M6.4).

## Health, logs and queues

- Every service has a health check. The API's checks Postgres and Redis at `/readyz`; `/healthz` only says the process answers.
- Logs are one JSON object per line (`ts`, `level`, `logger`, `msg`, plus fields such as `method`, `path`, `status`, `ms` for each API request). Read them with
  `docker compose -f infra/compose/docker-compose.prod.yml --env-file infra/compose/.env logs -f api worker`.
- The queue dashboard (Flower) is at `https://$DOMAIN/flower`, behind basic auth: set `FLOWER_USER` and `FLOWER_PASSWORD` in `.env`.
