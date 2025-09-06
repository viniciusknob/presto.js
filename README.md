# Presto.js 1.4.1

Useful utilities for working with health insurance (userscript).

This project uses the following patterns:

- Immediately Invoked Function Expression (IIFE)
- Revealing Module Pattern

### Instalação

UserScript: [presto.user.js](../../raw/main/presto.user.js)

### Recursos

#### SulAmerica

- Escolher um paciente por meio de um combobox, utilizado em várias páginas;
- Preenchimento de campos de rotina em uma Solicitação de Autorização;
- Preenchimento de campos de rotina e atendimentos em uma Guia SP/SADT;

#### SaudePetrobras

- Copiar os dados das páginas de detalhes de extrato e recurso de glosa;
- Gerar automaticamente um novo "Nº Guia no Prestador" para evitar glosas de Guia Duplicada;
- Em Faturamento > Digitar, marcar o campo "Data Validade da Senha" em vermelho se a data estiver vencida;
- Escolher um paciente por meio de um combobox;
- Em Faturamento > Digitar > Consultar e Detalhe, copiar os dados da página;
- Em Faturamento > Digitar, possibilitar uma forma mais humana de adicionar procedimentos;
- Em Faturamento > Digitar, escolher um paciente por meio de um combobox;
- Em Recurso de Glosa > Filtrar, possibilitar a consulta de status de protocolos em massa;
- Em Autorização > Últimas Solicitações > Buscar Status, copiar os dados referentes a senha para recurso de glosa;
- Em Faturamento > Digitacao > Consultar, escolher datas de início e fim por meio de um combobox com mês/ano;

#### CanoasPrev

- Preencher o dia atual na Guia SP/SADT, campo Data de Solicitação;
- Preencher o campo Tipo de Atendimento como "Terapia";
- Preencher o campo Procedimento com código para Sessão de Terapia;
- Copiar os resultados em Localizar Procedimentos para fins de relatório mensal;

## Keep npm Packages Updated

```bash
# run to check outdated npm packages
npm outdated

# run to check updates outdated npm packages
npx npm-check-updates -u --enginesNode

# run to update npm packages
npm install
```
