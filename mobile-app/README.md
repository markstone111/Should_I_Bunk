# Should I Bunk - Mobile App

A React Native mobile app to help students manage attendance subject-wise, mark daily presence/absence in a calendar, and get predictions on whether they can safely bunk the next class using a Machine Learning model.

## 🚀 Features

### Frontend (React Native with Expo)
- **Splash Screen** with smooth onboarding
- **Terms & Conditions** with validation
- **Home Screen** with subject management and search
- **Calendar-based Attendance** tracking per subject
- **ML Prediction Integration** for bunking decisions
- **Settings** with dark mode and preferences
- **Drawer Navigation** for additional features
- **Local Data Persistence** with AsyncStorage

### Backend (Python FastAPI) - Setup Required
- **Logistic Regression Model** for predictions
- **REST API** for prediction endpoint
- **CORS Support** for mobile app integration

## 📱 App Flow

1. **Splash Screen** → Auto-navigates to Terms after 3 seconds
2. **Terms & Conditions** → Checkbox validation before proceeding
3. **Home Screen** → Add/view subjects with attendance percentages
4. **Subject Details** → Calendar view for marking attendance + prediction factors
5. **Prediction** → ML-based recommendation with confidence score

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo Router)
- **Navigation**: Expo Router with Tab + Drawer navigation
- **State Management**: React Context API with useReducer
- **Storage**: AsyncStorage for local persistence
- **Calendar**: react-native-calendars
- **Icons**: Lucide React Native
- **Backend**: Python FastAPI (setup required)
- **ML**: Scikit-learn Logistic Regression

## 🏃‍♂️ Quick Start

### Frontend Setup (Already Running)
The React Native app is already configured and running. You can:

1. Navigate through the app starting from the splash screen
2. Add subjects and mark attendance
3. Use the prediction feature (works with local fallback)

### Backend Setup (Required for Full ML Integration)

Since this is a WebContainer environment, you'll need to set up the Python backend locally:

1. **Create Backend Directory**:
```bash
mkdir backend
cd backend
```

2. **Install Dependencies**:
```bash
pip install fastapi uvicorn scikit-learn joblib pandas numpy
```

3. **Create main.py**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

app = FastAPI(title="Should I Bunk API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionInput(BaseModel):
    attendance_percentage: float
    total_classes: int
    classes_attended: int
    class_importance: str
    upcoming_test: bool
    professor_strictness: str

class PredictionOutput(BaseModel):
    safe_to_bunk: bool
    probability: float
    advice: str

# Load or create model
try:
    model = joblib.load("model.pkl")
except:
    # Create dummy model if not exists
    from sklearn.linear_model import LogisticRegression
    model = LogisticRegression()
    # Create dummy training data
    X = np.random.rand(1000, 6)
    y = np.random.randint(0, 2, 1000)
    model.fit(X, y)
    joblib.dump(model, "model.pkl")

def encode_features(data: PredictionInput) -> np.array:
    # Convert categorical to numerical
    importance_map = {"Low": 1, "Medium": 2, "High": 3}
    strictness_map = {"Low": 1, "Medium": 2, "High": 3}
    
    features = [
        data.attendance_percentage / 100,
        data.total_classes / 50,  # Normalize
        data.classes_attended / 50,  # Normalize
        importance_map[data.class_importance] / 3,
        1 if data.upcoming_test else 0,
        strictness_map[data.professor_strictness] / 3
    ]
    
    return np.array(features).reshape(1, -1)

@app.post("/predict", response_model=PredictionOutput)
async def predict(data: PredictionInput) -> PredictionOutput:
    # Encode features
    features = encode_features(data)
    
    # Get prediction
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0].max()
    
    safe_to_bunk = bool(prediction)
    
    # Generate advice
    if safe_to_bunk:
        if data.attendance_percentage > 80:
            advice = "You have excellent attendance! Safe to take a break."
        else:
            advice = "Safe to bunk, but monitor your attendance carefully."
    else:
        if data.attendance_percentage < 50:
            advice = "Your attendance is critically low. Attend this class!"
        else:
            advice = "Better to attend this class to maintain good attendance."
    
    return PredictionOutput(
        safe_to_bunk=safe_to_bunk,
        probability=probability,
        advice=advice
    )

