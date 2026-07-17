# File untuk menyimpan bukti kriminalitas

import cv2
import os
import time
from datetime import datetime

class IncidentRecorder:

    def __init__(self):

        self.outputDIR = "evidence"

        os.makedirs(self.outputDIR, exist_ok=True)

        # minimal jeda antar screenshot
        self.cooldown = 20

        self.lastCapture = 0


    def save(self, rawFrame, people, detections):

        now = time.time()

        if now - self.lastCapture < self.cooldown:
            return None

        self.lastCapture = now

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        image = rawFrame.copy()

        # Waktu insiden
        y = 30

        cv2.putText(
            image,
            f"Time : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            (10, y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 0, 255),
            2
        )

        y += 30

        # Pelaku insiden

        for person in people:

            cv2.putText(
                image,
                f"Threat: {person.action}",
                (10, y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 255),
                2
            )

            y += 25
            
        # Objek yang terdeteksi

        for det in detections:

            cv2.putText(
                image,
                f'Object: {det["label"]} ({det["confidence"]:.2f})',
                (10, y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0,0,255),
                2
            )

            y += 25

        filename = f"{timestamp}.jpg"

        path = os.path.join(
            self.outputDIR,
            filename
        )

        cv2.imwrite(path, image)

        print(f"[Evidence] Saved : {path}")
        return path