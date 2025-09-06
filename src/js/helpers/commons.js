(function (Presto, document, jQuery) {
  "use strict";

  const _Module = (function () {
    const createSelectOptionsMonthYear = (options) => {
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
      },
      selectOption = (selector, optionByText) => {
        const select = document.querySelector(selector);
        const target = Array.from(select.options).find((x) =>
          new RegExp(optionByText).test(x.textContent)
        );
        if (target) {
          target.selected = true;

          const event = new Event("change", { bubbles: true });
          select.dispatchEvent(event);
        }
      },
      selectFirstJQueryAutocomplete = (id, value) => {
        const el = jQuery(id);
        el.focus();
        el.val(value);
        el.autocomplete("search");

        const interval = setInterval(() => {
          const menu = el.autocomplete("widget");
          const firstItem = menu.find("li.ui-menu-item:first");

          if (firstItem?.length) {
            clearInterval(interval);
            firstItem.trigger("mouseenter").trigger("click");
          }
        }, 250);
      },
      getFirstWeekdayOfMonth = (year, month) => {
        const date = new Date(year, month, 1);

        // If Saturday (6), move to Monday (2 days ahead)
        // If Sunday (0), move to Monday (1 day ahead)
        if (date.getDay() === 6) {
          date.setDate(date.getDate() + 2);
        } else if (date.getDay() === 0) {
          date.setDate(date.getDate() + 1);
        }

        return date;
      };

    const Taskier = {
      toText: (selector, value) => ({
        type: "text",
        selector,
        value,
      }),
      toSelect: (selector, value) => ({
        type: "select",
        selector,
        value,
      }),
      toFunc: (fn) => ({
        type: "function",
        fn,
      }),
      mapToFunc: (tasks) =>
        tasks.map((task) => {
          if (task.type === "function") {
            return task.fn;
          } else {
            const { selector: sel, value: val } = task;
            if (task.type === "text") {
              return () => (document.querySelector(sel).value = val);
            }
            if (task.type === "select") {
              return () => selectOption(sel, val);
            }
          }
        }),
      exec: async (tasks, ms) => {
        const delay = () => new Promise((r) => setTimeout(r, ms));

        for (let i = 0; i < tasks.length; i++) {
          await Promise.resolve(tasks[i]()); // garante que pode ser sync ou async
          if (i < tasks.length - 1) {
            await delay(); // só espera entre as tasks
          }
        }
      },
    };

    return {
      createSelectOptionsMonthYear,
      selectOption,
      selectFirstJQueryAutocomplete,
      getFirstWeekdayOfMonth,
      Taskier,
    };
  })();

  /* Module Definition */

  Presto.modules.CommonsHelper = _Module;
})(window.Presto, window.document, window.jQuery);
