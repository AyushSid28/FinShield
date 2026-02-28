from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

model = ChatOllama(
    model="mistral:latest",  # or "gemma3:1b" if preferred
    temperature=0
)

class TemporalSchema(BaseModel):
    temporal_risk: float = Field(
        description="Risk score between 0 and 1",
        ge=0,
        le=1
    )
    temporal_label: str = Field(
        description="Low | Medium | High"
    )
    temporal_reason: str = Field(
        description="Short explanation"
    )

structured_model = model.with_structured_output(TemporalSchema)


def temporal_agent(state: dict) -> dict:

    txn = state.get("transaction", {})
    history = state.get("transaction_history", [])

    txn_timestamp = txn.get("timestamp")

    history_df = pd.DataFrame(history)

    if not history_df.empty and "timestamp" in history_df.columns:
        history_df["timestamp"] = pd.to_datetime(history_df["timestamp"])
        history_df["hour"] = history_df["timestamp"].dt.hour

        typical_hours = history_df["hour"].mode().tolist()
        avg_hour = history_df["hour"].mean()

        history_summary = f"""
        Typical Active Hours: {typical_hours}
        Average Active Hour: {round(avg_hour,2)}
        Total Historical Transactions: {len(history_df)}
        """
    else:
        history_summary = "No historical timestamp data available."

    messages = [
        SystemMessage(
            content="""
You are a senior fraud risk analyst specializing in temporal fraud detection.

Evaluate:
- Is the transaction occurring at an unusual hour?
- Is timing inconsistent with historical behavior?

Respond strictly in JSON format:
{
    "temporal_risk": float between 0 and 1,
    "temporal_label": "Low" | "Medium" | "High",
    "temporal_reason": "short explanation"
}
"""
        ),
        HumanMessage(
            content=f"""
Current Transaction Timestamp:
{txn_timestamp}

Customer Temporal Summary:
{history_summary}

Analyze whether this transaction is temporally suspicious.
"""
        )
    ]

    response = structured_model.invoke(messages)

    return {
        "temporal_risk": response.temporal_risk,
        "temporal_label": response.temporal_label,
        "temporal_reason": response.temporal_reason,
        "nodes": [
            {
                "id": "temporal_agent",
                "name": "Temporal Agent",
                "risk": response.temporal_risk,
                "reason": response.temporal_reason
            }
        ]
    }
