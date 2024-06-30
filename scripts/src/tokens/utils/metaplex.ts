import { Connection, Keypair } from '@solana/web3.js';
import { keypairIdentity, Metaplex } from '@metaplex-foundation/js';

let manufacturer: Metaplex;

export function getManufacturer(market: Connection, payer: Keypair) {
  if (manufacturer) return manufacturer;

  manufacturer = new Metaplex(market).use(keypairIdentity(payer));
  console.log(`Manufacturer activated...`);
  return manufacturer;
}
