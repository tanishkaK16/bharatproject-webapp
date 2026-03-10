from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class NodeType(str, Enum):
    POLICY = "Policy"
    SCHEME = "Scheme"
    ECONOMIC = "Economic"
    GEOGRAPHY = "Geography"
    CLIMATE = "Climate"
    INFRASTRUCTURE = "Infrastructure"
    CIVIC = "Civic"

class RelationType(str, Enum):
    AFFECTS = "AFFECTS"
    IMPACTS = "IMPACTS"
    FUNDS = "FUNDS"
    LOCATED_IN = "LOCATED_IN"
    DEPENDS_ON = "DEPENDS_ON"
    CORRELATES_WITH = "CORRELATES_WITH"

class GraphNode(BaseModel):
    id: str
    name: str
    node_type: NodeType
    properties: Dict[str, Any] = Field(default_factory=dict)
    embedding: Optional[List[float]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    source: str

class GraphEdge(BaseModel):
    source_id: str
    target_id: str
    relation: RelationType
    properties: Dict[str, Any] = Field(default_factory=dict)
    weight: float = 1.0

class GraphQueryRequest(BaseModel):
    query: str
    mode: str = "hybrid" # hybrid, cypher, vector, path
    depth: int = 3
    filters: Optional[Dict[str, Any]] = None

class GraphQueryResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    generated_cypher: Optional[str] = None
    execution_time_ms: float
    vector_similarity: Optional[float] = None
    path_trace: Optional[List[str]] = None
