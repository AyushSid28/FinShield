#!/usr/bin/env bash
set -o errexit

# ── Backend ──
pip install --upgrade pip
pip install -r backend/requirements.txt

# ── Frontend ──
cd frontend
npm ci
npm run build
cd ..
