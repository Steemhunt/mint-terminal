# Mint Terminal 🤖

An AI meme coin assistant living on Farcaster.

## Dependencies

- [Neynar](https://neynar.com) - Farcaster API
- [GPT-4o-mini](https://platform.openai.com/docs/models/gpt-4o-mini) - Parse user requests

## Dev Environment

```sh
# Copy the example env file and set the values
cp .env.example .env.local

# Get a signer UUID
bun utils/get-uuid.ts

bun install
bun start.ts # run the webhook receiver
ngrok http 3000 # expose the local server to receive webhooks from Neynar
```

```sh
# TEST MODE - show prepared params, but don't create
http://localhost:3000/?test=create a cat themed meme coin, backed by $mfer
```

## Future Work

- [ ] Create a bot to reply to general casts, not just for minting all the time
- [ ] Generate a token logo, upload it to Mint Club
