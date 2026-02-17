from datetime import datetime
import pandas as pd

def temporal_agent(state):
    """
    Temporal Agent
    ---------------
    Analyzes transaction timing patterns:
    - Late night/early morning transactions
    - Unusual hours for the customer
    - Transaction frequency at specific times
    """
    state.setdefault("nodes", [])
    
    txn = state["txn"]
    customer_txns = state.get("customer_txns")
    
    # Extract timestamp from transaction
    if "timestamp" not in txn or txn["timestamp"] is None:
        risk = 0.3
        reason = "No timestamp provided"
    else:
        # Parse timestamp
        if isinstance(txn["timestamp"], str):
            txn_time = pd.to_datetime(txn["timestamp"])
        else:
            txn_time = txn["timestamp"]
        
        hour = txn_time.hour
        
        # Risk assessment based on time of day
        if hour >= 0 and hour < 5:
            # Late night / early morning (00:00 - 04:59)
            base_time_risk = 0.8
            time_desc = "very late night (00:00-04:59)"
        elif hour >= 5 and hour < 7:
            # Early morning (05:00 - 06:59)
            base_time_risk = 0.6
            time_desc = "early morning (05:00-06:59)"
        elif hour >= 7 and hour < 9:
            # Morning start (07:00 - 08:59)
            base_time_risk = 0.2
            time_desc = "morning hours (07:00-08:59)"
        elif hour >= 9 and hour < 17:
            # Business hours (09:00 - 16:59)
            base_time_risk = 0.1
            time_desc = "business hours (09:00-16:59)"
        elif hour >= 17 and hour < 21:
            # Evening (17:00 - 20:59)
            base_time_risk = 0.25
            time_desc = "evening hours (17:00-20:59)"
        else:
            # Night (21:00 - 23:59)
            base_time_risk = 0.6
            time_desc = "night hours (21:00-23:59)"
        
        # Analyze customer's typical transaction patterns
        if customer_txns is not None and not customer_txns.empty:
            customer_txns['hour'] = pd.to_datetime(customer_txns['timestamp']).dt.hour
            typical_hours = customer_txns['hour'].mode()
            
            if len(typical_hours) > 0:
                # Check if current transaction hour matches customer's usual pattern
                if hour in typical_hours.values:
                    # Customer normally transacts at this hour
                    temporal_adjustment = 0.0
                    pattern_reason = f"matches customer's typical hours {list(typical_hours.values)}"
                else:
                    # Check if it's unusual
                    avg_hour = customer_txns['hour'].mean()
                    hour_diff = abs(hour - avg_hour)
                    
                    if hour_diff > 8:
                        # Very different from customer's pattern
                        temporal_adjustment = 0.3
                        pattern_reason = f"significantly differs from customer avg hour {round(avg_hour, 1)}"
                    else:
                        temporal_adjustment = 0.1
                        pattern_reason = f"slightly differs from customer avg hour {round(avg_hour, 1)}"
                
                # Transaction frequency at this hour
                txns_at_hour = len(customer_txns[customer_txns['hour'] == hour])
                total_txns = len(customer_txns)
                freq_at_hour = txns_at_hour / total_txns if total_txns > 0 else 0
                
                if freq_at_hour == 0:
                    freq_reason = "customer has NEVER transacted at this hour"
                    frequency_adjustment = 0.2
                else:
                    freq_reason = f"customer transacts {round(freq_at_hour * 100, 1)}% of the time at this hour"
                    frequency_adjustment = 0.0 if freq_at_hour > 0.1 else 0.1
                
                # Final risk = base time risk + adjustments
                risk = min(0.95, base_time_risk + temporal_adjustment + frequency_adjustment)
                reason = f"Transaction at {time_desc}. {pattern_reason}. {freq_reason}. Risk: {round(risk, 2)}"
            else:
                risk = base_time_risk
                reason = f"Transaction at {time_desc}. Limited historical data to compare patterns."
        else:
            risk = base_time_risk
            reason = f"Transaction at {time_desc}. No customer history available."
    
    # Save risk and reason in state
    state["temporal_risk"] = round(risk, 2)
    state["temporal_reason"] = reason
    
    # Append to nodes for visualization
    state["nodes"].append({
        "id": "temporal_agent",
        "name": "Temporal Agent",
        "risk": round(risk, 2),
        "reason": reason
    })
    
    return state
