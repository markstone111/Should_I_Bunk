# 🎓 Should I Bunk? — The Open-Source Attendance Commander & Bunk Risk Engine

<div align="center">

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)
![Expo](https://img.shields.io/badge/Expo-53.0-000020.svg?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.79-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?logo=typescript)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-orange.svg)

**Manage your university attendance smartly, avoid debarment, and take control of your college life.**

[Features](#-key-features) • [Installation](#-quickstart--local-development) • [Mathematical Engine](#-the-zero-failure-mathematical-engine) • [Roadmap](#-v2-roadmap) • [Contributing](#-contributing) • [Security](#-security--privacy)

</div>

---

## 💡 Why "Should I Bunk?"

In most universities, maintaining a minimum attendance percentage (typically **75%** or **80%**) is mandatory. Falling even 0.1% below that threshold can result in debarment from exams, year drops, or severe internal marks penalties.

Yet, existing attendance trackers are clunky, force manual counter increments that drift out of sync, fail when a subject has multiple classes on the same day (such as a morning lecture and an afternoon lab), or offer naive advice based on sleep-prone cloud servers.

**Should I Bunk?** is built from the ground up to be:
* ⚡ **Zero-Failure Mathematical Precision**: Uses deterministic discrete equations to calculate your exact safe bunk buffer ($B$) and deficit recovery count ($C$).
* 📅 **Weekly Timetable with 'Today's Classes'**: Automatically presents your daily schedule with instant **1-tap marking** (`Attended`, `Bunked`, `Cancelled`) without opening individual subjects.
* 🔔 **Smart Push Notifications**: 8:00 AM daily briefings, 10-minute pre-class tactical alerts with live buffer counts, and immediate danger-zone warnings.
* 🛡️ **100% Offline & Privacy-First**: Zero tracking of personal data, zero analytics permissions required, completely local storage.

---

## ✨ Key Features

### 🧮 1. Pure Mathematical Decision Engine
* **Safe Bunk Buffer ($B$)**: Computes the exact integer number of consecutive classes you can skip without dipping below your target percentage.
* **Recovery Target ($C$)**: If you are in the danger zone, calculates the exact number of consecutive classes you must attend to climb back into safety.
* **Mid-Semester Calibration**: Downloaded the app in week 8? Enter your current held and attended count baseline to get started instantly.

### 📅 2. Weekly Timetable & 1-Tap Attendance
* **Multi-Slot Scheduling**: Map your schedule across Monday to Sunday, with lecture, lab (2x weight), and tutorial distinctions.
* **Today's Feed**: Chronological class timeline with live buffer badges (`+3 Safe Bunks` vs `Zero Buffer! Must Attend`).
* **1-Tap Quick Actions**: Mark classes in a single tap directly from the Home screen, with instant undo/switch capabilities.

### 🔬 3. Real College Attendance States
* **Present (✅)**: Full attendance point credited.
* **Absent (❌)**: Attendance penalty registered.
* **Duty Leave / OD (🎖️)**: Approved college duty, sports, or fest participation — credited as attended without penalizing your stats.
* **Cancelled (🚫)**: Professor absent or holiday — automatically excluded from total calculations.

### 🔔 4. Smart Local Notifications
* **Morning Briefing (8:00 AM)**: Daily digest of today's classes and overall buffer balance.
* **Pre-Class Tactical Alert**: Notification 10 minutes before class with room location and bunk safety advice.
* **Instant Danger-Zone Alert**: High-priority alert triggered immediately if a logged bunk drops you below target.

---

## 📐 The Zero-Failure Mathematical Engine

The core invariant of **Should I Bunk?** is that **it will never advise you to bunk if your margin is zero**.

Let:
* $A = \text{Weighted Attended Classes}$
* $N = \text{Weighted Total Classes Held}$
* $T = \text{Target Fraction} = \frac{\text{Target Percentage}}{100}$ (e.g., $0.75$)

### 1. Safe Bunk Buffer ($B$)
How many consecutive classes can be safely skipped while keeping $\frac{A}{N + B} \ge T$?
$$\mathbf{B = \left\lfloor \frac{A - (T \cdot N)}{T} \right\rfloor}$$
*(If $B \le 0$ or current attendance is below $T$, $B = 0$)*

### 2. Deficit Recovery Count ($C$)
If current attendance is below target ($\frac{A}{N} < T$), how many consecutive classes must be attended to reach $T$?
$$\mathbf{C = \left\lceil \frac{(T \cdot N) - A}{1 - T} \right\rceil}$$

---

## 🚀 Quickstart & Local Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Expo CLI](https://docs.expo.dev/get-started/installation/)
* Expo Go app on your physical device ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) or [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/markstone111/Should_I_Bunk.git
   cd Should_I_Bunk/mobile-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start -c
   ```

4. **Run on your device**:
   * Scan the QR code with **Expo Go** on Android.
   * Or press `a` for Android Emulator / connected device.
   * Or press `w` to run in the web browser.

---

## 📂 Project Architecture

```text
Should_I_Bunk/
├── mobile-app/                     # Expo / React Native Client
│   ├── app/                        # Expo Router Pages
│   │   ├── (tabs)/                 # Tab Navigation
│   │   │   ├── index.tsx           # Home & "Today's Schedule" Feed
│   │   │   ├── timetable.tsx       # Weekly Timetable Manager (Mon-Sun)
│   │   │   ├── settings.tsx        # Notifications & App Settings
│   │   │   └── _layout.tsx         # Bottom Tab Bar Layout
│   │   ├── subject/[id].tsx        # Subject Detail & Multi-Slot Calendar
│   │   └── _layout.tsx             # Root Layout & Theme Providers
│   ├── components/                 # Reusable UI Components
│   │   ├── AddSubjectModal.tsx     # Add Subject with Baseline Calibration
│   │   ├── EditSubjectModal.tsx    # Subject Metadata Editor
│   │   ├── AddTimetableSlotModal.tsx # Timetable Entry Creator
│   │   └── SubjectListItem.tsx     # Subject Card with Buffer Badges
│   ├── context/
│   │   └── AppContext.tsx          # Centralized State Engine & Storage
│   ├── types/
│   │   └── attendance.ts           # Domain Data Models & Types
│   └── utils/
│       ├── attendanceCalculator.ts # Pure Deterministic Math Engine
│       └── NotificationService.ts  # Local Smart Notification Scheduler
├── backend/                        # Legacy Python API (Optional cloud model)
├── docs/                           # Local Architectural Documentation
├── CONTRIBUTING.md                 # Contribution Guidelines
├── CODE_OF_CONDUCT.md              # Contributor Covenant
├── SECURITY.md                     # Security & Privacy Policy
├── LICENSE                         # MIT License
└── README.md
```

---

## 🗺️ v2 Roadmap

* [x] **Phase 1: Multi-Slot Engine & CRUD** (Multi-period support, 4 attendance states, pure math buffer/deficit, mid-semester onboarding).
* [x] **Phase 2: Timetable & Smart Notifications** (Weekly schedule, today's feed, 1-tap quick actions, `expo-notifications`).
* [ ] **Phase 3: The Zero-Failure ML & 'What-If' Simulator** (Multi-factor contextual risk matrix, interactive What-If slider, semester trajectory charts).
* [ ] **Phase 4: Native Android Home Screen Widget** (Glance/RemoteViews interactive widget for direct home-screen marking).
* [ ] **Phase 5: Privacy Telemetry & 1-Tap QR Batch Share** (Zero-permission anonymous metrics, batch timetable sharing via QR code).

---

## 🤝 Contributing

We warmly welcome contributions from college students and open-source developers worldwide! Whether it's fixing a bug, suggesting a new feature, or improving documentation:

1. Read our **[Contributing Guidelines](CONTRIBUTING.md)**.
2. Adhere to our **[Code of Conduct](CODE_OF_CONDUCT.md)**.
3. Open an issue or submit a pull request!

---

## 🔒 Security & Privacy

**Should I Bunk?** is built on an **offline-first, zero-knowledge privacy model**. Your attendance records, class schedules, and university details stay strictly on your device. We do not sell, collect, or transmit any personally identifiable student data.

For vulnerability disclosure, please refer to **[SECURITY.md](SECURITY.md)**.

---

## 📄 License

This project is open-source and available under the **[MIT License](LICENSE)**.

---

<div align="center">

Crafted with ❤️ by **[Nikunj Maheshwari](https://github.com/markstone111)** and dedicated to college students everywhere.

*If you find this project helpful, give it a ⭐ on GitHub!*

</div>
