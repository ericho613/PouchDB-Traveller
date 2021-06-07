import { ipcMain, dialog, app } from 'electron';
import { win } from '../../main';
import { getDb, connectToDatabase, closeDatabase, applyEncryptionOnly, applyDecryptionOnly, applyEncryptionAndDecryption, removeEncryptionAndDecryption } from '../data-management/database';
import { formatBytes, transformIndexData } from '../data-management/util';
import { createFetchOptions, fetchNextPage, clearPaginationDetails, getPreviousFetchOptions } from '../data-management/pagination';
import * as path from 'path';
import * as fs from 'fs';
//need to import childForkBuildFileTree even if we don't use it in this file,
// so that we can create the JS file from the TS file
import * as childForkBuildFileTree from '../data-management/childForkBuildFileTree'
import { importFile } from '../data-management/importFile';
import { exportFile } from '../data-management/exportFile';
import { ObjectID } from 'bson';
const recentsFilePath = path.join(app.getPath('userData'),'recents.json');
const favoritesFilePath = path.join(app.getPath('userData'),'favorites.json');

import { checkForUpdates } from '../updater/updater';

const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

ipcMain.handle('check-for-updates', event => {
  checkForUpdates();
})

ipcMain.on('open-folder-browse', event => {

  return event.returnValue = dialog.showOpenDialogSync(win, {
    buttonLabel: 'Select Folder',
    // defaultPath: app.getPath('desktop'),
    properties: ['createDirectory', 'openDirectory']
  });
  
})

ipcMain.on('open-file-browse', event => {

  return event.returnValue = dialog.showOpenDialogSync(win, {
    buttonLabel: 'Open',
    // defaultPath: app.getPath('desktop'),
    properties: ['createDirectory', 'openFile']
  });
  
})

ipcMain.on('open-file-save-browse', (event, fileType) => {

  let filters = [];
  if(fileType === 'JSON'){
    filters.push({ name: 'json file', extensions: ['json'] });
  };

  if(fileType === 'CSV'){
    filters.push({ name: 'csv file', extensions: ['csv'] });
  };

  if(!fileType){
    filters = [
      { name: 'json file', extensions: ['json'] },
      { name: 'csv file', extensions: ['csv'] }
    ]
  }

  return event.returnValue = dialog.showSaveDialogSync(win, {
    buttonLabel: 'Select',
    // defaultPath: app.getPath('desktop'),
    filters: filters,
    properties: ['createDirectory']
  });
  
})

ipcMain.handle('fetch-favorites', event => {

  return new Promise((resolve, reject) => {
    fs.readFile(favoritesFilePath, 'utf-8', (error, data)=>{
      if(error){
        return reject(error)
      }
      try {
        let parsedData = JSON.parse(data);
        return resolve(parsedData);
      } catch (error) {
        return reject(error);
      }
      
    })

  });

})

ipcMain.handle('fetch-recents', event => {

  return new Promise((resolve, reject) => {
    fs.readFile(recentsFilePath, 'utf-8', (error, data)=>{
      if(error){
        return reject(error)
      }
      try {
        let parsedData = JSON.parse(data);
        return resolve(parsedData);
      } catch (error) {
        return reject(error);
      }
      
    })

  });

})

ipcMain.handle('store-favorites', (event, favoritesArray) => {
  return new Promise((resolve, reject) => {

    let stringifiedData;
    try {
      stringifiedData = JSON.stringify(favoritesArray);
    } catch (error) {
      return reject(error);
    }

    fs.writeFile(favoritesFilePath, stringifiedData, (error)=>{
      if(error){
        return reject(error)
      }
      resolve("Stored favorites.");
      
    })

  });

})

ipcMain.handle('store-recents', (event, recentsArray) => {
  return new Promise((resolve, reject) => {

    let stringifiedData;
    try {
      stringifiedData = JSON.stringify(recentsArray);
    } catch (error) {
      return reject(error);
    }

    fs.writeFile(recentsFilePath, stringifiedData, (error)=>{
      if(error){
        return reject(error)
      }
      resolve("Stored recents.");
      
    })

  });

})

ipcMain.handle('connect-to-database', (event, storagePath) => {
  return new Promise((resolve, reject) => {

    try {
      let connectedStoragePath = connectToDatabase(storagePath);
      let response = {
        message: "Connected database: " + connectedStoragePath,
        connectedStoragePath: connectedStoragePath
      }
      resolve(response)
    } catch (error) {
      return reject(error);
    }

  });

})

ipcMain.handle('close-database', (event) => {
  clearPaginationDetails();
  return closeDatabase()
    .then( response => {
      return response;
    })
    .catch(error => {
      throw error;
    });

})

ipcMain.handle('fetch-database-info', event => {

  return new Promise((resolve, reject) => {
    getDb().info((error, info) => {
      if(error){
        return reject(error);
      }

      let convertedBytesString = formatBytes(info.disk_size);
      return resolve({
        documentCount: info.doc_count,
        diskSize: convertedBytesString,
        // indexCount: string;
      });
    })

  });

})

