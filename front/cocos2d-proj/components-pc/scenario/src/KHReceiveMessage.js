(function(global) {
  "use strict";

  window.addEventListener("message", function(e) {
    try {
      var cmd = e.data;
      (rpc[cmd] || function() {}).apply(null);
    } catch(err) {
      console.error(err);
    }
  }.bind(this), false);

  var rpc = {
    "close": function (){
      try {
        if(window.boombox && window.boombox.dispose){
          window.boombox.dispose();
        }
      } catch (e) {
      }
      location.href = "about:blank";
    }
  };
})((this || 0).self || global);
