import os
import time
import random
from supabase import create_client, Client

# --- KONFIGURASI ---
# 1. Ganti dengan URL Project kamu (dari Data API)
URL = "https://vgppusupjivtlttrcmtw.supabase.co" 

# 2. Ganti dengan SERVICE ROLE KEY (yang ada tulisan 'secret')
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZncHB1c3Vwaml2dGx0dHJjbXR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE2Mzg3NSwiZXhwIjoyMDgyNzM5ODc1fQ.TQXlup9ZCwRk6FHjWIY080IOxFleLtzJs1ovPkVLjNE" 

# Setup Client Supabase
supabase: Client = create_client(URL, KEY)

# Data simulasi
hewan_list = ["Cat", "Dog", "Mouse", "Chicken"]

def kirim_data_palsu():
    print("🤖 Memulai simulasi deteksi...")

    # 1. PILIH DATA ACAK
    hewan = random.choice(hewan_list)
    confidence = round(random.uniform(0.70, 0.99), 2) # Angka acak 0.70 - 0.99
    nama_file_upload = f"deteksi_{int(time.time())}.jpg" # Nama file unik pakai waktu (timestamp)

    print(f"📸 Terdeteksi: {hewan} ({confidence*100}%)")

    # 2. UPLOAD FOTO KE STORAGE (BUCKET 'snapshots')
    # Pastikan kamu punya file 'test.jpg' di folder yang sama dengan script ini
    try:
        with open("test.jpg", "rb") as f:
            supabase.storage.from_("snapshots").upload(
                file=f,
                path=nama_file_upload,
                file_options={"content-type": "image/jpeg"}
            )
        print("✅ Foto berhasil di-upload ke Storage")
    except Exception as e:
        print(f"❌ Gagal upload foto: {e}")
        return

    # 3. DAPATKAN PUBLIC URL FOTO TADI
    # Ini link yang bisa dibuka di browser
    file_url = supabase.storage.from_("snapshots").get_public_url(nama_file_upload)
    print(f"🔗 Link Foto: {file_url}")

    # 4. SIMPAN DATA TEKS KE TABEL 'detections'
    data_to_insert = {
        "animal": hewan,
        #"confidence": confidence,
        "imageurl": file_url,
        # created_at akan otomatis diisi database
    }

    try:
        response = supabase.table("detections").insert(data_to_insert).execute()
        print("✅ Data berhasil disimpan ke Database!")
        print("-" * 30)
    except Exception as e:
        print(f"❌ Gagal simpan ke database: {e}")

# --- JALANKAN ---
if __name__ == "__main__":
    # Kirim 1 data saja untuk tes
    kirim_data_palsu()
    
    # Kalau mau loop terus menerus (biar kayak real-time), uncomment bawah ini:
    # while True:
    #     kirim_data_palsu()
    #     time.sleep(5) # Jeda 5 detik