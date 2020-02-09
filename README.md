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

Setup pm2 to restart the process on crash and potential reboot of the VPS.
