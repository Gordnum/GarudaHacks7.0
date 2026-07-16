# File untuk skeleton person

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from person import Person

class PosesEstimator:

    # Skeleton di hardcode karena mediapipe solutions tidak dapat digunakan untuk versi 0.10.21 dan keatas
    POSE_CONNECTIONS = [
        (0, 1), (1, 2), (2, 3), (3, 7), (0, 4), (4, 5), (5, 6), (6, 8),
        (9, 10), (11, 12), (11, 13), (13, 15), (15, 17), (15, 19), (15, 21),
        (17, 19), (12, 14), (14, 16), (16, 18), (16, 20), (16, 22), (18, 20),
        (11, 23), (12, 24), (23, 24), (23, 25), (24, 26), (25, 27), (26, 28),
        (27, 29), (28, 30), (29, 31), (30, 32), (27, 31), (28, 32)
    ]

    def __init__(self, model_path = 'pose_landmarker.task', num_poses = 2):
        baseOptions = python.BaseOptions(model_asset_path = model_path)
        options = vision.PoseLandmarkerOptions(
            base_options = baseOptions,
            running_mode = vision.RunningMode.VIDEO,
            num_poses = num_poses,
            min_pose_detection_confidence = 0.5,
            min_tracking_confidence = 0.5
        )
        
        self.landmarker = vision.PoseLandmarker.create_from_options(options)

    def detect(self, frame, timestamp_ms):
        mpImage = mp.Image(
            image_format = mp.ImageFormat.SRGB, 
            data = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        )
        
        detectionResult = self.landmarker.detect_for_video(mpImage, timestamp_ms)
        
        people = []

        if detectionResult.pose_landmarks:

            h, w = frame.shape[:2]

            for idx, person_landmarks in enumerate(detectionResult.pose_landmarks):

                # Bounding Box
                xs = [lm.x for lm in person_landmarks]
                ys = [lm.y for lm in person_landmarks]

                x1 = int(min(xs) * w)
                y1 = int(min(ys) * h)

                x2 = int(max(xs) * w)
                y2 = int(max(ys) * h)

                bbox = (x1, y1, x2, y2)

                # Draw Skeleton
                for start_idx, end_idx in self.POSE_CONNECTIONS:

                    start = person_landmarks[start_idx]
                    end = person_landmarks[end_idx]

                    cv2.line(
                        frame,
                        (int(start.x * w), int(start.y * h)),
                        (int(end.x * w), int(end.y * h)),
                        (0, 255, 0),
                        2
                    )

                # Draw Joints
                for landmark in person_landmarks:

                    cv2.circle(
                        frame,
                        (int(landmark.x * w), int(landmark.y * h)),
                        5,
                        (0, 0, 255),
                        -1
                    )
                
                # Create Person
                person = Person(
                    id = idx,
                    rawLandmarks = person_landmarks,
                    bbox = bbox
                )

                people.append(person)

        return frame, people

    def close(self):
        # To clean used resources
        self.landmarker.close()