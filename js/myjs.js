var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
var arr = [];

d3.queue()
    .defer(d3.json, "http://bl.ocks.org/mbostock/raw/4090846/us.json")
    .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B02001_001E&for=county:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
    .await(ready);

function ready(error, us, us2) {

    //  if (error) throw error;
    //readfile("B02001_001E","county");


    var d = [],
        d1 = [];

    us2.forEach(function(county) {
        if (county[1] > 0)
            d.push(parseInt(county[1]));
        if (county[1] > 0)
            d1.push(parseInt(county[2] + county[3]));

    });
    arr.push(d);
    arr.push(d1);


    var rateById = d3.map();

    var quantize = d3.scaleQuantize()
        .domain([0, d3.max(arr[0])])
        .range(d3.range(9).map(function(i) {
            return "q" + i + "-9";
        }));

    var projection = d3.geoAlbersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("class", function(d) {
            return quantize(arr[0][arr[1].indexOf(d.id)]);
        })
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) {
            return a !== b;
        }))
        .attr("class", "states")
        .attr("d", path);

    console.log(us);
}
