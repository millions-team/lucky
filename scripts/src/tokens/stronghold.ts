import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import { BN, Program } from '@coral-xyz/anchor';

import { Cluster, confirmAndLogTransaction, createProvider } from '../utils';
import { formatAmount } from './luckyland';

import {
  type Games,
  getGamesProgram,
  getKeeperPDA,
  getStrongholdPDA,
} from '@luckyland/anchor';

let portal: Program<Games>;

function loadPortal(market: Connection, payer: Keypair) {
  if (portal) return portal;

  const provider = createProvider(market, payer);
  portal = getGamesProgram(provider);
  console.log(`Portal activated...`);
  return portal;
}

export async function InitStronghold(
  market: Connection,
  payer: Keypair,
  { gem, name, symbol }: { gem: PublicKey; name: string; symbol: string },
  cluster: Cluster
) {
  console.log(`------------------ Stronghold ------------------`);
  console.log(
    `Forge stronghold for ${name} ($${symbol}) gem on ${cluster.name} market`
  );

  const keeperPDA = getKeeperPDA(cluster.asCluster());
  const strongholdPDA = getStrongholdPDA(gem, cluster.asCluster());

  console.log('Keeper: ' + keeperPDA);
  console.log('Stronghold: ' + strongholdPDA);

  console.log(`------------------------------------------------`);
  let strongholdInfo = await getStronghold(market, strongholdPDA);
  if (strongholdInfo) {
    console.log(`Stronghold already exists.`);
    console.log(`Stronghold balance: ${formatAmount(strongholdInfo.amount)}`);
    return { pda: strongholdPDA, account: strongholdInfo };
  }
  console.log(`Forging stronghold...`);

  loadPortal(market, payer);
  const confirmOptions = { skipPreflight: true };

  const txHash = await portal.methods
    .forgeStronghold()
    .accounts({ gem })
    .rpc(confirmOptions);

  await confirmAndLogTransaction(txHash, market, cluster);
  console.log(`Stronghold forged.`);
  strongholdInfo = await getStronghold(market, strongholdPDA);
  console.log(`Stronghold balance: ${formatAmount(strongholdInfo.amount)}`);

  return { pda: strongholdPDA, account: strongholdInfo };
}

export async function StockpileGems(
  market: Connection,
  payer: Keypair,
  gem: PublicKey,
  reserve: PublicKey,
  amount: bigint,
  cluster: Cluster
) {
  console.log(`------------------ Stockpile ------------------`);
  if (amount <= 0) {
    console.log(`No gems to stockpile.`);
    return getGemBalances(market, gem, reserve, cluster);
  }

  console.log(`Stockpile ${formatAmount(amount)} gems into stronghold...`);

  loadPortal(market, payer);
  const confirmOptions = { skipPreflight: true };

  const txHash = await portal.methods
    .stockpileGems(new BN(amount.toString()))
    .accounts({ gem, reserve })
    .rpc(confirmOptions);

  await confirmAndLogTransaction(txHash, market, cluster);
  console.log(`Stockpile complete.`);

  console.log(`------------------------------------------------`);
  return getGemBalances(market, gem, reserve, cluster);
}

async function getGemBalances(
  market: Connection,
  gem: PublicKey,
  reserve: PublicKey,
  cluster: Cluster
) {
  const strongholdPDA = getStrongholdPDA(gem, cluster.asCluster());
  const reserveInfo = await getAccount(market, reserve);
  const strongholdInfo = await getStronghold(market, strongholdPDA);

  console.log(`Reserve balance: ${formatAmount(reserveInfo.amount)}`);
  console.log(`Stronghold balance: ${formatAmount(strongholdInfo.amount)}`);

  return { reserve: reserveInfo, stronghold: strongholdInfo };
}

async function getStronghold(market: Connection, strongholdPDA: PublicKey) {
  try {
    return await getAccount(market, strongholdPDA);
  } catch (e) {
    console.log(`Stronghold does not exist yet.`);
  }
}
