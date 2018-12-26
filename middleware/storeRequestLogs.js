const winston = require('winston');
const ip = require('ip');
const ipAddress = ip.address();

module.exports = (req, res, next) => {
    let start_time = new Date().getTime();
    let printResponse = false;
    let write = res.write;
    let end = res.end;
    let chunks = [];
    let elapsedTime = '';
    let method = req.method;
    let url = `${req.headers['host']}${req.originalUrl}`;
    let authorization = req.headers['x-access-token'] ? ` JWT Token : ${req.headers['x-access-token']}` : '';
    let contentType = req.headers['content-type'] ? ` Content Type : ${req.headers['content-type']}` : '';
    let userAgent = ""; //req.headers['user-agent'] ? ` Browser : ${req.headers['user-agent']}` : '';
    let params = req.params.length > 0 ? ` Params : ${JSON.stringify(req.params)}` : '';
    params += req.query.length > 0 ? ` Query : ${JSON.stringify(req.query)}` : '';
    params += req.body.length > 0 ? ` Body : ${JSON.stringify(req.body)}` : '';
    let log = `${ipAddress}: [${method}] @ ${url}${authorization}${contentType}${userAgent}${params}`;
    winston.info('*** ==== | Request Started | ==== ***');
    winston.info(log);
    res.write = function newWrite(chunk) {
        chunks.push(chunk);
        write.apply(res, arguments);
    };

    res.end = function newEnd(chunk) {
        if (chunk) { chunks.push(chunk); }
        end.apply(res, arguments);
    };

    res.once('finish', function logIt() {
        if(chunks.length > 0 && printResponse == true)
        {
            let body = Buffer.concat(chunks).toString('utf8');
            if (body.length > 0) { winston.info(`Response : ${body}`); }
        }
        elapsedTime = new Date().getTime() - start_time + 'ms';
        winston.info(`*** ==== | Request Completed with Status Code: ${res.statusCode} & Elapsed Time : ${elapsedTime} | ==== ***`);
    });

    next();
};