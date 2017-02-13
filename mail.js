
var _ = require('lodash'),
    juice = require('juice');


/**
 * @license
 * mail.js
 * Copyright 2014 Mark Bradley, Ted Halmrast
 * Available under MIT license <http://mailjs.org/license>
 */
;(function( window ) {

  /*
   * Start of Builtin Bindings and Templates
   * =======================================
   */

  /*
   * Many of these builtin templates are borrowed from various email boilerplate projects on the web ...
   *
   * heavily from:  http://htmlemailboilerplate.com/
   * also from:     http://www.emailology.org/#1
   */

  /*
   * Filters are not needed afaik ... !{ height | pixels } can be done as [pixels=!height]
  var builtinFilters = {
    pixels: function( pixels ) {
      return parseInt( pixels, 10 );
    }
  };
   */

  var builtinBinds = {
    title:     '',
    headStyle: ''
  };

  var builtinTemplates = {

    /*
     * Utility Templates
     * =================
     */

    /*
     * [pixels=300px] yields "300"
     */
    pixels: {
      binds: {
        pixels: ''
      },
      src: function( scope ) {
        return '' + scope.pixels( scope.binding( 'pixels' ) );
      }
    },

    borderRadius: {
      html: '-moz-border-radius:!borderRadius;-webkit-border-radius:!borderRadius;!:borderRadius;'
    },


    /*
     * Component Templates
     * ===================
     */

    /*
     * Borders, cellspacing, and cellpadding should be cleared out since outlook doesn't handle tables properly.
     * http://www.emailonacid.com/blog/details/C13/removing_unwanted_spacing_or_gaps_between_tables_in_outlook_2007_2010
     */
    table: {
      html:
        '<table border="0" cellpadding="0" cellspacing="0" !=align !=class !=style>',
      htmlClose:
        '</table>',
      binds: {
        align: '',
        class: '',
        style: ''
      }
    },

    /*
     * Portable button that deals with padding correctly.  Also supports optional corner radius in Outlook.
     *
     * inspired by http://www.industrydive.com/blog/how-to-make-html-email-buttons-that-rock/#outlook
     */
    button: {
      binds: {
        href:            'http://example.com',
        label:           'Example',
        color:           '#ffffff',
        backgroundColor: '#d62828',
        fontSize:        '16px',
        fontFamily:      'sans-serif',
        height:          '40px',
        width:           '300px',
        borderRadius:    '',        // set to '6px' for example
        margin:          ''
      },
      html: function( scope ) {
        var borderRadius = scope.binding( 'borderRadius' );

        if ( borderRadius ) {
          return (
            '<div>' +
             '<!--\\[if mso\\]>' +
              '<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" !=href style="!:height;v-text-anchor:middle;!:width;" arcsize="10%" stroke="f" fillcolor="!backgroundColor">' +
               '<w:anchorlock/>' +
               '<center style="!:color;!:fontFamily;!:fontSize;font-weight:bold;">!label</center>' +
              '</v:roundrect>' +
             '<!\\[endif\\]-->' +
             '<!\\[if \\!mso\\]>' +
              '[table style="!:margin"]' +
               '<tr>' +
                '<td align="center" width="[pixels=!width]" height="[pixels=!height]" bgcolor="!backgroundColor" style="[borderRadius=!borderRadius];!:color;display:block;">' +
                 '<a href="!href" style="color:!color;font-size:!fontSize;font-weight:bold;!:fontFamily;text-decoration:none;line-height:!height;width:100%;display:inline-block">!label</a>' +
                '</td>' +
               '</tr>' +
              '[/table]' +
             '<!\\[endif\\]>' +
            '</div>'
          );
        } else {
          return (
            '[table style="!:margin"]' +
             '<tr>' +
              '<td align="center" width="[pixels=!width]" height="[pixels=!height]" bgcolor="!backgroundColor" style="!:color;display:block;">' +
               '<a !=href style="!:color;!:fontSize;font-weight:bold;!:fontFamily;text-decoration:none;line-height:!height;width:100%;display:inline-block">!label</a>' +
              '</td>' +
             '</tr>' +
            '[/table]'
          );
        }
      },
      text:
        '!label: !href'
    },

    /*
     * Outlook doesn't support margins or padding on block-level elements, so it is often better to use a [tdiv] instead of a <div>.
     */
    tdiv: {
      binds: {
        align: '',
        class: '',
        style: ''
      },
      html: '[table align="!align" class="!class" style="width:100%;"]' +
             '<tr>' +
              '<td !=style>',
      htmlClose:
          '</td>' +
         '</tr>' +
        '[/table]'
    },

    p: {
      binds: {
        style: ''
      },
      htmlOpen: '<br><br><p style="margin:0;!style">',
      htmlClose: '</p>',
      textOpen: '\n',
      textClose: ''
    },

    imglink: {
      binds: {
      },
      html: '<a !=href style="border:none;"><img style="!:height;" !=src></a>',
      text: '!href'
    },


    /*
     * Boilerplate Templates
     * =====================
     */

    doctype: {
      src: '<\\!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
    },

    wrapper: {
      html:
        '[html]' +
         '[head/]' +
         '<body>',

      htmlClose:
         '</body>' +
        '</html>'
    },

    html: {
      html: 
        '<html xmlns="http://www.w3.org/1999/xhtml">',

      htmlClose:
        '</html>'
    },

    head: {
      html:
        '<head>' +
         '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
         '<meta name="viewport" content="width=device-width, initial-scale=1.0"/>' +
         '<title>!title</title>' +
         '<style>!headStyle</style>',

      htmlClose:
        '</head>'
    },
    headStyles: {
      html: 

'#outlook a {padding:0;}\n' + // Force Outlook to provide a "view in browser" menu link.

// Prevent Webkit and Windows Mobile platforms from changing default font sizes, while not breaking desktop design.
'body{width:100% \\!important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;}\n' +

// Force Hotmail to display emails at full width
'.ExternalClass {width:100%;}\n' +

// Force Hotmail to display normal line spacing.  More on that: http://www.emailonacid.com/forum/viewthread/43/ */
'.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}\n' +
'#backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important;}\n' +

/* Some sensible defaults for images 
 * 1. "-ms-interpolation-mode: bicubic" works to help ie properly resize images in IE. (if you are resizing them using the width and height attributes)
 * 2. "border:none" removes border when linking images.
 * 3. Updated the common Gmail/Hotmail image display fix: Gmail and Hotmail unwantedly adds in an extra space below images when using non IE browsers.
 *    You may not always want all of your images to be block elements. Apply the "image_fix" class to any image you need to fix.
 */
'img {outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;}\n' +
'a img {border:none;}\n' +
'.image_fix {display:block;}\n' +
 
/* Yahoo paragraph fix: removes the proper spacing or the paragraph (p) tag. To correct we set the top/bottom margin to 1em in the head of the document.
 * Simple fix with little effect on other styling. NOTE: It is also common to use two breaks instead of the paragraph tag but I think this way is cleaner
 * and more semantic. NOTE: This example recommends 1em. More info on setting web defaults: http://www.w3.org/TR/CSS21/sample.html or
 * http://meiert.com/en/blog/20070922/user-agent-style-sheets/
 * ... but the above doesn't deal with 
 * http://www.emailonacid.com/blog/details/C13/7_tips_and_tricks_regarding_margins_and_padding_in_html_emails
 * use [p] element instead which does the double <br>
 */
'p {margin:0;margin-bottom:0;}\n' +
 
/* Hotmail header color reset: Hotmail replaces your header color styles with a green color on H2, H3, H4, H5, and H6 tags. In this example, the color is
 * reset to black for a non-linked header, blue for a linked header, red for an active header (limited support), and purple for a visited header (limited
 * support).  Replace with your choice of color. The !important is really what is overriding Hotmail's styling. Hotmail also sets the H1 and H2 tags to
 * the same size.
 */
'h1, h2, h3, h4, h5, h6 {color: black !important;}\n' +
 
'h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {color: blue !important;}\n' +
 
'h1 a:active, h2 a:active,  h3 a:active, h4 a:active, h5 a:active, h6 a:active {\n' +
'color: red !important;\n' + // Preferably not the same color as the normal header link color.  There is limited support for psuedo classes in email clients, this was added just for good measure.
'}\n' +
 
'h1 a:visited, h2 a:visited,  h3 a:visited, h4 a:visited, h5 a:visited, h6 a:visited {\n' +
'color: purple !important;\n' + // Preferably not the same color as the normal header link color. There is limited support for psuedo classes in email clients, this was added just for good measure.
'}\n' +
 
/* Outlook 07, 10 Padding issue: These "newer" versions of Outlook add some padding around table cells potentially throwing off your perfectly pixeled
 * table.  The issue can cause added space and also throw off borders completely.  Use this fix in your header or inline to safely fix your table woes.
 *
 * More info: http://www.ianhoar.com/2008/04/29/outlook-2007-borders-and-1px-padding-on-table-cells/
 * http://www.campaignmonitor.com/blog/post/3392/1px-borders-padding-on-table-cells-in-outlook-07/
 * 
 * H/T @edmelly
 */
'table td {border-collapse: collapse;}\n' +
 
/* Styling your links has become much simpler with the new Yahoo.  In fact, it falls in line with the main credo of styling in email, bring your
 * styles inline.  Your link colors will be uniform across clients when brought inline.
 */
'a {color: orange;}\n' +
 
/* Or to go the gold star route...
a:link { color: orange; }
a:visited { color: blue; }
a:hover { color: green; }
*/
 
/*** MOBILE TARGETING
 *
 * Use @media queries with care.  You should not bring these styles inline -- so it's recommended to apply them AFTER you bring the other styling
 * inline.
 *
 * Note: test carefully with Yahoo.
 * Note 2: Don't bring anything below this line inline.
 *
 * NOTE: To properly use @media queries and play nice with yahoo mail, use attribute selectors in place of class, id declarations.
 * table[class=classname]
 * Read more: http://www.campaignmonitor.com/blog/post/3457/media-query-issues-in-yahoo-mail-mobile-email/
 */
'@media only screen and (max-device-width: 480px) {\n' +
 
/* A nice and clean way to target phone numbers you want clickable and avoid a mobile phone from linking other numbers that look like, but are
 * not phone numbers.  Use these two blocks of code to "unstyle" any numbers that may be linked.  The second block gives you a class to apply
 * with a span tag to the numbers you would like linked and styled.
 *
 * Inspired by Campaign Monitor's article on using phone numbers in email: http://www.campaignmonitor.com/blog/post/3571/using-phone-numbers-in-html-email/.
 *
 * Step 1 (Step 2: line 224)
 */
  'a[href^="tel"], a[href^="sms"] {\n' +
    'text-decoration: none;\n' +
    'color: black;\n' + // or whatever your want
    'pointer-events: none;\n' +
    'cursor: default;\n' +
  '}\n' +
 
  '.mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {\n' +
    'text-decoration: default;\n' +
    'color: orange !important;\n' + // or whatever your want
    'pointer-events: auto;\n' +
    'cursor: default;\n' +
  '}\n' +
'}\n' +
 
/* More Specific Targeting */
 
'@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {\n' +
  // ipad (tablets, smaller screens, etc)
 
  /* Step 1a: Repeating for the iPad */
  'a[href^="tel"], a[href^="sms"] {\n' +
    'text-decoration: none;\n' +
    'color: blue;\n' + // or whatever your want
    'pointer-events: none;\n' +
    'cursor: default;\n' +
  '}\n' +
 
  '.mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {\n' +
    'text-decoration: default;\n' +
    'color: orange !important;\n' +
    'pointer-events: auto;\n' +
    'cursor: default;\n' +
  '}\n' +
'}\n' +
 
//@media only screen and (-webkit-min-device-pixel-ratio: 2) {
  // Put your iPhone 4g styles in here
//}
 
/* Following Android targeting from:
 * http://developer.android.com/guide/webapps/targeting.html
 * http://pugetworks.com/2011/04/css-media-queries-for-targeting-different-mobile-devices/ ;
 */
//@media only screen and (-webkit-device-pixel-ratio:.75){
  // Put CSS for low density (ldpi) Android layouts in here
//}
 
//@media only screen and (-webkit-device-pixel-ratio:1){
  // Put CSS for medium density (mdpi) Android layouts in here
//}
 
//@media only screen and (-webkit-device-pixel-ratio:1.5){
  // Put CSS for high density (hdpi) Android layouts in here
//}

  '!styleBlock' +

'</style>\n'
    },

    p: {

    }
  };

  /*
   * End of Builtin Bindings and Templates
   * =====================================
   */











  /*
   * mail.js
   * =======
   */

  var whitespaceChar = /\s/,
      attrNameChar   = /[^\t\n\f \/>"'=]/;


  /*
   * Scope
   * -----
   */

  function Scope( el, binds, template ) {
    this.el = el;
    this.binds = binds;
    this.template = template;
  }

  Scope.prototype.binding = function( name ) {
    return mailjs.resolveBind( name, this.el, this.binds, this.template );
  };

  Scope.prototype.if = function( name, template ) {
    var v = mailjs.resolveBind( name, this.el, this.binds, this.template );
    return v != null ? template : '';
  };

  // undocumented, not sure if this is a good idea
  Scope.prototype.pixels = function( pixels ) {
    return parseInt( pixels, 10 );
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
        ( template && template.binds && template.binds[ name ] ) ||
        ( this.opts.binds && this.opts.binds[ name ] ) ||
        builtinBinds[ name ];

      if ( rslt )
        return rslt;
      else
        return (
          // "string != null" means "string !== null && string !== undefined", intentional
          ( el && el.attrs[ name ] != null ) ||
          binds[ name ] != null ||
          ( template && template.binds && template.binds[ name ] != null ) ||
          ( this.opts.binds && this.opts.binds[ name ] != null ) ||
          builtinBinds[ name ] != null
        ) ? '' : null;
    },

    /*
    resolveFilter: function( name, filters, template ) {
      var rslt =
        filters[ name ] ||
        ( template && template.filters && template.filters[ name ] ) ||
        ( this.opts.filters && this.opts.filters[ name ] ) ||
        builtinFilters[ name ];

      return rslt;
    },
    */

    parseAttrs: function( s ) {
      var attrs = {};

      s.replace(
        /([^\s=,]+)\s*=\s*(?:'([^']*)'|"([^"]*)"|(\S+))/g,
        function( m, m1, m2, m3, m4 /*, offset, str */ ) {
          var v = m2 || m3 || m4;

          // three level priority ... !!v > '' > undefined
          attrs[ m1 ] = !v && ( m2 != null || m3 != null || m4 != null ) ? '' : v;
        }
      );

      return attrs;
    },

    parseElement: function( s ) {
      var matches = s.match(
        // note:  this not only grabs the tag but also verifies that the entire element can be parsed, including the attributes
        /^\[(\/?)([^\s\]/]+)+(?:\s*(?:[^\s\]=,]+)\s*=\s*(?:'(?:[^']*)'|"(?:[^"]*)"|(?:[^'"\[\]\s]+)))*(\/?)\]/
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

          src       = opts.src,
          dest      = '',

          close     = opts.close || ( el && el.close );

      if ( src == null && template ) {
        if ( html )
          src = close ? template.htmlClose : template.html;
        else
          src = close ? template.textClose : template.text;

        if ( src == null )
          src = close ? template.srcClose : template.src;

        if ( close && src == null && !template.htmlClose && !template.textClose )
          throw new Error( 'Closing elements not supported for template: ' + ( el ? el.el : '' ) );
      }

      src = src || '';

      if ( typeof src === 'function' )
        src = src( new Scope( el, binds, template ) );

      if ( !opts.inside )
        src = '[wrapper]' + src + '[/wrapper]';

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

            // evaluate/render attributes before invoking the template
            var attrs = cEl.attrs;
            for ( var key in attrs ) {
              if ( attrs.hasOwnProperty( key ) ) {
                attrs[ key ] = mailjs.render({
                  el:        el,
                  template:  template,
                  src:       attrs[ key ],
                  binds:     binds,
                  html:      html,
                  templates: templates,
                  inside:    true
                });
              }
            }

            dest += mailjs.render({
              template:  cTemplate,
              el:        cEl,
              binds:     binds,
              html:      html,
              templates: templates,
              inside:    true
            });

            si += cEl.el.length;
          } else {
            dest += '[';
            si++;
          }

          break;

        case '!':
          si++;

          var assignmentBind = undefined,
              delim = src.substring( si, si + 1 );
          if ( delim === '=' || delim === ':' ) {
            assignmentBind = delim;
            si++;
          }

          //var matches = src.substring( si ).match( /^([a-zA-Z0-9_]+)|^\{\s*([a-zA-Z0-9_]+)\s*(\|\s*[a-zA-Z0-9_|\s]+)?\}/ );
          var matches = src.substring( si ).match( /^([a-zA-Z0-9_]+)|^\{\s*([a-zA-Z0-9_]+)\s*\}/ );

          if ( !matches || matches.length < 3 ) {
            // not a binding, skip past it ... i.e. might be something like <!-- ...
            dest += '!';
            break;
          }

          var name = matches[ 1 ] || matches[ 2 ];
          si += matches[ 0 ].length;

          // remove the trailing semicolon so that we don't output it if the binding is blank
          if ( assignmentBind === ':' && src.substring( si, si + 1 ) === ';' ) {
            si++;
          }

          if ( name.match( /^(important|doctype)$/i ) ) {
            dest += '!' + name;
            break;
          }

          var bind = this.resolveBind( name, el, binds, template );
          if ( bind == null )
            throw new Error( 'No bind definition for !' + name + ' when processing' + ( el ? ' template ' + el.tag : '' ) + ' (mode=' + ( html ? 'HTML' : 'text' ) + '):\n\n' + src );

          var nestedSrc;
          if ( assignmentBind ) {
            if ( !bind ) {
              var dlast = dest.length - 1;

              if ( dlast >= 0 && dest.substring( dlast ) === ' ' ) {
                dest = dest.substring( 0, dlast );
                dlast--;
              }

              break;
            }

            switch ( assignmentBind ) {
            case '=':
              nestedSrc = name + '="' + bind + '"';
              break;
            case ':':
              nestedSrc = _.kebabCase( name ) + ':' + bind + ';';
              break;
            }

          } else {
            nestedSrc = bind;
          }

          bind = mailjs.render({
            src:       nestedSrc,
            binds:     binds,
            html:      html,
            templates: templates,
            inside:    true
          });

          dest += bind;
          break;

        default:
          dest += src[ si++ ];
        }
      }

      if ( el && !opts.close && el.selfClose ) {
        var savedInside = opts.inside;
        opts.close = true;
        opts.inside = true;
        dest += mailjs.render( opts );
        delete opts.close;
        opts.inside = savedInside;
      }

      if ( !opts.inside && opts.html ) {
        var css = (mailjs.opts.css || '') + (opts.css || '');

        if (css) {
          dest = juice( dest, { extraCss: css } );
        }
      }

      return dest;
    },

    send: function( opts ) {

      if ( !this.opts.transport )
        throw new Error( "Nodemailer transport not configured." );

      var body = opts.body;

      body.html = true;
      opts.html = mailjs.render( body );

      delete body.html;
      opts.text = mailjs.render( body );

      this.opts.transport.sendMail( opts );
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

