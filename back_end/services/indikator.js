const konfigurasi = require('../config/device');
const adb = require('./adb'); 
const log = require('./logger');

function test() {
    let nilai_sensor = 0;
    log.info("\nSIMULASI AI (DUMMY)");
    log.alert(`BATAS THREATS ADALAH ${konfigurasi.BATAS_ANCAMAN}`);

    // Kita log di sini untuk memastikan fungsi dari adb.js terbaca dengan benar di Termux
    log.info(`[DEBUG] Isi modul ADB yang terbaca: ${Object.keys(adb).join(', ') || 'KOSONG!'}`);

    const simulasi_batas = setInterval(() => {
        nilai_sensor += 10;
        log.info(`[SIMULASI] NILAI SENSOR SAAT INI : ${nilai_sensor}`);

        if(nilai_sensor >= konfigurasi.BATAS_ANCAMAN) {
            clearInterval(simulasi_batas);
            log.alert("BATAS THREATS SUDAH TERLEWAT, BERSIAP MENELFON\n");
            
            // Panggil langsung dari objek modul adb agar terhindar dari masalah destructuring
            if (typeof adb.pemicu_telfon === 'function') {
                adb.pemicu_telfon();
            } else {
                log.error("Fungsi pemicu_telfon tidak ditemukan di adb.js!");
            }

            if (typeof adb.pemicu_pesan === 'function') {
                adb.pemicu_pesan();
            } else {
                log.error("Fungsi pemicu_pesan tidak ditemukan di adb.js!");
            }
        }
    }, 500);
}

module.exports = { test };