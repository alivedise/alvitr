(function(window) {
  var Generator = {
    init: function() {
      $('form').change(function() {
        $('#previewImage').prop('src', '/state.png' + new Date().getTime());
      });
    };
  };

  Generator.init();
}(this));