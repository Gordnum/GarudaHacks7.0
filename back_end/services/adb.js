// services/adb.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/device');
const log = require('./logger');

function pemicu_pesan() {
    let nomor_darurat = config.NOMOR_TELFON;
    if(nomor_darurat.startsWith('0')) {
        nomor_darurat = '62' + nomor_darurat.slice(1);
    }

    const whatsappJid = `${nomor_darurat}@s.whatsapp.net`;
    const link_lokasi = "http://googleusercontent.com/maps.google.com/?q=-6.2574,106.6183";
    
    // 💡 KUNCINYA DI SINI: Teks bersih tanpa tanda koma (,) atau tanda seru (!) agar shell ADB membacanya sebagai satu kesatuan string utuh
    const pesan = `PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM Terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI: ${link_lokasi}`;

    log.info("Membuka chat WhatsApp via Android Component Intent...");

    // Buka room chat target secara spesifik
    const cmdOpenChat = `adb -s localhost:5555 shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;

    exec(cmdOpenChat, (err) => {
        if (err) {
            log.error("Gagal membuka chat WhatsApp", err.message);
            return;
        }
        log.success("WhatsApp room chat terbuka!");

        // Jeda 2.5 detik biar chat room siap total
        setTimeout(() => {
            log.info("Mengetik pesan darurat secara aman...");
            
            // Menggunakan pembungkus kutip ganda dan tunggal yang pas agar spasi tidak pecah
            const cmdKetik = `adb -s localhost:5555 shell "input text '${pesan}'"`;

            exec(cmdKetik, (err) => {
                if (err) {
                    log.error("Gagal mengetik pesan", err.message);
                    return;
                }
                
                log.success("Pesan berhasil diketik, mengirim...");
                
                // Jeda 1 detik setelah ketik selesai, lalu eksekusi ENTER
                setTimeout(() => {
                    const cmdKirim = `adb -s localhost:5555 shell input keyevent 66`;
                    exec(cmdKirim, () => {
                        log.success("✅ Pesan WhatsApp sukses terkirim tanpa typo!");
                    });
                }, 1000);
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

                            // Begitu tombol panggil dipencet, tunggu 500ms lalu langsung alihkan ke WhatsApp kilat
                            setTimeout(() => {
                                log.info("Telepon sudah jalan di background, langsung alihkan ke WhatsApp...");
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