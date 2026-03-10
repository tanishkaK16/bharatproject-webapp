"""
ViksitNetra — Main FastAPI Application
Viksit Bharat Intelligence Eye — Sovereign AI Platform
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from loguru import logger
import os
import sys

from app.core.config import settings
from app.api.routes import router as api_router
from app.etl.pipeline import etl_pipeline

# Configure logging
logger.remove()
logger.add(sys.stdout, level="INFO", format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan> - {message}")
try:
    os.makedirs("logs", exist_ok=True)
    logger.add("logs/viksitnetra.log", rotation="10 MB", retention="7 days", level="DEBUG")
except Exception:
    pass  # Read-only filesystem fallback


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown."""
    logger.info("=" * 60)
    logger.info("🇮🇳 ViksitNetra — Starting Sovereign AI Platform")
    logger.info("=" * 60)

    # Initial ETL run
    try:
        logger.info("[Startup] Running initial ETL pipeline...")
        result = await etl_pipeline.run_all()
        logger.info(f"[Startup] ETL complete: {result.get('total_records', 0)} records ingested")
    except Exception as e:
        logger.warning(f"[Startup] Initial ETL failed (non-critical): {e}")

    # Start background ETL scheduler
    etl_task = asyncio.create_task(background_etl_scheduler())

    yield

    # Shutdown
    logger.info("[Shutdown] Cleaning up resources...")
    etl_task.cancel()
    await etl_pipeline.close_all()
    logger.info("[Shutdown] ViksitNetra stopped.")


async def background_etl_scheduler():
    """Background task that periodically runs ETL pipeline."""
    while True:
        try:
            await asyncio.sleep(settings.ETL_POLL_INTERVAL_SECONDS)
            logger.info("[Scheduler] Running periodic ETL cycle...")
            await etl_pipeline.run_all()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"[Scheduler] ETL error: {e}")
            await asyncio.sleep(60)


# Create FastAPI app
app = FastAPI(
    title="ViksitNetra API",
    description=(
        "Viksit Bharat Intelligence Eye — India's sovereign AI-powered knowledge graph platform "
        "for governance, strategic decision-making, and citizen empowerment. "
        "Connected to 7+ government data sources in real-time."
    ),
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(api_router, prefix=settings.API_PREFIX)

from app.api.graph_routes import router as graph_router
app.include_router(graph_router, prefix=settings.API_PREFIX)

# Resolve project root — must find index.html
# Strategy: try multiple candidate directories in order
_candidates = [
    os.getcwd(),                                                          # Docker WORKDIR = /app/
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),           # two parents up from main.py
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),  # three parents up (local dev)
    "/app",                                                               # hardcoded Docker fallback
]

root_dir = os.getcwd()  # default
for candidate in _candidates:
    if candidate and os.path.exists(os.path.join(candidate, "index.html")):
        root_dir = candidate
        break

logger.info(f"[Config] root_dir resolved to: {root_dir}")
logger.info(f"[Config] index.html exists: {os.path.exists(os.path.join(root_dir, 'index.html'))}")
logger.info(f"[Config] __file__ = {__file__}")
logger.info(f"[Config] cwd = {os.getcwd()}")

frontend_dir = os.path.join(root_dir, "frontend")

# Serve frontend subdirectory files
if os.path.exists(frontend_dir):
    js_dir = os.path.join(frontend_dir, "js")
    if os.path.exists(js_dir):
        app.mount("/frontend/js", StaticFiles(directory=js_dir), name="frontend_js")
    css_dir = os.path.join(frontend_dir, "css")
    if os.path.exists(css_dir):
        app.mount("/frontend/css", StaticFiles(directory=css_dir), name="frontend_css")
    if os.path.exists(os.path.join(frontend_dir, "assets")):
        app.mount("/frontend/assets", StaticFiles(directory=os.path.join(frontend_dir, "assets")), name="frontend_assets")
    if os.path.exists(os.path.join(frontend_dir, "pages")):
        app.mount("/frontend/pages", StaticFiles(directory=os.path.join(frontend_dir, "pages")), name="frontend_pages")


# Serve individual root-level files
@app.get("/style.css")
async def serve_style():
    return FileResponse(os.path.join(root_dir, "style.css"), media_type="text/css")


@app.get("/styles.css")
async def serve_styles():
    path = os.path.join(root_dir, "styles.css")
    if os.path.exists(path):
        return FileResponse(path, media_type="text/css")
    return FileResponse(os.path.join(root_dir, "style.css"), media_type="text/css")


@app.get("/app.js")
async def serve_app_js():
    return FileResponse(os.path.join(root_dir, "app.js"), media_type="application/javascript")


@app.get("/india_map_bg.png")
async def serve_india_map_bg():
    return FileResponse(os.path.join(root_dir, "india_map_bg.png"), media_type="image/png")


@app.get("/india_map_neon.png")
async def serve_india_map_neon():
    return FileResponse(os.path.join(root_dir, "india_map_neon.png"), media_type="image/png")


@app.get("/knowledge_graph_hero.png")
async def serve_kg_hero():
    return FileResponse(os.path.join(root_dir, "knowledge_graph_hero.png"), media_type="image/png")


@app.get("/viksitnetra_hero_bg.png")
async def serve_hero_bg():
    path = os.path.join(root_dir, "viksitnetra_hero_bg.png")
    if not os.path.exists(path):
        path = os.path.join(root_dir, "bharatjnana_hero_bg.png")
    if os.path.exists(path):
        return FileResponse(path, media_type="image/png")
    return {"error": "Image not found"}


@app.get("/bharatjnana_hero_bg.png")
async def serve_bharatjnana_hero_bg():
    path = os.path.join(root_dir, "bharatjnana_hero_bg.png")
    if os.path.exists(path):
        return FileResponse(path, media_type="image/png")
    return {"error": "Image not found"}


@app.get("/emergency.html")
async def serve_emergency_html():
    path = os.path.join(root_dir, "emergency.html")
    if os.path.exists(path):
        return FileResponse(path)
    return {"error": "Page not found"}


@app.get("/emergency.css")
async def serve_emergency_css():
    path = os.path.join(root_dir, "emergency.css")
    if os.path.exists(path):
        return FileResponse(path, media_type="text/css")
    return {"error": "File not found"}


@app.get("/emergency.js")
async def serve_emergency_js():
    path = os.path.join(root_dir, "emergency.js")
    if os.path.exists(path):
        return FileResponse(path, media_type="application/javascript")
    return {"error": "File not found"}


@app.get("/")
async def serve_index():
    """Serve the main dashboard."""
    root_index = os.path.join(root_dir, "index.html")
    if os.path.exists(root_index):
        return FileResponse(root_index)
    return {"message": "ViksitNetra API is running. Visit /api/docs for API documentation."}


@app.get("/admin")
async def serve_admin():
    """Serve the admin panel."""
    admin_path = os.path.join(frontend_dir, "pages", "admin.html")
    if os.path.exists(admin_path):
        return FileResponse(admin_path)
    return {"message": "Admin panel. Visit /api/docs for API documentation."}


if __name__ == "__main__":
    import uvicorn
    os.makedirs("logs", exist_ok=True)
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
