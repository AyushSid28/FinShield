from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import pandas as pd
load_dotenv()

model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0
)

class BehaviouralSchema(BaseModel):
    behavioral_risk: float = Field(
        description="Risk score between 0 and 1",
        ge=0,
        le=1
    )
    behavioral_label: str = Field(
        description="Low | Medium | High"
    )
    behavioral_reason: str = Field(
        description="Short explanation for assigned risk"
    )

structured_model = model.with_structured_output(BehaviouralSchema)


def behavioral_agent(state: dict) -> dict:
    """
    LLM-Based Behavioral Fraud Analysis Agent

    Expected input state:
    {
        "transaction": dict,
        "transaction_history": list
    }

    Returns ONLY:
    {
        "behavioral_risk": float,
        "behavioral_label": str,
        "behavioral_reason": str
    }
    """

    state.setdefault("nodes", [])

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

    if "amount" not in history_df.columns:
        history_df["amount"] = pd.Series(dtype=float)

    if history_df.empty:
        history_summary = "No previous transaction history available."
    else:
        history_summary = f"""
        Total Transactions: {len(history_df)}
        Average Amount: {history_df['amount'].mean():.2f}
        Maximum Amount: {history_df['amount'].max():.2f}
        Minimum Amount: {history_df['amount'].min():.2f}
        """

    prompt = f"""
    You are a senior financial fraud analyst.

    Current Transaction:
    {txn}

    Customer Behavioral History Summary:
    {history_summary}

    Determine whether this transaction is behaviorally suspicious.

    Provide:
    - Risk score between 0 and 1
    - Behavioral label (Low, Medium, High)
    - Short explanation
    """

    response = structured_model.invoke(prompt)

    state["behavioral_risk"] = response.behavioral_risk
    state["behavioral_label"] = response.behavioral_label
    state["behavioral_reason"] = response.behavioral_reason

    state["nodes"].append({
        "id": "behavioral_agent",
        "name": "Behavioral Agent",
        "risk": response.behavioral_risk,
        "reason": response.behavioral_reason
    })

    return state
