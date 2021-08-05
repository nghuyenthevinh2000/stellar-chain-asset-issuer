var StellarSdk = require("stellar-sdk");
var server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

/**
 * create custom Asset
 * @param {String} issuerSecretKey key to issue
 * @returns {StellarSdk.Asset} custom asset
 */
module.exports.createAsset = function(issuerSecretKey){
    var issuingKeys = StellarSdk.Keypair.fromSecret(
      issuerSecretKey
    );

    // Create an object to represent the new asset
    return new StellarSdk.Asset("kittyMeow", issuingKeys.publicKey());
}

/**
 * let receiver trust Issuer account
 * @param {String} secretKey key to receive
 * @param {StellarSdk.Asset} asset custom defined asset
 */
module.exports.trustIssuer = function(secretKey, asset){
    // First, the receiving account must trust the asset
    var receivingKeys = StellarSdk.Keypair.fromSecret(
      secretKey
    );

    server
    .loadAccount(receivingKeys.publicKey())
    .then(function (receiver) {
        var transaction = new StellarSdk.TransactionBuilder(receiver, {
        fee: 100,
        networkPassphrase: StellarSdk.Networks.TESTNET,
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

/**
 * send Asset from issuer to receiver
 * @param {String} issuerSecretKey key to issue
 * @param {String} receiverSecretKey key to receive
 * @param {StellarSdk.Asset} asset custom defined asset
 * @param {String} amount amount to be sent
 */
module.exports.sendAsset = function(issuerSecretKey, receiverSecretKey, asset, amount){
    // Second, the issuing account actually sends a payment using the asset

    // Keys for accounts to issue and receive the new asset
    var issuingKeys = StellarSdk.Keypair.fromSecret(
      issuerSecretKey
    );

    var receivingKeys = StellarSdk.Keypair.fromSecret(
      receiverSecretKey
    );

    server
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