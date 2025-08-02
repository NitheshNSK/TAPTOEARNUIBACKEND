const { web3, drishti } = require("./web3Client");
require("dotenv").config();
async function sendTokenToUser(to, amount) {
  try {
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    const from = process.env.ADMIN_WALLET;
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    const decimals = await drishti.methods.decimals().call();
    const rawAmount = amount * Math.pow(10, decimals);
    const amountInUnits = web3.utils.toBN(rawAmount.toFixed(0));


    const tx = drishti.methods.transfer(to, amountInUnits);
    const gas = await tx.estimateGas({ from });
    const gasPrice = await web3.eth.getGasPrice();

    const txData = {
      from,
      to: process.env.DRISHTI_CONTRACT,
      data: tx.encodeABI(),
      gas,
      gasPrice,
    };

    const receipt = await web3.eth.sendTransaction(txData);
    return receipt;
  } catch (err) {
    console.error("Web3 transfer failed:", err);
    throw err;
  }
}

module.exports = { sendTokenToUser };
