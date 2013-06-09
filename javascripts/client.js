
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
  var WATERMARK_CONFIG = {};
  var BRUSH_CONFIG = {
    HEIGHT: 5
  };

  var BackgroundGetter = function(src) {
    var deferred = $.Deferred()
      , img = new Image();

    if (src === '' || src === null) {
      deferred.resolve('');
      return deferred.promise();
    }

    img.onload = function(){
      deferred.resolve(img);
    };
    img.onerror = function(){
      deferred.resolve('');
    };
    img.onabort = function(){
      deferred.resolve('');
    };
    img.src = IMAGE_PATH_PREFIX + src;

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
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
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
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      d.resolve();
    });
    return d.promise();
  };

  function resolve(callback) {
    callback(canvas.toDataURL());
  }

  function renderBackgroundColor(param) {
    var d = $.Deferred();
    if ( param['background-color'] === false ||
                param['background-color'] == 'none' ||
                param['background-color'] == 'transparent') {
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
    var backgroundImagePath = '';

    var source = parseInt(param['background-image'], 10);
    if (source === 0) {
      // no backgroud image
      d.resolve();
      return d.promise();
    }

    if (param['background-image'] == 'custom') {
      backgroundImagePath = param['custom-background-image'];
      if (window.Generator._currentRemoteImage) {
        // Save time and avoid error
        _renderBackgroundImage(param, window.Generator._currentRemoteImage);
        renderBackgroundTint(param);
        d.resolve();
        return d.promise();
      }
    } else {
      backgroundImagePath = 'images/background/' + param['background-image'];
    }
    BackgroundGetter(backgroundImagePath).then(function(data) {
      _renderBackgroundImage(param, data);
      renderBackgroundTint(param);
      d.resolve();
    });
    return d.promise();
  }

  function _renderBackgroundImage(param, data) {
    if (!data)
      return;

    // Try to scale the background image to a reasonable size and position
    var _x = 0
      , _y = 0
      , _w
      , _h
      , _sw
      , _sh
      , _sx = 0
      , _sy = 0;

    if (parseInt(param['background-image-x'], 10) >= 0) {
      _sx = 0;
      _sy = 0;
      _x = parseInt(param['background-image-x'], 10);
      _y = parseInt(param['background-image-y'], 10);
      _w = parseInt(param['background-image-w'], 10);
      _h = parseInt(param['background-image-h'], 10);
      _sw = IMAGE_CONFIG.WIDTH;
      _sh = IMAGE_CONFIG.HEIGHT;
    } else {
      // For facebook, we try to fit the height of image.
      _sw = IMAGE_CONFIG.WIDTH;
      _sh = IMAGE_CONFIG.HEIGHT;
      _w = data.width;
      _h = data.width*_sh/_sw;
      _y = data.height * 0.1;
      _sx = 0;
    }
    
    console.log('rendering: _x=', _x, '; _y=', _y, '; _w =', _w, '; _h=', _h);
    console.log('rendering: _sx=', _sx, '; _sy=', _sy, '; _sw =', _sw, '; _sh=', _sh);
    ctx.drawImage(data, _x, _y, _w, _h, /* The offset of main char */_sx, _sy, _sw, _sh);
  }

  function renderBackgroundTint(param) {
    /* Background image color transformation */
    if (param['background-tint'] &&
        param['background-tint'] != 'none' &&
        param['background-tint'] != 'transparent') {
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
      ctx.fillStyle = "rgba(255, 255, 255, 0.30)";
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
  };

  function renderStatic(param) {
    ctx.textBaseline = 'top';
    ctx.lineWidth = 1;
    /* Render watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(WATERMARK_CONFIG.OFFSET_X,
                  WATERMARK_CONFIG.OFFSET_Y - 2,
                  WATERMARK_CONFIG.WIDTH + 2,
                  11);
    */

    // for the purpose of scale down font size.
    ctx.save();
    ctx.scale(0.75, 0.75);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    // there's a minimum font size so..
    ctx.font = '2px Tahoma Geneva sans-serif';
    ctx.fillText('http://alivedise.github.io/alvitr',
                  param['image-size'] == 'facebook-cover' ?
                  0 : (IMAGE_CONFIG.WIDTH - WATERMARK_CONFIG.WIDTH)/0.75,
                  WATERMARK_CONFIG.OFFSET_Y);
    ctx.strokeText('http://alivedise.github.io/alvitr',
                    param['image-size'] == 'facebook-cover' ?
                    0 : (IMAGE_CONFIG.WIDTH - WATERMARK_CONFIG.WIDTH)/0.75,
                    WATERMARK_CONFIG.OFFSET_Y);

    ctx.restore();

    /* Render name */
    ctx.fillStyle = param['name-color'] || NAME_CONFIG.COLOR;
    ctx.font = NAME_CONFIG.SIZE + 'px Microsoft JhengHei,WT014,Aldine721 BT';

    ctx.shadowOffsetX = NAME_CONFIG.SHADOW_OFFSET_X;
    ctx.shadowOffsetY = NAME_CONFIG.SHADOW_OFFSET_Y;
    ctx.fillText(param.name || '',
                  NAME_CONFIG.OFFSET_X,
                  NAME_CONFIG.OFFSET_Y);

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (param['name-border-color'] && param['name-border-color'] != 'transparent') {
      ctx.strokeStyle = param['name-border-color'];
      ctx.strokeText(param.name || '',
                      NAME_CONFIG.OFFSET_X,
                      NAME_CONFIG.OFFSET_Y);
    }
  

    /* Render ID */
    if (param.id !== '') {
      ctx.fillStyle = 'rgba(1, 134, 209, 0.5)';
      ctx.fillRect( ID_CONFIG.OFFSET_X,
                    ID_CONFIG.OFFSET_Y + ID_CONFIG.SIZE / 2,
                    ID_CONFIG.WIDTH,
                    BRUSH_CONFIG.HEIGHT);
    }

    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.font = ID_CONFIG.SIZE + 'px Attic';
    ctx.fillText(param.id || '',
                  ID_CONFIG.OFFSET_X,
                  ID_CONFIG.OFFSET_Y);
    ctx.strokeText(param.id || '',
              ID_CONFIG.OFFSET_X,
              ID_CONFIG.OFFSET_Y);
  

    /* Render comment */
    ctx.font = COMMENT_CONFIG.SIZE + 'px W014 Aldine721 BT';
    ctx.fillStyle = param['comment-color'] || COMMENT_CONFIG.COLOR;

    ctx.shadowOffsetX = COMMENT_CONFIG.SHADOW_OFFSET_X;
    ctx.shadowOffsetY = COMMENT_CONFIG.SHADOW_OFFSET_Y;
    ctx.fillText(param.comment || '',
                  COMMENT_CONFIG.OFFSET_X,
                  COMMENT_CONFIG.OFFSET_Y);

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (param['comment-border-color'] && param['comment-border-color'] != 'transparent') {
      ctx.strokeStyle = param['comment-border-color'];
      ctx.strokeText(param.comment || '',
                    COMMENT_CONFIG.OFFSET_X,
                    COMMENT_CONFIG.OFFSET_Y);
    }

    ctx.lineWidth = 1;
  }

  function renderMainChar(param) {
    var d = $.Deferred();
    if ('character' in param &&
        param.character != '' && param.character != '0') {
      IconGetter(param.character).then(function(data) {
        ctx.shadowColor = MAIN_CHAR_IMAGE_CONFIG.SHADOW_COLOR;
        ctx.shadowOffsetX = MAIN_CHAR_IMAGE_CONFIG.SHADOW_OFFSET_X;
        ctx.shadowOffsetY = MAIN_CHAR_IMAGE_CONFIG.SHADOW_OFFSET_Y;
        ctx.shadowBlur = MAIN_CHAR_IMAGE_CONFIG.SHADOW_BLUR;
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.drawImage(data,
                      MAIN_CHAR_IMAGE_CONFIG.OFFSET_X,
                      MAIN_CHAR_IMAGE_CONFIG.OFFSET_Y,
                      MAIN_CHAR_IMAGE_CONFIG.WIDTH,
                      MAIN_CHAR_IMAGE_CONFIG.HEIGHT);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
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
    console.log(param);
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
          OFFSET_Y: 180,    /* Offset the same as facebook user portrait */
                           /* This is offset of user not special page */
          SHADOW_OFFSET_Y: 2,
          SHADOW_OFFSET_X: 2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        LEADERS_IMAGE_CONFIG = {
          WIDTH: 40,
          HEIGHT: 40,
          OFFSET_X: 315,  /* Portrait offset + Main char offset */
          OFFSET_Y: 180 + (80 - 40), /* Main char height - leader height */
          SHADOW_OFFSET_Y: 2,
          SHADOW_OFFSET_X: 2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        FUNCTIONAL_LEADERS_IMAGE_CONFIG = {
          WIDTH: 25,
          HEIGHT: 25,
          OFFSET_X: IMAGE_CONFIG.WIDTH - 27 * MaximumFunctionalLeaders,
          OFFSET_Y: 0,
          SHADOW_OFFSET_X: -2,
          SHADOW_OFFSET_Y: 2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        NAME_CONFIG = {
          COLOR: '#fff',
          OFFSET_X: 315,  /* the same as leaders */
          OFFSET_Y: 180,   /* the same as main */
          SIZE: 35,
          SHADOW_OFFSET_X: 2,
          SHADOW_OFFSET_Y: 2
        };
        COMMENT_CONFIG = {
          COLOR: '#000',
          OFFSET_X: IMAGE_CONFIG.WIDTH - 185 - 42 - 42,
          OFFSET_Y: 180 + (80 - 40), /* Main char height - leader height */
          WIDTH: 180,
          SIZE: 15,
          SHADOW_OFFSET_X: 1,
          SHADOW_OFFSET_Y: 1
        };
        WATERMARK_CONFIG = {
          OFFSET_X: 0,
          OFFSET_Y: 0,
          SIZE: 5,
          WIDTH: 150
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
        WATERMARK_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 140,
          OFFSET_Y: 0,
          SIZE: 5,
          WIDTH: 150
        };
        MAIN_CHAR_IMAGE_CONFIG = {
          WIDTH: 100,
          HEIGHT: 100,
          OFFSET_X: 5,
          OFFSET_Y: 5,
          SHADOW_OFFSET_Y: 2,
          SHADOW_OFFSET_X: 2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        LEADERS_IMAGE_CONFIG = {
          WIDTH: 50,
          HEIGHT: 50,
          OFFSET_X: 0,
          OFFSET_Y: 115,
          SHADOW_OFFSET_X: 2,
          SHADOW_OFFSET_Y: -2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        FUNCTIONAL_LEADERS_IMAGE_CONFIG = {
          WIDTH: 30,
          HEIGHT: 30,
          OFFSET_X: IMAGE_CONFIG.WIDTH - 32*MaximumFunctionalLeaders,
          OFFSET_Y: IMAGE_CONFIG.HEIGHT - 30,
          SHADOW_OFFSET_X: -2,
          SHADOW_OFFSET_Y: -2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        NAME_CONFIG = {
          COLOR: '#fff',
          OFFSET_X: 120,
          OFFSET_Y: 5,
          SIZE: 40,
          SHADOW_OFFSET_X: 2,
          SHADOW_OFFSET_Y: 2
        };
        COMMENT_CONFIG = {
          OFFSET_X: 120,
          OFFSET_Y: 5 + 40,
          WIDTH: 130,
          SIZE: 25,
          SHADOW_OFFSET_X: 1,
          SHADOW_OFFSET_Y: 1
        };
        ID_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 150,
          OFFSET_Y: 5,
          WIDTH: 150,
          SIZE: 25
        };
        break;
      case 'bahamut':
        IMAGE_CONFIG.WIDTH = 660;
        IMAGE_CONFIG.HEIGHT = 125;
        WATERMARK_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 150,
          OFFSET_Y: 0,
          SIZE: 5,
          WIDTH: 150
        };
        MAIN_CHAR_IMAGE_CONFIG = {
          WIDTH: 70,
          HEIGHT: 70,
          OFFSET_X: 5,
          OFFSET_Y: 5,
          SHADOW_OFFSET_Y: 2,
          SHADOW_OFFSET_X: 2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        LEADERS_IMAGE_CONFIG = {
          WIDTH: 40,
          HEIGHT: 40,
          OFFSET_X: 0,
          OFFSET_Y: 85,
          SHADOW_OFFSET_X: 2,
          SHADOW_OFFSET_Y: -2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        FUNCTIONAL_LEADERS_IMAGE_CONFIG = {
          WIDTH: 30,
          HEIGHT: 30,
          OFFSET_X: IMAGE_CONFIG.WIDTH - 32*MaximumFunctionalLeaders,
          OFFSET_Y: IMAGE_CONFIG.HEIGHT - 30,
          SHADOW_OFFSET_X: -2,
          SHADOW_OFFSET_Y: -2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        NAME_CONFIG = {
          COLOR: '#fff',
          OFFSET_X: 90,
          OFFSET_Y: 5,
          SIZE: 40,
          SHADOW_OFFSET_X: 2,
          SHADOW_OFFSET_Y: 2
        };
        COMMENT_CONFIG = {
          COLOR: '#000',
          OFFSET_X: 90,
          OFFSET_Y: 5 + 40,
          WIDTH: 130,
          SIZE: 25,
          SHADOW_OFFSET_X: 1,
          SHADOW_OFFSET_Y: 1
        };
        ID_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 150,
          OFFSET_Y: 5,
          WIDTH: 150,
          SIZE: 25
        };
        break;
      case 'thin':
        IMAGE_CONFIG.WIDTH = 450;
        IMAGE_CONFIG.HEIGHT = 64;
        WATERMARK_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 150,
          OFFSET_Y: 0,
          SIZE: 5,
          WIDTH: 150
        };
        MAIN_CHAR_IMAGE_CONFIG = {
          WIDTH: 64,
          HEIGHT: 64,
          OFFSET_X: 0,
          OFFSET_Y: 0,
          SHADOW_OFFSET_Y: 2,
          SHADOW_OFFSET_X: 2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        LEADERS_IMAGE_CONFIG = {
          WIDTH: 20,
          HEIGHT: 20,
          OFFSET_X: 64,
          OFFSET_Y: 64 - 20,
          SHADOW_OFFSET_X: 2,
          SHADOW_OFFSET_Y: -2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        FUNCTIONAL_LEADERS_IMAGE_CONFIG = {
          WIDTH: 20,
          HEIGHT: 20,
          OFFSET_X: IMAGE_CONFIG.WIDTH - 22*MaximumFunctionalLeaders,
          OFFSET_Y: IMAGE_CONFIG.HEIGHT - 20,
          SHADOW_OFFSET_X: -2,
          SHADOW_OFFSET_Y: -2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        NAME_CONFIG = {
          COLOR: '#fff',
          OFFSET_X: 64+5,
          OFFSET_Y: 5,
          SIZE: 30,
          SHADOW_OFFSET_X: 2,
          SHADOW_OFFSET_Y: 2
        };
        COMMENT_CONFIG = {
          COLOR: '#000',
          OFFSET_X: 64+5,
          OFFSET_Y: 5 + 30,
          WIDTH: 130,
          SIZE: 25,
          SHADOW_OFFSET_X: 1,
          SHADOW_OFFSET_Y: 1
        };
        ID_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 130,
          OFFSET_Y: 5,
          WIDTH: 130,
          SIZE: 20
        };
        break;
      case 'medium':
        IMAGE_CONFIG.WIDTH = 600;
        IMAGE_CONFIG.HEIGHT = 100;
        WATERMARK_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 150,
          OFFSET_Y: 0,
          SIZE: 5,
          WIDTH: 150
        };
        MAIN_CHAR_IMAGE_CONFIG = {
          WIDTH: 50,
          HEIGHT: 50,
          OFFSET_X: 5,
          OFFSET_Y: 5,
          SHADOW_OFFSET_Y: 2,
          SHADOW_OFFSET_X: 2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        LEADERS_IMAGE_CONFIG = {
          WIDTH: 35,
          HEIGHT: 35,
          OFFSET_X: 0,
          OFFSET_Y: 100-35,
          SHADOW_OFFSET_X: 2,
          SHADOW_OFFSET_Y: -2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        FUNCTIONAL_LEADERS_IMAGE_CONFIG = {
          WIDTH: 25,
          HEIGHT: 25,
          OFFSET_X: IMAGE_CONFIG.WIDTH - 27*MaximumFunctionalLeaders,
          OFFSET_Y: IMAGE_CONFIG.HEIGHT - 25,
          SHADOW_OFFSET_X: -2,
          SHADOW_OFFSET_Y: -2,
          SHADOW_BLUR: 0,
          SHADOW_COLOR: 'rgba(0, 0, 0, ' + (param['icon-transparent'] ? '0.3':'1') + ')'
        };
        NAME_CONFIG = {
          COLOR: '#fff',
          OFFSET_X: 60,
          OFFSET_Y: 5,
          SIZE: 35,
          SHADOW_OFFSET_X: 2,
          SHADOW_OFFSET_Y: 2
        };
        COMMENT_CONFIG = {
          COLOR: '#000',
          OFFSET_X: 60,
          OFFSET_Y: 5 + 35,
          WIDTH: 130,
          SIZE: 25,
          SHADOW_OFFSET_X: 1,
          SHADOW_OFFSET_Y: 1
        };
        ID_CONFIG = {
          OFFSET_X: IMAGE_CONFIG.WIDTH - 140,
          OFFSET_Y: 5,
          WIDTH: 140,
          SIZE: 20
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
      return renderLeaders(param);
    }).then(function() {
      resolve(callback);
    });
  }

  window.renderClient = render;
  window.imageGetter = BackgroundGetter;
}(this));

