(function(Presto, location) {

	'use strict';

    const {
        Analytics,
        Snackbar,
        FAB,

    } = Presto.modules;

	const _Page = function() {

        const
            // Inicio > Faturamento > Digitação > Consultar
            PATHNAME_REGEX = /faturamento\/visualizar\/filtrarPorData/;

        const
            __createCopyButton_onclick = function () {
                Analytics.sendEvent('clickButton', 'log', 'btnCopy');

                let tbodyTrList = document.querySelectorAll('#tblListaLoteFaturamento tbody tr');
                let barArr = [], bazArr = [];

                tbodyTrList.forEach(tr => {
                    const allowed = [2,3,4,5,6,7];
                    tr.querySelectorAll('td').forEach((td, index) => {
                        if (allowed.includes(index)) {
                            let value = td.textContent;
                            if (/\d+\.\d+/.test(value))
                                value = value.replace('.', ',');
                            barArr.push(value.trim());
                        }
                    });
                    let barArrJoined = barArr.join('\t');
                    bazArr.push(barArrJoined);
                    barArr = [];
                });

                let bazArrJoined = bazArr.join('\n');

                navigator.clipboard
                    .writeText(bazArrJoined)
                    .then(() => Snackbar.fire('Copiado!'));

            },
            _upgrade = () => {
                FAB.build([ {
                    textLabel: 'Copiar dados',
                    iconClass: 'lar la-copy',
                    click: __createCopyButton_onclick,
                } ]);
            },
            _init = () => {
                if (PATHNAME_REGEX.test(location.pathname))
                    _upgrade();
            };

		return {
            upgrade: _init,
		};
	}();

	Presto.pages.FaturamentoDigitarConsultarPage = _Page;

})(Presto, location);
