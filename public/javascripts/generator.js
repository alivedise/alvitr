(function(window) {
  var Generator = {
    init: function() {
      $('form').change(function() {
        $('#previewImage').prop('src', '/preview' + new Date().getTime());
      });
    };
  };

  Generator.init();
}(this));