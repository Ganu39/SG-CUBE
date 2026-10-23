# Contributing to SG CUBE 🧊

Thank you for your interest in contributing to **SG CUBE**! We welcome contributions that improve accessibility, system performance, perception accuracy, user safety, and privacy.

---

## 📌 Project Overview

**SG CUBE 2.5** is a voice-first Personal AI and Assistive AI companion for Windows that integrates:
- Real-time computer vision (YuNet face detection, SFace face recognition, 2D spatial engine).
- Continuous voice conversation and Google Gemini Live multimodal reasoning.
- A modern presentation layer built with React 18, TypeScript, Three.js, and Tailwind CSS.
- An authoritative WebSocket bridge server (`bridge_server.py`) with native fallback to Tkinter GUI.
- Windows system automation via strict allowlisted process dispatch.
- Cryptographic voice security (PBKDF2-HMAC-SHA256, DPAPI hardware-bound storage).

---

## 🏗️ Architecture & Component Boundaries

1. **Frontend Presentation Layer (`frontend/`)**:
   - React 18 + TypeScript + Three.js (`@react-three/fiber`, `@react-three/drei`) + Tailwind CSS.
   - Communicates with the backend exclusively via WebSocket (`ws://127.0.0.1:49155/ws/state`).
   - The UI is strictly an observer, presenter, and command initiator. It must never perform raw cryptographic operations or make bypass decisions.
   - Built assets reside in `frontend/dist/`.

2. **Backend Engine (`visionclaw_gui.py`, `bridge_server.py`)**:
   - Manages speech recognition, text-to-speech, DirectShow camera capture, and single-instance IPC on port `49152`.
   - Standby background wake detection runs via `wake_listener.py` on IPC port `49153`.

3. **Perception & Assistive Modules (`assistive/`)**:
   - Face detection and recognition (`face_recognition.py`, `face_memory.py`).
   - Spatial relationships and scene understanding (`spatial_relationship_engine.py`, `scene_analyzer.py`).
   - Smart object finder (`smart_object_finder.py`) with 5-stage zero-hallucination verification.
   - Proactive assistive alerts (`proactive_alert_manager.py`) with temporal qualification.

---

## 💻 Local Development Setup

### 1. Prerequisites
- **OS:** Windows 10 or Windows 11 (64-bit)
- **Python:** Python 3.10, 3.11, 3.12, or 3.13
- **Node.js:** Node.js 18+ and npm (only needed for frontend source modifications)

### 2. Python Environment
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Development (Optional)
```powershell
cd frontend
npm install
npm run build     # Generates production bundle into frontend/dist
```

### 4. Running SG CUBE
```powershell
# Launch with Web UI (defaults to native Tkinter fallback if WebView2 is absent)
python run_sgcube_web.py

# Or launch background wake listener
run_wake_listener.bat
```

---

## 🔒 Security & Privacy Invariants

All contributors must adhere strictly to these security invariants:
1. **Never commit credentials**: Real API keys, passwords, tokens, face galleries, voice recordings, or `.env` files with actual secrets must never be committed. Always use `.env.example` with placeholders.
2. **Deny-by-default automation**: Never add arbitrary shell execution (`eval`, raw shell commands, or unescaped PowerShell) to automation routines. All system actions must pass through the allowlist in `automation_manager.py`.
3. **Fail-closed authentication**: If biometric or passphrase authentication fails or is cancelled, protected resources must remain locked.
4. **Zero-hallucination guarantees**: When computer vision or memory retrieval cannot confirm an entity, return an explicit negative or uncertain message rather than guessing coordinates.

---

## 🧪 Testing Guidelines

Before submitting any Pull Request:
1. Run syntax verification:
   ```powershell
   python -m py_compile visionclaw_gui.py wake_listener.py bridge_server.py
   ```
2. Run unit and regression tests:
   ```powershell
   pytest tests/test_sleep_wake_lifecycle.py tests/test_wake_ipc_handoff.py tests/test_single_instance.py -v
   ```
3. If frontend code was modified, verify TypeScript and production build:
   ```powershell
   cd frontend
   npm run build
   ```
4. Verify code formatting and trailing whitespace:
   ```powershell
   git diff --check
   ```

---

## 👥 Authors, Contributors & Team Support

### 🚀 Founder & Lead Architect
* **Sharath Gowda U R** ([@sharathgowdaur-jpg](https://github.com/sharathgowdaur-jpg)) — Core System Architecture, Vision AI, Deep Neural Face Engine, Full-Stack Engineering

### 🤝 Contributors
* **Gajanand V Dhayagode** ([@gajanand27-05](https://github.com/gajanand27-05)) — Windows DPAPI hardware-bound security enhancements and dependencies hardening
* **Ganesh Bukka** ([@Ganu39](https://github.com/Ganu39)) — Launcher scripts, web fallback logic, suggestions, ideas, feedback, testing, and project support

### 🤝 Team Support & Acknowledgments
Special thanks to our teammates and collaborators for their valuable suggestions, ideas, feedback, testing support, and encouragement throughout the development of SG CUBE:
* **Gangadhara C** ([@gangadharac](https://github.com/gangadharac)) — Provided valuable suggestions, ideas, feedback, and overall project support.

---

## 📜 License
SG CUBE is open-source software licensed under the [MIT License](LICENSE).
