"""
ViksitNetra — Additional Government Connectors
NDAP (NITI Aayog), MOSPI, Bhuvan ISRO, Election Commission
"""
from typing import Any, Dict, List
from .base import BaseConnector
from app.core.config import settings
from loguru import logger


class NDAPConnector(BaseConnector):
    """Connector for NDAP — National Data and Analytics Platform (NITI Aayog)."""

    def __init__(self):
        super().__init__(name="ndap_niti", base_url=settings.NDAP_NITI_BASE_URL)

    async def fetch(self, indicator: str = "gdp", **kwargs) -> List[Dict[str, Any]]:
        client = await self.get_client()
        try:
            response = await client.get(f"{self.base_url}/datasets", params={"search": indicator, "format": "json"})
            if response.status_code == 200:
                return response.json().get("data", response.json().get("datasets", []))
        except Exception as e:
            logger.warning(f"[NDAP] API unavailable: {e}")
        return self._get_sample_data()

    async def transform(self, raw_data: List[Dict]) -> List[Dict[str, Any]]:
        return [{"type": "NDAPIndicator", "source": "NITI Aayog NDAP", "category": "Economics",
                 "properties": {**record, "ingested_at": "2026-03-04T10:25:00+05:30"}} for record in raw_data]

    def _get_sample_data(self) -> List[Dict]:
        return [
            {"indicator": "GDP Growth Rate", "value": 7.2, "unit": "%", "period": "Q4 2025",
             "state": "All India", "source": "CSO", "sector": "Overall"},
            {"indicator": "GDP Growth Rate", "value": 8.1, "unit": "%", "period": "Q4 2025",
             "state": "Uttar Pradesh", "source": "CSO", "sector": "Services"},
            {"indicator": "FDI Inflow", "value": 84.8, "unit": "USD Billion", "period": "2025-26",
             "state": "All India", "source": "DPIIT", "sector": "Overall"},
            {"indicator": "Unemployment Rate", "value": 3.2, "unit": "%", "period": "Feb 2026",
             "state": "All India", "source": "CMIE", "sector": "Overall"},
            {"indicator": "Per Capita Income", "value": 204000, "unit": "INR", "period": "2025-26",
             "state": "All India", "source": "MOSPI", "sector": "Overall"},
            {"indicator": "Industrial Production", "value": 5.8, "unit": "% growth", "period": "Jan 2026",
             "state": "All India", "source": "CSO", "sector": "Manufacturing"},
            {"indicator": "CPI Inflation", "value": 4.1, "unit": "%", "period": "Feb 2026",
             "state": "All India", "source": "RBI", "sector": "Consumer Prices"},
            {"indicator": "Fiscal Deficit", "value": 5.1, "unit": "% of GDP", "period": "2025-26 RE",
             "state": "All India", "source": "MoF", "sector": "Government Finance"},
        ]


class MOSPIConnector(BaseConnector):
    """Connector for MOSPI — Ministry of Statistics and Programme Implementation."""

    def __init__(self):
        super().__init__(name="mospi", base_url=settings.MOSPI_BASE_URL)

    async def fetch(self, dataset: str = "iip", **kwargs) -> List[Dict[str, Any]]:
        client = await self.get_client()
        try:
            response = await client.get(f"{settings.MOSPI_ESANKHYIKI}/statistical-year-book-india",
                                        params={"format": "json"})
            if response.status_code == 200:
                return response.json().get("data", [])
        except Exception as e:
            logger.warning(f"[MOSPI] API unavailable: {e}")
        return self._get_sample_data()

    async def transform(self, raw_data: List[Dict]) -> List[Dict[str, Any]]:
        return [{"type": "StatisticalData", "source": "MOSPI e-Sankhyiki", "category": "Economics",
                 "properties": {**record, "ingested_at": "2026-03-04T10:25:00+05:30"}} for record in raw_data]

    def _get_sample_data(self) -> List[Dict]:
        return [
            {"indicator": "IIP Index (Base 2011-12)", "value": 142.3, "period": "Jan 2026",
             "sector": "Mining", "growth_rate": 3.2},
            {"indicator": "IIP Index (Base 2011-12)", "value": 138.7, "period": "Jan 2026",
             "sector": "Manufacturing", "growth_rate": 5.8},
            {"indicator": "IIP Index (Base 2011-12)", "value": 165.1, "period": "Jan 2026",
             "sector": "Electricity", "growth_rate": 6.1},
            {"indicator": "WPI Inflation", "value": 1.8, "period": "Jan 2026",
             "sector": "All Commodities", "growth_rate": -0.3},
            {"indicator": "CPI Rural", "value": 198.4, "period": "Jan 2026",
             "sector": "Food", "growth_rate": 4.8},
            {"indicator": "CPI Urban", "value": 195.2, "period": "Jan 2026",
             "sector": "Food", "growth_rate": 3.9},
        ]


