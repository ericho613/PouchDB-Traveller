import { getDb } from './database';

let finishedAtId;
let startedAtId;
let lastDirection = null;
let previousPageSize = null;
let previousFetchOptions = null;
let changedPageSize = false;
let totalDocumentCount;
let startingKeyIndexDifference = null;
let newPageSize;
let newLimit;

export const createFetchOptions = (previousPageIndex = 0 , currentPageIndex = 0, pageSize = 10) => {

  let fetchOptions = {include_docs: true};

  fetchOptions["limit"] = pageSize;
  

  //first fetch
  if((previousFetchOptions === null)){
    // console.log("first fetch");
    fetchOptions["descending"] = false;
    fetchOptions["skip"] = 0;
    previousFetchOptions = fetchOptions;
    lastDirection = "forward";
    previousPageSize =  pageSize;
    changedPageSize = false;
    return fetchOptions;
  }

  //when the page size decreases
  if(pageSize < previousPageSize && previousPageSize !==null){
    // console.log(pageSize);
    // console.log(previousPageSize);
    // console.log("page size decrease");
    let newStartKey = startedAtId < finishedAtId ? startedAtId : finishedAtId;
    fetchOptions = {...previousFetchOptions, startkey: newStartKey, skip: 0, descending: false, limit: pageSize};
    previousFetchOptions = fetchOptions;
    changedPageSize = true;
    previousPageSize =  pageSize;
    return fetchOptions;

  //when the page size increases
  }else if(pageSize > previousPageSize && previousPageSize !==null){
    // console.log("page size increase");
    // console.log("previousPageSize: "+ previousPageSize);
    // console.log("pageSize: "+ pageSize);
    let previousStartingKeyIndex = previousPageIndex * previousPageSize;
    let currentStartingKeyIndex = currentPageIndex * pageSize;
    //remember to skip the starting key in this case
    startingKeyIndexDifference = previousStartingKeyIndex - currentStartingKeyIndex;
    newLimit = currentStartingKeyIndex === 0? 1 : currentStartingKeyIndex;
    // console.log("new limit: " +  newLimit);

    // console.log("startingKeyIndexDifference: " + startingKeyIndexDifference);

    if(startingKeyIndexDifference>0){
      newPageSize = pageSize;
      lastDirection = "forward";
      return {...previousFetchOptions};
    }else{
      let newStartKey = startedAtId < finishedAtId ? startedAtId : finishedAtId;
      fetchOptions = {...previousFetchOptions, startkey: newStartKey, skip: 0, descending: false, limit: pageSize};
      previousFetchOptions = fetchOptions;
      changedPageSize = true;
      previousPageSize =  pageSize;
      startingKeyIndexDifference = null;
      return fetchOptions;
    }
  }
  

  //forward search
  if(currentPageIndex - previousPageIndex === 1){
    // console.log("forward search");
    fetchOptions["descending"] = false;
    fetchOptions["skip"] = 1;

    if(changedPageSize){
      fetchOptions["startkey"] = finishedAtId > startedAtId? finishedAtId : startedAtId;


    }else 
    if(lastDirection === "forward"){
      fetchOptions["startkey"] = finishedAtId;
      
    }else if(lastDirection === "backward"){
      fetchOptions["startkey"] = startedAtId;

    }
    // console.log(fetchOptions.startkey);
    lastDirection = "forward";

  //backward search
  }else if(currentPageIndex - previousPageIndex === -1){
    // console.log("backward search");
    fetchOptions["descending"] = true;
    fetchOptions["skip"] = 1;

    if(changedPageSize){
      fetchOptions["startkey"] = finishedAtId < startedAtId? finishedAtId : startedAtId;


    }else 
    if(lastDirection === "backward"){
      fetchOptions["startkey"] = finishedAtId;

    }else if(lastDirection === "forward"){
      fetchOptions["startkey"] = startedAtId;
      
    }

    lastDirection = "backward";

  //navigate to end
  }else if(currentPageIndex - previousPageIndex > 1){
    // console.log("navigate to end (backward)");
    fetchOptions["descending"] = true;
    fetchOptions["skip"] = 0;
    fetchOptions["startkey"] = null;
    fetchOptions["limit"] = totalDocumentCount % pageSize;
    lastDirection = "backward";

  //navigate to beginning
  }else if(currentPageIndex - previousPageIndex < -1){
    // console.log("navigate to beginning (forward)");
    fetchOptions["descending"] = false;
    fetchOptions["skip"] = 0;
    fetchOptions["startkey"] = null;
    lastDirection = "forward";

  }
  changedPageSize = false;
  previousPageSize =  pageSize;
  previousFetchOptions = fetchOptions;
  return fetchOptions;

}

export const fetchNextPage = (options) => {
  return getDb().allDocs(options)

  .then(response => {
    if(startingKeyIndexDifference !== null){
      startingKeyIndexDifference = null;
      options.descending = false;
      return getDb().allDocs({...options, descending: false, limit: newLimit, skip: 0, startkey: null})
        .then(response => {
          
          let finishedAtDocId = response.rows[response.rows.length - 1].id;
          // console.log("finishedAtDocId: " + finishedAtDocId);
          let newPageLimit = newPageSize;
          previousPageSize =  newPageSize;
          newPageSize = null;
          previousFetchOptions = {...options, descending: false, startkey: finishedAtDocId, limit: newPageLimit, skip: newLimit ===1? 0:1};
          newLimit = null;
          return getDb().allDocs(previousFetchOptions);
        })
    }
    newPageSize = null;
    startingKeyIndexDifference = null;
    return response;
  })
  .then((response) => {

    totalDocumentCount = response.total_rows;
    
    if (response && response.rows.length > 0) {
      startedAtId = response.rows[0].id;
      finishedAtId = response.rows[response.rows.length - 1].id;
    }
    
    if(response.rows.length === 0 && lastDirection === "forward"){
      let oldFinishedAtId = finishedAtId;
      let oldStartedAtId = startedAtId;
      finishedAtId = oldFinishedAtId > oldStartedAtId? oldFinishedAtId : oldStartedAtId;
      startedAtId = oldStartedAtId < oldFinishedAtId? oldStartedAtId : oldFinishedAtId;
    }

    if(response.rows.length === 0 && lastDirection === "backward"){
      let oldFinishedAtId = finishedAtId;
      let oldStartedAtId = startedAtId;
      finishedAtId = oldFinishedAtId < oldStartedAtId? oldFinishedAtId : oldStartedAtId;
      startedAtId = oldStartedAtId > oldFinishedAtId? oldStartedAtId : oldFinishedAtId;
    }

    let sortedResponse;
    
    if(options.descending === true){
      sortedResponse = response.rows.reverse();
    }else{
      sortedResponse = response.rows;
    }

    let extractedResponseDocs = [];
    sortedResponse.forEach(response => {
      extractedResponseDocs.push(response.doc);
    });

    let newDocsArray = [];
    for(let doc of extractedResponseDocs){
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

export const clearPaginationDetails = () => {
    finishedAtId = null;
    startedAtId = null;
    lastDirection = null;
    previousPageSize = null;
    previousFetchOptions = null;
    changedPageSize = false;
    totalDocumentCount = null;
    startingKeyIndexDifference = null;
    newPageSize = null;
    newLimit = null;
}

export const getPreviousFetchOptions = () => {
    return previousFetchOptions;
}
