
/*
 * GET home page.
 */

(function(window) {
  var IMAGE_PATH_PREFIX = '';
  switch (window.location.protocol) {
    case 'http:':
    case 'https:':
      //remote file over http or https
      //do nothing
      break;
    case 'file:':
      //local file
      // if we're loading from local storage, use http://MYSITE
      // to load image.
      IMAGE_PATH_PREFIX = 'http://alivedise.github.io/alvitr/';
      break;
    default: 
      //some other protocol
      break;
  }

  var $ = window.jQuery;
  var document = window.document;
  var MaximumLeaders = 6;
  var MaximumFunctionalLeaders = 8;

  var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      queue = [];

  // Declare image constant.
  var IMAGE_CONFIG = {};
  var MAIN_CHAR_IMAGE_CONFIG = {};
  var LEADERS_IMAGE_CONFIG = {};
  var FUNCTIONAL_LEADERS_IMAGE_CONFIG = {};
  var NAME_CONFIG = {};
  var COMMENT_CONFIG = {};
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
    img.src = IMAGE_PATH_PREFIX + src;

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

  function getIconAndDraw(id, ctx, index, config) {
    var d = $.Deferred();
    IconGetter(id).then(function(img) {
      ctx.shadowColor = config.SHADOW_COLOR;
      ctx.shadowOffsetX = config.SHADOW_OFFSET_X;
      ctx.shadowOffsetY = config.SHADOW_OFFSET_Y;
      ctx.shadowBlur = config.SHADOW_BLUR;
      ctx.drawImage(img,
                    config.OFFSET_X + index * (config.WIDTH + 2),
                    config.OFFSET_Y,
                    config.WIDTH,
                    config.HEIGHT);
      d.resolve();
    });
    return d.promise();
  };

  function getIconAndDrawVertical(id, ctx, index, config) {
    var d = $.Deferred();
    IconGetter(id).then(function(img) {
      ctx.shadowColor = config.SHADOW_COLOR;
      ctx.shadowOffsetX = config.SHADOW_OFFSET_X;
      ctx.shadowOffsetY = config.SHADOW_OFFSET_Y;
      ctx.shadowBlur = config.SHADOW_BLUR;
      ctx.drawImage(img,
                    config.OFFSET_X,
                    config.OFFSET_Y + index * (config.HEIGHT + 2),
                    config.WIDTH,
                    config.HEIGHT);
      d.resolve();
    });
    return d.promise();
  };

  function resolve(callback) {
    callback(canvas.toDataURL());
  }

  function renderBackgroundColor(param) {
    var d = $.Deferred();
    if (param['background-color'] == 'custom') {
      d.resolve();  // don't support custom now
      return d.promise();

      BackgroundGetter(param['custom-background']).then(function(data) {
        if (data) {
          var _x = 0, _y = 0, _w, _h, _sx = 0, _sy = 0, _sw, _sh;
          _sw = IMAGE_CONFIG.WIDTH;
          _sh = IMAGE_CONFIG.HEIGHT;
          _w = data.width;
          _h = data.width*_sh/_sw;
          ctx.drawImage(data, _x, _y, _w, _h, _sx, _sy, _sw, _sh);
        } 
        d.resolve();
      });
    } else if (param['background-color'] == 'none') {
      d.resolve();
    } else {
      // color
      ctx.fillStyle = param['background-color'];
      ctx.fillRect(0, 0, IMAGE_CONFIG.WIDTH, IMAGE_CONFIG.HEIGHT);
      d.resolve();
    }
    return d.promise();
  }

  function renderBackgroundImage(param) {
    var d = $.Deferred();
    var offset = 0;
    var extention = '.png';

    if (('' + param['background-image']).charAt(0) === 'f') {
      // We are non-transparent background;
      offset = 0;
      extention = '.jpg';
    } else if (param['image-size'] != 'facebook-cover') {
      offset = 220;
    }

    var source = parseInt(param['background-image'], 10);
    if (source === 0) {
      d.resolve();
      return d.promise();
    }

    var backgroundImagePath = 'images/background/' + param['background-image'] + extention;
    BackgroundGetter(backgroundImagePath).then(function(data) {  
      // Try to scale the background image to a reasonable size and position
      var _x = 0
        , _y = 150
        , _w
        , _h
        , _sw
        , _sh
        , _sx
        , _sy = 0;

      switch (param['image-size']) {
        case 'facebook-cover':
          // For facebook, we try to fit the height of image.
          _sw = IMAGE_CONFIG.WIDTH;
          _sh = IMAGE_CONFIG.HEIGHT;
          _w = data.width;
          _h = data.width*_sh/_sw;
          _sy = _h * 0.1;
          _sx = 0;
          break;
        case 'signature':
          // For signature, we try not to resize too much.
          _sw = IMAGE_CONFIG.WIDTH - offset;
          _sh = IMAGE_CONFIG.HEIGHT;
          _w = data.width;
          _h = data.width*_sh/_sw;
          _sy = _h * 0.25;
          _sx = offset;
          break;
      }
      
      ctx.drawImage(data, _x, _y, _w, _h, /* The offset of main char */_sx, _sy, _sw, _sh);
      
      /* Background image color transformation */
      if (param['background-tint'] &&
          param['background-tint'] != 'none') {
        // color transformation
        var map = ctx.getImageData(0, 0, IMAGE_CONFIG.WIDTH, IMAGE_CONFIG.HEIGHT);
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
        ctx.fillStyle = param['background-tint'];
        ctx.fillRect(0, 0, IMAGE_CONFIG.WIDTH, IMAGE_CONFIG.HEIGHT);
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(0, 0, IMAGE_CONFIG.WIDTH, IMAGE_CONFIG.HEIGHT);
      }
            // Reset default.
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = "rgba(255, 255, 255, 0.50)";
      ctx.lineWidth = 5;
      ctx.strokeRect(5/2, 5/2, IMAGE_CONFIG.WIDTH - 5, IMAGE_CONFIG.HEIGHT - 5);
      ctx.lineWidth = 1;

      ctx.fillStyle = '#fff';

      d.resolve();
    });
    return d.promise();
  }

  function renderStatic(param) {
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
    ctx.fillStyle = 'rgba(1, 134, 209, 0.5)';
    ctx.fillRect( ID_CONFIG.OFFSET_X,
                  ID_CONFIG.OFFSET_Y + ID_CONFIG.SIZE / 2,
                  ID_CONFIG.WIDTH,
                  BRUSH_CONFIG.HEIGHT);

    ctx.fillStyle = 'black';
    ctx.font = ID_CONFIG.SIZE + 'px Attic';
    ctx.textBaseline = 'top';
    ctx.fillText(param.id || '000000000',
                  ID_CONFIG.OFFSET_X,
                  ID_CONFIG.OFFSET_Y);
  

    /* Render comment */
    ctx.textBaseline = 'top';
    ctx.font = COMMENT_CONFIG.SIZE + 'px Aldine721 BT';
    ctx.fillStyle = 'black';
    ctx.fillText(param.comment || '',
                  COMMENT_CONFIG.OFFSET_X,
                  COMMENT_CONFIG.OFFSET_Y);
  }

  function renderLogo(param) {
    var d = $.Deferred();
    BackgroundGetter('images/padlogo.png').then(function(data) {
      if (data) {
        ctx.globalAlpha = 0.8;
        ctx.drawImage(data,
                      LOGO_CONFIG.OFFSET_X,
                      LOGO_CONFIG.OFFSET_Y,
                      LOGO_CONFIG.WIDTH,
                      LOGO_CONFIG.HEIGHT);
        ctx.globalAlpha = 1.0;
      }
      d.resolve();
    });
    return d.promise();
  }

  function renderMainChar(param) {
    var d = $.Deferred();
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
        d.resolve();
      });
    } else {
      d.resolve();
    }
    return d.promise();
  }

  function renderLeaders(param) {
    var d = $.Deferred();
    /* Draw leaders(optional) */
    if ('leaders' in param) {
      var _count = 0;
      param.leaders.forEach(function(mid) {
        mid = '' + mid;
        if (mid !== '0') {
          queue.push(getIconAndDraw(mid, ctx, _count++, LEADERS_IMAGE_CONFIG));
        }
      });
    }

    if ('functional-leaders' in param) {
      var _count = 0;
      param['functional-leaders'].forEach(function(mid) {
        mid = '' + mid;
        if (mid !== '0') {
          queue.push(getIconAndDraw(mid, ctx, _count++, FUNCTIONAL_LEADERS_IMAGE_CONFIG));
        }
      });
    }

    if (queue.length > 0) {
      $.when.apply($, queue).then(function(){
        d.resolve();
      });
    } else {
      d.resolve();
    }
    return d.promise();
  }

  function render(param, callback) {
    queue = [];
    // Determine the image offset/size by global image size
    switch (param['image-size'] ) {
      case 'facebook-cover':
        IMAGE_CONFIG.WIDTH = 851;
        IMAGE_CONFIG.HEIGHT = 315;
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
          OFFSET_Y: 180 + (80 - 40), /* Main char height - leader height */
          SHADOW_OFFSET_Y: 5,
          SHADOW_OFFSET_X: 5,
          SHADOW_BLUR: 5,
          SHADOW_COLOR: 'black'
        };
        FUNCTIONAL_LEADERS_IMAGE_CONFIG = {
          WIDTH: 25,
          HEIGHT: 25,
          OFFSET_X: IMAGE_CONFIG.WIDTH - 27 * MaximumFunctionalLeaders,
          OFFSET_Y: 0,
          SHADOW_OFFSET_X: -2,
          SHADOW_OFFSET_Y: 2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, 0.3)'
        };
        NAME_CONFIG = {
          OFFSET_X: 315,  /* the same as leaders */
          OFFSET_Y: 180,   /* the same as main */
          SIZE: 35
        };
        COMMENT_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 185 - 42 - 42,
          OFFSET_Y: 180 + (80 - 40), /* Main char height - leader height */
          WIDTH: 180,
          SIZE: 15
        };
        LOGO_CONFIG = {
          OFFSET_X: 23, /* left top of cover */
          OFFSET_Y: 23,
          WIDTH: 100,
          HEIGHT: 37.5
        };
        ID_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 150,
          OFFSET_Y: 180,
          WIDTH: 150,
          SIZE: 25
        };
        break;
      case 'signature':
        IMAGE_CONFIG.WIDTH = 700;
        IMAGE_CONFIG.HEIGHT = 170;
        LOGO_CONFIG = {
          WIDTH: 80,
          HEIGHT: 30,
          OFFSET_X: IMAGE_CONFIG.WIDTH - 220,
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
          OFFSET_Y: 110,
          SHADOW_OFFSET_X: 5,
          SHADOW_OFFSET_Y: 5,
          SHADOW_BLUR: 5,
          SHADOW_COLOR: 'black'
        };
        FUNCTIONAL_LEADERS_IMAGE_CONFIG = {
          WIDTH: 30,
          HEIGHT: 30,
          OFFSET_X: IMAGE_CONFIG.WIDTH - 32*MaximumFunctionalLeaders,
          OFFSET_Y: IMAGE_CONFIG.HEIGHT - 30,
          SHADOW_OFFSET_X: -2,
          SHADOW_OFFSET_Y: -2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, 0.3)'
        };
        NAME_CONFIG = {
          OFFSET_X: 120,
          OFFSET_Y: 5,
          SIZE: 40
        };
        COMMENT_CONFIG = {
          OFFSET_X: 120,
          OFFSET_Y: 5 + 40 + 5,
          WIDTH: 130,
          SIZE: 30
        };
        ID_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 140,
          OFFSET_Y: 5,
          WIDTH: 140,
          SIZE: 25
        };
        break;
    }

    /* Set canvas width, height, and then clear canvas. */
    canvas.setAttribute('width', IMAGE_CONFIG.WIDTH);
    canvas.setAttribute('height', IMAGE_CONFIG.HEIGHT);
    ctx.clearRect(0, 0, IMAGE_CONFIG.WIDTH, IMAGE_CONFIG.HEIGHT);

    
    renderBackgroundColor(param).then(function(){
    }).then(function() {
      return renderBackgroundImage(param);
    }).then(function() {
      renderStatic(param);
      return renderMainChar(param);
    }).then(function() {
      return renderLogo(param);
    }).then(function() {
      return renderLeaders(param);
    }).then(function() {
      resolve(callback);
    });
  }

  window.renderClient = render;
}(this));

