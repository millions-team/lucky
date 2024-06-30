import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import { Program } from '@coral-xyz/anchor';

import { Games, getKeeperPDA, getStrongholdPDA } from '@luckyland/anchor';
import { getToken } from '@utils/token';
import { type Cluster, formatter, confirmAndLogTransaction } from '../../utils';

let market: Connection;
let formatAmount: (amount: bigint, raw?: boolean) => string;

async function getStronghold(pda: PublicKey) {
  try {
    return await getAccount(market, pda);
  } catch (e) {
    console.log(`Stronghold does not exist yet.`);
  }
}

export async function InitStronghold(
  gem: PublicKey,
  portal: Program<Games>,
  cluster: Cluster
) {
  console.log(`------------------ Stronghold ------------------`);
  console.log('Retrieving gem details...');

  market = portal.provider.connection;
  const token = await getToken(gem, market);
  const { name, symbol, decimals } = token;
  const pieces = BigInt(10 ** decimals);
  formatAmount = formatter(pieces, symbol);

  console.log(
    `Forge stronghold for ${name} ($${symbol}) gem on ${cluster.name} market`
  );

  const keeperPDA = getKeeperPDA(cluster.asCluster());
  const strongholdPDA = getStrongholdPDA(gem, cluster.asCluster());

  console.log('Keeper: ' + keeperPDA);
  console.log('Stronghold: ' + strongholdPDA);

  console.log(`------------------------------------------------`);
  let strongholdInfo = await getStronghold(strongholdPDA);
  if (strongholdInfo) {
    console.log(`Stronghold already exists.`);
    console.log(`Stronghold balance: ${formatAmount(strongholdInfo.amount)}`);
    return { pda: strongholdPDA, account: strongholdInfo, gem: token };
  }
  console.log(`Forging stronghold...`);

  const confirmOptions = { skipPreflight: true };

  const txHash = await portal.methods
    .forgeStronghold()
    .accounts({ gem })
    .rpc(confirmOptions);

  await confirmAndLogTransaction(txHash, market, cluster);
  console.log(`Stronghold forged.`);
  strongholdInfo = await getStronghold(strongholdPDA);
  console.log(`Stronghold balance: ${formatAmount(strongholdInfo.amount)}`);

  return { pda: strongholdPDA, account: strongholdInfo, gem: token };
}
