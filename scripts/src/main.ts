import { config } from 'dotenv';
config();

import { CLUSTERS, createConnection } from './utils';
import { CreateAndStockpileGem } from './tokens';
import { CreateAndStoreTrades } from './tokens/luckyshot/create';

const { CLUSTER } = process.env;
if (!CLUSTER) throw new Error('CLUSTER is required');

const cluster = CLUSTERS[CLUSTER as keyof typeof CLUSTERS];
if (!cluster) throw new Error(`Cluster ${CLUSTER} not found`);

console.log(`Cluster: ${cluster.name} | Endpoint: ${cluster.endpoint}`);
console.log(`------------------------------------------------`);

const connection = createConnection(cluster);

CreateAndStockpileGem(connection, cluster)
  .then(() => {
    console.log('Gem created and stockpiled');
  })
  .catch((err) => {
    console.log('Error creating and stockpiling gem');
    console.error(err);
  });

CreateAndStoreTrades(connection, cluster)
  .then(() => {
    console.log('Trader created and store filled');
  })
  .catch((err) => {
    console.log('Error creating and storing trades');
    console.error(err);
  });
