#File untuk mengatur orang-orang yang terdeteksi dalam kamera

from person import Person
from geometry_utils import GeometryUtils

class PersonManager:

    def __init__(self):

        self.people = {}

        self.nextID = 0

        # Maksimum jarak agar dianggap orang yang sama
        self.MATCH_THRESHOLD = 0.08


    def update(self, detected_people):

        updatedPeople = {}

        for detected in detected_people:

            matchedID = self._find_match(detected)

            if matchedID is None:

                detected.id = self.nextID

                self.nextID += 1

            else:

                oldPerson = self.people[matchedID]

                detected.id = matchedID

                detected.copyStateFrom(oldPerson)

                detected.poseHistory = oldPerson.poseHistory.copy()
                
            detected.addPose()

            updatedPeople[detected.id] = detected

        self.people = updatedPeople

        return list(self.people.values())


    def _find_match(self, detected):

        if not self.people:
            return None

        bestID = None
        bestDistance = 999

        for pid, person in self.people.items():

            d = self._person_distance(person, detected)

            if d < bestDistance:

                bestDistance = d
                bestID = pid

        if bestDistance < self.MATCH_THRESHOLD:
            return bestID

        return None


    def _person_distance(self, p1, p2):

        c1 = p1.getCenter()
        c2 = p2.getCenter()

        dx = c1[0] - c2[0]
        dy = c1[1] - c2[1]

        return (dx * dx + dy * dy) ** 0.5