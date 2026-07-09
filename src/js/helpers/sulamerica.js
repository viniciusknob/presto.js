(function (Presto) {
  "use strict";

  const { PatientModel } = Presto.models;
  const { CommonsHelper, DomHelper } = Presto.modules;
  const { $ } = DomHelper;

  const _Module = (function () {
    const getPatients = (dbVersion = 2) =>
      PatientModel.getOrCreateDB(dbVersion).then(PatientModel.getAll);

    const buildInsuredComboBox = (insuredList = []) => {
      if (insuredList.length === 0) return null;

      const select = document.createElement("SELECT");
      select.style.cssText = "vertical-align: middle;";

      const defaultOption = document.createElement("OPTION");
      defaultOption.value = "";
      defaultOption.textContent = "ESCOLHA O BENEFICIÁRIO...";
      select.appendChild(defaultOption);

      select.onchange = () => {
        const option = $(":checked", select);
        if (!option?.value) return;

        ["1", "2", "3", "4", "5"].forEach((suffix, index) => {
          const size = [3, 5, 4, 4, 4][index];
          const start = [0, 3, 8, 12, 16][index];
          const input = $(`#codigo-beneficiario-${suffix}`);
          if (input) {
            input.value = option.value.substr(start, size);
          }
        });
      };

      insuredList.forEach((insured) => {
        const option = document.createElement("OPTION");
        option.value = insured.id;
        option.textContent = insured.name;
        select.appendChild(option);
      });

      return select;
    };

    const createMonthYearFilter = ({
      dateBeginFieldSelector,
      dateEndFieldSelector,
      insertAt,
      setLabelWidthInitial = false,
      setDisplayBlock = false,
      marginRight,
    }) => {
      const dateBeginField = $(dateBeginFieldSelector);
      if (!dateBeginField) return null;

      const div = CommonsHelper.createSelectOptionsMonthYear({
        dateBeginFieldId: dateBeginFieldSelector,
        dateEndFieldId: dateEndFieldSelector,
      });

      if (setLabelWidthInitial && div.firstElementChild) {
        div.firstElementChild.style.width = "initial";
      }

      if (setDisplayBlock) {
        div.style.display = "block";
      }

      if (marginRight) {
        div.style.marginRight = marginRight;
      }

      const node = dateBeginField.parentElement.parentElement;
      node.insertBefore(div, node.childNodes[insertAt]);
      return div;
    };

    return {
      getPatients,
      buildInsuredComboBox,
      createMonthYearFilter,
    };
  })();

  Presto.modules.SulAmericaHelper = _Module;
})(Presto);
