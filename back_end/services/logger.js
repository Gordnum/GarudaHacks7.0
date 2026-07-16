const COLORS = {
    INFO: '\x1b[38;2;130;200;229m',
    ERROR: '\x1b[38;2;255;44;44m',
    SUCCESS: '\x1b[38;2;128;239;128m',
    ALERT: '\x1b[38;2;255;238;140m',
    RESET: '\x1b[0m'
};

function time_message() {
    const now = new Date();
    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');
    return `[${jam}:${menit}:${detik}]`;
}

const logger = {
    info: (pesan) => {
        console.log(`${time_message()} ${COLORS.INFO} | [INFO] ${pesan}${COLORS.RESET}`);
    }, 

    success: (pesan) => {
        console.log(`${time_message()} ${COLORS.SUCCESS} | [SUCCESS] ${pesan}${COLORS.RESET}`);
    },

    error: (pesan, detail = '') => {
        console.log(`${time_message()} ${COLORS.ERROR} | [ERROR] ${pesan}${COLORS.RESET}`);
        if(detail) {
            console.error(`/ Detail : ${detail}${COLORS.RESET}`);
        }
    },

    alert: (pesan) => {
        console.log(`{$time_message}() ${COLORS.ALERT} | [ALERT] ${pesan}${COLORS.RESET}`);
    }
}

module.exports = logger;