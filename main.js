var stellarAssetIssuer = require("./src/stellar-asset-issuer.js")
var readline = require('readline');

require("dotenv").config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var kittyMeow = stellarAssetIssuer.createAsset(process.env.ACCOUNT_ISSUER_PRIVATE)

stellarAssetIssuer.trustIssuer(process.env.ACCOUNT_RECEIVER_PRIVATE, kittyMeow)

stellarAssetIssuer.sendAsset(process.env.ACCOUNT_ISSUER_PRIVATE, process.env.ACCOUNT_RECEIVER_PRIVATE, kittyMeow, "1000")