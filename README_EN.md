# FinShield — Agentic AI Fraud Detection System

FinShield is a **multi-agent fraud detection system** that analyzes financial transactions in real time using four specialized AI agents and a final LLM-based decision engine. Each agent evaluates a distinct risk dimension — behavioral, temporal, geographic, and device — then a central orchestrator synthesizes all signals into a single verdict: **ALLOW**, **REVIEW**, or **BLOCK**.

**Live Demo:** [finshield.onrender.com](https://finshield.onrender.com)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Axios |
| Backend | FastAPI, Uvicorn, Python 3.12 |
| LLM | Groq Cloud API (`llama-3.3-70b-versatile`) |
| Framework | LangChain + LangGraph |
| Deployment | Render (Docker) |

---

## System Architecture

```
Incoming Transaction
       │
       ▼
┌─────────────────────────────────────────────┐
│           LLM Decision Agent (Orchestrator) │
│                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│   │Behavioral│  │ Temporal │  │   Geo    │ │
│   │  Agent   │  │  Agent   │  │  Agent   │ │
│   │ w=0.30   │  │ w=0.20   │  │ w=0.25   │ │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│        │             │             │        │
│   ┌────┴─────────────┴─────────────┴────┐   │
│   │         Device Agent (w=0.25)       │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   Final: R_composite = Σ(wᵢ · rᵢ) / Σ(wᵢ) │
└─────────────────────────────────────────────┘
       │
       ▼
  ALLOW / REVIEW / BLOCK
```

Each agent independently computes a risk score between 0 and 1 using deterministic mathematical tools, then passes the result through an LLM for contextual interpretation. The Decision Agent collects all four signals and produces a final weighted composite verdict.

---

## Agent 1: Behavioral Agent (Weight = 0.30)

### Purpose
Detects anomalous transaction amounts by comparing the current transaction against the customer's historical spending profile.

### Mathematical Formulas

**Z-Score (Standard Score):**
```
Z = (x - μ) / σ
```
- `x` = current transaction amount
- `μ` = mean of customer's historical transaction amounts
- `σ` = standard deviation
- A Z-score > 2 indicates a highly anomalous transaction

**Statistical Risk (Sigmoid-smoothed):**
```
risk = σ(|Z| - 1.5) = 1 / (1 + e^(-(|Z| - 1.5)))
```
- The sigmoid function smoothly maps the Z-score deviation into a [0, 1] risk range
- Threshold is set at 1.5 standard deviations

**CVV Verification Risk:**
```
M (Match)                  → 0.0
N (No Match)               → 0.9
P (Not Processed)          → 0.4
S (Should be present)      → 0.7
U (Uncertified)            → 0.3
Empty/Unknown              → 0.5
```

**Account Age Risk:**
```
risk = σ(-(age - 30) / 20) = 1 / (1 + e^((age - 30) / 20))
```
- Newly created accounts carry higher risk
- age = 0 days → risk = 0.82
- age = 30 days → risk = 0.50
- age = 90 days → risk = 0.05

**Recent Payment Rejects Risk:**
```
0 rejects  → 0.0
1 reject   → 0.4
2+ rejects → 0.8
```

### Pipeline Flow
1. Compute mean (μ) and standard deviation (σ) from customer's transaction history
2. Calculate Z-Score → apply sigmoid to derive statistical risk
3. Compute enrichment signals: CVV result, account age, recent rejects
4. Pass all computed signals to the LLM → LLM returns final behavioral risk (0–1) and label (Low / Medium / High)

---

## Agent 2: Temporal Agent (Weight = 0.20)

### Purpose
Evaluates whether the transaction is occurring at an unusual time compared to the customer's historical activity patterns.

### Mathematical Formulas

**Circular Hour Distance:**
```
d = min(|h₁ - h₂|, 24 - |h₁ - h₂|)
```
- The 24-hour clock is circular (23:00 and 01:00 are only 2 hours apart, not 22)
- `h₁` = transaction hour, `h₂` = customer's average active hour

**Exponential Decay Risk:**
```
risk = 1 - e^(-λ · d)
```
- `λ` = 0.3 (decay rate constant)
- `d` = circular hour distance
- Greater deviation from the typical hour yields higher risk
- d = 0 → risk = 0.00, d = 6h → risk = 0.83, d = 12h → risk = 0.97

**Hour Frequency Score:**
```
freq = count_at_hour / total_count
```
- Measures how often the customer transacts at this particular hour
- Frequency risk = 1 − freq (lower frequency = higher risk)

**Composite Temporal Risk:**
```
R_temporal = 0.6 × decay_risk + 0.4 × (1 - freq)
```

### Pipeline Flow
1. Extract the transaction hour (prefer `localHour` field; fallback to timestamp)
2. Build the customer's historical hour distribution
3. Calculate circular distance and exponential decay risk
4. Compute hour frequency score
5. Pass composite score to LLM → LLM returns final temporal risk and label

---

## Agent 3: Geographic (Geo) Agent (Weight = 0.25)

### Purpose
Detects geographic anomalies including unusual transaction locations, impossible travel scenarios, and cross-country mismatches.

### Mathematical Formulas

**Haversine Distance (great-circle distance between two points on Earth):**
```
a = sin²(Δlat/2) + cos(lat₁) · cos(lat₂) · sin²(Δlon/2)
c = 2 · atan2(√a, √(1-a))
distance = R · c     (R = 6371 km)
```

**Sigmoid-smoothed Distance Risk:**
```
risk = σ((d - 100) / 60) = 1 / (1 + e^(-(d - 100) / 60))
```
- Transactions within 100 km of historical locations carry low risk
- Risk increases rapidly beyond 100 km

**Impossible Travel Velocity:**
```
velocity = haversine_distance / Δt    (km/h)
```
| Velocity | Risk |
|----------|------|
| > 900 km/h | 0.95 (faster than commercial aviation) |
| > 500 km/h | 0.75 |
| > 200 km/h | 0.50 |
| ≤ 200 km/h | 0.10 |

**Country Mismatch Risk:**
```
Each mismatch = +0.3 risk (capped at 0.9)
```
- IP Country ≠ Shipping Country
- Shipping Country ≠ Billing Country
- IP Country ≠ Account Country

**Composite Geo Risk:**
```
R_geo = 0.35 × dist_risk + 0.30 × velocity_risk + 0.35 × mismatch_risk
```

### Pipeline Flow
1. Resolve transaction coordinates (from lat/lon or city name lookup)
2. Compute Haversine distances from all historical transaction locations
3. Check travel velocity against the most recent historical transaction
4. Detect country mismatches across IP, shipping, billing, and account fields
5. Pass composite score to LLM → LLM returns final geo risk and label

---

## Agent 4: Device Agent (Weight = 0.25)

### Purpose
Performs device fingerprinting to detect unfamiliar devices, proxy IP usage, and inconsistent browser or device type patterns.

### Mathematical Formulas

**Shannon Entropy (Device Diversity):**
```
H = -Σ pᵢ · log₂(pᵢ)
```
- `pᵢ` = proportion of transactions from each device in customer's history
- High entropy = customer uses many different devices (higher unpredictability)
- Low entropy = consistent device usage

**Device Frequency Ratio:**
```
f_device = n_device / N_total
```
- How often this specific device appears in the customer's transaction history

**Proxy IP Risk:**
```
isProxyIP = TRUE  → 0.85
isProxyIP = FALSE → 0.0
```

**Browser / Device Type Consistency:**
```
Previously unseen browser     → 0.4
Previously unseen device type → 0.3
Known browser / device type   → 0.0
```

**Composite Device Risk:**
```
R_device = 0.25 × known_signal
         + 0.15 × entropy_norm
         + 0.15 × (1 - freq)
         + 0.20 × proxy_risk
         + 0.10 × browser_risk
         + 0.15 × device_type_risk
```

### Pipeline Flow
1. Check whether the device ID exists in the customer's history
2. Compute Shannon Entropy to measure device diversity
3. Calculate device frequency ratio
4. Evaluate proxy IP, browser consistency, and device type consistency
5. Pass composite score to LLM → LLM returns final device risk and label

---

## Agent 5: LLM Decision Agent (Final Orchestrator)

### Purpose
The central orchestrator that sequentially executes all four agents, collects their outputs, and uses the LLM to synthesize a final fraud verdict.

### Pipeline Flow
1. Execute agents sequentially: Behavioral → Temporal → Geo → Device
2. Collect all risk scores, labels, and reasoning from each agent
3. Pass the complete signal set to the LLM (`llama-3.3-70b-versatile` via Groq)
4. LLM returns a final decision: `ALLOW`, `REVIEW`, or `BLOCK` with reasoning

### Weighted Composite Risk (Final Score)
```
R_composite = Σ(wᵢ · rᵢ) / Σ(wᵢ)

= (0.30 × behavioral_risk
 + 0.20 × temporal_risk
 + 0.25 × geo_risk
 + 0.25 × device_risk) / 1.0
```

### Fallback Logic (if LLM is unavailable)
```
Any agent flags "High"   → BLOCK
Any agent flags "Medium" → REVIEW
All agents flag "Low"    → ALLOW
```

---

## Datasets Used

### 1. Indian UPI Fraud Dataset
- **Source:** Kaggle
- **Link:** [https://www.kaggle.com/datasets/dhatribadri/indian-upi-fraud-data](https://www.kaggle.com/datasets/dhatribadri/indian-upi-fraud-data)
- **Description:** A dataset of Indian UPI (Unified Payments Interface) transactions containing both fraudulent and legitimate samples.
- **Key Fields:** transactionId, customerId, amount, timestamp, merchant, device, location, isFraud
- **Usage:** Training and testing on Indian digital payment fraud patterns

### 2. Microsoft R-Server Fraud Detection Dataset
- **Source:** Microsoft ML Server / Kaggle
- **Link:** [https://www.kaggle.com/datasets/llabhishekll/microsoft-fraud-detection-dataset](https://www.kaggle.com/datasets/llabhishekll/microsoft-fraud-detection-dataset)
- **Description:** International e-commerce transaction dataset with rich features including device type, IP address, browser fingerprint, CVV verification result, proxy detection, shipping/billing country, and account metadata.
- **Key Fields:** transactionId, accountID, amount, transactionDateTime, localHour, deviceType, ipState, ipCountry, isProxyIP, browserType, paymentType, cardType, cvvResult, shippingCountry, billingCountry, accountAge, isRegistered, isFraud
- **Usage:** Device fingerprinting, geo-velocity analysis, country mismatch detection, and CVV-based behavioral scoring

### Curated Showcase Transactions
The backend includes 5 handpicked transactions (a mix from both datasets) that appear in the frontend dropdown selector. These include both FRAUD and LEGITIMATE samples to demonstrate the system's detection capabilities.

---

## Project Structure

```
FinShield/
├── backend/
│   ├── agents/
│   │   ├── behavioral_agent.py
│   │   ├── temporal_agent.py
│   │   ├── geo_agent.py
│   │   ├── device_agent.py
│   │   └── decision_agent_llm.py
│   ├── tools/
│   │   ├── geo_tool.py
│   │   └── device_tool.py
│   ├── data/
│   │   ├── curated_transactions.csv
│   │   ├── indian_upi_fraud.csv
│   │   └── microsoft_transactions.csv
│   ├── app.py
│   ├── fraud_graph.py
│   ├── requirements.txt
│   └── state.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── TransactionPicker.jsx
│   │   │   ├── TransactionCard.jsx
│   │   │   ├── ReasoningCard.jsx
│   │   │   ├── Controls.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── BackgroundEffects.jsx
│   │   └── lib/
│   │       └── api.js
│   ├── package.json
│   └── vite.config.js
├── Dockerfile
├── render.yaml
├── build.sh
└── README.md
```

---

## Local Development Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory:
```
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend server:
```bash
uvicorn app:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies all `/api/*` requests to the backend on port 8000.

### Production Build (Single Port)
```bash
cd frontend && npm run build && cd ..
cd backend && uvicorn app:app --host 0.0.0.0 --port 8000
```
This serves the React production build directly from the FastAPI backend on a single port.

---

## Docker

```bash
docker build -t finshield .
docker run -p 8000:8000 -e GROQ_API_KEY=your_key finshield
```

---

## Render Deployment

1. Connect your GitHub repository
2. Set Runtime to **Docker**
3. Add the environment variable: `GROQ_API_KEY`
4. Deploy

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/transaction` | Analyze a transaction through the full agent pipeline (with deterministic fallback) |
| POST | `/fraud/check` | Direct pipeline invocation with the extended transaction schema |
| GET | `/api/transactions` | Retrieve the curated showcase transaction list |
| GET | `/health` | Health check endpoint |

---

## Formula Reference Table

| Agent | Formula | What It Measures |
|-------|---------|-----------------|
| Behavioral | `Z = (x - μ) / σ` | How anomalous the transaction amount is |
| Behavioral | `risk = σ(\|Z\| - 1.5)` | Sigmoid-smoothed risk from Z-score |
| Behavioral | `risk = σ(-(age-30)/20)` | Account age risk (newer = riskier) |
| Temporal | `d = min(\|h₁-h₂\|, 24-\|h₁-h₂\|)` | Circular hour deviation |
| Temporal | `risk = 1 - e^(-0.3·d)` | Exponential decay temporal risk |
| Temporal | `R = 0.6·decay + 0.4·(1-freq)` | Composite temporal risk |
| Geo | `Haversine(lat₁,lon₁,lat₂,lon₂)` | Great-circle distance on Earth |
| Geo | `risk = σ((d-100)/60)` | Sigmoid-smoothed distance risk |
| Geo | `velocity = distance / Δt` | Impossible travel detection |
| Geo | `R = 0.35·dist + 0.30·vel + 0.35·mismatch` | Composite geographic risk |
| Device | `H = -Σ pᵢ·log₂(pᵢ)` | Shannon entropy (device diversity) |
| Device | `f = n_device / N_total` | Device frequency ratio |
| Device | `R = Σ(wᵢ·signalᵢ)` | Weighted composite device risk |
| Final | `R = Σ(wᵢ·rᵢ) / Σ(wᵢ)` | Weighted ensemble across all agents |

---

Developed by **Group 9**
