from ultralytics import YOLO

model = YOLO(r"C:\GitHub\GarudaHacks7.0\ai\yolo11s.pt")

model.train(data = "dataset_custom.yaml", imgsz = 768, 
            batch = 8, epochs = 50, workers = 0, device = 0)