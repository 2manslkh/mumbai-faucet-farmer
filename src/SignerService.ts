import { ethers } from "ethers";

export function getProvider() {
  return new ethers.providers.JsonRpcProvider(
    "https://polygon-mumbai.g.alchemy.com/v2/LkHvAOid8HBwLcXwQ2HooiJ6TMP8YTOr"
  );
}

export function getRandomWallet() {
  return ethers.Wallet.createRandom();
}

export function getRandomConnectedWallet() {
  const wallet = getRandomWallet();
  const provider = getProvider();
  return wallet.connect(provider);
}

export function getSigners(count: number) {
  const signers = [];
  for (let i = 0; i < count; i++) {
    signers.push(getRandomConnectedWallet());
  }
  return signers;
}
