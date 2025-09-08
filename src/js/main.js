(function (Presto, setInterval, clearInterval) {
  const { Style, SulAmerica, SaudePetrobras, CanoasPrev, Cabergs, ContaAgil } =
    Presto.modules;

  const pages = [SulAmerica, SaudePetrobras, CanoasPrev, Cabergs, ContaAgil];

  const _init = function () {
    Style.inject();
    pages.forEach((page) => {
      if (page.isCurrentHost()) page.applyFeatures();
    });
  };

  const _isPageReady = function () {
    return pages.some((x) => x.isCurrentHost() && x.isPageReady());
  };

  const initWithDelay = function () {
    var interval = setInterval(function () {
      if (_isPageReady()) {
        clearInterval(interval);
        _init();
      }
    }, 250);
  };

  /* Public Functions */

  Presto.bless = initWithDelay;
})(window.Presto, window.setInterval, window.clearInterval);
