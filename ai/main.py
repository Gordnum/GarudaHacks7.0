# Main control file

import cv2
import time
import requests
import base64
from pose import PosesEstimator
from person_manager import PersonManager
from action import ActionRecognizer, Action
from threat import ThreatEngine
from ui import UI
from detector import Detector
from recorder import IncidentRecorder

NODEJS_URL = "http://172.25.145.73:3000/fetch-signal"

# Inisialisasi variabel untuk cooldown laporan (dalam detik)
COOLDOWN_LAPORAN = 120  
terakhir_lapor = 0      

cap = cv2.VideoCapture(0)

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

    timestamp_ms = int(time.time() * 1000)

    frame, detectedPeople = pose.detect(frame, timestamp_ms)

    people = personManager.update(detectedPeople)

    detections = detector.detect(frame, people)

    detector.assignObjects(people, detections)

    highThreat = False
    waktu_sekarang = time.time()

    for person in people:
        action = actionRecognizer.recognize(person)
        
        score = threatEngine.update(person, action)
        level = threatEngine.level(score)

        if score >= 80:
            highThreat = True

        if level in ["HIGH", "CRITICAL"]:
            # Cek apakah durasi cooldown laporan sudah terpenuhi
            if waktu_sekarang - terakhir_lapor >= COOLDOWN_LAPORAN:
                
                # 1. Panggil recorder untuk mengambil foto sekarang juga
                evidence_path = recorder.save(rawFrame, people, detections)
                
                # 2. Ubah gambar menjadi format Base64 string
                evidence_b64 = ""
                if evidence_path:
                    with open(evidence_path, "rb") as img_file:
                        evidence_b64 = base64.b64encode(img_file.read()).decode('utf-8')

                # 3. Sisipkan gambar ke dalam payload
                payload = {
                    "score": float(score),
                    "level": level,
                    "action": str(action.value),
                    "evidence_b64": evidence_b64  # <-- Data gambar
                }
                
                try:
                    response = requests.post(NODEJS_URL, json=payload, timeout=5) # Timeout dinaikkan sedikit karena membawa gambar
                    print(f"[Bridge] Sinyal ancaman & Bukti dikirim! Status Node.js: {response.status_code}")
                    terakhir_lapor = waktu_sekarang 
                except requests.exceptions.RequestException as e:
                    print(f"[Bridge] Gagal terhubung ke server Node.js: {e}")
            else:
                sisa_waktu = int(COOLDOWN_LAPORAN - (waktu_sekarang - terakhir_lapor))
                print(f"[Bridge] Ancaman terdeteksi, tapi lapor tertahan cooldown. Sisa waktu: {sisa_waktu} detik")

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

    if key == 27:  
        break

cap.release()
pose.close()
cv2.destroyAllWindows()