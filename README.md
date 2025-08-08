# 📚 Should I Bunk?

An intelligent mobile app that helps students decide whether to skip class. It uses a machine learning model to provide a prediction based on factors like current attendance, professor's strictness, and upcoming tests.



---

## ✨ Features

- **AI-Powered Predictions:** Uses a logistic regression model to give a "Bunk" or "Don't Bunk" recommendation.
- **Cross-Platform:** Built with React Native (Expo), it runs on both iOS and Android from a single codebase.
- **Simple Interface:** Clean and intuitive UI to quickly input data and get a result.
- **Deployable Backend:** The Python Flask API is configured for easy deployment on Render.

---

## 🛠️ Tech Stack & Tools

| Category    | Technology                                                                                                  |

| :---------- | :---------------------------------------------------------------------------------------------------------- |

| **Frontend** | `React Native`, `Expo`, `TypeScript`, `Expo Router`                                                         |

| **Backend** | `Python`, `Flask`, `Scikit-learn`, `Pandas`, `NumPy`                                                        |

| **Server** | `Gunicorn`                                                                                                  |

| **Deployment**| `Render`                                                                                                    |

---

## 📂 Project Structure

The repository is a monorepo containing the backend API and the mobile app.

.

├── backend/

│   ├── bunk\_api.py             # Flask API with the /predict endpoint

│   ├── logistic\_regression.py  # Script to train the ML model

│   ├── generate\_dataset.py     # Script to create the training data

│   ├── bunk\_predictor.pkl      # The trained model file

│   ├── requirements.txt        # Python dependencies

│   └── runtime.txt             # Python version for Render

│

├── mobile-app/

│   ├── app/                    # Expo Router screens

│   ├── utils/PredictionService.ts # Logic to call the backend API

│   ├── package.json            # Node.js dependencies

│   └── ...

│

├── render.yaml                 # Deployment configuration for Render

└── README.md                   # This file


---

## 🔌 API Endpoint

The backend provides one main endpoint for predictions.

### **POST** `/predict`

- Accepts user data and returns a bunking recommendation.

### **Request Body:**

```json

{

"attendance_percentage": 78,

"assignments_due": 2,

"prox_of_test": 5,

"prof_strictness": 8

}

```
### Success Response:

```json

{

"prediction": "Don't Bunk",

"confidence_score": 0.88

}

```

---

# 🚀 Getting Started

- Follow these instructions to set up and run the project on your local machine.

Prerequisites

Git

Node.js (v18 or later)

Python (v3.10 recommended)

Expo Go App on your mobile device



## 1. Backend Setup

First, set up the Python Flask server.



### Clone the repository
```bash
git clone [https://github.com/markstone111/Should_I_Bunk.git](https://github.com/markstone111/Should_I_Bunk.git)

cd Should_I_Bunk/backend
```

### Create and activate a virtual environment
```bash
# On macOS/Linux:

python3 -m venv venv

source venv/bin/activate
```
### On Windows:
```bash
python -m venv venv

venv\Scripts\activate
```

### Install the required packages
```bash
pip install -r requirements.txt
```


### Run the Flask API
```bash
python bunk_api.py

```

The backend API will now be running on http://127.0.0.1:5000. Keep this terminal open.

## 2. Mobile App Setup

Now, set up the React Native frontend in a new terminal window.



### Navigate to the mobile app directory
```bash
cd Should_I_Bunk/mobile-app
```
### Install dependencies
```bash
npm install
```
### IMPORTANT: Update the API address

- Open mobile-app/utils/PredictionService.ts and change the API\_URL

- from the placeholder to your local IP address: "http://<YOUR\_LOCAL\_IP>:5000"

### Start the development server
```bash
npx expo start
```
- Scan the QR code with the Expo Go app on your phone to launch the app.

## 3. Creating an Android App (.apk)

- After testing with Expo Go, you can create a standalone .apk file to share or install on Android devices. This uses Expo Application Services (EAS).



### From the mobile-app directory, run the build command

### You may need to log in to your Expo account first (eas login)
```bash
npx eas build -p android --profile preview
```
- EAS will build your app in the cloud and provide a link to download the .apk file when it's finished.
  
---
# ☁️ Deployment

- This project is configured for easy deployment to Render.

- Push to GitHub: Make sure your entire project, including the render.yaml file, is pushed to your GitHub repository.

- Create a New Web Service: On the Render dashboard, click "New +" and select "Web Service".

- Connect Your Repo: Choose your project repository from the list. Render will automatically detect the render.yaml file.

- Deploy: Click "Create Web Service". Render will use the instructions in render.yaml to build and deploy the backend.

- Update API URL in App: Once deployed, Render will give you a public URL. Copy this URL and paste it into the PredictionService.ts file in your mobile app before creating a final build.

---
# ⭐ Show Your Support

If you found this project useful or interesting, please consider giving it a star ⭐ on GitHub!

Feel free to fork the repository and contribute with your own features or improvements.
---
