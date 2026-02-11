def geo_agent(state):
    state.setdefault("nodes", [])

    txn = state["txn"]  # <-- use the same key as in behavioral_agent
    customer_txns = state.get("customer_txns")

    # Your existing geo risk logic
    risk = 0.1
    reason = f"Location {txn['location']} matches usual behavior"

    state["geo_risk"] = risk
    state["geo_reason"] = reason

    state["nodes"].append({
        "id": "geo_agent",
        "name": "Geo Agent",
        "risk": risk,
        "reason": reason
    })

    return state
