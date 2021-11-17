var stellarAssetIssuer = require("./src/stellar-asset-issuer.js")
var readline = require('readline');

require("dotenv").config();

var asset = stellarAssetIssuer.createAsset(process.env.ACCOUNT_ISSUER_PRIVATE)

stellarAssetIssuer.trustIssuer(process.env.ACCOUNT_RECEIVER_PRIVATE, asset)

stellarAssetIssuer.sendAsset(process.env.ACCOUNT_ISSUER_PRIVATE, process.env.ACCOUNT_RECEIVER_PRIVATE, asset, "10000")
