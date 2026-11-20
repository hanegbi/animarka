"""Queue names and RabbitMQ declarations shared by the API and the workers.

Every work queue has a dead letter queue named `<queue>.dead`. A message that is
rejected without requeue lands there through the `dead` exchange.
"""

from kombu import Exchange, Queue  # type: ignore[attr-defined,unused-ignore]

QUEUE_NAMES = ("ingest", "vision", "upscale", "render", "generate")

work_exchange = Exchange("work", type="direct", durable=True)
dead_exchange = Exchange("dead", type="direct", durable=True)


def build_queues() -> list[Queue]:
    queues: list[Queue] = []
    for name in QUEUE_NAMES:
        queues.append(
            Queue(
                name,
                work_exchange,
                routing_key=name,
                durable=True,
                queue_arguments={
                    "x-dead-letter-exchange": dead_exchange.name,
                    "x-dead-letter-routing-key": f"{name}.dead",
                },
            )
        )
        queues.append(
            Queue(f"{name}.dead", dead_exchange, routing_key=f"{name}.dead", durable=True)
        )
    return queues
