from datetime import datetime
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fraud_graph import evaluate

class TransactionRequest(BaseModel):
    transactionId: str
    customerId: str
    amount: float
    merchant: str
    location: str
    deviceId: str
    timestamp: str  # ISO 8601 format: "2026-01-15T23:45:00"


class SimulationRequest(BaseModel):
    transactionId: str
    amount: float
    location: str
    device: str
    timestamp: Optional[str] = None


app = FastAPI()

# CORS setup
origins = [
    "http://localhost",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, OPTIONS
    allow_headers=["*"],  # allow all headers
)

@app.post("/fraud/check")
async def check_fraud(txn: TransactionRequest):
    result = evaluate(txn.dict())
    return result


def build_simulation_response(txn: SimulationRequest):
    amount_risk = 32 if txn.amount >= 45000 else 22 if txn.amount >= 25000 else 12
    device_risk = 30 if "new" in txn.device.lower() else 14
    location_risk = 20 if txn.location.lower() in {"mumbai", "delhi", "dubai", "singapore"} else 8

    risk_score = min(97, amount_risk + device_risk + location_risk)

    if risk_score >= 75:
        status = "FLAGGED"
        verdict = "Fraud Detected"
        explanation = "Large-value transfer from a new device with elevated geographic risk markers."
    elif risk_score >= 45:
        status = "REVIEW"
        verdict = "Manual Review Recommended"
        explanation = "Multiple signals deviated from the expected customer profile and require review."
    else:
        status = "CLEAR"
        verdict = "Transaction Cleared"
        explanation = "Agent checks stayed within safe thresholds across device, amount, and location."

    return {
        "riskScore": risk_score,
        "status": status,
        "reasoning": [
            "Cross-checking behavioral pattern",
            "Comparing device fingerprint",
            "Checking geo-velocity anomaly",
        ],
        "verdict": verdict,
        "confidence": min(96, risk_score + 5),
        "explanation": explanation,
        "processedAt": txn.timestamp or datetime.utcnow().isoformat(),
    }


@app.post("/api/transaction")
async def simulate_transaction(txn: SimulationRequest):
    return build_simulation_response(txn)
