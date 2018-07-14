// TODO: make it inherit from Promise to allow `promiz instanceof Promise`
function Promiz (arg) {
  var WARN_AFTER_TIME = 30;
  var promise = new Promise(arg);
  var isFulfilled = false;
  var resolver = function () {
    isFulfilled = true;
  };
  var rejecter = function (err) {
    isFulfilled = true;
    if (err instanceof Error) {
      console.error('Error in promise', err);
    }
  };

  promise.then(resolver, rejecter);

  setTimeout(function () {
    if (!isFulfilled) {
      console.warn('Long-lasting promise may cause memory leaks.', arg);
    }
  }, WARN_AFTER_TIME * 1000);

  promise.promiz_was_here = true;
  return promise;
}
Promiz.all = Promise.all;
Promiz.race = Promise.race;
Promiz.reject = Promise.reject;
Promiz.resolve = Promise.resolve;

module.exports = Promiz;
