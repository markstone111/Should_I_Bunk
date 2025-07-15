
from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load your trained model
model = joblib.load('bunk_predictor.pkl')

# Mappings for categorical values (should match training)
importance_map = {'Low': 0, 'Medium': 1, 'High': 2}
strictness_map = {'Low': 0, 'Medium': 1, 'High': 2}

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    attendance_percentage = data.get('attendance_percentage', 0)
    total_classes = data.get('total_classes', 0)
    classes_attended = data.get('classes_attended', 0)

    class_importance = importance_map.get(data.get('class_importance', 'Medium'), 1)
    upcoming_test = 1 if data.get('upcoming_test', False) else 0
    professor_strictness = strictness_map.get(data.get('professor_strictness', 'Medium'), 1)

    features = np.array([[attendance_percentage,
                          total_classes,
                          classes_attended,
                          class_importance,
                          upcoming_test,
                          professor_strictness]])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]  # probability of safe_to_bunk == 1

    advice = "You can safely bunk this class." if prediction == 1 else "Better attend this class to be safe."

    return jsonify({
        'safe_to_bunk': bool(prediction),
        'probability': float(probability),
        'advice': advice
    })

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "API is running! Use POST /predict"})
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)

#app.run is removed to avoid conflict of gunicorn and flask server
