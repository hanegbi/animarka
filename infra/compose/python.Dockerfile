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

COPY api/alembic.ini api/alembic.ini
COPY api/alembic api/alembic
