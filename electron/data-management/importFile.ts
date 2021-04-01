import * as fs from 'fs';
import { ObjectID } from 'bson';
import { win } from '../../main';
import { getDb } from '../data-management/database';
const parse = require('csv-parse');

export const importFile = (filePath, fileType, delimiter) => {
  
  if(fileType === "JSON" && !(filePath.toLowerCase().endsWith(".json"))){
      return Promise.reject("Invalid JSON file.")
  };

  if(fileType === "CSV" && !(filePath.toLowerCase().endsWith(".csv"))){
    return Promise.reject("Invalid CSV file.")
  };

  if(fileType === "JSON"){
  
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (error, data)=>{
        if(error){
          return reject(error)
        }

        let parsedData;

        try {
          parsedData = JSON.parse(data);
          // return resolve(parsedData);
        } catch (error) {
          return reject(error);
        }

        let transferCount = 0;
        let transferPercentage = 0;

        let promises = [];

        if(Array.isArray(parsedData)){
          
          win.webContents.send('file-transfer-details', '0', '0', parsedData.length + '');

          parsedData.forEach(item => {
            let itemToPersist;
            if(!item._id){
              itemToPersist = {_id: new ObjectID().toHexString(), ...item};
            }else{
              itemToPersist = item;
            }

            promises.push(getDb().put(itemToPersist)
            .then((result)=>{
              transferCount++;
              transferPercentage = Math.round((transferCount / parsedData.length) * 100);
              win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', parsedData.length + '');
              return result;
            })
            .catch(error => {
              return {error: error};
            }))
          })

        }else{

          win.webContents.send('file-transfer-details', '0', '0', '1');
          
          let itemToPersist;
          if(!parsedData._id){
            itemToPersist = {_id: new ObjectID().toHexString(), ...parsedData};
          }else{
            itemToPersist = parsedData;
          }

          promises.push(getDb().put(itemToPersist)
          .then((result)=>{
            win.webContents.send('file-transfer-details', '1', '100', '1');
            return result;
          })
          .catch(error => {
            return {error: error};
          }))
  
        }

        return resolve(
          Promise.all(promises)
          .then(results => {
            return results;
          })
          .catch(error => {
            throw error;
          })
        );

      })
  
    });

  }else if(fileType === "CSV"){

    return new Promise((resolve, reject) => {

      let transferCount = 0;
      let transferPercentage = 0;
      let csvRowCount = 0;
      let promises = [];

      // Create the parser
      const parser = parse({
        delimiter: delimiter,
        columns: true
      });

      // Use the readable stream api
      parser.on('readable', function(){
        let record
        while (record = parser.read()) {
          
          let itemToPersist;
          if(!record._id){
            itemToPersist = {_id: new ObjectID().toHexString(), ...record};
          }else{
            itemToPersist = record;
          }

          promises.push(getDb().put(itemToPersist)
            .then((result)=>{
              transferCount++;
              transferPercentage = Math.round((transferCount / csvRowCount) * 100);
              win.webContents.send('file-transfer-details', transferCount + '', transferPercentage + '', csvRowCount + '');
              return result;
            })
            .catch(error => {
              return {error: error};
            }))

        }

      });

      // Catch any error
      parser.on('error', function(error){
        // console.error(err.message);
        promises.push({error: error});
      });

      // When we are done, test that the parsed output matched what expected
      parser.on('end', function(){

        return resolve(
          Promise.all(promises)
          .then(results => {
            return results;
          })
          .catch(error => {
            throw error;
          })
        );

      });

      const LINE_BREAK_ASCII_CODE = '\n'.charCodeAt(0);

      fs.createReadStream(filePath)
        .on('data', function(chunk) {
          for (let i=0; i < chunk.length; ++i)
            if (chunk[i] == LINE_BREAK_ASCII_CODE) csvRowCount++;
        })
        .on('end', function() {
          win.webContents.send('file-transfer-details', '0', '0', csvRowCount + '');

          fs.createReadStream(filePath)
          .on('data', function(chunk) {
            
            parser.write(chunk);

          })
          .on('end', function() {

            parser.end();

          })
          .on('error', function(error) {
            return reject(error);
          });

        })
        .on('error', function(error) {
          return reject(error);
        });
  
    });

  }
}