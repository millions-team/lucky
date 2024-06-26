import { Connection } from '@solana/web3.js';
import { Cluster, ClusterNetwork } from './connection';

export async function confirmTransaction(
  txHash: string,
  connection: Connection
) {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: txHash,
  });
}

export async function logTransaction(txHash: string, cluster: Cluster) {
  const suffix = getClusterUrlParam(cluster);
  console.log(
    `Solana Explorer: https://explorer.solana.com/tx/${txHash}${suffix}`
  );
}

export async function confirmAndLogTransaction(
  txHash: string,
  connection: Connection,
  cluster: Cluster
) {
  await confirmTransaction(txHash, connection);
  await logTransaction(txHash, cluster);
}

function getClusterUrlParam(cluster: Cluster): string {
  let suffix = '';

  switch (cluster.network) {
    case ClusterNetwork.Devnet:
      suffix = 'devnet';
      break;
    case ClusterNetwork.Mainnet:
      suffix = '';
      break;
    case ClusterNetwork.Testnet:
      suffix = 'testnet';
      break;
    default:
      suffix = `custom&customUrl=${encodeURIComponent(cluster.endpoint)}`;
      break;
  }

  return suffix.length ? `?cluster=${suffix}` : '';
}
