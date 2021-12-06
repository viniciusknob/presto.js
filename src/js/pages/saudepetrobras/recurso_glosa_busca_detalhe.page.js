(function(Presto, location) {

	'use strict';

    const {
        Analytics,
        Clipboard,
        Snackbar,
        FAB,

    } = Presto.modules;

	const _Page = function() {

        const
            // Inicio > Acompanhar recurso de glosa > Detalhe
            PATHNAME_REGEX = /recursoglosa\/buscaDetalheRecursoGlosa/;

        const
            __btnCopy_onclick = function () {
                Analytics.sendEvent('clickButton', 'log', 'btnCopy');

                let labelList = document.querySelectorAll('#body label');
                let barArr = [], bazArr = [];

                let stopLoop = false;

                labelList.forEach((label) => {
                    if (stopLoop)
                        return;

                    let labelText = label.textContent;
                    labelText = labelText ? labelText.replace(':', '').trim() : '';

                    let value = '';

                    if (/Motivo.+Glosa/.test(labelText)) {
                        let reasons = Array.from(label.parentElement.querySelectorAll('ul li'));
                        reasons = reasons.map(reason => reason.textContent.trim());
                        value = reasons.join(';');
                        stopLoop = true;

                    } else {
                        let spanElement = label.parentElement.querySelector('span');
                        value = spanElement ? spanElement.textContent : '';
                        value = value ? value.replace('R$', '').trim() : '';
                    }

                    barArr.push(value);
                });

                var boxMessageList = document.querySelectorAll('.box-resposta-mensagem');
                boxMessageList.forEach((box) => {
                    let message = box.querySelector('.span-13.jump-1.size-12.padrao').textContent;
                    message = message.replace(/\n*/g, '');
                    barArr.push(message);
                });

                let barArrJoined = barArr.join('\t');
                bazArr.push(barArrJoined);

                let bazArrJoined = bazArr.join('\n');

                Clipboard.write(bazArrJoined).then(() => Snackbar.fire('Copiado!'));

            },
            _upgrade = () => {
                FAB.build([ {
                    textLabel: 'Copiar dados',
                    iconClass: 'lar la-copy',
                    click: __btnCopy_onclick,
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

	Presto.pages.RecursoGlosaBuscaDetalhePage = _Page;

})(Presto, location);
