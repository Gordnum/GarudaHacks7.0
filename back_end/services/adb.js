const { exec } = require('child_process');
const config = require('../config/device');
const log = require('./logger');

function jalankanCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) resolve({ sukses: false, error: err.message, stdout });
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

    log.info("[TELP] Memaksa perangkat bangun ke Home Screen...");
    await jalankanCommand("adb shell input keyevent 3"); // Keyevent 3 = HOME Button
    
    setTimeout(async () => {
        log.info("[TELP] Membuka Dialer secara paksa menggunakan Keyevent...");
        await jalankanCommand("adb shell input keyevent 5"); // Keyevent 5 = CALL (Akan membuka dialer jika belum menelpon)

        setTimeout(async () => {
            log.info(`[TELP] Mengetik nomor darurat: ${nomor_darurat}...`);
            await jalankanCommand(`adb shell input text "${nomor_darurat}"`);

            setTimeout(async () => {
                log.info("[TELP] Memulai panggilan...");
                const callRes = await jalankanCommand("adb shell input keyevent 5");
                
                if (callRes.sukses) {
                    log.success("✅ Panggilan telepon berhasil dipicu secara visual!");
                    
                    // Setelah panggilan berhasil dipicu, lanjut panggil pengiriman pesan WhatsApp otomatis
                    setTimeout(() => {
                        log.info("[SISTEM] Beralih untuk mengirimkan pesan WhatsApp...");
                        pemicu_pesan();
                    }, 2000);
                } else {
                    log.error("Gagal menekan tombol panggil", callRes.error);
                }
            }, 800);

        }, 1200);

    }, 500);
}

module.exports = { pemicu_telfon, pemicu_pesan };