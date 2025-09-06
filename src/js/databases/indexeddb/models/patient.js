(function (Presto) {
  "use strict";

  const { IndexedDBClient } = Presto.modules;

  const _Model = (function () {
    const STORE_NAME = "patient";

    const _getOrCreateDB = (version = 1) =>
        IndexedDBClient.getOrCreateDB(STORE_NAME, "id", version),
      _get = (db, id) => IndexedDBClient.get(db, STORE_NAME, id),
      _getAll = async (db) => {
        const list = await IndexedDBClient.getAll(db, STORE_NAME);
        list.sort(function (a, b) {
          // a.name.charCodeAt() - b.name.charCodeAt()
          return a.name.localeCompare(b.name);
        });
        return list;
      },
      _addOrUpdateItem = (db, data) =>
        IndexedDBClient.addOrUpdateItem(db, STORE_NAME, data),
      _createReport = () => {
        _getOrCreateDB()
          .then(_getAll)
          .then((arr) => {
            window.open().document.write(`
                <pre>${JSON.stringify(arr, undefined, 4)}</pre>
            `);
          });
      };

    return {
      getOrCreateDB: _getOrCreateDB,
      get: _get,
      getAll: _getAll,
      addOrUpdateItem: _addOrUpdateItem,
      createReport: _createReport,
    };
  })();

  Presto.models.PatientModel = _Model;
})(Presto, location);
