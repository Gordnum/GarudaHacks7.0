const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const config = require('./config/device');
const adb = require('./services/adb'); // Impor modul adb
const log = require('./services/logger');

// Naikkan limit JSON untuk menerima file base64 gambar
app.use(express.json({ limit: '10mb' }));

app.post('/fetch-signal', async (req, res) => {
    const { score, level, action, evidence_b64 } = req.body;
    
    log.info(`\n[AI RECEIVER] Menerima Data Ancaman Baru`);
    log.info(`Aksi: ${action} | Score: ${score} | Level: ${level}`);

    // Jika level mencapai CRITICAL atau score melewati batas maksimal
    if (level === "CRITICAL" || score >= config.BATAS_MAKSIMAL) { //[cite: 2]
        log.alert("DETEKSI ANCAMAN NYATA DARI AI COMPILED!");
        
        // 1. Simpan Gambar ke Galeri Internal HP
        if (evidence_b64) {
            try {
                // Termux menyimpan direktori HP di /sdcard/ atau ~/storage/shared/
                const targetDir = '/sdcard/Download/Evidence_Kejahatan';
                
                // Buat folder jika belum ada
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                // Tulis file
                const filepath = path.join(targetDir, `Bukti_${Date.now()}.jpg`);
                fs.writeFileSync(filepath, Buffer.from(evidence_b64, 'base64'));
                log.success(`[EVIDENCE] Foto bukti berhasil diselamatkan ke: ${filepath}`);

                // Panggil ADB untuk me-refresh galeri agar foto langsung muncul
                if (adb && typeof adb.execute_command === 'function') {
                    await adb.execute_command(`adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file://${filepath}`);
                }
            } catch (err) {
                log.error("Gagal menyimpan foto bukti", err.message);
            }
        }

        // 2. Jalankan pemicu Adb Telepon & WA[cite: 1]
        try {
            if (adb && typeof adb.pemicu_telfon === 'function') {
                adb.pemicu_telfon(); 
            } else {
                log.error("Fungsi pemicu_telfon tidak ready");
            }
        } catch (err) {
            log.error("Gagal memicu adb", err.message);
        }
    }

    res.json({ success: true, message: "Data ancaman & bukti berhasil diproses" });
});

app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`Server Node.js aktif di port ${config.PORT} (Listening all interfaces)`);
});