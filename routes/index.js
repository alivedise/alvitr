
/*
 * GET home page.
 */

var Q = require('q')
  , MaximumLeaders = 6
  , fs = require('fs')
  , Canvas = require('canvas');

var WIDTH = 851
  , HEIGHT = 315;


/**
 * The fixed position of background image.
 * @type {Array}
 */
var BackgroundImageConfig = [
  // Healers
  {
    left: 0,
    top: 350,
    width: 300,
    height: 100
  },
  // Icy Hera
  {
    left: 0,
    top: 150
  },
  // Catee
  {
    left: 0,
    top: 150
  },
  // Catee 2
  {
    left: 0,
    top: 150
  },
  // Icy Hera 2
  {
    left: 0,
    top: 150
  },
  // Isis
  {
    left: 0,
    top: 150
  },
  // Catee 3
  {
    left: 0,
    top: 150
  },
  // Firey Hera
  {
    left: 0,
    top: 150
  },
  // Woody Jupiter
  {
    left: 0,
    top: 150
  },
  // Egy
  {
    left: 0,
    top: 150
  },
  // Black Indu
  {
    left: 0,
    top: 150
  },
  // Z
  {
    left: 0,
    top: 150
  },
  // Dark bear
  {
    left: 0,
    top: 150
  },
  // Spear
  {
    left: 0,
    top: 150
  },
  //
  {
    left: 0,
    top: 150
  },
  // Logi
  {
    left: 0,
    top: 150
  },
  // Moon
  {
    left: 0,
    top: 150
  },
  // Super Metal
  {
    left: 0,
    top: 150
  },
  // Wood Indu
  {
    left: 0,
    top: 150
  },
  // Fire Indu
  {
    left: 0,
    top: 150
  },
  // White shield
  {
    left: 0,
    top: 150
  },
  // Dragon fruit
  {
    left: 0,
    top: 150
  },
  // Anubis
  {
    left: 0,
    top: 150
  },
  // FF flower
  {
    left: 0,
    top: 150
  },
  // Psedon
  {
    left: 0,
    top: 150
  },
  // Venus
  {
    left: 0,
    top: 150
  },
  // Titan
  {
    left: 0,
    top: 150
  },
  // Vinewa
  {
    left: 0,
    top: 150
  },
  // Thadan
  {
    left: 0,
    top: 150
  },
  // Healers
  {
    left: 0,
    top: 150
  },
  // Fire elf
  {
    left: 0,
    top: 150
  },
  // Dragon king
  {
    left: 0,
    top: 150
  },
  // Celeth white
  {
    left: 0,
    top: 150
  },
  // Celeth dark
  {
    left: 0,
    top: 150
  },
  // Saint dragon king
  {
    left: 0,
    top: 150
  },
  // Fire pasty
  {
    left: 0,
    top: 150
  },
  // Big thief
  {
    left: 0,
    top: 150
  },
  // Green spear
  {
    left: 0,
    top: 150
  },
  // Blue sword
  {
    left: 0,
    top: 150
  },
  // Blue sword+red
  {
    left: 0,
    top: 150
  },
  // Vinewa
  {
    left: 0,
    top: 150
  },
  // White shield+green
  {
    left: 0,
    top: 150
  },
  // Woody demon
  {
    left: 0,
    top: 150
  },
  // Icy hera 3
  {
    left: 0,
    top: 150
  },
  // Green dragon
  {
    left: 0,
    top: 150
  },
  // Light dragon
  {
    left: 0,
    top: 150
  },
  // Fire dragon
  {
    left: 0,
    top: 150
  },
  // White shield+
  {
    left: 0,
    top: 150
  },
  // Mao
  {
    left: 0,
    top: 150
  },
  // Ra
  {
    left: 0,
    top: 150
  },
  // Big flower dragon
  {
    left: 0,
    top: 150
  },
  // Vinewa white
  {
    left: 0,
    top: 150
  },
  // Hadeth white
  {
    left: 0,
    top: 150
  },
  // Light elf
  {
    left: 0,
    top: 150
  },
  // Watery elf
  {
    left: 0,
    top: 150
  },
  // White gundam
  {
    left: 0,
    top: 150
  },
  // Firey metal dragon
  {
    left: 0,
    top: 150
  },
  // White shield 3
  {
    left: 0,
    top: 150
  },
  // Dark healer
  {
    left: 0,
    top: 150
  },
  // Watery healer
  {
    left: 0,
    top: 150
  },
  // Firey healer
  {
    left: 0,
    top: 150
  },
  // Light healer
  {
    left: 0,
    top: 150
  },
  // Light indu+
  {
    left: 0,
    top: 150
  }
];

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

  var source = parseInt(req.body['background-image'], 10);
  source = source - 1;

  BackgroundGetter(__dirname + '/../public/images/PAD/' + req.body['background-image'] + '.png').then(function(data) {  
    var img = new Canvas.Image; // Create a new Image
    img.src = data;
    var _x = BackgroundImageConfig[source] ?
      BackgroundImageConfig[source].left : 0;
    var _y = BackgroundImageConfig[source] ?
      BackgroundImageConfig[source].top : 0;
    var _w = BackgroundImageConfig[source].width || w;
    var _h = BackgroundImageConfig[source].width ?
      BackgroundImageConfig[source].width*img.height/img.width : h;
    console.log(source, _x, _y, _w, _h);
    //ctx.drawImage(img, 0, 150, _w, _h,  _x, _y, w, h);
    ctx.drawImage(img, 0, 150, w, h, 0, 0, w, h);

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
    }

    // Reset default.
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = "rgba(255, 255, 255, 0.70)";
    ctx.lineWidth = 5;
    ctx.strokeRect(5/2, 5/2, w - 5, h - 5);
    ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#fff';

    BackgroundGetter(__dirname + '/../public/images/padlogo.png').then(function(data) {
      var img = new Canvas.Image; // Create a new Image
      img.src = data;
      ctx.globalAlpha = 0.8;
      ctx.drawImage(img, 380, 5, 80, 30);
      ctx.globalAlpha = 1.0;

    /* Render name */
    
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'black';
      ctx.font = 'bold 35px Aldine721 BT';
      ctx.textBaseline = 'top';
      ctx.fillText(req.body.name || '', 120, 5);
      ctx.strokeText(req.body.name || '', 120, 5);
    

    /* Render ID */
    
      ctx.fillStyle = 'rgba(1, 134, 209, 0.5)';
      ctx.fillRect( w - 130, 15, 120, 5 );

      ctx.fillStyle = 'black';
      ctx.font = '25px Attic';
      ctx.textBaseline = 'top';
      ctx.fillText(req.body.id || '000000000', w - 140, 0);
    

    /* Render rank */
    
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(w-120, 75, 40, 15);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.font = 'bold 15px Aldine721 BT';
      ctx.textBaseline = 'top';
      ctx.fillText('Rank: ', w - 120, 75);

      //ctx.strokeText('Rank: ', w - 120, 75);
      ctx.font = '15px Attic';
      ctx.fillStyle = 'black';
      ctx.fillText(req.body.rank || 1, w - 68, 73);
    

    /* Render friend */
    
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(w-120, 90, 50, 15);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.font = 'bold 15px Aldine721 BT';
      ctx.textBaseline = 'top';
      ctx.fillText('Friends:', w - 120, 90);
      //ctx.strokeText('Friends:', w - 120, 90);
      ctx.fillStyle = 'black';
      ctx.font = '15px Attic';
      ctx.textBaseline = 'top';
      ctx.fillText(req.body.friend || '0/20', w - 68, 87);
    

      if ('character' in req.body &&
          req.body.character != '') {
        IconGetter(req.body.character).then(function(data) {
          var img = new Canvas.Image; // Create a new Image
          img.src = data;
          ctx.shadowColor = "black";
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
                return index < MaximumLeaders;
              });
              Q.all(queue).then(function(ful) {
                ful.forEach(function(element, index) {
                  var img = new Canvas.Image; // Create a new Image
                  img.src = element;
                  ctx.shadowColor = "black";
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
                ctx.shadowColor = "black";
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
  });
}

module.exports = function(app){
  app.post('/form', render);
  return {
    ImageGetter: BackgroundGetter
  };
};
