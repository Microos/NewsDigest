// List of words
var wordsPadding = 3;
var fontSizeUpScale = 1;
var wordcloudUrl = serverAddr + "/api/wordcloud";

function drawWordcloud() {

    var normMin = 15;
    var normMax = 35;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            var resp = JSON.parse(this.responseText);
            var wcDiv = document.getElementById('wordcloud');
            if (resp.status != 'ok') {
                logBadResponse(wordcloudUrl, resp);
            } else {
                data = resp.content;
                __drawWordcloud(data);
            }
        }
    };
    xhr.open("POST", wordcloudUrl, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(`normMin=${normMin}&normMax=${normMax}`);

}

function __drawWordcloud(myWords) {
    var cloudDiv = d3.select("#wordcloud");
    // set the dimensions and margins of the graph
    var width = Number(cloudDiv.style('width').slice(0, -2));
    var height = Number(cloudDiv.style('height').slice(0, -2));
    // append the svg object to the body of the page
    var svg = cloudDiv.append("svg").attr('width', width).attr('height', height);
    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    var layout = d3.layout.cloud()
        .size([width, height])
        .words(myWords.map(function (d) {
            return {text: d.word, size: d.size};
        }))
        .padding(wordsPadding)        //space between words
        .rotate(function () {
            return ~~(Math.random() * 2) * 90;
        })
        .fontSize(function (d) {
            return d.size;
        })      // font size of words
        .on("end", draw);
    layout.start();


// This function takes the output of 'layout' above and draw the words
// Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
        svg
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function (d) {
                return fontSizeUpScale * d.size + 'px';
            })
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .style("font-family", "impact").style("font-weight", "normal")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.text;
            });
    }
}
