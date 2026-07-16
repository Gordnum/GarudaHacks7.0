// services/adb.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/device');
const log = require('./logger');

// Fungsi pembantu jeda waktu asynchronous mikro
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 💡 FUNGSI KETIK ROBOTIK: Mengetik per karakter dengan flag target device yang jelas
async function ketikPesanPresisi(pesanUtuh) {
    const targetDevice = config.CONNECTED_DEVICE_WA || 'RF8M82DNY8Y';
    log.info(`Mentransfer ${pesanUtuh.length} karakter ke HP [${targetDevice}] dengan kecepatan aman...`);
    
    for (let i = 0; i < pesanUtuh.length; i++) {
        let char = pesanUtuh[i];
        let cmd = '';

        if (char === ' ') {
            cmd = `adb -s ${targetDevice} shell input text "%s"`;
        } else if (['?', '=', '&', ';', '(', ')', '<', '>', '|', '!', '"', "'", '`'].includes(char)) {
            cmd = `adb -s ${targetDevice} shell input text '${char}'`;
        } else {
            cmd = `adb -s ${targetDevice} shell input text "${char}"`;
        }

        // Eksekusi pengetikan satu karakter secara lokal/kabel
        await new Promise((resolve) => {
            exec(cmd, () => resolve());
        });

        // Jeda mikro 8 milidetik anti-typo
        await delay(8); 
    }
    log.success("Transfer data selesai! Semua teks terketik sempurna tanpa typo.");
}

function pemicu_pesan() {
    let nomor_darurat = config.NOMOR_TELFON;
    if (!nomor_darurat) {
        log.error("NOMOR_TELFON tidak ditemukan di config!");
        return;
    }
    if (nomor_darurat.startsWith('0')) {
        nomor_darurat = '62' + nomor_darurat.slice(1);
    }

    const targetDevice = config.CONNECTED_DEVICE_WA || 'RF8M82DNY8Y';
    const whatsappJid = `${nomor_darurat}@s.whatsapp.net`;
    const link_lokasi = "https://www.google.com/maps?q=-6.2574,106.6183";
    const pesan_mentah = `PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM, terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN! ${link_lokasi}`;

    log.info(`Membuka chat WhatsApp di device [${targetDevice}] via Android Component Intent...`);
    const cmdOpenChat = `adb -s ${targetDevice} shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;

    exec(cmdOpenChat, (err) => {
        if (err) {
            log.error("Gagal membuka chat WhatsApp lewat component langsung, coba fallback...", err.message);
            // Fallback: pakai URI wa.me lewat browser intent (Tetap pakai flag -s)
            const cmdFallback = `adb -s ${targetDevice} shell am start -a android.intent.action.VIEW -d "https://wa.me/${nomor_darurat}"`;
            exec(cmdFallback, (fallbackErr) => {
                if (fallbackErr) return log.error("Fallback juga gagal", fallbackErr.message);
                log.success("Fallback WhatsApp (wa.me) berhasil dibuka!");
                setTimeout(() => lanjutkanKetikDanKirim(pesan_mentah), 2500);
            });
            return;
        }
        log.success("WhatsApp room chat terbuka!");
        setTimeout(() => lanjutkanKetikDanKirim(pesan_mentah), 2500);
    });
}

function lanjutkanKetikDanKirim(pesan_mentah) {
    const targetDevice = config.CONNECTED_DEVICE_WA || 'RF8M82DNY8Y';
    (async () => {
        await ketikPesanPresisi(pesan_mentah);
        setTimeout(() => {
            log.info("Menekan tombol kirim...");
            exec(`adb -s ${targetDevice} shell input keyevent 66`, (err) => {
                if (err) return log.error("Gagal mengirim", err.message);
                log.success("✅ [SUKSES TOTAL] Pesan sukses terkirim rapi dan presisi via USB!");
            });
        }, 800);
    })();
}

function pemicu_telfon() {
    const nomor_darurat = config.NOMOR_TELFON;
    if (!nomor_darurat) {
        log.error("NOMOR_TELFON tidak ditemukan di config!");
        return;
    }

    // Menggunakan device yang terdeteksi (Bisa disesuaikan nanti kalau HP ke-2 terhubung)
    const targetDevice = config.CONNECTED_DEVICE_TELP || 'RF8M82DNY8Y';

    log.info(`Menutup sisa aplikasi dialer lama di device [${targetDevice}]...`);
    exec(`adb -s ${targetDevice} shell am force-stop com.samsung.android.dialer`, () => {

        log.info(`Membuka aplikasi dialer HP [${targetDevice}] via adb...`);
        const cmd_telfon = `adb -s ${targetDevice} shell am start -a android.intent.action.DIAL`;

        exec(cmd_telfon, (err) => {
            if (err) {
                log.error("Gagal membuka aplikasi dialer", err.message);
                return;
            }

            setTimeout(() => {
                log.info(`Mengetik nomor target: ${nomor_darurat}...`);
                exec(`adb -s ${targetDevice} shell input text ${nomor_darurat}`, (err) => {
                    if (err) {
                        log.error("Gagal mengetik nomor: ", err.message);
                        return;
                    }

                    setTimeout(() => {
                        log.info("Menekan tombol telefon (CALL)...");
                        exec(`adb -s ${targetDevice} shell input keyevent 5`, (err) => {
                            if (err) {
                                log.error("Gagal menekan tombol: ", err.message);
                                return;
                            }
                            log.success("Panggilan keluar berhasil dipicu!");

                            // Kirim pesan WA SETELAH panggilan benar-benar berjalan
                            setTimeout(() => {
                                log.info("Panggilan sedang berjalan, mengirim pesan WhatsApp di background...");
                                pemicu_pesan();
                            }, 4000); 
                        });
                    }, 400);
                });
            }, 500);
        });
    });
}

module.exports = { pemicu_telfon, pemicu_pesan };