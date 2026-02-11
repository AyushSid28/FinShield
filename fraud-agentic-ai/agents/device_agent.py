
from tools.device_tool import device_risk_score

def device_agent(state):
    state.setdefault("nodes", [])
    
    txn = state["txn"]  # use the unified key
    # your existing device risk logic
    risk = 0.1
    reason = f"Transaction from known device"

    state["device_risk"] = risk
    state["device_reason"] = reason

    state["nodes"].append({
        "id": "device_agent",
        "name": "Device Agent",
        "risk": risk,
        "reason": reason
    })

    return state