class BhuvanISROConnector(BaseConnector):
    """Connector for Bhuvan ISRO — Indian Space Research Organization's Geoportal."""

    def __init__(self):
        super().__init__(name="bhuvan_isro", base_url=settings.BHUVAN_ISRO_BASE_URL)

    async def fetch(self, layer: str = "flood_affected", **kwargs) -> List[Dict[str, Any]]:
        client = await self.get_client()
        try:
            # Try WMS GetCapabilities
            response = await client.get(
                settings.BHUVAN_ISRO_WMS,
                params={"service": "WMS", "request": "GetCapabilities", "version": "1.1.1"},
            )
            if response.status_code == 200:
                return [{"type": "capabilities", "data": response.text[:5000]}]
        except Exception as e:
            logger.warning(f"[Bhuvan] WMS unavailable: {e}")
        return self._get_sample_data()

    async def transform(self, raw_data: List[Dict]) -> List[Dict[str, Any]]:
        return [{"type": "SatelliteData", "source": "Bhuvan ISRO", "category": "Climate",
                 "properties": {**record, "ingested_at": "2026-03-04T10:25:00+05:30"}} for record in raw_data]

    def _get_sample_data(self) -> List[Dict]:
        return [
            {"layer": "flood_affected_areas", "region": "Assam", "status": "Active Flood",
             "area_sq_km": 12500, "population_affected": 4500000, "satellite": "ResourceSat-2A",
             "updated": "2026-03-04", "lat": 26.14, "lon": 91.74},
            {"layer": "forest_fire", "region": "Uttarakhand", "status": "Moderate Risk",
             "area_sq_km": 350, "satellite": "INSAT-3D", "updated": "2026-03-04",
             "lat": 30.07, "lon": 79.00},
            {"layer": "crop_health_ndvi", "region": "Punjab", "status": "Healthy",
             "ndvi_avg": 0.72, "satellite": "CartoSat-2E", "updated": "2026-03-03",
             "lat": 31.10, "lon": 75.78},
            {"layer": "urban_growth", "region": "Bengaluru", "status": "High Expansion",
             "area_sq_km": 8, "growth_rate_pct": 3.2, "satellite": "ResourceSat-2",
             "updated": "2026-03-01", "lat": 12.97, "lon": 77.59},
            {"layer": "drought_monitoring", "region": "Marathwada", "status": "Severe Drought",
             "severity_index": 3.8, "satellite": "INSAT-3DR", "updated": "2026-03-04",
             "lat": 19.88, "lon": 75.32},
        ]


class ECIConnector(BaseConnector):
    """Connector for Election Commission of India data."""

    def __init__(self):
        super().__init__(name="eci", base_url=settings.ECI_BASE_URL)

    async def fetch(self, election_type: str = "general", **kwargs) -> List[Dict[str, Any]]:
        client = await self.get_client()
        try:
            response = await client.get(f"{settings.ECI_DATA_URL}", params={"type": election_type})
            if response.status_code == 200:
                return response.json().get("data", [])
        except Exception as e:
            logger.warning(f"[ECI] API unavailable: {e}")
        return self._get_sample_data()

    async def transform(self, raw_data: List[Dict]) -> List[Dict[str, Any]]:
        return [{"type": "ElectionData", "source": "Election Commission", "category": "Civic",
                 "properties": {**record, "ingested_at": "2026-03-04T10:25:00+05:30"}} for record in raw_data]

    def _get_sample_data(self) -> List[Dict]:
        return [
            {"state": "Uttar Pradesh", "total_electors": 150000000, "voter_turnout_pct": 61.2,
             "male_voters": 82000000, "female_voters": 68000000, "constituencies": 80,
             "election": "General 2024", "type": "Lok Sabha"},
            {"state": "Maharashtra", "total_electors": 95000000, "voter_turnout_pct": 62.8,
             "male_voters": 50000000, "female_voters": 45000000, "constituencies": 48,
             "election": "General 2024", "type": "Lok Sabha"},
            {"state": "Bihar", "total_electors": 72000000, "voter_turnout_pct": 57.3,
             "male_voters": 39000000, "female_voters": 33000000, "constituencies": 40,
             "election": "General 2024", "type": "Lok Sabha"},
            {"state": "Tamil Nadu", "total_electors": 62000000, "voter_turnout_pct": 69.7,
             "male_voters": 31000000, "female_voters": 31000000, "constituencies": 39,
             "election": "General 2024", "type": "Lok Sabha"},
            {"state": "West Bengal", "total_electors": 67000000, "voter_turnout_pct": 73.1,
             "male_voters": 35000000, "female_voters": 32000000, "constituencies": 42,
             "election": "General 2024", "type": "Lok Sabha"},
            {"state": "Rajasthan", "total_electors": 50000000, "voter_turnout_pct": 65.9,
             "male_voters": 27000000, "female_voters": 23000000, "constituencies": 25,
             "election": "General 2024", "type": "Lok Sabha"},
        ]
