# GarudaHacks7.0

ThreatVision is an integrated security ecosystem that transforms passive CCTV cameras into proactive crime mitigation assets. By leveraging advanced Computer Vision, MediaPipe, YOLO architectures, and a fully automated backend reporting network, the system detects suspicious activities—such as violent behavior or weapon brandishing—in real-time.

**Feature :** 
1. Real time computer vision
    - All analysis, threat indexing, and geometric vector tracking are performed in real-time. The framework is engineered specifically for seamless, direct integration with existing commercial security camera feeds.
2. Sistem reporting secara otomatis
    - The system triggers an instant, remote mobile response sequence without human intervention. The linked device automatically dials emergency dispatchers while concurrently broadcasting actionable text reports and physical Google Maps coordinates via WhatsApp—powered by a localized Node.js and ADB infrastructure. dari sistem nya.
3. Automatic call
    - By executing low-level Android Debug Bridge (ADB) commands directly into the mobile subsystem, the network bypasses traditional user interface delay, shaving critical seconds off emergency connection times.
4. Object and activity detection
    - The custom AI model pipeline is specialized to differentiate regular objects from hazardous assets (such as knives and firearms) while simultaneously calculating kinetic human body dynamics to recognize violent behaviors like punching or falling
  
**Work Flow**
1. The camera captures live video streams frame-by-frame, continuously injecting raw data into the edge analysis loop.
2. MediaPipe Pose processes the frame to extract structural coordinates and landmarks for 33 distinct anatomical body joints for every person detected.
3. The framework assigns unique, persistent tracking IDs to each individual across consecutive frames to maintain systemic consistency.
4. The system computes joint vector displacement and velocity changes over time to classify specific movements like walking, running, falling, or punching.
5. A specialized YOLO inference pipeline detects active objects within the scene, identifying general threats as well as weapon signatures like firearms via a custom-trained model.
6. Bounding box spatial calculations map detected weapons directly to the corresponding individual tracking ID based on proximity thresholds to their wrist landmarks.
7. A centralized threat engine contextually aggregates the person’s real-time actions, held objects, and rule-based heuristics to calculate a threat score and evaluate the current risk level (Low, Medium, High, or Critical).
8. The custom UI displays real-time detection overlays. The exact millisecond the threat scale reaches Critical, the local runtime triggers an internal alarm and flashes a screen capture to local evidence storage.
9. The captured evidence image file is instantly serialized into an ultra-long textual string using a high-performance Base64 encoding algorithm. 
10. The encoded image payload is bundled inside a structured JSON package along with diagnostic logs and dispatched across the local network to the HP running Termux.
11. The mobile Express.js server ingests the incoming JSON packet, immediately decoding the Base64 image payload back into a physical picture file optimized for WhatsApp integration.
12. The server initiates the automated response array, employing programmatic ADB (Android Debug Bridge) scripts to bypass standard user input blockages and interact directly with the mobile system.
13. The backend constructs an automated, actionable Google Maps URL link containing precise real-time rescue coordinates.
14. The system leverages an ip-api network tracing structure to pull regional location diagnostics, resolving raw network paths into definitive Latitude and Longitude values.
15. The computed coordinates are automatically formatted into a dynamic hyperlinked layout: [https://maps.google.com/?q=Latitude,Longitude](https://maps.google.com/?q=Latitude,Longitude).
16. With the link generated, the Node.js backend broadcasts hardware keyevents to forcefully close running background tasks, return to the Android launcher, and launch the native telephony app.
17. The script injects continuous Backspace keyevents (keyevent 67) into the open phone interface, clearing stale placeholders to ensure a clean slate for emergency dialing.
18. The system pushes the exact designated emergency phone number into the input field and emulates the hardware dial button event to place an instant call.
19. Simultaneously, the automated framework switches focus to the WhatsApp app, utilizing Android Activity Manager components to map directly into specific secure target chat sessions.
20. The system programmatically inputs the emergency message string containing the event description, evidence attachment, and the active Google Maps location link—broadcasting a complete, actionable crisis report to authorities in under two seconds.

**AI USAGE**
1. Claude: Deployed as the primary heavy-duty problem solver to navigate complex architectural bugs, while generating robust dummy code structures for high-impact system testing
2. ChatGPT: Utilized as a collaborative engineering companion for rapid program discussions and automated dummy code generation to streamline development sprints.
3. Gemini: Utilized as an essential engineering companion for real-time program architecture discussions and dummy code generation, while providing deep conceptual breakdowns and core logical explanations of the codebase.
