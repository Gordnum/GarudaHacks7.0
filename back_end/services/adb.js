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

    // Menggunakan format JID resmi WhatsApp untuk Android Intent
    const whatsappJid = `${nomor_darurat}@s.whatsapp.net`;
    
    // Hilangkan tanda khusus (seperti !) agar string aman di-input via shell
    const pesan_template = "PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN";

    log.info("Membuka chat WhatsApp via Android Component Intent...");

    // 💡 SOLUSI UTAMA: Paksa masuk langsung ke komponen Conversation (Room Chat) target secara spesifik
    const cmd_wa = `adb -s localhost:5555 shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;
    
    exec(cmd_wa, (err) => {
        if (err) {
            log.error("Gagal membuka whatsapp", err.message);
            return;
        }
        log.success("WhatsApp room chat terbuka!");
        
        // Kasih jeda 2 detik (2000ms) agar room chat target benar-benar render sempurna
        setTimeout(() => {
            log.info("Mengetik pesan darurat...");
            
            // Masukkan teks pesan langsung ke kolom input chat yang aktif
            const cmd_ketik = `adb -s localhost:5555 shell "input text '${pesan_template}'"`;
            
            exec(cmd_ketik, (err) => {
                if (err) {
                    log.error("Gagal mengetik pesan", err.message);
                    return;
                }
                log.success("Pesan terketik otomatis!");

                // Jeda 800ms setelah mengetik, baru hajar tombol kirim (Keyevent 66 / ENTER)
                setTimeout(() => {
                    log.info("Menekan tombol kirim...");
                    exec(`adb -s localhost:5555 shell input keyevent 66`, (err) => {
                        if (err) {
                            log.error("Gagal menekan tombol kirim", err.message);
                            return;
                        }
                        log.success("✅ Pesan WhatsApp sukses terkirim dan pas sasaran!");
                    });
                }, 800);
            });
        }, 2000); 
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