# Helper function untuk semua file

import math

class GeometryUtils:

    @staticmethod
    def distance(p1, p2):
        # Euclidean distance antara dua landmark.

        dx = p1.x - p2.x
        dy = p1.y - p2.y

        return math.sqrt(dx * dx + dy * dy)

    @staticmethod
    def midpoint(p1, p2):
        # Titik tengah dua landmark.

        return (
            (p1.x + p2.x) / 2,
            (p1.y + p2.y) / 2
        )

    @staticmethod
    def angle(a, b, c):
        # Menghitung sudut ABC dalam derajat.

        ba = (a.x - b.x, a.y - b.y)
        bc = (c.x - b.x, c.y - b.y)

        dot = ba[0] * bc[0] + ba[1] * bc[1]

        mag_ba = math.sqrt(ba[0] ** 2 + ba[1] ** 2)
        mag_bc = math.sqrt(bc[0] ** 2 + bc[1] ** 2)

        if mag_ba == 0 or mag_bc == 0:
            return 0

        cosine = dot / (mag_ba * mag_bc)

        cosine = max(-1, min(1, cosine))

        return math.degrees(math.acos(cosine))

    @staticmethod
    def velocity(current, previous):
        # Menghitung perpindahan landmark

        dx = current.x - previous.x
        dy = current.y - previous.y

        return math.sqrt(dx * dx + dy * dy)
    
    @staticmethod
    def averageVelocity(history, landmark_name):

        if len(history) < 2:
            return 0

        total = 0

        for i in range(1, len(history)):

            current = history[i][landmark_name]
            previous = history[i-1][landmark_name]

            total += GeometryUtils.distance(current, previous)

        return total / (len(history)-1)

    @staticmethod
    def isAbove(p1, p2):
        # Apakah p1 berada di atas p2?

        return p1.y < p2.y

    @staticmethod
    def isBelow(p1, p2):

        return p1.y > p2.y

    @staticmethod
    def isLeftOf(p1, p2):

        return p1.x < p2.x

    @staticmethod
    def isRightOf(p1, p2):

        return p1.x > p2.x

    @staticmethod
    def bodyCenter(person):
        # Titik tengah antara kedua pinggul.

        left = person.landmarks["left_hip"]
        right = person.landmarks["right_hip"]

        return GeometryUtils.midpoint(left, right)
    
    @staticmethod
    def bodySize(person):
        # Menghitung ukuran tubuh sebagai referensi normalisasi. Menggunakan jarak bahu ke pinggul.

        shoulder = GeometryUtils.shoulderCenter(person)
        hip = GeometryUtils.bodyCenter(person)

        dx = shoulder[0] - hip[0]
        dy = shoulder[1] - hip[1]

        return math.sqrt(dx * dx + dy * dy)

    @staticmethod
    def shoulderCenter(person):
        # Titik tengah antara kedua bahu.

        left = person.landmarks["left_shoulder"]
        right = person.landmarks["right_shoulder"]

        return GeometryUtils.midpoint(left, right)
    
    @staticmethod
    def armExtension(previous_shoulder,
                    previous_wrist,
                    current_shoulder,
                    current_wrist):

        previous = GeometryUtils.distance(
            previous_shoulder,
            previous_wrist
        )

        current = GeometryUtils.distance(
            current_shoulder,
            current_wrist
        )

        return current - previous