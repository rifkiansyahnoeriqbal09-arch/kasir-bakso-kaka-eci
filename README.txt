# Kasir Bakso Kaka Eci — PWA Offline

Versi ini mengubah fungsi utama kasir PHP menjadi aplikasi web/PWA yang menyimpan data di perangkat menggunakan localStorage.

Fitur:
- Menu default Bakso Urat, Bakso Cincang, Bakso Keju, Bakso Jumbo, Baso Tetelan
- Tambah/edit/hapus menu
- Banyak tab pesanan
- Catatan pesanan
- Pembayaran & kembalian
- Omset dan jumlah terjual
- Riwayat transaksi + hapus transaksi
- Data lokal di HP, tidak membutuhkan PHP/MySQL/internet setelah aplikasi sudah dicache

Cara memakai:
1. Upload folder ini ke hosting HTTPS atau jalankan melalui localhost.
2. Android: buka di Chrome lalu pilih "Tambahkan ke layar utama"/"Install app".
3. iPhone: buka di Safari → Bagikan → "Add to Home Screen".
4. Jangan hapus data situs/browser jika ingin mempertahankan data kasir.

Catatan:
- Ini adalah PWA, sehingga satu versi bisa dipakai di Android dan iPhone.
- Untuk membuat APK Android/IPA iPhone yang benar-benar didistribusikan melalui store, proyek ini dapat dibungkus lagi dengan Capacitor dan membutuhkan proses build/signing platform.
