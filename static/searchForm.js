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

// stores key(str: category name)-value(fragment)
var sourceByCategory = {};

function changeSourceSelectOptions(category) {
    console.log(Object.keys(sourceByCategory));
    if (sourceByCategory[category] == undefined) {
        //no such a key, send request
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                var resp = JSON.parse(this.responseText);
                if (resp.status != 'ok') {
                    logBadResponse(srcListUrl, resp);
                } else {
                    // const optionsFragment = document.createDocumentFragment();
                    var optionElements = [];
                    resp.content.forEach((source) => {
                        var opt = document.createElement("option");
                        opt.value = source.id;
                        opt.innerHTML = source.name;
                        optionElements.push(opt);
                    });

                    sourceByCategory[category] = optionElements;
                    optionElements.forEach((o) => {
                        searchSourceSelect.appendChild(o);
                    });
                }
            }
        };
        searchSourceSelect.innerText = "";
        searchSourceSelect.appendChild(optionAll);
        searchSourceSelect.selectedIndex = 0;


        xhr.open('POST', srcListUrl, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(`category=${category}`);
    } else {
        searchSourceSelect.innerText = "";
        searchSourceSelect.appendChild(optionAll);
        sourceByCategory[category].forEach((o) => {
            searchSourceSelect.appendChild(o);
        });
        searchSourceSelect.selectedIndex = 0;
    }

}
