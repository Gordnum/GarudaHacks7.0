const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../konfigurasi/device');
const log = require('./logger');

function pemicu_telfon() {
    const nomor_darurat = config.NOMOR_TELFON;
}