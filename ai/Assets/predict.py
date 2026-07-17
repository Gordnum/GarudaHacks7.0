from ultralytics import YOLO

model = YOLO(r"C:\GitHub\GarudaHacks7.0\ai\yolo11gun2.pt")

model.predict(source = "2.jpg", show = True, save = True)