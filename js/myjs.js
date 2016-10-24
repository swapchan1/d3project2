var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var us, one, two, three;
var scselection; //state or count selection
var dataselection; //dataset selection

$(document).ready(function() {
    scselection = $('#disptype input:radio:checked').val();
    dataselection = "Total population within the locality";
    queue()
        .defer(d3.json, "http://bl.ocks.org/mbostock/raw/4090846/us.json")
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B01003_001E&for=state:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
        .await(ready);
});

//ready function always takes error and results parameters
function ready(error, us1, data1) {
    us = us1;
    one = data1;
    drawMap(null, one);
}

var stateNameObj = [];
var countyNameObj = [];

$("input[name=dataset]").change(function() {
    dataselection = $('#datasettype input:radio:checked').val();
    scselection = $('#disptype input:radio:checked').val();
    loadtreemap(dataselection);
    queue()
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME," + dataselection + "&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
        .await(drawMap);
});

$("input[name=disp]").change(function() {
    dataselection = $('#datasettype input:radio:checked').val();
    scselection = $('#disptype input:radio:checked').val();
    queue()
        .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME," + dataselection + "&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
        .await(drawMap);
});

/**
 * drawMap function starts here.
 */


//first time passing us state data
function drawMap(error, usdata) {

    var d = [],
        d1 = [];

    if (scselection == "county") {

        usdata.splice(0, 1);
        countyNameObj.length = 0;
        usdata.forEach(function(element) {
            var nameObj = {};
            nameObj[Math.floor(element[1])] = element[0];
            countyNameObj.push(nameObj);
            if (element[1] > 0)
                d.push(parseInt(element[1]));
            if (element[1] > 0)
                d1.push(parseInt(element[2] + element[3]));
        });
    } else {
        usdata.splice(0, 1);
        stateNameObj.length = 0;
        usdata.forEach(function(element) {
            var nameObj = {};
            nameObj[Math.floor(element[1])] = element[0]; //for age variables
            nameObj[element[2]] = element[0];
            stateNameObj.push(nameObj);
            if (element[1] > 0)
                d.push(parseInt(element[1]));
            if (element[1] > 0)
                d1.push(parseInt(element[2]));

        });
    }

    var arr = [];
    arr.push(d);
    arr.push(d1);


    //linear scale for linear gradient from color1 to color2
    var quantize = d3.scale.linear()
        .domain([d3.min(arr[0]), d3.max(arr[0])])
        .range(["#f7fcfd", "#00441b"]);

    var projection = d3.geo.albersUsa()
        .scale(960)
        .translate([width / 2, height / 2]);


    var path = d3.geo.path()
        .projection(projection);
    svg.selectAll('g').remove();
    if (scselection == "county") {

        /**
         * d3 legend
         */



        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(200,10)");

        var legendLinear = d3.legend.color()
            .shapeWidth(30)
            .orient('horizontal')
            .cells(10)
            .labelFormat(d3.format('.2s'))
            .scale(quantize);



        /**
         * d3 legend end code
         */


        /**
         * tooltip code trial
         */
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {

                var prop = arr[0][arr[1].indexOf(d.id)];
                var index = parseFloat([arr[1].indexOf(d.id)]);
                //if(index!=-1)
                return "<strong>" + countyNameObj[index][prop] + " : </strong> <span>" + d3.format('.2s')(prop) + "<span>";
            });

        /**
         * tooltip code ends
         */

        svg.call(tip);
        svg.select(".legendLinear")
            .call(legendLinear);

        //to show county borders
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .style("fill", function(d) {

                //console.log(arr[0][arr[1].indexOf(d.id)]);
                return quantize(arr[0][arr[1].indexOf(d.id)]);
            })
            .attr("d", path)
            .on("mouseover", tip.show)
            .on("mouseleave", tip.hide);

        //to show state borders as well
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .classed("states", "true");
    }
    // else for state selection
    else {

        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(650,250)");

        var legendLinear = d3.legend.color()
            .shapeWidth(30)
            .orient('vertical')
            .cells(10)
            .labelFormat(d3.format('.2s'))
            .scale(quantize);

        /**
         * tooltip code trial
         */
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {

                var prop = arr[0][arr[1].indexOf(d.id)];
                console.log(prop);
                var index = parseFloat([arr[1].indexOf(d.id)]);

                console.log(stateNameObj[index][prop]);

                return "<strong>" + stateNameObj[index][prop] + " : </strong> <span>" + d3.format('.2s')(prop) + "<span>";

            });
        /**
         * tooltip code ends
         */

        svg.call(tip);
        svg.select(".legendLinear")
            .call(legendLinear);

        //to show state borders only
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
                // console.log("data", d);
                // console.log("data id", arr[1].indexOf(d.id));
                return quantize(arr[0][arr[1].indexOf(d.id)]);
            })
            .classed("states", "true")
            .on("mouseover", tip.show)
            .on("mouseleave", tip.hide);

    }
    pieChart("pie1");
}

/**
 * drawMap function ends here.
 */


