import json
import logging
import logging.config

from animarka_core.logs import UVICORN_LOG_CONFIG, JsonFormatter


def test_json_formatter_writes_one_object_with_extras() -> None:
    rec = logging.makeLogRecord(
        {"name": "animarka.api", "levelname": "INFO", "msg": "request %s", "args": ("x",)}
    )
    rec.path = "/api/v1/posters"
    rec.status = 201
    out = json.loads(JsonFormatter().format(rec))
    assert out["msg"] == "request x"
    assert out["level"] == "info"
    assert out["path"] == "/api/v1/posters"
    assert out["status"] == 201
    assert out["ts"].endswith("+00:00")


def test_uvicorn_config_is_valid_dictconfig() -> None:
    logging.config.dictConfig(UVICORN_LOG_CONFIG)
