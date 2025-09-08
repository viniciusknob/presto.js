(function (Presto, location, jQuery) {
  "use strict";

  const { PatientModel } = Presto.models;
  const { FAB, Modal, DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;

  const _Page = (function () {
    const // Guias > Guia de SP/SADT
      PATHNAME_REGEX = /GuiasTISS\/GuiaSPSADT\/ViewGuiaSPSADT/,
      PROFILES_SELECT_OPTION_ID = "presto-profiles-select",
      PROFILES_BULK_INSERT_APPOINTMENTS_ID =
        "presto-profiles-bulk-insert-appointments";

    const __selectFirstItemInAutocompleteMenu = (id, callback) => {
        const interval = setInterval(() => {
          const autocompleteMenu = jQuery(id).autocomplete("widget");
          const firstItem = autocompleteMenu.find("li.ui-menu-item:first");

          if (firstItem?.length) {
            clearInterval(interval);
            firstItem.trigger("mouseenter").trigger("click");

            if (callback) setTimeout(callback, 1000);
          }
        }, 500);
      },
      __populateFormWithProfessional_onChange = (data) => {
        const id = "#idContratadoSolicitante";
        jQuery(id).val(data.spc.id);
        jQuery(id).autocomplete("search");

        __selectFirstItemInAutocompleteMenu(id, () => {
          $("#ui-accordion-accordion-header-2").click();
          setTimeout(() => {
            $("#incluirProcedimento").click();
            const interval = setInterval(() => {
              // elemento utilizado para verificação apenas, quando ele estiver
              // pronto terá um valor retornado por textContent
              const elem = $("#registroProcedimentoID");
              if (elem.textContent) {
                clearInterval(interval);
                $("#btnGravar").click();
              }
            }, 250);
          }, 500);
        });
      },
      __populateForm_onChange = (personArr) => (event) => {
        const data = personArr.find((x) => event.target.value === x.id);

        const id = "#numeroDaCarteira";
        jQuery(id).val(data.id);
        jQuery(id).autocomplete("search");

        __selectFirstItemInAutocompleteMenu(id, () => {
          __populateFormWithProfessional_onChange(data);
        });
      },
      __buildComponentForLoadedProfiles = (personArr) => {
        const spanElementTitle = document.createElement("span");
        spanElementTitle.classList.add("elementTitle");
        spanElementTitle.textContent = "Presto.js - Lista de Pacientes:";

        const select = document.createElement("select");
        select.id = PROFILES_SELECT_OPTION_ID;
        select.classList.add("elementInput");
        select.style.width = "300px";

        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Selecione...";
        select.appendChild(option);

        personArr.forEach((item) => {
          const opt = document.createElement("option");
          opt.value = item.id;
          opt.textContent = item.name;
          select.appendChild(opt);
        });

        select.onchange = __populateForm_onChange(personArr);

        const divInner = document.createElement("div");
        divInner.classList.add("innerDivOfNormalElementItem");
        divInner.style.width = "312px";
        divInner.style.height = "46px";
        divInner.appendChild(spanElementTitle);
        divInner.appendChild(select);

        const divElemItem = document.createElement("div");
        divElemItem.classList.add("elementItem");
        divElemItem.style.width = "316px";
        divElemItem.append(divInner);

        const divLine = document.createElement("div");
        divLine.classList.add("lineOfElements");
        divLine.style.marginBottom = "2em";
        divLine.append(divElemItem);

        const referenceNode = $("#guiaDadosPrincipais");
        referenceNode.insertBefore(divLine, referenceNode.firstChild);
      },
      __buildModalForBulkInsert = (profiles) => {
        let content = document.createElement("div");
        content.id = PROFILES_BULK_INSERT_APPOINTMENTS_ID;

        profiles.forEach((p) =>
          content.appendChild(
            Modal.helpers.buildFormCheck({
              textLabel: p.name,
              input: {
                id: p.id,
                value: p.id,
              },
            })
          )
        );

        return content;
      },
      __getAccount = () => {
        const data = $("footer p")
          .textContent.split("\n")
          .map((x) => x.trim())
          .filter((x) => x);

        return {
          id: data[0].replace(/\D/g, ""),
          name: data[1],
        };
      },
      __loadProfiles = () => {
        return PatientModel.getOrCreateDB()
          .then(PatientModel.getAll)
          .then((arr) => {
            if (arr && arr.length) {
              const account = __getAccount();
              return arr.filter((x) => x.acc.id === account.id);
            }
            return [];
          })
          .catch((err) => {
            console.error("__loadProfiles", err);
          });
      },
      __handleBtnGravar = () => {
        const btn = $("#btnGravar");
        const _onclick = btn.onclick;
        btn.onclick = () => {
          const account = __getAccount();
          const patient = {
            id: $("#numeroDaCarteira").value,
            name: $("#nomeDoBeneficiario").value,
            // specialist
            spc: {
              id: $("#idContratadoSolicitante").value,
              name: $("#nomeContratadoSolicitante").value,
            },
            acc: {
              id: account.id,
              name: account.name,
            },
          };
          PatientModel.getOrCreateDB()
            .then((db) => PatientModel.addOrUpdateItem(db, patient))
            .then(() => {
              if (_onclick) _onclick();

              // Feche automaticamente o modal que apresenta a senha
              const interval = setInterval(() => {
                const bArr = $$("b");
                const b = bArr?.find((b) =>
                  b.textContent.includes("Nº Guia Operadora")
                );
                const uiDialog = b?.closest(".ui-dialog");
                const btnFechar = $("#fechar", uiDialog);
                if (btnFechar?.offsetParent) {
                  clearInterval(interval);
                  setTimeout(() => btnFechar.click(), 1000);
                }
              }, 250);
            })
            .catch((err) => {
              console.log(`__handleBtnGravar: ${JSON.stringify(err)}`);
            });
        };
      },
      /**
       * preencher a data de atendimento para o dia atual
       */
      __handleInputDataSolicitacao = () => {
        $("#dataSolicitacao").value = new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date());
      },
      __handleBtnIncluirProcedimento = () => {
        const elem = $("#incluirProcedimento");
        const elem_onclick = elem.onclick;
        elem.onclick = () => {
          elem_onclick();

          const selector = "#registroProcedimentoCodigo input";
          jQuery(selector).val("20104219"); // SESSAO DE PSICOTERAPIA INDIVIDUAL [Tabela: 13]
          jQuery(selector).autocomplete("search");

          __selectFirstItemInAutocompleteMenu(selector, () => {
            $("#confirmarEdicaoDeProcedimento").click();
          });
        };
      },
      __executeBulkInsertAppointments = () => {
        const item = localStorage.getItem(PROFILES_BULK_INSERT_APPOINTMENTS_ID);
        if (item) {
          const profiles = item.split(`,`);
          const target = profiles.shift();

          // select person and click to trigger automation
          const select = $(`#${PROFILES_SELECT_OPTION_ID}`);
          select.value = target;
          select.dispatchEvent(new Event("change", { bubbles: true }));

          if (profiles.length) {
            localStorage.setItem(
              PROFILES_BULK_INSERT_APPOINTMENTS_ID,
              profiles.join(`,`)
            );
          } else {
            localStorage.removeItem(PROFILES_BULK_INSERT_APPOINTMENTS_ID);
          }
        }
      },
      __fillForm_AdicionarProcedimentosEmLote_onclick = () => {
        const modal = $(`#${PROFILES_BULK_INSERT_APPOINTMENTS_ID}`);
        localStorage.setItem(
          PROFILES_BULK_INSERT_APPOINTMENTS_ID,
          $$(`input[type="checkbox"]:checked`, modal)
            .map((x) => x.value)
            .join(`,`)
        );

        __executeBulkInsertAppointments();
      },
      __btnAdicionarProcedimentosEmLote_onclick = (profiles) => () => {
        Modal.open({
          title: "Adicionar Procedimentos em Lote",
          content: __buildModalForBulkInsert(profiles),
          mainAction: __fillForm_AdicionarProcedimentosEmLote_onclick,
        });
      },
      __initialConfig = () => {
        __handleInputDataSolicitacao();

        // preencher tipo atendimento como TERAPIA
        $("#tipoAtendimento").value = "3";

        __handleBtnIncluirProcedimento();
        __handleBtnGravar();
      },
      _applyFeatures = async () => {
        Modal.init();

        const profiles = await __loadProfiles();
        __buildComponentForLoadedProfiles(profiles);

        __initialConfig();

        FAB.build([
          {
            textLabel: "Adicionar Procedimentos em Lote",
            iconClass: "las la-calendar-plus",
            click: __btnAdicionarProcedimentosEmLote_onclick(profiles),
          },
        ]);

        __executeBulkInsertAppointments();
      },
      applyFeatures = () => {
        if (PATHNAME_REGEX.test(location.pathname)) {
          const interval = setInterval(() => {
            const btn = $("#btnGravar");
            if (btn) {
              clearInterval(interval);
              _applyFeatures();
            }
          }, 250);
        }
      };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.ViewGuiaSPSADTPage = _Page;
})(window.Presto, window.location, window.jQuery);
