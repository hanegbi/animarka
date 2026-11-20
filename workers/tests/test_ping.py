from animarka_core.queues import QUEUE_NAMES, build_queues
from animarka_workers.app import app
from animarka_workers.tasks.ping import ping


def test_ping_runs_eagerly() -> None:
    app.conf.task_always_eager = True
    try:
        assert ping.delay("hello").get() == "hello"
    finally:
        app.conf.task_always_eager = False


def test_every_queue_has_a_dead_letter_queue() -> None:
    names = {q.name for q in build_queues()}
    for name in QUEUE_NAMES:
        assert name in names
        assert f"{name}.dead" in names
