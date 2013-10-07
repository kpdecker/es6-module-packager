(function() {
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

// simple.es6.js
(function(__dependency1__, __dependency2__) {
  "use strict";
  var foo = __dependency1__;var bar = __dependency2__.bar;
})(__module1__, __module2__);

})();
