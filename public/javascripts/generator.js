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
        console.log($('form').serializeObject());
        $.post('/form', $('form').serializeObject(),
          function(result){
            console.log(result);
            self._currentDataURL = result;
            $('#previewImage').prop('src', result);
          });
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
            console.log(data);
          }).error(function() {
            alert('Could not reach api.imgur.com. Sorry :(');
          });
        }
      });

      $('#download').click(function(evt) {
        evt.preventDefault();
        $.post('/download', { dataurl: self._currentDataURL }, function(res) {
          console.log(res);
          $('#url').val(window.location + '/images/user/' + res.id + '.png');
        });
      });

      $('form').submit(function(evt) {
        evt.preventDefault();
      });
    }
  };

  Generator.init();
}(this));