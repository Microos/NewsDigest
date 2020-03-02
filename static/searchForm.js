"use strict";

var srcListUrl = serverAddr + "/api/searchform/sources";
var searchUrl = serverAddr + "";


const theForm = document.getElementById("search-form");
const keywordTextbox = document.getElementById("keyword-textbox");
const fromDateSelector = document.getElementById("from-date-selector");
const toDateSelector = document.getElementById("to-date-selector");

function initSearchForm() {

    // set date
    var today = new Date();
    var maxDateStr = today.toISOString().substr(0, 10);
    today.setDate(today.getDate() - 30);
    var minDateStr = today.toISOString().substr(0, 10);

    keywordTextbox.value = "";
    fromDateSelector.value = minDateStr;
    toDateSelector.value = maxDateStr;
    toDateSelector.max = maxDateStr;


    //blur focus of three inputs
    keywordTextbox.blur();
    fromDateSelector.blur();
    toDateSelector.blur();


    // reset states of selects
    var catSelect = document.getElementById("select-search-category");
    catSelect.selectedIndex = 0;
    changeSourceSelectOptions("all");

}


const searchSourceSelect = document.getElementById("select-search-source");
const optionAll = document.createElement("option");
optionAll.innerHTML = "all";
optionAll.value = "all";
optionAll.selected = true;

function onchangeCategorySelection(catSelect) {
    var category = catSelect.options[catSelect.selectedIndex].value;
    changeSourceSelectOptions(category);
}


function changeSourceSelectOptions(category) {
    //get list
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            var resp = JSON.parse(this.responseText);
            if (resp.status != 'ok') {
                logBadResponse(srcListUrl, resp);
            } else {
                var optionsFragment = document.createDocumentFragment();
                resp.content.forEach((source) => {
                    var opt = document.createElement("option");
                    opt.value = source.id;
                    opt.innerHTML = source.name;
                    optionsFragment.appendChild(opt);
                });


                searchSourceSelect.appendChild(optionsFragment);
            }
        }
    };
    searchSourceSelect.innerText = "";
    searchSourceSelect.appendChild(optionAll);


    xhr.open('POST', srcListUrl, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(`category=${category}`);
}
