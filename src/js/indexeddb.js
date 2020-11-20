(function(Presto, indexedDB) {
	'use strict';
	
    const {
        Analytics,

    } = Presto.modules;

	const _IndexedDB = function() {

		const DB_NAME = 'PrestoDB';
		const STORE_NAME = 'person';

		let _db = undefined;

		const
			_getOrCreateDB = () => {
				const fn = '_getOrCreateDB';

				return new Promise((resolve, reject) => {

					if (_db) {
						return resolve(_db);
					}
				
					if (!(indexedDB)) {
						Analytics.sendEvent('error', `${fn}.checkSupport`, 'This browser doesn\'t support IndexedDB');
						return reject();
					}
					
					const idb = indexedDB.open(DB_NAME);
					
					idb.onerror = function(event) {
						Analytics.sendEvent('error', `${fn}.indexedDB.open`, JSON.stringify(event));
						reject();
					};
					
					idb.onsuccess = (event) => {
						_db = event.target.result;
						
						_db.onerror = function(event) {
							Analytics.sendEvent('error', `${fn}.db.any`, JSON.stringify(event));
						};
						
						resolve(_db);
					};
					
					idb.onupgradeneeded = function(event) {
						Analytics.sendEvent('log', `${fn}.onupgradeneeded`, JSON.stringify(event));
						
						_db = event.target.result;
						
						if (_db.objectStoreNames.contains(STORE_NAME) === false) {
							_db.createObjectStore(STORE_NAME, { keyPath: "uid" });
						}
					};
				});
			},
			_getAll = function(db) {
				const fn = '_getAll';
				
				return new Promise(function(resolve, reject) {
					const personList = [];
					const objectStore = db.transaction([STORE_NAME], "readonly").objectStore(STORE_NAME);
					objectStore.openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							personList.push(cursor.value);
							cursor.continue();
						} else {
							Analytics.sendEvent('log', `${fn}.personList`, `size ${personList.length}`);
							
							personList.sort(function(a,b) {
								return a.name.localeCompare(b.name);
							});
							
							resolve(personList);
						}
					};
				});
			},
			_addOrUpdateItem = function(db, person) {
				const fn = '_addOrUpdateItem';

				return new Promise(function(resolve, reject) {
					
					const transaction = db.transaction([STORE_NAME], "readwrite");
					
					transaction.oncomplete = function(event) {
						resolve();
					};
	
					transaction.onerror = function(event) {
						Analytics.sendEvent('error', `${fn}.transaction`, JSON.stringify(event));
						reject();
					};
	
					const objectStore = transaction.objectStore(STORE_NAME);
					
					const singleKeyRange = IDBKeyRange.only(person.uid);
					const _cursor = objectStore.openCursor(singleKeyRange);
					
					_cursor.onsuccess = function(event) {
						var cursor = event.target.result;

						let request;
						if (cursor) {
							Analytics.sendEvent('log', `${fn}.objectStore.put`, person.uid);
							request = objectStore.put(person);
						} else {
							Analytics.sendEvent('log', `${fn}.objectStore.add`, person.uid);
							request = objectStore.add(person);
						}
						
						request.onerror = function(event) {
							Analytics.sendEvent('error', `${fn}.objectStore.request`, JSON.stringify(event));
							reject();
						};
					};
					
					_cursor.onerror = function(event) {
						Analytics.sendEvent('error', `${fn}.cursor.open`, JSON.stringify(event));
						reject();
					};
				});
			};

		return {
			getOrCreateDB: _getOrCreateDB,
			getAll: _getAll,
			addOrUpdateItem: _addOrUpdateItem,
		};
	}();

	Presto.modules.IndexedDB = _IndexedDB;

})(Presto, indexedDB);