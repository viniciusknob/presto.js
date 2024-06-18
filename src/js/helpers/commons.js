(function (Presto, document) {
  "use strict";

  const _Module = (function () {
    const _createSelectOptionsMonthYear = (options) => {
      let label = document.createElement("label");
      label.textContent = "Presto.js - Mês/Ano:";

      let select = document.createElement("select");

      let option = document.createElement("option");
      option.value = "";
      option.textContent = "Selecione...";
      select.appendChild(option);

      let currentYear = new Date().getFullYear();
      let currentMonth = new Date().getMonth();
      let monthsToGoBack = 24;

      for (let goBack = 0; goBack >= 0 - monthsToGoBack; goBack--) {
        let date = new Date(currentYear, currentMonth + goBack, 1);
        let monthStr = new Intl.DateTimeFormat("pt-BR", {
          month: "short",
        }).format(date);

        let option = document.createElement("option");
        option.value = `${date.getMonth()}/${date.getFullYear()}`;
        option.textContent = `${monthStr}/${date.getFullYear()}`;
        select.appendChild(option);
      }

      select.onchange = (event) => {
        let partialDate = event.target.value.split("/");
        let year = partialDate[1];
        let month = parseInt(partialDate[0]) + 1;
        let monthStr = `${month}`.padStart(2, "0");
        let endOfMonth = new Date(year, month, 0).getDate();

        if (
          parseInt(year) === currentYear &&
          parseInt(partialDate[0]) === currentMonth
        ) {
          endOfMonth = new Date().getDate();
        }

        document.querySelector(
          options.dateBeginFieldId
        ).value = `01/${monthStr}/${year}`;
        document.querySelector(
          options.dateEndFieldId
        ).value = `${endOfMonth}/${monthStr}/${year}`;
      };

      let div = document.createElement("div");
      div.appendChild(label);
      div.appendChild(select);

      return div;
    };

    return {
      createSelectOptionsMonthYear: _createSelectOptionsMonthYear,
    };
  })();

  /* Module Definition */

  Presto.modules.CommonsHelper = _Module;
})(window.Presto, window.document);
