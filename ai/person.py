# FIle untuk menampung "object" person, sebuah person ada data apa saja

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from collections import deque

LANDMARK_NAMES = {
    0: "nose",
    1: "left_eye_inner",
    2: "left_eye",
    3: "left_eye_outer",
    4: "right_eye_inner",
    5: "right_eye",
    6: "right_eye_outer",
    7: "left_ear",
    8: "right_ear",
    9: "mouth_left",
    10: "mouth_right",
    11: "left_shoulder",
    12: "right_shoulder",
    13: "left_elbow",
    14: "right_elbow",
    15: "left_wrist",
    16: "right_wrist",
    17: "left_pinky",
    18: "right_pinky",
    19: "left_index",
    20: "right_index",
    21: "left_thumb",
    22: "right_thumb",
    23: "left_hip",
    24: "right_hip",
    25: "left_knee",
    26: "right_knee",
    27: "left_ankle",
    28: "right_ankle",
    29: "left_heel",
    30: "right_heel",
    31: "left_foot_index",
    32: "right_foot_index",
}

@dataclass
class Person:

    id: int

    # Landmark dari MediaPipe
    rawLandmarks: List

    # Bounding Box (akan dipakai untuk tracking nanti)
    bbox: Optional[tuple] = None

    # Action saat ini
    action: str = "Unknown"

    # Threat score
    threatScore: float = 0.0

    # Riwayat action
    actionHistory: List[str] = field(default_factory=list)

    # Menyimpan landmark frame sebelumnya
    previousLandmarks: Optional[List] = None

    # Kecepatan tubuh
    velocity: Dict[str, float] = field(default_factory=dict)

    # Dictionary hasil mapping
    landmarks: Dict[str, object] = field(init=False)

    poseHistory: deque = field(default_factory=lambda: deque(maxlen=5))

    objects: List[dict] = field(default_factory=list)

    def __post_init__(self):
        """
        Otomatis dipanggil setelah dataclass dibuat.
        Mengubah List -> Dictionary.
        """
        self.landmarks = {
            LANDMARK_NAMES[i]: landmark
            for i, landmark in enumerate(self.rawLandmarks)
        }
    
    def addPose(self):
        self.poseHistory.append(self.landmarks.copy())

    def updateAction(self, action: str):
        self.action = action
        self.actionHistory.append(action)

        # Simpan 30 action terakhir
        if len(self.actionHistory) > 30:
            self.actionHistory.pop(0)

    def updateThreat(self, score: float):
        self.threatScore = max(0.0, score)

    def savePreviousPose(self):
        self.previousLandmarks = self.landmarks.copy()

    def getLandmark(self, index: int):
        return self.landmarks[index]
    
    def hasLandmark(self, name: str):
        return name in self.landmarks
    
    def getCenter(self):
        left_hip = self.landmarks["left_hip"]
        right_hip = self.landmarks["right_hip"]

        return (
            (left_hip.x + right_hip.x) / 2,
            (left_hip.y + right_hip.y) / 2
        )
    
    def copyStateFrom(self, other):
        self.previousLandmarks = other.landmarks.copy()
        self.actionHistory = other.actionHistory.copy()
        self.threatScore = other.threatScore
        self.velocity = other.velocity.copy()
        self.objects = other.objects.copy()