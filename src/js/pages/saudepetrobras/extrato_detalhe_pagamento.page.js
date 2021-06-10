(function(Presto, location) {

	'use strict';

    const {
        Analytics,
        Snackbar,
        FAB,

    } = Presto.modules;

	const _Page = function() {

        const
            // Inicio > Extrato > Visualizar > Detalhe do Pagamento
            PATHNAME_REGEX = /extrato\/detalhePagamento/;

        const
            __createCopyButton_extratoDetalhePgto_onclick = function () {
                Analytics.sendEvent('clickButton', 'log', 'btnCopy');

                let labelList = document.querySelectorAll('#dados-solicitacao label');
                let barArr = [], bazArr = [];

                labelList.forEach((label) => {
                    let value = label.parentElement.querySelector('span').textContent.replace('R$', '').trim();
                    barArr.push(value);
                });

                let barArrJoined = barArr.join('\t');
                bazArr.push(barArrJoined);

                let bazArrJoined = bazArr.join('\n');

                navigator.clipboard
                    .writeText(bazArrJoined)
                    .then(() => Snackbar.fire('Copiado!'));

            },
            _upgrade = () => {
                FAB.build([ {
                    textLabel: 'Copiar dados',
                    iconClass: 'lar la-copy',
                    click: __createCopyButton_extratoDetalhePgto_onclick,
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

	Presto.pages.ExtratoDetalhePagamentoPage = _Page;

})(Presto, location);
