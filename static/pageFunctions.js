"use strict";

var serverAddr = "http://127.0.0.1:8888";

function onloadCalls() {
    showSlides();
    drawWordcloud();
    console.log("onload done.");
}


// headline slideshow
var onshowSlideIndex = 0;

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

    setTimeout(showSlides, 2000);
}
