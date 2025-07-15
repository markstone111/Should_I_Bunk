import pandas as pd
import random

data = []

for _ in range(200):
    attendance = random.randint(30, 100)
    total_classes = random.randint(18, 35)
    attended = int(total_classes * attendance / 100)

    importance = random.choice(['Low', 'Medium', 'High'])
    upcoming_test = random.choice([0, 1])
    strictness = random.choice(['Low', 'Medium', 'High'])

    # Labeling rule
    safe = 1
    if attendance < 70:
        safe = 0
    if importance == 'High':
        safe = 0
    if upcoming_test == 1:
        safe = 0
    if strictness == 'High':
        safe = 0

    row = {
        'attendance_percentage': attendance,
        'total_classes': total_classes,
        'classes_attended': attended,
        'importance': importance,
        'upcoming_test': upcoming_test,
        'strictness': strictness,
        'safe_to_bunk': safe
    }

    data.append(row)

df = pd.DataFrame(data)
df.to_csv('bunk_dataset.csv', index=False)
print("✅ Dataset generated: bunk_dataset.csv")
