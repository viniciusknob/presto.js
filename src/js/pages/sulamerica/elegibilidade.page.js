(function (Presto, location) {
  "use strict";

  const { DomHelper, SulAmericaHelper } = Presto.modules;
  const { $ } = DomHelper;
  const dbVersion = 2;

  const _Page = (function () {
    const PATHNAME_REGEX = /validacao-de-elegibilidade\/?$/;

    const applyFeatures = () => {
      if (!PATHNAME_REGEX.test(location.pathname)) return;

      SulAmericaHelper.getPatients(dbVersion)
        .then(SulAmericaHelper.buildInsuredComboBox)
        .then((comboBox) => {
          if (!comboBox) return;

          const node = $("#box-validacao-beneficiario div");
          if (!node) return;

          node.insertBefore(comboBox, node.childNodes[2]);

          const boxPadrao = $(".box-padrao");
          if (boxPadrao) {
            boxPadrao.style.width = "850px";
          }
        })
        .catch((err) => {
          console.log(
            `ElegibilidadePage.applyFeatures: ${JSON.stringify(err)}`,
          );
        });
    };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.ElegibilidadePage = _Page;
})(Presto, location);