ipcMain.handle('fetch-database-results', (event, fetchOptionsObj) => {

  if(!fetchOptionsObj && getPreviousFetchOptions() === null){
    let fetchOptions = createFetchOptions();
    return fetchNextPage(fetchOptions);
    
  }else if(!fetchOptionsObj && getPreviousFetchOptions()){
    let fetchOptions = getPreviousFetchOptions();
    return fetchNextPage(fetchOptions);
  }else{
    let fetchOptions = createFetchOptions(fetchOptionsObj.previousPageIndex, fetchOptionsObj.currentPageIndex, fetchOptionsObj.pageSize);
    return fetchNextPage(fetchOptions);
  }

})

ipcMain.on('reset-search', event => {

  clearPaginationDetails();

  return event.returnValue = "Fetch/search settings reset.";
  
})

ipcMain.handle('fetch-database-indexes', event => {

  return getDb()
  .getIndexes()
  .then(function (indexesObject) {
    return transformIndexData(indexesObject.indexes);
  })
  .catch(error => {
    throw error;
  });

})

ipcMain.handle('set-cryptography-settings', (event, cryptographySettingsObj) => {

  if(cryptographySettingsObj.applyEncryption && !cryptographySettingsObj.applyDecryption){

    return applyEncryptionOnly(cryptographySettingsObj.cryptoSecretKey, cryptographySettingsObj.cryptoSpec)
    .then(() => {
      return "Encryption applied.";
    })
    .catch(error => {
      throw error;
    });

  }else if(!cryptographySettingsObj.applyEncryption && cryptographySettingsObj.applyDecryption){

    return applyDecryptionOnly(cryptographySettingsObj.cryptoSecretKey, cryptographySettingsObj.cryptoSpec)
    .then(() => {
      return "Decryption applied.";
    })
    .catch(error => {
      throw error;
    });

  }else if(cryptographySettingsObj.applyEncryption && cryptographySettingsObj.applyDecryption){

    return applyEncryptionAndDecryption(cryptographySettingsObj.cryptoSecretKey, cryptographySettingsObj.cryptoSpec)
    .then(() => {
      return "Encryption and decryption applied.";
    })
    .catch(error => {
      throw error;
    });

  }else if(!cryptographySettingsObj.applyEncryption && !cryptographySettingsObj.applyDecryption){

    return removeEncryptionAndDecryption()
    .then(() => {
      return "Encryption and decryption removed.";
    })
    .catch(error => {
      throw error;
    });

  }

})

ipcMain.handle('persist', (event, persistType, persistItem) => {
  if(persistType === "create"){
    
    if(Array.isArray(persistItem)){
      let promises = [];
      // let errorPresent = false;
      persistItem.forEach(item => {
        let itemToPersist;
        if(!item._id){
          itemToPersist = {_id: new ObjectID().toHexString(), ...item};
        }else{
          itemToPersist = item;
        }

        if(itemToPersist["_rev"]){
          delete itemToPersist["_rev"];
        }

        promises.push(getDb().put(itemToPersist)
        .then((result)=>{
          return getDb().get(result["id"]);
        })
        .then(fetchedDbItem => {
          
          let unmodifiedDoc = fetchedDbItem;
          let unmodifiedDocId = unmodifiedDoc._id;
          let unmodifiedDocRev = unmodifiedDoc._rev;
          delete unmodifiedDoc._id;
          delete unmodifiedDoc._rev;
          let modifiedDoc = {_id: unmodifiedDocId, ...unmodifiedDoc, _rev: unmodifiedDocRev};

          return {result: modifiedDoc};
        })
        .catch(error => {
          // errorPresent = true;
          return {error: error};
          // throw error;
        }))
      })

      return Promise.all(promises)
        .then(results => {
          // if(errorPresent){
          //   throw new Error(util.inspect(results, {showHidden: false, depth: null}));
          // }
          return results;
        })
        .catch(error => {
          throw error;
        });

    }else{
      let itemToPersist;
      if(!persistItem._id){
        itemToPersist = {_id: new ObjectID().toHexString(), ...persistItem};
      }else{
        itemToPersist = persistItem;
      }

      if(itemToPersist["_rev"]){
        delete itemToPersist["_rev"];
      }

      return getDb().put(itemToPersist)
        .then((result)=>{
          return getDb().get(result["id"]);
        })
        .then(fetchedDbItem => {
          
          let unmodifiedDoc = fetchedDbItem;
          let unmodifiedDocId = unmodifiedDoc._id;
          let unmodifiedDocRev = unmodifiedDoc._rev;
          delete unmodifiedDoc._id;
          delete unmodifiedDoc._rev;
          let modifiedDoc = {_id: unmodifiedDocId, ...unmodifiedDoc, _rev: unmodifiedDocRev};

          return modifiedDoc;
        })
        .catch(error => {
          throw error;
        })
    }
    
  }else if(persistType === "update"){

    return getDb().get(persistItem["_id"]).then((doc) => {
      return getDb().put(
        {
          ...persistItem,
          _rev: doc._rev
        }
      )
    })
    .then((result) => {
      return getDb().get(result["id"]);
    })
    .then(fetchedDbItem => {
          
      let unmodifiedDoc = fetchedDbItem;
      let unmodifiedDocId = unmodifiedDoc._id;
      let unmodifiedDocRev = unmodifiedDoc._rev;
      delete unmodifiedDoc._id;
      delete unmodifiedDoc._rev;
      let modifiedDoc = {_id: unmodifiedDocId, ...unmodifiedDoc, _rev: unmodifiedDocRev};

      return modifiedDoc;
    })
    .catch((error) => {
      throw error;
    });

  }else if(persistType === "delete"){
    
    return getDb().get(persistItem).then((doc) => {
      return getDb().remove(doc);
    }).then((result) => {
      return result;
    }).catch((error) => {
      throw error;
    });

  }

})

