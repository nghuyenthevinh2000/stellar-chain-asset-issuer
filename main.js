var stellarAssetIssuer = require("./src/stellar-asset-issuer.js")
var readline = require('readline');

require("dotenv").config();

(async () => {
    try{
        var assets = process.env.ASSET_CODE.split(' ');

        for(const asset of assets){
            console.log(asset)

            var assetStellar = stellarAssetIssuer.createAsset(process.env.ACCOUNT_ISSUER_PRIVATE, asset);

            if(!(await stellarAssetIssuer.hasTrustLine(process.env.ACCOUNT_RECEIVER_PRIVATE, asset, process.env.ACCOUNT_ISSUER_PRIVATE))){
                await stellarAssetIssuer.trustIssuer(process.env.ACCOUNT_RECEIVER_PRIVATE, assetStellar)
            }

            await stellarAssetIssuer.sendAsset(process.env.ACCOUNT_ISSUER_PRIVATE, process.env.ACCOUNT_RECEIVER_PRIVATE, assetStellar, "10000")
        }
    }catch(err){
        console.log(err)
    }
})()

