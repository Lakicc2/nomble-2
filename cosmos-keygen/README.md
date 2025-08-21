# Cosmos Keygen Script (CommonJS)

This is a command-line tool to generate a Cosmos wallet and sign a message using a BIP39 mnemonic.  
It is designed for securely **binding your Cosmos wallet to your Solana address**.

---

## 🚀 How to Use

### 1. Install Node.js

Download from: https://nodejs.org

---

### 2. Install dependencies

In the folder with `cosmos-keygen.js`, run:

```bash
npm install @noble/hashes @noble/curves @scure/bip32 @scure/bip39 @coral-xyz/anchor @cosmjs/proto-signing @cosmjs/crypto
```

### 3. Run the script

```
node cosmos-keygen.js --mnemonic "your twelve or twenty-four word phrase" --solana "Solana wallet"
```

Run with `--help` to see full options.
