import { Connection } from '@solana/web3.js';

import { Cluster, getAndFillBalance, loadOrCreateKeypair } from '../../utils';
import { NAME, SYMBOL, idPath, ID_NAME, TRADES_FOR_SALE } from './constants';

import { ForgeTrader } from './manufacturer';
import { InitStronghold } from '../stronghold';

export async function CreateAndStoreTrades(
  connection: Connection,
  cluster: Cluster
) {
  console.log(`Create ${NAME} token ($${SYMBOL}) on ${cluster.name} cluster`);
  const payer = loadOrCreateKeypair(idPath(ID_NAME.PAYER));

  console.log('------------------ Payer ------------------');
  console.log('Fetching payer balance...');
  await getAndFillBalance(payer.publicKey, connection, cluster);

  const { trader, store } = await ForgeTrader(
    connection,
    payer,
    TRADES_FOR_SALE
  );

  await InitStronghold(
    connection,
    payer,
    { gem: trader, name: NAME, symbol: SYMBOL },
    cluster
  );

  return { trader, store };
}
