FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

ENV UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_COMPILE_BYTECODE=0 \
    PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY pyproject.toml uv.lock ./
COPY api/pyproject.toml api/pyproject.toml
COPY workers/pyproject.toml workers/pyproject.toml
COPY api/src api/src
COPY workers/src workers/src
RUN uv sync --frozen --no-dev --all-packages
# Chromium for the render worker (Playwright). Installed after the deps so it caches well.
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
# Playwright's bundled Node needs libatomic1, which the slim image lacks.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libatomic1 \
    && playwright install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/*

COPY api/alembic.ini api/alembic.ini
COPY api/alembic api/alembic
COPY api/data api/data
