const { exec } = require('child_process');
const config = require('../config/device');
const log = require('./logger');

function jalankanCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) resolve({ sukses: false, error: err.message });
            else resolve({ sukses: true, output: stdout });
        });
    });
}

async function ketikTeksBertahap(teks) {
    const kataKata = teks.split(' ');
    
    for (let i = 0; i < kataKata.length; i++) {
        const kataAman = kataKata[i].replace(/ /g, '%s');
        
        await jalankanCommand(`adb shell input text "${kataAman}"`);
        
        if (i < kataKata.length - 1) {
            await jalankanCommand(`adb shell input text "%s"`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 150));
    }
}

async function pemicu_pesan() {
    let nomor_tujuan = config.NOMOR_TELFON;
    if (!nomor_tujuan) {
        log.error("NOMOR_TELFON tidak ditemukan di konfigurasi!");
        return;
    }

    if (nomor_tujuan.startsWith('0')) {
        nomor_tujuan = '62' + nomor_tujuan.slice(1);
    }

    const whatsappJid = `${nomor_tujuan}@s.whatsapp.net`;
    const link_lokasi = "https://www.google.com/maps?q=-6.2574,106.6183";
    const pesan_mentah = `PESAN OTOMATIS: Terjadi kejahatan di lokasi ini! TOLONG SEGERA KE LOKASI: ${link_lokasi}`;

    log.info(`[WA] Membuka room chat WhatsApp...`);
    const cmdOpenChat = `adb shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;

    const openChat = await jalankanCommand(cmdOpenChat);
    if (!openChat.sukses) {
        log.error("Gagal membuka layar chat WhatsApp", openChat.error);
        return;
    }

    log.success("WhatsApp room chat berhasil terbuka!");

    setTimeout(async () => {
        log.info("[WA] Mulai mengetik pesan secara bertahap...");
        
        await ketikTeksBertahap(pesan_mentah);
        
        log.success("[WA] Selesai mengetik seluruh pesan!");

        setTimeout(async () => {
            log.info("[WA] Menekan tombol kirim otomatis...");
            const kirim = await jalankanCommand(`adb shell input keyevent 66`);
            
            if (kirim.sukses) {
                log.success("✅ [SUKSES VISUAL] Pesan darurat berhasil diketik dan dikirim!");
            } else {
                log.error("Gagal mengirimkan keyevent kirim", kirim.error);
            }
        }, 500);

    }, 2500);
}

async function pemicu_telfon() {
    const nomor_darurat = config.NOMOR_TELFON;

    if (!nomor_darurat) {
        log.error("NOMOR_TELFON tidak ditemukan di config!");
        return;
    }

    log.info(`[TELP] Memulai panggilan langsung ke ${nomor_darurat}...`);
    
    const cmdCall = `adb shell am start -a android.intent.action.CALL -d tel:${nomor_darurat}`;
    const callRes = await jalankanCommand(cmdCall);

    if (!callRes.sukses) {
        log.error("Gagal melakukan panggilan langsung", callRes.error);
    } else {
        log.success("Panggilan keluar berhasil dipicu!");
    }
}

module.exports = { pemicu_telfon, pemicu_pesan };