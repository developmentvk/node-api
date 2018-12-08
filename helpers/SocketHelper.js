const i18n = require("i18n");
function successMessage(res, template = '', httpCode = 200, dataArr = null) {
    let output = new Object();
    output.message = i18n.__(template);
    output.data = dataArr;
    return res.status(httpCode).send(output);
}

function errorMessage(res, template = null, object = false, httpCode = 422) {
    if (object == true) {
        delete (template.path)
        delete (template.type)
        delete (template.context)
        return res.status(httpCode).send(template);
    } else {
        let output = new Object();
        output.message = i18n.__(template);
        return res.status(httpCode).send(output);
    }
}

exports.successMessage = successMessage;
exports.errorMessage = errorMessage;
