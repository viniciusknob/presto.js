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
            _btnCopy_ignoreFields = [
                'Contrato',
                'Prestador',
                'Área',
                'Código Procedimento',
                'Quantidade',
                'Procedimento',
            ];

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
                        if (_btnCopy_ignoreFields.some(item => item == labelText) === false) {
                            let spanElement = label.parentElement.querySelector('span');
                            value = spanElement ? spanElement.textContent : '';
                            value = value ? value.replace('R$', '').trim() : '';
                        }
                        else {
                            return;
                        }
                    }

                    barArr.push(value);
                });

                bazArr.push(barArr.join('\t'));

                Clipboard.write(bazArr.join('\n')).then(() => Snackbar.fire('Copiado!'));

            },
            __btnCopyMessages_onclick = function () {
                Analytics.sendEvent('clickButton', 'log', 'btnCopyMessages');

                let labelList = document.querySelectorAll('#body label');

                let stopLoop = false;
                let resourceNumber = '';

                labelList.forEach((label) => {
                    if (stopLoop)
                        return;

                    let labelText = label.textContent;
                    labelText = labelText ? labelText.replace(':', '').trim() : '';

                    if (/Motivo.+Glosa/.test(labelText))
                        stopLoop = true;

                    if (/^Recurso/.test(labelText)) {
                        let spanElement = label.parentElement.querySelector('span');
                        let value = spanElement ? spanElement.textContent : '';
                        resourceNumber = value ? value.replace('R$', '').trim() : '';
                    }

                });

                let lines = [];

                var boxMessageList = document.querySelectorAll('.box-resposta-mensagem,.box-resposta-resposta');
                boxMessageList.forEach((box) => {
                    let boxp1div = box.querySelector('.box-resposta-p1 div');
                    let user = boxp1div.querySelector('label').textContent.trim();
                    let date = boxp1div.querySelector('span').textContent.trim();
                    let message = box.querySelector('.box-resposta-p2 span').textContent.trim();
                    message = message.replace(/[\n\t]*/g, '');

                    let line = [ resourceNumber, user, date, message ];
                    lines.push(line.join('\t'));
                });

                Clipboard.write(lines.join('\n')).then(() => Snackbar.fire('Copiado!'));

            },
            _upgrade = () => {
                FAB.build([
                    {
                        textLabel: 'Copiar detalhes',
                        iconClass: 'lar la-copy',
                        click: __btnCopy_onclick,
                    },
                    {
                        textLabel: 'Copiar mensagens',
                        iconClass: 'lar la-copy',
                        click: __btnCopyMessages_onclick,
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

	Presto.pages.RecursoGlosaBuscaDetalhePage = _Page;

})(Presto, location);
