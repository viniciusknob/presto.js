(function (Presto, indexedDB) {
  "use strict";

  const _Module = (function () {
    const DB_NAME = "PrestoDB";

    let _db = undefined;

    const _getOrCreateDB = (storeName, keyPath, version = 1) => {
        const fn = "_getOrCreateDB";

        return new Promise((resolve, reject) => {
          if (_db) {
            // console.log(`${fn}: ${_db.name} already opened`);
            if (_db.version !== version) {
              console.log(
                `${fn}: it will close ${_db.name} because version change!`
              );
              _db.close();
            } else {
              return resolve(_db);
            }
          }

          if (!indexedDB) {
            console.log(
              `${fn}.checkSupport: This browser doesn\'t support IndexedDB`
            );
            return reject();
          }

          const idb = indexedDB.open(DB_NAME, version);

          idb.onerror = function (event) {
            console.log(`${fn}.indexedDB.open: ${JSON.stringify(event)}`);
            reject();
          };

          idb.onsuccess = (event) => {
            _db = event.target.result;

            _db.onerror = function (event) {
              console.log(`${fn}.db.any: ${JSON.stringify(event)}`);
            };

            resolve(_db);
          };

          idb.onupgradeneeded = function (event) {
            console.log(`${fn}.onupgradeneeded`, JSON.stringify(event));

            _db = event.target.result;

            if (_db.objectStoreNames.contains(storeName) === false) {
              _db.createObjectStore(storeName, { keyPath });
            }
          };
        });
      },
      __getObjectStore = function (db, storeName) {
        return db.transaction([storeName], "readonly").objectStore(storeName);
      },
      _get = function (db, storeName, id) {
        const fn = "_get";

        return new Promise((resolve, reject) => {
          const objectStore = __getObjectStore(db, storeName);
          const request = objectStore.get(id);
          request.onsuccess = (event) => {
            if (event.target.result) {
              resolve(event.target.result);
            } else {
              reject(`not found id ${id} in ${storeName} store`);
            }
          };
          request.onerror = reject;
        });
      },
      _getAll = function (db, storeName) {
        const fn = "_getAll";

        return new Promise(function (resolve, reject) {
          const list = [];
          const objectStore = __getObjectStore(db, storeName);
          objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
              list.push(cursor.value);
              cursor.continue();
            } else {
              resolve(list);
            }
          };
        });
      },
      _addOrUpdateItem = function (db, storeName, data) {
        const fn = "_addOrUpdateItem";

        return new Promise(function (resolve, reject) {
          const transaction = db.transaction([storeName], "readwrite");

          transaction.oncomplete = resolve;

          transaction.onerror = function (event) {
            console.log(`${fn}.transaction: ${JSON.stringify(event)}`);
            reject();
          };

          const objectStore = transaction.objectStore(storeName);

          const singleKeyRange = IDBKeyRange.only(data.id || data.uid);
          const _cursor = objectStore.openCursor(singleKeyRange);

          _cursor.onsuccess = function (event) {
            var cursor = event.target.result;

            let request;
            if (cursor) {
              request = objectStore.put(data);
            } else {
              request = objectStore.add(data);
            }

            request.onerror = function (event) {
              console.log(
                `${fn}.objectStore.request: ${JSON.stringify(event)}`
              );
              reject();
            };
          };

          _cursor.onerror = function (event) {
            console.log(`${fn}.cursor.open: ${JSON.stringify(event)}`);
            reject();
          };
        });
      };
    return {
      getOrCreateDB: _getOrCreateDB,
      get: _get,
      getAll: _getAll,
      addOrUpdateItem: _addOrUpdateItem,
    };
  })();

  Presto.modules.IndexedDBClient = _Module;
})(Presto, indexedDB);
