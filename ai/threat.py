# File untuk memberikan skor threat

from action import Action

class ThreatEngine:

    def __init__(self):

        self.MAX_SCORE = 100

        self.DECAY = 0.5

        self.ACTION_SCORE = {

            Action.STANDING: 0,

            Action.WALKING: 0.1,

            Action.RUNNING: 2,

            Action.HANDS_UP: -5,

            Action.PUNCHING: 25,

            Action.FALLING: -10,

            Action.UNKNOWN: 0
        }

        self.OBJECT_SCORES = {
            "knife": 50,
            "backpack": 20,
            "pistol" : 90
        }

    def update(self, person, action):

        # Hapus benda yang keluar/tidak terdetect kamera
        currentLabels = {obj["label"] for obj in person.objects}

        person.detectedObjects.intersection_update(currentLabels)

        score = person.threatScore

        # Threat decay
        score -= self.DECAY

        # Action score
        score += self.ACTION_SCORE[action]

        # Object score
        labels = []

        for obj in person.objects:

            label = obj["label"]

            labels.append(label)

            if label not in person.detectedObjects:

                score += self.OBJECT_SCORES.get(label, 0)

                person.detectedObjects.add(label)

        # Combination rules
        if action == Action.PUNCHING and "knife" in labels:
            score += 30

        if action == Action.PUNCHING and "backpack" in labels:
            score += 30

        if action == Action.PUNCHING and "pistol" in labels:
            score += 30

        if action == Action.RUNNING and "knife" in labels:
            score += 20

        # Clamping
        score = max(0, min(score, self.MAX_SCORE))

        person.updateThreat(score)

        return score

    def level(self, score):

        if score < 20:
            return "LOW"
        elif score < 50:
            return "MEDIUM"
        elif score < 80:
            return "HIGH"

        return "CRITICAL"