const Client = require('./Client.js');
const { token, env } = require('./config.js');
const cron = require('node-cron');

const client = new Client(token, {
  getAllUsers: true,
  disableEveryone: false
});

const regionTask = cron.schedule('0 0 * * Wednesday', () => {
  if (env === 'production') {
    client.bot.commands.get('assignregion').exec();
  }
}, {
  scheduled: false
});

const remindTask = cron.schedule('* * * * *', () => {
  if (env === 'production') {
    const remindCommand = client.bot.commands.get('remind');

    if (remindCommand.enabled) {
      remindCommand.remind();
    }
  }
}, {
  scheduled: false
});

client.launch().then(() => {
  regionTask.start();
  remindTask.start();
});
