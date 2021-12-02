import Eris from 'eris';
import https from 'https';
import { Logger } from '../util';

interface PostData {
  content?: string;
  embeds: Eris.Embed[];
}

export default class WebhookClient {
  id: string;
  token: string;

  constructor (id: string, token: string) {
    this.id = id;
    this.token = token;
  }

  send (content: string | Eris.Embed, embeds: Eris.Embed[] = []) {
    const options = {
      hostname: 'discordapp.com',
      path: `/api/webhooks/${this.id}/${this.token}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const postData: PostData = {
      embeds: [],
    };

    if (typeof content === 'string') {
      postData['content'] = content;
    } else {
      postData['embeds'].push(content);
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
