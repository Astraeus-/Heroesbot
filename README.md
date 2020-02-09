# Heroesbot
Discord bot for Heroes Lounge


# Deployment

Run `npm install --production`

Create a .env file based on the .env_template.

Create the following directory structure inside of the src folder.
You'll need these files, otherwise Heroesbot will complain and not work.

```
/Data
  /Caches
    MatchesTodayeu.json
    MatchesTodayna.json
    Teamdata.json
  /Images
    heads.png
    tails.png
Muted.json
Reminders.json
```

# Setting up pm2

Run `npm install pm2 -g`

Run `pm2 start src --name heroesbot`

Run `pm2 startup`

Follow the instructions in the terminal to setup auto-start.