@app.get("/")
async def root():
    return {"message": "Should I Bunk API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

4. **Create Advanced ML Model (train_model.py)**:
```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import joblib

# Generate realistic training data
np.random.seed(42)
n_samples = 5000

# Create synthetic dataset
data = {
    'attendance_percentage': np.random.normal(75, 15, n_samples),
    'total_classes': np.random.poisson(30, n_samples),
    'classes_attended': [],
    'class_importance': np.random.choice(['Low', 'Medium', 'High'], n_samples, p=[0.3, 0.5, 0.2]),
    'upcoming_test': np.random.choice([True, False], n_samples, p=[0.2, 0.8]),
    'professor_strictness': np.random.choice(['Low', 'Medium', 'High'], n_samples, p=[0.2, 0.6, 0.2])
}

# Calculate attended classes based on attendance percentage
for i in range(n_samples):
    attended = int(data['total_classes'][i] * data['attendance_percentage'][i] / 100)
    data['classes_attended'].append(attended)

df = pd.DataFrame(data)

# Create target variable (safe to bunk)
def determine_safe_to_bunk(row):
    score = row['attendance_percentage'] / 100
    
    if row['class_importance'] == 'High':
        score -= 0.3
    elif row['class_importance'] == 'Low':
        score += 0.2
    
    if row['upcoming_test']:
        score -= 0.4
    
    if row['professor_strictness'] == 'High':
        score -= 0.2
    elif row['professor_strictness'] == 'Low':
        score += 0.1
    
    # Add some randomness
    score += np.random.normal(0, 0.1)
    
    return 1 if score > 0.6 else 0

df['safe_to_bunk'] = df.apply(determine_safe_to_bunk, axis=1)

# Encode categorical variables
le_importance = LabelEncoder()
le_strictness = LabelEncoder()

df['class_importance_encoded'] = le_importance.fit_transform(df['class_importance'])
df['professor_strictness_encoded'] = le_strictness.fit_transform(df['professor_strictness'])

# Prepare features
features = [
    'attendance_percentage', 'total_classes', 'classes_attended',
    'class_importance_encoded', 'upcoming_test', 'professor_strictness_encoded'
]

X = df[features]
y = df['safe_to_bunk']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = LogisticRegression(random_state=42)
model.fit(X_train, y_train)

# Evaluate
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)

print(f"Training Accuracy: {train_score:.3f}")
print(f"Testing Accuracy: {test_score:.3f}")

# Save model and encoders
joblib.dump(model, 'model.pkl')
joblib.dump(le_importance, 'importance_encoder.pkl')
joblib.dump(le_strictness, 'strictness_encoder.pkl')

print("Model saved successfully!")
```

5. **Run the Backend**:
```bash
# Train the model first
python train_model.py

# Start the API server
python main.py
```

The API will be available at `http://localhost:8000`

### Connect Frontend to Backend

1. **Update API URL**: In `utils/PredictionService.ts`, ensure the API_BASE_URL points to your backend:
```typescript
private static readonly API_BASE_URL = 'http://localhost:8000';
```

2. **Test Connection**: The app includes fallback logic, so it works even without the backend. When the backend is running, predictions will use the ML model.

## 📊 App Structure

```
/
├── app/
│   ├── _layout.tsx          # Root layout
│   ├── splash.tsx           # Splash screen
│   ├── terms.tsx            # Terms & conditions
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigation
│   │   ├── index.tsx        # Home screen
│   │   └── settings.tsx     # Settings screen
│   └── subject/[id].tsx     # Subject detail page
├── components/
│   ├── DrawerLayout.tsx     # Drawer navigation
│   ├── DropdownPicker.tsx   # Custom dropdown
│   └── ToggleSwitch.tsx     # Custom toggle
├── context/
│   └── AppContext.tsx       # Global state management
└── utils/
    └── PredictionService.ts # API service
```

## 🎯 Key Features Explained

### Attendance Tracking
- Calendar-based interface for easy date selection
- Visual indicators for present (green) and absent (red) days
- Automatic calculation of attendance percentage

### ML Prediction
- Considers multiple factors: attendance %, class importance, upcoming tests, professor strictness
- Provides confidence score and personalized advice
- Fallback local algorithm when backend is unavailable

### Data Persistence
- All data stored locally using AsyncStorage
- No external servers required for basic functionality
- Privacy-focused approach

### User Experience
- Smooth onboarding flow with splash and terms screens
- Intuitive navigation with tabs and drawer
- Dark mode support
- Responsive design for all screen sizes

## 🔧 Customization

### Adding New Subjects
- Tap the "+" icon in the home screen header
- Subjects are automatically created with default settings
- Customize subject names by editing the code

### Prediction Algorithm
- Modify `PredictionService.localPredict()` for custom logic
- Adjust weights for different factors
- Add new prediction factors as needed

### Styling
- Update colors in StyleSheet objects
- Modify spacing and typography
- Add animations using react-native-reanimated

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure Python backend is running on port 8000
- Check CORS configuration in FastAPI
- Verify network connectivity between app and backend

### Data Not Persisting
- Check AsyncStorage permissions
- Verify JSON serialization in AppContext
- Clear app data if structure changes

### Calendar Issues
- Ensure date strings are in YYYY-MM-DD format
- Check timezone handling for date selection
- Verify marking logic in subject screen

## 🚀 Future Enhancements

- **Push Notifications** for low attendance alerts
- **Export Functionality** for attendance reports
- **Subject Categories** for better organization
- **Attendance Goals** and achievements
- **Social Features** for comparing with friends
- **Integration** with university systems
- **Advanced ML Models** with more factors

## 📝 License

This project is created as a starter template for educational purposes. Feel free to modify and use according to your needs.