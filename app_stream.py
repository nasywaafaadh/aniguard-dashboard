from flask import Flask, Response
from ultralytics import YOLO
import cv2
import time
import requests
import os
import threading

try:
    import Jetson.GPIO as GPIO
    IS_JETSON = True
except ImportError:
    IS_JETSON = False

app = Flask(__name__)

# PENGATURAN FOLDER & API
SAVE_DIR = r"C:\Users\Nasywa\Documents\Projects\aniguard-dashboard-web\public\snapshots"
os.makedirs(SAVE_DIR, exist_ok=True)

API_URL = "http://localhost:3000/api/logs"
WATER_API_URL = "http://localhost:3000/api/water" # Loket untuk sensor air
TARGET_ANIMALS = ["Cat", "Dog", "Mouse", "Chicken"]
WEIGHTS_PATH = r"C:\Users\Nasywa\Projects\yolo\yolo11n.pt"

# PENGATURAN TELEGRAM
TELEGRAM_TOKEN = "8597421324:AAGfS5YHWWLBsbQ3vknmwmRmWbuAJnZFiwY"
TELEGRAM_CHAT_ID = "-5115952817"

# FUNGSI KIRIM TELEGRAM
def send_telegram(pesan):
    if TELEGRAM_TOKEN == "8597421324:AAGfS5YHWWLBsbQ3vknmwmRmWbuAJnZFiwY":
        return 
        
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": pesan,
        "parse_mode": "Markdown" 
    }
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        print(f"[-] Gagal kirim Telegram: {e}")

# SETUP PIN SENSOR AIR 
WATER_PIN = 18 

if IS_JETSON:
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(WATER_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# MODEL YOLO
print("Memuat model YOLO...")
model = YOLO(WEIGHTS_PATH)
print("Model berhasil dimuat!")

camera = cv2.VideoCapture(0)
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)
last_frame = None

# FUNGSI MEMBACA SENSOR AIR (Jalan di Background)
def water_level_logic():
    if not IS_JETSON:
        return 

    last_status = None
    
    while True:
        pin_value = GPIO.input(WATER_PIN)
        
        # Jika pin LOW (air habis/pelampung turun), status = low
        current_status = "safe" if pin_value == GPIO.HIGH else "low"

        # agar tidak spam API terus-terusan
        if current_status != last_status:
            payload = {"status": current_status}
            try:
                requests.post(WATER_API_URL, json=payload)
                print(f"[+] SENSOR AIR: Level air saat ini {current_status.upper()}")

                if current_status == "low":
                    send_telegram("⚠️ *PERINGATAN* ⚠️\n\nAir di tangki *HABIS*! Segera isi ulang !")

                last_status = current_status
            except:
                pass
        
        time.sleep(3) # cek sensor setiap 3 detik

# FUNGSI DETEKSI YOLO 
def detection_logic():
    global last_frame
    last_detect_time = 0
    cooldown = 5 
    
    while True:
        success, frame = camera.read()
        if not success: continue

        results = model(frame, verbose=False, conf=0.5) 
        annotated_frame = results[0].plot() 
        last_frame = annotated_frame.copy() 

        current_time = time.time()
        
        if current_time - last_detect_time > cooldown:
            best_animal = None
            best_conf = 0.0
            
            for box in results[0].boxes:
                cls_id = int(box.cls[0])
                label = model.names[cls_id]
                conf = float(box.conf[0])
                
                display_label = label.capitalize()
                if display_label.lower() == 'bird':
                    display_label = 'Chicken'
                
                if display_label in TARGET_ANIMALS and conf > best_conf:
                    best_conf = conf
                    best_animal = display_label
            
            if best_animal is not None:
                timestamp = int(current_time)
                filename = f"detect_{timestamp}.jpg"
                filepath = os.path.join(SAVE_DIR, filename)
                
                cv2.imwrite(filepath, annotated_frame)
                
                payload = {
                    "animal": best_animal,
                    "confidence": round(best_conf, 2),
                    "imageurl": f"/snapshots/{filename}"
                }
                
                try:
                    requests.post(API_URL, json=payload)
                    print(f"[+] TERDETEKSI: {best_animal} ({round(best_conf, 2)})")

                    pesan_tg = f"⚠️ *HEWAN TERDETEKSI* ⚠️\n\n🐾 Jenis: *{best_animal}*\n🕒 Waktu: {time.strftime('%H:%M:%S')}\n"
                    send_telegram(pesan_tg)
                except:
                    pass
                last_detect_time = current_time 
                
        time.sleep(0.05)

# VIDEO STREAMING
def gen_frames():  
    while True:
        if last_frame is None: continue
        ret, buffer = cv2.imencode('.jpg', last_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 40])
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        time.sleep(0.07)

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    # Jalankan YOLO di thread pertama
    t_yolo = threading.Thread(target=detection_logic)
    t_yolo.daemon = True
    t_yolo.start()
    
    # Jalankan Sensor Air di thread kedua
    t_water = threading.Thread(target=water_level_logic)
    t_water.daemon = True
    t_water.start()
    
    # Jalankan Flask Server
    app.run(host='0.0.0.0', port=5000, threaded=True)