ipcMain.handle('filter-search', (event, searchFilter) => {

  let filter;
  let sort;
  let limit;
  let skip;
  try {
    filter = searchFilter.filter? JSON.parse(searchFilter.filter) : null;
    sort = searchFilter.sort? JSON.parse(searchFilter.sort) : null;
    limit = searchFilter.limit? parseInt(searchFilter.limit) : null;
    skip = searchFilter.skip? parseInt(searchFilter.skip) : null;
  } catch (error) {
    return Promise.reject(error);
  };

  let findObj = {};
  if(filter){
    findObj["selector"] = {...filter};
  }else{
    findObj["selector"] = {};
  }
  if(sort){
    findObj["sort"] = [...sort];
  }
  if(limit){
    findObj["limit"] = limit;
  }
  if(skip){
    findObj["skip"] = skip;
  }

  if(searchFilter.sort){
    return getDb().createIndex({
      index: {
        fields: [...sort]
      }
    })
    .then(() => {
      return getDb().find(findObj)
    })
    .then(response => {
      let newDocsArray = [];
      for(let doc of response.docs){
        let unmodifiedDoc = doc;
        let unmodifiedDocId = unmodifiedDoc._id;
        let unmodifiedDocRev = unmodifiedDoc._rev;
        delete unmodifiedDoc._id;
        delete unmodifiedDoc._rev;
        let modifiedDoc = {_id: unmodifiedDocId, ...unmodifiedDoc, _rev: unmodifiedDocRev};
        newDocsArray.push(modifiedDoc);
      }

      return newDocsArray;
    })
    .catch(error => {
      throw error;
    })
  }

  return getDb().find({
    selector: {...filter},
    sort: ["_id"],
    limit: limit? limit : undefined,
    skip: skip
  })
  .then(response => {

    let newDocsArray = [];
    for(let doc of response.docs){
      let unmodifiedDoc = doc;
      let unmodifiedDocId = unmodifiedDoc._id;
      let unmodifiedDocRev = unmodifiedDoc._rev;
      delete unmodifiedDoc._id;
      delete unmodifiedDoc._rev;
      let modifiedDoc = {_id: unmodifiedDocId, ...unmodifiedDoc, _rev: unmodifiedDocRev};
      newDocsArray.push(modifiedDoc);
    }
    
    return newDocsArray;

  })
  .catch(error => {
    throw error;
  })
  
})

ipcMain.handle('persist-index', (event, persistIndexType, persistItem) => {
  if(persistIndexType === "create"){

    let modifiedIndexFieldsValue = [];

    if(typeof persistItem.fields !== "object"){
      return Promise.reject("Fields stated in incorrect format.")
    };

    persistItem.fields.forEach((element) => {
      if(typeof element === "object"){
        modifiedIndexFieldsValue = modifiedIndexFieldsValue.concat(element);
      }else{
        modifiedIndexFieldsValue.push(element);
      }
    });

    let modifiedPersistItem = persistItem;
    modifiedPersistItem.fields = modifiedIndexFieldsValue;
    
    return getDb().createIndex({...modifiedPersistItem})
      .then((result)=>{
        if(result.result === "created"){
          return result;
        }else{
          throw new Error("Index already exists.")
        };
        
      })
      .catch(error => {
        throw error;
      })

  }else if(persistIndexType === "delete"){
    
    return getDb().getIndexes()
    .then((indexesResult) => {
      return getDb().deleteIndex(indexesResult.indexes[persistItem])
    })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw error;
    });

  }

})

ipcMain.handle('import-file', (event, filePath, fileType, delimiter) => {

  return importFile(filePath, fileType, delimiter);

});



ipcMain.handle('export-file', (event, filePath, fileType, delimiter) => {

  let exportFilePath;

  if(path.isAbsolute(filePath)){
    exportFilePath = filePath;
  }else{
    if(serve){   
      exportFilePath = path.join(__dirname, '..', '..', '..',filePath);
    }else{
      exportFilePath = path.join(app.getPath('home'), filePath);
    }
  }

  return exportFile(exportFilePath, fileType, delimiter);

});