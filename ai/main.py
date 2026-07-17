# Main control file

import cv2
import time
import requests
from pose import PosesEstimator
from person_manager import PersonManager
from action import ActionRecognizer, Action
from threat import ThreatEngine
from ui import UI
from detector import Detector
from recorder import IncidentRecorder

# Endpoint URL untuk menembak Server Node.js
NODEJS_URL = "http://172.21.202.136:3000/fetch-signal"
# Untuk buka window
cap = cv2.VideoCapture(0)

# Set resolusi window
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

if not cap.isOpened():
    print("Camera tidak bisa dibuka")
    exit()

pose = PosesEstimator(model_path = 'pose_landmarker.task', num_poses = 2)
personManager = PersonManager()
actionRecognizer = ActionRecognizer()
threatEngine = ThreatEngine()
ui = UI()
detector = Detector()
recorder = IncidentRecorder()

prevTime = time.time()

while True:
    ret, frame = cap.read()

    if not ret:
        print("Frame gagal")
        break

    rawFrame = frame.copy()

    # Membuat timestamp dalam ms
    timestamp_ms = int(time.time() * 1000)

    frame, detectedPeople = pose.detect(frame, timestamp_ms)

    people = personManager.update(detectedPeople)

    detections = detector.detect(frame, people)

    detector.assignObjects(people, detections)

    highThreat = False

    # Result for the rig (VERY IMPORTANT)
    for person in people:
        # 1. Kenali aksi (mengembalikan objek Enum)
        action = actionRecognizer.recognize(person)
        
        # 2. Update skor ancaman dan hitung level kategorinya
        score = threatEngine.update(person, action)
        level = threatEngine.level(score) # Posisinya dipindah ke sini agar variabel 'level' terdefinisi

        if score >= 80:
            highThreat = True

        # 3. Jembatan EAI: Kirim sinyal ke Node.js jika mendeteksi HIGH atau CRITICAL
        if level in ["HIGH", "CRITICAL"]:
            payload = {
                "score": float(score),
                "level": level,
                "action": str(action.value) # Mengambil string bersih seperti "Punching"
            }
            
            try:
                # Mengirim data POST ke Node.js dengan timeout 1 detik agar kamera tidak patah-patah
                response = requests.post(NODEJS_URL, json=payload, timeout=1)
                print(f"[Bridge] Sinyal ancaman dikirim! Status Server Node.js: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"[Bridge] Gagal terhubung ke server Node.js: {e}")

        print(f"Person {person.id}: {action.value}, threat score: {score}")

    current = time.time()
    fps = 1 / (current - prevTime)
    prevTime = current

    ui.drawObjects(frame, detections)

    for person in people:
        level = threatEngine.level(person.threatScore)
        ui.drawPerson(frame, person, level)

    ui.drawFPS(frame, fps)

    if highThreat:
        ui.drawAlarm(frame)
        recorder.save(rawFrame, people, detections)
        
    cv2.imshow("Camera", frame)

    key = cv2.waitKey(1)

    # Press 'ESC' untuk menutup kamera
    if key == 27:  
        break

cap.release()
pose.close()
cv2.destroyAllWindows() 