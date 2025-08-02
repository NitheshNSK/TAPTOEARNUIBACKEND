const { web3, drishti } = require("./web3Client");
require("dotenv").config();
async function getAdminBalances() {
  const adminWallet = process.env.ADMIN_WALLET;

  // Token balance
  const tokenDecimals = await drishti.methods.decimals().call();
  const rawTokenBalance = await drishti.methods.balanceOf(adminWallet).call();
  const tokenBalance = Number(rawTokenBalance) / 10 ** tokenDecimals;

  // TBNB balance
  const rawTbnbBalance = await web3.eth.getBalance(adminWallet);
  const tbnbBalance = web3.utils.fromWei(rawTbnbBalance, "ether");

  return {
    tokenBalance,
    tbnbBalance,
  };
}

module.exports = { getAdminBalances };
