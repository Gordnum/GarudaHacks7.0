const express = require('express');
const app = express();
const config = require('./config/device');
const adb = require('./services/adb'); // Impor langsung modul adb
const log = require('./services/logger');

app.use(express.json());

// Endpoint diubah menjadi POST untuk menerima data ancaman riil
app.post('/fetch-signal', (req, res) => {
    const { score, level, action } = req.body;
    
    log.info(`\n[AI RECEIVER] Menerima Data Ancaman Baru`);
    log.info(`Aksi: ${action} | Score: ${score} | Level: ${level}`);

    // Jika level mencapai CRITICAL atau score melewati batas maksimal
    if (level === "CRITICAL" || score >= config.BATAS_MAKSIMAL) {
        log.alert("DETEKSI ANCAMAN NYATA DARI AI COMPILED!");
        try {
            if (adb && typeof adb.pemicu_telfon === 'function') {
                adb.pemicu_telfon(); // Jalankan otomasi adb telepon + WA
            } else {
                log.error("Fungsi pemicu_telfon tidak ready");
            }
        } catch (err) {
            log.error("Gagal memicu adb", err.message);
        }
    }

    res.json({ success: true, message: "Data ancaman berhasil diproses" });
});

app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`Server Node.js aktif di port ${config.PORT} (Listening all interfaces)`);
});