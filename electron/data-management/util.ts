//function to transform bytes to other representations
// of size based on the number of bytes
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
//function to transform the raw data from fetching pouchDB 
// indexes to a format used by the index table
export function transformIndexData(indexData){
    
    let modifiedData = [];
    let modifiedIndexInfoObject;
    
    indexData.forEach(indexInfoObject => {

    let fieldsArray = [];

    indexInfoObject.def.fields.forEach((fieldObject)=>{
        Object.keys(fieldObject).forEach((fieldKey)=>{
        fieldsArray.push(fieldKey + ":"+ fieldObject[fieldKey]);
        })
    })

    modifiedIndexInfoObject = {...indexInfoObject};
    delete modifiedIndexInfoObject.def;
    modifiedIndexInfoObject["fields"] = fieldsArray;

    modifiedData.push(modifiedIndexInfoObject);

    })

    return modifiedData;

}