[README.txt](https://github.com/user-attachments/files/33284449/README.txt)SIEW WEBSITE DENGAN HALAMAN DATA DIRI

Buka index.html untuk melihat halaman data diri terlebih dahulu, kemudian dashboard.

Kolom:
- Nama atau inisial (wajib)
- Usia (wajib)
- Jenis kelamin (opsional)
- Kode peserta (opsional)
- Persetujuan penggunaan data sesi (wajib)

Identitas hanya disimpan di memori halaman selama sesi berjalan dan tidak dikirim ke ESP32 oleh prototipe ini. Jika ingin menyimpan identitas atau mengaitkannya dengan hasil pengukuran, perlu dirancang mekanisme penyimpanan dan perlindungan data secara terpisah.

Integrasi perangkat menggunakan:
- POST /set-suhu
- GET /status

Buka website dari ESP32 untuk menguji koneksi perangkat. Jika dibuka secara lokal, website tetap dapat dipreview tetapi komunikasi nyata membutuhkan endpoint ESP32 aktif.
