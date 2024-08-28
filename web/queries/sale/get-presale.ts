import { queryOptions } from '@tanstack/react-query';
import { type Cluster, PublicKey } from '@solana/web3.js';

import { getSalePDA } from '@luckyland/anchor';
import type { SaleProgram } from '@/providers/types.d';

export function getPresaleOptions(
  sale: SaleProgram,
  cluster: Cluster,
  gem?: PublicKey | null
) {
  const pda = gem && getSalePDA(gem, cluster as Cluster);

  return queryOptions({
    queryKey: ['presale', { cluster, gem }],
    queryFn: async () => {
      if (!pda) throw new Error('Invalid PDA'); // This should never happen.

      const presale = await sale.account.sale.fetch(pda);
      return { presale, pda };
    },
    enabled: Boolean(pda),
  });
}
