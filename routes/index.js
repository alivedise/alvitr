
/*
 * GET home page.
 */

var Q = require('q')
  , MaximumLeaders = 6
  , fs = require('fs')
  , Canvas = require('canvas');

var WIDTH = 851
  , HEIGHT = 315;

var BackgroundGetter = function(src) {
  var deferred = Q.defer();
  fs.readFile(src, function(err, data) {  
    if (err) {
      deferred.reject();
    } else {
      deferred.resolve(data);
    }
  });
  return deferred.promise;
};

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

function render(req, res) {
  var w = 600;
  var h = 100;

  var canvas = new Canvas(w, h)
    , ctx = canvas.getContext('2d');

  BackgroundGetter(__dirname + '/../public/images/ws.png').then(function(data) {  
    var img = new Canvas.Image; // Create a new Image
    img.src = data;
    ctx.drawImage(img, 0, 200, w, h, 0, 0, img.width, img.height);

    if ('background' in req.body) {
      var lingrad = ctx.createLinearGradient(0, 0, 0, h);
      lingrad.addColorStop(0, "rgba(0, 0, 0, 1)");
      lingrad.addColorStop(0.5, "rgba(0, 0, 0, 0.5)");
      //lingrad.addColorStop(1, req.body.background);
      lingrad.addColorStop(1, "rgba(0, 0, 0, 1)");
      ctx.fillStyle = lingrad;
      //ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
    }

    if ('name' in req.body) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 35px Calibri';
      ctx.textBaseline = 'top';
      ctx.fillText(req.body.name, 120, 0);
    }

    if ('id' in req.body) {
      console.log(req.body.id);
      ctx.fillStyle = '#0186d1';
      ctx.font = 'bold 25px Calibri';
      ctx.textBaseline = 'top';
      ctx.fillText(req.body.id, w - 120, 0);
    }

    if ('rank' in req.body) {
      console.log(req.body.id);
      ctx.fillStyle = 'gold';
      ctx.font = 'bold 15px Calibri';
      ctx.textBaseline = 'top';
      ctx.fillText('Rank: ' + req.body.rank, w - 100, 50);
    }

    if ('friend' in req.body) {
      console.log(req.body.id);
      ctx.fillStyle = 'silver';
      ctx.font = 'bold 15px Calibri';
      ctx.textBaseline = 'top';
      ctx.fillText('Friends:' + req.body.friend, w - 100, 65);
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
                ctx.drawImage(img, 120 + index * 50, 50, img.width/2, img.height/2);
              });
              resolve(res, canvas);
            });
          } else {
            IconGetter(req.body.leaders).then(function(data) {
              var img = new Canvas.Image; // Create a new Image
              img.src = data;
              ctx.drawImage(img, 120, 50, img.width/2, img.height/2);
              resolve(res, canvas);
            });
          }
        } else {
          resolve(res, canvas);
        }
      });
    }
  });
}

module.exports = function(app){
  app.post('/form', render);
};