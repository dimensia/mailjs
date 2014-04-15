/**
 * @license
 * mail.js
 * Copyright 2014 Mark Bradley, Ted Halmrast
 * Available under MIT license <http://mailjs.org/license>
 */
;(function(window) {

  var whitespaceChar = /\s/,
      attrNameChar   = /[^\t\n\f \/>"'=]/;

      globalTemplates = {
    doctype: {
      src: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
    },

    html: {

    },

    p: {

    }
  };


  var mailjs = {

    resolve: function( tag, templates ) {
      var o = templates[ tag ];
      return o ? o : globalTemplates[ tag ];
    },

    parseAttrs: function( s ) {
      var attrs = {};

      s.replace(
        /([^\s=,]+)\s*=\s*(?:'([^']+)'|"([^"]+)"|(\S+))/g,
        function( m, m1, m2, m3, m4 /*, offset, str */ ) {
          attrs[ m1 ] = m2 || m3 || m4;
        }
      );

      return attrs;
    },

    translate: function( opts ) {
      var src       = opts.src,
          binds     = opts.binds || {},
          templates = opts.templates || {},
          html      = opts.html,
          dest      = '',
          si        = 0,
          slen      = src.length;

      function parseTag() {
        var starti = si;

        for ( ; si<slen; si++ ) {
          switch ( src[ si ] ) {
          case ' ':
            return src.substring( starti, si++ );

          case ']':
            return src.substring( starti, si );
          }
        }

        return null;
      }

      function parseTemplateAttrs() {
        var starti = si,
            endi   = str.indexOf( ']', starti ),
            attrs  = {};

        if ( endi === -1 )
          throw 'Missing closing "]".';

        si = endi + 1;
        return mailjs.parseAttrs( str.substring( starti, endi ) );
      }

      while ( si < slen ) {
        ch = src[ si ];

        switch ( ch ) {
        case '[':
          si++;
          var starti = si;

          var tag = parseTag();
          var attrs = parseTemplateAttrs();

          var template = mailjs.resolve( tag );

          if ( template && attrs !== null ) {

            dest += mailjs.translate({
              src:       template.src,
              binds:     binds,
              html:      html,
              templates: templates,
              attrs:     attrs
            });
          } else {
            dest += '[';
            si = starti;
          }

          break;

        case '$':
          break;

        default:
          dest += src[ si++ ];
        }
      }

      return dest;
    }
  };

  if ( typeof define == 'function' && typeof define.amd == 'object' && define.amd ) {
    define(function() {
      return mailjs;
    });
  } else if ( typeof exports === 'object' ) {
    module.exports = mailjs;
  } else {
    window.mailjs = mailjs;
  }
}(this));

