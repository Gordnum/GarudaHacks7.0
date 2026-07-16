const express = require('express');
const app = express();
const config = require('./config/device');
app.use(express.json());

app.get('/fetch-signal', (req, res) => {
    console.log("Menerima sinyal dari curl");
    res.json({success: true, message: "Sinyal berhasil dikirim!"});
});

app.listen(config.PORT, () => {
    console.log(`Server aktif di port ${PORT}`);
});