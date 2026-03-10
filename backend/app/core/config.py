"""
ViksitNetra — Core Configuration
Centralized settings with env variable support.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "ViksitNetra"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security
    SECRET_KEY: str = "bharatjnana-sovereign-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Neo4j
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "bharatjnana2026"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Government API Keys & Endpoints
    DATA_GOV_IN_API_KEY: str = os.getenv("DATA_GOV_IN_API_KEY", "")
    DATA_GOV_IN_BASE_URL: str = "https://api.data.gov.in/resource"

    IMD_MAUSAM_BASE_URL: str = "https://mausam.imd.gov.in"
    IMD_MAUSAM_API: str = "https://mausam.imd.gov.in/backend/w-api"

    BHUVAN_ISRO_BASE_URL: str = "https://bhuvan.nrsc.gov.in/api"
    BHUVAN_ISRO_WMS: str = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"

    NDAP_NITI_BASE_URL: str = "https://ndap.niti.gov.in/api"

    MOSPI_BASE_URL: str = "https://mospi.gov.in/data"
    MOSPI_ESANKHYIKI: str = "https://www.mospi.gov.in/web/mospi"

    PIB_RSS_URL: str = "https://pib.gov.in/RssMain.aspx"
    PIB_RSS_FEEDS: list = [
        "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
        "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3",
    ]

    ECI_BASE_URL: str = "https://results.eci.gov.in"
    ECI_DATA_URL: str = "https://eci.gov.in/statistical-reports"

    # Bhashini API
    BHASHINI_API_URL: str = "https://meity-auth.ulcacontrib.org"
    BHASHINI_API_KEY: str = os.getenv("BHASHINI_API_KEY", "")
    BHASHINI_USER_ID: str = os.getenv("BHASHINI_USER_ID", "")

    # ETL Configuration
    ETL_POLL_INTERVAL_SECONDS: int = 300  # 5 minutes
    ETL_BATCH_SIZE: int = 1000

    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30

    # CORS
    CORS_ORIGINS: list = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
