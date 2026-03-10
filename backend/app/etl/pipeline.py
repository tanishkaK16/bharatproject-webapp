"""
ViksitNetra — ETL Pipeline Orchestrator
Coordinates real-time data ingestion from all 7 government sources.
"""
import asyncio
from datetime import datetime
from typing import Dict, List, Any
from loguru import logger

from app.etl.connectors.data_gov_in import DataGovInConnector
from app.etl.connectors.imd_mausam import IMDMausamConnector
from app.etl.connectors.pib_rss import PIBRSSConnector
from app.etl.connectors.gov_connectors import (
    NDAPConnector, MOSPIConnector, BhuvanISROConnector, ECIConnector
)


class ETLPipeline:
    """Orchestrates real-time ETL from all government data sources."""

    def __init__(self):
        self.connectors = {
            "data_gov_in": DataGovInConnector(),
            "imd_mausam": IMDMausamConnector(),
            "pib_rss": PIBRSSConnector(),
            "ndap_niti": NDAPConnector(),
            "mospi": MOSPIConnector(),
            "bhuvan_isro": BhuvanISROConnector(),
            "eci": ECIConnector(),
        }
        self.last_run = None
        self.run_count = 0
        self.total_records = 0
        self._cache = {}
        self._running = False

    async def run_all(self) -> Dict[str, Any]:
        """Execute all ETL connectors in parallel."""
        self._running = True
        start = datetime.utcnow()
        logger.info("=" * 60)
        logger.info("[ETL Pipeline] Starting full data ingestion cycle...")
        logger.info("=" * 60)

        tasks = []
        for name, connector in self.connectors.items():
            tasks.append(self._run_connector(name, connector))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        pipeline_result = {
            "run_id": self.run_count + 1,
            "start_time": start.isoformat(),
            "end_time": datetime.utcnow().isoformat(),
            "duration_ms": (datetime.utcnow() - start).total_seconds() * 1000,
            "sources": {},
            "total_records": 0,
            "errors": [],
        }

        for name, result in zip(self.connectors.keys(), results):
            if isinstance(result, Exception):
                pipeline_result["errors"].append({"source": name, "error": str(result)})
                pipeline_result["sources"][name] = {"status": "error", "error": str(result)}
            else:
                pipeline_result["sources"][name] = {
                    "status": "success",
                    "records": result.get("records_transformed", 0),
                    "duration_ms": result.get("duration_ms", 0),
                }
                pipeline_result["total_records"] += result.get("records_transformed", 0)
                self._cache[name] = result.get("data", [])

        self.last_run = datetime.utcnow()
        self.run_count += 1
        self.total_records += pipeline_result["total_records"]
        self._running = False

        logger.info(f"[ETL Pipeline] Cycle complete. {pipeline_result['total_records']} records processed.")
        return pipeline_result

    async def _run_connector(self, name: str, connector) -> Dict:
        """Run a single connector with error isolation."""
        try:
            return await connector.execute()
        except Exception as e:
            logger.error(f"[ETL:{name}] Fatal error: {e}")
            return {"source": name, "error": str(e), "records_transformed": 0, "data": []}

    async def run_single(self, source_name: str) -> Dict[str, Any]:
        """Run a single ETL connector."""
        connector = self.connectors.get(source_name)
        if not connector:
            return {"error": f"Unknown source: {source_name}"}
        result = await connector.execute()
        self._cache[source_name] = result.get("data", [])
        return result

    def get_cached_data(self, source_name: str = None) -> Any:
        """Get cached data from last ETL run."""
        if source_name:
            return self._cache.get(source_name, [])
        return self._cache

    def get_all_cached_flat(self) -> List[Dict]:
        """Get all cached data as a flat list."""
        all_data = []
        for source_data in self._cache.values():
            if isinstance(source_data, list):
                all_data.extend(source_data)
        return all_data

    def status(self) -> Dict:
        """Get pipeline status."""
        connector_statuses = {}
        for name, connector in self.connectors.items():
            connector_statuses[name] = connector.status()

        return {
            "pipeline_status": "running" if self._running else "idle",
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "run_count": self.run_count,
            "total_records_processed": self.total_records,
            "cached_records": sum(len(v) for v in self._cache.values() if isinstance(v, list)),
            "connectors": connector_statuses,
        }

    async def close_all(self):
        """Close all connector clients."""
        for connector in self.connectors.values():
            await connector.close()


# Singleton
etl_pipeline = ETLPipeline()
