(function (Presto, location) {
  "use strict";

  const { DomHelper, SulAmericaHelper } = Presto.modules;
  const { $ } = DomHelper;
  const dbVersion = 2;

  const _Page = (function () {
    const PATHNAME_REGEX = /validacao-de-procedimentos\/consulta/;

    const applyFeatures = () => {
      if (!PATHNAME_REGEX.test(location.pathname)) return;

      SulAmericaHelper.getPatients(dbVersion)
        .then(SulAmericaHelper.buildInsuredComboBox)
        .then((comboBox) => {
          if (!comboBox) return;

          const node = $("#box-validacao-beneficiario");
          if (!node) return;

          node.insertBefore(comboBox, node.childNodes[2]);
          SulAmericaHelper.applyContextPatientToComboBox(comboBox);
        })
        .catch((err) => {
          console.log(
            `ProcedimentoConsultaPage.applyFeatures: ${JSON.stringify(err)}`,
          );
        });
    };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.ProcedimentoConsultaPage = _Page;
})(Presto, location);
