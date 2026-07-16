# File yang mengatur tampilan AI system di camera

import cv2
import numpy as np

class UI:

    def __init__(self):

        self.FONT = cv2.FONT_HERSHEY_SIMPLEX

    # Main Draw
    def drawPerson(self, frame, person, level):

        self.drawBbox(frame, person)

        self.drawInfo(frame, person, level)

        self.drawThreatBar(frame, person)

        return frame
    
    # Draw objects
    def drawObjects(self, frame, detections):

        for obj in detections:

            x1, y1, x2, y2 = obj["bbox"]

            label = obj["label"]

            confidence = obj["confidence"]

            color = (255, 0, 0)   # Biru untuk object detector

            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                color,
                2
            )

            cv2.putText(
                frame,
                f"{label} {confidence:.2f}",
                (x1, y1 - 10),
                self.FONT,
                0.6,
                color,
                2
            )

    # Bounding Box (Agar visualisasi rapi)
    def drawBbox(self, frame, person):

        if person.bbox is None:
            return

        x1, y1, x2, y2 = person.bbox

        color = self.getLevelColor(person.threatScore)

        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            color,
            2
        )

    # Text
    def drawInfo(self, frame, person, level):

        if person.bbox is None:
            return

        x1, y1, _, _ = person.bbox

        color = self.getLevelColor(person.threatScore)

        cv2.putText(
            frame,
            f"ID : {person.id}",
            (x1, y1 - 60),
            self.FONT,
            0.6,
            color,
            2
        )

        cv2.putText(
            frame,
            f"{person.action}",
            (x1, y1 - 40),
            self.FONT,
            0.6,
            color,
            2
        )

        cv2.putText(
            frame,
            f"Threat : {person.threatScore:.1f}",
            (x1, y1 - 20),
            self.FONT,
            0.6,
            color,
            2
        )

        cv2.putText(
            frame,
            f"{level}",
            (x1, y1),
            self.FONT,
            0.7,
            color,
            2
        )

    # Threat Bar
    def drawThreatBar(self, frame, person):

        if person.bbox is None:
            return

        x1, y1, _, _ = person.bbox

        width = 120
        height = 12

        percentage = min(person.threatScore / 100, 1)

        filled = int(width * percentage)

        color = self.getLevelColor(person.threatScore)

        cv2.rectangle(
            frame,
            (x1, y1 + 10),
            (x1 + width, y1 + 10 + height),
            (255, 255, 255),
            1
        )

        cv2.rectangle(
            frame,
            (x1, y1 + 10),
            (x1 + filled, y1 + 10 + height),
            color,
            -1
        )

    # Alarm
    def drawAlarm(self, frame):

        h, w = frame.shape[:2]

        cv2.rectangle(
            frame,
            (0, 0),
            (w, 60),
            (0, 0, 255),
            -1
        )

        cv2.putText(
            frame,
            "!!! HIGH THREAT DETECTED !!!",
            (20, 40),
            self.FONT,
            1,
            (255, 255, 255),
            3
        )

    # FPS
    def drawFPS(self, frame, fps):

        cv2.putText(
            frame,
            f"FPS : {fps:.1f}",
            (20, 30),
            self.FONT,
            0.7,
            (0, 255, 0),
            2
        )

    # Colors
    def getLevelColor(self, score):

        if score < 20:
            return (0, 255, 0)

        elif score < 40:
            return (0, 255, 255)

        elif score < 70:
            return (0, 165, 255)

        return (0, 0, 255)