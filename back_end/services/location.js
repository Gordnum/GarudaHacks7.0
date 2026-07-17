const { exec } = require('child_process');
const config = require('../config/device');
const log = require('./logger');

const ADB_TARGET = config.ADB_TARGET || 'localhost:5555';

function execute_command(cmd) { 
    const command_adb = cmd.startsWith('adb') ? cmd.replace('adb', `adb -s ${ADB_TARGET}`) : cmd; 
    return new Promise((resolve) => { 
        exec(command_adb, (err, stdout) => {
            if (err) resolve({ sukses: false, error: err.message, stdout });
            else resolve({ sukses: true, output: stdout });
        });
    });
}

async function getLocation() {
    log.info("Mengambil lokasi akurat langsung dari GPS Android via ADB...");
    
    try {
        const rawData = await execute_command("adb shell dumpsys location"); 
        const outputText = rawData.output || "";
        
        const regex = /last location=Location\[\w+\s+([\d.-]+),([\d.-]+)/; 
        const match = outputText.match(regex); 
        
        if (match && match[1] && match[2]) { 
            const lat = match[1];
            const lng = match[2];
            log.success(`Sukses mendapatkan koordinat GPS Fisik: ${lat}, ${lng}`);
            return `https://maps.google.com/?q=${lat},${lng}`; 
        }
    } catch (error) {
        log.error("Gagal membaca GPS internal:", error.message); 
    }

    log.info("GPS internal kosong/nonaktif, beralih ke IP-API sebagai cadangan.");
    try {
        const response = await fetch("http://ip-api.com/json/");
        if (response.ok) {
            const data = await response.json();
            if (data && data.status === 'success') {
                return `https://maps.google.com/?q=${data.lat},${data.lon}`;
            }
        }
    } catch (e) {}

    return `https://maps.google.com/?q=${config.KORDINAT_X},${config.KORDINAT_Y}`;
}

module.exports = { getLocation };