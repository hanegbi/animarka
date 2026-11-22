"""Production entry point: uvicorn with JSON logs and proxy headers.

`python -m animarka_api.serve` replaces the long uvicorn command line in compose.
"""

import os

import uvicorn

from animarka_core.logs import UVICORN_LOG_CONFIG


def main() -> None:
    uvicorn.run(
        "animarka_api.main:app",
        host="0.0.0.0",  # noqa: S104 - inside the container, behind Caddy
        port=int(os.environ.get("PORT", "8000")),
        workers=int(os.environ.get("ANIMARKA_API_WORKERS", "2")),
        proxy_headers=True,
        forwarded_allow_ips="*",
        log_config=UVICORN_LOG_CONFIG,
    )


if __name__ == "__main__":
    main()
