import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import { BN, Program } from '@coral-xyz/anchor';

import { Games, getStrongholdPDA } from '@luckyland/anchor';
import { Token } from '@utils/token';
import { type Cluster, formatter, confirmAndLogTransaction } from '../../utils';

let market: Connection;
let formatAmount: (amount: bigint, raw?: boolean) => string;

export async function StockpileGems(
  { symbol, mint: gem, decimals }: Token,
  reserve: PublicKey,
  amount: bigint,
  portal: Program<Games>,
  cluster: Cluster
) {
  console.log(`------------------ Stockpile ------------------`);
  market = portal.provider.connection;
  const pieces = BigInt(10 ** decimals);
  formatAmount = formatter(pieces, symbol);
  if (amount <= 0) {
    console.log(`No gems to stockpile.`);
    return getGemBalances(market, gem, reserve, cluster);
  }

  console.log(`Stockpile ${formatAmount(amount)} gems into stronghold...`);

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
  const strongholdInfo = await getAccount(market, strongholdPDA);

  console.log(`Reserve balance: ${formatAmount(reserveInfo.amount)}`);
  console.log(`Stronghold balance: ${formatAmount(strongholdInfo.amount)}`);

  return { reserve: reserveInfo, stronghold: strongholdInfo };
}
