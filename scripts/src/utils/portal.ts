import { join } from 'node:path';
import { Connection } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';

import { Games, getGamesProgram } from '@luckyland/anchor';

import { loadOrCreateKeypair } from './keypair';
import { getAndFillBalance } from './account';
import { type Cluster, createProvider } from './connection';

const IDS_BASE_PATH = '~/.config/solana/luckyland';
let portal: Program<Games>;

enum ID_NAME {
  AUTHORITY = 'payer-id.json',
}

export async function LoadPortal(market: Connection, cluster: Cluster) {
  if (portal) return portal;

  console.log('------------------ Portal ------------------');
  console.log('Fetching authority balance...');
  const payer = loadOrCreateKeypair(join(IDS_BASE_PATH, ID_NAME.AUTHORITY));
  await getAndFillBalance(payer.publicKey, market, cluster);

  const provider = createProvider(market, payer);
  portal = getGamesProgram(provider);

  console.log(`Portal activated...`);
  return portal;
}
