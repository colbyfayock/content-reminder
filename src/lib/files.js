const fs = require('fs');

/**
 * promiseToReadFile
 */

function promiseToReadFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8' , (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data);
    })
  })
}

module.exports.promiseToReadFile = promiseToReadFile;

/**
 * promiseToWriteFile
 */

function promiseToWriteFile(name, file,) {
  return new Promise((resolve, reject) => {
    fs.writeFile(name, file, 'utf8' , (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data);
    })
  })
}

module.exports.promiseToWriteFile = promiseToWriteFile;