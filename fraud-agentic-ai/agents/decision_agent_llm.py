from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage
import json
import re

# Initialize LLM
llm = ChatOllama(
    model="mistral",  # or your preferred LLM
    temperature=0
)


def decision_agent_llm(state: dict) -> dict:
    """
    LLM Decision Agent
    ------------------
    Reads signals from state (behavioral, geo, device)
    and returns final risk decision and action.
    """

    # Ensure trace exists
    state.setdefault("trace", [])
    state["trace"].append("🤖 LLM Decision Agent started")

    # Build prompt dynamically
    prompt = f"""
You are a banking fraud decision engine.

Signals:
- Behavioral risk: {state.get("behavioral_risk", 0.5)} (transaction amount vs customer history)
- Temporal risk: {state.get("temporal_risk", 0.5)} (late night, unusual hours, transaction time patterns)
- Geo risk: {state.get("geo_risk", 0.5)} (location-based anomalies)
- Device risk: {state.get("device_risk", 0.5)} (device pattern deviations)

Additional Context:
- Behavioral reason: {state.get("behavioral_reason", "N/A")}
- Temporal reason: {state.get("temporal_reason", "N/A")}
- Geo reason: {state.get("geo_reason", "N/A")}
- Device reason: {state.get("device_reason", "N/A")}

Consider especially:
- Transactions at unusual hours (00:00-05:00 = high risk)
- Customer's typical transaction times
- Combination of late-night + high amount = very high risk
- Late-night + new device + unusual location = very high risk

Return ONLY valid JSON. No markdown, no explanations outside JSON.

Schema:
{{
  "decision": "LOW_RISK | MID_RISK | HIGH_RISK",
  "action": "ALLOW | REVIEW | BLOCK",
  "reasoning": "short explanation"
}}
"""

    # Invoke LLM
    try:
        response = llm.invoke(prompt)
        raw_text = response.content

        # Extract JSON safely even if LLM adds extra text
        json_match = re.search(r"\{.*\}", raw_text, re.S)
        if not json_match:
            raise ValueError(f"LLM did not return JSON: {raw_text}")

        result = json.loads(json_match.group())

    except Exception as e:
        # Fallback rule-based decision if LLM fails
        combined_risk = (
            0.5 * state.get("behavioral_risk", 0.5) +
            0.3 * state.get("geo_risk", 0.5) +
            0.2 * state.get("device_risk", 0.5)
        )
        if combined_risk > 0.65:
            result = {"decision": "MID_RISK", "action": "REVIEW", "reasoning": "fallback weighted rule"}
        elif combined_risk > 0.35:
            result = {"decision": "LOW_RISK", "action": "ALLOW", "reasoning": "fallback weighted rule"}
        else:
            result = {"decision": "VERY_LOW_RISK", "action": "ALLOW", "reasoning": "fallback weighted rule"}
        state["trace"].append(f"⚠️ LLM failed, fallback used: {str(e)}")

    # Update trace for observability
    state["trace"].append(f"Decision={result['decision']}, Action={result['action']}")

    # Return only what graph needs
    return {
        "decision": result["decision"],
        "action": result["action"],
        "llm_reasoning": result["reasoning"]
    }