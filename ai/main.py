import cv2

# untuk buka window
cap = cv2.VideoCapture(0)

# Set resolusi window
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

if not cap.isOpened():
    print("Camera tidak bisa dibuka")
    exit()

while True:
    ret, frame = cap.read()

    if not ret:
        print("Frame gagal")
        break

    cv2.imshow("Camera", frame)

    key = cv2.waitKey(1)

    
    if key == 27:
        break

cap.release()
cv2.destroyAllWindows()