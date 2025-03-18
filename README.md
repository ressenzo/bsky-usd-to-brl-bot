# bsky-usd-to-brl-bot
Bluesky bot to update USD to BRL conversion in each five minutes

## .env file
.env file should look like this:

```
VALIDATE_HOUR=
EXECUTION_TIME_MS=
BLUESKY_USERNAME=
BLUESKY_PASSWORD=

```

- `VALIDATE_HOUR`: boolean value to set if application should check hour for execution
- `EXECUTION_TIME_MS`: integer value to set execution interval
- `BLUESKY_USERNAM`: string value for bluesky username
- `BLUESKY_PASSWOR`: string value for bluesky password