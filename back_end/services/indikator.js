const konfigurasi = require('../config/device');
const { pemicu_telfon } = require('./adb');
const log = require('./logger');

function test() {
    let nilai_sensor = 0;
    log.info("SIMULASI AI (DUMMY)");
    log.alert(`BATAS THREATS ADALAH ${konfigurasi.BATAS_ANCAMAN}`);

    const simulasi_batas = setInterval(() => {
        nilai_sensor += 10;
        log.info(`[SIMULASI] NILAI SENSOR SAAT INI : ${nilai_sensor}`);

        if(nilai_sensor >= konfigurasi.BATAS_ANCAMAN) {
            clearInterval(simulasi_batas);
            log.alert("BATAS THREATS SUDAH TERLEWAT, BERSIAP MENELFON\n");
            pemicu_telfon();
        }
    }, 500);
}

module.exports = { test };