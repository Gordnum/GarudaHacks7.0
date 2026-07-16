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

            Action.FALLING: 5,

            Action.UNKNOWN: 0
        }

    def update(self, person, action):

        score = person.threatScore

        # Threat decay
        score -= self.DECAY

        # Action score
        score += self.ACTION_SCORE[action]

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