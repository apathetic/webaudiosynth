var express = require('express');
var fs = require('fs')
// var path = require('path');
var port = 3000;
var app = express();


app.use(express.static(__dirname + '/public'));

app.use(function(req, res){
	var thePossibilites = [];
	var route;
	var random;

	fs.readdirSync('public').forEach( function(name) {
		route = 'public/' + name + '/index.html';
		if (fs.existsSync(route)) {
			thePossibilites.push(route);
		}
	});

	random = Math.floor(Math.random() * thePossibilites.length);
	// random = 0;// not so random

	res.sendfile( thePossibilites[random] );
});



app.listen(port, function() {
  console.log('malfunction at http://localhost:' + port);
});

// module.exports = app;