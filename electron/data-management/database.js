"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEncryptionAndDecryption = exports.applyEncryptionAndDecryption = exports.applyDecryptionOnly = exports.applyEncryptionOnly = exports.closeDatabase = exports.connectToDatabase = exports.getDb = void 0;
var PouchDB = require('pouchdb-node');
PouchDB.plugin(require('transform-pouch'));
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-size'));
var cryptography_1 = require("./cryptography");
var path = require("path");
var dbStoragePath;
var db;
// export const setStoragePath = (newStoragePath) => {
//     //check in path is absolute
//     let pathIsAbsolute = path.isAbsolute(newStoragePath);
//     //check if application is running on a Mac
//     // if(process.platform === 'darwin'){
//     //     dbStoragePath = 'local-emar-db';
//     //     console.log("System platform: " + process.platform + "\n" 
//     //         + "Database storage location: " + dbStoragePath +"\n");
//     // }else{
//     //     dbStoragePath = 'C:/local-emar-db';
//     //     console.log("System platform: " + process.platform + "\n" 
//     //         + "Database storage location " + dbStoragePath + "\n");
//     // };
//     dbStoragePath = newStoragePath;
// }
exports.getDb = function () {
    return db;
};
exports.connectToDatabase = function (storagePath) {
    if (path.isAbsolute(storagePath)) {
        dbStoragePath = storagePath;
    }
    else {
        dbStoragePath = path.join(__dirname, '..', '..', '..', storagePath);
    }
    db = new PouchDB(dbStoragePath);
    db.installSizeWrapper();
    return dbStoragePath;
};
exports.closeDatabase = function () {
    if (db) {
        cryptography_1.setSecretKey(null);
        cryptography_1.setCryptographyAlgorithm(null);
        var copyOfClosedPath_1 = dbStoragePath;
        return db.close().then(function () {
            db = null;
            return ("Closed database: " + copyOfClosedPath_1);
        })
            .catch(function (error) {
            throw error;
        });
    }
};
exports.applyEncryptionOnly = function (secretKey, cryptoAlgorithm) {
    if (db) {
        return exports.closeDatabase().then(function () {
            cryptography_1.setSecretKey(secretKey);
            cryptography_1.setCryptographyAlgorithm(cryptoAlgorithm);
            exports.connectToDatabase(dbStoragePath);
            db.transform({
                incoming: function (doc) {
                    for (var property in doc) {
                        if (property !== "_id" && property !== "_rev") {
                            doc[property] = cryptography_1.encrypt(JSON.stringify(doc[property]));
                        }
                    }
                    ;
                    return doc;
                },
                outgoing: function (doc) {
                    return doc;
                }
            });
            return null;
        }).catch(function (error) {
            throw error;
        });
    }
};
exports.applyDecryptionOnly = function (secretKey, cryptoAlgorithm) {
    if (db) {
        return exports.closeDatabase().then(function () {
            cryptography_1.setSecretKey(secretKey);
            cryptography_1.setCryptographyAlgorithm(cryptoAlgorithm);
            exports.connectToDatabase(dbStoragePath);
            db.transform({
                incoming: function (doc) {
                    return doc;
                },
                outgoing: function (doc) {
                    for (var property in doc) {
                        if (property !== "_id" && property !== "_rev") {
                            try {
                                doc[property] = JSON.parse(cryptography_1.decrypt(doc[property]));
                            }
                            catch (error) {
                                return doc;
                            }
                        }
                    }
                    ;
                    return doc;
                }
            });
            return null;
        }).catch(function (error) {
            throw error;
        });
    }
};
exports.applyEncryptionAndDecryption = function (secretKey, cryptoAlgorithm) {
    if (db) {
        return exports.closeDatabase().then(function () {
            cryptography_1.setSecretKey(secretKey);
            cryptography_1.setCryptographyAlgorithm(cryptoAlgorithm);
            exports.connectToDatabase(dbStoragePath);
            db.transform({
                incoming: function (doc) {
                    for (var property in doc) {
                        if (property !== "_id" && property !== "_rev") {
                            doc[property] = cryptography_1.encrypt(JSON.stringify(doc[property]));
                        }
                    }
                    ;
                    return doc;
                },
                outgoing: function (doc) {
                    for (var property in doc) {
                        if (property !== "_id" && property !== "_rev") {
                            try {
                                doc[property] = JSON.parse(cryptography_1.decrypt(doc[property]));
                            }
                            catch (error) {
                                return doc;
                            }
                        }
                    }
                    ;
                    return doc;
                }
            });
            return null;
        }).catch(function (error) {
            throw error;
        });
    }
};
exports.removeEncryptionAndDecryption = function () {
    if (db) {
        return exports.closeDatabase().then(function () {
            cryptography_1.setSecretKey(null);
            cryptography_1.setCryptographyAlgorithm(null);
            exports.connectToDatabase(dbStoragePath);
            db.transform({
                incoming: function (doc) {
                    return doc;
                },
                outgoing: function (doc) {
                    return doc;
                }
            });
            return null;
        }).catch(function (error) {
            throw error;
        });
    }
};
//# sourceMappingURL=database.js.map