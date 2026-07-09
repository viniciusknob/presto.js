(function (Presto, location) {
  "use strict";

  const { CommonsHelper, DomHelper } = Presto.modules;
  const { Taskier } = CommonsHelper;
  const { $, $$ } = DomHelper;

  const _Page = (function () {
    const PATHNAME_REGEX = /nfse\/emissao/;

    const _setDesiredValues = () => {
        const tasks = Taskier.mapToFunc([
          Taskier.toSelect("#codigoServico", "041601"), // Psicologia
          Taskier.toText(
            "#descricaoPersonalizadaauto",
            "Psicologia: Sessões de Terapia",
          ),
        ]);

        Taskier.exec(tasks, 200);
      },
      applyFeatures = () => {
        const fn = "applyFeatures";
        console.log(`${fn} - Enter`);
        try {
          if (!PATHNAME_REGEX.test(location.pathname)) return;

          const interval = setInterval(() => {
            console.log(`${fn} - setInterval - Enter`);
            try {
              const target = $("#localTributacaoauto");
              if (target?.value) {
                clearInterval(interval);
                setTimeout(_setDesiredValues, 1000);
              }
            } finally {
              console.log(`${fn} - setInterval - Exit`);
            }
          }, 1000);
        } finally {
          console.log(`${fn} - Exit`);
        }
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.EmitirNFSe = _Page;
})(window.Presto, window.location);
