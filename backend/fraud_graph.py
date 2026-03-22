# fraud_graph.py
import pandas as pd
import math
from pathlib import Path


from agents.decision_agent_llm import decision_agent_llm

# Load CSV once at startup
_csv_candidates = ["synthetic_transactions.csv", "transactions.csv"]
_csv_path = next((p for p in _csv_candidates if Path(p).exists()), _csv_candidates[-1])
transaction_history = pd.read_csv(_csv_path)

# Normalize columns so tools/agents can rely on consistent names
transaction_history = transaction_history.rename(
    columns={
        "transaction_id": "transactionId",
        "customer_id": "customerId",
        "device": "deviceId",
    }
)
if "timestamp" in transaction_history.columns:
    transaction_history["timestamp"] = pd.to_datetime(transaction_history["timestamp"])

def sigmoid(x):
    """Sigmoid function to normalize risk between 0 and 1 smoothly."""
    return 1 / (1 + math.exp(-x))

def evaluate(txn: dict):
    """
    Dynamic evaluation of a transaction based on historical data.
    Returns LangGraph-style nodes with realistic risk scoring.
    """
    customer_id = txn.get("customerId") or txn.get("customer_id")
    txn_id = txn.get("transactionId") or txn.get("transaction_id")
    customer_txns = transaction_history[transaction_history["customerId"] == customer_id]
    if txn_id is not None and "transactionId" in customer_txns.columns:
        customer_txns = customer_txns[customer_txns["transactionId"] != txn_id]

    nodes = []
    state = {
    "txn": txn,
    "customer_txns": customer_txns,
    
    "nodes": nodes
    }

    # ---------- Orchestrator (LLM Decision Agent) ----------
    # Decision agent orchestrates: behavioral -> temporal -> geo -> device -> decision
    state = decision_agent_llm(state)

    return {
    "transaction": txn,
    "nodes": nodes
    }