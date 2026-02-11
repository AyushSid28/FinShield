def device_risk_score(txn: dict, customer_txns):
    device_id = txn.get("deviceId")

    if customer_txns.empty:
        return 0.4, "No device history available"

    known_devices = customer_txns["deviceId"].unique().tolist()

    if device_id not in known_devices:
        return 0.6, "Transaction from new device for this customer"

    return 0.1, "Transaction from known device"
