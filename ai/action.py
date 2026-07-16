# File untuk recognize aksi yang dilakukan person

from enum import Enum
from geometry_utils import GeometryUtils

class Action(Enum):
    UNKNOWN = "Unknown"
    STANDING = "Standing"
    WALKING = "Walking"
    RUNNING = "Running"
    HANDS_UP = "Hands Up"
    PUNCHING = "Punching"
    FALLING = "Falling"

class ActionRecognizer:

    def __init__(self):

        self.RUN_SPEED = 0.030

        self.PUNCH_SPEED = 0.1

    def recognize(self, person):

        if self.isFalling(person):
            action = Action.FALLING
        elif self.isPunching(person):
            action = Action.PUNCHING
        elif self.isRunning(person):
            action = Action.RUNNING
        elif self.isWalking(person):
            action = Action.WALKING
        elif self.isHandsUp(person):
            action = Action.HANDS_UP
        else:
            action = Action.STANDING

        person.updateAction(action.value)

        return action
    
    def isHandsUp(self, person):

        left_wrist = person.landmarks["left_wrist"]

        right_wrist = person.landmarks["right_wrist"]

        left_shoulder = person.landmarks["left_shoulder"]

        right_shoulder = person.landmarks["right_shoulder"]

        return (
            GeometryUtils.isAbove(left_wrist, left_shoulder)
            and
            GeometryUtils.isAbove(right_wrist, right_shoulder)
        )
    
    def isWalking(self, person):

        if len(person.poseHistory) < 2:
            return False

        current = person.landmarks["left_hip"]
        previous = person.previousLandmarks["left_hip"]

        hipSpeed = GeometryUtils.averageVelocity(person.poseHistory, "left_hip")
        
        ankleSpeed = (
            GeometryUtils.averageVelocity(person.poseHistory, "left_ankle") +
            GeometryUtils.averageVelocity(person.poseHistory, "right_ankle")
        ) / 2

        speed = (
            hipSpeed * 0.5 +
            ankleSpeed
        )

        return 0.010 < speed < self.RUN_SPEED
    
    def isRunning(self, person):

        if len(person.poseHistory) < 2:
            return False

        current = person.landmarks["left_hip"]
        previous = person.previousLandmarks["left_hip"]

        speed = GeometryUtils.averageVelocity(person.poseHistory, "left_hip")

        return speed > self.RUN_SPEED
    
    def isPunching(self, person):

        if len(person.poseHistory) < 2:
            return False

        current = person.poseHistory[-1]
        previous = person.poseHistory[-2]

        wristSpeed = GeometryUtils.distance(
            current["right_wrist"],
            previous["right_wrist"]
        )

        extension = GeometryUtils.armExtension(
            previous["right_shoulder"],
            previous["right_wrist"],
            current["right_shoulder"],
            current["right_wrist"]
        )

        angle = GeometryUtils.angle(
            current["right_shoulder"],
            current["right_elbow"],
            current["right_wrist"]
        )

        return (
            wristSpeed > self.PUNCH_SPEED
            and angle > 150
            and extension > 0.02
        )
    
    def isFalling(self, person):

        left_shoulder = person.landmarks["left_shoulder"]
        left_hip = person.landmarks["left_hip"]

        vertical = abs(left_shoulder.y - left_hip.y)

        return vertical < 0.08