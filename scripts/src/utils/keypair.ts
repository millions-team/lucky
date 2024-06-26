import { readFileSync, writeFileSync } from 'node:fs';
import { Keypair } from '@solana/web3.js';

export function loadKeypairFileSync(filePath: string): Keypair {
  const keypair = JSON.parse(readFileSync(filePath, 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(keypair));
}

export function saveKeypairFileSync(filePath: string, keypair: Keypair) {
  const secretKey = Array.from(keypair.secretKey);
  const keypairJson = JSON.stringify(secretKey);
  writeFileSync(filePath, keypairJson);
}

export function loadOrCreateKeypair(filePath: string): Keypair {
  try {
    return loadKeypairFileSync(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;

    const keypair = Keypair.generate();
    saveKeypairFileSync(filePath, keypair);
    return keypair;
  }
}
