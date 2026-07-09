(function (Presto, location, jQuery) {
  "use strict";

  const { PatientModel } = Presto.models;
  const dbVersion = 2; // IndexedDB
  const { Snackbar, FAB, Modal, CommonsHelper, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

  const _Page = (function () {
    const PATHNAME_REGEX = /guia-de-sp-sadt-incluir/,
      MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR = "#presto-appointments-days",
      MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR =
        "#presto-appointments-month-year",
      MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR =
        "#presto-appointments-unit-value";

    const __buildTasksForDefaultData = async () => {
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
                  "",
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

        return Taskier.mapToFunc([
          Taskier.toText("#numero-guia-principal", "0"),
          Taskier.toText("#data-autorizacao", formatBRDate(new Date())),
          Taskier.toFunc(() => {
            const d = new Date();
            d.setDate(d.getDate() + 90);
            const sel = "#data-validade-senha";
            $(sel).value = formatBRDate(d);
          }),
          Taskier.toText(
            "#nome-profissional-solicitante",
            patient?.specialist?.name || "",
          ),
          Taskier.toSelect("#conselho-profissional", "CRP"),
          Taskier.toSelect("#uf-conselho-profissional", "RS"),
          Taskier.toText(
            "#numero-registro-conselho",
            patient?.specialist?.ncrp || "",
          ),
          Taskier.toFunc(() =>
            CommonsHelper.selectFirstJQueryAutocomplete("#cbo", "251510"),
          ),
          Taskier.toSelect("#carater-atendimento", "Eletivo"),
          Taskier.toText("#data-solicitacao", formatBRDate(new Date())),
          Taskier.toSelect("#flag-atendimento-rn", "Não"),
          Taskier.toText("#indicacao-clinica", "Tratamento Psicologico"),
          Taskier.toSelect("#indicador-acidente", "Não Acidente"),
          Taskier.toSelect("#tipo-consulta", "Retorno"),
          Taskier.toSelect("#regime-atendimento", "Ambulatorial"),
          Taskier.toFunc(() => {
            CommonsHelper.selectOption("#tipo-atendimento", "Outras Terapias");
            setTimeout(() => jQuery(".ui-dialog-content").dialog("close"), 500);
          }),
        ]);
      },
      /** Modal actions */

      __removeInitialAppointment = () => {
        const selector = ".bt-excluir-procedimento-realizado";
        $$(selector).forEach((e) => e.click());
      },
      _addAppointment = async (days, monthYear, unitValue) => {
        if (!days || days.length === 0) {
          return;
        }

        for (const day of days) {
          $("[name='per.data']").value = `${day}/${monthYear}`;
          $("[name='per.codigo-procedimento']").value = "50000470";
          $("[class='sasbt1 btn-busca-procedimento']").click();

          await new Promise((resolve) => setTimeout(resolve, 1000));

          $("[name='per.quantidade']").value = "1";
          $("[name='per.valor-unitario']").value = unitValue;

          $("#incluirPer").click();

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      },
      __fillFormModal_onclick = async () => {
        /**
         * Modal Validations
         */
        let _daysMonthBefore = $(
          MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR,
        ).value?.trim();
        let _daysCurrentMonth = $(
          MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR,
        ).value?.trim();

        if (!_daysMonthBefore && !_daysCurrentMonth) {
          Snackbar.fire("Informe os dias de pelo menos um dos meses!");
          return;
        }

        let _unitValue = $(MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR).value;
        if (!!!_unitValue) {
          Snackbar.fire(
            "Informe o valor unitário dos procedimentos no formato 12,34!",
          );
          return;
        }
        /**
         * end Modal Validations
         */

        // format last month/year to "MM/YYYY"
        const previousDate = new Date();
        previousDate.setMonth(previousDate.getMonth() - 1);
        const previousMonthYear = new Intl.DateTimeFormat("pt-BR", {
          month: "2-digit",
          year: "numeric",
        }).format(previousDate);

        // format current month/year to "MM/YYYY"
        const currentMonthYear = __buildMonthDate();

        const { Taskier } = CommonsHelper;

        const tasks = [
          ...(await __buildTasksForDefaultData()),
          ...Taskier.mapToFunc([
            Taskier.toFunc(__removeInitialAppointment),
            Taskier.toFunc(async () => {
              $("#formPer").scrollIntoView({
                behavior: "smooth",
                block: "start",
              });

              // process days of previous month (if informed)
              if (_daysMonthBefore) {
                const daysBefore = _daysMonthBefore
                  .split(",")
                  .map((day) => day.trim().padStart(2, "0"));

                await _addAppointment(
                  daysBefore,
                  previousMonthYear,
                  _unitValue,
                );
              }

              // process days of current month (if informed)
              if (_daysCurrentMonth) {
                const daysCurrent = _daysCurrentMonth
                  .split(",")
                  .map((day) => day.trim().padStart(2, "0"));

                await _addAppointment(
                  daysCurrent,
                  currentMonthYear,
                  _unitValue,
                );
              }

              Snackbar.fire(`Pronto!`);
            }),
          ]),
        ];

        Taskier.exec(tasks, 200); // _addAppointment take more time than exec, so the Snackbar is there!
      },
      __buildMonthDate = () => {
        const f = new Intl.DateTimeFormat("pt-BR", {
          month: "2-digit",
          year: "numeric",
        });
        return f.format(new Date());
      },
      __buildModalContent = () => {
        let content = document.createElement("div");

        // last month in format "MMM/YYYY" and in upper case, ex.: JUL/2024
        const previousDate = new Date();
        previousDate.setMonth(previousDate.getMonth() - 1);
        const previousMonthLabel = new Intl.DateTimeFormat("pt-BR", {
          month: "short",
          year: "numeric",
        })
          .format(previousDate)
          .replace(".", "")
          .toUpperCase();

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: `DIAS DO MÊS ANTERIOR (${previousMonthLabel})`,
            input: {
              id: MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR.substring(1),
            },
            helpText: "Ex.: 7,14,21,28",
          }),
        );

        // current month in format "MMM/YYYY" and in upper case, ex.: AGO/2024
        const currentDate = new Date();
        const currentMonthLabel = new Intl.DateTimeFormat("pt-BR", {
          month: "short",
          year: "numeric",
        })
          .format(currentDate)
          .replace(".", "")
          .toUpperCase();

        // deve referenciar o mês atual
        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: `DIAS DO MÊS ATUAL (${currentMonthLabel})`,
            input: {
              id: MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR.substring(1),
            },
            helpText: "Ex.: 7,14,21,28",
          }),
        );

        content.appendChild(
          Modal.helpers.buildFormGroup({
            textLabel: "VALOR UNITÁRIO",
            input: {
              id: MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR.substring(1),
              value: "64,53",
            },
            helpText: "Ex.: 64,53",
          }),
        );

        return content;
      },
      /** end Modal actions */

      __btnAdicionarProcedimentos_onclick = () => {
        Modal.open({
          title: "Adicionar Procedimentos",
          content: __buildModalContent(),
          mainAction: __fillFormModal_onclick,
        });
      },
      __buildPatientName = () => {
        const e = $(".box-padrao .box-padrao-int .tab .linha");
        const carteira = $("div span", e).textContent.replace(/\s/g, "");

        PatientModel.getOrCreateDB(dbVersion)
          .then(PatientModel.getAll)
          .then((patients) => {
            const ptt = patients.find((p) => p.id === carteira);

            const div = document.createElement("div");
            const strong = document.createElement("strong");
            strong.textContent = "(Presto.js) Nome do Beneficiário: ";
            const span = document.createElement("span");
            span.textContent = ptt.name;
            div.appendChild(strong);
            div.appendChild(span);
            e.appendChild(div);
          })
          .catch((e) => console.error(e));
      },
      applyFeatures = () => {
        if (!PATHNAME_REGEX.test(location.pathname)) return;

        Modal.init();

        __buildPatientName();

        FAB.build([
          {
            textLabel: "Preencher Guia",
            iconClass: "las la-calendar-plus",
            click: __btnAdicionarProcedimentos_onclick,
          },
        ]);
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.GuiaDeSPSADTIncluirPage = _Page;
})(window.Presto, window.location, window.jQuery);
