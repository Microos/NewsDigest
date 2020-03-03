"use strict";

var srcListUrl = serverAddr + "/api/searchform/sources";
var searchUrl = serverAddr + "/api/searchform/search";


const theForm = document.getElementById("search-form");
const keywordTextbox = document.getElementById("keyword-textbox");
const fromDateSelector = document.getElementById("from-date-selector");
const toDateSelector = document.getElementById("to-date-selector");

function resetSearchForm() {
    var formatDateString = (d) => {
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var day = d.getDay() + 1;

        month = month <= 9 ? '0' + month : month;
        day = day <= 9 ? '0' + day : day;


        var ret = `${year}-${month}-${day}`;
        // console.log(d);
        return ret;
    };

    // set date
    var today = new Date();
    var maxDateStr = formatDateString(today);

    today.setDate(today.getDate() - 7);
    var minDateStr = formatDateString(today);

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

    // clear result div
    document.getElementById("search-result-div").innerHTML = "";
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
    if (sourceByCategory[category] == undefined) {
        //no such a key, send request
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                var resp = JSON.parse(this.responseText);
                if (resp.status != 'ok') {
                    logBadResponse(srcListUrl, resp);
                } else {
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


const searchResultDiv = document.getElementById("search-result-div");

function newNoResultDiv() {
    var div = document.createElement("div");
    div.className = "no-results";
    div.innerHTML = "No results";
    return div;
}

function newMoreLessButton() {
    var btn = document.createElement("button");
    btn.className = "more-less-button";
    btn.innerHTML = "Show More";
    btn.onclick = function () {
        var items = document.getElementById("search-result-div")
            .getElementsByClassName("result-item");
        items = Array.from(items);

        if (btn.innerHTML.indexOf("More") > 0) {
            // current state: showing less
            this.innerHTML = "Show Less";
            items.forEach((item) => {
                item.style.display = "flex";
            });

        } else {
            // current state: showing more
            this.innerHTML = "Show More";
            var i = 0;
            items.forEach((item) => {
                if (i >= 5) {
                    item.style.display = "none";
                }
                i++;
            });
        }
    };
    return btn;

}

function appendResults(resp) {
    for (var i = 0; i < resp.content.length; i++) {
        var res = resp.content[i];

        var resItemDiv = document.createElement("div");
        resItemDiv.className = "result-item";
        resItemDiv.setAttribute("data-current-state", "collapsed");
        resItemDiv.onclick = function () {
            toggleResultCard(this, event);
        };


        var img = document.createElement("img");
        img.src = res.urlToImage;
        img.alt = "result item image";

        resItemDiv.appendChild(img);

        var resItemDescriptDiv = document.createElement("div");
        resItemDescriptDiv.className = "result-item-description";

        var resTitleDiv = document.createElement("div");
        resTitleDiv.className = "res-title";
        resTitleDiv.innerHTML = res.title;

        var resOnelineDescriptDiv = document.createElement("div");
        resOnelineDescriptDiv.className = "res-descript";
        resOnelineDescriptDiv.innerHTML = res.description;

        var authorDiv = document.createElement("div");
        authorDiv.className = "res-info";
        authorDiv.innerHTML = `<strong>Author: </strong> ${res.author}`;

        var srcDiv = document.createElement("div");
        srcDiv.className = "res-info";
        srcDiv.innerHTML = `<strong>Source: </strong> ${res.source.name}`;

        var dateDiv = document.createElement("div");
        dateDiv.className = "res-info";
        dateDiv.innerHTML = `<strong>Date: </strong> ${res.publishedAt.match(/^\d{4}-\d{2}-\d{2}/)[0].replace(/-/g, "/")}`;


        var briefDiv = document.createElement("div");
        briefDiv.className = "res-brief";
        briefDiv.innerHTML = res.content;

        var urlDiv = document.createElement("div");
        urlDiv.className = "res-url";
        urlDiv.innerHTML = `<a target="_blank" href="${res.url}">See Original Post</a>`;


        [resTitleDiv, resOnelineDescriptDiv, authorDiv, srcDiv, dateDiv, briefDiv, urlDiv].forEach((elm) => {
            resItemDescriptDiv.appendChild(elm);
        });

        resItemDiv.appendChild(resItemDescriptDiv);

        var closeBtn = document.createElement("a");
        closeBtn.className = "close-mark";
        closeBtn.onclick = function () {
            toggleResultCard(this, event);
        };
        closeBtn.innerHTML = "&times;";

        resItemDiv.appendChild(closeBtn);


        if (i >= 5) {
            resItemDiv.style.display = "none";
        }

        // append this item to result display div
        searchResultDiv.appendChild(resItemDiv);
    }

    // append show more btn
    if (resp.content.length > 5) {
        searchResultDiv.appendChild(newMoreLessButton());
    }
}

function validateForm(form) {
    if (!form.reportValidity())
        return false;

    var fromDate = new Date(form.fromDate.value).getTime();
    var toDate = new Date(form.toDate.value).getTime();

    if (fromDate > toDate) {
        alert("Incorrect dates selected.");
        return false;
    }

    return true;
}

function onSearchSubmit(form) {
    if (!validateForm(form)) {
        return;
    }

    var postPayload = `q=${form.q.value}&fromDate=${form.fromDate.value}&toDate=${form.toDate.value}&source=${form.srcSelect.options[form.srcSelect.selectedIndex].value}&cnt=15`;


    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            var resp = JSON.parse(this.responseText);
            if (resp.status != 'ok') {
                var log = logBadResponse(searchUrl, resp);
                if (resp.status == 'api_error') {
                    var reg = / To extend.*$/;
                    var msg = resp.err_msg.replace(reg, "");
                    alert(msg);
                } else {
                    alert(log);
                }
            } else {
                // clear previous content
                searchResultDiv.innerHTML = "";


                if (resp.content.length > 0) {
                    // returned results
                    appendResults(resp);
                } else {
                    // no results
                    searchResultDiv.appendChild(newNoResultDiv());
                }

            }
        }
    };
    xhr.open('POST', searchUrl, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(postPayload);
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
        setElementsStyle("res-title", {"display": "-webkit-box"});
        setElementsStyle("res-descript", {"display": "-webkit-box"});
        setElementsStyle("res-info", {"display": "none"});
        setElementsStyle("res-brief", {"display": "none"});
        setElementsStyle("res-url", {"display": "none"});
        setElementsStyle("close-mark", {"display": "none"});


        //change cursor
        resultItem.onmouseover = function () {
            this.style['cursor'] = "pointer";
        };

        // state change
        resultItem.setAttribute("data-current-state", newState);

    }

    function expand() {
        setElementsStyle("res-title", {"display": "block"});
        setElementsStyle("res-descript", {"display": "none"});
        setElementsStyle("res-info", {"display": "block"});
        setElementsStyle("res-brief", {"display": "block"});
        setElementsStyle("res-url", {"display": "block"});
        setElementsStyle("close-mark", {"display": "block"});


        // change cursor
        resultItem.onmouseover = function () {
            this.style['cursor'] = "initial";
        };

        // state change
        resultItem.setAttribute("data-current-state", newState);
    }

    function setElementsStyle(className, stylesDict) {
        var elms = resultItem.getElementsByClassName(className);

        Array.from(elms).forEach((e) => {

            Object.keys(stylesDict).forEach((k) => {
                e.style[k] = stylesDict[k];
            });
        });
    }
}