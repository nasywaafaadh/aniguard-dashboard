from flask import Flask, Response
import cv2
import time
import random
import requests
import os
import threading

app = Flask(__name__)
# Folder tempat nyimpen foto (Arahkan ke public/snapshots)
SAVE_DIR = r"C:\Users\Nasywa\Documents\Projects\aniguard-dashboard-web\public\snapshots"
os.makedirs(SAVE_DIR, exist_ok=True)

API_URL = "http://localhost:3000/api/logs"
ANIMALS = ["Cat", "Dog", "Mouse", "Chicken"]

camera = cv2.VideoCapture(0)
# Optimasi resolusi agar tidak lemot lewat tunnel
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)

# Variabel global untuk menyimpan frame terakhir
last_frame = None

def detection_logic():
    global last_frame
    last_detect_time = time.time()
    
    while True:
        success, frame = camera.read()
        if not success: continue
        last_frame = frame.copy() # Simpan untuk streaming

        current_time = time.time()
        # LOGIKA DETEKSI ACAK
        if current_time - last_detect_time > random.randint(5, 10):
            animal = random.choice(ANIMALS)
            confidence = round(random.uniform(0.75, 0.98), 2)
            
            timestamp = int(time.time())
            filename = f"detect_{timestamp}.jpg"
            filepath = os.path.join(SAVE_DIR, filename)
            
            # Simpan foto snapshot
            cv2.imwrite(filepath, frame)
            
            # Kirim log ke database Next.js
            payload = {
                "animal": animal,
                "confidence": confidence,
                "imageurl": f"/snapshots/{filename}"
            }
            try:
                requests.post(API_URL, json=payload)
                print(f"[+] TERDETEKSI: {animal}. Foto: {filename}")
            except:
                print("[-] Gagal kirim log. Cek npm run dev!")
                
            last_detect_time = current_time
        time.sleep(0.05)

def gen_frames():  
    while True:
        if last_frame is None: continue
        # Kompres gambar agar lancar di internet
        ret, buffer = cv2.imencode('.jpg', last_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 40])
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        time.sleep(0.07) # Batasi FPS

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    # Jalankan logika deteksi di background thread
    t = threading.Thread(target=detection_logic)
    t.daemon = True
    t.start()
    # Jalankan Flask untuk streaming video
    app.run(host='0.0.0.0', port=5000, threaded=True)