const winston = require('winston');
// require('winston-mongodb');
require('express-async-errors');

module.exports = function() {
  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // 
  if (process.env.NODE_ENV !== 'production') {
    winston.exceptions.handle(
      new winston.transports.Console({ colorize: true, prettyPrint: true }),
      new winston.transports.File({ filename: 'uncaughtExceptions.log' }));

      winston.add(
        new winston.transports.File({ filename: 'logfile.log' })
      );

      process.on('unhandledRejection', (ex) => {
        throw ex;
      });
  }
  
  // winston.add(winston.transports.MongoDB, { 
  //   db: 'mongodb://localhost/nodejs',
  //   level: 'info'
  // });  
}