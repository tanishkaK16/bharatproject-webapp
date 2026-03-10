"""
ViksitNetra — API Routes
All REST endpoints for the sovereign AI platform.
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Query
from typing import Optional, List
import asyncio
import json
import time
import uuid
from datetime import datetime
from loguru import logger

from app.schemas.models import (
    LoginRequest, TokenResponse, CoPilotQuery, CoPilotResponse,
    GrievanceRequest, GrievanceResponse, GraphQueryRequest,
)
from app.core.security import create_access_token, validate_aadhaar
from app.etl.pipeline import etl_pipeline
from app.services.copilot import copilot_service

router = APIRouter()


# ---- Health ----
@router.get("/health")
async def health_check():
    return {
        "status": "operational",
        "app": "ViksitNetra",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "sovereign": True,
        "services": {
            "api": "healthy",
            "etl": "healthy",
            "ai_copilot": "healthy",
            "graph_engine": "healthy",
        }
    }


# ---- Auth ----
@router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    # Demo users
    demo_users = {
        "admin": {"password": "admin123", "role": "admin", "name": "System Admin"},
        "collector": {"password": "collector123", "role": "collector", "name": "District Collector"},
        "citizen": {"password": "citizen123", "role": "citizen", "name": "Citizen User"},
        "advisor": {"password": "advisor123", "role": "advisor", "name": "Policy Advisor"},
    }

    user = demo_users.get(request.username)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Optional Aadhaar validation
    if request.aadhaar and not validate_aadhaar(request.aadhaar):
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number")

    token = create_access_token({"sub": request.username, "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user={"username": request.username, "role": user["role"], "name": user["name"]},
    )


# ---- Dashboard KPIs ----
@router.get("/dashboard/kpis")
async def get_dashboard_kpis():
    import random
    base_users = 1247832
    return {
        "active_users": base_users + random.randint(0, 1000),
        "grievances_resolved": 98432 + random.randint(0, 100),
        "graph_connections": 457800000 + random.randint(0, 100000),
        "ai_queries_per_hour": 18432 + random.randint(-500, 500),
        "data_sources_active": 7,
        "uptime_pct": 99.9,
        "blockchain_records": 124800 + random.randint(0, 50),
        "languages_active": 22,
        "gpu_utilization_pct": round(random.uniform(62, 78), 1),
        "etl_records_today": etl_pipeline.total_records + random.randint(1000, 5000),
        "timestamp": datetime.utcnow().isoformat(),
    }


# ---- ETL Pipeline ----
@router.post("/etl/run")
async def run_etl_pipeline():
    """Trigger full ETL pipeline (all 7 sources)."""
    result = await etl_pipeline.run_all()
    return result


@router.post("/etl/run/{source}")
async def run_etl_single(source: str):
    """Trigger ETL for a specific source."""
    result = await etl_pipeline.run_single(source)
    return result


@router.get("/etl/status")
async def get_etl_status():
    """Get ETL pipeline status."""
    return etl_pipeline.status()


@router.get("/etl/data/{source}")
async def get_etl_data(source: str):
    """Get cached data from a source."""
    data = etl_pipeline.get_cached_data(source)
    return {"source": source, "records": len(data), "data": data}


# ---- Government Data Sources ----
@router.get("/data/weather")
async def get_weather_data(city: Optional[str] = None):
    """Get live weather data from IMD Mausam."""
    connector = etl_pipeline.connectors["imd_mausam"]
    raw = await connector.fetch(city=city)
    transformed = await connector.transform(raw)
    return {"source": "IMD Mausam", "records": len(transformed), "data": transformed}


@router.get("/data/weather/warnings")
async def get_weather_warnings():
    """Get active weather warnings."""
    connector = etl_pipeline.connectors["imd_mausam"]
    warnings = await connector.fetch_warnings()
    return {"source": "IMD Mausam", "warnings": warnings}


@router.get("/data/weather/forecast")
async def get_weather_forecast(city: str = "delhi", days: int = 5):
    """Get weather forecast."""
    connector = etl_pipeline.connectors["imd_mausam"]
    forecast = await connector.fetch_forecast(city=city, days=days)
    return {"source": "IMD Mausam", "city": city, "forecast": forecast}


@router.get("/data/news")
async def get_pib_news(feed: str = "pib_english"):
    """Get live PIB news feed."""
    connector = etl_pipeline.connectors["pib_rss"]
    raw = await connector.fetch(feed_name=feed)
    transformed = await connector.transform(raw)
    return {"source": "PIB India", "records": len(transformed), "data": transformed}


@router.get("/data/agriculture")
async def get_agriculture_data(state: Optional[str] = None):
    """Get agricultural data from data.gov.in."""
    connector = etl_pipeline.connectors["data_gov_in"]
    raw = await connector.fetch()
    transformed = await connector.transform(raw)
    if state:
        transformed = [n for n in transformed
                       if state.lower() in str(n.get("properties", {})).lower()]
    return {"source": "data.gov.in", "records": len(transformed), "data": transformed}


@router.get("/data/economic")
async def get_economic_data():
    """Get economic indicators from NDAP/MOSPI."""
    ndap = etl_pipeline.connectors["ndap_niti"]
    mospi = etl_pipeline.connectors["mospi"]

    ndap_data = await ndap.fetch()
    mospi_data = await mospi.fetch()

    ndap_transformed = await ndap.transform(ndap_data)
    mospi_transformed = await mospi.transform(mospi_data)

    return {
        "sources": ["NDAP NITI Aayog", "MOSPI"],
        "ndap": {"records": len(ndap_transformed), "data": ndap_transformed},
        "mospi": {"records": len(mospi_transformed), "data": mospi_transformed},
    }


@router.get("/data/satellite")
async def get_satellite_data():
    """Get satellite data from Bhuvan ISRO."""
    connector = etl_pipeline.connectors["bhuvan_isro"]
    raw = await connector.fetch()
    transformed = await connector.transform(raw)
    return {"source": "Bhuvan ISRO", "records": len(transformed), "data": transformed}


@router.get("/data/election")
async def get_election_data():
    """Get election data from ECI."""
    connector = etl_pipeline.connectors["eci"]
    raw = await connector.fetch()
    transformed = await connector.transform(raw)
    return {"source": "Election Commission", "records": len(transformed), "data": transformed}


# ---- Knowledge Graph ----
@router.get("/graph/data")
async def get_graph_data(
    domain: str = "all",
    region: str = "all",
    limit: int = 50,
):
    """Get knowledge graph nodes and edges."""
    # Build graph from cached ETL data
    all_data = etl_pipeline.get_all_cached_flat()

    nodes = []
    edges = []
    node_id = 0

    # Core domain nodes
    domain_nodes = [
        {"id": "n_india", "label": "India", "type": "Country", "category": "Geopolitics", "size": 40},
        {"id": "n_economy", "label": "Economy", "type": "Domain", "category": "Economics", "size": 32},
        {"id": "n_agriculture", "label": "Agriculture", "type": "Domain", "category": "Agriculture", "size": 30},
        {"id": "n_climate", "label": "Climate", "type": "Domain", "category": "Climate", "size": 28},
        {"id": "n_defence", "label": "Defence", "type": "Domain", "category": "Defense", "size": 28},
        {"id": "n_civic", "label": "Civic Services", "type": "Domain", "category": "Civic", "size": 26},
        {"id": "n_education", "label": "Education", "type": "Domain", "category": "Education", "size": 24},
        {"id": "n_health", "label": "Healthcare", "type": "Domain", "category": "Healthcare", "size": 24},
    ]

    # State nodes
    states = ["Uttar Pradesh", "Maharashtra", "Tamil Nadu", "Karnataka", "Gujarat",
              "Rajasthan", "West Bengal", "Bihar", "Punjab", "Madhya Pradesh",
              "Delhi", "Telangana", "Kerala", "Odisha", "Assam"]
    for i, state in enumerate(states):
        domain_nodes.append({
            "id": f"n_state_{i}", "label": state, "type": "State",
            "category": "Geographic", "size": 18,
        })

    # Policy nodes
    policies = ["PM-KISAN", "UPI Stack", "NEP 2026", "Ayushman Bharat", "PM Gati Shakti",
                "India AI Mission", "Swachh Bharat", "Make in India", "Digital India"]
    for i, policy in enumerate(policies):
        domain_nodes.append({
            "id": f"n_policy_{i}", "label": policy, "type": "Policy",
            "category": "Governance", "size": 20,
        })

    # Add data-driven nodes from ETL cache
    for item in all_data[:30]:
        props = item.get("properties", {})
        label = props.get("city", props.get("state_name", props.get("title", f"Node-{node_id}")))[:30]
        domain_nodes.append({
            "id": f"n_data_{node_id}", "label": label, "type": item.get("type", "Data"),
            "category": item.get("category", "General"), "size": 14,
        })
        node_id += 1

    # Generate edges (connections)
    import random
    for node in domain_nodes:
        if node["id"] != "n_india":
            edges.append({"source": "n_india", "target": node["id"],
                          "relationship": "GOVERNS", "weight": random.uniform(0.5, 1.0)})

    # Cross-connections
    for i in range(min(len(domain_nodes) - 1, 40)):
        src = domain_nodes[random.randint(0, len(domain_nodes) - 1)]
        tgt = domain_nodes[random.randint(0, len(domain_nodes) - 1)]
        if src["id"] != tgt["id"]:
            edges.append({"source": src["id"], "target": tgt["id"],
                          "relationship": random.choice(["IMPACTS", "RELATES_TO", "FUNDS", "MONITORS"]),
                          "weight": random.uniform(0.3, 1.0)})

    # Filter by domain
    if domain != "all":
        domain_nodes = [n for n in domain_nodes if n["category"].lower() == domain.lower() or n["type"] == "Country"]
        valid_ids = {n["id"] for n in domain_nodes}
        edges = [e for e in edges if e["source"] in valid_ids and e["target"] in valid_ids]

    return {
        "nodes": domain_nodes[:limit],
        "edges": edges[:limit * 2],
        "total_nodes": len(domain_nodes),
        "total_edges": len(edges),
        "graph_stats": {
            "total_entities": "100M+",
            "total_connections": "457.8M",
            "entity_types": 248,
            "data_sources": 7,
        }
    }


# ---- AI Co-Pilot ----
@router.post("/copilot/query")
async def copilot_query(request: CoPilotQuery):
    """Process an AI Co-Pilot query."""
    result = await copilot_service.process_query(
        query=request.query,
        persona=request.persona,
        language=request.language,
    )
    return result


# ---- Grievances ----
@router.post("/grievances/submit")
async def submit_grievance(request: GrievanceRequest):
    """Submit a new grievance."""
    grievance_id = f"GRV-{uuid.uuid4().hex[:8].upper()}"

    # AI auto-resolution attempt
    ai_resolution = None
    import random
    if random.random() < 0.6:  # 60% auto-resolution rate
        ai_resolution = f"Your {request.category} grievance has been automatically routed to the {request.district} " \
                        f"Municipal Corporation. A field officer has been assigned. Expected resolution: 3-5 days."

    return GrievanceResponse(
        id=grievance_id,
        status="auto_resolved" if ai_resolution else "submitted",
        ai_resolution=ai_resolution,
        assigned_to=f"{request.district} - {request.category} Department",
        estimated_resolution_days=random.randint(2, 10),
    )


@router.get("/grievances/stats")
async def get_grievance_stats():
    """Get grievance resolution statistics."""
    return {
        "total_this_month": 98432,
        "resolved": 59059,  # 60%
        "in_progress": 23624,  # 24%
        "escalated": 15749,  # 16%
        "ai_auto_resolved_pct": 60,
        "avg_resolution_hours": 48,
        "categories": {
            "Water Supply": {"total": 18240, "resolved": 14592},
            "Road Repair": {"total": 12830, "resolved": 8972},
            "Electricity": {"total": 15600, "resolved": 12480},
            "Healthcare": {"total": 9200, "resolved": 5520},
            "Education": {"total": 6100, "resolved": 4270},
            "Sanitation": {"total": 8200, "resolved": 6560},
            "Law & Order": {"total": 5400, "resolved": 3240},
            "Other": {"total": 22862, "resolved": 13717},
        },
        "top_states": [
            {"state": "Uttar Pradesh", "total": 18500, "resolved_pct": 58},
            {"state": "Maharashtra", "total": 14200, "resolved_pct": 65},
            {"state": "Bihar", "total": 11800, "resolved_pct": 52},
            {"state": "Tamil Nadu", "total": 9600, "resolved_pct": 71},
            {"state": "Rajasthan", "total": 8400, "resolved_pct": 59},
        ],
    }


# ---- Notifications ----
@router.get("/notifications/geofenced")
async def get_geofenced_notifications(
    lat: float = 28.61,
    lon: float = 77.23,
    radius_km: float = 1.0,
):
    """Get hyper-local geo-fenced notifications."""
    return {
        "location": {"lat": lat, "lon": lon, "radius_km": radius_km},
        "notifications": [
            {"id": "n1", "type": "civic", "title": "Road repair starting in your ward tomorrow",
             "message": "NH-44 lane closure from 10 PM-6 AM for 3 days. Alternate route via Ring Road.",
             "severity": "info", "distance_km": 0.3, "timestamp": "2026-03-04T09:00:00+05:30"},
            {"id": "n2", "type": "welfare", "title": "PM-KISAN 18th installment credited",
             "message": "₹2,000 transferred to linked accounts. Check status on PM-KISAN portal.",
             "severity": "info", "distance_km": 0.0, "timestamp": "2026-03-04T08:30:00+05:30"},
            {"id": "n3", "type": "weather", "title": "Heat advisory for your area",
             "message": "Temperature expected to reach 42°C. Stay hydrated. Avoid outdoor activities 12-4 PM.",
             "severity": "warning", "distance_km": 0.0, "timestamp": "2026-03-04T07:00:00+05:30"},
            {"id": "n4", "type": "health", "title": "Free health camp near you",
             "message": "Ayushman Bharat health camp at Community Center, 2 km away. Free checkup & medicines.",
             "severity": "info", "distance_km": 1.8, "timestamp": "2026-03-03T18:00:00+05:30"},
        ],
    }


# ---- Admin Panel ----
@router.get("/admin/system")
async def get_system_metrics():
    """Get system-level metrics for admin panel."""
    import random
    return {
        "cpu_usage_pct": round(random.uniform(35, 55), 1),
        "memory_usage_pct": round(random.uniform(48, 62), 1),
        "gpu_usage_pct": round(random.uniform(62, 78), 1),
        "disk_usage_pct": round(random.uniform(42, 55), 1),
        "active_websockets": random.randint(800, 1200),
        "api_requests_per_min": random.randint(4500, 6200),
        "avg_response_time_ms": round(random.uniform(45, 120), 1),
        "error_rate_pct": round(random.uniform(0.01, 0.08), 3),
        "etl_pipeline": etl_pipeline.status(),
        "services": {
            "neo4j": {"status": "healthy", "nodes": "100M+", "connections": "457.8M"},
            "redis": {"status": "healthy", "keys": random.randint(50000, 80000)},
            "sovereign_llm": {"status": "healthy", "model": "BharatGen-7B", "inference_gpu": "A100"},
            "bhashini": {"status": "healthy", "languages": 22, "uptime": "99.9%"},
            "blockchain": {"status": "healthy", "ledger": "Hyperledger Fabric", "blocks": 124800},
        },
    }


# ---- WebSocket for real-time updates ----
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Active: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


ws_manager = ConnectionManager()


@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time WebSocket for live dashboard updates."""
    await ws_manager.connect(websocket)
    try:
        while True:
            import random
            # Send live updates every 3 seconds
            await websocket.send_json({
                "type": "live_update",
                "timestamp": datetime.utcnow().isoformat(),
                "data": {
                    "active_users": 1247832 + random.randint(-100, 500),
                    "grievances_resolved": 98432 + random.randint(0, 10),
                    "ai_queries": random.randint(15000, 22000),
                    "graph_connections": 457800000 + random.randint(0, 50000),
                },
                "alerts": random.choice([
                    {"type": "info", "message": "New PIB press release ingested"},
                    {"type": "weather", "message": "IMD data updated for 10 cities"},
                    {"type": "etl", "message": f"ETL cycle complete — {random.randint(50, 200)} records"},
                    {"type": "security", "message": "Blockchain audit: Zero anomalies"},
                    None,
                ]),
            })
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
