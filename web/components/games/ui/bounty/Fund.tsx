import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

import { useBountyAccount } from '@/hooks';

export function FundBounty({ pda }: { pda: PublicKey }) {
  const { bountyQuery, emptyVault, vaultQuery, fund } = useBountyAccount({
    pda,
  });
  if (!emptyVault) return null;

  return (
    <button
      className="btn btn-xs btn-primary mx-2"
      onClick={() => {
        if (!bountyQuery.data) return;
        const available = vaultQuery.data?.amount.toString() || '0';

        const amount = bountyQuery.data.reward
          .mul(new BN(10))
          .sub(new BN(available));

        fund.mutate(amount);
      }}
    >
      Fund
    </button>
  );
}
