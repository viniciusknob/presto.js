(function (Presto, location, jQuery) {
  "use strict";

  const { Snackbar, FAB } = Presto.modules;

  const _Page = (function () {
    const PATHNAME_REGEX = /bancario\/index/;

    const __setDefaultCategoryForRevenue_onclick = () => {
        jQuery(".selectpicker").selectpicker("val", "19");
      },
      _upgrade = () => {
        FAB.build([
          {
            textLabel: "Receita: Setar categoria padrão",
            iconClass: "las la-wrench",
            click: __setDefaultCategoryForRevenue_onclick,
          },
        ]);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) {
          _upgrade();
        }
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.ConciliacaoBancariaPage = _Page;
})(window.Presto, window.location, window.jQuery);
