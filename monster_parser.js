//monster_parser.js

var fs  = require("fs");

fs.readFileSync('./padmonster.csv').toString().split('\n').forEach(function (line) { 
    var a = line.split(',');
    if ( a.length >= 3 && Number(a[0]) > 0 ) {
      fs.appendFileSync('./output2.txt', '  "' + a[0] + '": "No.' + a[0] + ': ' + a[1] + '-' + a[2] + '",\n');
    }
});