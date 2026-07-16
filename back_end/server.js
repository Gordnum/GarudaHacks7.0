const express = require('express');
const app = express();

const port = 3000;
app.use(express.json());

app.get('/fetch-signal', (req, res) => {
    console.log("Menerima sinyal dari curl");
    res.json({success: true, message: "Sinyal berhasil dikirim!"});
});

app.listen(3000, () => {
    console.log(`Server aktif di port ${port}`);
});