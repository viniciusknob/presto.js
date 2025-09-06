(function (Presto, setInterval, clearInterval) {
  const { Style, SulAmerica, SaudePetrobras, CanoasPrev, Cabergs, ContaAgil } =
    Presto.modules;

  const pages = [SulAmerica, SaudePetrobras, CanoasPrev, Cabergs, ContaAgil];

  const _init = function () {
      Style.inject();
      pages.forEach((x) => {
        if (x.is()) x.fix();
      });
    },
    _isLoaded = function () {
      return pages.some((x) => x.is() && x.isLoaded());
    },
    _initWithDelay = function () {
      var interval = setInterval(function () {
        if (_isLoaded()) {
          clearInterval(interval);
          _init();
        }
      }, 250);
    };

  /* Public Functions */

  Presto.bless = _initWithDelay;
})(window.Presto, window.setInterval, window.clearInterval);
