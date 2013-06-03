(function(window) {
  var JPG_COUNT = 23;
  var PNG_COUNT = 65;
  var IMAGE_PER_PAGE = 6;
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
    _currentDataURL: '',
    _uploading: false,
    _dirty: false,
    loadBackgroundImage: function() {
      var _count = 1;
      for (var i = 1; i <= JPG_COUNT; i++, _count++) {
        $('#background-loader .controls').append('<label class="radio" data-index="'+_count+'">'+
            '<input type="radio" name="background-image" value="f'+i+'">'+
            '<span class="background-image-container"><img data-source="f'+i+'.jpg" /></span>'+
          '</label>');
      }
      for (var i = 1; i <= PNG_COUNT; i++, _count++) {
        $('#background-loader .controls').append('<label class="radio" data-index="'+_count+'">'+
            '<input type="radio" name="background-image" value="'+i+'">'+
            '<span class="background-image-container"><img data-source="'+i+'.png" /></span>'+
          '</label>');
      }
    },

    init: function() {
      // Modernizr warning
      if (!Modernizr.canvas || ! Modernizr.canvastext || !Modernizr.fontface) {
        $('#page-header').append('<div class="alert"><strong>Warning!</strong> Your browser doesn\'t support canvas and facefont. Please consider to use a more modern browser such as Mozilla Firefox or Google Chrome.</div>');
      }

      $('#uploader').hide();

      this.loadBackgroundImage();
      for (var i = 0; i < 6; i++) {
        var container = $('#background-loader .controls .radio[data-index="'+i+'"]');
        container.addClass('visible');
        if (container.find('img').prop('src') === '') {
          container.find('img').prop('src', 'images/background/' + container.find('img').data('source'));
        }
      }
      $('#pager').pagination({
        total_pages: Math.ceil((JPG_COUNT + PNG_COUNT) / IMAGE_PER_PAGE),
        current_page: 1,
        callback: function(event, page) {
          event.preventDefault();
          $('#background-loader .controls .radio.visible').removeClass('visible');
          for (var i = 1 + (page - 1) * IMAGE_PER_PAGE; i <= IMAGE_PER_PAGE + (page - 1) * IMAGE_PER_PAGE; i++) {
            var container = $('#background-loader .controls .radio[data-index="'+i+'"]');
            container.addClass('visible');
            if (container.find('img').prop('src') === '') {
              container.find('img').prop('src', 'images/background/' + container.find('img').data('source'));
            }
          }
          return false;
        }
      });

      // Fork selector
      for (var i = 0 ; i < 5; i++) {
        var clone = $('#leaders').clone();
        clone.prop('id', 'leaders' + i);
        clone.appendTo($('#leaders-container'));
      }

      // Fork second selector
      for (var j = 0 ; j < 8; j++) {
        var clone = $('#leaders').clone();
        clone.prop('id', 'functional-leaders' + j);
        clone.prop('name', 'functional-leaders');
        clone.appendTo($('#functional-leaders-container'));
      }
      
      var self = this;
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
                    .text('uploading...');

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
          $('#link').show();
          $('#link').text(result.data.link)
                      .prop('href', result.data.link);

          if (false || Modernizr.adownload) {
            $('#link').prop('download', 'pad.png');
          }
        }).error(function() {
          self._uploading = false;
          $('#upload').addClass('btn-danger');
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
    },

    submit: function() {
      var self = this;
      $('#uploader').hide();
      $('#link').hide();
      $('#upload').text('Upload image to imgur..');
      $('#upload').removeClass('btn-danger').addClass('btn-primary');
      $('#previewImage').prop('src', 'resource/ajax-loader.gif');
      if (Modernizr.canvas && Modernizr.canvastext) {
        window.renderClient($('form').serializeObject(), function(result) {
          if (!result)
            return;
          self._currentDataURL = result;
          $('#previewImage').prop('src', result);
          $('#uploader').show();
        });
      } else {
        $.post('/form', $('form').serializeObject(),
        function(result){
          self._currentDataURL = result;
          $('#previewImage').prop('src', result);
        });
      }
    }
  };

  Generator.init();
}(this));