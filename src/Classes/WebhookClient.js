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

    const postData = {
      embeds: [
        content
      ]
    };

    for (const embed of embeds) {
      postData.embeds.push(embed);
    }

    const req = https.request(options, (res) => {
      // console.log(`Status: ${res.statusCode}`)
      // console.log(`Headers: ${JSON.stringify(res.headers)}`)
    });

    req.on('error', (error) => {
      console.log(error);
    });

    req.write(JSON.stringify(postData));
    req.end();
  }
}

module.exports = WebhookClient;
