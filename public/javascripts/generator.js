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
    loadBackgroundImage: function() {
      for (var i = 1; i < 5; i++) {
        $('#background-loader .controls').append('<label class="radio">'+
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
      $('form').change(function() {
        console.log($('form').serializeObject());
        $.post('/form', $('form').serializeObject(),
          function(result){
            console.log(result);
            $('#previewImage').prop('src', '/state.png?' + new Date().getTime());
      
          });
      });

      $('form').submit(function(evt) {
        evt.preventDefault();
      });
    }
  };

  Generator.init();
}(this));