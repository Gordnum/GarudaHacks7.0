const { exec } = require('child_process');
const config = require('../config/device');
const log = require('./logger');
const { getLocation } = require("./location");
const { Speaker_phone } = require("./speaker"); 

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

async function write_message(teks) {
    const daftarKata = teks.split(' ');
    for (let i = 0; i < daftarKata.length; i++) { 
        await execute_command(`adb shell input text "${daftarKata[i]}"`);
        if (i < daftarKata.length - 1) {
            await execute_command(`adb shell input text "%s"`);
        }
        await new Promise(resolve => setTimeout(resolve, 150));
    }
}

async function pemicu_pesan() {
    let nomor_tujuan = config.NOMOR_TELFON;
    if (!nomor_tujuan) {
        log.error("Tidak menemukan nomor telefon di konfigurasi!");
        return;
    }

    if (nomor_tujuan.startsWith('0')) {
        nomor_tujuan = '62' + nomor_tujuan.slice(1);
    }

    const whatsappJid = `${nomor_tujuan}@s.whatsapp.net`; 
    const link_lokasi = await getLocation(); 
    const pesan_wa = `PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM: Terjadi sebuah kejahatan di lokasi yang diberikan, TOLONG SEGERA KE LOKASI: ${link_lokasi}`;

    log.info(`Mencoba membuka room chat WhatsApp...`);
    const cmd_wadirect = `adb shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;

    const openChat = await execute_command(cmd_wadirect);
    if (!openChat.sukses) {
        log.error("Gagal membuka layar chat WhatsApp", openChat.error);
        return;
    }

    log.success("WhatsApp room chat berhasil terbuka!");

    setTimeout(async () => {
        log.info("Mulai mengetik pesan secara bertahap...");
        await write_message(pesan_wa);
        log.success("Selesai mengetik seluruh pesan!");

        setTimeout(async () => {
            log.info("Menekan tombol kirim otomatis...");
            const kirim = await execute_command(`adb shell input keyevent 66`);
            if (kirim.sukses) {
                log.success("Pesan darurat berhasil diketik dan dikirim!");
            } else {
                log.error("Gagal mengirimkan keyevent kirim", kirim.error);
            }
        }, 500);
    }, 2500);
}

async function pemicu_telfon() {
    const nomor_darurat = config.NOMOR_TELFON;
    if (!nomor_darurat) {
        log.error("NOMOR_TELFON tidak ditemukan di konfigurasi");
        return;
    }

    log.info("Menjalankan rangkaian eksekusi telepon ");
    const cmd_telfon = `adb shell "input keyevent 3; sleep 0.2; input keyevent 5; sleep 0.3; for i in \\\$(seq 1 20); do input keyevent 67; done; input text '${nomor_darurat}'"`;
    
    await execute_command(cmd_telfon);
    log.success("Dialer siap dan nomor telah diketik!");

    log.info("Menekan tombol Panggil...");
    const callRes = await execute_command("adb shell input keyevent 5");

    if (callRes.sukses) {
        log.success("Panggilan sudah dipicu!");
        setTimeout(async () => {
            await Speaker_phone(); // Berjalan aman tanpa lempar parameter kosong
            setTimeout(() => {
                log.info("Memotong layar untuk kirim WhatsApp...");
                pemicu_pesan();
            }, 1000);
        }, 1500);
    } else {
        log.error("Gagal menekan tombol panggil", callRes.error);
    }
}

module.exports = { pemicu_telfon, pemicu_pesan, execute_command };