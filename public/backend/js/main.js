function formatErrorMessage(jqXHR, exception) {
    if (jqXHR.status === 0) {
        return '<p>Not connected.\nPlease verify your network connection.</p>';
    } else if (jqXHR.status == 400) {
        return '<p>Server understood the request, but request content was invalid.</p>';
    } else if (jqXHR.status == 400) {
        return '<p>Forbidden resource can\'t be accessed.</p>';
    } else if (jqXHR.status == 404) {
        return '<p>Requested page not found. [404]</p>';
    } else if (jqXHR.status == 500) {
        return '<p>Session expired, please reload the page and try again.</p>';
    } else if (jqXHR.status == 503) {
        return '<p>Service unavailable.</p>';
    } else if (exception === 'parsererror') {
        return '<p>Error.\nParsing JSON Request failed.</p>';
    } else if (exception === 'timeout') {
        return '<p>Request Time out.</p>';
    } else if (exception === 'abort') {
        return '<p>Request was aborted by the server.</p>';
    } else {
        let message = 'Uncaught Error.\n' + jqXHR.responseText;
        return message;
    }
}