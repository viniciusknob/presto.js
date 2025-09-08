(function (Presto, location, jQuery) {
  "use strict";

  const { Snackbar, FAB } = Presto.modules;

  const _Page = (function () {
    const PATHNAME_REGEX = /bancario\/index/;

    const __setDefaultCategoryForRevenue_onclick = () => {
        jQuery(".selectpicker").selectpicker("val", "19");
      },
      applyFeatures = () => {
        if (!PATHNAME_REGEX.test(location.pathname)) return;

        FAB.build([
          {
            textLabel: "Receita: Setar categoria padrão",
            iconClass: "las la-wrench",
            click: __setDefaultCategoryForRevenue_onclick,
          },
        ]);
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.ConciliacaoBancariaPage = _Page;
})(window.Presto, window.location, window.jQuery);
