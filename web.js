#!/usr/bin/env node

var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());
app.use("/bootstrap", express.static(__dirname + '/bootstrap'));
app.use("/jquery", express.static(__dirname + '/jquery'));
app.use("/bootstrap-social-buttons", express.static(__dirname + '/bootstrap-social-buttons'));
app.use("/Font-Awesome", express.static(__dirname + '/Font-Awesome'));

app.use("/include", express.static(__dirname + '/include'));



app.get('/', function(request, response) {
	var buf = new Buffer(fs.readFileSync('index.html'));
	response.send(buf.toString());
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log("Listening on " + port);
});
