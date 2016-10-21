var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var one, two, three;
var selection = $('#filterDay input:radio:checked').val();


d3.queue()
    .defer(d3.json, "http://bl.ocks.org/mbostock/raw/4090846/us.json")
    .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B02001_001E&for=county:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
    .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B02001_001E&for=state:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
    .await(ready);

$(".sidemenuitem").click(function() {
    var type = this.innerHTML;
    if(type=="Total population within the locality"){
        val = "B01003_001E";
    }
    if(type=="Age distribution broken down by sex"){
        val = "B01001_001E";
    }
    if(type=="Median age by sex"){
        val = "B01002_001E";
    }
    if(type=="Race"){
        val = "B02001_001E";
    }
    if(type=="Living arrangement for adults (18 years and over)"){
        val = "B09021_001E";
    }
    if(type=="Place of birth by nativity"){
        val = "C05002_001E";
    }
    if(type=="Median household income"){
        val = "B19013_001E";
    }
    if(type=="Per capita income"){
        val = "B19301_001E";
    }
    if(type=="Income to poverty-level ratio"){
        val = "B17002_001E";
    }
    if(type=="Poverty level by place of birth"){
        val = "B06012_001E";
    }
    if(type=="Educational attainment by place of birth"){
        val = "B06009_001E";
    }
    if(type=="Travel time to work"){
        val = "B08303_001E";
    }
    if(type=="Means of transportation to work"){
        val = "B08301_001E";
    }
    d3.queue()
        .defer(d3.json, "http://bl.ocks.org/mbostock/raw/4090846/us.json")
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME," + val + "&for=county:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME," + val + "&for=state:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
        .await(ready);
});

$("input[name=disp]").change(function() {
    selection = $('#disptype input:radio:checked').val();
    ready(null, one, two, three);
});

function ready(error, us, uscounty, usstate) {

    console.log("us information", us);

    one = us;
    two = uscounty;
    three = usstate;
    var d = [],
        d1 = [];

    if (selection == "county") {
        uscounty.forEach(function(element) {
            if (element[1] > 0)
                d.push(parseInt(element[1]));
            if (element[1] > 0)
                d1.push(parseInt(element[2] + element[3]));
        });
    } else {
        usstate.forEach(function(element) {
            if (element[1] > 0)
                d.push(parseInt(element[1]));
            if (element[1] > 0)
                d1.push(parseInt(element[2]));

        });
    }

    var arr = [];
    arr.push(d);
    arr.push(d1);

    //console.log("array", arr);

    var rateById = d3.map();

    var quantize = d3.scaleQuantize()
        .domain([d3.min(arr[0]), d3.max(arr[0])])
        .range(d3.range(9).map(function(i) {
            return "q" + i + "-9";
        }));

    var projection = d3.geoAlbersUsa()
        .scale(960)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    if (selection == "county") {
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("class", function(d) {
                //console.log("indexof d.id", arr[0][arr[1].indexOf(d.id)]);
                return quantize(arr[0][arr[1].indexOf(d.id)]);
            })
            .attr("d", path)
            .on("mouseover", function(d) {
                //console.log(arr[0][arr[1].indexOf(d.id)]);
            })
            .on("mouseleave", function(d) {
                //console.log(arr[0][arr[1].indexOf(d.id)]);
            });
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .classed("states", "true");
    } else {
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", function(d) {
                return quantize(arr[0][arr[1].indexOf(d.id)]);
            })
            .classed("states", "true")
            .on("mouseover", function(d) {
                //console.log(arr[0][arr[1].indexOf(d.id)]);
            })
            .on("mouseleave", function(d) {
                //console.log(arr[0][arr[1].indexOf(d.id)]);
            });

    }
}
