const PouchDB = require('pouchdb-node');
PouchDB.plugin(require('transform-pouch'));
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-size'));
import { app } from 'electron';

import { encrypt, decrypt, setSecretKey, setCryptographyAlgorithm } from './cryptography';
import * as path from 'path';

let dbStoragePath;

let db;

const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

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

export const getDb = () => {
    return db;
}

export const connectToDatabase = (storagePath) => {
    if(path.isAbsolute(storagePath)){
        dbStoragePath = storagePath;
    }else{
        if(serve){
            dbStoragePath = path.join(__dirname, '..', '..', '..',storagePath);
        }else{
            dbStoragePath = path.join(app.getPath('home'), storagePath);
        }
    }
    db = new PouchDB(dbStoragePath, {auto_compaction: true});
    db.installSizeWrapper();
    return dbStoragePath;
}

export const closeDatabase = () => {
    
    if(db){
        setSecretKey(null);
        setCryptographyAlgorithm(null);
        let copyOfClosedPath = dbStoragePath;
        return db.close().then(()=>{
            db = null;
            return ("Closed database: " + copyOfClosedPath);
        })
        .catch(error => {
            throw error;
        });
    }
}

export const applyEncryptionOnly = (secretKey, cryptoAlgorithm) => {
    if(db){
        return closeDatabase().then(()=>{

            setSecretKey(secretKey);
            setCryptographyAlgorithm(cryptoAlgorithm);
            connectToDatabase(dbStoragePath);
            db.transform({
                incoming: function(doc){
                    for(const property in doc) {
                        if(property !== "_id" && property !== "_rev"){
                            doc[property] = encrypt(JSON.stringify(doc[property]));
                        }
                    };
                    return doc;
                },
                outgoing: function(doc){
                    return doc;
                }
            });

            return null;

        }).catch(error => {

            throw error;

        });
        
    }
}

export const applyDecryptionOnly = (secretKey, cryptoAlgorithm) => {
    if(db){
        return closeDatabase().then(()=>{

            setSecretKey(secretKey);
            setCryptographyAlgorithm(cryptoAlgorithm);
            connectToDatabase(dbStoragePath);
            db.transform({
                incoming: function(doc){
                    return doc;
                },
                outgoing: function(doc){
                    for(const property in doc) {
                        if(property !== "_id" && property !== "_rev"){
                            try {
                                doc[property] = JSON.parse(decrypt(doc[property]));
                            } catch(error){
                                return doc;
                            }
                        }
                    };
                    return doc;
                }
            });

            return null;

        }).catch(error => {

            throw error;

        });
        
    }
}

export const applyEncryptionAndDecryption = (secretKey, cryptoAlgorithm) => {
    if(db){
        return closeDatabase().then(()=>{

            setSecretKey(secretKey);
            setCryptographyAlgorithm(cryptoAlgorithm);
            connectToDatabase(dbStoragePath);
            db.transform({
                incoming: function(doc){
                    for(const property in doc) {
                        if(property !== "_id" && property !== "_rev"){
                            doc[property] = encrypt(JSON.stringify(doc[property]));
                        }
                    };
                    return doc;
                },
                outgoing: function(doc){
                    for(const property in doc) {
                        if(property !== "_id" && property !== "_rev"){
                            try {
                                doc[property] = JSON.parse(decrypt(doc[property]));
                            } catch(error){
                                return doc;
                            }
                        }
                    };
                    return doc;
                }
            });

            return null;

        }).catch(error => {

            throw error;

        });
        
    }
}

export const removeEncryptionAndDecryption = () => {
    if(db){
        return closeDatabase().then(()=>{

            setSecretKey(null);
            setCryptographyAlgorithm(null);
            connectToDatabase(dbStoragePath);
            db.transform({
                incoming: function(doc){
                    return doc;
                },
                outgoing: function(doc){
                    return doc;
                }
            });

            return null;

        }).catch(error => {

            throw error;

        });
        
    }
}

