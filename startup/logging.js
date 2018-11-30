const winston = require('winston');
const { format } = winston;
const { combine, timestamp, label, printf } = format;
const ip = require('ip');
require('express-async-errors');

module.exports = function() {
    winston.exceptions.handle(
        new winston.transports.File({ filename: 'uncaughtExceptions.log' })
    );

    process.on('unhandledRejection', (ex) => {
        throw ex;
    });

    winston.configure({
        format: combine(
            label({ label: ip.address() }),
            timestamp(),
            printf(info => {
                return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
            })
        ),
        transports: [
            new winston.transports.File({ filename: 'logfile.log' })
        ]
    });
}