# File untuk mengatur object detection

from ultralytics import YOLO
import torch

class Detector:

    def __init__(self, model_path = "yolo11s.pt"):

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.model = YOLO(model_path)
        self.model.to(self.device)

        print(f"Running YOLO on {self.device}")

        self.globalClasses = {
            "person",
            "backpack"
        }

        self.handClasses = {
            "knife",
            "cell phone"
        }

        # ROI size around wrist
        self.handCropSize = 150


    def detect(self, frame, people):

        detections = []

        # Global detection (untuk benda besar)

        with torch.no_grad():

            results = self.model(
                frame,
                conf=0.25,
                device=self.device,
                verbose=False
            )

        detections.extend(
            self.parseResults(results, self.globalClasses)
        )

        # Hand crops (untuk benda kecil)

        for person in people:

            x1, y1, x2, y2 = person.bbox

            personHeight = y2 - y1

            cropSize = max(
                100,
                int(personHeight * 0.5)
            )

            for hand in ["left_wrist", "right_wrist"]:

                wrist = person.landmarks[hand]

                detections.extend(
                    self.detectHandROI(
                        frame,
                        wrist,
                        cropSize
                    )
                )

        return detections
    

    def detectHandROI(self, frame, wrist, crop_size):

        h, w = frame.shape[:2]

        cx = int(wrist.x * w)
        cy = int(wrist.y * h)

        s = crop_size // 2

        x1 = max(0, cx - s)
        y1 = max(0, cy - s)

        x2 = min(w, cx + s)
        y2 = min(h, cy + s)

        roi = frame[y1:y2, x1:x2]

        if roi.size == 0:
            return []

        with torch.no_grad():

            results = self.model(
                roi,
                conf=0.10,
                device=self.device,
                verbose=False
            )

        detections = []

        for result in results:

            for box in result.boxes:

                cls = int(box.cls[0])

                label = self.model.names[cls]

                if label not in self.handClasses:
                    continue

                rx1, ry1, rx2, ry2 = map(int, box.xyxy[0])

                detections.append({

                    "label": label,

                    "confidence": float(box.conf[0]),

                    # convert ROI coords back to image coords

                    "bbox": (
                        rx1 + x1,
                        ry1 + y1,
                        rx2 + x1,
                        ry2 + y1
                    )

                })

        return detections
    
    
    def parseResults(self, results, allowed_classes):

        detections = []

        for result in results:
            for box in result.boxes:

                cls = int(box.cls[0])
                label = self.model.names[cls]

                if label not in allowed_classes:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                detections.append({
                    "label": label,
                    "confidence": float(box.conf[0]),
                    "bbox": (x1, y1, x2, y2)
                })

        return detections