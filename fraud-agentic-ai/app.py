from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fraud_graph import evaluate

class TransactionRequest(BaseModel):
    transactionId: str
    customerId: str
    amount: float
    merchant: str
    location: str
    deviceId: str


app = FastAPI()

# CORS setup
origins = [
    "http://localhost",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, OPTIONS
    allow_headers=["*"],  # allow all headers
)

@app.post("/fraud/check")
async def check_fraud(txn: TransactionRequest):
    result = evaluate(txn.dict())
    return result