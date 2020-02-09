# Heroesbot
Discord bot for Heroes Lounge


# Deployment

Run `npm install --production`

Create a .env file based on the .env_template.

Create the following directory structure inside of the src folder.
You'll need these files, otherwise Heroesbot will not function properly.

```
/Data
  /Caches
    MatchesTodayeu.json
    MatchesTodayna.json
    Teamdata.json
Muted.json
Reminders.json
```

Each of the cache files needs to contain the following JSON data:
```json
{
  "lastUpdatedAt": 0,
  "data": []
}
```

The other data files are just empty JSON objects: `{}`.

# Setting up pm2

Run `npm install pm2 -g`

Run `pm2 start src --name heroesbot`

Run `pm2 startup`

Follow the instructions in the terminal to setup auto-start.