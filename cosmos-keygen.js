#!/usr/bin/env node

const { sha256 } = require("@noble/hashes/sha256");
const { secp256k1 } = require("@noble/curves/secp256k1");
const { HDKey } = require("@scure/bip32");
const { mnemonicToSeedSync } = require("@scure/bip39");
const { base64 } = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { stringToPath } = require("@cosmjs/crypto");

const process = require("process");

function showHelp() {
  console.log(`
Cosmos Key Generator CLI 🔑

Usage:
  node cosmos-keygen.js --mnemonic "<mnemonic>" --solana "<solana_address>" [--path "<HD path>"] [--prefix "<prefix>"]

Example:
  node cosmos-keygen.js \
    --mnemonic "involve cool habit wish ..." \
    --solana "6hKV..." \
    --path "m/44'/118'/0'/0/0" \
    --prefix nimble

Options:
  --mnemonic   (required) BIP39 mnemonic phrase
  --solana     (required) Solana address to bind
  --path       (optional) HD derivation path (default: m/44'/118'/0'/0/0)
  --prefix     (optional) Bech32 address prefix (default: nimble)

⚠️ Before running, install dependencies:
  npm install @noble/hashes @noble/curves @scure/bip32 @scure/bip39 @coral-xyz/anchor @cosmjs/proto-signing @cosmjs/crypto
`);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showHelp();
  process.exit(0);
}

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i].replace(/^--/, "");
    const value = process.argv[i + 1];
    args[key] = value;
  }
  return args;
}

function getPrivateKeyFromMnemonic(mnemonic, hdPath) {
  const seed = mnemonicToSeedSync(mnemonic);
  const masterKey = HDKey.fromMasterSeed(seed);
  const derivedKey = masterKey.derive(hdPath);
  if (!derivedKey.privateKey) throw new Error("Private key not found");
  return derivedKey.privateKey;
}

async function getAddress(mnemonic, prefix, hdPath) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix,
    hdPaths: [stringToPath(hdPath)],
  });
  const [account] = await wallet.getAccounts();
  return {
    address: account.address,
    pubkey: base64.encode(Buffer.from(account.pubkey)),
  };
}

function signMessage(privateKey, message) {
  const messageBytes = new TextEncoder().encode(message);
  const hashedMessage = sha256(messageBytes);
  const signature = secp256k1.sign(hashedMessage, privateKey);
  return base64.encode(Buffer.from(signature.toCompactRawBytes()));
}

(async () => {
  try {
    const args = parseArgs();
    const mnemonic = args.mnemonic;
    const solana = args.solana;
    const hdPath = args.path || "m/44'/118'/0'/0/0";
    const prefix = args.prefix || "nimble";

    if (!mnemonic || !solana) {
      console.log("❗ Error: --mnemonic and --solana are required arguments");
      showHelp();
      process.exit(1);
    }

    const message = `${solana}`;
    const privateKey = getPrivateKeyFromMnemonic(mnemonic, hdPath);
    const { address, pubkey } = await getAddress(mnemonic, prefix, hdPath);
    const signature = signMessage(privateKey, message);

    console.log("\n========== Cosmos Key Info ==========");
    console.log("Address:             ", address);
    console.log("Public Key (Base64):", pubkey);
    console.log("Signed Message:      ", message);
    console.log("Signature (Base64):  ", signature);
    console.log("=====================================\n");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();