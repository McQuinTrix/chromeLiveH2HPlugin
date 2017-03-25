chrome.storage.local.get("ajax",function(data){
    var stuff = data.ajax;
    if(stuff.tosend && location.host === stuff.local && location.pathname.indexOf("index") >= 0){
       callAjax({
            url: stuff.url + "h2h_data/h2h_invitees",
            type: 'POST',
            dataType: 'json',
            data: stuff.obj,
            contentType: "application/json; charset=utf-8",
            callback: function(){
                console.info("Invites sent out! - LiveH2H Meetings")
            }
        })
        chrome.storage.local.set({"ajax":{tosend:false}});
    }
})

function callAjax(obj){
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open(obj.type, obj.url, true);
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            obj.callback(xmlhttp.responseText);
        }else{
            if(obj.hasOwnProperty("errorCall")){
                obj.errorCall(xmlhttp.responseText);
            }
        }
    }
    if(obj.hasOwnProperty("contentType")){
        xmlhttp.setRequestHeader('Content-Type', obj.contentType);
    }
    xmlhttp.send(obj.data);
}

