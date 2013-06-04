(function(window) {
  var element = $('#img-cropper');
  var img = $('#img-cropped');
  var config = config;
  img.onload = function() {
    var targetRatio = config.w/config.h;
    var thinnerThanTarget = img.width/img.height > targetRatio;
    img.jCrop({
      aspectRatio: targetRatio,
      setSelect: [0, 0,
                  thinnerThanTarget ? img.height*config.w/config.h : w,
                  thinnerThanTarget ? h : img.width*config.h/config.w]
    });
  }

  function imageCropper(src, config, callback) {
    img.src = src;
    config = config;
  }

  function show() {
    element.show();
  }

  function hide() {
    element.hide();
    img.src = '';
  }

  window.imageCropper = imageCropper;
}(this));