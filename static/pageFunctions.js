"use strict";

// var serverAddr = "http://192.168.238.132:8888";
var serverAddr = "http://h6.cmic.me:80";

function bodyOnloadCalls() {
    drawWordcloud();
    constructSlideshowItems();
    constructSourcedNewsItems();
    resetSearchForm();


    console.log("[INFO] <body> onload done.");
}


// navi buttons
const gnewsButton = document.getElementsByClassName("gnews-button")[0];
const gnewsDiv = document.getElementById("google-news");
const searchButton = document.getElementsByClassName("search-button")[0];
const searchDiv = document.getElementById("search-form-div");

function gnewsButtonOnclick() {

    gnewsDiv.style.display = "block";
    searchDiv.style.display = "none";

    gnewsButton.style.backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-button-active-bgcolor");
    gnewsButton.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-button-active-textcolor");

    searchButton.style.backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-button-inactive-bgcolor");
    searchButton.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-button-inactive-textcolor");


    //TODO: is this needed?
    // init the search from once the user leaves this section
    // resetSearchForm();


}

function searchButtonOnclick() {
    gnewsDiv.style.display = "none";
    searchDiv.style.display = "block";

    gnewsButton.style.backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-button-inactive-bgcolor");
    gnewsButton.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-button-inactive-textcolor");

    searchButton.style.backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-button-active-bgcolor");
    searchButton.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-button-active-textcolor");


}

//helper functions
function logBadResponse(apiUrl, resp) {
    var str = `Bad Response from: "${apiUrl}"\n
    status  : ${resp.status}\n
    err_code: ${resp.err_code}\n
    err_msg : ${resp.err_msg}\n`;

    console.log(str);

    return str;
}
