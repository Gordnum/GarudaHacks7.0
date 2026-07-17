# GarudaHacks7.0

ThreatVision, ThreatVision merupakan sistem sekuritas yang memanfaatkan kamera CCTV pasif menjadi sebuah alat untuk membasmi tindak kejahatan. Dengan memanfaatkan teknologi Computer Vision, MediaPipe, YOLO serta sistem pelaporan automatisasi, sistem ini mampu mendeteksi tindakan mencurigakan seperti tindakan kekerasan maupun membawa senjata secara real-time.

**Fitur :** 
1. Real time computer vision
    - Semua proses analisis dilakukan secara real time. Sistem di rancang khusus agar dapat di integrasikan langsung dengan kamera keamanan.
2. Sistem reporting secara otomatis
    - Sistem ini memungkinkan handphone yang terhubung untuk langsung menelpon nomor darurat sekaligus juga mengirimkan bukti kejahatan yang ada kepada nomor tersebut melalui Whatsapp, fitur ini memanfaatkan teknologi ADB serta Node.js sebagai inti dari sistem nya.
3. Automatic call
    - Memanfaatkan fitur ADB untuk meminimalkan waktu respon dari sistem untuk melakukan panggilan kepada nomor darurat. 
4. Object and activity detection
    - Ai ThreatVision sudah terlatih untuk membedakan benda berbahaya ataupun kegiatan berbahaya.
  
**ALUR KERJA**
1. Kamera mengambil video secara real-time dan setiap frame diproses oleh sistem.
2. MediaPipe Pose mendeteksi setiap orang beserta pose dan landmark tubuhnya.
3. Kemudian sistem akan memberikan ID kepada orang-orang yang terdeteksi pada kamera secara konsisten sehingga setiap orang dapat dilacak antar frame.
4. Sistem juga akan menganalisis pergerakan landmark untuk mengenali aksi seperti berjalan, berlari, atau memukul.
5. YOLO mendeteksi objek di dalam frame, termasuk benda berbahaya seperti pistol.
6. Sistem akan mengaitkan setiap objek yang terdeteksi dengan orang yang paling mungkin membawanya berdasarkan posisi bounding box.
7. Hal ini akan mengakumulasikan skor ancaman setiap orang berdasarkan aksi, objek yang dibawa, serta aturan (rule-based), kemudian menentukan level ancaman (Low, Medium, High, atau Critical).
8. Antarmuka (UI) menampilkan hasil deteksi secara real-time, dan ketika level ancaman mencapai Critical, sistem membunyikan alarm serta menyimpan screenshot sebagai barang bukti.
9. Foto kegiatan (screenshot) yang mencurigakan itu akan di pecah menjadi teks yang sangat panjang, hal ini memungkinkan karena sistem menggunakan fungsi base64 encode yang memungkinkan proses encode gambar. 
10. Hasil dari encode ini kemudian di bungkus kedalam JSON lalu di kirim melalui jaringan ke Termux yang di setting lewat HP.
11. Server express kemudian menerima paket JSON dan mendecode paket tersebut menjadi gambar yang dapat di lihat melalui Whatsapp.
12. Selain foto, terdapat juga teks yang di tulis menggunakan script ADB ke dalam handphone itu sendiri. 
13. Melengkapi teks tersebut, sistem juga di lengkapi dengan auto generating google map link. 
14. Sistem memanfaatkan ip-api untuk mengambil lokasi paling akurat dari posisi user yang kemudian di ubah menjadi lattitude dan juga longitudinal.
15. Kedua variabel tersebut kemudian di ubah menjadi link google maps. 
16. Setelah link gmaps sudah di bentuk, sistem memberikan keyevent untuk memaksa hp untuk keluar ke beranda dan pergi ke aplikasi dialer. 
17. Script back-end kemudian membersihkan placeholder aplikasi dialer dengan keyevent 67, membuat placeholder bersih dan siap di gunakan.
18. Script memaksa handphone untuk mengetik nomor daraurat yang di incar.
19. Begitu proses telfon di lakukan, otomatisasi di pindahkan ke whatsapp.
20. Sistem akan langsung generate pesan untuk memperingati aparat keamanan terkait tindak kejahatan yang terjadi pada suatu daerah.

**AI USAGE**
1. Claude : Problem solving untuk permasalahan yang berat, generate dummy code
2. Chatgpt: Companion dalam diskusi program, generate dummy code
3. Gemini : Companion dalam diskusi program, generate dummy code, menjelaskan konsep dan logika dalam program
