
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

function drawImage(ctx, src, config) {
  var img = new Canvas.Image;
  img.src = data;
  ctx.drawImage(img, config.top, config.left, config.width, config.height);
}

function render(req, res) {
  var w = 600;
  var h = 110;

  var canvas = new Canvas(w, h)
    , ctx = canvas.getContext('2d');

  BackgroundGetter(__dirname + '/../public/images/ws.png').then(function(data) {  
    var img = new Canvas.Image; // Create a new Image
    img.src = data;
    ctx.drawImage(img, 0, 150, w, h, 0, 0, w, h);

    var tintColor = '#0186d1';
    // color transformation
    var map = ctx.getImageData(0, 0, w, h);
    var imdata = map.data;

    // convert image to grayscale
    var r,g,b,avg;
    for(var p = 0, len = imdata.length; p < len; p+=4) {
        r = imdata[p]
        g = imdata[p+1];
        b = imdata[p+2];
        
        avg = Math.floor((r+g+b)/3);

        imdata[p] = imdata[p+1] = imdata[p+2] = avg;
    }

    ctx.putImageData(map, 0, 0);

    // overlay filled rectangle using lighter composition
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = tintColor;
    ctx.fillRect(0, 0, w, h);

    // Reset default.
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = "rgba(255, 255, 255, 0.50)";
    ctx.lineWidth = 5;
    ctx.strokeRect(5/2, 5/2, w - 5, h - 5);
    ctx.lineWidth = 1;

    if ('background' in req.body) {
      /*
      var lingrad = ctx.createLinearGradient(0, 0, 0, h);
      lingrad.addColorStop(0, "rgba(0, 0, 0, 1)");
      lingrad.addColorStop(0.15, "rgba(0, 0, 0, 0.2)");
      lingrad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
      lingrad.addColorStop(0.85, "rgba(0, 0, 0, 0.2)");
      //lingrad.addColorStop(1, req.body.background);
      lingrad.addColorStop(1, "rgba(0, 0, 0, 1)");
      ctx.fillStyle = lingrad;
      //ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);


      var horizontal_rad = ctx.createLinearGradient(0, 0, w, 0);
      horizontal_rad.addColorStop(0, "rgba(0, 0, 0, 1)");
      horizontal_rad.addColorStop(0.35, "rgba(0, 0, 0, 0.2)");
      horizontal_rad.addColorStop(0.65, "rgba(0, 0, 0, 0)");
      horizontal_rad.addColorStop(0.9, "rgba(0, 0, 0, 0.2)");
      horizontal_rad.addColorStop(1, "rgba(0, 0, 0, 1)");
      ctx.fillStyle = horizontal_rad;*/
      //ctx.fillStyle = 'rgba(0.1, 0.1, 1.0, 0.3)';
      //ctx.fillRect(0, 0, w, h);
    }

    ctx.fillStyle = '#fff';

    if ('name' in req.body) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'black';
      ctx.font = '35px Aldine721 BT';
      ctx.textBaseline = 'top';
      ctx.fillText(req.body.name, 120, 5);
      ctx.strokeText(req.body.name, 120, 5);
    }

    if ('id' in req.body) {
      console.log(req.body.id);
      ctx.fillStyle = '#111111';
      ctx.font = '25px Attic';
      ctx.textBaseline = 'top';
      ctx.fillText(req.body.id, w - 140, 5);
    }

    if ('rank' in req.body) {
      console.log(req.body.id);
      ctx.fillStyle = 'gold';
      ctx.strokeStyle = 'yellow';
      ctx.font = '15px Attic';
      ctx.textBaseline = 'top';
      ctx.fillText('Rank: ' + req.body.rank, w - 120, 70);
      ctx.strokeText('Rank: ' + req.body.rank, w - 120, 70);
    }

    if ('friend' in req.body) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'black';
      ctx.font = '15px Aldine721 BT';
      ctx.textBaseline = 'top';
      ctx.fillText('Friends:', w - 120, 85);
      ctx.strokeText('Friends:', w - 120, 85);
      ctx.fillStyle = 'black';
      ctx.font = '15px Attic';
      ctx.fillText(req.body.friend, w - 75, 85);
    }

    if ('character' in req.body &&
        req.body.character != '') {
      IconGetter(req.body.character).then(function(data) {
        var img = new Canvas.Image; // Create a new Image
        img.src = data;
        ctx.shadowColor = "#999999";
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        //ctx.shadowBlur = 5;
        ctx.fillRect(5, 5, img.width, img.height);
        ctx.drawImage(img, 5, 5, img.width, img.height);
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
                ctx.shadowColor = "#999999";
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;
                ctx.shadowBlur = 20;
                ctx.fillRect(120 + index*50, 50 , img.width/2, img.height/2);
                ctx.drawImage(img, 120 + index * 50, 50, img.width/2, img.height/2);
              });
              resolve(res, canvas);
            });
          } else {
            IconGetter(req.body.leaders).then(function(data) {
              var img = new Canvas.Image; // Create a new Image
              img.src = data;
              ctx.shadowColor = "#999999";
              ctx.shadowOffsetX = 5;
              ctx.shadowOffsetY = 5;
              ctx.shadowBlur = 20;
              ctx.fillRect(120, 50 , img.width/2, img.height/2);
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
