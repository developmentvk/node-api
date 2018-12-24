const winston = require('winston');

module.exports = (req, res, next) => {
    let write = res.write;
    let end = res.end;
    let chunks = [];

    let method = req.method;
    let url = `${req.headers['host']}${req.originalUrl}`;
    let authorization = req.headers['x-access-token'] ? ` JWT Token : ${req.headers['x-access-token']}` : '';
    let contentType = req.headers['content-type'] ? ` Content Type : ${req.headers['content-type']}` : '';
    let userAgent = req.headers['user-agent'] ? ` Browser : ${req.headers['user-agent']}` : '';
    let params = req.params ? ` Params : ${req.params}` : '';
    params += req.query ? ` Query : ${req.query}` : '';
    params += req.body ? ` Body : ${req.body}` : '';
    let log = `[${method}] @ ${url}${authorization}${contentType}${userAgent}${params}`;
    winston.info('*** ==== | Request Start | ==== ***');
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
        let body = Buffer.concat(chunks).toString('utf8');
        // if (body.length > 0) { winston.info(`Response : ${body}`); }
    });

    winston.info(`*** ==== | Request End with Status Code: ${res.statusCode} | ==== ***`);

    next();
};