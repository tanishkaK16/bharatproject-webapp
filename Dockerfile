## ViksitNetra - GPU-ready Backend Dockerfile (multi-stage)
# Stage 1: CUDA-enabled base with Python and build deps
FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04 AS base

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VIRTUALENVS_CREATE=false

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.11 python3.11-venv python3-pip python3-dev \
    build-essential curl ca-certificates git \
 && rm -rf /var/lib/apt/lists/*

RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1 \
 && update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 1

WORKDIR /app

# Stage 2: Builder - install Python dependencies
FROM base AS builder

WORKDIR /app
COPY backend/requirements.txt /app/requirements.txt

RUN python -m venv /opt/venv \
 && . /opt/venv/bin/activate \
 && pip install --upgrade pip \
 && pip install --no-cache-dir -r /app/requirements.txt

# Stage 3: Final runtime image (GPU-capable, minimal)
FROM base AS runtime

LABEL maintainer="admin@viksitnetra.gov.in" \
      description="ViksitNetra GraphRAG Intelligence Engine - Sovereign GPU Backend"

ENV VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH" \
    UVICORN_WORKERS=4 \
    UVICORN_PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv

# Copy backend source
COPY backend/app/ /app/app/
COPY backend/logs/ /app/logs/

# Create non-root user for security
RUN useradd -m -u 1001 vnetra \
 && chown -R vnetra:vnetra /app
USER vnetra

EXPOSE 8000

# Default GPU runtime flags are handled by nvidia-container-runtime on the cluster.
CMD ["bash", "-lc", "uvicorn app.main:app --host ${HOST} --port ${UVICORN_PORT} --workers ${UVICORN_WORKERS}"]

