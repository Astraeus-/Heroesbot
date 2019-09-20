const { Logger } = require('../util.js');
const https = require('https');

class WebhookClient {
  constructor (id, token) {
    this.id = id;
    this.token = token;
  }

  send (content, embeds = []) {
    const options = {
      hostname: 'discordapp.com',
      path: `/api/webhooks/${this.id}/${this.token}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (!Array.isArray(embeds)) {
      Logger.debug(`Expected embeds to be array, got ${typeof embeds}`, embeds);
      return;
    }

    const postData = {
      embeds: []
    };

    if (typeof content === 'object') {
      postData['embeds'].push(content);
    } else if (typeof content === 'string') {
      postData['content'] = content;
    }

    for (const embed of embeds) {
      postData.embeds.push(embed);
    }
    
    const req = https.request(options, (res) => {
      Logger.debug(`Status: ${res.statusCode}`);
    });

    req.on('error', (error) => {
      Logger.error('Could not submit webhook', error);
    });

    req.write(JSON.stringify(postData));
    req.end();
  }
}

module.exports = WebhookClient;
