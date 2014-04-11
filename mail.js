/**
 * @license
 * mail.js
 * Copyright 2014 Mark Bradley, Ted Halmrast
 * Available under MIT license <http://mailjs.org/license>
 */
;(function(window) {

  var mailjs = {

  };

  if ( typeof define == 'function' && typeof define.amd == 'object' && define.amd ) {
    define(function() {
      return mailjs;
    });
  } else {
    window.mailjs = mailjs;
  }
}(this));

