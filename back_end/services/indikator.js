const config = require('../config/device');
const { pemicu_telfon } = require('./adb'); // Pastikan impor fungsi ini benar
const log = require('./logger');

function test() {
    let nilaiSensor = 0;
    let sudahDipicu = false;
    log.info("\nSIMULASI SENSOR DIMULAI");
    log.alert(`Batas Maksimal set di angka: ${config.BATAS_MAKSIMAL}`);
    
    const intervalId = setInterval(() => {
        if (sudahDipicu) {
            clearInterval(intervalId);
            return;
        }

        nilaiSensor += 10;
        log.info(`[SIMULASI] Nilai Sensor Saat Ini: ${nilaiSensor}`);

        if (nilaiSensor >= config.BATAS_MAKSIMAL) {
            sudahDipicu = true;
            clearInterval(intervalId);
            log.alert("Threshold melebihi batas, BERSIAP MENELFON\n");
            pemicu_telfon(); // Memanggil fungsi dari adb.js yang benar
        }
    }, 1000);
}

module.exports = { test };