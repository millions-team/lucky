import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { Keypair } from '@solana/web3.js';

function resolvePath(filepath: string) {
  if (filepath[0] === '~') {
    return join(process.env.HOME, filepath.slice(1));
  }
  return filepath;
}

export function loadKeypairFileSync(filePath: string): Keypair {
  const keypair = JSON.parse(readFileSync(resolvePath(filePath), 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(keypair));
}

export function saveKeypairFileSync(filePath: string, keypair: Keypair) {
  const path = resolvePath(filePath);
  const dirPath = dirname(path);
  mkdirSync(dirPath, { recursive: true });

  const secretKey = Array.from(keypair.secretKey);
  const keypairJson = JSON.stringify(secretKey);
  writeFileSync(path, keypairJson);
}

export function loadOrCreateKeypair(filePath: string): Keypair {
  const path = resolvePath(filePath);

  try {
    return loadKeypairFileSync(path);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;

    const keypair = Keypair.generate();
    saveKeypairFileSync(path, keypair);
    return keypair;
  }
}
