(function (Presto, location) {
  "use strict";

  const { PatientModel } = Presto.models;
  const dbVersion = 2; // IndexedDB
  const { SolicitacaoDeSPSADTPage, GuiaDeSPSADTIncluirPage } = Presto.pages;
  const { CommonsHelper } = Presto.modules;

  const _Module = (function () {
    const HOST = /saude.sulamericaseguros.com.br/,
      // Prestador > Segurado > Validação de Elegibilidade
      ELEGIBILIDADE = /validacao-de-elegibilidade/,
      // Prestador > Segurado > Validação de Elegibilidade
      ELEGIBILIDADE_RESULTADO =
        /validacao-de-elegibilidade\/elegibilidade-resultado/,
      // Prestador > Segurado > Validação de Procedimentos > Solicitação
      PROCEDIMENTO_SOLICITACAO =
        /validacao-de-procedimentos\/?(solicitacao)?\/?$/,
      // Prestador > Segurado > Validação de Procedimentos > Consulta > Consulta de Solicitações
      PROCEDIMENTO_CONSULTA = /validacao-de-procedimentos\/consulta/,
      // Prestador > Serviços Médicos > Contas Médicas > Faturamento > Fechamento de Lote > Fechamento de Lote
      FECHAMENTO_DE_LOTE = /fechamento-de-lote/,
      // Prestador > Serviços Médicos > Contas Médicas > Faturamento > Validar procedimento autorizado
      PROCEDIMENTO_AUTORIZADO = /validar-procedimento-autorizado/,
      // Prestador > Serviços Médicos > Demonstrativos TISS 3 > Demonstrativo de Pagamento > Demonstrativo de Pagamento
      DEMONSTRATIVO_PAGAMENTO =
        /demonstrativos-tiss-3(\/demonstrativo-de-pagamento)?/;

    const _is = function () {
        return HOST.test(location.host);
      },
      _isLoaded = function () {
        return [
          "#box-validacao-beneficiario",
          ".box-indicador-elegibilidade",
          ".box-padrao",
        ]
          .map((x) => document.querySelector(x))
          .some((x) => x);
      },
      _buildComboBox = async function (insuredList = []) {
        if (insuredList.length === 0) return null;

        let select = document.createElement("SELECT");
        select.style.cssText = "vertical-align: middle;";

        let option = document.createElement("OPTION");
        option.value = "";
        option.textContent = "ESCOLHA O BENEFICIÁRIO...";
        select.appendChild(option);

        select.onchange = () => {
          let option = select.querySelector(":checked");

          document.querySelector("#codigo-beneficiario-1").value =
            option.value.substr(0, 3);
          document.querySelector("#codigo-beneficiario-2").value =
            option.value.substr(3, 5);
          document.querySelector("#codigo-beneficiario-3").value =
            option.value.substr(8, 4);
          document.querySelector("#codigo-beneficiario-4").value =
            option.value.substr(12, 4);
          document.querySelector("#codigo-beneficiario-5").value =
            option.value.substr(16, 4);
        };

        insuredList.forEach((insured) => {
          let option = document.createElement("OPTION");
          option.value = insured.id;
          option.textContent = insured.name;
          select.appendChild(option);
        });

        return select;
      },
      _fixAnyPage = async function () {
        GuiaDeSPSADTIncluirPage.upgrade();
        SolicitacaoDeSPSADTPage.upgrade();

        if (DEMONSTRATIVO_PAGAMENTO.test(location.pathname)) {
          // BEGIN create field for month/year
          const dateBeginFieldSelector = 'input[name="data-inicial"]';
          const div = CommonsHelper.createSelectOptionsMonthYear({
            dateBeginFieldId: dateBeginFieldSelector,
            dateEndFieldId: 'input[name="data-final"]',
          });
          div.firstElementChild.style.width = "initial"; // label
          div.style.display = "block";
          const node = document.querySelector(dateBeginFieldSelector)
            .parentElement.parentElement;
          node.insertBefore(div, node.childNodes[1]);
          // END create field for month/year
        } else if (ELEGIBILIDADE_RESULTADO.test(location.pathname)) {
          let eligibleBox = document.querySelector(
            ".box-indicador-elegibilidade .linha"
          );
          let eligible = eligibleBox.querySelector(".atencao").textContent;

          let patient = {
            id: "",
            name: "",
          };

          document.querySelectorAll(".linha").forEach((line) => {
            let strongList = line.querySelectorAll("strong");
            strongList.forEach((strong) => {
              if (strong) {
                let strongText = strong.textContent;
                if (/Carteira/.test(strongText)) {
                  patient.id = strong.parentElement
                    .querySelector("span")
                    .textContent.replace(/\s/g, "");
                }
                if (/Nome/.test(strongText)) {
                  patient.name =
                    strong.parentElement.querySelector("span").textContent;
                }
              }
            });
          });

          if (patient.id) {
            const _patient = await PatientModel.getOrCreateDB(dbVersion)
              .then(PatientModel.getAll)
              .then((patients) => patients.find((x) => x.id === patient.id));

            patient = _patient || patient;
          }

          if (eligible === "SIM") {
            let divStatus = document.createElement("DIV");
            divStatus.id = "js-presto-status";
            divStatus.style = "float:right;font-weight:bold;color:limegreen;";
            divStatus.textContent = "Salvando...";
            eligibleBox.appendChild(divStatus);

            PatientModel.getOrCreateDB(dbVersion)
              .then((db) => PatientModel.addOrUpdateItem(db, patient))
              .then(() => {
                eligibleBox.querySelector("#js-presto-status").textContent =
                  "Salvo!";
              })
              .catch((err) => {
                console.log(
                  `_fixAnyPage: [eligible=${eligible}] ${JSON.stringify(err)}`
                );
              });
          }
        } else {
          PatientModel.getOrCreateDB(dbVersion)
            .then(PatientModel.getAll)
            .then(_buildComboBox)
            .then((comboBox) => {
              if (!comboBox) return;

              if (ELEGIBILIDADE.test(location.pathname)) {
                let node = document.querySelector(
                  "#box-validacao-beneficiario div"
                );
                node.insertBefore(comboBox, node.childNodes[2]);
                document.querySelector(".box-padrao").style.width = "850px";
              }
              if (PROCEDIMENTO_SOLICITACAO.test(location.pathname)) {
                if (PROCEDIMENTO_CONSULTA.test(location.pathname)) {
                  let node = document.querySelector(
                    "#box-validacao-beneficiario"
                  );
                  node.insertBefore(comboBox, node.childNodes[2]);
                } else {
                  let node = document.querySelector(
                    "#box-validacao-beneficiario div"
                  );
                  node.insertBefore(comboBox, node.childNodes[2]);
                  document.querySelector(".box-padrao").style.width = "850px";
                }
              }
              if (FECHAMENTO_DE_LOTE.test(location.pathname)) {
                let node = document.querySelector(
                  "#box-validacao-beneficiario div"
                );
                node.insertBefore(comboBox, node.childNodes[2]);

                // BEGIN create field for month/year
                const dateBeginFieldSelector = 'input[name="data-inicial"]';
                const div = CommonsHelper.createSelectOptionsMonthYear({
                  dateBeginFieldId: dateBeginFieldSelector,
                  dateEndFieldId: 'input[name="data-final"]',
                });
                node = document.querySelector(dateBeginFieldSelector)
                  .parentElement.parentElement;
                node.insertBefore(div, node.childNodes[1]);
                // END create field for month/year
              }
              if (PROCEDIMENTO_AUTORIZADO.test(location.pathname)) {
                let node = document.querySelector(
                  "#box-validacao-beneficiario"
                );
                node.insertBefore(comboBox, node.childNodes[0]);
                document.querySelector(".box-padrao").style.width = "780px";

                // BEGIN create field for month/year
                const dateBeginFieldSelector = 'input[name="data-inicio"]';
                const div = CommonsHelper.createSelectOptionsMonthYear({
                  dateBeginFieldId: dateBeginFieldSelector,
                  dateEndFieldId: 'input[name="data-termino"]',
                });
                div.firstElementChild.style.width = "initial"; // label
                div.style.marginRight = "1rem";
                node = document.querySelector(dateBeginFieldSelector)
                  .parentElement.parentElement;
                node.insertBefore(div, node.childNodes[2]);
                // END create field for month/year
              }
            })
            .catch((err) => {
              console.log(
                `_fixAnyPage: [eligible=${eligible}] ${JSON.stringify(err)}`
              );
            });
        }
      };

    /* Public Functions */

    return {
      is: _is,
      isLoaded: _isLoaded,
      fix: _fixAnyPage,
    };
  })();

  Presto.modules.SulAmerica = _Module;
})(Presto, location);
