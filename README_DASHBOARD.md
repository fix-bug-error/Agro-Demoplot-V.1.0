# Dashboard AgroDemoplot

Dashboard ini merupakan bagian dari aplikasi AgroDemoplot yang dirancang untuk memonitor demoplot (lahan percontohan) kebun kopi secara komprehensif.

## Struktur Dashboard

Dashboard terdiri dari beberapa halaman utama:

1. **Dashboard Utama** (`/dashboard`) - Tampilan ringkasan visual kondisi kebun
2. **Peta Lahan** (`/dashboard/map`) - Visualisasi geospasial plot lahan
3. **Data Petani** (`/dashboard/farmer`) - Manajemen data petani
4. **Data Iklim** (`/dashboard/climate`) - Monitoring data klimatologi
5. **Monitoring Hama** (`/dashboard/pests`) - Pencatatan dan status Hama, Penyakit & Gulma
6. **Rekomendasi AI** (`/dashboard/ai`) - Rekomendasi berbasis AI
7. **Analitik** (`/dashboard/analytics`) - Statistik dan tren produksi

## Fitur Utama

### Dashboard Utama
- Sidebar navigasi untuk berpindah antar halaman
- Header dengan pemilih plot, toggle tema, dan toggle bahasa
- Kartu data petani
- Peta lahan interaktif
- Data klimatologi real-time
- Monitoring HPG (Hama, Penyakit, Gulma)
- Rekomendasi AI

### Peta Lahan
- Visualisasi geospasial plot lahan menggunakan Leaflet
- Layer peta yang dapat diubah (peta jalan, satelit)
- Foto udara plot
- Informasi detail per plot

### Data Petani
- CRUD (Create, Read, Update, Delete) data petani
- Pencarian petani berdasarkan nama atau kelompok tani
- Detail profil petani lengkap

### Data Iklim
- Grafik tren suhu, curah hujan, kelembapan, dan kecepatan angin
- Data historis
- Filter berdasarkan periode waktu

### Monitoring HPG
- Pencatatan hama, penyakit, dan gulma
- Status visual dengan kode warna
- Upload foto lapangan
- Pencarian berdasarkan jenis ancaman

### Rekomendasi AI
- Rekomendasi berbasis data iklim dan monitoring HPG
- Riwayat rekomendasi
- Informasi faktor yang mendasari rekomendasi

### Analitik
- Grafik distribusi HPG
- Tren aktivitas bulanan
- Statistik kelompok tani
- Fungsi ekspor data (CSV, Excel, PDF)

## Teknologi yang Digunakan

- **Framework**: Next.js 15 (App Router)
- **Bahasa**: TypeScript
- **Database**: Supabase (PostgreSQL dengan ekstensi PostGIS)
- **Autentikasi**: Clerk
- **Styling**: Tailwind CSS v4
- **Komponen UI**: shadcn/ui
- **Integrasi AI**: Vercel AI SDK
- **Sistem Tema**: next-themes
- **Library Peta**: React Leaflet

## Cara Menggunakan

1. **Navigasi**: Gunakan sidebar untuk berpindah antar halaman
2. **Pemilih Plot**: Gunakan dropdown di header untuk memilih plot yang ingin dilihat
3. **Tema**: Gunakan tombol toggle tema untuk mengganti antara mode terang dan gelap
4. **Bahasa**: Gunakan tombol toggle bahasa untuk mengganti bahasa tampilan

## Pengembangan Lebih Lanjut

Untuk menghubungkan dashboard dengan data real dari Supabase:

1. Implementasikan fungsi fetch data di setiap halaman
2. Ganti mock data dengan data dari database
3. Tambahkan autentikasi pengguna
4. Implementasikan CRUD operations untuk setiap entitas