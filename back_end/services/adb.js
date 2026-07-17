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
        log.info(`Membuka WhatsApp, melampirkan foto, dan menyisipkan caption secara instan...`);
        
        // PERBAIKAN: Membungkus seluruh perintah "am start..." dengan tanda kutip ganda (")
        // dan menggunakan kutip tunggal (') untuk isi string, agar spasi tidak mematahkan perintah ADB.
        const cmd_share_foto = `adb shell "am start -a android.intent.action.SEND -t image/jpeg --eu android.intent.extra.STREAM 'file://${filepath}' -e android.intent.extra.TEXT '${pesan_wa}' -p com.whatsapp --es jid '${whatsappJid}'"`;
        await execute_command(cmd_share_foto);
        
        // Jeda 3 detik agar UI layar preview WA terbuka penuh
        setTimeout(async () => {
            log.info("Menekan tombol kirim foto + caption...");
            
            // PERBAIKAN: Kita kembali menggunakan tap karena ini adalah cara yang paling anti-gagal
            // untuk resolusi HP Anda, dibanding menggunakan sistem fokus UI (TAB + ENTER).
            const kirimFoto = await execute_command(`adb shell input tap 1330 2800`);
            
            if (kirimFoto.sukses) {
                log.success("Foto dan caption darurat berhasil dikirim bersamaan!");
            } else {
                log.error("Gagal mengirim perintah tap", kirimFoto.error);
            }
        }, 3000);

    } else {
        log.info(`Mencoba membuka room chat WhatsApp standar (Tanpa Foto)...`);
        const cmd_wadirect = `adb shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;
        await execute_command(cmd_wadirect);

        // Jika tidak ada foto, kita masih butuh ngetik perlahan
        setTimeout(async () => {
            log.info("Mengetik pesan darurat...");
            await write_message(pesan_wa);
            
            setTimeout(async () => {
                const kirimTeks = await execute_command(`adb shell input keyevent 66`);
                if (kirimTeks.sukses) {
                    log.success("Pesan teks darurat berhasil dikirim!");
                }
            }, 500);
        }, 2000);
    }
}

module.exports = { pemicu_telfon, pemicu_pesan, execute_command };