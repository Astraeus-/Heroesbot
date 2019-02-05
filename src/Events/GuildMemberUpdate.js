const FileHandler = require('../util/FileHandler.js')
const path = require('path')
const { vip } = require('../config.json')

const Logger = require('../util/Logger.js')

module.exports = (bot) => {
  bot.on('guildMemberUpdate', (guild, member, oldMember) => {
    if (member.roles.length === oldMember.roles.length) return
    const addedRole = member.roles.length > oldMember.roles.length

    const changedRoleIds = addedRole ? member.roles.filter((role) => {
      return !oldMember.roles.includes(role)
    }) : oldMember.roles.filter((role) => {
      return !member.roles.includes(role)
    })

    const changedRole = guild.roles.get(changedRoleIds[0])

    switch (changedRole.name) {
      case 'Muted':
        if (addedRole) {
          const mutedMember = {
            username: member.user.username,
            startDate: new Date(Date.now())
          }
          FileHandler.readJSONFile(path.join(__dirname, '../Data/Muted.json')).then((data) => {
            if (!data[guild.id]) {
              data[guild.id] = {
                guildName: guild.name
              }
            }
            data[guild.id][member.user.id] = mutedMember
            return FileHandler.writeJSONFile(path.join(__dirname, '../Data/Muted.json'), data)
          }).catch((error) => {
            Logger.warn('Unable to update muted list', error)
          })
        } else {
          FileHandler.readJSONFile(path.join(__dirname, '../Data/Muted.json')).then((data) => {
            delete data[guild.id][member.user.id]
            return FileHandler.writeJSONFile(path.join(__dirname, '../Data/Muted.json'), data)
          }).catch((error) => {
            Logger.error('Unable to updated muted list', error)
          })
        }
        break
      case 'Patreon VIP':
      case 'Twitch Subscriber':
      case 'Honorary Sloth':
        if (addedRole) {
          bot.addGuildMemberRole(guild.id, member.user.id, vip[guild.id].roleID)
        } else {
          const stillDeserving = member.roles.some((roleID) => {
            return guild.roles.find((guildRole) => {
              if (roleID === guildRole.id) return vip[guild.id].rewardRoles.includes(guildRole.name)
            })
          })
          if (!stillDeserving) bot.removeGuildMemberRole(guild.id, member.user.id, vip[guild.id].roleID)
        }
        break
      default:
    }
  })
}
