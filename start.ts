import { publishCast } from "./lib/farcaster";
import OpenAI from "openai";
import {
  BASE_TOKEN_LIST,
  getDefaultBondParamsForBaseAsset,
} from "./lib/bondPrams";
import { createToken } from "./lib/mintclub";
const openai = new OpenAI();

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const testParam = url.searchParams.get("test");
    if (testParam) {
      const result = await testMode(testParam);
      return new Response(
        JSON.stringify(result, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        ),
        { status: 200 }
      );
    }

    try {
      const fcRequest = await req.json();
      if (fcRequest.type === "cast.created" && fcRequest.data.hash) {
        handleCastCreated(fcRequest.data);
      }
    } catch (e: any) {
      return new Response(`Error: ${e.message}`, { status: 400 });
    }

    return new Response("OK", { status: 200 });
  },
});

async function testMode(text: string) {
  console.log(`<- TEST MODE: ${text}`);
  const { baseAsset, name, symbol, feedback } = await queryGPTForParameters(
    text
  );
  console.log(
    `- baseAsset: ${baseAsset}\n- name: ${name}\n- symbol: ${symbol}\n- feedback: ${feedback}`
  );

  const bondParams = await getDefaultBondParamsForBaseAsset(
    baseAsset as `0x${string}`
  );
  // console.log("- bondParams: ", bondParams);

  return { baseAsset, name, symbol, feedback, bondParams };
}

async function handleCastCreated(castData: any) {
  console.log(
    `<- WEBHOOK_RECEIVIED - https://warpcast.com/~/conversations/${castData.hash}\n` +
      `- Author: ${castData.author.username} (@${castData.author.username} / ${castData.author.fid})\n` +
      `- Text: ${castData.text}`
  );

  const { baseAsset, name, symbol, feedback } = await queryGPTForParameters(
    castData.text
  );
  console.log(baseAsset, name, symbol, feedback);

  const bondParams = await getDefaultBondParamsForBaseAsset(
    baseAsset as `0x${string}`
  );
  // console.log(bondParams);

  const receipt = await createToken(
    {
      name,
      symbol,
    },
    bondParams
  );
  const txLink = `https://basescan.org/tx/${receipt.transactionHash}`;
  console.log(`-> CREATED: ${txLink}`);

  const replyText = `${feedback}\n\n🚀 Your meme coin created: https://mint.club/token/base/${symbol}\nTX: ${txLink}`;

  const { hash } = await publishCast(replyText, {
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
          "Suggest me a name and symbol.\n" +
          "Just reply with the <baseAsset contract address, name, symbol, your oneline feedback about the meme coin> with commad separated string. Nothing else.\n" +
          "Name must be 3-30 characters, symbol must be 1-10 all capital characters, feedback sentence must not contain comma and be less than 100 characters, casual and sounds like degen.",
      },
    ],
  });

  if (!completion.choices || completion.choices.length === 0) {
    throw new Error(`OpenAI API failed: ${JSON.stringify(completion)}`);
  }

  const [baseAsset, name, symbol, feedback] =
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

  if (!feedback || feedback.length > 100) {
    throw new Error("Invalid feedback");
  }

  return { baseAsset, name, symbol, feedback };
}

console.log(`Listening on localhost:${server.port}`);
