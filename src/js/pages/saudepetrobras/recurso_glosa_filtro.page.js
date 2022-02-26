(function(Presto, location) {

	'use strict';

    const {
        Analytics,
        Snackbar,
        FAB,
        Modal,

    } = Presto.modules;

	const _Page = function() {

        const
            // Inicio > Responder Recursos de Glosa
            PATHNAME_REGEX = /recursoglosa\/filtroNew/,

            MODAL_INPUT_PROTOCOLS_SELECTOR = '#presto-protocols';

        const
            __buildModalContent = () => {
                let content = document.createElement('div');

                content.appendChild(Modal.helpers.buildFormGroup({
                    textLabel: 'PROTOCOLOS',
                    inputId: MODAL_INPUT_PROTOCOLS_SELECTOR.substring(1),
                    helpText: 'Ex.: 147634317,147634318 ou 147634317 147634318',
                }));

                return content;
            },
            __mainAction_checkStatus_onclick = () => {
                Analytics.sendEvent('clickButton', 'log', 'checkStatus');

                /**
                   * Modal Validations
                   */
                let _protocols = document.querySelector(MODAL_INPUT_PROTOCOLS_SELECTOR).value;
                if (!!!_protocols) {
                    Snackbar.fire('Informe os protocolos de recurso de glosa!');
                    return;
                }
                let tasks = _protocols.split(/[,\s]/);
                /**
                 * end Modal Validations
                 */

                const fn = () => {
                    let query = tasks.shift();

                    document.querySelector('#acompanharSolicitacao_protocoloRecurso').value = query;
                    document.querySelector('#acompanharSolicitacao_btnBuscar').click();

                    const interval = setInterval(() => {
                        let tr = document.querySelector(`tr[id="${query}"]`);
                        if (tr) clearInterval(interval); else return;

                        let status = tr.querySelector(`td[aria-describedby*="statusRecurso"]`).textContent;
                        console.log(`${query}: ${status}`);

                        if (tasks.length) fn(); else Snackbar.fire('Pronto! Use F12 para ver os resultados.');
                    }, 250);
                };
              
                fn();
            },
            __menuItem_checkStatus_onclick = () => {
                Modal.open({
                    title: 'Verificar status',
                    content: __buildModalContent(),
                    mainAction: __mainAction_checkStatus_onclick,
                });
            },
            _upgrade = () => {
                Modal.init();
                FAB.build([
                    {
                        textLabel: 'Verificar status em massa',
                        iconClass: 'las la-search',
                        click: __menuItem_checkStatus_onclick,
                    },
                ]);
          },
          _init = () => {
              if (PATHNAME_REGEX.test(location.pathname))
                  _upgrade();
          };

  return {
          upgrade: _init,
  };
}();

Presto.pages.RecursoGlosaFiltroPage = _Page;

})(Presto, location);