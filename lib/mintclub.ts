import { BOND_ABI } from "../abi/bond.abi";
import {
  createPublicClient,
  http,
  createWalletClient,
  WriteContractParameters,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
type CreateTokenParams = WriteContractParameters<
  typeof BOND_ABI,
  "createToken"
>["args"];

// Base contract address
const CONTRACT_ADDRESSES = "0xc5a076cad94176c2996B32d8466Be1cE757FAa27";

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});
const account = privateKeyToAccount(
  process.env.MINTING_WALLET_P_KEY as `0x${string}`
);
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

async function creationFee() {
  const data = await publicClient.readContract({
    address: CONTRACT_ADDRESSES,
    abi: BOND_ABI,
    functionName: "creationFee",
  });

  return data;
}

export async function createToken(
  tokenParams: CreateTokenParams[0],
  bondParams: CreateTokenParams[1]
) {
  const fee = await creationFee();

  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDRESSES,
    abi: BOND_ABI,
    functionName: "createToken",
    args: [tokenParams, bondParams],
    value: fee,
  });

  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return receipt;
}
