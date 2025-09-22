# Project Requirements Document: Dashboard AgroDemoplot

**Versi:** 1.0
**Tanggal:** 6 September 2025

---

## 1. Pendahuluan

Dokumen ini menguraikan persyaratan fungsional dan non-fungsional untuk proyek "AgroDemoplot", sebuah web dashboard yang dirancang untuk memonitor kebun demoplot kopi. Tujuan utama aplikasi ini adalah untuk menyediakan visualisasi data terpusat, manajemen petani, dan pusat informasi Hama, Penyakit, dan Gulma (HPG) untuk meningkatkan efisiensi dan pengambilan keputusan dalam pengelolaan kebun.

---

## 2. Ruang Lingkup Proyek

Aplikasi akan mencakup empat modul utama:
1.  **Dashboard Utama:** Tampilan ringkasan visual kondisi kebun melalui peta interaktif dan data klimatologi.
2.  **Manajemen Petani:** CRUD (Create, Read, Update, Delete) untuk data petani yang terasosiasi dengan kebun.
3.  **Detail Kebun:** Analisis mendalam per plot/polygon, termasuk data historis dan laporan lapangan.
4.  **Monitoring HPG:** Pencatatan dan status Hama, Penyakit, dan Gulma.
5.  **Rekomendasi AI** Analisis otomatis berbasis iklim & monitoring HPG
6.  **Analitik** Statistik & tren produksi, iklim, serta distribusi HPG.

---

## 3. Persyaratan Fungsional (Functional Requirements)

### 3.1. Otentikasi & Manajemen Pengguna (FR-AUTH)
-   **FR-AUTH-01:** Pengguna harus bisa mendaftar (sign-up) dan masuk (sign-in) ke dalam sistem.
-   **FR-AUTH-02:** Sistem harus mendukung setidaknya dua peran pengguna: **Admin** dan **Petugas Lapangan**.
-   **FR-AUTH-03:** Halaman-halaman tertentu harus dilindungi dan hanya bisa diakses oleh pengguna yang sudah login.
-   **FR-AUTH-04:** Admin dapat mengakses semua data (override RLS).

### 3.2. Dashboard & Peta (FR-MAP)
-   **FR-MAP-01:** Dashboard harus menampilkan peta interaktif yang memuat semua poligon kebun demoplot.
-   **FR-MAP-02:** Pengguna harus bisa mengklik sebuah poligon untuk melihat informasi ringkas (nama petani, luas).
-   **FR-MAP-03:** Peta harus memiliki opsi untuk mengganti layer (misal: citra satelit, peta jalan).
-   **FR-MAP-04:** Dashboard harus menampilkan widget data klimatologi (suhu, curah hujan) untuk lokasi kebun.

### 3.3. Manajemen Data (FR-DATA)
-   **FR-DATA-01:** Admin harus bisa menambah, melihat, mengedit, dan menghapus data petani.
-   **FR-DATA-02:** Admin harus bisa mengimpor/menggambar data poligon kebun dan mengasosiasikannya dengan petani.
-   **FR-DATA-03:** Petugas Lapangan harus bisa membuat laporan observasi (termasuk unggah foto) untuk poligon tertentu.
-   **FR-DATA-04:** Admin harus bisa mengelola konten ensiklopedia HPG.

### 3.4. Monitoring HPG (FR-HPG)
-   **FR-HPG-01:** Catat data HPG per plot (nama, jenis, deskripsi, foto).
-   **FR-HPG-02:** Status HPG standar: Tidak Parah, Sedang, Parah, Sangat Parah.
-   **FR-HPG-03:** Status divisualkan dengan warna/ikon berbeda.
-   **FR-HPG-04:** Sistem mendukung upload foto lapangan.
-   **FR-HPG-05:** Admin dapat menambahkan informasi ensiklopedia HPG (pengetahuan dasar).

### 3.5. Rekomendasi AI (FR-AI)
-   **FR-AI-01:** Dashboard memiliki kartu rekomendasi AI.
-   **FR-AI-02:** AI memberi rekomendasi berbasis data iklim & monitoring HPG.
-   **FR-AI-03:** Rekomendasi disimpan per plot (history rekomendasi).

### 3.6. Analitik (FR-ANALYTICS)
-   **FR-ANALYTICS-01:** Halaman analitik menampilkan tren iklim vs produksi.
-   **FR-ANALYTICS-02:** Statistik distribusi HPG per lokasi.
-   **FR-ANALYTICS-03:** Korelasi curah hujan dengan serangan HPG.
-   **FR-ANALYTICS-04:** Ekspor data (CSV/Excel/PDF).


---

## 4. Persyaratan Non-Fungsional (Non-Functional Requirements)

-   **NFR-PERF-01:** Waktu muat halaman dashboard utama tidak boleh lebih dari 3 detik pada koneksi internet standar.
-   **NFR-SECU-01:** Seluruh komunikasi antara klien dan server harus dienkripsi menggunakan HTTPS.
-   **NFR-UIUX-01:** Antarmuka harus responsif dan dapat diakses dengan baik di perangkat desktop maupun mobile.
-   **NFR-UIUX-02:** Aplikasi harus menyediakan mode terang (light mode) dan gelap (dark mode).
-   **NFR-UIUX-03:** Aplikasi harus menyediakan mode bahasa indonesia (default) dan inggris.


---

## 5. Tech Stack

-   **Framework:** Next.js 15 (App Router)
-   **Bahasa:** TypeScript
-   **Database:** Supabase (PostgreSQL dengan ekstensi PostGIS)
-   **Otentikasi:** Clerk
-   **Styling:** Tailwind CSS v4
-   **UI Components:** shadcn/ui
-   **Theme System:** next-themes
-   **Mapping Library:** React Leaflet (dengan plugin leaflet gesture handling)