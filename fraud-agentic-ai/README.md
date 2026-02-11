# Fraud Detection with Agentic AI

This project implements an **agentic AI pipeline** for fraud detection in banking transactions using Python and FastAPI. Multiple agents evaluate transactions and a final LLM-based decision agent decides the action.

---

## Features

- **Behavioral Agent**: Flags unusual transaction amounts based on historical data.
- **Geo Agent**: Evaluates transaction location risk using `geo_tool.py`.
- **Device Agent**: Assesses device risk using `device_tool.py`.
- **LLM Decision Agent**: Aggregates agent risks to give a final decision (`ALLOW`, `REVIEW`).


## Project Structure

fraud-agentic-ai/
├─ app.py
├─ fraud_graph.py
├─ transactions.csv
├─ agents/
│ ├─ behavioral_agent.py
│ ├─ geo_agent.py
│ ├─ device_agent.py
│ └─ decision_agent_llm.py
├─ tools/
│ ├─ geo_tool.py
│ └─ device_tool.py
└─ requirements.txt

## Getting Started

1. Install dependencies:

```bash
pip install -r requirements.txt

2. Run the FastAPI server:

uvicorn app:app --reload

3. Send a POST request to:
POST /fraud/check
with JSON transaction data:
{
  "customerId": "123",
  "amount": 1200.0,
  "location": "Nigeria",
  "deviceId": "device-001"
}

Sample Curl request response
curl -X POST "http://127.0.0.1:8000/fraud/check" \
-H "Content-Type: application/json" \
-d '{
  "transactionId": "txn-001",
  "customerId": "123",
  "amount": 1200.0,
  "merchant": "Amazon",
  "location": "Nigeria",
  "deviceId": "device-001",
  "timestamp": "2026-01-07T12:00:00"
}'

Response 


{
  "transaction": {
    "transactionId": "txn-001",
    "customerId": "123",
    "amount": 1200,
    "merchant": "Amazon",
    "location": "Nigeria",
    "deviceId": "device-001"
  },
  "nodes": [
    {
      "id": "behavioral_agent",
      "name": "Behavioral Agent",
      "risk": 0.4,
      "reason": "No transaction history available"
    },
    {
      "id": "geo_agent",
      "name": "Geo Agent",
      "risk": 0.1,
      "reason": "Location Nigeria matches usual behavior"
    },
    {
      "id": "device_agent",
      "name": "Device Agent",
      "risk": 0.1,
      "reason": "Transaction from known device"
    },
    {
      "id": "llm_agent",
      "name": "LLM Decision Agent",
      "decision": "MID_RISK",
      "action": "REVIEW",
      "reasoning": "Behavioral risk is moderate, geo and device risks are low. Combined, this indicates a need for further review."
    }
  ]
}

## Fraud Detection Flow

flowchart TD
    A[Incoming Transaction] --> B[Behavioral Agent]
    B -->|Risk + Reason| C[Geo Agent]
    C -->|Risk + Reason| D[Device Agent]
    D -->|Signals| E[LLM Decision Agent]

    E -->|VERY_LOW_RISK| F[ALLOW]
    E -->|LOW_RISK| F
    E -->|MID_RISK| G[REVIEW]