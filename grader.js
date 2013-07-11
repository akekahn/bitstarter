#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var sys = require('util');
var restler = require('restler/lib/restler.js');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var downloadurl = function(inurl){
	restler.get(inurl).on('complete', function(result) {
	  if (result instanceof Error) {
		sys.puts('Error: ' + result.message);
		this.retry(5000); // try again after 5 sec
	  } else {
		var checkFile = fs.createWriteStream("check.html");
		checkFile.end(result);
		runChecks();
		return "grader_check.html";
	  }
	});
}

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
		// if the file does not exist and is an url, download it.
		if(instr.substr(0,4) == "http"){
			downloadurl(instr);
			instr = "grader_check.html";
			return instr;
		}else{
			console.log("%s does not exist. Exiting.", instr);
			process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
		}
    }else{
		return instr;
	}
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var runChecks = function(){
	console.log(program.file);
	var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    var outFile = fs.createWriteStream("grader_output.json");
    outFile.end(outJson);
    console.log(outJson);
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .parse(process.argv);
        if(program.file != "grader_check.html"){
			var checkJson = checkHtmlFile(program.file, program.checks);
			var outJson = JSON.stringify(checkJson, null, 4);
			var outFile = fs.createWriteStream("grader_output.json");
			outFile.end(outJson);
			console.log(outJson);
		}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
