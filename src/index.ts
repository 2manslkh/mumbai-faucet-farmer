import { Signer, ethers } from "ethers";
import { getRandomConnectedWallet, getSigners } from "./SignerService";

import axios from "axios";

// Address to funnel the funds to
const MAIN = "0x94874CE121FD9F70F3930082230b4d0f5EA34cFA";
let SKIP_PART_1 = false;
let SKIP_PART_2 = false;

function requestFund(address: string): Promise<any> {
  let url = `https://api.faucet.matic.network/transferTokens`;
  return axios.post(url, {
    network: "mumbai",
    address: address,
    token: "maticToken",
  });
}

function requestFunds(addresses: string[]): Promise<any>[] {
  return addresses.map((address) => requestFund(address));
}

function sendFund(receiver: string, signer: Signer): Promise<any> {
  return signer.sendTransaction({
    to: receiver,
    value: ethers.utils.parseEther("0.199"),
    // data: "Hello Sean",
  });
}

function sendMessage(receiver: string, signer: Signer): Promise<any> {
  return signer.sendTransaction({
    to: receiver,
    data: ethers.utils.toUtf8Bytes("Hello"),
  });
}

function sendFunds(
  receiver: string,
  signerAddresses: Signer[]
): Promise<any>[] {
  return signerAddresses.map((signer: Signer) => sendFund(receiver, signer));
}

function chunkArray(myArray: any, chunk_size: any) {
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    let myChunk = myArray.slice(index, index + chunk_size);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // await sleep(240000);

  let signers = getSigners(50);
  // console.log("🚀 | main | signers", signers);

  let signerAddresses = signers.map((signer) => signer.address);
  console.log(signerAddresses);

  // await sendMessage(MAIN, signers[0]);

  while (true) {
    if (!SKIP_PART_1) {
      // Create faucet requests
      console.log(
        `Sending Funding Requests for ${signerAddresses.length} accounts...`
      );
      let txs = await Promise.allSettled(requestFunds(signerAddresses));

      console.log("Reqeusts Sent!");
      console.log(
        "Fulfilled: ",
        txs.map((tx) => tx.status).filter((x) => x == "fulfilled").length
      );
      console.log(
        "Rejected: ",
        txs.map((tx) => tx.status).filter((x) => x == "rejected").length
      );

      // Wait 4 minutes
      await sleep(240000);
    } else {
      console.log("Funding Request SKIPPED");
      SKIP_PART_1 = false;
    }

    if (!SKIP_PART_2) {
      // Send all funds to main
      console.log("Sending Funds to Main Account...", MAIN);

      let signerChunks = chunkArray(signers, 3);
      let chunksRemaining = signerChunks.length;

      for (let signerChunk of signerChunks) {
        console.log("Chunks Remaining: ", chunksRemaining);
        let txs_2 = await Promise.allSettled(sendFunds(MAIN, signerChunk));

        console.log("Reqeusts Sent!");
        console.log(
          "Fulfilled: ",
          txs_2.map((tx) => tx.status).filter((x) => x == "fulfilled").length
        );
        console.log(
          "Rejected: ",
          txs_2.map((tx) => tx.status).filter((x) => x == "rejected").length
        );
        await sleep(3000);
        chunksRemaining--;
      }
    } else {
      SKIP_PART_2 = false;
    }

    // Loop;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
