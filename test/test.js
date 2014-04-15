
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

  it( 'should support self-terminated elements', function() {
    expect(
      mailjs.parseElement( '[a style="display:block;"/]' )
    ).to.eql(
      { el: '[a style="display:block;"/]', tag: 'a', attrs: { style: 'display:block;' }, term: true }
    );
  });

});

describe( 'generation', function() {

  it( 'should generate simple text', function() {

    expect(
      mailjs.generate({
        src: 'This is a simple email.'
      })
    ).to.eql(
      'This is a simple email.'
    );
  });

  it( 'should support escapes', function() {
    expect(
      mailjs.generate({
        src: '\\[Hello, \\$firstName./\\]'
      })
    ).to.eql(
      '[Hello, $firstName./]'
    );
  });

  it( 'should process simple binds', function() {

    expect(
      mailjs.generate({
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
      mailjs.generate({
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

});

