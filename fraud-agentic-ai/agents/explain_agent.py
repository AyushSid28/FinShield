def explain_agent(state):
    state["explanation"] = {
        "decision": state["decision"],
        "action": state["action"],
        "llm_reasoning": state.get("llm_reason"),
        "signals": {
            "behavioral": state["behavioral_reason"],
            "geo": state["geo_reason"],
            "device": state["device_reason"]
        }
    }
    return state
