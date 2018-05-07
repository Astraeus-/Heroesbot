const FileHandler = require('./FileHandler.js')
const heroesloungeApi = require('heroeslounge-api')
const path = require('path')

module.exports.allTeamData = () => {
  heroesloungeApi.getTeams().then((teams) => {
    FileHandler.writeJSONFile(path.join(__dirname, '../Data/Teamdata.json'), teams)
  })
}
