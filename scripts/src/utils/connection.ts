import { Connection, clusterApiUrl, Keypair } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';

export interface Cluster {
  name: string;
  endpoint: string;
  network?: ClusterNetwork;
  active?: boolean;
}

export enum ClusterNetwork {
  Mainnet = 'mainnet-beta',
  Testnet = 'testnet',
  Devnet = 'devnet',
  local = 'local',
}

export const CLUSTERS: Record<ClusterNetwork, Cluster> = {
  [ClusterNetwork.Devnet]: {
    name: ClusterNetwork.Devnet,
    endpoint: clusterApiUrl(ClusterNetwork.Devnet),
    network: ClusterNetwork.Devnet,
  },
  [ClusterNetwork.local]: {
    name: ClusterNetwork.local,
    endpoint: 'http://localhost:8899',
  },
  [ClusterNetwork.Testnet]: {
    name: ClusterNetwork.Testnet,
    endpoint: clusterApiUrl(ClusterNetwork.Testnet),
    network: ClusterNetwork.Testnet,
  },
  [ClusterNetwork.Mainnet]: {
    name: ClusterNetwork.Mainnet,
    endpoint: clusterApiUrl(ClusterNetwork.Mainnet),
    network: ClusterNetwork.Mainnet,
  },
};

export function createConnection(cluster: Cluster) {
  return new Connection(cluster.endpoint);
}

export function createProvider(connection: Connection, keypair: Keypair) {
  const wallet = new Wallet(keypair);
  return new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
}
