# Mint Terminal

An AI meme coin assistant on Farcaster.

## Dev Environment

```sh
bun install
bun start.ts # run the webhook receiver
ngrok http 3000 # expose the local server to receive webhooks from Neynar
```

```sh
# TEST MODE - show prepared params, but don't create
http://localhost:3000/?test=create a cat themed meme coin, backed by $mfer
```
