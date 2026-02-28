from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from tools.geo_tool import geo_risk_score
import pandas as pd

load_dotenv()

model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0
)


class GeoSchema(BaseModel):
    geo_risk: float = Field(ge=0, le=1)
    geo_label: str
    geo_reason: str

structured_model = model.with_structured_output(GeoSchema)


def geo_agent(state: dict) -> dict:
    """
    LLM-Orchestrated Geo Agent with Tool Roundtrip
    """

    txn = state.get("txn") or state.get("transaction") or {}
    history_source = (
        state.get("customer_txns")
        if state.get("customer_txns") is not None
        else state.get("transaction_history", [])
    )

    if isinstance(history_source, pd.DataFrame):
        history_df = history_source.copy()
    else:
        history_df = pd.DataFrame(history_source)

    tool_risk, tool_reason = geo_risk_score(txn, history_df)

    messages = [
        SystemMessage(
            content="""
You are a senior fraud analyst.

You have received a geographical anomaly score from a geo-analysis tool.
Interpret it and produce final geo fraud assessment.

Return:
- geo_risk (0 to 1)
- geo_label (Low | Medium | High)
- geo_reason (short explanation)
"""
        ),
        HumanMessage(
            content=f"""
Transaction:
{txn}

Tool Output:
Risk Score: {tool_risk}
Reason: {tool_reason}

Provide final geo fraud assessment.
"""
        )
    ]

    response = structured_model.invoke(messages)

    return {
        "geo_risk": response.geo_risk,
        "geo_label": response.geo_label,
        "geo_reason": response.geo_reason,
        "nodes": [
            {
                "id": "geo_agent",
                "name": "Geo Agent",
                "risk": response.geo_risk,
                "reason": response.geo_reason
            }
        ]
    }
