//monster_leaking.js

var fs = require('fs');
var LEAKING = [];
for (var i = 1; i <= 1104; i++) {
  if (fs.existsSync('./MONS_' + i + '.png')) { // or fs.existsSync
    
  } else if (fs.existsSync('./MONS_' + i + '.PNG')) {
    fs.rename('./MONS_' + i + '.PNG', './MONS_' + i + '.png');
  } else {
    LEAKING.push(i);
  }
}

console.log(LEAKING.length);
console.log(LEAKING);