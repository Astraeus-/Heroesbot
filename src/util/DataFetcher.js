const FileHandler = require('./FileHandler.js')
const heroesloungeApi = require('heroeslounge-api')
const path = require('path')
const Logger = require('./Logger.js')

module.exports.allTeamData = () => {
  heroesloungeApi.getTeams()
    .then((teams) => {
      Logger.info('Updating Teamdata cache')
      FileHandler.writeJSONFile(path.join(__dirname, '../Data/Teamdata.json'), teams)
    })
    .catch(error => Logger.warn('Could not update Teamdata cache', error))
}

module.exports.matchesToday = () => {
  heroesloungeApi.getMatchesToday()
    .then((matches) => {
      Logger.info('Updating MatchesToday cache')
      FileHandler.writeJSONFile(path.join(__dirname, '../Data/MatchesToday.json'), matches)
    })
    .catch(error => Logger.warn('Could not update MatchesToday cache', error))
}
