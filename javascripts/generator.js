(function(window) {
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
    _dirty: false,
    loadBackgroundImage: function() {
      for (var i = 1; i < 65; i++) {
        $('#background-loader .controls').append('<label class="radio" data-value="'+i+'">'+
            '<input type="radio" name="background-image" value="'+i+'" checked="checked">'+
            '<span class="background-image-container" data-source="'+i+'"><img/></span>'+
          '</label>');
      }
    },

    init: function() {
      // Modernizr warning
      if (!Modernizr.canvas || ! Modernizr.canvastext || !Modernizr.fontface) {
        $('#page-header').append('<div class="alert"><strong>Warning!</strong> Your browser doesn\'t support canvas and facefont. Please consider to use a more modern browser such as Mozilla Firefox or Google Chrome.</div>');
      }

      this.loadBackgroundImage();
      for (var i = 1; i <= 6; i++) {
        var container = $('#background-loader .controls .radio[data-value="'+i+'"]');
        container.addClass('visible');
        if (container.find('img').prop('src') === '') {
          container.find('img').prop('src', 'images/background/' + i + '.png');
        }
      }
      $('#pager').pagination({
        total_pages: 11,
        current_page: 1,
        callback: function(event, page) {
          event.preventDefault();
          $('#background-loader .controls .radio.visible').removeClass('visible');
          for (var i = 1 + (page - 1) * 6; i <= 6 + (page - 1) * 6; i++) {
            var container = $('#background-loader .controls .radio[data-value="'+i+'"]');
            container.addClass('visible');
            if (container.find('img').prop('src') === '') {
              container.find('img').prop('src', 'images/background/' + i + '.png');
            }
          }
          return false;
        }
      });

      // Fork selector
      for (var i = 0 ; i < 5; i++) {
        var clone = $('#selector-to-be-fork').clone();
        clone.prop('id', 'selector-to-be-fork' + i);
        clone.insertAfter($('#selector-to-be-fork'));
      }
      
      var self = this;
      $('form').change(function() {
        self._dirty = true;
        self.submit();
      });

      $('#upload').click(function() {
        if (self._currentDataURL !== '') {
          var img;
          try {
            img = self._currentDataURL.split(',')[1];
          } catch(e) {
            img = self._currentDataURL.split(',')[1];
          }
          $.ajax({
              url: 'http://api.imgur.com/3/upload.json',
              type: 'POST',
              data: {
                  image: img
              },
              dataType: 'json'
          }).success(function(data) {
          }).error(function() {
            alert('Could not reach api.imgur.com. Sorry :(');
          });
        }
      });

      $('#download').hide();
      if (Modernizr.adownload) {
        $('#download').click(function(evt) {
          window.href = self._currentDataURL;
        });
        $('#downloader').show();
      } else {
        $('#downloader').hide();
      }

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
      $('#download').hide();
      $('#previewImage').prop('src', 'resource/ajax-loader.gif');
      if (Modernizr.canvas && Modernizr.canvastext) {
        window.renderClient($('form').serializeObject(), function(result) {
          self._currentDataURL = result;
          $('#previewImage').prop('src', result);
          $('#download').show();
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