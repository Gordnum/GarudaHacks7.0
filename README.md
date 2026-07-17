# GarudaHacks7.0

ThreatVision, ThreatVision merupakan Sistem sekuritas yang memanfaatkan kamera CCTV pasif menjadi sebuah alat untuk memmbasmi tindak kejahatan. Dengan memanfaatkan teknologi Computer vision, AI model YOLO serta di kolaborasikan dengan sistem pelaporan automatisasi. Sistem ini mampu mendeteksi tindakan mencurigkanan seperti tindak kekerasan maupun membawa senjata secara real-time.

**Fitur** : 
1. Real time computer vision
    - Semua proses analisis dilakukan secara real time. Sistem di rancang khusus agar dapat di integrasikan langsung kamera keamanan
2. Sistem reporting secara otomatis
    - Sistem ini memungkinkan handphone yang terhubung untuk langsung menelfon nomor darurat sekaligus juga mengirimkan bukti kejahatan yang ada kepada nomor tersebut melalui Whatsapp, fitur ini memanfaatkan teknologi ADB serta Node js sebagai inti          dari sistem nya.
3. Automatic call
    - Memanfaatkan fitur ADB untuk meminimalkan waktu respon dari sistem untuk melakukan panggilan kepada nomor darurat. 
4. Object and Activity Detection
    - Ai ThreatVision sudah terlatih untuk membedakan benda berbahaya ataupun kegiatan berbahaya.
  
ALUR KERJA
1.
2. //
3. Foto kegiatan yang mencurigakan itu akan di pecah menjadi teks yang sangat panjang, hal ini memungkinkan karena sistem menggunakan fungsi base64 encode yang memungkinkan proses encode gambar. 
4. Hasil dari encode ini kemudian di bungkus kedalam JSON lalu di kirim melalui jaringan ke Termux yang di setting lewat HP
5. Server express kemudian menerima paket JSON dan mendecode paket tersebut menjadi gambar yang dapat di lihat melalui Whatsapp
6. Selain foto, terdapat juga teks yang di tulis menggunakan script ADB ke dalam handphone itu sendiri. 
7. Melengkapi teks tersebut, sistem juga di lengkapi dengan auto generating google map link. 
8. Sistem memanfaatkan ip-api untuk mengambil lokasi paling akurat dari posisi user yang kemudian di ubah menjadi lattitude dan juga longitudinal
9. Kedua variabel tersebut kemudian di ubah menjadi link google maps. 
10. Setelah link gmaps sudah di bentuk, sistem memberikan keyevent untuk memaksa hp untuk keluar ke beranda dan pergi ke aplikasi dialer. 
11. Script back-end kemudian membersihkan placeholder aplikasi dialer dengan keyevent 67, membuat placeholder bersih dan siap di gunakan
12. Script memaksa handphone untuk mengetik nomor daraurat yang di incar 
13. Begitu proses telfon di lakukan, otomatisasi di pindahkan ke whatsapp 
14. Sistem akan langsung generate pesan untuk memperingati aparat keamanan terkait tindak kejahatan yang terjadi pada suatu daerah


