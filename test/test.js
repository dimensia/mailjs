
var mailjs = require( '../mail' ),
    chai   = require( 'chai' ),
    expect = chai.expect;


describe( 'mailjs.translate', function() {
  describe( 'attribute parser', function() {
    it( 'should parse all three quote styles', function() {
      var str   = " foo='faz' bar=\"baz\"  car=caz",
          attrs = mailjs.parseAttrs( str );

      expect( attrs[ 'foo' ] ).to.equal( 'faz' );
      expect( attrs[ 'bar' ] ).to.equal( 'baz' );
      expect( attrs[ 'car' ] ).to.equal( 'caz' );
    });

    it( 'should parse empty strings', function() {
      var str   = " ",
          attrs = mailjs.parseAttrs( str );

      expect( attrs ).to.eql( {} );
    });
  });
});

