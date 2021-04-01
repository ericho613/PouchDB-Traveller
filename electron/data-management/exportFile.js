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
exports.exportFile = void 0;
var fs = require("fs");
var main_1 = require("../../main");
var database_1 = require("../data-management/database");
var stringify = require('csv-stringify');
var transferCount = 0;
var transferPercentage = 0;
var csvRowCount = 0;
var errorsArray = [];
var recursiveFetchDocsAndCreateJSON = function (filePath, isFirstInsert, startKey) {
    return database_1.getDb().allDocs({ include_docs: true, limit: 50, skip: startKey ? 1 : 0, startkey: startKey })
        .then(function (results) {
        if (results.rows.length < 1) {
            return "Export complete";
        }
        csvRowCount = results.total_rows;
        if (isFirstInsert) {
            return new Promise(function (resolve, reject) {
                var newDocsArray = [];
                for (var _i = 0, _a = results.rows; _i < _a.length; _i++) {
                    var row = _a[_i];
                    var unmodifiedDoc = row.doc;
                    var unmodifiedDocId = unmodifiedDoc._id;
                    var unmodifiedDocRev = unmodifiedDoc._rev;
                    delete unmodifiedDoc._id;
                    delete unmodifiedDoc._rev;
                    var modifiedDoc = __assign(__assign({ _id: unmodifiedDocId }, unmodifiedDoc), { _rev: unmodifiedDocRev });
                    newDocsArray.push(modifiedDoc);
                }
                var stringifiedData;
                try {
                    stringifiedData = JSON.stringify(newDocsArray);
                }
                catch (error) {
                    return reject(error);
                }
                fs.writeFile(filePath, stringifiedData, function (error) {
                    if (error) {
                        errorsArray.push({ error: error });
                    }
                    else {
                        transferCount += results.rows.length;
                        transferPercentage = Math.round((transferCount / csvRowCount) * 100);
                        main_1.win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', csvRowCount + '');
                    }
                    return resolve(recursiveFetchDocsAndCreateJSON(filePath, false, results.rows[results.rows.length - 1]["id"]));
                });
            });
        }
        else {
            return new Promise(function (resolve, reject) {
                fs.readFile(filePath, 'utf-8', function (error, data) {
                    if (error) {
                        return reject(error);
                    }
                    ;
                    var parsedData;
                    try {
                        parsedData = JSON.parse(data);
                    }
                    catch (error) {
                        return reject(error);
                    }
                    var newDocsArray = [];
                    for (var _i = 0, _a = results.rows; _i < _a.length; _i++) {
                        var row = _a[_i];
                        var unmodifiedDoc = row.doc;
                        var unmodifiedDocId = unmodifiedDoc._id;
                        var unmodifiedDocRev = unmodifiedDoc._rev;
                        delete unmodifiedDoc._id;
                        delete unmodifiedDoc._rev;
                        var modifiedDoc = __assign(__assign({ _id: unmodifiedDocId }, unmodifiedDoc), { _rev: unmodifiedDocRev });
                        newDocsArray.push(modifiedDoc);
                    }
                    var combinedArray = parsedData.concat(newDocsArray);
                    var stringifiedData;
                    try {
                        stringifiedData = JSON.stringify(combinedArray);
                    }
                    catch (error) {
                        return reject(error);
                    }
                    fs.writeFile(filePath, stringifiedData, function (error) {
                        if (error) {
                            errorsArray.push({ error: error });
                        }
                        else {
                            transferCount += results.rows.length;
                            transferPercentage = Math.round((transferCount / csvRowCount) * 100);
                            main_1.win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', csvRowCount + '');
                        }
                        return resolve(recursiveFetchDocsAndCreateJSON(filePath, false, results.rows[results.rows.length - 1]["id"]));
                    });
                });
            });
        }
    })
        .catch(function (error) {
        throw error;
    });
};
var recursiveFetchDocsAndCreateCSV = function (filePath, isFirstInsert, startKey, delimiter) {
    return database_1.getDb().allDocs({ include_docs: true, limit: 50, skip: startKey ? 1 : 0, startkey: startKey })
        .then(function (results) {
        if (results.rows.length < 1) {
            return "Export complete";
        }
        csvRowCount = results.total_rows;
        return new Promise(function (resolve, reject) {
            var newDocsArray = [];
            for (var _i = 0, _a = results.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                var unmodifiedDoc = row.doc;
                var unmodifiedDocId = unmodifiedDoc._id;
                var unmodifiedDocRev = unmodifiedDoc._rev;
                delete unmodifiedDoc._id;
                delete unmodifiedDoc._rev;
                var modifiedDoc = __assign(__assign({ _id: unmodifiedDocId }, unmodifiedDoc), { _rev: unmodifiedDocRev });
                newDocsArray.push(modifiedDoc);
            }
            if (isFirstInsert) {
                stringify(newDocsArray, {
                    header: true,
                    columns: Object.keys(newDocsArray[0]),
                    delimiter: delimiter
                }, function (error, data) {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        fs.writeFile(filePath, data, function (error) {
                            if (error) {
                                errorsArray.push({ error: error });
                            }
                            else {
                                transferCount += results.rows.length;
                                transferPercentage = Math.round((transferCount / csvRowCount) * 100);
                                main_1.win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', csvRowCount + '');
                            }
                            return resolve(recursiveFetchDocsAndCreateCSV(filePath, false, results.rows[results.rows.length - 1]["id"], delimiter));
                        });
                    }
                });
            }
            else {
                stringify(newDocsArray, {
                    delimiter: delimiter
                }, function (error, data) {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        fs.appendFile(filePath, data, function (error) {
                            if (error) {
                                errorsArray.push({ error: error });
                            }
                            else {
                                transferCount += results.rows.length;
                                transferPercentage = Math.round((transferCount / csvRowCount) * 100);
                                main_1.win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', csvRowCount + '');
                            }
                            return resolve(recursiveFetchDocsAndCreateCSV(filePath, false, results.rows[results.rows.length - 1]["id"], delimiter));
                        });
                    }
                });
            }
        });
    })
        .catch(function (error) {
        throw error;
    });
};
exports.exportFile = function (filePath, fileType, delimiter) {
    if (fileType === "JSON" && !(filePath.toLowerCase().endsWith(".json"))) {
        return Promise.reject("Invalid JSON file.");
    }
    ;
    if (fileType === "CSV" && !(filePath.toLowerCase().endsWith(".csv"))) {
        return Promise.reject("Invalid CSV file.");
    }
    ;
    if (fileType === "JSON") {
        return new Promise(function (resolve, reject) {
            database_1.getDb().info(function (error, info) {
                if (error) {
                    return reject(error);
                }
                main_1.win.webContents.send('file-transfer-details', '0', '0', info.doc_count + '');
                return recursiveFetchDocsAndCreateJSON(filePath, true, null)
                    .then(function (result) {
                    if (result === "Export complete") {
                        var copyOfErrorsArray = __spreadArrays(errorsArray);
                        transferCount = 0;
                        transferPercentage = 0;
                        csvRowCount = 0;
                        errorsArray = [];
                        return resolve(copyOfErrorsArray);
                    }
                })
                    .catch(function (error) {
                    return reject(error);
                });
            });
        });
    }
    else if (fileType === "CSV") {
        return new Promise(function (resolve, reject) {
            database_1.getDb().info(function (error, info) {
                if (error) {
                    return reject(error);
                }
                main_1.win.webContents.send('file-transfer-details', '0', '0', info.doc_count + '');
                return recursiveFetchDocsAndCreateCSV(filePath, true, null, delimiter)
                    .then(function (result) {
                    if (result === "Export complete") {
                        var copyOfErrorsArray = __spreadArrays(errorsArray);
                        transferCount = 0;
                        transferPercentage = 0;
                        csvRowCount = 0;
                        errorsArray = [];
                        return resolve(copyOfErrorsArray);
                    }
                })
                    .catch(function (error) {
                    return reject(error);
                });
            });
        });
    }
};
//# sourceMappingURL=exportFile.js.map