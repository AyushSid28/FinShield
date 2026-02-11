def behavioral_agent(state):
    state.setdefault("nodes", [])  # ensure 'nodes' exists

    txn = state["txn"]
    customer_txns = state.get("customer_txns")

    if customer_txns is None or customer_txns.empty:
        risk = 0.4
        reason = "No transaction history available"
    else:
        avg_amount = customer_txns["amount"].mean()

        if txn["amount"] <= avg_amount:
            risk = 0.1
            reason = f"Txn amount {txn['amount']} is below or equal to usual avg {round(avg_amount,2)}"
        elif txn["amount"] <= avg_amount * 1.5:
            risk = 0.4
            reason = f"Txn amount {txn['amount']} is moderately higher than avg {round(avg_amount,2)}"
        else:
            risk = 0.8
            reason = f"Txn amount {txn['amount']} is significantly higher than avg {round(avg_amount,2)}"

    # ✅ Save risk and reason in state for graph/LLM
    state["behavioral_risk"] = round(risk, 2)
    state["behavioral_reason"] = reason

    # ✅ Append to nodes for visualization
    state["nodes"].append({
        "id": "behavioral_agent",
        "name": "Behavioral Agent",
        "risk": round(risk, 2),
        "reason": reason
    })

    return state
