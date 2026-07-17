# File untuk mengatur object detection

from ultralytics import YOLO
import torch

class Detector:

    def __init__(self):

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # COCO model
        self.model = YOLO("yolo11s.pt")
        self.model.to(self.device)

        # Gun model
        self.gunModel = YOLO("yolo11gun.pt")
        self.gunModel.to(self.device)

        print(f"Running YOLO on {self.device}")

        self.globalClasses = {
            "backpack",
            "knife",
        }

        self.gunClasses = {
            "pistol"
        }

    def detect(self, frame, people = None):

        detections = []

        with torch.no_grad():

            # COCO detection
            cocoResults = self.model(
                frame,
                conf = 0.05,
                device = self.device,
                verbose = False
            )

            detections.extend(
                self.parseResults(
                    cocoResults,
                    self.globalClasses
                )
            )

            # Gun detection
            gunResults = self.gunModel(
                frame,
                #conf = 0.01,
                device = self.device,
                verbose = False
            )

            detections.extend(
                self.parseResults(
                    gunResults,
                    self.gunClasses
                )
            )

        return self.removeDuplicates(detections)

    def parseResults(self, results, allowedClasses):

        detections = []

        for result in results:

            for box in result.boxes:

                cls = int(box.cls[0])

                label = result.names[cls]

                if label not in allowedClasses:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                detections.append({
                    "label": label,
                    "confidence": float(box.conf[0]),
                    "bbox": (x1, y1, x2, y2)
                })

        return detections

    def removeDuplicates(self, detections):

        filtered = []

        for det in detections:

            duplicate = False

            for existing in filtered:

                if (
                    det["label"] == existing["label"]
                    and self.iou(det["bbox"], existing["bbox"]) > 0.5
                ):

                    duplicate = True

                    if det["confidence"] > existing["confidence"]:
                        existing.update(det)

                    break

            if not duplicate:
                filtered.append(det)

        return filtered

    def assignObjects(self, people, detections):

        for person in people:
            person.objects.clear()

        for obj in detections:

            ox1, oy1, ox2, oy2 = obj["bbox"]

            cx = (ox1 + ox2) / 2
            cy = (oy1 + oy2) / 2

            bestPerson = None
            bestDistance = float("inf")

            for person in people:

                for hand in ["left_wrist", "right_wrist"]:

                    wrist = person.landmarks[hand]

                    wx = wrist.x * 1280
                    wy = wrist.y * 720

                    d = ((cx - wx)**2 + (cy - wy)**2) ** 0.5

                    if d < bestDistance:
                        bestDistance = d
                        bestPerson = person

            if bestPerson is not None and bestDistance < 150:
                bestPerson.objects.append(obj)

    def iou(self, boxA, boxB):

        ax1, ay1, ax2, ay2 = boxA
        bx1, by1, bx2, by2 = boxB

        interX1 = max(ax1, bx1)
        interY1 = max(ay1, by1)
        interX2 = min(ax2, bx2)
        interY2 = min(ay2, by2)

        interArea = max(0, interX2 - interX1) * max(0, interY2 - interY1)

        areaA = (ax2 - ax1) * (ay2 - ay1)
        areaB = (bx2 - bx1) * (by2 - by1)

        union = areaA + areaB - interArea

        if union == 0:
            return 0

        return interArea / union