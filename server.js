var express = require('express');
var app = express();

app.use(express.static('/Users/azizkhilawala/Documents/Repositories/newD3project2/d3project2'));

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});