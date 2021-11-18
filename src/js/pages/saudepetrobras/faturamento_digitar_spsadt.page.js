(function(Presto, location) {

	'use strict';

    const {
        Analytics,
        IndexedDB,
        Snackbar,
        FAB,

    } = Presto.modules;

	const _Page = function() {

        const
            // Inicio > Faturamento > Digitação > Digitar > Serviço Profissional/Serviço Auxiliar de Diagnóstico e Terapia - SP/SADT
            PATHNAME_REGEX = /faturamento\/digitar\/spsadt/;

        const
            _handleBtnGravarAlteracoes = person => {
                const btnGravarAlteracoes = document.querySelector('#gravarAlteracoes');
                const _onclick = btnGravarAlteracoes.onclick;
                btnGravarAlteracoes.onclick = () => {
                    IndexedDB.getOrCreateDB()
                        .then(db => IndexedDB.addOrUpdateItem(db, person))
                        .then(() => {
                            Analytics.sendEvent('_watchForm_personSaved', 'log', person.uid);
                            if (_onclick) _onclick();
                        })
                        .catch(err => {
                            Analytics.sendException(`_watchForm: ${JSON.stringify(err)}`, true);
                        });
                };
            },
            _watchForm = function () {
                let person = {
                    uid: '', // carteirinha
                    name: '',
                    password: '',
                    props: [],
                };

                setTimeout(() => {
                    person.uid = document.querySelector('#txtNumeroCarteirinhaBeneficiario').value;
                    person.name = document.querySelector('#txtNomeBeneficiario').value;
                    person.password = document.querySelector('#senha').value;
                }, 500);

                let idIgnoredArr = [
                    'dataModalProcedimento',
                    'ordemItemModalProcedimento',
                ];

                Array.from(document.querySelectorAll('input[type=text],select,textarea'))
                    .filter(item => idIgnoredArr.includes(item.id) === false)
                    .map(item => {
                        let _onchange = item.onchange;
                        item.onchange = (event) => {
                            let change = person.props.find(item => item.id === event.target.id);
                            if (!!!change) {
                                person.props.push({
                                    id: event.target.id,
                                    value: event.target.value,
                                });
                            } else {
                                if (event.target.value)
                                    change.value = event.target.value;
                                else
                                    person.props = person.props.filter(item => item.id !== event.target.id);
                            }
                            // console.table(person.props);

                            if (_onchange) _onchange();
                        };
                    });

                _handleBtnGravarAlteracoes(person);
            },
            _validateDueDate = () => {
                return new Promise((resolve, reject) => {
                    let interval = setInterval(() => {
                        const eDueDatePwd = document.querySelector('#txtDataValidadeSenha');
                        if (!!!eDueDatePwd.value)
                            return;

                        clearInterval(interval);

                        // password validate: duo date 
                        let snacks = eDueDatePwd.value.split('/').map(num => parseInt(num));
                        snacks[ 1 ] += -1;
                        let duoDatePwd = new Date(...snacks.reverse());
                        if (duoDatePwd < new Date()) {
                            eDueDatePwd.style.border = 'red 2px solid';
                            eDueDatePwd.style.color = 'red';
                            eDueDatePwd.parentElement.querySelector('label').style.color = 'red';
                            reject('Senha vencida!');
                        }
                        else resolve();

                    }, 500);
                });
            },
            __buildComponentForLoadedProfiles = personArr => {
                let label = document.createElement('label');
                label.textContent = 'Lista de Pacientes:'
                label.style.marginRight = '1em';

                let select = document.createElement('select');

                let option = document.createElement('option');
                option.value = '';
                option.textContent = 'Selecione...';
                select.appendChild(option);

                personArr.forEach(item => {
                    let option = document.createElement('option');
                    option.value = item.password;
                    option.textContent = `${item.name} - ${item.uid}`;
                    select.appendChild(option);
                });

                select.onchange = (event) => {
                    document.querySelector('#senha').value = event.target.value;
                };

                let div = document.createElement('div');
                div.style.paddingBottom = '3em';
                div.style.textAlign = 'center';
                div.appendChild(label);
                div.appendChild(select);

                const referenceNode = document.querySelector('#formularioDigitacaoSPSADT fieldset div');
                referenceNode.insertBefore(div, referenceNode.firstChild);
            },
            __loadProfiles = () => {
                IndexedDB.getOrCreateDB()
                    .then(IndexedDB.getAll)
                    .then(personArr => {
                        if (personArr && personArr.length) {
                            personArr.sort((a, b) => a.name.charCodeAt() - b.name.charCodeAt());
                            __buildComponentForLoadedProfiles(personArr);
                        }
                    })
                    .catch(err => {
                        Analytics.sendException(`__loadProfiles :: ${JSON.stringify(err)}`);
                    });

            },
            _upgrade = () => {
                __loadProfiles();

                FAB.build([ {
                    textLabel: 'IndexedDB: Criar relatório',
                    iconClass: 'las la-external-link-alt',
                    click: IndexedDB.createReport,
                } ]);

                let btnImport = document.querySelector('#senha').parentElement.querySelector('a.bt-procurar');
                let btnImport_onclick = btnImport.onclick;
                btnImport.onclick = () => {
                    btnImport_onclick();
                    _validateDueDate()
                        .then(() => {
                            document.querySelector('#txtNumeroGuiaPrestador').value = new Date().getTime();
                            _watchForm();
                        })
                        .catch(Snackbar.fire);
                };
            },
            _init = () => {
                if (PATHNAME_REGEX.test(location.pathname))
                    _upgrade();
            };

		return {
            upgrade: _init,
		};
	}();

	Presto.pages.FormularioDigitarSPSADTPage = _Page;

})(Presto, location);
