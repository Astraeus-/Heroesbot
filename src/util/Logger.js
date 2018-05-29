const dateformat = require('dateformat')

module.exports.info = (msg) => {
  console.log(`${dateformat(Date.now(), 'dd/mm/yyyy hh:MM:ss TT')}| ${msg}`)
}

module.exports.warn = (msg, warning) => {
  console.warn(`${dateformat(Date.now(), 'dd/mm/yyyy hh:MM:ss TT')}| ${msg}}\n${warning}`)
}

module.exports.error = (msg, error) => {
  console.error(`${dateformat(Date.now(), 'dd/mm/yyyy hh:MM:ss TT')}| ${msg}\n${error}`)
}
