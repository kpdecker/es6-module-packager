var fs = require('fs'),
    sinon = require('sinon'),
    Packager = require('../dist/lib/packager').default,
    Path = require('path'),
      resolve = Path.resolve;

describe('packager', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });
  afterEach(function() {
    sandbox.restore();
  });

  it('should detect circular dependencies', function() {
    sandbox.stub(fs, 'readFileSync', function(name) {
      if (/\/foo.js$/.test(name)) {
        return 'module bar from "bar";';
      } else if (/\/bar.js$/.test(name)) {
        return 'module bar from "foo";';
      }
    });

    (function() {
      new Packager('foo.js');
    }).should.throw(/Circular dependency found "foo" in ".*bar\.js"/);
  });
  it('should handle relative imports', function() {
    sandbox.stub(fs, 'readFileSync', function(name) {
      if (/\/foo.js$/.test(name)) {
        return 'module bar from "./foo/bar";';
      } else if (/foo\/bar.js$/.test(name)) {
        return 'module bar from "./bat";';
      }
    });

    var packager = new Packager('foo.js');
    packager.fileList.should.eql([
      resolve('foo/bat.js'),
      resolve('foo/bar.js'),
      resolve('foo.js')
    ]);
  });
  it('should handle duplicate imports', function() {
    sandbox.stub(fs, 'readFileSync', function(name) {
      if (/\/foo.js$/.test(name)) {
        return 'module bar from "./bar"; module bar from "./bat";';
      } else if (/bar.js$/.test(name)) {
        return 'module bar from "./bat";';
      } else if (/bat.js$/.test(name)) {
        return 'module bar from "./boz";';
      }
    });

    var packager = new Packager('foo.js');
    packager.fileList.should.eql([
      resolve('boz.js'),
      resolve('bat.js'),
      resolve('bar.js'),
      resolve('foo.js')
    ]);
  });
  describe('missing exports', function() {
    it('should detect missing default', function() {
      sandbox.stub(fs, 'readFileSync', function(name) {
        if (/\/foo.js$/.test(name)) {
          return 'import bar from "bar";';
        }
      });

      (function() {
        new Packager('foo.js');
      }).should.throw(/No default export for ".*bar\.js"/);
    });
    it('should detect missing named exports', function() {
      sandbox.stub(fs, 'readFileSync', function(name) {
        if (/\/foo.js$/.test(name)) {
          return 'import {bar} from "bar";';
        }
      });

      (function() {
        new Packager('foo.js');
      }).should.throw(/No export named "bar" in ".*bar\.js"/);
    });
  });
  describe('outputs', function() {
    it('should generate simple output', function() {
      var packager = new Packager(__dirname + '/artifacts/packager/simple.es6.js');
      packager.toLocals().should.equal(fs.readFileSync(__dirname + '/artifacts/packager/simple.packager.js').toString());
    });
    it('should generate exports', function() {
      var packager = new Packager(__dirname + '/artifacts/packager/export.es6.js', {'export': 'Global'});
      packager.toLocals().should.equal(fs.readFileSync(__dirname + '/artifacts/packager/export.packager.js').toString());
    });
    it('should generate exports', function() {
      var packager = new Packager(__dirname + '/artifacts/packager/export.es6.js', {'export': 'Global'});
      packager.toUMD().should.equal(fs.readFileSync(__dirname + '/artifacts/packager/export.packager.umd.js').toString());
    });
    it('should error with useful information', function() {
      (function() {
        new Packager(__dirname + '/artifacts/packager/error.es6.js');
      }).should.throw(/Unable to lookup "\.\/404\/foo" from ".*\/error\.es6\.js"/);
    });
  });
});