function pieChart(pienumber) {
    if (dataselection == "Total population within the locality") {
        val = "B01003_001E";
    } else
    if (dataselection == "Age distribution broken down by sex") {
        val = "B01001_001E";
        queue()
            .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B01001_002E,B01001_026E&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
            .await(function(error, data1) {
                var sum = 0;
                var data = [];
                data1.splice(0, 1);
                data1.forEach(function(elem) {
                    if (elem[1] != null)
                        sum += parseInt(elem[1]);
                });
                data.push({
                    label: "Male",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[2]);
                });
                data.push({
                    label: "Female",
                    val: sum
                });
                drawPieChart(pienumber, data)
            });
    } else
    if (dataselection == "Median age by sex") {
        val = "B01002_001E";
        queue()
            .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B01002_002E,B01002_003E&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
            .await(function(error, data1) {
                var sum = 0;
                var data = [];
                data1.splice(0, 1);
                data1.forEach(function(elem) {
                    if (elem[1] != null)
                        sum += parseInt(elem[1]);
                });
                data.push({
                    label: "Male",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[2]);
                });
                data.push({
                    label: "Female",
                    val: sum
                });
                drawPieChart(pienumber, data)
            });
    } else
    if (dataselection == "Race") {
        val = "	B02001_001E";
        queue()
            .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B02001_002E,B02001_003E,B02001_004E,B02001_005E,B02001_006E,B02001_007E,B02001_008E&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
            .await(function(error, data1) {
                var sum = 0;
                var data = [];
                data1.splice(0, 1);
                data1.forEach(function(elem) {
                    if (elem[1] != null)
                        sum += parseInt(elem[1]);
                });
                data.push({
                    label: "White Alone",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[2]);
                });
                data.push({
                    label: "Black or African American Alone",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[3] != null)
                        sum += parseInt(elem[3]);
                });
                data.push({
                    label: "American Indian and Alaska Native Alone",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[4] != null)
                        sum += parseInt(elem[4]);
                });
                data.push({
                    label: "Asian Alone",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[5] != null)
                        sum += parseInt(elem[5]);
                });
                data.push({
                    label: "Native Hawaiian and Other Pacific Islander Alone",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[6] != null)
                        sum += parseInt(elem[6]);
                });
                data.push({
                    label: "American Indian and Alaska Native Alone",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[7] != null)
                        sum += parseInt(elem[7]);
                });
                data.push({
                    label: "Two or More Races",
                    val: sum
                });

                drawPieChart(pienumber, data)
            });
    } else
    if (dataselection == "Living arrangement for adults (18 years and over)") {
        val = "B09021_001E";
    } else
    if (dataselection == "Place of birth by nativity") {
        val = "C05002_001E";
        queue()
            .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,C05002_002E,C05002_008E&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
            .await(function(error, data1) {
                var sum = 0;
                var data = [];
                data1.splice(0, 1);
                data1.forEach(function(elem) {
                    if (elem[1] != null)
                        sum += parseInt(elem[1]);
                });
                data.push({
                    label: "Native",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[2]);
                });
                data.push({
                    label: "Foreign Born",
                    val: sum
                });
                drawPieChart(pienumber, data)
            });
    } else
    if (dataselection == "Median household income") {
        val = "B19013_001E";
    } else
    if (dataselection == "Per capita income") {
        val = "B19301_001E";
    } else
    if (dataselection == "Income to poverty-level ratio") {
        val = "B17002_001E";
        queue()
            .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B17002_002E,B17002_003E,B17002_004E,B17002_005E,B17002_006E,B17002_007E,B17002_008E,B17002_009E,B17002_010E,B17002_011E,B17002_012E,B17002_013E&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
            .await(function(error, data1) {
                var sum = 0;
                var data = [];
                data1.splice(0, 1);
                data1.forEach(function(elem) {
                    if (elem[1] != null)
                        sum += parseInt(elem[1]);
                });
                data.push({
                    label: "Under .50",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[2]);
                });
                data.push({
                    label: ".50 to .74",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[3]);
                });
                data.push({
                    label: ".75 to .99",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[4]);
                });
                data.push({
                    label: "1.00 to 1.24",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[5]);
                });
                data.push({
                    label: "1.25 to 1.49",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[6]);
                });
                data.push({
                    label: "1.50 to 1.74",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[7]);
                });
                data.push({
                    label: "1.75 to 1.84",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[8]);
                });
                data.push({
                    label: "1.85 to 1.99",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[9]);
                });
                data.push({
                    label: "2.00 to 2.99",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[10]);
                });
                data.push({
                    label: "3.00 to 3.99",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[11]);
                });
                data.push({
                    label: "4.00 to 4.99",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[12]);
                });
                data.push({
                    label: "5.00 and over",
                    val: sum
                });
                drawPieChart(pienumber, data)
            });
    } else
    if (dataselection == "Poverty level by place of birth") {
        val = "B06012_001E";

    } else
    if (dataselection == "Educational attainment by place of birth") {

        queue()
            .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B06009_007E,B06009_013E,B06009_019E,B06009_025E&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
            .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B06009_002E,B06009_003E,B06009_004E,B06009_005E,B06009_006E&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
            .await(function(error, data1, data2) {
                var sum = 0;
                var data = [];
                data1.splice(0, 1);
                data1.forEach(function(elem) {
                    if (elem[1] != null)
                        sum += parseInt(elem[1]);
                });
                data.push({
                    label: "Born in State of Residence",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[2]);
                });
                data.push({
                    label: "Born in Other State in the United States",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[3]);
                });
                data.push({
                    label: "Native; Born Outside the United States",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[4]);
                });
                data.push({
                    label: "Foreign Born",
                    val: sum
                });
                sum = 0;

                drawPieChart('pie1', data);


                var sum = 0;
                var data = [];
                data2.splice(0, 1);
                data2.forEach(function(elem) {
                    if (elem[1] != null)
                        sum += parseInt(elem[1]);
                });
                data.push({
                    label: "Less than High School Graduate",
                    val: sum
                });
                sum = 0;
                data2.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[2]);
                });
                data.push({
                    label: "High School Graduate (Includes Equivalency)",
                    val: sum
                });
                sum = 0;
                data2.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[3]);
                });
                data.push({
                    label: "Some College or Associate's Degree",
                    val: sum
                });
                sum = 0;
                data2.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[4]);
                });
                data.push({
                    label: "Bachelor's Degree",
                    val: sum
                });
                sum = 0;
                data2.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[5]);
                });
                data.push({
                    label: "Graduate or Professional Degree",
                    val: sum
                });

                drawPieChart('pie2', data)
            });
    } else
    if (dataselection == "Travel time to work") {
        val = "B08303_001E";
        queue()
            .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B08303_002E,B08303_003E,B08303_004E,B08303_005E,B08303_006E,B08303_007E,B08303_008E,B08303_009E,B08303_010E,B08303_011E,B08303_012E,B08303_013E&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
            .await(function(error, data1) {
                var sum = 0;
                var data = [];
                data1.splice(0, 1);
                data1.forEach(function(elem) {
                    if (elem[1] != null)
                        sum += parseInt(elem[1]);
                });
                data.push({
                    label: "Under .50",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[2]);
                });
                data.push({
                    label: "5 to 9 Minutes",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[3]);
                });
                data.push({
                    label: "10 to 14 Minutes",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[4]);
                });
                data.push({
                    label: "15 to 19 Minutes",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[5]);
                });
                data.push({
                    label: "20 to 24 Minutes",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[6]);
                });
                data.push({
                    label: "25 to 29 Minutes",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[7]);
                });
                data.push({
                    label: "30 to 34 Minutes",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[8]);
                });
                data.push({
                    label: "35 to 39 Minutes",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[9]);
                });
                data.push({
                    label: "40 to 44 Minutes",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[10]);
                });
                data.push({
                    label: "45 to 59 Minutes",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[11]);
                });
                data.push({
                    label: "60 to 89 Minutes",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[12]);
                });
                data.push({
                    label: "90 or More Minutes",
                    val: sum
                });
                drawPieChart(pienumber, data)
            });
    } else
    if (dataselection == "Means of transportation to work") {
        val = "B08301_001E";
        queue()
            .defer(d3.json, "http://api.census.gov/data/2015/acs1?get=NAME,B08301_002E,B08301_010E,B08301_016E,B08301_017E,B08301_018E,B08301_019E,B08301_020E,B08301_021E&for=" + scselection + ":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09")
            .await(function(error, data1) {
                var sum = 0;
                var data = [];
                data1.splice(0, 1);
                data1.forEach(function(elem) {
                    if (elem[1] != null)
                        sum += parseInt(elem[1]);
                });
                data.push({
                    label: "Car, Truck, or Van",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[2]);
                });
                data.push({
                    label: "Public Transportation (Excluding Taxicab)",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[3]);
                });
                data.push({
                    label: "Taxicab",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[4]);
                });
                data.push({
                    label: "Motorcycle",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[5]);
                });
                data.push({
                    label: "Bicycle",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[6]);
                });
                data.push({
                    label: "Walked",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[7]);
                });
                data.push({
                    label: "Other Means",
                    val: sum
                });
                sum = 0;
                data1.forEach(function(elem) {
                    if (elem[2] != null)
                        sum += parseInt(elem[8]);
                });
                data.push({
                    label: "Worked at Home",
                    val: sum
                });
                drawPieChart(pienumber, data)
            });
    }
}

function drawPieChart(pienumber, data1) {

    var width = 180,
        height = 180,
        radius = Math.min(width, height) / 2;


    //ordinal scale to have different colors for different sections
    var color = d3.scale.ordinal()
        .range(['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928']);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 60);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.val;
        });

    var svg1 = d3.select("#" + pienumber);
    svg1.selectAll('g').remove();

    var piegroup = svg1.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = piegroup.selectAll(".arc")
        .data(pie(data1))
        .enter()
        .append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) {
            return color(d.data.label);
        });

    /*g.append("text")
     .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
     .attr("dy", ".35em")
     .text(function(d) { return d.data.label; });
     */

    function type(d) {
        d.population = +d.population;
        return d;
    }
}
