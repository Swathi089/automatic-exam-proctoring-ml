from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)

# ================= LOAD MODEL =================
model = YOLO("yolov8n.pt")

# ================= SETTINGS ===================
CONF_THRESHOLD = 0.35
MAX_WARNINGS = 5

warning_count = 0

# COCO labels
PHONE_LABELS = ["cell phone"]
PERSON_LABELS = ["person"]

# ================= CORS =======================
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response


# ================= DETECT API =================
@app.route("/detect", methods=["POST", "OPTIONS"])
def detect():

    global warning_count

    try:

        if request.method == "OPTIONS":
            return ("", 204)

        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]

        img_bytes = file.read()

        npimg = np.frombuffer(img_bytes, np.uint8)

        frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Invalid image"}), 400

        # ================= YOLO =================
        results = model(
            frame,
            conf=CONF_THRESHOLD,
            imgsz=640,
            verbose=False
        )

        detections = []

        human_count = 0
        phone_detected = False

        for r in results:

            for box in r.boxes:

                cls = int(box.cls[0])

                label = model.names[cls]

                confidence = float(box.conf[0])

                detections.append({
                    "label": label,
                    "confidence": round(confidence, 2)
                })

                # PERSON
                if label in PERSON_LABELS:
                    human_count += 1

                # PHONE
                if label in PHONE_LABELS:
                    phone_detected = True

        # ================= STATUS =================
        status = "NORMAL"

        popup_message = ""

        terminate_exam = False

        # ===== MULTIPLE HUMAN =====
        if human_count > 1:

            warning_count += 1

            status = "CHEATING - Multiple Humans"

            popup_message = "Another person detected"

        # ===== PHONE =====
        elif phone_detected:

            warning_count += 1

            status = "CHEATING - Phone Detected"

            popup_message = "Mobile phone detected"

        # ===== TERMINATE =====
        if warning_count >= MAX_WARNINGS:

            terminate_exam = True

            popup_message = "Exam terminated due to malpractice"

        # ================= RESPONSE =================
        return jsonify({

            "status": status,

            "popup_message": popup_message,

            "warning_count": warning_count,

            "terminate_exam": terminate_exam,

            "humans_detected": human_count,

            "phone_detected": phone_detected,

            "detections": detections

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ================= RUN ========================
if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )