# ViksitNetra — Unified Render Deployment
# Single container: FastAPI serves both API + Frontend
FROM python:3.11-slim

WORKDIR /app

# Install OS deps
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/app/ /app/app/

# Copy frontend static files (served by FastAPI directly)
COPY index.html /app/index.html
COPY style.css /app/style.css
COPY app.js /app/app.js
COPY frontend/ /app/frontend/

# Copy all PNG images
COPY india_map_bg.png /app/india_map_bg.png
COPY india_map_neon.png /app/india_map_neon.png
COPY knowledge_graph_hero.png /app/knowledge_graph_hero.png
COPY bharatjnana_hero_bg.png /app/bharatjnana_hero_bg.png

# Copy optional files (styles.css fallback, emergency, login)
COPY styles.css /app/styles.css
COPY emergency.html /app/emergency.html
COPY emergency.css /app/emergency.css
COPY emergency.js /app/emergency.js
COPY login.html /app/login.html

# Create logs directory
RUN mkdir -p /app/logs

# Expose port (Render uses PORT env var)
EXPOSE 8000

# Start FastAPI
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
