# # logistic_regression.py

# import pandas as pd
# from sklearn.linear_model import LogisticRegression
# from sklearn.model_selection import train_test_split
# import joblib

# # ✅ Step 1 — Create dummy dataset
# data = {
#     'attendance_percentage': [75, 85, 60, 90, 55, 95, 40, 80, 65, 70],
#     'importance': [1, 2, 1, 3, 3, 1, 2, 2, 3, 2],
#     'strictness': [1, 2, 3, 1, 3, 1, 2, 2, 3, 1],
#     'upcoming_test': [0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
#     'safe_to_bunk': [1, 1, 0, 1, 0, 1, 0, 1, 0, 1]
# }

# df = pd.DataFrame(data)

# X = df[['attendance_percentage', 'importance', 'strictness', 'upcoming_test']]
# y = df['safe_to_bunk']

# # ✅ Step 2 — Train test split
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # ✅ Step 3 — Train model
# model = LogisticRegression()
# model.fit(X_train, y_train)

# # ✅ Step 4 — Evaluate
# accuracy = model.score(X_test, y_test)
# print(f"Model accuracy: {accuracy * 100:.2f}%")

# # ✅ Step 5 — Export model
# joblib.dump(model, 'bunk_predictor.pkl')
# print("✅ Model saved as bunk_predictor.pkl")









#hardcodded with dummy data

# logistic_regression.py

# import pandas as pd
# from sklearn.linear_model import LogisticRegression
# from sklearn.model_selection import train_test_split
# import joblib

# # ✅ Step 1 — Create dummy dataset
# data = {
#     'attendance_percentage': [75, 85, 60, 90, 55, 95, 40, 80, 65, 70],
#     'total_classes': [40, 50, 35, 55, 30, 60, 25, 45, 38, 42],
#     'classes_attended': [30, 45, 21, 50, 17, 58, 10, 40, 25, 35],
#     'class_importance': [1, 2, 1, 3, 3, 1, 2, 2, 3, 2],  # 0=Low, 1=Medium, 2=High
#     'upcoming_test': [0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
#     'professor_strictness': [1, 2, 3, 1, 3, 1, 2, 2, 3, 1],  # 0=Low, 1=Medium, 2=High
#     'safe_to_bunk': [1, 1, 0, 1, 0, 1, 0, 1, 0, 1]
# }

# df = pd.DataFrame(data)

# X = df[['attendance_percentage', 'total_classes', 'classes_attended',
#         'class_importance', 'upcoming_test', 'professor_strictness']]
# y = df['safe_to_bunk']

# # ✅ Step 2 — Train test split
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# # ✅ Step 3 — Train model
# model = LogisticRegression()
# model.fit(X_train, y_train)

# # ✅ Step 4 — Evaluate
# accuracy = model.score(X_test, y_test)
# print(f"Model accuracy: {accuracy * 100:.2f}%")

# # ✅ Step 5 — Export model
# joblib.dump(model, 'bunk_predictor.pkl')
# print("✅ Model saved as bunk_predictor.pkl")






#dataset loaded with csv file


# logistic_regression.py

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib

# ✅ Step 1 — Load your generated dataset
df = pd.read_csv('bunk_dataset.csv')

# ✅ If needed: map categorical columns to numbers
importance_map = {'Low': 0, 'Medium': 1, 'High': 2}
strictness_map = {'Low': 0, 'Medium': 1, 'High': 2}

df['class_importance'] = df['importance'].map(importance_map)
df['professor_strictness'] = df['strictness'].map(strictness_map)

# ✅ Drop original text columns (optional)
df = df.drop(columns=['importance', 'strictness'])

# ✅ Features and label
X = df[['attendance_percentage', 'total_classes', 'classes_attended',
        'class_importance', 'upcoming_test', 'professor_strictness']]
y = df['safe_to_bunk']

# ✅ Step 2 — Train test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ✅ Step 3 — Train model
model = LogisticRegression()
model.fit(X_train, y_train)

# ✅ Step 4 — Evaluate
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy * 100:.2f}%")

# ✅ Step 5 — Export model
joblib.dump(model, 'bunk_predictor.pkl')
print("✅ Model saved as bunk_predictor.pkl")
