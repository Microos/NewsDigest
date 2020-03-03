"use strict";


const slideshowTimeout = 3000;
const slideCnt = 5; //default

const headlineSlideShowUrl = serverAddr + '/api/headlines/slideshow';

var onshowSlideIndex = 0;


// get slideshow
function appendSlideshowItem(title, brief, extUrl, imgUrl) {
    const ssStack = document.getElementById("slideshow");
    var slideshowItem = document.createElement("div");
    slideshowItem.className = "slideshow-item";

    var anchorImage = document.createElement("a");
    anchorImage.href = extUrl;
    anchorImage.target = "_blank";

    var image = document.createElement("img");
    image.src = imgUrl;
    image.alt = "headline image";

    anchorImage.append(image);
    slideshowItem.append(anchorImage);

    var descriptDiv = document.createElement("div");
    descriptDiv.className = "headline-descript-div";

    var titleDiv = document.createElement("div");
    titleDiv.className = "headline-title";

    var titleSubDiv = document.createElement("div");
    var anchorTitle = document.createElement("a");
    anchorTitle.className = 'plain-anchor';
    anchorTitle.href = extUrl;
    anchorTitle.innerText = title;
    anchorTitle.target = "_blank";

    titleSubDiv.appendChild(anchorTitle);
    titleDiv.appendChild(titleSubDiv);

    var briefDiv = document.createElement("div");
    briefDiv.className = "headline-brief";
    var briefSubDiv = document.createElement("div");
    var anchorBrief = document.createElement("a");

    anchorBrief.className = 'plain-anchor';
    anchorBrief.href = extUrl;
    anchorBrief.innerText = brief;
    anchorBrief.target = "_blank";

    briefSubDiv.appendChild(anchorBrief);
    briefDiv.appendChild(briefSubDiv);

    descriptDiv.appendChild(titleDiv);
    descriptDiv.appendChild(briefDiv);

    slideshowItem.appendChild(descriptDiv);

    ssStack.appendChild(slideshowItem);

}

function removeAllSlideShowItems() {
    document.getElementById("slideshow").innerText = "";
}

function constructSlideshowItems() {


    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            var resp = JSON.parse(this.responseText);
            // removeAllSlideShowItems();
            if (resp.status != 'ok') {
                appendSlideshowItem(`[${this.status}]` + resp.err_code, resp.err_msg, "", '../static/error.jpg');
                logBadResponse(headlineSlideShowUrl, resp);
            } else {
                var list = resp.content;
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    appendSlideshowItem(item.title, item.description, item.url, item.urlToImage);
                }
            }
            showSlides();
        }
    };

    xhr.open('POST', headlineSlideShowUrl, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(`cnt=${slideCnt}`);


}

// headline slideslow rolling
function hideAllSlides() {
    var slideItems = document.getElementsByClassName("slideshow-item");
    for (var i = 0; i < slideItems.length; i++) {
        slideItems[i].style.display = "none";
    }
}

function showSlides() {
    var slideItems = document.getElementsByClassName("slideshow-item");
    hideAllSlides();
    slideItems[onshowSlideIndex].style.display = "block";

    onshowSlideIndex += 1;
    if (onshowSlideIndex >= slideItems.length) {
        onshowSlideIndex = 0;
    }

    setTimeout(showSlides, slideshowTimeout);
}


