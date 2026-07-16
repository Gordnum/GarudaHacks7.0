// services/adb.js
const { exec } = require('child_process');
const config = require('../config/device');
const log = require('./logger');

// Fungsi helper: Pakai "adb shell" langsung tanpa -s (selama cuma 1 device)
function execAdb(cmd, callback) {
    exec(`adb ${cmd}`, (err, stdout, stderr) => {
        if (callback) callback(err, stdout, stderr);
    });
}

function pemicu_pesan() {
    let nomor = config.NOMOR_TELFON;
    if (nomor.startsWith('0')) nomor = '62' + nomor.slice(1);
    
    const pesan = "PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM, terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN! https://www.google.com/maps?q=-6.2574,106.6183";

    log.info("Membuka WhatsApp...");
    // Intent standar buat buka chat
    const cmdWa = `shell am start -a android.intent.action.VIEW -d "https://api.whatsapp.com/send?phone=${nomor}"`;
    
    execAdb(cmdWa, () => {
        setTimeout(() => {
            log.info("Mengirim pesan...");
            // Triks: Karena clipboard sering diblokir, kita pakai 'input text' dengan format URL-encoded
            // Ini cara paling universal buat bypass limit karakter di Android
            const pesanEncoded = pesan.replace(/ /g, '%s').replace(/!/g, '\\!');
            
            execAdb(`shell input text "${pesanEncoded}"`, () => {
                setTimeout(() => {
                    execAdb(`shell input keyevent 66`, () => {
                        log.success("Pesan terkirim!");
                    });
                }, 500);
            });
        }, 3000); // Tunggu 3 detik biar WA kebuka
    });
}

function pemicu_telfon() {
    const nomor = config.NOMOR_TELFON;
    log.info("Memicu Telepon...");
    
    // Pakai 'am start' untuk membuka dialer
    execAdb(`shell am start -a android.intent.action.DIAL -d tel:${nomor}`, () => {
        setTimeout(() => {
            // Langsung tekan keyevent 5 (CALL)
            execAdb(`shell input keyevent 5`, () => {
                log.success("Telepon dipicu!");
            });
        }, 1000);
    });
}

module.exports = { pemicu_telfon, pemicu_pesan };