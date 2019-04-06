const dateformat = require('date-fns/format')

module.exports.info = (msg) => {
  console.log(`${dateformat(Date.now(), 'DD/MM/YYYY hh:mm:ss A')}|`, msg)
}

module.exports.warn = (msg, warning) => {
  console.warn(`${dateformat(Date.now(), 'DD/MM/YYYY hh:mm:ss A')}| ${msg}`, warning)
}

module.exports.error = (msg, error) => {
  console.error(`${dateformat(Date.now(), 'DD/MM/YYYY hh:mm:ss A')}| ${msg}`, error)
}
