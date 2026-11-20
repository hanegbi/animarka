from animarka_workers.app import app


@app.task(name="animarka.ping")
def ping(message: str = "pong") -> str:
    return message
