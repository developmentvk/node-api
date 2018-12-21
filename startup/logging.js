const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf } = format;
const ip = require('ip');
const fs = require('fs');
const path = require('path');
const logDir = 'logs';
require('express-async-errors');

const logfile = path.join(logDir, 'logfile.log');
const uncaughtExceptions = path.join(logDir, 'uncaughtExceptions.log');

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const errorStackTracerFormat = winston.format(info => {
    info.full_trace = '';
    if (info.meta && info.meta instanceof Error) {
        info.full_trace = `: ${info.meta.stack}`;
    }
    return info;
});

module.exports = function () {

    createLogger({
        level: 'info',
        format: combine(
            winston.format.splat(),
            errorStackTracerFormat(),
            label({ label: ip.address() }),
            timestamp({
                format: 'YYYY-MM-DD h:mm:ss A'
            }),
            printf(info => {
                return `${info.timestamp} [${info.label}] ${info.level} : ${info.message} ${info.full_trace}`;
            })
        ),
        transports: [
            new transports.Console({
                handleExceptions: true,
                format: winston.format.simple()
            }),
            new transports.File({ filename: uncaughtExceptions, handleExceptions: true })
        ],
        exitOnError: false
    });

    process.on('unhandledRejection', (ex) => {
        throw ex;
    });

    winston.configure({
        format: combine(
            winston.format.splat(),
            errorStackTracerFormat(),
            label({ label: ip.address() }),
            timestamp({
                format: 'YYYY-MM-DD h:mm:ss A'
            }),
            printf(info => {
                return `${info.timestamp} [${info.label}] ${info.level} : ${info.message} ${info.full_trace}`;
            })
        ),
        transports: [
            new transports.File({ filename: logfile })
        ]
    });
}