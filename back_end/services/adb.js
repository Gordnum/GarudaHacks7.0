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

function cariPortAdb() {
    return new Promise((resolve) => {
        exec("nmap -p 30000-50000 localhost | grep 'open'", (err, stdout) => {
            if (err || !stdout) {
                resolve(null);
                return;
            }
            const baris = stdout.trim().split('\n');
            for (let b of baris) {
                if (b.includes('tcp') && b.includes('open')) {
                    const port = b.split('/')[0].trim();
                    resolve(port);
                    return;
                }
            }
            resolve(null);
        });
    });
}

async function pastikanKoneksiAdb() {
    const port = await cariPortAdb();
    if (!port) {
        log.error("Port Wireless Debugging tidak terdeteksi! Pastikan fiturnya aktif.");
        return false;
    }
    
    log.info(`Mencoba menyambungkan ke Local ADB via port: ${port}...`);
    const konek = await jalankanCommand(`adb connect 127.0.0.1:${port}`);
    
    if (konek.sukses && konek.output.includes("connected")) {
        log.success("Koneksi Local ADB berhasil mapan!");
        return true;
    }
    return false;
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
    const terhubung = await pastikanKoneksiAdb();
    if (!terhubung) return;

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
    const terhubung = await pastikanKoneksiAdb();
    if (!terhubung) return;

    const nomor_darurat = config.NOMOR_TELFON;

    if (!nomor_darurat) {
        log.error("NOMOR_TELFON tidak ditemukan di config!");
        return;
    }

    log.info(`[TELP] Membuka aplikasi dialer dengan nomor: ${nomor_darurat}...`);
    
    // Perintah alternatif yang sangat universal menggunakan skema VIEW URI
    const cmdDial = `adb shell am start -a android.intent.action.VIEW -d tel:${nomor_darurat}`;
    const dialRes = await jalankanCommand(cmdDial);

    if (!dialRes.sukses) {
        log.error("Gagal memicu layar dialer", dialRes.error);
        return;
    }

    log.success("Aplikasi dialer berhasil dipicu ke depan layar!");

    // Jeda 1.2 detik agar UI dialer terbuka penuh dan siap menerima input fisik telepon
    setTimeout(async () => {
        log.info("[TELP] Menekan tombol panggil fisik...");
        const callRes = await jalankanCommand(`adb shell input keyevent 5`);
        
        if (callRes.sukses) {
            log.success("✅ Panggilan telepon berhasil dipicu secara visual!");
        } else {
            log.error("Gagal menekan tombol panggil", callRes.error);
        }
    }, 1200);
}

module.exports = { pemicu_telfon, pemicu_pesan };