/**
 * Created by Onkar on 09/12/2016.
 */
$( document ).ready(function() {/*
   $.ajax({
            url: "http://api.census.gov/data/2015/acs1?get=NAME,B02001_001E&for=state:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09"
        })
        .done(function(data1) {
console.log(data1);
$.ajax({
            url: "http://api.census.gov/data/2015/acs1?get=NAME,B02001_001E&for=county:*&key=576299d4bf73993515a4994ffe79fcee7fe72b09"
        })
        .done(function(data) {
console.log(data);
var sum  = 0;
for(var i =0;i<data1.length;i++){
	if(data[i][2] == "01"){
		console.log(data[i])
		if(parseInt(data[i][1]))
		sum+=parseInt(data[i][1]);
		}
	}
	console.log(sum);
	console.log(data1[1][1])
});;
});;
*/});
var arr = [];
function readfile(name,type){
	$.ajax({
            url: "http://api.census.gov/data/2015/acs1?get=NAME,"+name+"&for="+type+":*&key=576299d4bf73993515a4994ffe79fcee7fe72b09"
        })
        .done(function(data1) {
			var d=[],d1=[];
			console.log(data1);
			data1.forEach(function(county){
				if(county[1]>0)
				d .push(parseInt(county[1]));
			if(county[1]>0)
				d1.push(parseInt(county[2]+county[3]));
				
			});
			arr.push(d);
			arr.push(d1);
			console.log(arr);
			
		}
		);}