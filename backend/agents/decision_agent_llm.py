from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage
import json
import re

# Orchestrated agents
from agents.behavioral_agent import behavioral_agent
from agents.temporal_agent import temporal_agent
from agents.geo_agent import geo_agent
from agents.device_agent import device_agent

# Initialize LLM
llm = ChatOllama(
    model="mistral",  # or your preferred LLM
    temperature=0
)


def decision_agent_llm(state: dict) -> dict:
    """
    LLM Decision Agent (Orchestrator)
    ------------------
    Orchestrates upstream agents, then returns final decision + action.
    """

    # Ensure trace exists
    state.setdefault("trace", [])
    state["trace"].append("🤖 LLM Decision Agent started")
    state.setdefault("nodes", [])

    # Orchestrate the other agents first
    state = behavioral_agent(state)
    state = temporal_agent(state)
    state = geo_agent(state)
    state = device_agent(state)

    messages = [
        SystemMessage(
            content="""
You are a banking fraud decision engine.

You will be given fraud signals from specialized agents (behavioral, temporal, geo, device).
Use them to decide overall risk and action.

Return ONLY valid JSON (no markdown, no extra text).

Schema:
{
  "decision": "LOW_RISK" | "MID_RISK" | "HIGH_RISK",
  "action": "ALLOW" | "REVIEW" | "BLOCK",
  "reasoning": "short explanation"
}
""".strip()
        ),
        HumanMessage(
            content=f"""
Signals:
- Behavioral: risk={state.get("behavioral_risk", 0.5)}, label={state.get("behavioral_label", "N/A")}, reason={state.get("behavioral_reason", "N/A")}
- Temporal: risk={state.get("temporal_risk", 0.5)}, label={state.get("temporal_label", "N/A")}, reason={state.get("temporal_reason", "N/A")}
- Geo: risk={state.get("geo_risk", 0.5)}, label={state.get("geo_label", "N/A")}, reason={state.get("geo_reason", "N/A")}
- Device: risk={state.get("device_risk", 0.5)}, label={state.get("device_label", "N/A")}, reason={state.get("device_reason", "N/A")}

Provide the final decision and action.
""".strip()
        ),
    ]

    # Invoke LLM
    try:
        response = llm.invoke(messages)
        raw_text = response.content

        # Extract JSON safely even if LLM adds extra text
        json_match = re.search(r"\{.*\}", raw_text, re.S)
        if not json_match:
            raise ValueError(f"LLM did not return JSON: {raw_text}")

        result = json.loads(json_match.group())

    except Exception as e:
        # Minimal fallback if LLM fails (no hard-coded weighting)
        labels = [
            state.get("behavioral_label"),
            state.get("temporal_label"),
            state.get("geo_label"),
            state.get("device_label"),
        ]
        if "High" in labels:
            result = {"decision": "HIGH_RISK", "action": "BLOCK", "reasoning": "Fallback: at least one agent flagged High risk."}
        elif "Medium" in labels:
            result = {"decision": "MID_RISK", "action": "REVIEW", "reasoning": "Fallback: at least one agent flagged Medium risk."}
        else:
            result = {"decision": "LOW_RISK", "action": "ALLOW", "reasoning": "Fallback: no agent flagged elevated risk."}
        state["trace"].append(f"⚠️ LLM failed, fallback used: {str(e)}")

    # Update trace for observability
    state["trace"].append(f"Decision={result['decision']}, Action={result['action']}")

    state["decision"] = result["decision"]
    state["action"] = result["action"]
    state["llm_reasoning"] = result["reasoning"]
    state["nodes"].append(
        {
            "id": "llm_agent",
            "name": "LLM Decision Agent",
            "decision": result["decision"],
            "action": result["action"],
            "reasoning": result["reasoning"],
        }
    )

    return state