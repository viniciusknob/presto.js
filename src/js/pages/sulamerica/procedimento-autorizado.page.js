(function (Presto, location) {
  "use strict";

  const { DomHelper, SulAmericaHelper } = Presto.modules;
  const { $ } = DomHelper;
  const dbVersion = 2;

  const _Page = (function () {
    const PATHNAME_REGEX = /validar-procedimento-autorizado/;

    const applyFeatures = () => {
      if (!PATHNAME_REGEX.test(location.pathname)) return;

      SulAmericaHelper.getPatients(dbVersion)
        .then(SulAmericaHelper.buildInsuredComboBox)
        .then((comboBox) => {
          if (!comboBox) return;

          const node = $("#box-validacao-beneficiario");
          if (!node) return;

          node.insertBefore(comboBox, node.childNodes[0]);
          SulAmericaHelper.applyContextPatientToComboBox(comboBox);

          const boxPadrao = $(".box-padrao");
          if (boxPadrao) {
            boxPadrao.style.width = "780px";
          }

          SulAmericaHelper.createMonthYearFilter({
            dateBeginFieldSelector: 'input[name="data-inicio"]',
            dateEndFieldSelector: 'input[name="data-termino"]',
            insertAt: 2,
            setLabelWidthInitial: true,
            marginRight: "1rem",
          });
        })
        .catch((err) => {
          console.log(
            `ProcedimentoAutorizadoPage.applyFeatures: ${JSON.stringify(err)}`,
          );
        });
    };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.ProcedimentoAutorizadoPage = _Page;
})(Presto, location);
