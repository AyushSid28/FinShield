# tools/geo_tool.py

import pandas as pd
from math import radians, sin, cos, sqrt, atan2


# ----------------------------------------
# Optional: Haversine distance calculator
# ----------------------------------------

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two lat/lon points in kilometers.
    """
    R = 6371  # Earth radius in km

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


# ----------------------------------------
# Main Geo Risk Tool
# ----------------------------------------

def geo_risk_score(txn: dict, history_df: pd.DataFrame):
    """
    Computes geographic anomaly risk based on distance
    from historical transaction locations.

    Expected txn format:
    {
        "latitude": float,
        "longitude": float
    }

    history_df must contain:
        latitude
        longitude
    """

    # Validate transaction location
    if not txn.get("latitude") or not txn.get("longitude"):
        return 0.5, "Transaction location data missing."

    current_lat = txn["latitude"]
    current_lon = txn["longitude"]

    if history_df.empty or \
       "latitude" not in history_df.columns or \
       "longitude" not in history_df.columns:
        return 0.5, "No historical geo data available."

    # Compute distances from historical locations
    distances = []

    for _, row in history_df.iterrows():
        if pd.notna(row["latitude"]) and pd.notna(row["longitude"]):
            distance = haversine_distance(
                current_lat,
                current_lon,
                row["latitude"],
                row["longitude"]
            )
            distances.append(distance)

    if not distances:
        return 0.5, "Insufficient historical geo coordinates."

    min_distance = min(distances)

    # ------------------------------
    # Risk Logic
    # ------------------------------

    if min_distance < 5:
        return 0.1, "Transaction within normal geographic radius."

    elif min_distance < 50:
        return 0.4, "Transaction moderately distant from usual location."

    elif min_distance < 200:
        return 0.7, "Transaction far from historical location."

    else:
        return 0.9, "Transaction extremely distant from historical pattern."
