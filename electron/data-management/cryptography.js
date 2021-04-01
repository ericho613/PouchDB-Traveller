"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCryptographyAlgorithm = exports.setSecretKey = exports.decrypt = exports.encrypt = void 0;
var crypto = require("crypto");
// import {ENCRYPTION_KEY} from './config'
var algorithm = 'aes-256-cbc';
var key;
var setSecretKey = function (secretKey) {
    if (secretKey !== "" && secretKey) {
        key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32);
    }
    else {
        key = null;
    }
};
exports.setSecretKey = setSecretKey;
var setCryptographyAlgorithm = function (cryptoAlgorithm) {
    algorithm = cryptoAlgorithm;
};
exports.setCryptographyAlgorithm = setCryptographyAlgorithm;
var encrypt = function (string) {
    // Create an initialization vector
    var iv = crypto.randomBytes(16);
    // Create a new cipher using the algorithm, key, and iv
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    // Create the new (encrypted) buffer
    var result = Buffer.concat([iv, cipher.update(Buffer.from(string)), cipher.final()]);
    return result.toString('hex');
};
exports.encrypt = encrypt;
var decrypt = function (encrypted) {
    encrypted = Buffer.from(encrypted, 'hex');
    // Get the iv: the first 16 bytes
    var iv = encrypted.slice(0, 16);
    // Get the rest
    encrypted = encrypted.slice(16);
    // Create a decipher
    var decipher = crypto.createDecipheriv(algorithm, key, iv);
    // Actually decrypt it
    var result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return result.toString();
};
exports.decrypt = decrypt;
//# sourceMappingURL=cryptography.js.map