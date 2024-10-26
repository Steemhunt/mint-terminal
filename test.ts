import { parseUnits } from "viem";

function calculateInitialPriceNumber(
  baseAssetTotalSupply: number, // Total supply of the base asset
  childTokenMaxSupply: number = 1_000_000_000, // Max supply of the child token
  steps: number = 500, // Number of steps in the curve
  priceIncreaseRate: number = 1.015, // Price increase per step (1.5%)
  targetLockedRatio: number = 0.01 // Target locked ratio of base asset supply (1.0%)
): number {
  // Calculate the total base asset value to be locked
  const totalLockedValue = baseAssetTotalSupply * targetLockedRatio;

  // Calculate the sum of the geometric series
  const geometricSum =
    (1 - Math.pow(priceIncreaseRate, steps)) / (1 - priceIncreaseRate);

  // Calculate the tokens per step
  const tokensPerStep = childTokenMaxSupply / steps;

  // Calculate the initial price
  const initialPrice = totalLockedValue / (tokensPerStep * geometricSum);

  return initialPrice;
}

function calculateInitialPriceBigInt(
  baseAssetTotalSupply: bigint,
  childTokenMaxSupply: bigint = parseUnits(String(1_000_000_000), 18),
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

// Example usage:
const baseAssetTotalSupply = 2_000_000_000;
const initialPrice = calculateInitialPriceNumber(baseAssetTotalSupply);
console.log(`The proper initial price is: ${initialPrice}`);

const initialPriceBigInt = calculateInitialPriceBigInt(
  parseUnits(String(baseAssetTotalSupply), 18)
);
console.log(`The proper initial price is: ${initialPriceBigInt}`);
