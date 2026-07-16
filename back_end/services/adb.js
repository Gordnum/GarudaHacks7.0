// services/adb.js
const { exec } = require('child_process');
const config = require('../config/device');
const log = require('./logger');

// Helper untuk menjalankan perintah ADB secara async/promise agar kode lebih rapi
function jalankanAdb(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) resolve({ sukses: false, error: err.message });
            else resolve({ sukses: true, output: stdout });
        });
    });
}

async function pemicu_pesan() {
    let nomor_tujuan = config.NOMOR_TELFON;
    if (!nomor_tujuan) return log.error("NOMOR_TELFON tidak ditemukan di config!");

    if (nomor_tujuan.startsWith('0')) {
        nomor_tujuan = '62' + nomor_tujuan.slice(1);
    }

    const targetDevice = config.CONNECTED_DEVICE_WA || 'RF8M82DNY8Y';
    const whatsappJid = `${nomor_tujuan}@s.whatsapp.net`;
    const link_lokasi = "https://www.google.com/maps?q=-6.2574,106.6183";
    const pesan_mentah = `PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM, terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN! ${link_lokasi}`;

    log.info(`[WA] Mengirim pesan ke ${nomor_tujuan} via Clipboard & Intent...`);

    // 1. Set text langsung ke clipboard Android (Menghindari bug 'input text' pada karakter khusus)
    // Menggunakan base64 agar teks aman dari gangguan shell bash/adb
    const base64Pesan = Buffer.from(pesan_mentah).toString('base64');
    await jalankanAdb(`adb -s ${targetDevice} shell "echo ${base64Pesan} | base64 -d | termux-clipboard-set" 2>/dev/null || adb -s ${targetDevice} shell service call clipboard 2 i32 1 s16 \\"${pesan_mentah}\\"`);

    // 2. Buka langsung room chat WhatsApp
    const cmdOpenChat = `adb -s ${targetDevice} shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;
    const openChat = await jalankanAdb(cmdOpenChat);
    if (!openChat.sukses) return log.error("Gagal membuka chat WhatsApp", openChat.error);

    // Jeda 1.5 detik agar WhatsApp siap di foreground
    setTimeout(async () => {
        log.info("[WA] Melakukan Paste dan Mengirim...");
        
        // Simulasikan Tekan tombol PASTE (Ctrl+V) -> Keyevent untuk paste di Android modern
        // Jika device tidak mendukung keyevent 279, kita gunakan kombinasi long press / klik, 
        // namun alternatif paling aman universal untuk 'paste' setelah set clipboard adalah mengirim keyevent khusus:
        await jalankanAdb(`adb -s ${targetDevice} shell input keyevent 279`); // 279 = KEYCODE_PASTE
        
        // Jeda sebentar lalu tekan ENTER/KIRIM (Keyevent 66)
        setTimeout(async () => {
            await jalankanAdb(`adb -s ${targetDevice} shell input keyevent 66`);
            log.success("✅ [WA] Pesan sukses terkirim!");
        }, 500);

    }, 1500);
}

async function pemicu_telfon() {
    const nomor_darurat = config.NOMOR_TELFON;
    const targetDevice = config.CONNECTED_DEVICE_TELP || 'RF8M82DNY8Y';

    if (!nomor_darurat) return log.error("NOMOR_TELFON tidak ditemukan di config!");

    log.info(`[TELP] Memulai panggilan langsung ke ${nomor_darurat}...`);
    
    // Dibandingkan membuka dialer lalu mengetik (lama & ribet), langsung picu action CALL 
    // Ini akan langsung menekan tombol panggil secara instan
    const cmdCall = `adb -s ${targetDevice} shell am start -a android.intent.action.CALL -d tel:${nomor_darurat}`;
    const callRes = await jalankanAdb(cmdCall);
    
    if (!callRes.sukses) {
        log.error("Gagal melakukan panggilan langsung, mencoba metode alternatif dialer...", callRes.error);
        // Alternatif jika permission ACTION_CALL dilarang oleh sistem
        await jalankanAdb(`adb -s ${targetDevice} shell am start -a android.intent.action.DIAL -d tel:${nomor_darurat}`);
        setTimeout(() => jalankanAdb(`adb -s ${targetDevice} shell input keyevent 5`), 800);
    } else {
        log.success("[TELP] Panggilan berhasil dipicu!");
    }

    // SIMULTAN: Jangan tunggu panggilan selesai/jeda lama. 
    // Berikan jeda 2.5 detik agar sistem telepon selesai menginisiasi dial, lalu tabrak dengan WhatsApp ke foreground.
    setTimeout(() => {
        log.info("[SIMULTAN] Mengalihkan ke WhatsApp untuk mengirim koordinat...");
        pemicu_pesan();
    }, 2500);
}

module.exports = { pemicu_telfon, pemicu_pesan };