"""
ViksitNetra — Pydantic Schemas
API request/response models.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ---- Auth ----
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    aadhaar: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


# ---- Knowledge Graph ----
class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    category: str
    properties: Dict[str, Any] = {}
    x: Optional[float] = None
    y: Optional[float] = None


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    weight: float = 1.0
    properties: Dict[str, Any] = {}


class GraphData(BaseModel):
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []
    total_nodes: int = 0
    total_edges: int = 0


class GraphQueryRequest(BaseModel):
    query: str
    domain: Optional[str] = "all"
    region: Optional[str] = "all"
    depth: int = 2
    limit: int = 50


# ---- AI Co-Pilot ----
class CoPilotQuery(BaseModel):
    query: str
    persona: str = "collector"
    language: str = "en"
    session_id: Optional[str] = None


class CoPilotResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []
    graph_path: List[Dict[str, Any]] = []
    confidence: float = 0.0
    language: str = "en"
    processing_time_ms: float = 0


# ---- Grievance ----
class GrievanceRequest(BaseModel):
    title: str
    description: str
    category: str
    district: str
    state: str
    language: str = "en"
    priority: str = "medium"


class GrievanceResponse(BaseModel):
    id: str
    status: str
    ai_resolution: Optional[str] = None
    assigned_to: Optional[str] = None
    estimated_resolution_days: int = 7


# ---- Dashboard ----
class DashboardKPI(BaseModel):
    active_users: int = 0
    grievances_resolved: int = 0
    graph_connections: int = 0
    ai_queries_per_hour: int = 0
    data_sources_active: int = 7
    uptime_pct: float = 99.9


class WeatherAlert(BaseModel):
    city: str
    state: str
    temperature: float
    condition: str
    humidity: float
    aqi: int = 0
    alert_type: Optional[str] = None


class ETLStatus(BaseModel):
    pipeline_status: str
    last_run: Optional[str] = None
    total_records: int = 0
    sources: Dict[str, Any] = {}
