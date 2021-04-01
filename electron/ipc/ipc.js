"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var main_1 = require("../../main");
var database_1 = require("../data-management/database");
var util_1 = require("../data-management/util");
var pagination_1 = require("../data-management/pagination");
var path = require("path");
// import * as util from 'util';
var fs = require("fs");
// const parse = require('csv-parse');
var importFile_1 = require("../data-management/importFile");
var exportFile_1 = require("../data-management/exportFile");
var bson_1 = require("bson");
var recentsFilePath = path.join(__dirname, '..', 'data', 'recents.json');
var favoritesFilePath = path.join(__dirname, '..', 'data', 'favorites.json');
electron_1.ipcMain.on('open-folder-browse', function (event) {
    return event.returnValue = electron_1.dialog.showOpenDialogSync(main_1.win, {
        buttonLabel: 'Select Folder',
        // defaultPath: app.getPath('desktop'),
        properties: ['createDirectory', 'openDirectory']
    });
});
electron_1.ipcMain.on('open-file-browse', function (event) {
    return event.returnValue = electron_1.dialog.showOpenDialogSync(main_1.win, {
        buttonLabel: 'Open',
        // defaultPath: app.getPath('desktop'),
        properties: ['createDirectory', 'openFile']
    });
});
electron_1.ipcMain.on('open-file-save-browse', function (event, fileType) {
    var filters = [];
    if (fileType === 'JSON') {
        filters.push({ name: 'json file', extensions: ['json'] });
    }
    ;
    if (fileType === 'CSV') {
        filters.push({ name: 'csv file', extensions: ['csv'] });
    }
    ;
    if (!fileType) {
        filters = [
            { name: 'json file', extensions: ['json'] },
            { name: 'csv file', extensions: ['csv'] }
        ];
    }
    return event.returnValue = electron_1.dialog.showSaveDialogSync(main_1.win, {
        buttonLabel: 'Select',
        // defaultPath: app.getPath('desktop'),
        filters: filters,
        properties: ['createDirectory']
    });
});
electron_1.ipcMain.handle('fetch-favorites', function (event) {
    return new Promise(function (resolve, reject) {
        fs.readFile(favoritesFilePath, 'utf-8', function (error, data) {
            if (error) {
                return reject(error);
            }
            try {
                var parsedData = JSON.parse(data);
                return resolve(parsedData);
            }
            catch (error) {
                return reject(error);
            }
        });
    });
});
electron_1.ipcMain.handle('fetch-recents', function (event) {
    return new Promise(function (resolve, reject) {
        fs.readFile(recentsFilePath, 'utf-8', function (error, data) {
            if (error) {
                return reject(error);
            }
            try {
                var parsedData = JSON.parse(data);
                return resolve(parsedData);
            }
            catch (error) {
                return reject(error);
            }
        });
    });
});
electron_1.ipcMain.handle('store-favorites', function (event, favoritesArray) {
    return new Promise(function (resolve, reject) {
        var stringifiedData;
        try {
            stringifiedData = JSON.stringify(favoritesArray);
        }
        catch (error) {
            return reject(error);
        }
        fs.writeFile(favoritesFilePath, stringifiedData, function (error) {
            if (error) {
                return reject(error);
            }
            resolve("Stored favorites.");
        });
    });
});
electron_1.ipcMain.handle('store-recents', function (event, recentsArray) {
    return new Promise(function (resolve, reject) {
        var stringifiedData;
        try {
            stringifiedData = JSON.stringify(recentsArray);
        }
        catch (error) {
            return reject(error);
        }
        fs.writeFile(recentsFilePath, stringifiedData, function (error) {
            if (error) {
                return reject(error);
            }
            resolve("Stored recents.");
        });
    });
});
electron_1.ipcMain.handle('connect-to-database', function (event, storagePath) {
    return new Promise(function (resolve, reject) {
        try {
            var connectedStoragePath = database_1.connectToDatabase(storagePath);
            resolve("Connected database: " + connectedStoragePath);
        }
        catch (error) {
            return reject(error);
        }
    });
});
electron_1.ipcMain.handle('close-database', function (event) {
    pagination_1.clearPaginationDetails();
    return database_1.closeDatabase()
        .then(function (response) {
        return response;
    })
        .catch(function (error) {
        throw error;
    });
});
electron_1.ipcMain.handle('fetch-database-info', function (event) {
    return new Promise(function (resolve, reject) {
        database_1.getDb().info(function (error, info) {
            if (error) {
                return reject(error);
            }
            var convertedBytesString = util_1.formatBytes(info.disk_size);
            return resolve({
                documentCount: info.doc_count,
                diskSize: convertedBytesString,
            });
        });
    });
});
electron_1.ipcMain.handle('fetch-database-results', function (event, fetchOptionsObj) {
    // console.log(fetchOptionsObj);
    if (!fetchOptionsObj && pagination_1.getPreviousFetchOptions() === null) {
        var fetchOptions = pagination_1.createFetchOptions();
        // console.log(fetchOptions);
        // console.log("here1");
        return pagination_1.fetchNextPage(fetchOptions);
    }
    else if (!fetchOptionsObj && pagination_1.getPreviousFetchOptions()) {
        var fetchOptions = pagination_1.getPreviousFetchOptions();
        // console.log(fetchOptions);
        // console.log("here2");
        return pagination_1.fetchNextPage(fetchOptions);
    }
    else {
        var fetchOptions = pagination_1.createFetchOptions(fetchOptionsObj.previousPageIndex, fetchOptionsObj.currentPageIndex, fetchOptionsObj.pageSize);
        // console.log(fetchOptions);
        // console.log("here3");
        return pagination_1.fetchNextPage(fetchOptions);
    }
});
electron_1.ipcMain.on('reset-search', function (event) {
    pagination_1.clearPaginationDetails();
    return event.returnValue = "Fetch/search settings reset.";
});
electron_1.ipcMain.handle('fetch-database-indexes', function (event) {
    return database_1.getDb()
        .getIndexes()
        .then(function (indexesObject) {
        // console.log(util.inspect(indexesObject, {showHidden: false, depth: null}));
        return util_1.transformIndexData(indexesObject.indexes);
    })
        .catch(function (error) {
        throw error;
    });
});
electron_1.ipcMain.handle('set-cryptography-settings', function (event, cryptographySettingsObj) {
    if (cryptographySettingsObj.applyEncryption && !cryptographySettingsObj.applyDecryption) {
        return database_1.applyEncryptionOnly(cryptographySettingsObj.cryptoSecretKey, cryptographySettingsObj.cryptoSpec)
            .then(function () {
            return "Encryption applied.";
        })
            .catch(function (error) {
            throw error;
        });
    }
    else if (!cryptographySettingsObj.applyEncryption && cryptographySettingsObj.applyDecryption) {
        return database_1.applyDecryptionOnly(cryptographySettingsObj.cryptoSecretKey, cryptographySettingsObj.cryptoSpec)
            .then(function () {
            return "Decryption applied.";
        })
            .catch(function (error) {
            throw error;
        });
    }
    else if (cryptographySettingsObj.applyEncryption && cryptographySettingsObj.applyDecryption) {
        return database_1.applyEncryptionAndDecryption(cryptographySettingsObj.cryptoSecretKey, cryptographySettingsObj.cryptoSpec)
            .then(function () {
            return "Encryption and decryption applied.";
        })
            .catch(function (error) {
            throw error;
        });
    }
    else if (!cryptographySettingsObj.applyEncryption && !cryptographySettingsObj.applyDecryption) {
        return database_1.removeEncryptionAndDecryption()
            .then(function () {
            return "Encryption and decryption removed.";
        })
            .catch(function (error) {
            throw error;
        });
    }
});
electron_1.ipcMain.handle('persist', function (event, persistType, persistItem) {
    if (persistType === "create") {
        if (Array.isArray(persistItem)) {
            var promises_1 = [];
            // let errorPresent = false;
            persistItem.forEach(function (item) {
                var itemToPersist;
                if (!item._id) {
                    itemToPersist = __assign({ _id: new bson_1.ObjectID().toHexString() }, item);
                }
                else {
                    itemToPersist = item;
                }
                promises_1.push(database_1.getDb().put(itemToPersist)
                    .then(function (result) {
                    return database_1.getDb().get(result["id"]);
                })
                    .then(function (fetchedDbItem) {
                    var unmodifiedDoc = fetchedDbItem;
                    var unmodifiedDocId = unmodifiedDoc._id;
                    var unmodifiedDocRev = unmodifiedDoc._rev;
                    delete unmodifiedDoc._id;
                    delete unmodifiedDoc._rev;
                    var modifiedDoc = __assign(__assign({ _id: unmodifiedDocId }, unmodifiedDoc), { _rev: unmodifiedDocRev });
                    return { result: modifiedDoc };
                })
                    .catch(function (error) {
                    // errorPresent = true;
                    return { error: error };
                    // throw error;
                }));
            });
            return Promise.all(promises_1)
                .then(function (results) {
                // if(errorPresent){
                //   throw new Error(util.inspect(results, {showHidden: false, depth: null}));
                // }
                return results;
            })
                .catch(function (error) {
                throw error;
            });
        }
        else {
            var itemToPersist = void 0;
            if (!persistItem._id) {
                itemToPersist = __assign({ _id: new bson_1.ObjectID().toHexString() }, persistItem);
            }
            else {
                itemToPersist = persistItem;
            }
            return database_1.getDb().put(itemToPersist)
                .then(function (result) {
                return database_1.getDb().get(result["id"]);
            })
                .then(function (fetchedDbItem) {
                var unmodifiedDoc = fetchedDbItem;
                var unmodifiedDocId = unmodifiedDoc._id;
                var unmodifiedDocRev = unmodifiedDoc._rev;
                delete unmodifiedDoc._id;
                delete unmodifiedDoc._rev;
                var modifiedDoc = __assign(__assign({ _id: unmodifiedDocId }, unmodifiedDoc), { _rev: unmodifiedDocRev });
                return modifiedDoc;
            })
                .catch(function (error) {
                throw error;
            });
        }
    }
    else if (persistType === "update") {
        return database_1.getDb().get(persistItem["_id"]).then(function (doc) {
            return database_1.getDb().put(__assign(__assign({}, persistItem), { _rev: doc._rev }));
        })
            .then(function (result) {
            return database_1.getDb().get(result["id"]);
        })
            .then(function (fetchedDbItem) {
            var unmodifiedDoc = fetchedDbItem;
            var unmodifiedDocId = unmodifiedDoc._id;
            var unmodifiedDocRev = unmodifiedDoc._rev;
            delete unmodifiedDoc._id;
            delete unmodifiedDoc._rev;
            var modifiedDoc = __assign(__assign({ _id: unmodifiedDocId }, unmodifiedDoc), { _rev: unmodifiedDocRev });
            return modifiedDoc;
        })
            .catch(function (error) {
            throw error;
        });
    }
    else if (persistType === "delete") {
        return database_1.getDb().get(persistItem).then(function (doc) {
            return database_1.getDb().remove(doc);
        }).then(function (result) {
            return result;
        }).catch(function (error) {
            throw error;
        });
    }
});
electron_1.ipcMain.handle('filter-search', function (event, searchFilter) {
    var filter;
    var sort;
    var limit;
    var skip;
    try {
        filter = searchFilter.filter ? JSON.parse(searchFilter.filter) : null;
        sort = searchFilter.sort ? JSON.parse(searchFilter.sort) : null;
        limit = searchFilter.limit ? parseInt(searchFilter.limit) : null;
        skip = searchFilter.skip ? parseInt(searchFilter.skip) : null;
    }
    catch (error) {
        return Promise.reject(error);
    }
    ;
    var findObj = {};
    if (filter) {
        findObj["selector"] = __assign({}, filter);
    }
    else {
        findObj["selector"] = {};
    }
    if (sort) {
        findObj["sort"] = __spreadArrays(sort);
    }
    if (limit) {
        findObj["limit"] = limit;
    }
    if (skip) {
        findObj["skip"] = skip;
    }
    if (searchFilter.sort) {
        return database_1.getDb().createIndex({
            index: {
                fields: __spreadArrays(sort)
            }
        })
            .then(function () {
            return database_1.getDb().find(findObj);
        })
            .then(function (response) {
            var newDocsArray = [];
            for (var _i = 0, _a = response.docs; _i < _a.length; _i++) {
                var doc = _a[_i];
                var unmodifiedDoc = doc;
                var unmodifiedDocId = unmodifiedDoc._id;
                var unmodifiedDocRev = unmodifiedDoc._rev;
                delete unmodifiedDoc._id;
                delete unmodifiedDoc._rev;
                var modifiedDoc = __assign(__assign({ _id: unmodifiedDocId }, unmodifiedDoc), { _rev: unmodifiedDocRev });
                newDocsArray.push(modifiedDoc);
            }
            return newDocsArray;
        })
            .catch(function (error) {
            throw error;
        });
    }
    return database_1.getDb().find({
        selector: __assign({}, filter),
        sort: ["_id"],
        limit: limit ? limit : undefined,
        skip: skip
    })
        .then(function (response) {
        var newDocsArray = [];
        for (var _i = 0, _a = response.docs; _i < _a.length; _i++) {
            var doc = _a[_i];
            var unmodifiedDoc = doc;
            var unmodifiedDocId = unmodifiedDoc._id;
            var unmodifiedDocRev = unmodifiedDoc._rev;
            delete unmodifiedDoc._id;
            delete unmodifiedDoc._rev;
            var modifiedDoc = __assign(__assign({ _id: unmodifiedDocId }, unmodifiedDoc), { _rev: unmodifiedDocRev });
            newDocsArray.push(modifiedDoc);
        }
        return newDocsArray;
    })
        .catch(function (error) {
        throw error;
    });
});
electron_1.ipcMain.handle('persist-index', function (event, persistIndexType, persistItem) {
    if (persistIndexType === "create") {
        var modifiedIndexFieldsValue_1 = [];
        if (typeof persistItem.fields !== "object") {
            return Promise.reject("Fields stated in incorrect format.");
        }
        ;
        persistItem.fields.forEach(function (element) {
            if (typeof element === "object") {
                modifiedIndexFieldsValue_1 = modifiedIndexFieldsValue_1.concat(element);
            }
            else {
                modifiedIndexFieldsValue_1.push(element);
            }
        });
        // modifiedIndexFieldsValue = persistItem.fields.split(",").map(indexField => {
        //   return indexField.trim();
        // });
        var modifiedPersistItem = persistItem;
        modifiedPersistItem.fields = modifiedIndexFieldsValue_1;
        console.log(modifiedPersistItem);
        return database_1.getDb().createIndex(__assign({}, modifiedPersistItem))
            .then(function (result) {
            if (result.result === "created") {
                return result;
            }
            else {
                throw new Error("Index already exists.");
            }
            ;
        })
            .catch(function (error) {
            throw error;
        });
    }
    else if (persistIndexType === "delete") {
        return database_1.getDb().getIndexes()
            .then(function (indexesResult) {
            return database_1.getDb().deleteIndex(indexesResult.indexes[persistItem]);
        })
            .then(function (result) {
            return result;
        })
            .catch(function (error) {
            throw error;
        });
    }
});
electron_1.ipcMain.handle('import-file', function (event, filePath, fileType, delimiter) {
    return importFile_1.importFile(filePath, fileType, delimiter);
});
electron_1.ipcMain.handle('export-file', function (event, filePath, fileType, delimiter) {
    var exportFilePath;
    if (path.isAbsolute(filePath)) {
        exportFilePath = filePath;
    }
    else {
        exportFilePath = path.join(__dirname, '..', '..', '..', filePath);
    }
    return exportFile_1.exportFile(exportFilePath, fileType, delimiter);
});
//# sourceMappingURL=ipc.js.map