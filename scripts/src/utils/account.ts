import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { Cluster } from './connection';
import { confirmAndLogTransaction } from './transactions';

export async function getAndFillBalance(
  address: PublicKey,
  connection: Connection,
  cluster: Cluster
) {
  let balance = await connection.getBalance(address);
  console.log(`Balance of ${address}: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance < 0.01 * LAMPORTS_PER_SOL) {
    console.log('Account needs more SOL to pay for transactions');
    const tx = await connection.requestAirdrop(address, LAMPORTS_PER_SOL);
    console.log('Airdrop requested...');

    await confirmAndLogTransaction(tx, connection, cluster);
    console.log('Airdrop completed.');

    balance = await connection.getBalance(address);
    console.log(`Balance of ${address}: ${balance / LAMPORTS_PER_SOL} SOL`);
  }

  return balance;
}
