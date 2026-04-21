FROM python:3.10.20-slim-bookworm AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1 \
  PATH="/app/.venv/bin:$PATH"

WORKDIR /app

FROM ghcr.io/astral-sh/uv:0.11.7 AS uv

FROM base AS build

COPY --from=uv /uv /uvx /bin/

ENV UV_LINK_MODE=copy \
  UV_COMPILE_BYTECODE=1

COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv,sharing=locked \
  uv sync --locked --no-dev --no-install-project

FROM base AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl=7.88.* \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/.venv ./.venv
COPY --chmod=755 scripts/docker-entrypoint.sh ./docker-entrypoint.sh
COPY manage.py ./
COPY yanotes ./yanotes

ENV DJANGO_SETTINGS_MODULE=yanotes.settings \
  DJANGO_COLLECTSTATIC=true

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD curl --fail http://127.0.0.1:80/health/ || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["-b", "0.0.0.0:80", "-w", "1", "yanotes.wsgi"]
