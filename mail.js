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

    parseElement: function( s ) {
      var tag = '';

      s.replace(
        // note:  this not only grabs the tag but also verifies that the entire element can be parsed, including the attributes
        /^(\S+)+(?:\s*(?:[^\s=,]+)\s*=\s*(?:'(?:[^']+)'|"(?:[^"]+)"|(?:\S+)))*$/g,
        function( m, m1 ) {
          tag = m1;
        }
      );

      if ( !tag.length )
        throw 'Unable to parse element: ' + s;

      return {
        tag:   tag,
        attrs: mailjs.parseAttrs( s.substring( tag.length ) )
      };
    },

    generate: function( opts ) {
      var src       = opts.src,
          binds     = opts.binds || {},
          templates = opts.templates || {},
          html      = opts.html,
          dest      = '';

      for ( si=0, slen=src.length; si < slen; ) {
        ch = src[ si ];

        switch ( ch ) {
        case '\\':
          si++;

          if ( si<slen )
            dest += src[ si++ ];

          break;

        case '[':
          si++;
          var starti = si,
              endi   = str.indexOf( ']', starti );

          if ( endi === -1 )
            throw 'Missing closing "]".';

          var el = mailjs.parseElement( str.substring( starti, endi ) );

          var template = mailjs.resolve( el.tag );

          if ( template ) {

            dest += mailjs.translate({
              src:       template.src,
              binds:     binds,
              html:      html,
              templates: templates,
              attrs:     el.attrs
            });
          } else {
            dest += '[';
            si = starti;
          }

          break;

        case '$':
          si++;

          var matches = src.substring( si ).match( /^([a-zA-Z0-9_]+)|^\{([a-zA-Z0-9_]+)\}/ );

          if ( !matches || matches.length < 3 )
            throw "Missing variable name after $.";

          var name = matches[ 1 ] || matches[ 2 ];
          si += matches[ 0 ].length;

          var bind = binds[ name ];
          if ( !bind )
            throw 'No bind definition for: ' + name;

          dest += bind;
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

