import { join } from 'node:path';
import { Connection, Keypair } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';

import {
  Games,
  getGamesProgram,
  Presale,
  getPresaleProgram,
} from '@luckyland/anchor';

import { loadOrCreateKeypair } from './keypair';
import { getAndFillBalance } from './account';
import { type Cluster, createProvider } from './connection';

const IDS_BASE_PATH = '~/.config/solana/luckyland';
let portal: Program<Games>;
let sale: Program<Presale>;
let authority: Keypair;

enum ID_NAME {
  AUTHORITY = 'payer-id.json',
}

export type Portal = {
  portal: Program<Games>;
  sale: Program<Presale>;
  authority: Keypair;
  cluster: Cluster;
};
export async function LoadPortal(
  market: Connection,
  cluster: Cluster
): Promise<Portal> {
  if (portal && sale) return { portal, sale, authority, cluster };

  console.log('------------------ Portal ------------------');
  console.log('Fetching authority balance...');
  authority = loadOrCreateKeypair(join(IDS_BASE_PATH, ID_NAME.AUTHORITY));
  await getAndFillBalance(authority.publicKey, market, cluster);

  const provider = createProvider(market, authority);
  portal = getGamesProgram(provider);
  sale = getPresaleProgram(provider);

  console.log(`Portal activated...`);
  return { portal, sale, authority, cluster };
}
