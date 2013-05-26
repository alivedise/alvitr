
/*
 * GET home page.
 */

var Q = require('q')
  , MaximumLeaders = 10
  , fs = require('fs')
  , Canvas = require('canvas');

var IconGetter = function(MID) {
  var deferred = Q.defer();
  MID = '' + MID;

  if (MID.length < 2) {
    MID = '00' + MID;
  } else if (MID.length < 3) {
    MID = '0' + MID;
  }

  fs.readFile(__dirname + '/../public/images/' + MID + 'i.png', function(err, data) {  
    if (err) {
      deferred.reject();
    } else {
      console.log('on getting ', MID, 'success');
      deferred.resolve(data);
    }
  });
  return deferred.promise;
};

function resolve(res, canvas) {
  var out = fs.createWriteStream(__dirname + '/../public/state.png')
    , stream = canvas.createPNGStream();

  stream.on('data', function(chunk){
    out.write(chunk);
  });

  stream.on('end', function(){
    out.end();
    res.send("上传成功！");
  });
}

module.exports = function(app){
  app.post('/form', function(req, res){
    console.log('body: ' + JSON.stringify(req.body));

    var canvas = new Canvas(600, 100)
      , ctx = canvas.getContext('2d');

    if ('background' in req.body) {
      ctx.fillStyle = req.body.background;
      ctx.fillRect(0, 0, 600, 100);
    }

    if ('character' in req.body &&
        req.body.character != '') {
      IconGetter(req.body.character).then(function(data) {
        var img = new Canvas.Image; // Create a new Image
        img.src = data;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        if ('leaders' in req.body) {
          if (Object.prototype.toString.call( req.body.leaders )
              === '[object Array]') {
            var queue = [];
            // For each random number, create a function call and addit to the queue <img src="http://erickrdch.com/_/wp-includes/images/smilies/icon_wink.gif" alt=";)" class="wp-smiley"> 
            req.body.leaders.forEach(function(mid, index) {
              queue.push(IconGetter(mid));
            });
            Q.all(queue).then(function(ful) {
              ful.forEach(function(element, index) {
                var img = new Canvas.Image; // Create a new Image
                img.src = element;
                console.log('drawing', img, 'on', index);
                ctx.drawImage(img, 120 + index * 50, 55, img.width/2, img.height/2);
              });
              resolve(res, canvas);
            });
          } else {
            IconGetter(req.body.leaders).then(function(data) {
              var img = new Canvas.Image; // Create a new Image
              img.src = data;
              ctx.drawImage(img, 120, 60, img.width/2, img.height/2);
              resolve(res, canvas);
            });
          }
        } else {
          resolve(res, canvas);
        }
      });
    }
  });
};