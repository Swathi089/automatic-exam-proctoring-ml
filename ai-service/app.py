from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

# ======================================================
# LOAD PRETRAINED YOLO MODEL
# ======================================================
# Automatically downloads on first run
model = YOLO("yolov8s.pt")

# ======================================================
# SETTINGS
# ======================================================
CONF_THRESHOLD = 0.45

MAX_WARNINGS = 5
warning_count = 0

# ======================================================
# LABELS
# ======================================================
PERSON_LABEL = "person"
PHONE_LABEL = "cell phone"

# ======================================================
# ROUTE
# ======================================================
@app.route("/detect", methods=["POST"])
def detect():

    global warning_count

    try:

        # ==================================================
        # CHECK IMAGE
        # ==================================================
        if "image" not in request.files:
            return jsonify({
                "success": False,
                "error": "No image uploaded"
            }), 400

        file = request.files["image"]

        img_bytes = file.read()

        npimg = np.frombuffer(img_bytes, np.uint8)

        frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({
                "success": False,
                "error": "Invalid image"
            }), 400

        # ==================================================
        # YOLO DETECTION
        # ==================================================
        results = model(
            frame,
            conf=CONF_THRESHOLD,
            verbose=False
        )

        # ==================================================
        # VARIABLES
        # ==================================================
        humans_detected = 0
        phone_detected = False

        detections = []

        # ==================================================
        # PROCESS DETECTIONS
        # ==================================================
        for r in results:

            for box in r.boxes:

                cls = int(box.cls[0])

                label = model.names[cls]

                confidence = float(box.conf[0])

                # Save detections
                detections.append({
                    "label": label,
                    "confidence": round(confidence, 2)
                })

                print("Detected:", label, confidence)

                # ==========================================
                # HUMAN DETECTION
                # ==========================================
                if (
                    label == PERSON_LABEL
                    and confidence > 0.55
                ):
                    humans_detected += 1

                # ==========================================
                # PHONE DETECTION
                # ==========================================
                if (
                    label == PHONE_LABEL
                    and confidence > 0.35
                ):
                    phone_detected = True

        # ==================================================
        # STATUS
        # ==================================================
        status = "NORMAL"

        popup_message = ""

        warning_message = ""

        terminate_exam = False

        # ==================================================
        # MULTIPLE HUMAN
        # ==================================================
        if humans_detected > 1:

            warning_count += 1

            status = "CHEATING - Multiple Humans"

            warning_message = "Multiple humans detected"

            popup_message = "Another person detected"

        # ==================================================
        # PHONE DETECTION
        # ==================================================
        if phone_detected:

            warning_count += 1

            status = "CHEATING - Phone Detected"

            warning_message = "Phone detected"

            popup_message = "Mobile phone detected"

        # ==================================================
        # TERMINATE
        # ==================================================
        if warning_count >= MAX_WARNINGS:

            terminate_exam = True

            popup_message = "Exam terminated"

        # ==================================================
        # DEBUG
        # ==================================================
        print("===================================")
        print("Humans:", humans_detected)
        print("Phone:", phone_detected)
        print("Warnings:", warning_count)
        print("===================================")

        # ==================================================
        # RESPONSE
        # ==================================================
        return jsonify({

            "success": True,

            "status": status,

            "warning_count": warning_count,

            "warning_message": warning_message,

            "popup_message": popup_message,

            "terminate_exam": terminate_exam,

            "humans_detected": humans_detected,

            "phone_detected": phone_detected,

            "detections": detections

        })

    except Exception as e:

        print("ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ======================================================
# RUN
# ======================================================
if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )