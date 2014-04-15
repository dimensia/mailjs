
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
      mailjs.parseElement( 'a' )
    ).to.eql(
      { tag: 'a', attrs: {} }
    );
  });

  it( 'should parse all three quote styles', function() {
    expect(
      mailjs.parseElement( "a foo='faz' bar=\"baz\"  car=caz" )
    ).to.eql(
      { tag: 'a', attrs: { foo: 'faz', bar: 'baz', car: 'caz' } }
    );
  });

  it( 'should throw on empty elements', function() {
    expect( function() {
      mailjs.parseElement( '' )
    }).to.throw();
  });

  it( 'should throw on invalid elements', function() {
    expect( function() {
      return mailjs.parseElement( 'a style' )
    }).to.throw();
  });

});

describe( 'text generation', function() {

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
        src: 'Hello, \\$firstName.'
      })
    ).to.eql(
      'Hello, $firstName.'
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

});

