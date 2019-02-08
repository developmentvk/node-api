if (typeof jQuery === "undefined") {
    throw new Error("jQuery plugins need to be before this file");
}

// console.log("Output;");  
// console.log(location.hostname);
// console.log(document.domain);
// console.log("document.URL : "+document.URL);
// console.log("document.location.href : "+document.location.href);
// console.log("document.location.origin : "+document.location.origin);
// console.log("document.location.hostname : "+document.location.hostname);
// console.log("document.location.host : "+document.location.host);
// console.log("document.location.pathname : "+document.location.pathname);

let socket = io();
socket.on('connect', function () {
    console.log(`Connection Established with socket : ${session_id}`);
    socket.on('logoutSessionEvent', function (data) {
        if(data.admin_id == session_id)
        {
            window.location.replace(`${site_url}/admin/login?logout=${data.action}`);
        }
    });

    socket.on('logoutDuplicateSessionEvent', function (data) {
        if(data.company_id == session_id)
        {
            window.location.replace(`${site_url}/company/login?logout=${data.action}`);
        }
    });

    socket.on('logFilePreparedEvent', function (data) {
        $('#count_box').html(data.length);
        let html = '';
         if(data.length > 0) { 
              _.forEach(data, function(val) {  if(val) {
                html += `<p class="list-group-item">
                <a href="/admin/logs/file/${val.fileName}">${val.fileName}</a> <span class="badge bg-teal">${val.size}</span>
                </p>`;
             } } ) 
         } else {
            html = `<p class="list-group-item">${__('no_record_found')}</p>`;
         } 
         $('#message_file_box').html(html);
    });

});