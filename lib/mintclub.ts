import {
  erc20Abi,
  parseUnits,
  createPublicClient,
  http,
  formatEther,
} from "viem";
import { base } from "viem/chains";

const CHILD_TOKEN_MAX_SUPPLY = parseUnits(String(1_000_000_000), 18);
export const BASE_TOKEN_LIST = [
  { symbol: "mfer", address: "0xE3086852A4B125803C815a158249ae468A3254Ca" },
  { symbol: "degen", address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" },
  { symbol: "tn100x", address: "0x5B5dee44552546ECEA05EDeA01DCD7Be7aa6144A" },
  { symbol: "brett", address: "0x532f27101965dd16442E59d40670FaF5eBB142E4" },
  { symbol: "chad", address: "0xecaF81Eb42cd30014EB44130b89Bcd6d4Ad98B92" },
  { symbol: "nouns", address: "0x0a93a7BE7e7e426fC046e204C44d6b03A302b631" },
  { symbol: "toshi", address: "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4" },
  { symbol: "benji", address: "0xBC45647eA894030a4E9801Ec03479739FA2485F0" },
  { symbol: "miggles", address: "0xB1a03EdA10342529bBF8EB700a06C60441fEf25d" },
  { symbol: "tybg", address: "0x0d97F261b1e88845184f678e2d1e7a98D9FD38dE" },
  { symbol: "keycat", address: "0x9a26F5433671751C3276a065f57e5a02D2817973" },
  { symbol: "moxie", address: "0x8C9037D1Ef5c6D1f6816278C7AAF5491d24CD527" },
];

function calculateInitialPrice(
  baseAssetTotalSupply: bigint,
  childTokenMaxSupply: bigint = CHILD_TOKEN_MAX_SUPPLY,
  steps: bigint = 500n,
  priceIncreaseRate: bigint = 1015n,
  targetLockedRatio: bigint = 100n
): bigint {
  const PRECISION = 10n ** 32n;

  // Calculate the total base asset value to be locked
  const totalLockedValue =
    (baseAssetTotalSupply * targetLockedRatio * PRECISION) / 10000n;

  // Calculate the sum of the geometric series
  let geometricSum = 0n;
  let term = PRECISION;
  for (let i = 0n; i < steps; i++) {
    geometricSum += term;
    term = (term * priceIncreaseRate) / 1000n;
  }

  // Calculate the tokens per step
  const tokensPerStep = childTokenMaxSupply / steps;

  // Calculate the initial price with higher precision
  const initialPrice =
    (totalLockedValue * PRECISION) / (tokensPerStep * geometricSum);

  return initialPrice / (PRECISION / 10n ** 18n); // Convert back to 18 decimal places
}

export const getDefaultBondParamsForBaseAsset = async function (
  baseAsset: `0x${string}`
) {
  // Get total supply of base asset
  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const totalSupply = await publicClient.readContract({
    address: baseAsset,
    abi: erc20Abi,
    functionName: "totalSupply",
  });

  console.log(`Base Token (${baseAsset}) TS: ${formatEther(totalSupply)}`);

  const initialPrice = calculateInitialPrice(totalSupply);
  console.log(`- Initial price suggested: ${formatEther(initialPrice)}`);

  const stepPrices = Array.from({ length: 500 }, (_, i) => {
    const PRECISION = 10n ** 18n;
    const priceIncreaseRate = (1015n * PRECISION) / 1000n; // 1.015 with 18 decimal places
    // Use the geometric progression formula: a * r^n
    return (
      (initialPrice * priceIncreaseRate ** BigInt(i)) / PRECISION ** BigInt(i)
    );
  });
  console.log(`- Final price: ${formatEther(stepPrices[499])}`);

  return {
    maxSupply: CHILD_TOKEN_MAX_SUPPLY,
    mintRoyalty: 30,
    burnRoyalty: 30,
    stepPrices,
  };
};

// const result = await getDefaultBondParamsForBaseAsset(
//   "0xE3086852A4B125803C815a158249ae468A3254Ca" // $mfer
// );
// console.log(result);
