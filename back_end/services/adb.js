// services/adb.js
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

    // Menggunakan format JID resmi WhatsApp untuk Android Intent
    const whatsappJid = `${nomor_darurat}@s.whatsapp.net`;
    
    // Kita buat variabel link lokasi tiruan untuk demo (atau bisa diganti dinamis)
    const link_lokasi = "http://googleusercontent.com/maps.google.com/?q=-6.2574,106.6183";

    log.info("Membuka chat WhatsApp via Android Component Intent...");

    // Membuka komponen chat room spesifik ke nomor target
    const cmd_wa = `adb -s localhost:5555 shell am start -n com.whatsapp/.Conversation -a android.intent.action.SENDTO --es jid "${whatsappJid}"`;
    
    exec(cmd_wa, (err) => {
        if (err) {
            log.error("Gagal membuka whatsapp", err.message);
            return;
        }
        log.success("WhatsApp room chat terbuka!");
        
        // Jeda 2.5 detik agar chat room termuat sempurna sebelum mulai mengetik
        setTimeout(() => {
            log.info("Mengetik bagian 1: Pembuka sistem...");
            
            // Bagian 1: Pesan Sistem
            exec(`adb -s localhost:5555 shell "input text 'PESAN INI MERUPAKAN PESAN OTOMATIS DARI SISTEM '"`, (err) => {
                if (err) return log.error("Gagal mengetik bagian 1", err.message);

                // Jeda 300ms sebelum lanjut mengetik bagian 2
                setTimeout(() => {
                    log.info("Mengetik bagian 2: Status bahaya...");
                    
                    // Bagian 2: Informasi Kejahatan
                    exec(`adb -s localhost:5555 shell "input text 'Terdapat sebuah tindak kejahatan di lokasi ini '"`, (err) => {
                        if (err) return log.error("Gagal mengetik bagian 2", err.message);

                        // Jeda 300ms sebelum mengetik link lokasi
                        setTimeout(() => {
                            log.info("Mengetik bagian 3: Tautan lokasi...");
                            
                            // Bagian 3: Instruksi & Link Google Maps
                            exec(`adb -s localhost:5555 shell "input text 'TOLONG SEGERA KE LOKASI: ${link_lokasi}'"`, (err) => {
                                if (err) return log.error("Gagal mengetik bagian 3", err.message);
                                
                                log.success("Semua bagian teks berhasil diketik dengan rapi!");

                                // Jeda 800ms setelah mengetik selesai, lalu hajar tombol kirim (ENTER)
                                setTimeout(() => {
                                    log.info("Menekan tombol kirim...");
                                    exec(`adb -s localhost:5555 shell input keyevent 66`, (err) => {
                                        if (err) {
                                            log.error("Gagal menekan tombol kirim", err.message);
                                            return;
                                        }
                                        log.success("✅ [SUKSES KILAT] Pesan WhatsApp terkirim dengan presisi!");
                                    });
                                }, 800);
                            });
                        }, 300);
                    });
                }, 300);
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

                            // Begitu tombol panggilan ditekan, tunggu 500ms lalu langsung eksekusi WhatsApp
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