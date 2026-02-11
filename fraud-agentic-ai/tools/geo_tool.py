def geo_risk_score(txn: dict, customer_txns):
    location = txn.get("location")

    if customer_txns.empty:
        return 0.4, "No location history available"

    usual_locations = (
        customer_txns["location"]
        .value_counts()
        .index
        .tolist()[:3]
    )

    if location not in usual_locations:
        return 0.6, f"Location {location} not in usual locations {usual_locations}"

    return 0.1, f"Location {location} matches usual behavior"
