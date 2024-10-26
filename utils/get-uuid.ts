import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import readline from "readline";

export const neynarClient = new NeynarAPIClient(
  process.env.NEYNAR_API_KEY as string
);

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function init() {
  // Get FARCASTER_MNEMONIC
  const mnemonic = await askQuestion("Enter your Farcaster mnemonic: ");

  const oneYearInSeconds = 365 * 24 * 60 * 60;
  console.log(`One year has ${oneYearInSeconds} seconds.`);
  const resp = await neynarClient.createSignerAndRegisterSignedKey(mnemonic, {
    deadline: Math.floor(Date.now() / 1000) + oneYearInSeconds * 5,
  });
  console.log(resp);
}

async function status() {
  const resp = await neynarClient.lookupSigner("SIGNER KEY");
  console.log(resp);
}

// await status();
// only need to run this once, to create a signer and register the signed key
// after you confirm the url given in the console
// save the signer uuid and public key in .env
// no need to do it again until you want to create a new signer

await init();
