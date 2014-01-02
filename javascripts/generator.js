(function(window) {
  var JPG_COUNT = 26;
  var PNG_COUNT = 72;
  var wiki_png_count = 0; // to be calculated.

  var IMAGE_SIZE = {
    'facebook-cover': {
      width: 851,
      height: 315
    },
    'signature': {
      width: 700,
      height: 170
    },
    'bahamut': {
      width: 660,
      height: 125
    },
    'medium': {
      width: 600,
      height: 100
    },
    'thin': {
      width: 450,
      height: 64
    }
  };
  function colourNameToHex(colour)
  {
    if (colour === false)
      return 'transparent';
    var colours = {"none":"transparent","aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo ":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
      return colours[colour.toLowerCase()];

    return colour;
  }
  var IMAGE_PER_PAGE = 10;
  $.fn.serializeObject = function() {
      var o = {};
      var a = this.serializeArray();
      $.each(a, function() {
          if (o[this.name] !== undefined) {
              if (!o[this.name].push) {
                  o[this.name] = [o[this.name]];
              }
              o[this.name].push(this.value || '');
          } else {
              o[this.name] = this.value || '';
          }
      });
      return o;
  };

  var Generator = {
    WIKI_PNG_LEAKING: [],
    loadCache: function() {
      var loaded_count = 0;
      var object = $('form').serializeObject();
      this._currentValueObject = object;
      for (var key in object) {
        if ($.jStorage.get(key)) {
          loaded_count++;
          var value = $.jStorage.get(key);
          var element = $('[name="' + key + '"]');
          if (element.length === 0)
            continue;
          switch (element.prop('tagName').toLowerCase()) {
            case 'select':
              if (Object.prototype.toString.apply(value) === '[object Array]') {
                for (var i = 0; i < value.length; i++) {
                  if (element[i]) {
                    element[i].value = value[i];
                  }
                }
              } else {
                element[0].value = value;
              }
              break;
            case 'input':
              if (element.prop('type') == 'radio' || element.prop('type') == 'checkbox') {
                var e = element.filter('[value="' + value + '"]');
                if (e)
                  e.prop('checked', value);
              } else {
                // text
                element.val(colourNameToHex(value));
              }
              break;
          }
        }
      }

      return (loaded_count > 0);
    },

    saveCache: function() {
      var object = $('form').serializeObject();
      for (var key in object) {
        $.jStorage.set(key, object[key]);
      }
    },

    _currentDataURL: '',
    _uploading: false,
    _dirty: false,
    _currentValueObject: {},
    loadBackgroundImage: function() {
      var _count = 1;
      for (var i = 1; i <= JPG_COUNT; i++, _count++) {
        $('#image-selector').append('<label class="radio" data-index="'+_count+'">'+
            '<input type="radio" name="background-image" value="f'+i+'.jpg">'+
            '<span class="background-image-container"><img data-source="f'+i+'.jpg" /></span>'+
          '</label>');
      }
      for (var i = 1; i <= PNG_COUNT; i++, _count++) {
        $('#image-selector').append('<label class="radio" data-index="'+_count+'">'+
            '<input type="radio" name="background-image" value="'+i+'.png">'+
            '<span class="background-image-container"><img data-source="'+i+'.png" /></span>'+
          '</label>');
      }
      var self = this;
      for (var i = 1; i <= MonsterModel.max; i++, _count++, wiki_png_count++) {
        var ii = '';
        if (i < 10) {
          ii = '00' + i;
        } else if (i < 100) {
          ii = '0' + i;
        } else {
          ii = '' + i;
        }

        console.log(MonsterLeaking.indexOf(i), i);

        if (MonsterLeaking.indexOf(i) >= 0) {
          wiki_png_count--;
          _count--;
          continue;
        }

        console.log('PASS');

        $('#image-selector').append('<label class="radio" data-index="'+_count+'">'+
            '<input type="radio" name="background-image" value="MONS_'+ii+'.png">'+
            '<span class="background-image-container"><img id="mons_'+ii+'" data-source="MONS_'+ii+'.png" /></span>'+
          '</label>');
      }
    },

    selectorGenerator: function() {
      var html = '';
      for (var i = 1; i < MonsterModel.max; i++) {
        if (MonsterModel['' + i]) {
          html += '<option value="' + i + '">' + MonsterModel[i] + '</option>';
        }
      }
      $('#character').append(html);
    },

    init: function() {
      this.selectorGenerator();

      // Modernizr warning
      // 
      if (!Modernizr.canvas || ! Modernizr.canvastext || !Modernizr.fontface) {
        $('#page-header').append('<div class="alert"><strong>Warning!</strong> Your browser doesn\'t support canvas and facefont. Please consider to use a more modern browser such as Mozilla Firefox or Google Chrome.</div>');
      }

      $('#uploader').hide();

      this.loadBackgroundImage();
      $('.pager').pagination({
        total_pages: Math.ceil((JPG_COUNT + PNG_COUNT + wiki_png_count) / IMAGE_PER_PAGE),
        current_page: 1,
        callback: function(event, page) {
          event.preventDefault();
          self.showPage(page);
          return false;
        }
      });
      this.showPage(1);

      // Fork selector
      for (var i = 0 ; i < 5; i++) {
        var clone = $('#character').clone();
        clone.prop('id', 'leaders' + i);
        clone.prop('name', 'leaders');
        clone.appendTo($('#leaders-container'));
      }

      // Fork second selector
      for (var j = 0 ; j < 8; j++) {
        var clone = $('#character').clone();
        clone.prop('id', 'functional-leaders' + j);
        clone.prop('name', 'functional-leaders');
        clone.appendTo($('#functional-leaders-container'));
      }
      
      var self = this;

      $('input[name="image-size"]').change(function(evt) {
        self.resetImageEditor();
      });

      $('form').change(function() {
        self._dirty = true;
        self.submit();
      });

      $('#upload').click(function(evt) {
        evt.preventDefault();
        if (self._uploading)
          return;

        $('#link').hide().prop('href', '#');
        $('#upload').removeClass('btn-primary')
                    .removeClass('btn-danger')
                    .text('uploading.../上傳中...');

        var img;
        self._uploading = true;
        try {
          img = self._currentDataURL.split(',')[1];
        } catch(e) {
          img = self._currentDataURL.split(',')[1];
        }
        $.ajax({
            url: 'https://api.imgur.com/3/image',
            type: 'POST',
            beforeSend: function($xhr) {
              $xhr.setRequestHeader('Authorization', 'Client-ID e13864a62bbe306');
            },
            data: {
              image: img
            },
            dataType: 'json'
        }).success(function(result) {
          self._uploading = false;
          //console.log('post done!', data); //data would be like:
          /*{
              data:{
                  id: "pinMEoq",
                  deletehash: "EgxuoPAyCCfd5FP",
                  link:"http://i.imgur.com/pinMEoq.png"
              },
              success:true,
              status:200
            }
          */
          $('#upload').text('Upload/上傳成功!');
          $('#link').show();
          $('#link').text(result.data.link)
                      .prop('href', result.data.link);

          if (false || Modernizr.adownload) {
            $('#link').prop('download', 'pad.png');
          }
        }).error(function() {
          self._uploading = false;
          $('#upload').addClass('btn-danger')
                      .text('Upload failed, please save the image on right click/上傳失敗請自行右鍵另存。');
          alert('Could not reach api.imgur.com. Sorry :(');
        });
      });

      $('form').submit(function(evt) {
        evt.preventDefault();
        // Or by really submit
        if (self._dirty)
          self.submit();
        return false;
      });

      $('#image-edit-container').hide();

      $('[name=image-edit]').click(function(evt) {
        evt.preventDefault();
        $('#image-edit-container').modal()
        self.editImage();
        return false;
      });

      $('#image-edit-done').click(function() {
        $('#image-edit-container').modal('hide')
        self.submit();
      });

      $('input[name="background-image"]').change(function(evt) {
        evt.preventDefault();
        self.resetImageEditor();
        $('#image-edit-container').modal('hide');
        if ($(this).val() == 'custom') {
          $('[name=image-edit]').addClass('disabled');
          $('[name=image-edit]').prop('disabled', 'disabled');
          if ($('#custom-background-image').val() !== '') {
            self._fetchCustomImage();
          }
        } else if ($(this).val() == '0') {
          $('[name=image-edit]').addClass('disabled');
          $('[name=image-edit]').prop('disabled', 'disabled');
        } else {
          $('[name=image-edit]').removeClass('disabled');
          $('[name=image-edit]').removeAttr('disabled');
        }
        self.submit();
        return false;
      });

      $('#custom-background-image').change(function() {
        self._fetchCustomImage();
      });

      $('[name=image-edit]').addClass('disabled');
      $('[name=image-edit]').prop('disabled', 'disabled');

      document.onreadystatechange = function() {
        if (document.readyState === 'complete')
          setTimeout(function() {
            var reallyLoaded = self.loadCache(); //only once after inited.
            $('#notification').removeClass('alert-info').addClass('alert-success')
                              .text('Font and configuration loaded./字型以及前次設定載入完畢。');

            $('input[name="background-color"]').colorPicker();
            $('input[name="name-border-color"]').colorPicker();
            $('input[name="comment-border-color"]').colorPicker();
            $('input[name="name-color"]').colorPicker();
            $('input[name="comment-color"]').colorPicker();
            $('input[name="background-tint"]').colorPicker();
            if (reallyLoaded)
              self.submit(true); //ignore setting this time.
          }, 1000); //chrome loading font workaround.
        };
    },

    _currentRemoteImage: null,

    _fetchCustomImage: function() {
      $('[name=image-edit]').addClass('disabled');
      $('[name=image-edit]').prop('disabled', 'disabled');
      $('#custom-image-container img').remove();
      $('#custom-image-container').append('<img />');
      $('#custom-image-container img').load(function() {
        self._currentRemoteImage = this;
        $('[name=image-edit]').removeClass('disabled');
        $('[name=image-edit]').removeAttr('disabled');
      });
      $('#custom-image-container img').prop('src', $('#custom-background-image').val());
      $('#custom-image-container img').prop('src', $('#custom-background-image').val());
    },

    resetImageEditor: function() {
      $('#background-image-x').val(-1);
      $('#background-image-y').val(-1);
      $('#background-image-x2').val(-1);
      $('#background-image-y2').val(-1);
      $('#background-image-w').val(-1);
      $('#background-image-h').val(-1);
    },

    editImage: function() {
      var self = this;
      var src = '';
      var W = IMAGE_SIZE[self._currentValueObject['image-size']].width;
      var H = IMAGE_SIZE[self._currentValueObject['image-size']].height;
      var backgroundImage = this._currentValueObject['background-image'];
      if (backgroundImage == '0')
        return;
      if (backgroundImage == 'custom') {
        src = $('#custom-background-image').val();
      } else {
        src = $('input[name="background-image"]:checked').siblings('.background-image-container').children('img').prop('src');
      }
      if (src) {
        if (this._jcrop_api)
          this._jcrop_api.destroy();
        $('#image-editor img').remove();
        $('#image-editor').prepend('<img />');
        $('#image-editor img').load(function() {
          var img = this;
          $(this).Jcrop({
            boxWidth: 500,
            setSelect: [ parseInt(self._currentValueObject['background-image-x'], 10) || 0,
                          parseInt(self._currentValueObject['background-image-y'], 10) || 0,
                          parseInt(self._currentValueObject['background-image-x2'], 10) || W,
                          parseInt(self._currentValueObject['background-image-y2'], 10) || H ],
            aspectRatio: W/H,
            onSelect: function(c) {
              $('#background-image-x').val(c.x);
              $('#background-image-y').val(c.y);
              $('#background-image-w').val(c.w);
              $('#background-image-h').val(c.h);
              $('#background-image-x2').val(c.x2);
              $('#background-image-y2').val(c.y2);
              console.log(img.width, img.height, c.x, c.y, c.w, c.h, c.x2, c.y2);
              var w = W*img.width/(c.x2-c.x);
              var h = H*img.height/(c.y2-c.y);
              $('#image-preview img').width(w/2).height(h/2).css({
                left: -0.5*c.x*w/img.width,
                top: -0.5*c.y*h/img.height
              });
            }
          }, function() {
            self._jcrop_api = this;
          });
        });
        $('#image-editor img').prop('src', src);
        $('#image-preview img').prop('src', src);
        $('#image-preview').css({
          width: W/2,
          height: H/2
        });
      }
    },

    submit: function(skipDataStore) {
      var self = this;
      this._currentValueObject = $('form').serializeObject();
      $('#uploader').hide();
      $('#link').hide();
      $('#upload').text('Upload image to imgur/上傳名片檔到imgur');
      $('#upload').removeClass('btn-danger').addClass('btn-primary');
      $('#previewImage').prop('src', 'resource/ajax-loader.gif');
      if (Modernizr.canvas && Modernizr.canvastext) {
        window.renderClient(this._currentValueObject, function(result) {
          if (!result)
            return;

          if (!skipDataStore)
            self.saveCache();

          if (window.location.protocol == 'file:') {
            $('#previewCanvas')[0].appendChild(result);
            $('#previewImage').hide();
          } else {
            self._currentDataURL = result;
            $('#previewImage').prop('src', result);
            $('#uploader').show();

            if (self._currentValueObject['background-image'] !== '0') {
              $('[name=image-edit]').removeClass('disabled');
              $('[name=image-edit]').removeAttr('disabled');
            } else {
              $('[name=image-edit]').addClass('disabled');
              $('[name=image-edit]').prop('disabled', 'disabled');
            }
          }
        });
      } else {
        $.post('/form', this._currentValueObject,
        function(result){
          self._currentDataURL = result;
          $('#previewImage').prop('src', result);
        });
      }
    },

    showPage: function(page) {
      $('#background-loader .controls .radio.visible').removeClass('visible');
      for (var i = (page - 1) * IMAGE_PER_PAGE; i < IMAGE_PER_PAGE + (page - 1) * IMAGE_PER_PAGE; i++) {
        var container = $('#background-loader .controls .radio[data-index="' + i + '"]');
        container.addClass('visible');
        if (container.find('img').prop('src') === '') {
          container.find('img').prop('src', 'images/background/' + container.find('img').data('source'));
        }
      }
    }
  };

  Generator.init();
  window.Generator = Generator;
}(this));