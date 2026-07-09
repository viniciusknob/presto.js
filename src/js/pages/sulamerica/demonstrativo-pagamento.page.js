(function (Presto, location) {
  "use strict";

  const { SulAmericaHelper } = Presto.modules;

  const _Page = (function () {
    const PATHNAME_REGEX =
      /demonstrativos-tiss-3(\/demonstrativo-de-pagamento)?/;

    const applyFeatures = () => {
      if (!PATHNAME_REGEX.test(location.pathname)) return;

      SulAmericaHelper.createMonthYearFilter({
        dateBeginFieldSelector: 'input[name="data-inicial"]',
        dateEndFieldSelector: 'input[name="data-final"]',
        insertAt: 1,
        setLabelWidthInitial: true,
        setDisplayBlock: true,
      });
    };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.DemonstrativoPagamentoPage = _Page;
})(Presto, location);
