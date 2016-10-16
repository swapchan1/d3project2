var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var one,two,three;
var selection = $('#filterDay input:radio:checked').val();


d3.queue()
    .defer(d3.json, "http://bl.ocks.org/mbostock/raw/4090846/us.json")
    .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B02001_001E&for=county:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
    .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B02001_001E&for=state:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
    .await(ready);

$("#drawchart").click(function(){
    var val = $("#datatype").val();
    console.log(val);
    d3.queue()
        .defer(d3.json, "http://bl.ocks.org/mbostock/raw/4090846/us.json")
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,"+val+"&for=county:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,"+val+"&for=state:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
        .await(ready);
});

$("input[name=disp]").change(function () {
    selection = $('#disptype input:radio:checked').val();
    ready(null,one,two,three);
});

function ready(error, us, uscounty,usstate) {

    one = us;
    two = uscounty;
    three = usstate;
    var d = [],
        d1 = [];

    if(selection == "county") {
        uscounty.forEach(function(element) {
            if (element[1] > 0)
                d.push(parseInt(element[1]));
            if (element[1] > 0)
                d1.push(parseInt(element[2] + element[3]));

        });
    }
    else {
        usstate.forEach(function(element) {
            if (element[1] > 0)
                d.push(parseInt(element[1]));
            if (element[1] > 0)
                d1.push(parseInt(element[2]));

        });
    }

    var arr=[];
    arr.push(d);
    arr.push(d1);


    var rateById = d3.map();

    var quantize = d3.scaleQuantize()
        .domain([d3.min(arr[0]), d3.max(arr[0])])
        .range(d3.range(9).map(function(i) {
            return "q" + i + "-9";
        }));

    var projection = d3.geoAlbersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    if(selection == "county") {
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("class", function (d) {
                return quantize(arr[0][arr[1].indexOf(d.id)]);
            })
            .attr("d", path)
            .on("mouseover",function(d){
                console.log(arr[0][arr[1].indexOf(d.id)]);
            })
            .on("mouseleave",function(d){
                //console.log(arr[0][arr[1].indexOf(d.id)]);
            });
    }else {
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", function (d) {
                return quantize(arr[0][arr[1].indexOf(d.id)]);
            })
            .classed("states", "true")
            .on("mouseover",function(d){
                console.log(arr[0][arr[1].indexOf(d.id)]);
            })
            .on("mouseleave",function(d){
                //console.log(arr[0][arr[1].indexOf(d.id)]);
            });

    }
}
