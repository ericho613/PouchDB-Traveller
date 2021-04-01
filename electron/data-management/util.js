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
exports.transformIndexData = exports.formatBytes = void 0;
//function to transform bytes to other representations
// of size based on the number of bytes
function formatBytes(bytes, decimals) {
    if (decimals === void 0) { decimals = 2; }
    if (bytes === 0)
        return '0 Bytes';
    var k = 1024;
    var dm = decimals < 0 ? 0 : decimals;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
exports.formatBytes = formatBytes;
//function to transform the raw data from fetching pouchDB 
// indexes to a format used by the index table
function transformIndexData(indexData) {
    var modifiedData = [];
    var modifiedIndexInfoObject;
    indexData.forEach(function (indexInfoObject) {
        var fieldsArray = [];
        indexInfoObject.def.fields.forEach(function (fieldObject) {
            Object.keys(fieldObject).forEach(function (fieldKey) {
                fieldsArray.push(fieldKey + ":" + fieldObject[fieldKey]);
            });
        });
        modifiedIndexInfoObject = __assign({}, indexInfoObject);
        delete modifiedIndexInfoObject.def;
        modifiedIndexInfoObject["fields"] = fieldsArray;
        modifiedData.push(modifiedIndexInfoObject);
    });
    return modifiedData;
}
exports.transformIndexData = transformIndexData;
//# sourceMappingURL=util.js.map