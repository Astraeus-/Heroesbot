const FileHandler = require('./FileHandler.js')
const heroesloungeApi = require('heroeslounge-api')
const path = require('path')
const Logger = require('./Logger.js')

module.exports.allTeamData = () => {
  return heroesloungeApi.getTeams().then((teams) => {
    let cacheData = {
      prev_timestamp: Date.now(),
      expiration_time: 24 * 60 * 60 * 1000,
      data: teams
    }
    return FileHandler.writeJSONFile(path.join(__dirname, '../Data/Teamdata.json'), cacheData)
  }).then(() => {
    Logger.info('Updated Teamdata cache')
  }).catch((error) => {
    Logger.warn('Could not update Teamdata cache', error)
  })
}

module.exports.matchesToday = () => {
  return heroesloungeApi.getMatchesToday().then((matches) => {
    let cacheData = {
      prev_timestamp: Date.now(),
      expiration_time: 15 * 60 * 1000,
      data: matches
    }
    return FileHandler.writeJSONFile(path.join(__dirname, '../Data/MatchesToday.json'), cacheData)
  }).then(() => {
    Logger.info('Updated MatchesToday cache')
  }).catch((error) => {
    Logger.warn('Could not update MatchesToday cache', error)
  })
}
