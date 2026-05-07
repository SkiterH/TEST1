const {
  Keypair,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Horizon,
} = require("@stellar/stellar-sdk");

const SECRET_KEY = process.env.SECRET_KEY;
const DEST_KEY   = process.env.DEST_KEY;

if (!SECRET_KEY || !DEST_KEY) {
  console.error("Erro: defina as variáveis de ambiente SECRET_KEY e DEST_KEY.");
  console.error("  SECRET_KEY  — secret key da conta de origem");
  console.error("  DEST_KEY    — public key da conta de destino");
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
