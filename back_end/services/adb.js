const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/device');
const log = require('./logger');

function pemicu_pesan() {
    let nomor_darurat = config.NOMOR_TELFON;
    if(nomor_darurat.startsWith('0')) {
        nomor_darurat = '62' + nomor_darurat.slice(1);
    }

    const pesan_template = "PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM, terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN!";
    const pesan_encoded = encodeURIComponent(pesan_template);

    log.info("Membuka WhatsApp dan menempelkan pesan secepat kilat...");

    // Intent ini langsung mengirimkan text yang ter-encode ke draft chat nomor tujuan
    const cmd_wa = `adb -s localhost:5555 shell am start -a android.intent.action.VIEW -d "https://api.whatsapp.com/send?phone=${nomor_darurat}&text=${pesan_encoded}" -p com.whatsapp`;
    
    exec(cmd_wa, (err) => {
        if (err) {
            log.error("Gagal membuka whatsapp", err.message);
            return;
        }
        log.success("WhatsApp terbuka dengan pesan instan!");
        
        setTimeout(() => {
            log.info("Menembakkan tombol kirim...");
            
            // Mengirimkan navigasi DPAD_RIGHT (22) secara simultan lalu ENTER (66) untuk langsung menembak tombol kirim hijau di WA
            const kirim_cepat_cmd = `adb -s localhost:5555 shell "input keyevent 22 && input keyevent 22 && input keyevent 66"`;
            
            exec(kirim_cepat_cmd, (err) => {
                if (err) {
                    log.error("Gagal mengirim", err.message);
                    return;
                }
                log.success("✅ Pesan WhatsApp sukses terkirim secepat kilat!");
            });
        }, 600); // Hanya butuh 0.6 detik untuk render chat sebelum di-send!
    });
}

function pemicu_telfon() {
    const nomor_darurat = config.NOMOR_TELFON;
    
    log.info("Menutup sisa aplikasi dialer lama...");
    exec(`adb -s localhost:5555 shell am force-stop com.samsung.android.dialer`, () => {
        
        log.info("Membuka aplikasi dialer HP via adb...");
        const cmd_telfon = `adb -s localhost:5555 shell am start -a android.intent.action.DIAL`;

        exec(cmd_telfon, (err) => {
            if (err){
                log.error("Gagal membuka aplikasi dialer", err.message);
                return;
            }

            setTimeout(() => {
                log.info(`Mengetik nomor target: ${nomor_darurat}...`);
                exec(`adb -s localhost:5555 shell input text ${nomor_darurat}`, (err) => {
                    if (err){
                        log.error("Gagal mengetik nomor: ", err.message);
                        return;
                    }

                    setTimeout(() => {
                        log.info("Menekan tombol telefon (CALL)...");
                        exec(`adb -s localhost:5555 shell input keyevent 5`, (err) => {
                            if (err) {
                                log.error("Gagal menekan tombol: ", err.message);
                                return;
                            }
                            log.success("Panggilan keluar berhasil dipicu!");
                            setTimeout(() => {
                                log.info("Telepon sudah jalan di background, langsung alihkan ke WhatsApp...");
                                pemicu_pesan();
                            }, 500);
                        });
                    }, 400); 
                });
            }, 500); 
        });
    });
}

module.exports = { pemicu_telfon, pemicu_pesan };