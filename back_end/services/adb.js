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

// Menerima parameter 'filepath'
async function pemicu_telfon(filepath = null) {
    const nomor_darurat = config.NOMOR_TELFON;
    if (!nomor_darurat) {
        log.error("NOMOR_TELFON tidak ditemukan di konfigurasi");
        return;
    }

    log.info("Menjalankan rangkaian eksekusi telepon...");
    const cmd_telfon = `adb shell "input keyevent 3; sleep 0.2; input keyevent 5; sleep 0.3; for i in \\$(seq 1 20); do input keyevent 67; done; input text '${nomor_darurat}'"`;
    
    await execute_command(cmd_telfon);
    log.success("Dialer siap dan nomor telah diketik!");

    log.info("Menekan tombol Panggil...");
    const callRes = await execute_command("adb shell input keyevent 5");

    if (callRes.sukses) {
        log.success("Panggilan sudah dipicu!");
        setTimeout(async () => {
            await Speaker_phone(); 
            setTimeout(() => {
                log.info("Memotong layar untuk kirim WhatsApp...");
                // Lanjutkan rantai ke fungsi pesan dengan membawa foto
                pemicu_pesan(filepath); 
            }, 1000);
        }, 1500);
    } else {
        log.error("Gagal menekan tombol panggil", callRes.error);
    }
}

// Menerima parameter 'filepath'
async function pemicu_pesan(filepath) {
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
    const pesan_wa = `PESAN OTOMATIS DARI SISTEM: Terjadi sebuah kejahatan di lokasi yang diberikan, TOLONG SEGERA KE LOKASI: ${link_lokasi}`;

    if (filepath) {
        log.info(`Membuka WhatsApp dan melampirkan foto bukti...`);
        // Membuka WA langsung ke layar "Kirim Gambar" ke kontak tujuan
        const cmd_share_foto = `adb shell am start -a android.intent.action.SEND -t image/jpeg --eu android.intent.extra.STREAM "file://${filepath}" -p com.whatsapp --es jid "${whatsappJid}"`;
        await execute_command(cmd_share_foto);
    } else {
        log.info(`Mencoba membuka room chat WhatsApp standar...`);
        const cmd_wadirect = `adb shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;
        await execute_command(cmd_wadirect);
    }

    // Jeda 3 detik agar layar preview gambar WA terbuka dan merender penuh sebelum mulai ngetik
    setTimeout(async () => {
        log.info("Mulai mengetik pesan di kolom caption...");
        await write_message(pesan_wa);
        log.success("Selesai mengetik seluruh pesan!");

        // Jeda singkat 0.5 detik setelah ngetik, lalu langsung tembak tombol kirim
        setTimeout(async () => {
            log.info("Menekan tombol kirim otomatis...");
            
            if (filepath) {
                // KHUSUS FOTO + CAPTION:
                // Hilangkan keyevent 66 agar teks tidak terkirim terpisah.
                // Langsung gunakan tap ke tombol panah hijau WA di koordinat 1330 2800.
                const kirimFoto = await execute_command(`adb shell input tap 1330 2800`);
                if (kirimFoto.sukses) {
                    log.success("Foto beserta caption berhasil dikirim serentak!");
                } else {
                    log.error("Gagal menekan tombol kirim foto", kirimFoto.error);
                }
            } else {
                // KHUSUS TEKS SAJA (Jika kebetulan tidak ada foto):
                const kirimTeks = await execute_command(`adb shell input keyevent 66`);
                if (kirimTeks.sukses) {
                    log.success("Pesan darurat teks berhasil dikirim!");
                } else {
                    log.error("Gagal mengirim pesan teks", kirimTeks.error);
                }
            }
        }, 500);
    }, 3000); 
}

module.exports = { pemicu_telfon, pemicu_pesan, execute_command };