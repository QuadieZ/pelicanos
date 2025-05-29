FROM python:3.8-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && rm -rf /var/lib/apt/lists/*

COPY apps/ai-server/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.8-slim
WORKDIR /app

ENV PYTHONPATH=/app

COPY --from=builder /usr/local/lib/python3.8/site-packages/ /usr/local/lib/python3.8/site-packages/
COPY . .

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "apps.ai-server.main:app", "--host", "0.0.0.0", "--port", "8000"]
