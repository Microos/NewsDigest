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


function onSubmit(form) {
    alert("yo");
    return false;
}

function toggleResultCard(element, event) {

    var nextStateDict = {'expanded': "collapsed", "collapsed": "expanded"};
    var newState;
    var resultItem;
    var currentState;

    var root = document.documentElement;

    if (element.tagName == 'A') {
        resultItem = element.parentElement;
        // currentState = resultItem.getAttribute("data-current-state");
        currentState = resultItem.dataset['currentState'];
        newState = nextStateDict[currentState];

        if (currentState == 'expanded') {
            collpase();

        }

    } else if (element.tagName == 'DIV') {
        resultItem = element;
        currentState = resultItem.getAttribute("data-current-state");
        newState = nextStateDict[currentState];

        if (currentState == 'expanded') {
            // do nothing when click on expanded card body.
        } else {
            expand();
        }

    }
    event.stopPropagation();


    function collpase() {
        // style change
        root.style.setProperty("--result-descript-display", "-webkit-box");
        root.style.setProperty("--result-simple-display", "block");
        root.style.setProperty("--result-detail-display", "none");

        // state change
        resultItem.setAttribute("data-current-state", newState);

    }

    function expand() {
        //style change
        root.style.setProperty("--result-descript-display", "none");
        root.style.setProperty("--result-simple-display", "none");
        root.style.setProperty("--result-detail-display", "block");

        // state change
        resultItem.setAttribute("data-current-state", newState);
    }
}