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
Object.defineProperty(exports, "__esModule", { value: true });
exports.importFile = void 0;
var fs = require("fs");
var bson_1 = require("bson");
var main_1 = require("../../main");
var database_1 = require("../data-management/database");
var parse = require('csv-parse');
exports.importFile = function (filePath, fileType, delimiter) {
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
            fs.readFile(filePath, 'utf-8', function (error, data) {
                if (error) {
                    return reject(error);
                }
                var parsedData;
                try {
                    parsedData = JSON.parse(data);
                    // return resolve(parsedData);
                }
                catch (error) {
                    return reject(error);
                }
                var transferCount = 0;
                var transferPercentage = 0;
                var promises = [];
                if (Array.isArray(parsedData)) {
                    main_1.win.webContents.send('file-transfer-details', '0', '0', parsedData.length + '');
                    parsedData.forEach(function (item) {
                        var itemToPersist;
                        if (!item._id) {
                            itemToPersist = __assign({ _id: new bson_1.ObjectID().toHexString() }, item);
                        }
                        else {
                            itemToPersist = item;
                        }
                        promises.push(database_1.getDb().put(itemToPersist)
                            .then(function (result) {
                            transferCount++;
                            transferPercentage = Math.round((transferCount / parsedData.length) * 100);
                            main_1.win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', parsedData.length + '');
                            return result;
                        })
                            .catch(function (error) {
                            return { error: error };
                        }));
                    });
                }
                else {
                    main_1.win.webContents.send('file-transfer-details', '0', '0', '1');
                    var itemToPersist = void 0;
                    if (!parsedData._id) {
                        itemToPersist = __assign({ _id: new bson_1.ObjectID().toHexString() }, parsedData);
                    }
                    else {
                        itemToPersist = parsedData;
                    }
                    promises.push(database_1.getDb().put(itemToPersist)
                        .then(function (result) {
                        main_1.win.webContents.send('file-transfer-details', '1', '100', '1');
                        return result;
                    })
                        .catch(function (error) {
                        return { error: error };
                    }));
                }
                return resolve(Promise.all(promises)
                    .then(function (results) {
                    return results;
                })
                    .catch(function (error) {
                    throw error;
                }));
            });
        });
    }
    else if (fileType === "CSV") {
        return new Promise(function (resolve, reject) {
            var transferCount = 0;
            var transferPercentage = 0;
            var csvRowCount = 0;
            var promises = [];
            // Create the parser
            var parser = parse({
                delimiter: delimiter,
                columns: true
            });
            // Use the readable stream api
            parser.on('readable', function () {
                var record;
                while (record = parser.read()) {
                    var itemToPersist = void 0;
                    if (!record._id) {
                        itemToPersist = __assign({ _id: new bson_1.ObjectID().toHexString() }, record);
                    }
                    else {
                        itemToPersist = record;
                    }
                    promises.push(database_1.getDb().put(itemToPersist)
                        .then(function (result) {
                        transferCount++;
                        transferPercentage = Math.round((transferCount / csvRowCount) * 100);
                        main_1.win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', csvRowCount + '');
                        return result;
                    })
                        .catch(function (error) {
                        return { error: error };
                    }));
                }
            });
            // Catch any error
            parser.on('error', function (error) {
                // console.error(err.message);
                promises.push({ error: error });
            });
            // When we are done, test that the parsed output matched what expected
            parser.on('end', function () {
                return resolve(Promise.all(promises)
                    .then(function (results) {
                    return results;
                })
                    .catch(function (error) {
                    throw error;
                }));
            });
            var LINE_BREAK_ASCII_CODE = '\n'.charCodeAt(0);
            fs.createReadStream(filePath)
                .on('data', function (chunk) {
                for (var i = 0; i < chunk.length; ++i)
                    if (chunk[i] == LINE_BREAK_ASCII_CODE)
                        csvRowCount++;
            })
                .on('end', function () {
                main_1.win.webContents.send('file-transfer-details', '0', '0', csvRowCount + '');
                fs.createReadStream(filePath)
                    .on('data', function (chunk) {
                    parser.write(chunk);
                })
                    .on('end', function () {
                    parser.end();
                })
                    .on('error', function (error) {
                    return reject(error);
                });
            })
                .on('error', function (error) {
                return reject(error);
            });
        });
    }
};
//# sourceMappingURL=importFile.js.map