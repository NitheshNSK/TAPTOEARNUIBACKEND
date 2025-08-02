const Web3 = require("web3");
const abi = require("./DrishtiABI.json");
require("dotenv").config();
const web3 = new Web3(process.env.BSC_RPC_URL);
const drishti = new web3.eth.Contract(abi, process.env.DRISHTI_CONTRACT);

module.exports = { web3, drishti };
