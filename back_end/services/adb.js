// services/adb.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/device');
const log = require('./logger');

// Fungsi pembantu jeda waktu asynchronous mikro
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 💡 FUNGSI KETIK ROBOTIK: Mengetik per karakter murni via kabel USB
async function ketikPesanPresisi(pesanUtuh) {
    log.info(`Mentransfer ${pesanUtuh.length} karakter ke HP via USB dengan kecepatan aman...`);
    
    for (let i = 0; i < pesanUtuh.length; i++) {
        let char = pesanUtuh[i];
        let cmd = '';

        if (char === ' ') {
            // Android ADB mengenali %s sebagai spasi murni
            cmd = `adb shell input text "%s"`;
        } else if (['?', '=', '&', ';', '(', ')', '<', '>', '|', '!', '"', "'", '`'].includes(char)) {
            // Kurung karakter khusus dengan petik tunggal agar aman dari parsing bash shell laptop
            cmd = `adb shell input text '${char}'`;
        } else {
            cmd = `adb shell input text "${char}"`;
        }

        // Eksekusi pengetikan satu karakter secara lokal/kabel
        await new Promise((resolve) => {
            exec(cmd, () => resolve());
        });

        // Jeda mikro 8 milidetik agar keyboard Samsung memproses karakter secara berurutan
        await delay(8); 
    }
    log.success("Transfer data via USB selesai! Semua teks terketik sempurna.");
}

function pemicu_pesan() {
    let nomor_darurat = config.NOMOR_TELFON;
    if(nomor_darurat.startsWith('0')) {
        nomor_darurat = '62' + nomor_darurat.slice(1);
    }

    const whatsappJid = `${nomor_darurat}@s.whatsapp.net`;
    const link_lokasi = "http://googleusercontent.com/maps.google.com/?q=-6.2574,106.6183";
    
    // Teks mentah utuh lengkap dengan tanda baca asli
    const pesan_mentah = `PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM, terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN! ${link_lokasi}`;

    log.info("Membuka chat WhatsApp via Android Component Intent...");
    const cmdOpenChat = `adb shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;
    
    exec(cmdOpenChat, (err) => {
        if (err) return log.error("Gagal membuka chat WhatsApp", err.message);
        log.success("WhatsApp room chat terbuka!");

        // Jeda 2.5 detik biar chat room WhatsApp stabil & siap menerima input
        setTimeout(async () => {
            
            // 🚀 Jalankan pengetikan dengan transfer data terkontrol via kabel
            await ketikPesanPresisi(pesan_mentah);

            // Jeda 800ms setelah mengetik selesai, langsung hajar ENTER buat kirim
            setTimeout(() => {
                log.info("Menekan tombol kirim...");
                const cmdKirim = `adb shell input keyevent 66`;
                exec(cmdKirim, (err) => {
                    if (err) return log.error("Gagal mengirim", err.message);
                    log.success("✅ [SUKSES TOTAL] Pesan sukses terkirim rapi dan presisi via USB!");
                });
            }, 800);
            
        }, 2500); 
    });
}

function pemicu_telfon() {
    const nomor_darurat = config.NOMOR_TELFON;
    
    log.info("Menutup sisa aplikasi dialer lama...");
    exec(`adb shell am force-stop com.samsung.android.dialer`, () => {
        
        log.info("Membuka aplikasi dialer HP via adb...");
        const cmd_telfon = `adb shell am start -a android.intent.action.DIAL`;

        exec(cmd_telfon, (err) => {
            if (err){
                log.error("Gagal membuka aplikasi dialer", err.message);
                return;
            }

            setTimeout(() => {
                log.info(`Mengetik nomor target: ${nomor_darurat}...`);
                exec(`adb shell input text ${nomor_darurat}`, (err) => {
                    if (err){
                        log.error("Gagal mengetik nomor: ", err.message);
                        return;
                    }

                    setTimeout(() => {
                        log.info("Menekan tombol telefon (CALL)...");
                        exec(`adb shell input keyevent 5`, (err) => {
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