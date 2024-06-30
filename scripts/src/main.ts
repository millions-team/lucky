import { config } from 'dotenv';
config();

import { CLUSTERS, createConnection } from './utils';

import { LoadPortal } from './utils';
import { CreateGem, CreateTrader } from './tokens';
import { CreateTreasure, InitStronghold, StockpileGems } from './features';

const { CLUSTER } = process.env;
if (!CLUSTER) throw new Error('CLUSTER is required');

const cluster = CLUSTERS[CLUSTER as keyof typeof CLUSTERS];
if (!cluster) throw new Error(`Cluster ${CLUSTER} not found`);

console.log(`Cluster: ${cluster.name} | Endpoint: ${cluster.endpoint}`);
console.log(`------------------------------------------------`);

const connection = createConnection(cluster);

LoadPortal(connection, cluster)
  .then(async (portal) => {
    await CreateTreasure(portal, cluster);
    const { gem, reserve } = await CreateGem(connection, cluster);
    const { trader } = await CreateTrader(connection, cluster);
    const { gem: token } = await InitStronghold(gem, portal, cluster);
    await StockpileGems(
      token,
      reserve.address,
      reserve.amount,
      portal,
      cluster
    );
    await InitStronghold(trader, portal, cluster); // TODO: This is only for testing purposes. MUST be removed when store is ready.
  })
  .catch((e) => {
    console.error('Failed to run script.');
    console.error(e);
  });
