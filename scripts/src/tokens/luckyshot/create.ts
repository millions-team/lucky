import { Connection } from '@solana/web3.js';

import {
  type Cluster,
  getAndFillBalance,
  loadOrCreateKeypair,
} from '../../utils';
import { NAME, SYMBOL, idPath, ID_NAME, TRADES_FOR_SALE } from './constants';

import { ForgeTrader } from './manufacturer';

export async function CreateTrader(connection: Connection, cluster: Cluster) {
  console.log(`Create ${NAME} token ($${SYMBOL}) on ${cluster.name} cluster`);
  const payer = loadOrCreateKeypair(idPath(ID_NAME.PAYER));

  console.log('------------------ Payer ------------------');
  console.log('Fetching payer balance...');
  await getAndFillBalance(payer.publicKey, connection, cluster);

  return ForgeTrader(connection, payer, TRADES_FOR_SALE);
}
