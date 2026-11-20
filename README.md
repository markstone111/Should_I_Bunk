# 📚 Should I Bunk? — Attendance Bunk Prediction API

This project predicts whether you can safely skip a class — based on your attendance stats, upcoming tests, and how strict your professor is!

---

## 🧩 Project Structure

├── backend/
│ ├── bunk_api.py # Flask API for predictions
│ ├── logistic_regression.py # Train & save model
│ ├── bunk_predictor.pkl # Trained model
│ ├── bunk_dataset.csv # Training data
│ ├── requirements.txt # Python deps
│ └── ...
├── project/ # Expo Router mobile app
│ ├── app/ # Screens & routes
│ ├── utils/ # PredictionService.ts
│ └── ...
├── render.yaml # Render deploy config
└── README.md

---

## 🚀 API Deployment

**Deployed on [Render](https://render.com)** using:

```yaml
services:
  - type: web
    name: bunk-predictor-api
    env: python
    rootDir: backend
    buildCommand: "pip install -r requirements.txt"
    startCommand: "gunicorn bunk_api:app"



## Mobile App
## Built with Expo Router.
**No App.tsx — app/_layout.tsx is the entry point.

{
  "main": "expo-router/entry"
}




##  How to run locally
cd backend

Create virtual env:


python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

Install:


pip install -r requirements.txt

Run dev:


python bunk_api.py

For production:


gunicorn bunk_api:app
✨ Done!
Mobile: Run with Expo Go or EAS build.

API: Deployed on Render — plug your Render URL in PredictionService.ts.


📣 Author

Nikunj Maheshwari — coded with ❤️



---

## ✅✅✅ THAT’S IT!

1️⃣ Add these files.  
2️⃣ Commit + push to **GitHub**.  
3️⃣ Connect to **Render**, deploy the backend.  
4️⃣ Update your `PredictionService` to use your Render URL, **not local IP**.

---
