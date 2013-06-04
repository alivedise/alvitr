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
            '<span class="background-image-container" data-source="'+i+'" />'+
          '</label>');
      }
      $('.background-image-container').each(function() {
        //$(this).css('background-image', 'url(/images/PAD/' + $(this).data('source') + '.png)');
        $(this).append('<img src="images/PAD/' + $(this).data('source') + '.png" />');
      });
    },

    init: function() {
      // Modernizr warning
      if (!Modernizr.canvas || ! Modernizr.canvastext || !Modernizr.fontface) {
        $('#page-header').append('<div class="alert"><strong>Warning!</strong> Your browser doesn\'t support canvas and facefont. Please consider to use a more modern browser such as Mozilla Firefox or Google Chrome.</div>');
      }

      this.loadBackgroundImage();
      for (var i = 1; i <= 6; i++) {
        $('#background-loader .controls .radio[data-value="'+i+'"]').addClass('visible');
      }
      $('#pager').pagination({
        total_pages: 11,
        current_page: 1,
        callback: function(event, page) {
          event.preventDefault();
          $('#background-loader .controls .radio.visible').removeClass('visible');
          for (var i = 1 + (page - 1) * 6; i <= 6 + (page - 1) * 6; i++) {
            $('#background-loader .controls .radio[data-value="'+i+'"]').addClass('visible');
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
              url: 'https://api.imgur.com/3/image',
              type: 'POST',
              beforeSend: function($xhr) {
                $xhr.setRequestHeader('Authorization', 'Client-ID e13864a62bbe306');
              },
              data: {
                image: img
              },
              dataType: 'json'
          }).success(function(data) {
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
          }).error(function() {
            alert('Could not reach api.imgur.com. Sorry :(');
          });
        }
      });

      $('#download').click(function(evt) {
        evt.preventDefault();
        $.post('/download', { dataurl: self._currentDataURL }, function(res) {
          $('#url').val(window.location + '/images/user/' + res.id + '.png');
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
      if (Modernizr.canvas && Modernizr.canvastext) {
        window.renderClient($('form').serializeObject(), function(result) {
          self._currentDataURL = result;
          $('#previewImage').prop('src', result);
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
