# fraud_graph.py
import pandas as pd
import math


from agents.behavioral_agent import behavioral_agent
from agents.geo_agent import geo_agent
from agents.device_agent import device_agent
from agents.decision_agent_llm import decision_agent_llm

# Load CSV once at startup
transaction_history = pd.read_csv("transactions.csv")
transaction_history['timestamp'] = pd.to_datetime(transaction_history['timestamp'])

def sigmoid(x):
    """Sigmoid function to normalize risk between 0 and 1 smoothly."""
    return 1 / (1 + math.exp(-x))

def evaluate(txn: dict):
    """
    Dynamic evaluation of a transaction based on historical data.
    Returns LangGraph-style nodes with realistic risk scoring.
    """
    customer_id = txn['customerId']
    customer_txns = transaction_history[transaction_history['customerId'] == customer_id]

    nodes = []
    state = {
    "txn": txn,
    "customer_txns": customer_txns,
    
    "nodes": nodes
    }


    # ---------- Behavioral Agent ----------
    state = behavioral_agent(state)


    # ---------- Geo Agent ----------
    state = geo_agent(state)

    # ---------- Device Agent ----------

    state = device_agent(state)

    # ---------- LLM Decision Agent ----------
    llm_result = decision_agent_llm(state)
    nodes.append({
    "id": "llm_agent",
    "name": "LLM Decision Agent",
    "decision": llm_result["decision"],
    "action": llm_result["action"],
    "reasoning": llm_result["llm_reasoning"]
    })

    return {
    "transaction": txn,
    "nodes": nodes
    }