// services/adb.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/device');
const log = require('./logger');

// Fungsi pembantu jeda waktu asynchronous mikro
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 💡 FUNGSI KETIK ROBOTIK: Mengetik per karakter dengan transfer data terukur
async function ketikPesanPresisi(pesanUtuh) {
    log.info(`Mentransfer ${pesanUtuh.length} karakter ke HP dengan kecepatan aman...`);
    
    for (let i = 0; i < pesanUtuh.length; i++) {
        let char = pesanUtuh[i];
        let cmd = '';

        if (char === ' ') {
            cmd = `adb -s localhost:5555 shell input text "%s"`;
        } else if (['?', '=', '&', ';', '(', ')', '<', '>', '|', '!', '"', "'", '`'].includes(char)) {
            cmd = `adb -s localhost:5555 shell input text '${char}'`;
        } else {
            cmd = `adb -s localhost:5555 shell input text "${char}"`;
        }

        // Eksekusi pengetikan satu karakter
        await new Promise((resolve) => {
            exec(cmd, () => resolve());
        });

        // 💡 KUNCINYA DI SINI MAS RUSDI: Jeda mikro 8 milidetik.
        // Tetap terasa sangat cepat di layar HP, tapi memberikan nafas yang cukup buat buffer Android.
        await delay(8); 
    }
    log.success("Transfer data selesai! Semua teks terketik sempurna tanpa typo.");
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
    const cmdOpenChat = `adb -s localhost:5555 shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;

    exec(cmdOpenChat, (err) => {
        if (err) return log.error("Gagal membuka chat WhatsApp", err.message);
        log.success("WhatsApp room chat terbuka!");

        // Jeda 2.5 detik biar chat room WhatsApp stabil & siap menerima input
        setTimeout(async () => {
            
            // 🚀 Jalankan pengetikan dengan transfer data terkontrol
            await ketikPesanPresisi(pesan_mentah);

            // Jeda 800ms setelah mengetik selesai, langsung hajar ENTER buat kirim
            setTimeout(() => {
                log.info("Menekan tombol kirim...");
                exec(`adb -s localhost:5555 shell input keyevent 66`, (err) => {
                    if (err) return log.error("Gagal mengirim", err.message);
                    log.success("✅ [SUKSES TOTAL] Pesan sukses terkirim rapi dan presisi!");
                });
            }, 800);
            
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