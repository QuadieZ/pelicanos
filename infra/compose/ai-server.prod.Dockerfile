FROM python:3.8-slim

WORKDIR /app

# Install OS-level build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libatlas-base-dev \
    libopenblas-dev \
    liblapack-dev \
    gfortran \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY apps/ai-server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Copy and rename project folder
COPY apps/ai-server /app/apps/ai_server
COPY packages/models/model.pkl /app/packages/models/model.pkl
COPY packages/models/preprocessor_numpy1.pkl /app/packages/models/preprocessor_numpy1.pkl

# Create user and assign permissions
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

ENV PYTHONPATH=/app
EXPOSE 8000

CMD ["uvicorn", "apps.ai_server.main:app", "--host", "0.0.0.0", "--port", "8000"]
