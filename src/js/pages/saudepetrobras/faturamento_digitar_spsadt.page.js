(function (Presto, location, jQuery) {
  "use strict";

  const { PersonModel } = Presto.models;
  const { Snackbar, FAB, Modal, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

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
        let fakeTR = $("#trProcedimento0");
        if (fakeTR) {
          let tdArr = $$("td", fakeTR);
          if (tdArr.filter((td) => td.textContent === "-").length) {
            $("input", fakeTR).checked = true;
            const btap = $("#bt-addProcedimento");
            $(".bt-remover", btap.parentElement).click();
          }
        }
      },
      _addAppointment = (days, monthYear, daysLength, unitValue) => {
        let day = days.shift();

        $("#bt-addProcedimento").click(); // open modal

        $("#dataModalProcedimento").value = day + monthYear;
        const labelOIMP = $("#labelOrdemItemModalProcedimento");
        $("input", labelOIMP.parentElement).value = daysLength - days.length;
        $("#tipoTabelaModalProcedimento").value = 22;
        $("#codigoModalProcedimento").value = 50000470;
        $("#codigoModalProcedimento").onblur();

        let interval = setInterval(() => {
          let target = $("#descricaoModalProcedimento");
          if (target.value) {
            clearInterval(interval);

            $("#quantidadeModalProcedimento").value = 1;

            jQuery("#porcentagemRedAcrModalProcedimento").unmask();
            $("#porcentagemRedAcrModalProcedimento").value = "1.00";

            $("#valorUnitarioModalProcedimento").value = unitValue.replace(
              ",",
              "."
            );
            $("#valorUnitarioModalProcedimento").onblur();

            interval = setInterval(() => {
              target = $("#valorTotalModalProcedimento");
              if (target.value) {
                clearInterval(interval);

                setTimeout(() => {
                  $("#bt-operacaoModalProcedimento").click(); // close modal
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
        let _days = $(MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR).value;
        if (!!!_days) {
          Snackbar.fire("Informe os dias dos procedimentos!");
          return;
        }

        let _monthYear = $(MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR).value;
        if (!!!_monthYear) {
          Snackbar.fire("Informe o mês/ano dos procedimentos!");
          return;
        }

        let _unitValue = $(MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR).value;
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

        $("#procedimentosRealizados").parentElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

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
        const btnGravarAlteracoes = $("#gravarAlteracoes");
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
          person.uid = $("#txtNumeroCarteirinhaBeneficiario").value;
          person.name = $("#txtNomeBeneficiario").value;
          person.password = $("#senha").value;
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
        const eDueDatePwd = $("#txtDataValidadeSenha");
        let snacks = eDueDatePwd.value.split("/").map((num) => parseInt(num));
        snacks[1] += -1;
        let duoDatePwd = new Date(...snacks.reverse());
        if (duoDatePwd < new Date()) {
          eDueDatePwd.style.border = "red 2px solid";
          eDueDatePwd.style.color = "red";
          $("label", eDueDatePwd.parentElement).style.color = "red";
          throw new Error("Senha vencida!");
        }
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
          $("#senha").value = event.target.value;
        };

        let div = document.createElement("div");
        div.style.paddingBottom = "3em";
        div.style.textAlign = "center";
        div.appendChild(label);
        div.appendChild(select);

        const referenceNode = $(FORM_FIELDSET_SELECTOR);
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
      _btnPreencherDadosPadrao = () => {
        Array.from($("#txtTipoDocumentoContratado").options).find(
          (x) => x.textContent === "CPF"
        ).selected = true;
        $("#txtNomeProfissionalSolicitante").value =
          $("#txtNomeContratado").value;
        Array.from($("#txtUFProfissionalSolicitante").options).find(
          (x) => x.value === "RS"
        ).selected = true;
        Array.from($("#txtTipoConselhoProfissionalSolicitante").options).find(
          (x) => /CRP/.test(x.textContent)
        ).selected = true;
        $("#txtNumeroConselhoProfissionalSolicitante").value = "05014";
        Array.from($("#txtCBOSProfissionalSolicitante").options).find((x) =>
          /Psic.logo cl.nico/.test(x.textContent)
        ).selected = true;
        Array.from($("#txtCaraterInternacao").options).find((x) =>
          /Eletiva/.test(x.textContent)
        ).selected = true;
        $("#txtAreaIndicacaoClinica").value = "Sessões de Terapia";
        Array.from($("#txtTipoAtendimento").options).find((x) =>
          /Outras Terapias/.test(x.textContent)
        ).selected = true;
        Array.from($("#txtTipoConsulta").options).find((x) =>
          /Seguimento/.test(x.textContent)
        ).selected = true;
        Array.from($("#txtRegimeAtendimento").options).find((x) =>
          /Ambulatorial/.test(x.textContent)
        ).selected = true;
        Array.from($("#txtIndicacaoAcidente").options).find((x) =>
          /N.o Acidentes/.test(x.textContent)
        ).selected = true;
      },
      applyFeatures = () => {
        if (!PATHNAME_REGEX.test(location.pathname)) return;

        __avoidErrorInClientCode();
        Modal.init();
        __loadProfiles();

        FAB.build([
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

        const eSenha = $("#senha");
        let btnImport = $("a.bt-procurar", eSenha.parentElement);

        btnImport.addEventListener("click", () => {
          let interval = setInterval(() => {
            if ($("#txtDataValidadeSenha").value) {
              clearInterval(interval);

              setTimeout(() => {
                try {
                  $("#txtNumeroGuiaPrestador").value = new Date().getTime();
                  _validateDueDate();
                  _btnPreencherDadosPadrao();
                  _watchForm();
                } catch (e) {
                  Snackbar.fire(e.message);
                }
              }, 1000);
            }
          }, 200);
        });
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.FormularioDigitarSPSADTPage = _Page;
})(window.Presto, window.location, window.jQuery);
