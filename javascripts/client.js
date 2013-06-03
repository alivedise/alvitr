
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
  var RANK_CONFIG = {};
  var FRIEND_CONFIG = {};
  var ID_CONFIG = {};
  var LOGO_CONFIG = {};
  var BRUSH_CONFIG = {
    HEIGHT: 5
  };

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
                    LEADERS_IMAGE_CONFIG.OFFSET_X + index * (LEADERS_IMAGE_CONFIG.WIDTH + 2),
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
        // See https://www.facebook.com/CoverPhotoSize for more information.
        // Though that's for non-personal pages.
        MAIN_CHAR_IMAGE_CONFIG = {
          WIDTH: 80,
          HEIGHT: 80,
          OFFSET_X: 170 + 23 + 23,  /* At right of facebook user portrait */
          OFFSET_Y: 180    /* Offset the same as facebook user portrait */
                           /* This is offset of user not special page */
        };
        LEADERS_IMAGE_CONFIG = {
          WIDTH: 40,
          HEIGHT: 40,
          OFFSET_X: 315,  /* Portrait offset + Main char offset */
          OFFSET_Y: 180 + (80 - 40) /* Main char height - leader height */
        };
        NAME_CONFIG = {
          OFFSET_X: 315,  /* the same as leaders */
          OFFSET_Y: 180,   /* the same as main */
          SIZE: 35
        };
        RANK_CONFIG = {
          OFFSET_X: w - 185, /* the same as track button */
          OFFSET_Y: 180 + 80,
          WIDTH: 70,
          SIZE: 25
        };
        FRIEND_CONFIG = {
          OFFSET_X: w - 116,
          OFFSET_Y: h - 20,
          WIDTH: 150,
          SIZE: 25
        };
        ID_CONFIG = {
          OFFSET_X: w - 145,
          OFFSET_Y: 180,
          WIDTH: 145
          SIZE: 30
        };
        LOGO_CONFIG = {
          OFFSET_X: 23, /* left top of cover */
          OFFSET_Y: 23,
          WIDTH: 100,
          HEIGHT: 37.5
        }
        break;
      case 'signature':
        w = 700;
        h = 170;
        LOGO_CONFIG = {
          WIDTH: 80,
          HEIGHT: 30,
          OFFSET_X: w - 220,
          OFFSET_Y: 5
        }
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
        RANK_CONFIG = {
          OFFSET_X: w - 120,
          OFFSET_Y: h - 80,
          WIDTH: 55,
          SIZE: 20
        };
        FRIEND_CONFIG = {
          OFFSET_X: w - 120,
          OFFSET_Y: h - 20,
          WIDTH: 120,
          SIZE: 20
        };
        ID_CONFIG = {
          OFFSET_X: w - 140,
          OFFSET_Y: 15,
          SIZE: 25
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
          _sw = w;
          _sh = h;
          _w = data.width;
          _h = data.width*_sh/_sw;
          _y = _h * 0.25;
          _sx = 0;
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
        ctx.drawImage(data,
                      LOGO_CONFIG.OFFSET_X,
                      LOGO_CONFIG.OFFSET_Y,
                      LOGO_CONFIG.WIDTH,
                      LOGO_CONFIG.HEIGHT);
        ctx.globalAlpha = 1.0;

      /* Render name */
      
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'black';
        ctx.font = 'bold ' + NAME_CONFIG.SIZE + 'px Aldine721 BT';
        ctx.textBaseline = 'top';
        ctx.fillText(param.name || '',
                      NAME_CONFIG.OFFSET_X,
                      NAME_CONFIG.OFFSET_Y);
        ctx.strokeText(param.name || '',
                        NAME_CONFIG.OFFSET_X,
                        NAME_CONFIG.OFFSET_Y);
      

      /* Render ID */
        /* Paint a blue brush */
        ctx.fillStyle = 'rgba(1, 134, 209, 0.5)';
        ctx.fillRect( ID_CONFIG.OFFSET_X + ID_CONFIG.OFFSET_X / 2 - BRUSH_CONFIG.HEIGHT / 2,
                      ID_CONFIG.OFFSET_Y,
                      ID_CONFIG.WIDTH,
                      BRUSH_CONFIG.HEIGHT);

        ctx.fillStyle = 'black';
        ctx.font = ID_CONFIG.SIZE + 'px Attic';
        ctx.textBaseline = 'top';
        ctx.fillText(param.id || '000000000',
                      ID_CONFIG.OFFSET_X,
                      ID_CONFIG.OFFSET_Y);
      

      /* Render rank */
        /* Paint a yellow brush */
        ctx.fillStyle = 'rgba(255, 255, 102, 0.5)';

        ctx.fillRect( RANK_CONFIG.OFFSET_X + RANK_CONFIG.OFFSET_X / 2 - BRUSH_CONFIG.HEIGHT / 2,
                      RANK_CONFIG.OFFSET_Y,
                      RANK_CONFIG.WIDTH,
                      BRUSH_CONFIG.HEIGHT);

        ctx.textBaseline = 'top';
        ctx.font = RANK_CONFIG.SIZE + 'px Attic';
        ctx.fillStyle = 'black';
        ctx.fillText('RANK:' + (param.rank || 1),
                      RANK_CONFIG.OFFSET_X,
                      RANK_CONFIG.OFFSET_Y);
      

      /* Render friend */
        /* Paint a green brush */
        ctx.fillStyle = 'rgba(102, 255, 179, 0.5)';
        ctx.fillRect( FRIEND_CONFIG.OFFSET_X + FRIEND_CONFIG.OFFSET_X / 2 - BRUSH_CONFIG.HEIGHT / 2,
                      FRIEND_CONFIG.OFFSET_Y,
                      FRIEND_CONFIG.WIDTH,
                      BRUSH_CONFIG.HEIGHT);
        ctx.fillStyle = 'black';
        ctx.font = FRIEND_CONFIG.SIZE + 'px Attic';
        ctx.textBaseline = 'top';
        ctx.fillText('FRIEND:' + (param.friend || '0/20'),
                      FRIEND_CONFIG.OFFSET_X,
                      FRIEND_CONFIG.OFFSET_Y);
      

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
                mid = '' + mid;
                if (mid !== '0') {
                  queue.push(getIconAndDraw(mid, ctx, index));
                }
              });
              if (queue.length > 0) {
                $.when.apply($, queue).then(function(){
                  resolve(callback);
                });
              } else {
                resolve(callback);
              }
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

