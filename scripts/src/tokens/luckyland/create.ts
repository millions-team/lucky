import { Connection } from '@solana/web3.js';

import { Cluster, getAndFillBalance, loadOrCreateKeypair } from '../../utils';
import { NAME, SYMBOL, idPath, ID_NAME, GEMS_TO_STOCKPILE } from './constants';

import { ForgeGems } from './manufacturer';
import { InitStronghold, StockpileGems } from '../stronghold';

export async function CreateAndStockpileGem(
  connection: Connection,
  cluster: Cluster
) {
  console.log(`Create ${NAME} gem ($${SYMBOL}) on ${cluster.name} cluster`);
  const payer = loadOrCreateKeypair(idPath(ID_NAME.PAYER));

  console.log('------------------ Payer ------------------');
  console.log('Fetching payer balance...');
  await getAndFillBalance(payer.publicKey, connection, cluster);

  const { gem, reserve } = await ForgeGems(
    connection,
    payer,
    GEMS_TO_STOCKPILE
  );

  await InitStronghold(
    connection,
    payer,
    { gem, name: NAME, symbol: SYMBOL },
    cluster
  );

  const stockpile = await StockpileGems(
    connection,
    payer,
    gem,
    reserve.address,
    reserve.amount,
    cluster
  );

  return { gem, ...stockpile };
}
