(function (Presto, location) {
  "use strict";

  const { PatientModel } = Presto.models;
  const { CommonsHelper, DomHelper } = Presto.modules;
  const { $$ } = DomHelper;

  const _Page = (function () {
    const PATHNAME_REGEX = /prestador\/guiaexameexecucao/;

    const _sortGuidesByPatientName = () => {
        const fn = "_sortGuidesByPatientName";
        console.log(`${fn} - Enter`);
        try {
          const tbody = document.getElementById(
            "mainForm:resultadoPesquisaTable:tb"
          );
          const rows = $$("tr.rich-table-row", tbody);

          const selPatientName = "span[id$=nomePacientTooltip]";
          rows.sort((a, b) => {
            const aText = a.querySelector(selPatientName).textContent.trim();
            const bText = b.querySelector(selPatientName).textContent.trim();
            return aText.localeCompare(bText);
          });

          // Remove and re-append rows in sorted order
          rows.forEach((row) => tbody.appendChild(row));
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      _addSortAZButton = () => {
        const fn = "_addSortAZButton";
        console.log(`${fn} - Enter`);
        try {
          const div = document.createElement("div");
          div.id = "prestoSetup";
          div.style.float = "right";

          const anchor = document.createElement("a");
          anchor.textContent = "A→Z";
          anchor.href = "javascript:void(0)";
          anchor.onclick = _sortGuidesByPatientName;
          div.appendChild(anchor);

          const selector =
            'div[id="mainForm:panelConfigPesquisa"] div.configPesquisaItens';
          const setupBar = document.querySelector(selector);

          setupBar.appendChild(div);
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      __awaitOpeningModalToExecuteProcedure = (patient) => () => {
        const fn = "__awaitOpeningModalToExecuteProcedure";
        console.log(`${fn} - Enter`);
        try {
          // aguardar abrir o Painel, então clicar em "Executar procedimento"
          return new Promise((resolve) => {
            const painelSelector = "#panelResumoGuia";
            const carteiraSelector = '[id*="listaCarteiraConvenio"]';
            const execProcSelector = "span.resumoMenuItem a";
            const execProcText = "Executar procedimento";

            const interval = setInterval(() => {
              const eCarteira = document.querySelector(
                `${painelSelector} ${carteiraSelector}`
              );
              if (eCarteira) {
                clearInterval(interval);
                patient.id = eCarteira.textContent.replace(/\D/g, "");

                const eExecProcItems = $$(
                  `${painelSelector} ${execProcSelector}`
                );
                const execProc = Array.from(eExecProcItems).find(
                  (e) => e.textContent === execProcText
                );
                execProc.click();
                resolve();
              }
            }, 1000);
          });
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      __awaitLoadingSADTExecutionView = () => {
        const fn = "__awaitLoadingSADTExecutionView";
        console.log(`${fn} - Enter`);
        try {
          // aguardar carregar a tela de Execução de SADT
          return new Promise((resolve) => {
            const selector =
              'input[id="formAddUpdate:profissionalexecucaoExame"]';
            const interval = setInterval(() => {
              const eSpecialistInput = document.querySelector(selector);
              if (eSpecialistInput) {
                clearInterval(interval);
                resolve();
              }
            }, 500);
          });
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      __fillProfessionalField = (patient) => () => {
        const fn = "__fillProfessionalField";
        console.log(`${fn} - Enter`);
        try {
          // preencher o campo "Profissional Executante" com o nome do profissional vinculado ao paciente
          const selector =
            'input[id="formAddUpdate:profissionalexecucaoExame"]';
          const input = document.querySelector(selector);
          input.value = patient.professional;

          function dispatchEvent(el) {
            const event = new KeyboardEvent("keydown", {
              bubbles: true,
              cancelable: true,
              keyCode: 32,
              code: "Space",
              key: " ",
            });

            el.dispatchEvent(event);
          }
          dispatchEvent(input);

          // observar se este campo deixa de ser display: none para então...
          const selDivSuggestions =
            'div[id*="formAddUpdate"].rich-sb-common-container';
          const divSuggestions = document.querySelector(selDivSuggestions);

          return new Promise((resolve) => {
            const interval = setInterval(() => {
              if (divSuggestions.style.display !== "none") {
                clearInterval(interval);

                // ...selecionar o primeiro profissional
                const selSpanSuggestion =
                  'table.rich-sb-ext-decor-3 td[class*="rich-table-cell"] span';
                $$(selSpanSuggestion, divSuggestions)
                  .filter((x) => x.textContent == patient.professional)[0]
                  .click();

                resolve();
              }
            }, 1000);
          });
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      __awaitOpeningModalToAuthenticatePatient = () => {
        const fn = "__awaitOpeningModalToAuthenticatePatient";
        console.log(`${fn} - Enter`);
        try {
          // clicar no botão autenticar para abrir o modal e inserir a senha de autorização
          document.querySelector(".button-autenticar").click();

          return new Promise((resolve) => {
            // aguardar abrir o modal e inserir a senha
            const interval0 = setInterval(() => {
              const modal = document.querySelector(
                "#autenticarModalPanelVirtualCDiv"
              );
              if (modal?.offsetParent) {
                clearInterval(interval0);

                // acessar opção 'Atendimento PRESENCIAL'
                $$('input[type="radio"]', modal)[1].click();

                // somente resolve quando o input de senha estiver criado/aparecendo
                const interval1 = setInterval(() => {
                  const inputPwd = modal.querySelector(
                    'input[id*="senhaPacienteBiometria"]'
                  );
                  if (inputPwd?.offsetParent) {
                    clearInterval(interval1);
                    resolve();
                  }
                }, 250);
              }
            }, 250);
          });
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      __fillAuthentication = (patient) => async () => {
        const fn = "__fillAuthentication";
        console.log(`${fn} - Enter`);
        try {
          const selector = {
            modal: "#autenticarModalPanelVirtualCDiv",
            inputPwd: 'input[id*="senhaPacienteBiometria"]',
            btnAuth: 'input[id*="autenticarPacienteModalPanelButton"]',
            btnFinish: 'a[title="Finalizar execução"]',
          };

          const modal = document.querySelector(selector.modal);
          const authBtn = modal.querySelector(selector.btnAuth);
          const triggerUpsertItem = async (e) => {
            await PatientModel.getOrCreateDB().then((db) => {
              patient.password = modal.querySelector(selector.inputPwd).value;
              return PatientModel.addOrUpdateItem(db, patient);
            });
          };
          authBtn.addEventListener("click", triggerUpsertItem);

          await PatientModel.getOrCreateDB()
            .then(PatientModel.getAll)
            .then((patients) => patients.find((p) => p.id === patient.id))
            .then((patientDB) => {
              if (patientDB) {
                modal.querySelector(selector.inputPwd).value =
                  patientDB.password;
                modal.querySelector(selector.btnAuth).click();

                // espere a autenticação finalizar
                return new Promise((resolve) => {
                  const interval = setInterval(() => {
                    if (!modal.offsetParent) {
                      clearInterval(interval);
                      setTimeout(() => {
                        document.querySelector(selector.btnFinish).click();
                        resolve();
                      }, 1000);
                    }
                  }, 1000);
                });
              } else {
                console.log(
                  `${fn} - No patient found in DB ${JSON.stringify(patient)}`
                );
              }
            });
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      _patientOnClick = async (patient) => {
        const fn = "_patientOnClick";
        console.log(`${fn} - Enter`);
        try {
          const { Taskier } = CommonsHelper;

          const tasks = Taskier.mapToFunc([
            Taskier.toFunc(__awaitOpeningModalToExecuteProcedure(patient)),
            Taskier.toFunc(__awaitLoadingSADTExecutionView),
            Taskier.toFunc(__fillProfessionalField(patient)),
            Taskier.toFunc(__awaitOpeningModalToAuthenticatePatient),
            Taskier.toFunc(__fillAuthentication(patient)),
          ]);
          await Taskier.exec(tasks, 1000);
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      _configureAddAutomaticAppointment = () => {
        const fn = "_configureAddAutomaticAppointment";
        console.log(`${fn} - Enter`);
        try {
          const selector = {
            patient: 'span[id$="nomePacientTooltip"]',
            closestTD: 'td[id^="mainForm:resultadoPesquisaTable"]',
            grid: 'span[id="mainForm:panelResultadoPesquisaGrid"]',
          };

          const buildPatient = (span) => {
            const table = span.closest("table");
            const professionalEl = table
              ? table.querySelector('[title="Médico"]')
              : null;
            return {
              name: (span.textContent || "").trim(),
              professional: professionalEl
                ? professionalEl.textContent.trim()
                : "",
            };
          };

          const triggerPatientOnClick = (e) => {
            const td = e.target.closest(selector.closestTD);
            if (!td) return;

            const span = td.querySelector(selector.patient);
            const patient = buildPatient(span);
            _patientOnClick(patient);
          };

          const gridSpan = document.querySelector(selector.grid);
          if (!gridSpan._hasTriggerPatientOnClick) {
            gridSpan.addEventListener("click", triggerPatientOnClick);
            gridSpan._hasTriggerPatientOnClick = true;
          }
        } finally {
          console.log(`${fn} - Exit`);
        }
      },
      _upgrade = () => {
        setInterval(() => {
          const tbody = document.getElementById(
            "mainForm:resultadoPesquisaTable:tb"
          );
          if (tbody?.textContent) {
            const ePrestoSetup = document.querySelector("#prestoSetup");
            if (!ePrestoSetup) {
              _addSortAZButton();
              _configureAddAutomaticAppointment();
            }
          }
        }, 1000);
      },
      _init = () => {
        if (PATHNAME_REGEX.test(location.pathname)) _upgrade();
      };

    return {
      upgrade: _init,
    };
  })();

  Presto.pages.ExecucaoGuiaSADTPage = _Page;
})(Presto, location);
