"""
ViksitNetra — Base ETL Connector
Abstract base for all government data source connectors.
"""
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional
from loguru import logger
import httpx
import asyncio


class BaseConnector(ABC):
    """Base class for all government API connectors."""

    def __init__(self, name: str, base_url: str, api_key: Optional[str] = None):
        self.name = name
        self.base_url = base_url
        self.api_key = api_key
        self.last_fetch = None
        self.fetch_count = 0
        self.error_count = 0
        self._client = None

    async def get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=30.0,
                headers=self._default_headers(),
                follow_redirects=True,
            )
        return self._client

    def _default_headers(self) -> Dict[str, str]:
        headers = {
            "User-Agent": "ViksitNetra/1.0 (Sovereign-AI-Platform)",
            "Accept": "application/json",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    @abstractmethod
    async def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        """Fetch data from the source."""
        pass

    @abstractmethod
    async def transform(self, raw_data: List[Dict]) -> List[Dict[str, Any]]:
        """Transform raw data into graph-compatible format."""
        pass

    async def execute(self, **kwargs) -> Dict[str, Any]:
        """Full ETL pipeline execution."""
        start_time = datetime.utcnow()
        try:
            logger.info(f"[ETL:{self.name}] Starting data fetch...")
            raw_data = await self.fetch(**kwargs)
            logger.info(f"[ETL:{self.name}] Fetched {len(raw_data)} records")

            transformed = await self.transform(raw_data)
            logger.info(f"[ETL:{self.name}] Transformed {len(transformed)} records")

            self.last_fetch = datetime.utcnow()
            self.fetch_count += 1

            return {
                "source": self.name,
                "records_fetched": len(raw_data),
                "records_transformed": len(transformed),
                "duration_ms": (datetime.utcnow() - start_time).total_seconds() * 1000,
                "timestamp": self.last_fetch.isoformat(),
                "data": transformed,
            }
        except Exception as e:
            self.error_count += 1
            logger.error(f"[ETL:{self.name}] Error: {e}")
            return {
                "source": self.name,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
                "data": [],
            }

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    def status(self) -> Dict:
        return {
            "name": self.name,
            "base_url": self.base_url,
            "last_fetch": self.last_fetch.isoformat() if self.last_fetch else None,
            "fetch_count": self.fetch_count,
            "error_count": self.error_count,
            "status": "active" if self.error_count < 5 else "degraded",
        }
