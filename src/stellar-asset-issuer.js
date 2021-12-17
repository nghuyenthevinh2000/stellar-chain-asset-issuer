var StellarSdk = require("stellar-sdk");
var server = new StellarSdk.Server("https://horizon-testnet.stellar.org")
var networkPassphrase = StellarSdk.Networks.TESTNET;
/**
 * create custom Asset
 * @param {String} issuerSecretKey key to issue
 * @param {String} asset_code
 * @returns {StellarSdk.Asset} custom asset
 */
module.exports.createAsset = function(issuerSecretKey, asset_code){
    var issuingKeys = StellarSdk.Keypair.fromSecret(
      issuerSecretKey
    );

    // Create an object to represent the new asset
    return new StellarSdk.Asset(asset_code, issuingKeys.publicKey());
}

/**
 * check if an account has trust line for a specific asset
 * @param {String} accountPublicKey 
 * @param {String} asset 
 * @param {String} assetIssuer asset issuer public address
 */
module.exports.hasTrustLine = async function(secretKey, asset, assetIssuer){
  let has_trust_line = false;
  var accountKey = StellarSdk.Keypair.fromSecret(
    secretKey
  );

  var issuerKey = StellarSdk.Keypair.fromSecret(
    assetIssuer
  );

  await server
      .loadAccount(accountKey.publicKey())
      .then(function (caller) {
          caller.balances.forEach((element) => {
              if(element.asset_type === StellarSdk.Asset.native().getAssetType()) return;
              
              if(element.asset_code === asset && element.asset_issuer === issuerKey.publicKey()){
                  has_trust_line = true;
                  return;
              }
          });
      });
  
  return has_trust_line;
}

/**
 * let receiver trust Issuer account
 * @param {String} secretKey key to receive
 * @param {StellarSdk.Asset} asset custom defined asset
 */
module.exports.trustIssuer = async function(secretKey, asset){
    // First, the receiving account must trust the asset
    var receivingKeys = StellarSdk.Keypair.fromSecret(
      secretKey
    );

    console.log(receivingKeys.publicKey())

    await server
    .loadAccount(receivingKeys.publicKey())
    .then(function (receiver) {
      console.log("hello")
        var transaction = new StellarSdk.TransactionBuilder(receiver, {
        fee: 100,
        networkPassphrase: networkPassphrase,
        })
        // The `changeTrust` operation creates (or alters) a trustline
        // The `limit` parameter below is optional
        .addOperation(
            StellarSdk.Operation.changeTrust({
              asset: asset
            }),
        )
        // setTimeout is required for a transaction
        .setTimeout(100)
        .build();
        transaction.sign(receivingKeys);
        return server.submitTransaction(transaction);
    })
    .then(console.log)
}

module.exports.setClawBack = async function (accountPrivateKey) {
    
    let accountKeys = StellarSdk.Keypair.fromSecret(accountPrivateKey);

    await server
        .loadAccount(accountKeys.publicKey())
        //set up claw back
        .then(function(issuer){
            var transaction = new StellarSdk.TransactionBuilder(issuer, {
                fee: 100,
                networkPassphrase : networkPassphrase
            })
            .addOperation(
                Operation.setOptions({
                    setFlags: StellarSdk.AuthClawbackEnabledFlag | StellarSdk.AuthRevocableFlag
                })
            )
            .setTimeout(100)
            .build();

            transaction.sign(accountKeys);
            return server.submitTransaction(transaction);
        })
        //handling error
        .catch(function(error){
            console.error("Error!", error);
        })
}

/**
 * send Asset from issuer to receiver
 * @param {String} issuerSecretKey key to issue
 * @param {String} receiverSecretKey key to receive
 * @param {StellarSdk.Asset} asset custom defined asset
 * @param {String} amount amount to be sent
 */
module.exports.sendAsset = async function(issuerSecretKey, receiverSecretKey, asset, amount){
    // Second, the issuing account actually sends a payment using the asset

    // Keys for accounts to issue and receive the new asset
    var issuingKeys = StellarSdk.Keypair.fromSecret(
      issuerSecretKey
    );

    var receivingKeys = StellarSdk.Keypair.fromSecret(
      receiverSecretKey
    );

    await server
      .loadAccount(issuingKeys.publicKey())
      .then(function (issuer) {
        var transaction = new StellarSdk.TransactionBuilder(issuer, {
          fee: 100,
          networkPassphrase: StellarSdk.Networks.TESTNET,
        })
          .addOperation(
            StellarSdk.Operation.payment({
              destination: receivingKeys.publicKey(),
              asset: asset,
              amount: amount,
            }),
          )
          // setTimeout is required for a transaction
          .setTimeout(100)
          .build();
        transaction.sign(issuingKeys);
        return server.submitTransaction(transaction);
      })
      .then(console.log)
      .catch(function (error) {
        console.error("Error!", error.response.data);

        // extract from extras.result_codes
        console.error(error.response.data.extras.result_codes);
      });
}
