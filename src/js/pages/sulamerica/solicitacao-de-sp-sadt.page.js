(function (Presto, location) {
  "use strict";

  const { PatientModel } = Presto.models;
  const dbVersion = 2; // IndexedDB
  const { Snackbar, FAB, CommonsHelper, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

  const _Page = (function () {
    // validacao-de-procedimentos-tiss-3/validacao-de-procedimentos/solicitacao/solicitacao-de-sp-sadt.htm
    const PATHNAME_REGEX = /solicitacao\/solicitacao-de-sp-sadt/;

    const __btnPreencherDadosPadrao_onclick = async (qtdSolicitada) => {
        const formatBRDate = (date) => {
          const intlOpt = { day: "2-digit", month: "2-digit", year: "numeric" };
          return new Intl.DateTimeFormat("pt-BR", intlOpt).format(date);
        };

        let carteira = undefined;
        $$(".linha").forEach((line) => {
          let strongList = $$("strong", line);
          strongList.forEach((strong) => {
            if (strong) {
              let strongText = strong.textContent;
              if (/Carteira/.test(strongText)) {
                carteira = $("span", strong.parentElement).textContent.replace(
                  /\s/g,
                  ""
                );
              }
            }
          });
        });
        let patient = undefined;
        if (carteira) {
          patient = await PatientModel.getOrCreateDB(dbVersion)
            .then(PatientModel.getAll)
            .then((patients) => patients.find((x) => x.id === carteira));
        }

        const { Taskier } = CommonsHelper;

        const tasks = Taskier.mapToFunc([
          Taskier.toText(
            "[name='solicitacao-sp-sadt.numero-guia-prestador']",
            "0"
          ),
          Taskier.toText(
            "[name='solicitacao-sp-sadt.executante-solicitante.nome-profissional-solicitante']",
            patient?.specialist?.name || ""
          ),
          Taskier.toSelect("#conselho-profissional", "CRP"),
          Taskier.toSelect("#uf-conselho-profissional", "RS"),
          Taskier.toText(
            "[name='solicitacao-sp-sadt.executante-solicitante.conselho-profissional.numero']",
            patient?.specialist?.ncrp || ""
          ),
          Taskier.toFunc(() =>
            CommonsHelper.selectFirstJQueryAutocomplete(
              "#busca-codigo-cbo",
              "251510"
            )
          ),
          Taskier.toFunc(() => {
            // const d = new Date();
            // const yyyy = d.getFullYear();
            // const mm = d.getMonth();
            // const date = CommonsHelper.getFirstWeekdayOfMonth(yyyy, mm);
            const sel = "#data-atendimento";
            $(sel).value = formatBRDate(new Date());
          }),
          Taskier.toSelect("#recem-nato", "Não"),
          Taskier.toSelect(
            "[name='solicitacao-sp-sadt.atendimento.tecnica-utilizada.codigo']",
            "Convencional"
          ),
          Taskier.toText("[name='codigo-procedimento']", "50000470"),
          Taskier.toFunc(() => $("#btn-incluir-procedimento").click()),
          Taskier.toFunc(() => {
            const sel = '[name="quantidade-solicitada"]';
            const input = $(sel);
            input.value = qtdSolicitada;

            const event = new Event("change", { bubbles: true });
            input.dispatchEvent(event);
          }),
          Taskier.toFunc(() => $("#btn-validar-procedimento").click()),
        ]);

        Taskier.exec(tasks, 200)
          .then(() => Snackbar.fire("Pronto!"))
          .then(() => {
            const selector = "#btn-confirmar-solicitacao";
            const elem = $(selector);
            const originalClick = elem.click;
            elem.onclick = () => {
              const prefix = "solicitacao-sp-sadt.executante-solicitante";
              const spcName = $(
                `[name='${prefix}.nome-profissional-solicitante']`
              ).value;
              const spcNCRP = $(
                `[name='${prefix}.conselho-profissional.numero']`
              ).value;
              patient = {
                ...patient,
                specialist: {
                  name: spcName,
                  ncrp: spcNCRP,
                },
              };
              PatientModel.getOrCreateDB(dbVersion)
                .then((db) => PatientModel.addOrUpdateItem(db, patient))
                .then(() => originalClick())
                .catch((e) => console.error(e));
            };
          });
      },
      applyFeatures = () => {
        if (!PATHNAME_REGEX.test(location.pathname)) return;

        FAB.build([
          {
            textLabel: "Autorizar 5 sessões",
            iconClass: "las icon-number-5",
            click: () => __btnPreencherDadosPadrao_onclick(5),
          },
          {
            textLabel: "Autorizar 4 sessões",
            iconClass: "las icon-number-4",
            click: () => __btnPreencherDadosPadrao_onclick(4),
          },
          {
            textLabel: "Autorizar 3 sessões",
            iconClass: "las icon-number-3",
            click: () => __btnPreencherDadosPadrao_onclick(3),
          },
          {
            textLabel: "Autorizar 2 sessões",
            iconClass: "las icon-number-2",
            click: () => __btnPreencherDadosPadrao_onclick(2),
          },
          {
            textLabel: "Autorizar 1 sessões",
            iconClass: "las icon-number-1",
            click: () => __btnPreencherDadosPadrao_onclick(1),
          },
        ]);
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.SolicitacaoDeSPSADTPage = _Page;
})(Presto, location);
