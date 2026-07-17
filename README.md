ThreatVision: AI-Driven Proactive Security System (KRMS)

> “Keeping Real Time Monitoring Smart.”

Overview

ThreatVision(by KRMS) is an intelligent, embedded security monitoring system built for the Garuda Hacks competition. We are moving away from reactive "recording-only" CCTV towards a proactive system that detects, analyzes, and acts upon threats in real-time.

---

Technology Stack
We leverage a high-performance stack to ensure low-latency detection and reliable emergency response.

AI Engineering Layer
*   MediaPipe: Precise, real-time human pose estimation to understand body language and movement patterns.
*   YOLO (You Only Look Once): High-speed object detection for identifying prohibited items (knives, firearms) in a live feed.
*   Custom Dataset Training: Specialized labeling pipeline to train the model on highly specific objects and threat scenarios.
*   GPU Acceleration: Integrated hardware acceleration to ensure AI inference runs smoothly without lag on edge devices.

Backend Logic
*   Node.js & Express: The "brain" of the operation. It processes threat data, coordinates system actions, and acts as the central hub.
*   Automated Emergency Trigger: Translates server-side threat detection into physical actions, such as initiating emergency calls.
*   ip-api: Provides location tracking via IP address as a robust fallback to standard GPS data.
*   Emergency Integration: Directly bridges system alerts to emergency services (112 protocols).

Design & UX
*   Figma: Used for prototyping the intuitive dashboard and designing the system's human-machine interface.
*   Visual Storytelling: Our presentation and data visualization logic were structured to ensure security data is easily actionable for end-users.

---

How It Works: The Workflow
The system pipeline is optimized for zero-delay response:

1.  CCTV Stream: The camera captures live feed.
2.  Detection: MediaPipe and YOLO scan for poses and objects.
3.  Logic Processing: Node.js calculates the "Threat Progress" score based on behavior.
4.  Action: If the threshold is exceeded:
    *   Pemicu Darurat (Emergency Trigger) is activated.
    *   System triggers an automated emergency protocol (112).
    *   Location and snapshots are sent via the backend to authorities.

---

Roadmap
- Dataset Acquisition (Weapon Detection)
- AI Model Training (Pose & Object recognition)
- System Blueprint (Threat Logic Engine)
- Backend Integration (Emergency Call & WA Trigger)
- UI Polish(Dynamic Web Dashboard)

---

The Squad
*   AI Engineer: Kent Dji (The brain behind the Threat Monitoring logic).
*   Back End Developer: Melo (The nervous system—WhatsApp & Emergency APIs).
*   UI/UX Architects: Sam & Ricardo (The face of the project).
*   Documentation & Pitch: Ricardo & Melo (Translating code into compelling value).

---
