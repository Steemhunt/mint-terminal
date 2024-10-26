import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import {
  Embed,
  PostCastResponseCast,
} from "@neynar/nodejs-sdk/build/neynar-api/v2/openapi-farcaster";
import * as dotenv from "dotenv";
dotenv.config();

const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);

export async function publishCast(
  text: string,
  options?: {
    embeds?: Embed[];
    replyTo?: string;
    channelId?: string;
    idem?: string;
    parent_author_fid?: number;
  }
): Promise<PostCastResponseCast> {
  return await neynarClient.publishCast(
    process.env.SIGNER_UUID as string,
    text,
    options
  );
}
