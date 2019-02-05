const FileHandler = require('./FileHandler.js')
const heroesloungeApi = require('heroeslounge-api')
const path = require('path')
const Logger = require('./Logger.js')

module.exports.allTeamData = () => {
  return heroesloungeApi.getTeams().then((teams) => {
    Logger.info('Updating Teamdata cache')
    FileHandler.writeJSONFile(path.join(__dirname, '../Data/Teamdata.json'), teams).catch((error) => {
      throw error
    })
  }).then(() => {
    Logger.info('Updating Teamdata cache complete')
  }).catch((error) => {
    Logger.warn('Could not update Teamdata cache', error)
  })
}

module.exports.matchesToday = () => {
  return heroesloungeApi.getMatchesToday().then((matches) => {
    Logger.info('Updating MatchesToday cache')
    FileHandler.writeJSONFile(path.join(__dirname, '../Data/MatchesToday.json'), matches).catch((error) => {
      throw error
    })
  }).then(() => {
    Logger.info('Updating MatchesToday cache complete')
  }).catch((error) => {
    Logger.warn('Could not update MatchesToday cache', error)
  })
}
