// services/adb.js
const { exec } = require('child_process');
const config = require('../config/device');
const log = require('./logger');

// Fungsi helper buat eksekusi ADB tanpa harus nentuin -s ID (otomatis ke device yang aktif)
function execAdb(cmd, callback) {
    exec(`adb ${cmd}`, (err, stdout, stderr) => {
        if (callback) callback(err, stdout, stderr);
    });
}

function pemicu_pesan() {
    let nomor_tujuan = config.NOMOR_TELFON;
    if (nomor_tujuan.startsWith('0')) nomor_tujuan = '62' + nomor_tujuan.slice(1);

    const pesan = `PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM, terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN! https://www.google.com/maps?q=-6.2574,106.6183`;

    log.info("Menyuntikkan pesan ke Clipboard sistem...");

    // 💡 TRIK INJECT CLIPBOARD MURNI (Versi Service Call)
    // Ini langsung nembak ke service clipboard Android tanpa perlu aplikasi ketiga
    const base64Pesan = Buffer.from(pesan).toString('base64');
    const cmdClipboard = `shell "echo '${base64Pesan}' | base64 -d | tr -d '\n' | xargs -0 -I {} service call clipboard 2 i32 1 i32 0 s16 {}"`;

    execAdb(cmdClipboard, () => {
        log.info("Membuka WhatsApp...");
        // Buka chat WA
        execAdb(`shell am start -a android.intent.action.VIEW -d "https://api.whatsapp.com/send?phone=${nomor_tujuan}"`, () => {
            
            setTimeout(() => {
                log.info("Melakukan PASTE dan KIRIM...");
                // Keyevent 279 (Paste) diikuti Keyevent 66 (Enter)
                execAdb(`shell input keyevent 279 && sleep 0.5 && shell input keyevent 66`, (err) => {
                    if (err) log.error("Gagal paste/kirim", err.message);
                    else log.success("Pesan terkirim via Clipboard!");
                });
            }, 3000);
        });
    });
}

function pemicu_telfon() {
    const nomor = config.NOMOR_TELFON;
    
    log.info("Memicu panggilan telepon...");
    execAdb(`shell am force-stop com.samsung.android.dialer`, () => {
        execAdb(`shell am start -a android.intent.action.DIAL`, () => {
            setTimeout(() => {
                execAdb(`shell input text ${nomor}`, () => {
                    setTimeout(() => {
                        execAdb(`shell input keyevent 5`);
                        log.success("Telepon dipicu!");
                    }, 400);
                });
            }, 500);
        });
    });
}

module.exports = { pemicu_telfon, pemicu_pesan };