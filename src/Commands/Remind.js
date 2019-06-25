const BaseCommand = require('../Classes/BaseCommand.js')
const { Logger } = require('../util.js')

const fs = require('fs').promises
const path = require('path')

const dateformat = require('date-fns/format')

class Remind extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: ['devops'],
        roles: ['Lounge Master', 'Board', 'Managers', 'Moderators'],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'remind',
      aliases: ['remindme', 'reminder'],
      description: 'Reminds a user in the channel',
      syntax: 'remind add <Year> <Month> <Day> <Hour> <Minute> <Message>\n!remind delete <reminder ID>\n!remind list',
      min_args: 1
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg, args) {
    const action = args[0].toLowerCase()

    switch (action) {
      case 'add':
      case 'create':

        const triggerDate = new Date(args[1], args[2] - 1, args[3], args[4], args[5], 0)
        const triggerMs = Date.parse(triggerDate)

        fs.readFile(path.join(__dirname, '../Data/Reminders.json'), { encoding: 'utf8' }).then(reminders => JSON.parse(reminders)).then((reminders) => {
          const newReminder = {
            Id: reminders.length > 0 ? reminders[reminders.length - 1].Id + 1 : 1,
            time: triggerMs,
            message: args.slice(6).join(' '),
            channelId: msg.channel.id,
            creatorId: msg.author.id
          }

          const currentReminderCount = reminders.filter((reminder) => {
            return reminder.creatorId === msg.author.id
          })

          if (currentReminderCount.length < 5) {
            reminders.push(newReminder)

            return fs.writeFile(path.join(__dirname, '../Data/Reminders.json'), JSON.stringify(reminders, 0, 2)).then(() => {
              return this.bot.getDMChannel(msg.author.id).then((channel) => {
                return channel.createMessage(`Sucessfully created reminder for ${dateformat(triggerDate, 'Do MMMM YYYY hh:mm A')}`)
              })
            })
          } else {
            return this.bot.getDMChannel(msg.author.id).then((channel) => {
              return channel.createMessage('Too many reminders! Please remove one of your other reminders to create a new one.')
            })
          }
        }).catch((error) => {
          Logger.error('Unable to create reminder', error)
        })

        break
      case 'delete':
      case 'remove':
        const deletionId = parseInt(args[1])

        fs.readFile(path.join(__dirname, '../Data/Reminders.json'), { encoding: 'utf8' }).then(reminders => JSON.parse(reminders)).then((reminders) => {
          const removeIndex = reminders.findIndex((reminder) => {
            return reminder.Id === deletionId
          })

          if (removeIndex >= 0 && (reminders[removeIndex].creatorId === msg.author.id || msg.author.id === '108153813143126016')) {
            const removedReminder = reminders[removeIndex]
            reminders.splice(removeIndex, 1)
            return fs.writeFile(path.join(__dirname, '../Data/Reminders.json'), JSON.stringify(reminders, 0, 2)).then(() => {
              return this.bot.getDMChannel(msg.author.id).then((channel) => {
                return channel.createMessage(`Sucessfully removed reminder: \n\n\`\`\`\n${removedReminder.message}\n\`\`\``)
              })
            })
          } else {
            return this.bot.getDMChannel(msg.author.id).then((channel) => {
              return channel.createMessage(`Unable to remove reminder with id: ${deletionId}`)
            })
          }
        }).catch((error) => {
          Logger.error('Unable to delete reminder', error)
        })

        break
      case 'list':
      case 'all':
        fs.readFile(path.join(__dirname, '../Data/Reminders.json'), { encoding: 'utf8' }).then(reminders => JSON.parse(reminders)).then((reminders) => {
          const embed = {
            color: this.bot.embed.color,
            footer: this.bot.embed.footer,
            title: '',
            fields: []
          }

          embed.title = 'Current reminders'
          embed.fields.push({
            'name': 'ID',
            'value': '',
            'inline': true
          }, {
            'name': 'Channel',
            'value': '',
            'inline': true
          },
          {
            'name': 'Datetime',
            'value': '',
            'inline': true
          }, {
            'name': 'Message',
            'value': ''
          })

          let remindersToList = []

          if (action === 'all' && msg.author.id === '108153813143126016') {
            remindersToList = reminders
          } else {
            remindersToList = reminders.filter((reminder) => {
              return reminder.creatorId === msg.author.id
            })
          }

          for (let reminder of remindersToList) {
            embed.fields[0].value += `${reminder.Id}\n`
            embed.fields[1].value += `${this.getChannelName(reminder.channelId)}\n`
            embed.fields[2].value += `${dateformat(new Date(reminder.time), 'D/M/YYYY HH:mm Z')}\n`
            embed.fields[3].value += `${reminder.Id}: ${reminder.message}\n`
          }

          return this.bot.getDMChannel(msg.author.id).then((channel) => {
            return channel.createMessage({ embed: embed })
          })
        }).catch((error) => {
          Logger.error('Unable to list reminders', error)
        })

        break
      default:
        this.bot.getDMChannel(msg.author.id).then((channel) => {
          return channel.createMessage(`Invalid input: \n\n${msg.content}`)
        })

        break
    }
  }

  remind () {
    fs.readFile(path.join(__dirname, '../Data/Reminders.json'), { encoding: 'utf8' }).then(reminders => JSON.parse(reminders)).then((reminders) => {
      const currentTime = Date.now()
      for (let i = reminders.length - 1; i >= 0; i--) {
        if (reminders[i].time <= currentTime) {
          this.bot.createMessage(reminders[i].channelId, reminders[i].message).then(() => {
            reminders.splice(i, 1)
          }).catch((error) => {
            Logger.error('Unable to send reminder message', error)
          })
        }
      }

      return fs.writeFile(path.join(__dirname, '../Data/Reminders.json'), JSON.stringify(reminders, 0, 2))
    }).catch((error) => {
      Logger.error('Unable to update reminder status', error)
    })
  }

  getChannelName (channelID) {
    const guildReminder = this.bot.channelGuildMap[channelID]

    if (guildReminder) {
      return this.bot.guilds.get(guildReminder).channels.get(channelID).name
    }

    return 'DM Channel'
  }
}

module.exports = Remind
