// services/adb.js
const { exec } = require('child_process');
const config = require('../config/device');
const log = require('./logger');

function pemicu_pesan() {
    let nomor_tujuan = config.NOMOR_TELFON;

    if (!nomor_tujuan) {
        log.error("NOMOR_TELFON tidak ditemukan di config!");
        return;
    }

    if (nomor_tujuan.startsWith('0')) {
        nomor_tujuan = '62' + nomor_tujuan.slice(1);
    }

    const targetDevice = config.CONNECTED_DEVICE_WA || 'RF8M82DNY8Y';
    const whatsappJid = `${nomor_tujuan}@s.whatsapp.net`;
    const link_lokasi = "https://www.google.com/maps?q=-6.2574,106.6183";
    const pesan_mentah = `PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM, terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN! ${link_lokasi}`;

    log.info(`[INTENT] Membuka room chat WhatsApp di device [${targetDevice}]...`);
    const cmdOpenChat = `adb -s ${targetDevice} shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;

    exec(cmdOpenChat, (err) => {
        if (err) return log.error("Gagal membuka chat WhatsApp", err.message);
        log.success("WhatsApp room chat berhasil terbuka di layar!");

        // Jeda 3 detik biar transisi UI WhatsApp stabil dan kolom input siap menerima text dump
        setTimeout(() => {
            log.info("[INPUT] Menyuntikkan teks massal ke kolom input...");

            // Spasi diubah jadi %s agar dibaca utuh oleh engine ADB Android
            const pesanAmanADB = pesan_mentah.replace(/ /g, '%s');
            const cmdKirimTeks = `adb -s ${targetDevice} shell input text "${pesanAmanADB}"`;

            exec(cmdKirimTeks, (err) => {
                if (err) return log.error("Gagal mengirimkan teks massal", err.message);
                log.success("Teks darurat berhasil masuk utuh!");

                // Jeda 800ms langsung hajar ENTER (keyevent 66) buat kirim secara fisik
                setTimeout(() => {
                    log.info("[SEND] Menekan tombol kirim otomatis...");
                    exec(`adb -s ${targetDevice} shell input keyevent 66`, (err) => {
                        if (err) return log.error("Gagal menekan tombol kirim", err.message);
                        log.success("✅ [SUKSES VISUAL TOTAL] Pesan sukses terkirim via layar WhatsApp!");
                    });
                }, 800);
            });
        }, 3000); 
    });
}

function pemicu_telfon() {
    const nomor_darurat = config.NOMOR_TELFON;
    const targetDevice = config.CONNECTED_DEVICE_TELP || 'RF8M82DNY8Y';

    if (!nomor_darurat) {
        log.error("NOMOR_TELFON tidak ditemukan di config!");
        return;
    }

    log.info(`[ADB] Menutup dialer lama di [${targetDevice}]...`);
    exec(`adb -s ${targetDevice} shell am force-stop com.samsung.android.dialer`, () => {
        
        log.info(`[ADB] Membuka dialer di [${targetDevice}]...`);
        exec(`adb -s ${targetDevice} shell am start -a android.intent.action.DIAL`, (err) => {
            if (err) return log.error("Gagal membuka dialer", err.message);

            setTimeout(() => {
                log.info(`[ADB] Mengetik nomor target: ${nomor_darurat}...`);
                exec(`adb -s ${targetDevice} shell input text ${nomor_darurat}`, (err) => {
                    if (err) return log.error("Gagal mengetik nomor", err.message);
                    
                    setTimeout(() => {
                        log.info("[ADB] Menekan tombol CALL...");
                        exec(`adb -s ${targetDevice} shell input keyevent 5`, (err) => {
                            if (err) return log.error("Gagal menekan tombol CALL", err.message);
                            log.success("Panggilan keluar berhasil dipicu!");

                            // Jeda 4 detik setelah dialer aktif, langsung oper ke WhatsApp di foreground
                            setTimeout(() => {
                                log.info("Panggilan sedang aktif, membuka WhatsApp untuk kirim pesan koordinat...");
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