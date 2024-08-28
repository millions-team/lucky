import { PublicKey } from '@solana/web3.js';

import { getPresaleProgram } from '@luckyland/anchor';
import type { Cluster } from '@/providers';

export type SaleProgram = ReturnType<typeof getPresaleProgram>;
export type SaleContext = {
  cluster: Cluster;

  saleId: PublicKey;
  sale: SaleProgram;
};

export type Sale = Awaited<ReturnType<SaleProgram['account']['sale']['fetch']>>;
