// src/services/fileStore.js
const localStore = require('./localStore');
const s3Store    = require('./s3Store');

const useS3 = process.env.NODE_ENV === 'production';

module.exports = {
    saveFile: useS3 ? s3Store.saveFile : localStore.saveFile,
    saveJsonToFile: useS3 ? s3Store.saveJsonAsfile : localStore.saveJsonAsfile,
    getFile:  useS3 ? s3Store.getFile  : localStore.getFile,
  };
