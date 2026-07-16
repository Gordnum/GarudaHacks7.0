const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../konfigurasi/device');
const log = require('./logger');

function pemicu_telfon() {
    const nomor_darurat = config.NOMOR_TELFON;
    log.info("menmbuka aplikasi dialer HP via adb...");
    const cmd_telfon = `adb -s localhost:5555 shell am start -a android.intent.action.DIAL`;

    exec(cmd_telfon, (err) => {
        if (err){
            log.error("gagal membuka aplikasi dialer", err.message);
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
                    log.info("Menekan tombol telefon");
                    exec(`adb -s localhost:5555 shell input keyevent 5`, (err) => {
                        if (err) {
                            log.error("Gagal mengetik tombol: ", err.message);
                            return;
                        }
                        log.success("Nomor berhasil di panggil");
                    });
                }, 400); //kasih jeda 400 ms biar lebih cepat
            })
        }, 500);
    });
}

module.exports = {
    pemicu_telfon
};