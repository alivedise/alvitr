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
    init: function() {
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