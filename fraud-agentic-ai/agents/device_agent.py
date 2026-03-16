
from tools.device_tool import device_risk_score

def device_agent(state):
    state.setdefault("nodes", [])

    txn = state["txn"]  # use the unified key
    customer_txns = state.get("customer_txns")
    risk, reason = device_risk_score(txn, customer_txns) if customer_txns is not None else (0.4, "No device history available")

    if risk < 0.33:
        label = "Low"
    elif risk < 0.66:
        label = "Medium"
    else:
        label = "High"

    state["device_risk"] = risk
    state["device_label"] = label
    state["device_reason"] = reason

    state["nodes"].append({
        "id": "device_agent",
        "name": "Device Agent",
        "risk": risk,
        "label": label,
        "reason": reason
    })

    return state
