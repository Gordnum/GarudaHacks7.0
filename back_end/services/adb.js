// services/adb.js
const { exec } = require('child_process');
const config = require('../config/device');
const log = require('./logger');

/**
 * Helper untuk mengeksekusi perintah ADB secara asynchronous
 * @param {string} command - Perintah ADB yang akan dijalankan
 * @returns {Promise<{success: boolean, output: string, error: string|null}>}
 */
function runAdb(command) {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, output: stdout, error: error.message });
            } else {
                resolve({ success: true, output: stdout, error: null });
            }
        });
    });
}

/**
 * Memicu panggilan telepon dan pengiriman pesan WhatsApp darurat secara simultan
 */
async function triggerEmergencyAlert() {
    const rawNumber = config.NOMOR_TELFON;
    if (!rawNumber) {
        log.error("[ALERT] NOMOR_TELFON tidak ditemukan di konfigurasi!");
        return;
    }

    // 1. Standarisasi format nomor telepon
    const targetDevice = config.CONNECTED_DEVICE_TELP || 'RF8M82DNY8Y';
    const formattedWaNumber = rawNumber.startsWith('0') ? '62' + rawNumber.slice(1) : rawNumber;
    
    // 2. Siapkan konten pesan darurat
    const locationUrl = "https://www.google.com/maps?q=-6.2574,106.6183";
    const alertMessage = `DARURAT! Terjadi tindak kejahatan di lokasi ini. Tolong segera cek: ${locationUrl}`;
    const encodedMessage = encodeURIComponent(alertMessage);

    log.info("==================================================");
    log.info("🚨 [SISTEM] MEMULAI PROSEDUR DARURAT SIMULTAN... 🚨");
    log.info("==================================================");

    // 3. Eksekusi Panggilan Telepon (Berjalan langsung di background dialer)
    log.info(`[TELP] Menelepon langsung ke target: ${rawNumber}...`);
    const callCommand = `adb -s ${targetDevice} shell am start -a android.intent.action.CALL -d tel:${rawNumber}`;
    runAdb(callCommand); 

    // Jeda 500ms agar transisi sistem telepon stabil
    setTimeout(async () => {
        log.info(`[WA] Mengirim pesan darurat ke: ${formattedWaNumber}...`);

        // 4. Buka WhatsApp Direct Link (Otomatis mengisi kolom input pesan)
        const whatsappCommand = `adb -s ${targetDevice} shell am start -a android.intent.action.VIEW -d "https://api.whatsapp.com/send?phone=${formattedWaNumber}&text=${encodedMessage}"`;
        const waRedirect = await runAdb(whatsappCommand);

        if (!waRedirect.success) {
            return log.error("[WA] Gagal membuka antarmuka pengiriman pesan!", waRedirect.error);
        }

        // Jeda 1.2 detik untuk memastikan transisi UI WhatsApp selesai, lalu tekan ENTER
        setTimeout(async () => {
            log.info("[WA] Menekan tombol kirim otomatis...");
            const pressEnterCommand = `adb -s ${targetDevice} shell input keyevent 66`; // Keyevent 66 = Enter/Kirim
            const sendAction = await runAdb(pressEnterCommand);

            if (sendAction.success) {
                log.success("✅ [SUKSES] Telepon sedang aktif & Pesan koordinat sukses terkirim!");
            } else {
                log.error("[WA] Gagal menekan tombol kirim!", sendAction.error);
            }
        }, 1200);

    }, 500);
}

module.exports = { triggerEmergencyAlert };