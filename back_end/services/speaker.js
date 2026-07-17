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

async function Speaker_phone() {
    log.info("Mengatur volume perangkat ke tingkat maksimal..."); 
    await execute_command("adb shell media volume --stream 3 --set 15"); 
    await execute_command("adb shell media volume --stream 0 --set 5");  

    log.info("Mengetuk tombol Speaker di layar UI Panggilan..."); 
    await execute_command("adb shell input tap 380 2095"); 

    log.info("Menyuntikkan suara peringatan darurat...");
    const pesanSuara = "Peringatan. Terjadi situasi darurat di lokasi ini. Kontak terdekat sedang dihubungi.";
    await execute_command(`adb shell am start -a android.intent.action.VIEW -d "google-tts://speak?text=${encodeURIComponent(pesanSuara)}"\n`);
    
    log.success("Mode Loudspeaker & Suara Peringatan Aktif!");
}

module.exports = { Speaker_phone };