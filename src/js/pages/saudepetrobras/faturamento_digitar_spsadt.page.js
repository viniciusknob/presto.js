(function(Presto, location) {

	'use strict';

    const {
        Analytics,
        IndexedDB,
        Snackbar,
        FAB,
        Modal,

    } = Presto.modules;

	const _Page = function() {

        const
            // Inicio > Faturamento > Digitação > Digitar > Serviço Profissional/Serviço Auxiliar de Diagnóstico e Terapia - SP/SADT
            PATHNAME_REGEX = /faturamento\/digitar\/spsadt/,

            FORM_FIELDSET_SELECTOR = "#formularioDigitacaoSPSADT fieldset div",

            MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR = '#presto-appointments-days',
            MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR = '#presto-appointments-month-year',
            MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR = '#presto-appointments-unit-value';

        const
            /** Modal actions */
            __removeInitialAppointment = () => {
                let fakeTR = document.querySelector('#trProcedimento0');
                if (fakeTR) {
                    let tdArr = Array.from(fakeTR.querySelectorAll('td'))
                    if (tdArr.filter(td => td.textContent === '-').length) {
                        fakeTR.querySelector('input').checked = true;
                        document.querySelector('#bt-addProcedimento').parentElement.querySelector('.bt-remover').click();
                    }
                }
            },
            _addAppointment = (days, monthYear, daysLength, unitValue) => {

                let day = days.shift();

                document.querySelector('#bt-addProcedimento').click(); // open modal

                document.querySelector('#dataModalProcedimento').value = day + monthYear;
                document.querySelector('#labelOrdemItemModalProcedimento').parentElement.querySelector('input').value = (daysLength - days.length);
                document.querySelector('#tipoTabelaModalProcedimento').value = 22;
                document.querySelector('#codigoModalProcedimento').value = 50000470;
                document.querySelector('#codigoModalProcedimento').onblur();

                let interval = setInterval(() => {
                    let target = document.querySelector('#descricaoModalProcedimento');
                    if (target.value) {
                        clearInterval(interval);

                        document.querySelector('#quantidadeModalProcedimento').value = 1;

                        jQuery('#porcentagemRedAcrModalProcedimento').unmask();
                        document.querySelector('#porcentagemRedAcrModalProcedimento').value = '1.00';

                        document.querySelector('#valorUnitarioModalProcedimento').value = unitValue.replace(',','.');
                        document.querySelector('#valorUnitarioModalProcedimento').onblur();

                        interval = setInterval(() => {
                            target = document.querySelector('#valorTotalModalProcedimento');
                            if (target.value) {
                                clearInterval(interval);

                                setTimeout(() => {
                                    document.querySelector('#bt-operacaoModalProcedimento').click(); // close modal
                                    if (days.length) {
                                        setTimeout(() => _addAppointment(days, monthYear, daysLength, unitValue), 1000);
                                    }
                                }, 1000);
                            }
                        }, 250);
                    }
                }, 250);
            },
            __fillForm_faturamentoDigitarSPSADT_onclick = () => {
                /**
                 * Modal Validations
                 */
                let _days = document.querySelector(MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR).value;
                if (!!!_days) {
                    Snackbar.fire('Informe os dias dos procedimentos!');
                    return;
                }

                let _monthYear = document.querySelector(MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR).value;
                if (!!!_monthYear) {
                    Snackbar.fire('Informe o mês/ano dos procedimentos!');
                    return;
                }

                let _unitValue = document.querySelector(MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR).value;
                if (!!!_unitValue) {
                    Snackbar.fire('Informe o valor unitário dos procedimentos no formato 12,34!');
                    return;
                }
                /**
                 * end Modal Validations
                 */

                _days = _days.split(',').map(day => day.padStart(2,'0'));
                _monthYear = `/${_monthYear}`;
                const _daysLength = _days.length;

                __removeInitialAppointment();
                _addAppointment(_days, _monthYear, _daysLength, _unitValue);
            },
            __buildFormGroup = (options) => {
                let formGroup = document.createElement('div');
                formGroup.classList.add('form-group');

                let label = document.createElement('label');
                label.textContent = options.textLabel;
                formGroup.appendChild(label);

                let textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.classList.add('form-control');
                textInput.id = options.inputId;
                if (options.inputValue) textInput.value = options.inputValue;
                formGroup.appendChild(textInput);

                if (options.helpText) {
                    let small = document.createElement('small');
                    small.classList.add('form-text','text-muted');
                    small.textContent = options.helpText;
                    formGroup.appendChild(small);
                }

                return formGroup;
            },
            __buildModalContent = () => {
                let content = document.createElement('div');

                content.appendChild(__buildFormGroup({
                    textLabel: 'DIAS',
                    inputId: MODAL_INPUT_APPOINTMENTS_DAYS_SELECTOR.substr(1),
                    helpText: 'Ex.: 7,14,21,28',
                }));

                content.appendChild(__buildFormGroup({
                    textLabel: 'MÊS/ANO',
                    inputId: MODAL_INPUT_APPOINTMENTS_MONTH_YEAR_SELECTOR.substr(1),
                    inputValue: `${((new Date().getMonth()+1)+'').padStart(2,'0')}/${new Date().getFullYear()}`,
                    helpText: 'Ex.: 06/2021',
                }));

                content.appendChild(__buildFormGroup({
                    textLabel: 'VALOR UNITÁRIO',
                    inputId: MODAL_INPUT_APPOINTMENTS_UNIT_VALUE_SELECTOR.substr(1),
                    helpText: 'Ex.: 47,40',
                }));

                return content;
            },

            /** end Modal actions */

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
                label.textContent = 'Presto.js - Lista de Pacientes:'
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

                const referenceNode = document.querySelector(FORM_FIELDSET_SELECTOR);
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
            __btnAdicionarProcedimentos_onclick = () => {
                Modal.open({
                    title: 'Adicionar Procedimentos',
                    content: __buildModalContent(),
                    mainAction: __fillForm_faturamentoDigitarSPSADT_onclick,
                });
            },
            _upgrade = () => {
                Modal.init();
                __loadProfiles();

                FAB.build([
                    {
                        textLabel: 'Adicionar Procedimentos',
                        iconClass: 'las la-calendar-plus',
                        click: __btnAdicionarProcedimentos_onclick,
                    },
                    {
                        textLabel: 'IndexedDB: Criar relatório',
                        iconClass: 'las la-external-link-alt',
                        click: IndexedDB.createReport,
                    }
                ]);

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
