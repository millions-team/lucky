import { Keypair, PublicKey } from '@solana/web3.js';

export type LuckyBag = { name: string; kp: Keypair };
export type EncryptedBag = string; // base64 encoded encrypted bag.
export type BagKey = string; // PublicKey.toString()
export type LuckyBags = Record<BagKey, EncryptedBag>;

export interface LuckyBagProviderContext {
  bags: LuckyBags;
  bag: LuckyBag | null;
  openBag: (luckyKey?: PublicKey | string) => LuckyBag | null;
  getBag: (luckyKey: PublicKey | string) => LuckyBag;
  addBag: (bag: LuckyBag) => LuckyBag;
  deleteBag: (luckyKey: PublicKey | string) => boolean;
}
