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

## Backups

`scripts/backup.sh` streams a Postgres dump to the bucket set in `.env` (`BACKUP_REMOTE` and the `RCLONE_CONFIG_BUCKET_*` lines), mirrors the poster storage next to it, and keeps 14 days (`BACKUP_KEEP_DAYS`). Files changed or deleted since the last run go to a dated `storage/changed-*` folder, so a bad day can be undone. It needs only Docker on the server.

Nightly at 03:00, from the repo root on the server:

```
0 3 * * * cd /srv/animarka && ./scripts/backup.sh >> /var/log/animarka-backup.log 2>&1
```

Restore on a fresh machine: bring the stack up once, stop `api worker flower`, run `./scripts/restore.sh` (newest dump) or `./scripts/restore.sh animarka-<stamp>.dump`, then start them again. `RESTORE_DB=animarka_restore SKIP_STORAGE=1 ./scripts/restore.sh` restores into a side database to check a backup without touching live data.

Tested on 2026-11-22 against the dev stack: a dump and the storage mirror, a restore into a side database with the same row counts in every table (1,161 species, 2,322 artworks, 11 presets, posters and jobs), and the 14 day pruning.

## Deploy from CI

`.github/workflows/deploy.yml` runs after CI passes on `master`. It builds the Python and web images, pushes them to GitHub's container registry as `ghcr.io/<owner>/<repo>-python` and `-web` (tagged with the commit and `latest`), then connects to the server over SSH, checks out that commit, pulls the images and restarts. Until the secrets below exist it only writes "nothing to deploy" and passes.

One time setup:

1. On the server, clone the repo to the deploy folder (for example `/srv/animarka`) and create `infra/compose/.env` as above.
2. Let the server pull the images: `docker login ghcr.io` with a GitHub token that has `read:packages` (or make the two packages public on GitHub).
3. Make a deploy key pair: `ssh-keygen -t ed25519 -f deploy -N ""`. Add `deploy.pub` to `~/.ssh/authorized_keys` of the deploy user on the server.
4. In the GitHub repo, Settings, Secrets and variables, Actions, add:
   - `DEPLOY_HOST`: the server's address
   - `DEPLOY_USER`: the user that runs Docker
   - `DEPLOY_PATH`: the deploy folder
   - `DEPLOY_SSH_KEY`: the contents of the private key file `deploy`
   - `DEPLOY_KNOWN_HOSTS`: the output of `ssh-keyscan <server address>`
5. Run the workflow once by hand (Actions, deploy, Run workflow) and check `docker compose ... ps`.

On the server compose uses `IMAGE_PREFIX` and `IMAGE_TAG` to pick the images; without them it falls back to local images, so `up -d --build` still works for a manual deploy.
