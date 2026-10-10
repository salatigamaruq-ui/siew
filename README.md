[README.txt](https://github.com/user-attachments/files/33283330/README.txt)SIEW WEBSITE — PROTOTIPE ANTARMUKA

Isi folder:
- index.html: halaman dashboard
- style.css: tampilan responsif
- script.js: input suhu, mode demo, polling status ESP32

CARA MENJALANKAN DEMO
1. Ekstrak ZIP.
2. Buka index.html di browser.
3. Tekan "Coba demo" untuk melihat contoh tampilan. Data demo bukan data sensor nyata.

KONTRAK API YANG DISIAPKAN UNTUK INTEGRASI ESP32
1. POST /set-suhu
   Request JSON: {"suhu": 36.8}
   ESP32 perlu membaca nilai suhu manual dari body JSON dan menyimpannya untuk evaluasi.

2. GET /status
   Response JSON yang disarankan:
   {
     "bpm": 80,
     "spo2": 98,
     "napas": 16,
     "suhu": 36.8,
     "statusSIEW": "DALAM RENTANG ACUAN"
   }

PENTING
- Endpoint tersebut adalah kontrak yang disiapkan di website, bukan endpoint yang otomatis sudah tersedia di sketch ESP32.
- Agar terhubung, sketch ESP32 harus membuat kedua endpoint tersebut.
- Jika halaman dibuka dari komputer dan ESP32 berada di jaringan lain, pastikan keduanya berada pada jaringan yang dapat saling menjangkau.
- Jika browser memblokir CORS, solusi termudah untuk setup akhir adalah menyajikan halaman website langsung dari WebServer ESP32 atau mengatur header CORS pada ESP32.
- Label status hanyalah contoh aturan prototipe dan bukan diagnosis medis.
