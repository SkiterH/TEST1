const { Keypair } = require("@stellar/stellar-sdk");

const keypair = Keypair.random();

console.log("Stellar Keypair gerado com sucesso!");
console.log("Public Key: ", keypair.publicKey());
console.log("Secret Key: ", keypair.secret());
