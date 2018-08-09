const FileHandler = require('../util/FileHandler.js')
const path = require('path')
const config = require('../config.json')

module.exports = (bot) => {
  bot.on('guildMemberUpdate', (guild, member, oldMember) => {
    if (member.roles.length === oldMember.roles.length) return
    const addedRole = member.roles.length > oldMember.roles.length

    let changedRoleIds = addedRole ? member.roles.filter((role) => {
      return !oldMember.roles.includes(role)
    }) : oldMember.roles.filter((role) => {
      return !member.roles.includes(role)
    })

    let changedRole = guild.roles.get(changedRoleIds[0])

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
            FileHandler.writeJSONFile(path.join(__dirname, '../Data/Muted.json'), data)
          })
        } else {
          FileHandler.readJSONFile(path.join(__dirname, '../Data/Muted.json')).then((data) => {
            delete data[guild.id][member.user.id]
            FileHandler.writeJSONFile(path.join(__dirname, '../Data/Muted.json'), data)
          })
        }
        break
      case 'Patreon VIP':
      case 'Twitch Subscriber':
      case 'Honorary Sloth':
        if (addedRole) {
          bot.addGuildMemberRole(guild.id, member.user.id, config.vip[guild.id].roleID)
        } else {
          let stillDeserving = member.roles.some((roleID) => {
            return guild.roles.find((guildRole) => {
              if (roleID === guildRole.id) return config.vip[guild.id].rewardRoles.includes(guildRole.name)
            })
          })
          if (!stillDeserving) bot.removeGuildMemberRole(guild.id, member.user.id, config.vip[guild.id].roleID)
        }
        break
      default:
    }
  })
}
