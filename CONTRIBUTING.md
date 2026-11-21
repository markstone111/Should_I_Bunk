# Contributing to Should I Bunk? 🎓

First off, thank you for considering contributing to **Should I Bunk?**! It's people like you who make this tool reliable and empowering for college students everywhere.

Following these guidelines helps us keep the codebase clean, the review process swift, and the user experience stellar.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all contributors and community members with respect and kindness.

---

## How Can I Contribute?

### 1. Reporting Bugs 🐛
Before creating a bug report, please check the [existing issues](https://github.com/markstone111/Should_I_Bunk/issues) to avoid duplicates.

When opening a new bug report, include:
* A clear, descriptive title.
* Steps to reproduce the problem.
* Expected vs. actual behavior.
* Device details: Device model, Android / iOS version, Expo Go version.
* Screenshots or screen recordings if applicable.

### 2. Suggesting Enhancements 🚀
Have an idea to make campus life easier? We'd love to hear it!
* Open an issue with the **Feature Request** template.
* Explain the problem this feature solves and who benefits from it.
* Outline proposed UI/UX or architectural approaches.

### 3. Code Contributions 💻
1. Fork the repo and create your branch from `v2-upgrade` (or `main` when v2 lands).
2. Name your branch descriptively:
   * `feat/add-notification-snooze`
   * `fix/calendar-leap-year-bug`
   * `docs/improve-math-explanation`
3. Ensure all TypeScript checks pass:
   ```bash
   cd mobile-app
   npx tsc --noEmit
   ```
4. Follow the commit message guidelines below.
5. Push to your fork and submit a Pull Request targeting the active development branch.

---

## Development Setup

### Prerequisites
* **Node.js**: v18.x or v20.x+
* **npm** or **pnpm**
* **Expo Go** app on your physical phone or an Android Emulator / iOS Simulator.

### Steps
```bash
# 1. Clone your fork
git clone https://github.com/<your-username>/Should_I_Bunk.git
cd Should_I_Bunk/mobile-app

# 2. Install dependencies
npm install

# 3. Start Expo development server
npx expo start -c
```

Scan the QR code with the Expo Go app on Android or camera on iOS.

---

## Coding Standards & Guidelines

1. **TypeScript First**: Write strictly typed code. Avoid `any` wherever possible. Define reusable models in `types/`.
2. **Deterministic Mathematical Precision**: Attendance formulas must be pure functions with zero mutations. Always test edge cases (e.g., 0 total classes, 100% target, negative margins).
3. **Offline-First & Graceful Degradation**: Features must never crash if network access is absent or if native permissions (like push notifications) are declined.
4. **Clean UI & Dark Mode**: Always test both light mode and dark mode styles.
5. **No Clutter**: Remove `console.log` statements, unused imports, and commented-out dead code before submitting PRs.

---

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

* `feat:` A new feature for the user
* `fix:` A bug fix
* `docs:` Documentation-only changes
* `style:` Formatting, missing semi-colons, styling changes (no production code change)
* `refactor:` Code refactoring that neither fixes a bug nor adds a feature
* `perf:` Performance improvements
* `test:` Adding or updating tests
* `chore:` Build process, dependency updates, tooling

**Examples**:
```bash
feat(timetable): add recurring weekly slot duplication
fix(math): resolve division by zero when total classes is 0
docs(readme): add mathematical buffer proofs
```

---

## Pull Request Checklist

Before submitting your PR, ensure:
- [ ] Code compiles cleanly (`npx tsc --noEmit`).
- [ ] The app runs on Android without runtime exceptions.
- [ ] Both Light and Dark mode have been visually checked.
- [ ] You have linked the PR to any related GitHub issues.
- [ ] Commit history is clean and follows conventional commit standards.

Thank you for helping make college life better for students worldwide! 🚀
