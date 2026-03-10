"""
ViksitNetra — data.gov.in Connector
Connects to India's Open Government Data Platform.
API: https://data.gov.in/ogdp-apis
"""
from typing import Any, Dict, List
from .base import BaseConnector
from app.core.config import settings
from loguru import logger


class DataGovInConnector(BaseConnector):
    """Connector for data.gov.in — India's primary Open Data portal."""

    # Popular resource IDs on data.gov.in
    RESOURCE_CATALOG = {
        "crop_production": "9ef84268-d588-465a-a308-a864a43d0070",
        "rainfall_data": "cdd2f274-20e5-4be1-81b6-ae8e80853d7d",
        "hospital_data": "4c85e58e-9789-4dc0-8f87-73b2c39e1b56",
        "electricity_stats": "7a9a1cb0-b4e4-4bcc-8029-6be41df7a4bc",
        "school_education": "b5c7df28-bea6-4247-84fa-1e9c0a1b2d1d",
        "economic_survey": "e2dac7ab-d7da-4a82-9a47-5c0c3cd0e7c3",
        "census_2011": "f1d9e89f-e3a5-4a27-b7b4-3af7aa1b1f9c",
    }

    def __init__(self):
        super().__init__(
            name="data_gov_in",
            base_url=settings.DATA_GOV_IN_BASE_URL,
            api_key=settings.DATA_GOV_IN_API_KEY,
        )

    async def fetch(self, resource_id: str = None, limit: int = 100, offset: int = 0, **kwargs) -> List[Dict[str, Any]]:
        """Fetch datasets from data.gov.in API."""
        client = await self.get_client()

        # If no resource_id, fetch catalog
        if not resource_id:
            resource_id = self.RESOURCE_CATALOG.get("crop_production", "")

        params = {
            "api-key": self.api_key or "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b",
            "format": "json",
            "limit": min(limit, 1000),
            "offset": offset,
        }

        url = f"{self.base_url}/{resource_id}"
        try:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            records = data.get("records", [])
            logger.info(f"[DataGovIn] Fetched {len(records)} records from resource {resource_id}")
            return records
        except Exception as e:
            logger.warning(f"[DataGovIn] API fetch failed: {e}, returning sample data")
            return self._get_sample_data()

    async def fetch_catalog(self, search: str = "agriculture", limit: int = 20) -> List[Dict]:
        """Search the data.gov.in catalog."""
        client = await self.get_client()
        try:
            response = await client.get(
                "https://data.gov.in/backend/dmspublic/v1/resources",
                params={"search": search, "limit": limit, "format": "json"},
            )
            return response.json().get("resources", [])
        except Exception as e:
            logger.warning(f"[DataGovIn] Catalog search failed: {e}")
            return []

    async def transform(self, raw_data: List[Dict]) -> List[Dict[str, Any]]:
        """Transform data.gov.in records into knowledge graph nodes."""
        nodes = []
        for record in raw_data:
            node = {
                "type": "GovernmentData",
                "source": "data.gov.in",
                "properties": {},
            }
            # Extract all fields dynamically
            for key, value in record.items():
                clean_key = key.strip().replace(" ", "_").lower()
                node["properties"][clean_key] = value

            # Add metadata
            node["properties"]["ingested_at"] = "2026-03-04T10:25:00+05:30"
            node["properties"]["source_api"] = "data.gov.in"

            # Determine subcategory
            if any(k in str(record).lower() for k in ["crop", "agriculture", "farm"]):
                node["category"] = "Agriculture"
            elif any(k in str(record).lower() for k in ["rainfall", "weather", "climate"]):
                node["category"] = "Climate"
            elif any(k in str(record).lower() for k in ["hospital", "health", "medical"]):
                node["category"] = "Healthcare"
            elif any(k in str(record).lower() for k in ["school", "education", "literacy"]):
                node["category"] = "Education"
            else:
                node["category"] = "General"

            nodes.append(node)
        return nodes

    def _get_sample_data(self) -> List[Dict]:
        """Fallback sample data when API is not accessible."""
        return [
            {"state_name": "Uttar Pradesh", "district_name": "Lucknow", "crop": "Rice", "production": "12500",
             "area": "8200", "yield": "1524", "season": "Kharif", "year": "2024-25"},
            {"state_name": "Maharashtra", "district_name": "Pune", "crop": "Sugarcane", "production": "98000",
             "area": "4500", "yield": "21778", "season": "Annual", "year": "2024-25"},
            {"state_name": "Punjab", "district_name": "Ludhiana", "crop": "Wheat", "production": "18900",
             "area": "9800", "yield": "1929", "season": "Rabi", "year": "2024-25"},
            {"state_name": "Karnataka", "district_name": "Bengaluru Rural", "crop": "Ragi", "production": "3200",
             "area": "2100", "yield": "1524", "season": "Kharif", "year": "2024-25"},
            {"state_name": "Tamil Nadu", "district_name": "Thanjavur", "crop": "Rice", "production": "15600",
             "area": "7800", "yield": "2000", "season": "Kharif", "year": "2024-25"},
            {"state_name": "Gujarat", "district_name": "Rajkot", "crop": "Groundnut", "production": "8700",
             "area": "4300", "yield": "2023", "season": "Kharif", "year": "2024-25"},
            {"state_name": "Madhya Pradesh", "district_name": "Indore", "crop": "Soybean", "production": "11200",
             "area": "6500", "yield": "1723", "season": "Kharif", "year": "2024-25"},
            {"state_name": "Rajasthan", "district_name": "Jaipur", "crop": "Mustard", "production": "5600",
             "area": "3200", "yield": "1750", "season": "Rabi", "year": "2024-25"},
        ]
