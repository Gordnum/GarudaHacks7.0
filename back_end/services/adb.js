const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/device');
const log = require('./logger');

const ADB_TARGET = "localhost:5555";

function pemicu_pesan() {
    let nomor_darurat = config.NOMOR_TELFON;
    if(nomor_darurat.startsWith('0')) nomor_darurat = '62' + nomor_darurat.slice(1); //agar berubah dari 08xxxx jadi 62xxxx

    const pesan_template = "PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM, terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN!";

    const cmdWa = `adb -s ${ADB_TARGET} shell am start -a android.intent.action.VIEW -d "https://api.whatsapp.com/send?phone=${nomor_tujuan}"`;    
    
    exec(cmdwa, () => {
        setTimeout(() => {
            const pesan = pesan.replace(/ /g, '%s');
            exec(`adb -s ${ADB_TARGET} shell input text "${pesanAman}" && adb -s ${ADB_TARGET} shell input keyevent 66`);
            log.success("pesan terkirim via termux");
        }, 2500);
    });
}

function pemicu_telfon() {
    const nomor = config.NOMOR_TELFON;
    
    exec(`adb -s ${ADB_TARGET} shell am force-stop com.samsung.android.dialer`, () => {
        exec(`adb -s ${ADB_TARGET} shell am start -a android.intent.action.DIAL`, () => {
            setTimeout(() => {
                exec(`adb -s ${ADB_TARGET} shell input text ${nomor}`, () => {
                    setTimeout(() => {
                        exec(`adb -s ${ADB_TARGET} shell input keyevent 5`);
                        log.success("Telepon lokal dipicu!");
                    }, 500);
                });
            }, 500);
        });
    });
}

module.exports = { pemicu_telfon, pemicu_pesan };