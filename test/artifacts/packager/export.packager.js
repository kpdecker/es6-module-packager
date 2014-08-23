/* exported Global */
this.Global = this.Global || (function() {
// nested/foo.js
var __module1__ = (function() {
  "use strict";
  var __exports__;
  __exports__ = var foo = 'bar';
  return __exports__;
})();

// nested/bar.js
var __module2__ = (function() {
  "use strict";
  var __exports__ = {};
  function bar() {};
  __exports__.bar = bar;
  return __exports__;
})();

// export.es6.js
var __module0__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  var foo = __dependency1__;var bar = __dependency2__.bar;var a = 0;
  __exports__.a = a;
  return __exports__;
})(__module1__, __module2__);

  return __module0__;
})();
