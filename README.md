# animarka

Build your own wildlife poster.

Pick birds, arrange them on a poster, switch the art style and export a print ready file.

## Docs

- `docs/PRD.md` is the product brief and the source of truth for scope.
- `docs/PLAN.md` is the build plan with milestones and tasks.
- `docs/DECISIONS.md` records every decision.
- `prototype/animarka_prototype.html` is the original single file prototype, kept as reference.

## Status

Milestone M0 is in progress.

## Run it locally

You need Docker, Node 24 with pnpm, and uv.

```
docker compose -f infra/compose/docker-compose.yml up --build
```

| Service | URL |
|---|---|
| Web | http://localhost:3000 |
| API health | http://localhost:8000/healthz |
| RabbitMQ console (animarka / animarka) | http://localhost:15672 |
| Flower | http://localhost:5555 |

Note: the web service in compose runs the Next.js dev server on a Windows bind mount. If a new file is not picked up, run `docker compose -f infra/compose/docker-compose.yml restart web`. If styles look stale, also remove the `web-next` volume.

## Checks

```
pnpm -C web lint typecheck test e2e
uv run ruff check . && uv run mypy && uv run pytest
```

## Art credits

- Field guide style: [huashu-bird-sticker](https://github.com/alchaincyf/huashu-bird-sticker) by Huashu, CC BY 4.0.
- Woodblock style: illustrations from [HABirdDashboard](https://github.com/adamoberley/HABirdDashboard) by Adam Oberley, Teddy Warner and contributors, MIT.

Both sets are AI generated and may contain errors.
