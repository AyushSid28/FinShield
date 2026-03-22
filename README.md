# FinShield

FinShield is split into a dedicated React frontend and a FastAPI backend for the fraud detection simulation and agent pipeline.

## Structure

```text
FinShield/
├─ frontend/
│  ├─ public/
│  ├─ src/
│  ├─ package.json
│  └─ vite.config.js
├─ backend/
│  ├─ agents/
│  ├─ tools/
│  ├─ app.py
│  ├─ fraud_graph.py
│  ├─ requirements.txt
│  └─ transactions.csv
└─ README.md
```

## Frontend

Location: `frontend/`

- React + Vite
- Tailwind CSS
- Framer Motion
- Axios

Run it:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://127.0.0.1:5173` and proxies `/api/*` requests to the backend on port `8000`.

## Backend

Location: `backend/`

- FastAPI
- Agent pipeline for fraud evaluation
- Deterministic `/api/transaction` route for the frontend simulation UI
- Existing `/fraud/check` route for the agent graph payload

Run it:

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

Backend default URL: `http://127.0.0.1:8000`

## API Endpoints

`POST /api/transaction`

Example request:

```json
{
  "transactionId": "TXN48293",
  "amount": 48200,
  "location": "Mumbai",
  "device": "New Device"
}
```

`POST /fraud/check`

Example request:

```json
{
  "transactionId": "txn-001",
  "customerId": "123",
  "amount": 1200.0,
  "merchant": "Amazon",
  "location": "Nigeria",
  "deviceId": "device-001",
  "timestamp": "2026-01-07T12:00:00"
}
```
