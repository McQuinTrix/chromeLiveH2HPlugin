// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('create-meeting')
        .addEventListener("click", setMeeting);
});

function inviteAjax(obj) {
    chrome.tabs.create({ url:  liveH2HMeeting.meetingURL});
    sendObj = {
        "origin": liveH2HMeeting.origin,
        "meeting_id": liveH2HMeeting.meetingId,
        "email_addresses": obj.packet
    };
    function sendMeeting(){
        chrome.tabs.create({ url:  liveH2HMeeting.meetingURL});
    }
    callAjax({
      url: liveH2HMeeting.serverURL+"/h2h_data/h2h_invitees",
      type: 'POST',
        dataType: 'json',
        data: JSON.stringify(sendObj),
        contentType: "application/json; charset=utf-8",
        callback: sendMeeting
    })
    
}



/**
 * This method is ajax call
 * obj.type : "POST" & "GET"
 * obj.url  : url
 * obj.callback: function for successful call
 * obj.errorCall: function for other cases
 * obj.contentType: set contentType
 * obj.data: set 'data' to be sent data
 */
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


function setMeeting(){
    var name = document.getElementById('username').value,
        email = document.getElementById('useremail').value,
        apiUrl = "https://app.liveh2h.com/tutormeetweb/rest/v1/meetings/instant",
        json = JSON.stringify({name: name, email:email});
        
    function saveMeeting(arguments){
        window.liveH2HMeeting = JSON.parse(arguments).data;
        //Hide fields and show invite page
        document.getElementById('start-meeting')
            .style.display = "block";
        document.getElementById('head-text')
            .style.display = "none";
        //Share URL
        var roomname = liveH2HMeeting.meetingId.split('');
        roomname.splice(6,0,"-");
        roomname.splice(3,0,"-");
        roomname.join("");
        var shareURL = liveH2HMeeting.serverURL +'/?roomname=' + roomname;
        document.getElementById('share-url-meet').value = shareURL;
    }
        
    callAjax({
      url: apiUrl,
      type: 'POST',
        dataType: 'json',
        data: '{"name": "'+name+'","email": "'+email+'"}',
        contentType: "application/json; charset=utf-8",
        callback: saveMeeting
    })
}

