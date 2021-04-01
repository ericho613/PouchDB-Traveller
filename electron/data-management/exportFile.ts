import * as fs from 'fs';
import { win } from '../../main';
import { getDb } from '../data-management/database';
const stringify = require('csv-stringify');

let transferCount = 0;
let transferPercentage = 0;
let csvRowCount = 0;
let errorsArray = [];

const recursiveFetchDocsAndCreateJSON = (filePath, isFirstInsert?, startKey?) => {
    return getDb().allDocs({include_docs: true, limit: 50, skip: startKey? 1 : 0, startkey: startKey})
    .then(results => {
      
        if(results.rows.length < 1){
            return "Export complete";
        }

        csvRowCount = results.total_rows;
                
        if(isFirstInsert){

          return new Promise((resolve, reject) => {

            let newDocsArray = [];
            for(let row of results.rows){
                let unmodifiedDoc = row.doc;
                let unmodifiedDocId = unmodifiedDoc._id;
                let unmodifiedDocRev = unmodifiedDoc._rev;
                delete unmodifiedDoc._id;
                delete unmodifiedDoc._rev;
                let modifiedDoc = {_id: unmodifiedDocId, ...unmodifiedDoc, _rev: unmodifiedDocRev};
                newDocsArray.push(modifiedDoc);
            }

            let stringifiedData;
            try {
              stringifiedData = JSON.stringify(newDocsArray);
            } catch (error) {
              return reject(error);
            }

            fs.writeFile(filePath, stringifiedData, (error)=>{
                if(error){
                  errorsArray.push({error: error});
                }else{
                  transferCount += results.rows.length;
                  transferPercentage = Math.round((transferCount / csvRowCount) * 100);
                  win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', csvRowCount + '');
                }
                
                return resolve(recursiveFetchDocsAndCreateJSON(filePath, false, results.rows[results.rows.length -1]["id"]));
                
            })

          })

        }else{

            return new Promise((resolve, reject) => {

                fs.readFile(filePath, 'utf-8', (error, data)=>{
                    if(error){
                      return reject(error)
                    };

                    let parsedData;

                    try {
                        parsedData = JSON.parse(data);
                    } catch (error) {
                        return reject(error);
                    }
                
                    let newDocsArray = [];
                    for(let row of results.rows){
                        let unmodifiedDoc = row.doc;
                        let unmodifiedDocId = unmodifiedDoc._id;
                        let unmodifiedDocRev = unmodifiedDoc._rev;
                        delete unmodifiedDoc._id;
                        delete unmodifiedDoc._rev;
                        let modifiedDoc = {_id: unmodifiedDocId, ...unmodifiedDoc, _rev: unmodifiedDocRev};
                        newDocsArray.push(modifiedDoc);
                    }

                    let combinedArray = parsedData.concat(newDocsArray);

                    let stringifiedData;
                    try {
                        stringifiedData = JSON.stringify(combinedArray);
                    } catch (error) {
                        return reject(error);
                    }

                    fs.writeFile(filePath, stringifiedData, (error)=>{
                        if(error){
                          errorsArray.push({error: error});
                        }else{
                          transferCount += results.rows.length;
                          transferPercentage = Math.round((transferCount / csvRowCount) * 100);
                          win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', csvRowCount + '');
                        }
                        
                        return resolve(recursiveFetchDocsAndCreateJSON(filePath, false, results.rows[results.rows.length -1]["id"]));
                        
                    })
                
                })

            });

        }

    })
    .catch(error => {
        throw error;
    })
}

const recursiveFetchDocsAndCreateCSV = (filePath, isFirstInsert, startKey, delimiter) => {
  
  return getDb().allDocs({include_docs: true, limit: 50, skip: startKey? 1 : 0, startkey: startKey})
  .then(results => {

    if(results.rows.length < 1){
        return "Export complete";
    }

    csvRowCount = results.total_rows;
            
    return new Promise((resolve, reject) => {

      let newDocsArray = [];
      for(let row of results.rows){
        let unmodifiedDoc = row.doc;
        let unmodifiedDocId = unmodifiedDoc._id;
        let unmodifiedDocRev = unmodifiedDoc._rev;
        delete unmodifiedDoc._id;
        delete unmodifiedDoc._rev;
        let modifiedDoc = {_id: unmodifiedDocId, ...unmodifiedDoc, _rev: unmodifiedDocRev};
        newDocsArray.push(modifiedDoc);
      }

      if(isFirstInsert){
        stringify(newDocsArray,
          {
            header: true,
            columns: Object.keys(newDocsArray[0]),
            delimiter: delimiter
          }, 
          
          function(error, data){

            if(error){

              return reject(error);

            }else{

              fs.writeFile(filePath, data, (error)=>{
                if(error){
                  errorsArray.push({error: error});
                }else{
                  transferCount += results.rows.length;
                  transferPercentage = Math.round((transferCount / csvRowCount) * 100);
                  win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', csvRowCount + '');
                }
                return resolve(recursiveFetchDocsAndCreateCSV(filePath, false, results.rows[results.rows.length -1]["id"], delimiter));
                
              })

            }

          })
  
      }else{

        stringify(newDocsArray,
          {
            delimiter: delimiter
          }, 
          function(error, data){

            if(error){

              return reject(error);

            }else{

              fs.appendFile(filePath, data, (error)=>{
                if(error){
                  errorsArray.push({error: error});
                }else{
                  transferCount += results.rows.length;
                  transferPercentage = Math.round((transferCount / csvRowCount) * 100);
                  win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', csvRowCount + '');
                }
                return resolve(recursiveFetchDocsAndCreateCSV(filePath, false, results.rows[results.rows.length -1]["id"], delimiter));
                
              })

            }

          })

      }

    })

  })
  .catch(error => {
      throw error;
  })
}

export const exportFile = (filePath, fileType, delimiter) => {
  
  if(fileType === "JSON" && !(filePath.toLowerCase().endsWith(".json"))){
      return Promise.reject("Invalid JSON file.")
  };

  if(fileType === "CSV" && !(filePath.toLowerCase().endsWith(".csv"))){
    return Promise.reject("Invalid CSV file.")
  };

  if(fileType === "JSON"){
  
    return new Promise((resolve, reject) => {

      getDb().info((error, info) => {
        if(error){
          return reject(error);
        }
        
        win.webContents.send('file-transfer-details', '0', '0', info.doc_count + '');

        return recursiveFetchDocsAndCreateJSON(filePath, true, null)
        .then(result => {
          if(result === "Export complete"){
              let copyOfErrorsArray = [...errorsArray];
              transferCount = 0;
              transferPercentage = 0;
              csvRowCount = 0;
              errorsArray = [];
              return resolve(copyOfErrorsArray);
          }
        })
        .catch(error => {
            return reject(error);
        })

      })

    });

  }else if(fileType === "CSV"){

    return new Promise((resolve, reject) => {

      getDb().info((error, info) => {
        if(error){
          return reject(error);
        }
        
        win.webContents.send('file-transfer-details', '0', '0', info.doc_count + '');

        return recursiveFetchDocsAndCreateCSV(filePath, true, null, delimiter)
        .then(result => {
          if(result === "Export complete"){
              let copyOfErrorsArray = [...errorsArray];
              transferCount = 0;
              transferPercentage = 0;
              csvRowCount = 0;
              errorsArray = [];
              return resolve(copyOfErrorsArray);
          }
        })
        .catch(error => {
            return reject(error);
        })

      })
  
    });

  }
}