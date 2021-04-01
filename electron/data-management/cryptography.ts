import * as crypto from "crypto";
// import {ENCRYPTION_KEY} from './config'
let algorithm = 'aes-256-cbc';
let key;

const setSecretKey = (secretKey) => {
    if(secretKey !== "" && secretKey){
        key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32);
    }else{
        key = null;
    }
    
}

const setCryptographyAlgorithm = (cryptoAlgorithm) => {
    algorithm = cryptoAlgorithm;
}

const encrypt = (string) => {
    // Create an initialization vector
    const iv = crypto.randomBytes(16);
    // Create a new cipher using the algorithm, key, and iv
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    // Create the new (encrypted) buffer
    const result = Buffer.concat([iv, cipher.update(Buffer.from(string)), cipher.final()]);
    return result.toString('hex');
};

const decrypt = (encrypted) => {
    encrypted = Buffer.from(encrypted, 'hex');

   // Get the iv: the first 16 bytes
   const iv = encrypted.slice(0, 16);
   // Get the rest
   encrypted = encrypted.slice(16);
   // Create a decipher
   const decipher = crypto.createDecipheriv(algorithm, key, iv);
   // Actually decrypt it
   const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
   return result.toString();
};

export { encrypt, decrypt, setSecretKey, setCryptographyAlgorithm };