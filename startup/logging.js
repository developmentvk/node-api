const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf } = format;
const fs = require('fs');
const path = require('path');
const dateFormat = require('dateformat');
const now = new Date();
const logDir = 'logs';
require('winston-daily-rotate-file');
require('express-async-errors');

const logFile = path.join(logDir, 'logFile-%DATE%.log');
const uncaughtExceptions = path.join(logDir, 'uncaughtException.log');

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
const transport = new (winston.transports.DailyRotateFile)({
    filename: logFile,
    datePattern: 'YYYY-MM-DD-HH',
    // frequency:"daily",
    // zippedArchive: true,
    maxSize: '20m',
    // maxFiles: '14d'
  });

module.exports = function () {
    createLogger({
        level: 'info',
        format: combine(
            winston.format.splat(),
            errorStackTracerFormat(),
            label({ label: process.env.NODE_ENV || 'local' }),
            timestamp({
                format: dateFormat(now, "yyyy-mm-dd h:MM:ss")
            }),
            printf(info => {
                return `[${info.timestamp}] ${info.label}.${info.level}: ${info.message} ${info.full_trace}`;
            })
        ),
        transports: [
            new transports.Console({
                handleExceptions: true,
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
            label({ label: process.env.NODE_ENV || 'local' }),
            timestamp({
                format: dateFormat(now, "yyyy-mm-dd h:MM:ss")
            }),
            printf(info => {
                return `[${info.timestamp}] ${info.label}.${info.level}: ${info.message} ${info.full_trace}`;
            })
        ),
        transports: [
            transport
        ]
    });
}