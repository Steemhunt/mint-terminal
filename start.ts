import { publishCast } from "./lib/farcaster";
import OpenAI from "openai";
import {
  BASE_TOKEN_LIST,
  getDefaultBondParamsForBaseAsset,
} from "./lib/mintclub";
const openai = new OpenAI();

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    try {
      const result = await queryGPTForParameters(
        "AI themed mem coin, backed by $mfer"
      );

      console.log(result);

      const bondParams = await getDefaultBondParamsForBaseAsset(
        result.baseAsset as `0x${string}`
      );

      console.log(bondParams);

      // const fcRequest = await req.json();
      // if (fcRequest.type === "cast.created" && fcRequest.data.hash) {
      //   handleCastCreated(fcRequest.data);
      // }

      return new Response("OK", { status: 200 });
    } catch (e: any) {
      return new Response(e.message, { status: 400 });
    }
  },
});

async function handleCastCreated(castData: any) {
  console.log(
    `<- WEBHOOK_RECEIVIED - https://warpcast.com/~/conversations/${castData.hash}\n` +
      `- Author: ${castData.author.username} (@${castData.author.username} / ${castData.author.fid})\n` +
      `- Text: ${castData.text}`
  );

  const { hash } = await publishCast("gm!", {
    replyTo: castData.hash,
  });

  console.log(`-> REPLIED: https://warpcast.com/~/conversations/${hash}`);
}

async function queryGPTForParameters(text: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an expert in meme coins and DeFi." },
      {
        role: "user",
        content:
          "I'd like to create a meme coin with following characteristics:\n" +
          `${text}\n` +
          `If I mentioned any base token, find the contract address from ${JSON.stringify(
            BASE_TOKEN_LIST
          )}\n` +
          `Or if I haven't mentioned any base token, use WETH9 contract address: 0x4200000000000000000000000000000000000006\n` +
          "Suggest me a name and symbol. Name must be 3-30 characters, symbol must be 1-10 characters. All caps.\n" +
          "Just reply with the baseAsset contract address, name, symbol with commad separated string. Nothing else.",
      },
    ],
  });

  if (!completion.choices || completion.choices.length === 0) {
    throw new Error(`OpenAI API failed: ${JSON.stringify(completion)}`);
  }

  console.log(completion.choices[0].message);

  const [baseAsset, name, symbol] =
    completion.choices[0].message.content?.split(",").map((s) => s.trim()) ??
    [];

  // Validations:
  if (!baseAsset || !baseAsset.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error("Invalid base asset address");
  }

  if (!name || name.length < 3 || name.length > 30) {
    throw new Error("Invalid name");
  }

  if (!symbol || symbol.length > 10) {
    throw new Error("Invalid symbol");
  }

  return { baseAsset, name, symbol };
}

console.log(`Listening on localhost:${server.port}`);
