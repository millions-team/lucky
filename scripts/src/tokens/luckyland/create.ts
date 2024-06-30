import { Connection } from '@solana/web3.js';

import {
  type Cluster,
  getAndFillBalance,
  loadOrCreateKeypair,
} from '../../utils';
import { NAME, SYMBOL, idPath, ID_NAME, GEMS_TO_STOCKPILE } from './constants';

import { ForgeGems } from './manufacturer';

export async function CreateGem(connection: Connection, cluster: Cluster) {
  console.log(`Create ${NAME} gem ($${SYMBOL}) on ${cluster.name} cluster`);
  const payer = loadOrCreateKeypair(idPath(ID_NAME.PAYER));

  console.log('------------------ Payer ------------------');
  console.log('Fetching payer balance...');
  await getAndFillBalance(payer.publicKey, connection, cluster);

  return ForgeGems(connection, payer, GEMS_TO_STOCKPILE);
}
