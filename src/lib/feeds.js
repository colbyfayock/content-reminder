const { parseString } = require('xml2js');

/**
 * promiseToConvertXmlToJson
 */

function promiseToConvertXmlToJson(xml) {
  const errorBase = `Failed to convert XML to JSON`;
  return new Promise((resolve, reject) => {
    parseString(xml, function (error, result) {
    if ( error ) {
      reject(`${errorBase} ${error}`);
      return;
    }
    resolve(result);
    });
  })
}

module.exports.promiseToConvertXmlToJson = promiseToConvertXmlToJson;