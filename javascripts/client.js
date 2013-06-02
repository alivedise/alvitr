
/*
 * GET home page.
 */

(function(window) {
  var $ = window.jQuery;
  var document = window.document;
  var MaximumLeaders = 6;

  var canvas = document.createElement('canvas'),
  ctx = canvas.getContext('2d'),
  queue = [];

  // The width and height of final output.
  var w = 851;
  var h = 315;

  // Declare image constant.
  var MAIN_CHAR_IMAGE_CONFIG = {};
  var LEADERS_IMAGE_CONFIG = {};
  var LEADERS_2_IMAGE_CONFIG = {};
  var NAME_CONFIG = {};

  var BackgroundGetter = function(src) {
    var deferred = $.Deferred()
      , img = new Image();

    img.onload = function(){
      deferred.resolve(img);
      deferred = img = null;
    };
    img.src = src;

    setTimeout(function(){
      console.warn('Get image: ', src, ' failed.');
      try {
        deferred.reject();
      } catch (e) {
        
      }
    }, 10000);

    return deferred.promise();
  };

  var IconGetter = function(MID) {
    MID = '' + MID;

    if (MID.length < 2) {
      MID = '00' + MID;
    } else if (MID.length < 3) {
      MID = '0' + MID;
    }

    return BackgroundGetter('images/icon/' + MID + 'i.png');
  };

  function getIconAndDraw(id, ctx, index) {
    var d = $.Deferred();
    IconGetter(id).then(function(img) {
      ctx.shadowColor = "black";
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.shadowBlur = 5;
      ctx.drawImage(img,
                  LEADERS_IMAGE_CONFIG.OFFSET_X + index * (50+2),
                  LEADERS_IMAGE_CONFIG.OFFSET_Y,
                  LEADERS_IMAGE_CONFIG.WIDTH,
                  LEADERS_IMAGE_CONFIG.HEIGHT);
      d.resolve();
    });
    return d.promise();
  };

  function resolve(callback) {
    callback(canvas.toDataURL());
  }

  function render(param, callback) {

    // Determine the image offset/size by global image size
    switch (param['image-size'] ) {
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

    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);

    var source = parseInt(param['background-image'], 10);
    source = source - 1;

    BackgroundGetter('images/background/' + param['background-image'] + '.png').then(function(data) {  
      // Try to scale the background image to a reasonable size and position
      var _x = 0
        , _y = 150
        , _w
        , _h
        , _sw
        , _sh
        , _sx;

      switch (param['image-size']) {
        case 'facebook-cover':
          // For facebook, we try to fit the height of image.
          _sw = w - 200;
          _sh = h;
          _w = data.width;
          _h = data.width*_sh/_sw;
          _y = _h * 0.25;
          _sx = 200;
          break;
        case 'signature':
          // For signature, we try not to resize too much.
          _sw = w - 220;
          _sh = h;
          _w = data.width;
          _h = data.width*_sh/_sw;
          _y = _h * 0.25;
          _sx = 220;
          break;
      }
      
      ctx.drawImage(data, _x, _y, _w, _h, /* The offset of main char */_sx, 0, _sw, _sh);
      //ctx.drawImage(img, 0, 150, w, h, 100, 0, w, h);

      /* Background image color transformation */
      if (param['background-color'] &&
          param['background-color'] != 'none') {
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
        ctx.fillStyle = param['background-color'];
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

      BackgroundGetter('images/padlogo.png').then(function(data) {
        ctx.globalAlpha = 0.8;
        ctx.drawImage(data, w - 220, 5, 80, 30);
        ctx.globalAlpha = 1.0;

      /* Render name */
      
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'black';
        ctx.font = 'bold ' + NAME_CONFIG.SIZE + 'px Aldine721 BT';
        ctx.textBaseline = 'top';
        ctx.fillText(param.name || '', NAME_CONFIG.OFFSET_X, NAME_CONFIG.OFFSET_Y);
        ctx.strokeText(param.name || '', NAME_CONFIG.OFFSET_X, NAME_CONFIG.OFFSET_Y);
      

      /* Render ID */
      
        ctx.fillStyle = 'rgba(1, 134, 209, 0.5)';
        ctx.fillRect( w - 130, 15, 120, 5 );

        ctx.fillStyle = 'black';
        ctx.font = '25px Attic';
        ctx.textBaseline = 'top';
        ctx.fillText(param.id || '000000000', w - 140, 0);
      

      /* Render rank */
      
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(w-120, h - 35, 40, 15);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.font = 'bold 15px Aldine721 BT';
        ctx.textBaseline = 'top';
        ctx.fillText('Rank', w - 120, h - 35);

        //ctx.strokeText('Rank: ', w - 120, 75);
        ctx.font = '15px Attic';
        ctx.fillStyle = 'black';
        ctx.fillText(param.rank || 1, w - 68, h - 35 - 2);
      

      /* Render friend */
      
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(w-120, h - 20, 50, 15);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.font = 'bold 15px Aldine721 BT';
        ctx.textBaseline = 'top';
        ctx.fillText('Friend', w - 120, h - 20);
        //ctx.strokeText('Friends:', w - 120, 90);
        ctx.fillStyle = 'black';
        ctx.font = '15px Attic';
        ctx.textBaseline = 'top';
        ctx.fillText(param.friend || '0/20', w - 68, h - 20 - 3);
      

        if ('character' in param &&
            param.character != '') {
          IconGetter(param.character).then(function(data) {
            ctx.shadowColor = "black";
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.shadowBlur = 5;
            ctx.fillStyle = 'rgba(255, 255, 255, 0)';
            ctx.drawImage(data,
                          MAIN_CHAR_IMAGE_CONFIG.OFFSET_X,
                          MAIN_CHAR_IMAGE_CONFIG.OFFSET_Y,
                          MAIN_CHAR_IMAGE_CONFIG.WIDTH,
                          MAIN_CHAR_IMAGE_CONFIG.HEIGHT);
            if ('leaders' in param) {
              param.leaders.forEach(function(mid, index) {
                queue.push(getIconAndDraw(mid, ctx, index));
              });
              $.when.apply($, queue).then(function(){
                resolve(callback);
              });
            } else {
              resolve(callback);
            }
          });
        }
      });
    });
  }

  window.renderClient = render;
}(this));

