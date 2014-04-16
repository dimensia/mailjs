
var mailjs = require( '../mail' ),
    chai   = require( 'chai' ),
    expect = chai.expect;


describe( 'attribute parser', function() {

  it( 'should parse all three quote styles', function() {
    expect(
      mailjs.parseAttrs( " foo='faz' bar=\"baz\"  car=caz" )
    ).to.eql(
      { foo: 'faz', bar: 'baz', car: 'caz' }
    );
  });

  it( 'should parse empty strings', function() {
    expect(
      mailjs.parseAttrs( ' ' )
    ).to.eql(
      {}
    );
  });
});

describe( 'element parser', function() {

  it( 'should parse simple tags', function() {
    expect(
      mailjs.parseElement( '[a]' )
    ).to.eql(
      { el: '[a]', tag: 'a', attrs: {} }
    );
  });

  it( 'should parse all three quote styles', function() {
    expect(
      mailjs.parseElement( "[a foo='faz' bar=\"baz\"  car=caz]" )
    ).to.eql(
      { el: "[a foo='faz' bar=\"baz\"  car=caz]", tag: 'a', attrs: { foo: 'faz', bar: 'baz', car: 'caz' } }
    );
  });

  it( 'should deal with quoted brackets', function() {
    expect(
      mailjs.parseElement( "[div tag='[div style=\"color:#000;\"]']" )
    ).to.eql(
      { el: "[div tag='[div style=\"color:#000;\"]']", tag: 'div', attrs: { tag: '[div style="color:#000;"]' } }
    );
  });

  it( 'should throw on empty elements', function() {
    expect( function() {
      mailjs.parseElement( '' )
    }).to.throw();

    expect( function() {
      mailjs.parseElement( '[]' )
    }).to.throw();
  });

  it( 'should throw on invalid elements', function() {
    expect( function() {
      return mailjs.parseElement( '[a style]' )
    }).to.throw();
  });

  it( 'should throw on incomplete elements', function() {
    expect( function() {
      return mailjs.parseElement( '[' )
    }).to.throw();

    expect( function() {
      return mailjs.parseElement( '[a style' )
    }).to.throw();
  });

  it( 'should support self-closing elements', function() {
    expect(
      mailjs.parseElement( '[a style="display:block;"/]' )
    ).to.eql(
      { el: '[a style="display:block;"/]', tag: 'a', attrs: { style: 'display:block;' }, selfClose: true }
    );
  });

  it( 'should support closing elements', function() {
    expect(
      mailjs.parseElement( '[/a]' )
    ).to.eql(
      { el: '[/a]', tag: 'a', attrs: {}, close: true }
    );
  });

  it( 'should throw on elements that are closed and self-closed', function() {
    expect( function() {
      return mailjs.parseElement( '[/a/]' )
    }).to.throw( /closed and self-closed/ );
  });

  it( 'should throw on closed elements that have attributes', function() {
    expect( function() {
      return mailjs.parseElement( '[/a style="color:#000;"]' )
    }).to.throw( /Closed elements should not contain attributes/ );
  });
});

describe( 'generation', function() {
  before( function() {
    mailjs.config({
      templates: {
        btn: {
          html: '<a style="color:#ffffff;width:$width;" href="$href">$label</a>',
          text: '$label: $href',
          defaults: {
            width: '300px'
          }
        }
      }
    });
  });

  after( function() {
    mailjs.config({});
  });

  it( 'should render simple text', function() {
    expect(
      mailjs.render({
        src: 'This is a simple email.'
      })
    ).to.eql(
      'This is a simple email.'
    );
  });

  it( 'should support escapes', function() {
    expect(
      mailjs.render({
        src: '\\[Hello, \\$firstName./\\]'
      })
    ).to.eql(
      '[Hello, $firstName./]'
    );
  });

  it( 'should process simple binds', function() {
    expect(
      mailjs.render({
        src: 'Hello, $firstName.',
        binds: {
          firstName: 'Jane'
        }
      })
    ).to.eql(
      'Hello, Jane.'
    );
  });

  it( 'should process templates', function() {
    expect(
      mailjs.render({
        src: '[msg name="Jane"] and [msg].',
        binds: {
          name: 'Joe'
        },
        templates: {
          msg: {
            src: 'a message for $name'
          }
        }
      })
    ).to.eql(
      'a message for Jane and a message for Joe.'
    );
  });

  it( 'should process text & html templates', function() {
    expect(
      mailjs.render({
        src: '[btn href="https://apple.com" label="Visit Apple"].'
      })
    ).to.equal(
      'Visit Apple: https://apple.com.'
    );

    expect(
      mailjs.render({
        src:  '[btn href="https://apple.com" label="Visit Apple"].',
        html: true
      })
    ).to.equal(
      '<a style="color:#ffffff;width:300px;" href="https://apple.com">Visit Apple</a>.'
    );
  });

  it( 'should throw when using unsupported close tags', function() {
    expect( function() {
      mailjs.render({
        // here, btn does not support a closing tag
        src: '[btn href="https://apple.com" label="Visit Apple"]sample text[/btn].'
      })
    }).to.throw( /Closing elements not supported/ );
  });
});

