[README-ADMIN.txt](https://github.com/user-attachments/files/33286431/README-ADMIN.txt)
[README.txt](https://github.com/user-attachments/files/33284449/README.txt)SIEW WEBSITE DENGAN HALAMAN DATA DIRI

Buka index.html untuk melihat halaman data diri terlebih dahulu, kemudian dashboard.

Kolom:
- Nama atau inisial (wajib)
- Usia (wajib)
- Jenis kelamin (opsional)
- Kode peserta (opsional)
- Persetujuan penggunaan data sesi (wajib)

Identitas hanya disimpan di memori halaman selama sesi berjalan dan tidak dikirim ke ESP32 oleh prototipe ini. Jika ingin menyimpan identitas atau mengaitkannya dengan hasil pengukuran, perlu dirancang mekanisme penyimpanan dan perlindungan data secara terpisah.PANDUAN PANEL ADMIN SIEW
=======================

APA YANG ADA
- admin.html + admin.js + admin.css: login admin, ringkasan jumlah sesi, tabel riwayat, pencarian, ekspor CSV.
- firebase-config.js: tempat memasukkan konfigurasi aplikasi web Firebase.
- firebase-client.js: menghubungkan halaman peserta ke Firebase Authentication anonim dan Realtime Database.
- index.html + script.js: versi website peserta yang diintegrasikan untuk menyimpan sesi dan hasil pengukuran ke Firebase.
- style.css: desain website peserta.

PENTING
Panel admin tidak dapat melihat sesi nyata sampai Firebase dibuat/dikonfigurasi, Authentication dan Realtime Database aktif, Rules dipasang, dan file diunggah ke GitHub Pages. Jangan masukkan password admin atau service-account key ke file JavaScript.

LANGKAH A — FIREBASE
1. Masuk ke https://console.firebase.google.com/ dan buat/pilih proyek SIEW.
2. Jika akun sekolah tetap diblokir MFA, minta administrator Google Workspace membantu mengizinkan verifikasi 2 langkah atau gunakan akun Google yang memang diizinkan oleh kebijakan sekolah.
3. Project settings (ikon roda gigi) > General > Your apps > Add app > Web. Daftarkan aplikasi web dan salin nilai apiKey, authDomain, projectId, appId.
4. Buat Realtime Database. Pilih lokasi yang sesuai. Salin URL Database yang persis dari halaman Realtime Database.
5. Authentication > Sign-in method: aktifkan Email/Password dan Anonymous.
6. Authentication > Users > Add user. Buat email dan kata sandi khusus admin (jangan bagikan). Buka detail pengguna itu dan salin UID.
7. Isi firebase-config.js memakai konfigurasi dari langkah 3–4. databaseURL harus URL database yang tepat, misalnya https://NAMA-PROYEK-default-rtdb.asia-southeast1.firebasedatabase.app (gunakan URL yang diberikan console; contoh ini bukan URL milikmu).

LANGKAH B — REALTIME DATABASE RULES
Ganti ADMIN_UID_DI_SINI dengan UID admin dari Authentication > Users, lalu terapkan rules berikut di Realtime Database > Rules. Jangan menggunakan rules publik read/write.

{
  "rules": {
    "sessions": {
      ".read": "auth != null && auth.uid === 'ADMIN_UID_DI_SINI'",
      "$sessionId": {
        ".write": "auth != null && (auth.uid === 'ADMIN_UID_DI_SINI' || (!data.exists() && newData.child('ownerUid').val() === auth.uid) || (data.exists() && data.child('ownerUid').val() === auth.uid && newData.child('ownerUid').val() === auth.uid))"
      }
    }
  }
}

Rules ini membatasi pembacaan seluruh riwayat ke UID admin; sesi peserta dapat membuat/memperbarui sesi yang dimiliki UID autentikasi anonimnya. Uji aturan dengan hati-hati sebelum memakai data sungguhan.

LANGKAH C — UNGGAH KE GITHUB PAGES
1. Ekstrak ZIP ini.
2. Salin file berikut ke folder root repositori GitHub yang sama dengan index.html yang sekarang: index.html, script.js, style.css, firebase-config.js, firebase-client.js, admin.html, admin.js, admin.css.
3. Tambahkan README-ADMIN.txt bila perlu. Jangan menghapus folder/file lain yang masih digunakan proyek.
4. Commit/push perubahan dan tunggu GitHub Pages selesai memperbarui.
5. Website peserta: https://salatigamaruq-ui.github.io/siew/
   Panel admin: https://salatigamaruq-ui.github.io/siew/admin.html
6. Login admin menggunakan email/password yang dibuat di Firebase Authentication.

CARA KERJA DAN BATASAN
- Data baru mulai tersimpan online setelah konfigurasi Firebase lengkap dan versi website ini terunggah. Data lama yang sebelumnya hanya tersimpan di memori browser tidak bisa dipulihkan otomatis.
- Website harus dibuka melalui HTTPS/GitHub Pages agar modul Firebase berjalan. Akses ESP32 melalui IP lokal tetap memerlukan perangkat dan browser berada di jaringan yang sesuai.
- Data kesehatan/identitas sensitif: gunakan inisial/kode peserta, minta persetujuan, batasi akun admin, dan jangan memasukkan data nyata sebelum izin serta keamanan penyimpanan ditinjau oleh pembimbing/penanggung jawab.
- Hasil SIEW adalah prototipe skrining non-diagnostik, bukan diagnosis atau bukti infeksi.


Integrasi perangkat menggunakan:
- POST /set-suhu
- GET /status

Buka website dari ESP32 untuk menguji koneksi perangkat. Jika dibuka secara lokal, website tetap dapat dipreview tetapi komunikasi nyata membutuhkan endpoint ESP32 aktif.
