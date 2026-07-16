// services/adb.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/device');
const log = require('./logger');

// Fungsi escape andalan Mas Rusdi untuk mengubah spasi menjadi %s literal adb
function escapeUntukADBInput(teks) {
    return teks
        .replace(/ /g, '%s') 
        .replace(/\?/g, '?')  
        .replace(/!/g, '!')
        .replace(/,/g, ',');
}

function pemicu_pesan() {
    let nomor_darurat = config.NOMOR_TELFON;
    if(nomor_darurat.startsWith('0')) {
        nomor_darurat = '62' + nomor_darurat.slice(1);
    }

    const whatsappJid = `${nomor_darurat}@s.whatsapp.net`;
    const link_lokasi = "http://googleusercontent.com/maps.google.com/?q=-6.2574,106.6183";
    
    const pesan_mentah = `PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN ${link_lokasi}`;
    const pesan_terproteksi = escapeUntukADBInput(pesan_mentah);

    log.info("Membuka chat WhatsApp via Android Component Intent...");
    const cmdOpenChat = `adb -s localhost:5555 shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;

    exec(cmdOpenChat, (err) => {
        if (err) return log.error("Gagal membuka chat WhatsApp", err.message);
        log.success("WhatsApp room chat terbuka!");

        // Jeda 2.5 detik agar chat room termuat sempurna
        setTimeout(() => {
            log.info("Mengatur stabilitas buffer keyboard Android secara internal...");
            
            // 💡 TRIK UTAMA MAS RUSDI: Kita tweak durasi delay input keyboard bawaan Android biar dia punya waktu memproses teks panjang secara kilat tapi teratur
            exec(`adb -s localhost:5555 shell settings put system show_password_duration 10`, () => {
                
                log.info("Mengetik pesan dengan kecepatan sedang-cepat yang stabil...");
                const cmdKetikSafe = `adb -s localhost:5555 shell input text "${pesan_terproteksi}"`;

                exec(cmdKetikSafe, (err) => {
                    if (err) {
                        log.error("Gagal mengetik pesan", err.message);
                        return;
                    }
                    log.success("Teks berhasil diketik dengan presisi tinggi!");

                    // Kembalikan setelan durasi keyboard ke default (opsional biar normal lagi HP-nya)
                    exec(`adb -s localhost:5555 shell settings put system show_password_duration 200`);

                    // Jeda 1 detik lalu pencet tombol kirim (ENTER)
                    setTimeout(() => {
                        log.info("Menekan tombol kirim...");
                        exec(`adb -s localhost:5555 shell input keyevent 66`, (err) => {
                            if (err) return log.error("Gagal mengirim", err.message);
                            log.success("✅ [MANTAP] Pesan sukses terkirim seimbang dan rapi!");
                        });
                    }, 1000);
                });
            });
        }, 2500); 
    });
}

function pemicu_telfon() {
    const nomor_darurat = config.NOMOR_TELFON;
    
    log.info("Menutup sisa aplikasi dialer lama...");
    exec(`adb -s localhost:5555 shell am force-stop com.samsung.android.dialer`, () => {
        
        log.info("Membuka aplikasi dialer HP via adb...");
        const cmd_telfon = `adb -s localhost:5555 shell am start -a android.intent.action.DIAL`;

        exec(cmd_telfon, (err) => {
            if (err){
                log.error("Gagal membuka aplikasi dialer", err.message);
                return;
            }

            setTimeout(() => {
                log.info(`Mengetik nomor target: ${nomor_darurat}...`);
                exec(`adb -s localhost:5555 shell input text ${nomor_darurat}`, (err) => {
                    if (err){
                        log.error("Gagal mengetik nomor: ", err.message);
                        return;
                    }

                    setTimeout(() => {
                        log.info("Menekan tombol telefon (CALL)...");
                        exec(`adb -s localhost:5555 shell input keyevent 5`, (err) => {
                            if (err) {
                                log.error("Gagal menekan tombol: ", err.message);
                                return;
                            }
                            log.success("Panggilan keluar berhasil dipicu!");

                            setTimeout(() => {
                                log.info("Telepon berjalan, mengalihkan ke proses kirim pesan...");
                                pemicu_pesan();
                            }, 500);
                        });
                    }, 400); 
                });
            }, 500); 
        });
    });
}

module.exports = { pemicu_telfon, pemicu_pesan };