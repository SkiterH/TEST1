const {
  Keypair,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Horizon,
} = require("@stellar/stellar-sdk");

const SECRET_KEY = process.env.SECRET_KEY;
const DEST_KEY   = "GAVFAXLV54GY7M4WZYIZQGP5NFRAJOUQA2LA4UDDUWVJCOIEPEMKYNQG";

if (!SECRET_KEY) {
  console.error("Erro: defina a variável de ambiente SECRET_KEY.");
  console.error("  SECRET_KEY  — secret key da conta de origem");
  process.exit(1);
}

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

async function sendPayment() {
  const sourceKeypair = Keypair.fromSecret(SECRET_KEY);
  const sourcePublicKey = sourceKeypair.publicKey();

  console.log("Carregando conta:", sourcePublicKey);
  const sourceAccount = await server.loadAccount(sourcePublicKey);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: DEST_KEY,
        asset: Asset.native(),
        amount: "10",
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(sourceKeypair);

  console.log("Submetendo transação para o testnet...");
  const result = await server.submitTransaction(transaction);

  console.log("Transação enviada com sucesso!");
  console.log("Hash:", result.hash);
}

sendPayment().catch((err) => {
  const detail = err?.response?.data?.extras?.result_codes;
  console.error("Erro ao enviar transação:", detail ?? err.message ?? err);
  process.exit(1);
});
