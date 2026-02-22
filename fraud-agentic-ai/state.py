from typing import TypedDict, Dict, Any, Optional, List

class FraudState(TypedDict, total=False):
    # Input
    transaction: Dict[str, Any]

    # Deterministic signals
    behavioral_risk: float
    behavioral_reason: str

    temporal_risk: float
    temporal_reason: str

    geo_risk: float
    geo_reason: str

    device_risk: float
    device_reason: str

    # LLM decision
    decision: str
    action: str
    llm_reasoning: str

    # Final output
    explanation: Dict[str, Any]

    trace: List[str]
