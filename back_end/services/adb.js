// services/adb.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/device');
const log = require('./logger');

// 💡 FUNGSI ESCAPE DARI MAS RUSDI (Dioptimasi untuk format printf)
function escapeUntukADBInput(teks) {
    return teks
        .replace(/\\/g, '\\\\')    // backslash duluan, biar tidak double-escape
        .replace(/ /g, '%s')       // spasi jadi %s (akan diterjemahkan oleh printf) 
        .replace(/\?/g, '\\?')     // escape tanda tanya
        .replace(/!/g, '\\!')
        .replace(/,/g, '\\,');
}

function pemicu_pesan() {
    let nomor_darurat = config.NOMOR_TELFON;
    if(nomor_darurat.startsWith('0')) {
        nomor_darurat = '62' + nomor_darurat.slice(1);
    }

    const whatsappJid = `${nomor_darurat}@s.whatsapp.net`;
    const link_lokasi = "http://googleusercontent.com/maps.google.com/?q=-6.2574,106.6183";
    
    // Teks mentah lengkap dengan tanda baca sensitif
    const pesan_mentah = `PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM, terdapat sebuah tindak kejahatan di lokasi ini TOLONG SEGERA KE LOKASI YANG DI BERIKAN! ${link_lokasi}`;

    // 🚀 Lakukan escape karakter secara detail lewat fungsi racikan Mas Rusdi
    const pesan_terproteksi = escapeUntukADBInput(pesan_mentah);
    log.info("Memproses proteksi karakter teks darurat...");

    log.info("Membuka chat WhatsApp via Android Component Intent...");
    const cmdOpenChat = `adb -s localhost:5555 shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;

    exec(cmdOpenChat, (err) => {
        if (err) return log.error("Gagal membuka chat WhatsApp", err.message);
        log.success("WhatsApp room chat terbuka!");

        // Jeda 2.5 detik agar room chat siap menerima input text
        setTimeout(() => {
            log.info("Mengetik pesan darurat via printf command bypass...");
            
            const cmdKetikSafe = `adb -s localhost:5555 shell "input text \\\$(printf '%s' '${pesan_terproteksi}')"`;

            exec(cmdKetikSafe, (err) => {
                if (err) {
                    log.error("Gagal mengetik pesan", err.message);
                    return;
                }
                log.success("Teks berhasil diketik 100% akurat!");

                // Jeda 1 detik lalu pencet tombol kirim (ENTER)
                setTimeout(() => {
                    log.info("Menekan tombol kirim...");
                    exec(`adb -s localhost:5555 shell input keyevent 66`, (err) => {
                        if (err) return log.error("Gagal mengirim", err.message);
                        log.success("✅ [PERFEK KILAT] Pesan sukses terkirim lewat jalur escape!");
                    });
                }, 1000);
            });
        }, 2500); 
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

                            // Jeda pendek setengah detik langsung lempar ke WhatsApp
                            setTimeout(() => {
                                log.info("Telepon berjalan, mengalihkan ke proses kirim pesan...");
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