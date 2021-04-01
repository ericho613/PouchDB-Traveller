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
exports.getPreviousFetchOptions = exports.clearPaginationDetails = exports.fetchNextPage = exports.createFetchOptions = void 0;
var database_1 = require("./database");
var finishedAtId;
var startedAtId;
var lastDirection = null;
var previousPageSize = null;
var previousFetchOptions = null;
var changedPageSize = false;
var totalDocumentCount;
var startingKeyIndexDifference = null;
var newPageSize;
var newLimit;
exports.createFetchOptions = function (previousPageIndex, currentPageIndex, pageSize) {
    if (previousPageIndex === void 0) { previousPageIndex = 0; }
    if (currentPageIndex === void 0) { currentPageIndex = 0; }
    if (pageSize === void 0) { pageSize = 10; }
    var fetchOptions = { include_docs: true };
    fetchOptions["limit"] = pageSize;
    //first fetch
    if ((previousFetchOptions === null)) {
        // console.log("first fetch");
        fetchOptions["descending"] = false;
        fetchOptions["skip"] = 0;
        previousFetchOptions = fetchOptions;
        lastDirection = "forward";
        previousPageSize = pageSize;
        changedPageSize = false;
        return fetchOptions;
    }
    //when the page size decreases
    if (pageSize < previousPageSize && previousPageSize !== null) {
        // console.log(pageSize);
        // console.log(previousPageSize);
        // console.log("page size decrease");
        var newStartKey = startedAtId < finishedAtId ? startedAtId : finishedAtId;
        fetchOptions = __assign(__assign({}, previousFetchOptions), { startkey: newStartKey, skip: 0, descending: false, limit: pageSize });
        previousFetchOptions = fetchOptions;
        changedPageSize = true;
        previousPageSize = pageSize;
        return fetchOptions;
        //when the page size increases
    }
    else if (pageSize > previousPageSize && previousPageSize !== null) {
        // console.log("page size increase");
        // console.log("previousPageSize: "+ previousPageSize);
        // console.log("pageSize: "+ pageSize);
        var previousStartingKeyIndex = previousPageIndex * previousPageSize;
        var currentStartingKeyIndex = currentPageIndex * pageSize;
        //remember to skip the starting key in this case
        startingKeyIndexDifference = previousStartingKeyIndex - currentStartingKeyIndex;
        newLimit = currentStartingKeyIndex === 0 ? 1 : currentStartingKeyIndex;
        // console.log("new limit: " +  newLimit);
        // console.log("startingKeyIndexDifference: " + startingKeyIndexDifference);
        if (startingKeyIndexDifference > 0) {
            newPageSize = pageSize;
            lastDirection = "forward";
            return __assign({}, previousFetchOptions);
        }
        else {
            var newStartKey = startedAtId < finishedAtId ? startedAtId : finishedAtId;
            fetchOptions = __assign(__assign({}, previousFetchOptions), { startkey: newStartKey, skip: 0, descending: false, limit: pageSize });
            previousFetchOptions = fetchOptions;
            changedPageSize = true;
            previousPageSize = pageSize;
            startingKeyIndexDifference = null;
            return fetchOptions;
        }
    }
    //forward search
    if (currentPageIndex - previousPageIndex === 1) {
        // console.log("forward search");
        fetchOptions["descending"] = false;
        fetchOptions["skip"] = 1;
        if (changedPageSize) {
            fetchOptions["startkey"] = finishedAtId > startedAtId ? finishedAtId : startedAtId;
        }
        else if (lastDirection === "forward") {
            fetchOptions["startkey"] = finishedAtId;
        }
        else if (lastDirection === "backward") {
            fetchOptions["startkey"] = startedAtId;
        }
        // console.log(fetchOptions.startkey);
        lastDirection = "forward";
        //backward search
    }
    else if (currentPageIndex - previousPageIndex === -1) {
        // console.log("backward search");
        fetchOptions["descending"] = true;
        fetchOptions["skip"] = 1;
        if (changedPageSize) {
            fetchOptions["startkey"] = finishedAtId < startedAtId ? finishedAtId : startedAtId;
        }
        else if (lastDirection === "backward") {
            fetchOptions["startkey"] = finishedAtId;
        }
        else if (lastDirection === "forward") {
            fetchOptions["startkey"] = startedAtId;
        }
        lastDirection = "backward";
        //navigate to end
    }
    else if (currentPageIndex - previousPageIndex > 1) {
        // console.log("navigate to end (backward)");
        fetchOptions["descending"] = true;
        fetchOptions["skip"] = 0;
        fetchOptions["startkey"] = null;
        fetchOptions["limit"] = totalDocumentCount % pageSize;
        lastDirection = "backward";
        //navigate to beginning
    }
    else if (currentPageIndex - previousPageIndex < -1) {
        // console.log("navigate to beginning (forward)");
        fetchOptions["descending"] = false;
        fetchOptions["skip"] = 0;
        fetchOptions["startkey"] = null;
        lastDirection = "forward";
    }
    changedPageSize = false;
    previousPageSize = pageSize;
    previousFetchOptions = fetchOptions;
    return fetchOptions;
};
exports.fetchNextPage = function (options) {
    return database_1.getDb().allDocs(options)
        .then(function (response) {
        if (startingKeyIndexDifference !== null) {
            startingKeyIndexDifference = null;
            options.descending = false;
            return database_1.getDb().allDocs(__assign(__assign({}, options), { descending: false, limit: newLimit, skip: 0, startkey: null }))
                .then(function (response) {
                var finishedAtDocId = response.rows[response.rows.length - 1].id;
                // console.log("finishedAtDocId: " + finishedAtDocId);
                var newPageLimit = newPageSize;
                previousPageSize = newPageSize;
                newPageSize = null;
                previousFetchOptions = __assign(__assign({}, options), { descending: false, startkey: finishedAtDocId, limit: newPageLimit, skip: newLimit === 1 ? 0 : 1 });
                newLimit = null;
                return database_1.getDb().allDocs(previousFetchOptions);
            });
        }
        newPageSize = null;
        startingKeyIndexDifference = null;
        return response;
    })
        .then(function (response) {
        totalDocumentCount = response.total_rows;
        if (response && response.rows.length > 0) {
            startedAtId = response.rows[0].id;
            finishedAtId = response.rows[response.rows.length - 1].id;
        }
        if (response.rows.length === 0 && lastDirection === "forward") {
            var oldFinishedAtId = finishedAtId;
            var oldStartedAtId = startedAtId;
            finishedAtId = oldFinishedAtId > oldStartedAtId ? oldFinishedAtId : oldStartedAtId;
            startedAtId = oldStartedAtId < oldFinishedAtId ? oldStartedAtId : oldFinishedAtId;
        }
        if (response.rows.length === 0 && lastDirection === "backward") {
            var oldFinishedAtId = finishedAtId;
            var oldStartedAtId = startedAtId;
            finishedAtId = oldFinishedAtId < oldStartedAtId ? oldFinishedAtId : oldStartedAtId;
            startedAtId = oldStartedAtId > oldFinishedAtId ? oldStartedAtId : oldFinishedAtId;
        }
        var sortedResponse;
        if (options.descending === true) {
            sortedResponse = response.rows.reverse();
        }
        else {
            sortedResponse = response.rows;
        }
        var extractedResponseDocs = [];
        sortedResponse.forEach(function (response) {
            extractedResponseDocs.push(response.doc);
        });
        var newDocsArray = [];
        for (var _i = 0, extractedResponseDocs_1 = extractedResponseDocs; _i < extractedResponseDocs_1.length; _i++) {
            var doc = extractedResponseDocs_1[_i];
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
};
exports.clearPaginationDetails = function () {
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
};
exports.getPreviousFetchOptions = function () {
    return previousFetchOptions;
};
//# sourceMappingURL=pagination.js.map