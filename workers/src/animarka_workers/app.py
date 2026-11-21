from animarka_core.queues import build_queues, work_exchange
from animarka_core.settings import get_settings
from celery import Celery

settings = get_settings()

app = Celery(
    "animarka",
    broker=settings.broker_url,
    backend=settings.redis_url,
    include=["animarka_workers.tasks.ping", "animarka_workers.tasks.ingest"],
)

app.conf.update(
    task_queues=build_queues(),
    task_default_queue="ingest",
    task_default_exchange=work_exchange.name,
    task_default_exchange_type="direct",
    task_default_routing_key="ingest",
    task_routes={"animarka.*": {"queue": "ingest", "routing_key": "ingest"}},
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    broker_connection_retry_on_startup=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
)
