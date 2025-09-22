Ringkasan Aplikasi: Dasbor Agro-Demoplot
1. Deskripsi Umum
AgroDemoplot adalah sebuah aplikasi dasbor web modern yang dirancang untuk memonitor demoplot (lahan percontohan) kebun kopi secara komprehensif. Aplikasi ini bertujuan untuk memberikan informasi vital kepada petani dan pemangku kepentingan mengenai kondisi lahan, data petani, iklim, serta potensi ancaman seperti hama dan penyakit. Dilengkapi dengan integrasi AI, dasbor ini tidak hanya menyajikan data mentah, tetapi juga memberikan rekomendasi tindakan yang cerdas.

2. Tumpukan Teknologi (Tech Stack)
Aplikasi ini dibangun menggunakan serangkaian teknologi modern untuk memastikan performa, skalabilitas, dan pengalaman pengguna yang unggul:

Framework: Next.js 15 (App Router)

Bahasa: TypeScript

Autentikasi: Clerk

Database: Supabase

Styling: Tailwind CSS v4

Komponen UI: shadcn/ui

Integrasi AI: Vercel AI SDK

Sistem Tema: next-themes

library Peta: React Leaflet

3. Fitur Utama
Dasbor ini dirancang dengan beberapa kartu (cards) informasi yang intuitif dan fungsional:

a. Peta Lahan & Citra Satelit
Visualisasi Geospasial: Menampilkan poligon atau batas area lahan kebun kopi.

Citra Udara: Mengintegrasikan foto udara atau citra satelit terbaru untuk pemantauan visual kondisi tanaman dari atas.

b. Data Petani
Profil Lengkap: Menyajikan informasi detail mengenai petani yang bertanggung jawab atas plot, termasuk:

Foto Petani

Nama Lengkap

Jenis Kelamin

Nomor HP

Alamat

Afiliasi Kelompok Tani

c. Data Klimatologi
Monitoring Cuaca: Memberikan data cuaca real-time atau historis di sekitar lokasi lahan, seperti:

Curah Hujan (mm)

Suhu Rata-rata (°C)

Kelembapan (%)

Kecepatan Angin (km/jam)

d. Monitoring Hama, Penyakit, & Gulma
Sistem Peringatan Dini: Menampilkan daftar hama, penyakit, atau gulma yang terdeteksi di lahan serta gambar visual dari HPG.

Indikator Status: Setiap item memiliki label status visual (misalnya, Tidak Parah, Sedang, Parah, Sangat Parah) untuk memudahkan prioritas penanganan.

e. Rekomendasi AI
Asisten Cerdas: Sebuah kartu khusus yang ditenagai oleh AI untuk memberikan saran dan rekomendasi praktis berdasarkan analisis data klimatologi dan temuan hama/penyakit.

f. Fungsionalitas Tambahan
Pemilih Plot: Dropdown interaktif untuk beralih dan melihat data dari plot yang berbeda.

Mode Gelap/Terang: Tombol untuk mengubah tema tampilan demi kenyamanan visual pengguna.

Mode Bahasa: Tombol untuk mengubah bahasa yang digunakan pengguna (ID/EN).

4. Struktur Halaman Dashboard
Dashboard AgroDemoplot memiliki struktur sebagai berikut:

a. Header
- Tombol menu untuk navigasi mobile
- Judul halaman
- Pemilih plot
- Tombol toggle tema
- Tombol toggle bahasa
- User button untuk manajemen akun

b. Sidebar Navigasi
- Menu navigasi dengan ikon untuk berpindah antar halaman
- Item menu mencakup: Dashboard, Peta Lahan, Data Petani, Data Iklim, Monitoring Hama, Rekomendasi AI, dan Analitik

c. Konten Utama
Dashboard menampilkan grid layout dengan dua kolom pada layar besar yang berisi:

Kolom Kiri:
- Kartu Data Petani
- Kartu Peta Lahan (dengan button untuk menampilkan image foto udara)

Kolom Kanan:
- Kartu Data Klimatologi
- Kartu Monitoring Hama, Penyakit & Gulma
- Kartu Rekomendasi AI

5. Routing
Aplikasi menggunakan App Router dari Next.js 15 dengan struktur routing sebagai berikut:
- / : Halaman utama
- /dashboard : Dashboard utama
- /dashboard/map : Halaman peta lahan
- /dashboard/farmer : Halaman data petani
- /dashboard/climate : Halaman data iklim
- /dashboard/pests : Halaman monitoring hama
- /dashboard/ai : Halaman rekomendasi AI
- /dashboard/analytics : Halaman analitik