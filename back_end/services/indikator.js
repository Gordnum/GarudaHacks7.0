const config = require('../config/device');
const adb = require('./adb'); 
const log = require('./logger');

function test() {
    let sensors_score = 0;
    let trigger = false;
    log.info("\nSIMULASI THREATS AI");
    
    // Memastikan mengambil BATAS_MAKSIMAL dari config/device.js
    log.alert(`Batas maksimal score di angka: ${config.BATAS_MAKSIMAL}`);
    
    const intervalId = setInterval(() => {
        if (trigger) {
            clearInterval(intervalId);
            return;
        }

        sensors_score += 10;
        log.info(`Nilai Sensor Saat Ini: ${sensors_score}`);

        if (sensors_score >= config.BATAS_MAKSIMAL) {
            trigger = true;
            clearInterval(intervalId);
            
            log.alert("Nilai score melebihi batas, ANCAMAN!\n");
            
            try {
                if (adb && typeof adb.pemicu_telfon === 'function') {
                    adb.pemicu_telfon();
                } else {
                    log.error("Fungsi pemicu_telfon tidak ditemukan atau bermasalah");
                }
            } catch (err) {
                log.error("Gagal menjalankan fungsi pemicu_telfon", err.message);
            }
        }
    }, 1000);
}

module.exports = { test };