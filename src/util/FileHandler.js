const fs = require('fs').promises
const Logger = require('./Logger.js')

module.exports.readJSONFile = (loc) => {
  return fs.readFile(loc, { encoding: 'utf8' }).then((data) => {
    let parsedData
    try {
      parsedData = JSON.parse(data)
    } catch (error) {
      throw Error('Unable to parse JSON object')
    }
    return parsedData
  }).catch((error) => {
    Logger.error(`Could not read file ${loc}`, error)
  })
}

module.exports.writeJSONFile = (loc, data) => {
  let jsonData
  try {
    jsonData = JSON.stringify(data, null, 2)
  } catch (error) {
    throw Error('Unable to create JSON object')
  }

  return fs.writeFile(loc, jsonData).catch((error) => {
    Logger.error(`Could not write file ${loc}`, error)
  })
}
