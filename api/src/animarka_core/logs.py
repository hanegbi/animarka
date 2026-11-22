"""Structured logs: one JSON object per line on stdout, for the API, uvicorn and the workers.

`docker compose logs` and any log shipper can read them without parsing free text. Extra fields
passed with `logger.info("...", extra={...})` land as top level keys.
"""

import json
import logging
import sys
from datetime import UTC, datetime
from typing import Any

# Attributes every LogRecord has; anything else on a record came from `extra=`.
_STANDARD = set(vars(logging.makeLogRecord({}))) | {"message", "asctime", "taskName"}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        out: dict[str, Any] = {
            "ts": datetime.fromtimestamp(record.created, UTC).isoformat(timespec="milliseconds"),
            "level": record.levelname.lower(),
            "logger": record.name,
            "msg": record.getMessage(),
        }
        for key, value in vars(record).items():
            if key not in _STANDARD and not key.startswith("_"):
                out[key] = value
        if record.exc_info:
            out["exc"] = self.formatException(record.exc_info)
        return json.dumps(out, default=str, ensure_ascii=False)


def configure_logging(level: str = "INFO") -> None:
    """Route the root logger and the uvicorn and celery loggers through one JSON handler."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level)
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "celery", "celery.task"):
        lg = logging.getLogger(name)
        lg.handlers = []
        lg.propagate = True


# A dictConfig for `uvicorn --log-config`, so uvicorn's own startup lines are JSON too.
UVICORN_LOG_CONFIG: dict[str, Any] = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"json": {"()": "animarka_core.logs.JsonFormatter"}},
    "handlers": {
        "stdout": {
            "class": "logging.StreamHandler",
            "formatter": "json",
            "stream": "ext://sys.stdout",
        }
    },
    "root": {"handlers": ["stdout"], "level": "INFO"},
    "loggers": {
        "uvicorn": {"handlers": [], "propagate": True},
        "uvicorn.error": {"handlers": [], "propagate": True},
        # The API logs each request itself, with timing; uvicorn's access line would repeat it.
        "uvicorn.access": {"handlers": [], "propagate": False},
    },
}
