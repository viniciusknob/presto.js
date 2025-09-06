(function (Presto, location) {
  "use strict";

  const { PersonModel } = Presto.models;
  const { Snackbar, FAB, Modal, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const // Inicio > Faturamento > Digitação > Digitar > Serviço Profissional/Serviço Auxiliar de Diagnóstico e Terapia - SP/SADT
      PATHNAME_REGEX = /faturamento\/digitar\/spsadt/,
      FORM_FIELDSET_SELECTOR = "#formularioDigitacaoSPSADT fieldset div",
      MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR = "#presto-appointments-days",
      MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR =
        "#presto-appointments-month-year",
      MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR =
        "#presto-appointments-unit-value";

    const __avoidErrorInClientCode = () => {
        const brokenFn = window.removerItemDigitacao;
        window.removerItemDigitacao = (...args) => {
          try {
            brokenFn(...args);
          } catch (e) {
            /**
             * Uncaught TypeError: Cannot read properties of null (reading 'length')
             *   at removerItemDigitacao (tratamentosModalDigitacao.js:1126:31)
             *   at HTMLAnchorElement.onclick (spsadt.htm:2449:195)
             *   at __removeInitialAppointment (<anonymous>:1141:38)
             *   at HTMLButtonElement.__fillForm_faturamentoDigitarSPSADT_onclick (<anonymous>:1221:17)
             */
          }
        };
      },
      /** Modal actions */
      __removeInitialAppointment = () => {
        let fakeTR = document.querySelector("#trProcedimento0");
        if (fakeTR) {
          let tdArr = $$("td", fakeTR);
          if (tdArr.filter((td) => td.textContent === "-").length) {
            fakeTR.querySelector("input").checked = true;
            document
              .querySelector("#bt-addProcedimento")
              .parentElement.querySelector(".bt-remover")
              .click();
          }
        }
      },
      _addAppointment = (days, monthYear, daysLength, unitValue) => {
        let day = days.shift();

        document.querySelector("#bt-addProcedimento").click(); // open modal

        document.querySelector("#dataModalProcedimento").value =
          day + monthYear;
        document
          .querySelector("#labelOrdemItemModalProcedimento")
          .parentElement.querySelector("input").value =
          daysLength - days.length;
        document.querySelector("#tipoTabelaModalProcedimento").value = 22;
        document.querySelector("#codigoModalProcedimento").value = 50000470;
        document.querySelector("#codigoModalProcedimento").onblur();

        let interval = setInterval(() => {
          let target = document.querySelector("#descricaoModalProcedimento");
          if (target.value) {
            clearInterval(interval);

            document.querySelector("#quantidadeModalProcedimento").value = 1;

            jQuery("#porcentagemRedAcrModalProcedimento").unmask();
            document.querySelector(
              "#porcentagemRedAcrModalProcedimento"
            ).value = "1.00";

            document.querySelector("#valorUnitarioModalProcedimento").value =
              unitValue.replace(",", ".");
            document.querySelector("#valorUnitarioModalProcedimento").onblur();

            interval = setInterval(() => {
              target = document.querySelector("#valorTotalModalProcedimento");
              if (target.value) {
                clearInterval(interval);

                setTimeout(() => {
                  document
                    .querySelector("#bt-operacaoModalProcedimento")
                    .click(); // close modal
                  if (days.length) {
                    setTimeout(
                      () =>
                        _addAppointment(days, monthYear, daysLength, unitValue),
                      1000
                    );
                  } else {
                    Snackbar.fire("Pronto!");
                  }
                }, 1000);
              }
            }, 250);
          }
        }, 250);
      },
      __fillForm_faturamentoDigitarSPSADT_onclick = () => {
        /**
         * Modal Validations
         */
        let _days = document.querySelector(
          MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR
        ).value;
        if (!!!_days) {
          Snackbar.fire("Informe os dias dos procedimentos!");
          return;
        }

        let _monthYear = document.querySelector(
          MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR
        ).value;
        if (!!!_monthYear) {
          Snackbar.fire("Informe o mês/ano dos procedimentos!");
          return;
        }

        let _unitValue = document.querySelector(
          MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR
        ).value;
        if (!!!_unitValue) {
          Snackbar.fire(
            "Informe o valor unitário dos procedimentos no formato 12,34!"
          );
          return;
        }
        /**
         * end Modal Validations
         */

        _days = _days.split(",").map((day) => day.padStart(2, "0"));
        _monthYear = `/${_monthYear}`;
        const _daysLength = _days.length;

        __removeInitialAppointment();
        _addAppointment(_days, _monthYear, _daysLength, _unitValue);
      },
      __buildPrevMonthDate = () => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const f = new Intl.DateTimeFormat("pt-BR", {
          month: "2-digit",
          year: "numeric",
        });
        return f.format(d);
      },
      __buildModalContent = () => {
        let content = document.createElement("div");

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "DIAS",
            input: {
              id: MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR.substring(1),
            },
            helpText: "Ex.: 7,14,21,28",
          })
        );

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "MÊS/ANO",
            input: {
              id: MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR.substring(1),
              value: __buildPrevMonthDate(),
            },
            helpText: "Ex.: 06/2021",
          })
        );

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "VALOR UNITÁRIO",
            input: {
              id: MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR.substring(1),
              value: "58,37",
            },
            helpText: "Ex.: 58,37",
          })
        );

        return content;
      },
      /** end Modal actions */

      _handleBtnGravarAlteracoes = (person) => {
        const btnGravarAlteracoes = document.querySelector("#gravarAlteracoes");
        const _onclick = btnGravarAlteracoes.onclick;
        btnGravarAlteracoes.onclick = () => {
          PersonModel.getOrCreateDB()
            .then((db) => PersonModel.addOrUpdateItem(db, person))
            .then(() => {
              if (_onclick) _onclick();
            })
            .catch((err) => {
              console.log(`_watchForm: ${JSON.stringify(err)}`);
            });
        };
      },
      _watchForm = function () {
        let person = {
          uid: "", // carteirinha
          name: "",
          password: "",
          props: [],
        };

        setTimeout(() => {
          person.uid = document.querySelector(
            "#txtNumeroCarteirinhaBeneficiario"
          ).value;
          person.name = document.querySelector("#txtNomeBeneficiario").value;
          person.password = document.querySelector("#senha").value;
        }, 500);

        let idIgnoredArr = [
          "dataModalProcedimento",
          "ordemItemModalProcedimento",
        ];

        $$("input[type=text],select,textarea")
          .filter((item) => idIgnoredArr.includes(item.id) === false)
          .map((item) => {
            let _onchange = item.onchange;
            item.onchange = (event) => {
              let change = person.props.find(
                (item) => item.id === event.target.id
              );
              if (!!!change) {
                person.props.push({
                  id: event.target.id,
                  value: event.target.value,
                });
              } else {
                if (event.target.value) change.value = event.target.value;
                else
                  person.props = person.props.filter(
                    (item) => item.id !== event.target.id
                  );
              }
              // console.table(person.props);

              if (_onchange) _onchange();
            };
          });

        _handleBtnGravarAlteracoes(person);
      },
      _validateDueDate = () => {
        return new Promise((resolve, reject) => {
          let interval = setInterval(() => {
            const eDueDatePwd = document.querySelector("#txtDataValidadeSenha");
            if (!!!eDueDatePwd.value) return;

            clearInterval(interval);

            // password validate: duo date
            let snacks = eDueDatePwd.value
              .split("/")
              .map((num) => parseInt(num));
            snacks[1] += -1;
            let duoDatePwd = new Date(...snacks.reverse());
            if (duoDatePwd < new Date()) {
              eDueDatePwd.style.border = "red 2px solid";
              eDueDatePwd.style.color = "red";
              eDueDatePwd.parentElement.querySelector("label").style.color =
                "red";
              reject("Senha vencida!");
            } else resolve();
          }, 500);
        });
      },
      __buildComponentForLoadedProfiles = (personArr) => {
        let label = document.createElement("label");
        label.textContent = "Presto.js - Lista de Pacientes:";
        label.style.marginRight = "1em";

        let select = document.createElement("select");

        let option = document.createElement("option");
        option.value = "";
        option.textContent = "Selecione...";
        select.appendChild(option);

        personArr.forEach((item) => {
          let option = document.createElement("option");
          option.value = item.password;
          option.textContent = `${item.name} - ${item.uid}`;
          select.appendChild(option);
        });

        select.onchange = (event) => {
          document.querySelector("#senha").value = event.target.value;
        };

        let div = document.createElement("div");
        div.style.paddingBottom = "3em";
        div.style.textAlign = "center";
        div.appendChild(label);
        div.appendChild(select);

        const referenceNode = document.querySelector(FORM_FIELDSET_SELECTOR);
        referenceNode.insertBefore(div, referenceNode.firstChild);
      },
      __loadProfiles = () => {
        PersonModel.getOrCreateDB()
          .then(PersonModel.getAll)
          .then((personArr) => {
            if (personArr && personArr.length) {
              __buildComponentForLoadedProfiles(personArr);
            }
          })
          .catch((err) => {
            console.log(`__loadProfiles :: ${JSON.stringify(err)}`);
          });
      },
      __btnAdicionarProcedimentos_onclick = () => {
        Modal.open({
          title: "Adicionar Procedimentos",
          content: __buildModalContent(),
          mainAction: __fillForm_faturamentoDigitarSPSADT_onclick,
        });
      },
      __btnPreencherDadosPadrao_onclick = () => {
        Array.from(
          document.querySelector("#txtTipoDocumentoContratado").options
        ).find((x) => x.textContent === "CPF").selected = true;
        document.querySelector("#txtNomeProfissionalSolicitante").value =
          document.querySelector("#txtNomeContratado").value;
        Array.from(
          document.querySelector("#txtUFProfissionalSolicitante").options
        ).find((x) => x.value === "RS").selected = true;
        Array.from(
          document.querySelector("#txtTipoConselhoProfissionalSolicitante")
            .options
        ).find((x) => /CRP/.test(x.textContent)).selected = true;
        document.querySelector(
          "#txtNumeroConselhoProfissionalSolicitante"
        ).value = "05014";
        Array.from(
          document.querySelector("#txtCBOSProfissionalSolicitante").options
        ).find((x) => /Psic.logo cl.nico/.test(x.textContent)).selected = true;
        Array.from(
          document.querySelector("#txtCaraterInternacao").options
        ).find((x) => /Eletiva/.test(x.textContent)).selected = true;
        document.querySelector("#txtAreaIndicacaoClinica").value =
          "Sessões de Terapia";
        Array.from(document.querySelector("#txtTipoAtendimento").options).find(
          (x) => /Outras Terapias/.test(x.textContent)
        ).selected = true;
        Array.from(document.querySelector("#txtTipoConsulta").options).find(
          (x) => /Seguimento/.test(x.textContent)
        ).selected = true;
        Array.from(
          document.querySelector("#txtRegimeAtendimento").options
        ).find((x) => /Ambulatorial/.test(x.textContent)).selected = true;
        Array.from(
          document.querySelector("#txtIndicacaoAcidente").options
        ).find((x) => /N.o Acidentes/.test(x.textContent)).selected = true;
      },
      _upgrade = () => {
        __avoidErrorInClientCode();
        Modal.init();
        __loadProfiles();

        FAB.build([
          {
            textLabel: "Preencher dados padrão",
            iconClass: "las la-wrench",
            click: __btnPreencherDadosPadrao_onclick,
          },
          {
            textLabel: "Adicionar Procedimentos",
            iconClass: "las la-calendar-plus",
            click: __btnAdicionarProcedimentos_onclick,
          },
          {
            textLabel: "IndexedDB: Criar relatório",
            iconClass: "las la-external-link-alt",
            click: PersonModel.createReport,
          },
        ]);

        let btnImport = document
          .querySelector("#senha")
          .parentElement.querySelector("a.bt-procurar");
        let btnImport_onclick = btnImport.onclick;
        btnImport.onclick = () => {
          btnImport_onclick();
          _validateDueDate()
            .then(() => {
              document.querySelector("#txtNumeroGuiaPrestador").value =
                new Date().getTime();
              _watchForm();
            })
            .catch(Snackbar.fire);
        };
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.FormularioDigitarSPSADTPage = _Page;
})(Presto, location);
