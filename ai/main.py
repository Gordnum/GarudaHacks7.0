# Main control file

import cv2
import time
from pose import PosesEstimator
from person_manager import PersonManager

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

while True:
    ret, frame = cap.read()

    if not ret:
        print("Frame gagal")
        break

    timestamp_ms = int(time.time() * 1000)

    frame, landmarks = pose.detect(frame, timestamp_ms)

    people = personManager.update(landmarks)

    cv2.imshow("Camera", frame)

    key = cv2.waitKey(1)

    # Press 'ESC' untuk menutup kamera
    if key == 27:
        break

cap.release()
pose.close()
cv2.destroyAllWindows()