"use strict";

var newscardUrl = serverAddr + "/api/headlines/newscard";
var srcNewsDiv = document.getElementById("sourced-news-div");
var srcNameMapping = {
    'cnn': "CNN",
    'fox-news': 'Fox News'
};

function constructSourcedNewsItems() {
    srcNewsDiv.innerText = "";
    Promise.all([promisedConstructSourcedNewsItem('cnn'),
        promisedConstructSourcedNewsItem('fox-news')]).then(values => {
        appendSourcedNewsItem(values[0]);
        appendSourcedNewsItem(values[1]);
    });


}

function promisedConstructSourcedNewsItem(source) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                var resp = JSON.parse(this.responseText);
                if (resp.status != 'ok') {
                    // console.log(`Error:\n[${resp.status}]${resp.err_code};\n${resp.err_msg}`)
                    logBadResponse(newscardUrl, resp);
                } else {
                    var sourcedNewsItem = constructSourcedNewsItem(source, resp);
                    resolve(sourcedNewsItem);
                }
            }
        };
        xhr.open('POST', newscardUrl, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(`source=${source}&cnt=4`);
    });


}


function appendSourcedNewsItem(elm) {
    srcNewsDiv.appendChild(elm);


    // adjust text height
    var newscards = elm.getElementsByClassName("newscard");
    Array.from(newscards).forEach((card) => {


        var img = card.getElementsByTagName("img")[0];
        var titleDiv = card.getElementsByClassName("title")[0];
        var briefDiv = card.getElementsByClassName("brief")[0];

        var cardCSS = window.getComputedStyle(card);
        var imgCSS = window.getComputedStyle(img);
        var titleCSS = window.getComputedStyle(titleDiv);
        var briefCSS = window.getComputedStyle(briefDiv);


        var cardH = card.clientHeight;
        var imgH = img.clientHeight;
        var titleH = titleDiv.clientHeight;


        var marginH = 0;
        var margins = [imgCSS.marginBottom, imgCSS.marginTop, titleCSS.marginBottom, titleCSS.marginTop, briefCSS.marginTop, briefCSS.marginBottom];


        margins.forEach((m) => {
            marginH += Number(m.slice(0, -2));
        });

        var maxH = cardH - imgH - titleH - marginH;

        var lineH = Number(briefCSS.lineHeight.slice(0, -2));
        maxH = Math.ceil(maxH / lineH) * lineH;

        briefDiv.style.maxHeight = `${maxH}px`;
        // console.log(`${cardH - imgH - titleH}px`);


    });


}

function constructSourcedNewsItem(source, resp) {
    var srcNewsItemDiv = document.createElement("div");
    srcNewsItemDiv.className = "sourced-news-item";

    var sourceTitleDiv = document.createElement("div");
    sourceTitleDiv.className = "source-title";
    sourceTitleDiv.innerHTML = `${srcNameMapping[source]} <hr>`;

    var newscardContainer = document.createElement("div");
    newscardContainer.className = "newscard-container";

    var contentList = resp.content;
    for (var i = 0; i < contentList.length; i++) {
        var newsItem = resp.content[i];
        var newscard = constructNewscard(newsItem.title, newsItem.description, newsItem.url, newsItem.urlToImage);
        newscardContainer.appendChild(newscard);
    }

    srcNewsItemDiv.appendChild(sourceTitleDiv);
    srcNewsItemDiv.appendChild(newscardContainer);

    return srcNewsItemDiv;


}

function constructNewscard(title, brief, extUrl, imgUrl) {
    var newscardDiv = document.createElement("div");
    newscardDiv.className = "newscard";

    var anchor = document.createElement("a");
    anchor.href = extUrl;
    anchor.className = "plain-anchor";

    var img = document.createElement("img");
    img.src = imgUrl;
    img.alt = "news image";

    var titleDiv = document.createElement("div");
    titleDiv.className = "title";
    titleDiv.innerHTML = title;

    var briefDiv = document.createElement("div");
    briefDiv.className = "brief";
    briefDiv.innerHTML = brief + "[]" + brief; //TODO: remove test

    anchor.appendChild(img);
    anchor.appendChild(titleDiv);
    anchor.appendChild(briefDiv);

    newscardDiv.appendChild(anchor);

    return newscardDiv;
}

