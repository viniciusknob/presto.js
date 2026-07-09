(function (Presto, location) {
  "use strict";

  const { PatientModel } = Presto.models;
  const { DomHelper } = Presto.modules;
  const { $, $$ } = DomHelper;
  const dbVersion = 2;

  const _Page = (function () {
    const PATHNAME_REGEX =
      /validacao-de-elegibilidade\/elegibilidade-resultado/;

    const _buildPatientFromScreen = () => {
      const patient = {
        id: "",
        name: "",
      };

      $$(".linha").forEach((line) => {
        const strongList = $$("strong", line);
        strongList.forEach((strong) => {
          if (!strong) return;

          const strongText = strong.textContent;
          if (/Carteira/.test(strongText)) {
            const idValue = $("span", strong.parentElement)?.textContent || "";
            patient.id = idValue.replace(/\s/g, "");
          }

          if (/Nome/.test(strongText)) {
            patient.name = $("span", strong.parentElement)?.textContent || "";
          }
        });
      });

      return patient;
    };

    const applyFeatures = async () => {
      if (!PATHNAME_REGEX.test(location.pathname)) return;

      const eligibleBox = $(".box-indicador-elegibilidade .linha");
      if (!eligibleBox) return;

      const eligible = $(".atencao", eligibleBox)?.textContent;
      if (!eligible) return;

      let patient = _buildPatientFromScreen();

      if (patient.id) {
        const storedPatient = await PatientModel.getOrCreateDB(dbVersion)
          .then(PatientModel.getAll)
          .then((patients) => patients.find((x) => x.id === patient.id));

        patient = storedPatient || patient;
      }

      if (eligible !== "SIM") return;

      const divStatus = document.createElement("DIV");
      divStatus.id = "js-presto-status";
      divStatus.style = "float:right;font-weight:bold;color:limegreen;";
      divStatus.textContent = "Salvando...";
      eligibleBox.appendChild(divStatus);

      PatientModel.getOrCreateDB(dbVersion)
        .then((db) => PatientModel.addOrUpdateItem(db, patient))
        .then(() => {
          const status = $("#js-presto-status", eligibleBox);
          if (status) {
            status.textContent = "Salvo!";
          }
        })
        .catch((err) => {
          console.log(
            `ElegibilidadeResultadoPage.applyFeatures: [eligible=${eligible}] ${JSON.stringify(err)}`,
          );
        });
    };

    return {
      applyFeatures,
    };
  })();

  Presto.pages.ElegibilidadeResultadoPage = _Page;
})(Presto, location);
