const fs = require('fs')

module.exports.readJSONFile = (loc) => {
  return new Promise((resolve, reject) => {
    fs.readFile(loc, { encoding: 'utf8' }, (error, data) => {
      if (error) {
        reject(Error(error))
      } else {
        try {
          let parsedData = JSON.parse(data)
          resolve(parsedData)
        } catch (err) {
          reject(Error('Could not parse JSON response'))
        }
      }
    })
  })
}

module.exports.writeJSONFile = (loc, data) => {
  return new Promise((resolve, reject) => {
    let jsonData
    try {
      jsonData = JSON.stringify(data, null, 2)
    } catch (err) {
      reject(Error('Unable to create JSON object'))
    }
    fs.writeFile(loc, jsonData, (error) => {
      if (error) {
        reject(Error(error))
      } else {
        resolve(`Data successfully written to: ${loc}`)
      }
    })
  })
}
