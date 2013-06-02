
/*
 * GET home page.
 */

var Q = require('q')
  , MaximumLeaders = 6
  , fs = require('fs')
  , Canvas = require('canvas')
  , sys = require('sys')
  , uuid = require('uuid')
  , IMAGE_CACHE = {};           // Store the UUID and image filename


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

  fs.readFile(__dirname + '/../public/images/icon/' + MID + 'i.png', function(err, data) {  
    if (err) {
      deferred.reject();
    } else {
      deferred.resolve(data);
    }
  });
  return deferred.promise;
};

function resolve(res, canvas) {
  /*var out = fs.createWriteStream(__dirname + '/../public/state.png')
    , stream = canvas.createPNGStream();

  stream.on('data', function(chunk){
    out.write(chunk);
  });

  stream.on('end', function(){
    out.end();
   });
*/
    res.send(canvas.toDataURL());
  
}

function drawImage(ctx, src, config) {
  var img = new Canvas.Image;
  img.src = data;
  ctx.drawImage(img, config.top, config.left, config.width, config.height);
}

function render(req, res) {
  console.log(req.uuid);

  // The width and height of final output.
  var w = 851;
  var h = 315;

  // Declare image constant.
  var MAIN_CHAR_IMAGE_CONFIG = {};
  var LEADERS_IMAGE_CONFIG = {};
  var LEADERS_2_IMAGE_CONFIG = {};
  var NAME_CONFIG = {};

  // Determine the image offset/size by global image size
  switch (req.body['image-size'] ) {
    case 'facebook-cover':
      w = 851;
      h = 315;
      MAIN_CHAR_IMAGE_CONFIG = {
        WIDTH: 100,
        HEIGHT: 100,
        OFFSET_X: 5,
        OFFSET_Y: 50 
      };
      LEADERS_IMAGE_CONFIG = {
        WIDTH: 50,
        HEIGHT: 50,
        OFFSET_X: 5,
        OFFSET_Y: 155
      };
      NAME_CONFIG = {
        OFFSET_X: 5,
        OFFSET_Y: 5,
        SIZE: 35
      }
      break;
    case 'signature':
      w = 700;
      h = 170;
      MAIN_CHAR_IMAGE_CONFIG = {
        WIDTH: 100,
        HEIGHT: 100,
        OFFSET_X: 5,
        OFFSET_Y: 5 
      };
      LEADERS_IMAGE_CONFIG = {
        WIDTH: 50,
        HEIGHT: 50,
        OFFSET_X: 5,
        OFFSET_Y: 110
      };
      NAME_CONFIG = {
        OFFSET_X: 120,
        OFFSET_Y: 5,
        SIZE: 35
      };
      break;
  }

  var canvas = new Canvas(w, h)
    , ctx = canvas.getContext('2d');

  var source = parseInt(req.body['background-image'], 10);
  source = source - 1;

  BackgroundGetter(__dirname + '/../public/images/PAD/' + req.body['background-image'] + '.png').then(function(data) {  
    var img = new Canvas.Image; // Create a new Image
    img.src = data;

    // Try to scale the background image to a reasonable size and position
    var _x = 0
      , _y = 150
      , _w
      , _h
      , _sw
      , _sh
      , _sx;

    switch (req.body['image-size']) {
      case 'facebook-cover':
        // For facebook, we try to fit the height of image.
        _sw = w - 200;
        _sh = h;
        _w = img.width;
        _h = img.width*_sh/_sw;
        _y = _h * 0.25;
        _sx = 200;
        break;
      case 'signature':
        // For signature, we try not to resize too much.
        _sw = w - 200;
        _sh = h;
        _w = img.width;
        _h = img.width*_sh/_sw;
        _y = _h * 0.25;
        _sx = 200;
        break;
    }

    console.log(_x, _y, _w, _h);
    
    ctx.drawImage(img, _x, _y, _w, _h, /* The offset of main char */_sx, 0, _sw, _sh);
    //ctx.drawImage(img, 0, 150, w, h, 100, 0, w, h);

    /* Background image color transformation */
    if (req.body['background-color'] &&
        req.body['background-color'] != 'none') {
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
      ctx.fillStyle = req.body['background-color'];
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillRect(0, 0, w, h);
    }

    // Reset default.
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = "rgba(255, 255, 255, 0.50)";
    ctx.lineWidth = 5;
    ctx.strokeRect(5/2, 5/2, w - 5, h - 5);
    ctx.lineWidth = 1;

    ctx.fillStyle = '#fff';

    BackgroundGetter(__dirname + '/../public/images/padlogo.png').then(function(data) {
      var img = new Canvas.Image; // Create a new Image
      img.src = data;
      ctx.globalAlpha = 0.8;
      ctx.drawImage(img, w - 220, 5, 80, 30);
      ctx.globalAlpha = 1.0;

    /* Render name */
    
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'black';
      ctx.font = 'bold ' + NAME_CONFIG.SIZE + 'px Aldine721 BT';
      ctx.textBaseline = 'top';
      ctx.fillText(req.body.name || '', NAME_CONFIG.OFFSET_X, NAME_CONFIG.OFFSET_Y);
      ctx.strokeText(req.body.name || '', NAME_CONFIG.OFFSET_X, NAME_CONFIG.OFFSET_Y);
    

    /* Render ID */
    
      ctx.fillStyle = 'rgba(1, 134, 209, 0.5)';
      ctx.fillRect( w - 130, 15, 120, 5 );

      ctx.fillStyle = 'black';
      ctx.font = '25px Attic';
      ctx.textBaseline = 'top';
      ctx.fillText(req.body.id || '000000000', w - 140, 0);
    

    /* Render rank */
    
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(w-120, h - 35, 40, 15);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.font = 'bold 15px Aldine721 BT';
      ctx.textBaseline = 'top';
      ctx.fillText('Rank: ', w - 120, h - 35);

      //ctx.strokeText('Rank: ', w - 120, 75);
      ctx.font = '15px Attic';
      ctx.fillStyle = 'black';
      ctx.fillText(req.body.rank || 1, w - 68, h - 35 - 2);
    

    /* Render friend */
    
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(w-120, h - 20, 50, 15);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.font = 'bold 15px Aldine721 BT';
      ctx.textBaseline = 'top';
      ctx.fillText('Friends: ', w - 120, h - 20);
      //ctx.strokeText('Friends:', w - 120, 90);
      ctx.fillStyle = 'black';
      ctx.font = '15px Attic';
      ctx.textBaseline = 'top';
      ctx.fillText(req.body.friend || '0/20', w - 68, h - 20 - 3);
    

      if ('character' in req.body &&
          req.body.character != '') {
        IconGetter(req.body.character).then(function(data) {
          var img = new Canvas.Image; // Create a new Image
          img.src = data;
          ctx.shadowColor = "black";
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.shadowBlur = 5;
          ctx.fillStyle = 'rgba(255, 255, 255, 0)';
          // XXX: workaround of image leaking shadow
          ctx.fillRect(MAIN_CHAR_IMAGE_CONFIG.OFFSET_X,
                        MAIN_CHAR_IMAGE_CONFIG.OFFSET_Y,
                        MAIN_CHAR_IMAGE_CONFIG.WIDTH,
                        MAIN_CHAR_IMAGE_CONFIG.HEIGHT);
          ctx.drawImage(img,
                        MAIN_CHAR_IMAGE_CONFIG.OFFSET_X,
                        MAIN_CHAR_IMAGE_CONFIG.OFFSET_Y,
                        MAIN_CHAR_IMAGE_CONFIG.WIDTH,
                        MAIN_CHAR_IMAGE_CONFIG.HEIGHT);
          if ('leaders' in req.body) {
            if (Object.prototype.toString.call( req.body.leaders )
                === '[object Array]') {
              var queue = [];
              // For each random number, create a function call and addit to the queue <img src="http://erickrdch.com/_/wp-includes/images/smilies/icon_wink.gif" alt=";)" class="wp-smiley"> 
              req.body.leaders.forEach(function(mid, index) {
                queue.push(IconGetter(mid));
                return index < MaximumLeaders;
              });
              Q.all(queue).then(function(ful) {
                ful.forEach(function(element, index) {
                  var img = new Canvas.Image; // Create a new Image
                  img.src = element;
                  ctx.shadowColor = "black";
                  ctx.shadowOffsetX = 5;
                  ctx.shadowOffsetY = 5;
                  ctx.shadowBlur = 5;
                  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
                  // XXX: Workaround of leaking shadow when drawImage
                  ctx.fillRect(LEADERS_IMAGE_CONFIG.OFFSET_X + index*(50+2),
                               LEADERS_IMAGE_CONFIG.OFFSET_Y,
                               LEADERS_IMAGE_CONFIG.WIDTH,
                               LEADERS_IMAGE_CONFIG.HEIGHT);
                  ctx.drawImage(img,
                              LEADERS_IMAGE_CONFIG.OFFSET_X + index * (50+2),
                              LEADERS_IMAGE_CONFIG.OFFSET_Y,
                              LEADERS_IMAGE_CONFIG.WIDTH,
                              LEADERS_IMAGE_CONFIG.HEIGHT);
                });
                resolve(res, canvas);
              });
            } else {
              IconGetter(req.body.leaders).then(function(data) {
                var img = new Canvas.Image; // Create a new Image
                img.src = data;
                ctx.shadowColor = "black";
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;
                ctx.shadowBlur = 5;
                ctx.fillStyle = 'rgba(255, 255, 255, 0)';
                // XXX: Workaround of leaking shadow when drawImage
                ctx.fillRect(LEADERS_IMAGE_CONFIG.OFFSET_X,
                             LEADERS_IMAGE_CONFIG.OFFSET_Y,
                             LEADERS_IMAGE_CONFIG.WIDTH,
                             LEADERS_IMAGE_CONFIG.HEIGHT);
                ctx.drawImage(img,
                            LEADERS_IMAGE_CONFIG.OFFSET_X,
                            LEADERS_IMAGE_CONFIG.OFFSET_Y,
                            LEADERS_IMAGE_CONFIG.WIDTH,
                            LEADERS_IMAGE_CONFIG.HEIGHT);
                resolve(res, canvas);
              });
            }
          } else {
            resolve(res, canvas);
          }
        });
      }
    });
  });
}

function image_downloader(req, res) {
  if (!req.body.dataurl) {
    res.send('');
    return;
  }
  var data = req.body.dataurl.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer(data, 'base64');
  var id = uuid.v1();
  var filename = __dirname + '/../public/images/user/' + id + '.png';
  fs.writeFileSync(filename, buf);
  res.send({
    id: id
  });
}

function image_provider(req, res) {
  if(req.query.id) {
    var filename = __dirname + '/../public/images/user/' + req.query.id + '.png';
    fs.stat(filename, function(error, stat) {
      if (error) { throw error; }
          res.writeHead(200, {
            'Content-Type' : 'image/png',
            'Content-Length' : stat.size
          });

      var fileStream = fs.createReadStream(filename);
      fileStream.on('data', function (data) {
        res.write(data);
      });
      fileStream.on('end', function() {
        res.end();
      });
    });
  }
}

module.exports = function(app){
  app.post('/form', render);
  app.post('/download', image_downloader);
  app.get('/download.png', image_provider);
  return {
    ImageGetter: BackgroundGetter
  };
};
