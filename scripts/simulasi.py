import cv2
import time
import random
import requests
import os

# Alamat API Next.js kamu
API_URL = "http://localhost:3000/api/logs"

# Folder tempat nyimpen foto (Sesuaikan path ini agar mengarah ke public/snapshots proyekmu)
SAVE_DIR = "../public/snapshots" 
os.makedirs(SAVE_DIR, exist_ok=True)

ANIMALS = ["Cat", "Dog", "Mouse", "Chicken"]

print("Membuka kamera laptop...")
cap = cv2.VideoCapture(0) # 0 = Kamera bawaan laptop

if not cap.isOpened():
    print("Error: Tidak dapat membuka kamera.")
    exit()

print("Kamera aktif! Simulasi deteksi berjalan...")
print("Tekan 'q' pada jendela kamera untuk berhenti.")

last_detect_time = time.time()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Munculkan jendela kamera
    cv2.imshow("Kamera Simulasi AniGuard", frame)

    current_time = time.time()
    
    # LOGIKA ACAK: Setiap 5 sampai 10 detik, pura-puranya ada hewan
    if current_time - last_detect_time > random.randint(5, 10):
        animal = random.choice(ANIMALS)
        confidence = round(random.uniform(0.75, 0.98), 2)
        
        # Jepret foto
        timestamp = int(time.time())
        filename = f"detect_{timestamp}.jpg"
        filepath = os.path.join(SAVE_DIR, filename)
        
        # Simpan foto ke folder public/snapshots/
        cv2.imwrite(filepath, frame)
        
        # Kirim data ke Next.js
        payload = {
            "animal": animal,
            "confidence": confidence,
            "imageurl": f"/snapshots/{filename}"
        }
        
        try:
            res = requests.post(API_URL, json=payload)
            if res.status_code == 200:
                print(f"[+] TERDETEKSI: {animal} ({confidence}). Foto: {filename}")
            else:
                print(f"[-] Gagal menyimpan ke database. Status: {res.status_code}")
        except Exception as e:
            print("[-] Gagal menghubungi website. Pastikan 'npm run dev' jalan!")

        last_detect_time = current_time

    # Tekan 'q' untuk keluar
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()