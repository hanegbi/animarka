from fastapi import FastAPI

app = FastAPI(title="animarka api", version="0.0.0")


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}
