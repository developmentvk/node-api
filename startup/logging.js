const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf } = format;
const ip = require('ip');
require('express-async-errors');

module.exports = function() {

    createLogger({
        level: 'info',
        format: combine(
            label({ label: ip.address() }),
            timestamp(),
            printf(info => {
                return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
            })
        ),
        transports: [
            new transports.Console({
                handleExceptions: true,
                format: winston.format.simple()
            }),
            new transports.File({ filename: 'uncaughtExceptions.log', handleExceptions : true })
        ],
        exitOnError: false
    });

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
            new transports.File({ filename: 'logfile.log' })
        ]
    });
}