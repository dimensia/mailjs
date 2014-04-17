/**
 * @license
 * mail.js
 * Copyright 2014 Mark Bradley, Ted Halmrast
 * Available under MIT license <http://mailjs.org/license>
 */
;(function(window) {

  var whitespaceChar = /\s/,
      attrNameChar   = /[^\t\n\f \/>"'=]/;

  var builtinTemplates = {
    doctype: {
      src: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
    },

    html: {

    },

    p: {

    }
  };

  var builtinBinds = {
  };

  var mailjs = {

    opts: {},

    config: function( opts ) {
      mailjs.opts = opts;
    },

    resolveTemplate: function( name, templates ) {
      return (
        ( templates && templates[ name ] ) ||
        ( this.opts.templates && this.opts.templates[ name ] ) ||
        builtinTemplates[ name ]
      );
    },

    // returns a bind ... null means no bind, '' means a bind was found and it was intentionally blank
    resolveBind: function( name, el, binds, template ) {
      var rslt =
        ( el && el.attrs[ name ] ) ||
        binds[ name ] ||
        ( template && template.defaults && template.defaults[ name ] ) ||
        ( this.opts.binds && this.opts.binds[ name ] ) ||
        builtinBinds[ name ];

      if ( rslt )
        return rslt;
      else
        return (
          // "string != null" means "string !== null && string !== undefined", intentional
          ( el && el.attrs[ name ] != null ) ||
          binds[ name ] != null ||
          ( template && template.defaults && template.defaults[ name ] != null ) ||
          ( this.opts.binds && this.opts.binds[ name ] != null ) ||
          builtinBinds[ name ]
        ) ? '' : null;
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
      var matches = s.match(
        // note:  this not only grabs the tag but also verifies that the entire element can be parsed, including the attributes
        /^\[(\/?)([^\s\]/]+)+(?:\s*(?:[^\s=,]+)\s*=\s*(?:'(?:[^']+)'|"(?:[^"]+)"|(?:[^'"\[\]\s]+)))*(\/?)\]/
      );

      if ( !matches )
        throw new Error( 'Unable to parse element at: ' + s );

      var el         = matches[ 0 ],
          closed     = matches[ 1 ],
          tagDef     = matches[ 2 ],
          selfClosed = matches[ 3 ];

      if ( closed && selfClosed )
        throw new Error( 'An element cannot be both closed and self-closed.' );

      var tag, tagVal;
      if ( tagDef.indexOf( '=' ) != -1 ) {
        var tmatches = tagDef.match( /([^\s=,]+)\s*=\s*(?:'([^']+)'|"([^"]+)"|(\S+))/ );

        if ( !tmatches )
          throw new Error( 'Unable to parse tag-value at: ' + tagDef );

        tag = tmatches[ 1 ];
        tagVal = tmatches[ 2 ] || tmatches[ 3 ] || tmatches[ 4 ];
      } else {
        tag = tagDef;
      }

      var obj = {
        el:    el,
        tag:   tag,
        attrs: mailjs.parseAttrs( el.substring( tagDef.length, el.length - 1 ) )
      };

      if ( tagVal != null )
        obj.attrs[ tag ] = tagVal;

      if ( closed ) {
        obj.close = true;

        if ( Object.keys( obj.attrs ).length )
          throw new Error( 'Closed elements should not contain attributes.' );

      } else if ( selfClosed ) {
        obj.selfClose = true;
      }

      return obj;
    },

    render: function( opts ) {
      var binds     = opts.binds || {},
          templates = opts.templates || {},
          html      = opts.html,

          el        = opts.el,
          template  = opts.template,

          src,
          dest      = '',

          close     = opts.close || ( el && el.close );

      if ( template ) {
        if ( html )
          src = close ? template.htmlClose : template.html;
        else
          src = close ? template.textClose : template.text;

        if ( src == null )
          src = close ? template.srcClose : template.src;

        if ( close && src == null )
          throw new Error( 'Closing elements not supported for template: ' + ( el ? el.el : '' ) );
      } else {
        src = opts.src;
      }

      src = src || '';

      for ( var si=0, slen=src.length; si < slen; ) {
        ch = src[ si ];

        switch ( ch ) {
        case '\\':
          si++;

          if ( si<slen )
            dest += src[ si++ ];

          break;

        case '[':
          var cEl = mailjs.parseElement( src.substring( si ) );

          var cTemplate = mailjs.resolveTemplate( cEl.tag, templates );

          if ( cTemplate ) {

            dest += mailjs.render({
              template:  cTemplate,
              el:        cEl,
              binds:     binds,
              html:      html,
              templates: templates
            });

            si += cEl.el.length;
          } else {
            dest += '[';
            si++;
          }

          break;

        case '$':
          si++;

          var matches = src.substring( si ).match( /^([a-zA-Z0-9_]+)|^\{([a-zA-Z0-9_]+)\}/ );

          if ( !matches || matches.length < 3 )
            throw new Error( "Missing variable name after $." );

          var name = matches[ 1 ] || matches[ 2 ];
          si += matches[ 0 ].length;

          var bind = this.resolveBind( name, el, binds, template );
          if ( bind == null )
            throw new Error( 'No bind definition for: ' + name );

          bind = mailjs.render({
            src:       bind,
            binds:     binds,
            html:      html,
            templates: templates
          });

          dest += bind;
          break;

        default:
          dest += src[ si++ ];
        }
      }

      if ( el && !opts.close && el.selfClose ) {
        opts.close = true;
        dest += mailjs.render( opts );
        delete opts.close;
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

