var noop = require('no-op');
// some dependencies uses console. IE doesn't have console, when web tools are
// disabled.
global.console || (global.console = {});

['error', 'warn', 'log', 'info'].forEach(function (method) {
  global.console[method] || (global.console[method] = noop);
}, {});

console.assert || (console.assert = function (expression, message) {
  if (!expression) {
    console.error('Assertion failed: ', message);
  }
});
