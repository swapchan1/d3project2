var express = require('express');
var app = express();

app.use(express.static('/Users/azizkhilawala/Documents/Repositories/d3project2'));

app.listen(8089, function() {
    console.log('Example app listening on port 8089!');
});
