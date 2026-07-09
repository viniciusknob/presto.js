(function (Presto, location) {
  "use strict";

  const { DomHelper, SulAmericaHelper } = Presto.modules;
  const { $ } = DomHelper;
  const dbVersion = 2;

  const _Page = (function () {
    const PATHNAME_REGEX = /fechamento-de-lote/;

    const applyFeatures = () => {
      if (!PATHNAME_REGEX.test(location.pathname)) return;

      SulAmericaHelper.getPatients(dbVersion)
        .then(SulAmericaHelper.buildInsuredComboBox)
        .then((comboBox) => {
          if (!comboBox) return;

          const node = $("#box-validacao-beneficiario div");
          if (!node) return;

          node.insertBefore(comboBox, node.childNodes[2]);
          SulAmericaHelper.createMonthYearFilter({
            dateBeginFieldSelector: 'input[name="data-inicial"]',
            dateEndFieldSelector: 'input[name="data-final"]',
            insertAt: 1,
          });
        })
        .catch((err) => {
          console.log(
            `FechamentoDeLotePage.applyFeatures: ${JSON.stringify(err)}`,
          );
        });
    };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.FechamentoDeLotePage = _Page;
})(Presto, location);
