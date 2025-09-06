(function (Presto) {
  "use strict";

  const { IndexedDBClient } = Presto.modules;

  const _Model = (function () {
    const STORE_NAME = "person";

    const _getOrCreateDB = (version = 1) =>
        IndexedDBClient.getOrCreateDB(STORE_NAME, "uid", version),
      _get = (db, uid) => IndexedDBClient.get(db, STORE_NAME, uid),
      _getAll = async (db) => {
        const list = await IndexedDBClient.getAll(db, STORE_NAME);
        list.sort(function (a, b) {
          // a.name.charCodeAt() - b.name.charCodeAt()
          return a.name.localeCompare(b.name);
        });
        return list;
      },
      _addOrUpdateItem = (db, person) =>
        IndexedDBClient.addOrUpdateItem(db, STORE_NAME, person),
      _createReport = () => {
        _getOrCreateDB()
          .then(_getAll)
          .then((personArr) => {
            window.open().document.write(`
                <pre>${JSON.stringify(personArr, undefined, 4)}</pre>
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

  Presto.models.PersonModel = _Model;
})(Presto, location);
